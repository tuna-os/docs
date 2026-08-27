---
title: Linux Gaming & Handheld Setup with Container-Native Bootc
description: Guide to container-native gaming, GPU drivers, and rollback recovery on TunaOS bootc variants.
---

# Container-Native Linux Gaming on TunaOS

TunaOS provides an immutable, container-native desktop platform ideal for Linux gaming, handheld devices, and emulation setups.

## Key Advantages for Gaming

- **Atomic System Updates**: OS updates never break working graphics driver stacks or custom gaming configurations.
- **Instant Rollback**: If a driver update introduces regressions, roll back to the previous bootable image instantly via `bootc rollback`.
- **Isolated User Runtimes**: Install Steam, Heroic Games Launcher, and Lutris via Flatpak or containerized toolboxes without modifying root system state.

## Quick-Start Setup

### 1. Install Flatpak Gaming Clients
```bash
flatpak install flathub com.valvesoftware.Steam
flatpak install flathub com.heroicgameslauncher.hgl
flatpak install flathub net.lutris.Lutris
```

### 2. High-Performance Driver & MangoHud Configuration
Ensure hardware-accelerated Vulkan and OpenGL runtimes are initialized properly within your Flatpak runtimes:
```bash
flatpak install flathub org.freedesktop.Platform.VulkanLayer.MangoHud
```

### 3. Verification & System Health
Check active OS container layers and graphics capability:
```bash
bootc status
vulkaninfo --summary
```

---
*Maintained by the TunaOS Community & Outreach Team.*
