---
sidebar_position: 2
title: "User Guide"
---

# ✍️ Using Letters

Letters is a modern, distraction-free word processor for GNOME. This guide covers the day-to-day workflow.

## First Run

Launch Letters from the app grid or terminal:

```bash
flatpak run org.tunaos.letters
```

You'll see a clean, empty document with:

- **Toolbar** — formatting controls (bold, italic, headings, lists)
- **Canvas** — the document editing area
- **Status bar** — word count and zoom level

## Creating a Document

### New document

```bash
# Start typing immediately. Letters opens a blank document by default.
# Press Ctrl+N for a new document.
```

### From a template

Letters supports opening existing documents in multiple formats:

| Format | Extension | Use Case |
|---|---|---|
| Microsoft Word | `.docx` | Office compatibility |
| OpenDocument | `.odt` | LibreOffice compatibility |
| Markdown | `.md` | Technical writing, docs |
| HTML | `.html` | Web publishing |

### Open a file

```bash
# Ctrl+O or File → Open
# Navigate to your file and select it
```

## Writing

### Formatting shortcuts

| Shortcut | Effect |
|---|---|
| `Ctrl+B` | **Bold** |
| `Ctrl+I` | *Italic* |
| `Ctrl+U` | Underline |
| `Ctrl+Shift+S` | ~~Strikethrough~~ |
| `Ctrl+1-6` | Heading 1-6 |
| `Ctrl+Shift+L` | Bullet list |
| `Ctrl+Shift+8` | Numbered list |
| `Ctrl+Shift+T` | Table |

### Word count

The status bar shows live word and character counts. Click the count for details (pages, paragraphs, sentences).

## Exporting

### To PDF

```bash
# File → Export as PDF
# Or Ctrl+Shift+E
```

Letters uses [WeasyPrint](https://weasyprint.org/) for high-quality PDF output with CSS styling preserved.

### To other formats

```bash
# File → Save As
# Choose from: DOCX, ODT, MD, HTML
```

The underlying [pandoc](https://pandoc.org) engine ensures faithful format conversion.

## Advanced Features

### Find and Replace

```bash
# Ctrl+F — find
# Ctrl+H — find and replace
```

### Table support

Insert tables from the toolbar or with `Ctrl+Shift+T`. Resize columns by dragging.

### Dark mode

Letters respects the system theme. Toggle with:

```bash
# GNOME Settings → Appearance → Dark
# Or use the system dark mode shortcut
```

## Integration with TunaOS

Letters is pre-installable on TunaOS via Flatpak and integrates with:

- **Files** (Nautilus) — right-click any .docx/.odt/.md → Open with Letters
- **GNOME Search** — search document titles from the overview
- **Tavern** — manage Letters installation and updates via the Homebrew GUI

## Contributing

Letters is a Rust/GTK 4 project under the TunaOS office suite. See the [GitHub repo](https://github.com/tuna-os/letters) for issues and PRs.

Good first contributions:
- Add a unit test
- Fix an accessibility label
- Translate UI strings
- Improve Markdown export

## See Also

- [Office Suite](/gtk-office-suite) — Tables, Decks, and Letters overview
- [Tables](/tables) — spreadsheet app
- [Decks](/decks) — presentation app
