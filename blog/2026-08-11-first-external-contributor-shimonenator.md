---
slug: first-external-contributor-shimonenator
title: "Correction: our 'first external contributor' post misidentified an automated agent"
authors: [james]
tags: [tunaos, community, contributors, correction]
date: 2026-08-11
draft: false
---

<!-- ste-disable-file: correction post — supersedes the 08-11 acknowledgment; maintainer voice intended. -->

> ## Correction (2026-08-14)
>
> This post originally thanked a human contributor — "Shimon Schwartz / shimonenator" — as TunaOS's first external contributor. **That claim was wrong, and we are correcting it publicly.**
>
> On review ([#1317](https://github.com/tuna-os/tunaOS/issues/1317), [#1451](https://github.com/tuna-os/tunaOS/issues/1451)) we confirmed that every commit attributed to the `shimonenator` account has `commit.author.name: antigravity` — the work came from a **Google Antigravity automated agent**, accidentally surfaced as a named coauthor. No person named Shimon Schwartz contributed to this repository.
>
> The commits themselves are real and remain part of the tree; the mistake was attributing them to a human contributor and building a "first external contributor" story on that attribution. We have also removed the claim from the [Q3 2026 checkpoint](https://tunaos.org/blog/2026/08/22/q3-2026-community-checkpoint), the roadmap, and our internal decision documents.
>
> TunaOS still has no external human contributor, and we are still a single-maintainer project by the numbers that count. Correcting that publicly matters more to us than the metric would have — closing that gap is exactly why the curated [`good first issue` backlog](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) below exists.

<!-- truncate -->

## What actually shipped

Since August 10, commits on the `shimonenator` account landed changes in the main repository:

- **OBS project design for the EL10 package gap** ([#777](https://github.com/tuna-os/tunaOS/issues/777)) — a concrete design for closing the packaging hole on the RHEL-10 line
- **Image Factory completion gate and definition of done** ([#1283](https://github.com/tuna-os/tunaOS/issues/1283)) — establishing what "done" means for the factory
- **Image Factory Completion Gate alignment section** ([#999](https://github.com/tuna-os/tunaOS/issues/999))
- **Hummingbird repo-contract URL fix** ([#1282](https://github.com/tuna-os/tunaOS/issues/1282))
- **Flavor-equality docs** ([#1315](https://github.com/tuna-os/tunaOS/issues/1315)) — removing the GNOME-primary tiering framing

These changes are useful on their merits — the OBS design and the completion gate touch two of the areas our roadmap flags as most at-risk, the enterprise line and the image factory. What they are **not** is evidence of outside human interest: the same account's commits are consistently attributed to an agent.

## Why the correction matters

TunaOS has a small core team, and we have been open about the single-maintainer bus-factor risk. Mistaking an agent for a human contributor would have let us pretend that risk was easing when it was not. The onboarding loop is still unproven: the docs, the issue labels, and the findability of starter tasks are exactly what a first human contributor will test, and we want that test to be honest.

## Be our first?

If you are a person reading this and the work above looks like work you could do — it is. We curate a
[`good first issue` backlog](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
and the [ways-to-contribute post](https://tunaos.org/blog/ways-to-contribute-to-tunaos)
covers every path in. The Matrix room ([#tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia))
is where questions get answered.

We would love to meet our actual first external contributor — and we will make sure the acknowledgment is correct when we do.
