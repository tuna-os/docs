---
sidebar_position: 7
title: "Rollback & Update Troubleshooting"
---

# 🔄 Rollback & Update Troubleshooting

TunaOS uses [bootc](https://github.com/bootc-dev/bootc) to manage your system as a container image. Every update is atomic — if something goes wrong, you can roll back to the previous deployment in one command. This guide walks through the full lifecycle: updating, verifying, rolling back, and troubleshooting boot failures.

## Quick Reference

| Task | Command |
|------|---------|
| Check current status | `bootc status` |
| Apply an update | `sudo bootc upgrade && sudo systemctl reboot` |
| Roll back to previous | `sudo bootc rollback && sudo systemctl reboot` |
| List all deployments | `bootc status` (see the "Queue" section) |
| Pin to a specific image | `sudo bootc switch ghcr.io/tuna-os/yellowfin@sha256:...` |

## How Rollback Works

Every time you update or switch images, bootc keeps the previous deployment on disk. The boot menu shows two entries:

1. **The current deployment** — what you're running now
2. **The rollback target** — the previous deployment

When you run `bootc rollback`, bootc marks the previous deployment as the next boot target. After rebooting, the old image becomes the "current" deployment, and the problematic update becomes the rollback target.

> Bootc keeps the last 2 deployments by default. Older deployments are automatically cleaned up.

## Worked Example: Update, Break, Roll Back

This section walks through a realistic scenario: you update your system, discover a regression, and roll back.

### Step 1: Check Your Current State

```bash
bootc status
```

Output:

```
● TunaOS Yellowfin GNOME (olive)
  Image: ghcr.io/tuna-os/yellowfin:gnome
   Boot: booted
```

Note the image digest (the `@sha256:...` part) — you'll compare against it later.

### Step 2: Apply an Update

```bash
sudo bootc upgrade
```

Bootc pulls the latest image and deploys it:

```
Pulling: ghcr.io/tuna-os/yellowfin:gnome
Deploying: ghcr.io/tuna-os/yellowfin:gnome@sha256:def456...
```

Reboot to activate:

```bash
sudo systemctl reboot
```

### Step 3: Verify the Update

After reboot, confirm you're on the new deployment:

```bash
bootc status
```

```
● TunaOS Yellowfin GNOME (navy)
  Image: ghcr.io/tuna-os/yellowfin:gnome@sha256:def456...
   Boot: booted (deploying)
  Queue: rollback → ghcr.io/tuna-os/yellowfin:gnome@sha256:abc123...
```

The "Queue" line shows the rollback target — your previous working deployment.

### Step 4: Discover a Problem

Something isn't working right — a driver regression, a broken dependency, a display issue. You decide to roll back.

### Step 5: Roll Back

```bash
sudo bootc rollback
sudo systemctl reboot
```

### Step 6: Confirm the Rollback

```bash
bootc status
```

```
● TunaOS Yellowfin GNOME (olive)
  Image: ghcr.io/tuna-os/yellowfin:gnome@sha256:abc123...
   Boot: booted
```

You're back on the previous deployment. The problematic update is now the rollback target if you ever want to try it again.

## Pinning a Specific Image

If you want to stay on a known-good version and ignore future updates, pin to a specific digest:

```bash
# Find the digest of the image you want
skopeo inspect docker://ghcr.io/tuna-os/yellowfin:gnome | jq '.Digest'

# Pin to that exact image
sudo bootc switch ghcr.io/tuna-os/yellowfin@sha256:abc123...
sudo systemctl reboot
```

To resume normal updates later, switch back to the tag:

```bash
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome
```

## Troubleshooting Boot Failures

If your system won't boot after an update, you have several recovery options.

### Option 1: Select Previous Deployment at Boot

When the system boots, the systemd-boot menu lists available deployments. Use the arrow keys to select the previous entry and press Enter. This boots into the rollback target without running any commands.

### Option 2: Boot into a Live ISO

If the boot menu itself is broken:

1. Download a TunaOS ISO from [tunaos.org/download](https://tunaos.org/download)
2. Boot from USB
3. Mount your root filesystem and inspect logs:

```bash
# Find your root partition
lsblk

# Mount it (adjust /dev/sda3 as needed)
sudo mount /dev/sda3 /mnt

# Check bootc status from the live environment
sudo bootc status --sysroot /mnt
```

### Option 3: Check Boot Logs

From a working boot or rescue entry:

```bash
# View boot logs from the current session
journalctl -b -o short-monotonic

# View logs from the previous boot
journalctl -b -1 -o short-monotonic

# Check for systemd ordering cycles or failed units
journalctl -b -p err
```

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| "Ordering cycle found" at boot | A systemd unit has a circular dependency | Boot into the rollback deployment and remove the offending unit from your custom image |
| Black screen after boot | Display driver or compositor issue | Roll back, then check if the issue is in the new image before re-updating |
| Network not available after update | NetworkManager or DNS config changed | Roll back, then file an issue with `journalctl -b -u NetworkManager` logs |
| Boot drops to emergency shell | Missing root filesystem or broken fstab | Use a live ISO to inspect `/etc/fstab` and the bootc deployment list |
| `bootc upgrade` fails to pull | Registry auth or network issue | Check `podman pull ghcr.io/tuna-os/yellowfin:gnome` first to isolate the problem |

## Further Reading

- [Managing TunaOS with Bootc](tunaos/bootc-usage.md) — full bootc management guide
- [Bootc Resources](bootc-resources.md) — curated links and references
- [Installation Guide](installation.md) — fresh install instructions
- [FAQ](faq.md) — quick answers to common questions
- [bootc-dev/bootc](https://github.com/bootc-dev/bootc) — official bootc project
