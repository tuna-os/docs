---
sidebar_position: 2
title: "Contributing"
---

> **This repository is deprecated (bugfix-only).** The canonical implementation
> of the office suite has moved to the Rust workspace in
> [`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite). New
> features belong there — see [ROADMAP.md](https://github.com/tuna-os/suite-common/blob/main/ROADMAP.md) for this repository's
> retirement/compatibility plan before proposing anything beyond a bugfix.

## What this is

Shared Python/GTK4/libadwaita scaffold (`suite_common/`) that was consumed by
the former Letters/Tables/Decks Python apps as a Meson subproject. See
[README.md](https://github.com/tuna-os/suite-common/blob/main/README.md) for the module map and [SPEC.md](https://github.com/tuna-os/suite-common/blob/main/SPEC.md) for the
architecture rationale.

## Building / running tests

There's no build step beyond byte-compiling the package. Tests are plain
Python scripts (no pytest runner) that can be executed directly:

```bash
python -m compileall suite_common   # what CI runs first
python tests/test_fileio.py
python3 tests/test_shortcuts_presets.py
python3 tests/test_oracles.py
```

CI (`.github/workflows/ci.yml`) runs `compileall` and `tests/test_fileio.py`
on every push and pull request.

## Code style

Lint with [ruff](https://docs.astral.sh/ruff/) using the repository's
`ruff.toml`:

```bash
ruff check .
```

Note the config intentionally excludes import-sorting (`I`) rules: this
codebase's GTK/GObject-Introspection modules call `gi.require_version(...)`
before `from gi.repository import ...`, and reordering those would break at
runtime.

## Making a change

- Keep changes scoped to bugfixes and maintenance — see the "current state"
  note above.
- Match the existing module style (plain functions, `SPDX-License-Identifier`
  header, tests as importable scripts under `tests/`).
- Open a pull request against `main`; CI must pass.

## Reporting issues

File an issue in this repository at
[https://github.com/tuna-os/suite-common/issues](https://github.com/tuna-os/suite-common/issues). If the report concerns the
active office suite rather than this legacy library, it likely belongs in
[`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite) instead.

## License

GPL-3.0-or-later. Test fixtures under `tests/fixtures/` are sourced from
LibreOffice (`qa/`) under MPL-2.0 — see `tests/fixtures/PROVENANCE.md`.
