---
sidebar_position: 6
title: "Managing with Bootc"
---

# 🐳 Managing TunaOS with Bootc

TunaOS is built on [bootc](https://github.com/bootc-dev/bootc) — bootable container images. Everything you can do with bootc, you can do with TunaOS. This guide covers day-to-day management.

## Check Current Status

```bash
bootc status
```

Shows the current deployment, the rollback target, and the container image reference:

```
$ bootc status
● TunaOS Yellowfin GNOME
  Image: ghcr.io/tuna-os/yellowfin:gnome
   Boot: booted (deploying)
  Queue: rollback → ghcr.io/tuna-os/yellowfin:gnome@sha256:abc...
```

Use `--json` for machine-readable output:

```bash
bootc status --json | jq '.status.booted.image.image'
```

## Switch Between Variants

TunaOS ships multiple variants. Switch between them with `bootc switch`:

```bash
# Switch to Albacore (AlmaLinux 10) with KDE
sudo bootc switch ghcr.io/tuna-os/albacore:kde
sudo systemctl reboot

# Switch to Yellowfin with GNOME + NVIDIA drivers
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome-gdx
sudo systemctl reboot

# Switch to Skipjack with COSMIC desktop
sudo bootc switch ghcr.io/tuna-os/skipjack:cosmic
sudo systemctl reboot
```

The next boot fetches the new image, deploys it, and boots into it.

## Update the System

```bash
# Check for updates
sudo bootc upgrade

# Apply and reboot
sudo bootc upgrade && sudo systemctl reboot
```

Bootc checks the registry for a newer version of your current image digest. If found, it pulls, deploys, and queues it for next boot.

### Automatic updates (systemd timer)

Enable the systemd timer for automatic daily checks:

```bash
sudo systemctl enable --now bootc-fetch-apply-updates.timer
```

Check timer status:

```bash
systemctl status bootc-fetch-apply-updates.timer
```

## Rollback

If an update causes issues, rollback to the previous deployment:

```bash
# From the booted system
sudo bootc rollback
sudo systemctl reboot

# Or during boot: select the previous entry in the systemd-boot menu
```

The `bootc status` output always shows what the rollback target is.

## Pre-Pull Images

Pre-pull an image before switching (useful for slow connections):

```bash
podman pull ghcr.io/tuna-os/yellowfin:gnome-hwe
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome-hwe
sudo systemctl reboot
```

## Build a Custom Derivative

TunaOS images are published as standard OCI containers on `ghcr.io`. You can extend them with a custom Containerfile:

```dockerfile
# Dockerfile
FROM ghcr.io/tuna-os/yellowfin:gnome

# Install additional packages
RUN dnf -y install --setopt=install_weak_deps=False \
    neovim \
    tmux \
    htop \
    && dnf clean all

# Add custom config
COPY ./dotfiles /etc/skel/
COPY ./custom-theme /usr/share/themes/
```

Build and deploy:

```bash
podman build -t my-custom-tunaos .
sudo bootc switch --transport containers-storage localhost/my-custom-tunaos
sudo systemctl reboot
```

### Pushing a custom image

```bash
# Tag and push to your registry
podman tag localhost/my-custom-tunaos ghcr.io/my-org/my-tunaos:latest
podman push ghcr.io/my-org/my-tunaos:latest

# Switch to use the pushed image on another machine
sudo bootc switch ghcr.io/my-org/my-tunaos:latest
```

## PIN Images by Digest

For production deployments, pin to a specific image digest:

```bash
# Find the digest
skopeo inspect docker://ghcr.io/tuna-os/yellowfin:gnome | jq '.Digest'

# Switch pinned to digest
sudo bootc switch ghcr.io/tuna-os/yellowfin@sha256:abc123...
```

This ensures every machine gets exactly the same image content.

## Clean Up Old Deployments

Bootc keeps the last 2 deployments by default. To manually clean up:

```bash
# Remove all but the current deployment
sudo bootc cleanup --only-booted

# Check disk usage of stored images
podman images | grep tuna-os
podman rmi <old-image>
```

## Troubleshooting

| Problem | Command |
|---|---|
| Check what image is deployed | `bootc status \| grep Image` |
| View boot logs | `journalctl -b -o short-monotonic` |
| Manually trigger an update check | `sudo bootc upgrade --check` |
| Cancel a staged deployment | `sudo bootc cancel` |
| Re-install bootloader | `sudo bootc install --bootloader` |

## Further Reading

- [bootc-dev/bootc](https://github.com/bootc-dev/bootc) — official project
- [Bootc Resources](/docs/bootc-resources) — curated links and references
- [Building TunaOS images](building.md) — how TunaOS images are built
- [Containerfile reference](https://github.com/tuna-os/tunaOS/blob/main/Containerfile) — the TunaOS source Containerfile
