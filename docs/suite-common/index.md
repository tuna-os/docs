---
sidebar_position: 1
sidebar_label: "suite-common"

status: unknown
---

> ⚠️ **DEPRECATED — Superseded by the Rust rewrite.**
>
> This repository is the legacy **Python** implementation. It is being renamed
> to `tuna-os/suite-common-python`; the Python import name `suite_common` and
> Meson subproject name `suite-common` remain stable for existing consumers.
>
> This Python library is in **bugfix-only maintenance**. New feature development
> has moved to the [gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
> monorepo, where the canonical `suite-common` implementation is the Rust crate
> (gtk4-rs 0.11 / libadwaita 0.9, plus the `suite-common-core` sibling). The Rust
> apps are distributed via Flatpak as `org.tunaos.letters`,
> `org.tunaos.tables`, and `org.tunaos.decks` (the historical
> `org.tunaos.letters-rust` / `tables-rust` / `decks-rust` suffixes were
> dropped — the plain IDs now carry the Rust builds in the tuna-os remote).
>
> See [gtk-office-suite#82](https://github.com/tuna-os/gtk-office-suite/issues/82)
> for the migration plan and [tunaos#517](https://github.com/tuna-os/tunaos/issues/517)
> for the namespace-collision tracking.

Shared scaffold for the [TunaOS](https://github.com/tuna-os) GNOME office suite. The three apps were extracted into the archived
[tuna-os/letters](https://github.com/tuna-os/letters), [tuna-os/tables](https://github.com/tuna-os/tables), and
[tuna-os/decks](https://github.com/tuna-os/decks) repos; all three now live in the
[gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) monorepo (`letters/`, `tables/`, `decks/` crates):

| App | Location |
|-----|----------|
| **Letters** | [tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) `letters/` |
| **Tables** | [tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) `tables/` |
| **Decks** | [tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) `decks/` |

Suite-common was extracted from Letters and was consumed by the former Python
apps as a [meson subproject](https://mesonbuild.com/Subprojects.html). It
provides the
GTK4 / libadwaita chrome, the WebKit bridge, file-I/O base classes, test helpers,
and oracle wrappers — so each app only ships its own editing engine and format
adapters.

## What's inside

| Module | Purpose |
|--------|---------|
| `application.py` | `SuiteApplication` — shared Adw.Application with keyboard shortcuts (Ctrl+O/S/N/W/Z/Y/P), quit, about, preferences |
| `window.py` | `SuiteWindow` — Adw.ApplicationWindow + ToolbarView + HeaderBar + TabView + toast overlay + responsive action toolbar |
| `webview.py` | `SuiteWebView` — WebKit bridge with `send()`/`on_message` round-trip, bundled-asset HTML builder |
| `dialogs.py` | Shared preferences dialog + Ctrl+? keyboard shortcut overlay |
| `fileio_base.py` | Abstract open/save registry with format extension dispatch |
| `test_helpers.py` | Dogtail / AT-SPI helpers (`click`, `pressed`, `find_app`, `find_widget`, `dump_tree`, `toggle_and_assert`) |
| `oracles.py` | Independent verification via LibreOffice headless (`soffice --headless --convert-to`) + openxml-audit |

Full architecture rationale: [SPEC.md](https://github.com/tuna-os/suite-common/blob/main/SPEC.md).  
Test strategy & pyramid: [TESTING-SPEC.md](https://github.com/tuna-os/suite-common/blob/main/TESTING-SPEC.md).

## Historical consumption

The former Python apps declared suite-common as a subproject in `meson.build`:

```python
suite_common = subproject('suite-common')
sc_sources = suite_common.get_variable('suite_common_sources')
install_data(sc_sources, install_dir: pkgdatadir / 'suite_common')
```

At runtime their launcher scripts put `pkgdatadir` on `sys.path`, so app code
imported the package naturally:

```python
from suite_common.application import SuiteApplication
from suite_common.window import SuiteWindow
from suite_common.webview import SuiteWebView, build_document
```

## Quick start

```bash
# Run this repository's unit tests
python3 tests/test_fileio.py
python3 tests/test_shortcuts_presets.py
python3 tests/test_oracles.py
```

The retired Python applications' build and GUI-test commands are preserved in
the historical design records, but they are not a supported workflow for this
repository. For current application development, use
[`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite). See
[ROADMAP.md](https://github.com/tuna-os/suite-common/blob/main/ROADMAP.md) for the decision process governing any remaining
compatibility work here.

## License

GPL-3.0-or-later.  Test fixtures under `tests/fixtures/` are sourced from
LibreOffice (`qa/`) under MPL-2.0 — see `tests/fixtures/PROVENANCE.md`.
