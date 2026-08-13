---
sidebar_position: 3
title: "Roadmap"
---

The v0 web prototype (Vite/React) has been removed from the tree — see git history (tag v0.13.0 and earlier) for the reference implementation
for UX and the dual-editing sync model. The next phase moves rendering and
media off the DOM entirely.

## Decisions so far (the compromises)

- **No DOM rendering.** GPU acceleration wherever possible. **No WebKitGTK**
  anywhere in the stack (this also rules out Tauri on Linux, which embeds it).
- **Implementation language: Rust** (rationale below).
- **Scripting: TypeScript first**, but the scripting surface is a stable
  document + API boundary, so other languages can drive the editor too.
- **This is a GNOME app**: GTK4 + libadwaita, GNOME HIG. **The deliverable
  is a Flatpak** (starter manifest: `engine/build-aux/org.tunaos.dualcut.json`).

## Why Rust (ecosystem survey)

| Need | Rust | Go | GJS |
|---|---|---|---|
| NLE engine (timeline/clips/effects/render) | **GES** — [GStreamer Editing Services has maintained Rust bindings](https://gstreamer.pages.freedesktop.org/gstreamer-rs/stable/latest/docs/gstreamer_editing_services/): `Timeline`, `Layer`, `Clip`, `Group`, transitions, rendering — a whole editing engine for free | none; cgo→FFmpeg only, no timeline layer | GES via GObject-Introspection, but JS-side perf ceiling |
| Media pipeline | [gstreamer-rs](https://lib.rs/crates/gstreamer) is first-class (GStreamer itself ships [official plugins written in Rust](https://github.com/GStreamer/gst-plugins-rs)) | weak | good (GI) |
| GPU video display | [gtk4paintablesink](https://lib.rs/crates/gst-plugin-gtk4): GL textures + **DMABuf zero-copy on GTK ≥ 4.14** | no story | possible, less control |
| GPU 2D (shapes/titles) | wgpu; [Vello](https://github.com/linebender/vello) (alpha but advancing — [Linebender status](https://linebender.org/blog/tmil-24/)); `skia-safe` as the boring fallback | Gio/Fyne (small) | GSK only |
| Embedded TS runtime | [deno_core](https://crates.io/crates/deno_core) / [rustyscript](https://github.com/rscarson/rustyscript) (V8 + TS transpile in-process) | no | is JS, but can't embed *user* TS cleanly |

Go has no serious media-editing ecosystem. GJS gets GTK4+GES but leaves no
good path for custom GPU compositing or embedding user TypeScript. Rust
uniquely has all four pillars, and the GStreamer/GTK combo keeps us native
GNOME-adjacent without WebKitGTK.

**Stack:** `gtk4-rs` + libadwaita (UI, GPU-rendered via GSK) ·
GStreamer + **GES** (decode, timeline, audio, export) ·
`gtk4paintablesink` DMABuf (preview) ·
wgpu + Vello for the shapes/titles/motion-graphics compositor (rendered to
GL textures fed into the GES pipeline as a source; swap in `skia-safe` if
Vello's alpha gaps bite) ·
`deno_core` for in-process TypeScript.

## Document model v2

```
Project
├─ meta            width, height, fps, background
├─ defs            reusable compositions (templates), keyed by name
│    └─ Composition { params: {name, type, default}[], scene-or-layers }
├─ scenes[]        sequential — the narrative spine; no gaps, order = time
│    └─ Scene { duration, transition-in?, layers[] }
│         └─ layers: text | video | audio | image | shape | comp-ref
└─ overlays[]      tracks that span scene boundaries ← solves the
     └─ OverlayTrack { clips[] }        subtitle/music overlap problem
```

- **Scenes** answer "what happens next": cut-to-cut structure like CapCut's
  main track. Elements inside a scene are timed relative to the scene.
- **Overlays** answer the concern raised about the scene model: subtitles,
  background music, watermarks, and lower-thirds don't respect scene cuts,
  so they live on composition-level overlay tracks with absolute timing —
  scenes for structure, overlays for anything that crosses cuts.
- **Reusable compositions (`defs`)**: a named, parameterised set of layers —
  a text template ("lower third: {name}, {title}"), a motion template
  (logo sting), an intro card. Instantiated via `comp-ref` with arguments;
  editing the def updates every instance. Maps 1:1 onto GES's
  nested-timeline/`Group` support.
- **Shapes**: circle, ellipse, rectangle (rounded), star, polygon, line,
  arrow, and arbitrary SVG paths — all GPU-drawn vectors, animatable
  (fill, stroke, path morph later).
- Keep v0's animation primitive (`from/to` tween windows per property with
  easing incl. spring); add transform-origin and per-scene transitions
  (cut, crossfade, slide, wipe).

## Scripting model

- **In-app TS console + script panel**: `deno_core` runs user TypeScript
  against a typed `editor.*` API (query/mutate the document, not pixels).
- **External agents, any language**: same as v0 — the document is
  serialized JSON on disk plus a local HTTP/Unix-socket API
  (`GET/POST /composition`, plus granular ops later: `patch`, `addScene`,
  `renderFrame` for screenshot feedback). TS is first-class; anything that
  can speak JSON-over-HTTP is supported.
- Typed schema published as both TS declarations (`.d.ts`) and JSON Schema
  so agents and humans get completion/validation in either world.

## Milestones

- **M0 — Pipeline spike (de-risk).** Rust bin: build a GES timeline with two
  video clips + a title, preview via gtk4paintablesink in a bare GTK4
  window, render to MP4. Proves decode→timeline→display→export before any
  editor code. Also: Vello-to-GL-texture-into-GES proof, and a
  deno_core "hello editor API" embed.
  *Status: **complete** (2026-07-18), all four pillars proven in `engine/`:
  (1) GES timeline (test source + URI clip + transparent title) renders to
  H.264/AAC MP4 headless — `cargo run --bin render`, verified by frame
  extraction; (2) GTK4/libadwaita preview window with gtk4paintablesink
  builds and launches — `cargo run --features preview --bin preview`
  (smoke-tested under Xvfb; GPU frame display still to be eyeballed on a
  real desktop session); (3) in-process TypeScript via rustyscript/deno_core
  drives an `editor.addClip()` API and renders its own MP4 — `cargo run
  --features scripting --bin script`; (4) Vello 0.9 renders the shape set
  (rounded rect, circle, star) headless on wgpu/Vulkan — `cargo run
  --features vector --bin vello_spike`. Note: GES objects are not Send —
  scripting ops collect document mutations, applied on the engine thread
  (this is the right M1 architecture anyway: scripts edit the document, not
  GES). Vello-texture→GES source integration moved to M3.*
- **M1 — Engine + document.** Document model v2 (serde), document⇄GES
  mapping layer, undo/redo as document diffs, autosave, the HTTP agent API
  (port the v0 contract + AGENTS.md).
  *Status: core complete (2026-07-18) — `document.rs` (scenes/overlays/defs
  with validation), `mapping.rs` (document→GES: sequential scenes, absolute
  overlays, parameterised def instantiation, per-property animation control
  sources with easing), `render <project.json>` and the `serve` agent API
  (GET/POST /project, POST /render, /status) verified end-to-end: agent
  edit round-trip persisted + rendered. Undo/redo as document diffs moves
  to M2 with the UI.*
- **M2 — Editor UI.** GTK4/libadwaita shell: preview, scene strip + overlay
  tracks timeline (drag/trim/reorder), inspector sidebar — feature parity
  with the v0 web prototype, but native.
- **M3 — Shapes & motion.** Vector layer types, animation editor, scene
  transitions, transform handles in the preview.
  *Status: shapes + transitions done (2026-07-18) — all seven shape kinds
  render via Vello to cached transparent PNGs entering GES as image clips
  (feature "vector"); scene crossfades via GES auto-transition. Remaining:
  in-app animation editor, transform handles, live vector morphs.*
- **M4 — Scripting.** Embedded TS runtime + script panel, typed `editor.*`
  API, `.d.ts`/JSON Schema publishing, agent recipes.
  *Status: core done (2026-07-18) — POST /script runs TS
  (`export function edit(p: Project): Project`) in-process, validated;
  `schema/dualcut.d.ts` + `dualcut.schema.json` published. Remaining:
  in-app script panel, V8 offline source for the Flatpak bundle.*
- **M5 — Templates.** `defs`/`comp-ref` with params, "save selection as
  template", a small built-in template library (lower third, title card,
  caption style).
  *Status: library done (2026-07-18) — starter defs (lower-third,
  title-card, caption) embedded; `render new <path> [title]` scaffolds.
  Remaining: "save selection as template" UI op.*
- **M6 — Export & polish.** Render queue (GES render profiles: MP4/WebM,
  resolution/bitrate presets), audio gain/fades, waveforms + thumbnails on
  clips, snapping, multi-select.
  *Status: profiles done (2026-07-18) — MP4 (H.264/AAC) and WebM
  (VP8/Vorbis) by name or extension, CLI + /render. Remaining: queue UI,
  bitrate presets, waveforms/thumbnails, snapping, multi-select.*
- **M7 — Flatpak distribution.** The shipping artifact: manifest
  (GNOME runtime, rust-stable SDK extension, `flatpak-cargo-generator`
  offline sources, GES module), portals for media access, appstream
  metainfo + screenshots. **No Flathub submission** — Flathub's current
  AI policy rules it out (decided 2026-07-18); GitHub Releases is the
  distribution channel (install one-liner in the README).
  *Status: automated releases live (2026-07-18) — every `v*` tag builds
  `dualcut.flatpak` (GNOME 50 runtime + GES module) and attaches it to a
  GitHub Release; verified end-to-end with the README install one-liner
  (v0.1.0). Remaining: appstream metainfo, desktop file + icon, screenshots,
  Flathub submission.*

## Open questions

1. ~~Scene *audio*~~ **decided**: a video clip's own audio is scene-local;
   music/VO lives on overlays. Plus a **detach-audio** op (like other
   editors): splits a video's audio into an independent audio clip
   (schema supports it today via video `volume: 0` + an `audio` clip with
   the same src/offset; the one-click op arrives with the M2 UI).
2. Vello alpha risk — spike passed (0.9 renders the shape set headless on
   llvmpipe); final Vello vs `skia-safe` call once M3 measures real scenes
   on real GPUs.
3. Name: Chop / Clip / **Compose** / Frame / Collect / Pack — pending.
4. Does v0 (web) stay maintained as a thin remote UI, or freeze as
   reference once M2 reaches parity?
