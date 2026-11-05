---
sidebar_position: 4
title: "Site architecture"
description: "How the tunaos.org docs site is built, served, and deployed."
---

This page explains how the TunaOS website (tunaos.org) works. It covers the
parts, how data moves through them, how a change reaches the live site, and how
to find common problems.

This page is for people who operate or maintain the docs site. It is not about
the TunaOS operating system images. That topic is in
[Architecture](architecture).

The site is five parts.

## Components

### Docusaurus

The site uses Docusaurus, which is a static site generator. Docusaurus reads
Markdown and MDX files in `docs/` and `blog/`. It writes one folder of plain
HTML, CSS and JS to `build/`. Every page is MDX. The build reads no project
config at runtime.

Docusaurus also builds the local search index at build time. The site uses the
`@easyops-cn/docusaurus-search-local` plugin. It stores a hashed index inside
the built site. The site sends no data to Algolia or any other search service.

The site config lives in `docusaurus.config.ts`. It sets the site URL to
`https://tunaos.org` and the base path to `/`. The sidebar list lives in
`sidebars.ts`.

### The Cloudflare Worker

The live site runs on a Cloudflare Worker named `tunaos-org`. Wrangler reads
`wrangler.jsonc`. The Worker `main` file is `worker/index.js`. Wrangler mounts
the `build/` folder as the Worker static assets, under the `ASSETS` service
binding.

The Worker decides the path of each request before the static assets run. It
runs the Worker first for two routes, listed as `run_worker_first` in
`wrangler.jsonc`:

- `/api/adoption` — the adoption metrics proxy (see below).
- `/api/build-health` — the build health endpoint.

Every other request goes straight to the static assets. The Worker never
rewrites the HTML that Docusaurus builds.

### The adoption metrics proxy

The `/metrics` page reads a public JSON feed at `/api/adoption`. The Worker
serves that route. The Worker does not hold the data itself. It fetches a
collector endpoint and returns the result.

The collector is a separate Worker named `tunaos-countme`, in the same
Cloudflare account. The site reaches it through the `COUNTME` service binding
in `wrangler.jsonc`. The site can point at another endpoint. The Worker
variable `ADOPTION_METRICS_URL` sets the collector URL. The default value is
`https://countme.tunaos.org/v1/metrics`.

The proxy copies no visitor data. It sends no cookies, headers or query strings
to the collector. It sets `Accept: application/json` and `redirect: manual`. It
stops after eight seconds. It validates the response against a known schema
before it returns JSON.

It caches good responses for five minutes in the browser and fifteen minutes at
the edge. Bad or missing data returns HTTP 503 with no cache. The proxy never
inserts sample data.

### The content sync

This repo does not write most of `docs/`. A daily job reads README files from
active repos in the `tuna-os` GitHub org and writes them to `docs/<slug>/`. The
job is [`sync-org-docs.yml`](/.github/workflows/sync-org-docs.yml). It runs at
`0 6 * * *` (06:00 UTC) and opens a pull request when anything changed.

The job reads each repo, sanitises the Markdown, rewrites links, and writes one
page per file. The repo README becomes `index.md`. Other root doc files and the
repo `docs/` folder become more pages. New repos with a README join
automatically. This repo needs no per-repo config.

Some `docs/<slug>/` trees are hand-written here. The sync script lists these pages
under `HAND_AUTHORED`. The sync ignores them. This repo owns them.

Edit these pages here. Pages in every other `docs/<slug>/` tree belong to the
source repo. Edit those pages there. The next sync overwrites a direct edit to
a synced page.

### The Flatpak remote

This repo also serves the TunaOS Flatpak remote at
`https://tunaos.org/flatpak/`. The remote is an OCI registry. The repo ships
the files that make it work:

- `static/flatpak/index/static` — the index. One entry per app.
- `static/flatpak/tuna-os.flatpakrepo` — the remote metadata. A client runs
  `flatpak remote-add` against this file.
- `static/flatpak/icons/` — app icons the stores can show.

The index is built in another repo, `tuna-os/flatpak-index`. This repo only
publishes it. The build script `.github/scripts/update-index.py` is a vendored
copy of that repo's script. The two have drifted before, and nothing checks
that they agree.

`static/flatpak/` is built in two steps. `update-index.py` writes the index
from OCI app bundles. `scripts/prepare-flatpak-icons.mjs` extracts PNG icons
from the app metadata and writes them into `static/flatpak/icons/`.
The build runs `prepare-flatpak-icons.mjs` before Docusaurus builds. A client
installs an app with `flatpak remote-add tuna-os https://tunaos.org/flatpak/`.

## Data flow

This section shows how data moves through the parts.

### Content

Org content enters through a single path. A daily sync job reads each source
repo and writes pages into `docs/<slug>/`. A merge of the sync pull request moves
those pages into `main`. Hand-written pages enter when a contributor edits them
here and opens a pull request. Either way, all pages then reach `main`.

### Build

A build starts from `main`. It runs `npm ci` to install dependencies. It runs
`npm run build`. Docusaurus reads every page and writes `build/`. The build also
runs two prep steps.

It extracts Flatpak icons. It compiles the Adwaita web assets. The result is one
folder of static files.

### Request

A visitor opens the site. Cloudflare serves the request from the Worker. The
Worker checks the path. A `/api/*` path runs the Worker logic.

A `/metrics` request serves the HTML page. That page then asks for `/api/adoption`.
The Worker fetches the collector and returns the numbers. Every other path serves a
static file from `build/`.

## Deployment

A push to `main` is a deployment. This is a live production site, not a draft.

### Pull requests

A pull request runs
[`workers-build.yml`](/.github/workflows/workers-build.yml). It runs the same
build the live site uses: typecheck, site build, metrics and accessibility
checks, and a Wrangler dry-run deploy. Cloudflare reports only an opaque build
id on a pull request, so this job makes a deploy failure visible in GitHub
Actions. A deploy failure shows here before the change reaches production. This
job is the only gate between a merge and the live site.

### Production

A merge to `main` triggers Cloudflare Workers Builds. Workers Builds runs the
build and publishes the new `build/` assets to the Worker. The change is live
after one deploy.

The Flatpak remote deploys on its own path.
[`deploy-flatpak.yml`](/.github/workflows/deploy-flatpak.yml) runs on any push
that touches `static/flatpak/**`. It builds the site and runs `wrangler deploy`
with the Cloudflare token. The site and the remote can deploy separately.

### The collector

The adoption metrics collector is a separate Worker. It has its own database
migrations and publication schedule. Deploy it before the site. The dashboard
shows no data until the collector runs and publishes.

## Debugging

This section covers the common failures.

### The local build

Run `npm ci` then `just start` to see changes locally. The site reloads when
you save a file. Run `just build` to make the production site in `build/`. Run
`just preflight` before a pull request. It type-checks the site, runs the
linters, checks the prose budget, checks documented install commands, and runs
the tests.

### The lint gates

`lint.yml` runs four jobs:

| Job | Checks |
| --- | --- |
| `markdown-lint` | Markdown style, against `.markdownlint-budget` |
| `ste` | Simplified Technical English, against `.ste-budget` |
| `js-syntax` | Node syntax for every script, plus the unit tests and the install-command check |
| `link-check` | Broken internal Markdown links |

The two budgets are ratchets. A gate that fails on the first run gets disabled
on the second run. The number only goes down. Lower the budget when a cleanup
lands.

Never raise it to make a pull request pass. The `ste` linter runs in a shared
action from `tuna-os/.github`. This repo keeps only the budget file.

Blog posts count toward the prose budget. A blog-only pull request can push the
total over the budget. `blog/**` is in the path filter for the job so a
blog-only change still triggers the check.

### The metrics proxy

If `/api/adoption` returns HTTP 503 while the collector is healthy, check the
Worker fetch options. A failure on 2026-09-27 returned
`TypeError: Invalid redirect value` for `redirect: "error"`. Use
`redirect: manual` and reject redirect responses. Node fetch accepts `"error"`,
but native workerd does not. The cross-repository integration test runs the site
proxy in native workerd to catch this.

The public category allowlist in `src/data/adoption-categories.json` comes from
`services/countme/src/allowlist.json` in `tuna-os/tunaos`. When supported images
change, regenerate it with `node scripts/sync-adoption-categories.mjs`. The
proxy rejects new categories until you update this file.

### The sync

The next sync undoes an edit under `docs/<slug>/`. That page belongs to a source
repo. Edit the source repo instead. A hand-written page in a `HAND_AUTHORED`
tree is safe to edit here.

If the sync opens a pull request that looks wrong, the sync script may stop
early. It retries once. It checks the count against the number of public repos
in the org. A listing that stops at 30 repos is the known signature of a
pagination bug.

### The Flatpak remote

A correct index in `tuna-os/flatpak-index` can still be stale in production.
The index is built there and published here. A deploy of `static/flatpak/**` is
the second half of a two-repo publish. The sanity check
`.github/scripts/check-flatpak-remote.py` and the smoke test
`.github/scripts/flatpak-smoke-test.py` read `static/flatpak/expected-apps.json`
to test the live remote.
