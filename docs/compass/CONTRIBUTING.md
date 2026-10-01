---
sidebar_position: 2
title: "Contributing"
---

This document contains a set of guidelines you need to follow before contributing to Compass, be it through a bug report or code.

## Raising issues

All issues are tracked in the [Compass issue tracker](https://github.com/tuna-os/compass/issues). Before opening an issue, do a quick search to make sure you are not creating a duplicate.

For a bug, include the full output of `compass doctor` (or `flatpak run org.tunaos.compass doctor`), your distribution and desktop, and whether you installed the Flatpak, a CI bundle or a source build. Most reports so far have been resolved from the `doctor` output alone.

Compass is a fork of [Vicinae](https://github.com/vicinaehq/vicinae). Do not report Compass bugs to Vicinae. A bug in an extension from the Vicinae or Raycast store belongs in that extension's repository, unless it only happens on Compass.

If you think you've found a severe security issue, report it privately through GitHub's [security advisory form](https://github.com/tuna-os/compass/security/advisories/new) rather than in a public issue.

## Contributing code

### General guidelines

Less is more: each new line of code represents additional maintenance for the project and huge PRs have lower odds of being accepted, especially if they involve significant architectural commitments that were not discussed before. For a big change, open an issue first. The [architecture decisions](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/README.md) record what has already been settled.

All submitted code needs to be locally tested. `make check-rust` runs what Rust CI runs: formatting, Clippy with warnings denied, and the workspace tests. [AGENTS.md](https://github.com/tuna-os/compass/blob/main/AGENTS.md) has the coding rules, and [RENDER-HARNESSES.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RENDER-HARNESSES.md) explains how to see the launcher without a desktop.

Behaviour inherited from Vicinae should match the pinned upstream release, which is the reference now that the C++ engine is gone ([ADR-0021](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/0021-remove-the-cpp-engine.md)). An intentional difference is recorded in the [parity ledger](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/PARITY.md) with its rationale.

### Formatting and linting

Rust code is formatted with `cargo fmt --all` and must pass `cargo clippy --workspace --all-targets -- -D warnings`. The TypeScript under `src/typescript` is formatted with Biome. `make format` applies both.

Keep the number of comments to a strict minimum, good code shouldn't need many comments. There are good use cases for comments though: if you feel like your solution to a given problem is not ideal, could be improved, or relies on a weird hack, using a comment to document it is encouraged.

### Performance claims

A pull request that claims a speed-up or a memory saving should say how it was measured. For anything the README's comparison covers, rerun `just bench-compare` and update [BENCHMARKS.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/BENCHMARKS.md) with the new numbers.

### AI generated code

AI generated code is treated the same as regular code. As such, all the aforementioned rules apply.

AI is **not** a substitute for properly understanding and testing your code: don't be lazy. Lazy AI PRs that do not respect the guidelines will be rejected. In particular, keep your pull request's description as concise as possible: no maintainer will read your novel.

If your contribution was mostly AI generated, it's considered good practice to indicate what model or tool you used for that.
