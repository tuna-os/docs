---
sidebar_position: 5
---

# Bonito (Fedora)

:::tip[Visual overview]
Prefer a visual tour? See the **[Bonito overview →](/bonito)** start page.
:::

**Based on:** [Fedora 44](https://fedoraproject.org/)

Bonito is the most experimental variant of TunaOS, based on Fedora 44. It provides the latest packages, kernels, and desktop features ahead of any Enterprise Linux release.

## Who it's for

Bonito is for people who want the newest Fedora. It is a good pick for early adopters who like new software. Start here if you want the latest kernel and drivers. Do not use it for work that must stay stable.

## Why choose this variant

- Built on Fedora 44, the latest mainline Fedora.
- The newest kernel, Mesa drivers, and desktop tools.
- Choose this over stable variants when you want the newest software.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Newest software**: Fedora 44 is the base. The kernel and the userland are
the most recent available.
- **Experimental**: A playground for the newest features of the TunaOS project.
- **Baked-in Homebrew**: Standard across all TunaOS variants.
- **Flatpak First**: Tuned for a desktop where containers hold the applications.
- **Niri Support**: A modern scrollable-tiling Wayland compositor — see the [Niri Quick Start](/docs/niri-quickstart).

## Status

Bonito is **Experimental** now. We do not recommend it for production. It is good if you want to test the future of the Linux desktop.

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/bonito:gnome` |
| GNOME with the HWE (hardware enablement) kernel | `ghcr.io/tuna-os/bonito:gnome-hwe` |
| KDE Plasma | `ghcr.io/tuna-os/bonito:kde` |
| COSMIC | `ghcr.io/tuna-os/bonito:cosmic` |
| Niri | `ghcr.io/tuna-os/bonito:niri` |
| GNOME with NVIDIA drivers and CUDA | `ghcr.io/tuna-os/bonito:gnome-nvidia` |

## Install

To install Bonito on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer. For an Apple Silicon
Mac, read [Apple Silicon Macs](apple-silicon.md) first.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/bonito:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Fedora**: [Fedora Discussion](https://discussion.fedoraproject.org/)
