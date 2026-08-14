---
slug: q3-2026-community-checkpoint
title: "Q3 2026 Checkpoint: what we shipped, and where TunaOS goes next"
authors: [james]
tags: [tunaos, community, checkpoint, roadmap, q3-2026, hacktoberfest]
date: 2026-08-22
draft: true
---

<!-- ste-disable-file: community checkpoint recap; milestone review content. -->

Every quarter we pause and take stock: what did we ship, what did we learn,
and where does TunaOS go next? Here is the Q3 2026 community checkpoint —
the same data our maintainer used in the internal decision review
([#1299](https://github.com/tuna-os/tunaOS/issues/1299)), written for
everyone who uses, builds on, or contributes to TunaOS.

<!-- truncate -->

## What Q3 delivered so far

**New variants.** The catalog grew from a handful of images to a genuinely
multi-desktop, multi-base line: **Gurnard** (Ubuntu 24.04 LTS with the
Pantheon desktop), **Hummingbird** (container-native Fedora), plus the
existing GNOME, KDE Plasma, COSMIC, Niri, and XFCE flavors on Enterprise
Linux lifecycles. Every variant ships as an atomic, rollback-safe bootc
image — one transaction, verified upgrades.

**Flavor equality.** We stopped treating GNOME as the "primary" desktop.
The catalog parity gate ([#1322](https://github.com/tuna-os/tunaOS/issues/1322))
means every desktop flavor is held to the same promotion standard, and
non-GNOME flavors are no longer second-class citizens
([#1315](https://github.com/tuna-os/tunaOS/issues/1315)).

**Still looking for our first external contributor.** An early "first
external contributor" signal we tracked this quarter turned out to be a
misattribution — the commits were from an automated agent account, not a
person. Correcting that publicly matters more to us than the metric would
have: TunaOS is still a single-maintainer project by the numbers that count,
and closing that gap is exactly why the good-first-issue backlog below
exists.

**Infrastructure.** A manifest-driven build pipeline, published multi-arch
images, verified boot reports on every release, and a documented
[package sourcing policy](https://github.com/tuna-os/tunaOS/blob/main/PACKAGE-SOURCING.md)
so third-party repositories are explicit and reviewable.

## Community by the numbers

- **~55 GitHub stars** — flat over the last two months; growth is a Q4 focus
  (see the [adoption metrics plan](https://github.com/tuna-os/tunaOS/blob/main/ADOPTION-METRICS.md))
- **34+ outreach opportunities filed** — from conference CFPs (FOSDEM 2027
  draft is in-repo) to ecosystem partnerships (Asahi Linux, Snapdragon X Elite)
  and a DistroWatch listing draft
- **6 good-first-issue tasks tagged** across tunaos + docs, growing toward 8
  before [Hacktoberfest](https://hacktoberfest.com/) opens in October

## Decisions made at the checkpoint

| Goal | Decision |
|---|---|
| Bonito (Fedora) GA | ⬜ pending 08-22 review |
| Redfin (RHEL 10) alpha | ⬜ pending 08-22 review |
| RFC lifecycle governance | ⬜ pending 08-22 review |
| ADR coverage | ⬜ pending 08-22 review |

Every open Q3 goal gets one of three explicit outcomes: **STAFF** (owner +
first PR by 09-01), **DESCOPE → Q4** (moved with an owner), or **DROP**
(closed). Carryover will be a decision, not a discovery — the updated
[ROADMAP](https://github.com/tuna-os/tunaOS/blob/main/ROADMAP.md) will
reflect the outcome.

## How to get involved

- **Contribute** — pick a [good first issue](https://github.com/tuna-os/tunaOS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
  before Hacktoberfest opens
- **Talk to us** — [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia)
  is the primary community chat
- **Use TunaOS in production?** — we'd love to add you to
  [ADOPTERS.md](https://github.com/tuna-os/tunaOS/blob/main/ADOPTERS.md)

The full decision sheet lives at
[Q3_CHECKPOINT-2026-08-22.md](https://github.com/tuna-os/tunaOS/blob/main/Q3_CHECKPOINT-2026-08-22.md).
Questions, pushback, or ideas — the checkpoint is a conversation, not a memo.
