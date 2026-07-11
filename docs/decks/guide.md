---
sidebar_position: 2
title: "User Guide"
---

# 📽️ Using Decks

Decks is a modern presentation application for the GNOME desktop. This guide covers creating and delivering presentations.

## First Run

Launch Decks from the app grid:

```bash
flatpack run org.tunaos.decks
```

Or install via the TunaOS Flatpak remote:

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.decks
```

## Creating a Presentation

### New Presentation

```bash
# Launch Decks — a blank presentation opens with one slide
# Ctrl+N for a new presentation
```

### Adding Slides

| Action | Shortcut |
|---|---|
| New slide | `Ctrl+M` |
| Duplicate slide | `Ctrl+Shift+D` |
| Delete slide | `Delete` (in sidebar) |
| Reorder | Drag slides in the sidebar |

### Slide Layouts

Choose a layout from the toolbar:

- **Blank** — empty canvas for full customization
- **Title** — title and subtitle text boxes
- **Title + Content** — title with a content area
- **Two-Column** — two columns for side-by-side content

## Editing Slides

### Adding Elements

```bash
# Text Box: Click the Text tool, then click on the canvas
# Shape: Click Shapes → choose rectangle, circle, arrow, etc.
# Image: Click Insert → Image → select file
```

### Canvas Controls

| Action | Shortcut |
|---|---|
| Select | `V` (move tool) |
| Move | Drag selected element |
| Resize | Drag corner handles |
| Delete | `Delete` or `Backspace` |
| Undo | `Ctrl+Z` (30 levels) |
| Redo | `Ctrl+Shift+Z` |

### Element Properties

Select an element, then use the properties panel:

- **Fill color** — solid or transparent
- **Border** — width, color, style
- **Text** — font, size, bold, italic, color
- **Position** — x, y coordinates and width, height

## Transitions

Apply per-slide transitions from the Transitions panel:

| Transition | Effect |
|---|---|
| Fade | Smooth crossfade |
| Slide | Slide from right |
| Convex | Curved slide |
| Concave | Curved reverse slide |
| Zoom | Zoom in effect |
| None | Instant cut |

## Presenting

### Start Presentation

```bash
F5          # Start from beginning
Shift+F5    # Start from current slide
```

### During Presentation

| Key | Action |
|---|---|
| → / ↓ / Space | Next slide |
| ← / ↑ / Backspace | Previous slide |
| B | Black screen |
| W | White screen |
| Esc | Exit presentation |
| Slide number + Enter | Jump to slide |

### Export

Presentations export to multi-page PDF:

```bash
File → Export as PDF
```

## File Support

| Format | Read | Write | Notes |
|---|---|---|---|
| PPTX | ✅ | ✅ | PowerPoint format |
| ODP | ✅ | ✅ | OpenDocument Presentation |
| PDF | ❌ | ✅ | Export only (via Pillow) |

## See Also

- [Office Suite](/gtk-office-suite) — Tables, Decks, Letters overview
- [Tables](/tables) — spreadsheet app
- [Letters](/letters) — word processor
