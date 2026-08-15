---
slug: gnome-51-beta-testing-call
title: "GNOME 51 beta is here — help us test it on Enterprise Linux"
authors: [james]
tags: [tunaos, gnome, el10, almalinux, centos-stream, bootc, immutable, testing]
date: 2026-08-17
draft: true
---

<!-- ste-disable-file: scheduled beta-window testing call for the EL10 GNOME 51 backport tier; publish when the tier lands in the published TunaOS repository. -->

GNOME 51.0 ships **September 12, 2026** — and the upstream beta is rolling
now. TunaOS is backporting GNOME 51 onto Enterprise Linux 10 as an
incremental tier in [tunaos-packages](https://github.com/tuna-os/tunaos-packages),
and we want your help shaking it out before the release-week post lands.

<!-- truncate -->

## Where things stand

- **Upstream**: GNOME 51 is in its beta window (Mutter 51 beta landed
  [early August](https://www.phoronix.com/news/GNOME-Shell-Mutter-51-Beta);
  final release September 12).
- **TunaOS tier**: the [gnome-51 source tree](https://github.com/tuna-os/tunaos-packages/tree/main/src/gnome-51)
  covers 22 components — `gnome-shell`, `mutter`, `gtk4`, `libadwaita`,
  `gnome-control-center`, `gdm`, `ptyxis`, and the GNOME foundation
  libraries — built through the same distributed, mock-based tier workflow
  that carried GNOME 49/50, with each tier gated before promotion.
- **Publishing**: the tier's RPMs publish to the TunaOS repository
  (`repo.tunaos.org`) as tiers go green; this post will be updated with the
  live repository URL the moment it's up.

## How to help right now

You don't need the published repo to be useful:

1. **Watch the tier** — the [gnome-51 source tree](https://github.com/tuna-os/tunaos-packages/tree/main/src/gnome-51)
   is public and incremental; components build independently.
2. **Report packaging issues** — open an issue in
   [tunaos-packages](https://github.com/tuna-os/tunaos-packages/issues) with
   the component name and the failing step (build / staged-install /
   runtime), or bring it to [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia).
3. **Sign up in Discussions** — drop a note in
   [GitHub Discussions](https://github.com/tuna-os/tunaos/discussions) if you
   run a TunaOS GNOME variant (Albacore or Yellowfin) and want a heads-up
   when the tier publishes.

## When the tier publishes

Two ways to test, depending on how you run TunaOS:

**On EL10 directly** (AlmaLinux 10 / CentOS Stream 10):

```bash
sudo dnf config-manager --add-repo https://repo.tunaos.org/gnome51/10-stream-x86_64/
sudo dnf -y --nogpgcheck install gnome51-el10-compat glib2 gnome-shell gdm
```

**On a TunaOS GNOME variant** — updates land through the normal atomic
pipeline once the tier reaches the published repository:

```bash
sudo bootc upgrade
```

Rollback is one transaction either way: `sudo bootc rollback` on a TunaOS
image, or `sudo dnf history` on a plain EL10 system.

## What we're looking for

- Packages that fail to install or start on a fresh EL10 base
- GNOME Shell / Mutter regressions specific to the backport (vs. upstream)
- Anything that works on upstream GNOME 51 but breaks here

Beta software on a brand-new backport tier: expect rough edges, and report
bugs upstream-first where the issue is in GNOME itself.

— Questions or test results: [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia).

*Related: [GNOME 51 is coming to TunaOS](2026-09-12-gnome-51-coming-to-tunaos) —
the release-week post for September 12.*
