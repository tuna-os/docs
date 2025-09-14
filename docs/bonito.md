---
sidebar_position: 4
---

# Bonito (Fedora)

**Based on:** Fedora 42

Cutting-edge experience with Bluefin LTS tooling ported to the latest Fedora release.

:::note Development Status
Bonito is still needing some work to get into a functional state. Check the [GitHub repository](https://github.com/tuna-os/tunaOS) for current progress.
:::

## Features

- 🚀 **Latest Fedora** with cutting-edge packages
- 🔄 **Bluefin LTS tooling** ported to modern Fedora
- ⚡ **Pure bootc** implementation (unlike upstream Bluefin)

## Downloads

### Regular Edition
**Image:** `ghcr.io/tuna-os/bonito:latest`

**ISOs:** *Coming soon - check back for updates*

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/bonito:latest
```

### Building ISO
```bash
curl https://raw.githubusercontent.com/Tuna-OS/tunaOS/refs/heads/main/build-iso.sh \
-o build-bootc.sh
chmod +x build-bootc.sh

# Build Bonito ISO (when available)
sudo ./build-bootc.sh iso ghcr.io/tuna-os/bonito:latest
```

## Differences from Project Bluefin

Bonito represents an experimental approach:

- **Pure bootc**: Unlike upstream Bluefin which uses ostree, Bonito is built entirely on bootc
- **Fedora 42 base**: Latest and greatest Fedora packages
- **Modern toolchain**: Cutting-edge development environment

For general Bluefin functionality, refer to the [Project Bluefin Documentation](https://docs.projectbluefin.io).

## Development Status

This variant is under active development. Contributions welcome! Track progress:

- **Issues**: [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
- **Source**: [GitHub Repository](https://github.com/tuna-os/tunaOS)

## Community Support

- **Fedora**: [Fedora Discussion](https://discussion.fedoraproject.org/)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)