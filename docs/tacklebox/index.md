---
sidebar_position: 1
sidebar_label: "Tacklebox"
status: stable
---

**Tacklebox** is a high-performance orchestrator for `bootc` that provisions multi-tenant, updatable, and deduplicated bootable media (USB drives, SD cards, or raw disk images).

Born from the `superiso` project, Tacklebox evolves the concept from static ISOs to dynamic, writable GPT disks with a unified bootloader.

## ✨ Key Features

*   **🚀 Multi-Boot Dictatorship:** Automatically installs and manages `systemd-boot` on a unified ESP, resolving conflicts between Ostree and Composefs backends.
*   **🧠 Intelligent Deduplication:** Leverages a shared `containers/storage` and `ostree` repo across all bootable environments on a single disk.
*   **🔄 Integrated Update Lifecycle:** Update any OS on the drive in-place with `tacklebox update`. It safely rotates BLS entries and extracts new kernels/initrd files.
*   **💾 Modal Booting:** Supports both **Live (ephemeral)** and **Persistent** boot entries for the same OS image via smart kernel argument manipulation.
*   **📂 Shared Persistence:** Smart OverlayFS mounts allow sharing files in `/home/liveuser` across all OSes while isolating desktop-specific configurations (KDE vs GNOME).
*   **📦 Distribution Ready:** Built-in support for creating sparse `.img.xz` files for easy sharing.
*   **🛡️ Integrity First:** Automatically enables `fs-verity` on partitions to support modern container backends like Composefs.

## 🏗️ Architecture

### Automatic initramfs preparation
Tacklebox ships with a custom dracut module (`src/dracut/95tbox-root/`) that handles multi-tenancy at boot time:
1.  Locates the target OS subdirectory on the `TBOX_STORE` partition.
2.  Bind-mounts it to `/sysroot`.
3.  Sets up the persistent home overlay if requested.

Before placing the initramfs on the ESP, Tacklebox checks whether the image's
initramfs already contains the required modules. If not, it rebuilds it
automatically by running `dracut` inside a privileged container derived from
the source image — no pre-processing of your images required. The rebuilt
initramfs is cached by OCI image digest, so the overhead only occurs on the
first build or after an image update.

**Modules injected automatically:**

| Target type | Modules added |
|---|---|
| ISO (`--iso`) | `dmsquash-live`, `tbox-root` |
| Block / USB | `tbox-root` |

If your image already ships the required modules (e.g. pre-built `superiso-live`
images), add `"skip_initramfs_rebuild": true` to the environment in your recipe
to skip the rebuild and use the image's initramfs as-is.

### Composefs Support
Tacklebox automatically handles the unique requirements of the Composefs backend, including:
*   Enabling `fs-verity` during partition formatting.
*   Managing the required bootloader metadata that `bootc` expects.
*   Generating specialized BLS entries with `rootflags=subvol=...` mapping.

## 🛠 Usage

### Build a Multi-Boot Image
```bash
sudo tacklebox build recipe.json --xz
```

### Provision a Physical USB Drive
```bash
sudo tacklebox build recipe.json /dev/sda
```

### Refresh an Existing USB / Image
Re-installs all environments from a recipe without wiping the `TBOX_PERSIST` partition.
Useful when you add an env to the recipe, change image refs, or need to refresh stale deployments.
```bash
sudo tacklebox update recipe.json /dev/sda
```

### Check Installed Environments
```bash
# Auto-detect the TBOX_STORE partition (run from a booted tacklebox env)
tacklebox status

# Inspect a specific store mount or raw image file
tacklebox status /mnt/tbx
tacklebox status /path/to/tacklebox.img
```

## 📋 Recipe Schema

Tacklebox is driven by simple JSON recipes:

```json
{
  "media_name": "Tuna-Toolkit",
  "size": "60G",
  "shared_store": {
    "format": "ext4"
  },
  "partitions": {
    "esp": "1G",
    "store": "50G",
    "persist": "8G"
  },
  "bootable_environments": [
    {
      "id": "bluefin",
      "image": "ghcr.io/ublue-os/bluefin:stable",
      "modes": ["live", "persistent"]
    },
    {
      "id": "bazzite",
      "image": "ghcr.io/ublue-os/bazzite:stable",
      "modes": ["live"]
    },
    {
      "id": "bluefin-prepared",
      "image": "ghcr.io/tuna-os/superiso-live-bluefin:latest",
      "skip_initramfs_rebuild": true,
      "modes": ["live", "persistent"]
    }
  ]
}
```

The `partitions` block is optional. By default Tacklebox uses ESP=1 GiB,
Persist=2 GiB, and Store=remainder. Provide explicit sizes when you need a
larger ESP (more kernels), more persistent space, or want to leave headroom.

`skip_initramfs_rebuild` is optional (default `false`). Set it to `true` for
images that already include `dmsquash-live` and `tbox-root` in their initramfs
(e.g. pre-built `superiso-live` images) to skip the rebuild step and save
2–3 minutes per environment on the first build.

> **Sizing rule of thumb:** ostree-backed bootc deployments occupy ~10 GiB
> each, composefs-backed ones ~5 GiB. A 30 GiB recipe is enough for one
> ostree env; three need ~60 GiB. Tacklebox prints a warning before
> partitioning when the math doesn't add up — see `estimateStoreUsage`.

## ⚡ Flags

| Flag | What it does |
|---|---|
| `-b, --output-base DIR` | Where intermediate artifacts and `tacklebox.img` are written. |
| `--xz` | Compress the resulting image with `xz -T0`. |
| `-y, --yes` | Skip the destructive-target confirmation. Required in CI / non-tty contexts. |
| `-v, --verbose` | Stream subprocess output and command traces. Default is quiet (stderr still captured on failure). |
| `--parallel-install N` | **Experimental.** Run N bootc installs concurrently. Bounded by slowest env, not sum — but shares `/var/lib/containers`. Default 1 (sequential). |
| `--unsafe` | Opt out of USB-corruption-resistance defaults. By default Tacklebox emits BLS entries with `rootflags=commit=1,errors=remount-ro` (and `subvol=...` merged for composefs), which shrinks the ext4 metadata commit interval from 5 s to 1 s and remounts read-only on FS errors. Negligible perf cost on flash; meaningful protection against half-written rootfs on unexpected USB removal. Use `--unsafe` only when you're building an image-file you don't intend to plug into anything. |

## 🏗 Requirements

*   Go 1.22+
*   `podman` & `bootc`
*   `sgdisk` (gdisk)
*   `mkfs.vfat`, `mkfs.ext4` (with verity support)
*   `xz` (for compressed outputs)

## 👩‍💻 Development

Tacklebox uses `just` for common development tasks:

```bash
# Build the binary
just build

# Provision a test USB drive
just provision-usb device=/dev/sda recipe=examples/multi-test.json

# Build a compressed distribution image
just build-xz
```

---
*Part of the [Tuna OS](https://github.com/tuna-os) ecosystem.*
