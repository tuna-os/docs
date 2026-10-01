---
sidebar_position: 3
title: "Roadmap"
---

`gnome-hive-monitor` is a GNOME Shell extension enabling real-time status visibility and rapid idea intake directly from the GNOME desktop panel for `kubestellar/hive` instances.

---

## Near-Term (Q3 2026)

- **CI Automation & Validation**: Establish continuous integration workflows for GSchema compilation and linting via `eslint` / `gnome-extensions-tool`.
- **Packaging & Distribution**: Provide automated release bundles (`.zip`) suitable for direct manual installation or submission to `extensions.gnome.org`.
- **GNOME 46/47 Parity**: Verify compatibility and explicit metadata support across GNOME Shell versions 45 through 47+.

---

## Mid-Term (Q4 2026)

- **Multi-Hive & Multi-Spoke Support**: Allow configuring multiple hive endpoint profiles with quick switching or aggregated panel badges.
- **Desktop Notifications**: Optional desktop notifications when governor state shifts to `BUSY` or warning state (paused agent detection).
- **Offline / Transient Failure Resilience**: Graceful retry mechanisms and clear indicator states when network connectivity to the hive spoke is interrupted.

---

## Long-Term (2027+)

- **Enhanced Idea Intake**: Support attachment hints or rich metadata submission in the idea creation dialog.
- **Live Agent Telemetry Menu**: Expand the panel menu with quick breakdown metrics per active/running agent lane.

---

## Release Contract

- **Target Shell Version Support**: GNOME Shell 45–50 ESM standard.
- **Dependency Scope**: Zero external npm dependencies — rely strictly on native `gi://` GNOME Shell modules.
