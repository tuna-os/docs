---
sidebar_position: 7
title: "Rollback & Update Troubleshooting"
---

# Rollback & Update Troubleshooting

TunaOS uses [bootc](https://github.com/bootc-dev/bootc) to manage your system as a container image. Every update is atomic — if something goes wrong, you can roll back to the previous deployment in one command. This guide covers the full lifecycle: update, verify, roll back, and fix boot failures.

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

1. **The current deployment** — the system you use now
2. **The rollback target** — the previous deployment

When you run `bootc rollback`, bootc marks the previous deployment as the next boot target. After the reboot, the old image becomes the "current" deployment, and the problematic update becomes the rollback target.

> Bootc keeps the last 2 deployments by default. Bootc automatically cleans up older deployments.

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

The "Queue" line shows the rollback target — the deployment you used before.

### Step 4: Discover a Problem

Something does not work right — a driver regression, a broken dependency, or a display issue. You decide to roll back.

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

To resume normal updates at a later time, switch back to the tag:

```bash
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome
```

## Troubleshooting Boot Failures

Start with [boot and installation failures](troubleshooting.md#boot-and-installation-failures)
for boot menu recovery, emergency shells, and live ISO checks. For failed pulls,
stuck deployments, or a failed rollback, see
[update and rollback problems](troubleshooting.md#update-and-rollback-problems).

## Further Reading

- [Manage TunaOS with Bootc](tunaos/bootc-usage.md) — the full guide for bootc management
- [Bootc Resources](bootc-resources.md) — curated links and references
- [Installation Guide](installation.md) — fresh install instructions
- [FAQ](faq.md) — quick answers to common questions
- [bootc-dev/bootc](https://github.com/bootc-dev/bootc) — official bootc project
