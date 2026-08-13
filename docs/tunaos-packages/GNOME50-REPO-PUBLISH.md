---
sidebar_position: 6
title: "GNOME50 REPO PUBLISH"
---

The published GNOME 50 repo at `https://repo.tunaos.org/gnome50/10-stream-x86_64/`
has never been seeded (HTTP 404, confirmed by R2 inventory). The `Verify GNOME 50
Repo` workflow correctly reports red on main because #112 removed the path filter
that previously hid this absent-repo check (see #179).

## Why the repo was never published

- `build-gnome50-package.yml` publishes on `push: main` with `paths: src/gnome-50/**`
  — no `src/gnome-50/` commit has been merged to main since the workflow was created.
- The one `main`-push publish run (2026-06-21) failed.
- `build-gnome50-distributed.yml` and `refresh-gnome50-r2.yml` are `workflow_dispatch`
  only — neither has ever been dispatched.

## What the operator must do to seed the repo

**Option A (preferred — copy from COPR):**

Dispatch `Refresh GNOME 50 R2 from COPR` from the Actions tab. This mirrors
the COPR project `jreilly1821/c10s-gnome-50` into the R2 bucket at
`bluefin/gnome50/10-stream-x86_64/`. The repo becomes accessible within
~60 seconds after the sync completes.

**Option B (full rebuild from source):**

Dispatch `GNOME 50 Distributed Build` from the Actions tab. This rebuilds the
entire GNOME 50 stack from `src/gnome-50/` and `src/deps/` sources, tier by
tier, signs the RPMs, and syncs to R2. This is the authoritative publish path
but takes ~45 minutes.

## After the repo is seeded

- `Verify GNOME 50 Repo` will go green automatically (no code changes needed).
- The `verify-repo` job will confirm `repomd.xml` returns 200 and packages
  install cleanly in a CentOS Stream 10 container.
- The `verify-gdm` job will provision an EL10 VM from the published repo and
  verify GDM + gnome-shell boot.

The workflow is already wired to fire on the completion of both the incremental
package build and the distributed build — once the repo is seeded, verification
engages on every publish without further operator action.
