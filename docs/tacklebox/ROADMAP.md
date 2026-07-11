---
sidebar_position: 4
title: "Roadmap"
---

**Last updated**: 2026-06-13

Part of the [TunaOS](https://tunaos.org) ecosystem. Multi-boot media orchestrator for bootc.

## Done

- ✅ `build` — ISO and block device provisioning
- ✅ `update` — in-place env refresh without reformatting
- ✅ `verify` — sanity-check built media
- ✅ `status` — inspect installed environments
- ✅ `update-all` — cross-env boot-time updater
- ✅ Multi-env dedup ISOs (`shared_store.dedup`)
- ✅ `recipe-gen` — YAML → recipe JSON
- ✅ CI pipeline: lint, unit, block smoke, ISO smoke, 6-env scale test

## Planned

- **`add` / `remove`** — mutate existing media: add or drop an environment
- **Per-stateroot greenboot** — health-check + auto-rollback per env
- **Persist lifecycle** — quota, GC, migration
- **USB pre-flight** — unmount busy partitions before format
- **ARM64 multi-ISO** — aarch64 sd-boot + OVMF testing

## Contributing

See [CONTRIBUTING.md](https://github.com/tuna-os/tacklebox/blob/main/CONTRIBUTING.md).

