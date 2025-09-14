---
sidebar_position: 5
---

# Skipjack (CentOS)

**Based on:** CentOS 10

CentOS-based variant providing a stable enterprise foundation.

:::note Development Status
This variant is currently under development. Check the [GitHub repository](https://github.com/tuna-os/tunaOS) for current progress.
:::

## Features

- 🏢 **CentOS 10** enterprise foundation
- 🔄 **Bootc-based** modern container approach
- 🛡️ **Enterprise stability** with modern tooling

## Downloads

### Regular Edition
**Image:** `ghcr.io/tuna-os/skipjack:latest`

**ISOs:** *Coming soon - check back for updates*

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/skipjack:latest
```

### Building ISO
```bash
curl https://raw.githubusercontent.com/Tuna-OS/tunaOS/refs/heads/main/build-iso.sh \
-o build-bootc.sh
chmod +x build-bootc.sh

# Build Skipjack ISO (when available)
sudo ./build-bootc.sh iso ghcr.io/tuna-os/skipjack:latest
```

## Differences from Project Bluefin

For general functionality, refer to the [Project Bluefin Documentation](https://docs.projectbluefin.io).

CentOS-specific features:
- Based on CentOS 10 stream packages
- Enterprise Linux ecosystem compatibility
- Upstream CentOS development alignment

## Development Status

This variant is under active development. Contributions welcome! Track progress:

- **Issues**: [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
- **Source**: [GitHub Repository](https://github.com/tuna-os/tunaOS)

## Community Support

- **CentOS**: [CentOS Stream Discussion](https://forums.centos.org/)
- **Universal Blue**: [Discord Community](https://discord.gg/WEu6BdFEtp)
- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)