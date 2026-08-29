---
title: Container-Native Linux Audio & Creative Workstation Setup
description: Setting up low-latency PipeWire audio, DAW applications, and video editing suites on TunaOS bootc.
---

# Linux Audio & Creative Workstations on TunaOS

TunaOS gives you an immutable, container-native base for digital audio workstations, media production, and video work.

## Why Container-Native for Audio & Video Production?

- **Stable Audio Configuration**: The kernel settings and the PipeWire graph defaults come from the image. They stay the same across an upgrade.
- **Isolated Plugins & Workstations**: Run a DAW such as Ardour or Audacity next to a video editor such as Kdenlive. Each Flatpak brings its own libraries.
- **Fail-Safe Upgrades**: If an update hurts your latency or your GPU encoder, `bootc rollback` puts the earlier image back.

## Setup Instructions

### 1. Install the Flatpak Workstations

```bash
flatpak install flathub org.ardour.Ardour
flatpak install flathub org.kde.kdenlive
flatpak install flathub org.blender.Blender
```

### 2. Check the PipeWire Audio Graph

Look at the server and the devices that PipeWire found:

```bash
pw-cli info 0
wpctl status
```

Measure the latency you get on your own hardware before you commit to a
session. The figure depends on your interface, your kernel, and your
buffer settings, not on the base image alone.
