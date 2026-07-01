---
sidebar_position: 1
---

# 🤠 Corral

**Herd your VMs into your tailnet.**

Corral gives you one command for VMs on your laptop and your Kubernetes cluster. Local QEMU/KVM and cluster KubeVirt share the same five verbs — `create`, `start`, `ssh`, `viewer`, `delete`. Every VM lands on your Tailscale tailnet automatically. One static Go binary, no daemons.

```bash
corral create web --kubevirt --container-disk quay.io/containerdisks/fedora:42
corral ssh web        # from this machine, your laptop, or your phone's terminal
```

## Why

- **Same five commands everywhere.** Identical whether local QEMU or cluster KubeVirt.
- **SSH that just works.** Public key injected at create time, auto-picks K8s tunnel or Tailscale port-forward.
- **VMs that join the tailnet themselves.** Drop a Tailscale auth key and every VM registers with MagicDNS.
- **Plugin marketplace.** Extensions ship as plugins — `corral plugin install bootc`, then build OS disks on-cluster.
- **Point-and-shoot TUI.** Bubble Tea interface: pick a VM, Start/Stop/SSH/VNC/Delete, toggle published ports.
- **Proxmox-style web UI.** Dark dashboard: datacenter→node→VM tree, live status, create wizard, live migration, in-browser VNC + serial consoles.
- **One static Go binary.** No daemons, no controllers, no client-side K8s SDK. Drives the tools you already trust.

## Quick Start

```bash
# Build Corral, create a VM, and SSH in
git clone https://github.com/tuna-os/corral.git
cd corral && go build -o corral .
./corral create devbox --qemu --container-disk quay.io/containerdisks/fedora:42
./corral ssh devbox
```

👉 Need a step-by-step walkthrough? See the **[Getting Started](getting-started.md)** guide.

---

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
