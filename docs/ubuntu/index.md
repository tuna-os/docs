---
sidebar_position: 1
sidebar_label: "Ubuntu"
---

# 🐧 Ubuntu on TunaOS

TunaOS provides **Ubuntu 26.04 Resolute Raccoon** as a bootc OCI image with a live installable ISO. This brings Ubuntu's familiar experience to an immutable, container-native foundation.

## Quick Start

```bash
# Pull the image
podman pull ghcr.io/tuna-os/ubuntu:26.04

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/ubuntu:26.04
sudo systemctl reboot
```

## Download ISO

Pre-built ISOs are available at [tunaos.org/download](https://tunaos.org/download).

## Features

- **Familiar Ubuntu experience** — same APT, same workflows, same ecosystem
- **Immutable base** — atomic updates and rollbacks via bootc
- **Live ISO** — try before you install
- **OCI-native** — pull and switch like any other bootc image

## Comparison with Traditional Ubuntu

| Aspect | Traditional Ubuntu | TunaOS Ubuntu |
|---|---|---|
| Updates | `apt upgrade` | `bootc upgrade` + reboot |
| Rollback | Complex (fs snapshots) | `bootc rollback` |
| Immutability | Partial | Full (/usr is read-only) |
| Installation | ISO installer | `bootc switch` or ISO |
| Package mgmt | APT | APT + Homebrew + Flatpak |

## Usage

### Package Management

Ubuntu's APT package manager works as expected:

```bash
# Update package lists
sudo apt update

# Install packages
sudo apt install htop neovim

# Snap packages (pre-enabled)
sudo snap install firefox
```

### Homebrew

Homebrew is pre-installed on TunaOS Ubuntu images:

```bash
# Install CLI tools
brew install ripgrep fd bat

# Install graphical apps
brew install --cask visual-studio-code
```

### Flatpak

Flatpak is pre-enabled with Flathub:

```bash
flatpak install flathub org.mozilla.firefox
```

## See Also

- [Installation Guide](../installation.md) — general TunaOS installation
- [Managing with Bootc](../tunaos/bootc-usage.md) — bootc day-to-day operations
- [Homebrew Guide](../tunaos/homebrew.md) — using Homebrew on TunaOS
- [Ubuntu Repo](https://github.com/tuna-os/ubuntu) — source repository
