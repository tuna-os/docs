---
sidebar_position: 25
title: "gnome desktop contract"
---

`gnome-shell` plus a session file is not a complete desktop. In particular,
the session can start while file dialogs, screenshots, removable media,
portals, and credentials backed by `gnome-keyring` remain unusable.

The package repository now provides
[`verify-gnome-desktop-experience.py`](https://github.com/tuna-os/tunaos-packages/blob/main/scripts/verify-gnome-desktop-experience.py),
a package-manager-neutral hard-fail check. It needs packages for the core session,
file manager, portal, and `gnome-keyring`:

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

Run it after the package installation for the base, before you publish the
image. Examples:

```bash
rpm -qa --qf '%{NAME}\\n' | \
  python3 scripts/verify-gnome-desktop-experience.py /dev/stdin

dpkg-query -W -f '${binary:Package}\\n' | \
  python3 scripts/verify-gnome-desktop-experience.py /dev/stdin
```

The test validates names of packages instead of image size or package
count. Metapackages expand to different numbers of packages across
openSUSE, Debian, and Ubuntu. A size threshold could miss an absent component
or reject a valid dependency closure. Translations for each base must use the
exact package names from that package manager. Any name that does not resolve
must fail the build.
