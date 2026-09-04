---
sidebar_position: 1
sidebar_label: "kde-build-meta"

status: unknown
---

> **Superseded by [tuna-os/tromso](https://github.com/tuna-os/tromso).**

The KDE, Plasma, and freedesktop-sdk BuildStream elements in this repository
were consolidated directly into Tromso. Tromso no longer consumes this
repository through a junction, so changes made here do not reach the shipped
image.

This source tree is retained only as historical reference. Make source updates,
build changes, and new contributions in
[tuna-os/tromso](https://github.com/tuna-os/tromso). The active source-tracking
workflow, dependency-update configuration, and tracking policy were removed
when this repository was retired; see
[issue #13](https://github.com/tuna-os/kde-build-meta/issues/13).

## Historical scope

This was a BuildStream project for a KDE Plasma 6 desktop stack, based on the
architecture of GNOME's
[gnome-build-meta](https://gitlab.gnome.org/GNOME/gnome-build-meta). Its tree is
kept intact to preserve history and support archaeology of the consolidation.

For the current architecture, build instructions, package definitions, and
tracking policy, use the
[Tromso repository](https://github.com/tuna-os/tromso).
