---
sidebar_position: 9
---

# Marlin (Arch Linux)

:::tip[Visual overview]
Prefer a visual tour? See the **[Marlin overview →](/marlin)** start page.
:::

**Based on:** [Arch Linux](https://archlinux.org/) (rolling release)

**Status:** Beta

Marlin is TunaOS's rolling-release variant, built on Arch Linux. Because Arch
ships upstream packages with essentially no delay, Marlin runs the newest
GNOME, KDE Plasma, and kernel builds in the catalog — at the cost of the
stability guarantees the Enterprise Linux variants (Albacore, Yellowfin)
provide. bootc itself isn't packaged for Arch yet, so Marlin builds it from
source as part of the image.

## Features

- 🚀 **Rolling release**: Tracks Arch Linux directly — no backport lag.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- ⚡ **CachyOS kernel overlay**: Optional `-cachyos` flavors add the
  performance-tuned CachyOS kernel on top of the standard Arch base.
- 🎮 **NVIDIA support**: `-nvidia` flavors add `nvidia-open-dkms` via pacman +
  dkms (Arch has no akmods/RPM equivalent).

## Downloads

TunaOS publishes pre-built ISOs for the GNOME and KDE flavors. Other flavors
are available as container images only.

### GNOME (Standard)
**Image:** `ghcr.io/tuna-os/marlin:gnome`

**ISOs:** [marlin-gnome-latest.iso](https://download.tunaos.org/live-isos/marlin-gnome-latest.iso)

<a id="kde"></a>
### KDE Plasma
**Image:** `ghcr.io/tuna-os/marlin:kde`

**ISOs:** [marlin-kde-latest.iso](https://download.tunaos.org/live-isos/marlin-kde-latest.iso)

<a id="cosmic"></a>
### COSMIC
**Image:** `ghcr.io/tuna-os/marlin:cosmic`

<a id="niri"></a>
### Niri
**Image:** `ghcr.io/tuna-os/marlin:niri`

<a id="xfce"></a>
### XFCE
**Image:** `ghcr.io/tuna-os/marlin:xfce`

<a id="cachyos"></a>
### CachyOS kernel overlay
Adds the CachyOS performance-tuned kernel on top of any desktop flavor above.

**Images:** `ghcr.io/tuna-os/marlin:gnome-cachyos`, `:kde-cachyos`, `:cosmic-cachyos`, `:niri-cachyos`, `:xfce-cachyos`

<a id="nvidia"></a>
### NVIDIA (NVIDIA drivers + CUDA)
Adds `nvidia-open-dkms` and CUDA for AI, graphics, and VFX workloads, via pacman + dkms.

**Images:** `ghcr.io/tuna-os/marlin:gnome-nvidia`, `:kde-nvidia`, `:cosmic-nvidia`, `:niri-nvidia`, `:xfce-nvidia`

:::note[Apple Silicon]
A `gnome-asahi` image is published but is **not** a supported way to run
Marlin on Apple Silicon: the upstream `asahi-alarm` kernel package it
depends on ships only 5 device trees and is missing the GPU driver module,
so the image doesn't boot on real Apple Silicon hardware
([tuna-os/tunaOS#911](https://github.com/tuna-os/tunaOS/issues/911)). For
Apple Silicon, use [bootc-installer-asahi](https://github.com/tuna-os/bootc-installer-asahi)
with a supported variant instead.
:::

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/marlin:latest
```

### Building ISO with Just
```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Marlin ISO
just build-iso marlin
```

## Known limitations

- **Disk encryption (LUKS + TPM2 auto-unlock)** is not available on Marlin
  today: Arch's `pacman` has no `tpm2-tools`/`tpm2-tss` package, so the
  dracut TPM2 probe finds nothing and the module is omitted
  ([tuna-os/tunaOS#714](https://github.com/tuna-os/tunaOS/issues/714)).
- **Apple Silicon (`gnome-asahi`)** is unsupported — see the note above.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Arch Linux**: [Arch Linux Forums](https://bbs.archlinux.org/)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
