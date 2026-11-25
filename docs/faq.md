---
sidebar_position: 12
title: "FAQ"
---

# Frequently Asked Questions

## General

**What is TunaOS?**

TunaOS is a collection of bootc-based, immutable desktop operating system images built on Enterprise Linux (AlmaLinux, CentOS Stream, Fedora). It brings modern desktops (GNOME, KDE, COSMIC, XFCE, Niri) to a stable, enterprise-grade foundation.

**Is TunaOS a Linux distribution?**

Yes — but not in the traditional sense. TunaOS images are bootable OCI containers, not traditional packages. You pull images and switch between them like containers to receive a full desktop experience.

**Is TunaOS free?**

Yes. Apache 2.0 licenses TunaOS as open source.

## Installation

**How do I install TunaOS?**

Three ways. The [download page](https://tunaos.org/download) shows all three:

1. **Make a USB installer** — TunaOS Media Writer writes TunaOS to a USB stick (16 GB or more). Then [start your computer from the USB stick](start-from-usb.md) and [install](installer.mdx). This replaces the system on the computer.
2. **Try it from Windows and keep Windows** — [wootc](https://tunaos.org/wootc) installs TunaOS next to Windows, with no USB stick.
3. **Move from an existing bootc system** — use [bootc-migrate](/docs/bootc-migrate), a smarter `bootc switch`: `sudo bootc-migrate --target-image ghcr.io/tuna-os/yellowfin:gnome`, then reboot. It takes the same target, checks it first, carries `/home`, `/var` and `/etc` across, and keeps your old deployment bootable until you `commit`.

**Where do I download the ISOs?**

[tunaos.org/download](https://tunaos.org/download), under **I already run Linux**. If a specific ISO won't download, use this link instead:
`https://download.tunaos.org/live-isos/<variant>-<flavor>-latest.iso` (for example, `albacore-gnome-latest.iso` or `yellowfin-gnome-latest.iso`). [tuna-os/tunaOS discussion #652](https://github.com/tuna-os/tunaOS/discussions/652) and [#561](https://github.com/tuna-os/tunaOS/issues/561) cover a real download-page outage and its fix.

**Can I keep Windows?**

Yes, with [wootc](https://tunaos.org/wootc). It installs TunaOS next to Windows, and Windows stays on the boot menu. The USB installer is different: it erases the full drive. For multi-OS on one USB stick, use [Tacklebox](/docs/tacklebox/USER-GUIDE).

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

Not yet. An installer for M1 and M2 Macs is in development, but it has no release. M3 and newer Macs need support in [Asahi Linux](https://asahilinux.org/) first. See [Apple Silicon Macs](apple-silicon.md).

**Does TunaOS run on laptops with Snapdragon X Elite? (Does TunaOS run on a "Copilot+ PC"?)**

No. TunaOS has no support for laptops with Snapdragon X Elite. The Lenovo ThinkPad X13s Gen 1 is a different laptop: it has a Snapdragon 8cx Gen 3 (SC8280XP). TunaOS has a preview image for it, `bonito:gnome-x13s`, and nobody has started that image on an X13s yet. See [ThinkPad X13s in the User Guide](https://github.com/tuna-os/tunaOS/blob/main/docs/USER-GUIDE.md#thinkpad-x13s-preview-unverified-on-hardware). When the preview ISO is published, the [download page](/download#linux) lists it.

The guide pages for [Bonito X13s](/docs/bonito-x13s) and [Dakota X13s](/docs/dakota-x13s) are **archived**. Their ISOs are from March and June 2026 and get no updates.

The X13s guide does not cover the NPU (the "AI" accelerator behind the Copilot+ name). No page here documents NPU access from Linux on this hardware yet. Treat NPU support as unconfirmed until a page for the variant says otherwise. See [tuna-os/tunaOS discussion #93](https://github.com/tuna-os/tunaOS/discussions/93) for the original question.

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

Yes. A different desktop is a different image. Use [bootc-migrate](/docs/bootc-migrate), a smarter `bootc switch`:

```bash
# From GNOME to COSMIC
sudo bootc-migrate --target-image ghcr.io/tuna-os/yellowfin:cosmic --dry-run
sudo bootc-migrate --target-image ghcr.io/tuna-os/yellowfin:cosmic
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
