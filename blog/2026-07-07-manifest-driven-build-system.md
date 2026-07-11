---
slug: manifest-driven-build-system
title: "The Image Factory: Manifest-Driven Builds"
authors: [james]
tags: [architecture, build-system, refactor]
date: 2026-07-07
---

# The Image Factory: Manifest-Driven Builds

Biggest change to the build system since I started this thing: desktops are now just a YAML file. No shell script per desktop, no touching the Containerfile, no CI edits. Wanted to write this one up because I'm pretty happy with how it turned out.

<!-- truncate -->

## What it was before

Every desktop had its own 150-line bash script — gnome.sh, kde.sh, cosmic.sh, niri.sh, xfce.sh. Each one was a pile of `if fedora; dnf install X; elif el10; dnf group install Y; fi`. Wanted GNOME 50? Copy-paste gnome.sh and hope you didn't miss a spot. Wanted Ubuntu support? Go add `elif apt; pkg_install Z` to five different files and pray you got them all consistent.

The Justfile wasn't much better. The `_build` recipe was 150 lines of positional arguments, and if you wanted to know what `arg 7` did you had to go read the whole signature. Not fun to touch.

## What it is now

### Desktop manifests

Each desktop is now a YAML file in `manifests/desktops/`:

```yaml
# manifests/desktops/kde.yaml
display_manager: sddm
packages:
  fedora:
    groups: [kde-desktop]
    packages: [sddm, dolphin, konsole, kate, ...]
  el10:
    groups: ["KDE Plasma Workspaces", ...]
    optional: [kdeconnect, nvtop, ...]
  pacman:
    - plasma-desktop
    - sddm
    - dolphin
    - konsole
  apt:
    - kde-plasma-desktop
    - sddm
versionlock: [plasma-desktop, "qt6-*"]
```

One generic installer (`install-desktop.sh`) reads the manifest and does the rest — groups, packages, COPRs, version locks, enabling the display manager, all of it.

### Pulling the build engine out

The `_build` monolith in the Justfile is now `scripts/build-image-inner.sh` — 198 lines, driven by env vars instead of 11 positional args you had to memorize. The Justfile itself is down to a 25-line wrapper.

### Flavor resolution

`scripts/resolve-flavor.sh` maps a flavor to its build params now, and I actually wrote 18 BATS tests to cover the paths instead of just hoping. The old 50-line if/elif/case block in the Justfile is just gone.

## Numbers, if you like that sort of thing

| Before | After |
|--------|-------|
| 5 × 150-line DE scripts | 1 × 159-line generic installer + 5 YAML manifests |
| 150-line `_build` recipe (11 positional args) | 25-line wrapper + 198-line env-var script |
| 3 Containerfiles for HWE/nvidia (213 lines dead code) | 1 parameterized `Containerfile.overlay` (72 lines) |
| 0 tests for flavor routing | 18 BATS cases |

## What's next

Manifests now cover 4 package managers — dnf, apt, pacman, zypper — and I've since added Arch (marlin) and Debian (flounder, flounder-sid) on top of it. The matrix just keeps growing:

```
9 base variants × 5-6 desktops × 3 hardware layers
```

Adding a new distro at this point is: write a Containerfile that bootc-ifies it, add the pacman/apt/dnf sections to the manifests, done. The build system doesn't care what you throw at it.
