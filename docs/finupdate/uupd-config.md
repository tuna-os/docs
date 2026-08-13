---
sidebar_position: 10
title: "uupd config"
---

This directory captures the schema for `/etc/uupd/config.json` — the configuration file consumed by [`uupd`](https://github.com/ublue-os/uupd) on Bluefin and Universal Blue systems. Finupdate reads and writes this file when the user customizes automatic-update behavior from **Preferences → Configure Automatic Updates**.

## Files

| File | Purpose |
|---|---|
| `uupd-config.schema.json` | JSON Schema (Draft 2020-12) describing the structure and value ranges. |
| `uupd-config.example.json` | Verbatim copy of the upstream template (`ublue-os/uupd/config.json`). Used as a test fixture in `src/uupd_compat.rs`. |

## Where it lives on a real system

- Path: `/etc/uupd/config.json`
- Owner/mode: `root:root` 0644
- Created by: the `uupd` RPM (`/usr/share/uupd/config.json` is the install-time default; the file at `/etc` is what wins at runtime if present).

## Mapping to Rust

The schema corresponds 1:1 to `UupdConfig` in `src/uupd_compat.rs`. Serde renames keep the wire format (kebab-case keys like `bat-min-percent`) compatible with what uupd expects.

If upstream uupd ever changes the schema, update **both** this file and the Rust types in the same commit so they stay in sync.

## Hardware-check semantics

Each threshold gates the automatic timer-driven run only. Manual `uupd` invocations and finupdate's "Check for Updates" button always run regardless.

- `bat-min-percent` — *minimum* battery charge required. The run is *skipped* if charge is below this.
- `cpu-max-percent` — *maximum* CPU load tolerated. The run is *skipped* if load is above this.
- `mem-max-percent` — *maximum* RAM utilization tolerated. The run is *skipped* if utilization is above this.
- `net-max-bytes` — *maximum* sustained network throughput tolerated, in bytes/second. The run is *skipped* if traffic is above this (avoids contending with active downloads).

## Module toggles

Each of `system`, `flatpak`, `brew`, `distrobox` accepts a `disable: boolean`. Defaults to `false` (= module runs). Set `true` to opt out of that module during automated runs.

## See also

- Upstream source: [https://github.com/ublue-os/uupd](https://github.com/ublue-os/uupd)
- The `uupd.timer` unit (controls *when* the timer fires; not part of this config file): `/usr/lib/systemd/system/uupd.timer`
