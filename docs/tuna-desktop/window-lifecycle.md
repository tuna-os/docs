---
sidebar_position: 66
title: "window lifecycle"
---

The compositor renders window effects from GNOME Shell **51.0**
[`windowManager.js`](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/51.0/js/ui/windowManager.js)
(`_mapWindow`, `_destroyWindow`, `_getAnimationWindowType`).

| Window | Map | Destroy |
| --- | --- | --- |
| Normal, including maximized/fullscreen | 150 ms, ease-out-expo; opacity 0→1, scale (.01,.05)→(1,1), bottom-centred pivot | 150 ms, ease-out-quad; opacity 1→0, scale 1→.8, centred pivot |
| Native transient or X11 dialog | 100 ms, ease-out-quad; opacity 0→1, vertical scale 0→1, centred pivot | 100 ms, ease-out-quad; vertical scale 1→0, centred pivot |

Reduced motion keeps the normal-window fades and drops scale/translation.
The upstream dialog map becomes immediate under reduced motion; dialog
close fades instead of collapsing. Disabling animations settles all effects.
GNOME's slowdown factor changes durations through the shared motion policy.
The overview, an active workspace gesture, and the session lock suspend the
effects. X11 menus, tooltips, docks, utility windows and other auxiliary
roles are excluded. Layer surfaces and xdg popups are not toplevel effects,
with one exception: a grabbed popup of the GTK shell's top bar (a panel
menu) closes as GNOME's `boxpointer.js` `BoxPointer.close`. The shell has
already closed it logically (focus, accessible tree, `closed` signal); the
compositor retains the menu's last frame the same way, copies it once when
the popup goes, and draws it fading out over 150 ms ease-out quad while it
rises 6 px and shrinks to 96% about its top centre (fade-only under Reduced
Motion or when another bar menu takes the grab). The ghost takes no input,
and the same menu opening again drops it (`crates/compositor/src/menu_close.rs`).
A panel button hidden under its open menu closes it unanimated, as
`PanelMenu.Button.vfunc_hide` does (`panelMenu.js:149-154`): the shell sends
`CloseMenuUnanimated` before GTK drops the popup, and the compositor draws no
close for the panel popup that goes within 500 ms of it (or drops the one it
just started), recording `unanimated` in `menu_close.history`.

## Client lifetime and cost

A shown window retains its last imported Smithay surface render elements.
These own imported GPU textures and buffer references; their drawing method
reads the texture, not the `wl_surface`. The compositor copies those retained
elements into an offscreen texture only after the mapped window disappears.
The closing texture therefore survives a destroyed surface or exited client.
Its bounds cover committed xdg geometry; shadow/popup pixels outside those
bounds remain a qualification limitation.
The window leaves the focus/model immediately; a visual ghost cannot receive
input. Closing dialogs vanish when their parent is removed. Hidden windows
are not copied, and switching workspaces does not replay a map effect.

There is no per-frame offscreen copy in steady state. Each visible window
still has one extra surface-tree traversal/import-cache lookup to retain its
latest elements. Measure that cost on the approved Marlin comparison host.
Copies are bounded to 32 simultaneous effects and 64 MiB of pixel storage;
exceeding either budget skips a destroy effect with `snapshot-budget` in the
state diagnostic. Copy failure records `snapshot-failed`. These are explicit
qualification limitations, not passing parity cases.

## Focused proof

```sh
cargo test -p tuna-compositor --lib --no-default-features window_lifecycle
flock /tmp/tuna-v1-build-and-freeze.lock bash -c '
  set -euo pipefail
  cargo metadata --no-deps --format-version=1 | jq -r ".workspace_members[]" |
    while IFS= read -r package; do cargo clean -p "$package"; done
  cargo build -p tuna-compositor -p tuna-shell-gtk
  mkdir -p /tmp/tuna-window-binaries
  cp "${CARGO_TARGET_DIR:-target}/debug/tuna-compositor" \
     "${CARGO_TARGET_DIR:-target}/debug/tuna-shell-gtk" /tmp/tuna-window-binaries/
'
dbus-run-session -- scripts/tuna-window-lifecycle-proof \
  --bin-dir /tmp/tuna-window-binaries --artifacts /tmp/tuna-window-lifecycle
```

The runtime proof owns a private X server, settings and 0700 runtime directory.
A dedicated accessibility bus is launched and its explicit address is passed
to every GTK process. The manifest records both bus identities and owned
cleanup, following the project isolation convention.
It freezes the existing compositor animation clock, maps a real GTK native
window and transient, advances the clock through their durations (letting the
parent undim after its attached dialog closes), exits the client, and checks
screenshots for the retained final frame, half-way fade and absence of stale
pixels at completion. The retained frame is the whole buffer, client shadows
included, as GNOME retains the actor: its right and bottom edges must match
the live window. It also checks reduced-motion normal-window transforms and
immediate map/destroy with animations off. CI's gtk-shell job runs it against
the frozen `scripts/tuna-minimize-ci-proof` bundle; its WL-* assertions feed
the parity ledger.
The proof copies the supplied binaries into its artifact directory and records
SHA-256 hashes, source revision, dirty status and renderer in `manifest.json`.
Build both binaries from the same checkout before running it. Clean workspace
package outputs when different checkouts share a Cargo target directory;
third-party dependency artifacts can remain cached. All parallel
native builders must use the same build-and-freeze lock: Cargo releases its
lock before a caller copies the binaries. Compare the recorded hashes against the owned
build bundle before treating the run as qualification.
JSON snapshots and PNGs accompany
`assertions.txt`. `window_lifecycle` in the instrumented compositor state
records running effects, opening transforms and recent outcomes.

This is focused local rendering evidence. It does not prove a paired GNOME
capture, all X11 role types, reduced-motion dialog runtime cases, simultaneous close
ordering, hardware texture import paths, or the v1 performance targets. Those
remain qualification work; the parity ledger must not mark the whole row
passing solely from these unit tests.

### Review safety boundaries

Workspace slides (including keyboard switches) clear and suppress lifecycle effects because retained textures do not include the workspace transform. Closing during an unfinished map or size change skips the destroy effect and records `interrupted-map` or `interrupted-size-change`; this prevents an opaque full-size snapshot jump. These are explicit fidelity gaps. One shared stack per frame preserves successor ordering without per-window stack copies. Expired textures leave the budget before new closes are admitted. Proof success is recorded only after owned session cleanup succeeds.
