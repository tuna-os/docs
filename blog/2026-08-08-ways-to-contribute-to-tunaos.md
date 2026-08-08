---
slug: ways-to-contribute-to-tunaos
title: "Ways to Contribute to TunaOS"
authors: [james]
tags: [tunaos, contributing, community, good-first-issue, onboarding]
date: 2026-08-08
---

TunaOS is a small project with an outsized goal: an enterprise-grade, cloud-native
desktop that tracks current software without abandoning Enterprise Linux
lifecycles. It is built by a small core team — and it should not stay that way.
This post lays out every way to get involved, from a five-minute docs fix to
building a whole new desktop flavor.

<!-- truncate -->

## The fastest path: tagged starter issues

We now curate a **[`good first issue`](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** backlog: tasks that are deliberately small, well-scoped, and safe to attempt without deep knowledge of the image factory. Right now that includes:

- **Bonito status parity** — the wiki says the Fedora-based Bonito variant is experimental; a recent blog post called it production. Pick one and make the docs agree.
- **Docs script fixes** — `ste-lint` under-detects synced trees (28 findings hiding), and the org-docs sync only reads the first 30 repos (not paginated).
- **Test coverage** — two build scripts in the docs repo have no unit tests.

Each issue carries the `help wanted` label too, which signals "external contribution explicitly welcome." Comment on the issue when you pick it up — that prevents double work, and it gets you a response faster.

## Docs and guides

The [docs site](https://tunaos.org) runs its own [issue tracker](https://github.com/tuna-os/docs) and has an independent `good first issue` backlog. Guides, FAQ answers, variant pages, and screenshots are all welcome. If you use a TunaOS variant daily, you are the best person to write its getting-started guide.

## Community

The project lives in [Matrix](https://matrix.to/#/%23tunaos:reilly.asia) (`#tunaos:reilly.asia`). If you are not ready to open a PR yet:

- Answer questions from newcomers in the room
- Triage [open issues](https://github.com/tuna-os/tunaOS/issues) — confirm reproductions, add logs, mark duplicates
- Join GitHub Discussions and react to release announcements

## Testing and reporting

TunaOS publishes a **weekly boot report** and runs daily verification across desktop cells. Booting an ISO on real hardware — especially less-common platforms like Apple Silicon (Asahi) or ARM — and reporting what breaks is genuinely valuable work. The verification issues are labeled and tracked; a "works on my machine" report with logs moves the project forward.

## Spreading the word

If you use TunaOS at work or home:

- Add your org to [ADOPTERS.md](https://github.com/tuna-os/tunaOS/blob/main/ADOPTERS.md) — one-line PR
- Star the repo and share the [blog](https://tunaos.org/blog)
- Write about your setup; the maintainers read everything

## Writing code

For the full picture, [CONTRIBUTING.md](https://github.com/tuna-os/tunaOS/blob/main/CONTRIBUTING.md) has the quick start (`just fix && just check`), the manifest-driven build model, and the PR process. Desktop environments are declared as YAML manifests — you can add a new flavor without shell scripting at all.

## Start today

Pick a `good first issue`, drop a comment, and say hi in Matrix. The project is young enough that your first contribution can genuinely shape it.
