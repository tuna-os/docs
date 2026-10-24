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
npm install --global markdownlint-cli@0.49.1
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

### Simplified Technical English (STE)

STE is a set of rules for clear technical English. It favors common words,
short sentences, and active voice. These rules help readers whose first
language is not English and readers who use assistive technology.
TunaOS checks prose to keep its documentation clear and easy to follow.

If the STE check fails, run:

```bash
just ste
```

This prints counts per file and fails when the total exceeds
[`.ste-budget`](./.ste-budget). To see details with the file, line,
rule number, and text, run the cached linter after `just ste`:

```bash
node "${XDG_CACHE_HOME:-$HOME/.cache}/tuna-os/ste-lint/ste-lint.mjs"
```

Read the rule and revise the affected prose. Split long sentences, choose
simple words, and say who does the action. For example, replace
`The system will be updated` with `We will update the system`.
Run `just ste` again to check the total. The shared
[STE linter and rules](https://github.com/tuna-os/.github/tree/main/.github/actions/ste-lint)
live in `tuna-os/.github`. Fix findings in synced pages in their source
repository; see [Content Ownership](#content-ownership).

### Markdown lint findings

Markdown lint checks the format, such as heading levels, spaces around lists,
and code fences. Its output includes a file, line, rule ID (such as `MD032`),
and a message. Use those details to fix the affected Markdown.
The rules and exclusions live in [`.markdownlint.yaml`](./.markdownlint.yaml).

`just lint` reports Markdown findings but continues after them. CI counts
findings and fails when the total exceeds
[`.markdownlint-budget`](./.markdownlint-budget). A successful local
`just preflight` therefore does not guarantee a pass in CI for Markdown.
To see findings with the same version and file selection as CI, run:

```bash
markdownlint 'docs/**/*.md' '*.md' --ignore docs/docs/tacklebox
```

This command exits with a failure if it finds any violations, including
existing ones within the budget. To compare the total with the CI budget:

```bash
markdownlint 'docs/**/*.md' '*.md' --ignore docs/docs/tacklebox > /tmp/tunaos-markdownlint.out 2>&1
# Continue here even if markdownlint exits with a failure.
grep -c ' error ' /tmp/tunaos-markdownlint.out
cat .markdownlint-budget
```

Review the output file and fix findings from your changes before you submit.

### Budgets only decrease

Both budgets are ratchets: they allow existing findings so cleanup can happen
in small steps, while CI rejects totals above the limit. Read the budget
files for the current limits. Do not raise either budget to make a PR pass.
When you remove a batch of findings, lower the matching budget to the new
total so later changes cannot add them back. Fix new findings even if the
total still fits within the budget.

### Additional validation before submission

Run two additional checks before you submit:

- **Accessibility:** `npm run a11y` audits the built site with axe-core (WCAG 2.2 A/AA) and must pass with zero violations. Run this after `npm run build`.
- **Metrics:** `npm run test:metrics` validates the adoption metrics page with browser automation. Useful for changes that affect `/metrics`.

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
