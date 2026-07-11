
---
slug: 13-fishes-in-the-sea
title: "13 Fishes in the Sea: The TunaOS Variant Landscape"
authors: [james]
tags: [vision, variants, architecture]
date: 2026-07-07
---

# 13 Fishes in the Sea: The TunaOS Variant Landscape

TunaOS now provides **13 variants** spanning 5 package managers and multiple Linux families. By leveraging image-based OS delivery, we are shifting our focus from standard distribution maintenance to software consistency. The underlying operating system functions as an interchangeable component rather than a permanent architectural lock-in.

<!-- truncate -->

## The Build Approach

Traditional distribution maintenance involves forking package sets, maintaining custom installers, and extensive manual configuration. TunaOS approaches this differently. A consistent desktop experience is generated across 13 distinct distributions using standardized container tools. 

TunaOS functions as an image builder. The pipeline takes configuration data as input:

```text
base OS + desktop + kernel + drivers = bootable image
```

The output is an OCI container image. Systems can atomically update or rollback using [`bootc`](https://github.com/containers/bootc). Building this matrix relies on a standard cloud-native stack: `bootc`, CI/CD automation, and [Podman](https://podman.io/).

## The Variants

Every TunaOS variant is named after a fish. Currently, there are 13 available images. 

| Variant | Base Distribution | Status |
| :--- | :--- | :--- |
| ðŸ  [**Yellowfin**](/yellowfin) | <img src="/img/os/almalinux.svg" width="20" /> [AlmaLinux Kitten 10](https://almalinux.org) | Production |
| ðŸŸ [**Albacore**](/albacore) | <img src="/img/os/almalinux.svg" width="20" /> [AlmaLinux 10](https://almalinux.org) | Production |
| ðŸ£ [**Skipjack**](/skipjack) | <img src="/img/os/centos.svg" width="20" /> [CentOS Stream 10](https://centos.org) | Production |
| ðŸ”’ [**Redfin**](/redfin) | <img src="/img/os/rhel.svg" width="20" /> [RHEL 10](https://redhat.com) | Local-build |
| ðŸŽ£ [**Bonito**](/bonito) | <img src="/img/os/fedora.svg" width="20" /> [Fedora 44](https://fedoraproject.org) | Production |
| ðŸ‰ [**Bonito Rawhide**](/bonito-rawhide) | <img src="/img/os/fedora.svg" width="20" /> [Fedora Rawhide](https://fedoraproject.org) | Production |
| ðŸŸ [**Grouper**](/grouper) | <img src="/img/os/ubuntu.svg" width="20" /> [Ubuntu 26.04](https://ubuntu.com) | Experimental |
| ðŸ¡ [**Flounder**](/flounder) | <img src="/img/os/debian.svg" width="20" /> [Debian Trixie (13)](https://debian.org) | Production |
| â˜¢ï¸ [**Flounder Sid**](/flounder-sid) | <img src="/img/os/debian.svg" width="20" /> [Debian Sid](https://debian.org) | Production |
| ðŸš€ [**Marlin**](/marlin) | <img src="/img/os/arch.svg" width="20" /> [Arch Linux](https://archlinux.org) | Production |
| ðŸŸ [**Wahoo**](/wahoo) | <img src="/img/os/cachyos.svg" width="20" /> [CachyOS](https://cachyos.org) | Experimental |
| ðŸ¦Ž [**Sailfin**](/sailfin) | <img src="/img/os/opensuse.svg" width="20" /> [openSUSE Tumbleweed](https://opensuse.org) | Production |
| ðŸ§ [**Guppy**](/guppy) | <img src="/img/os/gentoo.svg" width="20" /> [Gentoo Linux](https://gentoo.org) | Production |

Each variant supports **5 desktops**: [GNOME](https://www.gnome.org/), [KDE Plasma](https://kde.org/), [COSMIC](https://system76.com/cosmic), [Niri](https://github.com/YaLTeR/niri), and [XFCE](https://xfce.org/). Custom kernels or NVIDIA drivers can be layered onto any of these environments.

## Implementation Details

Integrating a new base OS into TunaOS requires three components:

1. **A Containerfile** to define the `ostree` filesystem layout. These are currently adapted from [bootcrew's base images](https://github.com/bootcrew/mono).
2. **A package manager manifest** (e.g., `pacman:` or `apt:`) defining the desktop components for that OS.
3. **A configuration entry** in `build-config.yml` detailing the variant name, base image, and target platforms.

Once defined, the CI pipeline automatically produces the required container images and bootable ISOs. 

## Moving Between Variants

Because the base OS is delivered as a container image, users are not permanently locked into their initial distribution choice. Tooling to easily migrate between base variants (for instance, switching from an AlmaLinux base to an Arch base in-place) is actively being developed via `bootc-migrator`.

## What's Next

- **Build validation:** Ensuring CI passes reliably for all variants across supported platforms.
- **Desktop expansion:** Adding support for [Hyprland](https://hyprland.org/), [Sway](https://swaywm.org/), and [Budgie](https://buddiesofbudgie.org/). 
- **Community manifests:** Standardizing the build process so users can submit desktop definitions without altering core build scripts.

## Credits

This architecture relies on upstream work from the following projects:

- **[bootcrew](https://github.com/bootcrew/mono)** â€” Reference bootc implementations for Arch, Gentoo, openSUSE, and Debian.
- **[jumpvi / bootc-shindig](https://github.com/bootc-shindig)** â€” bootc-deb packaging for Ubuntu and Debian.
- **[Universal Blue](https://universal-blue.org/)** & **[Project Bluefin](https://projectbluefin.io)** â€” Pioneering the bootc desktop model at scale.
- **[bootc](https://github.com/containers/bootc)** â€” The foundational engine for image-based OS delivery.