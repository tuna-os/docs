---
sidebar_position: 2
---

# Albacore (AlmaLinux)

:::tip[Visual overview]
Prefer a visual tour? See the **[Albacore overview →](/albacore)** start page.
:::

**Based on:** [AlmaLinux 10.0](https://almalinux.org/blog/2025-05-27-welcoming-almalinux-10/)

Albacore is the flagship stable variant of TunaOS. It gives a solid desktop for the enterprise, experience built on the AlmaLinux foundation.

## Who it's for

Albacore is for people who want a stable desktop for work. It is a good pick for teams that need a system that works for many years. Start here if you want a daily driver you can trust.

## Why choose this variant

- Most stable TunaOS variant.
- Ten-year support from AlmaLinux.
- Best for work that must not break.
- Choose this over newer variants when you value stability over new packages.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- **Microarchitecture Support**: Optimized builds for `x86_64_v2` (older CPUs).
- **HWE Variant**: Hardware Enablement kernel for the latest laptops and workstations.
- **10-Year Lifecycle**: Benefit from the long-term support of AlmaLinux 10.

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/albacore:gnome` |
| GNOME with the HWE (hardware enablement) kernel | `ghcr.io/tuna-os/albacore:gnome-hwe` |
| KDE Plasma | `ghcr.io/tuna-os/albacore:kde` |
| COSMIC | `ghcr.io/tuna-os/albacore:cosmic` |
| Niri | `ghcr.io/tuna-os/albacore:niri` |
| GNOME with NVIDIA drivers and CUDA | `ghcr.io/tuna-os/albacore:gnome-nvidia` |

## Install

To install Albacore on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/albacore:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Bazzite (Universal Blue)**: [Bazzite Discord](https://discord.gg/WEu6BdFEtp)
