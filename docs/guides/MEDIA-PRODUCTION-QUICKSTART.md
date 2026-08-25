# Open Source Audio/Video & Creative Workstation Quick-Start Guide

TunaOS provides audio engineers, video editors, and live streamers with an immutable, low-latency container-native baseline designed for rock-solid creative production.

## Key Advantages for Creative Professionals

1. **Host Stability During Recording**: Core system binaries remain read-only `/usr`, ensuring system updates never break PipeWire audio configs or video codec libraries mid-production.
2. **Pro Audio Latency**: Pre-configured PipeWire audio graph defaults with real-time scheduling permissions (`rtkit`) for zero-glitch multitrack recording.
3. **GPU Hardware Acceleration**: Out-of-the-box VAAPI (AMD/Intel) and NVENC (NVIDIA) support for OBS Studio streaming and Kdenlive / DaVinci Resolve rendering.

## Creative Toolchain Setup

### 1. Install Multimedia Suites (Flatpak)
```bash
flatpak install flathub com.obsproject.Studio
flatpak install flathub org.kde.kdenlive
flatpak install flathub org.ardour.Ardour
flatpak install flathub org.audacityteam.Audacity
```

### 2. Verify Hardware Video Encoding (NVENC / VAAPI)
Verify OBS Studio has direct access to GPU encoder nodes:
```bash
flatpak run --command=vainfo com.obsproject.Studio
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
