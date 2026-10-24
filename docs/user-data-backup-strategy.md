---
sidebar_position: 7.6
sidebar_label: "User data backup & retention"
title: "Back up user data on an immutable TunaOS system"
description: "Learn which folders survive a rollback, how to back up /home, /var and /etc, and how to restore your files after data loss."
---

# Back Up User Data on an Immutable System

TunaOS keeps your system image safe with [bootc](https://github.com/bootc-dev/bootc). An update is atomic, and you can roll back in one command. But bootc protects the operating system, not your files. Your documents, settings and application data live in separate folders. You must back them up yourself.

This guide explains which folders survive a rollback. It shows how to back up your files before a big change. It lists tools for backup and restore.

:::note[What this guide covers]

- Which folders are safe and which are not.
- How to back up your files before an update.
- Tools for backup and for automatic backups.
- How to restore files after loss or corruption.

:::

## Persistent and Ephemeral Storage

TunaOS splits your disk into two parts. The system image holds the operating system. Your data lives outside it.

The system image holds read-only folders. These change only when you update the system:

- `/usr` — system programs and libraries
- `/bin`, `/sbin` — system binaries
- `/lib`, `/lib64` — system libraries
- `/boot` — boot files

Your data lives in writable folders. These keep their contents across an update, a rollback or a reboot:

- `/home` — your files, settings and application data
- `/var` — application data, logs and caches
- `/etc` — system and application settings

Most of the time you only need to worry about `/home`, `/var` and `/etc`.

:::caution[/home is safe, but not backed up]
A bad command, a dead disk or a mistaken image switch can still erase it.
:::

Some folders are temporary. They clear on reboot:

- `/tmp` — short-lived files
- the `bootc usr-overlay` changes to `/usr` — gone on reboot

You do not need to back these up.

## Before You Upgrade

Back up your most important files before a big change. A normal update is safe. A switch to a new image or a rollback is riskier, because a wrong choice can leave your data in an unexpected state.

1. Find the files that matter. Look in `/home/<you>/` for documents, photos, config folders and projects.
2. Pick a backup location. Use a USB drive, a second disk or a network share. Keep it off the system disk.
3. Make a full backup of `/home`. See the tools below.
4. Make a separate backup of `/var` and `/etc` if you run servers, databases or custom services.
5. Verify the backup. Open a file from it. A backup you cannot read is no backup.

:::tip[Back up before, not after]
Do the backup before you start the update. If the update breaks your boot, you may not reach the system to back up later.
:::

## Backup Tools

Choose a tool for the job. All of them run in the terminal.

### rsync — copy to another place

`rsync` copies files to another location. It sends only the parts of a file that changed. This makes it fast for repeated backups to a USB drive or a network share.

```bash
# Copy your home folder to a USB drive at /mnt/backup
rsync -a --delete /home/<you>/ /mnt/backup/home/
```

Use `-a` to keep permissions and dates. Use `--delete` so removed files also leave the backup. This keeps the backup an exact copy. It also means a file you delete on the system is gone from the backup too.

### tar — make a snapshot archive

`tar` packs a folder into one file. You get a single archive for a point in time. It is simple and easy to store.

```bash
# Make a compressed archive of your home folder
tar -czf /mnt/backup/home-$(date +%F).tar.gz /home/<you>/
```

To restore, unpack the archive into place:

```bash
tar -xzf /mnt/backup/home-2026-01-15.tar.gz -C /
```

### restic — encrypted, incremental backups

`restic` makes encrypted, incremental backups. It stores each file once, even across many backups. You can point it at a local drive, a NAS or a cloud store such as Amazon S3 or Backblaze B2.

```bash
# Set up an encrypted backup repo on a USB drive
restic init --repo /mnt/backup/restic-repo

# Back up your home folder
restic backup /home --repo /mnt/backup/restic-repo --exclude='.cache'

# List the snapshots restic holds
restic list --repo /mnt/backup/restic-repo
```

Install it with your package manager:

```bash
sudo dnf install -y restic
```

### borgbackup — like restic, a different tool

`borgbackup` does the same core job as restic. It makes encrypted, incremental, deduplicated backups. Choose whichever you prefer. Both are good.

Install it from EPEL, which you may need to enable first:

```bash
sudo dnf install -y borgbackup
```

:::note[Pick one tool and stick with it]
Do not run several backup tools over the same data. They take locks over the same files and waste space. Pick one tool for each backup location.
:::

## Automatic Backups with a Timer

A manual backup only helps if you remember to run it. A systemd timer runs it for you. Here is a daily backup with restic.

Create the backup script at `/usr/local/sbin/backup-home.sh`:

```bash
#!/bin/bash
set -euo pipefail
restic backup /home --repo /mnt/backup/restic-repo --exclude='.cache'
restic prune --repo /mnt/backup/restic-repo
```

Make it runnable:

```bash
sudo chmod +x /usr/local/sbin/backup-home.sh
```

Create a service that runs it at `/etc/systemd/system/backup-home.service`:

```ini
[Unit]
Description=Daily home folder backup

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/backup-home.sh
```

Create a timer that runs it once a day at `/etc/systemd/system/backup-home.timer`:

```ini
[Unit]
Description=Run the daily home folder backup

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Turn it on:

```bash
sudo systemctl enable --now backup-home.timer
```

Check the timer state:

```bash
systemctl status backup-home.timer
```

:::caution[Test the timer once]
Run the service by hand before you trust the timer:

```bash
sudo systemctl start backup-home.service
```

:::

## External Storage

Keep a copy off the system disk. Any of these work.

### USB drive

Plug in a USB drive. Back up to it by hand or with the timer above. Unplug it and store it somewhere safe. An unplugged drive survives a disk failure and most malware.

### NAS (network storage)

A NAS sits on your network. Point rsync or restic at it. This keeps a copy on another machine in your home. It does not protect against a house fire or theft. Keep one copy elsewhere for that.

### Cloud storage

restic and borgbackup can back up to cloud stores that speak the S3 protocol. Examples are Amazon S3, Backblaze B2 and many others. You pay for the space you use. Keep your backup password safe. If you lose it, the encrypted data is gone.

## Restore Your Files

The restore depends on the tool you used.

### Restore files from rsync or tar

Copy the files back into place:

```bash
# From a tar archive
tar -xzf /mnt/backup/home-2026-01-15.tar.gz -C /

# From an rsync backup, copy the files you need
cp /mnt/backup/home/Documents/report.pdf /home/<you>/Documents/
```

### Restore files from restic

Restore the latest snapshot into a folder. Your files land under the path you backed up:

```bash
restic restore latest --repo /mnt/backup/restic-repo --target /restore
```

To restore one path, add it after the target:

```bash
restic restore latest --repo /mnt/backup/restic-repo --target /restore home/<you>/Documents
```

## Application-Specific Data

Some programs hold data you must handle on their own. Do not copy their live files while they run.

### Databases

Copy those files mid-write, and you get a broken database.

```bash
# Dump a PostgreSQL database to a file
sudo -u postgres pg_dump mydb > mydb.sql
```

If you copy the data files instead, stop the service before you restore them.

### Development projects

Projects in `/home` are already covered by the `/home` backup. Git repositories are small, because git stores only changes. Keep a remote copy on a service like GitHub. Then a backup is one `git clone` away.

### Browser data

Bookmarks, passwords and sessions live in `/home/<you>/.config`. A `/home` backup covers them. For peace of mind, sign in to the browser and turn on sync. Then your data lives in the browser provider too.

## Keeping Backups Safe Over Time

A backup is only useful if it is fresh and you can read it.

- **Back up on a schedule.** A timer that runs daily or weekly beats a backup you remember once.
- **Keep at least one copy off the machine.** A fire or theft takes the whole computer. A cloud or off-site copy survives.
- **Test the restore.** Try to read a file from the backup once a month. A backup you never opened may be corrupt.
- **Keep old snapshots.** restic and borgbackup keep many versions cheaply. They let you undo a file you deleted by mistake.
- **Protect the password.** restic and borgbackup encrypt their repos. Lose the password and the data is gone. Write it down and store it where you can find it later.

---

## Related Documentation

- [customization guide](./layering.md) — which folders are persistent, and how to change the system image
- [Rollback & Update guide](./bootc-rollback.md) — update, roll back, and fix a boot failure
- [bootc resources](./bootc-resources.md) — links and references for bootc
- [FAQ](./faq.md) — common questions
