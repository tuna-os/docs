---
sidebar_position: 2
title: "Getting Started"
---

# 🚀 Getting Started with Corral

This guide walks you through your first VM with Corral — from build to boot to SSH — using the local QEMU/KVM backend. No Kubernetes cluster required.

## Prerequisites

- A Linux machine with `go` 1.22+ installed
- [`qemu-system-x86_64`](https://www.qemu.org/) and `kvm` (`apt install qemu-system-x86 qemu-utils` or equivalent)
- A [Tailscale](https://tailscale.com) account (optional but recommended)
- `sudo` access for `/dev/kvm`

## Step 1: Build Corral

```bash
git clone https://github.com/tuna-os/corral.git
cd corral
go build -o corral .
```

Verify it works:

```bash
./corral --help
```

## Step 2: Create Your First VM

Corral can create VMs on your local machine (QEMU/KVM backend) or on a Kubernetes cluster (KubeVirt backend). Let's start locally:

```bash
# Create a Fedora 42 VM named "devbox"
./corral create devbox --qemu --container-disk quay.io/containerdisks/fedora:42
```

This will:
1. Pull the Fedora 42 container disk
2. Create a QEMU VM with 2 CPUs and 4 GB RAM
3. Inject your SSH public key (`~/.ssh/id_rsa.pub` or `~/.ssh/id_ed25519.pub`)
4. Start the VM automatically

### Customizing resources

```bash
./corral create devbox \
  --qemu \
  --cpus 4 \
  --memory 8 \
  --disk 40 \
  --container-disk quay.io/containerdisks/fedora:42
```

## Step 3: SSH Into the VM

```bash
# SSH using Corral's smart tunnel
./corral ssh devbox
```

Corral automatically picks the right connection path:
- **Local QEMU VMs:** connects via a Tailscale-bound port-forward
- **KubeVirt VMs:** tunnels through the Kubernetes API

If you haven't set up Tailscale yet, Corral falls back to a local port-forward:

```bash
# To see the SSH command and port used
./corral ssh devbox -v
```

## Step 4: Connect VMs to Your Tailnet

To make your VM appear as a real machine on your Tailscale tailnet, set an auth key:

```bash
# Set your Tailscale pre-auth key
export TS_AUTHKEY="tskey-auth-xxxxxxxx"

# Create a VM that joins the tailnet automatically
./corral create web \
  --qemu \
  --container-disk quay.io/containerdisks/fedora:42
```

The VM will show up in your Tailscale admin console with a MagicDNS name like `web-vm.tailnet-name.ts.net`. You can SSH from any device on your tailnet:

```bash
# From your phone or laptop
ssh fedora@web-vm.tailnet-name.ts.net
```

## Step 5: Use the TUI

Run Corral without any command to launch the Bubble Tea terminal UI:

```bash
./corral
```

The TUI shows all your VMs in a table with actions:
- **Start / Stop** — power management
- **SSH** — one-key SSH into any VM
- **VNC** — graphical console access
- **Delete** — remove a VM
- **Port publishing** — toggle which ports are reachable via the tailnet

Navigate with arrow keys and press `<Enter>` to select actions.

## Step 6: Launch the Web UI

Start the Proxmox-style web dashboard:

```bash
./corral web
```

Open `http://127.0.0.1:8006` in your browser. You'll see:
- **Datacenter view** — all nodes and VMs in a tree
- **Live status** — CPU/memory/disk usage per VM
- **VM wizard** — create new VMs from the browser
- **VNC console** — in-browser graphical access
- **Live migration** — move VMs between nodes

To expose the web UI on your tailnet:

```bash
./corral web --addr "$(tailscale ip -4):8006"
```

## Next Steps

- Try the **KubeVirt backend**: `./corral create web --kubevirt --container-disk ...`
- Install the **bootc plugin**: `./corral plugin install bootc` then `./corral bootc create dev --image ghcr.io/tuna-os/yellowfin:gnome`
- Browse the plugin marketplace: `./corral plugin search`
- Read the [full specification](https://github.com/tuna-os/corral/blob/main/SPEC.md)

## Troubleshooting

| Problem | Fix |
|---|---|
| `/dev/kvm: Permission denied` | Add your user to the `kvm` group: `sudo usermod -aG kvm $USER && logout & back in` |
| `qemu-system-x86_64: command not found` | Install QEMU: `brew install qemu` or `sudo dnf install @virtualization` |
| VM shows "no bootable device" | Ensure the `--container-disk` image is a valid bootable disk image |
| Tailscale: `TS_AUTHKEY` not set | Obtain an auth key from [Tailscale admin console](https://login.tailscale.com/admin/settings/authkeys) |
