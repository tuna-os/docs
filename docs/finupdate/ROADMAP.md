---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-24 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Give TunaOS/Bluefin users a modern graphical system updater: one-click
`bootc`/`flatpak`/`brew`/`distrobox` updates behind a single pkexec elevation,
with live log streaming, cancel support, and reboot prompt — so keeping an
immutable system current is a first-class, polished desktop action, not a
terminal chore.

---

## Current Status

- **App**: GTK4/libadwaita in Rust (2024 edition), GNOME 47+.
- **Distribution**: shipped — `flatpak install tuna-os org.tunaos.finupdate`
  live on the TunaOS Flatpak remote (indexed in flatpak-index), OCI at
  ghcr.io/tuna-os/finupdate for x86_64 + aarch64.
- **Versioning**: **none** — zero tags, zero GitHub Releases. The publish
  workflow fires on both `main` push and `v*` tags, so builds flow, but the
  OCI index serves unversioned "current builds" with no tag signal.
- **Health**: active (pushed 08-20); 4 open issues: unpinned privileged
  publish action (#64), unmaintained Cargo.lock dep (#63), God-file spread
  (#62).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | First tagged release — versioned OCI in the index | #65 | ⬜ Not started |
| P1 | Unpin `flatpak-github-actions` in publish workflow | #64 | 🟡 Open |
| P1 | Cargo.lock: unmaintained `proc-macro-error2` | #63 | 🟡 Open |
| P2 | God-file refactor — 5 modules ≥1,000 lines | #62 | 🟡 Open |
| P2 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: version the shipped app

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Cut v0.x tag + first GitHub Release | hanthor | #65 | ⬜ Not started |
| Unpin publish action | hanthor | #64 | ⬜ Not started |

### Next Quarter (2026 Q4)

**Theme**: quality and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| God-file reduction (5 modules) | hanthor | #62 | ⬜ Not started |
| Release cadence aligned with org (tagged builds in index) | tuna-os | #65 | ⬜ Not started |

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
