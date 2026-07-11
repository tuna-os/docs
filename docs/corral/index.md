---
sidebar_position: 1
---

# 🤠 Corral

**Herd your VMs — and containers — into your tailnet.**

Corral gives you one command for VMs on your laptop and your Kubernetes cluster. Local QEMU/KVM and cluster KubeVirt share the same core verbs — `create`, `start`, `ssh`, `viewer`, `clone`, `delete`. Every VM lands on your Tailscale tailnet automatically. Proxmox-style Containers (CT) run alongside VMs as **distrobox-style pet pods** — a persistent, mutable root filesystem that survives Stop/Start, not just a stateless pod. One static Go binary, no daemons.

```bash
corral create web --kubevirt --container-disk quay.io/containerdisks/fedora:42
corral ssh web        # from this machine, your laptop, or your phone's terminal
```

## Why

- **Same commands everywhere.** Identical whether local QEMU or cluster KubeVirt.
- **Containers (CT) — distrobox on Kubernetes.** Proxmox-style pet pods alongside VMs. A privileged CT seeds a full root filesystem onto its own volume and `chroot`s into it — `apt`/`dnf`/`apk` installs and dotfiles survive Stop/Start, exactly like re-entering a real distrobox container.
- **SSH that just works.** Public key injected at create time, auto-picks K8s tunnel or Tailscale port-forward.
- **VMs that join the tailnet themselves.** Drop a Tailscale auth key and every VM registers with MagicDNS.
- **Plugin marketplace.** Extensions ship as plugins — `corral plugin install bootc`, then build OS disks on-cluster; `corral plugin install backup` schedules in-cluster S3/R2 backups via CronJobs; `corral plugin install windows` sets up UEFI/TPM/virtio for Windows guests.
- **Point-and-shoot TUI.** Bubble Tea interface listing VMs and Containers side by side — Start/Stop/SSH/Console/Clone/Delete, toggle published ports.
- **Proxmox-style web UI.** Dark dashboard: datacenter→node→VM/CT tree (Server View and Folder View), live status, create wizards, live migration, in-browser VNC + serial consoles, per-VM boot/options editor, ISO/template upload.
- **Cluster doctor.** One page for KubeVirt/CDI health, feature-gate status, StorageClass capabilities (snapshot/expand/perf), and GPU/PCI passthrough readiness — with safe one-click fixes.
- **One static Go binary.** No daemons, no controllers, no client-side K8s SDK. Drives the tools you already trust.

## See it in action

![Corral datacenter view with VMs and a Container](/img/screenshots/corral-dashboard.png)

Live in-browser VNC console on a real bootc desktop VM:

![Live VNC console](/img/screenshots/corral-vnc.png)

A privileged Container (CT) — distrobox-style persistent rootfs:

![Container detail view](/img/screenshots/corral-ct-detail.png)

## Install

```bash
git clone https://github.com/tuna-os/corral.git
cd corral
go build -o corral .
```

## Start the web UI

```bash
./corral web
```

By default it binds to `127.0.0.1:8006` (Proxmox's port). To reach it from other tailnet devices:

```bash
corral web --addr "$(tailscale ip -4):8006"
```

## Containers (CT) — distrobox on Kubernetes

Proxmox has two workload types — VMs and LXC Containers. Corral's CT is the
Kubernetes-native take: a pod, not a hypervisor guest, but presented and
managed like a Proxmox Container, with an opt-in mode that gives it a real
distrobox-style persistent, mutable root filesystem.

**Full guide: [Containers (CT) →](/docs/corral/containers)**

```bash
corral ct create devbox --image docker.io/library/debian:bookworm --privileged
corral ct console devbox   # or open the Terminal tab in the web UI / TUI
```

## Plugins

Extensions ship as separate binaries, installed on demand — the core stays
lean. Each has its own setup guide:

- **[VDI](/docs/corral/vdi)** — desktop pools: clone a golden VM, assign members to users, connect
- **[Backup](/docs/corral/backup)** — on-demand and scheduled (in-cluster) S3/R2 disk backups
- **[Bootc](/docs/corral/bootc)** — build a bootable-container OS disk on the cluster and boot it as a VM
- **[Windows](/docs/corral/windows)** — UEFI/TPM/virtio-tuned Windows VMs
- **[GPU](/docs/corral/gpu)** — discover and attach GPU/PCI passthrough devices
- **[Snapsched](/docs/corral/snapsched)** — scheduled VM snapshots with retention
- **[Schedule](/docs/corral/schedule)** — VM autostart/shutdown windows
- **[Proxmox API](/docs/corral/proxmox)** — serve a Proxmox VE-compatible `/api2/json` layer over KubeVirt

## KubeVirt feature support

Corral exposes Proxmox-style operations through CLI, TUI, and web UI:

- **Change CPU/RAM** — always works (live hotplug on migratable VMs, stop→patch→start otherwise)
- **Live migration** — needs `vmRolloutStrategy: LiveUpdate`, RWX storage, same CPU vendor
- **Add disk (hotplug)** — needs `HotplugVolumes` feature gate
- **Online disk expansion** — needs `allowVolumeExpansion: true` on StorageClass
- **Snapshots/clone/restore** — needs `VolumeSnapshotClass` for persistent disks

Full design document: [SPEC.md](https://github.com/tuna-os/corral/blob/main/SPEC.md)

## Docs

- [SPEC.md](https://github.com/tuna-os/corral/blob/main/SPEC.md) — full specification
- [WEBUI-PLAN.md](https://github.com/tuna-os/corral/blob/main/WEBUI-PLAN.md) — web UI architecture
- [docs/api.md](https://github.com/tuna-os/corral/blob/main/docs/api.md) — REST API reference
- [docs/architecture.md](https://github.com/tuna-os/corral/blob/main/docs/architecture.md) — design decisions
- [docs/kubevirt-proxmox-setup.md](https://github.com/tuna-os/corral/blob/main/docs/kubevirt-proxmox-setup.md) — KubeVirt + Longhorn setup guide
- [docs/testing.md](https://github.com/tuna-os/corral/blob/main/docs/testing.md) — testing strategy

## Requirements

- Local backend: `qemu-system-x86_64` + KVM, systemd user session
- Cluster backend: `kubectl` context with KubeVirt (+ CDI for ISO import), `virtctl`; Tailscale operator for published ports
- `tailscale` on the host

## License

GPL-3.0-or-later.
