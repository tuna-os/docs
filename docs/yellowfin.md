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

### Regular Edition
**Image:** `ghcr.io/tuna-os/yellowfin:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/yellowfin-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/yellowfin-amd64-v2.iso) 
- [arm64](https://download.tunaos.org/yellowfin-arm64.iso)

<a id="dx"></a>
### DX (Developer Experience)
**Image:** `ghcr.io/tuna-os/yellowfin-dx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/yellowfin-dx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/yellowfin-dx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/yellowfin-dx-arm64.iso)

<a id="gdx"></a>
### GDX (Graphical Developer Experience)
**Image:** `ghcr.io/tuna-os/yellowfin-gdx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/yellowfin-gdx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/yellowfin-gdx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/yellowfin-gdx-arm64.iso)

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
