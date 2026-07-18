---
sidebar_position: 1
---

# 📝 Letters

Word processor for the GNOME desktop, part of the
[TunaOS Office Suite](/docs/gtk-office-suite). Written in Rust with
GTK 4 and Libadwaita; the document engine
([`letters-core`](https://github.com/tuna-os/gtk-office-suite/tree/main/letters-core))
is a GTK-free Rust crate whose file fidelity is verified against
LibreOffice in CI.

![Letters](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/letters.png)

## Features

- **Rich editing** — bold/italic/underline/strikethrough, highlight,
  headings 1–6, Title/Subtitle styles, lists, block quotes, code,
  links, images, tables, find & replace, spell check
- **Formats** — DOCX, ODT, Markdown, HTML, plain text in and out; PDF
  export. Page size/margins, headers/footers with `{page}`, font
  family/size/color, and line spacing round-trip
- **Selection popover** — formatting appears where you select; the
  status bar shows a live word count and the style at the cursor
- **Command palette** — Ctrl+K lists every action with its shortcut
- **Markdown macros** — type `**bold**` and it formats as you write

## Install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.letters-rust
```

Opens files from the command line and file manager:
`flatpak run org.tunaos.letters-rust report.docx`

## Source

Part of
[tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
(GPL-3.0-or-later). The name honors the original
[Letters by Satvik Patwardhan](https://codeberg.org/eyekay/letters);
this is a from-scratch Rust application.
