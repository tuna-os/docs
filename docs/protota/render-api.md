---
sidebar_position: 14
title: "render api"
---

Protota is statically hosted (GitHub Pages, `https://tuna-os.github.io/protota/`).
There is **no server-side PNG endpoint**: the app renders in the browser, so a
plain `curl` of any URL returns the HTML shell, never an image. To obtain a
screenshot an agent must drive a headless browser (Playwright, Puppeteer, CDP)
and screenshot the rendered page itself.

Two surfaces exist, both validated loudly — a bad parameter produces visible
error text or a rejected promise, never a silently-wrong frame.

## 1. URL render mode

Adding `?render=1` to the app URL swaps the editor for a chromeless view: no
top bar, panels, bottom bar, or canvas ever mount. One screen renders at 1:1
zoom inside `#protota-render-root`, anchored at the page origin `(0, 0)` on a
transparent background.

```
https://tuna-os.github.io/protota/?render=1&preset=files&width=500&height=440&theme=dark
```

### Parameters

| Param    | Values                              | Default                    | Meaning |
|----------|-------------------------------------|----------------------------|---------|
| `render` | `1` or `true`                       | — (required)               | Activates render mode. Anything else loads the editor. |
| `preset` | preset id, e.g. `files`, `settings` | the visitor's persisted document | Loads a public preset: gallery source imports (live Blueprint/GtkBuilder import) or any `public/presets/<id>.mockup.json`. Loaded in-memory only — the visitor's saved document is never overwritten. |
| `screen` | screen id, exact title, or zero-based index | first screen       | Selects the screen to render. |
| `width`  | integer 100–10000                   | the screen's own width     | Screen-width override for this render only. |
| `height` | integer 100–10000                   | the screen's own height    | Screen-height override for this render only. |
| `theme`  | `light` \| `dark`                   | the document's color scheme | Forces the color scheme. |

`width`/`height` are the "states" lever: **Adw.Breakpoints evaluate against
the effective dimensions** (`src/utils/breakpoints.ts`), so a screen renders
in exactly the adaptive state it would have at that size — e.g. GNOME
Settings' navigation split view collapses its sidebar below its
`max-width: 550sp` breakpoint.

### Readiness contract

Rendering settles asynchronously (webfonts, icon CSS, custom-element
upgrades, preset fetch). Wait for the flag before screenshotting:

- `html[data-protota-ready="true"]` — the frame is settled. The same flag the
  editor publishes; render mode re-publishes it after its own content paints.
- On failure (unknown preset/screen, invalid param) the ready flag still
  fires and `#protota-render-root [data-protota-render-error]` contains
  visible error text. Check for it — do not screenshot blindly.

### Agent recipe (Playwright)

```ts
const page = await browser.newPage();
await page.goto('https://tuna-os.github.io/protota/?render=1&preset=settings&width=480&height=600&theme=dark');
await page.waitForSelector('html[data-protota-ready="true"]');
if (await page.locator('[data-protota-render-error]').count()) throw new Error(await page.locator('[data-protota-render-error]').innerText());
await page.locator('#protota-render-root').screenshot({ path: 'settings-narrow-dark.png' });
```

`page.screenshot()` of the element is the intended capture path — it is
pixel-faithful (real browser rasterisation, no html2canvas approximation).

## 2. Programmatic API — `protota.renderScreenshot(options)`

The live agent handle (`window.protota`, see `src/utils/agent-api.ts`) can
capture a PNG of any screen of the **live document** without disturbing the
editor — zoom, pan, selection, undo history, and persistence are untouched.
The screen renders into a hidden offscreen container through the same
renderer + breakpoint-override path the canvas uses, html2canvas rasterises
it, and the container is removed.

```ts
const blob = await protota.renderScreenshot({
  screenId: 'Settings',   // id or exact title; default: selected screen, else first
  width: 480,             // integer 100–10000; default: the screen's own size
  height: 600,
  theme: 'dark',          // 'light' | 'dark'; default: the document's scheme
  scale: 1,               // rasterisation scale (0–4]; default 1 → PNG pixels == CSS pixels
}); // Promise<Blob> (image/png)
```

Invalid arguments reject with an actionable `Error` (unknown screens list the
known ones). At `scale: 1` the blob decodes to exactly `width` x `height`
pixels.

### Fidelity limits (honest)

`renderScreenshot` uses [html2canvas], which re-draws the DOM onto a canvas
and does not support everything a real browser paints:

- **CSS `mask-image` is unsupported** — Protota draws symbolic icons via CSS
  masks, so icons can appear as solid boxes or go missing in captures.
- Box shadows, blend modes, and some gradients are approximate.

For pixel-faithful output, use the URL render mode with a real browser
screenshot instead; `renderScreenshot` is for quick in-page feedback loops
(an agent checking layout/breakpoint state it just built).

[html2canvas]: https://html2canvas.hertzen.com/features

## No server-side rendering — plainly

`curl https://tuna-os.github.io/protota/?render=1&preset=files` returns the
HTML shell only. Static hosting has no image endpoint and never will without
a rendering service; a headless browser is required. Local equivalent:
`npm run dev` and point the browser at
`http://localhost:5173/protota/?render=1&…`.
