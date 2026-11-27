---
sidebar_position: 8
title: "migration brussels"
---

The project that was "XFCE Linux" is now **Brussels**. The GitHub repository
is `tuna-os/brussels`, and the image name is `ghcr.io/tuna-os/brussels`.
The image content is the same. Brussels stays a Wayland desktop on xfwl4.

## If you installed `ghcr.io/tuna-os/xfce-linux`

Your system continues to update. You do not have to do anything now.

Each build publishes `ghcr.io/tuna-os/brussels` first. The build then copies
each tag to `ghcr.io/tuna-os/xfce-linux` on the registry and compares the two
digests. The earlier name is thus an alias of the same image, not a second
build. The build fails if the two names differ.

> **Not published yet:** `ghcr.io/tuna-os/brussels` has no public image yet.
> Until it has, use the earlier name `ghcr.io/tuna-os/xfce-linux` with the
> same tags. It gets the same image.

Move to the new name when it is convenient:

```bash
# nightly channel
sudo bootc switch ghcr.io/tuna-os/brussels:latest

# stable channel
sudo bootc switch ghcr.io/tuna-os/brussels:stable
```

Use the tag that `bootc status` shows for your system. `bootc switch` to the
same digest downloads no new layers.

Before you switch, make sure that the new name has the image:

```bash
skopeo inspect --format '{{.Digest}}' docker://ghcr.io/tuna-os/brussels:latest
skopeo inspect --format '{{.Digest}}' docker://ghcr.io/tuna-os/xfce-linux:latest
```

The two commands print the same digest. If the first command fails, the
first build after the rename has not yet published. Stay on the earlier
name until it does.

The image has no service that tells you to switch. This page and the README
are the notice.

## How long the alias stays

The alias stays for a minimum of six months after the first image appears
at `ghcr.io/tuna-os/brussels`, and it does not end before the first stable
release. A maintainer removes `xfce-linux` from `ALIAS_NAMES` in
`build-multirunner.yml` to end it. The announcement of the end date goes in
this file and in the release notes before that change.

After the alias ends, the earlier name keeps its last image but gets no
updates. A system that still tracks it must run `bootc switch` one time.

## What changed and what did not

| Item | Now | Note |
|---|---|---|
| Product name | Brussels | os-release `NAME`, OCI labels, installer text, documents |
| GitHub repository | `tuna-os/brussels` | GitHub redirects the earlier URL |
| Image | `ghcr.io/tuna-os/brussels` | `ghcr.io/tuna-os/xfce-linux` is an alias |
| Variant image | `ghcr.io/tuna-os/brussels-winblues` | no earlier name, so no alias |
| os-release `ID` | `brussels` | `ID_LIKE=fedora` did not change. See the note below. |
| BuildStream project `name:` | `xfce-linux` | kept |
| Element paths `elements/xfce-linux/`, `oci/xfce-linux.bst` | same | kept |
| CAS cache artifacts `cache-xfce-linux-*` | same | kept |
| ISO directory `xfce-linux/`, `just … xfce-linux` | same | kept |
| ISO file names `xfce-linux-live-*.iso`, R2 path `xfce-linux/` | same | kept; download pages link to them |
| ISO volume label `XFCE_LINUX_LIVE`, serial markers `XFCE_LINUX_*` | same | kept; the boot gates and the Ventoy module read them |

The BuildStream names stay because a change to `name:` in `project.conf`
gives each element a new cache key. The result is a cold build of the full
project. Each chunk job then takes about six hours, and the user gets
nothing from it.
The names in the last four rows are internal identifiers. They can change
later in one planned step, together with the download pages.

### os-release

`files/etc/os-release` has the Brussels identity. The image does not install
that file at this time. The published image has the os-release of the
parent layer, which is GNOME OS. Thus no system in use matches on
`ID=xfce-linux`, and the change of `ID` to `brussels` breaks nothing. When a
later change installs the file, `DEFAULT_HOSTNAME=brussels` applies only to
a system that has no static hostname.

### Installer media

The live ISO and its installer continue to install from
`ghcr.io/tuna-os/xfce-linux` until the first image is public at the new
name. Then one change moves `xfce-linux/payload_ref`, the `BASE_IMAGE`
default in `xfce-linux/Containerfile`, and the installer `imgref` values to
`ghcr.io/tuna-os/brussels`. A system that the ISO installs before that
change tracks the alias and updates in the usual way.

## Signatures

CI signs each name with cosign and no key (see [`signing.md`](https://github.com/tuna-os/brussels/blob/main/docs/signing.md)).
A cosign signature belongs to the repository that it signs. One signature on
`brussels` does not verify a pull of `xfce-linux`. The build therefore signs
the same digest two times, one time for each name.
