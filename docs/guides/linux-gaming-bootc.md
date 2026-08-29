---
title: Linux Gaming & Handheld Setup with Container-Native Bootc
description: Guide to container-native gaming, GPU drivers, and rollback recovery on TunaOS bootc variants.
---

# Container-Native Linux Gaming on TunaOS

TunaOS gives you an immutable, container-native desktop for Linux gaming, handheld hardware, and emulation.

## Key Advantages for Gaming

- **Atomic System Updates**: An update to the OS lands whole, or not at all. It does not leave a half-updated graphics driver behind.
- **Instant Rollback**: If a driver update breaks a game, `bootc rollback` puts the earlier image back at the next boot.
- **Isolated User Runtimes**: Install Steam, Heroic, and Lutris as Flatpaks or in a container toolbox. The root filesystem stays as it is.

## Quick-Start Setup

### 1. Install the Flatpak Gaming Clients

```bash
flatpak install flathub com.valvesoftware.Steam
flatpak install flathub com.heroicgameslauncher.hgl
flatpak install flathub net.lutris.Lutris
```

### 2. Add the MangoHud Overlay

Add the MangoHud layer so that a Flatpak game can show frame timings:

```bash
flatpak install flathub org.freedesktop.Platform.VulkanLayer.MangoHud
```

### 3. Check the System and the Graphics Stack

Look at the image you booted and the Vulkan drivers that the system found:

```bash
bootc status
vulkaninfo --summary
```
