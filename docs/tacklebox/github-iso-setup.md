---
sidebar_position: 4
title: "github iso setup"
---

This guide walks you through creating a GitHub repository that builds a
UEFI-bootable ISO from one or more bootc container images using Tacklebox.

---

## How ISO builds work

`tacklebox build recipe.json --iso output.iso` uses the **IsoTarget** path:

1. Each bootable environment is packed into a squashfs file
   (`LiveOS/<id>.rootfs.sfs`) using `podman image mount` + `mksquashfs`.
2. Before copying the initramfs to the ESP, Tacklebox checks whether the image's
   initramfs contains the modules required for live ISO boot (`dmsquash-live`,
   `tbox-root`). If not, it rebuilds the initramfs automatically by running
   `dracut` inside a privileged container. The result is cached by OCI image
   digest — the rebuild only happens on the **first** build or after an image
   update.
3. The systemd-boot EFI binary is extracted from the first image in your recipe.
4. `xorriso` wraps everything into an ISO9660+El Torito image that boots on
   real hardware and QEMU.

At runtime the ISO boots via `dmsquash-live`. Each env's squashfs is loop-mounted
and an overlayfs on top gives you a writable (but ephemeral) root. **No disk is
written.** Persistent mode is not supported for ISO targets — use a block target
(USB drive) if you need persistence.

**Performance note:** The first build is ~2–3 min slower per environment due to
the dracut rebuild. Subsequent builds hit the cache and add no overhead. If your
images already include `dmsquash-live` and `tbox-root`, set
`"skip_initramfs_rebuild": true` in the env to skip the rebuild.

---

## Repository layout

A minimal repo looks like this:

```
my-iso-repo/
├── .github/
│   └── workflows/
│       └── build-iso.yml      # CI workflow (see below)
├── recipes/
│   └── my-iso.json            # your recipe
└── README.md
```

---

## Writing a recipe

ISO recipes are identical to block recipes except:

- Only `"modes": ["live"]` is meaningful (ISOs are always ephemeral).
- `size` is used for internal staging only; the final ISO is as large as it
  needs to be.
- `partitions` is ignored for ISO targets.

```json
{
  "media_name": "MY_ISO",
  "size": "20G",
  "shared_store": {
    "format": "ext4",
    "compression": "zstd"
  },
  "bootable_environments": [
    {
      "id": "bluefin",
      "image": "ghcr.io/ublue-os/bluefin:stable",
      "desktop": "gnome",
      "modes": ["live"]
    },
    {
      "id": "bazzite",
      "image": "ghcr.io/ublue-os/bazzite:stable",
      "desktop": "kde",
      "modes": ["live"]
    },
    {
      "id": "bluefin-prepared",
      "image": "ghcr.io/tuna-os/superiso-live-bluefin:latest",
      "skip_initramfs_rebuild": true,
      "modes": ["live"]
    }
  ]
}
```

**Sizing rule of thumb:** each squashfs is roughly 5–8 GiB. A two-env ISO
needs ~16 GiB of free disk during the build; the output `.iso` will be
smaller (squashfs is already compressed).

---

## Building locally

```bash
# Install build dependencies (Fedora/rpm-ostree host)
sudo dnf install -y xorriso mtools squashfs-tools dosfstools \
                    systemd-boot podman

# Build tacklebox
git clone https://github.com/tuna-os/tacklebox
cd tacklebox
go build -o tacklebox ./cmd/tacklebox

# Build the ISO
sudo ./tacklebox build recipes/my-iso.json --iso /tmp/my-iso.iso
```

The output ISO is a hybrid image: it boots from a USB drive
(`sudo dd if=/tmp/my-iso.iso of=/dev/sdX bs=4M status=progress`) and from
a virtual CD-ROM in QEMU.

---

## GitHub Actions workflow

Save this as `.github/workflows/build-iso.yml`:

```yaml
name: Build ISO

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
  # Build a fresh ISO every week even without commits
  schedule:
    - cron: '0 4 * * 1'

env:
  RECIPE: recipes/my-iso.json
  ISO_NAME: my-iso.iso

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    permissions:
      contents: write      # needed to upload a release asset
      packages: read       # needed to pull ghcr.io images

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      # Free up ~30 GB on the runner's root filesystem
      - name: Free disk space
        uses: jlumbroso/free-disk-space@main
        with:
          tool-cache: false
          android: true
          dotnet: true
          haskell: true
          large-packages: false
          docker-images: true
          swap-storage: false

      - name: Install build dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y --no-install-recommends \
            xorriso mtools squashfs-tools dosfstools \
            systemd-boot systemd-boot-efi gdisk podman

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build tacklebox
        run: |
          git clone --depth=1 https://github.com/tuna-os/tacklebox tacklebox-src
          cd tacklebox-src
          go build -o ../tacklebox ./cmd/tacklebox

      - name: Pre-pull images
        run: |
          # Pull all images from the recipe in parallel
          jq -r '.bootable_environments[].image' "$RECIPE" | \
            xargs -P4 -I{} sudo podman pull {}

      - name: Build ISO
        run: |
          sudo mkdir -p /mnt/tbx
          sudo ./tacklebox build "$RECIPE" \
            --iso "/mnt/tbx/$ISO_NAME" \
            -b /mnt/tbx

      - name: Verify ISO
        run: sudo ./tacklebox verify "/mnt/tbx/$ISO_NAME"

      - name: Upload ISO artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ env.ISO_NAME }}
          path: /mnt/tbx/${{ env.ISO_NAME }}
          retention-days: 14

      # Optional: create a GitHub Release on tags
      - name: Create release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: /mnt/tbx/${{ env.ISO_NAME }}
```

### What each stage does

| Stage | What happens |
|---|---|
| Free disk space | Recovers ~30 GiB needed for squashfs builds on free runners |
| Install build deps | `xorriso` (ISO assembly), `mtools` (FAT manipulation), `squashfs-tools`, `dosfstools`, `systemd-boot` |
| Log in to GHCR | Allows pulling private or rate-limited container images |
| Build tacklebox | Compiles the binary from source; pin to a tag for reproducibility |
| Pre-pull images | Parallel pull so build step doesn't time out on network I/O |
| Build ISO | Runs `tacklebox build --iso`; initramfs rebuild is automatic if needed |
| Verify ISO | Sanity-checks BLS entries and squashfs distinctness |
| Upload artifact | ISO is available for 14 days from the Actions run |
| Create release | Attaches the ISO to a GitHub Release when you push a tag |

---

## Pinning the tacklebox version

For reproducible builds, pin tacklebox to a specific commit or tag:

```yaml
- name: Build tacklebox
  run: |
    git clone --depth=1 --branch v0.3.0 \
      https://github.com/tuna-os/tacklebox tacklebox-src
    cd tacklebox-src && go build -o ../tacklebox ./cmd/tacklebox
```

Alternatively, include tacklebox as a **git submodule**:

```bash
git submodule add https://github.com/tuna-os/tacklebox tacklebox
```

Then in the workflow:

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive

- name: Build tacklebox
  run: |
    cd tacklebox && go build -o ../tacklebox ./cmd/tacklebox
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Boot stalls at `initrd-switch-root` | Image lacks `dracut`; initramfs rebuild failed silently | Check build logs for dracut errors; set `"skip_initramfs_rebuild": true` and provide a pre-prepared image if dracut is not available |
| First build unexpectedly slow | Dracut initramfs rebuild running (normal on first build per image) | Expected; subsequent builds use the cache |
| `tacklebox verify` fails: "same squashfs hash" | Two envs resolved to the identical container image | Use distinct image refs or check your registry tags |
| `xorriso` not found | Missing dep | `sudo apt-get install xorriso` |
| Build runs out of disk | squashfs staging fills `/` | Move output to `/mnt` with `-b /mnt/tbx`, or increase free disk |
| Runner timeout | Large images, slow pull or dracut rebuild | Pre-pull with `podman pull`; increase `timeout-minutes`; set `skip_initramfs_rebuild: true` for pre-prepared images |
| `systemd-bootx64.efi` not found in image | Image doesn't ship `systemd-boot` | Ensure your base image includes the `systemd-boot` package |
