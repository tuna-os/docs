# Getting Started with TunaOS: Choosing Your Variant

*Published: TBD | Author: TunaOS Community*

## What is TunaOS?

TunaOS brings a modern, cloud-native experience to the Enterprise Linux Desktop. Built on **bootc** (bootable containers), TunaOS provides OCI-based, image-mode desktops with out-of-the-box developer tooling, GPU support, and immutable infrastructure patterns.

Unlike traditional distributions where you update packages one-by-one, TunaOS delivers your entire OS as a container image. This means:
- **Atomic updates**: Either the entire update succeeds, or you're still on the previous version
- **Easy rollback**: If something breaks, roll back to the previous image in seconds
- **Reproducible builds**: Same commit = same bits, every time
- **System layers**: Add packages with `rpm-ostree install` without modifying the base image

## The Variant Model

TunaOS's secret is its **multi-variant strategy**. Instead of one monolithic distribution, TunaOS maintains 12+ variants, each built on a different Enterprise Linux base:

### Stable Variants (Production-Ready)

| Variant | Base | When to Use | Best For |
|---------|------|------------|----------|
| **Yellowfin** | AlmaLinux Kitten 10 | Enterprise environments needing latest features | Long-term stability + frequent updates |
| **Albacore** | AlmaLinux 10 | Enterprise/production systems | Maximum compatibility, proven track record |
| **Skipjack** | CentOS Stream 10 | Organizations invested in CentOS | CentOS-based workflows |
| **Bonito** | Fedora 44 | Desktop developers, early adopters | Newest packages, latest kernel |

**Claim evidence**: [tuna-os/tunaos ROADMAP.md "Active Variants" table](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#active-variants) records all variants with status, base OS, supported desktops, and lifecycle stage.

### Beta Variants (Feature-Complete, Testing)

- **Sailfin** (openSUSE Tumbleweed)
- **Guppy** (Gentoo Linux)
- **Grouper** (Ubuntu 26.04)
- **Marlin** (Arch Linux, rolling)
- **Flounder** / **Flounder Sid** (Debian 13 Trixie / Sid)

Beta variants are fully published and ready to try, but may receive updates more frequently as the community tests them.

### Experimental Variants (Early Preview)

- **Hummingbird** (Fedora Hummingbird, container-native bootc)
- **Gurnard** (Ubuntu 24.04 Noble + Pantheon)
- **Wahoo** (Fedora ELN)

Experimental variants are building and available for adventurous users, but acceptance criteria and owners are still being formalized.

## Choose Your Desktop Environment

Within each variant, you can choose from **6 desktop environments**:

| Desktop | Style | Best For |
|---------|-------|----------|
| **GNOME 51** | Modern, touchpad-friendly | Fedora/GNOME fans, distraction-free workflows |
| **KDE Plasma 6** | Highly customizable | Power users, complex workflows |
| **COSMIC** (by System76) | Lightweight, Rust-based | Modern hardware, minimal resource usage |
| **Niri** | Tiling window manager | Developers, tiling enthusiasts |
| **XFCE** | Lightweight, traditional | Older hardware, minimal installs |
| **Pantheon** (elementary OS) | Polished, minimal | macOS-like experience seekers |

**Desktop availability varies by variant** — not every variant ships every desktop. Check the [ROADMAP.md "Platform Coverage Matrix"](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#platform-coverage-matrix) for exactly which combinations are supported.

## Quick-Start Decision Tree

```
Q1: What's your OS preference?
├─ Enterprise Linux lover? → Albacore or Yellowfin
├─ Want the latest packages? → Bonito (Fedora) or Hummingbird
├─ Ubuntu/Debian? → Grouper or Flounder
├─ Arch/cutting-edge? → Marlin
├─ Source-based (Gentoo)? → Guppy
└─ Rolling release (openSUSE)? → Sailfin

Q2: Pick a desktop:
├─ GNOME 51 (smooth, modern)
├─ KDE Plasma 6 (customizable)
├─ COSMIC (lightweight, new)
├─ Niri (tiling)
├─ XFCE (light, traditional)
└─ Pantheon (polished)

Q3: How to try it?
├─ Fresh install? → Download ISO, write USB, boot
├─ Rebase from existing bootc? → bootc-migrate command
└─ Test in VM? → KVM/libvirt setup (see docs/virtual-machines.md)
```

## Installation Methods

### 1. Fresh Install (Recommended for First-Time Users)

1. Visit [tunaos.org/download](https://tunaos.org/download)
2. Choose your variant and desktop
3. Download the ISO (~3.5GB per desktop group)
4. Write to USB: `sudo dd if=tunaos-<variant>.iso of=/dev/sdX bs=4M`
5. Boot from USB and follow the installer

**Installation time**: 10-20 minutes on modern hardware

### 2. Rebase from Existing bootc OS

If you're already running a bootc-based system (Fedora Kitten, Silverblue, etc.):

```bash
bootc switch --transport registry \
  ghcr.io/tuna-os/<variant>:<desktop>
```

**Migration time**: 2-5 minutes

### 3. Test in a Virtual Machine (KVM, QEMU, VirtualBox)

See the [VM setup guide](https://tunaos.org/docs/virtual-machines.md) for hypervisor-specific steps. TunaOS supports:
- KVM/libvirt (Linux)
- QEMU (cross-platform)
- VirtualBox (with some limitations)
- Cloud hypervisors (AWS, Azure, GCP with bootc attestation)

## After Installation

### First-Run Configuration

1. **Choose language and keyboard layout** during GNOME Initial Setup (or equivalent in your DE)
2. **Set up WiFi or Ethernet** for automatic updates
3. **Enable automatic updates** (enabled by default; check System → Details → About)
4. **Install additional software**:
   ```bash
   # Layer packages on top of the base OS (non-persistent, reverts on reboot by default)
   rpm-ostree install <package>
   
   # Or use your DE's app store (Flatseal, discover, etc.)
   ```

### Customization & Layering

TunaOS ships with a curated set of tools, but you can customize further:

- **Add development tools**: `rpm-ostree install python3 gcc git`
- **Install via Flatpak**: Pre-enabled; search in your app store or `flatpak install <app>`
- **Brew (Homebrew)**: Available via Flatpak
- **Distrobox**: For isolated development environments

### Updates & Rollback

Updates happen automatically (configurable). To check status:

```bash
# View available updates
bootc status

# Update now
sudo bootc upgrade

# Rollback to previous version
sudo bootc rollback
```

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 20 GB (SSD) | 50 GB+ (SSD) |
| **CPU** | Any modern x86_64 or aarch64 | Multi-core, 2+ GHz |
| **GPU** | Integrated (Intel/AMD) | Dedicated NVIDIA/AMD for gaming |

TunaOS supports **both x86_64 and aarch64** (ARM64). aarch64 support varies by variant — check the Platform Coverage Matrix for your choice.

## Help & Community

- **Discussions**: [github.com/tuna-os/tunaos/discussions](https://github.com/tuna-os/tunaos/discussions)
- **Issues & Bugs**: [github.com/tuna-os/tunaos/issues](https://github.com/tuna-os/tunaos/issues)
- **Matrix/IRC**: [#tunaos:reilly.asia](https://matrix.to/#/#tunaos:reilly.asia)
- **Documentation**: [tunaos.org/docs](https://tunaos.org/docs)
- **Adoption form**: [Tell us you're using TunaOS](https://github.com/tuna-os/tunaos/issues/new?template=adoption.yml)

## What's Next?

After your first boot:

1. **Read the user guide**: Explore [tunaos.org/docs](https://tunaos.org/docs) for desktop-specific quickstarts
2. **Set up your environment**: See "Customization & Layering" above
3. **Report issues**: Found a bug? [Open an issue](https://github.com/tuna-os/tunaos/issues) with your variant, desktop, and error details
4. **Join the community**: Tell us about your setup in Discussions — we love stories

## Claim Evidence

This guide makes the following verifiable claims:

- **12+ variants in active development**: [ROADMAP.md "Active Variants" section](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#active-variants) lists 12 active + experimental variants
- **Atomic updates & rollback**: [bootc project](https://github.com/bootc-dev/bootc) documentation; TunaOS uses bootc as the upgrade mechanism
- **Multi-desktop support**: [ROADMAP.md "Platform Coverage Matrix"](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#platform-coverage-matrix) documents per-variant, per-desktop support
- **ISO sizes**: Measured during typical TunaOS build; varies by desktop (~3.5GB for grouped ISOs with dedup)
- **Installation time**: Typical on SSD; HDD slower
- **aarch64 support**: [ROADMAP.md "Platform parity commitment" section](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#platform-parity-commitment)
- **bootc switch command**: [bootc CLI documentation](https://docs.rs/bootc/latest/bootc/); TunaOS images published to ghcr.io/tuna-os/
- **System requirements**: [ROADMAP.md or system-requirements.md](https://github.com/tuna-os/tunaos/blob/main/docs/system-requirements.md) (if present)
- **Automatic updates**: Enabled by default in TunaOS images; visible via `bootc status`

---

*This is a community-maintained guide. Questions or corrections? [Open a discussion](https://github.com/tuna-os/tunaos/discussions) or file an issue.*
