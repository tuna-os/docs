---
sidebar_position: 12
title: "FAQ"
---

# ❓ Frequently Asked Questions

## General

**What is TunaOS?**

TunaOS is a collection of bootc-based, immutable desktop operating system images built on Enterprise Linux (AlmaLinux, CentOS Stream, Fedora). It brings modern desktops (GNOME, KDE, COSMIC, XFCE, Niri) to a stable, enterprise-grade foundation.

**Is TunaOS a Linux distribution?**

Yes — but not in the traditional sense. TunaOS images are bootable OCI containers, not traditional packages. You pull images and switch between them like containers to receive a full desktop experience.

**Is TunaOS free?**

Yes. Apache 2.0 licenses TunaOS as open source.

## Installation

**How do I install TunaOS?**

Two ways:

1. **Fresh install** — Download an ISO from [tunaos.org/download](https://tunaos.org/download) and write it to USB
2. **Switch from an existing bootc system** — `sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome && sudo reboot`

**Where do I download the ISOs?**

[tunaos.org/download](https://tunaos.org/download) — pick a variant and desktop flavor from the picker. If a specific ISO won't download, use this link instead:
`https://download.tunaos.org/live-isos/<variant>-<flavor>-latest.iso` (for example, `albacore-gnome-latest.iso` or `yellowfin-gnome-latest.iso`). [tuna-os/tunaOS discussion #652](https://github.com/tuna-os/tunaOS/discussions/652) and [#561](https://github.com/tuna-os/tunaOS/issues/561) cover a real download-page outage and its fix.

**Can I dual-boot TunaOS?**

TunaOS uses bootc which manages the bootloader. Dual-boot is possible but not the primary use case. For multi-OS on one machine, use [Tacklebox](/docs/tacklebox/getting-started) to create a multi-boot USB.

**Which variant should I choose?**

| Need | Variant | Base |
| --- | --- | --- |
| Latest EL | Yellowfin | AlmaLinux Kitten 10 |
| Stable EL | Albacore | AlmaLinux 10 |
| Upstream EL | Skipjack | CentOS Stream 10 |
| Fedora | Bonito | Fedora 44 |
| Ubuntu + Pantheon | Gurnard | Ubuntu 24.04 LTS |
| Ubuntu | Grouper | Ubuntu 26.04 |
| Arch (Rolling) | Marlin | Arch Linux |
| Debian | Flounder | Debian 13 (Trixie) |
| openSUSE | Sailfin | openSUSE Tumbleweed |
| Gentoo | Guppy | Gentoo Linux |
| GNOME | Any `:gnome` tag | — |
| KDE Plasma | Any `:kde` or Tromsø | — |
| COSMIC | Any `:cosmic` tag | — |
| Pantheon | Any `:pantheon` tag (Gurnard) | — |
| Lightweight | XFCE Linux | freedesktop-sdk |
| Tiling WM | Any `:niri` tag | — |
| RHEL (local build) | Redfin | RHEL 10 |

> The full, current variant matrix (including experimental variants such as
> Hummingbird, Bonito Rawhide, and Flounder Sid) lives on the
> [variant pages](https://tunaos.org/).

**Does TunaOS run on Apple Silicon Macs?**

Yes, on M1 and M2 Macs, with [bootc-installer-asahi](https://github.com/tuna-os/bootc-installer-asahi). The installer runs on macOS, then hands off to [Asahi Linux](https://asahilinux.org/) recoveryOS, which boots a TunaOS bootc image. This install path is **experimental**: it offers only the images that pass a golden-manifest check, which now means Bonito and Grouper. M3 and newer Macs are not supported yet, because Asahi upstream does not support them yet. For hardware tiers and test status, see [docs/ASAHI-HARDWARE-TIERS.md](https://github.com/tuna-os/tunaOS/blob/main/docs/ASAHI-HARDWARE-TIERS.md).

**Does TunaOS run on laptops with Snapdragon X Elite? (Does TunaOS run on a "Copilot+ PC"?)**

Yes, on X13s-class devices such as the Lenovo ThinkPad X13s (Snapdragon X Elite, SC8380) — the ARM64 hardware inside most "Copilot+ PC" laptops. Use the [Bonito](/bonito) variant (the ARM64 image). The dedicated guide pages for [Bonito X13s](/docs/bonito-x13s) and [Dakota X13s](/docs/dakota-x13s) are **archived**. Their source repos (`tuna-os/bonito-x13s`, `tuna-os/dakota-x13s`) are read-only and no longer publish new builds, so treat the hardware-status tables there as historical. Other laptops with Snapdragon X Elite have no confirmed status yet: the Dell XPS 13, the Surface Pro 11, and the Yoga Slim 7x. The X13s is the only device with a published guide today.

That guide does not cover the NPU (the "AI" accelerator behind the Copilot+ name). No page here documents NPU access from Linux on this hardware yet. Treat NPU support as unconfirmed until a page for the variant says otherwise. See [tuna-os/tunaOS discussion #93](https://github.com/tuna-os/tunaOS/discussions/93) for the original question.

## Variants

**What's the difference between Yellowfin, Albacore, Skipjack, and Bonito?**

They differ by base OS:

- **Yellowfin** — AlmaLinux Kitten 10 (closest to upstream CentOS Stream)
- **Albacore** — AlmaLinux 10 (stable Enterprise Linux)
- **Skipjack** — CentOS Stream 10 (RHEL upstream)
- **Bonito** — Fedora 44 (latest packages, ARM64 support)

All four support the same desktop environments and hardware variants. Desktop
availability differs across the wider variant family, though. Gurnard ships
**Base + Pantheon** (elementary OS's desktop). Grouper, Flounder, and Marlin add
XFCE to the core GNOME/KDE/COSMIC/Niri set. See the variant page for the exact
desktop × architecture matrix.

**What does `-hwe` and `-nvidia` mean?**

| Suffix | Meaning |
| --- | --- |
| `-hwe` | Hardware Enablement — newer kernel for newer hardware |
| `-nvidia` | NVIDIA drivers + CUDA for GPU/AI workloads |
| `-nvidia-hwe` | NVIDIA/CUDA on the HWE kernel |

Example: `ghcr.io/tuna-os/yellowfin:gnome-nvidia-hwe`

> The `-nvidia` suffix replaced the legacy `-gdx` suffix — `-gdx` tags no
> longer exist.

## Desktop Environments

**Which desktop environment is best for my hardware?**

| Hardware | Recommended | RAM usage |
| --- | --- | --- |
| Modern (16GB+) | GNOME or KDE | ~1-1.2 GB |
| Mid-range (8GB) | COSMIC or KDE | ~0.8-1 GB |
| Older/light (4GB) | XFCE | ~600 MB |
| Minimal/VM | XFCE or Niri | ~400-600 MB |

**Can I switch desktop environments without a fresh installation?**

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
- **Custom images** — use `bootc usr-overlay` for a temporary change, or build a derived image (see the [customization guide](layering.md))

```bash
# Use Toolbox for traditional package management
toolbox enter
sudo dnf install htop
```

**How do I update TunaOS?**

```bash
sudo bootc upgrade && sudo systemctl reboot
```

This pulls the latest image and reboots into it. Rollback is one command: `sudo bootc rollback`. For a full walkthrough of how to troubleshoot updates and rollbacks, see the [Rollback & Update guide](bootc-rollback.md).

## Community

**How can I contribute?**

See `CONTRIBUTING.md`. Good first steps:

- Try a TunaOS variant and report issues
- Improve documentation
- Look for `good-first-issue` labels in TunaOS repos
- Join the [Matrix chat](https://matrix.to/#/#tunaos:reilly.asia)

**Where do I report bugs?**

Open an issue on the relevant GitHub repository. For general issues, use [tuna-os/tunaOS](https://github.com/tuna-os/tunaOS/issues).

## Technical

**What is bootc?**

[bootc](https://github.com/bootc-dev/bootc) is a CNCF Sandbox project for bootable container images. Instead of package-based OS updates, the entire OS is a container image that you pull, switch to, and reboot. Learn more in the [Bootc Guide](tunaos/bootc-usage.md).

**How are images built?**

TunaOS images are built in GitHub Actions using Containerfiles. See [Build Guide](tunaos/building.md) and [CI/CD](tunaos/ci-cd.md).

**Does TunaOS support Secure Boot?**

Yes. The base OS provides a standard shim mechanism that enables UEFI Secure Boot. See the [Secure Boot guide](secure-boot.md) and [Verify downloads and images](verifying-downloads.md).
