---
sidebar_position: 57
title: "visual capture corral request"
---

States that nested fixtures cannot show truthfully, requested for
installed-image coverage on Corral. The coordinator relays this request;
the visual-capture lane creates, modifies and deletes no Corral VM
itself (shared backend; user VMs `stine-kde` and `utah-test` must be
preserved).

Frozen source for all captures: branch head
`b1c929aa55b0f3286458035fbc81ecd62d168496` (#633 integration head);
record the tested merge commit `7b6c8592` distinctly in provenance, as
the nested `provenance.json` does. Image: the Marlin image built from
that head (record digest, package versions, and run/attempt ids per
capture; attempts are separate capture sessions, never one story).

Suggested capture method everywhere below: bootc-installed (or ISO
installed) Marlin VM on Corral, QEMU guest agent (QGA) for in-guest
commands, and host-side framebuffer capture (screenshot clips) for
stills plus short clips. Drive the UI over QGA (`gdbus`, `gsettings`,
`xdotool`-equivalents where present, `wtype`/`ydotool` on Wayland) and
confirm each state before the still (journal, D-Bus, or setting
readback), the way nested stages pair observations with frames. States
marked `missing-product` in the matrix need no capture until the
behavior exists; they are listed here only where installed-image
behavior differs from nested (marked below).

## Display manager and session (P-SY-01)

- State: GDM greeter listing "Tuna Desktop (preview)".
  Why nested is insufficient: nested sessions never run GDM or a
  greeter; the VM lane uses autologin only.
  Suggested capture: boot the installed image to GDM; framebuffer still
  of the greeter with the session entry; record image digest.
- State: typed-password login reaching the DRM/KMS session.
  Why nested is insufficient: no typed GDM login exists anywhere in CI.
  Suggested capture: select Tuna Desktop, type the password over the
  console, clip from greeter through session start; still of the first
  desktop frame; confirm `loginctl` session type wayland over QGA.
- State: logout returning to the greeter; PAM unlock after lock.
  Why nested is insufficient: nested lock uses pam_wrapper, and logout
  ends the fixture.
  Suggested capture: Log Out via the end-session dialog; still of the
  greeter; log back in; also Super+L then password unlock with stills.

## Real outputs (P-SY-02, P-SY-03, P-DS-02)

- State: two-output session with per-output panel; hotplug add/remove.
  Why nested is insufficient: one fixed 1280x800 winit output; hotplug
  is a unit test.
  Suggested capture: attach a second virtual display, still per output
  (panel on each), detach, still; read back DisplayConfig over QGA.
- State: 150% and 200% scale applied live; mixed-DPI two-output layout.
  Why nested is insufficient: nested proves 125% on one output; mixed
  DPI and hardware scaling paths are unqualified.
  Suggested capture: ApplyMonitorsConfig per scale, still each; mixed
  layout still; record monitors.xml.
- State: rotation, mirroring, mode and refresh changes (P-DS-02).
  Why nested is insufficient: product rejects rotation/mirroring and
  ignores modes; nothing truthful to capture until implemented.
  Suggested capture: none until implemented; then per-change stills on
  the installed image.

## Power and lock hardware paths (P-SY-07, P-LK-01, P-ST-03)

- State: real Suspend to RAM and resume with the session locked.
  Why nested is insufficient: the logind stub fakes PrepareForSleep;
  static nested lock stills cannot prove no leakage across transitions.
  Suggested capture: Suspend from the power menu; clip across
  suspend/resume; stills of lock, unlock prompt, restored desktop.
- State: Restart and Power Off through the 60 s dialog.
  Why nested is insufficient: stub logind only records the call.
  Suggested capture: dialog still, confirm, host-side power-state
  observation.
- State: physical backlight stepping with brightness OSD (P-ST-03).
  Why nested is insufficient: sysfs backlight is a fixture file.
  Suggested capture: brightness keys, OSD stills, read back the real
  backlight value over QGA.

## Input hardware (P-IN-02, P-A11Y-06, P-LK-02)

- State: three-finger overview toggle and workspace swipe on a touchpad.
  Why nested is insufficient: no libinput touchpad in nested fixtures.
  Suggested capture: gesture clips plus settled stills; needs a host
  with a virtual or passed-through touchpad.
- State: complete spoken Orca journey (panel, overview, quick settings).
  Why nested is insufficient: nested compares AT-SPI trees; nothing
  speaks.
  Suggested capture: enable Orca, transcript + audio record over QGA
  where possible; stills of focused controls.
- State: fingerprint/smartcard/PIN login (P-LK-02).
  Why nested is insufficient: product has one password entry.
  Suggested capture: none until implemented; then per-challenge stills
  on hardware with a reader.

## Settings on the shipped image (P-ST-07, P-ST-09, P-ST-10)

- State: each service-backed Settings panel working on Marlin: network,
  Bluetooth, online accounts, printers (print), sharing and network
  locations (netloc), users, region, updates.
  Why nested is insufficient: nested stubs replace every daemon;
  installed schemas do not show the panels work.
  Suggested capture: open each panel over QGA-driven input, still per
  panel, exercise one live change per panel (e.g. join a network,
  pair a device, add a printer) with before/after stills.
- State: Apps panel journeys: permissions, background apps, default
  handlers, removable-media autorun (P-ST-09).
  Why nested is insufficient: portal contracts are stubbed; no
  installed-app journeys exist.
  Suggested capture: per-journey stills on the installed image with a
  real app installed.
- State: automatic time zone, NTP and manual time (P-ST-07).
  Why nested is insufficient: timedate1/Geoclue are absent from
  fixtures.
  Suggested capture: toggle automatic time zone, still of the Date &
  Time panel and the panel clock; record timedate1 state.

## Privacy, lockdown, remote desktop (P-ST-04, P-ST-05, P-ST-06, P-NT-03)

- State: camera/mic/output disable, privacy screen, USB protection
  (P-ST-04); lockdown keys (P-ST-05); per-app notification prefs and
  lock-screen privacy (P-NT-03).
  Why nested is insufficient: no consumers exist (`missing-product`).
  Suggested capture: none until implemented.
- State: GNOME Settings Desktop Sharing and Remote Control over RDP,
  remote login (P-ST-06).
  Why nested is insufficient: RDP flows are unqualified; nested covers
  portal input only.
  Suggested capture: enable sharing, connect an RDP client, stills of
  both ends; record denial/consent behavior.

## Portal capture and recording (P-SY-05)

- State: window/monitor screencast consent and recording indicator;
  portal screenshot color-picker/area flows.
  Why nested is insufficient: nested UI stills exist but PipeWire
  zero-copy/cursor metadata and the installed GNOME portal backend are
  unqualified.
  Suggested capture: run a real portal client (e.g. OBS or
  xdg-desktop-portal test tools) on the installed image; consent stills,
  recording-indicator still, saved-file verification over QGA.

## Motion and transition qualification (P-AN-01..P-AN-10)

- States: animations-off, reduced-motion and slow-down variants of the
  overview, workspace slide, size-change, switcher-fade and grid-morph
  clips; modal-dim, minimize (once implemented), folder-zoom, launch-zoom,
  app-grid page-switch and banner/popover/OSD transitions.
  Why nested is insufficient: nested clips film full-speed defaults on
  fixtures; paired GNOME 51 intermediate frames and native-GPU timing
  need the installed image.
  Suggested capture: per-transition clips at fixed delays on the
  installed image, plus the same delays against GNOME 51 for pairing;
  record the animation-clock or frame timestamps with each clip.

## Non-goals for Corral

- `missing-product` rows need product work first, not capture time:
  P-WM-08, P-SY-08, P-DS-01 (transform), P-DS-03, P-DS-04, P-IN-03,
  P-IN-05, P-A11Y-03, P-A11Y-04, P-ST-02, P-AN-03.
- `nonvisual` rows (P-SY-06, P-SY-09, P-A11Y-01 trees, P-A11Y-02,
  P-IN-04, P-IN-06, P-ST-11) are evidenced by consumer output and CI
  logs, not by frames.
- Tour media: title cards that still say Roost on TunaOS Marlin need a
  branding refresh, not feature-evidence treatment; re-shoot release
  media after the capture-state defects close.
