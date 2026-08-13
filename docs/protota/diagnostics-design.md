---
sidebar_position: 8
title: "diagnostics design"
---

Status: proposed design, 2026-07-31.
Scope: turn the existing "HIG Lint" feature into a full **Diagnostics**
mechanism — an IDE-linter-like reporting system with Error / Warning /
Suggestion tiers, fed by two sources: codified GNOME HIG rules and
Blueprint-side diagnostics — surfaced in a dedicated right-side panel with
canvas highlighting, filters, ignores, and quick-fixes.

---

## 1. What exists today

The issue describes the "HIG Lint" toggle as unwired; since then a first cut
landed. The design below is an evolution of that code, not a green-field
build:

| Piece | File | Notes |
| --- | --- | --- |
| Lint engine | `src/utils/higLinter.ts` | 8 rules (`HIG-E001`–`HIG-I002`), `lintDocument(doc)` walks every screen's `rootNode`, returns `LintViolation[]` |
| Violation type | `src/utils/higLinter.ts` | `{ ruleId, severity: 'error'\|'warning'\|'info', message, fix?, screenId, nodeId, nodeType }` |
| Store wiring | `src/store/mockupStore.ts` | `lintEnabled`, `violations`, `toggleLint()`; `pushSnapshot()` re-lints on every mutation while enabled |
| Toggle UI | `src/components/TopBar.tsx` | "HIG Lint" toolbar button + Edit-menu item (Ctrl+.) |
| Report UI | `src/components/AuditPanel.tsx` | bottom strip, max 5 items per severity, click-to-select |
| Import diagnostics | `src/types/mockup.ts`, `src/utils/blueprint.ts` | `ImportDiagnostic` (`template-not-in-bundle`, `renderer-does-not-support-class`, `static-source-expansion`) recorded on `MockupDocument.importDiagnostics` during Blueprint/GtkBuilder import — currently **not shown anywhere** |
| Structural legality | `src/types/mockup.ts` | `LEGAL_CHILDREN` / `LEGAL_SLOTS` hard-block illegal nesting at edit time; the comment there explicitly says "HIG guidance belongs in the linter" |
| HIG corpus | `docs/spec/reference/hig/*.md`, `docs/spec/tokens/*.md`, `docs/spec/reference/anti-patterns.md` | mirrored HIG pages + tokens extracted from audited GNOME apps (`docs/spec/audits/`) — the grounding source for every rule |

Gaps this design closes:

- Only 8 rules; severities named `info` instead of the issue's *Suggestion*.
- No rule metadata (HIG citation, category, docs link), no ignore mechanism,
  no machine-applicable quick-fixes (`fix` is prose only).
- `AuditPanel` is a cramped bottom strip, not the right-side panel the issue
  asks for; no per-tier filter toggles; no canvas badges.
- `importDiagnostics` — the Blueprint-side source — never reaches the user.

---

## 2. Architecture

### 2.1 The unified `Diagnostic` model

One record type regardless of source, superseding `LintViolation`:

```ts
// src/diagnostics/types.ts (new)
export type DiagnosticTier = 'error' | 'warning' | 'suggestion';
export type DiagnosticSource = 'hig' | 'blueprint';

export interface Diagnostic {
  ruleId: string;              // 'HIG-E001' | 'BLP-I001' | ...
  tier: DiagnosticTier;
  source: DiagnosticSource;
  message: string;             // one-line, user-facing
  screenId: string;
  nodeId: string;              // anchor node on the canvas
  nodeType: AdwNodeType;
  citation?: HigCitation;      // absent for blueprint-source diagnostics
  quickFix?: QuickFix;         // machine-applicable, optional
}

export interface HigCitation {
  /** Mirrored corpus file, e.g. 'docs/spec/reference/hig/menus.md' */
  specPath: string;
  /** Upstream page, e.g. 'https://developer.gnome.org/hig/patterns/controls/menus.html' */
  url: string;
  /** Short quote or paraphrase shown in the panel card */
  excerpt: string;
}
```

Tier semantics (mapping the issue's tiers onto HIG language):

- **Error** — the mockup depicts something a conformant GNOME app cannot
  ship: broken accessibility, sizes below the supported minimum, structures
  the HIG states as hard requirements ("should always", "never").
- **Warning** — violates an explicit HIG guideline; the app would work but
  reviewers would flag it ("should", "do not", numeric ranges).
- **Suggestion** — nice-to-have polish: writing style, capitalization,
  layout refinements ("try to", "generally", "typically"). Replaces today's
  `info` severity.

### 2.2 Rule engine (HIG source)

Rules become declarative objects instead of today's bare functions, so the
panel, the docs, and a future generated rule index all read the same
metadata:

```ts
// src/diagnostics/rules/types.ts (new)
export interface RuleContext {
  doc: MockupDocument;
  screen: Screen;
  /** Ancestor chain, root first — replaces higLinter's ad-hoc findParent */
  ancestors: AdwNode[];
}

export interface HigRule {
  id: string;                  // 'HIG-E001'
  tier: DiagnosticTier;
  title: string;               // 'Window narrower than supported minimum'
  citation: HigCitation;
  /** Cheap pre-filter; the walker only calls match() for these node types */
  appliesTo: AdwNodeType[] | 'any';
  /** Pure predicate + report builder. Never mutates. */
  match(node: AdwNode, ctx: RuleContext): Omit<Diagnostic,
    'ruleId' | 'tier' | 'source' | 'citation'>[] | null;
  /** Optional machine fix expressed as store-mutation data (§6) */
  quickFix?(node: AdwNode, ctx: RuleContext): QuickFix | null;
}
```

The engine (`src/diagnostics/engine.ts`, evolved from
`lintDocument`) does a single depth-first walk per screen carrying the
ancestor chain, dispatches each node to the rules indexed by `appliesTo`,
and stamps `ruleId`/`tier`/`source`/`citation` onto the returned matches.
This fixes an actual perf wart in `higLinter.ts`:
`checkDestructiveButtonContext` re-walks the whole document from the root to
find each ancestor; with the chain in `RuleContext` it becomes
`ctx.ancestors.some(a => a.type === 'alert-dialog')`.

**When it runs.** Same trigger as today: `pushSnapshot()` in
`src/store/mockupStore.ts` re-runs the engine after every committed mutation
while diagnostics are enabled. Documents are small (a mockup is tens to low
hundreds of nodes — the store caps history at 50 snapshots of the same
scale), so a full synchronous re-run per edit is well under a millisecond
and needs no incremental scheme. If profiling ever disagrees, the escape
hatch is per-screen memoization keyed on the screen's `rootNode` identity
(immer structurally shares untouched screens), not a dirty-node system.

### 2.3 Blueprint diagnostics (second source) — what is realistic

"Blueprint LSP" needs unpacking. `blueprint-compiler` (and its LSP mode) is
a Python program; Protota is a static browser app with **no backend and no
Python**. Protota instead ships its own Blueprint/GtkBuilder reader-writer in
`src/utils/blueprint.ts` (`blueprintImport`, `blueprintToDocument`,
`mockupToBlueprint`). Three honest integration levels, in order:

1. **Now — surface what the importer already records.** Every
   `ImportDiagnostic` on `doc.importDiagnostics` becomes a
   `Diagnostic` with `source: 'blueprint'`:
   - `template-not-in-bundle` → **warning** `BLP-W001` — a `$Class`
     reference had no template definition in the imported source.
   - `renderer-does-not-support-class` → **suggestion** `BLP-S001` — a
     known GTK/Adw class outside Protota's widget registry survives as a
     `custom-widget` boundary. This is by design an honest result, not an
     error (see `docs/source-widget-architecture.md`), so it must not be
     tiered as one.
   - `static-source-expansion` → **suggestion** `BLP-S002` — informational
     provenance note.
   These have `sourceClass`/`sourceId` but not always a live `nodeId`; the
   panel shows them under a per-document "Source" group and anchors to the
   matching `custom-widget` node when one exists.
2. **Cheap and high-value — export round-trip check.** On demand (and
   before Blueprint export), run `blueprintImport(mockupToBlueprint(doc))`
   and diff the diagnostics/roots. Anything the exporter emits that the
   importer cannot faithfully read back is a real fidelity bug worth an
   **error**-tier `BLP-E001`. This uses only existing functions.
3. **Later, optional — real `blueprint-compiler` verification.**
   Two plausible shapes, both explicitly out of scope for the first
   iterations: (a) `blueprint-compiler` under Pyodide in a web worker —
   pure-Python so feasible, but a multi-MB lazy-loaded dependency; (b) a CI
   check in preset pipelines that compiles exported `.blp` files and
   attaches results out-of-band. Neither is an LSP; there is no live
   per-keystroke language server in the browser, and the design should not
   promise one.

#### 2.3.1 Level 3 as shipped — the live syntax tier (BLP-L001)

Shape (a) landed (ADR 0001 Part 3 item 2), scoped tighter than "real
verification" because the browser cannot honestly do more:

- **What runs in the browser**: blueprint-compiler **v0.22.2** — vendored
  unmodified under `public/vendor/blueprint-compiler/` (LGPL; see the
  NOTICE there), pinned to the same version the Fedora 45 container in the
  `blueprint-export` CI job installs — executes under Pyodide in a Web
  Worker (`src/diagnostics/blueprintSyntax.worker.ts`). Only its
  **tokenizer and parser** run (`blueprint_check.py` skips the AST
  validation pass): missing semicolons/braces, malformed constructs,
  unparseable `$Type` references. Each screen is exported separately
  (`buildScreenSources`, the same per-screen standalone shape
  `scripts/export-blueprint.mjs` feeds CI), so errors attribute to a
  screen; a nearest-preceding-widget-id heuristic anchors them to a node.
  Results are **error**-tier `BLP-L001`, always prefixed
  *"Syntax check (browser)"*.
- **What stays host-only**: everything needing GObject introspection —
  unknown classes, property names/types, signals, `using` namespace
  resolution. Typelibs don't exist in the browser; a minimal import-time
  `gi` stub satisfies `blueprintcompiler.gir`'s imports and *raises* if
  introspection is actually attempted. The `blueprint-export` CI job
  (distro blueprint-compiler + GIR data) remains the authority, and the UI
  never claims "compiles clean" from the browser tier.
- **Size and loading**: opt-in via a toggle in the panel's Source group —
  nothing loads at app start. First enable lazily spawns the worker, which
  downloads the **self-hosted** Pyodide runtime (~14 MB: wasm interpreter +
  stdlib) from `<base>/pyodide/`, copied out of the `pyodide` npm package
  at build time by the Vite plugin in `vite.config.ts` — no CDN, so the
  static-hosting/no-server constraint holds and the check works offline
  once cached. The worker survives toggling, so re-enabling is instant.
  If the runtime cannot load (offline first use), the status line reports
  it and the tier degrades to absent — HIG rules, import diagnostics, and
  the BLP-E001 round-trip check are unaffected.
- **Testing**: mapping + client lifecycle are unit-tested with a fake
  worker (`src/__tests__/live-blueprint.test.ts`); real Pyodide + the
  vendored compiler run under vitest/node
  (`src/__tests__/pyodide-blueprint.integration.test.ts` — bad source
  errors, good source clean, exporter output clean, GIR-level mistakes
  deliberately NOT flagged); Playwright drives the real runtime end to end
  (`tests/live-blueprint.spec.ts`: opt-in gating, loading state, a genuine
  parser diagnostic, badge integration).

### 2.4 Store shape

```ts
// additions/changes in src/store/mockupStore.ts
diagnosticsEnabled: boolean;          // renames lintEnabled
diagnostics: Diagnostic[];            // renames violations, unified model
tierFilters: Record<DiagnosticTier, boolean>;   // panel toggles, default all on
ignoredRules: string[];               // rule ids disabled globally (persisted)
ignoredInstances: string[];           // `${ruleId}:${nodeId}` dismissals (persisted)
toggleDiagnostics(): void;            // renames toggleLint
setTierFilter(tier, on): void;
ignoreRule(ruleId): void;  ignoreInstance(ruleId, nodeId): void;
applyQuickFix(d: Diagnostic): void;   // §6
```

Ignores persist in `localStorage` beside the editor metadata that
`persistDocumentSource()` already writes — they are editor state, not
document content, so they do not belong in the exported Blueprint.
Filtering by tier/ignore happens at selection time (panel + canvas), not in
the engine, so re-enabling a tier is instant.

---

## 3. How HIG guidelines become rules

Method, so the catalog stays grounded and maintainable:

1. **Ground every rule in the mirrored corpus.** Each rule's `citation`
   names a file under `docs/spec/reference/hig/` (or
   `docs/spec/tokens/`, `docs/spec/reference/anti-patterns.md` for
   audit-derived conventions) plus the upstream developer.gnome.org URL and
   a short excerpt. No rule without a quotable sentence.
2. **Only codify machine-checkable predicates.** A guideline qualifies when
   it can be decided from the `MockupDocument` tree alone — structure,
   properties, counts, text shape. Guidance that needs intent ("order items
   by expected frequency of use") stays out of the engine; at most it
   becomes a Suggestion with a deliberately soft message.
3. **Tier from the HIG's own language** (§2.1): "always/never" → Error,
   "should/do not" and numeric ranges → Warning, style and phrasing → 
   Suggestion.
4. **Prefer precision over recall.** A linter that cries wolf gets turned
   off. When a predicate cannot avoid false positives (e.g. Header
   Capitalization vs. proper nouns), it is a Suggestion, never a Warning.
5. **Update cadence.** The catalog is data (one `HigRule[]` module per HIG
   area under `src/diagnostics/rules/`). When the HIG mirror in
   `docs/spec/reference/hig/` is refreshed, rules are re-checked against
   their excerpts; a rule whose excerpt no longer appears upstream is
   retired or re-cited. The panel's per-rule "View guideline" link keeps
   citations honest because users see them.

---

## 4. Starter rule catalog

22 rules. ✔ marks the 8 already implemented in `src/utils/higLinter.ts`
(carried over, some re-tiered/renamed). Citation files live under
`docs/spec/reference/hig/` unless noted; upstream is
`https://developer.gnome.org/hig/`.

### Errors

| Id | Rule | Predicate sketch | Citation |
| --- | --- | --- | --- |
| HIG-E001 ✔ | Window narrower than supported minimum | `screen.width < 360` for `window` roots | `adaptive.md` — "Apps that are appropriate for a phone form factor should scale down to 360×294px"; `docs/spec/reference/anti-patterns.md` checklist "`width-request: 360` minimum" |
| HIG-E002 ✔ | Icon-only button without label/tooltip | `button` with `iconName`, no `title` | `tooltips.md` — "Controls in the header bars of primary windows should all have tooltips"; anti-pattern "Skip tooltips on header bar buttons" |
| HIG-E003 | Alert dialog with zero or more than three buttons | `alert-dialog` whose `button` children count ∉ 1–3 | `dialogs.md` — "Alert dialogs present a message or question, along with between one and three buttons" |
| HIG-E004 | Nested submenu | `menu-button`/`popover` containing another `menu-button` or `popover` in its menu content | `menus.md` — "Don't nest submenus, since nesting can be difficult to use ergonomically" |

### Warnings

| Id | Rule | Predicate sketch | Citation |
| --- | --- | --- | --- |
| HIG-W001 ✔ | Spacing off the GNOME scale | `box.spacing` ∉ audited scale (6/12/18/24 primary; full set in `SPACING_SCALE`) | `docs/spec/tokens/spacing.md` — scale extracted from 12 GNOME Core apps |
| HIG-W002 ✔ | Header bar without a title widget | `header-bar` with no `window-title`/`view-switcher` child | `header-bars.md` — "A window heading, which is placed in the center"; anti-pattern "Put title text directly in header bar → Use `AdwWindowTitle`" |
| HIG-W003 ✔ | Destructive action without confirmation | `button.destructive` outside an `alert-dialog` ancestor | `dialogs.md` — "Destructive actions should always be accompanied by either a confirmation dialog or an offer to undo" |
| HIG-W004 ✔ | View switcher with too many/few views | `view-stack` page count ∉ 3–5 (today only >5; extend to &lt;3 with switcher present) | `view-switchers.md` — "a view switcher should contain between three and five views" |
| HIG-W005 | More than one suggested/destructive button per view | count of `suggested \|\| destructive` buttons under one screen root > 1 | `buttons.md` — "Each view should only ever include a single button using either the suggested or destructive styles" |
| HIG-W006 | Wrong button styles in a header bar | `button` child of `header-bar` that is text-only, `suggested`, or `destructive` | `header-bars.md` Button Style — "These button types should generally be avoided for primary window header bars" |
| HIG-W007 | Content button with both icon and label | `button` outside `header-bar` ancestry with both `iconName` and `title` | `buttons.md` — "Outside of header bars, buttons should contain either an icon or a label, and not both" |
| HIG-W008 | Menu size out of range | `menu-button` popover menu with &lt;3 or >12 activatable items | `menus.md` — "Menus should contain between three and twelve items, and submenus should contain between three and six items" |
| HIG-W009 | Generic affirmative dialog button | non-alert `dialog` whose suggested button is labelled OK/Done/Yes | `dialogs.md` — "Label the affirmative button with a specific imperative verb… clearer than a generic label like OK or Done" |
| HIG-W010 | Confirmation without a cancel | `alert-dialog` with ≥2 buttons, none labelled Cancel | `dialogs.md` — confirmation dialogs "have two buttons: one to confirm… and one to cancel the action" |
| HIG-W011 | Text field with no placeholder or label | `entry` / `search-entry` with neither `placeholder` nor an adjacent `label` | `text-fields.md` — "Text fields should have placeholder text or a label" |
| HIG-W012 | Empty status page | `status-page` missing `iconName` or `title` | `placeholders.md` — "Placeholder pages fill a view with an image, a heading, and an optional line of descriptive text" |
| HIG-W013 | Quit/Close in a primary menu | header-bar-end `menu-button` menu containing an item labelled Quit or Close | `menus.md` — "Primary menus shouldn't include menu items for Close or Quit" |
| HIG-W014 | Crowded header bar | `header-bar` with more than ~6 direct controls per side | `header-bars.md` — "Header bars should only contain a small number of controls… Always ensure that there is some blank space… to allow it to be dragged" |

### Suggestions

| Id | Rule | Predicate sketch | Citation |
| --- | --- | --- | --- |
| HIG-S001 ✔ (was I001) | Header Capitalization for control titles | lowercase significant words in `button`/row/group titles | `writing-style.md` — "Header capitalization should be used for… short control labels… such as button labels, switch labels, menu items" |
| HIG-S002 ✔ (was I002) | Use "…" not "..." | literal `...` in `title`/`subtitle`/`description`/`placeholder` | `writing-style.md` Ellipses — the HIG consistently uses the single character ("Save As…") |
| HIG-S003 | No trailing period on labels/headings | `title` ending in `.` on non-body widgets | `writing-style.md` Periods — "Text generally shouldn't end with a period" |
| HIG-S004 | No ellipsis on Preferences/Properties | item labelled `Preferences…`/`Properties…` | `writing-style.md` Ellipses — "Do not add an ellipsis to labels such as Properties or Preferences" |
| HIG-S005 | Unclamped content at desktop widths | screen ≥ ~700px whose content area has no `clamp` ancestor on text-heavy children | `adaptive.md` Large Size Handling — "place content within containers that have a maximum width" |
| HIG-S006 | Primary menu button icon | end-slot `menu-button` in a `header-bar` whose `iconName` ≠ `open-menu-symbolic` | `menus.md` — "The button for primary menus should use the open-menu-symbolic icon" |

Plus the three Blueprint-source mappings from §2.3 (`BLP-W001`,
`BLP-S001`, `BLP-S002`) and the round-trip `BLP-E001` — 26 rule ids total
in the initial catalog. The live syntax tier (§2.3.1) later added
`BLP-L001`.

Deliberately **not** codified (fails the machine-checkable test):
menu grouping semantics beyond nesting/size, "order items logically",
switch-label binary phrasing, sidebar width feel, undo-vs-confirmation
choice, translation quality.

---

## 5. Surfacing

### 5.1 Diagnostics panel (right side)

A new `src/components/DiagnosticsPanel.tsx` replaces the bottom-strip
`AuditPanel.tsx`. It lives in the right drawer of `App.tsx` alongside
`InspectorPanel`, switched by a two-tab segment at the top of the drawer
(**Properties | Diagnostics**) — the drawer already has the width, scroll
behaviour, and mobile scrim; the issue explicitly suggests this spot.

Panel anatomy, top to bottom:

1. **Filter row** — three toggle chips with live counts, exactly like a
   devtools console: `Errors (2) · Warnings (5) · Suggestions (3)`, backed
   by `tierFilters`. A fourth overflow menu holds "Show ignored" and
   "Re-enable all rules".
2. **Card list**, grouped by screen, ordered error → warning → suggestion:
   - tier icon + `ruleId` + message (the card body);
   - the anchor widget's type (`nodeType`) as a dim trailing tag;
   - expanding a card reveals the citation excerpt with a **View
     guideline** link (upstream URL) and the action row:
     **Fix** (when `quickFix` exists), **Go to widget**, **Ignore ▾**
     (→ "Ignore this instance" / "Disable rule HIG-…").
   - clicking a card selects the node (`selectNode(nodeId, screenId)`),
     which the canvas already renders as `selected-outline`
     (`src/components/AdwaitaRenderer.tsx`, `src/index.css`).
3. **Source group** — Blueprint diagnostics without a live node anchor
   (`importDiagnostics`) listed per document.
4. **Empty state** — a small status-page-style "No issues found" when
   enabled and clean, mirroring the HIG's own placeholder pattern.

### 5.2 Icons

The issue proposes `diagnosticsSymbolic` from the adwaita icon module.
Reality check: `diagnostics-symbolic` exists upstream in adwaita-icon-theme's
*development* category, but the `@gjsify/adwaita-icons` version Protota
ships does **not** export it (nearest exports are `toolsCheckSpellingSymbolic`
and the `dialog*Symbolic` set in its `status` module). Two options:

- preferred: vendor the upstream `diagnostics-symbolic.svg` under
  `src/assets/` and register it through the existing runtime catalog in
  `src/utils/adwIcons.ts` (`registerSourceIcons` already handles exactly
  this "artwork the package lacks" case), falling back if the package later
  ships it;
- fallback: use `toolsCheckSpellingSymbolic` for the toolbar toggle.

Tier icons in the panel: `dialogErrorSymbolic`, `dialogWarningSymbolic`,
`dialogInformationSymbolic` (all verified exports of
`@gjsify/adwaita-icons`' status module), replacing `AuditPanel`'s emoji.

### 5.3 Toolbar toggle + count badge

The `TopBar.tsx` "HIG Lint" button becomes **Diagnostics**: diagnostics
icon + a count badge (`3` in destructive red when errors exist, otherwise
total in neutral) — same live-count pattern the button's tooltip already
uses. Ctrl+. keeps toggling it; the Edit-menu item follows the rename.
When enabling diagnostics with the right drawer closed, open the drawer on
the Diagnostics tab.

### 5.4 Canvas highlighting

`AdwaitaRenderer.tsx` wraps every node in `.adw-node-wrapper` and already
applies `selected-outline`. Extend it: nodes with visible (filtered,
non-ignored) diagnostics get `diagnostic-outline-error` /
`-warning` / `-suggestion` classes — dotted underline-style outlines in the
tier colors already used by `AuditPanel` (`--destructive-bg-color`,
`#e5a50a`, `--accent-bg-color`) — plus a small corner count dot when a node
has multiple. Selection outline wins visually. The existing
`getViolationsForNode` helper generalizes to `getDiagnosticsForNode`.
Highlights are editor chrome, so they must be excluded from PNG export the
same way selection is (`:root[data-protota-capture="true"]` rules in
`src/index.css`).

---

## 6. Quick-fixes via existing store mutations

`QuickFix` is data describing an existing store mutation — no new mutation
paths, so undo/redo and Blueprint persistence work unchanged
(`pushSnapshot()` handles both):

```ts
export type QuickFix =
  | { kind: 'set-props'; nodeId: string; props: Partial<AdwNode>; label: string }
  | { kind: 'add-child'; parentId: string; childType: AdwNodeType; slot?: string; label: string }
  | { kind: 'delete-node'; nodeId: string; label: string };
```

`applyQuickFix()` dispatches to `updateNodeProps` / `addChildNode` /
`deleteNode` and then reselects the anchor. Because the store re-lints in
`pushSnapshot`, the card disappears (or updates) in the same frame — the
red-to-green loop users know from IDEs. One undo restores the pre-fix state.

Examples from the catalog: HIG-W001 → `set-props {spacing: nearest}`;
HIG-S002/S003/S004 → `set-props` with the corrected string; HIG-W002 →
`add-child window-title`; HIG-E002 → `set-props {title}` seeded from the
icon name; HIG-E001 needs a small
`updateScreenProps(screenId, {width})` store addition, since `Screen.width`
lives beside `rootNode` rather than on a node — the only quick-fix that
cannot ride an existing mutation. Rules like HIG-W003 (restructuring into a dialog) ship
without a quick-fix — the card's prose `fix` guidance remains.

---

## 7. User flows

**Flow A — edit, report, fix.**
1. User toggles **Diagnostics** in the top bar (or Ctrl+.). Engine runs on
   the current document; right drawer opens on the Diagnostics tab; badge
   shows counts; offending nodes gain tier outlines.
2. User sets a `box` spacing to 13 in the Inspector. `updateNodeProps` →
   `pushSnapshot` → re-lint. A Warning card appears: *HIG-W001 — Spacing
   13px not on HIG scale — use 12px*, badge increments, node outlined.
3. User expands the card, reads the excerpt from
   `docs/spec/tokens/spacing.md`, clicks **Fix**. `applyQuickFix` runs
   `updateNodeProps(nodeId, {spacing: 12})`; card vanishes; Ctrl+Z would
   restore 13.

**Flow B — investigate without fixing.**
1. Badge shows `1` error. User clicks the badge → panel opens filtered as
   last used.
2. Card: *HIG-E002 — Icon-only button missing label/tooltip*. Click →
   canvas selects the button (existing `selectNode` + `selected-outline`),
   scrolled into view.
3. User decides it's intentional for this throwaway frame → **Ignore ▾ →
   Ignore this instance**. The card moves out of the default list (visible
   under "Show ignored"); counts update. "Disable rule" would instead add
   the id to `ignoredRules` for all documents.

**Flow C — import a real app's Blueprint.**
1. User imports a `.blp` bundle. `blueprintToDocument` records
   `ImportDiagnostic`s as it always has.
2. The panel's Source group lists them: e.g. `BLP-S001 —
   GtkSourceView survives as a custom-widget boundary` (suggestion, by
   design honest, not scary red).
3. Toggling HIG tiers doesn't hide the Source group; the Blueprint source
   has its own subheading, so users can tell "your mockup vs. the imported
   source" apart.

**Flow D — export confidence.**
1. User triggers Blueprint export. The round-trip check (§2.3.2) runs; if
   `mockupToBlueprint` output fails to re-import cleanly, export proceeds
   but a `BLP-E001` error card explains exactly which construct is lossy.

---

## 8. Incremental plan

**Phase 1 — engine + panel + 5 rules** (the walking skeleton):
- `src/diagnostics/` module: `types.ts`, `engine.ts`, `rules/` with the
  declarative `HigRule` interface; port 5 existing rules (E001, E002, W001,
  W002, S002) into it with real citations.
- Store rename (`diagnosticsEnabled`/`diagnostics`, `tierFilters`) with the
  old names kept as deprecated aliases for one release.
- `DiagnosticsPanel` in the right drawer with tier filter chips and
  click-to-select; retire `AuditPanel`; TopBar rename + count badge +
  vendored diagnostics icon.
- Playwright coverage: toggle → card → select → fix-free flow.

**Phase 2 — catalog + actions:**
- Port the remaining existing rules; implement the rest of §4 (target: the
  full 22 HIG rules), each landing with its citation excerpt and unit test
  fixtures (good tree / bad tree per rule under `src/__tests__/`).
- Quick-fix plumbing (`applyQuickFix`) + fixes for the `set-props` and
  `add-child` classes of rules; ignore mechanism (instance + rule,
  persisted); canvas tier outlines with capture-mode exclusion.

**Phase 3 — Blueprint source:**
- Map `importDiagnostics` into the panel (BLP-W001/S001/S002).
- Export round-trip check (BLP-E001) wired into the export path.

**Phase 4 — depth (each item independently optional):**
- Generated rule index page (like `docs/components.md`) from the rule
  metadata, fulfilling the issue's "regularly updated list" deliverable.
- HIG mirror refresh procedure + citation re-validation (§3.5).
- Investigate Pyodide-hosted `blueprint-compiler` verification in a worker;
  ship only if the size/benefit trades well.
- Rule options (e.g. HIG-W014's control-count threshold) once real usage
  shows where defaults pinch.
