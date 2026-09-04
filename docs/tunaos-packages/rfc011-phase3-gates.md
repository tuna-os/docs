---
sidebar_position: 23
title: "rfc011 phase3 gates"
---

Phase 3 implements the 12 gate types the queue manifests DECLARE
(counted in [TIDEFORGE-READINESS.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/TIDEFORGE-READINESS.md)) against the
unified factory — once, for every family. Its gate, per the RFC: the
"not covered" set **shrinks monotonically**, and each row's removal cites
the run that covered it. This ledger is that record.

Two different claims live near each other and must not be conflated:

- a recipe **declaring** a gate (`gates:` in `packages/*/package.yaml` —
  #445 added COSMIC's install/smoke declarations) states the promotion
  contract;
- CI **implementing** a gate type means a workflow actually evaluates it.
  A declared-but-unimplemented gate is a contract nothing can check —
  the exact condition TIDEFORGE-READINESS flagged: "no Tideforge recipe
  is contract-legal for promotion regardless of how green the build
  matrix is."

| gate type | declared (×) | implemented in CI | evidence / next step |
|---|---:|---|---|
| container-build | 12 | ✅ | factory build matrix |
| mock-build | 5 | ✅ | factory build matrix (mock buildroots) |
| rpm-md-stage-install | 7 | partial | `Clean-install` jobs; per-family coverage not yet universal |
| apt-stage-install | 7 | partial | same |
| pacman-stage-install | 3 | partial | same |
| greetd-login | 7 | ❌ | **first to implement** — most-declared runtime gate, gates COSMIC and niri both; model on `build-gnome50-verify.yml`'s Lima+VNC approach (the worked example the readiness doc names). No skeleton is committed: an unimplemented workflow in `.github/workflows/` reads as a gate that exists, and this ledger's whole point is the difference between declared and implemented. The workflow lands with its Lima boot-and-judge steps, in the same change that flips this row. |
| cosmic-session-smoke | 3 | ❌ | after greetd-login (shares the boot harness) |
| niri-session-smoke | 5 | ❌ | after greetd-login (same) |
| xfce-wayland-session-smoke | 4 | ❌ | same harness, xfce session target |
| gnome-session-smoke | 3 | ❌ | `build-gnome50-verify.yml` already does this for native GNOME; port, don't reinvent |
| plasma-session-smoke | 2 | ❌ | same harness, plasma session target |
| selinux-enforcing | 1 | ❌ | boots the stage-install VM with enforcing=1 and asserts no denials for the payload's scriptlets |

Counts are TIDEFORGE-READINESS.md's measurement; re-count when queue
manifests change rather than editing the numbers from memory.

## Implementation order and the shared harness

Every ❌ row above is a *session* gate, and they share one need: boot a
target-shaped VM, reach a login manager or session, and judge it from the
journal and the screen. `build-gnome50-verify.yml` is the worked example
(Lima VM → wait for GDM → assert gnome-shell isn't crash-looping → scan
journal for crash signatures). The plan is one reusable boot-and-judge
workflow with the session assertion as the parameter — implementing
greetd-login first because it is the most-declared and the front door to
three of the desktop smokes.

## Rules

- A row flips to ✅ only with a linked green run evaluating a real
  payload, recorded in this file in the same PR.
- Declared counts may grow (new recipes declare gates); the implemented
  column may never silently regress — removing a gate implementation
  requires editing this ledger in the same PR, which is the review
  surface.
- Automated **promotion** stays out of scope for Phase 3 entirely; it
  requires its own RFC with the incident safeguards
  (INCIDENT-repo-wipe-gnome.md).
