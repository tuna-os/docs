---
sidebar_position: 2
sidebar_label: "Migrating from Bluefin"
---

# Migrating an existing Bluefin to Dakota (ComposeFS)

[`bootc-migrate-composefs`](https://github.com/tuna-os/bootc-migrate-composefs)
converts an in-place, already-installed **OSTree-backed Bluefin** system into
a **ComposeFS-backed Dakota** system — no reinstall, and `/home`, `/var`,
`/etc` customizations, flatpaks, container storage, and user accounts all
survive the trip.

The previous OSTree deployment stays in the boot menu as a fallback the
whole time, and the migration is reversible up until you run `commit`.

## Interactive wizard

The easiest way in is the terminal wizard — no flags to remember:

```bash
sudo bootc-migrate-composefs tui
```

It walks through target image selection, a plain-English review of exactly
what's about to happen, and a live phase-by-phase progress view with
scrollable logs. Browsing the wizard doesn't require root — only pressing
**Run** does, since that's when it actually spawns the migration.

<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
  <img src="/img/screenshots/dakota-migrate-welcome.png" alt="Welcome screen" />
  <img src="/img/screenshots/dakota-migrate-select-image.png" alt="Select target image" />
  <img src="/img/screenshots/dakota-migrate-options.png" alt="Configure options" />
  <img src="/img/screenshots/dakota-migrate-review.png" alt="Review and run" />
  <img src="/img/screenshots/dakota-migrate-running.png" alt="Migration running" />
  <img src="/img/screenshots/dakota-migrate-complete.png" alt="Migration complete" />
</div>

## Quick start (flags, no wizard)

```bash
# 1. Get the migrator
curl -fsSL -o bmc.tar.gz \
  https://github.com/tuna-os/bootc-migrate-composefs/releases/latest/download/bootc-migrate-composefs-x86_64-unknown-linux-gnu.tar.gz
tar xzf bmc.tar.gz
sudo install -m755 bootc-migrate-composefs /usr/local/bin/

# 2. Dry-run — makes no changes, just checks your system is ready
sudo bootc-migrate-composefs --target-image ghcr.io/projectbluefin/dakota:stable --dry-run

# 3. Migrate (~5–25 min depending on cache/network)
sudo bootc-migrate-composefs --target-image ghcr.io/projectbluefin/dakota:stable

# 4. Reboot — the new composefs entry is the default
sudo systemctl reboot

# 5. Confirm, then make it permanent
cat /proc/cmdline | grep -o 'composefs=[0-9a-f]*'
sudo bootc-migrate-composefs commit   # one-way; removes the OSTree fallback
```

:::warning
Back up anything you can't afford to lose first. This rewrites how your
system boots. It's reversible until you run `commit` — but treat it as risky
until you've rebooted and confirmed everything works.
:::

For the full phase-by-phase breakdown, filesystem support (Bluefin LTS/XFS,
LVM, LUKS, dedicated `/var`), rollback, and troubleshooting, see the
[project README](https://github.com/tuna-os/bootc-migrate-composefs#usage--end-to-end-walkthrough).

## See also

- [Dakota](/docs/dakota) — the image you're migrating to
