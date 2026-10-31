# Website

This website uses [Docusaurus](https://docusaurus.io/), a modern generator
of static websites.

<!-- hive-contribute-plea: donated-compute appeal, keep in sync across repos -->
## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Installation

```bash
npm ci
```

Dependency version changes must update `package.json` and `package-lock.json`
together. Regenerate the lock using `npm install --package-lock-only --ignore-scripts`,
then verify `npm ci`. Do not use an unlocked install fallback in CI.

All standard tasks (`install`, `build`, `test`, `lint`) are also available
via [`just`](https://github.com/casey/just) — see `just --list`.

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. The server shows most changes immediately. You do not have to start it again.

## Build

```bash
npm run build
```

This command writes the static content to the `build` directory. Any service
for static content can then serve it.

## Homepage contributor wall

The homepage links to `/#contributors`, where `src/components/WallOfFame`
renders the committed `src/data/contributors.json` feed. It credits authors
of merged pull requests to public repositories in `tuna-os`, with forks
and archived projects included. It skips known bots and AI agents.
For each author, `merged_prs` is the number of merged pull requests.
It does not use inherited commit history.
The wall does not credit direct commits.

Run `GH_TOKEN=… npm run contributors` to refresh the feed locally.
`.github/workflows/update-contributors.yml` refreshes it every Monday at
06:00 UTC or on manual dispatch, validates it, and opens a refresh PR.
A maintainer must approve the PR workflows when GitHub asks.
Merge the PR after checks pass to update the live wall through production.

## Deployment

The **`tunaos-org` Cloudflare Worker** serves the live site (tunaos.org).
`wrangler.jsonc` mounts this repo's `build/` directory as the Worker's
static assets, and `worker/index.js` routes requests.

- **Production** — a push to `main` triggers Cloudflare Workers Builds,
  which runs the build and publishes the new assets.
- **Pull requests** — `.github/workflows/bootstrap.yml` calls the reusable
  `workers-build.yml` workflow for Docusaurus and Workers validation.
  A deploy failure then appears on the PR before it reaches production.
- **Content sync** — `.github/workflows/sync-org-docs.yml` runs daily
  (cron `0 6 * * *`) and opens a PR when org-synced content changes.

The shared Linux job runs `npm ci`, type checks, one site build, both browser
smoke checks, and `wrangler deploy --dry-run`. It supplies results to the required
`Build tunaos-org` and `bootstrap (ubuntu-24.04)` checks.
The Ubuntu check does not build the site again.
Production Workers Builds builds and deploys separately on pushes to `main`.

`bootstrap (macos-latest)` checks a fresh macOS install and build for changes to
the site, dependencies, or setup tools. It reports not applicable for other changes.
Daily and manual `bootstrap` runs always check macOS setup.

PR jobs check out the PR head SHA, not the default branch.
They do not share build artifacts across events or workflows.
They have no issue-write permission.
The separate issue job runs only for pushes, schedules, and manual runs.
Lint uses `npm ci` without an unlocked install fallback.
The workflow that deploys the Flatpak index (`.github/workflows/deploy-flatpak.yml`)
also publishes the site when `static/flatpak/**` changes on `main`, or on a
manual run. Before you run it, set the GitHub Actions secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in this repository. Use the
account ID for the account that owns the `tunaos-org` Worker.

The adoption API uses the `COUNTME` service binding to the `tunaos-countme`
Worker in the same account. Deploy the collector before the site. Its source
and D1 migrations live in `tuna-os/tunaos/services/countme`.

If `/api/adoption` returns HTTP 503 while the collector is healthy, check the
Worker fetch options. A live run on 2026-09-27 returned `TypeError: Invalid
redirect value` for `redirect: "error"`. Use `redirect: "manual"` and reject
redirect responses. Node fetch accepts `"error"`, so the cross-repository
integration test also runs the site proxy in native workerd with a service
binding.

To preview the production build locally:

```bash
npm run build
```

For prerequisites and validation before submission, see the
[contributor guide](./CONTRIBUTING.md).

See [Telemetry and adoption proxy operations](TELEMETRY.md) for application log
fields, privacy guarantees, and cache measurement limits.
