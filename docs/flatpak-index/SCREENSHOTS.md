---
sidebar_position: 9
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
  │  Xvfb + target readiness + ImageMagick
  ▼
docs/screenshots/NN-name.png          committed back to main
docs/screenshots/NN-name.receipt.json provenance and evidence
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
  id: capture
  with:
    command: ./target/release/myapp
    name: 01-main
    out-dir: docs/screenshots      # default
    geometry: 1000x700             # default, Flathub's maximum
    settle: "6"                    # seconds to let the window paint
    app-id: org.tunaos.myapp       # optional explicit application ID
    wm-class: MyApp                # optional explicit WM_CLASS
    readiness-predicate: ""        # optional command asserting target readiness
    deadline: "30"                 # optional monotonic deadline in seconds
    capture-mode: window           # "window" (default) or "display"
    required: "true"               # "true" (default) or "false" (advisory)
```

It drives a real X server and photographs the application's own window. It
is toolkit-agnostic: GTK, Qt, Electron and plain Xt apps all work, without an
in-process harness written per toolkit.

For direct calls, install `Xvfb`, `xdpyinfo`, `xprop`, `xwininfo`, `xdotool`,
`import`, and `identify`. The action installs them for you.

It writes temporary PNG files on the output filesystem. This keeps the final
rename atomic across bind mounts. Process logs stay in a separate private
directory.

### Action outputs

The action provides step outputs for pipeline verification:

- `image`: Path to the captured PNG file.
- `receipt`: Path to the JSON receipt, with its schema version.
- `outcome`: Execution outcome (`passed`, `failed`, `blocked`, `not_run`, `unsupported`, `flaky`).
- `window-id`: ID of the observed X11 window.
- `frame-hash`: SHA-256 digest of the captured frame.
- `target-pid`: ID of the target process.

### Correctness contract

- **Target identity**: Matches the host PID or descendants, explicit `app-id`, or explicit `wm-class`. Sandboxed apps use explicit or inferred identity. It rejects unrelated windows and blank surfaces.
- **Process state and deadlines**: Checks app state before the window appears and after paint settles. A monotonic deadline limits the time for each readiness command. A timed-out predicate loses its own process group.
- **Output integrity**: Deletes old PNG files before capture. After verification, it publishes output with an atomic file move. Failed captures produce a failure receipt, not a success image.
- **Owned cleanup**: Keeps temporary state in private directories. Stops only owned processes and descendants. Xvfb removes its own socket and lock. The script does not remove shared X11 paths. If a display is in use, capture fails and leaves that server intact. The receipt shows all errors from teardown.
- **Evidence receipt**: Writes JSON with `schema_version: 1`. Records source and action revisions, run identifiers, requested and observed identities, executable digest, environment, frame hash, and times. It also records diagnostics and outcome. It redacts recognized credentials in commands, predicate fields, logs, and errors.

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
