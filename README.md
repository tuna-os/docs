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

The live site (tunaos.org) is served by the **`tunaos-org` Cloudflare Worker**.
`wrangler.jsonc` mounts this repo's `build/` directory as the Worker's static
assets and `worker/index.js` handles routing.

- **Production** — a push to `main` triggers Cloudflare Workers Builds, which
  runs the build and publishes the new assets. No manual `deploy` command is
  needed (and the Docusaurus GitHub Pages `yarn deploy` flow does not apply to
  this project).
- **Pull requests** — `.github/workflows/workers-build.yml` runs the same
  Docusaurus + Workers build so deploy failures surface on the PR before they
  reach production.
- **Content sync** — `.github/workflows/sync-org-docs.yml` runs daily
  (cron `0 6 * * *`) to regenerate the pages synced from the org's repos and
  opens a PR when content changed.

To preview the production build locally:

```bash
yarn build
```
