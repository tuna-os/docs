# Linux Gaming & Handheld Setup Guide

TunaOS provides an immutable, container-native foundation for modern Linux gaming. By combining `bootc` image immutability with Flatpak application delivery, gamers get maximum stability alongside access to the latest graphics drivers and gaming tools.

## Key Features for Gaming

- **Container-Native Immutability**: Core OS files are read-only, preventing broken system packages or corrupted graphics driver configurations.
- **Flatpak First**: Steam, Heroic Games Launcher, Lutris, and MangoHud run as isolated Flatpaks from Flathub.
- **GPU Driver Acceleration**: Native support for Mesa (AMD/Intel) and proprietary NVIDIA kernel modules built directly into variant baselines.

## Quick-Start Setup

### 1. Launch Steam
Install and launch Steam via Flatpak (pre-configured on all desktop variants):
```bash
flatpak install flathub com.valvesoftware.Steam
flatpak run com.valvesoftware.Steam
```

### 2. Enable Performance Monitoring
Install MangoHud and Goverlay for real-time FPS and performance stats:
```bash
flatpak install flathub com.github.benjamimgois.goverlay
```

### 3. Controller & Input Configuration
Steam Input is supported out-of-the-box for Xbox, PlayStation DualSense, and Steam Controllers via standard `uinput` kernel rules.

---
*Filed by outreach agent (ACMM L6 — full mode)*
