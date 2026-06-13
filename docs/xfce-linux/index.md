---
sidebar_position: 1
sidebar_label: "XFCE Linux"
status: alpha
---

:::tip[Visual overview]
Prefer a visual tour? See the **[XFCE Linux overview →](/xfce-linux)** landing page.
:::

> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.

**XFCE Linux** is a lightweight, immutable XFCE desktop OS image built from source
with [BuildStream](https://www.buildstream.build/). It layers the XFCE desktop on top
of [freedesktop-sdk](https://freedesktop-sdk.io/) and `gnome-build-meta` infrastructure,
then publishes a bootable OCI/`bootc` image to `ghcr.io/tuna-os/xfce-linux`.

It is the XFCE sibling of [Tromsø](/tromso) (KDE) and Project Bluefin's
[Dakota](https://github.com/projectbluefin/dakota) (GNOME) — same BuildStream-from-source
approach, different desktop.

## ✨ Key Features

- **🪶 Lightweight** — XFCE desktop tuned for low-resource systems.
- **🔒 Immutable** — OCI-based image with atomic updates and rollback via `bootc`.
- **🌊 Wayland** — ships the `xfwl4` Wayland-native XFCE compositor.
- **🧱 Built from source** — reproducible BuildStream pipeline on freedesktop-sdk 25.08.
- **📦 Complete desktop** — 55 XFCE applications and 31 panel plugins.

## 🚀 Quick Start

Pull and switch an existing `bootc` system to XFCE Linux:

```bash
# Pull the image
podman pull ghcr.io/tuna-os/xfce-linux:latest

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/xfce-linux:latest
sudo systemctl reboot
```

## 🏗️ Architecture

XFCE Linux composes its image in layers, the same pattern used across the BuildStream
desktop family:

```
freedesktop-sdk 25.08.9        Platform + runtime SDK
        ↓
gnome-build-meta (gnome-50)    Shared desktop build infrastructure
        ↓
xfce-wayland layer             55 XFCE apps + 31 panel plugins + xfwl4 compositor
        ↓
XFCE Linux OCI image           Bootable bootc image → ghcr.io/tuna-os/xfce-linux
```

| Layer | Contents |
|---|---|
| **Platform** | freedesktop-sdk base runtime |
| **Runtime** | XFCE core libraries and dependencies |
| **Application** | XFCE session, panel, Thunar, terminal, settings, 55 apps total |
| **Configuration** | dconf defaults, display manager, Wayland session |

The boot flow runs UEFI → kernel → systemd → display manager → XFCE (Wayland) session.

## 🛠 Build From Source

XFCE Linux uses [`just`](https://github.com/casey/just) for build automation.

### Prerequisites

- BuildStream 2.7.0+ (via the `bst2` container)
- Podman or Docker
- QEMU + KVM for boot testing
- 200 GB+ free disk space for the BuildStream cache
- 16 GB+ RAM recommended

### Build and test

```bash
git clone https://github.com/tuna-os/xfce-linux.git
cd xfce-linux

# Build the OCI image, export it, and chunkify it Dakota-style
just build

# Refresh the exported image
just export

# Generate a bootable disk image and boot it in QEMU
just generate-bootable-image
just boot-vm
```

### Useful recipes

| Recipe | Description |
|---|---|
| `just build` | Full OCI build, export, and Dakota-style chunkify |
| `just export` | Refresh the exported image |
| `just generate-bootable-image` | Create a bootable raw disk image via `bootc` |
| `just boot-vm` | Launch the image in QEMU |
| `just status` | Show build status |
| `just logs` | View build logs |
| `just clean` | Clean the build cache |

## 📦 What's Inside

- **Core:** `xfce4-session`, `xfce4-panel`, `xfwm4`, `xfdesktop`
- **Compositor:** `xfwl4` (Wayland-native)
- **File manager:** Thunar with plugins
- **Terminal:** `xfce4-terminal`
- **Settings:** `xfce4-settings`, `xfce4-power-manager`
- **Plugins:** 31 panel plugins (clock, system monitor, weather, audio mixer, …)
- …and 50+ more applications.

## 📊 Project Status

XFCE Linux is in **alpha**. The image builds cleanly (1060/1060 BuildStream elements,
zero errors) and boots to a working session in QEMU. The export/`bootc`-install path
is being hardened via Dakota-style chunkifying. Track progress in
[PROJECT_STATUS](./PROJECT_STATUS.md).

## 🔗 Related projects

- **[Tromsø](/docs/tromso)** — the KDE sibling, built the same BuildStream-from-source way.
- **[Project Bluefin Dakota](https://github.com/projectbluefin/dakota)** — the GNOME reference this approach follows.
- **[TunaOS](/docs/tunaos)** — the org's flagship bootc Enterprise Linux desktops.
- See every project on the **[Projects page →](/projects)**.

## 📚 More Documentation

- **[Build Guide](./README.md)** — full build guide and project layout
- **[PROJECT_STATUS](./PROJECT_STATUS.md)** — current state, metrics, and roadmap
- **[Contributing](./CONTRIBUTING.md)** — how to add components and submit changes

---
*Part of the [Tuna OS](https://github.com/tuna-os) ecosystem.*
