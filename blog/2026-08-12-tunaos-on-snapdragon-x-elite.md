---
slug: tunaos-on-snapdragon-x-elite
title: "TunaOS on Snapdragon X Elite laptops — daily-driver Linux on the X13s"
authors: [james]
tags: [tunaos, x13s, snapdragon, arm, qualcomm, bootc, immutable]
date: 2026-08-12
draft: true
---

<!-- ste-disable-file: announcement post for a new hardware story; first-person maintainer voice intended. -->

Snapdragon X Elite is the most interesting Windows-on-ARM silicon in years —
and a growing number of Linux users are discovering that these laptops make
excellent Linux machines. TunaOS ships two images built for the canonical
X Elite device, the **Lenovo ThinkPad X13s** (Qualcomm SC8280XP): one based
on Bonito (Fedora Atomic GNOME) and one based on Project Bluefin Dakota.

<!-- truncate -->

## Two variants, one goal: a daily-driver ARM laptop

| Variant | Base | Status | Download |
|---|---|---|---|
| **bonito-x13s** | Bonito (Fedora Atomic GNOME) | Live ISO, auto-rebuilt on push | [bonito-x13s-latest.iso](https://download.tunaos.org/bonito-x13s/bonito-x13s-latest.iso) |
| **dakota-x13s** | Project Bluefin Dakota | Alpha — tracks upstream dakota | [x13s-live-latest.iso](https://download.tunaos.org/dakota-x13s/x13s-live-latest.iso) |

Both ship the X13s support stack out of the box: the
[jlinton/x13s COPR](https://copr.fedorainfracloud.org/coprs/jlinton/x13s/)
kernel enablement, Qualcomm firmware (`qcom-firmware`), Bluetooth
(`bluez`), power management (`pd-mapper`), and battery monitor firmware
blobs in the initrd — with the required kernel arguments
(`arm64.nopauth`, `clk_ignore_unused`, `pd_ignore_unused`,
`modprobe.blacklist=qcom_q6v5_pas`) and device tree preconfigured.

## Try it

1. Write the ISO to a USB stick (`dd` or your usual tool) and boot to the
   live desktop
2. Install from the live environment
3. Already running bootc on the X13s? Switch in one command:

```bash
sudo bootc switch ghcr.io/tuna-os/bonito-x13s:latest
sudo reboot
```

Updates are atomic from then on: `sudo bootc upgrade`, rollback on failure,
verified by the same container-native pipeline as every TunaOS image.

## Why now

The X13s is the reference device for Linux on Windows-on-ARM laptops, and
the Qualcomm Linux story keeps accelerating. TunaOS's manifest-driven build
pipeline makes it cheap to maintain per-device images — the X13s variants
are rebuilt automatically on every push to `main`, so the ISO you download
is the latest verified boot image, not a snapshot from release day.

## Get involved

- **Own an X13s or another Snapdragon X Elite laptop?** — try the ISO and
  report what works/what doesn't on [GitHub](https://github.com/tuna-os/tunaOS/issues)
- **Docs** — variant pages: [bonito-x13s](https://github.com/tuna-os/docs/tree/main/docs/bonito-x13s),
  [dakota-x13s](https://github.com/tuna-os/docs/tree/main/docs/dakota-x13s)
- **Questions?** — [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia)
