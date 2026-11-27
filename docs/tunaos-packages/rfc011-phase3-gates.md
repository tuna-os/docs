---
sidebar_position: 31
title: "rfc011 phase3 gates"
---

Phase 3 provides the 12 gate types that queue manifests declare
(counted in [TIDEFORGE-READINESS.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/TIDEFORGE-READINESS.md)) for the
unified factory — once, for every family. Its gate, per the RFC: the
"not covered" set **shrinks monotonically**, and each row's removal cites
the run that covered it. This ledger is that record.

Two different claims live near each other; do not confuse them:

- a recipe declaration for a gate (`gates:` in `packages/*/package.yaml` —
  #445 added COSMIC's install and smoke declarations) states the promotion
  contract;
- a workflow implementation of a gate type means CI evaluates it.
  A declared gate without implementation is a contract that nothing checks.
  [TIDEFORGE-READINESS.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/TIDEFORGE-READINESS.md) flagged this condition:
  no recipe is legal for promotion without runtime gates.

| gate type | declared (×) | implemented in CI | evidence / next step |
|---|---:|---|---|
| container-build | 12 | ✅ | factory build matrix |
| mock-build | 5 | ✅ | factory build matrix (mock buildroots) |
| rpm-md-stage-install | 7 | partial | `Clean-install` jobs; per-family coverage not yet universal |
| apt-stage-install | 7 | partial | same |
| pacman-stage-install | 3 | partial | same |
| greetd-login | 7 | ❌ | **first to implement** — most-declared runtime gate, gates COSMIC and niri both; model on `build-gnome50-verify.yml`'s Lima+VNC approach (the worked example the readiness doc names; #430 retired it, so read it from history as described below). No skeleton is committed: an unimplemented workflow in `.github/workflows/` reads as a gate that exists, and this ledger's whole point is the difference between declared and implemented. The workflow lands with its Lima boot-and-judge steps, in the same change that flips this row. |
| cosmic-session-smoke | 3 | ❌ | after greetd-login (shares the boot harness) |
| niri-session-smoke | 5 | ❌ | after greetd-login (same) |
| xfce-wayland-session-smoke | 4 | ❌ | same harness, xfce session target |
| gnome-session-smoke | 3 | ❌ | `build-gnome50-verify.yml` did this for native GNOME until #430 retired it; port it from history, don't reinvent |
| plasma-session-smoke | 2 | ❌ | same harness, plasma session target |
| selinux-enforcing | 1 | ❌ | boots the stage-install VM with enforcing=1 and asserts no denials for the payload's scriptlets |

Counts come from the measurement in [TIDEFORGE-READINESS.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/TIDEFORGE-READINESS.md).
Recount when queue manifests change. Do not edit numbers from memory.

## Implementation order and the shared harness

Every ❌ row above is a *session* gate. They share one need: boot a
VM, reach a session or login manager, and judge it. The retired workflow
`build-gnome50-verify.yml` is the worked example (Lima VM, wait for GDM, verify
`gnome-shell` stability, scan journal for crash signatures). #430 removed it
from `.github/workflows/`; read its last version with
`git show ea532698^:.github/workflows/build-gnome50-verify.yml`. The plan provides
a reusable boot-and-judge workflow with the session assertion as a parameter.
It adds `greetd-login` first because it is the most-declared gate.

## Rules

- A row flips to ✅ only with a linked green run for a real
  payload. Record that run here in the same PR.
- Declared counts may grow as new recipes declare gates. The implemented
  column must never silently regress. Removal of a gate implementation
  needs edits to this ledger in the same PR.
- Automated promotion stays out of scope for Phase 3. It
  needs its own RFC with incident safeguards
  (`INCIDENT-repo-wipe-gnome.md`).
