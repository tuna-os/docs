---
sidebar_position: 2
title: "Roadmap"
---

**Last updated**: 2026-11-16 | **Maintainer**: tuna-os maintainers

## Mission

Quickcast makes short GNOME screen recordings easy to capture and paste. It
combines portal-based screen capture, microphone and desktop audio, an optional
webcam overlay, local encoding, and clipboard handoff without requiring an
account or upload service.

## Current Status

Quickcast is available from the TunaOS Flatpak remote for x86_64 on the GNOME 50
runtime. The repository has no tagged GitHub release yet. CI builds the Flatpak
and exercises synthetic screen, webcam, audio, video, and clipboard paths;
interactive portal, hardware synchronization, and application-specific paste
behavior still require manual testing.

### Priorities

| Priority | Item | Tracking | Status |
|---|---|---|---|
| P0 | Restore a reliable Flatpak export and publishing path | [#17](https://github.com/tuna-os/quickcast/issues/17) | 🟡 In progress |
| P0 | Pin reusable workflow dependencies to immutable revisions | [#27](https://github.com/tuna-os/quickcast/issues/27) | ✅ Done |
| P1 | Add direct tests for the recording lifecycle | [#23](https://github.com/tuna-os/quickcast/issues/23) | ⬜ Not started |

## Quarterly Goals

### 2026 Q4

**Theme**: Make the initial distribution secure, reproducible, and maintainable.

| Goal | Owner | Tracking | Status |
|---|---|---|---|
| Keep Flatpak export and central-index publication green | tuna-os maintainers | [#17](https://github.com/tuna-os/quickcast/issues/17) | 🟡 In progress |
| Remove mutable workflow references from the release path | tuna-os maintainers | [#27](https://github.com/tuna-os/quickcast/issues/27) | ✅ Done |
| Test recording lifecycle behavior independently of the UI | tuna-os maintainers | [#23](https://github.com/tuna-os/quickcast/issues/23) | ⬜ Not started |
| Publish developer setup and contribution guidance | tuna-os maintainers | [#66](https://github.com/tuna-os/quickcast/issues/66) | ⬜ Not started |

### 2027 Q1

Use Q4 release and test evidence to decide the first tagged version and the next
hardware-validation matrix. Preserve the local-only privacy model and keep
portal and pipeline behavior testable without a physical desktop where possible.

## Technical Debt Backlog

| Item | Issue | Priority | Effort |
|---|---|---|---|
| Recording lifecycle couples portal state, GStreamer, and file output | [#29](https://github.com/tuna-os/quickcast/issues/29) | P1 | L |
| Window code couples presentation, state, and recording orchestration | [#20](https://github.com/tuna-os/quickcast/issues/20) | P1 | L |
| GStreamer input depends on a UI-layer selection type | [#21](https://github.com/tuna-os/quickcast/issues/21) | P2 | M |
| Portal abstraction exposes D-Bus types to callers | [#22](https://github.com/tuna-os/quickcast/issues/22) | P2 | M |

## How to Contribute

Read the build and test commands in [README.md](https://github.com/tuna-os/quickcast/blob/main/README.md), then comment on the
issue you want to own. Run `./scripts/build-local.sh` and
`./scripts/test-local.sh` for changes that affect the Flatpak or recording path.
The [organization contributor guide](https://github.com/tuna-os/.github/blob/main/CONTRIBUTING.md)
describes the shared pull request and security-reporting process.

## Roadmap Governance

The tuna-os maintainers own this roadmap. Refresh it after releases and at
quarter boundaries. Status must be backed by CI, release, or manual hardware
evidence, and priority changes should be proposed through a pull request.
