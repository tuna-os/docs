---
sidebar_position: 4
title: "METAINFO"
---

Software centres — [Bazaar](https://github.com/kolunmi/bazaar), GNOME Software,
KDE Discover — render an app page from **AppStream** metadata. When that
metadata is missing the page falls back to the raw application ID, an
"Unknown" licence and an empty screenshot frame.

For an OCI remote like ours the metadata travels as image labels. This document
covers how it gets there and what to put in it.

## How the metadata reaches the remote

```
data/<app-id>.metainfo.xml           in the app repo
  │  meson/make installs it to
  ▼
/app/share/metainfo/<app-id>.metainfo.xml
  │  flatpak-builder runs appstreamcli compose at the end of the build
  ▼
/app/share/app-info/xmls/<app-id>.xml.gz     catalogue XML
/app/share/app-info/icons/flatpak/{64x64,128x128}/<app-id>.png
  │  flatpak build-bundle --oci reads those and writes image labels
  ▼
org.freedesktop.appstream.appdata            catalogue XML
org.freedesktop.appstream.icon-64            data:image/png;base64,...
org.freedesktop.appstream.icon-128           data:image/png;base64,...
  │  scripts/update-index.py copies the labels into
  ▼
index/static                                 published at tunaos.org/flatpak/
  │  flatpak builds the remote's AppStream catalogue from the labels
  ▼
Bazaar / GNOME Software / Discover
```

Every link in that chain must hold. If any one drops the metadata, the app page
is blank — and the failure is silent at every step.

Check an app end to end with:

```bash
./scripts/enrich-index.py index/static --check
```

It reports which published images carry no AppStream metadata.

## What each field controls

| Bazaar shows | Comes from |
| --- | --- |
| App title | `<name>` |
| Icon | `org.freedesktop.appstream.icon-64` / `-128` labels |
| One-line description | `<summary>` |
| Licence badge | `<project_license>` — must be a valid SPDX identifier |
| Age Rating | `<content_rating type="oars-1.1">` |
| Desktop Only / Mobile | `<requires><display_length>` and `<supports><control>` |
| Screenshots | `<screenshots>` — needs publicly reachable image URLs; generate them in CI, see [SCREENSHOTS.md](https://github.com/tuna-os/flatpak-index/blob/main/docs/SCREENSHOTS.md) |
| Release notes | `<releases>` |
| Accent colour | `<branding><color>` |
| Support / donate link | `<url type="donation">` |
| Download size | `org.flatpak.download-size` (automatic) |
| Risk level | the app's `finish-args` permissions (automatic) |
| Downloads/Month | Flathub's statistics API only. It stays blank on a custom remote — there is nothing to add on our side. |

## Writing the file

Start from [`templates/org.tunaos.example.metainfo.xml`](https://github.com/tuna-os/flatpak-index/blob/main/templates/org.tunaos.example.metainfo.xml).
It follows [Flathub's quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines),
which is the same bar Bazaar renders against, and every field is annotated
inline.

The constraints worth repeating:

- **`<name>`** — 15 characters or fewer reads best, 20 maximum. No version, no
  tagline.
- **`<summary>`** — 10–25 characters ideal, 35 maximum. Sentence case, no
  trailing period, no leading article, does not repeat the name.
- **`<description>`** — 3–10 lines. Must not restate the summary.
- **`<screenshots>`** — at least one, 3–6 for a typical app. Window only, no
  desktop background, default theme, 1000×700 maximum (2000×1400 HiDPI). Do not
  take these by hand: generate them in CI from the real app and commit them, so
  they cannot go stale as the UI changes. See [SCREENSHOTS.md](https://github.com/tuna-os/flatpak-index/blob/main/docs/SCREENSHOTS.md)
  for the shared capture action and the wiring.
- **`<releases>`** — real notes per release, not "bug fixes and improvements".
- **`<content_rating type="oars-1.1" />`** — an empty element is correct for
  most apps and is what turns the "?" age-rating tile into a real value.

## Making sure the icon is picked up

`appstreamcli compose` builds the `icon-64` / `icon-128` labels by scaling the
app's hicolor icon. The build must install one at:

```
/app/share/icons/hicolor/scalable/apps/<app-id>.svg
```

or PNGs at `128x128` and `64x64`. Without it, the labels are absent and the app
shows a generic placeholder.

## Validating locally

```bash
# 1. The source file
appstreamcli validate data/org.tunaos.<app>.metainfo.xml

# 2. What the build actually produced
flatpak build-bundle --oci --arch=x86_64 repo <app>.oci org.tunaos.<app>
python3 -c "
import json,pathlib
d=pathlib.Path('<app>.oci')
m=json.loads((d/'index.json').read_text())['manifests'][0]['digest'].split(':')[1]
man=json.loads((d/'blobs/sha256'/m).read_text())
cfg=json.loads((d/'blobs/sha256'/man['config']['digest'].split(':')[1]).read_text())
labels=cfg['config']['Labels']
for k in sorted(labels):
    if 'appstream' in k: print(k, len(labels[k]))
"
```

If that prints nothing, the metainfo file was not installed into the build —
check that the build system actually installs it to `/app/share/metainfo/`.

## Publishing

App repositories vendor [`scripts/update-index.py`](https://github.com/tuna-os/flatpak-index/blob/main/scripts/update-index.py)
at `.github/scripts/update-index.py`. Pass `--require-appstream` to make the
publish job fail rather than silently ship an app with no metadata:

```bash
python3 .github/scripts/update-index.py \
  --oci-dir <app>.oci \
  --index-file index-repo/static/flatpak/index/static \
  --repo-name tuna-os/<app> \
  --require-appstream \
  --tags latest
```
