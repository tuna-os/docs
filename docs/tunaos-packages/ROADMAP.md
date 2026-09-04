---
sidebar_position: 4
title: "Roadmap"
---

**Last updated**: 2026-09-02 | **Maintainer**: tuna-os (hanthor) / packaging maintainers

---

## Mission

Own the native packaging, patches, build ordering, validation, signing, and
publication work needed to ship curated desktop stacks for TunaOS variants —
independently of third-party repositories. Since #430 the mechanism is a
**single package factory**: one planner, one cell boundary, content-addressed
exact reuse, and SLSA attestations, with publishers that promote the bytes the
gate approved rather than rebuilding them. COPR remains bootstrap/compatibility
only and is being retired (#439).

---

## Current Status (2026-09-02)

- **The unified factory landed** (#430, merged 08-19). One planner and one cell
  boundary replaced the per-family build paths; gated artifacts are
  content-addressed and attested.
- **RFC 011 — one gap-driven factory** (#418) is the model the factory is
  converging on: a single catalog, per-target gap measurement, one orchestrator.
  Phase 1's conversion ledger has landed (#446, `docs/rfc011-conversions.md`);
  the shadow-measure proof for Fedora XFCE is #426.
- **Arch parity closed on both arches for every build-chain family** (#476,
  08-22): xfce el10, xfce fedora, and gnome50/51 aarch64 cells exist. The gnome
  aarch64 cells are **deliberately red** — they surfaced arch-independent
  defects needing a packaging decision, recorded on #480 rather than deleted.
- **All three formats now have a planner-driven publisher** (#476). Arch had
  none at all, so its packages were gated, built, verified and unreachable.
  Publishers now restore the gate's ActionResult instead of rebuilding, which
  closes the symptom half of #484. The structural remainder is open: the deb
  publisher is still the only hand-listed matrix (#479) and publishers still
  rebuild what the gate cached (#481, 14/14 cache hits measured).
- **Served-index correctness is half closed.** The worker now percent-decodes
  request paths (#458, closed 09-02). The stale-metadata half is open: the
  el10 repo still carries a `glib2-2.87.3-1` pair with versioned
  self-`Obsoletes` (#456), and #519 reports repo/10/x86_64 losing ~160 served
  package names since 08-20. A third gap is open on hummingbird: #525 counts
  17 packages we serve at an older build than upstream now ships, and because
  the desktop manifests add our repository at `priority: 5` — absolute in dnf,
  not a tie-break — ours wins and upstream's fix is shadowed on every image.
  `check-upstream-shadowing.py` names what to withdraw and deliberately
  performs no withdrawal; nothing else does either, and the count has grown
  from 16 since 08-25.
- **Fedora ELN (EL11) is a new target lane with no disposition here.** tunaOS
  merged the `wahoo` preview lane on 08-25 (tunaos#2042, desktops in
  tunaos#2048). The enabling build target is #559; the Niri and XFCE gaps
  behind it are #560 and #561; the H.264/H.265 sourcing decision is #562.
  Whether this factory commits to ELN this quarter or defers it is undecided —
  see the Q4 table below.
- **Hummingbird desktops still do not complete a full run.** #406 ("zero
  packages since 08-09") closed 09-02 as *not planned*: its root cause was
  already fixed in `f7185db` (#407) before the issue's evidence was gathered,
  and the workflow it quoted has since been replaced by the selector-driven
  cells (`package-factory-cell.yml` / `build-chain-fanout.yml`). What remains
  open is the ceiling itself — every full run is cancelled at the 360-minute
  job limit (#412) and convergence needs automation (#401). A weekly
  `engine=build-chain` cron gives the desktops a scheduled run at all (#476);
  the timeout is unresolved. #629 proposes consuming utah-packages for GNOME
  and building the other desktops in the Fedora root.
- **Desktop parity has no valid tracker.** #133 was closed COMPLETED on 08-11
  with its own unexamined list open; the confirmed defect (`marlin:kde` ships
  338 packages against its base's 480, zero KDE packages, no session file) has
  no successor. Tracked in #507; upstream twin tunaos#1294 is still open.

### The #430 operational transition

#488 audits where the post-merge firefighting drifted from #430's philosophy
and states the order to return to it. This table is the live status of that
transition; #488 carries the reasoning behind each row.

| # | Step | Status | Tracking |
|---|------|--------|----------|
| 1 | Ruleset requires `Package factory gate`; drop the compatibility aliases | ✅ Done — cutover landed 09-02 | #483 |
| 2 | Promotion behind the factory boundary (leased R2 ActionResult/blob publication) | 🟡 Symptom half done in #476; structural boundary open | #484 |
| 3 | Native queue packages → first-class per-package recipe actions | 🟡 In progress — ledger row 1 done, row 2 blocked on engine version-awareness, rows 3–5 unstarted | #418, #426 |
| 4 | Workflow consolidation — fold publishers, parameterize gap-drift, retire dormant builders | ✅ Done — closed 09-02; `upstream-drift.yml` is the parameterized matrix, and `build.yml`/`build-distributed.yml` stay break-glass until 2026-12-31 (census in RFC 011) | #487 |
| 5 | Report-only CAS reachability / GC | 🔴 Not started | #485 |
| 6 | Sampled reproducibility rebuilds + policy reporting | 🔴 Not started | #486 |

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Desktop parity: successor tracker for the confirmed `marlin:kde` defect, and per-edition installed package sets so parity is diffable | #507, tunaos#1294 | 🔴 Open — #133 closed COMPLETED with the ask unmet |
| P0 | Hummingbird desktops complete a full run — 6-hour cell ceiling | #412, #401, #629 | 🔴 Broken — #406 closed *not planned*, root cause already fixed in #407; the ceiling is the live defect |
| P0 | Finish the #430 transition in #488's order — steps 2, 3, 5, 6 remain | #488, #484, #485, #486 | 🟡 In progress — steps 1 (#483) and 4 (#487) closed 09-02 |
| P1 | aarch64 parity: resolve the two packaging decisions behind the red gnome cells | #480 | 🟡 In progress |
| P1 | Retire COPR, including the personal unpinned COPR that Mock CI still depends on | #439, #391 | 🔴 Open |
| P1 | Served-index correctness on repo.tunaos.org | #456, #519 | 🔴 Open — #458 (path decoding) closed 09-02; stale metadata and the ~160 lost package names remain |
| P2 | RFC 011 conversion ledger rows 3–5 | #426 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3) — "Expand"

**Theme**: One factory, publishing what it gated.

**Quarter closes 2026-09-30.** One of the five goals below is done. The
unfinished four are tracked by issue but not by any dated commitment in GitHub —
this repository has no milestones, so "what must land before Q3 closes" is not a
query anyone can run. #646 proposes a `2026-Q3 exit` milestone carrying #479,
#481, #439, #391, #507 and #480, and moving whatever cannot land into a
`2026-Q4` milestone in the same pass rather than carrying it silently.

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Unified factory with exact reuse + attestations | packaging | #430 | ✅ Done — merged 08-19 |
| Every build-chain family builds on both arches | packaging | #480, #476 | 🟡 Landed with gnome aarch64 cells deliberately red pending two packaging decisions |
| Planner-driven publisher for every format | packaging | #476, #479, #481 | 🟡 All three formats have one and promote gated bytes; #479 and #481 are both still open, and the structural boundary is #484 |
| Retire COPR in favour of GitHub/R2 | packaging | #439, #391, COPR-AUDIT.md | 🔴 Open — Mock CI still consumes a personal unpinned COPR |
| Desktop-completeness parity floor for every published edition | packaging | #507, tunaos#1294, [docs/desktop-parity-audit.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/desktop-parity-audit.md) | 🔴 Open — measurement retired without a replacement |

### Next Quarter (2026 Q4) — "Mature"

| Goal | Tracking | Note |
|------|----------|------|
| Finish #430's transition steps 1, 2, 4, 5, 6 | #488 and children | The order is in #488; step 1 is cheap and stops the old topology re-anchoring |
| Parity as a *release gate*, not a manual check | #507, tunaos#1270 | Per-edition package sets make the variant admission gate mechanisable |
| Sign every published artifact (RPM/DEB + SBOM attestation) | tunaos#1187 | Ties to the tunaOS Q4 supply-chain goal |
| Package signing key rotation + disaster-recovery docs | INCIDENT-repo-wipe-gnome.md | — |
| **Fedora ELN (EL11) — decide, then schedule** | #559, #560, #561, #562, #648 | Undecided, not yet committed. #559 is the enabler every other ELN gap blocks on. #562 (no working H.264/H.265 on ELN) is a maintainer sourcing decision and should be answered before any packaging work is authorized. If ELN proceeds, #560's COPR-sourced Niri stack must route through #439 rather than re-acquiring the dependency the factory is retiring. |

---

## Technical Debt Backlog

| Item | Issue | Priority | Effort |
|------|-------|----------|--------|
| Hummingbird cell exceeds the 6-hour job ceiling | #412, #401 | P0 | L |
| Desktop parity measured by image size, which demonstrably misleads — needs per-edition package sets | #507 | P1 | M |
| Dormant pre-factory builders still in tree (`build-distributed.yml`, 1,403 lines) | #487 (closed 09-02 — kept break-glass to 2026-12-31, not deleted; revisit at the RFC 011 Q4 review) | P1 | M |
| Determinism substrate unverified — `SOURCE_DATE_EPOCH` and cache-key bugs caught by log-reading | #486, #477 | P1 | M |
| Mock CI depends on a personal unpinned COPR | #391 | P1 | S |
| COPR bootstrap infra to retire | #439, COPR-AUDIT.md | P2 | M |

---

## How to Contribute

See [CONTRIBUTING.md](https://github.com/tuna-os/tunaos-packages/blob/main/CONTRIBUTING.md) and [docs/PACKAGE_FACTORY.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/PACKAGE_FACTORY.md)
for how packages move through the repo. Pick an issue from the priorities above
or comment on a goal you would like to own. The RFC 011 conversion ledger
(#426, `docs/rfc011-conversions.md`) is the most self-contained entry point:
each row is one target family, measurable on its own.

Newcomers currently have no labelled entry path — the repository has no open
`good first issue` or `help wanted` items, so contributor-discovery surfaces
return nothing for it even though much of the open queue is single-package work
with a clear pass/fail. #647 proposes seeding an initial batch.

---

## Roadmap Governance

This roadmap is maintained by the packaging maintainers. Updates are published
after major milestones or quarterly. Propose changes via PR to this file with an issue
reference.

**Currency rule** (#506): a tracker cited in this file that closes must move its
row in the same PR, or the row must name a successor tracker. This repo closes
issues faster than a quarterly cadence can track — the 08-10 revision of this
file reported six closed trackers as open work, and the 08-23 revision went
stale within ten days (four cited trackers closed on 09-02, over 148 commits).
The rule has held twice and failed twice, which is what a convention does
without an instrument: #645 proposes a CI check that resolves every `#NNN` in
this file and fails when a cited tracker is closed and its row neither moved nor
named a successor.

See [SECURITY.md](https://github.com/tuna-os/tunaos-packages/blob/main/SECURITY.md) for vulnerability reporting.
