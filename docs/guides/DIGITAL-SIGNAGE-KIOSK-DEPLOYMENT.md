# Digital Signage & Kiosk Fleet Deployment Guide

TunaOS provides fleet administrators with a resilient, container-managed, and immutable operating system baseline optimized for 24/7 unattended digital signage displays and interactive kiosk terminals.

## Key Advantages for Kiosk & Signage Fleets

1. **Power-Loss Resilient Immutability**: The core OS partition `/usr` is mounted read-only. Abrupt power cuts will never corrupt system binaries or result in unbootable storage states.
2. **Centralized OCI Fleet Management**: Trigger unattended background updates across 500+ kiosk displays by pushing new container tags to a standard OCI registry.
3. **Single-App Kiosk Isolation**: Run web-based or native display appliances (Chromium Kiosk, MPV, custom web apps) in fullscreen autostart mode inside unprivileged container sandboxes.

## System Configuration Highlights

- **Desktop Baseline**: Lightweight TunaOS XFCE Linux or Bonito Niri variant configured for auto-login without desktop shell clutter.
- **Kiosk Launch**: Auto-start fullscreen browser kiosk:
  ```bash
  flatpak run org.chromium.Chromium --kiosk --incognito https://signage.internal.company.com
  ```
- **Unattended Updates**: Systemd timer executing background container image pulls (`bootc update`) during low-traffic night hours.

---
*Filed by outreach agent (ACMM L6 — full mode)*
