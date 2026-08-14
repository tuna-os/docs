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

## Features

- 🚀 **Continuous updates**: Marlin gets new Arch packages with no backport delay.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- ⚡ **CachyOS kernel overlay**: Optional `-cachyos` flavors add the
  performance-tuned CachyOS kernel on top of the standard Arch base.
- 🎮 **NVIDIA support**: `-nvidia` flavors add `nvidia-open-dkms` via pacman +
  dkms (Arch has no akmods/RPM equivalent).

## Downloads

TunaOS publishes its pre-built ISOs for the GNOME and KDE flavors. Other
flavors are available as container images only.

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
TunaOS publishes a `gnome-asahi` image, but it is **not** a supported way to
run Marlin on Apple Silicon. The upstream `asahi-alarm` kernel package gives
only 5 device trees and no GPU driver module. So the image does not boot on
Apple Silicon
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

- **No disk encryption**: Marlin has no LUKS with TPM2 auto-unlock today.
  Arch's `pacman` has no `tpm2-tools` or `tpm2-tss` package, so the dracut
  TPM2 probe finds nothing. See
  [tuna-os/tunaOS#714](https://github.com/tuna-os/tunaOS/issues/714).
- **Apple Silicon (`gnome-asahi`)**: see the note above; use
  [bootc-installer-asahi](https://github.com/tuna-os/bootc-installer-asahi)
  instead.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Arch Linux**: [Arch Linux Forums](https://bbs.archlinux.org/)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
