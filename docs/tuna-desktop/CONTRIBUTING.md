---
sidebar_position: 2
title: "Contributing"
---

Tuna Desktop (formerly Roost) is in active implementation, with a nested
developer preview and experimental installed sessions (see [README.md](https://github.com/tuna-os/tuna-desktop/blob/main/README.md)
and [the roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#public-roadmap)). Its Smithay compositor
supervises the GTK4/libadwaita shell, the installed-session default described in
[ADR 0006](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0006-gtk4-libadwaita-shell.md). The project also includes a
session supervisor and versioned control protocol, tested across
nested graphical journeys, AT-SPI accessibility and Marlin VM lanes. Daily-driver
and release qualification remain open.

This guide covers contributing code, tests, documentation, and planning
artifacts. For complete developer setup and build instructions, see the
[development guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md) and [testing guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md).

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Before you start

Read [AGENTS.md](https://github.com/tuna-os/tuna-desktop/blob/main/AGENTS.md) first if you are an AI agent or are using one —
it defines where the code actually lives (`spektacular repo list`), how the
Spektacular-managed stores (`.spektacular/specs/`, `.spektacular/plans/`) must
be read and written, and the knowledge-base rules. Human contributors should
skim it too; the store-access rules bind everyone who touches those paths,
not just agents.

Also read:

- [docs/architecture.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md) — process/authority boundaries
  between compositor, shell host, and extensions.
- [docs/roadmap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) — delivery sequence, spek registry, and
  requirement traceability.
- [docs/adr/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md) — open and decided architecture
  decisions. A "blocking" decision must resolve before its dependent spek's
  work passes its gate.
- [docs/security-model.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md) — threat model, trust
  boundaries, security properties, known limitations and release gates.
  Start here for any change touching the lock, capture, portals, D-Bus
  caller checks or extensions.
- [docs/portal-service-integration.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-integration.md)
  — how portal and D-Bus services are wired and tested.
- [docs/api-stability.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md) — crate stability tiers,
  shell-control wire versioning and the MSRV policy.

## The Spektacular workflow

Specs and plans are managed through the [Spektacular](https://github.com/hivecommons/spektacular)
CLI, not by hand-editing files under `.spektacular/`. Install it if needed:

```sh
go install github.com/hivecommons/spektacular@latest
```

Ensure `$(go env GOPATH)/bin` is on `PATH`, then confirm it's working:

```sh
spektacular version check
```

Each program unit (a "spek") has a spec, a draft implementation plan,
context, and research artifacts. The lifecycle is:

1. **Spec** — describes the feature or requirement. See the spek registry in
   [docs/roadmap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#spek-and-plan-registry) for the current
   list.
2. **Plan** — a draft reviewed against current source, confirmed
   dependencies, and explicit acceptance evidence before its implementation
   workflow starts. Do not begin implementation from a draft plan while a
   blocking decision or security boundary is unresolved
   ([docs/roadmap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md)).
3. **Implement** — starts from the corresponding full plan name after
   approval.

To start a plan for an existing spec, use the spec's full timestamp-prefixed
name from `spektacular spec file list`:

```sh
spektacular plan new --data '{"name":"<full-spek-name>"}'
```

Proposing a new spec or a change to the roadmap/architecture starts the same
way: describe the change, and if it's spec-worthy (multiple requirements, a
scoped decision, a buildable feature description), open the discussion as a
spec via `spektacular spec new` rather than editing `docs/roadmap.md` or
`docs/architecture.md` directly. Architecture *decisions* go through an ADR
in `docs/adr/` instead — see the existing ADRs there for the expected
format (status, context, decision, alternatives, consequences).

## Code contributions

Once a plan is approved and implementation starts:

- **Sign off every commit.** This project uses the Developer Certificate of
  Origin. Commit with `git commit -s` (or add `Signed-off-by:` by hand).
- **CI must pass.** [.github/workflows/ci.yml](https://github.com/tuna-os/tuna-desktop/blob/main/.github/workflows/ci.yml) runs
  the `check` job on every push and pull request:
  - `cargo fmt --all -- --check`
  - `cargo clippy --workspace --all-targets -- -D warnings`
  - `cargo test --workspace`

  and, on every push to `main`, nightly and on dispatch, every proof lane:
  - a nested-session journey test (`scripts/tuna-journey`) that launches the
    nested compositor under Xvfb and asserts visible reaction; artifacts are
    uploaded for human review.
  - an app-content journey (headed Chromium via Playwright as a Wayland
    client) asserting the compositor renders real app content.
  - the GTK shell, DRM, portal, remote-desktop, niri, package and Marlin
    VM lanes.

  A pull request runs only the lanes its changes can affect
  (`scripts/ci-select-lanes`; see
  [docs/testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#which-lanes-a-pull-request-runs)).

  Run the fast checks locally before pushing (`just check` runs all three):

  ```sh
  cargo fmt --all -- --check
  cargo clippy --workspace --all-targets -- -D warnings
  cargo test --workspace
  ```

  The proof lanes also run locally: `just proof <name>` runs
  `scripts/tuna-<name>` in a fresh home and runtime directory, for example
  `just proof journey`. The [nested proofs table](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-proofs)
  lists each proof's command and the system packages it needs beyond the
  [build prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#system-packages), and
  [local iteration with `just`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#local-iteration-with-just)
  lists the other recipes.
- **Update docs and ADRs alongside code.** If a change affects a decision
  recorded in `docs/adr/`, or the delivery tiers/requirement map in
  `docs/architecture.md` and `docs/roadmap.md`, update them in the same PR.
  Files under `docs/` are plain files and are edited directly; files under
  `.spektacular/specs/` and `.spektacular/plans/` are edited only through the
  Spektacular CLI (see AGENTS.md).
- **Respect the workspace boundaries.** [ADR 0004](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0004-no-split-preserve-seams.md)
  keeps this a monorepo but defines extraction seams between
  `tuna-shell-control` (framing/messages), `supervise.rs` (std-only), and
  shell-host (wire-only, no private compositor APIs). Preserve these
  boundaries even though the crates currently live together.

## Documentation and planning contributions

Documentation improvements, ADR proposals, and spec/plan updates are
always welcome and don't require the full code-contribution checklist
above — just DCO sign-off on the commit. Use plain file edits for anything under
`docs/`, `README.md`, or this file; use the Spektacular CLI for anything under
`.spektacular/`.

## Test strategy

See [docs/test-strategy.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-strategy.md) for the full verification
layers (unit/property, protocol probes, nested integration, VM/session,
hardware qualification, human UX/accessibility, security, performance,
upgrade/recovery) and the required cross-cutting journeys. The unit,
integration and nested proof layers are active and run in CI; parity,
VM/session, hardware, accessibility, security, performance and
upgrade/recovery qualification remain incomplete where the test strategy
says so. This is not a claim of daily-driver or release readiness.

## Reporting issues

Open a GitHub issue describing the gap, bug, or proposal. If it's substantial
enough to need multiple requirements worked out, expect to be routed toward
the spec workflow above rather than a direct code change.
