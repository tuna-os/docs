---
sidebar_position: 1
sidebar_label: "Bonito X13s"
slug: /docs/bonito-x13s
status: experimental
---

> ⚠️ **Experimental** — proof of concept. Not for production use. Expect breakage.

A [bootc](https://containers.github.io/bootc/) image for the **Lenovo ThinkPad X13s** (Qualcomm SC8280XP, aarch64), based on [Bonito](https://github.com/tuna-os/bonito) (Fedora Atomic GNOME).

## Download Live ISO

> **[⬇ Download bonito-x13s-latest.iso](https://download.tunaos.org/bonito-x13s/bonito-x13s-latest.iso)**

The ISO is rebuilt automatically on every push to `main`. Write it to a USB stick and boot to install or try the live desktop.

## What's Included

- ThinkPad X13s hardware support via [jlinton/x13s COPR](https://copr.fedorainfracloud.org/coprs/jlinton/x13s/)
- Qualcomm firmware (`qcom-firmware`), Bluetooth (`bluez`), power management (`pd-mapper`)
- Battery monitor firmware blobs in initrd
- Required kernel arguments: `arm64.nopauth`, `clk_ignore_unused`, `pd_ignore_unused`, `modprobe.blacklist=qcom_q6v5_pas`
- Device tree: `sc8280xp-lenovo-thinkpad-x13s.dtb`

## Subscribe to the bootc Image

If you already have a bootc-based system running on your X13s:

```bash
sudo bootc switch ghcr.io/tuna-os/bonito-x13s:latest
sudo reboot
```

To receive updates:

```bash
sudo bootc upgrade
```

## Build the Live ISO

The live ISO lets you boot into a GNOME desktop from a USB stick for testing or initial installation.

### Prerequisites

- `podman`
- `just`, `golang` (installed automatically by the build script if missing)
- On x86_64 hosts: `qemu-user-static` for cross-arch builds

### Build

```bash
./build-iso.sh
```

This will:
1. Build the base bootc image (`Containerfile`)
2. Build the ISO installer layer on top (`Containerfile.iso` + `src/build.sh`)
3. Clone `ondrejbudai/bootc-isos` and use its `image-builder` to produce the ISO

Output lands in `bootc-isos/output/`.

### Write to USB

```bash
sudo dd if=bootc-isos/output/*.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

### Boot on the X13s

1. Update UEFI firmware to at least version 1.56 (1.66+ recommended)
2. In BIOS: disable Secure Boot, enable Linux Boot (Beta)
3. Boot from USB (F12 at POST)

## Build and Push the bootc Image

```bash
# Push to default registry (ghcr.io/tuna-os)
./push.sh

# Push to a custom registry
REGISTRY=ghcr.io/youruser ./push.sh

# Push with a specific tag
REGISTRY=ghcr.io/youruser TAG=v1.0 ./push.sh
```

## Project Structure

```
Containerfile       Base bootc image (publishable, no ISO tooling)
Containerfile.iso   ISO installer layer (adds dracut-live, EFI, GRUB config)
src/
  build.sh          ISO layer build script
  iso.yaml          GRUB2 menu configuration for the live ISO
build-iso.sh        End-to-end ISO build orchestration
push.sh             Build and push bootc image to registry
x13s_repo/          Source files for the jlinton/x13s COPR package
bootc-isos/         Cloned ondrejbudai/bootc-isos (gitignored)
```

## Hardware Support Status (as of 2025)

| Feature | Status |
|---------|--------|
| WiFi (ath11k) | ✅ Working |
| Bluetooth | ✅ Working (MAC randomized at first boot) |
| Audio / Speakers | ✅ Working (volume may be low by default) |
| GPU (Adreno 690) | ✅ Working |
| Battery monitoring | ✅ Working (requires firmware in initrd) |
| Suspend | ⚠️ Basic support, deep sleep not working |
| Webcam | ❌ Not supported |
| Hibernate | ❌ Not supported |

## BIOS Settings

| Setting | Value |
|---------|-------|
| Secure Boot | Disabled |
| Linux Boot (Beta) | Enabled |
| Firmware version | ≥ 1.56 (1.66+ recommended) |
