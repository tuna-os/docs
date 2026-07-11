---
slug: 13-fishes-in-the-sea
title: "13 Fishes in the Sea: The TunaOS Variant Landscape"
authors: [james]
tags: [vision, variants, architecture]
date: 2026-07-07
---

# 13 Fishes in the Sea: The TunaOS Variant Landscape

For too long, the Linux desktop has been left behind, bogged down by fragmentation and distro wars. Today, TunaOS has **13 variants** spanning 5 package managers and every major Linux family. But this isn't about promoting another distro—it's about proving that the base OS doesn't matter anymore. By turning operating systems into image factories, we can stop wasting time fighting over how to get software to users and instead focus entirely on making the software good.

<!-- truncate -->

## The Distro Illusion

For decades, "making a Linux distro" meant: fork a package set, maintain an installer, hand-tune configs, ship ISOs on a 6-month cadence, and pray nothing breaks between your packages and upstream. The result has been endless fragmentation—hundreds of distros that are 95% the same packages with 5% different defaults.

The illusion is that this is *hard*. That it requires a priesthood of release engineers. That choosing between Arch, Fedora, Debian, or openSUSE is a permanent, load-bearing architecture decision. 

**We reject this.** The proof is in the fact that we can release a completely consistent desktop experience across 13 entirely different distributions. 

## The Factory

TunaOS is not a distribution. It's an **image factory**. The inputs are simple data:

```
base OS  ×  desktop  ×  kernel  ×  drivers  =  bootable image
```

The output is an OCI container image you can `bootc switch` to atomically, with clean rollback. Change your base distribution, change your desktop, or change your kernel stack in a single command. 

While the speed of building and maintaining this matrix has been seriously helped by modern AI/LLMs, the real magic relies on a core cloud-native stack: **bootc**, **CI/CD automation**, **Podman**, and the **git/devops philosophy** applied directly to the desktop. By treating operating systems like container deployments, the desktop can finally catch up to modern cloud workflows.

## The Fishes

Every TunaOS variant is named after a fish. Today there are 13:

| Fish | Base Distribution | Package Manager | Status | Landing Page | Core Character / Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🐠 **Yellowfin** | [AlmaLinux Kitten 10](https://almalinux.org) | dnf | Production | [View Landing Page](/yellowfin) | Bleeding-edge Enterprise Linux |
| 🐟 **Albacore** | [AlmaLinux 10](https://almalinux.org) | dnf | Production (Recommended) | [View Landing Page](/albacore) | Stable Enterprise Linux (10-yr support) |
| 🍣 **Skipjack** | [CentOS Stream 10](https://centos.org) | dnf | Production | [View Landing Page](/skipjack) | Upstream RHEL Testing preview |
| 🔒 **Redfin** | [RHEL 10](https://redhat.com) | dnf | Local-build | [View Landing Page](/redfin) | Supported secure workstation |
| 🎣 **Bonito** | [Fedora 44](https://fedoraproject.org) | dnf | Production | [View Landing Page](/bonito) | Cutting-edge Fedora desktop |
| 🐟 **Grouper** | [Ubuntu 26.04](https://ubuntu.com) | apt | Experimental | [View Landing Page](/grouper) | Ubuntu base on bootc |
| 🐡 **Flounder** | [Debian Trixie (13)](https://debian.org) | apt | Production | [View Landing Page](/flounder) | Stable Debian on bootc |
| ☢️ **Flounder Sid** | [Debian Sid](https://debian.org) | apt | Production | [View Landing Page](/flounder-sid) | Debian rolling development |
| 🚀 **Marlin** | [Arch Linux](https://archlinux.org) | pacman | Production | [View Landing Page](/marlin) | Rolling release, latest everything |
| 🐟 **Wahoo** | [CachyOS](https://cachyos.org) | pacman | Experimental | [View Landing Page](/wahoo) | Performance-optimized Arch (BORE scheduler) |
| 🐉 **Bonito Rawhide** | [Fedora Rawhide](https://fedoraproject.org) | dnf | Production | [View Landing Page](/bonito-rawhide) | Bleeding-edge Fedora development |
| 🦎 **Sailfin** | [openSUSE Tumbleweed](https://opensuse.org) | zypper | Production | [View Landing Page](/sailfin) | openSUSE rolling transactional base |
| 🐧 **Guppy** | [Gentoo Linux](https://gentoo.org) | emerge | Production | [View Landing Page](/guppy) | Source-based Gentoo on bootc |

Each fish gets **6 desktops**: GNOME, GNOME 50, KDE Plasma, COSMIC, Niri, and XFCE. Each desktop can optionally layer an HWE kernel or NVIDIA drivers on top.

## How We Got Here

A week ago, adding a new base OS meant writing hundreds of lines of new shell scripts. Today it means:

1. **A Containerfile** that bootcifies the stock container image (~150 lines, mostly the ostree filesystem layout)
2. **A `pacman:` or `apt:` section** in each desktop manifest (the packages that make up GNOME/KDE/etc. on that OS)
3. **An entry in `build-config.yml`** (the variant name, base image, platforms)

That's it. The generic installer reads the YAML, installs the right packages for the detected OS, and produces a working image. No per-distro bash scripts. No per-DE-per-distro combinatorial explosion.

## What This Means For Users

**You're not locked in.** Want to try Arch after running AlmaLinux for a year? `sudo bootc switch ghcr.io/tuna-os/marlin:kde`. Want the CachyOS performance kernel on your KDE desktop? `sudo bootc switch ghcr.io/tuna-os/wahoo:kde`. Don't like GNOME 50? Switch to GNOME 49: `sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome`.

The matrix is your menu. Every cell is a valid, tested, bootable system.

## What's Next

- **Build validation** — getting CI green for all 10 variants across all platforms
- **ISOs** — tacklebox-generated live ISOs for every variant×desktop combination
- **NVIDIA on Arch/CachyOS** — `pacman -S nvidia-open` as a manifest entry (no akmods needed)
- **More desktops** — Hyprland, Sway, Budgie are each one YAML file away
- **Community manifests** — let anyone contribute a desktop definition without touching build scripts

## Credits

This wouldn't be possible without:

- **[bootcrew](https://github.com/bootcrew/mono)** — reference bootc implementations for Arch and Debian
- **[jumpvi / bootc-shindig](https://github.com/bootc-shindig)** — bootc-deb packages for Ubuntu/Debian
- **[CachyOS](https://cachyos.org)** — performance-optimized Arch repos and Docker images
- **[Universal Blue](https://universal-blue.org/)** & **[Project Bluefin](https://projectbluefin.io)** — proving bootc desktop works at scale
- **[bootc](https://github.com/bootc-dev/bootc)** — the engine that makes all of this possible

---

*The distro illusion is dead. A distro is just data in, image out. Pick your fish.*
