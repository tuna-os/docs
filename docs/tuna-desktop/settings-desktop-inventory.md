---
sidebar_position: 45
title: "settings desktop inventory"
---

All 428 keys from `gsettings-desktop-schemas-51.0-1.fc45.x86_64` in the GNOME 51 reference container. Source re-audit: main `44edb6aca704ef0ada32b8c6111383ea5c3c6afe` (2026-10-06). See [the control-center audit](https://github.com/tuna-os/tuna-desktop/blob/main/docs/gnome-settings-audit.md) for open implementation and qualification gaps. “Via GTK” means the GTK Wayland backend translates the key through its settings portal or direct GSettings fallback; it does not imply support by every application or the compositor. “Ignored” records a current limitation, not permission to disregard binding knowledge.

Handedness follow-up: main `c822ab91abbb8c07fdd89ddde5c81a71f7843ff3`, after qualified #379. Mouse and touchpad dispositions below reflect the merged libinput consumers; tablet handedness remains unsupported.

Switcher follow-up: main `c387326d067a53b7b583aafb9e0206fba0fab59c` (2026-10-10). The six `switch-windows`, `cycle-windows`, and `cycle-group` forward/backward dispositions below already match the live `SetSwitcherKeys` registration in `crates/shell-gtk/src/keybindings.rs`. This review covers those six keys, not a fresh qualification of all 429 keys. The count checker checks completeness and duplicates only; an “Honored” disposition identifies a consumer and does not establish GNOME 51 behavioral parity. Legacy and app-owned contracts still require explicit enforcing-owner decisions and application/panel evidence under [#365](https://github.com/tuna-os/tuna-desktop/issues/365).

Orientation follow-up: w2-345 (#345). `orientation-lock` never lived under `org.gnome.desktop.peripherals.touchscreen`: mutter 51.0 reads it from `org.gnome.settings-daemon.peripherals.touchscreen` (`src/backends/meta-orientation-manager.c` `CONF_SCHEMA`), and the desktop touchscreen schema holds only `output`. The row and its pinned key are removed (429→428 keys); the settings-daemon key is tracked in [settings-map.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md).

Privacy follow-up: w3-356-privacy (#356). The three `org.gnome.desktop.privacy` device kill-switches move to Honored with the enforcing services identified per key; retention, diagnostics, and reporting rows stay Ignored as external-service responsibilities. Mechanism, GNOME 51 comparison, and proof matrix are in [privacy-enforcement.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/privacy-enforcement.md).

Focus-policy follow-up: feat/focus-policy (#347, ledger P-WM-09). `focus-mode`, `auto-raise`, `auto-raise-delay`, `raise-on-click`, `mouse-button-modifier` and `resize-with-right-button` move to Honored: the compositor reads them live on an owned GIO thread (`crates/compositor/src/wm_preferences.rs`) with Mutter 51.0's semantics (`crates/compositor/src/focus_policy.rs`). The three `action-*-click-titlebar` keys stay Via GTK: titlebars are client-side and GTK runs those actions itself.

Wellbeing renderer evidence: candidate `529f71648f3286092b55b93f59983a2882de3ec5` (2026-10-12). The GTK entry point starts [the wellbeing runtime](https://github.com/tuna-os/tuna-desktop/blob/main/crates/shell-gtk/src/wellbeing.rs), which watches the schemas, maintains `$XDG_DATA_HOME/gnome-shell/session-active-history.json`, registers notice actions and sends effects through the control client with correlated `Applied` responses. [Exact-source native renderer evidence](https://github.com/tuna-os/tuna-desktop/actions/runs/38320982358) was independently rechecked for 38 pixel comparisons from 44 original PNGs: entry/midpoint/endpoint, combined effects, immediate disable, reduced-motion/animations-off controls and cursor exclusion under nested winit/Xvfb/llvmpipe. This uses a supervised synthetic control peer; it does not qualify production GTK wellbeing policy, installed DRM/GPU sessions or the complete feature. The countdown stop hook now cancels only its owned OSD display and timer, preserving a newer volume/brightness display; the added actual GTK regression awaits exact-source CI execution. [#354](https://github.com/tuna-os/tuna-desktop/issues/354) remains open.

Source: [GTK Wayland settings translations](https://gitlab.gnome.org/GNOME/gtk/-/blob/4.22.0/gdk/wayland/gdksettings-wayland.c). Related shell, Mutter and settings-daemon keys are in [settings-map.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md).

## Enforcing owners (#365)

Owner review: main `e730d9e2` (2026-10-30) against gnome-shell, mutter, gnome-settings-daemon, gnome-control-center, gnome-session, gnome-desktop, gnome-remote-desktop, xdg-desktop-portal-gnome and nautilus 51.0 and gtk 4.22.0. The fourth column names who enforces each key in GNOME 51 and what proves Tuna's side:

- `implemented` — Tuna Desktop consumes the key. The cell cites the GNOME 51 consumer it follows and at least one `proof:`/`journey:` gate or `cargo:` test that exercises it.
- `toolkit` — GTK translates the key (gtk 4.22 `gdk/wayland/gdksettings-wayland.c`, fed by `org.freedesktop.portal.Settings` from xdg-desktop-portal-gnome); clients enforce it.
- `app-owned` — an application, portal or daemon other than the shell and compositor enforces it (GNOME Settings, gnome-remote-desktop, gnome-session, xdg-desktop-portal-gnome, gsd housekeeping, text editors and terminals).
- `deprecated` — nothing in GNOME 51 applies it on Wayland; the cell says which sources were searched.
- `unimplemented` — GNOME 51's shell or compositor enforces it and Tuna does not; the cell links the open issue.

`[GNOME Settings: …]` marks keys that a gnome-control-center 51.0 panel writes. Such a key, when implemented, must cite an observable `proof:`/`journey:` gate or an open issue for one. `scripts/tuna-settings-inventory-check` enforces all of this and that every cited id exists. Key-count coverage is not behaviour coverage: a cited cargo test proves a consumer, not GNOME 51 parity, and an `implemented` row can still carry open qualification in its Reason.

Stale rows corrected in this review (they were `Ignored` while main consumed them): `locate-pointer`, `switch-panels(-backward)`, `audible-bell`/`visual-bell`/`visual-bell-type`, every `notifications`/`notifications.application` policy key (#348), the `peripherals.tablet*` keys (P-IN-05), the background/screensaver gradient keys, and `document-font-name`/`monospace-font-name`/`font-rendering` (toolkit/app reads, proof G-SET-FONTS).

## org.gnome.desktop.a11y

| Key | Status | Reason | Owner |
|---|---|---|---|
| always-show-text-caret | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:303` |
| always-show-universal-access-status | Honored (GTK shell) | Live accessibility indicator visibility follows GNOME 51: requested or any enabled menu feature; menu bindings do not establish compositor support for every feature. Proof G-A11Y-MENU-RESTART drives the menu with real keys across one shell restart; scope in accessibility-shell.md | implemented — gnome-shell 51 `js/ui/status/accessibility.js:11`; cargo:live_menu_and_focus_settings, proof:G-A11Y-MENU-RESTART [GNOME Settings: universal-access] |

## org.gnome.desktop.a11y.applications

| Key | Status | Reason | Owner |
|---|---|---|---|
| screen-keyboard-enabled | Honored | GTK shell shows GNOME 51's on-screen keyboard (gnome-shell `keyboard.js`, GNOME's osk-layouts) on the focused text field's input-panel request and types through the compositor; the lock screen's keyboard edits only the unlock prompt (G-OSK-SHOW, G-OSK-TYPE, G-OSK-SHIFT, G-OSK-LOCK; #349) | implemented — gnome-shell 51 `js/ui/keyboard.js:24`; proof:G-OSK-LOCK, proof:G-OSK-SHIFT, proof:G-OSK-SHOW [GNOME Settings: universal-access] |
| screen-magnifier-enabled | Honored | GTK shell mirrors the switch plus every org.gnome.desktop.a11y.magnifier key into the session snapshot; the compositor draws GNOME 51's ZoomRegion on every output frame (zoom, tracking, cross-hairs, color effects, magnified pointer sprite), and captures/casts read back the same passes; Super+Alt+8 toggles it (M-KEYS). Accepted differences: per-monitor regions, touch mapped through the zoom, window-centre fallback for non-AT-SPI apps, shell popover focus untracked (#349) | implemented — gnome-shell 51 `js/ui/status/accessibility.js:49`; proof:M-DISABLE, proof:M-KEYS, proof:M-LOCK [GNOME Settings: universal-access] |
| screen-reader-enabled | Honored (hardware session only) | Hardware GTK shell publishes the preference to the compositor, which owns a genuine nonreplacement Orca child bound to its lifetime; nested runtimes refuse activation and never manage host Orca. Genuine Orca activation/logout VM probes are required; Settings UI activation and complete spoken lock/login/shell navigation remain unqualified (#352) | implemented — gnome-shell 51 `js/ui/status/accessibility.js:56`; cargo:screen_reader_lifecycle_survives_control_wire; observable proof pending #352 [GNOME Settings: universal-access] |

## org.gnome.desktop.a11y.interface

| Key | Status | Reason | Owner |
|---|---|---|---|
| high-contrast | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:304` [GNOME Settings: universal-access] |
| keyboard-focus-visible-timeout | Honored (GTK shell) | Live a11y.interface seconds preference controls shell focus visibility: zero forever, negative toolkit default; GTK property when present and a weak-window fallback on older GTK. Proof G-FOCUS-RING-TIMEOUT times the panel's focus fill after real keys (GTK 4.14 fallback path). GNOME Shell's St chrome ignores this key; external application/installed image qualification remains separate; see accessibility-shell.md | implemented — gcc 51 `panels/universal-access/cc-ua-macros.h:59`; cargo:focus_timeout_preserves_forever_and_toolkit_default, proof:G-FOCUS-RING-TIMEOUT [GNOME Settings: universal-access] |
| reduced-motion | Honored | GNOME 51 reduce/no-preference enum combines with enable-animations into the shared full/fade-only/off motion policy: reduce keeps fades (idle shield) and snaps shell GTK transitions and compositor motion; live proof G-ANIMATIONS-OFF; Introspect AnimationsEnabled stays true under reduce, as in GNOME 51 (G-INTROSPECT-MOTION, qualification pending) | implemented — gnome-shell 51 `src/st/st-settings.c:36`; proof:G-ANIMATIONS-OFF, proof:G-FOLDER-ZOOM, proof:G-HOT-CORNER-RIPPLES, cargo:reduced_motion_keeps_only_the_fade, cargo:reduced_motion_keeps_fades_and_off_keeps_nothing [GNOME Settings: universal-access] |
| show-status-shapes | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:305` [GNOME Settings: universal-access] |

## org.gnome.desktop.a11y.keyboard

| Key | Status | Reason | Owner |
|---|---|---|---|
| bouncekeys-beep-reject | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Rejected Bounce Keys events reach the shared bell policy; audible and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1425`; proof:G-A11Y-BOUNCE, cargo:bounce_keys_drop_a_quick_repeat_of_the_same_key [GNOME Settings: universal-access] |
| bouncekeys-delay | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live delay reaches compositor Bounce Keys rejection timing; exact combined runtime acceptance remains pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1452`; proof:G-A11Y-BOUNCE [GNOME Settings: universal-access] |
| bouncekeys-enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference enables compositor Bounce Keys before client delivery; exact combined runtime acceptance remains pending (#350/#365) | implemented — gnome-shell 51 `js/ui/status/accessibility.js:15`; proof:G-A11Y-BOUNCE [GNOME Settings: universal-access] |
| disable-timeout | Ignored | No Tuna inactivity-timeout consumer. Mutter51 native loads this legacy delay but never applies it; compatibility disposition remains open under #365. See [native keyboard audit](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/keyboard-native-parity.md) | deprecated — mutter 51 `src/backends/meta-input-settings.c` loads it but the native aid engine never applies it |
| enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Controls the five-Shift/eight-second-Shift accessibility shortcuts, independently of aid enable keys, as in Mutter51; combined runtime acceptance remains pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1417`; proof:G-A11Y-SHORTCUTS, cargo:shift_five_times_switches_sticky_keys_and_back [GNOME Settings: universal-access] |
| feature-state-change-beep | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Aid shortcut changes reach the shared bell policy; audible and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1430`; proof:G-A11Y-SHORTCUTS, cargo:shift_five_times_switches_sticky_keys_and_back |
| mousekeys-accel-time | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference reaches compositor Mouse Keys acceleration; actual motion and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1458`; proof:G-A11Y-MOUSEKEYS |
| mousekeys-enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference enables compositor keypad pointer/button synthesis; actual motion and installed-session acceptance remain pending (#350/#365) | implemented — gnome-shell 51 `js/ui/status/accessibility.js:17`; proof:G-A11Y-MOUSEKEYS [GNOME Settings: universal-access] |
| mousekeys-init-delay | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference reaches compositor Mouse Keys initial movement delay; actual motion and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1454`; proof:G-A11Y-MOUSEKEYS |
| mousekeys-max-speed | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference reaches compositor Mouse Keys speed limit; actual motion and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1456`; proof:G-A11Y-MOUSEKEYS |
| slowkeys-beep-accept | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Accepted Slow Keys events reach the shared bell policy; audible and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1422`; cargo:slow_keys_deliver_only_keys_held_past_the_delay; observable proof pending #353 [GNOME Settings: universal-access] |
| slowkeys-beep-press | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Slow Keys press events reach the shared bell policy; audible and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1421`; cargo:slow_keys_deliver_only_keys_held_past_the_delay; observable proof pending #353 [GNOME Settings: universal-access] |
| slowkeys-beep-reject | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Rejected Slow Keys events reach the shared bell policy; audible and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1423`; cargo:slow_keys_deliver_only_keys_held_past_the_delay; observable proof pending #353 [GNOME Settings: universal-access] |
| slowkeys-delay | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference reaches compositor deferred key acceptance timing; exact combined runtime acceptance remains pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1450`; proof:G-A11Y-SLOW [GNOME Settings: universal-access] |
| slowkeys-enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference enables compositor Slow Keys before client delivery; exact combined runtime acceptance remains pending (#350/#365) | implemented — gnome-shell 51 `js/ui/status/accessibility.js:16`; cargo:aids_map_to_gnome_keys, proof:G-A11Y-SLOW [GNOME Settings: universal-access] |
| stickykeys-enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference enables compositor modifier latch/lock delivery; active keymap resets are implemented, but AltGr/Level3 parity and combined runtime acceptance remain pending (#350/#365) | implemented — gnome-shell 51 `js/ui/overviewControls.js:425`; cargo:aids_map_to_gnome_keys, proof:G-A11Y-STICKY [GNOME Settings: universal-access] |
| stickykeys-modifier-beep | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Sticky modifier transitions reach the shared bell policy; audible, Level3 and installed-session acceptance remain pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1428`; cargo:sticky_beep_sounds_on_each_latch_change; observable proof pending #353 [GNOME Settings: universal-access] |
| stickykeys-two-key-off | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference controls compositor two-key Sticky Keys cancellation and GTK confirmation; exact combined runtime acceptance remains pending (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1429`; proof:G-A11Y-STICKY [GNOME Settings: universal-access] |
| timeout-enable | Ignored | No Tuna inactivity-timeout consumer. Mutter51 native loads the flag but never tests it in the native aid engine; compatibility disposition remains open under #365. See [native keyboard audit](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/keyboard-native-parity.md) | deprecated — mutter 51 `src/backends/meta-input-settings.c` loads it but the native aid engine never applies it |
| togglekeys-enable | Honored (partial) | GTK kbd_a11y → combined protocol0.34 → compositor InputAids. Live preference reaches compositor Toggle Keys; actual XKB LED-change semantics and audible acceptance remain pending; see native keyboard audit (#350/#365) | implemented — mutter 51 `src/backends/meta-input-settings.c:1426`; proof:G-A11Y-SHORTCUTS [GNOME Settings: universal-access] |

## org.gnome.desktop.a11y.magnifier

| Key | Status | Reason | Owner |
|---|---|---|---|
| brightness-blue | Honored | Shell.BrightnessContrast blue brightness (-1..1) on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:31`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| brightness-green | Honored | Green brightness on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:30`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| brightness-red | Honored | Red brightness on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:29`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| caret-tracking | Honored | AT-SPI caret events (and the text-input caret rectangle) retarget the live zoom region after GNOME's 1 s pointer rest (none/centered/proportional/push, default centered); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:39`; proof:AT-SPI, proof:M-ATSPI-FOCUS, cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:out_of_range_snapshot_fails_safe |
| color-saturation | Honored | Clutter.DesaturateEffect (0 gray..1 unchanged) on the live zoom region; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:28`; cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:color_effects_match_the_clutter_and_shell_shaders |
| contrast-blue | Honored | Blue contrast (-1..1) on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:34`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| contrast-green | Honored | Green contrast on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:33`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| contrast-red | Honored | Red contrast on the live zoom region, captures and casts; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:32`; cargo:color_effects_match_the_clutter_and_shell_shaders, cargo:sanitize_clamps_effect_and_cross_hair_keys_to_the_schema |
| cross-hairs-clip | Honored | Leaves GNOME's 100x100 hole around the magnified pointer; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:45`; proof:M-CROSSHAIRS, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:defaults_match_gnome_51 |
| cross-hairs-color | Honored | Hair color, parsed like Cogl.Color.from_string (M-CROSSHAIRS); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:42`; proof:M-CROSSHAIRS, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:cross_hairs_frame_the_sprite_like_gnome_recenter |
| cross-hairs-length | Honored | Hair length 20..4096 device pixels; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:44`; cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:cross_hairs_frame_the_sprite_like_gnome_recenter |
| cross-hairs-opacity | Honored | Hair opacity 0..1 (M-CROSSHAIRS); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:43`; proof:M-CROSSHAIRS, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:defaults_match_gnome_51 |
| cross-hairs-thickness | Honored | Hair thickness in logical pixels (M-CROSSHAIRS); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:41`; proof:M-CROSSHAIRS, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:defaults_match_gnome_51 |
| focus-tracking | Honored | AT-SPI focus events center on the focused widget (M-ATSPI-FOCUS); apps without AT-SPI fall back to the focused window centre (M-FOCUS) (none/centered/proportional/push, default proportional); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:38`; proof:AT-SPI, proof:M-ATSPI-FOCUS, proof:M-FOCUS, cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:out_of_range_snapshot_fails_safe |
| invert-lightness | Honored | Shell.InvertLightnessEffect on the live zoom region (M-INVERT); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:27`; proof:M-INVERT, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:color_effects_match_the_clutter_and_shell_shaders |
| lens-mode | Honored | A non-full-screen viewport centers on the tracked point, as in GNOME; full-screen lens stays put; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:35`; cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:lens_mode_follows_the_view_center_except_full_screen |
| mag-factor | Honored | Zoom factor 0.1..=32.0 (two decimals, default 2.0) on the live output (M-LIVE, M-CURSOR), animated over 100 ms; Super+Alt+=/- step it (M-KEYS); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:26`; proof:M-ATSPI-FOCUS, proof:M-CURSOR, proof:M-KEYS, cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized |
| mouse-tracking | Honored | Pointer motion retargets the live zoom region (none/centered/proportional/push, default proportional; M-TRACK, M-LIVE); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:37`; proof:M-FOCUS, proof:M-LIVE, proof:M-SETTINGS, cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:out_of_range_snapshot_fails_safe |
| screen-position | Honored | Full-screen or half-screen viewport on the live output; the other half shows the unmagnified desktop (M-HALF); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:25`; proof:M-HALF, cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:out_of_range_snapshot_fails_safe |
| scroll-at-edges | Honored | Off (default) clamps the region of interest on screen; on lets it scroll past edges over the system background; see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:36`; cargo:snapshot_mapping_matches_gnome_51_enums_and_ranges, cargo:defaults_match_gnome_51 |
| show-cross-hairs | Honored | Cross-hairs through the magnified pointer on the live output (M-CROSSHAIRS); see screen-magnifier-enabled | implemented — gnome-shell 51 `js/ui/magnifier.js:40`; proof:M-CROSSHAIRS, cargo:cross_hair_and_color_effect_keys_pass_through_sanitized, cargo:cross_hairs_frame_the_sprite_like_gnome_recenter |

## org.gnome.desktop.a11y.mouse

| Key | Status | Reason | Owner |
|---|---|---|---|
| click-type-window-visible | Ignored | GNOME Shell 51 does not read it either: the chooser follows dwell-click-enabled and dwell-mode | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| dwell-click-enabled | Honored | Hover click in the compositor's input pipeline, with GNOME's pie timer and panel chooser (G-A11Y-DWELL) | implemented — gnome-shell 51 `js/ui/status/dwellClick.js:9`; proof:G-A11Y-DWELL [GNOME Settings: universal-access] |
| dwell-gesture-double | Honored | Gesture direction for a double click | implemented — mutter 51 `clutter/clutter/clutter-settings.c:336`; proof:G-A11Y-DWELL, cargo:gestures_pick_the_click_by_direction_and_click_where_it_dwelled |
| dwell-gesture-drag | Honored | Gesture direction for a drag | implemented — mutter 51 `clutter/clutter/clutter-settings.c:338`; proof:G-A11Y-DWELL, cargo:gestures_pick_the_click_by_direction_and_click_where_it_dwelled |
| dwell-gesture-secondary | Honored | Gesture direction for a secondary click (G-A11Y-DWELL) | implemented — mutter 51 `clutter/clutter/clutter-settings.c:340`; proof:G-A11Y-DWELL |
| dwell-gesture-single | Honored | Gesture direction for a single click | implemented — mutter 51 `clutter/clutter/clutter-settings.c:334`; proof:G-A11Y-DWELL, cargo:gestures_pick_the_click_by_direction_and_click_where_it_dwelled |
| dwell-mode | Honored | `window` shows the panel's click-type chooser; `gesture` picks the click by direction (G-A11Y-DWELL) | implemented — gnome-shell 51 `js/ui/status/dwellClick.js:10`; proof:G-A11Y-DWELL |
| dwell-threshold | Honored | Motion that cancels a dwell or a held secondary click, and a gesture's minimum (G-A11Y-DWELL) | implemented — mutter 51 `clutter/clutter/clutter-settings.c:325`; proof:G-A11Y-DWELL, cargo:pointer_aids_survive_the_positional_control_wire [GNOME Settings: universal-access] |
| dwell-time | Honored | Live dwell and gesture timeout (G-A11Y-DWELL) | implemented — mutter 51 `clutter/clutter/clutter-settings.c:320`; proof:G-A11Y-DWELL, cargo:resting_pointer_clicks_once_after_the_dwell_time [GNOME Settings: universal-access] |
| secondary-click-enabled | Honored | A held primary button becomes a secondary click on release (G-A11Y-SECONDARY) | implemented — mutter 51 `clutter/clutter/clutter-settings.c:264`; proof:G-A11Y-SECONDARY [GNOME Settings: universal-access] |
| secondary-click-time | Honored | Live hold time (G-A11Y-SECONDARY) | implemented — mutter 51 `clutter/clutter/clutter-settings.c:316`; proof:G-A11Y-SECONDARY [GNOME Settings: universal-access] |

## org.gnome.desktop.app-folders

| Key | Status | Reason | Owner |
|---|---|---|---|
| folder-children | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/appDisplay.js:1428`; proof:G-APP-FOLDERS, proof:G-APP-GRID-PAGES, proof:G-FOLDER-ZOOM, cargo:retained_folder_watch_memory_changes_and_subscription_removal, cargo:folder_changes_wake_the_overview_without_compositor_traffic |

## org.gnome.desktop.app-folders.folder

| Key | Status | Reason | Owner |
|---|---|---|---|
| apps | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/dash.js:472`; cargo:retained_folder_watch_memory_changes_and_subscription_removal, cargo:create_refused_name_does_not_publish_or_write_apps |
| categories | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/appDisplay.js:1448`; cargo:retained_folder_watch_memory_changes_and_subscription_removal, cargo:folder_lists_change_like_gnome |
| excluded-apps | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/appDisplay.js:2166`; cargo:retained_folder_watch_memory_changes_and_subscription_removal |
| name | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/altTab.js:938`; cargo:retained_folder_watch_memory_changes_and_subscription_removal, cargo:create_refused_name_does_not_publish_or_write_apps |
| translate | Honored | Read when app grid rebuilds | implemented — gnome-shell 51 `js/ui/appDisplay.js:97`; cargo:retained_folder_watch_memory_changes_and_subscription_removal, cargo:diagram_reads_labels_from_the_layout_like_init_labels |

## org.gnome.desktop.background

| Key | Status | Reason | Owner |
|---|---|---|---|
| color-shading-type | Honored | Solid, horizontal and vertical gradients drawn by the compositor under and around the picture, as GNOME Shell 51 `js/ui/background.js` `_loadPattern` | implemented — gnome-shell 51 `js/ui/background.js:111`; cargo:gradients_and_transparency_compose_under_none_and_centered; observable proof pending #360 [GNOME Settings: background] |
| picture-opacity | Ignored | Legacy key: GNOME Shell 51 `js/ui/background.js` reads only picture-uri(-dark), picture-options, primary/secondary color and color-shading-type, so GNOME itself has no consumer | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| picture-options | Honored | All seven GNOME placements (none, wallpaper, centered, scaled, stretched, zoom, spanned) through `crates/wallpaper/src/background.rs`; none draws no source file | implemented — gnome-shell 51 `js/ui/background.js:112`; proof:G-SET-WALLPAPER, proof:G-WALLPAPER-URI [GNOME Settings: background] |
| picture-uri | Honored | Live raster, JPEG XL, SVG/SVGZ (bounded `tuna-wallpaper-svg` helper) or GNOME XML slideshow; solid/gradient fallback when unset or undecodable | implemented — gnome-shell 51 `js/ui/background.js:113`; proof:G-SET-WALLPAPER, proof:G-WALLPAPER-CROSSFADE, proof:G-WALLPAPER-URI [GNOME Settings: background] |
| picture-uri-dark | Honored | Same as picture-uri, selected while color-scheme is prefer-dark | implemented — gnome-shell 51 `js/ui/background.js:114`; proof:G-SET-WALLPAPER, proof:G-WALLPAPER-CROSSFADE, proof:G-WALLPAPER-URI [GNOME Settings: background] |
| primary-color | Honored | Solid fill or first gradient stop | implemented — gnome-shell 51 `js/ui/background.js:109`; cargo:primary_colors_parse_like_gnome; observable proof pending #360 [GNOME Settings: background] |
| secondary-color | Honored | Second gradient stop for horizontal/vertical shading | implemented — gnome-shell 51 `js/ui/background.js:110`; cargo:gradients_and_transparency_compose_under_none_and_centered; observable proof pending #360 [GNOME Settings: background] |
| show-desktop-icons | Ignored | Legacy Nautilus desktop key: GNOME 51 has no desktop icons and no Shell consumer; Tuna Desktop does not draw desktop icons either | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |

## org.gnome.desktop.break-reminders

| Key | Status | Reason | Owner |
|---|---|---|---|
| selected-breaks | Honored | Shell break scheduler; empty disables reminders | implemented — gnome-shell 51 `js/misc/breakManager.js:153`; proof:G-WELLBEING-ACTION-DELAY, proof:G-WELLBEING-ACTION-SKIP, proof:G-WELLBEING-ACTION-TAKE-FADE, cargo:gsettings_fixture_defaults_and_selection [GNOME Settings: wellbeing] |

## org.gnome.desktop.break-reminders.eyesight

| Key | Status | Reason | Owner |
|---|---|---|---|
| countdown | Honored (partial) | OSD countdown in the last 60 s before a break; StopCountdown cancels only its owned OSD display/timer; the added actual GTK regression awaits exact-source CI. Production GTK policy and installed-session acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:countdown_matches_gnome_and_closes_at_zero |
| delay-seconds | Honored (partial) | GTK wellbeing notice Delay callback queues the action; the 2 s break tick invokes delay_break with the live per-type delay setting. Production GTK policy and installed-session acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:delay_and_skip_push_the_due_time |
| duration-seconds | Honored | Break length for scheduling and idle-take detection | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_flows_from_due_through_overdue [GNOME Settings: wellbeing] |
| fade-screen | Honored (partial) | GTK wellbeing effect hook → correlated protocol0.35 Applied → compositor wellbeing_effects brightness fade. Exact-source native renderer pixels independently verified; production GTK policy and installed DRM/GPU acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:idle_break_fades_completes_and_sounds |
| interval-seconds | Honored | Time between breaks | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_settings_update_applies_live [GNOME Settings: wellbeing] |
| lock-screen | Honored | Locks the session when the break starts | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:lock_screen_toggle_beats_fade_and_quiet_breaks_stay_in_tray |
| notify | Honored | Due/overdue notices posted; tray-only urgency not distinguished yet | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_notices_update_the_resident_in_place |
| notify-overdue | Honored | Overdue notice 60 s after due | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_flows_from_due_through_overdue |
| notify-upcoming | Honored | Upcoming notice 2 min before due | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-ACTION-SKIP, cargo:break_upcoming_countdown_and_take_cycle, cargo:gsettings_fixture_defaults_and_selection |
| play-sound | Honored | Complete sound via canberra, event-sounds gated | implemented — gcc 51 `panels/wellbeing/cc-wellbeing-panel.c:588`; proof:G-WELLBEING-BREAK, cargo:idle_break_fades_completes_and_sounds [GNOME Settings: wellbeing] |

## org.gnome.desktop.break-reminders.movement

| Key | Status | Reason | Owner |
|---|---|---|---|
| countdown | Honored (partial) | OSD countdown in the last 60 s before a break; StopCountdown cancels only its owned OSD display/timer; the added actual GTK regression awaits exact-source CI. Production GTK policy and installed-session acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:countdown_matches_gnome_and_closes_at_zero |
| delay-seconds | Honored (partial) | GTK wellbeing notice Delay callback queues the action; the 2 s break tick invokes delay_break with the live per-type delay setting. Production GTK policy and installed-session acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-ACTION-DELAY, cargo:delay_and_skip_push_the_due_time |
| duration-seconds | Honored | Break length for scheduling and idle-take detection | implemented — gcc 51 `panels/wellbeing/cc-wellbeing-panel.c:514`; proof:G-WELLBEING-BREAK, cargo:break_flows_from_due_through_overdue [GNOME Settings: wellbeing] |
| fade-screen | Honored (partial) | GTK wellbeing effect hook → correlated protocol0.35 Applied → compositor wellbeing_effects brightness fade. Exact-source native renderer pixels independently verified; production GTK policy and installed DRM/GPU acceptance remain open (#354) | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:idle_break_fades_completes_and_sounds |
| interval-seconds | Honored | Time between breaks | implemented — gcc 51 `panels/wellbeing/cc-wellbeing-panel.c:516`; proof:G-WELLBEING-BREAK, cargo:break_settings_update_applies_live [GNOME Settings: wellbeing] |
| lock-screen | Honored | Locks the session when the break starts | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:lock_screen_toggle_beats_fade_and_quiet_breaks_stay_in_tray |
| notify | Honored | Due/overdue notices posted; tray-only urgency not distinguished yet | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_notices_update_the_resident_in_place |
| notify-overdue | Honored | Overdue notice 60 s after due | implemented — gnome-shell 51 `js/misc/breakManager.js`; proof:G-WELLBEING-BREAK, cargo:break_flows_from_due_through_overdue |
| notify-upcoming | Honored | Upcoming notice 2 min before due | implemented — gnome-shell 51 `js/misc/breakManager.js`; cargo:gsettings_fixture_defaults_and_selection |
| play-sound | Honored | Complete sound via canberra, event-sounds gated | implemented — gcc 51 `panels/wellbeing/cc-wellbeing-panel.c:589`; proof:G-WELLBEING-BREAK, cargo:idle_break_fades_completes_and_sounds [GNOME Settings: wellbeing] |

## org.gnome.desktop.calendar

| Key | Status | Reason | Owner |
|---|---|---|---|
| show-weekdate | Honored | Live ISO week labels use each displayed row's Thursday; GTK gate G-CAL-PREFS | implemented — gnome-shell 51 `js/ui/calendar.js:15`; proof:G-CAL-PREFS [GNOME Settings: system] |
| week-start-day | Honored | Live first-weekday enum; default and reset follow locale; GTK gate G-CAL-PREFS | implemented — gnome-shell 51 `js/ui/calendar.js:16`; proof:G-CAL-PREFS [GNOME Settings: system] |

## org.gnome.desktop.datetime

| Key | Status | Reason | Owner |
|---|---|---|---|
| automatic-timezone | Honored (gsd-datetime, unqualified) | gnome-settings-daemon 51's datetime plugin, started by the Tuna session (V-GSD-PLUGINS), applies it through GeoClue, real reverse geocoding and timedated; the standalone official-static-source observer checks actual daemon caller, zone/localtime, master/auto-off controls and owner-bound panel clock but awaits current-build service/UI qualification (`docs/datetime-proof.md`) | implemented — gsd 51 `plugins/datetime/gsd-datetime-manager.c:31`; proof:V-GSD-PLUGINS [GNOME Settings: system] |

## org.gnome.desktop.default-applications.office.calendar

| Key | Status | Reason | Owner |
|---|---|---|---|
| exec | Ignored | App launch resolves desktop-file/MIME handlers; these legacy command preferences are not read | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| needs-term | Ignored | App launch resolves desktop-file/MIME handlers; these legacy command preferences are not read | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |

## org.gnome.desktop.default-applications.office.tasks

| Key | Status | Reason | Owner |
|---|---|---|---|
| exec | Ignored | App launch resolves desktop-file/MIME handlers; these legacy command preferences are not read | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| needs-term | Ignored | App launch resolves desktop-file/MIME handlers; these legacy command preferences are not read | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |

## org.gnome.desktop.default-applications.terminal

| Key | Status | Reason | Owner |
|---|---|---|---|
| exec | Honored (GTK shell) | The terminal Ctrl+Return in the Run a Command dialog runs the line inside, as runDialog.js does; app launch still resolves desktop-file/MIME handlers (#357) | implemented — gnome-shell 51 `js/ui/runDialog.js:219`; cargo:failed_lines_fall_back_to_files_like_gnome |
| exec-arg | Honored (GTK shell) | Placed between `exec` and the line for Ctrl+Return in the Run a Command dialog, as runDialog.js does (#357) | implemented — gnome-shell 51 `js/ui/runDialog.js:219`; cargo:failed_lines_fall_back_to_files_like_gnome |

## org.gnome.desktop.input-sources

| Key | Status | Reason | Owner |
|---|---|---|---|
| current | Ignored | Deprecated and ignored in GNOME 51 (schema text); gnome-shell 51.0 never reads it, and the active source is the shell's MRU front instead | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| mru-sources | Honored (GTK shell) | GNOME 51's MRU order (keyboard.js `_updateMruSources`/`_updateMruSettings`): seeds the order at start, saved on every interactive switch; Super+Space flips between the two most recent sources and the held popup steps through it (G-INPUT-SOURCE-MRU, #346). XKB sources only: IBus sources take no part | implemented — gnome-shell 51 `js/ui/status/keyboard.js:281`; proof:G-INPUT-SOURCE-MRU [GNOME Settings: keyboard] |
| per-window | Honored (GTK shell) | Each focused window, and the overview, restores the source last active in it; a window seen first starts on the first source; off forgets (keyboard.js `_setPerWindowInputSource`; G-INPUT-PER-WINDOW, #346) | implemented — gnome-shell 51 `js/ui/status/keyboard.js:284`; proof:G-INPUT-PER-WINDOW, cargo:per_window_restores_each_windows_source_and_starts_new_ones_first, cargo:requests_fold_per_window_until_taken [GNOME Settings: keyboard] |
| show-all-sources | Ignored | Read only by GNOME Settings' input-source chooser (schema: "available for choosing in System Settings"); gnome-shell and mutter 51 never read it, so the desktop has nothing to do | app-owned — gnome-desktop 51 `libgnome-desktop/gnome-xkb-info.c:769` (GNOME Settings input chooser) |
| sources | Honored | Live compositor XKB keymap; IBus sources use bridge | implemented — gnome-shell 51 `js/ui/status/keyboard.js:280`; proof:G-A11Y-KEYMAP, proof:G-INPUT-PER-WINDOW, proof:G-INPUT-SOURCE-MRU [GNOME Settings: keyboard] |
| xkb-model | Ignored | gnome-shell 51 passes it into the keymap (`KeyboardManager.setKeyboardModel`); Tuna's `InputSettings` wire carries no model field, so the compositor compiles xkbcommon's default model. Needs `InputSettings.xkb_model` (#346) | unimplemented — gnome-shell 51 `js/ui/status/keyboard.js:283`; #365 |
| xkb-options | Honored | Live compositor XKB keymap; IBus sources use bridge | implemented — gnome-shell 51 `js/ui/status/keyboard.js:282`; proof:G-A11Y-KEYMAP, proof:G-A11Y-SHORTCUTS, proof:G-NUMLOCK, cargo:keymap_reload_keeps_num_lock_and_the_active_layout, cargo:configured_symbols_determine_aid_roles [GNOME Settings: keyboard] |

## org.gnome.desktop.interface

| Key | Status | Reason | Owner |
|---|---|---|---|
| accent-color | Honored | Live compositor overview accent and libadwaita style | implemented — gnome-shell 51 `src/st/st-settings.c:34`; cargo:active_color_lightens_the_accent_like_st; observable proof pending #365 [GNOME Settings: background] |
| avatar-directories | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | app-owned — gcc 51 `panels/system/users/cc-avatar-chooser.c:231` [GNOME Settings: system] |
| can-change-accels | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| clock-format | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-shell 51 `js/misc/dateUtils.js:144`; proof:G-SET-CLOCK, journey:J-SETTINGS-LIVE, journey:J-SETTINGS-RESTORE, cargo:clock_format_parses_the_gsettings_value, cargo:clock_format_row_names_the_flip_and_stays_enabled [GNOME Settings: common, display, printers, system] |
| clock-show-date | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-desktop 51 `libgnome-desktop/gnome-wall-clock.c:414`; proof:G-SET-CLOCK [GNOME Settings: system] |
| clock-show-seconds | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-desktop 51 `libgnome-desktop/gnome-wall-clock.c:397`; proof:G-SET-CLOCK, proof:G-SETTINGS-CLOCK [GNOME Settings: system] |
| clock-show-weekday | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-desktop 51 `libgnome-desktop/gnome-wall-clock.c:413`; proof:G-SET-CLOCK, cargo:defaults_hold_a_plain_clock, cargo:corrupt_or_version_skewed_files_read_as_defaults [GNOME Settings: system] |
| color-scheme | Honored | Live dark tile/background selection; libadwaita apps follow style; shell chrome stays dark | implemented — gnome-shell 51 `js/ui/status/darkMode.js:31`; proof:G-QS-EXTERNAL-SYNC, cargo:dark_style_round_trips_through_color_scheme, cargo:color_scheme_round_trips_and_rejects_unknown [GNOME Settings: background] |
| cursor-blink | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback; the shell's own entries keep a steady caret, as gnome-shell's StEntry/ClutterText do (#503) | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:273`; gnome-shell `src/st/st-entry.c:551`; proof:G-OV-SEARCH-STILL [GNOME Settings: universal-access] |
| cursor-blink-time | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback; not read by the shell, as gnome-shell (#503) | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:274` [GNOME Settings: universal-access] |
| cursor-blink-timeout | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback; not read by the shell, as gnome-shell (#503) | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:275` |
| cursor-size | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:271` [GNOME Settings: universal-access] |
| cursor-theme | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:270` |
| document-font-name | Via GTK | Apps (gnome-text-editor, Ptyxis, libadwaita) read it through the settings portal or GSettings and repaint live; Tuna chrome uses font-name (G-SET-FONTS) | app-owned — xdg-desktop-portal-gnome 51 `src/settings.c:214` exports org.gnome.desktop.interface; read by gnome-text-editor/Ptyxis/libadwaita; proof:G-SET-FONTS |
| enable-animations | Honored | Live idle shield fade duration, GTK transitions and compositor overview/strip motion; proofs G-ANIMATIONS-OFF and G-INTROSPECT-MOTION verify effective motion through actual GNOME clients | implemented — gnome-shell 51 `src/st/st-settings.c:29`; proof:G-ANIMATIONS-OFF, proof:G-FOLDER-ZOOM, proof:G-HOT-CORNER-RIPPLES [GNOME Settings: universal-access] |
| enable-hot-corners | Honored (partial) | Live enable/disable and output-aware LTR corner regions; candidate fullscreen guard has protocol/GTK proofs awaiting execution. Pressure barriers, RTL, retrigger/toggle policy and physical multi-output qualification remain in #336 | implemented — gnome-shell 51 `js/ui/layout.js:431`; proof:G-HOT-CORNER-RIPPLES, proof:G-SETTINGS-INPUT [GNOME Settings: multitasking] |
| font-antialiasing | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — mutter 51 `clutter/clutter/clutter-settings.c:192`; cargo:font_rendering_follows_gnome_keys |
| font-hinting | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — mutter 51 `clutter/clutter/clutter-settings.c:176`; cargo:font_rendering_follows_gnome_keys |
| font-name | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-shell 51 `src/st/st-settings.c:32`; proof:G-SETTINGS-FONT |
| font-rendering | Via GTK | GTK Wayland settings translation (`gtk-font-rendering`); clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:294` |
| font-rgba-order | Ignored (shell) | Shell explicitly uses rgb for rgba antialiasing; GTK clients translate this key independently | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:148` |
| gtk-color-palette | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-color-scheme | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-enable-primary-paste | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/x11/gdksettings.c:65` |
| gtk-im-module | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/x11/gdksettings.c:50` |
| gtk-im-preedit-style | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-im-status-style | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-key-theme | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-theme | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:268` [GNOME Settings: universal-access] |
| gtk-timeout-initial | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| gtk-timeout-repeat | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| icon-theme | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-shell 51 `src/st/st-settings.c:37`; cargo:default_icon_theme_is_gnome_default, cargo:refresh_applies_icon_theme_and_keeps_on_absent_or_blank; observable proof pending #365 [GNOME Settings: universal-access] |
| locate-pointer | Honored | Ctrl tap ripples the pointer like gnome-shell 51 `locatePointer.js`, live (G-LOCATE-POINTER) | implemented — gnome-shell 51 `js/ui/locatePointer.js:5`; proof:G-LOCATE-POINTER, cargo:a_lone_ctrl_tap_locates_the_pointer_only_when_enabled [GNOME Settings: universal-access] |
| menubar-accel | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| menubar-detachable | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| menus-have-tearoff | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| monospace-font-name | Via GTK | Apps (Ptyxis, gnome-text-editor, libadwaita) read it through the settings portal or GSettings and repaint live; Tuna chrome uses font-name (G-SET-FONTS) | app-owned — xdg-desktop-portal-gnome 51 `src/settings.c:214` exports org.gnome.desktop.interface; read by gnome-text-editor/Ptyxis/libadwaita; proof:G-SET-FONTS |
| overlay-scrolling | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:279` [GNOME Settings: universal-access] |
| scaling-factor | Ignored | Output scale uses Mutter DisplayConfig/monitors.xml, not this XSettings integer | deprecated — X11 UI scale only (mutter 51 `src/backends/meta-settings.c:149`); Wayland scale comes from monitors.xml |
| show-battery-percentage | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-shell 51 `js/ui/status/system.js:24`; proof:G-BATTERY, cargo:monitor_brightness_never_uses_a_different_connectors_backlight [GNOME Settings: power] |
| text-scaling-factor | Honored | Live shell CSS/GTK rendering, clock, input policy or UPower percentage | implemented — gnome-shell 51 `js/ui/status/accessibility.js:27`; proof:G-SETTINGS-FONT, cargo:live_menu_and_focus_settings [GNOME Settings: universal-access] |
| toolbar-detachable | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| toolbar-icons-size | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| toolbar-style | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | deprecated — GTK 3/X11 XSettings only; gtk 4.22 `gdk/wayland/gdksettings-wayland.c` has no translation and gnome-shell/mutter 51 never read it |
| toolkit-accessibility | Ignored | No Tuna Desktop consumer or verified toolkit translation for this preference | toolkit — gnome-settings-daemon 51 `plugins/a11y-settings/gsd-a11y-settings-manager.c:167` sets it; toolkits read it |

## org.gnome.desktop.lockdown

Consumers re-checked against gnome-shell 51.0, gnome-session 51.0 and gnome-settings-daemon 51.0 (#357); mechanism and proofs in [parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md) P-ST-05.

| Key | Status | Reason | Owner |
|---|---|---|---|
| disable-application-handlers | Ignored | No GNOME 51 desktop consumer: gnome-shell, gnome-session and gnome-settings-daemon 51.0 never read it, so Tuna's shell no longer gates Settings or calendar launches on it (#357); applications that honor it read it themselves | app-owned — xdpg 51 `src/lockdown.c:51` |
| disable-command-line | Honored (GTK shell) | Alt+F2 opens GNOME's Run a Command dialog; `RunDialog.open()` refuses while set, re-read per open (runDialog.js); G-LOCKDOWN-COMMAND-LINE (#357) | implemented — gnome-shell 51 `js/ui/runDialog.js:19`; proof:G-LOCKDOWN-COMMAND-LINE, cargo:each_shell_key_hides_exactly_its_entry_point, cargo:full_lockdown_hides_every_shell_entry_point |
| disable-lock-screen | Honored | As screenShield.js `lock()`/systemActions.js: Lock button hidden, keybinding, screensaver/D-Bus, sleep and idle locks refused by the shell, compositor backstop denies Lock and idle; never unlocks a locked session; G-LOCKDOWN-LOCK (#357) | implemented — gnome-shell 51 `js/ui/screenShield.js:29`; proof:G-LOCKDOWN-LOCK, cargo:each_shell_key_hides_exactly_its_entry_point, cargo:full_lockdown_hides_every_shell_entry_point |
| disable-log-out | Honored (GTK shell, compositor) | Log Out…, Restart… and Power Off… hidden and refused live, as gnome-session 51 answers CanShutdown/CanReboot unavailable and refuses Logout; Suspend stays; G-LOCKDOWN-LOG-OUT (#357). The compositor's `org.gnome.SessionManager` refuses `Shutdown`, `Reboot` and `Logout` (gsd-media-keys' power, shutdown, reboot and logout keys) with `LockedDown` before any dialog, as gnome-session 51 does, and the shell's `EndSessionDialog.Open` refuses them too | implemented — gnome-shell 51 `js/ui/status/system.js:210`; proof:G-LOCKDOWN-LOG-OUT, cargo:disable_log_out_denies_every_session_ending_action_but_suspend, cargo:each_shell_key_hides_exactly_its_entry_point [GNOME Settings: power] |
| disable-print-setup | Ignored | No GNOME 51 desktop consumer; applications' Print Setup dialogs read it themselves; the shell exposes no print path | app-owned — gcc 51 `panels/printers/cc-printers-panel.c:810` [GNOME Settings: printers] |
| disable-printing | Ignored | No GNOME 51 desktop consumer; applications' Print dialogs read it themselves; the shell exposes no print path | app-owned — xdpg 51 `src/lockdown.c:49` |
| disable-save-to-disk | Honored (shell captures) | As screenshot.js/screencastService.js: shell screenshots stay on the clipboard, screencasts refuse to start, the portal's org.gnome.Shell.Screenshot calls are refused; applications' Save As dialogs stay app-owned; G-LOCKDOWN-SAVE-TO-DISK (#357) | implemented — gnome-shell 51 `js/ui/screenshot.js:2686`; proof:G-LOCKDOWN-SAVE-TO-DISK, cargo:each_shell_key_hides_exactly_its_entry_point, cargo:full_lockdown_hides_every_shell_entry_point |
| disable-show-password | Honored (GTK shell) | As StPasswordEntry: unlock prompt, polkit and network secret peek icons (and GTK's Show Text) drop live and re-hide revealed text (#357) | implemented — gnome-shell 51 `src/st/st-settings.c:39`; cargo:each_shell_key_hides_exactly_its_entry_point, cargo:full_lockdown_hides_every_shell_entry_point |
| disable-user-switching | Honored (GTK shell, power menu) | As systemActions.js `_updateSwitchUser`: the power menu's Switch User… row (`crates/shell-gtk/src/user_switch.rs`) is hidden while set, re-read live, and its activation is refused (#1039). The unlock dialog's user switch (`unlockDialog.js`, gnome-shell 51.0's other consumer) is still unimplemented: Tuna's lock screen offers no user switch (#365). gnome-session 51.0 defines but never reads the key | implemented — gnome-shell 51 `js/misc/systemActions.js:429`; cargo:lockdown_hides_switch_user, cargo:each_shell_key_hides_exactly_its_entry_point; unlock-dialog user switch pending #365 |
| mount-removable-storage-devices-as-read-only | Ignored | Daemon-owned: no GNOME 51 shell consumer; mounts made through GIO volumes (the shell's automount, Files) are left to gvfs/udisks2 | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| user-administration-disabled | Ignored | App-owned: GNOME Settings' Users panel; Tuna ships no Users panel | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |

## org.gnome.desktop.media-handling

| Key | Status | Reason | Owner |
|---|---|---|---|
| automount | Honored (GTK shell) | As gnome-shell 51 `automountManager.js`: a volume the GIO volume monitor adds is mounted (with the shell's passphrase prompt) while the session is unlocked and active and no `IsInhibited(16)` automount inhibitor is held; unlocking mounts what arrived meanwhile without autorun (`crates/shell-gtk/src/removable_media.rs`, #361) | implemented — gnome-shell 51 `js/ui/components/automountManager.js:13`; cargo:automount_mounts_a_hotplugged_volume_with_the_mount_operation, cargo:automount_refuses_inactive_inhibited_mounted_and_locked, cargo:unlock_mounts_waiting_volumes_without_autorun |
| automount-open | Ignored | No GNOME 51 consumer: gnome-shell 51.0 never reads it (a Nautilus-era key) and GNOME Settings 51.0 shows no control for it | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| autorun-never | Honored (GTK shell) | As `autorunManager.js`: when set, new mounts are neither sniffed nor offered or launched (#361) | implemented — gnome-shell 51 `js/ui/components/autorunManager.js:12`; cargo:autorun_never_and_unallowed_mounts_do_nothing; observable proof pending #361 [GNOME Settings: applications] |
| autorun-x-content-ignore | Honored (GTK shell) | As `autorunManager.js`: a mount whose first `x-content/*` type is listed does nothing (#361) | implemented — gnome-shell 51 `js/ui/components/autorunManager.js:14`; cargo:autorun_follows_the_first_content_types_setting; observable proof pending #361 [GNOME Settings: applications] |
| autorun-x-content-open-folder | Honored (GTK shell) | As `autorunManager.js`: the default `inode/directory` app opens the mount's root; on failure the "connected" notification is posted (#361) | implemented — gnome-shell 51 `js/ui/components/autorunManager.js:15`; cargo:autorun_follows_the_first_content_types_setting; observable proof pending #361 [GNOME Settings: applications] |
| autorun-x-content-start-app | Honored (GTK shell) | As `autorunManager.js`: the first type's default app opens the mount's root; on failure, or for unlisted types, the "“name” connected" notification offers each default app (#361) | implemented — gnome-shell 51 `js/ui/components/autorunManager.js:13`; cargo:autorun_follows_the_first_content_types_setting; observable proof pending #361 [GNOME Settings: applications] |

## org.gnome.desktop.notifications

| Key | Status | Reason | Owner |
|---|---|---|---|
| application-children | Honored | The first notification from an installed app appends its canonical id, as messageTray.js `NotificationApplicationPolicy.store()` does, so GNOME Settings lists it (`crates/shell-host/src/notification_policy.rs`). Proof G-NOTIFY-POLICY | implemented — gnome-shell 51 `js/ui/messageTray.js:266`; proof:G-NOTIFY-POLICY, cargo:app_policy_combines_global_and_app_gates [GNOME Settings: notifications] |
| show-banners | Honored | Live Do Not Disturb policy | implemented — gcc 51 `panels/notifications/cc-app-notifications-page.c:36`; proof:G-NOTIFY-POLICY, proof:G-QS-SERVICES, proof:G-SETTINGS-NOTIFICATIONS [GNOME Settings: notifications] |
| show-in-lock-screen | Honored | Combined with each app's own key; with either off a source is absent from the lock screen's notification list, applied live while locked (unlockDialog.js `NotificationsBox`). Proof G-NOTIFY-LOCK-LIVE | implemented — gnome-shell 51 `js/ui/messageTray.js:241`; proof:G-NOTIFY-LOCK-LIVE, proof:G-NOTIFY-LOCK, cargo:app_policy_combines_global_and_app_gates [GNOME Settings: notifications, privacy] |

## org.gnome.desktop.notifications.application

| Key | Status | Reason | Owner |
|---|---|---|---|
| application-id | Honored | Written with the app's desktop id on its first notification (`store()`). Proof G-NOTIFY-POLICY | implemented — gnome-shell 51 `js/ui/messageTray.js:264`; proof:G-NOTIFY-POLICY, cargo:app_policy_combines_global_and_app_gates |
| details-in-lock-screen | Honored | Lock-screen titles and bodies only with it (or for an all-`x-gnome-privacy-scope=system` source); otherwise name and count only, absent from pixels and the accessible tree; live while locked. Proofs G-NOTIFY-LOCK, G-NOTIFY-LOCK-PIXELS | implemented — gnome-shell 51 `js/ui/messageTray.js:314`; proof:G-NOTIFY-LOCK, proof:G-NOTIFY-LOCK-PIXELS, cargo:lock_screen_details_are_per_app |
| enable | Honored | Off hides the app's arrivals, critical included, and live (or at startup) what it already filed; on again brings them all back to the list with no banner, as messageTray.js `_onSourceEnableChanged` removes and re-adds the source. Hidden ones persist across a shell restart. Proofs G-NOTIFY-POLICY, G-NOTIFY-RESTORE | implemented — gnome-shell 51 `js/ui/messageTray.js:292`; proof:G-NOTIFY-POLICY, proof:G-NOTIFY-RESTORE, cargo:app_policy_combines_global_and_app_gates |
| enable-sound-alerts | Honored | Read as each banner shows; off keeps its `sound-name`/`sound-file` silent (messageTray.js `playSound`). Proof G-NOTIFY-SOUND | implemented — gnome-shell 51 `js/ui/messageTray.js:296`; proof:G-NOTIFY-SOUND |
| force-expanded | Honored | Read as each banner shows: on, the banner opens expanded (the body up to six lines and its action buttons) instead of collapsed to one body line, as critical ones always do (messageTray.js `_updateShowingNotification`). Proof G-NOTIFY-EXPANDED | implemented — gnome-shell 51 `js/ui/messageTray.js:1176`; proof:G-NOTIFY-EXPANDED, cargo:force_expanded_is_read_as_the_banner_shows |
| show-banners | Honored | Combined with the global key at arrival; critical notifications break through. Proof G-NOTIFY-POLICY (enable) and the store's unit tests | implemented — gnome-shell 51 `js/ui/messageTray.js:300`; proof:G-NOTIFY-POLICY, cargo:app_policy_combines_global_and_app_gates |
| show-in-lock-screen | Honored | See the global key above. Proofs G-NOTIFY-LOCK, G-NOTIFY-LOCK-LIVE | implemented — gnome-shell 51 `js/ui/messageTray.js:309`; proof:G-NOTIFY-LOCK, proof:G-NOTIFY-LOCK-LIVE, cargo:app_policy_combines_global_and_app_gates |

## org.gnome.desktop.peripherals.keyboard

| Key | Status | Reason | Owner |
|---|---|---|---|
| delay | Honored | Live compositor seat repeat policy | implemented — gnome-shell 51 `js/ui/components/polkitAgent.js:344`; proof:G-SETTINGS-INPUT [GNOME Settings: universal-access] |
| numlock-state | Honored | The compositor restores it at startup while remember-numlock-state is set and saves every Num Lock change into it, as mutter 51's meta-input-settings.c does; keymap reloads keep the lock (G-NUMLOCK, #346) | implemented — mutter 51 `src/backends/meta-input-settings.c:2037`; proof:G-NUMLOCK |
| remember-numlock-state | Honored | Gates the compositor's Num Lock restore and saves, read per save as mutter 51 reads it (G-NUMLOCK, #346) | implemented — mutter 51 `src/backends/meta-input-settings.c:2034`; proof:G-NUMLOCK |
| repeat | Honored | Live compositor seat repeat policy | implemented — gnome-shell 51 `src/st/st-theme-node.c:2373`; proof:G-SETTINGS-INPUT [GNOME Settings: universal-access] |
| repeat-interval | Honored | Live compositor seat repeat policy | implemented — mutter 51 `src/backends/meta-input-settings.c:1153`; proof:G-A11Y-KEYMAP, proof:G-SETTINGS-INPUT [GNOME Settings: universal-access] |

## org.gnome.desktop.peripherals.mouse

| Key | Status | Reason | Owner |
|---|---|---|---|
| accel-profile | Honored | `default`, `flat` and `adaptive` reach libinput live and on hotplug for mice only (trackballs and pointing sticks excluded, as in Mutter); a profile the device lacks and `custom` fall back to the device default, since the compositor's libinput bindings cannot set custom curves. Native VM proof V-POINTER-LIVE checks flat then adaptive on the live device | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:294`; proof:V-POINTER-LIVE, cargo:pointer_policy_carries_the_mouse_keys, cargo:trackball_policy_takes_mouse_motion_and_trackball_buttons [GNOME Settings: mouse] |
| custom-accel-config | Ignored | The pinned libinput bindings (input-sys 1.19) cannot set custom acceleration curves; `accel-profile` `custom` falls back to the device default and each device reports `accel_custom_supported_by_compositor: false` | unimplemented — mutter 51 `src/backends/meta-input-settings.c:428`; #365 |
| double-click | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:280` [GNOME Settings: mouse, universal-access] |
| drag-threshold | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:281` |
| left-handed | Honored | Live GNOME boolean reaches libinput; native VM proof V-MOUSE-HANDEDNESS covers false/true/false on the same compositor | implemented — mutter 51 `src/backends/meta-input-settings.c:308`; proof:V-MOUSE-HANDEDNESS, cargo:pointer_policy_carries_the_mouse_keys, cargo:trackball_policy_takes_mouse_motion_and_trackball_buttons [GNOME Settings: mouse] |
| middle-click-emulation | Honored | Live and on hotplug for mice only (not touchpads, trackballs or pointing sticks, as Mutter 51) where libinput offers it; native VM proof V-POINTER-LIVE checks the live device readback on and off | implemented — mutter 51 `src/backends/meta-input-settings.c:507`; proof:G-SETTINGS-POINTER, proof:V-POINTER-LIVE, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys |
| natural-scroll | Honored | Live libinput policy on hardware devices | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:285`; cargo:pointer_policy_carries_the_mouse_keys, cargo:trackball_policy_takes_mouse_motion_and_trackball_buttons; observable proof pending #365 [GNOME Settings: mouse] |
| scroll-wheel-emulation-button | Honored | Mice only, as Mutter 51: a nonzero GNOME button selects libinput's on-button-down scrolling with that button (Mutter's button-to-evdev mapping), 0 turns button scrolling off. Native VM proof V-POINTER-LIVE checks button 2 then off where the guest schema has the GNOME 51 key | implemented — mutter 51 `src/backends/meta-input-settings.c:1040`; proof:G-SETTINGS-POINTER, proof:V-POINTER-LIVE |
| scroll-wheel-emulation-button-lock | Honored | Applied with `scroll-wheel-emulation-button` to mice as libinput's scroll button lock; V-POINTER-LIVE checks it on then off where the guest schema has the GNOME 51 key | implemented — mutter 51 `src/backends/meta-input-settings.c:1041`; proof:G-SETTINGS-POINTER, proof:V-POINTER-LIVE |
| speed | Honored | Live libinput policy on hardware devices | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:291`; proof:G-SETTINGS-POINTER, cargo:pointer_speed_clamps_to_gnomes_range [GNOME Settings: mouse] |

## org.gnome.desktop.peripherals.pointingstick

| Key | Status | Reason | Owner |
|---|---|---|---|
| accel-profile | Honored | `default`, `flat` and `adaptive` reach libinput live and on hotplug for pointing sticks (udev `ID_INPUT_POINTINGSTICK`, as Mutter 51); a profile the device lacks and `custom` fall back to the device default. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no pointing stick in the VM) | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:341`; proof:G-SETTINGS-POINTER [GNOME Settings: mouse] |
| custom-accel-config | Ignored | The pinned libinput bindings (input-sys 1.19) cannot set custom acceleration curves; `custom` falls back to the device default and each device reports `accel_custom_supported_by_compositor: false` | unimplemented — mutter 51 `src/backends/meta-input-settings.c:428`; #365 |
| scroll-method | Honored | `default` (device default), `none` and `on-button-down` reach libinput live and on hotplug for pointing sticks, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no pointing stick in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:1108`; proof:G-SETTINGS-POINTER, cargo:pointing_stick_policy_takes_its_own_speed_profile_and_scroll_method, cargo:device_settings_default_to_gnome_51_and_survive_the_positional_wire |
| speed | Honored | Pointing sticks take this speed instead of the mouse speed, live and on hotplug, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no pointing stick in the VM) | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:337`; proof:G-SETTINGS-POINTER [GNOME Settings: mouse] |

## org.gnome.desktop.peripherals.tablet

| Key | Status | Reason | Owner |
|---|---|---|---|
| area | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c`, `src/backends/meta-input-mapper.c`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| keep-aspect | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1184`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| left-handed | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c`, `src/backends/meta-input-mapper.c`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| mapping | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — gcc 51 `panels/wacom/cc-wacom-page.c:781`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| output | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c`, `src/backends/meta-input-mapper.c`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |

## org.gnome.desktop.peripherals.tablet.deprecated

| Key | Status | Reason | Owner |
|---|---|---|---|
| display | Ignored | No Tuna Desktop mapping for this libinput/tablet preference; supported subset is listed explicitly | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |

## org.gnome.desktop.peripherals.tablet.pad-button

| Key | Status | Reason | Owner |
|---|---|---|---|
| action | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c`, `src/backends/meta-input-mapper.c`; proof:D-TABLET, cargo:pad_settings_paths_follow_mutter, cargo:pad_buttons_and_labels_follow_mutter [GNOME Settings: wacom] |
| keybinding | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c`, `src/backends/meta-input-mapper.c`; proof:D-TABLET, cargo:pad_settings_paths_follow_mutter, cargo:pad_buttons_and_labels_follow_mutter [GNOME Settings: wacom] |

## org.gnome.desktop.peripherals.tablet.stylus

| Key | Status | Reason | Owner |
|---|---|---|---|
| button-action | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1743`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| button-keybinding | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — gcc 51 `panels/wacom/cc-wacom-stylus-page.c:199`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| eraser-button-action | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1772`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does |
| eraser-button-keybinding | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:2229`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does |
| eraser-button-mode | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1771`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does |
| eraser-pressure-curve | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1697`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| eraser-pressure-range | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1707`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does |
| pressure-curve | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1699`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| pressure-range | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1709`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does |
| secondary-button-action | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1744`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| secondary-button-keybinding | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — gcc 51 `panels/wacom/cc-wacom-stylus-page.c:205`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| tertiary-button-action | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — mutter 51 `src/backends/meta-input-settings.c:1745`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |
| tertiary-button-keybinding | Honored | Compositor reads the per-device relocatable schema live and applies it to libinput tablets/pads as mutter 51 does (P-IN-05, #861) | implemented — gcc 51 `panels/wacom/cc-wacom-stylus-page.c:211`; proof:D-TABLET, cargo:per_device_paths_read_gnome_defaults_then_follow_live_changes, cargo:pressure_curves_scale_pressure_as_mutter_does [GNOME Settings: wacom] |

## org.gnome.desktop.peripherals.touchpad

| Key | Status | Reason | Owner |
|---|---|---|---|
| accel-profile | Honored | `default`, `flat` and `adaptive` reach libinput live and on hotplug for touchpads, as Mutter 51; a profile the device lacks and `custom` fall back to the device default. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys [GNOME Settings: mouse] |
| click-method | Honored | `default` (device default), `none`, `areas` and `fingers` reach libinput's click method live and on hotplug for touchpads, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:963`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:device_settings_default_to_gnome_51_and_survive_the_positional_wire [GNOME Settings: mouse] |
| custom-accel-config | Ignored | The pinned libinput bindings (input-sys 1.19) cannot set custom acceleration curves; `custom` falls back to the device default and each device reports `accel_custom_supported_by_compositor: false` | unimplemented — mutter 51 `src/backends/meta-input-settings.c:428`; #365 |
| disable-while-typing | Honored | Live libinput policy, including hotplug | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:329`; cargo:touchpad_policy_carries_the_touchpad_keys; observable proof pending #365 [GNOME Settings: mouse] |
| disable-while-typing-timeout | Ignored | Mutter 51 sets it with `libinput_device_config_dwt_set_timeout`, which the pinned libinput bindings (input-sys 1.19) lack; libinput's own timeout applies and each device reports `dwt_timeout_supported_by_compositor: false` | unimplemented — mutter 51 `src/backends/meta-input-settings.c:645`; #365 |
| edge-scrolling-enabled | Honored | Live and on hotplug for touchpads, replaying Mutter 51's two-finger-then-edge sequence: edge scrolling yields while both keys are on and any touchpad scrolls with two fingers, and settings reapply when the last such touchpad leaves. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:879`; proof:G-SETTINGS-POINTER [GNOME Settings: mouse] |
| left-handed | Honored | Live left/right/mouse enum reaches libinput, including the hotplug path; physical touchpad and hotplug qualification remain open | implemented — mutter 51 `src/backends/meta-input-settings.c:297`; cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys; observable proof pending #365 [GNOME Settings: mouse] |
| middle-click-emulation | Honored | Live and on hotplug for touchpads where libinput offers it, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:507`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys |
| natural-scroll | Honored | Live libinput policy, including hotplug | implemented — gnome-shell 51 `js/ui/swipeTracker.js:188`; cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys; observable proof pending #365 [GNOME Settings: mouse] |
| scroll-speed | Ignored | No Tuna Desktop mapping for this libinput/tablet preference; supported subset is listed explicitly | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| send-events | Honored | `enabled`, `disabled` and `disabled-on-external-mouse` reach libinput's send-events mode live and on hotplug for touchpads, as Mutter 51; libinput itself suspends and resumes the touchpad as external mice come and go. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:997`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:device_settings_default_to_gnome_51_and_survive_the_positional_wire [GNOME Settings: mouse] |
| speed | Honored | Live libinput policy, including hotplug | implemented — gcc 51 `panels/mouse/cc-mouse-panel.c:312`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys [GNOME Settings: mouse] |
| tap-and-drag | Honored | Live and on hotplug for touchpads with tapping, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:806`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:device_settings_default_to_gnome_51_and_survive_the_positional_wire |
| tap-and-drag-lock | Honored (timeout drag lock) | Live and on hotplug for touchpads with tapping. The pinned bindings name only libinput's original timeout drag lock, while Mutter 51 asks libinput for sticky drag lock; each device reports the live `tap_drag_lock` mode and `tap_drag_lock_sticky_supported_by_compositor: false`. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:842`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:device_settings_default_to_gnome_51_and_survive_the_positional_wire |
| tap-button-map | Honored | `default` (device default), `lrm` and `lmr` reach libinput live and on hotplug for touchpads with tapping, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:772`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:touchpad_enums_map_to_libinput_values |
| tap-to-click | Honored | Live libinput policy, including hotplug | implemented — mutter 51 `src/backends/meta-input-settings.c:736`; cargo:touchpad_policy_carries_the_touchpad_keys, proof:G-SETTINGS-POINTER [GNOME Settings: mouse] |
| two-finger-scrolling-enabled | Honored | Live and on hotplug for touchpads, with `edge-scrolling-enabled` in Mutter 51's order (two-finger wins when both are on). G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no touchpad in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:880`; proof:G-SETTINGS-POINTER [GNOME Settings: mouse] |

## org.gnome.desktop.peripherals.touchscreen

| Key | Status | Reason | Owner |
|---|---|---|---|
| output | Ignored | No Tuna Desktop mapping for this libinput/tablet preference; supported subset is listed explicitly | unimplemented — mutter 51 `src/backends/meta-input-mapper.c`; #345 |

## org.gnome.desktop.peripherals.trackball

| Key | Status | Reason | Owner |
|---|---|---|---|
| accel-profile | Honored | `default`, `flat` and `adaptive` reach libinput live and on hotplug for trackballs (udev `ID_INPUT_TRACKBALL`, as Mutter 51); a profile the device lacks and `custom` fall back to the device default. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no trackball in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c`; proof:G-SETTINGS-POINTER, cargo:trackball_policy_takes_mouse_motion_and_trackball_buttons, cargo:later_mutter_classes_win_on_combined_capabilities |
| custom-accel-config | Ignored | The pinned libinput bindings (input-sys 1.19) cannot set custom acceleration curves; `custom` falls back to the device default and each device reports `accel_custom_supported_by_compositor: false` | unimplemented — mutter 51 `src/backends/meta-input-settings.c:428`; #365 |
| middle-click-emulation | Honored | Live and on hotplug for trackballs where libinput offers it, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no trackball in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:507`; proof:G-SETTINGS-POINTER, cargo:touchpad_policy_carries_the_touchpad_keys, cargo:pointer_policy_carries_the_mouse_keys |
| scroll-wheel-emulation-button | Honored | Trackballs take libinput's on-button-down scrolling with this GNOME button (0 turns it off), live and on hotplug, as Mutter 51. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no trackball in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:1040`; proof:G-SETTINGS-POINTER |
| scroll-wheel-emulation-button-lock | Honored | Applied with `scroll-wheel-emulation-button` to trackballs as libinput's scroll button lock. G-SETTINGS-POINTER proves the key reaches the compositor; device application is unit-tested only (no trackball in the VM) | implemented — mutter 51 `src/backends/meta-input-settings.c:1041`; proof:G-SETTINGS-POINTER |

## org.gnome.desktop.privacy

| Key | Status | Reason | Owner |
|---|---|---|---|
| disable-camera | Honored | Shell host publishes the standard Lockdown+Access backend from this key, so xdg-desktop-portal denies new Camera sessions while set (live daemon proof); the GTK shell additionally destroys Video/Source nodes and camera-linked capture streams on the PipeWire graph, existing and newly appearing, and restores on explicit re-allow. See privacy-enforcement.md | implemented — xdpg 51 `src/lockdown.c:60`; proof:G-PANEL, cargo:poll_syncs_all_three_switches_and_keeps_absent, cargo:staged_bus_sets_persist_and_refused_keys_retry [GNOME Settings: applications, privacy] |
| disable-microphone | Honored | GTK shell mutes every PipeWire Audio/Source while set and re-mutes bypass attempts; explicit restore unmutes only tracker-muted nodes. GNOME publishes this key to Lockdown with no enforcer; enforcement here is Tuna-defined. See privacy-enforcement.md | implemented — xdpg 51 `src/lockdown.c:62`; cargo:poll_syncs_all_three_switches_and_keeps_absent, cargo:stub_portal_sees_hyphenated_properties_and_change_signals; observable proof pending #356 [GNOME Settings: applications] |
| disable-sound-output | Honored | GTK shell mutes every PipeWire Audio/Sink while set and re-mutes bypass attempts; explicit restore unmutes only tracker-muted nodes. GNOME publishes this key to Lockdown with no enforcer; enforcement here is Tuna-defined. See privacy-enforcement.md | implemented — xdpg 51 `src/lockdown.c:64`; cargo:staged_bus_sets_persist_and_refused_keys_retry, cargo:stub_portal_sees_hyphenated_properties_and_change_signals; observable proof pending #356 [GNOME Settings: applications] |
| hide-identity | Ignored | Tuna Desktop has no privacy retention/location/cleanup policy consumer; applications may implement their own | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| old-files-age | Honored (gsd-housekeeping, unqualified) | gnome-settings-daemon 51's housekeeping plugin, started by the Tuna session (V-GSD-PLUGINS), purges old trash and temporary files; purging is unproven | implemented — gsd 51 `plugins/housekeeping/gsd-disk-space.c:58`; proof:V-GSD-PLUGINS [GNOME Settings: privacy] |
| privacy-screen | Honored | The compositor switches KMS `privacy-screen sw-state` on unlocked connectors, follows hw-state (the hotkey writes the key back) and reports `privacy-screen-state` in DisplayConfig, as mutter 51; unit-tested against a fake connector, no privacy-screen hardware measured. See privacy-enforcement.md | implemented — mutter 51 `src/backends/meta-settings.c:246`; cargo:the_setting_switches_unlocked_screens_without_writing_itself_back, cargo:the_hotkey_writes_the_setting_back, cargo:current_state_reports_privacy_screens_as_mutter_does; observable proof pending #356 (privacy-screen hardware) [GNOME Settings: privacy] |
| recent-files-max-age | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:287` [GNOME Settings: privacy] |
| remember-app-usage | Ignored | Tuna Desktop has no privacy retention/location/cleanup policy consumer; applications may implement their own | unimplemented — gnome-shell 51 `src/shell-app-usage.c:41`; #356 |
| remember-recent-files | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:288` [GNOME Settings: privacy] |
| remove-old-temp-files | Honored (gsd-housekeeping, unqualified) | gnome-settings-daemon 51's housekeeping plugin, started by the Tuna session (V-GSD-PLUGINS), purges old temporary files; purging is unproven | implemented — gsd 51 `plugins/housekeeping/gsd-disk-space.c:57`; proof:V-GSD-PLUGINS [GNOME Settings: privacy] |
| remove-old-trash-files | Honored (gsd-housekeeping, unqualified) | gnome-settings-daemon 51's housekeeping plugin, started by the Tuna session (V-GSD-PLUGINS), purges old trash; purging is unproven | implemented — gsd 51 `plugins/housekeeping/gsd-disk-space.c:56`; proof:V-GSD-PLUGINS [GNOME Settings: privacy] |
| report-technical-problems | Ignored | Tuna Desktop has no privacy retention/location/cleanup policy consumer; applications may implement their own | app-owned — gcc 51 `panels/privacy/diagnostics/cc-diagnostics-page.c:101` (crash reporters) [GNOME Settings: privacy] |
| send-software-usage-stats | Ignored | Tuna Desktop has no privacy retention/location/cleanup policy consumer; applications may implement their own | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| show-full-name-in-top-bar | Ignored | Tuna Desktop has no privacy retention/location/cleanup policy consumer; applications may implement their own | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| usb-protection | Honored (gsd-usb-protection, unqualified) | gnome-settings-daemon 51's usb-protection plugin, started by the Tuna session (V-GSD-PLUGINS), applies it only through a running USBGuard daemon; unproven | implemented — gsd 51 `plugins/usb-protection/gsd-usb-protection-manager.c:35`; proof:V-GSD-PLUGINS [GNOME Settings: privacy] |
| usb-protection-level | Honored (gsd-usb-protection, unqualified) | gnome-settings-daemon 51's usb-protection plugin, started by the Tuna session (V-GSD-PLUGINS), applies it only through a running USBGuard daemon; unproven | implemented — gsd 51 `plugins/usb-protection/gsd-usb-protection-manager.c:36`; proof:V-GSD-PLUGINS |

## org.gnome.desktop.remote-desktop.rdp

| Key | Status | Reason | Owner |
|---|---|---|---|
| auth-methods | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| enable | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` [GNOME Settings: system] |
| kerberos-keytab | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| negotiate-port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` [GNOME Settings: system] |
| screen-share-mode | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| tls-cert | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` [GNOME Settings: system] |
| tls-key | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` [GNOME Settings: system] |
| view-only | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` [GNOME Settings: system] |

## org.gnome.desktop.remote-desktop.rdp.headless

| Key | Status | Reason | Owner |
|---|---|---|---|
| auth-methods | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| enable | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| kerberos-keytab | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| negotiate-port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |

## org.gnome.desktop.remote-desktop.vnc

| Key | Status | Reason | Owner |
|---|---|---|---|
| auth-method | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| enable | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| encryption | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| negotiate-port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| screen-share-mode | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| view-only | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |

## org.gnome.desktop.remote-desktop.vnc.headless

| Key | Status | Reason | Owner |
|---|---|---|---|
| enable | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| negotiate-port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |
| port | Ignored | GNOME Remote Desktop owns these keys; Tuna Desktop does not start or configure that daemon | app-owned — gnome-remote-desktop 51 `src/grd-settings-user.c`, `src/grd-daemon.c` |

## org.gnome.desktop.screen-time-limits

| Key | Status | Reason | Owner |
|---|---|---|---|
| daily-limit-enabled | Honored | Limit evaluated on the 30 s poll and on settings change | implemented — gnome-shell 51 `js/misc/timeLimitsManager.js:128`; proof:G-WELLBEING-LIMIT, proof:G-WELLBEING-PIXEL-BOTH, proof:G-WELLBEING-PIXEL-GRAY, cargo:small_clock_step_adjusts_stored_times, cargo:turning_the_limit_off_removes_the_notice [GNOME Settings: wellbeing] |
| daily-limit-seconds | Honored | Daily allowance in seconds | implemented — gnome-shell 51 `js/misc/timeLimitsManager.js:965`; proof:G-WELLBEING-LIMIT, proof:G-WELLBEING-PIXEL-BOTH, proof:G-WELLBEING-PIXEL-GRAY, cargo:gsettings_fixture_defaults_and_selection [GNOME Settings: wellbeing] |
| grayscale | Honored (partial) | GTK screen-time tracker → correlated protocol0.35 Applied → compositor wellbeing_effects desaturation. Exact-source native renderer pixels independently verified; production GTK policy and installed DRM/GPU acceptance remain open (#354) | implemented — gnome-shell 51 `js/ui/magnifier.js:1445`; proof:G-WELLBEING-LIMIT, proof:G-WELLBEING-PIXEL-BOTH, proof:G-WELLBEING-PIXEL-GRAY, cargo:small_clock_step_adjusts_stored_times, cargo:take_break_fades_and_limit_time_tracks_state [GNOME Settings: wellbeing] |
| history-enabled | Honored | Recording on/off; off deletes the history file live | implemented — gnome-shell 51 `js/misc/timeLimitsManager.js:312`; proof:G-WELLBEING-HISTORY, cargo:disabling_history_deletes_the_file_and_stops_recording, cargo:small_clock_step_adjusts_stored_times [GNOME Settings: wellbeing] |

## org.gnome.desktop.screensaver

| Key | Status | Reason | Owner |
|---|---|---|---|
| color-shading-type | Honored | Lock background gradient, same renderer as org.gnome.desktop.background | implemented — gnome-shell 51 `js/ui/background.js:111`; cargo:no_picture_render_cache_tracks_real_color_shading_and_geometry; observable proof pending #360 [GNOME Settings: background] |
| embedded-keyboard-command | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| embedded-keyboard-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| idle-activation-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| lock-delay | Honored | Live idle lock policy or lock background | implemented — gnome-shell 51 `js/ui/screenShield.js:26`; proof:G-ANIMATIONS-OFF, proof:G-IDLE-FADE [GNOME Settings: privacy] |
| lock-enabled | Honored | Live idle lock policy or lock background | implemented — gnome-shell 51 `js/ui/screenShield.js:25`; proof:G-ANIMATIONS-OFF, proof:G-SETTINGS-IDLE, cargo:brightness_round_trips_and_never_goes_black [GNOME Settings: privacy] |
| logout-command | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| logout-delay | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| logout-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| picture-opacity | Ignored | Legacy key without a GNOME Shell 51 consumer, as in org.gnome.desktop.background | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| picture-options | Honored | Lock background placement; none skips the lock picture source without observing it | implemented — gnome-shell 51 `js/ui/background.js:109` (lock-screen background); cargo:no_picture_render_cache_tracks_real_color_shading_and_geometry; observable proof pending #360 [GNOME Settings: background] |
| picture-uri | Honored | Live idle lock policy or lock background | implemented — gnome-shell 51 `js/ui/background.js:109` (lock-screen background); proof:G-CAPTURE-LOCK-REVOKE, proof:G-IDLE-FADE [GNOME Settings: background] |
| primary-color | Honored | Lock background solid fill or first gradient stop | implemented — gnome-shell 51 `js/ui/background.js:109` (lock-screen background); cargo:no_picture_render_cache_tracks_real_color_shading_and_geometry; observable proof pending #360 [GNOME Settings: background] |
| restart-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | unimplemented — gnome-shell 51 `js/misc/systemActions.js:21`; #365 |
| secondary-color | Honored | Lock background second gradient stop | implemented — gnome-shell 51 `js/ui/background.js:109` (lock-screen background); cargo:no_picture_render_cache_tracks_real_color_shading_and_geometry; observable proof pending #360 [GNOME Settings: background] |
| show-full-name-in-top-bar | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| status-message-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| user-switch-enabled | Ignored | Tuna Desktop applies idle lock and picture URI; no GNOME screensaver theme/status/switch-user policy | unimplemented — gnome-shell 51 `js/ui/unlockDialog.js:1060`; #365 |

## org.gnome.desktop.search-providers

| Key | Status | Reason | Owner |
|---|---|---|---|
| disable-external | Honored | Provider discovery/order policy | implemented — gnome-shell 51 `js/ui/remoteSearch.js:141`; cargo:selection_follows_gnome_settings; observable proof pending #361 [GNOME Settings: applications, search] |
| disabled | Honored | Provider discovery/order policy | implemented — gnome-shell 51 `js/ui/status/thunderbolt.js:47`; cargo:selection_follows_gnome_settings; observable proof pending #361 [GNOME Settings: applications, search] |
| enabled | Honored | Provider discovery/order policy | implemented — gnome-shell 51 `js/ui/workspace.js:1084`; cargo:selection_follows_gnome_settings; observable proof pending #361 [GNOME Settings: applications, search] |
| sort-order | Honored | Provider discovery/order policy | implemented — gnome-shell 51 `js/ui/remoteSearch.js:147`; cargo:selection_follows_gnome_settings; observable proof pending #361 [GNOME Settings: search] |

## org.gnome.desktop.session

| Key | Status | Reason | Owner |
|---|---|---|---|
| idle-delay | Honored | Live compositor idle policy; gsd-power dims at half the delay and blanks after the shield (V-GSD-POWER-IDLE) | implemented — gsd 51 `plugins/power/gsd-power-manager.c:2113`; proof:C-LOCK, proof:G-ANIMATIONS-OFF, proof:G-IDLE-FADE, cargo:user_active_follows_idle_delay [GNOME Settings: power, privacy] |
| save-restore | Ignored | As in GNOME 51: gnome-session 51 turns its app save and restore off (`RestoreSupported` false, which the compositor's `org.gnome.SessionManager` also reports, so GNOME Settings hides "Reopen Windows After Login"); window restoration is the client opt-in of `xdg_session_manager_v1`, which Mutter 51 and Tuna Desktop apply without reading this key (P-SY-08) | app-owned — gnome-session 51 `gnome-session/gsm-manager.c:63` [GNOME Settings: multitasking] |
| session-name | Ignored | Tuna Desktop session does not consume this legacy session preference | app-owned — gnome-session 51 `gnome-session/gsm-manager.c:1284` |

## org.gnome.desktop.sound

| Key | Status | Reason | Owner |
|---|---|---|---|
| allow-volume-above-100-percent | Honored | gsd-media-keys' volume keys stop at 100% or at GNOME's +11 dB ceiling; the shell's volume slider and its native key subset (sessions without gsd-media-keys) use the same live ceiling. Proofs V-AUDIO-AMPLIFICATION, G-MEDIA-AMPLIFICATION | implemented — gnome-shell 51 `js/ui/status/volume.js:12`; proof:G-MEDIA-AMPLIFICATION, proof:G-MEDIA-VOLUME, proof:V-AUDIO-AMPLIFICATION [GNOME Settings: sound, universal-access] |
| event-sounds | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:285` [GNOME Settings: sound] |
| input-feedback-sounds | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:286` |
| theme-name | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:284` [GNOME Settings: sound] |

## org.gnome.desktop.thumbnail-cache

| Key | Status | Reason | Owner |
|---|---|---|---|
| maximum-age | Ignored | Thumbnail cache is external; Tuna Desktop has no cache retention consumer | app-owned — gsd 51 `plugins/housekeeping/gsd-housekeeping-manager.c:40` |
| maximum-size | Ignored | Thumbnail cache is external; Tuna Desktop has no cache retention consumer | app-owned — gsd 51 `plugins/housekeeping/gsd-housekeeping-manager.c:41` |

## org.gnome.desktop.thumbnailers

| Key | Status | Reason | Owner |
|---|---|---|---|
| disable | Ignored | Thumbnail generation is external; Tuna Desktop has no thumbnailer policy consumer | app-owned — gnome-desktop 51 `libgnome-desktop/gnome-desktop-thumbnail.c:642` |
| disable-all | Ignored | Thumbnail generation is external; Tuna Desktop has no thumbnailer policy consumer | app-owned — gnome-desktop 51 `libgnome-desktop/gnome-desktop-thumbnail.c:634` |

## org.gnome.desktop.wm.keybindings

| Key | Status | Reason | Owner |
|---|---|---|---|
| activate-window-menu | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2647`; proof:G-WM-KEYS, cargo:gnome_51_defaults_without_the_schema |
| always-on-top | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 (mutter only lists it in tests) |
| begin-move | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2601`; cargo:gnome_51_defaults_without_the_schema |
| begin-resize | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2602`; cargo:gnome_51_defaults_without_the_schema |
| close | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/runDialog.js:32`; cargo:gnome_51_defaults_without_the_schema |
| cycle-group | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:723`; proof:G-CYCLE-KEYS |
| cycle-group-backward | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:727`; proof:G-CYCLE-KEYS |
| cycle-panels | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2588`; #365 |
| cycle-panels-backward | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2589`; #365 |
| cycle-windows | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:715`; proof:G-CYCLE-KEYS |
| cycle-windows-backward | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:719`; proof:G-CYCLE-KEYS |
| lower | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 (mutter only lists it in tests) |
| maximize | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/prefs.c:1290`; proof:G-WM-REBIND |
| maximize-horizontally | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2629`; #365 |
| maximize-vertically | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2628`; #365 |
| minimize | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2598`; cargo:gnome_51_defaults_without_the_schema |
| move-to-center | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2639`; #365 |
| move-to-corner-ne | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2632`; #365 |
| move-to-corner-nw | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2631`; #365 |
| move-to-corner-se | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2634`; #365 |
| move-to-corner-sw | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2633`; #365 |
| move-to-monitor-down | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2623`; #365 |
| move-to-monitor-left | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2621`; #365 |
| move-to-monitor-right | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2622`; #365 |
| move-to-monitor-up | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2624`; #365 |
| move-to-side-e | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2637`; #365 |
| move-to-side-n | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2635`; #365 |
| move-to-side-s | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2636`; #365 |
| move-to-side-w | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2638`; #365 |
| move-to-workspace-1 | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:639`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| move-to-workspace-10 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:675`; #365 |
| move-to-workspace-11 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:679`; #365 |
| move-to-workspace-12 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:683`; #365 |
| move-to-workspace-2 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:643`; #365 |
| move-to-workspace-3 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:647`; #365 |
| move-to-workspace-4 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:651`; #365 |
| move-to-workspace-5 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:655`; #365 |
| move-to-workspace-6 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:659`; #365 |
| move-to-workspace-7 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:663`; #365 |
| move-to-workspace-8 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:667`; #365 |
| move-to-workspace-9 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:671`; #365 |
| move-to-workspace-down | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:587`; #365 |
| move-to-workspace-last | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:687`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| move-to-workspace-left | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:575`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| move-to-workspace-right | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:579`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| move-to-workspace-up | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:583`; #365 |
| panel-main-menu | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| panel-run-dialog | Honored (GTK shell) | Opens GNOME's Run a Command dialog in normal and overview modes (main.js), read and rebound live through the shell's grabs; refused while `disable-command-line` is set (#357) | implemented — gnome-shell 51 `js/ui/main.js:125`; cargo:gnome_51_defaults_without_the_schema |
| raise | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 (mutter only lists it in tests) |
| raise-or-lower | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2625`; #365 |
| set-spew-mark | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | deprecated — no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| show-desktop | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2592`; #365 |
| switch-applications | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:691`; proof:G-SWITCHER-REBIND |
| switch-applications-backward | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/altTab.js:128`; cargo:switcher_keys_default_and_parse_like_mutter |
| switch-group | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/altTab.js:119`; cargo:switch_group_steps_through_the_apps_windows_like_gnome |
| switch-group-backward | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/altTab.js:126`; cargo:switch_group_steps_through_the_apps_windows_like_gnome |
| switch-input-source | Honored | Live shell accelerator: GNOME 51's MRU switcher popup (quick tap picks the second most recent source; held, each press steps and releasing the modifier picks; another shell popup or the lock screen steps by position) (#346) | implemented — gnome-shell 51 `js/ui/status/keyboard.js:350`; cargo:keymap_reload_keeps_num_lock_and_the_active_layout, proof:G-SETTINGS-INPUT [GNOME Settings: keyboard] |
| switch-input-source-backward | Honored | Live shell accelerator: the MRU popup starting on the least recent source and stepping backward (#346) | implemented — gnome-shell 51 `js/ui/status/keyboard.js:356`; proof:G-INPUT-SOURCE-MRU, cargo:gnome_51_defaults_without_the_schema |
| switch-panels | Honored | Ctrl+Alt+Tab focuses the top bar through the shell grab (G-PANEL-FOCUS) | implemented — gnome-shell 51 `js/ui/windowManager.js:731`; proof:G-PANEL-FOCUS, cargo:gnome_51_defaults_without_the_schema |
| switch-panels-backward | Honored | Shift+Ctrl+Alt+Tab focuses the top bar backward through the shell grab | implemented — gnome-shell 51 `js/ui/windowManager.js:737`; proof:G-PANEL-FOCUS, cargo:gnome_51_defaults_without_the_schema |
| switch-to-workspace-1 | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:591`; proof:G-WM-KEYS, cargo:workspace_targets_resolve_like_mutter |
| switch-to-workspace-10 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:627`; #365 |
| switch-to-workspace-11 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:631`; #365 |
| switch-to-workspace-12 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:635`; #365 |
| switch-to-workspace-2 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:595`; #365 |
| switch-to-workspace-3 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:599`; #365 |
| switch-to-workspace-4 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:603`; #365 |
| switch-to-workspace-5 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:607`; #365 |
| switch-to-workspace-6 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:611`; #365 |
| switch-to-workspace-7 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:615`; #365 |
| switch-to-workspace-8 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:619`; #365 |
| switch-to-workspace-9 | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:623`; #365 |
| switch-to-workspace-down | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:567`; #365 |
| switch-to-workspace-last | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:571`; proof:G-WM-KEYS, cargo:workspace_targets_resolve_like_mutter |
| switch-to-workspace-left | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:555`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| switch-to-workspace-right | Honored | Live shell accelerator registration and compositor dispatch | implemented — gnome-shell 51 `js/ui/windowManager.js:559`; cargo:gnome_51_defaults_without_the_schema, cargo:workspace_targets_resolve_like_mutter |
| switch-to-workspace-up | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — gnome-shell 51 `js/ui/windowManager.js:563`; #365 |
| switch-windows | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:707`; proof:G-CYCLE-KEYS |
| switch-windows-backward | Honored | Live SetSwitcherKeys registration; window MRU popup or immediate window/group cycling | implemented — gnome-shell 51 `js/ui/windowManager.js:711`; proof:G-CYCLE-KEYS |
| toggle-above | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2596`; #365 |
| toggle-fullscreen | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2648`; #365 |
| toggle-maximized | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2649`; proof:G-WM-KEYS |
| toggle-on-all-workspaces | Ignored | This accelerator has no Tuna Desktop action/registration; only the listed live bindings are grabbed | unimplemented — mutter 51 `src/core/keybindings.c:2603`; #365 |
| unmaximize | Honored | Live shell accelerator registration and compositor dispatch | implemented — mutter 51 `src/core/keybindings.c:2598`; cargo:gnome_51_defaults_without_the_schema |

## org.gnome.desktop.wm.preferences

| Key | Status | Reason | Owner |
|---|---|---|---|
| action-double-click-titlebar | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:300` |
| action-middle-click-titlebar | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:301` |
| action-right-click-titlebar | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:302` |
| audible-bell | Honored | Shell publishes the bell policy to the compositor bell (audible sound, frame or full-screen flash) as mutter 51 `src/core/bell.c` | implemented — mutter 51 `src/core/prefs.c:338`; cargo:live_bell_policy_survives_the_positional_control_wire, cargo:disabling_visual_policy_cancels_inflight_flash |
| auto-raise | Honored (compositor) | Owned GIO reader, live; in sloppy/mouse focus the entered window rises after auto-raise-delay if still under the pointer and not on top (Mutter 51 display.c); never in click focus. Proof G-FOCUS-AUTORAISE | implemented — mutter 51 `src/core/prefs.c:317`; proof:G-FOCUS-AUTORAISE, cargo:schema_defaults_are_gnome_51_session_defaults, cargo:sloppy_focuses_on_enter_and_keeps_focus_over_no_window |
| auto-raise-delay | Honored (compositor) | Owned GIO reader, live; the auto-raise delay, clamped to the schema's 0–10000 ms. Proof G-FOCUS-AUTORAISE | implemented — mutter 51 `src/core/prefs.c:472`; proof:G-FOCUS-AUTORAISE, cargo:schema_defaults_are_gnome_51_session_defaults, cargo:delay_clamps_to_the_schema_range_and_missing_mutter_keeps_rest |
| button-layout | Via GTK | GTK Wayland settings translation; clients follow the portal or GSettings fallback | toolkit — gtk 51 `gdk/wayland/gdksettings-wayland.c:289` |
| disable-workarounds | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | deprecated — mutter 51 `src/core/prefs.c:310` (X11 client workarounds only) |
| focus-mode | Honored (compositor) | Owned GIO reader, live; click, sloppy (focus on enter, kept over the desktop) and mouse (also unfocused over the desktop and shell chrome), with focus-change-on-pointer-rest and Mutter's sticky activation focus; the scrollable strip keeps click focus. Proofs G-FOCUS-SLOPPY, G-FOCUS-MOUSE | implemented — mutter 51 `src/core/prefs.c:242`; proof:G-FOCUS-MOUSE, proof:G-FOCUS-RAISE-ON-CLICK, proof:G-FOCUS-SLOPPY, cargo:actual_gio_watch_delivers_live_focus_mode_changes_on_the_owned_context [GNOME Settings: universal-access] |
| focus-new-windows | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | unimplemented — mutter 51 `src/core/prefs.c:235`; #365 |
| mouse-button-modifier | Honored (compositor) | Owned GIO reader, live; parsed like Mutter's meta_parse_modifier (empty/disabled turns modifier clicks off); with it held button 1 moves, the resize button resizes from the pressed third, the menu button opens the window menu. Mod2/Mod3/Mod5 contribute nothing. Proof G-FOCUS-MODIFIER | implemented — mutter 51 `src/core/prefs.c:399`; proof:G-FOCUS-MODIFIER, cargo:unparsable_modifier_keeps_the_previous_one, cargo:modifier_change_moves_the_grab_to_the_new_key |
| num-workspaces | Honored | The fixed workspace count (1–36) while `org.gnome.mutter dynamic-workspaces` is off, live; shrinking moves windows to the new last workspace as mutter 51. Proof G-WS-FIXED (P-WM-08) | implemented — mutter 51 `src/core/prefs.c:51`; proof:G-WS-FIXED [GNOME Settings: multitasking] |
| raise-on-click | Honored (compositor) | Owned GIO reader, live; false focuses clicked windows and xdg-activation requests without raising, and only grabs under 8 px raise at release; shell activations still raise (Mutter's pager rule). Proof G-FOCUS-RAISE-ON-CLICK | implemented — mutter 51 `src/core/prefs.c:296`; proof:G-FOCUS-RAISE-ON-CLICK, cargo:schema_defaults_are_gnome_51_session_defaults, cargo:unmodified_press_focuses_and_raises_only_with_raise_on_click |
| resize-with-right-button | Honored (compositor) | Owned GIO reader, live; true makes the right button resize and the middle button open the window menu with mouse-button-modifier. Proof G-FOCUS-MODIFIER | implemented — mutter 51 `src/core/prefs.c:359`; proof:G-FOCUS-MODIFIER, cargo:schema_defaults_are_gnome_51_session_defaults, cargo:modifier_buttons_move_resize_and_show_the_menu |
| theme | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | deprecated — Server-side X11 frame styling; GNOME 51 Wayland clients draw their own titlebars and no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| titlebar-font | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | deprecated — Server-side X11 frame styling; GNOME 51 Wayland clients draw their own titlebars and no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| titlebar-uses-system-font | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | deprecated — Server-side X11 frame styling; GNOME 51 Wayland clients draw their own titlebars and no reader in gnome-shell, mutter, gnome-settings-daemon, gtk 4.22 or xdg-desktop-portal-gnome 51 |
| visual-bell | Honored | Shell publishes the bell policy to the compositor bell (audible sound, frame or full-screen flash) as mutter 51 `src/core/bell.c` | implemented — gnome-shell 51 `js/ui/status/accessibility.js:24`; cargo:live_bell_policy_survives_the_positional_control_wire, cargo:disabling_visual_policy_cancels_inflight_flash; observable proof pending #353 [GNOME Settings: universal-access] |
| visual-bell-type | Honored | Shell publishes the bell policy to the compositor bell (audible sound, frame or full-screen flash) as mutter 51 `src/core/bell.c` | implemented — mutter 51 `src/core/prefs.c:249`; cargo:live_bell_policy_survives_the_positional_control_wire, cargo:disabling_visual_policy_cancels_inflight_flash; observable proof pending #353 [GNOME Settings: universal-access] |
| workspace-names | Ignored | Tuna Desktop uses click focus and dynamic workspaces; this WM policy has no consumer | unimplemented — mutter 51 `src/core/prefs.c:52`; #337 |
