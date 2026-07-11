---
sidebar_position: 1
---

# Welcome to TunaOS

## Modern Cloud-Native Enterprise Linux

TunaOS is a collection of **Bootc-based desktop operating systems** built on the rock-solid foundation of Enterprise Linux 10 (AlmaLinux and CentOS Stream). It is a fork of [Bluefin LTS](https://github.com/ublue-os/bluefin-lts), modernized for the next generation of enterprise desktops.

Our mission is to combine the **stability and long-term support** of Enterprise Linux with the **freshness and modern tooling** that today's developers and workstation users demand.

## ✨ Why TunaOS?

- 🖥️ **Latest GNOME**: We backport GNOME 50 to Enterprise Linux (the `gnome50` image), so you can have the latest desktop features alongside the rock-stable distro GNOME — without sacrificing system stability.
- 🍺 **Baked-in Homebrew**: Homebrew is pre-installed, giving you instant access to a massive library of CLI tools and fonts.
- 📦 **Bootc Technology**: Built using modern container technology for immutable, reliable, and easily reproducible systems.
- 🏢 **Enterprise DNA**: Based on AlmaLinux 10 and CentOS 10, providing a foundation supported for up to 10 years.
- 🛍️ **Flathub Enabled**: Enjoy a full suite of desktop applications immediately with Flathub enabled out-of-the-box.

## 🐠 Available Variants

| Variant | Base OS | Target Audience |
| :--- | :--- | :--- |
| **[Albacore](albacore)** | AlmaLinux 10 | **Flagship** Stable Enterprise Desktop |
| **[Yellowfin](yellowfin)** | AlmaLinux Kitten | Developers / Daily Drivers |
| **[Skipjack](skipjack)** | CentOS Stream 10 | Upstream Testing |
| **[Bonito](bonito)** | Fedora 44 | Bleeding Edge / Experimental |

## 🚀 Specialized Editions

For our primary variants (Albacore and Yellowfin), we offer specialized editions:

- **Regular**: The balanced, standard experience.
- **DX (Developer Experience)**: Pre-configured for software development (`libvirt`, `docker`, `vscode`, etc.).
- **NVIDIA**: Optimized for AI, Graphics, and VFX with NVIDIA drivers + CUDA (the `-nvidia` flavor, formerly "GDX").
- **HWE (Hardware Enablement)**: For the latest hardware requiring newer kernels.

### 🎨 Desktop Flavors

We now offer specialized desktop environment flavors to suit your workflow:

- **GNOME 50**: The next generation of GNOME, pushing the boundaries of the desktop experience.
- **KDE Plasma**: A powerful, customizable desktop environment for power users.
- **COSMIC**: The brand new, Rust-based desktop environment from System76.
- **Niri**: A unique, scrollable tiling compositor for a fresh take on window management.

## 📚 Next Steps

Ready to dive in?

1.  **[System Requirements](system-requirements)** - Check if your hardware is supported.
2.  **[Installation Guide](installation)** - Learn how to install TunaOS.
3.  **[Download ISOs](/download)** - Get started with pre-built images.

## 🧰 Beyond the OS

TunaOS is more than its images — it's an ecosystem of tools that build, install, and
distribute them:

- **[Tacklebox](/docs/tacklebox)** — orchestrates multi-boot USBs, disk images, and deduplicated ISOs from OCI images.
- **[Tromsø](tromso/index)** (KDE), **[XFCE Linux](xfce-linux/index)**, **[Dakota](https://github.com/projectbluefin/dakota)** (GNOME), and **[Zirconium Hawaii](https://github.com/zirconium-linux/hawaii)** (Niri) — "distroless" desktops built via a declarative BuildStream pipeline on top of the [Freedesktop SDK](https://freedesktop-sdk.io/).
- **[COPR Builds](/docs/copr)** — the RPM build system that backports GNOME 50 to EL10.
- **[Tavern](/docs/tavern)** and **[bluefin-cli](/docs/bluefin-cli)** — desktop and shell tooling.

See the full list on the **[Projects page →](/projects)**.

---

*TunaOS is a labor of love by James, inspired by [Project Bluefin](https://projectbluefin.io) and the [Universal Blue](https://universal-blue.org/) community.*
