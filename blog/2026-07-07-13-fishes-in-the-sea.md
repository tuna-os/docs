---
slug: 13-fishes-in-the-sea
title: "12 Fishes in the Sea: The TunaOS Variant Landscape"
authors: [james]
tags: [vision, variants, architecture]
date: 2026-07-07
---

# 12 Fishes in the Sea: The TunaOS Variant Landscape

Picking a Linux distro has always felt weirder to me than it should be. Most of them are like 95% the same packages with 5% different defaults, and yet somehow choosing one feels like a permanent decision you're stuck with forever.

I didn't come up with this idea, to be clear. [Bedrock Linux](https://bedrocklinux.org) was mixing packages from different distros on one system back in 2012. [Lennart Poettering](https://0pointer.net/blog/fitting-everything-together.html) wrote the whole blueprint out in his mkosi posts — sysext, confext, repart, UKIs, the works. [CarbonOS](https://github.com/carbonOS) took a run at OCI image delivery with btrfs snapshots on Fedora Atomic back in 2021. And [Jessie Frazelle](https://blog.jessfraz.com) was running her whole desktop out of Docker containers in 2015, which honestly should have gotten more attention than it did. Everyone kept poking at the same idea from a different angle.

What actually made it usable were two things. [bootc](https://github.com/containers/bootc) — you get an OCI image, you `switch` to it, it's atomic, and you can roll back if you screwed something up. And [Project Bluefin](https://projectbluefin.io) proved people would actually use this every day, not just as a tech demo. Once I saw that working at scale I started wondering how far you could actually push it.

So that's what TunaOS is, I guess — pushing it. We ship 12 variants right now across 5 package managers and pretty much every major Linux family, and they all end up as the same desktop experience underneath. If you can swap the base OS out from under a desktop and nothing changes, the distro isn't really a decision anymore. It's just a setting.

<!-- truncate -->

## It's a factory, not a distro

I keep saying "TunaOS" like it's one thing, but really it's a factory that spits out images. The inputs are just data:

```text
base OS + desktop + kernel + drivers = bootable image
```

Out the other end you get an OCI image you `bootc switch` to, atomically, with rollback if it goes bad. Want a different desktop on the same base? Switch. Want a beefier kernel? Switch. The whole matrix is on the menu:

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

Cross-family migration (AlmaLinux &rarr; Arch in place, say) is on the roadmap but not there yet. Even just same-family switching already makes the base OS swappable in a way regular distros never let you do.

Under the hood it's the same stuff server folks have been using for years — [`bootc`](https://github.com/containers/bootc), CI, [Podman](https://podman.io). We're basically just treating the desktop like a container deployment. Nothing revolutionary, the server side figured this out a while ago, the desktop's just catching up.

## The variants

Everything's named after a fish, because I like fish and also because "AlmaLinux 10 + KDE + hwe kernel" is a mouthful. 12 of them right now:

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
| 🦈 [**Sailfin**](/sailfin) | <img src="/img/os/opensuse.svg" width="20" /> [openSUSE Tumbleweed](https://opensuse.org) | Production |
| 🌈 [**Guppy**](/guppy) | <img src="/img/os/gentoo.svg" width="20" /> [Gentoo Linux](https://gentoo.org) | Production |

Most variants get the same 5 desktops: <img src="/img/desktops/gnome.svg" width="18" /> [GNOME](https://www.gnome.org/), <img src="/img/desktops/kde.svg" width="18" /> [KDE Plasma](https://kde.org/), <img src="/img/desktops/cosmic.svg" width="18" /> [COSMIC](https://system76.com/cosmic), <img src="/img/desktops/niri.svg" width="18" /> [Niri](https://github.com/YaLTeR/niri) + <img src="/img/desktops/dms.svg" width="18" /> [DMS](https://github.com/avengemedia/dms), and <img src="/img/desktops/xfce.svg" width="18" /> [XFCE](https://xfce.org/) on Wayland. Guppy ships 2 (GNOME, KDE). Sailfin ships 4 (no COSMIC). Stack a custom kernel or NVIDIA drivers on top of any of them if you want.

## How this got easier

Not that long ago, adding a new base OS meant writing a few hundred lines of shell. Now it's three things:

1. A Containerfile that bootc-ifies the stock image (started from [bootcrew's base images](https://github.com/bootcrew/mono), saved me a ton of work)
2. A package manager manifest (`pacman:`, `apt:`, whatever) listing what that OS needs for each desktop
3. An entry in `build-config.yml` — name, base image, platforms

That's the whole job now. CI does the rest and spits out container images and ISOs on its own. No per-distro bash, no combinatorial mess of per-desktop-per-distro scripts to keep in sync.

## The desktops themselves

Mostly the same desktops on every variant, and none of them are built from scratch — we're layering existing customization work on top of stock packages and just running that layer across every base OS we support. Each one has an upstream project doing the actual hard work, and honestly they deserve more credit than they get.

### <img src="/img/desktops/gnome.svg" width="22" /> GNOME

GNOME already looks good out of the box, but we still pull from [Project Bluefin](https://projectbluefin.io)'s [`common`](https://github.com/projectbluefin/common) layer on top of it — dev tooling, curated Flatpaks, and just years of them running bootc desktops in the real world that we'd be dumb not to use. Every GNOME image we build, Arch or Fedora or Gentoo, gets the same Bluefin layer. They also have a distroless BuildStream build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) if you want to go further down that hole.

### <img src="/img/desktops/kde.svg" width="22" /> KDE Plasma

Plasma's look comes from [Aurora](https://github.com/get-aurora-dev/common)'s [`common`](https://github.com/get-aurora-dev/common) layer — theming and branding that makes stock Plasma actually feel like one coherent thing instead of a pile of defaults. That's what gives our KDE its look across all 12 bases. They've also got a source-based BuildStream build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) if you're into that.

### <img src="/img/desktops/niri.svg" width="22" /> Niri + <img src="/img/desktops/dms.svg" width="22" /> DMS

[Niri](https://github.com/YaLTeR/niri) is a scrollable-tiling compositor — windows line up horizontally on a ribbon you scroll through instead of stacking into workspaces. It's the odd one out in the lineup and probably the most "pure Wayland" thing we ship.

We pair it with [DMS](https://github.com/avengemedia/dms) (DankMaterialShell) for the greeter, a control panel, and app launching. So the stack is `greetd` &rarr; Niri &rarr; DMS. DMS is still pretty early but it's enough to make Niri feel like an actual desktop and not just bare windows on a ribbon.

Config and theming come from [Zirconium](https://github.com/zirconium-dev/zirconium), same deal as Bluefin and Aurora — one layer, applied everywhere. They've also got their own BuildStream build on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk).

### <img src="/img/desktops/xfce.svg" width="22" /> XFCE (Wayland)

XFCE 4.20 shipped experimental Wayland support with a new compositor, `xfwl4`, replacing the old X11 `xfwm4`. It's still maturing but it's already good enough to daily-drive on Fedora and EL10 — we ship the optional `xfce4-wayland` package and default to GDM so the Wayland session actually shows up in the login list. Basically: XFCE, but with tear-free rendering and per-monitor refresh rates now.

XFCE's the only desktop here without a dedicated customization layer — no Bluefin, no Aurora, no Zirconium equivalent. If you use XFCE and have opinions on what it should look like, [I'd take the help](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md).

### <img src="/img/desktops/cosmic.svg" width="22" /> COSMIC

[COSMIC](https://system76.com/cosmic) is System76's Rust desktop, Wayland from the ground up. We ship it mostly stock — it's already opinionated enough on its own that it doesn't really need our fingerprints on it.

Same story as XFCE — no dedicated layer yet. If you want to be the person who defines what a curated COSMIC setup looks like across every variant, [go for it](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md).

## What's next

- Getting CI actually green across all 12 variants on all platforms (we're not there yet, not going to pretend otherwise)
- More desktops — [Hyprland](https://hyprland.org/), [Sway](https://swaywm.org/), [Budgie](https://buddiesofbudgie.org/) are basically just a manifest file away at this point
- Cross-backend migration — [`bootc-migrate-composefs`](https://github.com/tuna-os/bootc-migrate-composefs) (alpha) does OSTree &rarr; ComposeFS in place, cross-family (AlmaLinux &rarr; Arch) is the next hard problem
- Letting people contribute a desktop definition without having to touch the actual build scripts

## Credit where it's due

None of this happens without a bunch of other projects doing the hard work first. If any of this is useful to you, go support the people who actually built it.

### Infra

- [bootcrew](https://github.com/bootcrew/mono) — reference bootc setups for Arch, Gentoo, openSUSE, Debian
- [jumpvi / bootc-shindig](https://github.com/bootc-shindig) — bootc-deb packaging for Ubuntu and Debian
- [Universal Blue](https://universal-blue.org/) and [Project Bluefin](https://projectbluefin.io) — did the bootc desktop thing at scale before anyone else
- [bootc](https://github.com/containers/bootc) — none of this exists without this project

### Desktop upstreams

These are the folks whose customization layers we're shipping. They did the actual work of making each desktop feel cohesive — go support them if you can.

**Project Bluefin** (GNOME): [sponsor @castrojo](https://github.com/sponsors/castrojo) · [sponsor @tulilirockz](https://github.com/sponsors/tulilirockz)

**Aurora** (KDE Plasma): [sponsor @NiHaiden](https://github.com/sponsors/NiHaiden) · [ko-fi](https://ko-fi.com/valerie-tar-gz) · [venmo](https://venmo.com/u/bri-recchia) · [ko-fi/brirec](https://ko-fi.com/brirec)

**Zirconium** (Niri): [sponsor @tulilirockz](https://github.com/sponsors/tulilirockz)

### The desktops themselves

And obviously the desktop environments are their own massive community efforts, worth supporting directly too.

- [Donate to GNOME](https://www.gnome.org/donate/)
- [Donate to KDE](https://kde.org/community/donations/)
- [Donate to XFCE](https://xfce.org/donate)
- [Sponsor Niri](https://github.com/sponsors/YaLTeR)

Full list on the [Support page](/support) if you want more ways to help out.

---

*Pick your fish. It's less of a decision than it used to be.*
