---
sidebar_position: 1
---

# Welcome to TunaOS

## Modern Cloud-Native Enterprise Linux

TunaOS is a set of desktop operating systems that use **Bootc**. Enterprise
Linux 10 is the base: AlmaLinux and CentOS Stream. TunaOS is a fork of
[Bluefin LTS](https://github.com/ublue-os/bluefin-lts) for the next generation
of enterprise desktops.

Enterprise Linux gives **stability and long-term support**. Developers and
workstation users also need **new tools**. TunaOS supplies both.

## ✨ Why TunaOS?

- 🖥️ **Latest GNOME**: The newest GNOME on a stable base, with the
  Enterprise Linux toolchain. You get new desktop features and a stable system.
- 🍺 **Baked-in Homebrew**: Homebrew is installed. You get immediate access to
  a large library of command-line tools and fonts.
- 📦 **Bootc Technology**: Modern container technology makes the system
  immutable, reliable, and easy to reproduce.
- 🏢 **Enterprise DNA**: AlmaLinux 10 and CentOS 10 are the base. Support
  continues for as many as 10 years.
- 🛍️ **Flathub Enabled**: Flathub is on at installation. A full set of desktop
  applications is available immediately.

## 🐠 Available Variants

| Variant | Base OS | Target Audience |
| :--- | :--- | :--- |
| **[Albacore](albacore)** | AlmaLinux 10 | **Flagship** Stable Enterprise Desktop |
| **[Yellowfin](yellowfin)** | AlmaLinux Kitten | Developers / Daily Drivers |
| **[Skipjack](skipjack)** | CentOS Stream 10 | Upstream Testing |
| **[Bonito](bonito)** | Fedora 44 | Beta (published for testing) |

## 🚀 Specialized Editions

Albacore and Yellowfin are the primary variants. Each one has these editions:

- **Regular**: The standard edition.
- **NVIDIA**: The `-nvidia` flavor. It has NVIDIA drivers and CUDA for AI,
  graphics, and VFX work. The previous name was "GDX".
- **HWE (Hardware Enablement)**: For new hardware that needs a later kernel.

### 🎨 Desktop Flavors

Six desktop environments are available:

- **GNOME**: The polished default — latest GNOME, backported to Enterprise Linux.
- **KDE Plasma**: A desktop environment with many options, for power users.
- **COSMIC**: The new desktop environment from System76. It uses Rust.
- **Niri**: A scrollable tiling compositor. It manages windows differently.
- **XFCE**: The classic lightweight desktop, on the new xfwl4 Wayland compositor.
- **Pantheon**: elementary OS's simple, minimal desktop (Gurnard).

## 📚 Next Steps

To start:

1.  **[System Requirements](system-requirements)** - Make sure the system
    supports your hardware.
2.  **[Installation Guide](installation)** - Read how to install TunaOS.
3.  **[Download ISOs](/download)** - Get a pre-built image.

## 🧰 Beyond the OS

TunaOS is more than its images. It is a set of tools that build the images,
install them, and distribute them:

- **[Tacklebox](/docs/tacklebox)** — makes multi-boot USB drives, disk images,
  and deduplicated ISOs from OCI images.
- **[Tromsø](tromso/index)** (KDE), **[XFCE Linux](xfce-linux/index)**, and
  **[Dakota](https://github.com/projectbluefin/dakota)** (GNOME) — "distroless"
  desktops. A declarative BuildStream pipeline makes them on top of the
  [Freedesktop SDK](https://freedesktop-sdk.io/).
- **[COPR Builds](/docs/copr)** — the RPM build system. It adds GNOME 50 to
  EL10.
- **[Tavern](/docs/tavern)** and **[bluefin-cli](/docs/bluefin-cli)** — tools
  for the desktop and the shell.

The **[Projects page →](/projects)** has the full list.

---

*TunaOS is a labor of love by James. [Project Bluefin](https://projectbluefin.io)
and the [Universal Blue](https://universal-blue.org/) community are its
inspiration.*
