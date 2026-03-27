---
sidebar_position: 2
---

# Albacore (AlmaLinux)

**Based on:** [AlmaLinux 10.0](https://almalinux.org/blog/2025-05-27-welcoming-almalinux-10/)

Albacore is the flagship stable variant of TunaOS, providing a rock-solid enterprise-grade desktop experience built on the AlmaLinux foundation.

## Features

- 🖥️ **GNOME 48.3**: Modern desktop backported to Enterprise Linux.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- ✨ **Microarchitecture Support**: Optimized builds for `x86_64_v2` (older CPUs).
- 🚀 **HWE Variant**: Hardware Enablement kernel for the latest laptops and workstations.
- 🏢 **10-Year Lifecycle**: Benefit from the long-term support of AlmaLinux 10.

## Downloads

Pre-built ISOs are published every two weeks for GNOME flavors. Other flavors are available as container images only.

### GNOME (Standard)
The standard experience for most users.

**Image:** `ghcr.io/tuna-os/albacore:gnome`

**ISOs:** [albacore-gnome-latest.iso](https://download.tunaos.org/live-isos/albacore-gnome-latest.iso)

<a id="gnome-hwe"></a>
### GNOME (HWE — Hardware Enablement)
Features a newer kernel and drivers for recent hardware.

**Image:** `ghcr.io/tuna-os/albacore:gnome-hwe`

**ISOs:** [albacore-gnome-hwe-latest.iso](https://download.tunaos.org/live-isos/albacore-gnome-hwe-latest.iso)

<a id="kde"></a>
### KDE Plasma
**Image:** `ghcr.io/tuna-os/albacore:kde`

<a id="cosmic"></a>
### COSMIC
**Image:** `ghcr.io/tuna-os/albacore:cosmic`

<a id="niri"></a>
### Niri
**Image:** `ghcr.io/tuna-os/albacore:niri`

<a id="gnome50"></a>
### GNOME 50
**Image:** `ghcr.io/tuna-os/albacore:gnome50`

<a id="dx"></a>
### DX (Developer Experience)
**Image:** `ghcr.io/tuna-os/albacore:gnome-dx`

<a id="gdx"></a>
### GDX (Graphical Developer Experience)
**Image:** `ghcr.io/tuna-os/albacore:gnome-gdx`

## Installation

We recommend using the `Justfile` in the [TunaOS repository](https://github.com/tuna-os/tunaOS) for building your own images.

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/albacore:latest
```

### Building ISO with Just
```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Albacore ISO
just build-iso albacore
```

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
