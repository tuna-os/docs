---
sidebar_position: 6
---

# Installation Guide

TunaOS images can be installed in several ways, depending on your needs and preferences.

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | x86_64, ARM64 | x86_64, ARM64 |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 20 GB | 50 GB+ |

### Architecture Support

- **x86_64**: Standard 64-bit Intel/AMD processors
- **x86_64_v2**: Optimized for older CPUs (pre-2013) - available for Albacore and Yellowfin
- **ARM64**: 64-bit ARM processors (Apple Silicon, Raspberry Pi 4+, etc.)

## Installation Methods

### Method 1: Download Pre-built ISOs

The easiest way to get started is downloading pre-built ISO images:

#### Albacore (AlmaLinux 10)
- [x86_64](https://download.tunaos.org/albacore-amd64.iso) | [x86_64_v2](https://download.tunaos.org/albacore-amd64-v2.iso) | [arm64](https://download.tunaos.org/albacore-arm64.iso)
- [DX x86_64](https://download.tunaos.org/albacore-dx-amd64.iso) | [DX x86_64_v2](https://download.tunaos.org/albacore-dx-amd64-v2.iso) | [DX arm64](https://download.tunaos.org/albacore-dx-arm64.iso)
- [GDX x86_64](https://download.tunaos.org/albacore-gdx-amd64.iso) | [GDX x86_64_v2](https://download.tunaos.org/albacore-gdx-amd64-v2.iso) | [GDX arm64](https://download.tunaos.org/albacore-gdx-arm64.iso)

#### Yellowfin (AlmaLinux Kitten 10)
- [x86_64](https://download.tunaos.org/yellowfin-amd64.iso) | [x86_64_v2](https://download.tunaos.org/yellowfin-amd64-v2.iso) | [arm64](https://download.tunaos.org/yellowfin-arm64.iso)
- [DX x86_64](https://download.tunaos.org/yellowfin-dx-amd64.iso) | [DX x86_64_v2](https://download.tunaos.org/yellowfin-dx-amd64-v2.iso) | [DX arm64](https://download.tunaos.org/yellowfin-dx-arm64.iso)
- [GDX x86_64](https://download.tunaos.org/yellowfin-gdx-amd64.iso) | [GDX x86_64_v2](https://download.tunaos.org/yellowfin-gdx-amd64-v2.iso) | [GDX arm64](https://download.tunaos.org/yellowfin-gdx-arm64.iso)

### Method 2: Build Your Own ISO

Use the TunaOS build script to create custom ISOs:

```bash
# Download the build script
curl https://raw.githubusercontent.com/Tuna-OS/tunaOS/refs/heads/main/build-iso.sh \
-o build-bootc.sh
chmod +x build-bootc.sh

# Build an ISO for your preferred variant
sudo ./build-bootc.sh iso ghcr.io/tuna-os/yellowfin:latest

# Or build a VM image
sudo ./build-bootc.sh qcow2 ghcr.io/tuna-os/yellowfin:latest
```

### Method 3: Container Runtime

For testing or container-based workflows:

```bash
# Pull your preferred variant
podman pull ghcr.io/tuna-os/albacore:latest
podman pull ghcr.io/tuna-os/yellowfin:latest
podman pull ghcr.io/tuna-os/bonito:latest
podman pull ghcr.io/tuna-os/skipjack:latest
```

## Post-Installation

After installation, TunaOS provides:

### Pre-installed Applications
- **GNOME 48.3**: Latest GNOME desktop environment
- **Homebrew**: Package manager for CLI tools and fonts
- **Flathub**: Full access to Flatpak applications

### Getting Started
1. Complete the initial setup wizard
2. Install additional software via Flathub (Software app)
3. Use Homebrew for command-line tools: `brew install <package>`
4. Check out the [Project Bluefin documentation](https://docs.projectbluefin.io) for general usage

### Variant-Specific Features

#### DX (Developer Experience)
- libvirt virtualization
- Docker containers
- VSCode IDE
- Development toolchains

#### GDX (Graphical Developer Experience)
- NVIDIA drivers and CUDA
- AI/ML development tools
- Graphics and video editing software

## Troubleshooting

### Boot Issues
- Ensure Secure Boot is disabled or properly configured
- Check system requirements are met
- Try the x86_64_v2 variant for older hardware

### Installation Problems
- Verify ISO integrity after download
- Use a different USB creation tool (Ventoy, Rufus, dd)
- Check available disk space

### Getting Help
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
- 💬 **Chat**: [Matrix #tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia)
- 🎮 **Discord**: [Universal Blue Community](https://discord.gg/WEu6BdFEtp)