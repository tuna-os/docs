---
sidebar_position: 9
title: "Schedule"
---

# Schedule — VM autostart/shutdown windows

`corral schedule` runs Kubernetes CronJobs that flip a VM's `runStrategy`
on a cron schedule — power a dev VM on at 9am, off at 6pm, entirely
in-cluster.

```bash
corral plugin install schedule
corral schedule add web --start "0 9 * * 1-5" --stop "0 18 * * 1-5"
corral schedule ls
corral schedule rm web
```

Both `--start` and `--stop` are raw 5-field cron expressions (weekday
schedule shown above: 9am/6pm, Monday–Friday).

## How it works

One CronJob per boundary (start, stop), each patching the VM's
`spec.runStrategy` (`Always` / `Halted`) — clears the legacy `spec.running`
field in the same patch, since a VM should only use one style. Shares its
CronJob/RBAC plumbing (`pkg/cronops`) with the [backup](/docs/corral/backup) and
[snapsched](/docs/corral/snapsched) plugins.
