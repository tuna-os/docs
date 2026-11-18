---
sidebar_position: 10
title: "gnome app conformance"
---

The machine-readable source of truth is
[`tests/fixtures/gnome-app-catalog.json`](https://github.com/tuna-os/protota/blob/main/tests/fixtures/gnome-app-catalog.json).
An app is **passed** only after a person looks at three images. These are the
isolated native image from Broadway, the isolated Protota image, and the diff
between them. A test that passes is not enough.

| State | Apps |
| --- | --- |
| Passed | Settings (95.42%, one screen); Calendar Month (94.69%) and Week (95.61%), both with zero unresolved coverage. |
| Needs tuning | **Wave 3 fleet captures (2026-07-31, local rootless podman, Fedora 43 runners, probed)** — per-app raw difference / source-resolved similarity, all from `comparison-<app>.json` artifacts of the same sweep that calibrated the catalog gates: calculator 10.9% / 89.1% (probe: `_buttons` matched, converter suppressed); clocks 3.2% / 96.8%; files 3.1% / 96.9% (runs only as non-root: `--userns=keep-id --user 1000`); settings 3.5% / 96.5% (needs `XDG_CURRENT_DESKTOP=GNOME`, non-root, and the session bus aliased as system bus — the Software recipe); software 1.8% / 98.2%; text-editor 1.3% / 98.7% (runner is 49.2 — Fedora 43 no longer ships the pinned 49.1; patch-level drift recorded); weather 2.5% / 97.5% (generated-preset comparison — the GJS composite template omits the window parent class in raw source-bundle mode); ear-tag 2.6% / 97.4% (version-matched **from-source runner**, `Dockerfile.fedora-eartag`, probed: the no-file default state is dump-confirmed). **Calendar revalidation (2026-08-02, Ubuntu 24.04 Calendar 46.1 with exact 46.1 GtkBuilder source):** Month 94.69% similarity / 23.29% foreground IoU; Week 95.61% / 23.15%; both have zero unresolved coverage. Screen-specific semantic probes now reconstruct the runtime month cells and week hour labels. Amberol, Graphs, Disks have no version-matched runner (Fedora doesn't package the Circle apps at their pins; Disks' pinned source is 51.beta vs packaged 46.x) — their gates are coverage-only, measured by `scripts/measure-unresolved-coverage.mjs` (all 0% on the default compared screen). Older per-app notes follow. Software (2026-07-31 Wave 2 probed pass, local rootless podman capture): 5.1% raw difference, 94.9% source-resolved similarity, probe match rate 90% (259 of 368 joins by buildable id). The honest state: the Protota overview renders the shell chrome plus the probe-revealed section headings; the native container (Fedora 43, session bus aliased as system bus) still populates GTK's bundled metainfo apps as tiles, and that store content is runtime package data the preset does not fake. Residual deltas: tile grid content, the headerbar Explore/Installed/Updates switcher, font rasterisation. Weather (2026-07-30 fidelity pass) — visually near-identical to native: real app artwork embedded from source, window controls, GTK size-request minimums; 4.5% difference with the remainder in font rasterisation and window shadow. Earlier note: Weather — paired capture vs native 49.x (Fedora 43 runner on the build host): 4.4% difference, 95.6% source-resolved similarity; gaps: app-resource status icon, window controls. Text Editor — 0.7% raw difference (whitespace-dominated; real gaps: tab-bar placement, MultiLayoutView default layout selection). Calendar — 35.2% difference before runtime semantic projection; overlay stacking and month grid were runtime-drawn. Amberol — native/Protota surfaces inspected; StatusPage centering and action layout are being tuned generically. Calculator — source-bundle import structurally complete after the Phase 1 parser fix (`_buttons` and every declarative sibling retained; 2 honest boundaries: GtkSourceView, MathButtons). Local paired capture 2026-07-29: source-resolved similarity 79.9%, foreground IoU 24.4%, unresolved coverage 3.5%. Phase 4 (2026-07-30): MathButtons keypad now renders its 24-button basic panel from buttons-basic.blp via Vala construction facts; converter_box hidden via declared property default. Dominant remaining deltas: converter/status region visible because button-mode comes from GSettings at runtime (Phase 5 probe), StatusPage vertical footprint, header-bar icon-name rendering. |
| Not yet validated | Disks, Files, Software, Text Editor, Weather, Web |
| Next native capture | Authenticator (GNOME Circle) — Broadway image built on the build host; preset still to be created. |

Clocks revalidation (2026-08-02, exact Fedora 43 Clocks 49.0 source/runtime):
World 97.25%, Alarms 97.78%, Stopwatch 98.67%, and Timer 98.25%. All four
have zero unresolved coverage. New Alarm still needs tuning. Thus Clocks does
not yet have the passed state as a five-screen preset.

## Fleet state (2026-07-31, Wave 3)

This table shows the generated presets, their screen counts, and the number of
nodes that stay as explicit custom-widget boundaries. A boundary is an honest
result -- an application-defined composite the importer will not invent. Thus
the number to decrease is the app-defined count, not all boundaries.

| App | Screens | Nodes | Boundaries | Unresolved classes |
| --- | ---: | ---: | ---: | --- |
| text-editor | 2 | 93 | 1 | EditorFullscreenBox (C pass-through) |
| ear-tag | 1 | 96 | 2 | EartagFileList (runtime rows), EartagPopoverButton (pass-through) — ten Eartag* composites resolved by the Wave 3 Python adapter |
| amberol | 1 | 74 | 6 | Amberol* drawn classes (`snapshot()`-permanent, source-confirmed) + DragOverlay pass-through |
| calendar | 2 | 278 | 6 | GcalWeekGrid/GcalWeekHourBar (`snapshot()`-permanent), GcalDropOverlay (pass-through) |
| files | 4 | 184 | 2 | NautilusShortcutManager, NautilusSidebar (C; static chrome resolved) |
| calculator | 6 | 1949 | 5 | MathButtons instances (Vala; keypad renders) |
| software | 1 | 462 | 36 | Gs* pages (pass-through, probe-confirmed) + snapshot-drawn star/review primitives |
| disks | 3 | 69 | 2 | GduBenchmarkGraph (`snapshot()`), GduSpaceAllocationBar (runtime partition model) |
| clocks | 5 | 380 | 0 | -- |
| graphs | 1 | 52 | 0 | -- |
| settings | 1 | 17 | 0 | -- |
| weather | 1 | 15 | 0 | -- |

Four apps import with no unresolved widgets at all. This table first recorded
two gaps for stock widgets in the renderer. Both gaps are now closed:

- The meter of GtkLevelBar renders generically.
- AdwTabBar is now a registry widget (#59 Wave 1, 2026-07-31). Its tab strip
  comes from the declared pages of the linked AdwTabView. Views that fill at
  runtime stay honestly empty until the #58 probe.

The second Wave 1 PR made the C adapter more generic. Base-class projection
resolved the eleven `EditorPreferences*` rows, `NautilusLocationEntry`, and
the chrome of `NautilusPathBar` and `NautilusSidebar`.

The Wave 2 pass added Software with its committed probe dump. It decreased
the boundary nodes from 38 to 36, and it confirmed that the star and review
primitives are `snapshot()`-permanent.

The Wave 3 close-out (2026-07-31) finished the sweep with two changes:

- A generic Python (PyGObject) language adapter feeds the same enrichment
  engine. It resolves ten of the twelve boundaries in Ear Tag. Now
  7 `EartagTagEntryRow` are entry rows, and `EartagFileInfoLabel` is a label.
  2 `EartagTagEditableLabel` are their inherited overlay of entry/label/icon,
  which comes from the transitive base chain.
- The engine has a snapshot guard. The engine never dissolves a class that
  installs its own `snapshot()` vfunc into base-class chrome. Thus
  `GcalWeekHourBar` stays an honest boundary.

Fleet: 70 → 60 boundary nodes. `docs/permanent-boundaries.md` gives the
evidence class of each one, and that classification is complete. Per-app gates
(`maxUnresolvedCoverage`, `minSimilarity`) in the catalog catch new
regressions. `tests/broadway-reference.spec.ts` applies these gates on each
capture.

## Required sequence

1. Add the app and its source/launch metadata to the catalogue.
2. Capture the real GTK app with Broadway on the build host.
3. Add a generic-widget-only preset.
4. Run the paired capture, inspect native, Protota, and diff images.
5. Set `visualStatus` to `passed` only when the inspection is acceptable and
   CI can apply a calibrated difference threshold.
