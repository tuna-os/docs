# Digital Signage & Kiosk Fleet Deployment Guide

TunaOS gives fleet administrators a container-managed base image for signage screens and interactive kiosks that run without an operator present.

## Key Advantages for Kiosk & Signage Fleets

1. **Resilient to Power Loss**: The core system files in `/usr` are read-only. A sudden power cut does not corrupt a system binary or leave the disk in a state that cannot boot.
2. **Central Fleet Management with OCI**: Push a new container tag to a standard registry. Every screen picks it up on its next scheduled update.
3. **Single-App Kiosk Isolation**: Run one full-screen application in an unprivileged container sandbox at start-up. Use Chromium, MPV, or your own web app.

## System Configuration Highlights

- **Desktop Baseline**: A light TunaOS variant such as XFCE Linux or Bonito Niri. Set it to log in on its own with no desktop shell.
- **Kiosk Launch**: Start the browser full-screen:
  ```bash
  flatpak run org.chromium.Chromium --kiosk --incognito https://signage.internal.company.com
  ```
- **Unattended Updates**: A systemd timer that runs `bootc update` in the quiet hours of the night.
