---
sidebar_position: 16
title: "runtime probe"
---

The probe is a read-only C shim (`containers/broadway/probe.c`) LD_PRELOADed
into the unmodified packaged GNOME app inside the Broadway capture container.
After the first stable mapped frame it serializes the live widget tree to one
JSON document. A host-side matcher joins those records to the imported source
graph and merges the result into the Broadway comparison artifact as
`origin: "native:<field>"` facts at the top `native` confidence tier of the
Phase 2 scale (`src/utils/nodeGeometry.ts`) — GTK's own answer, one rung above
`declared`. Design record: `docs/adr/0001-runtime-probe-and-remaining-roadmap.md`.

## Containment guarantees

- The shim is fully inert unless `$PROBE_OUTPUT` is set, and `entrypoint.sh`
  sets it only when a `/probe` volume is mounted. Existing captures without
  the mount are byte-identical in behavior.
- If GTK never initializes, the polling thread idles and nothing is written.
  Every consumer treats a missing/malformed `probe.json` as "no evidence",
  never as a failure.
- Read-only: the shim calls only widget getters; its sole write is its own
  output file, published atomically (tmp + rename).
- All widget access happens on the GTK main thread. The constructor's pthread
  only polls `gdk_display_get_default()` and hands off via `g_idle_add`.
- The C artifact is built and exercised only inside the capture containers;
  the web app never ships it.

## Running a probed capture locally

```sh
# 1. Build the runner (the probe compiles against the image's own GTK).
podman build -f containers/broadway/Dockerfile.fedora \
  --build-arg APP_PACKAGE=gnome-calculator --build-arg APP_COMMAND=gnome-calculator \
  -t protota-broadway-probe containers/broadway

# 2. Start it with a /probe volume — the opt-in that arms the probe.
mkdir -p .probe-local
podman run -d --rm -p 8085:8085 -v "$PWD/.probe-local:/probe:Z" protota-broadway-probe
# .probe-local/probe.json appears once the app's first frame settles.

# 3. Clone the version-matched source and run the comparison spec.
git clone --depth 1 --branch 49.2 \
  https://gitlab.gnome.org/GNOME/gnome-calculator.git .gnome-source
BROADWAY_URL=http://127.0.0.1:8085/ BROADWAY_APP_ID=calculator \
  BROADWAY_PRESET_ID=calculator \
  BROADWAY_SOURCE_ROOT="$PWD/.gnome-source/src" BROADWAY_SOURCE_ENTRY=math-window.blp \
  BROADWAY_PROBE_FILE="$PWD/.probe-local/probe.json" \
  npx playwright test tests/broadway-reference.spec.ts
```

The comparison artifact (`comparison-<app>.json`) then contains a
`runtimeProfile` block, the raw dump is attached as `probe-<app>.json`, and
matched unresolved boundaries carry `native:*` facts. The standalone matcher
gives the same join without a capture:

```sh
npx tsx scripts/match-runtime-profile.mjs calculator \
  --probe .probe-local/probe.json \
  --source-root .gnome-source/src --entry math-window.blp
```

`scripts/fidelity-report.mjs` passes the environment through, so setting
`BROADWAY_PROBE_FILE` enriches its per-app artifacts the same way. In CI the
Broadway workflow mounts `.probe-local` automatically.

## Per-app container recipes (Wave 3 findings, 2026-07-31)

Some apps need more than the stock `podman run` to produce an honest capture;
these are measured facts from the fleet sweep, not guesses:

- **gnome-software** and **gnome-control-center** refuse or crash without a
  connectable system bus and a non-root user. Run with
  `--userns=keep-id --user 1000` and override
  `APP_COMMAND='export DBUS_SYSTEM_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS; …'`
  (PackageKit/fwupd/NetworkManager are absent; plugins degrade gracefully).
  Settings additionally needs `XDG_CURRENT_DESKTOP=GNOME` and a writable
  `HOME` (`export HOME=/tmp`).
- **nautilus** refuses to run as root: same `--userns=keep-id --user 1000`.
- **gnome-calendar** starts maximized, which defeats the capture's
  inset-window detection. Prepend
  `gsettings set org.gnome.calendar window-maximized false;` to
  `APP_COMMAND`.
- **Ear Tag** is not packaged at its pinned version by either runner distro;
  `containers/broadway/Dockerfile.fedora-eartag` meson-installs the pinned
  source tag into the pinned `fedora:43` GTK stack. This is the template for
  probing any Circle app the distros do not package.
- **weather** compares against the generated preset (no
  `BROADWAY_SOURCE_ROOT`): its GJS composite template omits the window
  parent class, which only the finishing file restores.

## Probe output schema

```jsonc
{
  "probeVersion": 1,
  "app": "gnome-calculator",       // g_get_prgname()
  "settleTicks": 5,                // stability criterion used (PROBE_SETTLE_TICKS)
  "widgets": [
    {
      "gtype": "MathButtons",      // G_OBJECT_TYPE_NAME
      "buildableId": "_buttons",   // gtk_buildable_get_buildable_id, or null
      "indexPath": [0, 2],         // [toplevel index, sibling indices…]
      "mapped": true, "visible": true,
      "bounds": { "x": 0, "y": 356, "width": 360, "height": 260 },
                                   // gtk_widget_compute_bounds vs. the toplevel,
                                   // i.e. the same surface the screenshots use
      "halign": "fill", "valign": "fill",
      "hexpand": false, "vexpand": true,
      "hexpandSet": false, "vexpandSet": true,   // set-state, for Phase 2 geometry
      "marginStart": 0, "marginEnd": 0, "marginTop": 0, "marginBottom": 0,
      "widthRequest": -1, "heightRequest": -1,
      "cssClasses": [],
      "visibleChildName": null     // GtkStack / AdwViewStack active page
    }
  ]
}
```

Stability criterion: a mapped toplevel exists and its frame clock has ticked
N times (default 5, `PROBE_SETTLE_TICKS` overrides) with no toplevel
allocation change — mirroring the capture's `data-protota-ready` settle
logic, so screenshot and dump describe the same frame.

## Matching rules (`src/utils/runtimeProfile.ts`)

1. **Buildable ID first.** A runtime widget whose buildable id equals a
   source-declared object id *is* that node; template children carry their
   XML ids through GtkBuilder. Position-independent.
2. **Structural fallback.** Within an already-matched parent (every
   id-matched pair seeds alignment of its own subtree), children align by
   canonical gtype in order — the k-th source child of a class meets the k-th
   runtime child of it. GTK interposes runtime-only containers
   (AdwDialogHost, viewports), so alignment tolerates unknown siblings and
   looks exactly one level deeper, never more: an unbounded descent would
   fabricate joins. GtkStackPage wrappers are transparent on the source side
   because pages are not runtime widgets.
3. **Never pixels.** Bounds are output evidence, never a matching key.

The report records `matchRate` (matched / matchable source nodes) plus
by-id and structural counts, so a weak join is visible in the artifact
rather than silently wrong. Matched nodes gain facts such as
`{ property: "bounds", origin: "native:bounds", confidence: "native" }`;
an unresolved boundary that matches also records `runtimeMatch`
(`matchedBy`, `buildableId`, `gtype`, `bounds`) and its
`geometryConfidence` becomes `native`.

## Consuming the evidence (#55, ADR 0001 consumers)

`applyRuntimeEvidence` (`src/utils/runtimeProfile.ts`) wires a join into the
document the comparison renders, before the screenshot is taken:

1. **Suppression.** A matched node the probe saw unmapped (or invisible) is
   hidden at `native:visible` origin. This is what turns Calculator's
   `converter_box` divergence from a hand guess into GTK's own answer — the
   runtime-invisible converter subtree stops crowding its siblings.
2. **Boundary allocation.** An unresolved boundary (childless
   `custom-widget`) that matched a mapped widget takes **exactly** the
   probe-measured bounds (`runtimeEvidence` on the node): the measurement
   was taken on the very surface the comparison renders and already contains
   GTK's expansion and sibling pressure, so the renderer applies it as a
   fixed region — no flex growth past it, no squeeze below it. The DOM
   marker and comparison artifact then carry `native:*` facts and `native`
   confidence, with `runtimeMatch` recording GTK's own rect beside the
   rendered one.

Resolved nodes keep their statically imported geometry: the probe is
evidence for what static import cannot settle, not a pixel overlay.

## Probe-generated finishing entries

A finishing override derived from a probe dump carries `probeEvidence`
(see `scripts/generate-preset.mjs`):

```jsonc
{ "id": "_converter", "set": { "visible": false },
  "probeEvidence": { "probeVersion": 1, "buildableId": "_converter",
                     "expect": { "mapped": false } },
  "why": "Native probe: _converter is unmapped in the default mode." }
```

The dump it came from is committed as `presets-src/<app>.probe.json`.
`expect` states what that dump must still say about `buildableId`
(checkable fields: `mapped`, `visible`, `visibleChildName`); on every
generation run `validateProbeEvidence` re-checks it and a stale entry —
missing dump, vanished id, or a dump that no longer says what the entry
claims — aborts generation loudly, exactly like a manual override whose
node id no longer matches the source. Fields the probe does not record
(e.g. label text) are rejected as probe evidence and stay hand-written.
