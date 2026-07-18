---
sidebar_position: 1
sidebar_label: "Office Suite"
---

# 🏢 TunaOS Office Suite

A native office suite for GNOME — three apps written in **Rust** with
**GTK 4** and **Libadwaita**, sharing one document-engine foundation,
distributed as Flatpaks.

| App | Description | Install |
|---|---|---|
| [**Letters**](/docs/letters) 📝 | Word processor — DOCX, ODT, Markdown, HTML, PDF export | `flatpak install tuna-os org.tunaos.letters-rust` |
| [**Tables**](/docs/tables) 📊 | Spreadsheet — XLSX, ODS, CSV, IronCalc formula engine | `flatpak install tuna-os org.tunaos.tables-rust` |
| [**Decks**](/docs/decks) 📽️ | Presentations — PPTX, present mode, speaker notes | `flatpak install tuna-os org.tunaos.decks-rust` |

## 🚀 Quick install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo

flatpak install tuna-os org.tunaos.letters-rust
flatpak install tuna-os org.tunaos.tables-rust
flatpak install tuna-os org.tunaos.decks-rust
```

Installable `.flatpak` bundles are also attached to each
[GitHub release](https://github.com/tuna-os/gtk-office-suite/releases).

## Screenshots

Regenerated automatically from the real apps by CI:

![Letters](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/letters.png)

![Tables](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/tables.png)

![Decks](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/decks.png)

## Why this suite

- **🦀 Pure Rust engines** — each app's document model lives in a
  GTK-free core crate (`letters-core`, `tables-core`, `decks-core`)
  with the UI as a thin shell. The formula engine is
  [IronCalc](https://ironcalc.com); DOCX I/O is
  [rdocx](https://github.com/tensorbee/rdocx).
- **📏 Measured LibreOffice parity, not claimed** — every persisting
  feature is proven by tests that run our files through a headless
  LibreOffice in CI: 65 oracle tests, LibreOffice-authored corpora, and
  a CommonMark round-trip ratchet at 630/652. See
  [PARITY.md](https://github.com/tuna-os/gtk-office-suite/blob/main/docs/PARITY.md).
- **⌨️ Powerful without clutter** — a Ctrl+K command palette lists every
  action with its shortcut in all three apps; selection raises the
  formatting you need; status bars are live (word count and style in
  Letters, Sum/Avg/Count in Tables, slide/object readout in Decks).
- **🎨 GNOME native** — libadwaita chrome, adaptive layouts, AT-SPI
  accessible; the smoke-test suite drives the apps through a screen
  reader's eyes on every push.

## Source

[github.com/tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) —
GPL-3.0-or-later. The roadmap lives in
[docs/ROADMAP.md](https://github.com/tuna-os/gtk-office-suite/blob/main/docs/ROADMAP.md).
