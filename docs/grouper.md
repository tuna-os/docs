---
sidebar_position: 6
---

# Grouper (Ubuntu)

:::tip[Visual overview]
Prefer a visual tour? See the **[Grouper overview →](/grouper)** start page.
:::

**Based on:** [Ubuntu 26.04](https://ubuntu.com/)

**Status:** Beta

Grouper brings the bootc model to the most familiar base in Linux: Ubuntu. Atomic image updates, composefs, and the same desktops as every other TunaOS variant — beta today, parity-bound tomorrow.

## Who it's for

Grouper is for Ubuntu users who want the bootc model. It is a good pick for people who test new Ubuntu work. Start here if you like the Ubuntu base but want atomic image updates.

## Why choose this variant

- Brings the bootc model to Ubuntu.
- Uses composefs for fast, safe image updates.
- Choose this over other variants when you want Ubuntu on bootc.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Test ground by design**: Where we prove the Ubuntu bootc work. It has a
  composefs root and apt-built desktops, and the newest ideas come here first.
- **Baked-in Homebrew**: Standard across all TunaOS variants.
- **Flatpak First**: Tuned for a desktop where containers hold the applications.

## Status

Grouper is in **Beta**. We publish Grouper images on [tunaos.org/download](/download) for user tests. We do not recommend Grouper for production use yet.

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/grouper:gnome` |
| KDE Plasma | `ghcr.io/tuna-os/grouper:kde` |
| Niri | `ghcr.io/tuna-os/grouper:niri` |
| XFCE | `ghcr.io/tuna-os/grouper:xfce` |

## Install

To install Grouper on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer. For an Apple Silicon
Mac, read [Apple Silicon Macs](apple-silicon.md) first.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/grouper:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Ubuntu**: [Ubuntu Discourse](https://discourse.ubuntu.com/)
