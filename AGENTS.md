# AGENTS.md — agent guide for tuna-os/docs

The **TunaOS website** (<https://tunaos.org>) — Docusaurus, served by the
`tunaos-org` Cloudflare Worker. It is also the repo that **serves the Flatpak
remote** and the ISO index.

Human docs: [`README.md`](README.md) (deployment),
[`CONTRIBUTING.md`](CONTRIBUTING.md) (`just preflight` and the validation
list), [`ROADMAP.md`](ROADMAP.md).

## Most of `docs/` is generated — fix it upstream

`sync-org-docs.yml` runs daily (`0 6 * * *`) and pulls READMEs and docs from
every active repo in the org into `docs/<slug>/`, opening a PR when anything
changed. New repos with a README are picked up automatically; there is no
per-project config here.

So editing a page under a repo-slug directory is undone by the next sync. The
fix belongs in the source repository. The STE budget skips those trees for the
same reason, and decides which they are from the sync's own index-page
template rather than guessing from a file's links (#102).

Hand-written pages live at the top level of `docs/` (`architecture.md`,
`choosing-a-variant.md`, …) and in `blog/`.

## This repo serves the Flatpak remote

`flatpak remote-add tuna-os https://tunaos.org/flatpak/...` resolves against
`static/flatpak/` here — the index is *built* in
[`tuna-os/flatpak-index`](https://github.com/tuna-os/flatpak-index) and
*published* from this repo. Publishing is therefore a two-repo operation, and
a correct index over there can still be stale in production until it lands
here. `deploy-flatpak.yml` deploys on any push touching `static/flatpak/**`.

`.github/scripts/update-index.py` is a **vendored copy** of flatpak-index's
script; the two have drifted before and nothing checks that they agree.

## What the lint gates actually enforce

```bash
just preflight     # typecheck + lint + tests + check-install-commands
just build         # run this whenever a change can affect the generated site
```

`lint.yml` has four jobs, and it is worth knowing which ones bite:

| Job | Enforces |
| --- | --- |
| `js-syntax` | Yes — `node --check` on every script, plus every `*.test.mjs`, plus `check-install-commands` |
| `ste` | Yes — Simplified Technical English, against the number in `.ste-budget` |
| `markdown-lint` | Against `.markdownlint-budget` |
| `link-check` | Yes — broken internal `.md` links fail the job |

Both budgets are ratchets: a gate that fails on day one gets disabled on day
two, so the number only ever goes down. Lower it when a batch of cleanup
lands; never raise it to make a PR pass.

`.ste-budget` and `.markdownlint-budget` are in the workflow's path filters on
purpose — a change to the number a job is measured against must trigger that
job. `blog/**` is there for the same reason: STE counts blog posts, so without
it a blog-only PR could push the total over and only be caught by the next PR
touching `docs/**`.

## Deployment is automatic and this is production

A push to `main` triggers Cloudflare Workers Builds, which builds and
publishes. `workers-build.yml` runs the same Docusaurus and Workers build on
pull requests, so a deploy failure shows up before it reaches production —
that PR job is the only thing standing between a merge and the live site.
