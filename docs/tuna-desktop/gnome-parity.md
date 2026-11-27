---
sidebar_position: 18
title: "gnome parity"
---

Tuna Desktop aims to look like GNOME 51 to the pixel, element by element and
state by state. The harness below measures that against GNOME Shell 51.0
itself, not against screenshots or memory.

## Reference: GNOME 51 in a container

`scripts/tuna-gnome-reference` builds `tests/gnome-reference/Containerfile`
(Fedora 45, GNOME Shell 51.0) with podman. It runs `gnome-shell --headless`
at 1280x800 with `capture.js` as its automation script, the way GNOME's own
performance tests drive the shell. Tuna Desktop's proof stubs stand in for
NetworkManager, BlueZ, power-profiles-daemon and logind on a private
system bus. Both sides use the same stubs, so quick settings show the same
services.

For each state the script writes a PNG and a JSON list of every visible
styled actor. Each entry has its style class, name, rectangle, font and
colours, so sizes and spacing can be read off exactly. The run also exports
GNOME 51's default wallpapers (`adwaita-l.jxl`, `adwaita-d.jxl`).

## Tuna Desktop capture and comparison

`scripts/tuna-parity-capture` drives the nested compositor and GTK shell
through the same states with the same settings and wallpaper.
`scripts/lib/tuna-parity-compare.py` stacks GNOME, Tuna Desktop and their
difference for each state, optionally cropped to one element. It prints
the mean channel difference and the share of pixels that are visibly off.

```sh
scripts/tuna-gnome-reference
scripts/tuna-parity-capture
scripts/lib/tuna-parity-compare.py target/gnome-reference target/tuna-parity target/parity-compare
scripts/lib/tuna-parity-compare.py target/gnome-reference target/tuna-parity target/parity-compare 01-desktop:0,0,1280,32
```

## States

| State | What it shows |
| --- | --- |
| 00-startup-overview | GNOME opens the overview at login (reference only) |
| 01-desktop | top bar over the default wallpaper |
| 02-calendar | the date menu |
| 03-quick-settings | quick settings |
| 03b-power-mode-menu | the Power Mode toggle's menu, open in place |
| 03c-power-menu | the shutdown menu, open in place |
| 04-overview-empty | the overview with no windows |
| 05b-app-folder | the System folder's dialog |
| 05-app-grid | the app grid |
| 06-windows | three windows on the desktop |
| 06b-switcher | Alt+Tab |
| 07-overview-windows | the overview with three windows |
| 07b-overview-hover | a window preview hovered (caption and close button) |
| 20-overview-dismiss-focus | Escape dismisses the overview and restores the previous focused test window; state JSON asserts the focused identity |
| 21-maximized | Super+Up maximizes the focused test window |
| 22-tiled-left, 22b-tiled-right | Super+Left/Right tile the focused test window to each half |
| 23-workspace-switched | settled workspace after Super+Page_Down |
| 08-notification | a notification banner |
| 09-calendar-with-notification | the date menu listing it |
| 10-end-session | the Log Out dialog (gnome-session's EndSessionDialog) |
| 11-lock-screen | the lock screen curtain (reference: a stubbed display manager lets GNOME lock) |
| 12-osd-volume, 12b-osd-label, 12c-osd-overdrive | the OSD gnome-settings-daemon shows through ShowOSD |
| 13-window-menu | the window menu on the focused window's header bar |
| 14-screenshot-ui | the screenshot UI on Print |
| 15-workspace-popup | the workspace switcher popup on Super+Page_Down |
| 16-overview-workspaces | the overview with three workspaces (a window moved one right): the thumbnails strip, the shrunken card, the focused window still drawn activated |
| 16b-workspace-insertion-placeholder | a window held over the first thumbnail gap: GNOME’s native insertion marker and the later thumbnails shifted by 24px; compare the thumbnail strip crop at 530,96,220,30 |
| 17-tile-preview | Gamma dragged to the left edge: the tile preview over the left half, above Alpha and below Gamma (GNOME's reference moves Gamma by the drag's offset and opens the preview through its own handler, since headless input is unreliable) |
| 18-overview-search | "calc" typed in the overview: the app result under the focused entry (external search providers off on both sides, since the host and the image install different ones) |
| 19-app-popover | a fourth test window opening its header-bar menu by itself (an xdg popup; headless input is not reliable in GNOME's reference), placed by the cascade's first free slot |
| 11b-unlock-prompt | the unlock prompt, set to what a real session shows: the user's name and GDM's Password question (the stubbed display manager has no PAM conversation or AccountsService) |

Both sides run the same services: the stubs serve power-profiles and
logind only, since GNOME's NetworkManager and BlueZ clients need more
than a stub. The virtual monitor has no backlight and there is no audio
server. GNOME 51's Adwaita icons and Adwaita Sans come from the reference
run, so the host's older theme and fonts do not leak in. Ubuntu, for
example, defaults to Yaru and lacks `dark-mode-symbolic`.

Both sides open the same three libadwaita test windows
(`scripts/lib/tuna-test-window.py`), one at a time, so window size,
placement, stacking and decorations compare directly. Tuna Desktop's capture
sets GNOME 51's interface fonts, since the host's schema may still name
Cantarell. Both sides switch apps the way releasing Alt does, and the
Tuna Desktop pointer rests in an empty corner, since GNOME's scripted run has
no pointer motion and so shows no hover.

## Where Tuna Desktop stands

Share of pixels visibly off (more than 24 levels) in each element crop:

| Element | First measured | Now |
| --- | --- | --- |
| Login: the overview at start | not built | 0.3% |
| Desktop and wallpaper | 96.1% | 0.1% |
| Top bar | 35.2% | 0.7% (the clock's minutes) |
| Quick settings | 68.4% | 1.2% (text rendering) |
| Power Mode menu | not built | 0.5% |
| Date menu | 16.5% | 0.3% |
| Notification banner and list card | 11.3% | matches; the rest is what lies behind |
| Overview, empty (cards, search, dash) | 53.5% | 0.4% |
| App grid (thumbnails, tiles, folders, dash) | 56.1% | 0.2% |
| App folder dialog | popover | 0.0% |
| Overview search results | 0.8% | 0.3% |
| Overview dash | not comparable | 0.0% |
| Lock screen background (blurred, dimmed wallpaper) | not built | 1.4% beyond 8 levels |
| Lock screen curtain (clock, date, hint) | not built | positions within 1px; the digits are the capture time |
| Unlock prompt | not built | 0.1% of the screen, 0.5% of the prompt |

Whole screens, with the same windows on both sides:

| State | Before | Now |
| --- | --- | --- |
| Three windows mapped | 50.1% | 0.4% |
| Alt+Tab switcher | 48.9% | 0.5% |
| Overview with windows | 28.8% | 1.3% |
| Overview, a preview hovered | 29.0% | 1.7% |
| Notification banner | 48.9% | 0.4% |
| Date menu listing it | 19.6% | 0.5% |
| Log Out dialog | 35.6% | 0.4% |
| OSD: volume, a layout label, volume past 100% | not built | 0.4% each |
| Window menu (header-bar right click) | not built | 0.2% |
| Screenshot UI (Print) | not built | 0.3% of the screen, 2.9% of the panel |
| Workspace switcher popup | not built | 0.1% |
| Overview with three workspaces (thumbnails strip) | not built | 1.4% |
| Tile preview at the left edge | not built | 0.5% |
| An app's popover, on a fourth window | 23.0% (cascade slot) | 0.5% |

Tuna Desktop's capture shows GNOME's installed apps, not the host's: each host
entry is hidden by a `Hidden` copy in the user's application directory
(the desktop-entry spec's override), GNOME's entries and folder names
are copied in, GNOME 51's schemas come first, and the session is named
GNOME so `OnlyShowIn` decides the same way.

Both sides send the banner's notification over D-Bus. GNOME's message
tray keeps a banner up while the user is away, so its scripted run tells
the tray the user is back where Tuna Desktop's capture moves the pointer.

Getting there took two compositor changes. Windows now pick their own
size and are placed on their first commit, as Mutter does: a new window
is centred, and later ones cascade by Mutter's 50px. The switcher is
centred on the whole monitor, top bar included.

GTK and St differ in a few ways that matter when matching numbers:

- GTK's `min-width` excludes padding, St's does not.
- GNOME's 12px panel padding is a 3px border plus 9px of padding.
- With two copies of an icon theme, GTK 4.14 takes the icon from the
  later directory.
- GTK 4's search entry node is `entry.search`, not `searchentry`.
- GNOME 51's Adwaita wallpapers are Display P3 JPEG XL; mutter converts
  them to sRGB, so Tuna Desktop does too.
- GNOME's lock screen blurs the wallpaper with a Gaussian of about
  sigma 20 and dims it to 65%; fitted against GNOME's capture.

## Accessibility baseline

The reference also records AT-SPI trees for the panel, quick settings and
the overview with the three test windows. `scripts/tuna-a11y-baseline
update target/gnome-reference` keeps visible nodes, hierarchy, unnamed
controls and state flags in `tests/a11y/gnome51/`, with the clock normalized.
The committed [comparison](https://github.com/tuna-os/tuna-desktop/blob/main/tests/a11y/gnome51/comparison.md) catalogs
these controls beside Tuna Desktop's live proof goldens and explains the intended
role, label and fixture differences. CI checks that this comparison still
reflects the fixtures and goldens.

The 2026-10-04 native capture asserts focus restoration and maximization,
and records each window's rectangle, workspace and focused identity in
`*.state.json`. Tuna Desktop records equivalent compositor state alongside its
frames and asserts focus restoration and exact maximize/tile bounds.
The paired 2026-10-04 captures use GNOME Shell 51.0 and Tuna Desktop binaries from
[CI job 111350817693](https://github.com/tuna-os/tuna-desktop/actions/runs/37172493269/job/111350817693),
commit `e101d566048986c3c8c78e193cd41a26b44947bd`, with the native fonts,
icons and wallpaper. The GTK live proof passed; that job's later standalone
ShellCheck failed on the old cleanup expression, which was corrected.
The recorded native and Tuna Desktop window states are committed in
`tests/gnome-reference/baseline-state.json` and `tuna-baseline-state.json`.

| State | Pixels visibly off | Recorded behavior |
| --- | --- | --- |
| 20-overview-dismiss-focus | 0.4% | Beta regains focus; its rectangle remains 370,256,640,420 |
| 21-maximized | 0.3% | Beta occupies 0,32,1280,768 on both sides |
| 22-tiled-left | 0.5% | Beta occupies 0,32,640,768 on both sides |
| 22b-tiled-right | 0.3% | Beta occupies 640,32,640,768 on both sides |
| 23-workspace-switched | 0.0% | Workspace 1 is active; no window is focused; all three windows remain on workspace 0 |

These are full 1280x800 frame comparisons with the same threshold as the
other measurements above. Each capture asserts the keyboard action's
focus, workspace or rectangle result before continuing.

Audio state comes from a persistent `pw-dump --monitor --no-colors` stream.
Recording node creation, removal and state changes update the microphone
indicator and slider in the GTK event callback, before the next frame; there
is no recording poll or extra volume query. Default-node metadata and node
Props provide the live volume and mute state. Device EnumRoute and Route
parameters supply separate output-port rows. Selecting a physical port sets
its saved device Route before setting the sink default. Sinks without routes
(such as a virtual output) retain a single row. The event decoder bounds both
incomplete JSON and retained graph state, clears stale state on disconnect,
and reconnects to a restarted daemon. The graphical gates use an event-driven
FIFO fixture with the same JSON objects and route command arguments.

Idle shield behavior follows GNOME's `screenShield.js`: the idle fade takes
10,000 ms with ease-out-quad, and locking waits for the larger of that animation duration
and `lock-delay`. With animations disabled the minimum disappears.
`G-IDLE-FADE` drives a two-second idle policy, cancels the fade with
activity, observes the blank stage before the delayed lock, and verifies
that waking still requires PAM. `G-LOCK-BACKGROUND` uses a solid green
screen-saver URI and checks its dimmed pixels. The parity lock frame sets
an explicit URI to the exported reference wallpaper and retains it in
`lock-background-uri.txt`; the custom-color proof is separate from that
GNOME visual comparison.

Display power saving follows GNOME Settings Daemon 51's idle transitions
(`gsd-power-manager.c` `idle_set_mode`). `G-POWER-SAVE-MODE` calls
`org.gnome.Shell.Brightness` `SetDimming(true)` and sees the controlled
backlight drop, writes DisplayConfig `PowerSaveMode` 3 and sees no frame
rendered while the pointer moves, checks that -1 is ignored, writes 0 and
sees a repaint, then `SetDimming(false)` restores the exact user baseline.
The nested proof turns no CRTC off; `D-POWER-SAVE` (`scripts/tuna-drm-smoke`)
does on vkms, for a locked session; see `docs/brightness-contract.md`.

## Workspace insertion comparison

State `16b-workspace-insertion-placeholder` compares GNOME 51’s native
insertion handler with an actual held Tuna Desktop preview drag. Both place the
marker at `[619,102,18,26]` and shift later thumbnails to x=643 and x=692.
The strip crop `530,96,220,30` has mean channel difference 2.41 and 3.6%
of pixels above the usual 24-level threshold. The marker crop
`619,102,18,24` has mean difference 0.69 and 0.0% above threshold; its
bottom two pixels are excluded because the actual Tuna Desktop drag ghost
begins there, while the native synthetic handler has no ghost.

[Recorded source and metrics](https://github.com/tuna-os/tuna-desktop/blob/main/tests/gnome-reference/workspace-insertion-comparison.json)
and the [three-row comparison image](https://github.com/tuna-os/tuna-desktop/blob/main/tests/gnome-reference/workspace-insertion-strip.png)
retain this evidence. Tuna Desktop binaries came from GTK job `111359239198`,
run `37175952333`, checkout merge `49a70b0` (PR 240 head `ad87517` into
PR 234 head `bd18c76`). The full GTK proof, including `G-WS-INSERT`,
passed. Capture with `--workspace-insertion-only` isolates this state
from screenshot-helper startup and fails if the placeholder is absent.

The XWayland activation journey (#219, closed) additionally checks native GTK
startup without an XWayland process, the first real X11 app launched from search,
a killed compatibility process followed by same-display reconnect, preserved
native window IDs, and listening-socket/display-lock cleanup on graceful exit.
See `xwayland-on-demand.md`. These are runtime/lifecycle gates, separate from
GNOME screenshot pixel comparisons; they run in `scripts/tuna-gtk-shell-proof`
(`G-X11-DEMAND`, `G-X11-RESTART`, `G-X11-CLEANUP`; ledger P-SY-04).
