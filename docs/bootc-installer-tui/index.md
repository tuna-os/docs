---
sidebar_position: 1
sidebar_label: "bootc-installer-tui"

status: archived
---

:::caution[Archived]

The `tuna-os/bootc-installer-tui` repository is **archived** (read-only, last
push 2026-07-19). This page is kept for historical reference only; the TUI
installer is no longer under development and no new builds or releases are
published from this repo. For current installers see
[bootc-installer](https://github.com/tuna-os/bootc-installer) (GTK) and the
[tuna-installer GUI frontends](https://github.com/tuna-os/tuna-installer-cosmic)
(`cosmic`/`kde`/`niri`/`xfce`), all of which drive the same
[fisherman](https://github.com/tuna-os/fisherman) backend.
:::

A terminal UI installer for bootc-based operating systems, powered by [fisherman](https://github.com/tuna-os/fisherman).

## Features

- **11-step wizard**: welcome → network → image → disk → filesystem → encryption → user → SSH keys → confirm → progress → done
- **Live progress**: streams fisherman JSON events and updates a progress bar in real time
- **Disk encryption**: optional LUKS full-disk encryption with passphrase
- **SSH key import**: from GitHub, GitLab, or pasted manually
- **Flexible filesystem**: ext4, xfs, or btrfs

## Usage

```bash
sudo bootc-installer-tui
```

## Building

```bash
go build -o bootc-installer-tui ./cmd/bootc-installer-tui
```

## Requirements

- `fisherman` must be installed and on `$PATH` (or at `/usr/bin/fisherman`)
- Root privileges required for disk operations

## Recipe format

The installer writes a recipe to `/tmp/bootc-installer-recipe.json` and runs:

```
fisherman install --recipe /tmp/bootc-installer-recipe.json
```

---

Part of the [TunaOS](https://tunaos.org) ecosystem. [Docs](https://tunaos.org) · [Contributing](https://github.com/tuna-os/bootc-installer-tui/blob/main/CONTRIBUTING.md)