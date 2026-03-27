---
sidebar_position: 3
---

# Yellowfin (AlmaLinux Kitten)

**Based on:** [AlmaLinux Kitten 10](https://almalinux.org/blog/2024-11-20-introducing-almalinux-kitten-10/)

Yellowfin is the "developer's daily drive" variant of TunaOS. It tracks AlmaLinux Kitten, which is the upstream-tracking, more experimental branch of AlmaLinux. This variant is closest to the upstream Bluefin LTS experience.

## Features

- 🖥️ **GNOME 48.3**: Modern desktop backported to Enterprise Linux.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- ✨ **Microarchitecture Support**: Optimized builds for `x86_64_v2` (older CPUs).
- 🐱 **Kitten Base**: Enjoy newer packages and features before they land in stable EL.
- 🚀 **Lead Developer's Choice**: The variant used for daily development of TunaOS.

## Downloads

Pre-built ISOs are published every two weeks for GNOME flavors. Other flavors are available as container images only.

### GNOME (Standard)
**Image:** `ghcr.io/tuna-os/yellowfin:gnome`

**ISOs:** [yellowfin-gnome-latest.iso](https://download.tunaos.org/live-isos/yellowfin-gnome-latest.iso)

<a id="gnome-hwe"></a>
### GNOME (HWE — Hardware Enablement)
**Image:** `ghcr.io/tuna-os/yellowfin:gnome-hwe`

**ISOs:** [yellowfin-gnome-hwe-latest.iso](https://download.tunaos.org/live-isos/yellowfin-gnome-hwe-latest.iso)

<a id="kde"></a>
### KDE Plasma
**Image:** `ghcr.io/tuna-os/yellowfin:kde`

<a id="cosmic"></a>
### COSMIC
**Image:** `ghcr.io/tuna-os/yellowfin:cosmic`

<a id="niri"></a>
### Niri
**Image:** `ghcr.io/tuna-os/yellowfin:niri`

<a id="gnome50"></a>
### GNOME 50
**Image:** `ghcr.io/tuna-os/yellowfin:gnome50`

<a id="dx"></a>
### DX (Developer Experience)
**Image:** `ghcr.io/tuna-os/yellowfin:gnome-dx`

<a id="gdx"></a>
### GDX (Graphical Developer Experience)
**Image:** `ghcr.io/tuna-os/yellowfin:gnome-gdx`

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/yellowfin:latest
```

### Building ISO with Just
```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Yellowfin ISO
just build-iso yellowfin
```

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
