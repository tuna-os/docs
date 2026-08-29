---
sidebar_position: 5
---

# Bonito (Fedora)

:::tip[Visual overview]
Prefer a visual tour? See the **[Bonito overview →](/bonito)** start page.
:::

**Based on:** [Fedora 44](https://fedoraproject.org/)

Bonito is the most experimental variant of TunaOS, based on Fedora 44. It provides the latest packages, kernels, and desktop features ahead of any Enterprise Linux release.

## Features

- 🏎️ **Newest software**: Fedora 44 is the base. The kernel and the userland are
the most recent available.
- 🧪 **Experimental**: A playground for the newest features of the TunaOS project.
- 🍺 **Baked-in Homebrew**: Standard across all TunaOS variants.
- 📦 **Flatpak First**: Tuned for a desktop where containers hold the applications.
- ⚡ **Niri Support**: A modern scrollable-tiling Wayland compositor — see the [Niri Quick Start](/docs/niri-quickstart).

## Status

Bonito is **Experimental** now. We do not recommend it for production. It is good if you want to test the future of the Linux desktop.

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
