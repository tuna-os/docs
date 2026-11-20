---
sidebar_position: 4
title: "TESTING"
---

This page lists the test layers in dualcut, the commands that run each one,
and how the `test` job in CI runs them. The CI workflow
([`.github/workflows/ci.yml`](https://github.com/tuna-os/dualcut/blob/main/.github/workflows/ci.yml)) is the
authoritative reference. If this page and that file differ, follow the file.

## Test layers

| Layer | Where it lives | Command |
|---|---|---|
| Schema sync | `engine/schema/` and `skills/dualcut/references/` | `diff engine/schema/dualcut.d.ts skills/dualcut/references/dualcut.d.ts` (and the same for `dualcut.schema.json`) |
| Lint | Whole engine crate | `cd engine && cargo clippy --all-features -- -D warnings` |
| Unit tests | `#[cfg(test)]` modules in `engine/src/` | `cd engine && cargo test --all-features` |
| Release render build | `engine/` | `cd engine && cargo build --release --features vector` |
| Render smoke suite | `tests/smoke.sh` | `tests/smoke.sh engine/target/release/render` |
| App start smoke | `engine/src/bin/preview/` | Xvfb run of `preview` with `DUALCUT_WALKTHROUGH=1` (see CI) |

Run commands from the repository root unless a line says otherwise.

## Unit tests

Unit tests sit next to the code they test, in `#[cfg(test)]` modules. The
document model is in `engine/src/document/`, and the HTTP API tests are in
`engine/src/api.rs`. To add a unit test, add a `#[test]` function to the
module that owns the code. Run one module with a name filter:

```sh
cd engine && cargo test --all-features document
```

## Render smoke suite

`tests/smoke.sh` renders real projects with the release `render` binary and
checks the output with GStreamer and Pillow. It needs `gst-discoverer-1.0`,
`gst-launch-1.0`, and `python3` with Pillow. It checks:

- the built-in demo renders and has a video stream;
- a volume fade attenuates audio over time;
- chroma key removes the keyed green;
- a freeform mask shows the background outside the shape, and `invert`
  flips which side is visible;
- each export profile (`webm`, `vp9`, `ogg`, `flac`, `wav`, `mkv`, `m4a`)
  writes a non-empty file;
- a round-tripped project still renders.

The script prints `ok` or `FAIL` per check and exits non-zero on any failure.

To add a case, copy one of the existing blocks. Write a project JSON into
`$WORK`, render it with `"$BIN"`, then assert on the output. Keep the
assertion loose enough to survive encoder changes.

## Application start smoke

CI builds `preview` with `--features preview,scripting,vector` and starts it
under Xvfb with `DUALCUT_WALKTHROUGH=1`. The job passes only when the log
contains `WALKTHROUGH-SHOT about`. This check needs a display, so run it in
CI or on a desktop session. CI starts Xvfb for it.

## Which CI steps block a PR

The `test` job in `ci.yml` runs the steps in the table above, in order. A
step that fails makes the job fail. The schema sync check, clippy, unit tests, the
render smoke suite, and the app start smoke all count. Branch protection rules
are set in repository settings, not in this tree.

The nightly `coverage` workflow runs on a schedule, not on PRs.

## Coverage

[`codecov.yml`](https://github.com/tuna-os/dualcut/blob/main/codecov.yml) sets the project target to 45%, with a 2%
threshold. The patch target is 70%, and it is informational only.

## Debugging a CI failure locally

1. Find the step that failed in the `test` job log.
2. Run the same command from the table above in a Fedora 45 environment.
   [CONTRIBUTING.md](https://github.com/tuna-os/dualcut/blob/main/CONTRIBUTING.md) has a Podman command for one.
3. For the render smoke suite, pass the same binary path that CI uses. Build
   it first with `cargo build --release --features vector`.

This repository does not document a flaky-test policy.
