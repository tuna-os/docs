---
sidebar_position: 1
---

# 📝 Letters

Modern word processor for the GNOME desktop.

Letters is a modern, minimalist word processor for the GNOME desktop, with support for reading and writing DOCX, ODT, MD and HTML, using the [pandoc](https://pandoc.org) library. It can also export documents to PDF using [weasyprint](https://weasyprint.org/).

> **This is a hard fork** of [Letters by Satvik Patwardhan](https://codeberg.org/eyekay/letters), maintained as part of the TunaOS GNOME office suite alongside [Tables](/docs/tables) and [Decks](/docs/decks).

## Features

- **Rich editing**: Bold, italic, underline, headings, lists, tables, find/replace
- **Multi-format**: DOCX, ODT, Markdown, HTML input and output
- **PDF export**: High-quality PDF via WeasyPrint
- **Word count**: Live word and character count
- **Keyboard shortcuts**: Comprehensive formatting, navigation, and editing shortcuts
- **Libadwaita**: Clean, responsive GTK 4 interface with light/dark mode

## Install

[![Get it on Flathub](https://flathub.org/api/badge?locale=en)](https://flathub.org/apps/org.tunaos.letters/)

Or from the TunaOS Flatpak remote:

```bash
flatpak remote-add tuna-os oci+https://tunaos.org/flatpak
flatpak install tuna-os org.tunaos.letters
```

## Build

```bash
git clone https://github.com/tuna-os/letters.git
cd letters
just setup   # clones suite-common subproject
just build   # builds & installs Flatpak
just run     # launches the app
```

## Test

```bash
just lint         # syntax check
pytest tests/     # 81 unit tests
```

## License

GPL-3.0-or-later.

## Credits

**Original author:** [Satvik Patwardhan](https://codeberg.org/eyekay) — the original Letters word processor, its architecture, design, and implementation.

Built with GTK 4, WebKitGTK, libadwaita, pypandoc, blueprint-compiler, weasyprint, and Flatpak.
