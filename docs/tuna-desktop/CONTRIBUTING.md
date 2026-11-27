---
sidebar_position: 2
title: "Contributing"
---

Tuna Desktop is in beta ahead of v1 (see [README.md](https://github.com/tuna-os/tuna-desktop/blob/main/README.md) and
[docs/v1.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md)). Bug reports, code, tests and documentation are
all welcome.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Before you start

- [docs/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/README.md) maps all documentation; find the guide
  for your area there.
- [docs/development.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md) sets up the build;
  [docs/testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md) runs every CI check locally.
- [docs/architecture.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md) and
  [ADR 0004](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0004-no-split-preserve-seams.md) define the process
  boundaries and crate seams to preserve: `tuna-shell-control` owns
  framing and messages, and the shell host talks to the compositor only
  over the wire.
- Changes to the lock screen, capture, portals, D-Bus caller checks or
  extensions start from [docs/security-model.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md).
- AI agents, and anyone using one, read [AGENTS.md](https://github.com/tuna-os/tuna-desktop/blob/main/AGENTS.md) first.

## Every feature ships with tests

A pull request that adds or changes a feature includes:

1. **Unit tests** that `cargo test --workspace` runs in the `check` job.
2. **An integration gate**: an assertion in a proof lane of
   [.github/workflows/ci.yml](https://github.com/tuna-os/tuna-desktop/blob/main/.github/workflows/ci.yml) that exercises the
   feature end to end, with
   [scripts/ci-select-lanes](https://github.com/tuna-os/tuna-desktop/blob/main/scripts/ci-select-lanes) routing the changed
   files to that lane
   ([how lanes are selected](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#which-lanes-a-pull-request-runs)).
3. **Ledger wiring**: the assertion's lane output reaches the
   `parity-ledger` job's `scripts/tuna-ledger check` step, and the matching
   row of [docs/parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md) cites the tests
   and assertions that prove it
   ([parity ledger check](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#parity-ledger-check)).

Run the fast checks before pushing:

```sh
just check   # cargo fmt --check, clippy -D warnings, cargo test --workspace
```

`just proof <name>` runs `scripts/tuna-<name>` the way CI does, for
example `just proof gtk-shell-proof`; the
[nested proofs table](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-proofs) lists each proof and
its system packages.

## Pull requests

- **Sign off every commit** (`git commit -s`). The project uses the
  Developer Certificate of Origin.
- **CI must pass.** `ci-gate` fails when any selected lane fails. To run
  every lane on a branch, dispatch the `ci` workflow on it.
- **Update documentation in the same pull request.** Behaviour described in
  `docs/` changes with the code. A new architecture decision is an ADR in
  [docs/adr/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md). Add a new document to
  [docs/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/README.md).
  CI's `check` job fails when a Markdown file the PR changes has a relative
  link or a backticked repository path that does not resolve; `just doc-refs`
  runs the same check (`scripts/tuna-doc-refs`). Intended exceptions go in
  `scripts/lib/tuna-doc-refs-allowlist.txt`, each with a reason.
- **Wire changes** to the shell-control protocol follow
  [docs/api-stability.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md#shell-control-protocol-tuna-shell-control):
  bump the minor once, append only, and renumber against main before merge.

## Planning larger work

Features with several requirements or an open design question start as a
Spektacular spec and plan rather than a direct code change; see
[Spektacular workflows](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#understanding-spektacular-workflows).
Files under `.spektacular/` are written only through the `spektacular` CLI
([AGENTS.md](https://github.com/tuna-os/tuna-desktop/blob/main/AGENTS.md)); everything else, including `docs/`, is edited
directly.

## Reporting issues

Open a GitHub issue for a bug, gap or proposal. Search the
[existing issues](https://github.com/tuna-os/tuna-desktop/issues) first;
[troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md#filing-a-bug) lists what a bug
report needs (versions, install method, logs). Report security
vulnerabilities privately as described in [SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md).
