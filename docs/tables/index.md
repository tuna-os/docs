---
sidebar_position: 1
---

# 📊 Tables

Spreadsheet application for the TunaOS GNOME office suite.

Powered by [Jspreadsheet CE](https://jspreadsheet.com/) and [HyperFormula](https://hyperformula.handsontable.com/) with ~400 Excel-compatible functions. Reads and writes CSV, XLSX, and ODS files using [openpyxl](https://openpyxl.readthedocs.io/), [python-calamine](https://github.com/tafia/calamine), and [odfpy](https://github.com/eea/odfpy).

Shares the [suite-common](https://github.com/tuna-os/suite-common) scaffold with [Letters](/docs/letters) and [Decks](/docs/decks).

## Features

- **Formulas**: ~400 functions (SUM, IF, VLOOKUP, etc.) via HyperFormula
- **Multi-sheet**: workbook tabs, sheet navigation
- **Formatting**: Bold, Italic, Underline, Alignment (L/C/R), cell borders
- **Charts**: Bar, Line, Pie charts embedded in XLSX (openpyxl)
- **Data tools**: Sort, filter, freeze panes, merge cells, number formatting
- **Fill**: Fill down (Ctrl+D), fill right (Ctrl+R)
- **Selection**: Ctrl+Space (column), Shift+Space (row)
- **Keyboard shortcuts**: Excel-compatible (Ctrl+B/I/U, PgUp/PgDn, etc.)

## Install

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.tables
```

## Build

```bash
git clone https://github.com/tuna-os/tables.git
cd tables
just setup   # clones suite-common + vendors JS engines
just build   # builds & installs Flatpak
just run     # launches
```

## Test

```bash
just lint          # syntax check
just l1test        # 20 adapter round-trip tests
just guitest       # AT-SPI dogtail GUI test
just formulatest   # HyperFormula vector conformance
just shortcuttest  # keyboard shortcut verification
```

## License

GPL-3.0-or-later. Vendored JS engines: MIT (jspreadsheet-ce, jsuites), GPL-3.0 (hyperformula).
