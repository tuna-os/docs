---
sidebar_position: 9
---

# Marlin (Arch Linux)

:::tip[Visual overview]
Prefer a visual tour? See the **[Marlin overview →](/marlin)** start page.
:::

**Based on:** [Arch Linux](https://archlinux.org/) (continuous updates, no fixed releases)

**Status:** Beta

Marlin is the TunaOS variant that follows Arch Linux, which updates
continuously and has no fixed releases. Arch ships upstream packages with
almost no delay, so Marlin has the newest GNOME, KDE Plasma, and kernel
builds in the catalog. In exchange, it does not give the stability guarantees
of the Enterprise Linux variants (Albacore and Yellowfin). Arch has no bootc
package yet, so Marlin builds bootc from source in the image.

## Who it's for

Marlin is for Arch users who want the newest packages. It is a good pick for power users who want updates often. Start here if you want the latest GNOME and kernel with no wait.

## Why choose this variant

- Follows Arch Linux, so packages arrive with no delay.
- The newest GNOME, KDE, and kernel in the catalog.
- Choose this over stable variants when you want everything new. It is Beta, so keep a backup before you update.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Continuous updates**: Marlin gets new Arch packages with no backport delay.
- **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- **CachyOS kernel overlay**: Optional `-cachyos` flavors add the
  performance-tuned CachyOS kernel on top of the standard Arch base.
- **NVIDIA support**: `-nvidia` flavors add `nvidia-open-dkms` via pacman +
  dkms (Arch has no akmods/RPM equivalent).

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/marlin:gnome` |
| KDE Plasma | `ghcr.io/tuna-os/marlin:kde` |
| COSMIC | `ghcr.io/tuna-os/marlin:cosmic` |
| Niri | `ghcr.io/tuna-os/marlin:niri` |
| XFCE | `ghcr.io/tuna-os/marlin:xfce` |

Add `-cachyos` to a desktop tag for the CachyOS kernel, for example
`:gnome-cachyos`. Add `-nvidia` for the NVIDIA drivers and CUDA, for example
`:gnome-nvidia`.

:::note[Apple Silicon]
TunaOS publishes a `gnome-asahi` image, but it is **not** a supported way to
run Marlin on Apple Silicon. The upstream `asahi-alarm` kernel package gives
only 5 device trees and no GPU driver module. So the image does not boot on
Apple Silicon
([tuna-os#911](https://github.com/tuna-os/tunaOS/issues/911)). TunaOS is
not available for Apple Silicon Macs yet: see
[Apple Silicon Macs](apple-silicon.md).
:::

## Install

To install Marlin on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/marlin:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Known limitations

- **No disk encryption**: Marlin has no LUKS with TPM2 auto-unlock today.
  Arch's `pacman` has no `tpm2-tools` or `tpm2-tss` package, so the dracut
  TPM2 probe finds nothing. See
  [tuna-os#714](https://github.com/tuna-os/tunaOS/issues/714).
- **Apple Silicon (`gnome-asahi`)**: see the note above and
  [Apple Silicon Macs](apple-silicon.md).

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Arch Linux**: [Arch Linux Forums](https://bbs.archlinux.org/)
- **Bazzite (Universal Blue)**: [Bazzite Discord](https://discord.gg/WEu6BdFEtp)
