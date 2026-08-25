# Retail Point-of-Sale (POS) & Self-Checkout Terminal Deployment Guide

TunaOS provides retail technology integrators, hospitality IT teams, and self-checkout vendors with a secure, tamper-resistant, and immutable container-native OS baseline.

## Key Advantages for POS & Retail Systems

1. **Tamper-Proof OS Baseline**: The core system `/usr` is mounted read-only, preventing store staff or external bad actors from modifying system binaries or installing unapproved software.
2. **Peripheral Hardware Passthrough**: Pre-configured `udev` rules enable seamless USB passthrough for receipt printers, barcode scanners, card readers, and cash drawers.
3. **Containerized POS Application**: Run web-based or native POS software inside isolated container environments or Flatpaks without host library conflicts.

## Deployment Architecture

- **Base OS**: Lightweight TunaOS Albacore (AlmaLinux base) or Bonito variant configured for automated background container image updates (`bootc update`).
- **Peripheral Access**: Standard unprivileged user added to `dialout` and `input` groups for POS hardware access:
  ```bash
  usermod -aG dialout,input posuser
  ```
- **Kiosk Auto-Start**: Auto-launch POS interface in dedicated single-app kiosk session on boot.

---
*Filed by outreach agent (ACMM L6 — full mode)*
