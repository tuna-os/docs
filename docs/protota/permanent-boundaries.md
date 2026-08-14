---
sidebar_position: 12
title: "permanent boundaries"
---

Every preset in `public/presets/` with `"generatedBy": "scripts/generate-preset.mjs"`
is produced from pinned official GNOME source (see `sourceImport` in
[`tests/fixtures/gnome-app-catalog.json`](https://github.com/tuna-os/protota/blob/main/tests/fixtures/gnome-app-catalog.json))
plus a reviewable hand-finishing file in `presets-src/`. Whatever the importer
cannot honestly resolve from that source is kept as an explicit
`custom-widget` boundary node — a labelled, allocated region, never a
plausible fake (`docs/source-widget-architecture.md`).

This document is the closed list of those boundaries: what each one is, why
it cannot be resolved statically, and whether the #58 native runtime probe
can settle it or it is **permanent** — unreachable by any static importer or
runtime introspection because the widget paints itself in code.

Scope: the twelve source-generated presets (nine `core`-suite apps —
Calculator, Calendar, Clocks, Disks, Files, Settings, Software, Text Editor,
Weather — plus the three Circle apps routed through the same importer:
Amberol, Ear Tag, Graphs). Web is catalogued as `core` but has no
`sourceImport` and no generated preset, so it is out of scope here.

## How the numbers are produced

The counts below are extracted mechanically from the shipped preset JSON, not
maintained by hand. Reproduce them with:

```sh
node -e "
const fs=require('fs');
const size=n=>{let c=1;for(const k of (n.children||[]))c+=size(k);return c;};
for(const f of fs.readdirSync('public/presets').filter(x=>x.endsWith('.mockup.json'))){
  const j=JSON.parse(fs.readFileSync('public/presets/'+f));
  if(j.generatedBy!=='scripts/generate-preset.mjs')continue;
  const rows=[];let total=0;
  const walk=n=>{if(!n||typeof n!=='object')return;total++;
    if(n.type==='custom-widget')rows.push({id:n.id,cls:n.sourceClass||'?',resolved:size(n)-1});
    (n.children||[]).forEach(walk);};
  for(const s of j.document.screens)walk(s.rootNode);
  console.log(f.replace('.mockup.json',''),'screens='+j.document.screens.length,'nodes='+total,'boundaries='+rows.length);
  rows.forEach(r=>console.log('  ',r.cls,r.id,'resolved-children='+r.resolved));
}"
```

Heed the recorded caution (AGENTS.md, "Metrics that mislead"): raw boundary
counts are unweighted. The `resolved-children` column shows how many imported
nodes live *under* a boundary and still render — a boundary with a large
resolved subtree is a pass-through container, while a leaf boundary
(`resolved-children=0`) is a genuinely unrendered region.

## Classification

- **permanent** — the widget draws itself via `snapshot()` / custom
  `GskRenderNode`s, or is not a widget at all (a paintable, a non-visual
  buffer, a shortcut controller). No static importer resolves it, and #58's
  probe cannot return a declarative child tree for it either. It stays a
  documented boundary forever; the paired-capture diff masks it.
- **probe (#58)** — a code-defined composite or runtime-populated model whose
  real widget tree *does* exist in the running app. The native runtime probe
  is the honest route to it (issue #58; reaffirmed in #81: "the only route to
  runtime-populated composites").
- **renderer gap** — a stock GTK/libadwaita widget the renderer does not draw
  yet. Statically fixable; listed so it is not mistaken for a permanent
  boundary. As of the #59 Wave 1 `Adw.TabBar` promotion (2026-07-31) this
  category is empty: no boundary node in the shipped presets is a stock
  widget.
- **pass-through** — a boundary node whose imported children resolved and
  render; the wrapper itself contributes no pixels by default. Permanent as a
  node, visually harmless.

## Summary

| App | Suite | Nodes | Boundary nodes | Dominant cause | Final classification (Wave 3, 2026-07-31) |
| --- | --- | ---: | ---: | --- | --- |
| calculator | core | 1949 | 5 | Vala composite (`MathButtons`, keypad renders) + GSettings mode state | pass-through, **probe-confirmed** (committed dump) |
| calendar | core | 278 | 6 | `snapshot()`-drawn week grid + hour bar; runtime month grid | **settled**: week grid/hour bar permanent (source-confirmed `snapshot()`), drop overlay pass-through; month-grid state **probe-confirmed** (committed dump) |
| clocks | core | 380 | 0 | — (runtime list content is default-empty) | n/a |
| disks | core | 69 | 2 | C custom-drawn graph/meter | **settled by source**: benchmark graph permanent (`snapshot()`), allocation bar runtime-model content (no version-matched runner exists — see section) |
| files | core | 184 | 2 | runtime-populated C composites (sidebar rows, path-bar buttons) | pass-through; row content runtime (default bookmarks absent in container) |
| settings | core | 17 | 0 | panel list and panels are runtime C widgets (no nodes emitted) | n/a (shell honestly empty; no boundary nodes to classify) |
| software | core | 462 | 36 | runtime-populated pages + drawn star/review primitives | pass-through / permanent drawing, **probe-confirmed** (committed dump) |
| text-editor | core | 93 | 1 | C wrapper (pass-through) | pass-through (permanent-harmless) |
| weather | core | 15 | 0 | GJS runtime tree; default screen is the empty search view | n/a (residual delta is font rasterisation/window shadow) |
| amberol | circle | 74 | 6 | Rust composites (waveform, marquee, cover art) | **settled by source**: all four drawn classes override `snapshot()` (permanent); DragOverlay pass-through. No version-matched runner exists — see section |
| ear-tag | circle | 96 | 2 | Python/GTK composites | **10 of 12 resolved** by the Wave 3 Python adapter; remaining two probe-confirmed (committed dump from the version-matched from-source runner) |
| graphs | circle | 52 | 0 | — | n/a |

Totals: 60 boundary nodes across the twelve presets, every one
evidence-classified — the "probe verifies (likely …)" hedges are gone.
Of the 60: **35** are permanently `snapshot()`-drawn, confirmed against
pinned source (Calendar's 2 `GcalWeekGrid` + 2 `GcalWeekHourBar`, the Disks
`GduBenchmarkGraph`, Software's 20 `GsStarImage` + 5 `GsReviewBar`, and
Amberol's `AmberolWaveformView`, `AmberolCoverPicture` and 3
`AmberolMarquee`); **21** are pass-through wrappers whose imported or
code-constructed children render (Calculator's 5 `MathButtons`, Calendar's 2
`GcalDropOverlay`, Software's 8 `Gs*Page` + `GsUpdatesPausedBanner`, Files'
2, Text Editor's `EditorFullscreenBox`, Ear Tag's `EartagPopoverButton`,
Amberol's `DragOverlay`); and **4** are honest markers for runtime-model
content that no static importer or probe can turn into declarative children
(Software's 2 `GsDescriptionBox`, Ear Tag's `EartagFileList`, Disks'
`GduSpaceAllocationBar`). Committed probe dumps:
`presets-src/calculator.probe.json`, `presets-src/software.probe.json`,
`presets-src/calendar.probe.json`, `presets-src/ear-tag.probe.json`.
The Wave 3 pass (2026-07-31) removed ten nodes from the previous 70, all in
Ear Tag, via a generic Python (PyGObject) language adapter feeding the same
enrichment engine as C and Vala — no app-specific branches. It also added a
guard the C sweep needed: a class that installs its own `snapshot()` vfunc is
never dissolved into its base-class projection (`GcalWeekHourBar` is a
`GtkBox` of labels *plus* code-drawn hour lines; projecting the box would
have silently erased a drawn region).
The third 2026-07-31 regeneration (#59 Wave 2, Software) removed two nodes
from the previous 72: the importer's non-visual filter learned paintables
(`Adw.SpinnerPaintable` is an image source assigned to a `paintable`
property, not a widget — the same mechanism that filtered `SourceBuffer`),
and two generic adapter fixes resolved more chrome without touching the
boundary count: constructions assigned through `g_object_ref_sink` are now
read (GsUpdatesPausedBanner resolves its code-constructed `Adw.Banner`,
which renders nothing while unrevealed — exactly what the probe records),
and an `Adw.Leaflet` declaring `can-unfold: false` imports as a navigation
stack rather than a side-by-side split view.
The 2026-07-31 regeneration (#59 Wave 1) removed three nodes from the
previous 88: both `Adw.TabBar` renderer gaps were promoted to a registry
widget (`tab-bar` — tabs derive from the linked `Adw.TabView`'s declared
pages), and Text Editor's non-visual `Gtk.SourceBuffer` node is no longer
emitted because the importer's non-visual filter learned `SourceBuffer`
after that preset was last generated. The second 2026-07-31 regeneration
(#59 Wave 1, app composites) removed thirteen more via a generic C-adapter
extension — no app-specific branches: a code-defined subclass of a
renderable library widget now resolves to its base class with its
code-constructed children (the eleven Text Editor `EditorPreferences*` rows
→ `Adw.ActionRow` + switch/spin/chevron suffix; `NautilusLocationEntry` →
`Gtk.Entry`; `NautilusPathBar` → `Gtk.Box` chrome — the pinned
`nautilus-pathbar.c` at 49.1 contains no `snapshot()`, so the earlier
"snapshot-drawn permanent" classification was stale; its per-directory
buttons remain runtime/probe territory).

## Per-app boundary list

Reasons below come from the finishing files (`presets-src/*.finishing.json`),
diagnostics in `docs/gnome-source-import.md`,
`docs/gnome-app-conformance.md`, `docs/custom-widget-handoff.md`, and the
maintainer's recorded assessments on #32/#81. Nothing here is inferred from
guesswork about upstream code.

### Calculator (`gnome-calculator` 49.2) — 5 boundary nodes

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `MathButtons` (`_buttons`) | 5 (one per mode screen) | Vala-implemented composite instantiated at runtime (`docs/custom-widget-handoff.md`). Since the Vala construction-facts pass, each instance renders its keypad panel from `buttons-*.blp` (350 resolved children per instance) — the node remains as an honest marker. | pass-through / **probe-confirmed**: the committed dump records `_buttons` mapped at `0,356 360x260` with `BasicButtonPanel` as the mapped panel |

Runtime state recorded in `presets-src/calculator.finishing.json` (not nodes,
but the same boundary class): converter visibility, active-mode button label,
history-card allocation, and the currency spinner all depended on the
GSettings `button-mode` and runtime data. **Settled by the native probe
(2026-07-31):** the committed dump `presets-src/calculator.probe.json`
records `_converter`/`converter_box`, `back_button` and `spinner` unmapped
and `BasicButtonPanel` as the mapped keypad panel in the default mode, and
the corresponding finishing entries now carry `probeEvidence` and are
re-validated against the dump on every generation run. Still hand-written
because the probe records no label text or runtime list content: the mode
MenuButton label and the history-card allocation.

### Calendar (`gnome-calendar` 49.1) — 6 boundary nodes

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `GcalWeekGrid` | 2 | Drawn with `snapshot()` — named by the maintainer as a permanent honest boundary (#32, #81, 2026-07-31). The Wave 3 regeneration projects its code-constructed `now_strip` (`Adw.Bin`) chrome *into* the boundary without dissolving it. | **permanent** (source + maintainer) |
| `GcalWeekHourBar` | 2 | `gcal-week-hour-bar.c` installs its own `snapshot()` vfunc (draws the hour lines via `gcal_week_view_common_snapshot_hour_lines`) over a `GtkBox` of 24 code-constructed labels whose text is runtime locale formatting. | **permanent** drawing (source-confirmed, Wave 3); probe agrees: unmapped in the default month view |
| `GcalDropOverlay` | 2 | C drag-and-drop overlay; its 135 imported children resolve and render, and the overlay itself contributes nothing until a drag. | pass-through |

Beyond the nodes: the **month grid** is runtime-populated. **Probed
2026-07-31** (committed dump `presets-src/calendar.probe.json`, 3147 widgets
from the version-matched Fedora 43 runner at 49.1): `views_stack` records
`visible-child-name: month`, and the finishing override that pins the month
view now carries `probeEvidence` re-validated on every generation. The
paired capture applies 33 probe suppressions (the unmapped week/agenda
subtrees and popover contents stop crowding the layout): 0.67% raw
difference, 99.3% source-resolved similarity — with the honest caveat that
the month-grid *cells* are runtime widgets the preset does not fake, so the
foreground overlap remains low (IoU 1.4%) and the raw number is
background-dominated (see "Metrics that mislead").

### Clocks (`gnome-clocks` 49.0) — 0 boundary nodes

All five screens import clean. List content (world clocks, alarms) is
runtime-populated and default-empty; the finishing file only pins the
default `AdwViewStack` pages against official screenshots.

### Disks (`gnome-disk-utility`, untagged pin) — 2 boundary nodes

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `GduBenchmarkGraph` | 1 | Drawn with `snapshot()` — named by the maintainer (#32, #81) and confirmed against the pinned source in Wave 3: `gdu-benchmark-dialog.c` paints the grid, axes and curves with `gtk_snapshot_append_stroke`/`_fill`/`_layout`. | **permanent** (source-confirmed) |
| `GduSpaceAllocationBar` | 1 | Settled by source in Wave 3: `gdu-space-allocation-bar.c` is a `GTK_TYPE_WIDGET` final type with its own `measure`/`size_allocate`, whose children are one styled `Adw.Bin` per entry of a runtime partitions `GListModel` (udisks data). Not `snapshot()`-drawn — the earlier "custom-drawn meter" note was imprecise — but its content is runtime block-device state no importer reaches, and its `Gtk.Widget` base is never base-projected by policy. | **permanent as a node**, runtime-model content (source-confirmed) |

A probed capture cannot currently settle anything further here, recorded
honestly: the catalog pins Disks' source untagged at the post-GTK4-redesign
default branch (51.beta, `gdu-window.blp`), while the newest packaged
gnome-disk-utility anywhere in the pinned runner images is 46.x (Fedora 43:
46.1; Ubuntu 24.04: 46.0) — the pre-redesign UI. There is no version-matched
runner to probe until a 51 release is packaged; both rows above are settled
from the pinned source itself.

### Files (`nautilus` 49.1) — 2 boundary nodes

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `NautilusShortcutManager` | 1 | Non-visual near-root wrapper; its 57 imported children render. | pass-through (permanent as a node) |
| `NautilusSidebar` | 1 | Its static chrome (scrolled window + `navigation-sidebar` list box) now resolves from C construction facts in `nautilus-sidebar.c` init; the node stays as an honest marker because the places rows are runtime bookmark/mount data. | pass-through; rows are runtime data (Wave 3 probed capture: 75% match rate, 18 suppressions applied, 3.1% raw difference — the container has no user bookmarks, so both sides show the default places) |

Two former boundaries left this table in the second 2026-07-31 regeneration
(#59 Wave 1, app composites), both via the generic base-class projection:

- `NautilusLocationEntry` is a `GtkEntry` subclass; it resolves to a plain
  entry. Its text (the current path) is runtime state.
- `NautilusPathBar` is a `GtkBox` subclass whose init constructs a scrolled
  buttons box and a view-menu button; that chrome resolves. The pinned
  `nautilus-pathbar.c` contains no `snapshot()` — the earlier "snapshot-drawn
  permanent" note was stale for 49.1. Its per-directory path buttons are
  created at runtime (`nautilus_path_bar_update_path`) — **probe** territory.

Beyond the nodes: the directory list/grid view is runtime-populated —
**probe-resolvable**. The former `Adw.TabBar` renderer-gap boundary was
promoted to the `tab-bar` registry widget (#59 Wave 1): with zero statically
declared pages and `autohide` at its default, the promoted strip renders
nothing — matching the native app, whose single-tab bar autohides.

### Settings (`gnome-control-center` 49.1) — 0 boundary nodes

The 17-node preset is the shell only. "Panel list and selected panel are
runtime C widgets" (`docs/gnome-source-import.md`) — they produce no
importable declarative tree at all, so no boundary nodes are emitted. The
entire panel surface is **probe-resolvable**; until #58 lands, this preset is
honestly a shell.

### Software (`gnome-software` 49.4) — 36 boundary nodes

Probed 2026-07-31 (#59 Wave 2): the committed dump
`presets-src/software.probe.json` (1853 widgets, 92% source match rate, 259
joins by buildable id) settles every hedge below.

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `GsOverviewPage`, `GsInstalledPage`, `GsSearchPage`, `GsUpdatesPage`, `GsCategoryPage`, `GsExtrasPage`, `GsDetailsPage`, `GsLoadingPage` | 8 | Runtime-populated pages ("overview tiles/carousel are runtime package data/widgets", `docs/gnome-source-import.md`; #81: "Software's lists"). Their declarative shells resolve — `details_page` alone carries 255 resolved children. | pass-through / **probe-confirmed**: `overview_page` is the one mapped page (`0,46 1024x554`); the other seven are unmapped in `--mode=overview` |
| `GsUpdatesPausedBanner` | 1 | Runtime banner, shown on network state. Its code-constructed `Adw.Banner` chrome now resolves (construction read through `g_object_ref_sink`); unrevealed, it renders nothing. | pass-through / **probe-confirmed**: mapped at `1024x0` — zero height, unrevealed |
| `GsDescriptionBox` | 2 | C composite for expandable description text; `GtkWidget` base, never base-projected. | **probe-confirmed** unmapped (lives in the details surface) |
| `GsStarImage` | 20 | `gs-star-image.c` overrides `snapshot()` to clip two child `GtkImage`s by rating fraction. The starred-image chrome resolves from construction facts; the fractional painting is code. | **permanent** drawing (source-confirmed); probe: all 20 unmapped at startup |
| `GsReviewBar` | 5 | `gs-review-bar.c` overrides `snapshot()` to paint the histogram bar. | **permanent** drawing (source-confirmed); probe: unmapped |

Two former `Adw.SpinnerPaintable` rows left this table in the Wave 2
regeneration: a paintable is an image source assigned to a widget's
`paintable` property, not a widget, and the importer's non-visual filter now
covers paintables (the same mechanism that filtered `SourceBuffer`). The
shell's runtime page state is carried by four probe-evidenced finishing
entries (`stack_loading`/`stack_main`/`details_leaflet`/`main_leaflet`),
re-validated against the dump on every generation run. The shell's
`can-unfold=False` leaflets import as navigation stacks (property-driven,
generic) — previously they rendered pages side by side that GTK never shows
together.

Software is also the recorded caution against trusting raw counts: it once
measured "44 boundaries of 441 nodes, 10%" while rendering as an empty box,
because `gs-shell.ui` declares the template `visible=False` (presented
programmatically) — fixed by the single finishing override in
`presets-src/software.finishing.json`, and now also mirrored generically in
the capture path: a probe-matched node the source declares invisible but GTK
maps is revealed at `native:visible` origin.

### Text Editor (`gnome-text-editor` 49.1) — 1 boundary node

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `EditorFullscreenBox` | 1 | C wrapper; its 49 imported children render. | pass-through |

The eleven `EditorPreferencesFont` / `EditorPreferencesSwitch` /
`EditorPreferencesSpin` rows left this table in the second 2026-07-31
regeneration (#59 Wave 1, app composites). Each is a thin `AdwActionRow`
subclass whose init adds one suffix widget in code; the generic base-class
projection resolves them to `action-row` nodes with their declared titles
and a `Gtk.Switch` / `Gtk.SpinButton` / go-next `Gtk.Image` suffix. What
stays runtime is their *state* — switch positions, the spin value, and the
font row's title all come from GSettings — which is #58 probe territory,
recorded per screen rather than as boundary nodes.

Two former boundaries left this table in the 2026-07-31 regeneration:
`Adw.TabBar` was promoted to the `tab-bar` registry widget (#59 Wave 1 —
the finishing file still pins its 34px runtime allocation, so the strip's
chrome renders at the allocated height; the single runtime tab's label is
#58 probe territory), and the non-visual `Gtk.SourceBuffer` node is no
longer emitted at all — the importer's non-visual filter learned
`SourceBuffer` (the same reason it is filtered from export, PR #104) after
this preset was last generated. Document text remains runtime/user content.

### Weather (`gnome-weather` 49.0) — 0 boundary nodes

The default screen is the empty "search for a city" view, which is fully
declarative (15 nodes, 4.4–4.5% difference vs native). Two runtime facts are
carried by `presets-src/weather.finishing.json`: the template's parent class
is omitted by GJS composite templates (a future JS language adapter could
recover it statically), and `searchViewStatus.icon_name` is set at runtime
from `pkg.name`. Populated forecast views are runtime GJS content — **probe**
territory if ever presetted. The residual visual delta is font rasterisation
and window shadow, which no importer or probe addresses.

### Amberol (Circle, 2026.1) — 6 boundary nodes

Settled by source evidence in Wave 3 (the `GsStarImage` precedent — a
`snapshot()` override in pinned source is a permanent-drawing verdict, no
probe required):

| Boundary | Instances | Evidence (pinned 2026.1 source) | Status |
| --- | ---: | --- | --- |
| `AmberolWaveformView` | 1 | `waveform_view.rs` `fn snapshot()` paints the waveform bars. | **permanent** drawing (source-confirmed) |
| `AmberolMarquee` | 3 | `marquee.rs` `fn snapshot()` paints the scrolling label animation. | **permanent** drawing (source-confirmed) |
| `AmberolCoverPicture` | 1 | `cover_picture.rs` `fn snapshot()` paints the runtime cover-art texture. | **permanent** drawing (source-confirmed) |
| `DragOverlay` | 1 | `drag_overlay.rs` has an empty `WidgetImpl` (no snapshot); its 71 imported children resolve and render. | pass-through |

No probed capture exists, recorded honestly: neither pinned runner
distribution packages Amberol at the pinned 2026.1 (Fedora 43: not packaged;
Ubuntu 24.04: 0.10.3), and a version-mismatched app is not a valid visual
oracle. The default surface is unaffected: all four drawn classes sit in the
non-visible main-view stack page (the app opens on the empty
drag-songs-here status page), so the compared default screen carries 0%
unresolved coverage (`artifacts` measurement, Wave 3).

### Ear Tag (Circle, 1.0.2) — 2 boundary nodes (was 12)

Ten of the twelve resolved in Wave 3 via the generic Python (PyGObject)
language adapter — the same base-class projection that settled Text Editor's
`EditorPreferences*` rows, now reading Python construction facts:

- `EartagTagEntryRow` ×7 → `Adw.EntryRow` subclass; resolves to `entry-row`
  keeping its declared titles.
- `EartagTagEditableLabel` ×2 → resolves transitively through the
  app-defined `EartagEditableLabel(Gtk.Overlay)` ancestor, whose `__init__`
  constructs the entry + centered wrap label + edit icon it overlays (the
  ancestor's init runs for the subclass, so its constructions are inherited
  source evidence).
- `EartagFileInfoLabel` → `Gtk.Label` subclass; resolves to a label whose
  text is runtime file metadata.

| Boundary | Instances | Why static import stops | Status |
| --- | ---: | --- | --- |
| `EartagFileList` | 1 | `Gtk.ListView` subclass whose rows are a runtime factory over the opened-files model (`filelist.py`); default-empty with no files loaded. | honest runtime-model boundary; **probe-confirmed** default-empty (committed dump) |
| `EartagPopoverButton` | 1 | `Gtk.Box` reimplementation of MenuButton; its 3 declared children resolve, the popover is a popup surface. | pass-through |

Probed 2026-07-31 with a **version-matched from-source runner**: Ear Tag
1.0.2 is not packaged by either pinned distro (Fedora 43: none; Ubuntu
24.04: 0.6.0), so the pinned source tag is meson-installed into the pinned
`fedora:43` GTK stack (`containers/broadway/Dockerfile.fedora-eartag`) and
probed exactly like the packaged runners. Dump committed as
`presets-src/ear-tag.probe.json`.

### Graphs (Circle, v2.0.5) — 0 boundary nodes

Imports clean at 52 nodes.

## Maintenance rule

This list is part of the fail-loudly contract that already governs finishing
files (`scripts/generate-preset.mjs` aborts when an override id no longer
matches the source):

**Regenerating a preset that changes its boundary set must update this
document in the same change.** Run the extraction command above after any
`generate-preset.mjs` run or catalog `sourceImport` bump; if the per-app
boundary nodes differ from the tables here, the regeneration PR updates both
together. A boundary that disappears because a widget became genuinely
resolvable is progress to record; a boundary that disappears silently is a
bug (`docs/source-widget-architecture.md`: renderer work may improve a
boundary, "they may not disappear").

#58 has landed, and the mechanism for settling probe-territory rows exists
end-to-end: run a probed capture (`docs/runtime-probe.md`), commit the dump
as `presets-src/<app>.probe.json`, record the settled facts as
`probeEvidence` finishing entries, and update this document's rows in the
same change — Calculator and Software (2026-07-31) were the worked examples,
Calendar and Ear Tag followed in Wave 3.

**As of the Wave 3 close-out (2026-07-31) the fleet is settled**: every
boundary row above is classified permanent / pass-through / runtime-model
with source or probe-dump evidence, and no hedged row remains. The
"permanent" set is closed, so the pixel-accuracy goal of #32 is bounded
rather than open-ended. Two honest gaps are recorded rather than papered
over: Disks and Amberol have no version-matched runner to probe (their rows
are settled from pinned source instead), and Settings' runtime panel surface
emits no nodes at all — both re-open only if a matching package or a
from-source runner (the Ear Tag pattern) makes a probed capture possible.
New apps enter through the same ladder: catalog entry with pinned
`sourceImport` → `import-gnome-app.mjs` → boundary rows recorded here →
probed capture where a version-matched runner exists → per-app gates in the
catalog.
