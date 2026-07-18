---
sidebar_position: 1
---

# 📊 Tables

Spreadsheet for the GNOME desktop, part of the
[TunaOS Office Suite](/docs/gtk-office-suite). Written in Rust with
GTK 4 and Libadwaita; formulas are evaluated by
[IronCalc](https://ironcalc.com) (OpenFormula conformance measured at
107/107 in our corpus), rendered on a Cairo canvas.

![Tables](https://raw.githubusercontent.com/tuna-os/gtk-office-suite/main/docs/screenshots/tables.png)

## Features

- **Formulas** — IronCalc engine; formulas stay live through
  save/reload (LibreOffice Calc recalculates our files — proven in CI)
- **Formats** — XLSX read/write; ODS and CSV import. Number formats,
  merged cells, frozen panes, and column widths persist
- **Selection that works like a spreadsheet** — drag, Shift+click,
  Shift+arrows; live **Sum · Avg · Count** in the status bar; name box
  with **Ctrl+G** "Go to Cell"; Escape returns from the formula bar to
  the grid
- **Command palette** — Ctrl+K lists every action with its shortcut
- Multi-sheet, sort, borders, merge, validation, charts (bar/line/pie)

## Install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.tables-rust
```

Opens files from the command line and file manager:
`flatpak run org.tunaos.tables-rust budget.xlsx`

## Source

Part of
[tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite)
(GPL-3.0-or-later).
