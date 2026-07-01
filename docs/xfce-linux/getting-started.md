---
sidebar_position: 4
title: "Getting Started"
---

# 🚀 Getting Started with XFCE Linux

XFCE Linux is a **lightweight, immutable XFCE desktop** OS image built from source with BuildStream. It layers the XFCE desktop on top of freedesktop-sdk and publishes a bootable OCI/bootc image.

## Available Images

```bash
# Pull the image
podman pull ghcr.io/tuna-os/xfce-linux:latest

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/xfce-linux:latest
sudo systemctl reboot
```

## Quick Start

### Prerequisites
- BuildStream 2.7.0+
- Podman or Docker
- QEMU + KVM for testing
- 200GB+ free disk space
- 8GB+ RAM recommended (lighter than GNOME/KDE)

### Build from Source

```bash
git clone https://github.com/tuna-os/xfce-linux.git
cd xfce-linux

# Build OCI image
just build
just export
just boot-vm  # Test in QEMU
```

### Install via bootc (from pre-built image)

```bash
sudo bootc switch ghcr.io/tuna-os/xfce-linux:latest
sudo systemctl reboot
```

## First Look

XFCE Linux provides a classic, lightweight desktop experience:

- **XFCE 4.20** — latest stable with Wayland support (`xfwl4`)
- **55 XFCE applications** — including Thunar (file manager), Ristretto (image viewer), Parole (media player)
- **31 panel plugins** — extensive panel customization
- **Low resource usage** — runs well on 4GB RAM systems

### Key XFCE Features

| Feature | How to Access |
|---|---|
| Application Menu | `Alt+F1` or click Whisker menu |
| Window Manager | `Alt+F7` (move), `Alt+F8` (resize) |
| Workspaces | `Ctrl+Alt+Left/Right` to switch |
| Panel Customization | Right-click panel → Panel Preferences |
| Settings Manager | Applications → Settings |

## Customization

```bash
# Open Settings Manager
xfce4-settings-manager

# Configure panel
xfce4-panel --preferences

# Install XFCE themes
brew install xfce-themes
```

## Lightweight Advantage

XFCE Linux is the lightest TunaOS variant:

| Variant | RAM at idle | Disk usage |
|---|---|---|
| GNOME | ~1.2 GB | ~4 GB |
| KDE Plasma | ~1.0 GB | ~3.5 GB |
| **XFCE** | **~600 MB** | **~2.5 GB** |

Perfect for older hardware, VMs, and minimal environments.

## Software

```bash
# Flatpak (pre-enabled)
flatpak install flathub org.mozilla.firefox

# Lightweight native apps
sudo dnf install mousepad ristretto parole
```

## See Also

- [Build Guide](README.md) — detailed build instructions
- [Project Status](PROJECT_STATUS.md) — current development status
- [Contributing](CONTRIBUTING.md) — how to help
- [Tromsø (KDE)](/tromso) — the KDE Plasma variant
- [Managing with Bootc](../tunaos/bootc-usage.md) — switching variants
