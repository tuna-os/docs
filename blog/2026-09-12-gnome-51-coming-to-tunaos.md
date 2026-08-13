---
slug: gnome-51-coming-to-tunaos
title: "GNOME 51 is coming to TunaOS — enterprise desktops, updated on the upstream schedule"
authors: [james]
tags: [tunaos, gnome, el10, almalinux, centos-stream, bootc, immutable, copr]
date: 2026-09-12
draft: true
---

<!-- ste-disable-file: scheduled release-week post for GNOME 51.0; publish on or after the upstream release date. -->

GNOME 51.0 ships **September 12, 2026** — and TunaOS is packaging it for
Enterprise Linux *before* the upstream release lands. The GNOME 51 build
tier in [tunaos-packages](https://github.com/tuna-os/tunaos-packages) is
already built out through the project's native RPM build chain, so the
Albacore and Yellowfin GNOME variants can pick it up on the upstream
schedule instead of waiting for an EL point release.

<!-- truncate -->

## The enterprise desktop problem, one release at a time

Enterprise Linux desktops historically track decade-old package sets: a
server OS lifecycle is great for servers, but GNOME moves on a six-month
cadence. TunaOS closes that gap by backporting current desktop
environments onto EL bases — the same story as
[our earlier enterprise-desktop post](2026-07-19-modern-enterprise-linux-desktops-with-tunaos),
now with a concrete, dated milestone.

## What's in the GNOME 51 tier

The [gnome-51 source tree](https://github.com/tuna-os/tunaos-packages/tree/main/src/gnome-51)
covers the full modern stack: `gnome-shell`, `mutter`, `gtk4`,
`libadwaita`, `gnome-control-center`, `gnome-settings-daemon`,
`gnome-session`, `nautilus`, `gdm`, `gnome-initial-setup`, `orca`,
`ptyxis`, `vte291`, `xdg-desktop-portal-gnome`, and the GNOME
foundation libraries (`glib2`, `gjs`, `gobject-introspection`,
`gsettings-desktop-schemas`, `gnome-desktop3`, `gnome-online-accounts`).
It builds through the same mock-based, distributed tier workflow that
carried GNOME 49/50 backports — with the harness gating each tier before
promotion.

## How to test

1. **On a TunaOS GNOME variant** (Albacore or Yellowfin), updates land
   through the normal atomic pipeline — `sudo bootc upgrade` after the
   tier reaches the published TunaOS package repository.
2. **On EL10 directly** — the backports publish to the TunaOS RPM
   repository (native builds, not a COPR — see the
   [tunaos-packages README](https://github.com/tuna-os/tunaos-packages#readme)
   for current setup instructions), so AlmaLinux 10 / CentOS Stream 10
   users can pick up GNOME 51 packages without switching distributions.
3. **Package by package** — the tier is public and incremental; each
   component builds independently, so test coverage can start as soon as
   the first tiers go green.

## Why this matters

TunaOS's whole pitch is *"the desktop updates like a container fleet"* —
one transaction, rollback on failure, verified upgrades. GNOME 51 on the
EL10 base is that pitch in miniature: current desktop, enterprise
lifecycle, atomic delivery, on the upstream schedule.

- **Upstream release**: [GNOME 51.0](https://release.gnome.org/) — Sep 12, 2026
- **Packaging tracker**: [tunaos-packages](https://github.com/tuna-os/tunaos-packages),
  GNOME 51 tier
- **Download**: [tunaos.org/download](https://tunaos.org/download)

Questions, testing results, or packaging help — [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia).
