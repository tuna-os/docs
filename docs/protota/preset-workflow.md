---
sidebar_position: 13
title: "preset workflow"
---

Presets are not hand-drawn: each one is **generated from the app's real
Blueprint/GtkBuilder (and Vala) source**, then **hand-finished** with a small,
reviewable set of overrides for state the source cannot settle statically.
This document is the full workflow — the same one CI, agents, and humans use.

```text
catalog entry ──▶ import-gnome-app ──▶ finishing file ──▶ capture ──▶ Broadway verify ──▶ PR
```

## 1. Catalog entry

`tests/fixtures/gnome-app-catalog.json` is the machine-readable source of
truth. A source-importable app needs:

```jsonc
"calculator": {
  "sourceImport": {
    "repository": "https://gitlab.gnome.org/GNOME/gnome-calculator.git",
    "tag": "49.2",          // MUST match the native app version used for verification
    "importRoot": "src",    // directory walked for .blp/.ui/.vala files
    "entry": "math-window.blp"
  }
}
```

The tag pin matters: the visual oracle (the real app under Broadway) and the
imported source must be the same version, or you are comparing different UIs.

## 2. Generate

```sh
npx tsx scripts/import-gnome-app.mjs calculator          # one app
npx tsx scripts/import-gnome-app.mjs --all               # every catalogued app
npx tsx scripts/import-gnome-app.mjs calculator --refresh  # re-clone after a tag bump
```

This clones into `.gnome-source-cache/` (gitignored) and writes
`public/presets/<app>.mockup.json`. The importer resolves cross-file
templates, discovers code-built composites from Vala construction facts, and
keeps anything it cannot honestly render as a labelled `custom-widget`
boundary — never a fake approximation. The import report (diagnostics count)
is printed and embedded in the preset.

## 3. Hand-finishing

`presets-src/<app>.finishing.json` records every human decision, each with a
`why`. It can declare multiple screens (mode variants, dialogs) and flow
edges:

```jsonc
{
  "title": "GNOME Calculator",
  "screens": [
    { "id": "basic", "entry": "math-window.blp", "title": "Basic", "width": 360, "height": 460,
      "overrides": [
        { "id": "_converter", "set": { "visible": false },
          "why": "converter.set_visible(mode == CONVERSION); default mode is basic." }
      ] },
    { "id": "preferences", "entry": "math-preferences.blp", "title": "Preferences", "width": 460, "height": 420 }
  ],
  "edges": [ { "from": "basic", "to": "preferences", "why": "Main menu → Preferences" } ]
}
```

Rules of thumb:
- An override needs a `why` grounded in the app's source or observed runtime
  behaviour — not taste.
- Mode variants reuse the same entry and switch the visible stack page via
  `visibleChildName`.
- If GNOME renames a node id, generation **fails loudly** listing the stale
  overrides — that is the drift alarm working.
- Use the app's official appdata screenshots (`<image>` URLs in its
  metainfo) to decide which states deserve screens.

## 4. Visual review

```sh
npm run dev          # in one terminal
npx tsx scripts/capture-preset.mjs calculator      # writes artifacts/preset-calculator.png
```

Captures the whole canvas — all screens plus flow arrows — with editor
chrome hidden. Look at it. A passing test is not a review.

## 5. Broadway verification (pixel metrics vs the real app)

Run the app natively under Broadway and compare (see
`docs/gnome-app-conformance.md` for recorded results):

```sh
podman build -f containers/broadway/Dockerfile.fedora \
  --build-arg APP_PACKAGE=gnome-calculator --build-arg APP_COMMAND=gnome-calculator \
  -t broadway-app containers/broadway
podman run -d --rm -p 8085:8085 broadway-app
BROADWAY_URL=http://127.0.0.1:8085 BROADWAY_APP_ID=calculator BROADWAY_PRESET_ID=calculator \
  npx playwright test tests/broadway-reference.spec.ts
```

The Fedora runner covers GNOME versions newer than Ubuntu LTS. Artifacts
(native PNG, Protota PNG, diff, metrics JSON) land in `test-results/`.

## Fidelity report

Track accuracy over time instead of spot-checking. With the native app
serving Broadway (locally or through a tunnel):

```sh
npx tsx scripts/fidelity-report.mjs --broadway http://127.0.0.1:8085 weather
npx tsx scripts/fidelity-report.mjs --broadway http://127.0.0.1:8085 --screen basic calculator
```

It records difference ratio, source-resolved similarity, foreground IoU and
unresolved-boundary coverage into `artifacts/fidelity.json` and prints a
Markdown table. `--screen` picks which screen of a multi-screen preset
depicts the captured window. The tool measures; it does not launch
containers, so the same command works against podman locally or a remote
host.

Recorded 2026-07-30:

| App | Screen | Difference | Source-resolved |
| --- | --- | ---: | ---: |
| weather | first | 2.29% | 97.7% |
| calculator | basic | 9.59% | 90.3% |

## Export validation

"Design here, ship there" is only trustworthy if what this tool emits builds.
The upstream compiler is the authority, not our own parser:

```sh
npx tsx scripts/export-blueprint.mjs      # writes artifacts/blp/<app>-<screen>.blp
# then, in a container with blueprint-compiler installed:
for f in *.blp; do blueprint-compiler compile "$f" >/dev/null || echo "FAIL $f"; done
```

State as of 2026-07-30: **19 of 27** exported screens compile, up from 1. The
emitter had been producing camelCase property names, `top { }` blocks instead
of `[top]` annotations, quoted enums and object references, editor-only style
flags (`suggested: true`), and signal handlers as properties.

Every imported node now keeps the class the source declared, and export uses
it when the toolkit actually has that class, so a `Gtk.Revealer` no longer
exports as `Adw.Bin`. Bindings onto flattened templates, dangling object
references, and duplicate ids from a template used twice are all handled.

Property validity is no longer guesswork. `scripts/extract-gtk-properties.mjs`
reads GObject introspection data and writes `src/data/gtkProperties.ts` (484
classes, 67 interfaces, resolved through parents *and* implemented interfaces —
`orientation` comes from GtkOrientable, not GtkBox). Export drops any property
the class does not have, picks the slot property the class actually offers
(`child` for Adw.Bin, `content` for Adw.ToolbarView), and coerces the numeric
strings GtkBuilder writes.

Regenerate the table when targeting a newer GNOME, in a container with
gtk4-devel and libadwaita-devel installed:

```sh
node scripts/extract-gtk-properties.mjs > src/data/props.json   # then convert to the .ts module
```

Export has two modes, because its two purposes disagree on one point.
`mockupToBlueprint(doc)` preserves a boundary's instance bindings, which is
required when patching back into the app's own source where `template.` still
resolves. `mockupToBlueprint(doc, { standalone: true })` drops them, because a
file on its own has no template context. Validation uses standalone mode.

Remaining failures are four distinct causes, each verified against the
compiler and tracked in issue #77:

| File | Compiler error | Cause |
| --- | --- | --- |
| calculator-preferences | Cannot convert string to number | numeric property emitted as a string |
| ear-tag-main | Gtk.ActionBar has no property `orientation` | `Gtk.ActionBar` is missing from the generated GIR table, so nothing filters it |
| files-properties | Cannot convert string to Pango.WrapMode | enum-typed properties need coercion; the table stores names, not types |
| text-editor-preferences | Unexpected tokens | not yet minimised |

The first three share a root: the property table records which properties exist
but not their *types*, so the emitter cannot tell a number or an enum from a
string. Extending `scripts/extract-gtk-properties.mjs` to carry types would
close them together.
