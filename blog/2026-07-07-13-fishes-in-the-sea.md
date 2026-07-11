---
slug: 13-fishes-in-the-sea
title: "13 Fishes in the Sea: The TunaOS Variant Landscape"
authors: [james]
tags: [vision, variants, architecture]
date: 2026-07-07
---

# 13 Fishes in the Sea: The TunaOS Variant Landscape

For too long, the Linux desktop has been held back by fragmentation. Hundreds of distros that are 95% the same packages with 5% different defaults — and picking one felt like a permanent, load-bearing architecture decision.

This isn't a new observation. [**Bedrock Linux**](https://bedrocklinux.org) proved in 2012 that packages from different distros could coexist on the same system. A decade later, [**CarbonOS**](https://github.com/carbonOS) — Adrian Vovk's 2021 experiment built on Fedora Atomic and systemd's immutable-OS ideals — pushed further toward OCI image delivery with btrfs snapshots. Vovk's ideas around systemd-sysext and image-based delivery went on to shape much of what Universal Blue and bootc build on today. And back in 2015, [**Jessie Frazelle**](https://blog.jessfraz.com) famously ran her entire desktop out of Docker containers, proving the "container as OS boundary" model worked for real daily use. Each of these poked a hole in the distro fallacy. TunaOS is what happens when you connect all the holes.

TunaOS rejects the old model. Today we ship **13 variants** spanning 5 package managers and every major Linux family, all producing a completely consistent desktop experience. The proof is in the matrix: when you can switch base OS underneath the same desktop without changing a thing, the distro stops being a decision and becomes a dial.

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

Every variant ships the same five desktop environments. TunaOS doesn't build these experiences from scratch — we layer upstream quality customizations on top of stock packages, then multiply those experiences across every base OS in the matrix. Each desktop has an upstream project we pull from, and we're grateful for the craftsmanship they bring.

### <img src="/img/desktops/gnome.svg" width="22" /> GNOME

GNOME's defaults are polished out of the box, but TunaOS goes further by pulling from [**Project Bluefin**](https://projectbluefin.io)'s [`common`](https://github.com/projectbluefin/common) layer. Bluefin brings developer-quality-of-life tooling, curated Flatpak defaults, and years of bootc desktop operational experience. Every TunaOS GNOME image — whether on Arch, Fedora, or Gentoo — ships the same Bluefin-derived experience. For those ready to go further, Bluefin also maintains a distroless BuildStream build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk).

### <img src="/img/desktops/kde.svg" width="22" /> KDE Plasma

KDE Plasma gets its identity from [**Aurora**](https://github.com/get-aurora-dev/common)'s [`common`](https://github.com/get-aurora-dev/common) layer — the theming, branding, and visual cohesion that turns stock Plasma into something that looks like it belongs together. Aurora's customizations are what give TunaOS KDE its distinct look across all 13 base distributions. Aurora also offers a distroless BuildStream build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) for a fully source-based KDE experience.

### <img src="/img/desktops/niri.svg" width="22" /> Niri + <img src="/img/desktops/dms.svg" width="22" /> DMS

[Niri](https://github.com/YaLTeR/niri) is a scrollable-tiling Wayland compositor — windows tile horizontally on an infinite ribbon you scroll through, rather than stacking in workspaces. It's the most unusual DE in the lineup and the one that most purely commits to Wayland's protocol model.

TunaOS pairs Niri with **[DMS](https://github.com/avengemedia/dms)** (DankMaterialShell), a desktop shell that layers greeter integration, a CLI control panel, and application launching on top of Niri. The full stack is `greetd` (display manager) &rarr; Niri (compositor) &rarr; DMS (shell). DMS is still early-stage but gives Niri a cohesive desktop experience beyond bare windows.

The Niri configuration, theming, and defaults we ship come from **[Zirconium](https://github.com/zirconium-dev/zirconium)** — TunaOS pulls from Zirconium's common layer to deliver the same polished Niri experience across every base. Zirconium also maintains its own distroless build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) with BuildStream.

### <img src="/img/desktops/xfce.svg" width="22" /> XFCE (Wayland)

XFCE 4.20 introduced experimental Wayland support via its new compositor `xfwl4`, replacing the X11-era `xfwm4`. While the Wayland session is still maturing, it already works well enough for daily driving on Fedora and EL10 — TunaOS ships the optional `xfce4-wayland` package and defaults to GDM as the display manager to ensure the Wayland session is discoverable. Think of it as "XFCE, but with tear-free rendering and per-monitor refresh rates."

XFCE is the only desktop in the lineup without a dedicated upstream customization layer — no Bluefin, no Aurora, no Zirconium. If you're passionate about XFCE and want to define what a polished, modern XFCE experience looks like across every distro, **[contributions are welcome](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md)**.

### <img src="/img/desktops/cosmic.svg" width="22" /> COSMIC

[COSMIC](https://system76.com/cosmic) is System76's Rust-based desktop, Wayland-first by design. The stock COSMIC experience ships as-is — it's already opinionated and cohesive enough to stand on its own.

Like XFCE, COSMIC doesn't yet have a dedicated upstream customization layer. If you're excited about shaping a curated COSMIC experience that spans every TunaOS variant, **[contributions are welcome](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md)**.

## What's Next

- **Build validation** — getting CI green across all 13 variants on all platforms
- **More desktops** — [Hyprland](https://hyprland.org/), [Sway](https://swaywm.org/), and [Budgie](https://buddiesofbudgie.org/) are one manifest file away
- **Cross-backend migration** — [`bootc-migrate-composefs`](https://github.com/tuna-os/bootc-migrate-composefs) `[alpha]` handles OSTree &rarr; ComposeFS in-place; cross-family migration (e.g. AlmaLinux &rarr; Arch) up next
- **Community manifests** — let anyone contribute a desktop definition without touching build scripts

## Credits

TunaOS stands on the shoulders of these projects. If you find value in what we do, consider supporting the people who make it possible.

### Infrastructure

- **[bootcrew](https://github.com/bootcrew/mono)** — Reference bootc implementations for Arch, Gentoo, openSUSE, and Debian
- **[jumpvi / bootc-shindig](https://github.com/bootc-shindig)** — bootc-deb packaging for Ubuntu and Debian
- **[Universal Blue](https://universal-blue.org/)** & **[Project Bluefin](https://projectbluefin.io)** — Pioneering the bootc desktop model at scale
- **[bootc](https://github.com/containers/bootc)** — The engine that makes all of this possible

### Desktop Upstreams

These are the projects whose customization layers we ship across every variant. They put in the work to make each desktop look and feel cohesive — please support them.

**Project Bluefin** (GNOME): [sponsor @castrojo](https://github.com/sponsors/castrojo) · [sponsor @tulilirockz](https://github.com/sponsors/tulilirockz)

**Aurora** (KDE Plasma): [sponsor @NiHaiden](https://github.com/sponsors/NiHaiden) · [ko-fi](https://ko-fi.com/valerie-tar-gz) · [venmo](https://venmo.com/u/bri-recchia) · [ko-fi/brirec](https://ko-fi.com/brirec)

**Zirconium** (Niri): [sponsor @tulilirockz](https://github.com/sponsors/tulilirockz)

### Desktop Environments

The desktops themselves are monumental community efforts worth supporting directly.

- [Donate to GNOME](https://www.gnome.org/donate/)
- [Donate to KDE](https://kde.org/community/donations/)
- [Donate to XFCE](https://xfce.org/donate)
- [Sponsor Niri](https://github.com/sponsors/YaLTeR)

See our **[Support page](/support)** for a full list of ways to contribute.

---

*The distro is no longer a decision. It's a dial. Pick your fish.*
