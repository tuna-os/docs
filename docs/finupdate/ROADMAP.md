---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-09-17 | **Maintainer**: tuna-os (hanthor)

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
- **Health**: active (September 2026); adoption of shared org presets for Renovate (#115) and Simplified Technical English (#116), security polkit rule hardening (#110), rollback runbook (#104), and initial modularization of core version parsing (#123) and registry client tests (#119).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | First tagged release (v0.1.0) — versioned OCI tag & GitHub Release | #65 | 🟡 In Progress |
| P1 | Harden Polkit rules and binary permissions | #110 | 🟢 Completed |
| P1 | Standardize CI STE check & Renovate org preset | #115, #116 | 🟢 Completed |
| P1 | Cargo.lock: unmaintained `proc-macro-error2` audit | #63 | 🟡 Open |
| P2 | Core module decoupling & God-file reduction (5 modules ≥1,000 lines) | #62, #111, #123 | 🟡 In Progress |
| P2 | Shared registry_client tag parser test coverage | #118, #119 | 🟡 In Progress |

---

## Quarterly Goals

### Current Quarter (2026 Q3 Exit)

**Theme**: security hardening, org alignment, and release tag preparation

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Polkit security policy path enforcement | architect/sec-check | #110 | 🟢 Completed |
| Simplified Technical English & Renovate governance adoption | ci-maintainer | #115, #116 | 🟢 Completed |
| Rollback runbook documentation | docs | #104 | 🟢 Completed |
| Cut v0.1.0 tag + first GitHub Release | hanthor | #65 | 🟡 Pending Release |

### Next Quarter (2026 Q4)

**Theme**: architecture decoupling, quality, and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| God-file reduction & `finupdate-core` interface cleanup | architect | #62, #111 | ⬜ Planned |
| Tag parsing & OCI registry test suite completion | quality | #118 | ⬜ Planned |
| Release cadence aligned with org (tagged builds in index) | tuna-os | #65 | ⬜ Planned |

---

*ROADMAP updated by strategist agent (ACMM L6 — full mode).*
