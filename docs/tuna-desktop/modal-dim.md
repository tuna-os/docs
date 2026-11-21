---
sidebar_position: 28
title: "modal dim"
---

The native compositor applies GNOME Shell 51's parent brightness transition:
500 ms entering dim, 250 ms leaving, both ease-out-quad. [GNOME's WindowDimmer](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/windowManager.js)
sets brightness to -0.3 through an eight-bit color; the endpoint multiplier is
88/127. [Mutter's brightness shader](https://github.com/GNOME/mutter/blob/51.0/clutter/clutter/clutter-brightness-contrast-effect.c)
multiplies RGB and preserves premultiplied alpha.

Only native toplevels that actually request `xdg-dialog-v1.set_modal` and have
a committed buffer trigger their managed parent's dimming. A transient parent
alone is insufficient. Multiple attached modals keep one parent dimmed; closing
one cannot undim it while another remains. Removing the modal flag, minimizing
or unmapping the last modal restores brightness. Removing a parent releases its
transition. Reversing a fade starts from the current multiplier.

Full and reduced motion keep this brightness fade. Animations off snap to the
correct brightness. Overview, lock, gestures and keyboard workspace slides
settle the current target without animation; the hidden normal scene is not
painted over the overview or lock. The shared slowdown factor scales new fades.

Rendering overrides the GLES texture shader only while drawing the parent's
surface elements, associated popup elements, or size-change snapshot. RGB is
dimmed while alpha, geometry, texture import, occlusion and higher windows remain
unchanged. Closing snapshots retain the last parent brightness. No extra
surface traversal, texture copy or per-frame shader compile is needed. One
program is cached per EGL context. A compile failure logs that dim rendering is
unavailable; this is a qualification failure, not parity evidence.

Native repaint signatures include the brightness uniforms, so stationary parent
buffers still repaint throughout the fade. Changing brightness currently requests
full output damage. This transient cost requires measurement on Marlin; steady
state does not request frames solely for a stable dim multiplier.

## Focused qualification

`scripts/tuna-modal-dim-proof --bin-dir OWNED_BINARIES --artifacts ARTIFACTS`
uses a real SHM Wayland peer (`tuna-modal-dim-client`), explicit xdg-dialog requests,
a private Xvfb display and private session/accessibility buses. Build the
compositor, GTK shell and compositor example from one checkout under the shared
build-and-freeze lock; freeze all three before releasing it. With a shared Cargo
cache, clear every workspace package before switching checkouts. The proof
records binary hashes, source identity, state samples and actual screenshots.
It checks normal transient exclusion, 500/250 ms pixels, two-modal overlap,
transparent pixels, the actual GTK reduced/off settings bridge, parent removal
live attach-modal settings disable/enable and verified owned cleanup.

The GTK settings bridge watches `org.gnome.mutter attach-modal-dialogs` live.
Disabling it removes parent dimming immediately. Logical brightness transitions
continue independently, matching GNOME's `_syncEnabled` gate; enabling it reveals
the current logical brightness without restarting the fade. A missing schema uses GNOME's
enabled default. The proof records fixture schemas when this host lacks GNOME
51 settings; this does not qualify installed-image schema delivery. This setting
controls brightness here; modal placement and focus policy remain separate.

This implements the native normal scene. Paired GNOME captures, native GPU/DRM,
X11 modal classification, overview preview dimming, installed settings delivery,
color-management precision, nested modal stacks and performance
remain unqualified. The ledger therefore remains partial.
