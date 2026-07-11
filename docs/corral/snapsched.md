---
sidebar_position: 8
title: "Snapsched"
---

# Snapsched — scheduled VM snapshots

`corral snapsched` runs a Kubernetes CronJob that snapshots a VM on a
schedule and prunes older auto-snapshots beyond a retention count — entirely
in-cluster, no workstation required.

```bash
corral plugin install snapsched
corral snapsched add web --every 6h --keep 12
corral snapsched ls
corral snapsched rm web
```

`--every` accepts `30m` / `1h` / `6h` / `12h` / `24h`, or a raw 5-field cron
expression.

## Requirements

- A `VolumeSnapshotClass` for the VM's StorageClass — `corral doctor`
  checks for this.

## How it works

Shares its CronJob/RBAC plumbing (`pkg/cronops`) with the [backup](/docs/corral/backup)
and [schedule](/docs/corral/schedule) plugins — one `corral-sched` ServiceAccount/Role
per namespace, additive across all three. Each snapshot run creates a
`VirtualMachineSnapshot` labeled `corral.dev/auto-snap=<vm>`, then deletes
the oldest ones beyond `--keep`.
