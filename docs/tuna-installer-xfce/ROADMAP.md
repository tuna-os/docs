---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-24 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Ship the XFCE desktop's install experience: a GTK3 frontend that drives the
fisherman bootc backend — welcome, image selection, disk selection, filesystem
and encryption, account, confirmation, install progress, completion — so a
first-time XFCE user gets a native install from first boot to desktop.

---

## Current Status

- **App**: GTK3 frontend for fisherman; CI-rendered walkthrough in
  docs/gui-walkthrough.md.
- **Distribution**: image-baked flatpak — no standalone GitHub Releases (by
  design, not yet documented as policy).
- **Parity**: covered by `installer-smoke.yml` + `docs/INSTALLER-FRONTENDS.md`
  checks (readiness stamp, non-blank, advances, per-screen OCR).
- **Health**: active (pushed 08-24); 40 unit tests exist but nothing runs them
  in CI (#23).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Wire 40 existing unit tests into CI | #23 | 🟡 Open |
| P2 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: make the test suite run

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Unit tests running in CI | hanthor | #23 | ⬜ Not started |

### Next Quarter (2026 Q4)

**Theme**: parity and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Document release/versioning model (image-baked vs tagged) | tuna-os | (org #2020) | ⬜ Not started |

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
