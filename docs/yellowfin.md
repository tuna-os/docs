---
sidebar_position: 3
---

# Yellowfin (AlmaLinux Kitten)

**Based on:** [AlmaLinux Kitten 10](https://wiki.almalinux.org/development/almalinux-os-kitten-10.html#container-images)

The closest to upstream Bluefin LTS experience with enhanced capabilities.

## Features

- ✨ **x86_64/v2** microarchitecture support for older CPUs (pre-2013)
- 🖥️ **SPICE support** for qemu/libvirt virtualization
- 🔄 **Compatible with upstream LTS** because Kitten is based on CentOS

## Downloads

### Regular Edition
**Image:** `ghcr.io/tuna-os/yellowfin:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/yellowfin-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/yellowfin-amd64-v2.iso) 
- [arm64](https://download.tunaos.org/yellowfin-arm64.iso)

### DX (Developer Experience)
**Image:** `ghcr.io/tuna-os/yellowfin-dx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/yellowfin-dx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/yellowfin-dx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/yellowfin-dx-arm64.iso)

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

### Building ISO
```bash
curl https://raw.githubusercontent.com/Tuna-OS/tunaOS/refs/heads/main/build-iso.sh \
-o build-bootc.sh
chmod +x build-bootc.sh

# Build Yellowfin ISO
sudo ./build-bootc.sh iso ghcr.io/tuna-os/yellowfin:latest
```

## AlmaLinux Kitten Differences

Yellowfin is based on AlmaLinux Kitten 10, which provides:

- **CentOS Stream compatibility**: Kitten tracks CentOS Stream more closely than regular AlmaLinux
- **Upstream compatibility**: Better alignment with Bluefin LTS expectations
- **Updated packages**: More frequent updates aligned with upstream development

For detailed information about AlmaLinux Kitten differences, see: 
[AlmaLinux Kitten 10 Documentation](https://wiki.almalinux.org/development/almalinux-os-kitten-10.html#how-is-almalinux-os-kitten-different-from-centos-stream)

## Differences from Project Bluefin

For general functionality, refer to the [Project Bluefin Documentation](https://docs.projectbluefin.io).

Yellowfin maintains maximum compatibility with upstream Bluefin LTS while providing the AlmaLinux ecosystem benefits.

## Community Support

- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)