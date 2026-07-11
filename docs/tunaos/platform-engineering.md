---
sidebar_position: 10
title: "Platform Engineering"
---

# 🏗️ Platform Engineering with TunaOS

TunaOS is built for platform engineers. Every aspect — from the immutable bootc foundation to the tooling ecosystem — is designed to make infrastructure reliable, reproducible, and manageable at scale.

## Why TunaOS for Platform Engineering

| Need | TunaOS Solution |
|---|---|
| Immutable OS | Bootc images — atomic updates and rollbacks |
| Reproducible builds | Container-native images built from Containerfiles |
| Fleet management | `bootc switch` / `bootc upgrade` across machines |
| CI/CD | GitHub Actions build pipeline with OCI registry |
| Developer tooling | Homebrew pre-installed, Tavern GUI, Bluefin CLI |
| VM management | Corral — QEMU/KVM and KubeVirt backends |
| USB provisioning | Tacklebox — multi-boot media creation |
| GPU workloads | GDX variants with NVIDIA/CUDA |
| Desktop choice | GNOME, KDE, COSMIC, Niri, XFCE |

## Immutable Infrastructure

TunaOS uses bootable containers (bootc) — the same image-based approach as OpenShift CoreOS:

```bash
# Every machine runs from an OCI image
sudo bootc status

# Updates are image pulls + reboots
sudo bootc upgrade && sudo systemctl reboot

# Rollback is one command
sudo bootc rollback && sudo systemctl reboot
```

This means your entire fleet is defined by a container image digest. No configuration drift, no snowflake servers.

## CI/CD Pipeline

TunaOS images are built in GitHub Actions and published to `ghcr.io`. The pipeline:

1. **PR** → build test image → run smoke tests
2. **Merge to main** → build all variants → push to registry
3. **Tagged release** → build + sign + push + create GitHub release

You can fork this pipeline for your own custom images. See [Building TunaOS](building.md) and [CI/CD](ci-cd.md) for details.

## Fleet Management

Manage multiple machines with bootc:

```bash
# SSH into each machine and update
for host in dev-box-1 prod-box-1 prod-box-2; do
  ssh "$host" "sudo bootc upgrade && sudo systemctl reboot"
done

# Pin all machines to the same digest
for host in prod-box-1 prod-box-2; do
  ssh "$host" "sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome@sha256:abc123..."
  ssh "$host" "sudo systemctl reboot"
done
```

## Developer Workstations

Provision consistent developer environments:

```bash
# Each developer switches to the team's custom image
sudo bootc switch ghcr.io/my-org/dev-image:latest

# Pre-installed tooling via Brewfile
brew bundle install --file team.Brewfile

# Local VMs with Corral
corral create dev-env --qemu --container-disk quay.io/containerdisks/fedora:42
corral ssh dev-env
```

## Provisioning USB Media with Tacklebox

Create multi-boot USB drives for on-prem provisioning:

```bash
# Recipe with multiple TunaOS variants + diagnostic tools
tacklebox build recipe.json --img provisioning.img
sudo dd if=provisioning.img of=/dev/sdX bs=4M status=progress
```

See the [Tacklebox Getting Started](/docs/tacklebox/getting-started) guide.

## VM Infrastructure with Corral

Manage VMs across laptop and cluster with one tool:

```bash
# Local dev VM
corral create dev --qemu --container-disk quay.io/containerdisks/fedora:42

# Production VM on Kubernetes
corral create web --kubevirt --container-disk quay.io/containerdisks/fedora:42

# Same commands, same workflow
corral ssh dev
corral ssh web
```

See the [Corral Getting Started](/docs/corral/getting-started) guide.

## Security

- **Atomic updates** — no partial update states
- **Image signing** — all TunaOS images are signed with cosign
- **SBOM** — software bill of materials generated per image
- **Immutable `/usr`** — system files cannot be modified at runtime
- **User data in `/var` and `/etc`** — clean separation of OS and data

## Monitoring

```bash
# Check deployment status across machines
bootc status --json

# Monitor update availability
systemctl status bootc-fetch-apply-updates.timer

# View boot logs
journalctl -b -o short-monotonic
```

## See Also

- [Managing with Bootc](bootc-usage.md) — day-to-day bootc operations
- [CI/CD Pipeline](ci-cd.md) — how TunaOS images are built
- [Building Custom Images](building.md) — creating derivative images
- [Corral Guide](/docs/corral/getting-started) — VM management
- [Tacklebox Guide](/docs/tacklebox/getting-started) — multi-boot media
- [Homebrew Guide](homebrew.md) — developer tooling
