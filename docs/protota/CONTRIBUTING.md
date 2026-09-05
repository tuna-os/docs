---
sidebar_position: 2
title: "Contributing"
---

Thanks for helping with **Protota** — the GNOME HIG-compliant mockup tool for
Adwaita app UIs. Protota renders GTK4/Libadwaita from a typed widget tree using
real [`@gjsify/adwaita-web`](https://github.com/gjsify/gjsify/tree/main/packages/web/adwaita-web) components,
so mockups look *and behave* like real Adwaita.

## Before you start

- **[CONTEXT.md](https://github.com/tuna-os/protota/blob/main/CONTEXT.md)** — the document of decisions: vision, tech
  foundation (pure browser webapp, no GJS/Node runtime), and the
  `MockupDocument` model.
- **[AGENTS.md](https://github.com/tuna-os/protota/blob/main/AGENTS.md)** — how to work with Protota projects as an agent:
  document format, editing surfaces, and the renderer contract.
- **[docs/components.md](https://github.com/tuna-os/protota/blob/main/docs/components.md)** — every component Protota can
  build with: the GTK class it exports as, named slots, editable properties,
  and legal children. Generated from the code, so it cannot drift.

## Project layout

| Path | What lives here |
|---|---|
| `src/` | The app: widget tree, renderer, presets, Blueprint/GtkBuilder import/export |
| `presets-src/` | Preset source files |
| `docs/` | `components.md` (generated component catalog) and other docs |
| `tests/` | Vitest unit tests (Blueprint/renderer conformance) |
| `public/` | Static assets |
| `scripts/` | Build and maintenance scripts |

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

The renderer is **generic**: presets must not add app-specific rendering
branches. Blueprint and GtkBuilder imports preserve supported tree structure
and properties; unknown visual widgets must be reported explicitly so support
can be added deliberately — never silently dropped.

## Making a change

1. **Branch from `main`** — descriptive name, e.g.
   `git checkout -b fix/import-error` or `feat/preset-sidebar`.
2. **Keep commits focused** and sign them with DCO:
   `git commit -s` (each commit carries a `Signed-off-by` trailer).
3. **Run the checks** before pushing:

   ```sh
   npx tsc -b          # typecheck — its own CI step, see #211
   npm run lint        # oxlint
   npm run test:unit   # conformance tests
   npm run build       # production build must succeed
   npm test            # Playwright browser tests
   ```

   `npx tsc -b` is worth running first: `npm run build` is `tsc -b && vite
   build`, so it only typechecks what the build includes, while CI checks the
   test sources too.

4. **Open a PR** describing what changed and why; link any related issue.

### If you touch the renderer or presets

- Keep the renderer generic (see above).
- Re-generate `docs/components.md` if the component catalog changed.
- Add conformance coverage in `tests/` for any new widget or property.

### If you change docs

- User-facing behavior belongs in `docs/` and the README.
- The component catalog is generated — edit the source, not the generated
  file.

## Code of conduct

Be respectful and constructive — see
[CODE_OF_CONDUCT.md](https://github.com/tuna-os/protota/blob/main/CODE_OF_CONDUCT.md) (Contributor Covenant 2.1).

## Questions?

Open an issue. `CONTEXT.md` is the authoritative reference for design
decisions; `AGENTS.md` covers the document model and editing surfaces.
