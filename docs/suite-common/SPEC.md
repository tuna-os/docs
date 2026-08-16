---
sidebar_position: 2
title: "Spec"
---

A small, FOSS office suite for the GNOME desktop, built as **separate libadwaita apps**
that share a common scaffold. It completes the set started by
[**Letters**](https://codeberg.org/eyekay/letters) (word processor):

| App | Role | Status |
|-----|------|--------|
| **[Letters](https://github.com/tuna-os/letters)** | Word processor | exists; **migrating onto suite-common** (reference consumer) |
| **[Tables](https://github.com/tuna-os/tables)** | Spreadsheet (Excel-equivalent) | this suite |
| **[Decks](https://github.com/tuna-os/decks)** | Presentation (PowerPoint-equivalent) | this suite |

This repo, **`suite-common`**, holds the shared code consumed by all three apps as a
**meson subproject**. It is **extracted from Letters** — Letters is both the source of the
pattern and the first consumer, so migrating Letters onto `suite-common` is how we dogfood
the extraction. Upstream Letters lives at
[codeberg.org/eyekay/letters](https://codeberg.org/eyekay/letters); the suite tracks the
fork at [tuna-os/letters](https://github.com/tuna-os/letters).

## The Letters pattern (what we inherit)

Letters gets its leverage from three layers, and so do Tables and Decks:

1. **Pure GTK4 / libadwaita chrome** — Blueprint (`.blp`) UI compiled to GtkBuilder:
   `Adw.ApplicationWindow` + `Adw.ToolbarView` + `Adw.HeaderBar` + `Adw.TabView`,
   preferences, shortcuts dialog, about dialog, menus, file dialogs, error toasts.
2. **A `WebKit.WebView` document canvas** — a small JS engine runs inside the webview and
   provides the actual editing surface. Letters uses a contenteditable HTML editor
   (`src/editor.js`); we swap in a best-of-breed JS engine per app.
3. **In-process file-format libraries** — Letters uses `pypandoc` (DOCX/ODT/MD/HTML) and
   WeasyPrint (PDF), vendored into the Flatpak manifest. We use Python format libraries
   the same way; **no server, fully offline/sandboxed.**

> **Honest tradeoff:** "pure libadwaita" describes the **chrome**. The document canvas is
> WebKit — exactly as in Letters. No native GTK widget does spreadsheet/slide heavy
> lifting, so this is the only path consistent with the existing app.

## Engine choices (best-of-breed, per app)

| App | Editing surface | Compute/render | File I/O (in-process Python) |
|-----|-----------------|----------------|------------------------------|
| Tables | **Jspreadsheet CE** (MIT) | **HyperFormula** (GPLv3-or-commercial) — 450+ Excel fns | `python-calamine`/`openpyxl` (xlsx), `odfpy` (ods), stdlib `csv` |
| Decks | **Fabric.js** (MIT) canvas | **Reveal.js** (MIT) present mode | `python-pptx` (pptx), `odfpy` (odp) |

Licensing note: Letters is GPLv3, so HyperFormula's GPLv3 option is compatible. All other
engines are MIT. *Alternative for Tables:* **FortuneSheet** (MIT) bundles grid + formulas
in one dependency at the cost of a React runtime — a fallback if CE+HyperFormula wiring is
fiddly.

## The WebKit ↔ Python bridge (the core shared abstraction)

Lifted from Letters `src/window.py` (`new_webview()` ~L287, `run_js()` ~L376):

- **Python → JS:** `webview.evaluate_javascript(code, ...)` injects data/commands.
- **JS → Python:** a `WebKit.UserContentManager` script-message channel
  (`ucm.connect("script-message-received::<name>", ...)`) posts the document model back.
- **Open flow:** Python reads file → converts to the engine's native JSON model → injects.
- **Save flow:** JS posts the model over the channel → Python writes the file.

This is the structural analogue of Letters' `pypandoc.convert_file(...)`.

## What `suite-common` provides

- **App shell**: `Adw.ApplicationWindow` + `Adw.TabView` window base, menus, about dialog.
- **WebKit bridge module**: `new_webview()`, `run_js()`, script-message registration,
  busy-cursor handling, offline/sandboxed webview settings.
- **Chrome partials** (Blueprint): preferences scaffold, shortcuts dialog, error-toast
  helper, recent-files.
- **File-I/O base class**: abstract open/save (read→model→inject; post→write) with a
  trivial reference format, so each app implements only format adapters.
- **Build glue**: meson layout, gresource bundling of vendored JS, Blueprint compilation,
  `po/` i18n skeleton, Flatpak manifest skeleton (GNOME 50 runtime), gnome-gui-spec audit.

## Per-app repo layout (mirrors Letters `src/`)

```
meson.build
io.github.hanthor.<app>.json   # Flatpak: GNOME 50 runtime + vendored JS + pip libs (historical; apps ship as org.tunaos.*-rust)
data/                          # icons, .desktop, gschema, appdata/metainfo
po/
src/
  main.py
  window.py        # adapts Letters window.py: tabs + new_webview() + Python I/O bridge
  window.blp
  tab_page.blp
  preferences.blp / preferences.py
  shortcuts-dialog.blp
  <app>.gresource.xml
  <app>.in
  engine.js        # editor.js analogue: init Jspreadsheet+HyperFormula / Fabric+Reveal
  styles.css
  vendor/          # vendored minified UMD builds of the JS engines (gresource'd)
subprojects/suite-common/
```

## Packaging

The Flatpak manifest mirrors `net.codelogistics.letters.json`:
- JS engines: vendored prebuilt **UMD/minified** bundles in `src/vendor/`, listed in
  `.gresource.xml`, `<script>`-loaded from the HTML passed to `webview.load_html(...)`.
  No Node runtime ships.
- Python libs: added as `python3-*` pip modules exactly like the existing
  `python3-pypandoc` / `python3-weasyprint` blocks.

## GNOME-GUI-spec compliance

Both apps target parity with Letters' audited baseline (**85/92**, see Letters'
`AUDIT-GNOME-GUI-SPEC.md`) using the [gnome-gui-spec](https://github.com/tuna-os/suite-common)
tool. Compliance is a CI gate.

## Verification (per app)

1. `flatpak-builder` / GNOME Builder builds the manifest (vendored engines + pip libs).
2. Launch; confirm libadwaita chrome (tabs, header bar, preferences, shortcuts) renders.
3. App-specific round-trip tests (see each app's `SPEC.md`).
4. Run the gnome-gui-spec audit; target Letters parity.
