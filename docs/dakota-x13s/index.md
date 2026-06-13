---
sidebar_position: 1
sidebar_label: "Dakota X13s"
slug: /docs/dakota-x13s
status: experimental
---

> ⚠️ **Experimental** — proof of concept. Not for production use. Expect breakage.

[Project Bluefin Dakota](https://github.com/projectbluefin/dakota) on the **Lenovo ThinkPad X13s** (Qualcomm SC8280XP / aarch64).

## Download

| File | Link |
|------|------|
| **Live ISO (latest)** | [x13s-live-latest.iso](https://download.tunaos.org/dakota-x13s/x13s-live-latest.iso) |
| Checksums | [CHECKSUMS-latest.txt](https://download.tunaos.org/dakota-x13s/CHECKSUMS-latest.txt) |

## Status

Alpha — tracking upstream dakota.

**Working (inherited from bonito-x13s):** WiFi, Bluetooth, audio, GPU, battery monitoring
**Not working:** Webcam, hibernation, deep sleep

## Structure

```
Containerfile            # bootc image: dakota:aarch64 + X13s hardware support
iso/
  Containerfile          # live ISO image (dmsquash-live initramfs, arm64)
  Containerfile.builder  # Debian arm64 ISO assembly tools
  src/
    build-iso.sh         # arm64 ISO builder (BOOTAA64.EFI + DTB + X13s kargs)
    configure-live.sh    # live environment setup
    install-flatpaks.sh  # flatpak pre-installation
    flatpaks             # flatpak app list
    etc/bootc-installer/
      images.json        # installer image catalog
.github/workflows/
  build.yml              # CI: build + push dakota-x13s bootc image
  build-iso.yml          # CI: build + upload live ISO
dakota-fork/
  build-aarch64.yml      # PR/fork addition for upstream dakota aarch64 support
justfile                 # local build recipes
```

## Prerequisites

### BIOS settings (required)
- Disable Secure Boot
- Enable **Linux Boot (Beta)** mode
- Firmware version ≥ 1.66 recommended

### Build tools
```
podman  just
```

## Quick start

### 1. Get a dakota:aarch64 image

Option A — PR/fork upstream dakota and add aarch64 CI:
```
# Add dakota-fork/build-aarch64.yml to projectbluefin/dakota workflows
# Then update Containerfile FROM line to your fork's image
```

Option B — build locally (requires BuildStream):
```bash
git clone https://github.com/projectbluefin/dakota
cd dakota
bst --option arch aarch64 build oci/bluefin.bst
```

### 2. Build the X13s bootc image

```bash
podman build --platform linux/arm64 -t ghcr.io/tuna-os/dakota-x13s:latest .
podman push ghcr.io/tuna-os/dakota-x13s:latest
```

### 3. Build the live ISO

```bash
just iso-sd-boot
# Output: output/x13s-live.iso
```

### 4. Flash to USB

```bash
just flash-usb /dev/sdX
```

### 5. Boot and install

1. Boot from USB on the X13s
2. GNOME live environment loads with the Dakota installer
3. Install to NVMe — bootc handles subsequent OTA updates

## Upgrading an existing bootc system

```bash
sudo bootc switch ghcr.io/tuna-os/dakota-x13s:latest
sudo reboot
```

## Hardware notes

### What's needed vs stock Dakota

| Component | Mechanism |
|---|---|
| Qualcomm firmware | Extracted from `jlinton/x13s` COPR (`qcom-firmware`) |
| pd-mapper daemon | Extracted from COPR, enabled via systemd |
| Kernel args | `bootc/kargs.d/01-x13s.toml` — applied at install time |
| Module load order | `modules-load.d/x13s.conf` — pd-mapper before q6v5_pas |
| Dracut initrd | Firmware blobs included, q6v5_pas excluded from initrd |
| DTB (live ISO) | Extracted from kernel dtb dir, embedded in ESP |

### Kernel

Dakota uses the GNOME OS kernel (freedesktop-sdk). As of kernel 6.3+, the
SC8280XP SoC is supported upstream. The DTB
(`sc8280xp-lenovo-thinkpad-x13s.dtb`) ships in the kernel's dtb directory.

### aarch64 dakota upstream

The upstream `projectbluefin/dakota` only publishes x86_64. The `dakota-fork/`
directory contains the workflow additions needed to build and publish an aarch64
image. Submit as a PR to upstream or maintain a fork.
