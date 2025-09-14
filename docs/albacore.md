---
sidebar_position: 2
---

# Albacore (AlmaLinux)

**Based on:** [AlmaLinux 10.0](https://almalinux.org/blog/2025-05-27-welcoming-almalinux-10/)

Stable enterprise-grade desktop experience built on AlmaLinux foundation.

## Features

- ✨ **x86_64/v2** microarchitecture support for older CPUs (pre-2013)
- 🖥️ **SPICE support** for qemu/libvirt virtualization
- 🏢 **Enterprise Linux** foundation with AlmaLinux reliability

## Downloads

### Regular Edition
**Image:** `ghcr.io/tuna-os/albacore:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-amd64-v2.iso) 
- [arm64](https://download.tunaos.org/albacore-arm64.iso)

### DX (Developer Experience)
**Image:** `ghcr.io/tuna-os/albacore-dx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-dx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-dx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/albacore-dx-arm64.iso)

### GDX (Graphical Developer Experience)
**Image:** `ghcr.io/tuna-os/albacore-gdx:latest`

**ISOs:**
- [x86_64](https://download.tunaos.org/albacore-gdx-amd64.iso)
- [x86_64_v2](https://download.tunaos.org/albacore-gdx-amd64-v2.iso)
- [arm64](https://download.tunaos.org/albacore-gdx-arm64.iso)

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/albacore:latest
```

### Building ISO
```bash
curl https://raw.githubusercontent.com/Tuna-OS/tunaOS/refs/heads/main/build-iso.sh \
-o build-bootc.sh
chmod +x build-bootc.sh

# Build Albacore ISO
sudo ./build-bootc.sh iso ghcr.io/tuna-os/albacore:latest
```

## Differences from Project Bluefin

For general functionality, refer to the [Project Bluefin Documentation](https://docs.projectbluefin.io).

AlmaLinux-specific differences:
- Based on AlmaLinux 10 instead of CentOS Stream
- Enterprise Linux package ecosystem
- For AlmaLinux-specific features, see [AlmaLinux Wiki](https://wiki.almalinux.org)

## Community Support

- **AlmaLinux**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
