---
sidebar_position: 1
---

# 📽️ Decks

Presentations for the GNOME desktop, part of the
[TunaOS Office Suite](/docs/gtk-office-suite). Written in Rust with
GTK 4 and Libadwaita; slides render on a Cairo canvas and text styling
shares the same run model as Letters, so styled text moves between the
apps losslessly.

![Decks](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/decks.png)

## Features

- **PPTX read/write** — text boxes (with per-run bold/italic/underline,
  font size, color), shapes, images, slide backgrounds, and speaker
  notes survive a round-trip through LibreOffice Impress (proven in CI)
- **Editing** — slide strip with add/delete/reorder, object inspector
  (position/size), drag with snap-to-grid, double-click text editing,
  speaker-notes pane
- **Presenting** — presenter pill (previous/present/next), fullscreen
  mode with keyboard navigation and transitions (F5)
- **Command palette** — Ctrl+K lists every action with its shortcut;
  the status readout shows slide *x/y* and object count

## Install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.decks-rust
```

Opens files from the command line and file manager:
`flatpak run org.tunaos.decks-rust talk.pptx`

## Source

Part of
[tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
(GPL-3.0-or-later).
