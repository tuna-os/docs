---
sidebar_position: 4
---

# Skipjack (CentOS)

:::tip[Visual overview]
Prefer a visual tour? See the **[Skipjack overview →](/skipjack)** start page.
:::

**Based on:** [CentOS Stream 10](https://www.centos.org/centos-stream-10/)

Skipjack is the TunaOS variant that follows upstream. CentOS Stream 10 is its
base. It is where we test the features that go into RHEL and AlmaLinux later.

## Features

- 🖥️ **Modern GNOME**: A current GNOME desktop on Enterprise Linux, with GNOME 50 available via the `gnome50` image.
- 🍺 **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- 🌊 **CentOS Stream 10**: The newest part of the RHEL ecosystem.
- 🛠️ **Developer Focus**: Ideal for developers who want to stay ahead of the enterprise curve.

## Downloads

Skipjack is in active development now. Pre-built ISOs are periodically available.

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
