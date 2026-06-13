---
sidebar_position: 1
sidebar_label: "XFCE Linux ISO"
status: alpha
---

> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.

Live ISO for [xfce-linux](https://github.com/hanthor/xfce-linux) — an immutable XFCE Wayland desktop built on freedesktop-sdk and distributed as a bootc OCI image.

Modeled after [projectbluefin/dakota-iso](https://github.com/projectbluefin/dakota-iso).

## What this produces

A UEFI-bootable live ISO that:

- Boots directly into an XFCE Wayland desktop via GDM autologin as `liveuser`
- Includes the [tuna-installer](https://github.com/tuna-os/tuna-installer) Flatpak for GUI-driven bootc installation
- Embeds the full xfce-linux OCI image in VFS containers-storage for **offline** installation (no network pull needed)
- Uses systemd-boot — no GRUB2 or shim required

## Build

```bash
# Build the ISO (requires root for podman unshare + mksquashfs)
sudo just iso-sd-boot xfce-linux

# Output: output/xfce-linux-live.iso

# Test in QEMU (serial console):
just boot-iso-serial xfce-linux

# Test in QEMU (VNC display on :10):
just boot-iso-vnc xfce-linux
```

## Debug builds

```bash
# Enables SSH (liveuser:live, root:root) in the live session:
sudo just debug=1 iso-sd-boot xfce-linux
ssh -p 2222 liveuser@localhost
```

## Architecture

Three-stage container build (`xfce-linux/Containerfile`):

1. **xfce-linux-ref** — pulls `ghcr.io/hanthor/xfce-linux:latest` to get kernel modules
2. **initramfs-builder** — Debian stage: builds a `dmsquash-live` initramfs via dracut against xfce-linux's kernel
3. **final** — xfce-linux: installs the new initramfs, pre-installs Flatpaks, runs `configure-live.sh`

ISO assembly (`xfce-linux/src/build-iso.sh`):
- systemd-boot ESP with kernel + initramfs
- `LiveOS/squashfs.img` — full rootfs + embedded OCI payload
- xorriso with protective MBR + GPT for broad UEFI compatibility

## CI

GitHub Actions builds the ISO daily and on every push, uploads to Cloudflare R2 (if secrets are configured), and boot-verifies in QEMU by waiting for `XFCE_LINUX_LIVE_READY` on the serial console.
