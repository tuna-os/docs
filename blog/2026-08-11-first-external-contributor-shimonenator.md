---
slug: first-external-contributor-shimonenator
title: "Correction: the 'First External Contributor' Claim Below Was Wrong"
authors: [james]
tags: [tunaos, community, contributors, thank-you, onboarding, correction]
date: 2026-08-11
draft: false
---

<!-- ste-disable-file: community acknowledgment post; first-person maintainer voice intended. -->

> **Correction (2026-08-13):** This post originally thanked "Shimon Schwartz —
> shimonenator" as TunaOS's first external human contributor. That was wrong. The
> account's commits are authored by a Google Antigravity agent, not a person —
> `commit.author.name: antigravity` on every one of them, confirmed via `git log`
> ([#1317](https://github.com/tuna-os/tunaOS/issues/1317)). There is still no first
> external human contributor; the single-maintainer bus-factor risk this post
> implied was easing is unchanged. We're leaving the original text below, struck
> through, rather than deleting it — correcting a public claim matters more to us
> than the metric would have. The [`good first issue` backlog](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
> this post pointed to is still real and still open, if you're looking for a way in.

<!-- truncate -->

~~Every open-source project remembers its first outside hand. For TunaOS, that hand
belongs to **Shimon Schwartz — shimonenator** — who has now landed five commits in
the main repository, three of them this week. It is the first time a contributor
outside the core team has shaped the project, and it deserves a proper thank-you.~~

## What shimonenator has shipped

Since August 10, shimonenator has landed:

- **OBS project design for the EL10 package gap** ([#777](https://github.com/tuna-os/tunaOS/issues/777)) — a concrete design for closing the packaging hole on the RHEL-10 line
- **Image Factory completion gate and definition of done** ([#1283](https://github.com/tuna-os/tunaOS/issues/1283)) — establishing what "done" means for the factory
- **Image Factory Completion Gate alignment section** ([#999](https://github.com/tuna-os/tunaOS/issues/999))
- **Hummingbird repo-contract URL fix** ([#1282](https://github.com/tuna-os/tunaOS/issues/1282))
- **Flavor-equality docs** ([#1315](https://github.com/tuna-os/tunaOS/issues/1315)) — removing the GNOME-primary tiering framing

These aren't cosmetic touch-ups. The OBS design and the completion gate touch two of
the areas our roadmap flags as most at-risk — the enterprise line and the image
factory itself. Outside interest landing exactly there is the best signal a small
project can get.

## Why this matters

~~TunaOS has a small core team, and we have been open about the single-maintainer
bus-factor risk. A drive-by commit is nice; a contributor who comes back — five
commits, three this week — is structural. It means the onboarding loop can work:
the docs were readable, the issues were findable, and the work was worth coming back
for.~~

None of that follows from an agent account. The single-maintainer bus-factor risk
is exactly what it was before this post — see [#1317](https://github.com/tuna-os/tunaOS/issues/1317).

## Want to be next?

If shimonenator's commits look like work you could do, they are. We curate a
[`good first issue` backlog](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
and the [ways-to-contribute post](https://tunaos.org/blog/ways-to-contribute-to-tunaos)
covers every path in. The Matrix room ([#tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia))
is where questions get answered.

~~Thank you, Shimon — the factory is better because you showed up, and came back.~~
The linked issues above are still fixed, and the backlog above is still real —
those two things just don't add up to a first external contributor.
