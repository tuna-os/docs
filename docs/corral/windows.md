---
sidebar_position: 6
title: "Windows"
---

# Windows — first-class Windows VMs

KubeVirt VMs default to a Linux-tuned device set that Windows Setup can't
boot from without extra help. `corral windows` sets up everything Windows
actually needs: UEFI, TPM, q35, Hyper-V enlightenments, and the
virtio-win driver ISO.

```bash
corral plugin install windows
corral windows create win11 --iso <url> --cpu 4 --mem 8Gi
```

## Getting a Windows ISO

Microsoft's eval-center download links are interactive/session-based, not
stable direct URLs — the corral web UI's Create VM dialog offers **quick-pick
presets** on the ISO field (select "Windows" as the boot source) for known-
working, verified-resolvable mirrors:

- An official Windows 11 build (full, ~7.2GB)
- `tiny10` / `tiny11` / `core11` — debloated Windows 10/11 builds, smaller
  and faster to import

These are the same public mirrors the [dockur/windows](https://github.com/dockur/windows)
project uses in production. For the CLI, paste a direct ISO URL with
`--iso`.

:::tip[PVC sizing is automatic]
Corral detects the ISO's real size via an HTTP HEAD request and sizes its
import PVC accordingly, with a safety margin. (Older versions hardcoded a
6GB PVC for every ISO — harmless for small Linux install images, broken
for anything bigger. Fixed after a real Windows 11 import crash-looped for
hours against an undersized PVC before anyone noticed — see
[corral#72](https://github.com/tuna-os/corral/issues/72).)
:::

## What gets set up

- `q35` machine type, UEFI firmware (`secureBoot: false`), a TPM device
- Hyper-V enlightenments (relaxed, vapic, spinlocks, etc.) for better guest
  performance
- The installer ISO imported via CDI as the first CD-ROM, boot order 2
- The `virtio-win` driver ISO attached as a **second** CD-ROM, so Windows
  Setup can see and load virtio disk/network drivers mid-install (without
  this, Setup can't find a disk to install to)
- SSH/VNC/RDP exposed through the standard Corral tailnet proxy

## Installing

1. `corral start win11`
2. Open the console — `corral web` → the VM → Console tab (VNC), or
   `corral viewer win11`
3. In Windows Setup, when it can't find a disk: **Load driver** → browse
   the second CD-ROM (`E:\amd64\<your Windows version>`) → the virtio disk
   driver appears → select it, disk shows up, continue install

## Attaching drivers to an existing VM

If you created a Windows VM outside `corral windows create` (or need to
add the driver ISO after the fact):

```bash
corral windows drivers <name>
```

## Requirements

- CDI (for ISO import via `--iso`)
- A StorageClass supporting your disk size (default 64Gi boot disk)
