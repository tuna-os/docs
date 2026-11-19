---
title: "User Data Backup and Retention"
---

# User Data Backup and Retention

A bootc rollback restores the system image. It does not restore your files. This guide shows what to back up and how to plan retention.

## What bootc protects

Updates and rollbacks change the image. See [Rollback and update problems](bootc-rollback.md). Your data lives outside the image.

| Location | Kept across updates | Back up |
| --- | --- | --- |
| `/home` | Yes | Yes |
| `/var` | Yes | Yes, for app data you need |
| `/etc` | Yes | Yes, for local changes |
| Flatpak app data under `~/.var/app` | Yes | Yes |
| Homebrew packages | Yes | No. Save a package list instead |
| Image contents under `/usr` | Replaced by each update | No |

A rollback does not undo a change to your files. A failed update can still leave app data in a new format. Back up before every major update.

## Choose a retention plan

Use the 3-2-1 rule:

1. Keep three copies of your data.
2. Store them on two different media.
3. Keep one copy off site.

Pick how long to keep each copy. A common plan:

- Daily copies for the last 7 days.
- Weekly copies for the last 4 weeks.
- Monthly copies for the last 6 months.

Adjust the plan to your needs. Delete old copies on a schedule. Test a restore at least once a quarter.

## Back up before an upgrade

Copy your home directory to an external drive before you run `sudo bootc upgrade`:

```bash
rsync -aHAX --info=progress2 ~/ /run/media/$USER/backup-drive/home-backup/
```

Then update:

```bash
sudo bootc upgrade && sudo systemctl reboot
```

The mount path depends on your drive name. Check it with `lsblk`.

## Backup tools

The repository does not ship or test a backup tool. These tools are common on Linux. Check that each one works on your variant before you rely on it.

- `rsync` for simple copies.
- `restic` or `borg` for encrypted, deduplicated snapshots with retention rules.
- A desktop backup app from Flathub, such as Pika Backup. We have not verified its availability.

## Automatic backups

Use a systemd user timer to run a backup each day. This example is a sketch. Test it before you trust it.

Create `~/.config/systemd/user/backup.service`:

```ini
[Unit]
Description=Daily home backup

[Service]
Type=oneshot
ExecStart=/usr/bin/rsync -aHAX %h/Documents /run/media/%u/backup-drive/Documents
```

Create `~/.config/systemd/user/backup.timer`:

```ini
[Unit]
Description=Run the home backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Enable it:

```bash
systemctl --user enable --now backup.timer
```

## Use external storage

- Use a drive you disconnect after the backup.
- Encrypt drives that leave your home. Use LUKS or the encryption in your backup tool.
- Keep one copy in a different place, such as cloud storage or a drive at another site.

## Restore your data

1. Install or boot into TunaOS.
2. Mount the backup.
3. Copy the files back:

   ```bash
   rsync -aHAX /run/media/$USER/backup-drive/home-backup/ ~/
   ```

4. Reinstall Flatpak apps and Homebrew packages from your saved lists.

[bootc-migrate](/docs/bootc-migrate) carries `/home`, `/var` and `/etc` across when you move to a TunaOS image. A backup is still the safe choice before a migration.

## Save package lists

List your Flatpak apps and Homebrew packages so you can restore them:

```bash
flatpak list --app --columns=application > ~/flatpak-apps.txt
brew list > ~/brew-packages.txt
```

## App-specific data

Some apps keep data in a database or a service. Stop the app before you copy its files. Use the export function of the app where one exists.
