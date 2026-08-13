---
sidebar_position: 9
title: "gnome app conformance"
---

The machine-readable source of truth is
[`tests/fixtures/gnome-app-catalog.json`](https://github.com/tuna-os/protota/blob/main/tests/fixtures/gnome-app-catalog.json).
An app is **passed** only after its isolated native Broadway image, isolated
Protota image, and generated diff have all been visually inspected. A passing
test alone is not enough.

| State | Apps |
| --- | --- |
| Passed | Settings (95.42%, one screen); Calendar Month (94.69%) and Week (95.61%), both with zero unresolved coverage. |
| Needs tuning | **Wave 3 fleet captures (2026-07-31, local rootless podman, Fedora 43 runners, probed)** — per-app raw difference / source-resolved similarity, all from `comparison-<app>.json` artifacts of the same sweep that calibrated the catalog gates: calculator 10.9% / 89.1% (probe: `_buttons` matched, converter suppressed); clocks 3.2% / 96.8%; files 3.1% / 96.9% (runs only as non-root: `--userns=keep-id --user 1000`); settings 3.5% / 96.5% (needs `XDG_CURRENT_DESKTOP=GNOME`, non-root, and the session bus aliased as system bus — the Software recipe); software 1.8% / 98.2%; text-editor 1.3% / 98.7% (runner is 49.2 — Fedora 43 no longer ships the pinned 49.1; patch-level drift recorded); weather 2.5% / 97.5% (generated-preset comparison — the GJS composite template omits the window parent class in raw source-bundle mode); ear-tag 2.6% / 97.4% (version-matched **from-source runner**, `Dockerfile.fedora-eartag`, probed: the no-file default state is dump-confirmed). **Calendar revalidation (2026-08-02, Ubuntu 24.04 Calendar 46.1 with exact 46.1 GtkBuilder source):** Month 94.69% similarity / 23.29% foreground IoU; Week 95.61% / 23.15%; both have zero unresolved coverage. Screen-specific semantic probes now reconstruct the runtime month cells and week hour labels. Amberol, Graphs, Disks have no version-matched runner (Fedora doesn't package the Circle apps at their pins; Disks' pinned source is 51.beta vs packaged 46.x) — their gates are coverage-only, measured by `scripts/measure-unresolved-coverage.mjs` (all 0% on the default compared screen). Older per-app notes follow. Software (2026-07-31 Wave 2 probed pass, local rootless podman capture): 5.1% raw difference, 94.9% source-resolved similarity, probe match rate 90% (259 of 368 joins by buildable id). The honest state: the Protota overview renders the shell chrome plus the probe-revealed section headings; the native container (Fedora 43, session bus aliased as system bus) still populates GTK's bundled metainfo apps as tiles, and that store content is runtime package data the preset does not fake. Residual deltas: tile grid content, the headerbar Explore/Installed/Updates switcher, font rasterisation. Weather (2026-07-30 fidelity pass) — visually near-identical to native: real app artwork embedded from source, window controls, GTK size-request minimums; 4.5% difference with the remainder in font rasterisation and window shadow. Earlier note: Weather — paired capture vs native 49.x (Fedora 43 runner on himachal): 4.4% difference, 95.6% source-resolved similarity; gaps: app-resource status icon, window controls. Text Editor — 0.7% raw difference (whitespace-dominated; real gaps: tab-bar placement, MultiLayoutView default layout selection). Calendar — 35.2% difference before runtime semantic projection; overlay stacking and month grid were runtime-drawn. Amberol — native/Protota surfaces inspected; StatusPage centering and action layout are being tuned generically. Calculator — source-bundle import structurally complete after the Phase 1 parser fix (`_buttons` and every declarative sibling retained; 2 honest boundaries: GtkSourceView, MathButtons). Local paired capture 2026-07-29: source-resolved similarity 79.9%, foreground IoU 24.4%, unresolved coverage 3.5%. Phase 4 (2026-07-30): MathButtons keypad now renders its 24-button basic panel from buttons-basic.blp via Vala construction facts; converter_box hidden via declared property default. Dominant remaining deltas: converter/status region visible because button-mode comes from GSettings at runtime (Phase 5 probe), StatusPage vertical footprint, header-bar icon-name rendering. |
| Not yet validated | Disks, Files, Software, Text Editor, Weather, Web |
| Next native capture | Authenticator (GNOME Circle) — Broadway image built on `himachal`; preset still to be created. |

Clocks revalidation (2026-08-02, exact Fedora 43 Clocks 49.0 source/runtime):
World 97.25%, Alarms 97.78%, Stopwatch 98.67%, and Timer 98.25%; all four
have zero unresolved coverage. New Alarm remains under tuning, so Clocks is
not yet promoted to passed as a five-screen preset.


## Fleet state (2026-07-31, Wave 3)

Generated presets, their screen counts, and how many nodes remain explicit
custom-widget boundaries. A boundary is an honest result -- an
application-defined composite the importer will not invent -- so the number
to drive down is the app-defined count, not boundaries in general.

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

Four apps import with no unresolved widgets at all. The two stock-widget
renderer gaps this table originally recorded are closed: GtkLevelBar's meter
renders generically, and AdwTabBar was promoted to a registry widget (#59
Wave 1, 2026-07-31) — its tab strip derives from the linked AdwTabView's
declared pages, with runtime-populated views honestly empty until the #58
probe. The second Wave 1 PR extended the C adapter generically (base-class
projection resolved the eleven `EditorPreferences*` rows,
`NautilusLocationEntry`, `NautilusPathBar` chrome and `NautilusSidebar`
chrome); the Wave 2 pass added Software with its committed probe dump
(38 → 36 boundary nodes, star/review drawing confirmed
`snapshot()`-permanent). The Wave 3 close-out (2026-07-31) finished the
sweep: a generic Python (PyGObject) language adapter feeds the same
enrichment engine, resolving ten of Ear Tag's twelve boundaries (7
`EartagTagEntryRow` → entry rows, 2 `EartagTagEditableLabel` → their
inherited overlay of entry/label/icon through transitive base-chain
resolution, `EartagFileInfoLabel` → label), and the engine gained a
snapshot guard: a class that installs its own `snapshot()` vfunc is never
dissolved into base-class chrome (which keeps `GcalWeekHourBar` an honest
boundary). Fleet: 70 → 60 boundary nodes, every one evidence-classified in
`docs/permanent-boundaries.md` — the classification is closed, and new
regressions are caught by per-app gates (`maxUnresolvedCoverage`,
`minSimilarity`) carried in the catalog and enforced by
`tests/broadway-reference.spec.ts` on every capture.

## Required sequence

1. Add the app and its source/launch metadata to the catalogue.
2. Capture the real GTK app with Broadway on `himachal`.
3. Add a generic-widget-only preset.
4. Run the paired capture, inspect native, Protota, and diff images.
5. Set `visualStatus` to `passed` only when the inspection is acceptable and a
   calibrated difference threshold can be enforced.
