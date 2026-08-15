---
sidebar_position: 3
sidebar_label: "Tables"
---

# 📊 Tables — quick start

Tables is the spreadsheet: a sparse grid engine (`tables-core`) with
[IronCalc](https://ironcalc.com) as the formula engine. Install it first —
see the [Office Suite overview](./index.md#-quick-install) — then come back
here.

## Create or open a spreadsheet

- **New**: `app.new-document`, or open a new tab from the header bar.
- **Open**: `app.open-file` accepts **`.xlsx`**, **`.xls`**, **`.ods`**, and
  **`.csv`**.
- **Save**: `app.save-file` (overwrite) / `app.save-file-as` (pick a new
  name and format) — same four formats as open.

## Formulas

Type directly into the active cell, and start with `=` — there's no
separate formula bar, the cell itself is the input:

```
=SUM(A1:A5)
=AVERAGE(B2:B10)
=COUNT(C:C)
```

IronCalc resolves references and recalculates the sheet live. The status
bar at the bottom shows Sum/Average/Count for the selection. You don't
need a formula at all — select a range and read it straight off the bar.

## Cells, rows, and columns

| What | Action |
|---|---|
| Format cells (number format, borders, alignment) | `app.format-cells` |
| Cycle number format / cell border on the selection | `app.cycle-number-format`, `app.cycle-cell-border` |
| Merge cells | `app.merge-cells` |
| Hide / unhide rows or columns | `app.hide-selected-rows`, `app.hide-selected-cols`, `app.unhide-all-rows`, `app.unhide-all-cols` |
| Filter by column / clear filter | `app.filter-by-column`, `app.clear-filter` |
| Conditional formatting | `app.conditional-format` |
| Named ranges | `app.define-name` |
| Jump to a cell | `app.goto-cell` |
| Insert a chart | `app.insert-chart` |
| Set / clear the print area | `app.set-print-area`, `app.clear-print-area` |

All of the above are also in the command palette (**Ctrl+K**) with their
shortcuts listed — or press **Ctrl+?** for the full overlay.

## Export to PDF

**Ctrl+K → "Export as PDF…"** (`app.export-pdf`) — a print-oriented export
distinct from a save to `.xlsx`/`.ods`/`.csv` above; it respects the print
area if you've set one.

## What's next

- [Letters quick start](./letters.md)
- [Decks quick start](./decks.md)
- Full feature/format parity status: [PARITY.md](https://github.com/tuna-os/gtk-office-suite/blob/main/docs/PARITY.md)
- Source: [github.com/tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
