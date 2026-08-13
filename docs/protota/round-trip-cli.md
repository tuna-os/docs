---
sidebar_position: 15
title: "round trip cli"
---

Phase 3 of [source-widget-architecture.md](https://github.com/tuna-os/protota/blob/main/docs/source-widget-architecture.md)
(issues #56, #80). Two host-side Node CLIs close the loop between a real
GNOME app checkout and the browser editor. The browser keeps downloading
files by default; writing into a checkout is always an explicit host action.

Both commands run with `npx tsx` and share `scripts/round-trip-lib.mjs`.

## `protota-import` — checkout → source bundle

```
npx tsx scripts/protota-import.mjs <source-root> [options]
```

Walks a checkout, discovers its `.blp`/`.ui` files through build metadata —
`*.gresource.xml` file lists (compiled `.ui` entries are mapped back to
sibling `.blp` sources) and `meson.build` string references — and falls back
to a recursive glob **with an explicit note** when no metadata references any
UI file. Declarative files on disk that metadata does not reference are
excluded and listed.

The discovery core itself is environment-free and lives in
`src/utils/appDiscovery.ts` (an abstract `{ path → text }` file map in, the
selected files, notes, and manifest facts out). The CLI walks the filesystem
into that map; the browser's **File → Import App** front door (#118 — folder
drop, zip, git-forge URL, plus `MockupBuilder.importApp` /
`importAppFromUrl` on the agent API) feeds the same core from in-page
ingest, so both always agree about what an app checkout contains.

It prints a manifest to stderr (files found with their template
declarations, entry candidates, unresolved `$Template` references, parse
issues) and writes a source bundle JSON — `{ version: 1, entry, files }`,
the exact shape `blueprintBundleToDocument` and the browser editor consume —
to stdout or `--out`.

| Flag | Meaning |
| --- | --- |
| `--entry <path>` | entry file, relative to the root; required when several window-bearing files exist |
| `--out <file>` | write the bundle here instead of stdout |
| `--with-code` | include `.vala`/`.c` sources for Phase 4 enrichment |
| `--bpc <command>` | blueprint-compiler command; `{file}`, `{dir}`, `{name}` placeholders are substituted |
| `--no-validate` | skip compiler validation explicitly |

Exit codes: `0` ok · `1` usage / nothing found / entry unresolvable ·
`2` blueprint-compiler rejected a discovered file · `3` no
blueprint-compiler available and `--no-validate` not given (the bundle is
still written; it is simply **unvalidated**, and the tool says so instead of
skipping silently).

## `protota-writeback` — edited document → checkout

```
npx tsx scripts/protota-writeback.mjs <source-root> <edited.mockup.json> [options]
```

Takes the source root plus the editor's `.mockup.json` export (either the
raw document or the `{ document, assets }` payload), re-imports the checkout
to reconstruct the *original* document, three-way diffs it against the
edited document, and patches each edit into the file that **defines** the
widget:

- An edit inside an expanded template lands in the template's own file,
  never in the entry file. New children of a template instance are inserted
  into the template declaration.
- Patches are textual splices on property-value spans and statement
  boundaries: untouched lines, comments, and translation wrappers
  (`_("…")` / `C_("ctx", "…")` — only the final string literal is swapped)
  survive byte-for-byte. Files without edits are not rewritten at all.
- Class tokens are never rewritten. A `$SourceClass` boundary keeps its real
  class; a class/type change in the edited document is refused and reported,
  never applied.
- **Dry run is the default.** Every touched file is reported (with per-edit
  labels) and a unified diff is printed before anything can be written;
  `--write` is required to modify the checkout.
- Patched results are validated with the pinned blueprint-compiler *before*
  writing: resolution order is `--bpc` command → the checkout's own
  `subprojects/blueprint-compiler/blueprint-compiler.py` → host `PATH`. If a
  patched file does not compile, nothing is written.

| Flag | Meaning |
| --- | --- |
| `--checkout <path>` / `--document <file>` | self-describing aliases for the two positionals (the browser's export dialog generates commands in this form) |
| `--entry <path>` | entry file; required when several window-bearing files exist |
| `--write` | apply the patches (default is dry-run) |
| `--bpc <command>` | blueprint-compiler command; `{file}`, `{dir}`, `{name}` placeholders are substituted |
| `--allow-unvalidated` | permit `--write` when no compiler is available |

Exit codes: `0` ok · `1` usage error / patch plan failed · `2` a patched
file does not compile (nothing written) · `3` no blueprint-compiler
available (diffs still printed; `--write` refused without
`--allow-unvalidated`) · `4` some edits could not be written back — the
report lists each one.

Validating without a host blueprint-compiler, via a container:

```
npx tsx scripts/protota-writeback.mjs ~/src/app edited.mockup.json \
  --bpc 'podman run --rm -v {dir}:/blp:z localhost/bpc sh -c "blueprint-compiler compile /blp/{name}"'
```

## Browser paths — "Export → Patch into Checkout…"

The write-back UX bridge (ADR 0001 Part 3 item 1). The editor's export
surface (File menu, and the Code Export modal) opens a dialog with two ways
to land edits in a checkout; per the #80 decision the browser never writes
into a checkout silently — the host action stays explicit, and nothing
leaves the machine (no proxy, no upload).

**Download + command (every browser).** The dialog downloads the current
document as `<title>.mockup.json` and generates a copyable one-liner from
the checkout path you type:

```
npx tsx scripts/protota-writeback.mjs --checkout ~/src/my-app --document my-app.mockup.json
```

A second copy button appends the containerized `--bpc` variant above for
hosts without blueprint-compiler. The command is the normal CLI: dry-run by
default, `--write` to apply.

**Write patch directly (Chromium, File System Access API).** When
`window.showDirectoryPicker` exists the dialog also offers "Write patch
directly…": you grant a read-write handle on the checkout folder, and the
*same* write-back core the CLI uses (extracted to `src/utils/writeback.ts`;
`scripts/round-trip-lib.mjs` re-exports it) runs in-page — re-import through
the handle, three-way diff, CST patch plan. Every touched file is reported
with per-edit labels and a unified diff before anything happens; writing
occurs only after an explicit confirm, which is the in-browser equivalent of
the CLI's `--write` gate. One honest difference: blueprint-compiler cannot
run in the browser, so directly-written patches are **unvalidated** — the
dialog says so and prints the `blueprint-compiler compile <file>` commands
to run on the host afterwards. Non-Chromium browsers simply do not see this
section and keep the download + command path.

## Honest limits — what cannot be written back yet

Reported per edit as `NOT WRITTEN`, with exit code 4:

- **Opaque values**: bindings/expressions (`bind …`), combo-row `options`,
  view-stack `pages`, breakpoint conditions, and editor images (`imageId`).
  Existing opaque values in the source are *preserved untouched*; edits to
  them are refused.
- **Reordering children** (write-back would have to move comment-bearing
  slices; remove + re-add works).
- **GtkBuilder XML** (`.ui`) files: they are imported and template-resolved,
  but the textual patcher covers Blueprint only.
- **New screens / removed screens**: write-back never creates or deletes
  top-level files.
- Widgets the importer itself drops or synthesises (non-visual controllers,
  `Adw.ButtonContent` folded into its button, popover-slot children,
  `Adw.MultiLayoutView` slot substitution) cannot be round-tripped
  individually; their source slices stay untouched.
- Widgets that can only be located structurally (no id anywhere in their
  ancestor chain and ambiguous class occurrence) fail attribution and are
  reported rather than guessed.

## Round-trip guarantee (tested in `src/__tests__/round-trip-cli.test.ts`)

Import → edit → write-back → re-import reflects the edit; files without
edited widgets stay byte-identical; a template-owned edit lands in the
template's file; custom classes survive verbatim.
