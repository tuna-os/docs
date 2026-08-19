---
sidebar_position: 14
title: "gnome desktop contract"
---

`gnome-shell` plus a session file is not a complete desktop. In particular,
the session can start while file dialogs, screenshots, removable media,
portals, and keyring-backed credentials remain unusable.

The package repository now provides
[`verify-gnome-desktop-experience.py`](https://github.com/tuna-os/tunaos-packages/blob/main/scripts/verify-gnome-desktop-experience.py),
a package-manager-neutral hard-fail check. It requires the core session,
file-manager, portal, and keyring packages:

```text
gdm
gnome-keyring
gnome-session
gnome-shell
gvfs
mutter
nautilus
xdg-desktop-portal-gnome
```

Run it after the base-specific package installation, before publishing the
image. Examples:

```bash
rpm -qa --qf '%{NAME}\\n' | \
  python3 scripts/verify-gnome-desktop-experience.py /dev/stdin

dpkg-query -W -f '${binary:Package}\\n' | \
  python3 scripts/verify-gnome-desktop-experience.py /dev/stdin
```

The check deliberately validates names rather than image size or package
count. Metapackages can expand to very different numbers of packages across
openSUSE, Debian, and Ubuntu; a size threshold would miss a missing component
or reject a valid but compact dependency closure. Base-specific translations
should use the package names actually emitted by that package manager, and any
name that cannot be resolved should fail the build rather than be ignored.
