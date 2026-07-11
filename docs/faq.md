---
sidebar_position: 12
title: "FAQ"
---

# ❓ Frequently Asked Questions

## General

**What is TunaOS?**

TunaOS is a collection of bootc-based, immutable desktop operating system images built on Enterprise Linux (AlmaLinux, CentOS Stream, Fedora). It brings modern desktops (GNOME, KDE, COSMIC, XFCE, Niri) to a stable, enterprise-grade foundation.

**Is TunaOS a Linux distribution?**

Yes — but not in the traditional sense. TunaOS images are bootable OCI containers, not traditional packages. You pull and switch images like containers, while getting a full desktop experience.

**Is TunaOS free?**

Yes. TunaOS is open source under the Apache 2.0 license.

## Installation

**How do I install TunaOS?**

Two ways:
1. **Fresh install** — Download an ISO from [tunaos.org/download](https://tunaos.org/download) and write it to USB
2. **Switch from an existing bootc system** — `sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome && sudo reboot`

**Can I dual-boot TunaOS?**

TunaOS uses bootc which manages the bootloader. Dual-boot is possible but not the primary use case. For multi-OS on one machine, use [Tacklebox](/tacklebox/getting-started) to create a multi-boot USB.

**Which variant should I choose?**

| Need | Variant | Base |
|---|---|---|
| Latest EL | Yellowfin | AlmaLinux Kitten 10 |
| Stable EL | Albacore | AlmaLinux 10 |
| Upstream EL | Skipjack | CentOS Stream 10 |
| Fedora | Bonito | Fedora 44 |
| GNOME | Any `:gnome` tag | — |
| KDE Plasma | Any `:kde` or Tromsø | — |
| COSMIC | Any `:cosmic` tag | — |
| Lightweight | XFCE Linux | freedesktop-sdk |
| Tiling WM | Any `:niri` tag | — |

## Variants

**What's the difference between Yellowfin, Albacore, Skipjack, and Bonito?**

They differ by base OS:
- **Yellowfin** — AlmaLinux Kitten 10 (closest to upstream CentOS Stream)
- **Albacore** — AlmaLinux 10 (stable Enterprise Linux)
- **Skipjack** — CentOS Stream 10 (RHEL upstream)
- **Bonito** — Fedora 44 (latest packages, ARM64 support)

All four support the same desktop environments and hardware variants.

**What does `-hwe`, `-gdx`, and `-gdx-hwe` mean?**

| Suffix | Meaning |
|---|---|
| `-hwe` | Hardware Enablement — newer kernel for newer hardware |
| `-gdx` | NVIDIA drivers + CUDA for GPU/AI workloads |
| `-gdx-hwe` | NVIDIA/CUDA on the HWE kernel |

Example: `ghcr.io/tuna-os/yellowfin:gnome-gdx-hwe`

## Desktop Environments

**Which desktop environment is best for my hardware?**

| Hardware | Recommended | RAM usage |
|---|---|---|
| Modern (16GB+) | GNOME or KDE | ~1-1.2 GB |
| Mid-range (8GB) | COSMIC or KDE | ~0.8-1 GB |
| Older/light (4GB) | XFCE | ~600 MB |
| Minimal/VM | XFCE or Niri | ~400-600 MB |

**Can I switch desktop environments without reinstalling?**

Yes! Use `bootc switch`:

```bash
# From GNOME to COSMIC
sudo bootc switch ghcr.io/tuna-os/yellowfin:cosmic
sudo systemctl reboot
```

## Package Management

**Can I use apt/dnf on TunaOS?**

TunaOS images are immutable — `/usr` is read-only at runtime. However:

- **Homebrew** is pre-installed for user-space tools
- **Flatpak** is pre-enabled for GUI apps
- **Toolbox/Distrobox** provides a mutable container for `dnf`/`apt`

```bash
# Use Toolbox for traditional package management
toolbox enter
sudo dnf install htop
```

**How do I update TunaOS?**

```bash
sudo bootc upgrade && sudo systemctl reboot
```

This pulls the latest image and reboots into it. Rollback is one command: `sudo bootc rollback`.

## Community

**How can I contribute?**

See [CONTRIBUTING.md](https://github.com/tuna-os/tunaOS/blob/main/CONTRIBUTING.md). Good first steps:
- Try a TunaOS variant and report issues
- Improve documentation
- Look for `good-first-issue` labels in TunaOS repos
- Join the [Matrix chat](https://matrix.to/#/#tunaos:reilly.asia)

**Where do I report bugs?**

Open an issue on the relevant GitHub repository. For general issues, use [tuna-os/tunaOS](https://github.com/tuna-os/tunaOS/issues).

## Technical

**What is bootc?**

[bootc](https://github.com/bootc-dev/bootc) is a CNCF Sandbox project for bootable container images. Instead of traditional package-based OS updates, the entire OS is a container image that you pull, switch to, and reboot. Learn more in the [Bootc Guide](tunaos/bootc-usage.md).

**How are images built?**

TunaOS images are built in GitHub Actions using Containerfiles. See [Building TunaOS](tunaos/building.md) and [CI/CD](tunaos/ci-cd.md).

**Does TunaOS support Secure Boot?**

Yes. TunaOS images support UEFI Secure Boot through the standard shim mechanism provided by the base OS.
