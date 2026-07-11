---
sidebar_position: 4
title: "Backup"
---

# Backup — on-demand and scheduled VM disk backups

`corral backup` ships VM disk backups to any S3/R2-compatible bucket via
[rclone](https://rclone.org/) — export a stopped VM's disk, upload it, and
restore it later via CDI's `image-upload`. Scheduled backups run entirely
**in-cluster** via Kubernetes CronJobs, so nothing depends on your
workstation being online.

## Install

```bash
corral plugin install backup
rclone config   # set up your S3/R2 remote once, locally
```

## On-demand

```bash
corral backup create web --dest r2:backups/corral
#   exporting web disk → /tmp/.../web-20260702-120000.img.gz ...
#   uploading → r2:backups/corral/web-20260702-120000.img.gz ...
#   backed up web → r2:backups/corral/web-20260702-120000.img.gz

corral backup list --dest r2:backups/corral

corral backup restore web-restored --src r2:backups/corral/web-20260702-120000.img.gz --size 20Gi
#   downloading r2:backups/corral/web-...img.gz → /tmp/...
#   uploading into PVC web-restored (20Gi) via CDI ...
#   restored → DataVolume corral-vms/web-restored
#   attach it to a VM with: corral create <name> --pvc web-restored
```

The VM must be **stopped** to export (the disk needs to be quiescent).

## Scheduled (in-cluster CronJobs)

```bash
corral backup schedule web --every 24h --keep 7 --to r2:backups/corral
corral backup schedules
corral backup unschedule web
```

`--every` accepts `30m` / `1h` / `6h` / `12h` / `24h`, or a raw 5-field cron
expression. The CronJob pod fetches `virtctl` (matched to the cluster's
actual installed KubeVirt version, not a hardcoded pin) and `rclone` at
runtime — no bespoke image required. Your **local rclone config** (the
remote's credentials) gets mirrored into a namespaced Secret the CronJob
mounts read-only, since the pod has no other way to reach your remote.

Retention prunes this VM's own backups on the remote beyond `--keep` —
mirrors the same prune pattern the [snapsched plugin](/docs/corral/snapsched) uses for
snapshots.

## Requirements

- `rclone`, configured for your remote (`rclone config`) — local machine
  for on-demand backups, mirrored into a Secret for scheduled ones
- `virtctl`
