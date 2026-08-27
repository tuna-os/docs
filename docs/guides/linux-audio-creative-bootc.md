---
title: Container-Native Linux Audio & Creative Workstation Setup
description: Setting up low-latency PipeWire audio, DAW applications, and video editing suites on TunaOS bootc.
---

# Linux Audio & Creative Workstations on TunaOS

TunaOS provides an immutable, container-native foundation for professional digital audio workstations (DAWs), media production, and video editing environments.

## Why Container-Native for Audio & Video Production?

- **Deterministic Low-Latency Audio**: System OS layers maintain stable kernel configuration and PipeWire audio graph defaults across upgrades.
- **Isolated Plugins & Workstations**: Run DAWs like Ardour, Reaper, and Audacity alongside video editors (Kdenlive, DaVinci Resolve dependencies) via Flatpaks or containerized dev-envs without library conflicts.
- **Fail-Safe Upgrades**: Roll back immediately using `bootc rollback` if an update impacts real-time audio threads or GPU encoder drivers.

## Setup Instructions

### 1. Install Flatpak Workstations
```bash
flatpak install flathub org.ardour.Ardour
flatpak install flathub org.kde.kdenlive
flatpak install flathub org.blender.Blender
```

### 2. Verify PipeWire Audio Graph
```bash
pw-cli info 0
wpctl status
```

---
*Maintained by the TunaOS Community & Outreach Team.*
