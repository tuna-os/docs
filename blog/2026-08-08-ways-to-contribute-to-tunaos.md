---
slug: ways-to-contribute-to-tunaos
title: "Ways to Contribute to TunaOS"
authors: [james]
tags: [tunaos, contributing, community, good-first-issue, onboarding]
date: 2026-08-08
---

<!-- ste-disable-file: a dated blog post; its wording is a published record. The findings here are the author's first-person voice, and editing a published post to satisfy a style checker would rewrite the record rather than improve a manual. STE governs the documentation, not the changelog. -->

TunaOS is a small project with an outsized goal: an enterprise-grade, cloud-native
desktop that tracks current software without abandoning Enterprise Linux
lifecycles. It is built by a small core team — and it should not stay that way.
This post lays out every way to get involved, from a five-minute docs fix to
building a whole new desktop flavor.

<!-- truncate -->

## The fastest path: tagged starter issues

We now curate a **[`good first issue`](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** backlog: tasks that are deliberately small, well-scoped, and safe to attempt without deep knowledge of the image factory. Right now that includes:

- **ARM laptop hardware** — the README System Requirements don't document supported ARM hardware (ThinkPad X13s, Apple Silicon) yet ([tunaOS#1385](https://github.com/tuna-os/tunaOS/issues/1385)).
- **Verifying downloads** — the README has no checksums/SBOM verification section for the published ISOs ([tunaOS#1366](https://github.com/tuna-os/tunaOS/issues/1366)).
- **Pantheon desktop docs** — the new Gurnard (Ubuntu + Pantheon) variant needs a desktop guide and the `pantheon` suffix documented ([tunaOS#1351](https://github.com/tuna-os/tunaOS/issues/1351), [tunaOS#1350](https://github.com/tuna-os/tunaOS/issues/1350)).

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
