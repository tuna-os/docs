# Website

This website uses [Docusaurus](https://docusaurus.io/), a modern generator
of static websites.

## Installation

```bash
yarn
```

All standard tasks (`install`, `build`, `test`, `lint`) are also available
via [`just`](https://github.com/casey/just) — see `just --list`.

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. The server shows most changes immediately. You do not have to start it again.

## Build

```bash
yarn build
```

This command writes the static content to the `build` directory. Any service
for static content can then serve it.

## Deployment

The **`tunaos-org` Cloudflare Worker** serves the live site (tunaos.org).
`wrangler.jsonc` mounts this repo's `build/` directory as the Worker's
static assets, and `worker/index.js` routes requests.

- **Production** — a push to `main` triggers Cloudflare Workers Builds,
  which runs the build and publishes the new assets.
- **Pull requests** — `.github/workflows/workers-build.yml` runs the same
  Docusaurus and Workers build. A deploy failure then appears on the PR
  before it reaches production.
- **Content sync** — `.github/workflows/sync-org-docs.yml` runs daily
  (cron `0 6 * * *`) and opens a PR when org-synced content changes.

To preview the production build locally:

```bash
yarn build
```
