---
sidebar_position: 1
sidebar_label: "suite-common"

status: unknown
---

> ⚠️ **DEPRECATED — Superseded by the Rust rewrite.**
>
> This Python library is in **bugfix-only maintenance**. New feature development
> has moved to the [gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
> monorepo, where the canonical `suite-common` implementation is the Rust crate
> (gtk4-rs 0.11 / libadwaita 0.9, plus the `suite-common-core` sibling). The Rust
> apps are already distributed via Flatpak as `org.tunaos.letters-rust`,
> `org.tunaos.tables-rust`, and `org.tunaos.decks-rust`.
>
> See [gtk-office-suite#82](https://github.com/tuna-os/gtk-office-suite/issues/82)
> for the migration plan and [tunaos#517](https://github.com/tuna-os/tunaos/issues/517)
> for the namespace-collision tracking.

Shared scaffold for the [TunaOS](https://github.com/tuna-os) GNOME office suite:

| App | Repo |
|-----|------|
| **Letters** | [tuna-os/letters](https://github.com/tuna-os/letters) |
| **Tables** | [tuna-os/tables](https://github.com/tuna-os/tables) |
| **Decks** | [tuna-os/decks](https://github.com/tuna-os/decks) |

Suite-common is extracted from Letters and consumed by all three apps as a
[meson subproject](https://mesonbuild.com/Subprojects.html).  It provides the
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

## Consuming suite-common

Each app declares suite-common as a subproject in `meson.build`:

```python
suite_common = subproject('suite-common')
sc_sources = suite_common.get_variable('suite_common_sources')
install_data(sc_sources, install_dir: pkgdatadir / 'suite_common')
```

At runtime the launcher script puts `pkgdatadir` on `sys.path`, so app code imports
naturally:

```python
from suite_common.application import SuiteApplication
from suite_common.window import SuiteWindow
from suite_common.webview import SuiteWebView, build_document
```

## Quick start (himachal)

```bash
# Run the suite-common unit tests
python3 tests/test_fileio.py

# Build & test an app (requires Flatpak + org.flatpak.Builder)
cd ../tables
just setup          # clones suite-common into subprojects/
just build          # builds & installs the Flatpak
just verify         # smoke: launches, confirms engine + bridge are live
just guitest        # AT-SPI dogtail GUI test

# Run L1 adapter tests
just l1test         # pytest tests/unit/

# Run formula conformance
just formulatest    # HyperFormula vectors via Flatpak hook

# Run L3 golden-file E2E
just e2etest        # dogtail → save → soffice oracle
```

## License

GPL-3.0-or-later.  Test fixtures under `tests/fixtures/` are sourced from
LibreOffice (`qa/`) under MPL-2.0 — see `tests/fixtures/PROVENANCE.md`.
