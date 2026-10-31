# Contributing

Thanks for your interest! This project is part of the [TunaOS](https://tunaos.org) ecosystem.

<!-- hive-contribute-plea: donated-compute appeal, keep in sync across repos -->
## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

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

### Additional validation before submission

Run two additional checks before you submit:

- **Accessibility:** `npm run a11y` audits the built site with axe-core (WCAG 2.2 A/AA) and must pass with zero violations. Run this after `npm run build`.
- **Metrics:** `npm run test:metrics` validates the adoption metrics page with browser automation. Useful for changes that affect `/metrics`.

## Synchronized Project Documentation

The daily sync of documentation generates many `docs/<project>/` trees from
their source repositories. Fix documentation for a generated project in its
source repository. The next sync overwrites direct changes here. The generated
index page at the start of a project tree identifies the source repository.

## Adding a Variant Page

TunaOS provides multiple operating system variants (such as Albacore, Yellowfin,
Bonito, and Gurnard). Follow these steps to add documentation for a new variant:

### 1. File Location and Frontmatter

Variant reference pages live at the top level of `docs/`:

- Path: `docs/<variant>.md` (for example, `docs/yellowfin.md`).
- Frontmatter must include `sidebar_position`:

```markdown
---
sidebar_position: 11
---

# VariantName (Base Distribution)
```

Next, add your variant page to `sidebars.ts` under the **Variants** category in
`tutorialSidebar`:

- If the variant has a custom start page in `src/pages/`, add a link item: `{type: 'link', label: 'VariantName — Base', href: '/variantname'}`.
- Add the doc ID (`'<variant>'`) to `tutorialSidebar` under `Variants` -> `Reference docs` items.

### 2. Standard Page Structure

A standard variant page includes the following sections:

1. **Header and Overview:** A link to the start page or quick-start guide.
2. **Metadata:** Upstream base name and link (for example, AlmaLinux, Fedora, or Ubuntu).
3. **Features:** Key capabilities (for example, integrated Homebrew, desktop environment, kernel options).
4. **Downloads:**
   - Container image references on GitHub Packages (`ghcr.io/tuna-os/<variant>:<tag>`).
   - Links to live ISO files at `https://download.tunaos.org/live-isos/<variant>-<flavor>-latest.iso`.
5. **Installation:**
   - Image pull command with `podman pull ghcr.io/tuna-os/<variant>:latest`.
   - Local ISO build steps using `just build-iso <variant>` in the `tuna-os/tunaOS` repository.
6. **Community Support and Help:** Links to TunaOS Matrix chat and upstream forums.

### 3. Download Index and ISO Links

The download catalog on `/download` reads metadata from `static/iso-index.json`.

- The Cloudflare R2 bucket (`download.tunaos.org`) stores all published ISOs.
- `scripts/build-iso-index.mjs` transforms the object list into structured categories.
- Ensure your ISO file uses the standard name pattern (`<variant>-<flavor>-latest.iso`) so `detectArch()` in `scripts/lib/iso-index.mjs` detects the architecture correctly.

### 4. Checklist for Pull Requests

Before you submit a pull request with a new variant page:

- [ ] The file exists at `docs/<variant>.md`.
- [ ] You added the sidebar entry to `sidebars.ts` under `Reference docs`.
- [ ] You added the variant to `docs/choosing-a-variant.md` in the table and decision paths.
- [ ] All internal links resolve without 404 errors.
- [ ] Preflight checks pass: run `just preflight`.
- [ ] The production build succeeds: run `just build`.

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
