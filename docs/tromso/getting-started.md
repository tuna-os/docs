---
sidebar_position: 2
title: "Getting Started"
---

# 🚀 Getting Started with Tromsø

Tromsø is a **KDE Plasma** desktop image built from source with BuildStream. It's the KDE sibling of Project Bluefin's [Dakota](https://github.com/projectbluefin/dakota) (GNOME) — same BuildStream-from-source approach, different desktop.

## Available Images

Tromsø is published as a bootc OCI image on `ghcr.io`:

```bash
# Pull the image
podman pull ghcr.io/tuna-os/tromso:latest

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/tromso:latest
sudo systemctl reboot
```

## Quick Start

### Prerequisites
- BuildStream 2.7.0+ (via `bst2` container)
- Podman or Docker
- QEMU + KVM for testing
- 200GB+ free disk space (cache)
- 16GB+ RAM recommended

### Build from Source

```bash
git clone https://github.com/tuna-os/tromso.git
cd tromso
just build
just export
just boot-vm  # Test in QEMU
```

### Install via bootc (from pre-built image)

```bash
sudo bootc switch ghcr.io/tuna-os/tromso:latest
sudo systemctl reboot
```

## First Look

Tromsø ships KDE Plasma with a clean, default configuration:

- **KDE Plasma 6** — the latest stable KDE desktop
- **Wayland by default** — smooth, modern display server
- **Discover** — GUI package manager (Flatpak + RPM)
- **KDE Apps** — Dolphin (file manager), Konsole (terminal), Kate (editor)
- **System Settings** — deep customization via KDE Control Center

### Key KDE Features

| Feature | How to Access |
|---|---|
| Virtual Desktops | `Ctrl+F1`-`F4` or Overview (`Meta+W`) |
| KRunner | `Alt+Space` — app launcher, calculator, file search |
| Window Tiling | Drag to edges or use `Meta+Arrow` |
| Widgets | Right-click desktop → Add Widgets |
| Dark Mode | System Settings → Appearance → Theme |

## Customization

```bash
# Install KDE themes and widgets
brew install kde-themedb

# Configure Plasma
systemsettings  # Launch KDE System Settings
```

## Software

```bash
# Flatpak (pre-enabled)
flatpak install flathub org.kde.krita

# Homebrew (pre-installed)
brew install kate

# RPM packages
sudo dnf install kdenlive
```

## See Also

- [Tromsø SPEC](SPEC.md) — full technical specification
- [Dakota (Bluefin)](/dakota) — the GNOME reference this is modeled on
- [XFCE Linux](/xfce-linux) — lightweight XFCE variant
- [Managing with Bootc](../tunaos/bootc-usage.md) — switching variants
