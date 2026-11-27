---
sidebar_position: 13
title: "xfce component set"
---

brussels is a Wayland-only image. Its compositor is xfwl4, so it uses the
XFCE 4.21 development series. This page lists the version of each XFCE
component and the reason for each version that is not a 4.21 release tag.

## Rules

1. Use the newest upstream 4.21.x release tag of each core component.
2. Use a 4.20.x tag only when the component has no 4.21 tag. Record the
   reason in the table.
3. Use a git snapshot only when no tag is new enough for xfwl4. Record the
   reason in the table. Only libwlembed uses a snapshot, because it has no
   tags.
4. Apps and panel plugins have their own version numbers. Use their newest
   release tag.
5. A patch must have a header. The header gives the upstream link, the
   upstream status, and the reason for the patch.

## Core components

| Component | Version | Note |
| --- | --- | --- |
| xfce4-dev-tools | 4.21.2 | Release tarball. The git tag does not have the man page. |
| libxfce4util | 4.21.0 | xfce4-session 4.21.2 needs 4.21.0 or later. |
| xfconf | 4.21.2 | xfwl4 needs 4.21.2 or later. |
| libxfce4ui | 4.21.9 | xfwl4 needs 4.21.4 or later. |
| garcon | 4.21.0 | |
| libxfce4windowing | 4.20.7 | No 4.21 tag. The xfwl4 README asks for 4.20.7 or later. |
| exo | 4.21.0 | Release tarball. The git tag needs gtk-doc to build. |
| xfwm4 | 4.20.0 | No 4.21 tag. The image keeps only the themes and the settings dialogs. The xfwl4 README asks for both. |
| xfce4-panel | 4.21.3 | Needs libxfce4session-client from xfce4-session 4.21.2. |
| xfce4-session | 4.21.2 | Provides libxfce4session-client. |
| xfce4-settings | 4.21.3 | The xfwl4 README asks for 4.21.3 or later. |
| xfdesktop | 4.21.1 | The xfwl4 README asks for 4.21.0 or later. |
| thunar | 4.21.7 | |
| tumbler | 4.21.1 | |
| xfce4-appfinder | 4.21.1 | |
| xfce4-power-manager | 4.21.1 | |
| xfwl4 | 4.21.1 | |

## Apps and libraries

| Component | Version | Note |
| --- | --- | --- |
| xfce4-terminal | 1.2.0 | |
| xfce4-notifyd | 0.9.7 | |
| xfce4-screensaver | 4.20.2 | No 4.21 tag. Built with the Wayland back end only. |
| libwlembed | commit 3bf51b55 | No release tag. xfce4-screensaver needs it for its Wayland back end. |
| gtk-layer-shell | 0.10.1 | The junctions do not have it. The panel, the desktop, and the notification daemon need it on Wayland. |
| vte (GTK 3) | 0.84.0 | gnome-build-meta builds only the GTK 4 library. xfce4-terminal needs the GTK 3 library. |
| libwnck | 43.3 | xfwm4 needs it to build. The junctions do not have it. |

## Patches

The image has no XFCE patches. The xfce4-terminal patch was necessary only
because gtk-layer-shell was missing. The image now has gtk-layer-shell, so
the patch is gone.

## How to update

`track-bst-sources.yml` runs `bst source track`. It moves each element to
the newest tag that matches its `track` pattern. The `track` pattern of each
4.21 component is `<name>-4.21.*`, so a 4.20.x maintenance tag cannot replace
it.

## CI checks

`scripts/check-xfce-policy.py` does three checks. The `Unit Tests` job runs
them without network access. The `XFCE Policy` job runs them with
`--upstream`.

1. Component set. Each core component must be on a 4.21 tag, or have an
   entry in `series_exceptions` in `tests/xfce-policy.yml`. A git snapshot
   must have an entry in `snapshot_exceptions`.
2. Patch headers. Each patch that an XFCE element applies must have an
   `Upstream-Status:` line and a `Reason:` line. It must also have an
   `Upstream:` link, unless the status is `Inappropriate`.
3. Configuration drift. Each xfconf channel file that the image ships must
   have an entry in `config_overrides`. The entry lists the properties in
   which the file is different from upstream. With `--upstream`, the check
   gets the upstream default file at the pinned tag. The real differences
   must be the same as the list. An unlisted difference is drift. A listed
   property with the upstream value is unnecessary.

This is an example of a header:

```text
Upstream: https://gitlab.xfce.org/xfce/thunar/-/merge_requests/123
Upstream-Status: Submitted
Reason: Fixes a crash on Wayland when the window closes.
```
