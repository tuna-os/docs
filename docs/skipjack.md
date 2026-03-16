---
sidebar_position: 4
---

# Skipjack (CentOS)

**Based on:** [CentOS Stream 10](https://www.centos.org/centos-stream-10/)

Skipjack is the upstream-tracking variant of TunaOS based on CentOS Stream 10. It serves as a testing ground for features that will eventually land in RHEL and AlmaLinux.

## Features

- 🖥️ **GNOME 48.3**: Modern desktop backported to Enterprise Linux.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- 🌊 **CentOS Stream 10**: The cutting-edge of the RHEL ecosystem.
- 🛠️ **Developer Focus**: Ideal for developers who want to stay ahead of the enterprise curve.

## Downloads

Skipjack is currently in active development. Pre-built ISOs are periodically available.

**Image:** `ghcr.io/tuna-os/skipjack:latest`

**ISOs:**
- [Check Latest Builds](https://download.tunaos.org/)

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/skipjack:latest
```

### Building ISO with Just
```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Skipjack ISO
just build-iso skipjack
```

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **CentOS Community**: [CentOS Forums](https://forums.centos.org/)
