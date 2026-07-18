---
sidebar_position: 2
title: "User Guide"
---

# 🎬 Using Decks

Day-to-day workflow for the Decks presentation app.

## Launch

```bash
flatpak run org.tunaos.decks-rust           # new deck
flatpak run org.tunaos.decks-rust talk.pptx   # open a deck
```

Slide strip on the left, canvas in the middle, object inspector on the
right, speaker notes below. The presenter pill (previous / present /
next) floats at the bottom of the canvas, next to the live
"Slide x/y · n objects" readout.

## Building slides

- Toolbar (and **Ctrl+K** palette): **add text box**, **add shape**
  (rect/circle), **add image**
- Drag objects on the canvas — they snap to the grid; the inspector
  shows and edits exact position and size
- Double-click a text box to edit its text
- Slide strip buttons add, delete, and reorder slides; speaker notes
  save per slide as you type

## Presenting

| Action | Shortcut |
|---|---|
| Present (fullscreen) | F5 or the pill's play button |
| Next slide | Right / Down / Space |
| Previous slide | Left / Up |
| First / last slide | Home / End |
| Exit | Escape |

Slide transitions (fade, push, wipe, cover, split) are configured in
preferences.

## Files

PPTX read/write. Text styling (bold/italic/underline, size, color),
shapes, images, slide backgrounds, and speaker notes all survive a
round-trip through LibreOffice Impress — tested in CI on every change.
