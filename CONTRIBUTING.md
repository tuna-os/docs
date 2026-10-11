# Contributing

Thanks for your interest! This project is part of the [TunaOS](https://tunaos.org) ecosystem.

## Getting Started

### Local Environment Setup

Install Node.js 24, npm, and the
[repository command runner](https://github.com/casey/just).
Check them with `node --version`, `npm --version`, and `just --version`.

**First-time setup:**

```bash
git clone https://github.com/YOUR-USERNAME/docs.git
cd docs
npm ci
```

Fork the repository on GitHub first. Replace `YOUR-USERNAME` with your GitHub name.
`npm ci` installs the versions in the lockfile.

**Local development:**

```bash
just start
```

Open the local address that `just start` prints. The site reloads when you edit a file.

**Before you submit a PR:**

```bash
just preflight
just build
```

`just preflight` checks types, prose, code, install commands, and tests.
`just build` creates the production site in `build/`.

### Opening an Issue

Open an issue before a substantial documentation or site change (new sections,
navigation rework, new components) so maintainers can confirm its scope.
Small fixes (typos, links, single-page updates) do not need pre-approval.

## Content Ownership

This repository owns the pages at the top level of `docs/` and in `blog/`.
For example, edit `docs/architecture.md` in this repository.
Site code in `src/` and navigation in `docusaurus.config.js` also live here.

Each day, [`sync-org-docs.yml`](/.github/workflows/sync-org-docs.yml)
copies pages from projects into many `docs/<project>/` directories.
It runs at 06:00 UTC and opens a PR for changes. A merge of that PR can
replace edits made directly to copied pages. To fix a copied page, edit its
source repository and wait for the sync PR to merge.

The sync creates each project's `index.md` from its source `README.md`.
Other files can come from the source root or its `docs/` directory.
For example, `docs/bluefin-cli/index.md` comes from the bluefin-cli README.
Look at the sync script and the source repository to confirm a file's owner.

Some project directories also contain pages written here. For example,
this repository owns `docs/tunaos/introduction.md`, while the sync copies
that directory's `index.md` from its source. See [`AGENTS.md`](./AGENTS.md) for
the sync rules and more detail about these mixed directories.

## Validation

Install the Markdown linter used by the repository recipe:

```bash
npm install --global markdownlint-cli
```

Run all local pre-submission checks:

```bash
just preflight
```

This command type-checks the site, checks Markdown and JavaScript, enforces the
prose budget for Simplified Technical English, and runs tests for documentation
scripts. Also run `just build` when the change can affect the generated site.

Use `just --list` to see individual setup, preview, build, and validation
recipes.

## Synchronized Project Documentation

The daily sync of documentation generates many `docs/<project>/` trees from
their source repositories. Fix documentation for a generated project in its
source repository. The next sync overwrites direct changes here. The generated
index page at the start of a project tree identifies the source repository.

## Pull Requests

- Keep PRs focused — one change per PR.
- Include the commands you ran in the PR description.
- Do not commit `build/`, dependency directories, or local preview output.
- Update navigation and cross-references when you add, move, or remove a page.

## Blog Posts

- Blog posts live in `blog/` with a `YYYY-MM-DD-<slug>.md` filename.
- Each post's `slug:` must be unique across `blog/`.
- A duplicate slug shadows the other post at the same URL and breaks canonical links.
- If you rewrite a post, reuse the existing file (update it in place).
- Do not add a second file with the same slug.
- **Publish before you merge.** A post is visible on tunaos.org/blog only when it has no `draft: true` in its frontmatter. Merge posts with `draft: false` (or no draft field) unless you schedule them for a future date (for example, 08-22). If you leave `draft: true` after the merge, the post stays hidden — flip the flag in the same PR.
- After you edit a post, run `just preflight` and `just build`. These checks
  include blog content in the prose budget and production build.

## Questions?

- [TunaOS Documentation](https://tunaos.org)
- [GitHub Issues for the docs site](https://github.com/tuna-os/docs/issues)
- For general TunaOS questions, see [TunaOS Issues](https://github.com/tuna-os/tunaOS/issues)

<!-- hive-contribute-plea: donated-compute appeal, keep in sync across repos -->
## Contribute compute — no code needed

No time to write code? You can still push this project's backlog forward. TunaOS AI-agent hives work on this repository. Lend a hive your AI subscription or API tokens, and your machine runs contributor tasks from this project's backlog.

- 🪸 [Contribute compute to the reef hive](https://reef.tunaos.org/contribute)
- 🏫 [Contribute compute to the school hive](https://school.tunaos.org/contribute)
