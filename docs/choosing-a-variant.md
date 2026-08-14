---
sidebar_position: 2
---

# Choosing Your TunaOS Variant

TunaOS publishes multiple operating system variants across several Linux base distributions and desktop environments. All variants are built on container-native **bootc** technology, giving you atomic image-based updates, Flathub app delivery out of the box, and integrated Homebrew tooling.

This decision guide helps you pick the right variant for your hardware, stability needs, and desktop preference.

---

## 🎯 Quick Decision Paths

If you are not sure where to start, follow these recommended paths:

- **Workstation / Daily Driver (Maximum Stability):** Choose **[Albacore](/albacore)** (AlmaLinux 10). It provides a 10-year enterprise support lifecycle, rock-solid stability, and optional `-nvidia` or `-hwe` (Hardware Enablement) kernel editions.
- **Developer / Fresh Packages on Enterprise Base:** Choose **[Yellowfin](/yellowfin)** (AlmaLinux Kitten 10). It tracks newer packages and kernels ahead of stable Enterprise Linux while maintaining enterprise compatibility.
- **Upstream RHEL Preview:** Choose **[Skipjack](/skipjack)** (CentOS Stream 10). It tracks upstream CentOS Stream for testing and previewing future Enterprise Linux releases.
- **Bleeding-Edge Fedora:** Choose **[Bonito](/bonito)** (Fedora 44). For users who want the latest mainline kernel, Mesa drivers, and desktop toolchains on an immutable base.
- **elementary OS Desktop:** Choose **[Gurnard](/gurnard)** (Ubuntu 24.04 LTS with Pantheon). Combines the elegant elementary OS desktop experience with an LTS base.
- **Arch Linux Rolling:** Choose **[Marlin](/marlin)** (Arch Linux). Rolling-release base with the newest packages on composefs-native bootc.
- **Apple Silicon (ARM64):** Choose **[Asahi images](/blog/2026-08-12-tunaos-on-apple-silicon)** available across supported multi-arch bases (Albacore, Yellowfin, Bonito, Gurnard).

> **Not sure?** Start with **[Albacore](/albacore)** — the flagship variant designed as a rock-solid daily driver for most users.

---

## 📊 Variant Comparison Matrix

The table below summarizes the key attributes for each TunaOS variant:

| Variant | Base Distribution | Stability / Cadence | Target Audience & Best For | Architectures |
| :--- | :--- | :--- | :--- | :--- |
| **[Albacore](/albacore)** | AlmaLinux 10 | Enterprise (10-yr lifecycle) | Flagship daily driver, enterprise workstations | `amd64`, `amd64-v2`, `arm64` |
| **[Yellowfin](/yellowfin)** | AlmaLinux Kitten 10 | Fresh + Enterprise | Developers, lead developer's daily driver | `amd64`, `amd64-v2`, `arm64` |
| **[Skipjack](/skipjack)** | CentOS Stream 10 | Rolling preview | Upstream RHEL testing and contribution | `amd64`, `arm64` |
| **[Redfin](/redfin)** | RHEL 10 | Enterprise (Local-build) | Secure enterprise workspaces (requires local build) | `amd64`, `arm64` |
| **[Bonito](/bonito)** | Fedora 44 | Bleeding edge | Latest mainline kernel, Mesa, and toolchains | `amd64`, `arm64` |
| **[Bonito Rawhide](/bonito-rawhide)** | Fedora Rawhide | Rawhide development | Fedora upstream development and testing | `amd64`, `arm64` |
| **[Hummingbird](/hummingbird)** | Fedora Hummingbird | Experimental | Hardened container-native base testing | `amd64`, `arm64` |
| **[Grouper](/grouper)** | Ubuntu 26.04 | Experimental | Ubuntu bootc proving ground on composefs | `amd64` |
| **[Gurnard](/gurnard)** | Ubuntu 24.04 LTS | Stable LTS | elementary OS Pantheon desktop experience | `amd64`, `arm64` |
| **[Marlin](/marlin)** | Arch Linux | Rolling release | Absolute newest packages on Arch rolling | `amd64` |
| **[Flounder](/flounder)** | Debian 13 Trixie | Debian stable | Stable Debian base with containerized delivery | `amd64` |
| **[Flounder Sid](/flounder-sid)** | Debian Sid | Debian unstable | Rolling Debian development base | `amd64` |
| **[Sailfin](/sailfin)** | openSUSE Tumbleweed | openSUSE rolling | Transactional openSUSE rolling package base | `amd64` |
| **[Guppy](/guppy)** | Gentoo Linux | Gentoo stable | Source-based Gentoo compiled on bootc layers | `amd64` |

---

## 🖥️ Choosing Your Desktop Environment

Each variant offers desktop flavors tailored to different workflows:

- **GNOME:** Polished default desktop with modern backports across enterprise bases.
- **KDE Plasma:** Feature-rich, endlessly customizable desktop for power users.
- **COSMIC:** Next-generation Rust-built desktop from System76.
- **Niri:** Keyboard-driven, scrollable-tiling Wayland compositor.
- **XFCE:** Lightweight classic desktop ported to Wayland via the new `xfwl4` compositor.
- **Pantheon:** elementary OS's minimal, elegant desktop (featured on [Gurnard](/gurnard)).

---

## 📥 Ready to Install?

- Head to the **[Download Page](/download)** to select your image and desktop flavor.
- Check the **[System Requirements](/docs/system-requirements)** to verify hardware compatibility.
- Read the **[Installation Guide](/docs/installation)** for step-by-step setup instructions.
