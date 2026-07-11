---
sidebar_position: 3
title: "Containers (CT)"
---

# Containers (CT) — distrobox on Kubernetes

Proxmox VE has two workload types: **VMs** (QEMU/KVM) and **Containers**
(LXC). Corral's CT is the Kubernetes-native take — there's no LXC here, no
shared-kernel container runtime distinct from what Kubernetes already runs.
A CT is a **pod**, deliberately treated as a *pet* (long-lived,
console-able, individually named) rather than the usual Kubernetes
*cattle* pod, because that's what "Container" means in the Proxmox
vocabulary Corral mirrors.

Design record: [ADR-0005](https://github.com/tuna-os/corral/blob/main/docs/adr/0005-containers-as-pet-pods.md).

## Two storage modes

### Unprivileged (default)

A PVC mounts at `/data` only. Fast, safe, matches Kubernetes Pod Security
"restricted" defaults out of the box. Anything outside `/data` — including
whatever you `apt install`ed — resets to the image's baked-in state on
every Stop/Start, same as any plain container.

```bash
corral ct create web1 --image docker.io/library/alpine:latest --cpu 1 --mem 256Mi
```

### Privileged — the actual distrobox experience

On first boot, the CT seeds its own volume with a full copy of the image's
root filesystem (`cp -a --one-file-system /. $VOLUME`), then `chroot`s into
it. From that point on, **the volume *is* the rootfs** — `apt`/`dnf`/`apk`
installs, dotfiles, anything under `/` survives Stop/Start, exactly like
re-entering a stopped distrobox container.

```bash
corral ct create devbox --image docker.io/library/debian:bookworm --privileged
corral ct console devbox
apt update && apt install -y neovim ripgrep
exit
corral ct stop devbox
corral ct start devbox
corral ct console devbox
which nvim   # still there
```

This needs `CAP_SYS_ADMIN`/`CAP_SYS_CHROOT` (`mount`, `chroot`) — hence
gated behind `--privileged`, the same tradeoff Proxmox's own
privileged/unprivileged LXC split makes. It also needs a **real OS image**
with `chroot` and coreutils' `cp -a` — debian, ubuntu, fedora. Not
alpine/busybox (no `chroot` by default, and busybox `cp` doesn't reliably
support `-a`'s semantics).

## Console

CTs have no framebuffer, so console access is `kubectl exec`, not a
VNC/serial bridge — reusing the same `/api/tty/{ns}/{name}` endpoint VMs
use (it auto-detects VM vs. CT by name). For a privileged CT, the exec
session re-`chroot`s into the persistent rootfs on entry, since a fresh
`kubectl exec` starts from the pod's un-chrooted image root — `chroot`
only changes the *calling process's* apparent root, not something a
sibling exec session inherits.

```bash
corral ct console devbox
```

## Networking

A plain Kubernetes `Service` selecting the CT pod's own labels directly —
simpler than the VM proxy Deployment, which exists specifically to work
around KubeVirt VMs not having a stable pod selector across restarts. A
CT's own pod *is* the selector target, so a normal Service just works.

## CLI reference

```bash
corral ct create <name> --image <img> [--cpu 1] [--mem 512Mi] [--disk 5Gi] [--privileged]
corral ct list
corral ct start|stop|delete|console <name>
```

Also available from the **web UI** (Create CT button, merged into the same
datacenter tree as VMs) and the **TUI** (listed alongside VMs, with a
smaller action set — Start/Stop/Console/Delete, no hypervisor-only actions
like migrate or snapshot).

## What's not here yet

- Snapshot (VolumeSnapshot of the data volume) and migrate (reschedule to
  a node that can mount the same volume) are later slices, not in the
  first implementation.
- No curated `ct-*` catalog images (with sshd/init baked in) — any OCI
  image works, but you're on your own for what's inside it. Building and
  publishing a curated catalog is a follow-up content task, not a gap in
  the mechanism itself.
