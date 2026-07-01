---
sidebar_position: 2
title: "User Guide"
---

# 📊 Using Tables

Tables is a full-featured spreadsheet application for the GNOME desktop. This guide covers common workflows.

## First Run

Launch Tables from the app grid:

```bash
flatpack run org.tunaos.tables
```

Or install via the TunaOS Flatpak remote:

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.tables
```

## Basic Operations

### Entering Data

Click any cell and start typing. Press `Enter` to move down, `Tab` to move right.

| Action | Shortcut |
|---|---|
| Edit cell | `F2` or double-click |
| Move down | `Enter` |
| Move right | `Tab` |
| Move up | `Shift+Enter` |
| Select column | `Ctrl+Space` |
| Select row | `Shift+Space` |
| Fill down | `Ctrl+D` |
| Fill right | `Ctrl+R` |

### Formulas

Tables supports ~400 functions via HyperFormula. Start a formula with `=`:

```text
=SUM(A1:A10)
=IF(B1>100, "High", "Low")
=VLOOKUP(C1, D1:E10, 2, FALSE)
=AVERAGE(A1:A5)
```

### Working with Sheets

- **Add sheet**: Click `+` in the sheet tab bar
- **Rename**: Double-click a sheet tab
- **Reorder**: Drag sheet tabs left or right
- **Color**: Right-click a tab → Tab Color

## Formatting

### Cell Formatting

```text
Bold:      Ctrl+B
Italic:    Ctrl+I
Underline: Ctrl+U
Alignment: Toolbar buttons (L/C/R)
Borders:   Toolbar → Borders menu
```

### Number Formats

Right-click a cell → Format Cells → choose:

| Format | Example |
|---|---|
| General | 1234.56 |
| Number | 1,234.56 |
| Currency | $1,234.56 |
| Percentage | 12.35% |
| Date | 2026-06-29 |

## Charts

Select data and insert a chart:

1. Select the data range
2. Click **Insert → Chart**
3. Choose type: Bar, Line, or Pie
4. The chart embeds in the sheet and exports to XLSX

## Data Tools

### Sort & Filter

```text
Select range → Data → Sort
Select range → Data → Filter
```

### Freeze Panes

```text
Select cell below/right of freeze point → View → Freeze Panes
```

### Merge Cells

```text
Select cells → Format → Merge Cells
```

## File Support

| Format | Read | Write | Notes |
|---|---|---|---|
| XLSX | ✅ | ✅ | Excel format with charts |
| CSV | ✅ | ✅ | Comma-separated values |
| ODS | ✅ | ✅ | OpenDocument Spreadsheet |
| XLS | ✅ | ❌ | Legacy Excel (read only) |

## See Also

- [Office Suite](/gtk-office-suite) — Tables, Decks, Letters overview
- [Decks](/decks) — presentation app
- [Letters](/letters) — word processor
