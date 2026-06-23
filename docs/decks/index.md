---
sidebar_position: 1
---

# 📽️ Decks

Presentation application for the TunaOS GNOME office suite.

Powered by [Fabric.js](http://fabricjs.com/) for slide editing and [Reveal.js](https://revealjs.com/) for fullscreen presentations. Reads and writes PPTX and ODP files using [python-pptx](https://python-pptx.readthedocs.io/) and [odfpy](https://github.com/eea/odfpy). Exports to PDF via [Pillow](https://python-pillow.org/).

Shares the [suite-common](https://github.com/tuna-os/suite-common) scaffold with [Letters](/docs/letters) and [Tables](/docs/tables).

## Features

- **Canvas editing**: Text boxes, shapes, images on a Fabric.js canvas
- **Slide management**: Add, delete, duplicate, reorder slides via sidebar
- **Layouts**: Blank, Title, Title+Content, Two-Column presets
- **Transitions**: Fade, Slide, Convex, Concave, Zoom (per-slide)
- **Present mode**: Fullscreen via Reveal.js with B/W/. blank shortcuts
- **Undo/Redo**: 30-level canvas action history (Ctrl+Z / Ctrl+Shift+Z)
- **Export**: Multi-page PDF
- **Keyboard shortcuts**: Familiar shortcuts (Ctrl+M, Ctrl+Shift+D, F5, Home, End)

## Install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.decks
```

## Build

```bash
git clone https://github.com/tuna-os/decks.git
cd decks
just setup   # clones suite-common + vendors JS engines
just build   # builds & installs Flatpak
just run     # launches
```

## Test

```bash
just lint       # syntax check
just l1test     # 11 adapter round-trip tests
just guitest    # AT-SPI dogtail GUI test
```

## License

GPL-3.0-or-later. Vendored JS engines: MIT (fabric.js), MIT (reveal.js).
