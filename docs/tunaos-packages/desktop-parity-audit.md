---
sidebar_position: 17
title: "desktop parity audit"
---

This document outlines the desktop parity requirements, contract specifications, and verification tools established to address [tuna-os/tunaos-packages#133](https://github.com/tuna-os/tunaos-packages/issues/133).

## Context & Problem Statement

An audit of 37 published edition images identified that **24 editions were undersized or missing expected desktop packages**. Specifically:
- **`marlin` non-GNOME editions (`marlin:kde`, `marlin:cosmic`, `marlin:niri`, `marlin:xfce`)**: No-op builds resulting in images identical in size (1.51 GB) containing zero desktop session files or desktop packages (`marlin:kde` contains 338 packages vs `marlin:base` 480 packages and `marlin:gnome` 631 packages).
- **`flounder` cosmic/niri editions (`flounder:cosmic` 0.73 GB, `flounder:niri` 0.71 GB)**: Smaller than `flounder:base` (1.11 GB), missing essential session components.
- **`sailfin`, `flounder`, and `grouper` across all desktops**: Authoring package lists against RPM/DNF package names resulted in unresolved names failing softly under `apt` and `zypper`, yielding incomplete desktop installations.

Furthermore, image compressed size alone cannot reliably distinguish between missing packages and legitimate architectural differences (e.g. EL-family XFCE Wayland stack vs Fedora X11 XFCE).

## Desktop Experience Contracts & Validation

To guarantee desktop completeness and prevent regression before publishing images, package-level contracts and verification tools must be enforced for all target desktops across all base distributions (RPM, DEB, openSUSE).

### 1. GNOME Desktop Contract
Defined in [`docs/gnome-desktop-contract.md`](https://github.com/tuna-os/tunaos-packages/blob/main/docs/gnome-desktop-contract.md) and checked via [`scripts/verify-gnome-desktop-experience.py`](https://github.com/tuna-os/tunaos-packages/blob/main/scripts/verify-gnome-desktop-experience.py).
Required package components:
- `gdm`
- `gnome-keyring`
- `gnome-session`
- `gnome-shell`
- `gvfs`
- `mutter`
- `nautilus`
- `xdg-desktop-portal-gnome`

### 2. Contract Enforcement Rules for All Desktops
1. **Hard Failure on Unresolved Package Names**: Package resolution in image builds for Debian/Ubuntu (`apt`), openSUSE (`zypper`), and Enterprise Linux/Fedora (`dnf`) must fail hard on any unresolved desktop package name rather than ignoring missing dependencies.
2. **Published Installed Package Inventory**: Every edition build must export its effective installed package list (`rpm -qa` / `dpkg-query -W`) alongside image metadata so desktop parity is diffable directly.
3. **Session & Portal Verification**: Every desktop edition must ship valid session entries in `/usr/share/wayland-sessions/` or `/usr/share/xsessions/`, appropriate greeters/display managers, and required XDG desktop portals.

## Status & Action Plan

1. **`marlin` non-GNOME & `flounder` cosmic/niri**: Fixed by enforcing mandatory package verification and hard-failing builds when desktop session files or required desktop roots are missing.
2. **Package Name Mapping (zypper/apt)**: Cross-base package list mappings are continuously audited and synchronized across DNF, APT, and ZYPPER definitions in `manifests/`.
