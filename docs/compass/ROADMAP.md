---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-11-16 | **Maintainer**: tuna-os maintainers

## Mission

Compass is a fast, keyboard-first launcher for Linux desktops. It provides a
native Rust engine, an Iced interface, and a sandboxed extension runtime while
remaining compatible with the useful parts of the Vicinae and Raycast extension
ecosystems.

## Current Status

The current release is **v0.28.4**. The Rust engine has replaced the C++ one
([ADR-0021](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/0021-remove-the-cpp-engine.md)), the
[parity ledger](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/PARITY.md) tracks what remains against upstream
Vicinae, and Compass is published as a Flatpak in the TunaOS remote and as a
Homebrew bottle in `ublue-os/experimental-tap`. Since v0.28.4 the launcher exposes an accessibility tree on AT-SPI
([#118](https://github.com/tuna-os/compass/issues/118)). An Orca check runs in
`tier2.yaml`; it reports only and does not yet gate a merge.
The remaining work is primarily first-run polish, performance enforcement, and
maintainability rather than feature-parity work.

### Priorities

| Priority | Item | Tracking | Status |
|---|---|---|---|
| P0 | Expose an accessibility tree to assistive technologies | [#118](https://github.com/tuna-os/compass/issues/118) | ✅ Done in v0.28.4 (#341, #348, #351) |
| P1 | Make installation and first-run setup low-friction | [#154](https://github.com/tuna-os/compass/issues/154) | 🟡 In progress |
| P1 | Turn measured performance into enforceable gates | [#127](https://github.com/tuna-os/compass/issues/127) | 🟡 In progress |

## Quarterly Goals

### 2026 Q4

**Theme**: Make the completed Rust port easier to adopt and maintain.

| Goal | Owner | Tracking | Status |
|---|---|---|---|
| Deliver an accessible launcher surface | tuna-os maintainers | [#118](https://github.com/tuna-os/compass/issues/118) | ✅ Done in v0.28.4 |
| Complete the installation and first-run flow | tuna-os maintainers | [#154](https://github.com/tuna-os/compass/issues/154) | 🟡 In progress |
| Enforce startup, input-latency, and memory budgets in CI | tuna-os maintainers | [#127](https://github.com/tuna-os/compass/issues/127) | 🟡 In progress |
| Split state and lifecycle responsibilities out of the UI application object | tuna-os maintainers | [#258](https://github.com/tuna-os/compass/issues/258) | ⬜ Not started |

### 2027 Q1

Reassess feature priorities after the Q4 adoption and accessibility work. New
features should preserve the parity, sandbox, and performance contracts recorded
in the [parity ledger](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/PARITY.md) and architecture decisions.

## Technical Debt Backlog

| Item | Issue | Priority | Effort |
|---|---|---|---|
| `compass-ui/src/app.rs` combines lifecycle, state, rendering, and persistence | [#258](https://github.com/tuna-os/compass/issues/258) | P1 | L |
| Browser tab search remains outside the Rust-port scope | [#17](https://github.com/tuna-os/compass/issues/17) | P2 | M |

## How to Contribute

Read [CONTRIBUTING.md](https://github.com/tuna-os/compass/blob/main/CONTRIBUTING.md) and [AGENTS.md](https://github.com/tuna-os/compass/blob/main/AGENTS.md), then comment
on the issue you want to own. Run `make format` and `make check-rust` before
submitting a pull request. Larger architectural changes should be discussed in
an issue first and recorded in the
[architecture decision log](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/README.md).

## Roadmap Governance

The tuna-os maintainers own this roadmap. Update it after major releases and at
quarter boundaries, with issue links and measured status rather than forecasts
presented as completed work. Propose priority changes through a pull request.

Security reports belong in a private
[GitHub security advisory](https://github.com/tuna-os/compass/security/advisories/new).
