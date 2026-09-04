---
sidebar_position: 2
title: "Contributing"
---

**This repository is archived, historical reference only.** As
[README.md](https://github.com/tuna-os/kde-build-meta/blob/master/README.md) explains, the KDE/Plasma/freedesktop-sdk BuildStream
elements that used to live here were consolidated into
[tuna-os/tromso](https://github.com/tuna-os/tromso), which no longer
consumes this repo through a junction. **New contributions, source updates,
and build changes belong in Tromso**, not here — see
[issue #13](https://github.com/tuna-os/kde-build-meta/issues/13) for the
retirement rationale.

## What this repo is still useful for

- Archaeology: understanding how the pre-consolidation KDE Linux BuildStream
  project (`elements/`, `patches/`, `plugins/`) was structured, modeled on
  GNOME's [gnome-build-meta](https://gitlab.gnome.org/GNOME/gnome-build-meta).
- Reference for the OpenQA end-to-end test harness under `tests/openqa/`
  (which has [its own contributing guide](https://github.com/tuna-os/kde-build-meta/blob/master/tests/openqa/CONTRIBUTING.md) —
  that subtree is more actively maintained than the BuildStream tree above
  it).

## If you do need to change something here

Genuinely rare — a documentation correction, or a fix that must land in the
historical tree for archaeology reasons. In that case:

- BuildStream elements are driven through `just` (see the [Justfile](https://github.com/tuna-os/kde-build-meta/blob/master/Justfile)):
  `just bst show <target>.bst` to inspect the dependency graph, `just bst-build`
  to build. Both run `bst` inside the pinned `bst2` container image via Podman.
- Markdown is linted by GitLab CI via the GNOME `markdown-lint` component,
  configured in [`.rumdl.toml`](https://github.com/tuna-os/kde-build-meta/blob/master/.rumdl.toml).
- `plugins/*.py` and `utils/*.py` are the only Python in this tree (small
  BuildStream element plugins and maintenance scripts); lint them with
  `ruff check plugins utils` using [`ruff.toml`](https://github.com/tuna-os/kde-build-meta/blob/master/ruff.toml).
- Open the PR against `master` (this repo's default branch) and reference
  what in Tromso, if anything, still needs the equivalent change.

## Project docs

- [README.md](https://github.com/tuna-os/kde-build-meta/blob/master/README.md) — current status and where to go instead.
- `docs/` — historical install/debugging notes for the phone targets
  (`FP5.md`, `ONEPLUS6.md`, `install.md`, `debugging.md`, `using.md`).
