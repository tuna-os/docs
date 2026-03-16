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

### Regular Edition
The standard experience for most users.

**Image:** `ghcr.io/tuna-os/albacore:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-amd64-v2.iso) 
- [arm64](https://download.tunaos.org/albacore-arm64.iso)

<a id="kde"></a>
### KDE Plasma
The powerful and customizable KDE Plasma desktop environment.

**Image:** `ghcr.io/tuna-os/albacore-kde:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-kde-amd64.iso)
- [arm64](https://download.tunaos.org/albacore-kde-arm64.iso)

<a id="cosmic"></a>
### COSMIC
The modern, Rust-based COSMIC desktop environment from System76.

**Image:** `ghcr.io/tuna-os/albacore-cosmic:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-cosmic-amd64.iso)

<a id="niri"></a>
### Niri
A scrollable tiling compositor for a unique and efficient workflow.

**Image:** `ghcr.io/tuna-os/albacore-niri:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-niri-amd64.iso)

<a id="gnome50"></a>
### GNOME 50
Experience the cutting-edge future of GNOME on a stable base.

**Image:** `ghcr.io/tuna-os/albacore-gnome50:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-gnome50-amd64.iso)

<a id="dx"></a>
### DX (Developer Experience)
Adds `libvirt`, `docker`, `vscode`, and common development toolchains.

**Image:** `ghcr.io/tuna-os/albacore-dx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-dx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-dx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/albacore-dx-arm64.iso)

<a id="gdx"></a>
### GDX (Graphical Developer Experience)
Adds NVIDIA drivers, CUDA, and AI/ML development tools.

**Image:** `ghcr.io/tuna-os/albacore-gdx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-gdx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-gdx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/albacore-gdx-arm64.iso)

<a id="hwe"></a>
### HWE (Hardware Enablement)
Features a newer kernel and drivers for very recent hardware that may not be fully supported by the standard EL kernel.

**Image:** `ghcr.io/tuna-os/albacore-hwe:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-hwe-amd64.iso)
- [arm64](https://download.tunaos.org/albacore-hwe-arm64.iso)

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
