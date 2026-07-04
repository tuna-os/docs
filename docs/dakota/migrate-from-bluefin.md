---
sidebar_position: 5
sidebar_label: "Migrate from Bluefin (OSTree → Dakota)"
---

# Migrate from Bluefin to Dakota

:::warning[Back up first]
This rewrites how your system boots. Back up anything you can't afford to lose before proceeding. The migration is reversible until you run the final `commit` step.
:::

**`bootc-migrate-composefs`** performs an in-place migration from an OSTree-backed
bootc system (e.g., Fedora Bluefin) to a ComposeFS-backed system (Dakota) —
**without reinstalling**, and without losing `/home`, `/var`, `/etc`
customizations, flatpaks, container storage, or user accounts.

The primary validated migration path is **Bluefin (stable or LTS) → Dakota stable**.

:::tip[Tool repository]
Source code and releases: [tuna-os/bootc-migrate-composefs](https://github.com/tuna-os/bootc-migrate-composefs)
:::

---

## Quick start (Bluefin stable → Dakota)

### 1. Download the tool

```bash
curl -fsSL -o bmc.tar.gz \
  https://github.com/tuna-os/bootc-migrate-composefs/releases/latest/download/bootc-migrate-composefs-x86_64-unknown-linux-gnu.tar.gz
tar xzf bmc.tar.gz
sudo install -m755 bootc-migrate-composefs /usr/local/bin/
```

For **aarch64**, replace `x86_64-unknown-linux-gnu` with `aarch64-unknown-linux-gnu`.

### 2. Dry-run (no changes)

Check that your system is ready without touching anything:

```bash
sudo bootc-migrate-composefs \
  --target-image ghcr.io/projectbluefin/dakota:stable --dry-run
```

Look for:
- `Booted OSTree backend: Yes` — required
- `UEFI Boot Mode: Yes` + `NVRAM writable: Yes` — required for systemd-boot
- `ESP Free Space: ≥ 150 MB`
- `Reflink (CoW) Support: Yes`
- `ComposeFS free space: ≥ 1.1 × ostree_repo_size`

### 3. Migrate (~5–25 minutes)

```bash
sudo bootc-migrate-composefs \
  --target-image ghcr.io/projectbluefin/dakota:stable
```

Six phase headers (0–5) print as it goes. When it ends with
`=== MIGRATION COMPLETED ===`, reboot:

```bash
sudo systemctl reboot
```

Your old OSTree Bluefin entry stays in the boot menu as a fallback the whole time.

### 4. Validate the composefs boot

Log in and confirm:

```bash
cat /proc/cmdline | grep -o 'composefs=[0-9a-f]*'  # must be present
bootc status                                         # should report composefs deployment
```

Spend some time on it — run your usual workflow, check that flatpaks, containers,
and GNOME extensions all work.

### 5. Make it permanent (one-way)

Once you're confident:

```bash
sudo bootc-migrate-composefs commit
```

:::caution[/var independence after migration]
Phase 4 copies `/var` to the composefs side. After migration the two `/var` trees
are **independent** — changes on the composefs side won't be reflected if you roll
back, and vice versa. Only run `commit` when you're satisfied with the new system.
:::

This removes the OSTree fallback from the ESP, drops the GRUB2 boot artifacts,
and reclaims **~14 GiB** of OSTree object store.

---

## What's preserved

| Category | Examples |
|---|---|
| `/var` data | `/var/lib/*`, `/var/log/*`, containers, flatpak system installs, machine-id |
| User homes | dotfiles, project trees, SSH keys, wallpapers, GNOME extensions, homebrew |
| `/etc` state | `/etc/sudoers.d/*`, `/etc/hosts`, `sshd_config.d/*`, custom configs |
| Accounts | `/etc/passwd`, `/etc/shadow`, `/etc/group` — line-union merge |

---

## Rollback

Until you run `commit`, the migration is fully reversible:

1. Power on; tap the firmware boot-menu key (**F12**, **F8**, or **Esc**).
2. Pick the **Fedora** entry → GRUB → `ostree:0` → original Bluefin.

Or from a working composefs login:

```bash
sudo efibootmgr -v | grep -E 'Fedora|Linux Boot Manager'
sudo efibootmgr --bootnext <Boot####-of-Fedora>
sudo systemctl reboot
```

If the migration went wrong partway through, you can clean up without committing:

```bash
# Remove composefs boot artifacts, keep object store (faster retry)
sudo bootc-migrate-composefs undo

# Full cleanup including the object store
sudo bootc-migrate-composefs undo --full
```

---

## Supported configurations

| Configuration | Status |
|---|---|
| Bluefin stable (btrfs, x86_64/aarch64) | ✅ Validated |
| Bluefin LTS (XFS, x86_64) | ✅ Validated |
| LUKS-encrypted root | ✅ Validated |
| LVM-on-LUKS with dedicated `/var` | ✅ Validated |
| BIOS / locked NVRAM (GRUB2 bootloader) | ✅ Supported (`--bootloader grub2`) |

For XFS and LVM/LUKS details, see the
[filesystem support docs](https://github.com/tuna-os/bootc-migrate-composefs/blob/main/docs/filesystem-support.md)
in the tool repository.

---

## CLI flags

| Flag | Purpose |
|---|---|
| `--dry-run` | Print every action; touch nothing |
| `--skip-import` | Skip Phase 1 (faster when target image is mostly new content) |
| `--bootloader grub2` | Stay on GRUB2 instead of installing systemd-boot |
| `--skip-preflight` | Bypass preflight checks (use with caution) |
| `--force` | Proceed past non-fatal warnings |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "System is not booted into an OSTree deployment" | Already on composefs or non-bootc | Nothing to do |
| ENOSPC mid-pull | Not enough free space for 1.1× heuristic | Free space or grow partition, then rerun |
| `/proc/cmdline` shows `ostree=` not `composefs=` after reboot | Firmware ignored new NVRAM entry | Use firmware boot menu to pick `Linux Boot Manager` |
| SSH key auth broken post-migration | Permissions changed during `/var` copy | Boot OSTree fallback: `chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys` |
| GNOME session settings look wrong | dconf database needs recompile | `dconf update` as your user, or log out + back in |

---

## Requirements

- Booted on an OSTree-backed bootc system (Bluefin, Aurora, Silverblue…)
- UEFI firmware with writable NVRAM (for the systemd-boot path)
- Btrfs or XFS sysroot with reflink/CoW support
- ESP with ≥ 150 MB free
- ≥ `1.1 × ostree_repo_size` free on `/sysroot/composefs`
- Outbound registry access (`ghcr.io`) for Phase 2

---

## See also

- [bootc-migrate-composefs repository](https://github.com/tuna-os/bootc-migrate-composefs) — source, releases, architecture docs
- [Dakota](/dakota) — the target image
- [Bluefin CLI](/bluefin-cli) — Bluefin user documentation
