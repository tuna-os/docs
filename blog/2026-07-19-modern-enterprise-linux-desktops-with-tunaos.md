---
slug: modern-enterprise-linux-desktops-with-tunaos
title: "Modern Enterprise Linux Desktops with TunaOS"
authors: [james]
tags: [tunaos, almalinux, bootc, enterprise, announcement]
date: 2026-07-19
---

Enterprise Linux has a desktop problem. RHEL, AlmaLinux, and CentOS Stream are built for servers — rock-solid, long-lived, boringly stable — and that's exactly right for a fleet of production hosts. It's the wrong set of tradeoffs for the machine a developer or admin actually sits in front of every day. So most EL shops end up running Fedora or Ubuntu on the desktop and something else entirely in the datacenter, which means two package ecosystems, two update cadences, two sets of "why doesn't this work the same way" tickets.

TunaOS exists to close that gap: real desktop environments, built as `bootc` images directly on top of the Enterprise Linux base your servers already run.

<!-- truncate -->

## Same base, actual desktop

**Albacore** is the flagship variant — AlmaLinux 10, which tracks RHEL 10 rebuild-for-rebuild. On top of that base you get a real choice of desktop: GNOME, KDE Plasma, COSMIC, or Niri, each shipped as its own `bootc` image (`ghcr.io/tuna-os/albacore:gnome`, `:kde`, `:cosmic`, `:niri`, plus `-hwe` and `-nvidia` variants for newer hardware). Sibling variants track the rest of the EL family — **Yellowfin** (AlmaLinux Kitten 10, the rolling preview of what becomes the next AlmaLinux major), **Skipjack** (CentOS Stream 10), and **Redfin** (RHEL 10 itself, local-build only due to licensing).

None of this is a fork or a compatibility shim. It's the actual AlmaLinux/RHEL package set and lifecycle, with a desktop layered on in the same container-image pipeline used for everything else in `bootc`'s world.

## What bootc actually buys you

The image *is* the update. `bootc status` shows you the exact container reference you're booted into; `bootc upgrade` pulls the next one, stages it, and reboots into it — or rolls back to the previous deployment if something's wrong, the same way `rpm-ostree` did on Fedora Silverblue, except the artifact is a normal OCI image you can build, scan, and push through the same registry and CI tooling as everything else your team ships.

For an EL shop, that's the part that matters: your desktop images can go through the same pipeline discipline as your server images. Pin a known-good digest for a training lab. Roll a security fix org-wide by pushing a new tag. Diff two deployments to see exactly what changed. None of that requires learning a second toolchain — it's the one you already run in production.

## Try it

Downloads are live at [tunaos.org/download](https://tunaos.org/download), or pull a variant directly:

```bash
podman pull ghcr.io/tuna-os/albacore:gnome
```

See the [variant table](/docs/tunaos/) for the full matrix of bases, desktops, and hardware tags, and [Managing TunaOS with Bootc](/docs/tunaos/bootc-usage) for day-to-day `bootc` usage once you're running it.

If you hit something that doesn't work, or the download page gives you trouble, tell us in [Discussions](https://github.com/tuna-os/tunaOS/discussions) — that's exactly what it's there for.
