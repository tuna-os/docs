---
title: Syncing organization documentation
sidebar_label: Documentation sync
description: How the daily documentation sync works, how to debug failures, and where to make fixes.
---

Each day, the sync copies pages from projects in `tuna-os` into this site.
Fix copied content in its source repository. Direct edits to generated pages
can be lost on the next sync.

The implementation has three main parts:

- [Workflow](https://github.com/tuna-os/docs/blob/main/.github/workflows/sync-org-docs.yml): schedule, build, and sync PR.
- [Sync script](https://github.com/tuna-os/docs/blob/main/scripts/sync-org-docs.mjs): repository discovery, filters, copies, and removals.
- [Transform helpers](https://github.com/tuna-os/docs/blob/main/scripts/lib/org-doc-transform.mjs): changes to links, HTML cleanup, and page metadata.

## How sync works

The `sync-org-docs` workflow runs at **06:00 UTC each day** (`0 6 * * *`).
Maintainers can also run it through `workflow_dispatch`. Its job runs only in
`tuna-os/docs`, so a fork does not run the sync job.

1. The workflow checks out the site, sets up Node.js 24, and runs `npm ci`.
2. The script uses `gh api` to list repositories in the organization, across
   all pages. It excludes archived repositories and names in `SKIP`.
3. It maps each remaining repository to a lowercase slug. `PROJECTS` can
   override its label, slug, and status. A slug in `HAND_AUTHORED` is left alone.
4. It makes a shallow clone of each source repository's **default branch**.
   The branch can be `dev` or `master`; it does not assume `main`.
5. It writes selected documents into `docs/<slug>/`, then removes eligible
   files that the source no longer supplies. It removes each temporary clone
   after it processes that repository.
6. It reports coverage, fails if any repository failed, and checks all paths
   under `docs/` for names that differ only in case.
7. It checks each page written by this run for MDX compatibility. A page that
   cannot compile gets `mdx: {format: md}` in its front matter. Docusaurus then
   reads it as CommonMark; raw HTML can appear as text.
8. The workflow runs `npm run build`. Only after that succeeds does it create
   or update a PR from `automation/sync-org-docs`, titled
   `chore: sync org-wide project docs`. It opens no PR when nothing changed.

A maintainer must review and merge the sync PR. A successful run alone does not
publish content. A push to `main` starts the production build and deployment.

### Which files become pages

| Source | Destination or rule |
| --- | --- |
| Root `README.md` | `docs/<slug>/index.md`, with generated front matter and an optional status banner |
| Selected root documents | Same filename in `docs/<slug>/`; default names are `ARCHITECTURE`, `CONTRIBUTING`, `ROADMAP`, `TODO`, `SECURITY`, and `SPEC`, with `.md` or `.rst` extensions |
| Files directly inside `docs/` | `.md` and `.rst` files, except `SUMMARY.md`, copied to `docs/<slug>/` |

The script strips a leading Markdown title and adds page metadata. An entry
in `ROOT_DOC_FILTER` replaces the default selection of root files.
`DOCS_SUBDIR` can select another source directory. Despite the script's recursive-folder
comment, the current loop copies only files directly inside that directory.
It does not copy nested folders or image assets.

Contributors maintain navigation in `sidebars.ts` by hand. A new project can
have generated pages without a sidebar entry. Use `npm run check-sidebar-coverage`
to find generated project trees that readers cannot reach from the sidebar.

### Ownership and removals

Contributors write pages at the top level of `docs/`, including this guide,
in this repository. `HAND_AUTHORED` protects each listed directory from
writes and removals. `SKIP_DOCS_DIR` excludes a source's documentation folder
but still copies selected documents from the root. For example, its `tunaOS` entry
protects pages such as `docs/tunaos/introduction.md`. The source README still
supplies `docs/tunaos/index.md`.

For each repository it syncs, the script compares existing direct files
with files written in this run. It can remove old subpages without a content
check. It removes an old `index.md` only if the page matches the
generated-index template. The script excludes subdirectories from removal. For
`SKIP_DOCS_DIR` repositories, removal is limited to eligible root documents.

Check these rules before you add a hand-written file beside generated files:
the sync can overwrite or remove it. The script skips archived and excluded
repositories, so this step leaves their existing pages in place. Review those
pages separately when you retire a project.

If an existing page differs from the incoming content and its front matter
does not match a generated index or subpage, the sync reports its slug and
filename in the overwrite summary. This is a warning, not protection: the
write still happens. Generated pages marked `mdx: {format: md}` remain
recognized as generated. An edit that keeps the generated front matter
cannot be distinguished from a normal generated page by this check.

## Pipeline resilience

Discovery requests `per_page=100` and uses `--paginate`. It removes duplicates
from the active names and keeps a separate count of archived repositories.
The listing check compares the total with the organization's reported `public_repos`,
which includes archived public repositories.

- An empty listing, or a total below `public_repos`, is a fatal discovery result.
- A fatal result triggers **one retry after five seconds**. A second fatal
  result stops the sync before it changes project pages.
- Exactly 30 repositories, or a whole multiple of 100, produces a warning
  about a possible page boundary. A warning alone does not stop the run.
- If the script cannot read the organization count, it skips the independent
  count check. The empty-list check and page-boundary warnings still apply.

This handles an incomplete listing that clears on retry, such as a result
cut short by a secondary rate limit. Other failures have no automatic retry:
a failed command to list repositories can stop discovery immediately. A
clone failure does not get a retry. Each clone has a 60-second timeout.

The script collects failures and continues with other repositories. It then
exits with a failure if any repository failed, so a partial run cannot
produce a successful sync PR.

For the history behind these guards, see
[#103](https://github.com/tuna-os/docs/issues/103),
[#242](https://github.com/tuna-os/docs/issues/242), and
[#260](https://github.com/tuna-os/docs/issues/260).

## Link rewriting

`fixRelativeLinks` resolves relative paths from the **source document's
directory**, collapses `.` and `..`, and uses the branch found in the clone.
It sends file links to GitHub and images to raw image bytes. It does not copy
the linked files into the site.

For a source document `docs/user-guide.md` on branch `dev`:

| Source target | Rewritten destination |
| --- | --- |
| `../CONTRIBUTING.md#setup` | `https://github.com/tuna-os/REPO/blob/dev/CONTRIBUTING.md#setup` |
| `screenshots/start.png` in a Markdown image | `https://raw.githubusercontent.com/tuna-os/REPO/dev/docs/screenshots/start.png` |
| `../LICENSE` | `https://github.com/tuna-os/REPO/blob/dev/LICENSE` |
| `../releases` | `https://github.com/tuna-os/REPO/releases` |

The image pass handles `.png`, `.svg`, `.jpg`, `.jpeg`, `.gif`, and `.webp`.
It also rewrites relative `src` values in HTML `img` tags with double quotes.
Absolute URLs, anchors such as `#setup`, and paths that start with `/` stay as
written. A path that starts with `/` must therefore already make sense on the
site. HTML cleanup also converts common patterns from GitHub Markdown into
safe MDX. Examples include autolinks, void elements, and less-than signs in prose.

To investigate a broken link, compare the source path and branch with the
generated URL. Open the rewritten file link and load the image itself; a
GitHub `blob` page returns HTML and cannot serve as an image source.
`just build` checks how the pages render, but does not verify URLs on GitHub.
The internal-link check also does not validate external destinations.

## Troubleshooting

Start with the workflow run and its failed step. These commands only read
GitHub data; use your configured `GH_TOKEN`:

```bash
gh run list --repo tuna-os/docs --workflow sync-org-docs.yml --limit 5
gh run view RUN_ID --repo tuna-os/docs --log-failed
gh pr list --repo tuna-os/docs --head automation/sync-org-docs
gh api rate_limit
```

Replace `RUN_ID` with the run ID from the list. To inspect a successful
run's coverage summary, use `gh run view RUN_ID --repo tuna-os/docs --log`.

### API limits or incomplete discovery

Look for `repo listing looked truncated`, `listing is truncated`, or an API
error. Compare the logged listed count, archived count, and public count.
Confirm that `--paginate` is still present in `listOrgRepos`.
For a rate-limit error, inspect the response and wait for its reset or retry
time before a maintainer reruns the workflow. Repeated immediate reruns can
extend the problem. Keep credentials out of logs and issue reports.

### A source change is missing from the site

Trace the change through these steps:

1. Confirm that the source repository contains the change on its default
   branch. The sync excludes open source PRs and changes on other branches.
2. Check the filters below and confirm the filename and source directory are
   eligible. Look for `hand-authored` or a repository failure in the sync log.
3. Inspect the latest sync PR for the generated file. If the sync or build
   fails, the workflow skips the PR step. A no-change run creates no new PR.
4. Confirm that the sync PR merged and the production deployment succeeded.
   If the page exists by URL but has no navigation entry, update `sidebars.ts`.

For an archived repository, a successful sync does not refresh or delete its
pages. Review a removal or an archive notice in this repository instead.

### A broken link or MDX build failure

Find the named page and its source document. Fix incorrect links or prose in
the source repository. If the transform breaks a valid document from GitHub,
fix the helpers here. Add a regression case to `scripts/__tests__/sync-org-docs.test.mjs`. Check both prose
and code samples: HTML cleanup should preserve fenced and inline code during
its prose rewrites.

Look for `not valid MDX` warnings and the CommonMark front matter when a page
builds but displays raw markup. For a case-collision error, remove or rename
one of the named paths and check whether the next sync would recreate it.
A rename of only the generated copy leaves the source unchanged.

## Maintenance

The sync discovers new active repositories automatically. A root `README.md`
supplies their index without an entry in `PROJECTS`. Check the generated
output, add a sidebar entry, and review the project's status and label.

The settings in `scripts/sync-org-docs.mjs` have distinct purposes:

| Setting | When to change it |
| --- | --- |
| `PROJECTS` | Set a display label, slug, or status for a known repository |
| `SKIP` | Exclude a moved, retired, or internal repository entirely |
| `HAND_AUTHORED` | Protect an entire site-owned project directory |
| `SKIP_DOCS_DIR` | Keep source developer docs out while still copying root documents |
| `ROOT_DOC_FILTER` | Use an exact root-filename allowlist for a repository |
| `DOCS_SUBDIR` | Read a different source documentation directory |

Treat `ROOT_DOC_FILTER` values as exact filenames. The current code uses
`includes(file)`: it is case-sensitive, and an empty array allows no additional
root documents. The README has a separate step. The comments above this
setting do not match those details of the implementation.

Before you change a filter, inspect existing pages for ownership and possible
removals. A slug change can leave an old directory behind. The script does
not clean up old directories when a repository changes its name or joins the
skip list.

To reproduce a sync locally, follow the repository's
[setup and validation instructions](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md).
Use a clean, disposable worktree with dependencies installed, GitHub CLI,
Git, Node.js 24, and a configured `GH_TOKEN`. The command contacts GitHub,
clones repositories, and **writes and removes files under `docs/`**:

```bash
node scripts/sync-org-docs.mjs
git diff --stat
git diff -- docs/
node scripts/__tests__/sync-org-docs.test.mjs
just preflight
just build
```

There is no dry-run option. The local script does not create a PR or deploy
the site; those steps belong to the workflow and merge process. Review the
diff before you propose changes, and keep lint budgets at or below their
current values.
