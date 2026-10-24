---
sidebar_position: 6
---

# Grouper (Ubuntu)

:::tip[Visual overview]
Prefer a visual tour? See the **[Grouper overview →](/grouper)** start page.
:::

**Based on:** [Ubuntu 26.04](https://ubuntu.com/)

**Status:** Beta

Grouper brings the bootc model to the most familiar base in Linux: Ubuntu. Atomic image updates, composefs, and the same desktops as every other TunaOS variant — beta today, parity-bound tomorrow.

## Features

- **Test ground by design**: Where we prove the Ubuntu bootc work. It has a
  composefs root and apt-built desktops, and the newest ideas come here first.
- **Baked-in Homebrew**: Standard across all TunaOS variants.
- **Flatpak First**: Tuned for a desktop where containers hold the applications.

## Status

Grouper is in **Beta**. We publish Grouper images on [tunaos.org/download](/download) for user tests. We do not recommend Grouper for production use yet.

## Downloads

**Images:**

- `ghcr.io/tuna-os/grouper:gnome`
- `ghcr.io/tuna-os/grouper:kde`
- `ghcr.io/tuna-os/grouper:niri`
- `ghcr.io/tuna-os/grouper:xfce`

## Installation

### Using Container Image

```bash
podman pull ghcr.io/tuna-os/grouper:gnome
```

### Building ISO with Just

```bash
# Clone the repo
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS

# Build Grouper ISO
just build-iso grouper
```

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **Ubuntu**: [Ubuntu Discourse](https://discourse.ubuntu.com/)
