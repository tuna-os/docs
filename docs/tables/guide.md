---
sidebar_position: 2
title: "User Guide"
---

# 🧮 Using Tables

Day-to-day workflow for the Tables spreadsheet.

## Launch

```bash
flatpak run org.tunaos.tables-rust            # blank workbook
flatpak run org.tunaos.tables-rust budget.xlsx  # open a file
```

The layout is Calc-style: name box + formula bar on top, the grid, and
sheet tabs with a live selection readout at the bottom.

## Moving around

| Action | How |
|---|---|
| Jump to a cell | **Ctrl+G**, type `C6`, Enter |
| Move the selection | arrow keys |
| Extend the selection | Shift+arrows, Shift+click, or drag |
| Back to the grid from the formula bar | Escape |

Select more than one cell and the bottom-right readout shows
**range · Sum · Avg · Count** live.

## Editing

Type in the formula bar and press **Enter** — the value or formula
commits and focus returns to the grid. Formulas start with `=`
(IronCalc engine: SUM, AVERAGE, IF, string functions, cross-references,
absolute refs — the OpenFormula corpus runs at 107/107). **Delete**
clears the active cell. **Ctrl+Z / Ctrl+Shift+Z** undo/redo.

Toolbar actions (also in the **Ctrl+K** palette): cycle number format
(currency, percent, date, scientific), cycle cell borders, merge
cells, insert chart, export PDF.

## Files

XLSX read/write; ODS and CSV import. Formulas are saved as live
formulas — LibreOffice Calc recalculates them. Number formats, merged
cells, frozen panes, and column widths persist. Column edges drag to
resize; double-click auto-fits.
