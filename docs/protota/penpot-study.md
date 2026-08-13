---
sidebar_position: 11
title: "penpot study"
---

Study for #85, ahead of #79 (drag-and-drop, multi-select, rubber-band,
snapping, align/distribute). Sources: the `penpot/penpot` and
`penpot/penpot-plugins` repositories, `develop` branch, read July 2026.

**Licence note.** Penpot is AGPL (frontend files carry MPL-2.0 headers; the
project as a whole is AGPL-licensed). This document describes patterns in
prose so they can be reimplemented from the description. No code was copied,
and none should be when implementing #79.

Every file path cited below was verified to exist in the Penpot tree at the
time of writing. Where behaviour is described, it comes from reading that
file, not from documentation.

---

## 1. Where the two models differ, in one paragraph

Penpot shapes are free-floating rectangles with x/y/width/height; every
interaction ultimately produces a geometric delta. Protota nodes are a
constraint tree: a widget's position is fully determined by its parent
container, its index among siblings, and optionally a named slot
(`LEGAL_CHILDREN` / `LEGAL_SLOTS` in `src/types/mockup.ts`). So Penpot's
*geometry* (transform matrices, snap coordinate trees, align deltas) does not
transfer. What transfers is the *interaction architecture*: how a gesture is
recognised, how a preview is kept separate from a commit, how modifiers change
gesture meaning, and how the whole thing is tested. Usefully, Penpot has one
subsystem that faces exactly Protota's problem — dropping into flex and grid
layouts, where the container decides position and the drop resolves to an
*index*, not a coordinate. That subsystem is the single most transferable
piece of this study (§4).

## 2. What Protota has today (baseline)

- Canvas: `src/components/ViewportCanvas.tsx` — pan (middle-mouse / space),
  zoom-at-point, screen focus, Desktop/Phosh preview overlays, flow-edge SVG
  overlay. No drag of nodes, no marquee, single selection only.
- Store: `src/store/mockupStore.ts` — zustand + immer. Mutations:
  `addChildNode(parentId, type, slot)`, `moveNodeUp`/`moveNodeDown`,
  `deleteNode`, `updateNodeProps`, subtree clipboard
  (`copyNode`/`cutNode`/`pasteNode`/`duplicateNode` with `withFreshIds`),
  whole-document undo snapshots (`pushSnapshot`, `MAX_HISTORY = 50`).
  Selection is a single `selectedNodeId`.
- Agent API: `src/utils/agent-api.ts` — `MockupBuilder`, build-time only
  (constructs a document; no access to the live editor, selection, or
  events). The store is exposed for tests as `window.__mockupStore` in dev
  builds only.
- E2E: Playwright, Chromium-only, specs in `tests/`, dev-server fixture,
  screenshots used by `tests/broadway-reference.spec.ts` against a real GTK
  Broadway render.

---

## 3. Selection: single click, modifiers, rubber-band

### How Penpot does it

Pointer handling enters at
`frontend/src/app/main/ui/workspace/viewport/actions.cljs`. `on-pointer-down`
captures the pointer (`setPointerCapture`, so the gesture survives leaving the
viewport or the browser window), then dispatches on what was hit:

- Click on empty canvas, or click anywhere with the platform mod key held →
  emit `handle-area-selection` (rubber-band), passing `shift?` and `mod?`.
- Click on a shape → emit `start-move-selected` (§4). Note the asymmetry:
  clicking a shape *immediately* enters the move gesture; whether it was
  actually a click or a drag is decided later by whether the pointer moved.
- Middle-click or space+click → pan; mod on top of that → zoom gesture.

The rubber-band lives in
`frontend/src/app/main/data/workspace/selection.cljs`:

- `handle-area-selection` starts a stream of pointer deltas and repeatedly
  emits `update-selrect`, which stores the marquee rect in workspace-local
  state. The rect is drawn by the viewport as an overlay element (CSS class
  `viewport-selrect`, special-cased in `actions.cljs` hit tests so the
  marquee itself never swallows events).
- On each update, `select-shapes-by-current-selrect` asks a web worker for
  shapes matching the rect (`:index/query-selection` command) — Penpot keeps
  a geometric index off the main thread because documents can have thousands
  of shapes. Results are filtered (hidden/blocked shapes excluded), then
  merged with the pre-gesture selection:
  - no modifier: replace;
  - shift (`append?`): union with the initial set;
  - shift+mod (`remove?`): subtract from the initial set.
- Selection is stored as an **ordered set** of ids in workspace-local state
  (`select-shapes`, `select-shape`, `deselect-all`). Ordered matters:
  align/distribute and layer operations depend on stable selection order.
- Keyboard modifier state during a gesture is not read from individual DOM
  events but from long-lived behaviour-subject streams in
  `frontend/src/app/main/streams.cljs` (`mouse-position`,
  `mouse-position-shift`, `mouse-position-alt`, `keyboard-mod`,
  `keyboard-space`, …). Two details worth stealing:
  - `keyboard-mod` maps to meta on macOS and ctrl elsewhere, decided once at
    stream construction — no per-callsite platform checks.
  - every keyboard stream merges in a `window` `blur` event that forces the
    modifier to "up". This fixes the classic stuck-modifier bug when the user
    switches windows mid-shortcut. Protota's `ViewportCanvas` space-pan has
    exactly this bug today (space held → cmd-tab away → space stays latched).

### Adaptation for Protota

Selection state: replace `selectedNodeId: string | null` with an ordered
`selectedNodeIds: string[]` plus the existing single-id accessor as a derived
convenience (first element). Everything else in the app (inspector, node
actions) keeps working on the primary selection; multi-only operations
(align, distribute, group delete) read the array. Selection remains
editor-state, not document-state — it must **not** go through `pushSnapshot`
(Penpot likewise keeps selection out of undo).

Rubber-band: Protota does not need a worker or geometric index — a mockup has
tens of nodes, not thousands. On marquee update, walk the rendered DOM:
every node already renders with a stable element per `AdwNode` (the renderer
knows the node id), so `getBoundingClientRect()` per node against the marquee
rect is plenty. Match by **intersection**, not containment (Penpot matches
what the rect touches; containment feels wrong for large container widgets).
One Protota-specific rule Penpot doesn't need: when a marquee covers both a
container and its children, keep only the shallowest ancestors — selecting a
`box` and also three of its children makes align/distribute and drag
ambiguous. Penpot has a milder version of this (it selects top-level
frames/groups, not their contents, unless you double-click into them).

Modifier semantics to copy verbatim (as behaviour, not code): plain click
replaces; shift-click and shift-marquee add; shift+mod removes; Escape clears
(already present); click on empty canvas clears (already present).

## 4. Drag: move, reparent, and the preview/commit split

### How Penpot does it

`frontend/src/app/main/data/workspace/transforms.cljs`:

- `start-move-selected` → `start-move`: subscribes to the pointer-delta
  stream. Crucially, dragging **never mutates the document**. Each frame
  builds a *modifier* — a temporary transform (see
  `common/src/app/common/types/modifiers.cljc` and
  `frontend/src/app/main/data/workspace/modifiers.cljs`) — applied to the
  rendered shapes as a preview (`set-modifiers`). Only on pointer-up does
  `finish-transform` → `apply-modifiers` write the document, producing
  exactly one undo entry per gesture.
- Modifier keys, read from the streams in §3:
  - **shift** = axis lock: zero the minor component of the move vector,
    chosen by dominant axis, re-evaluated continuously.
  - **alt** mid-drag = drag-a-copy: switches into `start-move-duplicate`,
    which duplicates the selection and moves the duplicate.
  - snapping is suppressed on the locked axis (`snap-ignore-axis`).
- Multi-select drags build one modifier tree covering all selected ids
  (`create-modif-tree`) so the group moves as a unit and layout reflow is
  computed once, with caches for parent validation and subtree lookup.
- **The transferable part — layout drops.** When the drag target is a flex
  or grid layout container, Penpot stops thinking in coordinates: the target
  container is resolved by walking down from the pointer
  (`top-nested-frame` in the shape-tree namespace), then the pointer
  position is converted to an **insertion index** among the container's
  children (`get-drop-index` in
  `common/src/app/common/geom/shapes/flex_layout/`, with a grid-cell
  equivalent `get-drop-cell`). Reordering within the same container is a
  distinct cheap path (`reorder-selected-layout-child`) that just updates the
  index. This is precisely Protota's model: every drop in Protota is
  "container + index (+ slot)".
- Palette/asset drag-in is *not* pointer-stream based: dragging a component
  from the sidebar or an image from the OS uses **native HTML5 drag events**
  (`on-drag-enter`, `on-drag-over`, `on-drag-end` in
  `viewport/actions.cljs`), with the dragged payload stashed in an atom
  rather than round-tripped through DataTransfer. Two separate mechanisms,
  deliberately: canvas drags need pointer capture and per-frame previews;
  palette drags need to originate in ordinary DOM widgets and interoperate
  with OS drags (files, images from other tabs).

### Adaptation for Protota

The preview/commit split is the single most important behaviour to copy.
Concretely: a drag gesture holds transient state (dragged node id(s), current
drop target `{parentId, index, slot?}`) in component state or a small
non-undoable store slice; the renderer shows an insertion caret at the target;
nothing touches `doc` until drop, which performs **one** mutation and one
`pushSnapshot`. This needs a new store mutation the tree does not have yet:

```
moveNode(nodeId, newParentId, index, slot?)   // validated by LEGAL_CHILDREN/LEGAL_SLOTS
```

(`moveNodeUp`/`Down` become trivial wrappers over it.) Without it, drag would
have to be delete+add, which breaks node identity and produces two undo steps.

Drop-target resolution, adapted from Penpot's flex path: hit-test the pointer
against rendered node rects, take the **deepest container whose
`LEGAL_CHILDREN` accepts the dragged type**; within it, compare the pointer
against child midpoints along the container's orientation to get the index.
For slotted containers (header-bar start/end, toolbar-view top/bottom), the
slot regions are already distinct DOM areas — resolve slot first, then index
within the slot. Reject-with-feedback (no caret, "not-allowed" cursor) when no
legal container is under the pointer; Penpot greys out invalid drops the same
way.

Use both of Penpot's mechanisms in the same split: **HTML5 drag events for
palette → canvas** (palette entries are plain DOM buttons; `dataTransfer`
carries the widget type string, or an atom-style module variable carries it
like Penpot does to avoid serialisation) and **pointer events with
`setPointerCapture` for reparent-within-canvas** (needed so the drag
survives leaving the screen frame, and so click-vs-drag can be decided by a
small movement threshold before committing to the gesture).

Modifier semantics worth keeping: alt = drag-a-copy maps cleanly
(`duplicateNode` then drag the copy). Shift axis lock is meaningless in a
constraint model — skip it; the analogue that *is* meaningful is
"shift restricts drop targets to the current parent" (reorder-only drag),
mirroring Penpot's reorder fast path.

## 5. Snapping and alignment guides

### How Penpot does it

Three layers, all verified:

- `common/src/app/common/geom/snap.cljc` — pure geometry: which points of a
  shape are snap candidates (corners, centre, midpoints).
- `frontend/src/app/worker/snap.cljs` — the index. Per page, per frame, per
  axis, snap coordinates are stored in a **balanced range tree**
  (`frontend/src/app/util/range_tree.js`, a JS implementation queried from
  ClojureScript). `add-page` builds it; `update-page` diffs document changes
  and patches it incrementally; `query` answers "all snap values in
  `[from, to]`". It lives in a web worker.
- `frontend/src/app/main/snap.cljs` — policy: candidate sources are ruler
  guides, other shapes ("dynamic alignment"), layout grids, and the pixel
  grid, each gated by a layout flag; `closest-snap-move` queries the worker
  around the dragged shape's snap points and returns a `{x, y}` delta (nil
  per axis when nothing is in range). Thresholds are constants
  (`snap-accuracy` 10, `snap-distance-accuracy` 20) **divided by zoom**, so
  snap radius is constant in screen pixels at any zoom.
- Guide *rendering* is separate from computation:
  `viewport/snap_points.cljs` draws the alignment lines,
  `viewport/snap_distances.cljs` draws equal-spacing distance badges between
  neighbours.

### Adaptation for Protota

Coordinate snapping mostly evaporates: a dropped widget cannot be at an
arbitrary x/y, so there is nothing to snap. What survives, remapped:

1. **Insertion snapping is index resolution** (§4) — the caret *is* the snap.
2. **Spacing snapping**: the useful Adwaita analogue of "snap to the 6/12/18/24
   scale" is not drag-time geometry but property-time quantisation — when the
   inspector (or a future drag-handle for `spacing`) changes a `box` spacing,
   snap the value to the scale the linter (`src/utils/higLinter.ts`) already
   enforces. Same rule, enforced at input instead of flagged after.
3. **The zoom-division trick transfers directly** and Protota needs it: any
   pixel threshold used in #79 (click-vs-drag movement threshold, caret
   hit-zones, marquee minimum size) must be divided by the canvas `zoom`
   before comparing against surface-space coordinates, since
   `ViewportCanvas` applies `scale(zoom)` to the whole surface.
4. **Equal-spacing badges** (snap_distances) have a cheap, honest Protota
   version: while dragging over a `box`, render the container's `spacing`
   value between children — it is a single number by construction, which is
   the constraint model doing for free what Penpot computes per-pair.
5. Skip the worker and range tree entirely at Protota's document sizes; note
   them as the scaling path if documents ever grow (the incremental
   `update-page` diffing is the part that makes it viable, not the tree).

## 6. Align and distribute

### How Penpot does it

`common/src/app/common/geom/align.cljc` — small and pure:

- `align-to-rect`: compute the selection member's bounding box, compute its
  target position against a reference rect for one of six modes
  (`:hleft :hcenter :hright :vtop :vcenter :vbottom`, via `calc-align-pos`),
  move by the delta. The reference rect is the selection's combined bounds
  (or the parent frame, via `align-to-parent`).
- `distribute-space`: sort shapes by centre along the axis; free space =
  wrapper size − Σ shape sizes; gap = free / (n−1); lay out sequentially.

### Adaptation for Protota

Geometric align does not transfer — position is the container's decision. The
honest mapping, and the recommendation for #79's "align/distribute across the
selection" bullet:

- **Align** becomes a property edit on the selected nodes or their common
  parent: `halign`/`valign`/`hexpand` on children, or the container's own
  alignment, depending on orientation. The UI can present the same six
  buttons as Penpot; the implementation is `updateNodeProps` over
  `selectedNodeIds` — batched into **one** undo snapshot (needs a small store
  addition: a batched multi-node update, see §8).
- **Distribute** maps to the container: distributing children of a `box` is
  setting `spacing` (uniform by construction) or toggling homogeneous/expand
  behaviour. When the selection spans multiple parents, disable the buttons
  with a tooltip rather than guessing — Penpot's equivalent guard is
  requiring n ≥ 2 shapes.

This is the clearest case of "adopt the UI vocabulary, reject the
implementation".

## 7. Recommended #79 implementation order

Ordered so each step ships alone and later steps reuse earlier machinery:

1. **`moveNode(nodeId, parentId, index, slot?)` store mutation + tests.**
   Pure model work, unlocks everything; `moveNodeUp`/`Down` reimplemented on
   top.
2. **Multi-select state** (`selectedNodeIds`, shift-click in canvas and
   LayersPanel, ancestor filtering). No new gestures yet; inspector binds to
   primary selection.
3. **Palette → canvas drag** (HTML5 drag events, drop resolution to
   container+index+slot, insertion caret, legality feedback). Reuses
   `addChildNode`; highest user value per line of code.
4. **Reparent drag within canvas** (pointer capture, movement threshold,
   same drop resolution, preview-then-commit via `moveNode`; alt = copy;
   shift = reorder-only).
5. **Rubber-band marquee** (needs 2; shares hit-testing with 3–4).
6. **Align/distribute as constraint edits** (needs 2 and the batched update).
7. **Spacing quantisation + equal-spacing badges** (polish; independent).

Keyboard navigation of the layer tree (the last #79 bullet) is independent of
all of the above and can go in any slot.

## 8. Plugin API: Penpot vs `MockupBuilder`

Penpot's plugin surface is a typed `penpot` global defined in
`penpot-plugins` (`libs/plugin-types/index.d.ts`, 4.4k lines), implemented in
the main repo under `frontend/src/app/plugins/` (`api.cljs`, `events.cljs`,
`shapes.cljs`, `file.cljs`, `history.cljs`, …), with plugin-specific types in
`common/src/app/common/types/plugins.cljc`. The parts relevant to Protota's
agent story, all verified in `index.d.ts`:

| Capability | Penpot | Protota `MockupBuilder` (`src/utils/agent-api.ts`) |
|---|---|---|
| Construction | `createBoard()`, `createRectangle()`, `createText()`, … | `addScreen`/`addWidget`/`addChild` with legality checks — comparable, and Protota's slot/legality validation is stronger than Penpot's |
| Live document access | `penpot.root`, `penpot.currentPage`, live `Shape` proxies | None — builder produces a detached document; the live store is only reachable via the dev-only `window.__mockupStore` |
| Selection | `penpot.selection: Shape[]` (readable **and writable**) | Not exposed |
| Change events | `penpot.on(...)`: `selectionchange` (id list), `pagechange`, `filechange`, `shapechange` (per-shape, takes `{ shapeId }` option), `themechange`, `contentsave` | Not exposed |
| Batch edits / undo grouping | `history.undoBlockBegin()` → id → `undoBlockFinish(id)`: many mutations, one undo step | Not exposed; every store mutation snapshots individually |
| Bulk operations | `group(shapes)`, `ungroup(group)`, `replaceColor(shapes, old, new)` | Not exposed |

The pattern worth copying is the *shape of the surface*, not its size: a
small live handle (`selection`, an `on(event, cb)` with a handful of coarse
events, and an undo-block pair) covers most of what an agent driving the
editor needs. Concrete proposal for a later issue:

- `protota.selection`: get/set `string[]` of node ids (drives the same store
  selection as §3 — one selection model for humans, tests, and agents).
- `protota.on('selectionchange' | 'documentchange', cb)` — Protota's
  `documentchange` is cheap and precise because every `pushSnapshot` is
  exactly one semantic change.
- `protota.transaction(fn)` — run several store mutations, emit one snapshot.
  This is the same batched-update primitive §6 needs for align, so build it
  once in the store and expose it.
- Keep `MockupBuilder` as the *construction* API; the live handle is a
  separate, tiny object. Penpot similarly separates document types from the
  runtime `penpot` global.

## 9. Playwright: fixtures and canvas-snapshot stability

### How Penpot does it

Layout (all under `frontend/playwright/`): page objects in `ui/pages/`
(`BasePage.js`, `BaseWebSocketPage.js`, `WorkspacePage.js`,
`WasmWorkspacePage.js`), helpers in `helpers/` (`MockWebSocketHelper.js`,
`Transit.js`, `Clipboard.js`), JSON fixtures in `data/`, functional specs in
`ui/specs/`, screenshot specs in `ui/render-wasm-specs/` with committed
`*-snapshots/` directories.

The load-bearing decisions:

1. **No live backend.** Every RPC the frontend makes is intercepted and
   answered from a committed JSON fixture: `WorkspacePage.setupEmptyFile()`
   mocks the whole boot sequence; `mockGetFile("workspace/get-file-….json")`
   loads a saved document — the fixture *is* the test document, and ids
   (file, page, team) are parsed back out of the fixture so navigation URLs
   always match. The WebSocket is a mock too (`MockWebSocketHelper`), with
   presence messages injected as fixtures.
2. **Explicit readiness, not timeouts.** The workspace is "ready" when a
   known DOM signal appears (the page-name element showing the fixture's
   page name); WASM canvas specs go further and expose a **render counter**,
   with `waitForFirstRender()` / `waitForNextRender(previousCount)` — after
   an action, wait for the counter to advance, then screenshot. No sleeps.
3. **Screenshot discipline.** Default comparator for most shots; tests
   hunting specific artifacts tighten to `maxDiffPixelRatio: 0`,
   `threshold: 0.1`. Snapshots are per-spec directories committed to git.
4. **Interaction specs avoid pixel assertions.** The multi-selection suite
   (`ui/specs/multiseleccion.spec.js`) never screenshots: it selects via
   layer-tree rows with `Shift`/`Control` click modifiers and asserts
   *semantic* UI state (the inspector showing "Mixed" values). Screenshots
   are reserved for the renderer suite, where pixels are the subject.

### Concrete recommendations for Protota

Protota already does (1) in spirit — documents seed through
localStorage/Blueprint and generated presets, no backend. The gaps are (2)
and (3), plus canvas-specific hazards visible in `ViewportCanvas.tsx`:

- **Kill animation during shots.** The canvas surface has
  `transition: transform 0.2s ease` (off only while panning) — any
  screenshot after a pan/zoom/focus-screen action races a 200 ms animation.
  Pass `animations: "disabled"` in `toHaveScreenshot` options (Playwright
  fast-forwards CSS transitions), or gate the transition on a
  `data-testing` attribute set by tests.
- **Freeze the clock.** Desktop-preview mode renders
  `new Date().toLocaleTimeString(...)` in the top bar — a guaranteed diff
  every minute. Use Playwright's `page.clock.setFixedTime(...)` in any spec
  that enters desktop mode.
- **Wait on real signals**: `document.fonts.ready` (Protota ships custom
  fonts via `src/fonts.ts`; unloaded fonts are a classic first-run diff) and
  a store-settled check via the existing `window.__mockupStore` handle —
  Protota's equivalent of Penpot's render counter is asserting the store's
  `doc`/`historyIndex` reached the expected state *before* screenshotting.
- **Centralise comparator config** in `playwright.config.ts`
  (`expect.toHaveScreenshot: { maxDiffPixelRatio, animations: "disabled" }`)
  instead of per-call options, and keep the Broadway-comparison suite's
  looser thresholds separate from any future strict UI-chrome shots.
- **Prefer semantic assertions for #79 interaction tests**, per Penpot's
  split: rubber-band and drag specs should assert `__mockupStore` state
  (selection contents, node's new parent/index) and DOM attributes, not
  pixels. Reserve screenshots for renderer-contract and Broadway suites.
- **Deterministic ids for fixtures.** `uid()` embeds `Date.now()`; fine for
  pixels, noisy for any assertion or artifact that serialises the tree. A
  test-mode monotonic counter (like `agent-api.ts`'s `_nextId`) would make
  store-state assertions order-stable.
- The one Penpot idea *not* to adopt: committed screenshot baselines for the
  whole workspace UI. Penpot affords it because only the WASM renderer suite
  screenshots; Protota's chrome is Adwaita-Web CSS that changes on
  dependency bumps, and the Broadway suite already covers "does it look like
  GTK" with a tolerance model.

---

## 10. Verified-reference index

Penpot (`penpot/penpot`, branch `develop`):

- `frontend/src/app/main/ui/workspace/viewport/actions.cljs` — pointer entry,
  gesture dispatch, pointer capture, HTML5 drag-in handlers
- `frontend/src/app/main/ui/workspace/viewport/{selection,snap_points,snap_distances,guides,rulers}.cljs` — overlays
- `frontend/src/app/main/ui/workspace/viewport/streams.cljs` — exists but is
  empty on develop; the live streams are in `frontend/src/app/main/streams.cljs`
- `frontend/src/app/main/data/workspace/selection.cljs` — rubber-band +
  selection set semantics
- `frontend/src/app/main/data/workspace/transforms.cljs` — move pipeline,
  modifier keys, layout drop index
- `frontend/src/app/main/data/workspace/modifiers.cljs`,
  `common/src/app/common/types/modifiers.cljc` — preview/commit split
- `frontend/src/app/main/snap.cljs`, `frontend/src/app/worker/snap.cljs`,
  `frontend/src/app/util/range_tree.js`,
  `common/src/app/common/geom/snap.cljc` — snapping stack
- `common/src/app/common/geom/align.cljc` — align/distribute algorithms
- `frontend/src/app/plugins/` (`api.cljs`, `events.cljs`, …),
  `common/src/app/common/types/plugins.cljc` — plugin runtime
- `frontend/playwright/ui/pages/WorkspacePage.js`,
  `frontend/playwright/helpers/MockWebSocketHelper.js`,
  `frontend/playwright/data/workspace/*.json`,
  `frontend/playwright/ui/specs/multiseleccion.spec.js`,
  `frontend/playwright/ui/render-wasm-specs/shapes.spec.js` — e2e approach

Penpot plugins (`penpot/penpot-plugins`):

- `libs/plugin-types/index.d.ts` — `penpot.selection`, `penpot.on` event map
  (`pagechange`, `filechange`, `selectionchange`, `themechange`,
  `shapechange`, `contentsave`), `history.undoBlockBegin`/`undoBlockFinish`,
  `group`/`ungroup`/`replaceColor`
