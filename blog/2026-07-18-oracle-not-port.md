---
slug: oracle-not-port
title: "Oracle, Not Port: A Rust Office Suite That Proves Its Parity on Every Commit"
authors: [james]
tags: [office-suite, rust, gtk, testing, letters, tables, decks]
date: 2026-07-18
---

<!-- ste-disable-file: a dated blog post; its wording is a published record. It argues a design position in the author's voice, and rewriting a published argument to hit a lint budget would change the record rather than improve a manual. STE governs the documentation, not the changelog. -->

We write a GNOME-native office suite in Rust. It has three applications:
**Letters** for text, **Tables** for spreadsheets, and **Decks** for
presentations. They use GTK4 and libadwaita, and we release them as Flatpaks.

This post is about one part that other projects can copy. It shows how a small
codebase competes with thirty years of office-suite work, and does not port
one line of it.

<!-- truncate -->
## The problem with "compatible with Word"

Each alternative office suite makes a claim about compatibility. Almost none of
them can say what the claim means. LibreOffice earned its claim across three
decades. It has a large set of test documents, and a long history of bug
reports.

We had eleven thousand lines of Rust, and a test suite. On day one we found
that the test suite had never run. The badge for CI stayed green. `pytest ||
true` hid one fact: the runner had no pytest.

Under that badge, the spreadsheet application and the presentation application
could not start at all. The save shortcut in the word processor did nothing.
Each save discarded the speaker notes.

So this is first a story about honest CI. But red tests tell you only what you
already thought to test. The more interesting question is different: how do
you test against the files that people have?

## Let LibreOffice grade the homework

Our answer: **run LibreOffice headless in CI as an oracle. Do not port its
code, its tests, or its data.**

There are three mechanisms. Each one has a ratchet: CI holds a count of the
tests that pass, and refuses to let the count fall. To raise the count is the
definition of progress.

1. **Corpora that LibreOffice writes.** We write the test scenarios in HTML.
   At test time, headless Writer makes them into `.docx` files. Our engine must
   then extract the same text and the same styles from the file that
   LibreOffice wrote. We vendor nothing, and the corpus regenerates on each
   run. Letters has 109 scenarios and passes 109 of them.

   Decks has no cheap input format to author from, so its scenarios go
   *through* the oracle instead. We write a `.pptx` file. Impress imports it,
   then exports it again in its own grammar. Our reader then reads the version
   that LibreOffice made. Decks passes 9 of 9, which includes styled runs and
   speaker notes.

2. **Round-trip oracles.** Writer, Calc, or Impress must open each file that
   our engines write. The content must survive the conversion without a
   change. Both directions gate each commit.

3. **Vendored permissive corpora.** The 652 examples in the CommonMark
   specification test the document model for round-trip idempotence, and 594
   pass. Another 107 table-driven cases come from ODF OpenFormula, and they
   measure the spreadsheet engine. All 107 pass. Nine of them started red.
   Each one was a clean `#NAME?`, and IronCalc main had the fix already. The
   ratchet held the gap open until upstream closed it.

The corpus pays for itself continuously. It found table text that our DOCX
reader dropped in silence. It found speaker notes that had never survived one
save. Best of all, it found a fault that we added ourselves while we added
support for images. The ratchet reported it twenty minutes after we wrote it.

## A document engine is smaller than you think

People think the document engine is the difficult part of a word processor. It
came to about 2,500 lines of Rust. The large costs are elsewhere, and
Rust's ecosystem or the platform pays them for us:

- **Pango does the text layout.** The platform breaks the lines, shapes the
  glyphs, and handles bidirectional text, as it does for each GNOME
  application. LibreOffice wrote its own because it is older than any usable
  system text stack. We refuse to.
- **A library reads and writes the formats.** The OOXML package and its XML live
  in [rdocx](https://github.com/tensorbee/rdocx). We contributed the read
  getters, and the write support for hyperlinks and images that our fidelity
  tests needed. [IronCalc](https://github.com/ironcalc/ironcalc) evaluates the
  spreadsheets, pulldown-cmark reads the Markdown, and Typst-as-a-library
  exports the PDFs.
- **What remains is the engine.** It is a model of paragraphs that hold styled
  runs, with invariants the code enforces. It addresses offsets in
  deliberately the same way as GtkTextBuffer, which makes the bridge to the
  widget a thin adapter. The machinery above measures how honest
  the format converters are. Decks and Letters share the model: the text boxes
  in Decks carry the same `Run` and `RunStyle` types as Letters.

Some work stays out of scope until it earns an architecture decision: fields,
macros, mail merge, tracked changes, and frames that flow text. Our target is
the documents that people make. You can read the fidelity off a scoreboard.
You do not have to trust us.

## The scoreboard, today

| Measure | Value |
|---|---|
| LibreOffice-authored parity — Letters | 109/109 |
| LibreOffice-authored parity — Decks | 9/9 |
| OpenFormula conformance — Tables | 107/107 |
| CommonMark round-trip idempotence | 594/652 |
| DOCX round-trip fidelity suite | 15/15 |
| soffice oracles (Writer/Calc/Impress, both directions) | green, gating |
| Workspace tests | 150, zero failures |

Each number prints into the CI job summary on each push. None of them can go
down.

## Steal this

The pattern moves to any project that reads or writes a file format that
somebody else defined. Find the reference implementation. Run it headless in
CI. Make it write your corpus, and put a ratchet on the count of tests that
pass. It costs a few hundred lines of test harness, and it turns "we aim to be
compatible" into a number that moves.

*Code: [tuna-os/gtk-office-suite](https://github.com/tuna-os/gtk-office-suite),
GPL-3.0-or-later. The spreadsheet core is on crates.io as
[tables-core](https://crates.io/crates/tables-core), together with
[suite-common-core](https://crates.io/crates/suite-common-core) and
[suite-export](https://crates.io/crates/suite-export). The document model
follows as `letters-core` when upstream accepts its additions to rdocx
([tensorbee/rdocx#6](https://github.com/tensorbee/rdocx/pull/6)).*
