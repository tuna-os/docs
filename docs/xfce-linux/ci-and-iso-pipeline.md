---
sidebar_position: 7
title: "ci and iso pipeline"
---

How xfce-linux gets from `.bst` elements to a bootable, installable live ISO —
and how to debug it when it breaks. (Same architecture as tuna-os/xfce-linux;
patterns originate in projectbluefin/dakota and dakota-iso.)

## Build chain

```
elements/**  ──►  Build xfce-linux (Multi-Runner)  ──►  ghcr.io/tuna-os/xfce-linux:latest
                        │ (workflow_run)
                        ▼
              Build and Publish xfce-linux Live ISO  ──►  R2: xfce-linux/xfce-linux-live-*.iso
                        │
                        ▼ (boot gate: XFCE_LINUX_LIVE_READY on serial + screenshot)
              LUKS Install End-to-End Test (PR / weekly / dispatch)
```

### Multi-runner build (`build-multirunner.yml`)

The plan, core, and parallel dependency chunks (steps 1-3) use the shared
[tuna-os/bst-ci](https://github.com/tuna-os/bst-ci) reusable workflow. Each
BuildStream desktop repository uses this workflow, with different image names,
targets, and chunk counts. The local `build_final` job (step 4) uses cosign
without a key. This process puts the identity of this workflow in the Fulcio
certificate. The verification instructions in README.md use that identity.

Free GitHub runners can't hold the whole GNOME+XFCE build, so the workflow
splits it:

1. **plan** — The `scripts/ci-build-matrix.py` script from bst-ci runs
   `bst show`. It splits uncached elements into a core set (first `CORE_SPLIT`)
   and `NUM_CHUNKS` round-robin chunks. Each chunk has a composite cache key.
   The job checks out the script from bst-ci at run time. This repository no
   longer contains a copy.
2. **build_core** — builds the bootstrap set, pushes the CAS as
   `ghcr.io/…/cache-xfce-linux-core:latest` (zstd tarball via oras).
3. **build_deps** (matrix) — each chunk restores core + its own previous CAS,
   builds, and pushes `cache-xfce-linux-<chunk>:{latest,<cache-key>}`. The job
   skips a chunk when GHCR already has its exact cache key.
4. **build_final** — merges all chunk CAS tarballs, builds the final target,
   `just export` (squash + OCI labels + chunkify), `just lint`
   (`bootc container lint`), pushes `latest` + date + sha tags (main only).

BuildStream settings CI uses live in the checked-in `buildstream-ci.conf`.

**Cache-key invalidation warning:** a change to the cache key of every element
causes a full world rebuild. A change to `name:` in `project.conf` is one
example. Expect chunk jobs to run for hours or reach their six-hour limit once.
They recover after they refresh the GHCR caches.

### Live ISO (`iso.justfile` + `xfce-linux/`)

`just iso-sd-boot xfce-linux` (see `iso.justfile`, imported from `Justfile`):

1. `just container xfce-linux` — 3-stage `xfce-linux/Containerfile`:
   ghcr payload (kernel modules) → Debian stage builds a dmsquash-live
   initramfs (incl. the `95xfce-linux-isofile` Ventoy dracut module) → final
   stage installs flatpaks (`src/install-flatpaks.sh`) and configures the
   live env (`src/configure-live.sh`).
2. The recipe squashes the payload image and imports it into VFS container
   storage inside the squashfs. This process enables the offline installation.
3. `xfce-linux/src/build-iso.sh` assembles a systemd-boot UEFI ISO.

The live session automatically logs in to XFCE on Wayland through xfwl4 as
`liveuser`. It starts `org.tunaos.InstallerXfce` from the OCI flatpak remote
for tuna-os. A symbolic link at `/usr/local/bin/fisherman` points to fisherman.
It uses the shared `org.tunaos.Installer.install` polkit action. See
INSTALLER-FRONTENDS.md in the organization workspace.

### LUKS end-to-end test (`test-luks-install.yml`)

Local equivalent:

```bash
just debug=1 iso-sd-boot xfce-linux     # debug=1 enables SSH (liveuser/live)
just luks-test-qemu xfce-linux          # boot → fisherman LUKS install → reboot → unlock
```

`xfce-linux/src/luks-unlock.py` drives the QEMU monitor. It checks screen dumps
until Plymouth appears, types the passphrase with `sendkey`, and verifies the
installed system boot. The workflow publishes screenshots to the
`ci-screenshots` branch and PR comments. They show the live desktop, Plymouth
prompt, and installed desktop.

## Source updates

- **Renovate** (`renovate.json`) — GitHub Actions, container tags. Automerge
  on green CI, majors included.
- **`track-bst-sources.yml`** — Renovate can't parse `.bst`; this runs
  `bst source track` daily. Local elements (`elements/xfce-linux`,
  `elements/core`) go into one automergeable PR; the
  `freedesktop-sdk.bst` + `gnome-build-meta.bst` junctions get a separate review-required PR (a
  junction bump can rebuild the world). PRs made with the default
  `GITHUB_TOKEN` don't trigger CI — set a `BOT_TOKEN` secret to fix that.

## Troubleshooting log (symptom → root cause → fix)

| Date | Symptom | Root cause | Fix |
|---|---|---|---|
| 2026-07-19 | Every `just` call in CI fails: "multiple candidate justfiles" | `justfile` + `Justfile` both at root; just ≥1.30 hard-errors | ISO recipes moved to `iso.justfile`, imported from `Justfile` |
| 2026-07-19 | All 10 chunk jobs building for 5+ h | `project.conf` `name:` (tromso example) renaming project changes every cache key → world rebuild | expected one-time cost; caches repopulate |
| 2026-07-19 | Installer flatpak never launched in live session | install-flatpaks.sh baked `org.bootcinstaller.Installer` while configure-live.sh wired `org.xfceinstaller.Installer` | both sides now use `org.tunaos.InstallerXfce` |

| 2026-07-19 | Multi-runner never went green since May; every run "cancelled" at ~6.5 h | chunk jobs killed by job-level `timeout-minutes` — a cancelled job never reaches the CAS-push step, so 6 h × 10 chunks of build work was discarded daily (≈720 runner-hours; zero chunk cache packages ever existed on GHCR) | build bounded *inside* the step (`timeout 270m`), push steps `if: always()` — partial CAS salvaged, builds converge across days |
| 2026-07-19 | Failed chunks could publish their exact-cache-key tag and be skipped forever | `for i in 1 2 3 … done` retry loop exits 0 on total failure (status of last `sleep`) | retry loop removed (bst retry-failed/network-retries already cover it); rc propagated |

| 2026-07-19 | LUKS e2e / ISO jobs die in seconds: "Unknown attribute `group`" at Justfile:5 | Ubuntu 24.04 apt ships just 1.21 (predates `[group()]`); old runs survived because ancient just silently picked the group-free lowercase justfile we removed | workflows install just via extractions/setup-just and invoke `sudo "$(command -v just)"` |
| 2026-07-21 | Superseded push checks and image/ISO builds remained queued for hours | high-frequency workflows lacked concurrency groups or explicitly queued stale same-ref work | same-ref concurrency groups now cancel superseded runs; `test_high_frequency_workflows_cancel_superseded_runs` prevents regression |
| 2026-09-10 | `build_final` dies with no job log and no uploaded build log; `:latest` last published ~2026-07-19, so every LUKS/Plain E2E run fails with `manifest unknown` | Runner disk exhaustion, not a build error: the check-run annotation on runs 34072176433, 34176106533 and 34298830711 is the runner agent's own `System.IO.IOException: No space left on device` on its `_diag` log. Core plus ten chunk CAS tarballs measured ~266 GB compressed on 2026-09-10 (chunks 20-29 GB each) against ~100-110 GB of runner disk, because each chunk tarball embeds a full copy of core, nothing expires (no `cache.quota`), and `oras pull -o .` staged each tarball on disk before extracting. Run 34298830711 is decisive: the build itself succeeded in 18 min and the runner died in `Export OCI image` | Stream restores via `scripts/cas-restore-stream.sh` (`oras blob fetch --output -`); `cache: quota: 60G` in `buildstream-ci.conf`; check the artifact out and delete the CAS before `just export` (`EXPORT_REUSE_CHECKOUT=1`); log `df -h /` around every merge. Invariants in `tests/pytest/test_ci_disk_invariants.py` |

Add rows to this table as you change CI. See the organization `ci-fix-loop`
skill. The `docs/ci-troubleshooting.md` file in tuna-os/tunaos shows the format.

## Channels: nightly (main) and stable

- **main** is the nightly trunk: the daily scheduled multi-runner build
  publishes `:latest`, `:nightly`, `:nightly-YYYYMMDD`, `:<sha>`; the ISO
  lands at R2 `xfce-linux/`.
- **stable** is a release bookmark branch. A weekly schedule or manual dispatch
  starts `promote-stable.yml`; set `force=true` for an override. The workflow
  verifies the newest nightly build and ISO. It force-pushes that commit to
  `stable` and starts the stable build. The build creates the `:stable` and
  `:stable-YYYYMMDD` tags, plus an ISO under R2 `xfce-linux/stable/`. The stable
  ISO embeds the `:stable` payload. The build-iso.yml workflow changes
  `payload_ref` for each channel.
- Update PRs from source trackers or Renovate target only main. Stable moves
  only through promotion.

## Release-linked sources

Local elements use upstream **release tags** (globs such as `v[0-9]*`) instead
of development branches. Thus, the daily `bst source track` selects releases.
Some content repositories use branches, such as aurora common, docs,
wallpapers, and the xfwl4 development repositories. Junctions also use a fixed
branch. Do not set `track:` to one exact tag, because the tracker cannot move it.

## Guard rails (what stops a bad commit)

Branch protection needs the pre-merge checks on main. Automerge starts when
they pass. The checks include shellcheck, yamllint, actionlint, BATS, and pytest.
They also include the 52-test luks-unlock suite and `test_iso_invariants.py`.
Each invariant represents a defect that reached users.

The BuildStream graph gate runs `bst show --deps all` on the release target and
resolves junctions. Other checks are `Just Parse` and `pr-build-changed.yml`.
The latter builds the elements that a PR touches against the core CAS from
GHCR. It became a required check in xfce-linux#41.

Post-merge: salvage-enabled nightly world build → ISO boot gate
(ready-marker + screenshot artifact) → weekly LUKS install e2e
(screenshots on the `ci-screenshots` branch + PR comments). A cloud
routine ("tromso + xfce-linux CI babysitter", every 3 h) diagnoses
completed failures from logs and pushes fixes.

**Rules that keep this healthy:** do not add `paths:` filters to workflows with
required jobs. An absent required check prevents automerge. If you rename a
required job, update the branch protection contexts in the same PR. Do not wrap
a gate in `|| echo`. Such a wrapper hid failures in bst-validate and pytest for
months.

## Rollback

`rollback-stable.yml` runs only through manual dispatch and defaults `dry_run`
to true. It reverses a promotion. First, it verifies that the target `:<sha>`
image exists. Then, `skopeo copy --preserve-digests` sets `:stable` and a dated
`stable-rollback-*` tag.

The workflow force-pushes the stable branch to the same commit so the branch and
tag cannot differ. It shares the concurrency group of the promotion workflow,
so both cannot run at once. Dakota-pattern note: add a cosign verification step
before the retag after cosign support lands.
