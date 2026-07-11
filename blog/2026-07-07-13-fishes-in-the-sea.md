---
slug: 13-fishes-in-the-sea
title: "13 Fishes in the Sea: The TunaOS Variant Landscape"
authors: [james]
tags: [vision, variants, architecture]
date: 2026-07-07
---

# 13 Fishes in the Sea: The TunaOS Variant Landscape

For too long, the Linux desktop has been held back by fragmentation. Hundreds of distros that are 95% the same packages with 5% different defaults — and picking one felt like a permanent, load-bearing architecture decision.

TunaOS rejects that. Today we ship **13 variants** spanning 5 package managers and every major Linux family, all producing a completely consistent desktop experience. The proof is in the matrix: when you can switch base OS underneath the same desktop without changing a thing, the distro stops being a decision and becomes a dial.

<!-- truncate -->

## The Image Factory

TunaOS is not a distribution. It's an **image factory**. The inputs are simple data:

```text
base OS + desktop + kernel + drivers = bootable image
```

The output is an OCI container image you can `bootc switch` to atomically, with clean rollback. Want a different desktop on the same base? Switch. Want a performance kernel? Switch. The matrix is your menu:

```bash
# Same base, different desktop
sudo bootc switch ghcr.io/tuna-os/marlin:kde
sudo bootc switch ghcr.io/tuna-os/marlin:gnome

# Same desktop, different kernel
sudo bootc switch ghcr.io/tuna-os/marlin:kde-hwe
```

:::note

`bootc switch` works within the same storage backend — both source and target images must use either ComposeFS or OSTree. Cross-backend migration (e.g. OSTree &rarr; ComposeFS) requires [`bootc-migrate-composefs`](https://github.com/tuna-os/bootc-migrate-composefs) `[alpha]`.

:::

Cross-family migration (e.g. AlmaLinux &rarr; Arch in-place) is also on the roadmap. Even same-family switching alone makes the base OS interchangeable in a way the traditional distro model never allowed.

The stack underneath is cloud-native: [`bootc`](https://github.com/containers/bootc), CI/CD automation, and [Podman](https://podman.io). By treating operating systems like container deployments, the desktop catches up to workflows the server side has had for years.

## The Variants

Every TunaOS variant is named after a fish. There are 13:

| Variant | Base Distribution | Status |
| :--- | :--- | :--- |
| 🐠  [**Yellowfin**](/yellowfin) | <img src="/img/os/almalinux.svg" width="20" /> [AlmaLinux Kitten 10](https://almalinux.org) | Production |
| 🐟 [**Albacore**](/albacore) | <img src="/img/os/almalinux.svg" width="20" /> [AlmaLinux 10](https://almalinux.org) | Production |
| 🍣 [**Skipjack**](/skipjack) | <img src="/img/os/centos.svg" width="20" /> [CentOS Stream 10](https://centos.org) | Production |
| 🔒 [**Redfin**](/redfin) | <img src="/img/os/rhel.svg" width="20" /> [RHEL 10](https://redhat.com) | Local-build |
| 🎣 [**Bonito**](/bonito) | <img src="/img/os/fedora.svg" width="20" /> [Fedora 44](https://fedoraproject.org) | Production |
| 🐉 [**Bonito Rawhide**](/bonito-rawhide) | <img src="/img/os/fedora.svg" width="20" /> [Fedora Rawhide](https://fedoraproject.org) | Production |
| 🐟 [**Grouper**](/grouper) | <img src="/img/os/ubuntu.svg" width="20" /> [Ubuntu 26.04](https://ubuntu.com) | Experimental |
| 🐡 [**Flounder**](/flounder) | <img src="/img/os/debian.svg" width="20" /> [Debian Trixie (13)](https://debian.org) | Production |
| ☢️ [**Flounder Sid**](/flounder-sid) | <img src="/img/os/debian.svg" width="20" /> [Debian Sid](https://debian.org) | Production |
| 🚀 [**Marlin**](/marlin) | <img src="/img/os/arch.svg" width="20" /> [Arch Linux](https://archlinux.org) | Production |
| 🐟 [**Wahoo**](/wahoo) | <img src="/img/os/cachyos.svg" width="20" /> [CachyOS](https://cachyos.org) | Experimental |
| 🦎 [**Sailfin**](/sailfin) | <img src="/img/os/opensuse.svg" width="20" /> [openSUSE Tumbleweed](https://opensuse.org) | Production |
| 🐧 [**Guppy**](/guppy) | <img src="/img/os/gentoo.svg" width="20" /> [Gentoo Linux](https://gentoo.org) | Production |

Each variant ships **5 desktops**: <img src="/img/desktops/gnome.svg" width="18" /> [GNOME](https://www.gnome.org/), <img src="/img/desktops/kde.svg" width="18" /> [KDE Plasma](https://kde.org/), <img src="/img/desktops/cosmic.svg" width="18" /> [COSMIC](https://system76.com/cosmic), <img src="/img/desktops/niri.svg" width="18" /> [Niri](https://github.com/YaLTeR/niri) + <img src="/img/desktops/dms.svg" width="18" /> [DMS](https://github.com/avengemedia/dms), and <img src="/img/desktops/xfce.svg" width="18" /> [XFCE](https://xfce.org/) (Wayland). Custom kernels or NVIDIA drivers layer on top of any of them.

## How We Got Here

A week ago, adding a new base OS meant writing hundreds of lines of shell scripts. Today it means three things:

1. **A Containerfile** that bootcifies the stock container image — adapted from [bootcrew's base images](https://github.com/bootcrew/mono)
2. **A package manager manifest** (`pacman:`, `apt:`, etc.) defining the desktop components for that OS
3. **An entry in `build-config.yml`** — variant name, base image, target platforms

That's it. The CI pipeline handles the rest: container images and bootable ISOs, automatically. No per-distro bash scripts. No per-DE-per-distro combinatorial explosion. The factory just runs.

## The Desktops

Every variant ships the same five desktop environments, defined as YAML manifests with per-package-manager package lists. Two are worth highlighting for pushing the Wayland envelope.

### <img src="/img/desktops/niri.svg" width="22" /> Niri + <img src="/img/desktops/dms.svg" width="22" /> DMS

[Niri](https://github.com/YaLTeR/niri) is a scrollable-tiling Wayland compositor — windows tile horizontally on an infinite ribbon you scroll through, rather than stacking in workspaces. It's the most unusual DE in the lineup and the one that most purely commits to Wayland's protocol model.

TunaOS pairs Niri with **[DMS](https://github.com/avengemedia/dms)** (DankMaterialShell), a desktop shell that layers greeter integration, a CLI control panel, and application launching on top of Niri. The full stack is `greetd` (display manager) → Niri (compositor) → DMS (shell). DMS is still early-stage but gives Niri a cohesive desktop experience beyond bare windows.

### <img src="/img/desktops/xfce.svg" width="22" /> XFCE (Wayland)

XFCE 4.20 introduced experimental Wayland support via its new compositor `xfwl4`, replacing the X11-era `xfwm4`. While XFCE's Wayland session is still maturing, it already works well enough for daily driving on Fedora and EL10 — TunaOS ships the optional `xfce4-wayland` package and defaults to GDM as the display manager to ensure the Wayland session is discoverable. Think of it as "XFCE, but with tear-free rendering and per-monitor refresh rates."

The other three desktops — <img src="/img/desktops/gnome.svg" width="18" /> [GNOME](https://www.gnome.org/), <img src="/img/desktops/kde.svg" width="18" /> [KDE Plasma](https://kde.org/), and <img src="/img/desktops/cosmic.svg" width="18" /> [COSMIC](https://system76.com/cosmic) — are Wayland-first by default and round out the lineup with more mature, full-featured environments.

## What's Next

- **Build validation** — getting CI green across all 13 variants on all platforms
- **More desktops** — [Hyprland](https://hyprland.org/), [Sway](https://swaywm.org/), and [Budgie](https://buddiesofbudgie.org/) are one manifest file away
- **Cross-backend migration** — [`bootc-migrate-composefs`](https://github.com/tuna-os/bootc-migrate-composefs) `[alpha]` handles OSTree &rarr; ComposeFS in-place; cross-family migration (e.g. AlmaLinux &rarr; Arch) up next
- **Community manifests** — let anyone contribute a desktop definition without touching build scripts

## Credits

This architecture stands on the work of these projects:

- **[bootcrew](https://github.com/bootcrew/mono)** — Reference bootc implementations for Arch, Gentoo, openSUSE, and Debian
- **[jumpvi / bootc-shindig](https://github.com/bootc-shindig)** — bootc-deb packaging for Ubuntu and Debian
- **[Universal Blue](https://universal-blue.org/)** & **[Project Bluefin](https://projectbluefin.io)** — Pioneering the bootc desktop model at scale
- **[bootc](https://github.com/containers/bootc)** — The engine that makes all of this possible

---

*The distro is no longer a decision. It's a dial. Pick your fish.*
