---
sidebar_position: 36
title: "privacy enforcement"
---

How Tuna Desktop enforces the three `org.gnome.desktop.privacy`
kill-switches — `disable-camera`, `disable-microphone`,
`disable-sound-output` — where GNOME 51 enforces them, and where it
does not. This lane is denial/enforcement only: capture/recording,
privacy screen, USB protection, retention/diagnostics/reporting, and
notification preferences are classified at the end and implemented
elsewhere or not at all.

## GNOME 51 baseline (verified against source)

Schema defaults (all `false` = allowed), from
[`org.gnome.desktop.privacy.gschema.xml.in`](https://github.com/GNOME/gsettings-desktop-schemas/blob/2417a2727f3551d2da405b7fde1d12f7e4fd3d58/schemas/org.gnome.desktop.privacy.gschema.xml.in)
(gsettings-desktop-schemas `2417a27`):

| Key | Summary |
|---|---|
| `disable-camera` | Don't allow applications to access the camera |
| `disable-microphone` | Don't allow applications to access the microphone |
| `disable-sound-output` | Don't allow applications to output sound |

Settings UI: only the camera has a privacy page
([`cc-camera-page.c`](https://github.com/GNOME/gnome-control-center/blob/6ae712c0454f2586f00821c3486150c1e8feb3e7/panels/privacy/camera/cc-camera-page.c),
g-c-c `6ae712c`). It binds the master switch to `disable-camera`
and gates each per-app row on it; there are no microphone or
sound-output pages under `panels/privacy/` (directory listing at
the same revision).

Publication: `xdg-desktop-portal-gnome`
([`lockdown.c`](https://github.com/GNOME/xdg-desktop-portal-gnome/blob/a4f6ed64474ff6fe6c4eb9dbe092d97cafd6ea81/src/lockdown.c),
`a4f6ed6`) binds all three keys to the standard
`org.freedesktop.impl.portal.Lockdown` properties
`DisableCamera`/`DisableMicrophone`/`DisableSoundOutput`
(wire names hyphenated, per
[`Lockdown.xml`](https://github.com/flatpak/xdg-desktop-portal/blob/ee298d1817fed18c208c9ddb638a4aef7bcecc9b/data/org.freedesktop.impl.portal.Lockdown.xml)).

Portal consumers (xdg-desktop-portal `ee298d1`, verified identical
at the installed 1.18.4):

- Camera portal denies **new** `AccessCamera` and
  `OpenPipeWireRemote` sessions with `NOT_ALLOWED`
  ("Camera access disabled") while `DisableCamera` reads true
  ([`camera.c`](https://github.com/flatpak/xdg-desktop-portal/blob/ee298d1817fed18c208c9ddb638a4aef7bcecc9b/desktop-portal/camera.c)).
  Existing sessions are not revoked.
- Device (USB) portal denies microphone/camera/speaker device
  requests on the matching property (`src/device.c` at 1.18.4).
- Microphone capture and sound output otherwise have **no GNOME
  enforcer**: no matches for either key (hyphen or underscore
  spellings) in xdg-desktop-portal (full tree), gnome-shell `js/`
  and `src/` (`eafd268`), gnome-settings-daemon `plugins/`
  (`6301410`), mutter `src/backends`, `src/compositor`, `src/core`
  (`d82671c`, 219 files), pipewire `src/` + `spa`, or wireplumber
  `src/` (all cloned 2026-10-11). Mutter coverage is the plausible
  subset; a full-tree check stays open.

Portal wiring found while proving this (1.18.4 source):

- `.portal` files load from `$XDG_DESKTOP_PORTAL_DIR` or the
  compiled-in portals dir — not from `XDG_DATA_HOME`
  (`src/portal-impl.c` `load_installed_portals`).
- Camera/Device/Location export only when an Access backend is
  configured (`src/xdg-desktop-portal.c`); without one,
  `AccessCamera` fails with `UnknownMethod`, which looks like a
  denial but proves nothing.

## Tuna enforcement design

Settings leg (`crates/shell-host/src/settings.rs`): the
`SettingsBackend` trait gains boolean reads/writes (defaulting to
absent/refused), plus the `PrivacyPolicy` snapshot,
`refresh_privacy`, and per-key writers. Unknown or absent values
keep the snapshot, like every other setting here.

Portal leg (`crates/shell-host/src/lockdown.rs`, started by
`crates/shell-gtk/src/privacy_portal.rs` in the GTK application): Tuna publishes the standard Lockdown
interface itself at `/org/freedesktop/portal/desktop` under
`org.freedesktop.impl.portal.desktop.tuna`, synced from the same
GSettings keys, with `PropertiesChanged` on every move — the same
contract as GNOME's backend, so a session whose portal
configuration maps Lockdown here gets identical denial without
GNOME's backend installed. A fail-closed Access dialog
(response 1, cancelled) rides the same object so Camera exports;
a prompting UI stays with the desktop backend. Bus-originated
property sets persist back to GSettings on the next poll.

The GTK publisher runs on a worker with its own GLib context, reads persisted
policy before acquiring the backend name, and refreshes every 100 ms. Arch,
DEB, and Marlin install the same `tuna.portal` metadata and desktop mapping:
Lockdown resolves to Tuna; prompting Access remains GTK. This publication
runs in the actual GTK shell, independently of the legacy shell-host panel.

`G-PRIVACY-PORTAL` in the GTK CI proof verifies the bus owner is the actual
GTK executable, a camera-disabled setting persisted before startup is
observed, and a real portal frontend admits request handles while allowed,
denies with its exact lockdown error while disabled, and readmits after
restore. Its isolated Access-only fixture cancels dialogs through Tuna's
fail-closed Access implementation; it preserves shipped Lockdown selection.
Timeout, absent interface, generic denial, and malformed reply are failures.
This checks the software camera gate; it does not grant camera permissions
or qualify camera hardware. The receipt records the publisher executable
hash, shipped metadata hashes, fixture override, and observed transitions.

Graph leg (`crates/shell-gtk/src/privacy.rs`,
`audio_state.rs::privacy_scan`, wired into the `pw-dump --monitor`
loop in `services.rs`): on every graph event and every settings
change, the shell mutes what the policy requires and destroys
what must not exist:

- Microphone disabled: every `Audio/Source` reads muted. Capture
  streams keep running but capture silence; an unmute attempt is
  re-muted on the next event. Nothing is destroyed.
- Sound output disabled: every `Audio/Sink` reads muted, same
  re-mute shape.
- Camera disabled: video sources identified by v4l2/libcamera provider properties and their linked capture streams
  linked to them are destroyed, existing and newly appearing. An
  unlinked capture stream captures nothing and is left alone, and
  a stream wired to anything but a camera (a screen-share feed)
  is never touched.

Restore is explicit: flipping a key back unmutes exactly the
nodes this shell muted (a node the user muted by hand stays
muted), and video nodes created after restore survive. Restore
ownership is released only on observed completion — a node stays
owned until the graph shows it unmuted (or gone) — so a restore
deferred past the per-tick dispatch budget, or one whose command
fails, re-plans on the next tick instead of being forgotten. Each
tick dispatches at most 64 steps; the bounded queue drains the
rest on later ticks, and failed steps schedule a bounded retry.

Deliberate deltas from GNOME: Tuna kills existing camera nodes
where GNOME denies new portal sessions only, and Tuna mutes
microphone/sound output where GNOME has no enforcer at all. The
Lockdown publication itself matches GNOME exactly.

## Proof matrix

Committed tests (all in-repo, `cargo test -p tuna-shell-host
--lib`, `cargo test -p tuna-shell-gtk --bin tuna-shell-gtk`):

- `settings::tests::privacy_*`: policy defaults, refresh
  keep-on-unknown, write round-trips, string-only backend
  defaults, live `GioBackend` boolean reads (skips without the
  installed schema; read-only).
- `lockdown::tests::*`: poll sync/write-back/refusal-retry;
  private-bus stub portal proving hyphenated wire names,
  introspection, `PropertiesChanged` content, fail-closed
  `AccessDialog`, and name contention; and
  `real_portal_denies_camera_while_disabled_and_readmits_on_restore`,
  which drives the real `xdg-desktop-portal` daemon: allowed
  (past the gate), disabled (exact `NOT_ALLOWED` denial), restored
  (past the gate again). Skips without the daemon or `dbus-daemon`.
- `audio_state::tests::privacy_scan_*`: JSON fixtures for
  mute-required sets, camera/linked-stream destroy,
  screen-share/unlinked exclusion, and unknown-mixer distrust.
- `privacy::tests::plan_*`: tracker mute/remute/restore/forget
  semantics and command lines.
- `privacy::tests::queue_*` and `restore_cycle::*`: the bounded
  dispatch queue (coalescing, in-flight dedupe, retry bound) and
  production-path cycles through the real feed/scan/plan/queue: a
  100-node disable drains past the 64-step budget to a full
  restore, failed unmutes retry and recover, a persistently
  failing unmute backs off without losing ownership, and
  user-muted nodes keep their mute and identity throughout.
- `privacy::tests::live_pw::*`: real headless PipeWire +
  WirePlumber + GStreamer app streams. The audio leg proves
  existing streams are silenced (not destroyed), a direct unmute
  is re-muted, a late-opened stream is silenced, and restore
  unmutes. The camera leg proves an existing fake-`Video/Source`
  node is destroyed, a late-opened one is destroyed, and a
  post-restore one survives. Skips without the daemons/tools.

Unmeasured (hardware-absent, not failures): a real V4L2/libcamera
device node under a provider that respawns destroyed nodes; the
destroy path is proven against real graph nodes, and the portal
denial needs no camera at all (the gate fires before any hardware
lookup).

## Out-of-scope classification (this slice implements none of these)

- Capture/recording (webcam overlay, mic recording): v2/proposed
  extension; this lane denies, never captures.
- Privacy screen: implemented in the compositor, see below. USB
  protection: gnome-settings-daemon's usb-protection plugin, which needs
  USBGuard (not shipped on Marlin, see below).
- Retention (`old-files-age`, `remove-old-temp-files`,
  `remove-old-trash-files`): external-service responsibility
  (GNOME: settings-daemon housekeeping); no desktop consumer.
- Diagnostics/reporting (`report-technical-problems`,
  `send-software-usage-stats`): external-service
  responsibilities; no desktop consumer.
- Notification preferences: #348, other owner.
- `hide-identity`, `remember-app-usage`,
  `show-full-name-in-top-bar`, `usb-protection-level`: unchanged
  `Ignored` rows, no consumer claimed.

## Open items

- Packaging (tunaos-packages/tunaos, other repos): ship a
  `.portal`/`portals.conf` mapping Lockdown (and only Lockdown)
  at `org.freedesktop.impl.portal.desktop.tuna` for sessions
  without GNOME's backend. Until then the publisher is correct
  but unreferenced in production.
- A prompting Access UI (production uses the desktop backend's).
- Mutter full-tree consumer check for the two audio keys.
- Installed-image qualification on hardware with a real camera.

## Privacy screen (compositor)

`org.gnome.desktop.privacy` `privacy-screen` is consumed by the
compositor's DRM backend as mutter 51.0 consumes it
(`crates/compositor/src/privacy_screen.rs`, `drm/privacy.rs`,
`privacy_screen_settings.rs`):

- A connector has a privacy screen when it exposes the KMS enum
  `privacy-screen hw-state`; it is switchable when it also exposes
  `privacy-screen sw-state`, locked otherwise or when hw-state reads
  `*-locked` (mutter `meta-kms-connector.c`).
- A settings read that differs from the active monitors' global state
  (disabled if any is disabled) writes sw-state on every unlocked
  privacy screen; every applied monitor configuration and session
  activation switches them to the setting again
  (`meta-monitor-manager.c` `apply_privacy_screen_settings`,
  `ensure_privacy_screen_settings`, `meta_monitor_manager_rebuild`).
- A hw-state change the compositor did not request (the firmware
  hotkey, announced as a DRM udev `change` event) writes the setting
  back, so Settings follows the hardware
  (`meta-monitor-manager-native.c` `on_kms_resources_changed`).
- `GetCurrentState` reports `privacy-screen-state` `(bb)` (enabled,
  locked) per monitor that has one and omits it otherwise;
  `MonitorsChanged` follows each change. GNOME Settings' Screen Lock page
  shows its Privacy Screen row only then (`cc-screen-page.c`).

The key is read and written on an owned GIO thread; the frame loop never
waits on GSettings. Tests: `privacy_screen::tests::*` (a fake KMS
connector: discovery, enum mapping, locked/absent screens, refused
writes, settings, hotkey write-back, rebuild),
`privacy_screen_settings::tests::*` (real compiled schema, memory
backend), `mutter::tests::current_state_reports_privacy_screens_as_mutter_does`;
`D-MODES` in `scripts/tuna-drm-smoke` checks a vkms connector reports no
`privacy-screen-state`. Hardware privacy screens (ThinkPad ePrivacy,
Chromebook panels) are unmeasured: vkms, bochs-drm and virtio have no
such property.

## Installed image (2026-10-30)

Corral evidence on the published `marlin:tuna` image and with main
sideloaded: [docs/marlin/2026-10-30-privacy-devices](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin/2026-10-30-privacy-devices/README.md).
In short: the published image ships `tuna-desktop 1.0.0beta.1`, which
predates this enforcement; camera denial there comes from
xdg-desktop-portal-gnome's Lockdown (switch clicked in Settings: portal
`Camera access disabled`, restored on re-enable); microphone and sound
output are not enforced; no gnome-settings-daemon plugin runs, so
Settings' Empty Trash does nothing. USBGuard is not installed
(`pacman -Q usbguard`: not found), so USB protection cannot apply and
Settings hides its row. With main sideloaded, Tuna's Lockdown backend
serves the portal and the shell mutes and unmutes on the keys; the
camera destroy path was not qualified (the simulated node could not be
destroyed even by `pw-cli`).

Native execution verifies Core cookie and object serial, binds the Node resource, and sends mutations through that proxy. Numeric CLI execution remains only an independent legacy test driver. The GTK CI job requires an isolated real PipeWire mute/restore and wrong-identity refusal proof; unit tests alone do not qualify native execution.

### Camera source classification and remaining coverage

A video source class does not identify a camera. [xdg-desktop-portal-wlr](https://github.com/emersion/xdg-desktop-portal-wlr/blob/c0255d7b047b7263629ab5a314661045ff7f65e3/src/screencast/pipewire_screencast.c#L652) creates a desktop source with `media.class=Video/Source` and no camera role. [Mutter 51.0](https://gitlab.gnome.org/GNOME/mutter/-/blob/51.0/src/backends/meta-stream-source.c#L2868) creates its output stream without camera API properties; Tuna's `screencast.rs::start_cast` likewise supplies only a node name. These producers and capture streams linked to them must survive camera disable.

Graph enforcement requires `Video/Source` (including provider subclasses) plus `device.api=v4l2` or `libcamera`, either on the node or on its referenced `PipeWire:Interface:Device` with `media.class=Video/Device`. The upstream [v4l2 provider](https://github.com/PipeWire/pipewire/blob/25193624b1e27e3c36824a632bc759c8523da434/spa/plugins/v4l2/v4l2-device.c#L72) and [libcamera provider](https://github.com/PipeWire/pipewire/blob/25193624b1e27e3c36824a632bc759c8523da434/spa/plugins/libcamera/libcamera-device.cpp#L248) publish this evidence. `media.role=Camera` alone is insufficient.

Unknown source provenance is left intact and exposed through `PrivacyScan.unclassified_video_sources`, with a diagnostic when the set changes. This is a coverage gap for unidentified or virtual camera providers, not proof that camera use is blocked. Graph properties are not an access-control boundary: clients can publish properties. Portal Camera requests remain governed by the portal's Lockdown policy. Issue #356 stays open until the full production and hardware acceptance is established. The virtual graph tests exercise classification and mutations with simulated provider properties; they do not qualify physical camera enforcement.
