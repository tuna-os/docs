# Contributing

Thanks for your interest! This project is part of the [TunaOS](https://tunaos.org) ecosystem.

## Getting Started

Install Node.js 24 and npm. Also install the
[repository command runner](https://github.com/casey/just). Then fork the
repository, clone your fork, and install the pinned dependencies:

```bash
npm ci
```

Start Docusaurus on your computer with `just start`. Before you submit a change
that affects pages, navigation, components, or configuration, build the
production site with `just build`.

Open an issue before a substantial documentation or site change. Maintainers
can then confirm its scope.

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
- [GitHub Issues](https://github.com/tuna-os/tunaOS/issues)
