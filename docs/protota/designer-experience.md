---
sidebar_position: 7
title: "designer experience"
---

Protota should feel as fluid as Figma, Penpot or Canva. It cannot copy their
model, and the difference is the whole design problem.

Those tools place objects at coordinates on an infinite canvas. GTK does not
have coordinates: a widget's position is decided by its parent's layout
(box order, grid attachment, named slot) and its own expand and alignment
properties. A designer that let you drag a button to an arbitrary point would
be lying — the app it exports could never reproduce that position. Everything
below is chosen so the direct-manipulation *feel* of a design tool sits on top
of a constraint model that stays buildable.

## The rule

**Every gesture must map to a change in the widget tree or a widget property.**
If a gesture cannot be expressed as one, it does not belong in the tool. Free
positioning, arbitrary rotation, absolute z-order and detached text boxes are
all in that category.

This is the same contract the renderer and importer already follow: never show
something the toolkit cannot produce.

## What to borrow, translated

### Direct manipulation → structural drag and drop
Dragging is how designers work, so keep it — but a drop resolves to *insert
into this parent, at this index, in this slot*. Drop targets are containers and
the gaps between their children, not free space. While dragging, highlight the
container that would receive the widget and show an insertion line where it
would land. A drop on an illegal parent is refused visibly rather than silently
reparented (`LEGAL_CHILDREN` already knows).

### Alignment tools → property editing
Figma's align buttons move objects. Ours set `halign`, `valign`, `hexpand` and
`vexpand` on the selection, because that is what alignment *is* in GTK. Six
buttons that read as "align left / centre / right / fill" and write real
properties give the same fluency without inventing geometry.

### Distribute and spacing → container properties
Even spacing between siblings is a box `spacing` value or a grid's
`row-spacing`/`column-spacing`, applied to the parent. Snapping should snap to
the Adwaita 6/12/18/24 scale the linter already enforces, so the tool teaches
the platform's rhythm rather than fighting it.

### Multi-select → same-parent operations
Rubber-band selection is worth having, but a multi-selection spanning different
parents cannot be moved coherently in a constraint layout. Restrict structural
operations to siblings; allow property edits across any selection, since setting
`halign` on ten widgets in five containers is meaningful.

### Components → widget subtrees
Figma components map cleanly: a saved subtree, insertable anywhere it is legal.
Instances that track their source are the harder, more valuable version, and
they correspond to what GTK does with composite templates — which means an
instance could eventually export as a real template rather than a copy.

### Frames and artboards → screens
Already present. A screen is a window with a size, and flow edges connect
screens. Resizing a screen is resizing a window, which is honest.

### Prototyping → flows
Already present as edges. The natural extension is making an edge navigable in
the interactive preview, so clicking the button that owns the edge moves to the
target screen — a real prototype rather than a diagram.

## What a designer needs that Figma does not have

- **Legality feedback while editing.** The palette is already context-sensitive;
  drag and drop should be too. Refusing an impossible layout early is more
  useful than an undo.
- **HIG guidance as advice.** The linter exists. It should annotate rather than
  block, the way a spell-checker does.
- **The export as a first-class view.** A designer for a real toolkit should let
  you see the Blueprint it will produce, and tell you whether it compiles.
  `scripts/export-blueprint.mjs` and the compiler loop already answer that; the
  editor should surface it.
- **Real widget behaviour.** The renderer uses actual Adwaita components, so a
  switch switches and a stack shows one page. Preserve that: fidelity of
  behaviour is a feature no generic design tool can offer here.

## Sequencing

Ordered by how much each unlocks, and tracked in #79 unless noted:

1. **Structural drag and drop** with container highlighting and insertion lines.
   The single largest gap between this and a tool people reach for by habit.
2. **Copy, cut, paste and duplicate of subtrees**, across screens. Small, and
   immediately useful for anyone laying out repeated rows.
3. **Alignment and expand controls** in the inspector, applied across a
   selection.
4. **Multi-select** with rubber band, restricted to siblings for structural
   operations.
5. **Component library** of saved subtrees (#21 covers the storage side).
6. **Navigable flows** in interactive preview, turning edges into a prototype.
7. **Snapping** to the Adwaita spacing scale during drag.

Each is independent, and each must satisfy the rule above: it changes the tree
or a property, or it does not ship.
