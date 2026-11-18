---
title: "Site architecture and deployment"
description: "How tunaos.org is built, served, and deployed."
---

# Site architecture and deployment

This page explains how the TunaOS website at [tunaos.org](https://tunaos.org) is built,
served, and deployed. For the OS image pipeline, see [Architecture](architecture.md).

## Parts

| Part | Where it lives | Job |
| --- | --- | --- |
| Static site | Docusaurus, built to `build/` | Pages, blog, and docs |
| Worker | `worker/index.js`, `wrangler.jsonc` | Serves `build/` and two API routes |
| Adoption proxy | `/api/adoption` in the Worker | Passes validated metrics from the `tunaos-countme` Worker |
| Build health | `/api/build-health`, `worker/build-health.mjs` | Reports image build status |
| Content sync | `.github/workflows/sync-org-docs.yml` | Copies docs from other org repositories |
| Flatpak remote | `static/flatpak/` | Serves the Flatpak index |

## Request flow

The `tunaos-org` Cloudflare Worker serves the site. `wrangler.jsonc` sets
`build/` as the static asset directory.

Only `/api/adoption` and `/api/build-health` run the Worker code first. The
Worker sends every other request to the static assets.

To get metrics, the proxy for adoption data calls the `tunaos-countme`
Worker through the `COUNTME` service binding. It checks the response and
caches it. If the upstream fails, it returns HTTP 503. For log fields and privacy rules, see
`TELEMETRY.md` in the repository root.

## Content ownership

Most pages in `docs/<repository-name>/` come from other repositories in the
org. Each day, the `sync-org-docs` workflow copies them here. When they
change, it opens a pull request. Do not edit them here. Edit the source
repository instead.

Hand-written pages are at the top level of `docs/` and in `blog/`. Add each
new page to `sidebars.ts`.

## Deployment

- **Production:** a push to `main` starts Cloudflare Workers Builds. It builds
  the site and publishes the Worker.
- **Pull requests:** the `workers-build.yml` workflow runs `npm ci`, the type
  check, `npm run build`, the browser checks, and `wrangler deploy --dry-run`.
  A deploy failure shows on the pull request before it reaches production.
- **Flatpak index:** `deploy-flatpak.yml` runs `wrangler deploy` when a push to
  `main` changes `static/flatpak/**`. It also runs on manual dispatch. It needs
  the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

Deploy the `tunaos-countme` collector before the site. Its source is in
`tuna-os/tunaos`, in `services/countme`.

## Build and test locally

```bash
npm ci
just start       # development server with hot reload
just build       # production site in build/
just preflight   # typecheck, lint, tests, and checks
```

## Debug a failure

1. If `/api/adoption` returns 503, read the Worker logs. The `reason` field
   names the failed step.
2. If a deploy fails on a pull request, open the `Build tunaos-org` job.
3. If a synced page is wrong, fix the source repository. The next sync
   replaces local edits.
4. If the Flatpak index is stale in production, check that the change
   reached `static/flatpak/` in this repository.
