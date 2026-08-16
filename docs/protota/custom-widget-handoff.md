---
sidebar_position: 6
title: "custom widget handoff"
---

## Objective

Make Protota a source-first renderer for GTK4/Libadwaita applications:

`official app source → editable Protota document → rendered mockup → .blp export`

The renderer must be generic across GNOME Core and Circle applications. Do not
add per-app presets, hand-authored UI JSON, screenshot-specific CSS, or visual
substitutions that claim to render a widget whose source Protota did not
understand.

The immediate blocker is custom widgets. Many GNOME applications declare their
window structure in Blueprint/GtkBuilder, but create major visual regions from
Vala, C, Rust, or GJS. If those regions disappear, source import is technically
successful but visually useless.

## Current implementation

- Blueprint and GtkBuilder import lives in `src/utils/blueprint.ts`.
- Multi-file Blueprint template expansion is `blueprintBundleToDocument()`.
- Unsupported `$Template instance { ... }` references become
  `Protota.CustomWidget` nodes, rendered as visibly striped, allocated
  boundaries in `src/components/AdwaitaRenderer.tsx`.
- Comparison code masks those boundaries and reports:
  - raw similarity;
  - source-resolved similarity;
  - unresolved-widget coverage;
  - raw-similarity ceiling.
- CI runs native applications through Broadway and captures the exact native
  window dimensions. `tests/broadway-reference.spec.ts` holds the contract.
- Calculator is the only current source-bundle CI case. CI clones the official
  `gnome-calculator` checkout and imports `src/ui/math-window.blp` plus every
  `src/ui/*.blp` file. It is explicitly labelled `inputKind: source-bundle`.

Recent generic importer additions include `GtkStack`, `GtkStackPage`, and
`GtkScrolledWindow`, plus Blueprint array handling (`styles [ ... ]`).

## Evidence from the first source-derived comparison

Run: `30444382804`, Calculator artifact. Native and Protota surfaces were both
`360 × 460`; geometry is not the mismatch.

| Metric | Result |
| --- | ---: |
| Raw similarity | 78.04% |
| Source-resolved similarity | 75.92% |
| Foreground IoU | 14.70% |
| Unresolved-widget coverage | 10.43% |
| Attainable raw ceiling | 89.57% |

Visual inspection found a native Calculator window with a display/history and
full basic keypad. The imported render had header controls and a visible
`GtkSourceView` boundary, but no usable keypad. It is an honest result, not a
renderer pass.

`GtkSourceView` is referenced from the Calculator BLP but implemented in code,
so it is correctly represented as an explicit custom-widget boundary. The
larger `MathButtons` region is code-defined and is not currently discoverable
from the BLP tree, so it is absent rather than falsely rendered.

## Source facts to preserve

Official Calculator source on the build host is at:

`~/work/gnome-source-fixtures/gnome-calculator`

Relevant files:

- `src/ui/math-window.blp`: template `$MathWindow`, structural window layout.
- `src/ui/math-display.blp`: includes `$GtkSourceView` reference.
- `src/ui/buttons-*.blp`: declarative button panel templates.
- Calculator's `MathButtons` is implemented in Vala, then instantiated by the
  app/runtime rather than defined as a BLP template.

The BLP contains a `$MathButtons _buttons { ... }` reference near the end of
the window content. Determine why the importer does not retain that reference
as an allocated code-boundary node after template expansion. Fix the parser or
bundle resolver generically if it is at fault; do not special-case Calculator.

## What a correct solution should do

### 1. Retain every source-declared construction boundary

For each declarative child, import one of:

1. a supported generic GTK/Adwaita widget tree;
2. an inlined template from the supplied source bundle; or
3. an explicit `custom-widget` boundary.

No source child may silently vanish. Introduce an importer report that records
the source path, source class/template, instance id, parent id/slot, and the
reason for a boundary.

### 2. Recover geometry for code-only widgets

A boundary needs an allocated rectangle that follows GTK layout rules. Derive
its width/height from the best available evidence, in priority order:

1. explicit Blueprint/GtkBuilder size requests, margins, expand flags, and
   grid attachment; 
2. properties/types visible in the code constructor or composite template;
3. sibling allocation and parent layout constraints;
4. native Broadway widget geometry, when a stable source-id-to-DOM mapping can
   be established.

Render a labelled boundary only when visual implementation is unavailable.
Its actual allocated rectangle must be included in the unresolved mask.

### 3. Extract code construction structurally, not by application name

Implement a generic static extractor for common patterns in Vala/C/Rust/GJS:

- GObject subclass template declarations;
- `Gtk.Widget`/`Adw.*` construction calls;
- `set_child`, `append`, `attach`, `set_content`, `add_overlay`, and stack/page
  insertion calls;
- builder/template child declarations;
- constant properties affecting geometry and visibility.

It is acceptable to begin with a conservative extractor that emits boundaries
for unrecognised expressions. It must never fabricate controls or text from a
screenshot.

### 4. Promote reusable widget implementations

Some classes should become generic renderer features when encountered across
apps, for example `GtkSourceView`, list/grid models, tab bars, navigation
pages, scrollers, stacks, overlays, and custom drawing surfaces. Add generic
support only when the semantics are documented and testable.

## Required tests and success criteria

1. A unit test using the real Calculator checkout (`OFFICIAL_SOURCE_ROOT`) must
   prove that `$MathButtons _buttons` survives as either an expanded tree or a
   `custom-widget` with its source id and parent placement.
2. Add source-bundle fixture tests for each newly supported generic pattern.
3. CI comparison JSON must retain `inputKind`, geometry, unresolved coverage,
   and source-resolved similarity.
4. A visual score is a pass only when both source-resolved similarity and
   foreground IoU meet calibrated thresholds. High background similarity alone
   is never a pass.
5. Track maximum attainable similarity as `1 - unresolvedWidgetCoverage`; do
   not demand a raw score above that ceiling.

## Non-goals / guardrails

- Do not restore or tune `public/presets/*.mockup.json` to make comparisons
  look better. They are legacy inputs only.
- Do not encode official app UIs in JSON.
- Do not add per-app branches in the renderer.
- Do not use screenshots as runtime input or infer semantic widgets from their
  pixels.
- Do not hide unresolved regions from metrics.
- Keep `playwright-report/index.html` untouched; it is a user-owned dirty file.

## Recommended first investigation

Run the official-source unit test on the build host:

```sh
cd ~/work/protota-source-loop
OFFICIAL_SOURCE_ROOT=~/work/gnome-source-fixtures/gnome-calculator/src/ui \
  podman run --rm --userns=keep-id \
  -e OFFICIAL_SOURCE_ROOT=/fixtures \
  -v "$PWD":/work:Z \
  -v ~/work/gnome-source-fixtures/gnome-calculator/src/ui:/fixtures:ro,Z \
  -w /work mcr.microsoft.com/playwright:v1.62.0-noble npm run test:unit
```

Then inspect the expanded `math-window.blp` token stream and parser cursor
around `$MathButtons _buttons`. The first deliverable is not a visual keypad;
it is a correct retained, allocated boundary with an auditable source report.
