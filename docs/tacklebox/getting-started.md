---
sidebar_position: 3
title: "Getting Started"
---

# 🚀 Getting Started with Tacklebox

This guide walks you through creating your first multi-boot USB drive using Tacklebox. By the end, you'll have a bootable drive with two TunaOS variants that you can test on real hardware or in a VM.

## Prerequisites

- A Linux machine with `podman` or `docker` installed
- Root access (for writing to block devices and running `bootc install`)
- A USB drive (≥32 GB recommended) **or** enough disk space for a test image
- `git` and `make` (or `go` 1.22+)

## Step 1: Build or Install Tacklebox

### Option A: Build from source (recommended)

```bash
git clone https://github.com/tuna-os/tacklebox.git
cd tacklebox
make build   # produces ./bin/tacklebox
sudo cp ./bin/tacklebox /usr/local/bin/
```

### Option B: Use Go directly

```bash
git clone https://github.com/tuna-os/tacklebox.git
cd tacklebox
go build -o tacklebox ./cmd/tacklebox
sudo cp tacklebox /usr/local/bin/
```

Verify the install:

```bash
tacklebox --help
```

## Step 2: Create a Recipe

Tacklebox uses a JSON recipe file to describe which images to include. Create `recipe.json`:

```json
{
  "bootc_envs": {
    "yellowfin-gnome": {
      "image": "ghcr.io/tuna-os/yellowfin:gnome",
      "live": true,
      "persistent": true
    },
    "albacore-kde": {
      "image": "ghcr.io/tuna-os/albacore:kde",
      "live": true
    }
  },
  "shared_store": {
    "dedup": true
  }
}
```

### Recipe options explained

| Field | Description |
|---|---|
| `bootc_envs` | Map of environment names → image configurations |
| `image` | OCI container image reference (bootc-based) |
| `live` | Include a live (ephemeral) boot entry |
| `persistent` | Include a persistent boot entry with writable overlay |
| `shared_store.dedup` | Deduplicate shared files across environments |

## Step 3: Build to a Disk Image (safe for testing)

Build to a loopback disk image first — no USB drive required:

```bash
sudo tacklebox build recipe.json --img multi-boot.img --output-dir ./
```

This will:
1. Pull each container image using `podman`
2. Install each image to its own subdirectory using `bootc install to-filesystem`
3. Set up a shared ESP with `systemd-boot`
4. Create a shared ostree store with deduplication
5. Produce a sparse disk image at `./multi-boot.img`

**First build:** ~20-40 minutes (pulling images + installing). Subsequent builds with the same images are much faster due to caching.

## Step 4: Test in QEMU

```bash
# Boot the image in QEMU with UEFI
qemu-system-x86_64 -m 4096 -enable-kvm \
  -drive file=multi-boot.img,format=raw,if=virtio \
  -bios /usr/share/OVMF/OVMF_CODE.fd
```

You should see the `systemd-boot` menu with entries for both Yellowfin GNOME and Albacore KDE, each with Live and Persistent options.

## Step 5: Write to a USB Drive (for real hardware)

Once you've verified the image works, write it to a USB drive:

```bash
# ⚠️ THIS DESTROYS ALL DATA ON /dev/sdX
sudo tacklebox build recipe.json --block-dev /dev/sdX
```

Alternatively, write the previously-built image:

```bash
sudo dd if=multi-boot.img of=/dev/sdX bs=4M status=progress conv=fsync
```

## Step 6: Boot and Update

Boot from the USB on a UEFI machine. Once booted into any environment, you can update it:

```bash
# Inside the booted environment
sudo tacklebox update /path/to/recipe.json
```

This re-pulls the images and runs `bootc install` into the existing environment subtrees, preserving your persistent data on the `TBOX_PERSIST` partition.

## Next Steps

- Learn about the [architecture](ARCHITECTURE.md) behind Tacklebox
- Set up [automated ISO builds](github-iso-setup.md) in GitHub Actions
- Check the [TODO](TODO.md) for upcoming features
- Try building with more environments (add Fedora, Ubuntu, or any bootc image)

## Troubleshooting

| Problem | Likely fix |
|---|---|
| `bootc install` fails with "no filesystem" | Ensure `--img` or `--block-dev` target has enough space; ≥32 GB recommended |
| QEMU shows UEFI shell instead of boot menu | Pass `-bios /usr/share/OVMF/OVMF_CODE.fd` to QEMU |
| Image pull timeout | Check network: `podman pull ghcr.io/tuna-os/yellowfin:gnome` |
| Permission denied | Tacklebox needs root for most operations (device mounting, `bootc install`) |
