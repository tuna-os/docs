---
sidebar_position: 36
title: "protocols"
---

What Tuna Desktop advertises to clients, against what GNOME 51's Mutter
advertises. Ledger row P-SY-06 tracks the gaps.

**Source of the Mutter column.** A `wayland-info` capture of GNOME
Shell 51.0 / Mutter 51.0 (Fedora 45, headless, 1280x800):
`tests/protocols/gnome51-wayland-info.txt`, made by
`scripts/tuna-gnome-wayland-info`. Three globals do not appear headless
(the DRM lease and syncobj managers need the native KMS backend; the
Xwayland keyboard grab is offered to Xwayland only). They are listed from
the interfaces built into the same `libmutter-51.so`, marked `source` in
`tests/protocols/gnome51-globals.tsv`. This is upstream GNOME 51 in a
Fedora container, not a capture from the Marlin baseline VM.

**Native Marlin reference.** [Run 37196669447](https://github.com/tuna-os/tuna-desktop/actions/runs/37196669447)
also captured GNOME Shell/Mutter 51.0 in the derived Marlin GNOME 51
baseline on the shared four-vCPU, 6 GiB, 1280×800 QEMU/KVM profile.
`tests/protocols/marlin-gnome-wayland-info.txt` retains its full output;
`marlin-roost-wayland-info.txt` retains the same run's candidate capture.
`marlin-gnome51-source.json` records capture digests, image/package identity,
the trusted package source and the actual observer checkout. The Tuna Desktop
package is source `7546647e5967825f522a352ee781e0908f889d1e`, so this retained
candidate capture does not certify subsequent implementation changes.

This native session exposes 41 globals. Its existing 40 match the headless
capture's versions; `wp_drm_lease_device_v1` is additionally observed at v1.
`tests/protocols/marlin-gnome51-globals.tsv` preserves the same explicit
Tuna Desktop version floors and deviations, marks the lease as captured, and
keeps the two still-unobserved syncobj/Xwayland-private entries as
source-derived floors. Bochs scanout still exposes dmabuf v3, so this
VM does not establish the dmabuf feedback version of a GPU-capable Mutter
backend. The headless reference remains a separate regression input.

**Comparison.** The proof stage G-WAYLAND-INFO runs `wayland-info`
against the nested Tuna Desktop session (saved as the `wayland-info.txt`
artifact) and `scripts/tuna-wayland-info-compare` checks it against
`tests/protocols/gnome51-globals.tsv`. Every global marked `match` must
be present at GNOME's version or newer, and every `min:` global at least
at the version given. Known gaps are reported and do not fail the stage.

The same stage additionally compares against the native Marlin TSV,
retaining `wayland-info-marlin-compare.txt`. Every native captured global
is represented by a match, a version floor or a recorded deviation; a
source-only floor is never described as a measured native version.

**Golden test.** `crates/compositor/tests/protocols.rs` asserts the exact
list and versions an ordinary client sees (`EXPECTED`), that the
supervised shell's connection sees exactly that plus `SHELL_ONLY`
(layer-shell, the foreign toplevel list), and that a client inside a
`wp_security_context_v1` sees `EXPECTED` less `SANDBOX_HIDDEN` (session
lock, security context). Adding or dropping a protocol updates the test
and this page together.

## Advertised by Tuna Desktop

| Global | Version | Notes |
|---|---|---|
| wl_compositor | 6 | preferred buffer scale sent per surface, for the output it is on |
| wl_subcompositor | 1 | a subsurface placed above or below its parent is drawn there on the desktop, in the overview's window previews and in window screenshots (G-SUBSURFACE-STACKING, #1255) |
| wl_shm | 2 | |
| wl_seat | 9 | |
| wl_output | 4 | one per connected output |
| wl_data_device_manager | 3 | |
| zwp_primary_selection_device_manager_v1 | 1 | |
| xdg_wm_base | 7 | popups with positioner constraints and grabs; edge states from Mutter's edge constraints: maximized is tiled and constrained on every edge, a half tile on its top, bottom and outer edge (Tuna Desktop pairs no tiles, so the inner edge stays free); constrained states only to version 7 binds; toplevels are told `suspended` as in Mutter ([below](#suspended-windows)) |
| zxdg_output_manager_v1 | 3 | |
| zwlr_layer_shell_v1 | 4 | Tuna Desktop's own shell draws through it. Only the supervised shell's connection may bind it: the native connection whose peer pid is the shell child the compositor spawned and still holds (`tuna-shell-gtk`, or the legacy `tuna-shell-host`), the same identity the session lock and control socket check. Every other client's registry omits it and a blind bind by name is a protocol error (#1048; `ClientState::admit_supervised_shell`, `layer::is_shell_peer`) |
| zwp_linux_dmabuf_v1 | 5 | only when the renderer reports formats; as Mutter, version 5 when the renderer's EGL device names a render node (else its DRM node), with default feedback naming that device and one tranche of the renderer's formats, and version 3 without one; no scanout tranche, since every surface is composited |
| xdg_activation_v1 | 1 | focus policy below |
| wp_viewporter | 1 | |
| wp_fractional_scale_manager_v1 | 1 | preferred scale 1 until #59 |
| wp_single_pixel_buffer_manager_v1 | 1 | |
| wp_cursor_shape_manager_v1 | 2 | shapes accepted; the compositor cursor is still the default arrow |
| zwp_idle_inhibit_manager_v1 | 1 | an inhibitor holds off the idle lock while its surface is mapped and on screen: one on an unmapped surface, a window that never drew, a hidden or occluded window or one off every output lapses, as the protocol says |
| zwp_text_input_manager_v3 | 1 | text fields reach the input method (#60) |
| zwp_input_method_manager_v2 | 1 | private to the compositor-supervised IBus connection, using the same server-owned transport authorization as virtual keyboard; ordinary applications cannot discover or force-bind it. This is not a public GNOME IME API. One exact live input-method resource owns the seat; unavailable objects and their inert child IDs cannot type, observe surrounding text, reserve popup roles, take grabs or retire the owner |
| zwp_pointer_gestures_v1 | 3 | swipes reach apps; three-finger swipes are the shell's (overview, workspaces) |
| zwp_relative_pointer_manager_v1 | 1 | raw motion from the DRM backend |
| zwp_tablet_manager_v2 | 2 | tablets, tools (pressure, tilt, distance, buttons, tool cursors) and pads (buttons, rings, strips, mode groups, application labels shown on the pad OSD) from libinput on the DRM backend; the vendored Smithay adds pads, labels and version 2 (`third-party/smithay/TABLET-PAD-API-PATCH.diff`); pad dials need libinput 1.26 (the `input` crate's `libinput_1_26` feature), newer than Ubuntu 24.04's 1.25 (#344) |
| zwp_pointer_constraints_v1 | 1 | a locked pointer stays put; a confined one stays in its window |
| ext_session_lock_manager_v1 | 1 | the shell's lock screen; only the supervised shell's lock is granted, and only a password the compositor verified unlocks; while locked, input goes only to the lock surface (or nowhere without one), keyboard focus leaves applications as the session locks and returns to the focused window on unlock; duplicate_output is checked per lock object, so a refused or superseded lock does not make the shell's next lock on the same output a protocol error (`third-party/smithay/SESSION-LOCK-OUTPUTS-PATCH.diff`). Hidden from clients inside a security context |
| wp_presentation | 2 | CLOCK_MONOTONIC, as Mutter; see frame timing below |
| wp_fifo_manager_v1 | 1 | a barrier is released on the next refresh cycle |
| wp_commit_timing_manager_v1 | 1 | a timed update applies on the refresh cycle whose next presentation reaches its time; a tv_nsec of a second or more is an invalid_timestamp error, as in Mutter |
| xdg_wm_dialog_v1 | 1 | a modal dialog is attached to its parent: focusing the parent focuses the dialog (GNOME's attach-modal-dialogs) |
| zxdg_exporter_v2, zxdg_importer_v2 | 1 | xdg-foreign: the portal parents its dialogs to the app's window, which centres and attaches them like the app's own |
| zxdg_exporter_v1, zxdg_importer_v1 | 1 | GTK 3's xdg-foreign: one handle table with v2, as Mutter, so the portal's v2 import parents its dialogs to a GTK 3 window; revoking an export destroys its imports and clears their parents (`third-party/smithay/XDG-FOREIGN-V1-PATCH.diff`) |
| xdg_system_bell_v1 | 1 | Mutter 51's bell (`src/core/bell.c`): with `audible-bell` and `event-sounds` it plays GNOME's `bell-window-system` through `canberra-gtk-play` when installed (a burst of rings is one sound); with `visual-bell` it flashes the ringing window's frame or the whole output per `visual-bell-type`, at most once per 500 ms. X11 clients' XKB bells take the same path through the window manager (`XkbBellNotify`, as Mutter's `src/x11/events.c`). Proofs G-VISUAL-BELL, G-X11-BELL |
| xdg_toplevel_tag_manager_v1 | 1 | each window keeps its tag and description |
| xdg_session_manager_v1 | 1 | window session save and restore as in Mutter 51 (P-SY-08): a client that opens a session gets its windows back after logout or reboot (workspace, position and size, maximized, tiled, fullscreen, output; minimized is not restored, as in Mutter); store `$XDG_DATA_HOME/tuna/window-sessions.json`, written 3 s after a change and at exit (`crates/compositor/src/xdg_session.rs`) |
| zwp_keyboard_shortcuts_inhibit_manager_v1 | 1 | after Allow, the focused window gets every key, the shell's grabs, Super and Alt+Tab included; Super+Escape (Mutter's restore-shortcuts) takes them back until the window is focused again |
| wp_pointer_warp_v1 | 1 | honoured while the surface has pointer focus from the enter serial it names; nested, the host pointer stays where it is |
| wl_fixes | 1 | `destroy_registry` destroys the registry as Mutter does: the client's id is freed and that registry hears no more globals |
| ext_background_effect_manager_v1 | 1 | capabilities `blur` at bind; one effect object per surface (`background_effect_exists`), `set_blur_region` double-buffered on commit, NULL removes it, `surface_destroyed` once the surface is gone; destroying the object unsets the region on the next commit (meta-wayland-background-effect.c). Drawn as Mutter 51's meta-background-effect.c and clutter-blur.c: the scene beneath the surface, clipped to the surface and its region, blurred (separable gaussian, sigma = radius / 2, radius 24 logical px times the surface's scale, downscaled by powers of two while sigma > 6 and both sides > 256 px), saturation 1.25 and 0.015 grain, at the surface's opacity, under its content; a repaint touching the sample area (region + 2 × radius) repaints all of it, and windows beneath an opaque blurred window still draw there. Not applied to overview previews or Alt+Tab thumbnails (Mutter also blurs behind clones) |
| wp_drm_lease_device_v1 | 1 | native DRM backend only, as Mutter (`meta-wayland-drm-lease.c`): one global for the session's DRM device, advertised even with nothing to lease; absent nested and headless, so the golden list does not include it. A connected connector is for lease when the kernel marks it `non-desktop` (VR headsets) or `TUNA_DEBUG_LEASE_CONNECTORS` names it (Mutter's `MUTTER_DEBUG_LEASE_CONNECTORS`: colon-separated connector names; the `MUTTER_` name is not read, so a value set for GNOME cannot take a monitor off Tuna Desktop). Such a connector is never a desktop output; when every connected connector is for lease the session starts with no monitor, as Mutter runs. A lease takes per connector a CRTC no desktop output or other lease uses, its primary plane and, when there is one, its cursor plane, else `finished` (`meta-drm-lease.c` `find_resources_to_lease`); leased connectors are withdrawn and offered again when the client destroys the lease or closes the lease fd (the kernel's lease uevent; `update_leases`). Connector hotplug (udev change events) offers and withdraws connectors for lease, ending a lease whose connector went away (`update_connectors`); desktop outputs still do not follow hotplug, and vkms cannot hotplug, so no proof covers this path. A VT switch withdraws every connector and ends every lease, and activation offers them again. Clients get a non-master fd the compositor opens on the card itself, as Mutter does (the session user needs logind's uaccess ACL on the card); a binding that cannot get one stays pending without events until the session is next activated (Mutter's pending resources). Mutter's monitors.xml `for-lease` option and lease devices for a second GPU are not implemented. Vendored Smithay changes: `third-party/smithay/DRM-LEASE-PATCH.diff`. drm-smoke D-LEASE proves advertisement, the empty case and real leases on vkms; leasing to a real headset is hardware-only |
| wp_security_context_manager_v1 | 1 | a sandbox engine (Flatpak) creates a listener; every client accepted on it joins the display tagged with the context (sandbox engine, app id, instance id: `ClientState::security_context`) until the engine closes the context's close fd. Such a client is refused every privileged global whatever else it is (layer-shell, the foreign toplevel list, input-method, virtual keyboard, `mutter_x11_interop`: `ClientState::privileged`), does not see the session lock, and does not see this manager, so it cannot nest. The published `sandboxed-app-id` stays the one read from the live peer, not the engine's claim (#1046) |
| ext_idle_notifier_v1 | 2 | idle and resumed from the clock org.gnome.Mutter.IdleMonitor keeps: every timestamped input event restarts it, and the notifications are checked on the same loop tick and deadline. `get_idle_notification` honours the idle inhibitors the idle lock honours (zwp_idle_inhibitor_v1 and org.gnome.SessionManager's idle flag): it never idles while one is held, an idle one resumes when one appears, and its timeout restarts when the last goes. `get_input_idle_notification` counts input alone (`crates/compositor/src/idle_notify.rs`, #1046) |
| wp_content_type_manager_v1 | 1 | the hint is kept per surface and applied on commit (`protocols::surface_content_type`); recorded for future VRR and frame scheduling, nothing acts on it yet (#1046) |
| ext_foreign_toplevel_list_v1 | 1 | the supervised shell's alone, like layer-shell: window titles and app ids are published only to the shell and the portal picker (`docs/security-model.md`), so every other registry omits it and a blind bind is a protocol error. A handle per window in the window model, native and X11 alike, with its title and app id (empty when unknown), updated when either changes and `closed` when the window unmaps (#1046) |
| wp_alpha_modifier_v1 | 1 | the multiplier applies wherever a surface is drawn: Smithay's `WaylandSurfaceRenderElement`, which every surface draw goes through, multiplies it into the element's alpha (#1046) |

### xdg-activation policy

A token is valid only when the client that asks for it holds keyboard
focus and attaches an input serial. It works once, within 10 seconds.
A valid request focuses the window and raises it unless
`org.gnome.desktop.wm.preferences raise-on-click` is off (Mutter activates
these as `META_CLIENT_TYPE_APPLICATION`). This is Mutter's
focus-stealing prevention in its simplest form: a background app cannot
mint its way to the front.

### Frame timing

presentation-time, fifo and commit-timing follow the frame path
(`crates/compositor/src/frame_timing.rs`):

- Feedback is taken from the surfaces a frame drew. On hardware it is
  marked presented at that output's page flip with the kernel's vblank
  time and sequence and Mutter's KMS flags (vsync, hardware clock,
  hardware completion). Nested, it is marked when the host takes the
  frame, timed by the compositor's clock, with no flags (Mutter's nested
  backends cannot vouch for the host either). A surface not drawn (a
  hidden workspace, the lock screen up) keeps its feedback until it is,
  or until a newer update discards it.
- Fifo barriers and commit timers advance once per refresh cycle (the
  primary output's page flip; nested, each frame) on every surface that
  receives frame callbacks, drawn or not, so a client on a hidden
  workspace never stalls.

### Suspended windows

The `xdg_toplevel` `suspended` state (xdg-shell v6) follows Mutter's
window suspend state (`update_suspend_state` in `src/core/window.c`,
`crates/compositor/src/suspend.rs`):

- A window is shown while a frame draws any of it: on the active
  workspace (or both during a workspace slide), not minimized, and not
  wholly under opaque windows; while the overview, the window switcher
  or a cast shows window clones, every window is. While the screen is
  locked none is (GNOME Shell hides its window group under the lock).
- A window not shown for 3 s (Mutter's `SUSPEND_HIDDEN_TIMEOUT_S`) gets a
  configure with `suspended`. It gets one without it as soon as it is
  shown again, before the frame that draws it (a culled window uncovered
  by a moving window is told right after that frame).
- Only a change of state is configured; a client older than v6 is never
  told, and keeps the hidden windows' frame callbacks.
- A hidden window gets frame callbacks about once a second; once told it
  is suspended, none, as Mutter sends hidden surfaces none, until it is
  shown again. A configure it has not acknowledged keeps full-rate
  callbacks meanwhile.
- `suspended_windows` in the compositor state lists the suspended
  windows.

Activation changes are configured the same way: a window losing focus
gets one configure, never a second identical one.

### Keyboard shortcuts inhibit

Tuna Desktop asks before letting a focused, mapped app take shortcuts. The GTK
shell shows a modal with Deny and Allow and explains Super+Escape.
Only Allow activates the inhibitor; Deny cannot be undone by refocusing.
Known desktop apps use GNOME's PermissionStore (`gnome` table,
`shortcuts-inhibitor` id, `GRANTED`/`DENIED` values), so remembered grants
skip the dialog. Unknown apps are never remembered. An unavailable store
opens the dialog. Background requests, stale responses, destroyed surfaces
and requests outstanding at lock or a switch to another app fail closed.
The non-GTK fallback shell has no consent UI and keeps requests inactive.
Super+Escape always takes granted shortcuts back until the window is
focused again. GNOME's configurable Xwayland exemption rules are not
implemented. `scripts/tuna-shortcut-proof` exercises Allow, Deny, refocus,
emergency restore, stale focus and lock through a real Wayland test client.

## GNOME D-Bus interfaces

GNOME's portal backend (xdg-desktop-portal-gnome) talks to GNOME Shell
and Mutter over D-Bus, not Wayland. Tuna Desktop serves those interfaces itself,
as niri does, so the stock portal works.

| Interface | Tuna Desktop | Notes |
|---|---|---|
| org.gnome.Shell.Screenshot | Screenshot, ScreenshotWindow | saves a PNG of the screen or the focused window; the name is left to a real GNOME Shell when one runs (nested preview) |
| org.gnome.Mutter.ScreenCast | CreateSession, RecordMonitor, RecordWindow, Start, Stop | monitor and window streams over PipeWire (BGRx, shared memory, up to 30 fps), adapted from niri; window streams follow resizes and end when the window closes |
| org.gnome.Mutter.DisplayConfig | GetCurrentState, ApplyMonitorsConfig | the portal's monitor picker and GNOME Settings' Displays panel (modes, refresh, scale, position, rotation, mirroring, disabling; Mutter 51 verify/temporary/persistent with confirmation) |
| org.gnome.Mutter.InputCapture | CreateSession, SupportedCapabilities; Session: GetZones, AddBarrier, ClearBarriers, Enable, Disable, Release, ConnectToEIS, Close; Activated, Deactivated, ZonesChanged, Disabled, Closed | the portal's InputCapture (Input Leap, Deskflow): pointer barriers on outer monitor edges, then pointer and keyboard go to the session's EIS receiver instead of clients until Release; installed portal only, never while locked (#1040, [input capture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/input-capture.md)) |
| org.gnome.Shell.Introspect | yes | window list for the portal's window picker and running apps (with `sandboxed-app-id`) for its Background portal; desktop-portal callers only, like GNOME Shell (#61). As in GNOME 51, the same `/org/gnome/Shell/Introspect` object also answers under `org.gnome.Shell`, where xdg-desktop-portal-gnome's Background portal asks: the GTK shell relays it to the compositor, which admits the original caller with the same rule (#410) |
| org.freedesktop.PolicyKit1.AuthenticationAgent | BeginAuthentication, CancelAuthentication | the GTK shell registers as this session's polkit agent (system bus, again whenever polkit restarts) and shows GNOME's Authentication Required dialog; passwords go to polkit's helper as libpolkit-agent-1 sends them: through `/run/polkit/agent-helper.socket` (socket-activated `polkit-agent-helper@.service`, polkit ≥ 127) first, else the setuid `polkit-agent-helper-1`. A wrong password restarts the conversation as GNOME does; a helper that fails before asking waits for Authenticate instead of respawning (#884) |
| org.gnome.Mutter.IdleMonitor | GetIdletime, AddIdleWatch, AddUserActiveWatch, RemoveWatch, WatchFired | the session's idle time and watches, served by the compositor; gnome-settings-daemon dims and blanks on it, and banners wait for an away user |
| org.gnome.Shell | ShowOSD, FocusSearch, ShowApplications, GrabAccelerator(s), UngrabAccelerator(s), AcceleratorActivated, AcceleratorDeactivated; Mode, OverviewActive, ShellVersion | served by the GTK shell: gnome-settings-daemon's media keys grab their keys here (the compositor keeps them from apps, in the action modes they ask for, the lock screen included) and show the volume and brightness OSD; GNOME's caller allowlist (Settings, media keys, the GNOME portal backend); a caller's grabs go when it leaves the bus. Grab flags `IGNORE_AUTOREPEAT` and `TRIGGER_RELEASE` are honoured (others refuse the grab): a held key's release reaches its caller as AcceleratorDeactivated, never across a lock or to a re-created grab. As Mutter's synchronous grab, a (un)grab call returns only once the compositor has installed the changed table (its `CommandResult`), so a key pressed after the reply meets it |

Accelerator mutations are serialized: only their own request's
`CommandResult` commits the proposed grab table and completes the D-Bus
call. A denied or lost admission returns an error and cannot reappear in
a subsequent table; a denied ungrab keeps the installed owner. Internal
rebinding keeps the installed action callbacks until their replacement
is acknowledged, accepting either generation's already-emitted events
within the same control drain. Every full table, including one sent for
an external grab, retains an `Rc` snapshot of its actual internal callback
generation until its own result; maps are not copied per external call.
Request identities also retain the local control-connection generation:
if another send redials between GTK socket pumps, old-link calls fail,
while admissions already sent on the new link remain pending normally.

## Gaps against Mutter

From the GNOME 51 capture. The globals not listed here are offered at
GNOME's version.

| Protocol | GNOME 51 | Tuna Desktop | Why, and where tracked |
|---|---|---|---|
| wl_seat | 10 | 9 | Smithay 0.7 creates the seat at 9 and implements nothing newer; bumps with Smithay (#89) |
| zwp_text_input_manager_v3 | 2 | 1 | Smithay 0.7 implements v1 only; bumps with Smithay (#60) |
| xdg_toplevel_drag_manager_v1 | 1 | missing | not in Smithay 0.7: a window attached to a drag-and-drop operation and moved with it (detachable browser tabs) (#89) |
| wp_color_manager_v1 (v2), wp_color_representation_manager_v1 | 2, 1 | missing | not in Smithay 0.7: needs a colour-managed renderer (ICC/HDR, YUV conversion); the GLES path is sRGB only (#89) |
| wp_linux_drm_syncobj_manager_v1 | source-derived floor 1; absent in this VM capture | missing | explicit sync needs the DRM backend's syncobj import; GPU-capable native acceptance remains open (#68, #89) |
| zwp_xwayland_keyboard_grab_manager_v1 (Xwayland only; from source) | — | missing | only rootful Xwayland with `-host-grab` uses it, and Mutter allows grabs only per `xwayland-grab-access-rules`; Tuna Desktop runs rootless Xwayland (#89) |
| zwp_linux_dmabuf_feedback_v1 scanout tranches | per-surface feedback adds a scanout tranche for a direct-scanout candidate (`meta_wayland_dma_buf_surface_feedback`) | default feedback only | Tuna Desktop has no direct scanout of client buffers: every surface is composited, so a scanout tranche would point clients at planes nothing uses; it comes with direct scanout (perf lane) |
| gtk_shell1 | 7 | missing | not planned: GTK4 needs none of it on a GNOME session |

## Deliberate differences

- **xdg-decoration is absent,** as in Mutter. GNOME is client-side
  decorations only, and the golden test asserts the absence.
- **layer-shell is present,** unlike Mutter. Tuna Desktop's shell is a separate
  process and draws its panel, overview and banners through it. Only that
  supervised shell can see or bind it; applications cannot, so they have no
  more surface-placement reach than on GNOME.
- **security-context, ext-idle-notify, content-type, ext-foreign-toplevel-list
  and alpha-modifier are present,** though Mutter 51 advertises none of
  them (#1046). Smithay 0.7 implements them and they cost GNOME apps
  nothing: security-context lets Flatpak mark its clients so they are kept
  from every privileged global, idle-notify serves idle daemons from the
  idle clock GNOME's IdleMonitor already uses, content-type is only
  recorded, and alpha-modifier only changes how a client's own surface is
  blended. The foreign toplevel list is offered to the supervised shell
  only, so applications learn no more about other windows than on GNOME.

The clipboard outlives the client that copied it, as Mutter's
`meta-clipboard-manager.c` keeps it. When a client sets the clipboard
(`wl_data_device` or data control), the compositor copies its most
preferred supported type in Mutter's order (images up to 200 MiB, plain
text up to 4 MiB; a larger copy is cut at the limit, as Mutter's is).
When that owner clears the clipboard, destroys its source or
disconnects, the compositor offers the finished copy, that one type
only, as its own selection. The primary selection is not retained, as in
Mutter. Unlike Mutter, a RemoteDesktop session's selection is not
copied (`crates/compositor/src/clipboard_manager.rs`, #1033).

`xdg_toplevel_icon_manager_v1` v1 accepts square SHM icons and sanitized theme names, applied on the next surface commit. PNGs live in a private, bounded compositor cache. X11 `_NET_WM_ICON` and legacy square TrueColor `WM_HINTS` pixmaps (24/32-bit color, optional 1-bit transparency mask) are read on a bounded worker for mapped window identities. Palette and unsupported visuals fall back to a generic app icon.
