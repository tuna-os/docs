---
sidebar_position: 55
title: "visual capture matrix"
---

Per-feature visual capture of Tuna Desktop v1 from the frozen Wave 3
integration head. Every one of the 83 parity-ledger rows
(`docs/parity-ledger.md`) and all 46 walkthrough entries
(`docs/walkthrough.tsv`) maps below to the capture stage(s) that collect
it, or to an explicit reason nested fixtures cannot show it. Checked by
`scripts/tuna-visual-capture --check-matrix` in CI.

## Frozen source

- Branch head: `b1c929aa55b0f3286458035fbc81ecd62d168496` (#633 integration head).
- PR #633 tested merge commit: `7b6c85922af14f4c239a4f958262b657adc6b03f`.
  The two identities are distinct: per-run `provenance.json` pins the
  exact built tree from the checkout (`built_head_sha`,
  `built_tree_sha`) and records the event SHA separately as
  informational (never as the tested tree), and CI attempts are never
  merged into one capture session (audit provenance finding).
- Capture tooling: `scripts/tuna-visual-capture` (stages) plus
  `scripts/lib/tuna-visual-label.py` (honest frame labels) and
  `scripts/lib/tuna-visual-finalize.py` (label-coupled verdicts);
  dispatchable workflow `.github/workflows/visual-capture.yml`.

## Reading this matrix

Status vocabulary (no whole-feature visual qualification is claimed
anywhere in this document; the audit's 16 "observed subset" rows stay
open until the gaps below close):

- `nested` — stills of this state come from the named nested stage.
- `clip` — a real x11grab transition clip (or timestamped still pair
  where recording is unavailable) comes from the named stage.
- `partial` — nested capture shows a subset only; the gap column says
  what is still unproven.
- `nonvisual` — behavior with no pixels of its own; evidence is consumer
  output or CI logs, not frames.
- `unsupported-in-nested` — the state needs hardware, the installed
  image, or real services; see `docs/visual-capture-corral-request.md`.
- `missing-product` — the behavior is unimplemented at this head, so
  there is nothing truthful to capture yet.
- `unproven` — drivable in nested fixtures but no adequate capture
  reviewed yet (neither audit nor new stages cover it).

Audit column: the 2026-10-12 visual audit's verdict per row
(`Observed subset`, `No adequate capture`, `FAIL`, or
`Transition clip required`). Tour frames whose title cards still say Roost
on TunaOS Marlin are labeled as observed and never presented as Tuna
feature proof.

A capture failure is reported as a capture failure. A still labeled
`indistinguishable-from-baseline` (or a missing still) does not assert
the product is broken: the audit's still-vs-video finding (a wrong tour
still beside a 28 s clip that does show quick settings) is why every
state records its state observation next to its stills and clips.

## Stages

| Stage | Ledger rows | Walkthrough states |
|---|---|---|
| stage:panel | P-PN-01, P-TR-01 | walkthrough:panel, walkthrough:tray |
| stage:calendar | P-PN-02, P-NT-02 | walkthrough:calendar, walkthrough:notification-list |
| stage:quick-settings | P-PN-03, P-SY-07, P-ST-01 | walkthrough:quick-settings, walkthrough:wifi-menu, walkthrough:network-agent, walkthrough:wired-menu, walkthrough:bluetooth-menu, walkthrough:microphone, walkthrough:power-menu, walkthrough:osd-volume, walkthrough:osd-brightness |
| stage:windows | P-WM-02, P-WM-04, P-WM-05, P-WM-06 | walkthrough:windows, walkthrough:popover, walkthrough:tile-preview, walkthrough:window-menu |
| stage:x11 | P-SY-04 | walkthrough:x11 |
| stage:scroll | P-WM-07 | walkthrough:scroll-strip, walkthrough:scroll-follow, walkthrough:scroll-presets |
| stage:switcher | P-WM-01 | walkthrough:switcher, walkthrough:switcher-thumbnails |
| stage:overview | P-OV-01, P-OV-02, P-OV-03, P-OV-06, P-WM-03 | walkthrough:overview, walkthrough:workspaces, walkthrough:overview-drag, walkthrough:workspace-popup |
| stage:search-apps | P-OV-04, P-OV-05 | walkthrough:search, walkthrough:search-provider, walkthrough:app-grid, walkthrough:app-folder, walkthrough:app-grid-pages, walkthrough:folder-made, walkthrough:grid-reorder |
| stage:notifications | P-NT-01, P-NT-02 | walkthrough:banner, walkthrough:notification-list, walkthrough:do-not-disturb, walkthrough:notification-group, walkthrough:notification-group-expanded |
| stage:input | P-IN-01 | walkthrough:ime, walkthrough:ime-candidates |
| stage:system | P-SY-05, P-SY-07, P-LK-01, P-SY-03 | walkthrough:screenshot-ui, walkthrough:polkit, walkthrough:end-session, walkthrough:lock, walkthrough:unlock, walkthrough:scale |
| stage:settings-a11y | P-ST-01, P-ST-08, P-A11Y-05, P-A11Y-07, P-AN-01 | (no walkthrough states; newer capabilities) |
| stage:transitions | P-AN-01, P-AN-02, P-AN-04, P-AN-05, P-AN-07, P-AN-09 | (clips; no walkthrough states) |

## Parity rows

| ID | Capability | Capture | Audit | Nested states / gap |
|---|---|---|---|---|
| P-OV-01 | Overview with live window previews | stage:overview `nested` + stage:transitions `clip` | Observed subset | open still + open/close clips; multi-output and focus variants open |
| P-OV-02 | Workspace strip; drag or click switches | stage:overview `nested` | No adequate capture | workspaces + drag stills; click-switch and multi-workspace strips open |
| P-OV-03 | Dash with favorites and running apps | stage:overview `nested` | Observed subset | dash visible in overview stills; favorites/running-dot variants open |
| P-OV-04 | Overview search, Enter launches top hit | stage:search-apps `nested` | Observed subset | search + provider stills; launch moment unproven |
| P-OV-05 | App grid with pages and folders | stage:search-apps `nested` | FAIL (drag-cancel layout) | grid/folder/pages/made/reorder stills plus peek + settled post-cancel frames and saved-layout diff; order persistence after cancel stays under review |
| P-OV-06 | Escape restores previously focused window | stage:transitions `partial` | No adequate capture | settled post-Escape stills only; no dedicated focus-restore frame |
| P-PN-01 | Top panel | stage:panel `nested` | Observed subset | desktop + panel stills; per-output panels need Corral |
| P-PN-02 | Clock opens calendar plus notification list | stage:calendar `nested` | Observed subset | menu + with-notification stills; event-launch and prefs variants open |
| P-NT-01 | Notification banners | stage:notifications `nested` | No adequate capture | banner still; actions/dismissal/error variants open |
| P-NT-02 | Do Not Disturb and history | stage:notifications `nested` + stage:calendar `nested` | No adequate capture | list/DND/group/expanded stills; lock-screen privacy needs Corral (P-NT-03) |
| P-PN-03 | Quick settings grid | stage:quick-settings `nested` | No adequate capture | grid, wifi/wired/bt menus, agent dialog, mic, OSDs, power menu; absent-daemon and error variants open |
| P-WM-01 | Alt-Tab switcher | stage:switcher `nested` + stage:transitions `clip` | Observed subset | popup + thumbnails stills + fade clip; keyboard-focus and overflow variants open |
| P-WM-02 | Maximize and half tiling | stage:windows `nested` + stage:transitions `clip` | Observed subset | maximized/tiled stills + size-change clip |
| P-WM-03 | Dynamic workspaces and switching | stage:overview `nested` + stage:transitions `clip` | No adequate capture | popup + slide clip; Shift-move-window visuals open |
| P-WM-04 | Drag-to-move and resize | stage:windows `partial` | Observed subset | tile-preview drag captured; explicit resize visuals unproven |
| P-WM-06 | App menus and popovers | stage:windows `nested` | Observed subset | popover still; outside-click dismissal unproven |
| P-WM-05 | Close, minimize, maximize decorations | stage:windows `partial` | Observed subset | windows + window-menu stills; minimize has no transition (see P-AN-03) |
| P-WM-07 | Scrollable tiling strip | stage:scroll `nested` | Observed subset | strip/follow/preset stills; wheel and multi-output strips open |
| P-LK-01 | Idle lock, password unlock, no leaks | stage:system `nested` | Observed subset | lock/prompt/unlock stills; leak-across-transitions needs Corral |
| P-SY-01 | Session starts from the display manager | `unsupported-in-nested` | Observed subset | DRM/KMS, GDM login, PAM/logout on hardware need Corral |
| P-SY-02 | Multi-monitor and hotplug | `unsupported-in-nested` | No adequate capture | single nested output only; per-output panel/hotplug need Corral |
| P-SY-03 | Fractional scaling and mixed DPI | stage:system `partial` | No adequate capture | 125% live-scale still; 150/200% and mixed-DPI hardware need Corral |
| P-SY-04 | XWayland apps by default | stage:x11 `nested` | No adequate capture | X11 app still; physical GPU/VT needs Corral |
| P-SY-06 | Mutter protocols advertised | `nonvisual` | No adequate capture | no pixels; wayland-info consumer output lives in CI logs |
| P-SY-07 | End session dialog | stage:quick-settings `nested` + stage:system `nested` | No adequate capture | power menu + dialog stills; real suspend/restart/power-off need Corral |
| P-SY-05 | Portals capture and sharing | stage:system `partial` | No adequate capture | screenshot-UI still; casts, recordings, consent UI need Corral + CI artifacts |
| P-A11Y-01 | Screen reader sees shell surfaces | `nonvisual` | No adequate capture | AT-SPI dumps ship in every stage artifact; spoken Orca is P-A11Y-06's speech proof |
| P-A11Y-02 | Keyboard equivalent for every pointer action | `nonvisual` | No adequate capture | keymap/journey behavior; no dedicated visual |
| P-IN-01 | IME composition in GTK apps | stage:input `nested` | No adequate capture | preedit + candidates stills; surrounding-text/cursor-move visuals open |
| P-IN-02 | Touchpad gestures | `unsupported-in-nested` | No adequate capture | physical touchpad/libinput run needs Corral |
| P-ST-01 | GNOME Settings take effect | stage:settings-a11y `nested` + stage:quick-settings `nested` | Observed subset | dark/clock/wallpaper/OSD stills; fonts, input, idle journeys in CI proofs |
| P-TR-01 | AppIndicator tray items | stage:panel `nested` | Observed subset | tray-menu still; icon-only and error variants open |
| P-WM-08 | Multitasking preferences | `missing-product` | No adequate capture | no consumer for fixed count/primary-only/tiling preference; nothing truthful to capture |
| P-WM-09 | Full WM shortcut list and focus policy | `unproven` | No adequate capture | working accelerators have no dedicated stills; unregistered keys unimplemented |
| P-SY-08 | Session save and restore | `unproven` | No adequate capture | xdg-session-management restores session windows across a nested compositor restart (G-SESSION-RESTORE checks geometry and workspace from compositor state, no stills); installed logout/reboot capture needs Corral |
| P-SY-09 | Remaining Mutter protocols and versions | `nonvisual` | No adequate capture | no pixels; consumer output lives in CI logs |
| P-SY-10 | Screenshot-UI keyboard selection | stage:system `partial` | No adequate capture | UI chrome captured; arrow/Alt/Shift/Ctrl/R selection visuals unproven |
| P-DS-01 | Night Light | stage:quick-settings `partial` | No adequate capture | tile captured; no temperature transform exists to show (`missing-product` for the effect) |
| P-DS-02 | Modes, refresh, rotation, mirroring | stage:system `partial` | No adequate capture | scale/position captured; rotation/mirroring rejected and modes ignored, so Corral only after implementation |
| P-DS-03 | Colour management, HDR | `missing-product` | No adequate capture | sRGB-only renderer; no profiles or HDR to show |
| P-DS-04 | Touchscreens and orientation | `missing-product` | No adequate capture | no touch mapping or orientation lock consumer; Corral after implementation |
| P-IN-03 | Cursor themes, shapes, locate-pointer | `missing-product` | No adequate capture | compositor draws a default arrow only; cursor lane owns the product work |
| P-IN-04 | Mouse/touchpad/stick settings | `nonvisual` | No adequate capture | libinput policy has no pixels; behavior in CI proofs |
| P-IN-05 | Graphics tablets and Wacom settings | `missing-product` | No adequate capture | tablet protocol and routing absent |
| P-IN-06 | Input-source policy, Num Lock, custom shortcuts | `nonvisual` | No adequate capture | live sources/repeat in CI proofs; per-window/NumLock/custom keys have no consumer |
| P-NT-03 | Per-app notification prefs, lock privacy | `missing-product` | No adequate capture | global banners/DND captured under P-NT-02; per-app and lock-screen keys have no consumer |
| P-A11Y-03 | Magnifier and on-screen keyboard | `missing-product` | No adequate capture | magnifier applies to captures only (no live on-screen zoom); OSK keys ignored |
| P-A11Y-04 | Sticky/slow/bounce keys, Mouse Keys, dwell | `missing-product` | No adequate capture | seat-level input policy absent |
| P-A11Y-05 | Reduced motion, focus visibility, a11y menu | stage:settings-a11y `partial` | No adequate capture | a11y indicator/menu still; motion-preference transition variants unproven |
| P-A11Y-06 | Orca activation and spoken navigation | `nonvisual` | No adequate capture | speech has no pixels; the nested speech proof (G-ORCA-SPEECH-*) logs what Orca says, activation on hardware is V-ORCA-ACTIVATION |
| P-A11Y-07 | Simulated secondary and hover click, click-type chooser | stage:settings-a11y `partial` | No adequate capture | `dwell-chooser` collects the real hover-click chooser; pie-timer intermediate frames and native pointer input remain outside these stills |
| P-SN-01 | Sound prefs, over-amplification, bell | stage:quick-settings `partial` | No adequate capture | volume OSD captured; the visual bell is pixel-checked in the GTK proof (G-VISUAL-BELL, G-X11-BELL) but not captured here; overdrive and audible feedback have no still |
| P-ST-02 | Wellbeing, screen time, breaks | `missing-product` | No adequate capture | no consumer and no history file |
| P-ST-03 | Power panel and policies | stage:quick-settings `partial` | No adequate capture | logind backlight/OSD captured; Brightness interface and PowerSaveMode need installed-image Corral |
| P-ST-04 | Privacy device controls | `missing-product` | No adequate capture | camera/mic/output/privacy-screen/USB keys have no consumer |
| P-ST-05 | Administrative lockdown | `missing-product` | No adequate capture | no lockdown consumer |
| P-ST-06 | Remote desktop and RDP flows | `unsupported-in-nested` | No adequate capture | portal input nonvisual in CI; RDP sharing/control/login need Corral |
| P-ST-07 | Date/time, NTP, time zone on image | `unsupported-in-nested` | No adequate capture | week-start visuals in CI proofs; timedate1/NTP/Geoclue need installed-image Corral |
| P-ST-08 | Background modes, shading, slideshows | stage:settings-a11y `partial` | No adequate capture | static wallpaper captured; placement/shading/XML pixels are CI portal proofs (run 38878636595) and a 2026-10-30 Corral VM run with main sideloaded; no paired GNOME or multi-output capture |
| P-ST-09 | Apps panel: permissions, defaults, media | `unsupported-in-nested` | No adequate capture | Apps-panel journeys need installed-image Corral |
| P-ST-10 | Service-backed Settings panels on image | `unsupported-in-nested` | No adequate capture | network/BT/accounts/printers/sharing/users/region/updates need installed-image Corral item-by-item |
| P-ST-11 | Legacy/app-owned settings classified | `nonvisual` | No adequate capture | inventory disposition, checked by scripts/tuna-settings-inventory-check |
| P-LK-02 | Fingerprint, smartcard, multi-step login | `missing-product` | No adequate capture | one password entry only; distinct challenges need product work plus Corral hardware |
| P-LK-03 | Tuna Desktop's own greeter on GDM's daemon | `missing-product` | No adequate capture | the greeter is not shipped yet ([#1164](https://github.com/tuna-os/tuna-desktop/issues/1164)); its screens need product work plus a Corral boot to GDM |
| P-AN-01 | Motion preferences | stage:transitions `partial` | Transition clip required | full-speed clips captured; animations-off/reduced-motion/slowdown variants unproven |
| P-AN-02 | Window open/close animations | stage:transitions `partial` | Transition clip required | overview/size clips captured; map/destroy/dialog intermediate frames unproven |
| P-AN-03 | Minimize toward dash icon | `missing-product` | Transition clip required | hide/restore is instant; no transition exists to film |
| P-AN-04 | Maximize/tile/fullscreen crossfade | stage:transitions `clip` | Transition clip required | maximize clip + settled stills; fullscreen and paired GNOME frames open |
| P-AN-05 | Workspace slide, swipe, popup, dots | stage:transitions `clip` + stage:overview `nested` | Transition clip required | slide clip + popup stills; swipe/popup-fade/dots transitions unproven |
| P-AN-06 | Modal dialog parent dim | `unproven` | Transition clip required | no modal-dialog capture state; intermediate frames unproven |
| P-AN-07 | Overview transitions | stage:transitions `clip` | Transition clip required | open/close + grid-morph clips; gesture/hover/thumbnail/drag/search/dash/panel transitions unproven |
| P-AN-08 | App grid animations | `unproven` | Transition clip required | folder zoom, launch zoom, page switch, page dots and arrows implemented and trace-gated (G-FOLDER-ZOOM, G-LAUNCH-ZOOM, G-GRID-PAGE-ANIM); no capture state or transition clip yet |
| P-AN-09 | Menu, OSD, banner, switcher transitions | stage:transitions `clip` + stage:notifications `nested` | Transition clip required | switcher-fade clip + banner stills; popover/submenu/OSD/banner/modal transitions unproven |
| P-AN-10 | Lock, flash, wallpaper, ripple transitions | stage:system `partial` | Transition clip required | lock stills only; curtain/flash/crossfade/ripple/startup transitions unproven |
| P-SY-11 | Clipboard kept after the copying app closes | `nonvisual` | No adequate capture | pasted bytes are checked by socketpair clients (`crates/compositor/tests/data_device.rs`); a real-app journey needs installed-image Corral |
| P-WM-10 | Server-side frames on X11 windows | `missing-product` | No adequate capture | X11 windows map bare (walkthrough:x11); no frame exists to capture |
| P-WM-11 | "Not responding" dialog | `unproven` | No adequate capture | dialog implemented; no capture state with a hung client yet |
| P-PN-04 | World Clocks and Weather in the calendar | `missing-product` | No adequate capture | calendar popover has neither section |
| P-NT-04 | Media players in the notification list | `missing-product` | No adequate capture | no media section on main; lock-screen and calendar media are in open PRs |
| P-PN-05 | Airplane Mode and keyboard backlight toggles | `unproven` | No adequate capture | tiles implemented; need gsd-rfkill and a keyboard backlight (fixture or hardware) to show |
| P-SY-12 | Switch User | `unsupported-in-nested` | No adequate capture | row exists on hardware sessions only; needs GDM and two accounts on an installed image |
| P-SY-13 | InputCapture portal backend | `nonvisual` | No adequate capture | D-Bus and EIS behaviour; capture is wired on the DRM input path only |
| P-SY-14 | Thunderbolt authorisation notices | `unsupported-in-nested` | No adequate capture | needs boltd and a Thunderbolt device or an emulated one (ADR 0008) |
| P-ST-12 | Captive-portal sign-in | `unproven` | No adequate capture | notification and helper launch need NetworkManager reporting a portal |
| P-IN-07 | Busy cursor while a launch is pending | `unproven` | No adequate capture | the wait cursor is cargo-tested over theme cursors; no capture state films a pending launch's cursor yet |
| P-WM-12 | Auto-maximize and edge resistance | `unproven` | No adequate capture | first-map maximize, pointer and keyboard move resistance are cargo-tested; no capture state films a large first map or a move held at an edge yet |
| P-OV-07 | `overlay-key` rebinding | `nonvisual` | No adequate capture | which key toggles the overview has no pixels of its own; the overview it opens is covered by stage:overview |
| P-OV-08 | App drag-and-drop through the overview | `unproven` | No adequate capture | the G-DND-* gates drive real GTK drags in the nested proof and read compositor state; no capture state films a drag held over the hot corner, Activities, a preview or a thumbnail yet |

## Walkthrough states

| ID | Required proof frame | Capture | Audit |
|---|---|---|---|
| walkthrough:panel | `01-panel.png` | stage:panel `nested` | Observed subset |
| walkthrough:calendar | `02-calendar.png` | stage:calendar `nested` | Observed subset |
| walkthrough:tray | `03b-tray-menu.png` | stage:panel `nested` | Observed subset |
| walkthrough:quick-settings | `15-quick-settings-services.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:wifi-menu | `15b-wifi-menu.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:network-agent | `15d-network-agent.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:wired-menu | `15e-wired-menu.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:bluetooth-menu | `15c-bluetooth-menu.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:microphone | `16b-microphone.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:power-menu | `21-power-menu.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:osd-volume | `24b-osd.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:osd-brightness | `24c-brightness-osd.png` | stage:quick-settings `nested` | Missing from GTK artifact |
| walkthrough:windows | `04-windows.png` | stage:windows `nested` | Observed subset |
| walkthrough:popover | `07-app-popover.png` | stage:windows `nested` | Observed subset |
| walkthrough:tile-preview | `08-tile-preview.png` | stage:windows `nested` | Observed subset |
| walkthrough:window-menu | `24d-window-menu.png` | stage:windows `nested` | Missing from GTK artifact |
| walkthrough:x11 | `20-x11-app.png` | stage:x11 `nested` | Missing from GTK artifact |
| walkthrough:scroll-strip | `24j-scroll-strip.png` | stage:scroll `nested` | Missing from GTK artifact |
| walkthrough:scroll-follow | `24k-scroll-follow.png` | stage:scroll `nested` | Missing from GTK artifact |
| walkthrough:scroll-presets | `24k-scroll-preset.png` | stage:scroll `nested` | Missing from GTK artifact |
| walkthrough:switcher | `08b-switcher.png` | stage:switcher `nested` | Observed subset |
| walkthrough:switcher-thumbnails | `08c-switcher-thumbnails.png` | stage:switcher `nested` | Observed subset |
| walkthrough:overview | `05-overview.png` | stage:overview `nested` | Observed subset |
| walkthrough:workspaces | `24g-workspace-thumbnails.png` | stage:overview `nested` | Missing from GTK artifact |
| walkthrough:overview-drag | `24h-overview-drag.png` | stage:overview `nested` | Missing from GTK artifact |
| walkthrough:workspace-popup | `24f-workspace-popup.png` | stage:overview `nested` | Missing from GTK artifact |
| walkthrough:search | `10-search.png` | stage:search-apps `nested` | Observed subset |
| walkthrough:search-provider | `10b-search-provider.png` | stage:search-apps `nested` | Missing from GTK artifact |
| walkthrough:app-grid | `11-app-grid.png` | stage:search-apps `nested` | Missing from GTK artifact |
| walkthrough:app-folder | `11b-app-folder.png` | stage:search-apps `nested` | Missing from GTK artifact |
| walkthrough:app-grid-pages | `11c-app-grid-pages.png` | stage:search-apps `nested` | Observed subset |
| walkthrough:folder-made | `11f-folder-dialog.png` | stage:search-apps `nested` | Missing from GTK artifact |
| walkthrough:grid-reorder | `11g-grid-reordered.png` | stage:search-apps `nested` | Missing from GTK artifact |
| walkthrough:banner | `12-banner.png` | stage:notifications `nested` | Missing from GTK artifact |
| walkthrough:notification-list | `13-notification-list.png` | stage:notifications `nested` + stage:calendar `nested` | Missing from GTK artifact |
| walkthrough:do-not-disturb | `14-dnd-list.png` | stage:notifications `nested` | Missing from GTK artifact |
| walkthrough:notification-group | `14b-notification-group.png` | stage:notifications `nested` | Missing from GTK artifact |
| walkthrough:notification-group-expanded | `14c-notification-group-expanded.png` | stage:notifications `nested` | Missing from GTK artifact |
| walkthrough:ime | `24i-ime-preedit.png` | stage:input `nested` | Missing from GTK artifact |
| walkthrough:ime-candidates | `24j-ime-candidates.png` | stage:input `nested` | Missing from GTK artifact |
| walkthrough:screenshot-ui | `24e-screenshot-ui.png` | stage:system `nested` | Missing from GTK artifact |
| walkthrough:polkit | `24g-polkit.png` | stage:system `nested` | Missing from GTK artifact |
| walkthrough:end-session | `22-end-session.png` | stage:system `nested` | Missing from GTK artifact |
| walkthrough:lock | `23-locked-after-suspend.png` | stage:system `nested` | Missing from GTK artifact |
| walkthrough:unlock | `24-unlock-prompt.png` | stage:system `nested` | Missing from GTK artifact |
| walkthrough:scale | `24-scale-125.png` | stage:system `nested` | Missing from GTK artifact |

## Newer capabilities

Settings, accessibility, privacy, Night Light, session restore,
rotation, printing, network locations and fingerprint login, mapped to
their ledger rows above:

- settings: P-ST-01 (stage:settings-a11y + stage:quick-settings,
  `partial`), P-ST-03 (`partial`), P-ST-07/P-ST-09/P-ST-10
  (`unsupported-in-nested`, installed image), P-ST-08 (`partial`),
  P-ST-11 (`nonvisual`).
- a11y: P-A11Y-01/P-A11Y-06 (`nonvisual`), P-A11Y-05 (`partial`),
  P-A11Y-03/P-A11Y-04 (`missing-product`).
- privacy: P-ST-04 (`missing-product`), P-NT-03 (`missing-product`).
- nightlight: P-DS-01 (tile `nested`, transform `missing-product`).
- session restore: P-SY-08 (`unproven`).
- rotation: P-DS-02 (rejected, `partial` for scale/position),
  P-DS-04 (`missing-product`).
- print: P-ST-10 (`unsupported-in-nested`, printers panel on image).
- netloc: P-ST-10 (`unsupported-in-nested`, network locations and
  sharing panels on image).
- fprint: P-LK-02 (`missing-product`).
- greeter: P-LK-03 (`missing-product`, #1164).

## Walkthrough freshness

The checked-in `docs/walkthrough/` images predate this pipeline and are
STALE until a refresh lands; `scripts/tuna-walkthrough freshness`
reports all 46 as such (exit 1) when no per-frame manifest exists, and
the `visual-capture` workflow's manifest job prints that report on
every run as a visible, non-gating step. CURRENT requires the bytes to
match the recorded capture hash AND the recorded built tree to equal
the expected identity for the reviewed head (explicit `--expect-*`
flags, defaulting to the checkout); self-consistent but
different-source manifests read STALE, except for adopt drift (trees
differing only in the walkthrough's own paths). `scripts/tuna-walkthrough
refresh` rebuilds images ONLY from exact successful artifacts (pinned
run id, one attempt, all consumed stages ok, one built tree,
hash-validated inputs, proven frames with preserved labels, baseline
only for the desktop state), writing `walkthrough/manifest.json` with
each frame's hash, capture outcome and source IDs (built head/tree,
event SHA, branch, package/image IDs, run id, attempt). Map:
`docs/walkthrough-visual.tsv`. Procedure and exact commands:
`docs/visual-capture-refresh.md`. No refresh has been performed from
any run yet. Behavioral coverage for the new subcommands lives in
`scripts/lib/tuna-walkthrough-freshness-tests.py` (run by the
visual-capture build job, not by any existing gate). The existing
`tuna-walkthrough check` (markdown + existence) is unchanged.

## Per-state validators and verdict coupling

Generic screening ("differs from the desktop", "stage exited ok") is
not named-state proof: every capture state declares a
consumer+render validator (`require_jq`, `require_cstate`,
`require_frame_differs`, `require_nonempty_file`, `require_absent`)
that fails the state when the expected content did not render, and
`scripts/lib/tuna-visual-validators-tests.py` fails if any driven
state lacks one. As a second layer,
`scripts/lib/tuna-visual-finalize.py` demotes any non-exempt state
whose stills hold no `feature` frame (wallpaper-only, duplicates, or
unverified) to failed, however its drive commands exited. Exemptions:
`panel/desktop` (the desktop is the baseline),
`settings-a11y/clock` (sub-threshold seconds digits; settings-key
validated), and `transitions/*` (clip-led; gated by clips plus
compositor end-states). Partial stages stay collectable (collector
green) but are exposed per-state in `stage.json`, the merged
`manifest.json` summary counts, and the CI merge report -- and
`refresh` refuses them by name. Labeling and finalize behavior are
covered by `scripts/lib/tuna-visual-label-tests.py` and
`scripts/lib/tuna-visual-finalize-tests.py`; provenance pinning by
`scripts/lib/tuna-visual-provenance-tests.py`.

## Provenance identity

Per-stage `provenance.json` pins the exact built tree from the
checkout itself (`built_head_sha`, `built_tree_sha`,
`tree_diff_sha256`); the triggering event's commit (`event_sha`,
e.g. the PR merge ref) is recorded separately as informational and
is never presented as the tested tree. Refresh validates a passed
`--merge-sha` against every consumed provenance and fails closed on
mismatch.

## Known-blocker coverage

- The tour's `T-app-grid`, `T-calendar`, `T-quick-settings` (wallpaper
  only) and `T-overview` (dash without overview card) are replaced by
  state-confirmed nested captures: every still ships with its a11y or
  compositor-state observation, and the labeler marks any wallpaper-only
  frame `indistinguishable-from-baseline` instead of presenting it as
  proof.
- The GTK proof's `G-GRID-DRAG-CANCEL` saved-layout failure aborts the
  monolithic proof and leaves later walkthrough states absent. The
  stage:search-apps `drag-cancel` state captures the same drag (peek
  frame, settled post-cancel frame, before/after `app-picker-layout`)
  inside try/continue isolation: its outcome can never block the other
  seven search-apps states, the other thirteen stages, or the merged
  manifest.
