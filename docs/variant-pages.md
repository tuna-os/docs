---
sidebar_position: 11
title: Adding a variant page
description: How to add a TunaOS variant page to the documentation site.
---

# Adding a variant page

This guide is for a new TunaOS **variant**: a bootc image family such as
Albacore, Yellowfin, Bonito, or Marlin. A desktop flavor (GNOME, KDE, COSMIC,
Niri, and so on) is not a variant by itself; it is a tag on a variant image.

The goal is a useful page that a reader can use to choose an image, download
an ISO when one exists, and recover when something does not work. Copy an
existing page such as [`docs/albacore.md`](./albacore.md) as a starting point.

## Before you edit

Confirm the variant's public name, URL-safe ID, base distribution, supported
architectures, and published flavors in the
[`tuna-os/tunaOS` build configuration](https://github.com/tuna-os/tunaOS/blob/main/.github/build-config.yml).
The ID becomes the image repository and normally the docs filename, for
example `albacore` → `docs/albacore.md` and
`ghcr.io/tuna-os/albacore:<flavor>`.

Check whether the image factory has a visual landing page already. The
landing pages are React pages under `src/pages/<variant>.tsx`, driven by the
shared metadata in [`src/data/variants.ts`](https://github.com/tuna-os/docs/blob/main/src/data/variants.ts). A normal
reference page can be added independently; do not invent a landing page or
claim a flavor that the build configuration does not publish.

## Page skeleton

Create `docs/<variant>.md` with this shape:

```md
---
sidebar_position: <next position in the Variants reference list>
---

# <Name> (<base distribution>)

**Based on:** [the upstream base](https://example.org/)

<One paragraph explaining who should use this variant and its maturity.>

## Features

- <what makes this base useful>
- <important desktop, hardware, or lifecycle detail>

## Downloads

**Image:** `ghcr.io/tuna-os/<id>:<flavor>`

**ISOs:** [<id>-<flavor>-latest.iso](https://download.tunaos.org/live-isos/<id>-<flavor>-latest.iso)

## Installation

### Using Container Image

```bash
podman pull ghcr.io/tuna-os/<id>:<flavor>
```

### Building ISO with Just

```bash
git clone https://github.com/tuna-os/tunaOS.git
cd tunaOS
just build-iso <id>
```

## Troubleshooting

<variant-specific limitations, support links, and useful issue-report details>
```

Use one subsection per published flavor. Use the exact GHCR tag from the
build configuration. Only link an ISO when the corresponding artifact is
actually published; container-only flavors should show their image without a
made-up ISO URL. Mention `-hwe`, `-nvidia`, or other editions explicitly when
they are part of the variant's matrix.

## Add the page to navigation

There are two navigation surfaces:

1. Add the visual landing page to the `🐟 Variants` links in
   [`sidebars.ts`](https://github.com/tuna-os/docs/blob/main/sidebars.ts) if the variant has a `src/pages/<id>.tsx`
   landing page:

   ```ts
   {type: 'link', label: '<Name> — <base>', href: '/<id>'},
   ```

2. Add the Markdown reference doc to that category's `Reference docs` list:

   ```ts
   items: ['albacore', 'yellowfin', '<id>'],
   ```

If there is no custom landing page yet, add the reference doc to the sidebar
where readers can find it and do not add a link to a nonexistent `/<id>` route.
Keep `sidebar_position` unique among the reference pages.

For a full visual landing page, add the variant metadata to
[`src/data/variants.ts`](https://github.com/tuna-os/docs/blob/main/src/data/variants.ts) and follow the shape of an
existing `src/pages/<id>.tsx` page. Keep the `flavors`, platforms, and editions
there consistent with `tunaOS/.github/build-config.yml`.

## Downloads and screenshots

The download page reads `static/iso-index.json`. The
[`update-iso-index` workflow](https://github.com/tuna-os/docs/blob/main/.github/workflows/update-iso-index.yml)
periodically lists the live Cloudflare R2 bucket and regenerates that file;
the source objects are served from
[`download.tunaos.org`](https://download.tunaos.org/). Do not manually edit
the generated index. Verify a new ISO link against the live index or the
variant's build workflow before documenting it.

Desktop screenshots are generated from real image boots. The TunaOS repository
uses [`scripts/gen-screenshot-gallery.sh`](https://github.com/tuna-os/tunaOS/blob/main/scripts/gen-screenshot-gallery.sh)
to regenerate `docs/SCREENSHOTS.md` from `docs/images/`; the weekly screenshot
workflow also publishes captures under the R2 `screenshots/` path. Do not
hand-edit the generated gallery or check in placeholder screenshots. If a
new variant needs captures, update the screenshot workflow matrix in TunaOS
and let CI regenerate the gallery.

## PR checklist

Before opening the PR:

- [ ] The page is `docs/<id>.md` and has frontmatter with a unique
      `sidebar_position`.
- [ ] The sidebar contains the reference page, and its landing-page link only
      exists if `src/pages/<id>.tsx` exists.
- [ ] Every GHCR image tag matches the TunaOS build matrix.
- [ ] ISO links point to real `download.tunaos.org/live-isos/` artifacts;
      container-only flavors do not claim an ISO.
- [ ] The install and `just build-iso` commands use the correct variant ID.
- [ ] Limitations and support links are specific to this variant.
- [ ] No screenshot or generated index was edited by hand.
- [ ] `npm run typecheck` passes, and `npm run build` completes locally.
- [ ] Relative links resolve and the PR's link/404 checks pass.

Keep the PR focused: a new variant page should not silently rewrite unrelated
variant copy or generated files.
