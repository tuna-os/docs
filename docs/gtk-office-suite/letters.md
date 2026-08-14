---
sidebar_position: 2
sidebar_label: "Letters"
---

# 📝 Letters — quick start

Letters is the word processor: `letters-core` (a GTK-free document engine)
under a GTK4/Libadwaita shell. Install it first — see the
[Office Suite overview](./index.md#-quick-install) — then come back here.

## Create or open a document

- **New document**: launch Letters, or open a new tab from the header bar.
- **Open**: the file picker accepts **`.md`**, **`.txt`**, **`.html`**,
  **`.docx`**, and **`.odt`**. Opening a `.docx`/`.odt` round-trips through
  the real format's paragraph, run, and table structure — not a flattened
  text dump.
- **Save**: pick a filename with the extension you want. The extension
  decides the writer: `.docx` and `.odt` write the real format via the
  `letters-core::docx`/`odt` modules; anything else (including `.txt`)
  serializes as Markdown. There isn't a separate HTML *writer* — `.html` is
  an **open**-side format only, so don't rely on `.html` as a save target.

## Formatting and structure

Everything is reachable from the command palette (**Ctrl+K**) or the
selection toolbar — the actions below are the ones behind those UI paths,
if you'd rather know the underlying name:

| What | Action |
|---|---|
| Bold / italic / underline / strikethrough | `app.bold`, `app.italic`, `app.underline`, `app.strikethrough` |
| Headings (H1–H6), body text, quote, code block | `app.style-h1` … `app.style-h6`, `app.style-p`, `app.style-quote`, `app.style-code` |
| Bullet / numbered list | `app.bullet-list`, `app.numbered-list` |
| Alignment | `app.align-left`, `app.align-center`, `app.align-right`, `app.align-justify` |
| Insert table / image / link / footnote | `app.insert-table`, `app.insertimage`, `app.insertlink`, `app.insert-footnote` |
| Highlight, font size | `app.highlight`, `app.increase-font` / `app.decrease-font` |
| Headers, page setup | `app.edit-headers`, `app.page-setup` |

Press **Ctrl+?** anytime for the full shortcuts overlay — it's generated
from the same action list, so it never drifts from what's actually bound.

## Export to PDF

**Ctrl+K → "Export as PDF…"** (`app.export-pdf`) renders the document
through a Typst-backed pipeline — a separate path from the DOCX/ODT
writers above, used specifically for print-quality PDF output.

## What's next

- [Tables quick start](./tables.md)
- [Decks quick start](./decks.md)
- Full feature/format parity status: [PARITY.md](https://github.com/tuna-os/gtk-office-suite/blob/main/docs/PARITY.md)
- Source: [github.com/tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
