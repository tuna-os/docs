---
sidebar_position: 19
title: "troubleshooting"
---

> **Retired.** This page documented the original supervisor/tmux/systemd
> deployment (`bin/supervisor.sh`, `systemctl`, `/etc/hive/agent.env`), which is
> no longer how Hive runs. None of it applies to the current containerized Go
> deployment.
>
> **The current guide to fault diagnosis lives at
> [`src/docs/troubleshooting.md`](https://github.com/tuna-os/hive/blob/v4/src/docs/troubleshooting.md)** — container
> logs, config validation, agent sessions, dashboard auth, and GitHub
> credential checks.
>
> See the [`src/docs/README.md`](https://github.com/tuna-os/hive/blob/v4/src/docs/README.md) index for the full
> documentation set.

The project removed the v1 content from this page because full-text searches
showed it ahead of the current guide. It sent operators to `systemctl` steps
that no longer exist. Recover it from git history if you maintain a v1 deployment:

```sh
git log --all --oneline -- docs/troubleshooting.md
git show <commit>:docs/troubleshooting.md
```
