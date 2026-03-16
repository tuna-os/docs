---
sidebar_position: 5
---

# Bonito (Fedora)

**Based on:** [Fedora 42](https://fedoraproject.org/)

Bonito is the most experimental variant of TunaOS, based on Fedora 42. It provides the latest packages, kernels, and desktop features ahead of any Enterprise Linux release.

## Features

- 🏎️ **Bleeding Edge**: Based on Fedora 42, with the latest possible kernel and userland.
- 🧪 **Experimental**: A playground for the newest features of the TunaOS project.
- 🍺 **Baked-in Homebrew**: Standard across all TunaOS variants.
- 📦 **Flatpak First**: Optimized for a fully containerized desktop experience.

## Status

Bonito is currently **Experimental**. It is not recommended for production use but is great for testing and experiencing the future of the Linux desktop.

## Downloads

**Image:** `ghcr.io/tuna-os/bonito:latest`

**ISOs:**
- [Experimental Builds](https://download.tunaos.org/experimental/)

## Installation

### Using Container Image
```bash
podman pull ghcr.io/tuna-os/bonito:latest
```

### Building ISO with Just
```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Bonito ISO
just build-iso bonito
```

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Fedora**: [Fedora Discussion](https://discussion.fedoraproject.org/)
