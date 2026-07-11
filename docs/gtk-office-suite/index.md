---
sidebar_position: 1
sidebar_label: "Office Suite"
---

# 🏢 TunaOS GTK Office Suite

A complete, native office suite for GNOME — built in **Rust** and **GTK 4** with **Libadwaita**. Three apps, one shared scaffold, all distributed as Flatpaks.

| App | Description | Status | Install |
|---|---|---|---|
| [**Tables**](/tables) 📊 | Spreadsheet — 400+ functions, CSV/XLSX/ODS | Active | `flatpak install tuna-os io.github.hanthor.tables` |
| [**Decks**](/decks) 📽️ | Presentations — PPTX/ODP, Reveal.js export | Active | `flatpak install tuna-os io.github.hanthor.decks` |
| [**Letters**](/letters) 📝 | Word processor — DOCX/ODT/MD/HTML, PDF export | Active | `flatpak install tuna-os net.codelogistics.letters` |

## ✨ Why a Rust Office Suite?

Most Linux office suites are either:
- **Monolithic C++** (LibreOffice) — powerful but heavy, slow to start
- **Web-based** (Google Docs, OnlyOffice) — not native, requires a browser
- **Proprietary** (WPS Office) — not open source

TunaOS's office suite is different:
- **🦀 Rust** — memory-safe, fast, and modern
- **🎨 GTK 4 + Libadwaita** — native GNOME look and feel
- **📦 Flatpak** — sandboxed, auto-updating, dependency-free
- **🔗 Shared scaffold** — common chrome, WebKit bridge, and file I/O via `suite-common`
- **🧩 Interchangeable engines** — each app uses best-in-class libraries under the hood

## 🚀 Quick Install

Add the TunaOS Flatpak remote and install any app:

```bash
flatpak remote-add tuna-os oci+https://tuna-os.github.io/flatpak-index

# Install all three
flatpak install tuna-os io.github.hanthor.tables
flatpak install tuna-os io.github.hanthor.decks
flatpak install tuna-os net.codelogistics.letters
```

## 📊 Tables (Spreadsheet)

A full-featured spreadsheet application powered by:
- [Jspreadsheet CE](https://jspreadsheet.com/) — spreadsheet grid engine
- [HyperFormula](https://hyperformula.handsontable.com/) — 400+ calculation functions
- [openpyxl](https://openpyxl.readthedocs.io/) / [python-calamine](https://github.com/tafia/calamine) — XLSX read/write
- [odfpy](https://github.com/eea/odfpy) — ODS format support

## 📽️ Decks (Presentations)

Create and present slide decks with:
- [Fabric.js](http://fabricjs.com/) — canvas-based slide editing
- [Reveal.js](https://revealjs.com/) — fullscreen HTML presentations
- [python-pptx](https://python-pptx.readthedocs.io/) — PPTX read/write
- [Pillow](https://python-pillow.org/) — PDF export

## 📝 Letters (Word Processor)

A distraction-free writing experience with:
- [pandoc](https://pandoc.org) — universal document conversion
- [weasyprint](https://weasyprint.org/) — PDF export with CSS styling
- DOCX, ODT, Markdown, and HTML support

> Letters is a **hard fork** of the [original Letters](https://codeberg.org/eyekay/letters) by Satvik Patwardhan, maintained as part of the TunaOS office suite.

## 🛠️ Contributing

All three apps are written in **Rust** with **GTK 4** and **Libadwaita** bindings. They share the `suite-common` scaffold and `suite-common-rust` libraries.

Good first contributions:
- Add a unit test
- Improve error handling
- Fix an accessibility issue
- Translate UI strings
- Write documentation

### Development setup

```bash
# Clone the shared scaffold and an app
git clone https://github.com/tuna-os/suite-common.git
git clone https://github.com/tuna-os/tables.git
cd tables

# Build and run
cargo build
cargo run
```

## 🔗 See also

- [Flatpak Index](/flatpak) — all TunaOS Flatpaks
- [Corral](/corral) — VM management for development environments
- [Tacklebox](/tacklebox) — multi-boot media creator
