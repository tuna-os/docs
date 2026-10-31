---
sidebar_position: 20
title: "Contributor Hub"
description: "How to start contributing to TunaOS, and which of the 40+ projects matches your skills."
---

# Contribute to TunaOS

TunaOS is a set of related projects, not one program. This hub is the entry
point. It lists every project that publishes a `CONTRIBUTING` page, says what
each one does, and shows where to start.

Pick a path below. Then open a `CONTRIBUTING` page to read the setup and PR
workflow for that project.

## Your path: tester, contributor, maintainer

Contribution is a ladder. You move up as you earn trust. Most people start at
Tester and never need to go further.

| Level | What you do | How to start |
|---|---|---|
| **Tester** | Run an image or app and report what breaks. | Install a variant. Open a clear bug report with steps to repeat. |
| **Contributor** | Fix bugs, write docs, add features. | Pick a [good first issue](#find-your-first-issue). Open a PR that links it. |
| **Maintainer** | Own a project: review PRs, merge, set direction. | Contribute steadily for months. A current maintainer nominates you. |

Concrete examples per level:

- **Tester:** You boot Bonito on a laptop, notice the Wi-Fi drops at night,
  and file an issue with the logs. That report helps a Contributor fix it.
- **Contributor:** You take a [good first issue](#find-your-first-issue) in
  `quickcast`, write the fix, and your PR merges.
- **Maintainer:** You have merged ten PRs to `corral`. A maintainer asks you to
  review the next ten.

## Pick a project

The tables below group the 40+ projects by the kind of work they do. Each row
links to that project's `CONTRIBUTING` page on the docs site. Archived or
deprecated projects carry a note so you do not open work for a repo that will
not take it.

### OS images and desktops

| Project | What it does | Contribute |
|---|---|---|
| [tunaos](/tunaos/CONTRIBUTING) | The main TunaOS repo: cloud-native, immutable desktop images on bootc. | [docs](/tunaos/CONTRIBUTING) |
| [dakota](/dakota/CONTRIBUTING) | The reference BuildStream GNOME OS image, made by Project Bluefin. | [docs](/dakota/CONTRIBUTING) |
| [tromso](/tromso/CONTRIBUTING) | Tromsø: a BuildStream KDE (Plasma 6) bootc image. | [docs](/tromso/CONTRIBUTING) |
| [xfce-linux](/xfce-linux/CONTRIBUTING) | XFCE Linux: a BuildStream XFCE Wayland bootc image. | [docs](/xfce-linux/CONTRIBUTING) |
| [marlin](https://github.com/tuna-os/marlin) | Marlin: an Arch Linux variant on a bootc base. | [docs](/marlin/CONTRIBUTING) |
| [ghostty](/ghostty/CONTRIBUTING) | Ghostty: a fast, GPU-accelerated terminal. | [docs](/ghostty/CONTRIBUTING) |
| [iced](/iced/CONTRIBUTING) | iced: a cross-platform GUI toolkit for Rust. | [docs](/iced/CONTRIBUTING) |

### Installers

| Project | What it does | Contribute |
|---|---|---|
| [bootc-installer](/bootc-installer/CONTRIBUTING) | The TunaOS system installer. | [docs](/bootc-installer/CONTRIBUTING) |
| [bootc-installer-asahi](/bootc-installer-asahi/CONTRIBUTING) | The Apple Silicon (Asahi Linux) installer path. | [docs](/bootc-installer-asahi/CONTRIBUTING) |
| [tuna-installer-cosmic](/tuna-installer-cosmic/CONTRIBUTING) | Installer for the COSMIC variant. | [docs](/tuna-installer-cosmic/CONTRIBUTING) |
| [tuna-installer-kde](/tuna-installer-kde/CONTRIBUTING) | Installer for the KDE variant. | [docs](/tuna-installer-kde/CONTRIBUTING) |
| [tuna-installer-niri](/tuna-installer-niri/CONTRIBUTING) | Installer for the Niri variant. | [docs](/tuna-installer-niri/CONTRIBUTING) |
| [tuna-installer-xfce](/tuna-installer-xfce/CONTRIBUTING) | Installer for the XFCE variant. | [docs](/tuna-installer-xfce/CONTRIBUTING) |
| [bootc-installer-tui](/bootc-installer-tui/CONTRIBUTING) | A text-mode installer. **Archived.** | [docs](/bootc-installer-tui/CONTRIBUTING) |

### Desktop apps

| Project | What it does | Contribute |
|---|---|---|
| [finupdate](/finupdate/CONTRIBUTING) | A modern GTK4/libadwaita system update frontend for Bluefin. | [docs](/finupdate/CONTRIBUTING) |
| [quickcast](/quickcast/CONTRIBUTING) | A small GNOME screen recorder. | [docs](/quickcast/CONTRIBUTING) |
| [protota](/protota/CONTRIBUTING) | A mockup tool for Adwaita app UIs, built to the GNOME HIG. | [docs](/protota/CONTRIBUTING) |
| [mandelbrot](/mandelbrot/CONTRIBUTING) | Mandelbrot: a Matrix chat client (a Fractal fork) in Rust on GTK 4. | [docs](/mandelbrot/CONTRIBUTING) |
| [gtk-office-suite](/gtk-office-suite/CONTRIBUTING) | TunaOS Office Suite: Letters, Tables, and Decks. | [docs](/gtk-office-suite/CONTRIBUTING) |
| [gnome-hive-monitor](/gnome-hive-monitor/CONTRIBUTING) | Watch a Hive instance from the GNOME top bar. | [docs](/gnome-hive-monitor/CONTRIBUTING) |
| [paperwm](/paperwm/CONTRIBUTING) | PaperWM: a tiling window-manager extension for GNOME. | [docs](/paperwm/CONTRIBUTING) |
| [remora](/remora/CONTRIBUTING) | Add local layers to a bootc image, in a container-native way. | [docs](/remora/CONTRIBUTING) |
| [blueshell](/blueshell/CONTRIBUTING) | Blueshell: a container-native terminal for GNOME. | [docs](/blueshell/CONTRIBUTING) |

### CLI, tooling, and infrastructure

| Project | What it does | Contribute |
|---|---|---|
| [wootc](/wootc/CONTRIBUTING) | Try Linux inside Windows, keep your work, choose native boot later. | [docs](/wootc/CONTRIBUTING) |
| [corral](/corral/CONTRIBUTING) | Herd your VMs and containers into your tailnet. | [docs](/corral/CONTRIBUTING) |
| [spindle](/spindle/CONTRIBUTING) | A Matrix homeserver that stores rooms as a linear log. | [docs](/spindle/CONTRIBUTING) |
| [bluefin-cli](/bluefin-cli/CONTRIBUTING) | A CLI for building and managing Bluefin-family bootc images. | [docs](/bluefin-cli/CONTRIBUTING) |
| [iso-builder](/iso-builder/CONTRIBUTING) | Build a live ISO from a container image, entirely in the browser. | [docs](/iso-builder/CONTRIBUTING) |
| [tacklebox](/tacklebox/CONTRIBUTING) | Manage the TBOX partition and set up ISOs for TunaOS devices. | [docs](/tacklebox/CONTRIBUTING) |
| [flatpak-index](/flatpak-index/CONTRIBUTING) | Builds the TunaOS Flatpak remote index. | [docs](/flatpak-index/CONTRIBUTING) |
| [homebrew-tap](/homebrew-tap/CONTRIBUTING) | A Homebrew tap for TunaOS tooling. | [docs](/homebrew-tap/CONTRIBUTING) |
| [scoop-bucket](/scoop-bucket/CONTRIBUTING) | A Scoop bucket for TunaOS tooling. | [docs](/scoop-bucket/CONTRIBUTING) |
| [hive](/hive/CONTRIBUTING) | Hive: distributed compute that coordinates AI coding agents. | [docs](/hive/CONTRIBUTING) |
| [hive-operator](/hive-operator/CONTRIBUTING) | A Kubernetes operator for the TunaOS Hive fleet. | [docs](/hive-operator/CONTRIBUTING) |
| [bst-ci](/bst-ci/CONTRIBUTING) | Shared reusable GitHub Actions workflows for BuildStream CI. | [docs](/bst-ci/CONTRIBUTING) |
| [debian-copr](/debian-copr/CONTRIBUTING) | Debian/Ubuntu APT build system with GitHub Actions and R2. | [docs](/debian-copr/CONTRIBUTING) |
| [tunaos-packages](/tunaos-packages/CONTRIBUTING) | The source-controlled package repository (packaging, patches, signing). | [docs](/tunaos-packages/CONTRIBUTING) |

### Shared code and utilities

| Project | What it does | Contribute |
|---|---|---|
| [suite-common-rust](/suite-common-rust/CONTRIBUTING) | The Rust rewrite of the office-suite shared code. | [docs](/suite-common-rust/CONTRIBUTING) |
| [suite-common](/suite-common/CONTRIBUTING) | The older office-suite shared code. **Deprecated; see the Rust rewrite.** | [docs](/suite-common/CONTRIBUTING) |
| [changelog-action](/changelog-action/CONTRIBUTING) | Generate a changelog between two container image versions. | [docs](/changelog-action/CONTRIBUTING) |
| [branding](/branding/CONTRIBUTING) | Flat vector brand marks for every TunaOS variant. | [docs](/branding/CONTRIBUTING) |
| [ccleft](/ccleft/CONTRIBUTING) | Track how much AI coding-agent quota you have left. | [docs](/ccleft/CONTRIBUTING) |
| [rdocx](/rdocx/CONTRIBUTING) | One `Document` for the complete Word (DOCX) workflow in Rust. | [docs](/rdocx/CONTRIBUTING) |
| [rust-atomicwrites](/rust-atomicwrites/CONTRIBUTING) | A Rust crate for writing files without partial results. | [docs](/rust-atomicwrites/CONTRIBUTING) |
| [dualcut](/dualcut/CONTRIBUTING) | Image diffing tool. **Deprecated; work moved to shrimply.** | [docs](/dualcut/CONTRIBUTING) |
| [kde-build-meta](/kde-build-meta/CONTRIBUTING) | KDE build metadata. **Superseded by Tromsø.** | [docs](/kde-build-meta/CONTRIBUTING) |
| [bonito-x13s](/bonito-x13s/CONTRIBUTING) | Bonito build for AMD X3D. **Archived.** | [docs](/bonito-x13s/CONTRIBUTING) |
| [chunkah](/chunkah/CONTRIBUTING) | Image tooling. **Archived.** | [docs](/chunkah/CONTRIBUTING) |
| [dakota-iso](/dakota-iso/CONTRIBUTING) | Dakota ISO builds. **Archived.** | [docs](/dakota-iso/CONTRIBUTING) |
| [dakota-x13s](/dakota-x13s/CONTRIBUTING) | Dakota build for AMD X3D. **Archived.** | [docs](/dakota-x13s/CONTRIBUTING) |
| [tromso-iso](/tromso-iso/CONTRIBUTING) | Tromsø ISO builds. **Archived.** | [docs](/tromso-iso/CONTRIBUTING) |
| [ubuntu](/ubuntu/CONTRIBUTING) | Ubuntu variant. **Archived.** | [docs](/ubuntu/CONTRIBUTING) |
| [ubuntu-26-04-iso](/ubuntu-26-04-iso/CONTRIBUTING) | Ubuntu 26.04 ISO builds. **Archived.** | [docs](/ubuntu-26-04-iso/CONTRIBUTING) |

## Find your first issue

Across the org, contributors tag issues as `good first issue`. GitHub keeps this
list live, so it always shows open work today. Use these filters:

- **All TunaOS projects:** [Open issues labeled "good first issue" across the org](https://github.com/issues?q=is%3Aissue+is%3Aopen+org%3Atuna-os+label%3A%22good+first+issue%22)
- **Apps and tooling:** [good first issue in docs, corral, spindle, quickcast, wootc](https://github.com/search?q=org%3Atuna-os+is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22&type=issues)

Each issue links to the project. Read that project's `CONTRIBUTING` page first,
then open a PR that mentions the issue number.

## Projects needing help

The count of open good first issues moves every day. A static number on this
page would be wrong by the time you read it, so do not trust one. Instead, open
the [live good first issue list](#find-your-first-issue) and sort by repository
to see which projects have the most open work right now.

A weekly GitHub Action could publish current counts to this page. That is an
optional follow-up. It needs a maintainer to add the workflow; it is not in
place today.

## Before you open a PR

Every project runs the same checks. Before you submit:

1. Read the project's `CONTRIBUTING` page for its setup.
2. Follow the site-wide steps in the TunaOS contribution guide: run `just preflight` and `just build`.
3. Keep one change per PR. List the commands you ran in the PR description.

See the [Community page](community.md) for chat, discussion, and the code of
conduct.

---

*Every contribution, no matter how small, helps build better desktops for
Enterprise Linux.*
