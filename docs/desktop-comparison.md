---
sidebar_position: 3
title: Desktop environment comparison
description: Compare the desktop environments available across TunaOS and related products.
---

# Choose a desktop

TunaOS ships the same bootc image model across several desktop experiences.
Choose the workflow that fits how you use your computer, then use the
[download page](/download) to find a matching image and base.

The resource figures below are rough idle-use ranges, not guarantees. Apps,
extensions, services, display settings, and hardware drivers can change the
result. Availability follows the current site catalog and image picker; a
desktop listed as a related product is not automatically a TunaOS variant.

| Desktop | Best for / workflow | Typical idle RAM | Hardware fit | Availability |
| --- | --- | ---: | --- | --- |
| **GNOME** | A polished, focused workflow with opinionated defaults and minimal setup. | ~1–1.2 GB | Modern hardware; 16 GB RAM is comfortable. | Standard TunaOS flavor across the main bases; also available through Dakota (GNOME OS). |
| **KDE Plasma** | A familiar, highly configurable desktop for users who want control over panels, shortcuts, and window behavior. | ~0.8–1 GB | Modern or mid-range hardware; a good fit from 8 GB RAM upward. | Standard TunaOS flavor across the main bases; also available through Tromsø. |
| **COSMIC** | A modern, keyboard-friendly desktop with a clean layout and Rust-based components. | ~0.8–1 GB | Mid-range and modern hardware; test graphics support on newer hardware. | Standard TunaOS flavor on supported bases; availability varies by base. |
| **[Niri](./niri-quickstart.md)** | Keyboard-driven, scrollable tiling for people who prefer layouts over overlapping windows. | ~0.4–0.6 GB | Efficient on modest systems; best with a Wayland-compatible GPU and a keyboard-centric workflow. | Standard TunaOS flavor on supported bases; availability varies by base. |
| **XFCE** | A traditional, lightweight desktop for older hardware, VMs, or users who want a conventional panel-and-menu layout. | ~600 MB | The best fit for 4–8 GB systems and older machines. | Available on supported TunaOS bases and as the separate [XFCE Linux](./xfce-linux/index.md) project; not every main base publishes it. |
| **Pantheon** | A simple, cohesive desktop centered on straightforward navigation and a curated default experience. | Varies by implementation | Modern or mid-range hardware is the safe starting point; verify hardware support for the specific build. | Not currently offered in the TunaOS image picker or canonical variant catalog. |

## Availability notes

- The desktop name is not the same thing as a TunaOS **variant**. Albacore,
  Yellowfin, Skipjack, Bonito, and the other base images are variants. GNOME,
  KDE Plasma, COSMIC, Niri, and XFCE are desktop flavors layered onto them.
- HWE, NVIDIA, and CachyOS tags are editions or hardware options, not separate
  desktop environments.
- Availability changes as image builds mature. Start with the picker on the
  [download page](/download). Then check the selected variant’s page for the
  exact image tag and architecture.

## Related guides

- [System requirements](./system-requirements.md)
- [Installation guide](./installation.md)
- [Manage images with bootc](./tunaos/bootc-usage.md)
- [Niri quick-start guide](./niri-quickstart.md)
