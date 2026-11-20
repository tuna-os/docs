---
sidebar_position: 1
sidebar_label: "protota"
title: "protota"
hide_title: true

status: unknown
---

A mockup tool for Adwaita app UIs that obeys the GNOME HIG.

Uses real [`@gjsify/adwaita-web`](https://github.com/gjsify/gjsify/tree/main/packages/web/adwaita-web) web components so mockups look **and behave** like real Adwaita — not pixel replicas.

**Live:** https://tuna-os.github.io/protota/

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Development

```bash
npm install
npm run dev        # Vite dev server
npx tsc -b         # TypeScript typecheck — CI runs this on every PR
npm run lint       # oxlint
npm run build      # Production build → dist/
npm run test:unit  # Blueprint/renderer conformance tests
npm test           # Playwright tests
```

`just check` runs lint, unit tests, and build together.

## Rendering and conformance

Protota renders GTK4/Libadwaita from a typed widget tree. The renderer is
generic: presets must not add branches for one app. An import of Blueprint or
GtkBuilder keeps the tree structure and the properties that Protota supports.
The import reports unknown visual widgets, so that a contributor can add
support for them on purpose.

### Editing an app UI file

Import a work-in-progress `.blp` (Blueprint) or `.ui` (GtkBuilder) file using
**File → Import**. Protota turns it into an editable `MockupDocument`. When you
finish your changes, use **File → Export Blueprint**. Then replace the related
UI file in your checkout and build the app again. The browser downloads the
result on purpose; it does not write into a local source tree. An import of an
unsupported GTK/Libadwaita widget fails with an error, so the output UI is
never a plausible-but-wrong substitute.

### Building presets and flows

**[docs/components.md](https://github.com/tuna-os/protota/blob/main/docs/components.md)** lists every component Protota can
build with — the GTK class it exports as, its named slots, editable properties,
and legal children. A script makes it from the code, so it cannot drift.
To regenerate it after you change component definitions, run
`npx tsx scripts/generate-component-reference.mjs`. The script imports `.ts`
sources, so plain `node` fails with `ERR_MODULE_NOT_FOUND`; `npx tsx` is required.

A script makes each preset from the official app source. A person then
completes it with override files that others can review. See
**[docs/preset-workflow.md](https://github.com/tuna-os/protota/blob/main/docs/preset-workflow.md)**
for the full toolchain (`scripts/import-gnome-app.mjs`,
`scripts/capture-preset.mjs`, `presets-src/*.finishing.json`) and for the
`MockupBuilder` agent API that exposes the same capabilities (source import,
multi-screen flows, override files) programmatically.

The `tests/fixtures/gnome-app-catalog.json` catalog connects a GNOME app,
its source (repository + pinned tag), its preset, and a canonical viewport. The manual **Broadway
Reference Capture** GitHub workflow runs the native app under GTK Broadway
and uploads its capture alongside the matching Protota preset. This provides
an external visual oracle while the structural tests keep the renderer honest.
Each run also creates a pixel-diff image and JSON metric. It reports the
metric when you tune a baseline. If you supply a maximum difference ratio, the
same comparison becomes a CI gate for a calibrated preset.

To list the suite that you can run now on your computer, use
`node scripts/broadway-app.mjs --list`. To add an app, add its catalogue entry
and its preset together. The conformance test rejects an untracked preset. It
also rejects an incomplete native-reference target. Core and Circle use the same catalogue fields and
renderer path.

See [visual conformance of GNOME apps](https://github.com/tuna-os/protota/blob/main/docs/gnome-app-conformance.md) for the
current validation state. "Passed" always means that a person looked at the
paired screenshots and their diff, not only that a capture command exited.
See [the source-import loop for GNOME Core](https://github.com/tuna-os/protota/blob/main/docs/gnome-source-import.md) for the
official-source UI inputs and explicit custom-widget boundaries.
See [GNOME GUI Specification & Audits](https://github.com/tuna-os/protota/blob/main/docs/spec/README.md) for UI layout
patterns, intent mappings, and per-app source audits — a vendored read-only
snapshot of [gnome-gui-spec](https://github.com/tuna-os/suite-common), not a
build input.

## Pull requests

Do not stop a required check; let it complete. If the repository has no merge
queue and a maintainer explicitly authorizes a protected-branch merge, use the
merge path that maintainers approve. See [AGENTS.md](https://github.com/tuna-os/protota/blob/main/AGENTS.md) for
the exact procedure and resource-use guidance.

## License

Apache-2.0 — see [LICENSE](https://github.com/tuna-os/protota/blob/main/LICENSE).
