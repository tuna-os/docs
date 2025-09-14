---
sidebar_position: 1
---

# Welcome to TunaOS

## A Collection of Cloud-Native Enterprise Linux OS Images

TunaOS is a curated collection of **Bootc-based desktop operating systems** that are forks of [Bluefin LTS](https://github.com/ublue-os/bluefin-lts), built on modern container technology. This is an exploration of the flexibility of Bootc and a hope that some people believe in the Enterprise Linux Desktop.

The plan is to provide a stable experience with up-to-date GNOME and modern tooling.

## ✨ Key Features

- **Latest GNOME**: Don't get stuck on a 3-year-old GNOME. We try to backport the latest Desktop features and bring them to the Enterprise Desktop
  - Currently we're shipping GNOME `48.3` while EL will be stuck on GNOME `47` for the foreseeable future
- **Anaconda WebUI & Live ISO**: Modern installation experience (pending upstream)
- **Homebrew**: We bake Homebrew into the image, so all your CLI apps (and fonts) are just a brew command away
- **Flathub by Default**: This is a no-brainer that isn't preset in our base images. Actually get all the Flatpaks that are generally available on the net

## 🐠 Available Variants

We ship 3 versions for each base, matching upstream:

- **Regular**: See [Bluefin's excellent documentation](https://docs.projectbluefin.io/) for info
- **DX (Developer Experience)**: Adding libvirt, Docker, VSCode, etc. [Learn more](https://docs.projectbluefin.io/dx)
- **GDX (Graphical Developer Experience)**: Adding Nvidia drivers and CUDA. For Nvidia users/AI/VFX devs. [Learn more](https://docs.projectbluefin.io/gdx)

### Images Available

- **[Albacore](albacore)** - AlmaLinux 10 based
- **[Yellowfin](yellowfin)** - AlmaLinux Kitten 10 based (closest to upstream Bluefin LTS)
- **[Bonito](bonito)** - Fedora 42 based (cutting-edge)
- **[Skipjack](skipjack)** - CentOS 10 based

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | x86_64, ARM64 | x86_64, ARM64 |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 20 GB | 50 GB+ |

## 🚀 Quick Start

Ready to get started? Check out our [installation guide](installation) or download ISOs for your preferred variant:

- [Albacore Downloads](albacore#downloads)
- [Yellowfin Downloads](yellowfin#downloads)
- [Bonito Downloads](bonito#downloads)
- [Skipjack Downloads](skipjack#downloads)

## 📚 External Documentation

Since TunaOS is based on Bluefin LTS, most documentation can be found at:

- [Project Bluefin Documentation](https://docs.projectbluefin.io) - Primary reference for shared functionality
- [AlmaLinux Wiki](https://wiki.almalinux.org) - For AlmaLinux-specific information
- [Universal Blue](https://universal-blue.org/) - Community and ecosystem info

## 🤝 Community & Support

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
- 💬 **Matrix Chat**: [#tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia)
- 🎮 **Discord**: [Universal Blue Community](https://discord.gg/WEu6BdFEtp)
- 💬 **AlmaLinux Atomic SIG**: [AlmaLinux Atomic SIG](https://chat.almalinux.org/almalinux/channels/sigatomic)

---

*TunaOS is made by James in his free time, powered by [Bootc](https://github.com/bootc-dev/bootc), and inspired by [Bluefin](https://projectbluefin.io) and the [Universal Blue](https://universal-blue.org/) Community.*