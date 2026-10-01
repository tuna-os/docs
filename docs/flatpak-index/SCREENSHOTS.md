---
sidebar_position: 6
title: "SCREENSHOTS"
---

An app with no `<screenshots>` renders an empty frame in Bazaar, GNOME
Software and Discover. Screenshots are also the one part of AppStream metadata
that goes stale on its own: the app changes, the picture does not.

So CI generates them from the real app and references them from
`main`. Nobody takes them by hand.

## The shape

```
.github/workflows/screenshots.yml     runs on push to main
  │  builds the app, then for each screen:
  ▼
tuna-os/flatpak-index/.github/actions/capture-screenshots
  │  Xvfb + the app's own window + ImageMagick
  ▼
docs/screenshots/NN-name.png          committed back to main
  │  referenced by
  ▼
data/<app-id>.metainfo.xml            <screenshot><image>raw.githubusercontent…/main/…
```

The workflow re-commits on every push to `main`, and the metainfo
points at `main`. The pictures in the software centre follow the app with no
further upkeep.

## Using the shared action

```yaml
- uses: tuna-os/flatpak-index/.github/actions/capture-screenshots@main
  with:
    command: ./target/release/myapp
    name: 01-main
    out-dir: docs/screenshots      # default
    geometry: 1000x700             # default, Flathub's maximum
    settle: "6"                    # seconds to let the window paint
```

It drives a real X server and photographs the application's own window. It
is toolkit-agnostic: GTK, Qt, Electron and plain Xt apps all work, without an
in-process harness written per toolkit.

**It fails the job.** It never publishes a bad image. It covers each
case: the app exits before it maps a window, maps no window at all, or
paints a blank one. In every failure it writes nothing, because a blank PNG
left on disk looks like a real screenshot.

An app that renders its own screens more precisely should keep that setup.
`tuna-installer-kde` renders each wizard step from the real QML module with
only `main.cpp` swapped. That beats a photo of a live window
because it can reach states a cold start cannot. Use the shared action when
there is no such harness.

## What to capture

Follow [Flathub's quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines):

- **3–6 screenshots** for a typical app; one is the bare minimum.
- **Window only**, no desktop background, default theme.
- **1000×700 maximum** (2000×1400 for HiDPI). The action defaults to 1000×700
  and fits the window to it.
- **Captions**: one sentence, no trailing period. Describe what the
  image shows, not the filename. Three captions from filenames were wrong;
  one described a language picker that does not exist.
- The first entry should be `type="default"`.

## Checking it

`enrich-index.py` reports any published app whose catalogue declares no
screenshots:

```bash
curl -sSfL -o served.json https://tunaos.org/flatpak/index/static
./scripts/enrich-index.py served.json --check
```

Screenshot-less apps come back as `~` warnings, not `!` problems: such
an app is installable and correctly described, but poorly presented. The daily
[`check-metadata.yml`](https://github.com/tuna-os/flatpak-index/blob/main/.github/workflows/check-metadata.yml) run surfaces
them.
