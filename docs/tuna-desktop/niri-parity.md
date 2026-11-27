---
sidebar_position: 29
title: "niri parity"
---

The post-animation #238 package was also captured after all 13 checks passed
and it merged as `27fd8bf`. [Raw paired frames and reports](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/animation-238/provenance.json)
use candidate `571ff66`, run 37177834905, against the same niri/Fedora fixture.
Endpoint client sizes remain 616×736 / 826×736, with **0.0% differing client
content pixels**. Whole-work-area rest/preset/settled results remain
6.7% / 5.3% / 5.5%; the nominal 100ms transient differs by 11.5% (mean 9.48).
At that sample niri captures during 104–153ms with the right edge at 493px;
Tuna Desktop captures during 101–135ms with it still at 422px. Both first reach a
one-pixel settle in the nominal 400ms sample: niri 401–446ms, Tuna Desktop 415–467ms.
The nominal 300ms niri capture took 300–537ms, illustrating why these are
interval samples rather than precise animation-duration claims. Both are
settled by 600ms. This records a visible transient difference after #238;
it does not claim exact timing parity. The current comparison PR still
requires its independent CI recapture and full acceptance gate.

The retained pre-animation baseline follows for comparison.

The comparison uses niri **26.04** from Fedora 45 and the fully green Tuna Desktop
PR #233 package, before #238's column animation changes. It is a measured
baseline, not evidence for the later animation implementation. The package
came from [run 37169850678](https://github.com/tuna-os/tuna-desktop/actions/runs/37169850678),
head `5b76d44d9e6282b0b33d47e74eb01ed52394689e`; its check, GTK proof,
scroll proof and packaging jobs all passed. The exact provenance and raw
frames are in [baseline-233](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/baseline-233/provenance.json).

Both compositors run nested in the same Fedora container at 1280×800,
scale 1, with the same GTK 4.24.1 / libadwaita 1.10 runtime and the same
`tuna-test-window.py` windows: Scroll One, Two and Three. Each uses the
same header, text and list content. Niri reserves 32px at the top to match
Tuna Desktop's shell panel, uses 16px gaps, half-width columns, a 4px #7fc8ff focus
ring and `center-focused-column "never"`. Its default spring is retained.
The [reference config](https://github.com/tuna-os/tuna-desktop/blob/main/tests/niri-reference/config.kdl) is validated by
niri before captures.

At rest, both configure columns to **616×736**. After the focused column's
next preset, both configure it to **826×736**. Following focus back to the
middle column leaves that widened column intact. Tuna Desktop's state confirms
16px top/bottom/side gaps and offsets 632 → 842 → 632; niri's IPC confirms
matching client sizes, and the frames confirm the positions. No frame is
resized to make this comparison.

`scripts/lib/tuna-parity-compare.py` measured the work area, excluding only
the 32px shell panel:

| State | Mean difference | Pixels off >24 |
| --- | ---: | ---: |
| Strip at rest | 1.95 | 6.7% |
| Wider preset, settled | 1.56 | 5.3% |
| Mid-scroll, nominal 100ms | 6.46 | 8.6% |
| Scroll settled | 1.58 | 5.5% |

The main settled difference is the desktop visible through the gaps:
niri's gray backdrop and Tuna Desktop's GNOME blue backdrop. Tuna Desktop also leaves a
GTK keyboard-focus outline on the header menu button. Inside the settled
window content, excluding the header and gaps, the three measured crops
have **0.00 mean difference / 0.0% off**. This confirms matching dimensions,
content layout and fonts in that runtime; it does not claim the complete
desktops have identical pixels.

The [difference frames](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/baseline-233/difference/02-strip-preset-0_32_1280_768.png)
place niri above Tuna Desktop and amplify their difference four times below.
The raw [niri frame](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/baseline-233/niri/02-strip-preset.png) and
[Tuna Desktop frame](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/baseline-233/roost/02-strip-preset.png) are also
retained, with IPC/state JSON alongside each frame.

Timing samples repeat a fresh right-to-left transition for each delay;
PNG compression cannot push a later sample past its deadline. They retain
both the capture start and completion timestamps. In this software-rendered
baseline, the nominal 100ms captures span 100–153ms for niri and
100–117ms for Tuna Desktop. Their visible middle-column right edges are 536px
and 494px respectively, starting at 422px and ending at 632px. A one-pixel
settle is first observed in the nominal 300ms niri sample (300–383ms)
and 400ms Tuna Desktop sample (400–432ms); both settle by 600ms. These are empirical
sampling intervals under load, not precise animation duration measurements.
The transient pixel difference includes that input/render timing uncertainty.
[Raw samples](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity/baseline-233/niri/view-timing.json) remain available
for checking the interpretation.

The deterministic spring tests separately check the formula and settle
threshold: critically damped, stiffness 800, epsilon 0.0001, matching
[niri 26.04's defaults](https://github.com/niri-wm/niri/blob/v26.04/niri-config/src/animations.rs).
# 238 adds that spring to column width and position. The post-animation
package measurements above establish its observed behavior; #233's captures
remain evidence only for the earlier baseline.

The GTK proof now checks insertion right of focus, column movement and
closure, wheel scrolling, overview previews, workspace thumbnails,
Alt+Tab and client maximize/fullscreen/edge-snap requests. The output-failover
wire test checks that surviving columns resize for the new primary output
without losing focus or workspace membership. Current differences remain
explicit: wheel/touchpad scrolling is direct; maximize, fullscreen and edge
tiling keep a window in the strip; there is one strip using the primary
output area, rather than niri's independent layout on every output.

## Columns, drops and resizing

Columns hold several windows, following niri 26.04's
[`src/layout/scrolling.rs`](https://github.com/YaLTeR/niri/blob/v26.04/src/layout/scrolling.rs)
and its [default binds](https://github.com/YaLTeR/niri/blob/v26.04/resources/default-config.kdl):

- Super+[ / Super+] (`consume-or-expel-window-left/right`): a lone window
  joins the bottom of the neighboring column on that side; a window sharing a
  column leaves it for a new column on that side with the column's width
  (`RemovedTile::width`). Super+, / Super+. take the next column's top window
  into the focused column and send the bottom one out to the right. Super+Up /
  Super+Down move focus inside a shared column, with Shift moving the window
  (niri binds these on Mod+Ctrl; Tuna Desktop keeps Shift for its existing
  column moves). GNOME 51 binds none of `<Super>bracketleft`,
  `<Super>bracketright`, `<Super>comma` or `<Super>period`
  ([gsettings-desktop-schemas 51.0 wm keybindings](https://gitlab.gnome.org/GNOME/gsettings-desktop-schemas/-/blob/51.0/schemas/org.gnome.desktop.wm.keybindings.gschema.xml.in),
  mutter and gnome-shell 51.0 schemas); its `<Super>Up` / `<Super>Down`
  (maximize / unmaximize) and `<Super><Shift>Up` / `<Super><Shift>Down`
  (move to monitor) are only replaced in strip mode, inside a shared column,
  where forced strip membership already made them no-ops.
- Heights follow `update_tile_sizes`: windows share the column's height by
  weight, a window whose minimum is not met takes it, and one resized window
  keeps a fixed height clamped to what the others' minimums leave. The first
  fixed height turns the others into weights from their current heights over
  the median (`convert_heights_to_auto`). Column widths clamp to the largest
  member minimum and smallest member maximum, the minimum winning; a client
  changing its limits re-sizes its column.
- A drop lands at the boundary nearest the pointer, aiming at the middle of a
  gap (`insert_position`): a column's edge makes a new column, a window's top
  or bottom edge inside the column under the pointer joins that column.
- An xdg resize, or the GNOME modifier resize (`mouse-button-modifier` with
  the middle button, or the right one under `resize-with-right-button`) on
  the pointer's outer third of a window (niri's Mod+right-drag,
  `resize_edges_under`), changes the column width from one side and a
  window's height from its top or bottom inside a shared column; the topmost
  window's top edge does nothing (`interactive_resize_update`). The strip
  keeps GNOME's modifier and buttons rather than niri's fixed Mod+RMB, so
  the two modes agree.

Remaining differences: a lone window stays full height (niri lets a vertical
resize shorten it, and has no reset bind here); the dragged window keeps its
slot until the drop instead of leaving the layout, so both sides of that slot
name it; drop bars are 8px rather than niri's 300px hint areas; dialogs with
attached children only drop as new columns; interactive sizes floor at
120×80px; and there is no tabbed column display, window height presets or
`Mod+Ctrl+R` height reset.

To reproduce without compiling a local GTK shell:

```sh
scripts/tuna-niri-reference --out /tmp/fresh-niri-reference
scripts/tuna-niri-compare --candidate /tmp/extracted-tuna-package --out /tmp/fresh-niri-pair
```

The candidate directory must contain `usr/bin/tuna-compositor` and
`usr/bin/tuna-shell-gtk`. CI extracts its current Arch package, captures
both compositors, checks endpoint geometry/content and records timing and
pixel reports in the `niri-parity` artifact. The broader interactions remain
in `gtk-shell`; both jobs must pass before the comparison change is merged.
