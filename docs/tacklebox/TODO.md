---
sidebar_position: 3
title: "Todo"
---

Tracked items not yet implemented. Roughly ordered by value / blocking-ness.

## Features

### `tacklebox update <recipe.json>`
Re-pull the recipe's images and replay `bootc install` (or smarter
`bootc switch`) into existing per-env subtrees on a previously-built
media, without wiping the persist partition. Lets users refresh USB
media without re-formatting.

### `tacklebox add <env>` / `tacklebox remove <env>`
Mutate an existing media in place: add a fourth env to a built image,
or drop one. Today the only way is to rebuild from scratch.

### `tacklebox verify <image-or-device>`
Sanity-check a built image. Asserts:
- All BLS entries resolve to existing kernel + initrd in the ESP.
- Each env's ostree commit hash is **distinct from the others**
  (catches today's bootc-install content-collision bug — see below).
- ESP usage is under its partition size.
- Per-env `tbox-install/<env>/ostree/repo` is consistent (`ostree fsck`).
- `loader.conf` references an entry that exists.

Prerequisite for meaningful CI regression coverage — both the smoke
test and full E2E should call `tacklebox verify` after build.

### Per-stateroot greenboot / rollback
Each env boots independently with its own stateroot, so health-check
+ auto-rollback should be wired per-env, not globally.

### Persist-partition lifecycle
`TBOX_PERSIST` is formatted and `/home` is overlaid via the dracut
module, but there's no story for:
- Quota per env.
- Garbage collection when an env is removed.
- Migration if the recipe's env list changes between builds.

### USB pre-flight: unmount busy partitions
`final-attempt.log` shows `mkfs.vfat` failing because `/dev/sdb1` was
auto-mounted by the desktop. `internal/blockdev` should sweep
`/dev/<target>*` mounts before format. Only matters for `/dev/*`
targets, not loop images.

## Bugs

### Serial `bootc install` shares ostree commits across envs
**Reproduces with `examples/all-test.json`.** Each `bootc install
to-filesystem` runs from the correct container image, but both
`tbox-install/aurora` and `tbox-install/bazzite` end up with the
*same* ostree commit hash (`e2c044ed7f9a…` — bazzite content). The
aurora container itself contains genuine Aurora content when run
standalone (`podman run --rm localhost/superiso-live-aurora cat
/etc/os-release` shows `NAME="Aurora"`).

**What was tried and didn't fix it (2026-05-11):**
- Pass `--source-imgref containers-storage:<image>` to bootc install
  to pin the source explicitly. Hash unchanged — verify still flags
  the same collision.
- Remove the `--mount type=bind,src=/var/lib/containers` so the install
  container can't see host's containers-storage at all. Hash *still*
  unchanged. So the bug is not (or not only) about which image bootc
  resolves; bootc seems to share state somewhere we haven't found.

Both fixes are kept in `internal/install/bootc.go` as defense in depth
since they're cheap and harmless, but the actual root cause needs
either:
- A deeper read of bootc's install-source resolution (RUST_LOG=debug
  on a single install would help isolate where the wrong commit gets
  computed), or
- Filing upstream — bootc 1.15.2 against ublue-os/aurora + ublue-os/
  bazzite reproduces deterministically in our setup.

`tacklebox verify` (above) catches this in CI; nightly builds of
all-test will fail until the underlying bootc bug is fixed.

## CI / automated testing

The goal is regression coverage for the dracut module, partitioning,
bootloader wiring, and per-env install correctness, runnable on every
PR.

### Stage 1 — Lint + unit (every PR, ~2 min, ubuntu-latest)
- `go test ./...`
- `go vet ./...`
- `shellcheck src/dracut/95tbox-root/*.sh`
- `go build ./...`

### Stage 2 — Recipe schema check (every PR, seconds)
- Parse every `examples/*.json` through tacklebox's loader; fail on
  any rejection.

### Stage 3 — Two-env disk-build smoke (every PR, ~10 min, ubuntu-latest)
- Two-env fixture recipe (`fixtures/smoke-2env.json`) using minimal
  bootc images — e.g. `quay.io/centos-bootc/centos-bootc:stream10`
  twice with different stateroots, or two distinct minimal images.
  Two envs is the *minimum* useful E2E — it catches the kind of
  cross-env content-collision bug we hit on 2026-05-11.
- `tacklebox build fixtures/smoke-2env.json` to a ~30 GB loop image.
- `tacklebox verify` — must assert each env's ostree commit hash
  is distinct.

**Disk budget on free `ubuntu-latest` (~14 GB workspace + ~75 GB on `/mnt`):**
- Run `jlumbroso/free-disk-space` first to recover ~30 GB on `/`
  (Android SDK, .NET, Haskell, etc.).
- Use `/mnt` as the build output base (`tacklebox build -b /mnt/tb`)
  so the 30 GB loop image lives on the NVMe.
- Containers-storage on `/mnt` too (`STORAGE_DRIVER=overlay` with
  `graphroot=/mnt/containers`).
- Total expected workspace: ~40–50 GB. Fits.

### Stage 4 — QEMU boot smoke (every PR, ~5 min, ubuntu-latest with /dev/kvm)
- Boot the Stage 3 image headless under KVM, capture serial log.
- Grep for `tbox-root.service: ... finished`, `ostree-prepare-root.service:
  ... finished`, and `Welcome to`.
- Boot **both** envs by editing `loader.conf` between runs (or by
  passing `systemd.unit=...` / boot-entry selection via QEMU OVMF)
  — confirms each env actually boots its own content, not just the
  alphabetically-first one.
- On failure, upload the serial log + ESP contents as a CI artifact.

### Stage 5 — Nightly full regression (optional, larger runner)
- Real `examples/all-test.json` (bazzite + aurora + dakota, 60 GB).
  Doesn't fit the two-env smoke budget — needs either a `ubuntu-latest-large`
  paid runner, a self-hosted runner, or an ephemeral cloud box spun up
  from the workflow. Mostly catches issues with the *real* upstream
  ublue images that the minimal fixtures don't exercise.

### Workflow file
`.github/workflows/ci.yml` (stages 1–4) + `.github/workflows/nightly.yml`
(stage 5, `schedule:` + `workflow_dispatch:`).

### Test fixtures
- `fixtures/smoke-2env.json` — two-env recipe (minimum useful for
  catching cross-env regressions), ~30 GB shared store, 1 GB ESP.
- Either pull fixture images from a public registry, or build them
  in-repo and push to GHCR on main.
