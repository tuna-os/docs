---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-30 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Ship the COSMIC desktop's install experience: a real `cosmic::Application`
frontend that gathers the user's choices, writes the fisherman recipe, and
presents the backend's progress and result — so a first-time COSMIC user gets
a native, polished install from first boot to desktop.

---

## Current Status

- **App**: libcosmic (Iced/Rust) frontend for the fisherman bootc backend —
  six screens (welcome, disk selection, options, confirmation, install
  progress, completion), CI-rendered walkthrough in docs/screenshots.
- **Distribution**: image-baked flatpak (`org.tunaos.InstallerCosmic`) — no
  standalone GitHub Releases (by design, not yet documented as policy).
- **Parity**: covered by `installer-smoke.yml` + `docs/INSTALLER-FRONTENDS.md`
  checks (readiness stamp, non-blank, advances, per-screen OCR).
- **Health**: active (pushed 08-24); open issues concentrate on install-recipe
  hardening (#39/#40/#41) and backend privilege boundary (#38).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Install-recipe hardening — unpredictable recipe path, 0600 mode honored | #39/#41 | ✅ Complete |
| P0 | Unpin `cargo-sources` generation (flatpak-cargo-generator.py) | #40 | 🟡 Open |
| P1 | Privileged install backend — only unpinned binary in the image | #38 | 🟡 Open |
| P1 | Parity reporting — only frontend that emits no parity signal | #36 | 🟡 Open |
| P2 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: harden the install path

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Install-recipe path and permission hardening | hanthor | #39/#41 | ✅ Complete |
| Pin cargo-sources generator and Python dependencies | hanthor | #40 | 🟡 In progress |
| Decide backend privilege boundary | hanthor | #38 | ⬜ Not started |

### Next Quarter (2026 Q4)

**Theme**: parity and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Emit parity signal like the other frontends | hanthor | #36 | ⬜ Not started |
| Document release/versioning model (image-baked vs tagged) | tuna-os | (org #2020) | ⬜ Not started |

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
