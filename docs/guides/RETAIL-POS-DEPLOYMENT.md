# Retail Point-of-Sale (POS) & Self-Checkout Terminal Deployment Guide

TunaOS gives retail integrators, hospitality IT teams, and self-checkout vendors a container-native base image that resists changes made at the terminal.

## Key Advantages for POS & Retail Systems

1. **Tamper-Resistant Baseline**: The core system in `/usr` mounts read-only. Staff and other people at the terminal cannot change a system binary or add software that you did not approve.
2. **Peripheral Hardware Passthrough**: Add `udev` rules for the USB devices at the lane. These include printers, scanners, card readers, and cash drawers.
3. **Containerized POS Application**: Run your POS software, on the web or native, inside a container or a Flatpak. It keeps its own libraries.

## Deployment Architecture

- **Base OS**: A light TunaOS variant such as Albacore (AlmaLinux base) or Bonito, set to pull `bootc update` in the background.
- **Peripheral Access**: Put the unprivileged POS user in the groups that own the hardware nodes:
  ```bash
  usermod -aG dialout,input posuser
  ```
- **Kiosk Auto-Start**: Start the POS interface in a single-application session at boot.

Confirm the group names and the `udev` rules against the hardware in front of you. They change between one card reader and the next.
