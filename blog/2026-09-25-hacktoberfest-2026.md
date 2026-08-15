---
slug: hacktoberfest-2026
title: "Hacktoberfest 2026 with TunaOS — a curated pool of starter tasks, DCO-signed"
authors: [james]
tags: [tunaos, hacktoberfest, open-source, good-first-issue, community, contributing, bootc]
date: 2026-09-25
draft: true
---

<!-- ste-disable-file: event-driven contributor call for Hacktoberfest 2026; publish on or after 09-25 (after the 09-15 GFI seeding deadline). -->

Hacktoberfest is back — and TunaOS is participating with a curated pool of
beginner-friendly tasks. No prior experience with bootc, image building, or
Rust required: this year's pool is mostly docs, testing, and small polish
work, sized so that a first-time contributor can finish a task in an
evening.

<!-- truncate -->

## How it works

1. **Pick a task** — browse our [`good first issue`](https://github.com/search?q=org%3Atuna-os+is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22&type=issues)
   labeled issues (also tagged `community`/`outreach`). The org-wide pool is
   seeded to at least 8 tasks by mid-September, spread across the docs site,
   the main repo, and the smaller tools.
2. **Claim it** — leave a comment saying you're working on it so nobody
   duplicates the effort.
3. **Fix it** — docs edits, small scripts, and test coverage are all
   welcome. Keep PRs small and focused; large refactors are better proposed
   in an issue first.
4. **Open a PR** — follow the
   [Contributing guide](https://github.com/tuna-os/tunaOS/blob/main/CONTRIBUTING.md),
   sign off with DCO (`git commit -s`), and link the issue.
5. **Get merged** — maintainers review PRs quickly, and merged PRs count
   toward your Hacktoberfest goal.

The full playbook — including what kind of PRs we accept and the FAQ — lives
in the [Hacktoberfest 2026 doc](https://tunaos.org/docs/tunaos/hacktoberfest-2026).

## What's in the pool

Tasks fall into four buckets:

| Area | Examples |
|---|---|
| **Docs** | FAQ entries, guide pages, README sections, cheat sheets |
| **Testing** | Unit tests for scripts and small helpers, CI hardening |
| **Polish** | Better error messages, workflow tweaks, label hygiene |
| **Content** | Blog post drafts, community pages, ADOPTERS.md entries |

Recent weeks show the model working: a QEMU/KVM evaluation guide, the
Pantheon keyboard-shortcuts cheat sheet, and the "choosing your variant"
decision guide were all GFI-shaped tasks — small, self-contained, and
genuinely useful to users.

## What makes a good TunaOS contribution

- **It fixes a real gap** — if the FAQ doesn't answer a question you hit,
  that's the task. If a script has no tests, that's the task.
- **It's small** — one page, one script, one workflow. We'll happily review
  a 30-line PR faster than a 300-line one.
- **It links back** — reference the issue in the PR body so reviewers and
  Hacktoberfest both know what it resolves.

## Questions?

- Join [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia) — fastest
  way to get an answer
- Open a [GitHub Discussion](https://github.com/tuna-os/tunaOS/discussions)
- Read the [Hacktoberfest 2026 doc](https://tunaos.org/docs/tunaos/hacktoberfest-2026)

See you in October — first-timers especially welcome.

---

*Draft for maintainer review. Publish on or after 2026-09-25 (pool seeding
deadline is 09-15 per tunaOS#1354/#1537). Coordinate with the Q4 promotion
calendar (tunaOS#1166).*
