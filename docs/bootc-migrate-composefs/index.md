---
sidebar_position: 1
sidebar_label: "bootc-migrate-composefs"
status: stable
---

:::tip[Visual overview]
Prefer a visual tour? See the **[bootc-migrate-composefs overview →](/bootc-migrate-composefs)** landing page.
:::

**`bootc-migrate-composefs`** performs an in-place migration from an OSTree-backed
bootc system (e.g. Bluefin) to a ComposeFS-backed system (e.g. Dakota) — no
reinstall, and without losing `/home`, `/var`, `/etc` customizations,
flatpaks, container storage, or user accounts.

## ✨ Key Features

* **🧙 Interactive TUI wizard** — a terminal wizard walks through target
  image selection, a plain-English review of what's about to happen, and a
  live phase-by-phase progress view with scrollable logs. Run
  `sudo bootc-migrate-composefs tui`, or just omit `--target-image`.
* **↩️ Reversible until you commit** — the previous OSTree deployment stays
  in the boot menu as a fallback throughout. `commit` is the one-way step
  that removes it and reclaims disk space.
* **🔔 Self-clearing login reminder** — a login banner nudges you to run
  `commit` (or `undo`) so a migration doesn't sit forgotten in the dual-boot
  state indefinitely.
* **🔄 `undo` for partial/failed migrations** — cleans up composefs boot
  artifacts and staged deployments while preserving the object store.
* **📦 Ships as a binary or container image** — prebuilt per-arch binaries
  and a `ghcr.io/tuna-os/bootc-migrate-composefs` OCI image for easy
  `COPY --from=` use in other Containerfiles.

## Getting started

See the **[Migrating from Bluefin](/docs/dakota/migration)** guide for the
full walkthrough (with screenshots of the TUI wizard) and the
[project README](https://github.com/tuna-os/bootc-migrate-composefs) for
flags, the phase-by-phase breakdown, rollback, and troubleshooting.

```bash
sudo bootc-migrate-composefs tui
```
