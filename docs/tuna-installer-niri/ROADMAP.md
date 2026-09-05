---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-29 | **Evidence through**: 2026-08-29 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Ship the Niri desktop's install experience: a Quickshell/QML + Go installer
(modeled on DankMaterialShell's architecture) that drives the fisherman bootc
backend, so a first-time Niri user gets a native install on the
scrollable-tiling Wayland compositor.

---

## Current Status

- **App**: Quickshell/QML frontend + Go backend for fisherman; CI-rendered
  walkthrough in docs/gui-walkthrough.md.
- **Distribution**: published to the TunaOS Flatpak index on every `main` push;
  the latest verified publish run succeeded on 2026-08-29. There are no tags or
  standalone GitHub Releases. Whether the Flatpak remote is the durable release
  contract remains an open family-level decision (tunaOS #2020).
- **Parity**: covered by `installer-smoke.yml` + `docs/INSTALLER-FRONTENDS.md`
  checks (readiness stamp, non-blank, advances, per-screen OCR).
- **Health**: active (pushed 08-29). LUKS recipe transport was hardened by #28;
  current risks concentrate on privileged dependency/workflow pinning
  (#39-#41), missing backend PR CI (#27), and incomplete recipe fields (#25).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Pin the privileged fisherman source and reusable publishing workflow | #40/#41 | 🟡 Open |
| P0 | Remove write-capable CI exposure to unpinned PyQt6 | #39 | 🟡 Open |
| P0 | No CI runs on `installer/**` — Go backend untested in CI | #27 | 🟡 Open |
| P1 | User-account creation broken — recipe missing required field | #25 | 🟡 Open |
| P1 | Reconcile the superseded LUKS boundary tracker after the stdin fix landed | #26/#28 | 🟡 Open |
| P2 | Keep roadmap outcomes synchronized with repository evidence | #43 | 🟡 Open |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: harden the privileged install and publishing paths

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Pin privileged install and publishing dependencies | hanthor | #39-#41 | ⬜ Not started |
| CI coverage on the Go backend | hanthor | #27 | ⬜ Not started |
| Reconcile LUKS boundary follow-up after stdin transport landed | hanthor | #26/#28 | 🟡 In review |

### Next Quarter (2026 Q4)

**Theme**: parity and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Fix user-account creation | hanthor | #25 | ⬜ Not started |
| Document release/versioning model (image-baked vs tagged) | tuna-os | (org #2020) | ⬜ Not started |

---

## Review Cadence

Review this roadmap monthly and after any material install-path, distribution,
or privileged-supply-chain change. Each refresh must record an evidence-through
date and reconcile priorities against merged changes, open issues, releases or
tags, and the latest publishing runs. A merged outcome is evidence even when a
follow-up tracker has not yet been closed; record that mismatch explicitly
rather than reporting completed work as not started.

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
