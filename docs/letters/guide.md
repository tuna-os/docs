---
sidebar_position: 2
title: "User Guide"
---

# ✍️ Using Letters

Day-to-day workflow for the Letters word processor.

## Launch

```bash
flatpak run org.tunaos.letters-rust            # blank workspace
flatpak run org.tunaos.letters-rust report.docx  # open a document
```

The window is deliberately quiet: a slim formatting toolbar with the
paragraph-style dropdown, the page canvas, and a live status bar (word
count · style at cursor · zoom). Everything else appears when needed.

## The command palette

**Ctrl+K** opens the palette — every action in the app, searchable,
with its shortcut listed. If you forget any shortcut below, the palette
is the answer. **Ctrl+?** shows the shortcuts dialog.

## Formatting

Select text and a floating popover offers the common formatting; the
toolbar and shortcuts do the same:

| Action | Shortcut |
|---|---|
| Bold / Italic / Underline | Ctrl+B / Ctrl+I / Ctrl+U |
| Bullet / numbered list | Ctrl+Shift+8 / Ctrl+Shift+7 |
| Align left / center / right / justify | Ctrl+L / Ctrl+E / Ctrl+R / Ctrl+J |
| Insert link | Ctrl+Shift+K |
| Font size bigger / smaller | `Ctrl+Shift+>` / `Ctrl+Shift+<` |
| Paragraph style (Normal, Heading 1–6, Title, Subtitle, Code, Quote) | toolbar dropdown or palette |

Markdown macros work as you type: `**bold**`, `*italic*`, `# heading`,
`- list`.

## Files

| Action | Shortcut |
|---|---|
| New / Open / Save / Save as | Ctrl+N / Ctrl+O / Ctrl+S / Ctrl+Shift+S |
| Find & replace | Ctrl+F |
| Print / Print preview | Ctrl+P / Ctrl+Shift+P |
| Export as PDF | Ctrl+Shift+E |
| Page setup (size, margins) | Ctrl+Shift+L |

Formats: DOCX, ODT, Markdown, HTML, plain text. Page geometry,
headers/footers (`{page}` inserts the page number), fonts, and line
spacing survive round-trips — this is tested against LibreOffice on
every change.

## View

The ruler is off by default — toggle it with **Ctrl+Shift+R**. Margin
guides appear when the pointer is over the page. Zoom with the status
bar slider or Ctrl+scroll.
