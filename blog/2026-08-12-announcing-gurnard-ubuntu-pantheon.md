---
slug: announcing-gurnard-ubuntu-pantheon
title: "Announcing Gurnard — Ubuntu 24.04 LTS with the Pantheon desktop"
authors: [james]
tags: [tunaos, gurnard, ubuntu, pantheon, elementary, bootc, immutable]
date: 2026-08-12
draft: true
---

<!-- ste-disable-file: announcement post for a new variant; first-person maintainer voice intended. -->

The TunaOS variant catalog keeps growing — and this time it pairs the most
familiar LTS base in Linux with one of its most elegant desktops. Meet
**Gurnard** (🐟): Ubuntu 24.04 LTS (Noble Numbat) with the **Pantheon**
desktop, rebuilt as an atomic bootc image.

<!-- truncate -->

## Why Gurnard exists

Until now, if you wanted the Pantheon desktop — the calm, minimal environment
from elementary OS — you mostly had to run elementary OS itself. Gurnard is the
first widely-buildable way to get that desktop with a standard Ubuntu 24.04 LTS
base underneath, wrapped in a container-native, immutable core.

The result is a familiar Ubuntu with an atomic heart:

- **Ubuntu 24.04 LTS** base — the LTS with the longest support runway in the
  catalog, on both x86_64 and arm64
- **Pantheon desktop** — elementary's elegant, minimal desktop, pre-configured
  out of the box
- **bootc core** — atomic updates and rollback, the same container-native
  foundation as the rest of the TunaOS line
- **Flathub and Homebrew pre-enabled** — apps and tools ready to install the
  moment you boot

Gurnard currently ships as **Experimental** (`ghcr.io/tuna-os/gurnard:base` and
`ghcr.io/tuna-os/gurnard:pantheon`) — the right time to try it is now, before
the surface settles, because Pantheon on a non-elementary base is a new
packaging surface and we want your bug reports while they're cheap to fix.

## How to try it

```bash
# Pull and run with a container runtime, or boot directly via bootc
bootc container copy ghcr.io/tuna-os/gurnard:pantheon
```

Or browse the [Gurnard variant page](https://tunaos.org/gurnard) for install
instructions and image tags.

## Part of a growing line

Gurnard joins the catalog alongside **Hummingbird** (🐦, Fedora Hummingbird
rebased with the CKI ARK kernel and hardened for secure boot) — both new
variants in the last week, and both reminders that TunaOS is not one desktop's
project. Every major base and desktop pairing we can ship atomically, we will.

Questions, feedback, or a first contribution? We're on
[Matrix](https://matrix.to/#/%23tunaos:reilly.asia) and issues are open in
[github.com/tuna-os/tunaOS](https://github.com/tuna-os/tunaOS) — good-first-issue
labels are coming to the backlog soon.
