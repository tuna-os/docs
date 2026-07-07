---
slug: arch-linux-and-cachyos
title: "New Variants: Arch Linux (Marlin) and CachyOS (Wahoo)"
authors: [james]
tags: [variants, arch, cachyos, rolling-release]
date: 2026-07-07
---

# New Variants: Arch Linux and CachyOS

TunaOS is no longer Enterprise-Linux-only. Today we're adding two rolling-release variants to the build matrix: **Marlin** (Arch Linux) and **Wahoo** (CachyOS).

<!-- truncate -->

## Why Rolling Release?

The project vision is clear: erase the mystique of the Linux distribution. A "distro" is just `base OS × desktop × kernel × drivers` — assembled by a build factory. If that's true, it shouldn't matter whether the base is RHEL-compatible, Fedora, Ubuntu, Arch, or CachyOS. The same factory should produce them all.

## 🐟 Marlin — Arch Linux on bootc

Arch Linux with the stability guarantees of bootc: atomic updates, rollback, immutable base.

- **Base**: `archlinux/archlinux:latest`
- **Kernel**: stock `linux` (latest stable)
- **Package manager**: pacman
- **bootc**: built from source (Arch doesn't package it yet)
- **Desktops**: gnome, kde, cosmic, niri, xfce

### How It Works

`Containerfile.arch` bootcifies a stock Arch container:

1. Builds bootc from source (~2 min Rust compile)
2. Moves `/var` → `/usr/lib/sysimage` for pacman+ostree compatibility
3. Installs kernel, dracut, ostree, filesystem tools
4. Builds initramfs with bootc dracut modules
5. Sets up composefs + ostree rootfs layout

Desktop packages come from the same manifest system — the `pacman:` section in each `manifests/desktops/*.yaml`.

## 🐟 Wahoo — CachyOS on bootc

The performance variant. CachyOS ships:

- **BORE scheduler** — better desktop interactivity under load
- **LTO-compiled packages** — 5-15% faster binaries
- **x86-64-v3 targeting** — uses modern CPU instructions (AVX2, BMI2, etc.)
- **Performance-tuned sysctl** — optimized for desktop workloads

Same `Containerfile.arch` — it auto-detects CachyOS repos in pacman.conf and installs `linux-cachyos` instead of stock `linux`.

## The Matrix

```
              │ gnome │ kde  │ niri │ cosmic │ xfce │
──────────────┼───────┼──────┼──────┼────────┼──────┤
EL10          │  ✅   │  ✅  │  ✅  │   ✅   │  ✅  │
Fedora        │  ✅   │  ✅  │  ✅  │   ✅   │  ✅  │
Ubuntu        │  ✅   │  ✅  │  ✅  │   —    │  ✅  │
Arch          │  ✅   │  ✅  │  ✅  │   ✅   │  ✅  │  ← NEW
CachyOS       │  ✅   │  ✅  │  ✅  │   ✅   │  ✅  │  ← NEW
```

## Try It

```bash
# Build locally
just build marlin gnome
just build wahoo kde

# Or switch a running system
sudo bootc switch ghcr.io/tuna-os/marlin:gnome
sudo bootc switch ghcr.io/tuna-os/wahoo:kde
```

Both variants are marked **experimental** — expect rough edges. ISOs coming once the builds stabilize.

## Credits

This work stands on the shoulders of:

- **[bootcrew](https://github.com/bootcrew/mono)** — the reference implementation for Arch Linux on bootc. Their `arch-bootc` project proved the composefs-native backend works on Arch and pioneered the `/var` → `/usr/lib/sysimage` pacman migration. Our `Containerfile.arch` is directly based on their work.
- **[jumpvi / bootc-shindig](https://github.com/bootc-shindig)** — the `bootc-deb` apt packages that make bootc work on Ubuntu/Debian. Without their work packaging bootc for apt-based systems, our Grouper (Ubuntu) variant wouldn't exist. The entire deb-based bootc ecosystem traces back to their packaging effort.
- **[CachyOS](https://cachyos.org)** — for maintaining performance-optimized Arch repos (BORE scheduler, LTO, x86-64-v3) and publishing Docker images we can build on.
- **[Universal Blue](https://universal-blue.org/)** and **[Project Bluefin](https://projectbluefin.io)** — for proving that bootc-based desktop images work at scale and inspiring this entire approach.
