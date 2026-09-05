---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-24 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Own the TunaOS visual identity as one system: every variant mark drawn in the
same geometry language, one accent color per variant, each species identified
by its real field mark — and delivered to every consumer (variant images,
installers, docs, press kit) as a **versioned contract**, not a file drop.

---

## Current Status

- **Assets**: `tunaos.svg` master mark + per-variant marks (albacore,
  yellowfin, skipjack, bonito, marlin, flounder, grouper, guppy), plus
  `branding-manifest.json`.
- **Distribution**: **unversioned** — no tags, no releases. Consumers
  (tunaos `build_scripts/checks/verify-branding*.sh`) assert built images
  carry correct branding, but the source itself has no release contract.
- **Validation**: `tests/test_branding.py` validates the manifest and SVG asset
  contract locally. Automated CI execution is still outstanding (#9).
- **Health**: 2 open issues — versioned consumer sync contract (#7),
  validation-suite CI integration (#9).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Versioned release contract — tags + documented consumer pin | #7 | 🟡 Open |
| P1 | Run the existing manifest + SVG validation suite in CI | #9 | 🟡 In progress |
| P2 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: make identity versioned

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| First tagged release + consumer contract doc | hanthor | #7 | ⬜ Not started |
| Manifest validation enforced in CI | hanthor | #9 | 🟡 In progress |

### Next Quarter (2026 Q4)

**Theme**: scale to new variants

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| New-variant mark process (hummingbird/gurnard et al.) documented | tuna-os | (org variant tracking) | ⬜ Not started |

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
