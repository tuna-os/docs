---
sidebar_position: 6
---

# Grouper (Ubuntu)

:::tip[Visual overview]
Prefer a visual tour? See the **[Grouper overview →](/grouper)** landing page.
:::

**Based on:** [Ubuntu 26.04](https://ubuntu.com/)

Grouper brings the bootc model to the most familiar base in Linux: Ubuntu. Atomic image updates, composefs, and the same desktops as every other TunaOS variant — experimental today, parity-bound tomorrow.

## Features

- 🧪 **Experimental by design**: The proving ground for the Ubuntu bootc story — composefs root, apt-built desktops, and the newest ideas land here first.
- 🍺 **Baked-in Homebrew**: Standard across all TunaOS variants.
- 📦 **Flatpak First**: Optimized for a fully containerized desktop experience.

## Status

Grouper is currently **Experimental**. It is not recommended for production use but is the proving ground for the Ubuntu bootc story.

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
