---
sidebar_position: 17
title: "source widget architecture"
---

Status: proposed architecture, based on the Calculator source-import
investigation on 2026-07-29.

This document defines how Protota should import, represent, render, inspect,
and export GTK4/Libadwaita interfaces that contain application-defined widget
classes. It expands the immediate work described in
[`custom-widget-handoff.md`](https://github.com/tuna-os/protota/blob/main/docs/custom-widget-handoff.md).

The governing constraint is that official application source remains the
conformance input:

```text
Blueprint / GtkBuilder / application source
                    ↓
         provenance-rich source graph
                    ↓
       editable MockupDocument projection
                    ↓
             generic renderer
                    ↓
       Blueprint project patch or export
```

Protota must not turn an unknown class into a plausible generic box, infer
controls from a screenshot, or add behavior keyed by an application name.

## Executive decision

Use two cooperating layers:

1. A lossless declarative importer constructs a source graph from Blueprint
   and GtkBuilder. Every source-declared object either resolves to a supported
   generic widget, expands from a supplied template, or survives as an
   explicit unresolved boundary.
2. Optional source and runtime enrichers add conservative facts about
   application-defined classes. Static language adapters can discover simple
   construction relationships. A native GTK probe can provide exact runtime
   class, identity, visibility, and allocation facts when an application can
   be run safely.

The browser editor remains useful without either enricher. An unresolved
widget with correct parent placement and layout behavior is a valid, honest
result.

Do not make a multi-language static extractor responsible for retaining the
declarative tree. Arbitrary application code is conditional, data-dependent,
and sometimes deliberately draws its entire surface. Static extraction is an
incremental enhancement, not the foundation of import correctness.

## Confirmed Calculator findings

The official Calculator source bundle was imported with
`OFFICIAL_SOURCE_ROOT` using the existing unit suite. The suite passed, but a
temporary tree trace contained the display and `GtkSourceView` boundary while
omitting both `_buttons` and several short-form GTK classes such as
`DropDown`.

`math-window.blp` does declare the button region:

```text
$MathButtons _buttons {
  equation: bind template.equation;
  converter: "_converter";
}
```

The loss occurs after template expansion, in the Blueprint parser:

- Object recognition currently requires either a dotted class name or a
  class already present in `CLASS_TO_WIDGET_MAP`. An unsupported short name,
  such as `DropDown`, is therefore treated as syntax noise rather than as an
  unsupported source object.
- A `name:` construct is always consumed as a scalar property with one value
  token. Blueprint also permits bindings, expressions, and object-valued
  properties such as `child: Label { ... }`. Consuming only one token causes
  later braces to close the wrong parser scope.
- Parser recovery advances one token at a time and delegates recursively. It
  can therefore report a superficially valid partial tree after losing a
  sibling.
- The official-source test asserts the root window and `GtkSourceView`, but
  does not assert `_buttons`, its parent, or its source placement.

Template expansion itself is also too lossy for the final architecture. It
rewrites source text using regular expressions, inlines a template body, and
represents an unknown template by manufacturing `Protota.CustomWidget`. This
discards the original class/reference kind, definition path, source span, and
the information needed to emit `$MathButtons _buttons` again.

These are generic parser and intermediate-representation problems. Calculator
does not require a Calculator-specific renderer.

## Source graph and editable projection

`MockupDocument` is currently both the editor model and the closest thing to
an import representation. That is insufficient for a source-first,
multi-file, reversible workflow. It only has renderer-oriented node types and
scalar convenience properties; it cannot describe bindings, untranslated
expressions, source locations, template relationships, or resolution reasons.

Introduce a source graph that remains authoritative for import and export.
`MockupDocument` becomes its editable/renderable projection. Each projected
`AdwNode` carries a stable `sourceKey` back to its source node.

A representative model is:

```ts
interface SourceProject {
  files: SourceFile[];
  roots: string[];
  widgets: Record<string, SourceWidgetNode>;
  templates: Record<string, SourceTemplate>;
  diagnostics: ImportDiagnostic[];
  runtimeProfiles?: RuntimeProfile[];
}

interface SourceWidgetNode {
  key: string;
  sourceClass: string;
  sourceId?: string;
  sourceKind: 'object' | 'template-instance' | 'template-root';
  origin: SourceSpan;
  properties: Record<string, SourceValue>;
  children: SourceChild[];
  resolution: WidgetResolution;
  geometryEvidence: GeometryEvidence[];
}

interface SourceChild {
  nodeKey: string;
  slot?: string;
  origin: SourceSpan;
}

type SourceValue =
  | { kind: 'scalar'; value: string | number | boolean }
  | { kind: 'object-reference'; id: string }
  | { kind: 'binding'; sourceText: string }
  | { kind: 'expression'; sourceText: string }
  | { kind: 'array'; values: SourceValue[] }
  | { kind: 'object'; nodeKey: string }
  | { kind: 'opaque'; sourceText: string };

type WidgetResolution =
  | { kind: 'generic-widget'; rendererType: AdwNodeType }
  | { kind: 'expanded-template'; templateKey: string }
  | { kind: 'custom-boundary'; reason: BoundaryReason }
  | { kind: 'unsupported-widget'; reason: BoundaryReason };
```

The exact TypeScript names can change, but the following invariants may not:

- `sourceClass` is never overloaded into a display label.
- Source identity is stable across rendering and editing.
- Unsupported properties and expressions survive normalized export even when
  Protota cannot edit them.
- Template definitions and template instances remain distinct.
- Every unresolved boundary has a structured reason and provenance.
- Renderer support is a property of the resolution registry, not the source
  class identity.

### Import report

Every import produces a report. At minimum, each unresolved or expanded node
records:

- source file and span;
- source class or template;
- source instance ID, when present;
- parent source node and named slot;
- resolution kind;
- boundary reason code and human-readable explanation;
- geometry evidence and confidence;
- any static or runtime facts that contributed to the result.

Useful reason codes include `template-not-in-bundle`,
`renderer-does-not-support-class`, `code-defined-class`,
`dynamic-construction`, `unrecognised-expression`, and
`runtime-node-not-matched`.

The report is part of the source-project state and the Broadway artifact. It
must not exist only as console output.

## Declarative parsing

### Blueprint

Replace the current regular-expression/token-cursor parser with a parser that
models the official Blueprint grammar and retains source spans. Blueprint's
official syntax is specified as a parsing expression grammar, including
objects, templates, child types, properties, bindings, expressions, signals,
menus, arrays, and layout blocks:

[https://gnome.pages.gitlab.gnome.org/blueprint-compiler/reference/index.html](https://gnome.pages.gitlab.gnome.org/blueprint-compiler/reference/index.html)

The parser must be lossless enough to retain an unsupported construct as an
opaque typed value without losing the following sibling. Error recovery must
be brace-aware and local to the current production; it must never recursively
skip arbitrary tokens until a partial tree happens to parse.

Class support is resolved only after parsing. A capitalized short-form class
that is not in the renderer registry is still an object node. It becomes an
explicit unsupported boundary instead of disappearing.

### Blueprint compiler

Use the upstream `blueprint-compiler` in the host-side project importer as a
validation and lowering oracle. It is the official tool that converts
Blueprint to GtkBuilder XML:

[https://gnome.pages.gitlab.gnome.org/blueprint-compiler/](https://gnome.pages.gitlab.gnome.org/blueprint-compiler/)

It should not be the only Protota representation because:

- the web application cannot directly run its Python/GObject Introspection
  toolchain;
- compilation requires typelibs for imported namespaces;
- generated XML does not preserve every Blueprint source boundary, spelling,
  comment, and source span needed for useful project editing;
- Blueprint is documented as experimental, so compiler/version provenance
  must be recorded with an imported project.

For a project import, prefer the compiler version pinned or vendored by the
application build. Record that version in the import report. A compiler
failure is a source diagnostic, not permission to fall back to a lossy parser.

### GtkBuilder

Replace the current tag regular expression with a real XML parser. GtkBuilder
supports nested objects, properties, child roles, internal children,
templates, bindings, signals, layout objects, menus, and non-widget GObjects:

[https://docs.gtk.org/gtk4/class.Builder.html](https://docs.gtk.org/gtk4/class.Builder.html)

Non-visual objects such as models and adjustments belong in the source graph
because visual widgets may reference them, but they do not receive renderer
boxes or unresolved visual coverage.

### Template resolution

Resolve templates symbolically rather than rewriting source strings:

1. Index every template definition in the supplied source bundle.
2. Create a template-instance node for every `$Class id` construction.
3. Link it to its definition when available.
4. Project the definition body for rendering while retaining the instance
   link and instance-local property assignments.
5. Emit a custom boundary when no definition is available.
6. Detect recursive expansion through graph traversal.

This permits an editor to display expanded content while exporting edits to
the correct defining file.

## Generic widget registry

Centralize class behavior in a registry rather than duplicating class maps,
schemas, slots, and renderer switches:

```ts
interface WidgetAdapter {
  canonicalClass: string;
  aliases: string[];
  rendererType: AdwNodeType;
  visual: boolean;
  properties: Record<string, PropertyAdapter>;
  children: ChildSemantics;
  layout: LayoutAdapter;
  render: RenderAdapter;
}
```

The registry owns:

- Blueprint and GtkBuilder class aliases;
- property parsing and projection;
- legal named slots and child behavior;
- layout semantics;
- renderer selection;
- export spelling.

Adding `Gtk.DropDown`, for example, becomes one generic adapter with tests. It
does not require edits scattered across the parser, type map, property schema,
renderer, and exporter.

An unknown GTK/Libadwaita class and an application-defined class are both
visible boundaries, but have different reason codes. This distinction helps
prioritize reusable renderer work.

## Layout and geometry

Correct source retention is useful only if the unresolved node receives the
space GTK would allocate to it. Geometry must be evidence-driven, in this
order:

1. explicit declarative layout properties;
2. statically extracted constructor/template properties;
3. generic parent and sibling layout constraints;
4. matched native runtime allocation;
5. a clearly labelled low-confidence fallback minimum.

The first renderer work should cover these GTK concepts generically:

- `width-request` and `height-request` as minimum requests rather than fixed
  CSS dimensions;
- `hexpand`, `vexpand`, and their set state;
- `halign` and `valign`;
- start/end/top/bottom margins;
- visibility and child visibility;
- `GtkBox` orientation, spacing, homogeneous sizing, and baseline behavior;
- `GtkGrid` attachment, spans, row/column spacing, and homogeneous sizing;
- single-child and named-child slots;
- `GtkStack` visible-child selection and page metadata;
- clamp maximum and tightening behavior;
- scroller minimum/natural sizing and overflow behavior.

For example, `MathButtons` is the final child of a vertical box and sets
vertical expansion in code. Even without knowing its keypad contents, the
custom boundary should consume the remaining vertical allocation rather than
collapse to the renderer's 48-pixel fallback.

Every applied geometry fact records its origin and confidence. Runtime facts
may refine a capture profile, but they must not overwrite the portable source
semantics used by default in the editor.

## Static source enrichment

Static extraction uses language adapters that emit the same small set of
construction facts. It is structural: adapters consume compiler or parser
ASTs, never application-name rules or regular-expression guesses.

```ts
type ConstructionFact =
  | { kind: 'class'; name: string; baseClass: string }
  | { kind: 'template'; className: string; resource: string }
  | { kind: 'construct'; variable: string; className: string; origin: SourceSpan }
  | { kind: 'set-property'; target: string; property: string; value: SourceValue }
  | { kind: 'insert-child'; parent: string; child: string; method: string; args: SourceValue[] }
  | { kind: 'template-child'; className: string; id: string; declaredType?: string }
  | { kind: 'dynamic-boundary'; origin: SourceSpan; reason: string };
```

Adapters should recognize common construction operations such as
`set_child`, property assignment to `child`, `append`, `prepend`, `insert`,
`attach`, `add_overlay`, `set_content`, and stack/page insertion. Calls are
normalized to source-graph child relationships only when their receiver and
arguments are statically identifiable.

Recommended order:

1. Vala, because it unblocks Calculator and several GNOME applications.
2. C, using compilation database information where available.
3. Rust.
4. GJS/JavaScript.

Use the language's compiler frontend or a maintained concrete/abstract syntax
tree implementation. A parser availability spike should select the concrete
library for each adapter; this architecture deliberately does not require all
languages to use the same parser.

### Conservative rules

- Constant construction in a constructor or deterministic helper may be
  expanded.
- A composite-template declaration links to its declarative template.
- Conditional alternatives may be represented as named variants when the
  branch condition is understandable.
- Loops over runtime data, model factories, callbacks, reflection, and
  unrecognised calls produce dynamic boundaries.
- Text or controls that only exist in runtime data are not fabricated.
- Custom drawing surfaces remain boundaries until a documented generic
  renderer exists.

### Calculator result

A Vala adapter can discover, without knowing the application name, that
`MathButtons` subclasses `Adw.Bin`, constructs a `Gtk.Stack`, installs that
stack as its child, and lazily inserts several panel classes. Those panel
classes refer to declarative button templates already present in the source
bundle.

The source graph can therefore represent the panels as stack variants. The
default visible variant may come from an explicit source property or a runtime
profile. If neither establishes the state, the editor should ask the user to
select a preview variant rather than silently choosing one.

## Optional native GTK probe

Static analysis cannot reliably determine allocations, runtime visibility, or
data-dependent branches. Extend the isolated Broadway workflow with a small,
generic same-process GTK probe. The probe protocol should record:

- runtime GType name;
- `GtkBuildable` ID, when present;
- parent and child order;
- mapped and visible state;
- expand, alignment, margins, and size requests;
- CSS classes useful for generic styling;
- bounds in top-level-window coordinates;
- active stack/page identity where observable.

GTK exposes the Builder ID through `gtk_buildable_get_buildable_id()`:

[https://docs.gtk.org/gtk4/method.Buildable.get_buildable_id.html](https://docs.gtk.org/gtk4/method.Buildable.get_buildable_id.html)

It exposes bounds relative to a target widget through
`gtk_widget_compute_bounds()`:

[https://docs.gtk.org/gtk4/method.Widget.compute_bounds.html](https://docs.gtk.org/gtk4/method.Widget.compute_bounds.html)

The first implementation should be a small read-only library loaded into the
isolated native process and triggered after a top-level window has reached a
stable mapped frame. The precise injection hook requires a focused spike; the
output protocol and matching rules should not depend on that hook.

Match runtime nodes to source nodes in this order:

1. exact `GtkBuildable` ID plus compatible class;
2. exact ID with a recorded derived/base-class relationship;
3. compatible class, matched parent, and stable sibling order;
4. no match, with an explicit diagnostic.

Never match by screenshot position alone. A successful match may add geometry
and active-state evidence; it may not invent source semantics.

For Calculator, `_buttons` should match exactly through its Builder ID, giving
the unresolved mask the native button-region allocation even before its
contents are statically expanded.

## Project importer and browser boundary

The full source-project workflow needs host capabilities that a static GitHub
Pages application does not have: walking a checkout, invoking the pinned
Blueprint compiler, reading build metadata, parsing several programming
languages, and optionally running an isolated application.

Add a lightweight `protota-import` command or Flatpak helper that:

1. accepts a source root and declarative entry point;
2. discovers relevant `.blp`, `.ui`, and selected source files through build
   metadata and template references;
3. builds the source graph and report;
4. optionally validates with the project's Blueprint compiler;
5. optionally consumes a runtime probe profile;
6. opens or packages the result for the browser editor.

The package is a generated compiler artifact containing the original source
and provenance, not a hand-authored JSON replacement for the official UI.
Official source remains the conformance input.

Single-file `.blp` and `.ui` imports can continue in the browser using the
same lossless declarative parser core, without static or runtime enrichment.

## Editing and export

Single-file export is not enough for an expanded multi-file template bundle.
Project export must produce a set of changed source files or a reviewable
patch.

Rules:

- Preserve a custom template reference as `$MathButtons _buttons`, including
  editable instance properties.
- Apply edits inside an expanded template to its definition file unless the
  user explicitly detaches the instance.
- Preserve unsupported opaque values when surrounding supported properties
  are edited.
- Use a normalized Blueprint printer for changed syntax nodes; copy untouched
  source slices when safe.
- Validate generated Blueprint with the same compiler version recorded at
  import when the host helper is available.
- Refuse an export that would replace an unresolved class with
  `Protota.CustomWidget` or another non-source class.
- Report all touched files before download or write-back.

The browser should continue downloading by default. Directly writing into a
checkout is a separate host-helper operation and must be explicit.

## Editor experience

The designer should make uncertainty visible without making the canvas
unusable:

- unresolved boundaries remain striped and labelled with their actual source
  class and ID;
- selecting a boundary opens its import-report entry, source location,
  resolution reason, and geometry evidence;
- a project-level panel lists resolved, expanded, unsupported, and dynamic
  counts;
- extracted variants appear as preview states, not separate invented widgets;
- nodes backed by opaque expressions show those properties as read-only;
- a source jump opens the original file/span when a host integration exists;
- the canvas exposes the exact rectangle used by unresolved-coverage metrics.

Renderer selection badges and editor chrome must remain outside capture
surfaces, as they are today.

## Verification contract

### Parser and source graph

- Add a hermetic fixture covering object-valued properties, bindings, arrays,
  short-form unsupported classes, layout blocks, and following siblings.
- With `OFFICIAL_SOURCE_ROOT`, assert that Calculator `_buttons` exists with
  source class `MathButtons`, ID `_buttons`, correct parent, correct order, and
  a report entry.
- Assert that `DropDown` nodes are either generically supported or explicit
  unsupported boundaries; they may not disappear.
- Assert that every parsed visual source child has exactly one projected node.
- Add equivalent GtkBuilder tests for templates, child roles, nested object
  properties, bindings, and non-visual objects.

### Round trip

- Import and export unresolved template references without changing their
  class or instance ID.
- Edit a property in an expanded template and assert that the defining source
  file changes rather than the entry file being flattened.
- Preserve opaque expressions through unrelated edits.
- Reparse normalized output and compare source-graph semantics.

### Layout

- Add unit fixtures for expand, alignment, margins, homogeneous boxes/grids,
  stack selection, and size requests.
- Assert a boundary's DOM rectangle, not merely its existence.
- Continue measuring unresolved coverage from the allocated DOM rectangle.

### Static extractors

- Test adapters with small real-language fixtures and expected construction
  facts.
- Test conditional and unrecognised code paths as explicit dynamic
  boundaries.
- Do not use full application names in extractor fixtures or implementation.

### Runtime probe

- Test exact Builder-ID matching and unmatched-node reporting.
- Confirm coordinates are relative to the captured native window.
- Record toolkit, application revision, scale factor, and probe version with
  every profile.

### Broadway metrics

Retain `inputKind`, native and rendered geometry, unresolved coverage,
source-resolved similarity, foreground IoU, and attainable raw ceiling. A
boundary is never counted as a rendered implementation.

Each unresolved boundary in the DOM carries its geometry evidence (#55):
`data-protota-geometry` is the JSON list of applied facts, each with the
effect (`min-width`, `vexpand`, `allocation`…), the value, an origin naming
the layer and source property that produced it (`source:width-request`,
`code:vexpand`, `container:GtkBox.homogeneous`, `fallback:renderer-minimum`),
and a confidence (`declared` > `code` > `derived` > `fallback`).
`data-protota-geometry-confidence` is the weakest confidence among them. The
comparison artifact copies these per-boundary facts into
`comparison-<app>.json` under `unresolvedWidgets`, so every masked rectangle
is auditable back to the source fact that granted it its region. Visual captures
remain a regression oracle rather than an input to semantic import.

## Delivery plan

### Phase 1: stop structural loss

- Introduce source spans, source class/ID, resolution, and import diagnostics.
- Replace the Blueprint cursor parser and GtkBuilder regex parser.
- Retain `_buttons` and every unsupported short-form object.
- Add the required Calculator and adversarial parser tests.

Exit condition: every declarative visual child is supported, expanded, or an
auditable allocated boundary.

### Phase 2: layout-correct boundaries

- Implement the generic layout properties listed above.
- Include provenance and geometry evidence in the unresolved DOM marker and
  comparison artifact.
- Calibrate Calculator coverage with the full `MathButtons` allocation.

Exit condition: unresolved coverage describes the region GTK assigns to the
unknown widget rather than a placeholder's arbitrary minimum.

### Phase 3: project round trip

- Add the host-side project importer and compiler validation.
- Preserve the source graph beside the editable projection.
- Export changed Blueprint files or a patch without flattening unrelated
  templates.

Exit condition: a source-bundle edit can be rebuilt by the official app
without replacing custom classes.

### Phase 4: Vala enrichment

- Implement the common construction-fact adapter.
- Discover `MathButtons` container/stack/panel relationships.
- Resolve declarative panel templates as preview variants.

Exit condition: Calculator's basic keypad is rendered from its official
declarative button template, selected through source or runtime evidence, with
no Calculator-specific branch.

### Phase 5: runtime profile

- Add the isolated GTK probe and stable source/runtime matching.
- Use it for geometry and active-state enrichment in Broadway artifacts.

Delivered (#58): `containers/broadway/probe.c` is a read-only LD_PRELOAD shim
armed only by a mounted `/probe` volume; `src/utils/runtimeProfile.ts` joins
its dump to the source graph by buildable ID first, structural gtype ordinal
second, never pixels; the Broadway comparison artifact carries the join as a
`runtimeProfile` block and per-boundary `native:*` facts at the new top
`native` confidence tier. Usage, schema, and matching rules:
`docs/runtime-probe.md`.

Exit condition: exact-ID custom boundaries such as `_buttons` carry auditable
native allocation evidence.

### Phase 6: broaden conformance

- Add generic widgets and language adapters in response to the GNOME source
  catalogue.
- Promote recurring classes and layout behavior into the widget registry.
- Tighten unresolved-coverage gates as boundaries become supported.

## Alternatives considered

### Render a generic box for every unknown class

Rejected because it hides unsupported semantics and creates visually
plausible but false output. A labelled boundary is honest; a claimed generic
widget is not.

### Infer missing widgets from Broadway screenshots

Rejected because pixels do not establish widget class, hierarchy, labels,
actions, or source ownership. Screenshots remain comparison inputs only.

### Run the application and import only the runtime widget tree

Rejected as the primary path because it loses source expressions, inactive
variants, template ownership, and edit/export locations. Runtime inspection
is an optional enrichment profile.

### Build a complete Vala/C/Rust/GJS semantic evaluator first

Rejected because it delays the essential guarantee that declarative children
never vanish. Full program behavior is not statically recoverable in general.

### Use only Blueprint compiler XML

Rejected as the sole representation because it is host-only, depends on
typelibs, and is too low-level for source-preserving multi-file editing. It is
valuable as the authoritative validator and a semantic cross-check.

### Add application-specific extractors or renderer branches

Rejected by the product contract. All discovery operates on language syntax,
GObject/GTK class relationships, construction calls, widget properties,
slots, and layout semantics.

## Near-term implementation checklist

The first change set should remain deliberately small:

1. Add a failing official Calculator assertion for `_buttons`.
2. Add a minimal fixture showing that an object-valued property followed by a
   sibling cannot corrupt nesting.
3. Add a fixture for an unknown short-form class.
4. Introduce the diagnostic and source-identity fields required for a custom
   boundary.
5. Replace only enough parser infrastructure to make those invariants true,
   without attempting to draw the keypad.
6. Add `vexpand` projection so the retained boundary receives its parent
   allocation.
7. Run `npm run build` and `npm run test:unit` locally; reserve native
   Broadway/Playwright validation for `himachal`.

This sequence creates a trustworthy foundation. Each later extractor or
renderer feature can improve a visible boundary without changing the meaning
of already imported source.
