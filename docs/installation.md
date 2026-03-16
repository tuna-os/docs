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

- **x86_64**: Standard 64-bit Intel/AMD processors (v3 microarchitecture)
- **x86_64_v2**: Optimized for older CPUs (pre-2013) - available for Albacore and Yellowfin
- **ARM64**: 64-bit ARM processors (Apple Silicon, Raspberry Pi 4+, etc.)

## Installation Methods

### Method 1: Download Pre-built ISOs

The easiest way to get started is downloading pre-built ISO images from the [homepage](/) or variant-specific pages:

- **[Albacore (Stable)](albacore#downloads)**
- **[Yellowfin (Daily Drive)](yellowfin#downloads)**
- **[Skipjack (Upstream)](skipjack#downloads)**
- **[Bonito (Experimental)](bonito#downloads)**

### Method 2: Build Your Own ISO

For customization or to build a fresh image, use the `Justfile` provided in the [TunaOS repository](https://github.com/tuna-os/tunaOS). This method uses `bootc-image-builder` under the hood.

```bash
# Clone the repository
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# List available build commands
just --list

# Build an Albacore ISO
just build-iso albacore

# Build a specific variant (dx, gdx, hwe)
just build-iso albacore-dx
```

### Method 3: Container Runtime

For testing or container-based workflows:

```bash
# Pull your preferred variant
podman pull ghcr.io/tuna-os/albacore:latest
podman pull ghcr.io/tuna-os/yellowfin:latest
podman pull ghcr.io/tuna-os/skipjack:latest
podman pull ghcr.io/tuna-os/bonito:latest
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

#### HWE (Hardware Enablement)
- Specialized kernel and drivers for recent hardware
- Optimized for modern laptops and workstations

## Troubleshooting

### Boot Issues
- Ensure Secure Boot is disabled or properly configured
- Check system requirements are met
- Try the `x86_64_v2` variant for older hardware

### Installation Problems
- Verify ISO integrity after download
- Use a different USB creation tool (Ventoy, Rufus, dd)
- Check available disk space

### Getting Help
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
- 💬 **Chat**: [Matrix #tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia)
- 🎮 **Discord**: [Universal Blue Community](https://discord.gg/WEu6BdFEtp)
