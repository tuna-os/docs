---
slug: manifest-driven-build-system
title: "The Image Factory: Manifest-Driven Builds"
authors: [james]
tags: [architecture, build-system, refactor]
date: 2026-07-07
---

# The Image Factory: Manifest-Driven Builds

TunaOS just shipped the biggest architectural change since the project started: **declarative desktop manifests**. Adding a new desktop environment is now a YAML file — no shell scripts, no Containerfile changes, no CI edits.

<!-- truncate -->

## The Problem

The old build system had a 150-line bash script per desktop (gnome.sh, kde.sh, cosmic.sh, niri.sh, xfce.sh). Each one was an imperative mess of `if fedora; dnf install X; elif el10; dnf group install Y; fi`. Adding GNOME 50 meant duplicating gnome.sh. Adding Ubuntu support meant adding `elif apt; pkg_install Z` to every single script.

The Justfile's `_build` recipe was 150 lines of positional-argument spaghetti. Understanding what `arg 7` meant required reading the recipe signature.

## The Solution

### Desktop Manifests

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

A single generic installer (`install-desktop.sh`) reads the manifest and handles everything: groups, packages, COPRs, version locks, display manager enablement.

### Build Engine Extraction

The Justfile `_build` monolith became `scripts/build-image-inner.sh` — 198 lines, env-var driven (not 11 positional args). The Justfile is now a 25-line export wrapper.

### Flavor Resolution

`scripts/resolve-flavor.sh` maps any flavor to its build parameters. 18 BATS tests cover every path. The old 50-line if/elif/case block in the Justfile is gone.

## The Numbers

| Before | After |
|--------|-------|
| 5 × 150-line DE scripts | 1 × 159-line generic installer + 5 YAML manifests |
| 150-line `_build` recipe (11 positional args) | 25-line wrapper + 198-line env-var script |
| 3 Containerfiles for HWE/nvidia (213 lines dead code) | 1 parameterized `Containerfile.overlay` (72 lines) |
| 0 tests for flavor routing | 18 BATS cases |

## What's Next

The manifest system now supports **4 package managers** (dnf, apt, pacman, zypper) and we've added Arch Linux (marlin) and CachyOS (wahoo) variants. The matrix grows:

```
9 base variants × 6 desktops × 3 hardware layers = image factory
```

Adding a new distro = write a Containerfile that bootcifies it + add pacman/apt/dnf sections to the manifests. The build system handles the rest.
