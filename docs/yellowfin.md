---
sidebar_position: 3
---

# Yellowfin (AlmaLinux Kitten)

:::tip[Visual overview]
Prefer a visual tour? See the **[Yellowfin overview →](/yellowfin)** start page.
:::

**Based on:** [AlmaLinux Kitten 10](https://wiki.almalinux.org/development/almalinux-os-kitten-10.html)

Yellowfin is the "developer's daily drive" variant of TunaOS. It tracks AlmaLinux Kitten, the more experimental branch of AlmaLinux that follows upstream more closely. This variant is closest to the experience of upstream Bluefin LTS.

## Who it's for

Yellowfin is for developers who want new packages on a stable base. It is the daily driver the TunaOS team uses to build TunaOS. Pick this if you want fresh software without a risky base.

## Why choose this variant

- Newer packages than Albacore, on the same enterprise base.
- The daily driver for TunaOS developers.
- A good pick when Albacore is too slow to update.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- **Microarchitecture Support**: Optimized builds for `x86_64_v2` (older CPUs).
- **Kitten Base**: Enjoy newer packages and features before they land in stable EL.
- **Lead Developer's Choice**: The variant used for daily development of TunaOS.

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/yellowfin:gnome` |
| GNOME with the HWE (hardware enablement) kernel | `ghcr.io/tuna-os/yellowfin:gnome-hwe` |
| KDE Plasma | `ghcr.io/tuna-os/yellowfin:kde` |
| COSMIC | `ghcr.io/tuna-os/yellowfin:cosmic` |
| Niri | `ghcr.io/tuna-os/yellowfin:niri` |
| GNOME with NVIDIA drivers and CUDA | `ghcr.io/tuna-os/yellowfin:gnome-nvidia` |

## Install

To install Yellowfin on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/yellowfin:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Bazzite (Universal Blue)**: [Bazzite Discord](https://discord.gg/WEu6BdFEtp)
