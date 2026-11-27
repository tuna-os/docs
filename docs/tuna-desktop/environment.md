---
sidebar_position: 16
title: "environment"
---

Every environment variable the Tuna Desktop code reads, grouped by what it is
for. The tables cite the file and line that reads each one, so check there
before relying on behavior a table summarizes.

Most of these are for tests and proofs. To run a normal session you need none
of them: `tuna-session` and the compositor work out everything from the
standard desktop variables at the end of this page. The ordinary session
settings are in the first table.

Unless a row says otherwise, "set" means present in the environment with any
value, including the empty string. A row that needs a particular value names
it.

The `ROOST_*` names from before the rename are not read any more; see
[packaging/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md#upgrading-from-the-former-name).

## Session settings

Read by the installed binaries in an ordinary session. Set them in the
environment `tuna-session` or `tuna-compositor` starts from.

| Variable | Read by | Effect | Source |
|---|---|---|---|
| `TUNA_SHELL_BIN` | compositor, `tuna-session` | Shell binary to supervise. When unset or empty: `tuna-shell-gtk` beside the compositor, then `tuna-shell-host` beside it, then the same two on `PATH`. A `--shell-bin` argument wins over it, and `tuna-session` always passes `--shell-bin` with this resolution. | `crates/compositor/src/runtime.rs:396-431` |
| `TUNA_SCALE` | compositor | Output scale, for example `1.5`, clamped to 1–4. In a nested session it is the scale of the nested output; `--scale` on the command line wins. On DRM/KMS it is the scale for outputs that `~/.config/monitors.xml` does not configure. | `crates/compositor/src/main.rs:45-51`, `crates/compositor/src/drm.rs:574-578`, `crates/compositor/src/runtime.rs:348` |
| `TUNA_XWAYLAND` | compositor | `1` starts Xwayland and `0` keeps it off. Any other value, or unset, starts it when an `Xwayland` binary is on `PATH`. The compositor must be built with its default `xwayland` feature, or the variable does nothing. | `crates/compositor/src/main.rs:41-44`, `crates/compositor/src/runtime.rs:309-323` |
| `TUNA_DRM_DEVICE` | compositor (DRM/KMS) | DRM device node to drive, for example `/dev/dri/card1`, instead of the seat's primary GPU. | `crates/compositor/src/drm.rs:399-405` |
| `TUNA_IBUS` | compositor | `0` does not start the IBus bridge. By default the bridge starts whenever `ibus-daemon` is on `PATH` and a bridge binary can be found. | `crates/compositor/src/ime.rs:47-62` |
| `TUNA_IBUS_BRIDGE_BIN` | compositor | Path of the `tuna-ibus-bridge` binary. Without it the compositor looks beside its own executable, then on `PATH`. | `crates/compositor/src/ime.rs:62-69` |
| `TUNA_IBUS_UNIT` | `tuna-ibus-bridge` | The systemd user unit that owns the session's `ibus-daemon`. The compositor sets it to `org.freedesktop.IBus.session.GNOME.service` in a hardware session; the bridge then starts no daemon of its own, waits for the unit and, if the unit is down once `gnome-session-initialized.target` is up, asks the user manager to start it once. Unset, or naming a unit that is not installed or is masked, the bridge starts `ibus-daemon --panel disable` as its own child. | `crates/shell-host/src/ibus.rs:56-164`, `crates/compositor/src/ime.rs:447-452` |
| `TUNA_BELL` | compositor | `0` silences the audible bell. The visual bell still follows its setting. | `crates/compositor/src/bell.rs:80-85` |
| `TUNA_PAM_SERVICE` | compositor | PAM service the lock screen authenticates against, instead of `tuna-lock`. An empty value uses the default. | `crates/compositor/src/pam.rs:23-26`, `crates/compositor/src/pam.rs:254-270` |
| `TUNA_PAM_FINGERPRINT_SERVICE` | compositor | PAM service the lock screen's fingerprint conversation runs, instead of `tuna-lock-fingerprint`. An empty value uses the default. | `crates/compositor/src/pam.rs:27-30`, `crates/compositor/src/pam.rs:259-270` |
| `TUNA_FPRINTD_OFF` | compositor | When set, fingerprint unlock is off: the lock screen behaves as if there is no reader and asks for the password. | `crates/compositor/src/fprintd.rs:41-44`, `crates/compositor/src/fprintd.rs:338-341` |
| `TUNA_IDLE_TIMEOUT_MS` | compositor | Idle time in milliseconds before the session locks, for scripted lock tests. Zero, non-numbers and unset use the five-minute default. | `crates/compositor/src/runtime.rs:44-53`, `crates/compositor/src/lock.rs:15-16` |

## Set by Tuna Desktop for its own processes

You do not normally set these. They are listed so that you can recognize them
in `/proc/<pid>/environ` and know what overriding them does.

| Variable | Set by, for | Meaning | Source |
|---|---|---|---|
| `TUNA_CONTROL_SOCKET` | compositor, for the shell | Path of the compositor's control socket, `$XDG_RUNTIME_DIR/tuna-<socket>.control`. Without it the shell runs with an empty overview. | set at `crates/compositor/src/supervise.rs:433`; path from `crates/compositor/src/runtime.rs:853-861`; read at `crates/shell-gtk/src/main.rs:314`, `crates/shell-host/src/main.rs:37-39` |
| `TUNA_SESSION_KIND` | compositor, for the shell | `nested` or `hardware`, from the backend in use. The shell treats anything other than `hardware` as nested: Log Out ends only the compositor and there is no Power Off, Restart or Suspend. A value already in the compositor's environment is passed through unchanged, which proofs use. | set at `crates/compositor/src/runtime.rs:1166-1176`; read at `crates/shell-gtk/src/power.rs:169-172` |
| `WAYLAND_DISPLAY` | compositor, for child services | The private socket name, configured explicitly per child command (ADR 0003); the compositor process environment remains unmutated. | `crates/compositor/src/supervise.rs:429`, `crates/compositor/src/orca.rs:334`, `crates/compositor/src/ime.rs:205`, `crates/compositor/src/bell.rs:52` |
| `XDG_CURRENT_DESKTOP` | `tuna-session`, for the compositor | `Tuna:GNOME` when the display manager did not set it. The session file's `DesktopNames=Tuna;GNOME;` normally sets it. | `crates/compositor/src/bin/tuna-session.rs:55-67`, `share/wayland-sessions/tuna.desktop` |
| `XDG_SESSION_TYPE` | `tuna-session`, for the compositor | Always `wayland`. A TTY login starts with `tty`. | `crates/compositor/src/bin/tuna-session.rs:69-73` |
| `WAYLAND_DISPLAY`, `XDG_CURRENT_DESKTOP`, `XDG_SESSION_TYPE`, `DISPLAY` | compositor (DRM/KMS only), for the systemd user manager and D-Bus activation | Imported with `systemctl --user set-environment` and `UpdateActivationEnvironment` so that portals and activated services find the session. `DISPLAY` is imported empty, then set to Xwayland's display once it is ready. A nested session never changes the host's activation environment. | `crates/compositor/src/session_services.rs:52-61`, `crates/compositor/src/session_services.rs:218-240`, `crates/compositor/src/session_services.rs:403-423` |
| `GDK_DEBUG`, `ADW_DISABLE_PORTAL` | `tuna-shell-gtk`, for itself | The shell turns off GTK's and libadwaita's own portal use. Apps it launches get the values the shell started with. | `crates/shell-gtk/src/portal_opt_out.rs:20-33` |

## Debugging and trace output

All of these write to standard error, which is `nested.log` in a nested
session and the journal under GDM (see
[session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md#logs)). None of them logs typed
text, passwords or window titles.

The compositor, shell, shell-host/IBus bridge, wallpaper loader and SVG helper
assemble each stderr record (including its newline) before one
`stderr().lock().write_all`. Each crate has a small `stderr_record` helper;
a crate-root `eprintln!` macro sends existing diagnostics through it, including
the bridge's formatted fields that previously became partial-line writes.
Keep that macro before the module declarations and import it in sibling
binaries. Existing opt-in trace guards are unchanged: no new logging runs
on the default path. Records up to the pipe's `PIPE_BUF` stay contiguous
between processes; this is not an unbounded-record atomicity guarantee.

This generalizes the grid-only fix in `228e757d` (#922) and the earlier
`windows.rs::trace_media` pattern. It also protects the unlock dialog's
`ease to=clock` record from IBus output (PR #975, run `41229639977`,
GTK job `124622737253`). Proof parsers remain strict; do not compensate for
fragmented emission by accepting partial lines.

| Variable | Read by | Effect | Source |
|---|---|---|---|
| `TUNA_LOCK_TRACE` | compositor, `tuna-shell-gtk` | When set, lock and unlock events are logged as JSON lines, including the authentication worker's lifecycle and, on DRM/KMS, the scanout reset after resume. Also adds an `auth_owner` section to the `TUNA_COMPOSITOR_STATE` file. | `crates/compositor/src/runtime/auth.rs:182`, `crates/compositor/src/runtime.rs:1916`, `crates/compositor/src/runtime.rs:2723`, `crates/compositor/src/drm.rs:1061`, `crates/shell-gtk/src/lock.rs:73` |
| `TUNA_POINTER_TRACE` | compositor | When set, logs a line for each pointer button the backend receives while unlocked, and what each press hit: the layer namespace, popup or window, and the active grabs. No button codes or key values. | `crates/compositor/src/runtime.rs:2010-2017`, `crates/compositor/src/windows.rs:3847-3852` |
| `TUNA_XWAYLAND_DEBUG` | compositor | `1` passes Xwayland's own standard output and error through instead of discarding them. | `crates/compositor/src/xwayland.rs:257-266` |
| `TUNA_IBUS_DEBUG` | `tuna-shell-gtk` | When set, logs IBus property-menu diagnostics, except while the screen is locked. | `crates/shell-host/src/ibus.rs:51-54`, `crates/shell-gtk/src/ibus_property_menu.rs:560` |
| `TUNA_PERF_TRACE` | compositor | `1` sends up to 64 timing records per run, from an accepted overview action to the scanout that shows it, straight to the journal under the identifier `tuna-perf-native`. | `crates/compositor/src/performance_trace.rs:1-32`, `crates/compositor/src/performance_trace.rs:88-90` |
| `TUNA_GRID_TRACE` | compositor, `tuna-shell-gtk` | When set, logs app-grid animation/paging samples, real main-thread scheduler counters, grid GDK paint phases and compositor grid-surface commit/callback/repaint/flush boundaries on CLOCK_MONOTONIC. Each short record is written atomically to stderr; compositor records are bounded to 512 bytes. Gates are cached. These are callback/phase observations, not presentation or client-receipt proof. | `crates/shell-gtk/src/grid_animation.rs:412-429`, `crates/compositor/src/grid_trace.rs:1-35` |
| `TUNA_TRANSIENT_TRACE` | `tuna-shell-gtk` | When set, logs menu and popover transitions and the unlock dialog's curtain progress. | `crates/shell-gtk/src/transient.rs:216-220`, `crates/shell-gtk/src/lock_curtain.rs:361-365` |
| `TUNA_MEDIA_DIAGNOSTICS` | compositor, `tuna-shell-gtk` | When it names an existing file, logs `tuna-media-diagnostic:` records for media-key routing. The file's contents are not read. | `crates/compositor/src/windows.rs:45-47`, `crates/shell-gtk/src/media_keys.rs:45-48` |
| `TUNA_FOLDER_CREATE_TRACE`, `TUNA_FOLDER_CREATE_SOURCE_COMMIT`, `TUNA_FOLDER_CREATE_PROOF_CONFIG` | `tuna-shell-gtk` | With the first set to `1` and the second a 40-hex-digit commit, records app-folder creation steps for a proof. The third is a file path recorded alongside them. | `crates/shell-gtk/src/folders.rs:369-385` |
| `TUNA_VM_PUBLIC_SEARCH_DIAGNOSTICS` | `tuna-shell-gtk` | `1` writes the search results the shell used to `/run/user/<uid>/tuna-vm-public-search.json`, for the Marlin VM lane. | `crates/shell-gtk/src/public_search_diagnostic.rs:101-120` |

The shared-log consumers in `scripts/tuna-*-proof*` and `scripts/lib` map to
these emitters (all paths below are under `crates/`):

| Parsed records | Emitters |
|---|---|
| `tuna-compositor: drm: output`, session paused/activated | `compositor/src/drm.rs` |
| Compositor workspace, switcher, modifier, session mode, media diagnostics | `compositor/src/windows.rs` |
| Compositor lock conversation and authentication retirement | `compositor/src/runtime/auth.rs`, `compositor/src/runtime.rs` |
| `screen reader retired` | `compositor/src/orca.rs` |
| Shell grid, transient, unlock-dialog, switcher fade | `shell-gtk/src/grid_animation.rs`, `transient.rs`, `lock_curtain.rs`, `switcher.rs` |
| Shell lock/auth, command results, password-submission **markers** (not passwords) | `shell-gtk/src/lock.rs`, `auth-prompt/src/lib.rs` |
| Greeter conversation, user list and session start **markers** (not answers) | `greeter/src/main.rs`, `greeter/src/conversation.rs` |
| Shell keybindings, media-key setup, policy refusals, screenshot-clipboard marker | `shell-gtk/src/main.rs`, `power.rs`, `run_dialog.rs` |
| Shell audio-recording, wellbeing, end-session diagnostics | `shell-gtk/src/services.rs`, `wellbeing.rs`, `power.rs` |
| Shell IBus candidate bounds/clicks and applied properties | `shell-gtk/src/ibus_panel.rs`, `ibus_property_menu.rs` |
| Shell media diagnostics and `FOLDER-CREATE` observations | `shell-gtk/src/media_keys.rs`, `folders.rs` |
| Bridge ready/context, key/cursor/focus, property and method diagnostics | `shell-host/src/bin/tuna-ibus-bridge.rs`, `shell-host/src/ibus.rs` |

Preformatted switcher receipts also use their crate's helper, without
allocating another buffer. Python proof fixtures (IBus test engine, fprintd mock,
service stubs) use separate artifact logs, not this shared session stream.
Wallpaper/SVG helper diagnostics are not proof receipts, but are buffered too
because they can otherwise fragment another process's receipt.

## Proof instrumentation

Used by the proof scripts to observe and drive a session. Several only take
effect when `TUNA_COMPOSITOR_STATE` is also set, so an ordinary session cannot
be driven through them by accident.

| Variable | Read by | Effect | Source |
|---|---|---|---|
| `TUNA_COMPOSITOR_STATE` | compositor, `tuna-shell-gtk` | Absolute path for coherent JSON snapshots: windows, focus, overview, lock, keyboard, frame cost and more. One owned writer atomically replaces the file off the compositor thread, retaining only the latest waiting snapshot. Successful writes alone deduplicate; failed bodies can retry on the next submission. Graceful shutdown drains the latest body. Publication is not presentation; existing real-frame evidence rules remain unchanged. Proofs keep a copy with `snapshot_state` from `scripts/lib/tuna-state-snapshot.sh`: plain `cp` refuses a file renamed over mid-copy. | `crates/compositor/src/state_snapshot.rs`, `crates/compositor/src/runtime.rs:2520` |
| `TUNA_ANIMATION_CLOCK` | compositor, `tuna-shell-gtk` | Absolute path of a file that freezes or steps animation time; needs `TUNA_COMPOSITOR_STATE`. See [animation clock](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#animation-clock-and-motion-policy). | `crates/compositor/src/animation_clock.rs:20-21`, `crates/shell-gtk/src/anim_clock.rs:55-65` |
| `TUNA_PROOF_SWIPE_INPUT` | compositor | Absolute path of a JSON file of synthetic touchpad swipe phases, each read once; needs `TUNA_COMPOSITOR_STATE`. | `crates/compositor/src/runtime.rs:1488-1491`, `crates/compositor/src/runtime.rs:3001-3012` |
| `TUNA_INTROSPECT_FILE` | `tuna-shell-host` | Absolute path where the legacy shell writes a snapshot of its panel and overview. | `crates/shell-host/src/introspect.rs:20-44`, `crates/shell-host/src/panel.rs:4290` |
| `TUNA_BACKLIGHT_ROOT` | `tuna-shell-gtk` | Directory to read instead of `/sys/class/backlight`. | `crates/shell-gtk/src/services.rs:579-586`, `crates/shell-gtk/src/brightness_service.rs:357-363` |
| `TUNA_BACKLIGHT_TEST_CONNECTORS` | `tuna-shell-gtk` | Fixture file mapping fake backlights to connectors. Read only when `TUNA_BACKLIGHT_ROOT` is set. | `crates/shell-gtk/src/brightness_service.rs:357-361` |
| `TUNA_NM_VPN_PROOF`, `TUNA_NM_VPN_PLUGIN_DIR` | `tuna-shell-gtk` | With the first set, the second is searched first for NetworkManager VPN plugin descriptions. | `crates/shell-gtk/src/network_secrets.rs:328-338` |
| `TUNA_WEATHER_FIXTURE` | `tuna-shell-gtk` | Path of a JSON file that stands in for the date menu's weather location and forecast (`state`, `location`, `forecasts`), read each time the Weather card is shown. With it set the shell asks neither GeoClue nor a weather service; GNOME Weather must still be installed for the card to show. | `crates/shell-gtk/src/weather.rs:100`, `crates/shell-gtk/src/weather.rs:197-245`, `crates/shell-gtk/src/weather.rs:302` |
| `TUNA_PROOF_FULLSCREEN`, `TUNA_LIFECYCLE_COMMAND` | `tuna-modal-dim-client` example | Proof client controls. | `crates/compositor/examples/tuna-modal-dim-client.rs:101`, `crates/compositor/examples/tuna-modal-dim-client.rs:230` |
| `TUNA_WELLBEING_COMMAND`, `TUNA_WELLBEING_REPLY` | `tuna-wellbeing-proof-shell` example | Command and reply files for the wellbeing proof's stand-in shell. | `crates/compositor/examples/tuna-wellbeing-proof-shell.rs:67-69` |

## Trust overrides

These remove a check that protects the session. Proofs set them inside a
private, disposable session; never set them in a real one.

| Variable | Read by | What it turns off | Source |
|---|---|---|---|
| `TUNA_SHELL_DBUS_UNRESTRICTED` | `tuna-shell-gtk` | `1` lets any D-Bus client call the shell's `org.gnome.Shell` methods, not just the allowlisted GNOME services. `scripts/tuna-parity-capture` uses it. | `crates/shell-gtk/src/shell_dbus.rs:372-376` |
| `TUNA_INTROSPECT_UNRESTRICTED` | compositor | `1` serves `org.gnome.Shell.Introspect` window data to every caller, without the capture authorization check. | `crates/compositor/src/introspect.rs:23`, `crates/compositor/src/introspect.rs:272` |
| `TUNA_POLKIT_HELPER` | `tuna-shell-gtk` | The program the polkit agent runs to check an administrator password, instead of the system's `polkit-agent-helper-1`. The proofs point it at a stub. | `crates/shell-gtk/src/polkit.rs:127-135` |

Three session settings also decide what runs with the session's privileges:
`TUNA_SHELL_BIN` and `TUNA_IBUS_BRIDGE_BIN` choose binaries the compositor
starts and hands its control socket or display to, and `TUNA_PAM_SERVICE`
chooses the PAM policy that unlocks the screen.

## Test-only variables

Read only by `cargo test` targets or by test binaries the proof scripts
start. They have no effect on an installed session.

| Variable | Effect | Source |
|---|---|---|
| `TUNA_REQUIRE_PAM_WRAPPER` | Turns the PAM tests' "pam_wrapper not installed" skip into a failure. CI sets it; see [running tests locally](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#before-opening-a-pr). | `crates/compositor/tests/pam_unlock.rs:25-31`, `crates/compositor/tests/pam_helper.rs:465-471` |
| `TUNA_REQUIRE_LOCKDOWN_SCHEMA` | Fails the lockdown test when GNOME's lockdown schema is missing instead of skipping. | `crates/shell-gtk/tests/lockdown.rs:34-38` |
| `TUNA_REQUIRE_AUTH_OWNER_RUNTIME` | Fails the auth-owner runtime test when there is no `DISPLAY`. | `crates/compositor/tests/auth_owner_runtime.rs:342-347` |
| `TUNA_REQUIRE_NATIVE_PRIVACY` | Runs the PipeWire privacy test instead of skipping it. | `crates/shell-gtk/src/privacy.rs:1737-1742` |
| `TUNA_REQUIRE_REMOTE_ACCESS_INDICATOR` | Runs the top bar's Stop Screen Sharing button and recording icon test instead of skipping it. | `crates/shell-gtk/src/remote_access.rs:300-307` |
| `TUNA_REQUIRE_AUTH_TRANSPORT_GTK`, `TUNA_REQUIRE_AUTH_PROMPT_GTK`, `TUNA_REQUIRE_COUNTDOWN_OSD`, `TUNA_REQUIRE_LOCK_CURTAIN`, `TUNA_REQUIRE_LOCK_IDLE_FRAMES`, `TUNA_REQUIRE_MEDIA_COMPLETION`, `TUNA_REQUIRE_MENU_MOTION`, `TUNA_REQUIRE_NOTIFY_UI`, `TUNA_REQUIRE_OSD_FADE` | Admission checks for `#[ignore]`d GTK tests that need a private X display and session bus. CI's `gtk-shell` job sets them and runs those tests with `--ignored`. | `crates/shell-gtk/src/lock.rs:1165`, `crates/shell-gtk/src/lock.rs:1233`, `crates/shell-gtk/src/osd.rs:400`, `crates/shell-gtk/src/lock_curtain.rs:989`, `crates/shell-gtk/src/lock.rs:1591`, `crates/shell-gtk/src/media_keys.rs:697`, `crates/shell-gtk/src/transient.rs:907`, `crates/shell-gtk/src/notify.rs:1892`, `crates/shell-gtk/src/osd.rs:542` |
| `TUNA_PAM_TEST_CHILD`, `TUNA_PRIVATE_PAM_TEST_CHILD`, `TUNA_NIGHT_LIGHT_TZ_CHILD`, `TUNA_AUTH_OWNER_CLIENT` | Set by a test for a copy of itself that it runs as a child process. | `crates/compositor/tests/pam_unlock.rs:18`, `crates/compositor/tests/pam_helper.rs:14`, `crates/compositor/src/night_light.rs:3232`, `crates/compositor/tests/auth_owner_runtime.rs:12` |
| `TUNA_AUTH_OWNER_ROOT`, `TUNA_AUTH_OWNER_TEST_BIN`, `TUNA_AUTH_OWNER_PROBE_BIN`, `TUNA_AUTH_OWNER_ARTIFACTS` | Fixture paths for `scripts/tuna-auth-owner-ci-proof`. | `crates/compositor/examples/native-auth-owner-probe.rs:18-23`, `crates/compositor/tests/auth_owner_runtime.rs:98`, `crates/compositor/tests/auth_owner_runtime.rs:350`, `crates/compositor/tests/auth_owner_runtime.rs:589` |
| `TUNA_MEDIA_FIXTURE_ROOT`, `TUNA_MEDIA_BARRIER_HELPER` | Fixture directory and helper script for `scripts/tuna-media-completion-proof`. | `crates/shell-gtk/src/media_keys.rs:537`, `crates/shell-gtk/src/media_keys.rs:662` |
| `TUNA_NATIVE_NODE`, `TUNA_NATIVE_SERIAL`, `TUNA_NATIVE_COOKIE`, `TUNA_NATIVE_MUTED`, `TUNA_NATIVE_EXPECTED` | Inputs to the PipeWire privacy test's child process. | `crates/shell-gtk/src/privacy.rs:1725-1730` |
| `TUNA_A11Y_TEST_SCHEMA_DIR`, `TUNA_A11Y_RECEIPT` | Schema fixture and receipt file for `scripts/tuna-gtk-accessibility-proof`. | `crates/shell-gtk/src/accessibility.rs:381`, `crates/shell-gtk/src/accessibility.rs:439` |
| `TUNA_SCREENSHOT_LIFECYCLE_RECEIPT` | Receipt file the screenshot UI test writes when it passes. | `crates/shell-gtk/src/screenshot_ui.rs:1141-1146` |
| `TUNA_XIM_PROBE_OWNER_FIXTURE`, `TUNA_XIM_PROBE_PID_FILE` | IBus XIM ownership test fixture. | `crates/compositor/src/ime.rs:391-402` |
| `GSETTINGS_BACKEND` | Two shell tests check for `memory`. | `crates/shell-gtk/src/accessibility.rs:286`, `crates/shell-gtk/src/lockdown.rs:499` |
| `DBUS_SESSION_BUS_ADDRESS`, `WAYLAND_DISPLAY`, `WAYLAND_SOCKET` | The admitted GTK tests check that they run on a private session bus and X display, with no Wayland connection. | `crates/shell-gtk/src/notify.rs:1892-1895`, `crates/shell-gtk/src/osd.rs:400-405` |
| `TUNA_TEST_APPLICATION_ENV_PRESENT`, `TUNA_TEST_APPLICATION_ENV_ABSENT` | Names the app-launch test sets and restores to check launched apps get the shell's original environment. | `crates/shell-host/src/apps.rs:526-534` |

## Build time

| Variable | Effect | Source |
|---|---|---|
| `TUNA_VERSION` | Read by the compiler (`option_env!`), not at run time. A `vX.Y.Z` or `X.Y.Z` value becomes what `--version` prints; without it the crate version (`CARGO_PKG_VERSION`) is used. `scripts/tuna-release` and `packaging/arch/PKGBUILD` set it from the release tag. | `crates/compositor/src/main.rs:14-28`, `crates/compositor/src/bin/tuna-session.rs:14-26`, `scripts/tuna-release:80`, `packaging/arch/PKGBUILD:91` |

Cargo also provides `CARGO_PKG_VERSION`, `CARGO_MANIFEST_DIR`, `OUT_DIR` and
`CARGO_BIN_EXE_<name>` to the build script and tests; you do not set them.

## Standard variables

Tuna Desktop also reads the usual desktop variables. These rows say what it
uses each one for.

| Variable | Used for | Source |
|---|---|---|
| `WAYLAND_DISPLAY`, `DISPLAY` | With `--backend auto` (the default), a non-empty value in either means "run nested in a window"; neither means DRM/KMS. | `crates/compositor/src/runtime.rs:257-262` |
| `XDG_RUNTIME_DIR` | The Wayland socket, the control socket (never in a shared temporary directory) and GNOME's session leader FIFO. Must be absolute and private to the user. | `crates/compositor/src/runtime.rs:853-861`, `crates/compositor/src/session_services.rs:434-441`, `crates/shell-host/src/xdg.rs:36` |
| `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `HOME` | Where settings, caches and state live: `monitors.xml`, the wallpaper cache, window sessions, ICC profiles, the shell's state. Also the paths the startup upgrade guard checks. | `crates/compositor/src/monitors.rs:255-261`, `crates/compositor/src/wallpaper.rs:1635-1637`, `crates/compositor/src/xdg_session.rs:485-488`, `crates/compositor/src/color_manager.rs:623-629`, `crates/shell-host/src/xdg.rs:23-51`, `crates/compositor/src/user_upgrade.rs:84-98` |
| `XDG_DATA_DIRS` | Desktop entries and icon themes. | `crates/shell-host/src/apps.rs:101-106`, `crates/shell-host/src/icons.rs:31-40`, `crates/compositor/src/cursor.rs:108` |
| `XDG_CURRENT_DESKTOP` | `OnlyShowIn`/`NotShowIn` filtering of desktop entries, and the value imported for activated services. | `crates/shell-host/src/apps.rs:138-144`, `crates/compositor/src/session_services.rs:410-413` |
| `XDG_SESSION_ID` | The logind session the compositor follows for `loginctl lock-session`/`unlock-session` and `LockedHint`, and the polkit agent's subject. Falls back to the session of the process. | `crates/compositor/src/logind_session.rs:10-25`, `crates/shell-gtk/src/polkit.rs:520-526` |
| `XDG_PICTURES_DIR`, `XDG_VIDEOS_DIR` | Where screenshots and screen recordings are saved. | `crates/compositor/src/screenshot.rs:296-301`, `crates/shell-gtk/src/screencast.rs:106-113` |
| `LOGNAME`, then `USER` | The user the lock screen authenticates. | `crates/compositor/src/unlock.rs:70-77` |
| `PATH` | Finding the shell, `Xwayland`, `ibus-daemon`, `ibus-x11` and the IBus bridge. | `crates/compositor/src/runtime.rs:396-431`, `crates/compositor/src/ime.rs:55-61`, `crates/compositor/src/ime.rs:179` |
| `DBUS_SESSION_BUS_ADDRESS` | Whether a session bus is there to read lockdown settings from. | `crates/compositor/src/lockdown.rs:445-451` |
| `XCURSOR_PATH` | Cursor theme search path, as libXcursor reads it. | `crates/compositor/src/cursor.rs:84-108` |
| `IBUS_ADDRESS`, `IBUS_ADDRESS_FILE` | Whether IBus is present, and which directory to watch for its address file. | `crates/shell-gtk/src/ibus_panel.rs:215-219`, `crates/shell-gtk/src/ibus_panel.rs:693-700` |
| `LANG` | Locale the polkit agent registers with. | `crates/shell-gtk/src/polkit.rs:583-585` |
| `CUPS_SERVER`, `CUPS_DATADIR` | Which CUPS server to talk to, and where the test page lives. | `crates/shell-gtk/src/printers.rs:900-907`, `crates/shell-gtk/src/printers.rs:1985-1991` |
| `GSK_RENDERER` | When set, the shell keeps the GTK renderer you chose. Otherwise it switches to the cairo renderer when OpenGL is a software rasterizer such as llvmpipe. | `crates/shell-gtk/src/renderer.rs:20-30` |
| `GNOME_SHELL_SLOWDOWN_FACTOR` | A positive number multiplies every animation duration, as in GNOME Shell. Read when the shell starts. | `crates/shell-control-schema/src/motion.rs:16`, `crates/shell-gtk/src/motion.rs:62` |
| `GDM_MESSAGE_TIME_MULTIPLIER` | A positive number multiplies how long each lock-screen and login-screen message stays up, as in GDM. | `crates/shell-gtk/src/lock.rs:312-314`, `crates/greeter/src/main.rs`, `crates/auth-prompt/src/lib.rs:97-103` |
| `GLYCIN_DATA_DIR` | Glycin loader configuration directory, hashed by the SVG wallpaper helper so a loader change invalidates its cache. | `crates/wallpaper-svg/src/provenance.rs:60-67` |
| `NOTIFY_SOCKET` | systemd's notify socket: `tuna-compositor --greeter` sends `READY=1` once the login screen first maps (`Type=notify`). | `crates/compositor/src/session_services.rs` (`notify_ready`) |

## Scripts and builds

### `scripts/try-tuna-desktop`

The script's header documents its options; they all start with `TRY_TUNA_`:
`TRY_TUNA_IMAGE`, `TRY_TUNA_VM`, `TRY_TUNA_MEM`, `TRY_TUNA_CPUS`,
`TRY_TUNA_DISK`, `TRY_TUNA_PORT`, `TRY_TUNA_NO_OPEN`, `TRY_TUNA_USER` and
`TRY_TUNA_PASSWORD` (`scripts/try-tuna-desktop:11-42`).

### `justfile`

| Variable | Default | Effect |
|---|---|---|
| `TUNA_TARGET_DIR` | `target/` in the checkout | Cargo target directory for every recipe. An inherited `CARGO_TARGET_DIR` is ignored. |
| `TUNA_BUILD_SLOTS` | one per 8 GiB of RAM, at most 2 | Cargo builds that may run at once across worktrees (and proofs' own builds). |
| `TUNA_BUILD_SLOT_BASE` | `/tmp/tuna-local-build.slot` | Prefix of the build slots' lock files (`.0`, `.1`, …). |
| `TUNA_PROOF_SLOTS` | `1` | Nested (private Xvfb) proofs that may run at once; above 1 is opt-in, as timing-sensitive proof stages flake under the load. |
| `TUNA_PROOF_SLOT_BASE` | `/tmp/tuna-local-proof.slot` | Prefix of the nested proofs' slot lock files. |
| `TUNA_PROOF_LOCK` | `/tmp/tuna-local-proof.lock` | Prefix of the one slot file (`.0`) that serializes proofs of machine-wide state (vkms, seatd, uinput, sudo). |
| `TUNA_PROOF_TIMEOUT` | the proof's CI job `timeout-minutes`, at least 45 | Minutes before `just proof` stops a proof and everything it started. |
| `TUNA_BUILD_TIMEOUT` | `60` | Minutes before `just build`, `test` or `clippy` stops cargo's process group. |
| `TUNA_SLOT_WAIT` | `120` | Minutes a recipe waits for a build or proof slot before giving up (exit 75). |
| `TUNA_MIN_FREE_GB` | `40` | Below this many GiB free on the repository's filesystem, `tuna-disk-guard` removes idle worktree targets and stale scratch. Build recipes run this guard first. |
| `TUNA_IDLE_MINUTES` | `45` | How long a worktree target must be untouched before `tuna-disk-guard` may remove it; running-process references always protect it. |
| `TUNA_CI_ARTIFACTS` | `/tmp/tuna-ci-artifacts` | Where `just ci-artifacts` downloads to. |
| `TUNA_CI_ARTIFACT_TTL_MIN` | `360` | Minutes before `just gc` deletes a download. |
| `CARGO_BUILD_JOBS` | half the CPUs | Parallel compile jobs per build. |
| `CARGO_INCREMENTAL` | `0` | Cargo's incremental compilation (sccache can't cache it). |
| `RUSTC_WRAPPER` | `sccache` when installed | Compiler wrapper; sccache shares compiled crates between worktrees. |
| `SCCACHE_DIR` / `SCCACHE_CACHE_SIZE` | `~/.cache/sccache` / `40G` | sccache's disk cache, read when its server starts. |
| `PKG_CONFIG` | `/usr/bin/pkg-config` | The `pkg-config` binary the builds use. |

`just proof` also exports `TUNA_PROOF_RUN`, the run's artifact directory, to
every process it starts, so that it can find and stop them afterwards, and
a private `XDG_RUNTIME_DIR`; it unsets `DISPLAY`, `WAYLAND_DISPLAY`,
`WAYLAND_SOCKET`, `DBUS_SESSION_BUS_ADDRESS` and `AT_SPI_BUS_ADDRESS`
(`justfile:8-47`, `justfile:75-173`).

### Packaging

| Variable | Read by | Effect |
|---|---|---|
| `TUNA_LOCAL_SRC` | `packaging/arch/PKGBUILD:5-7`, `:65-70` | Build the Arch package from this checkout instead of fetching the release tag: `TUNA_LOCAL_SRC="$PWD" makepkg -f --dir packaging/arch`. |
| `TUNA_PKG`, `TUNA_PKG_SHA256` | `packaging/marlin/Containerfile:18-26` | Build arguments (`--build-arg`), not environment variables: the Arch package file to layer into the Marlin image, and its checksum. |
| `TUNA_CI_ONLY` | `packaging/marlin/vm-lane/tuna-vm-constraints-build:4` | Must be `1`; stops the CI-only VM pointer-constraint client build from running anywhere else. |
| `TUNAOS_GDM_DEFAULT_ROOT`, `TUNAOS_GDM_SESSIONS_ROOT`, `TUNAOS_GDM_THEME_ROOT` | `packaging/marlin/vm-lane/tunaos/tuna-gdm-*.sh`, `tuna-hide-other-sessions.sh` | Root directory prefix the VM-lane GDM helpers write under, so tests can run them on a scratch tree. |

### Proof scripts

Options a proof script reads from your environment:

| Variable | Read by | Effect |
|---|---|---|
| `TUNA_PROOF_BIN_DIR` | `scripts/tuna-gtk-shell-proof`, `scripts/tuna-lock-auth-proof`, `scripts/tuna-greeter-proof`, `scripts/tuna-visual-capture`, `scripts/lib/tuna-proof-session-launch` | Run prebuilt binaries from this directory instead of building them. |
| `TUNA_PROOF_SHELL_BIN` | `scripts/tuna-gtk-shell-proof`, `scripts/lib/tuna-proof-session-launch` | Shell binary for the proof session. |
| `TUNA_PROOF_COMPANIONS` | `scripts/tuna-gtk-shell-proof:356` | Directory of the compositor's example clients (default `target/debug/examples`). |
| `TUNA_PROOF_BINARY_SOURCE_COMMIT` | `scripts/tuna-gtk-shell-proof` | Commit recorded for prebuilt binaries in the proof manifest. |
| `TUNA_VISUAL_BIN_DIR`, `TUNA_PARITY_BIN_DIR` | `scripts/tuna-visual-capture:632`, `scripts/tuna-parity-capture:159-162` | The same as `TUNA_PROOF_BIN_DIR`, for those two scripts. |
| `TUNA_STUB_SERVICES` | `scripts/lib/tuna-service-stubs.py:38`, `:587` | Comma-separated system services to stub: `nm`, `bluez`, `ppd`, `logind`, `polkit`, `gdm`. |
| `TUNA_POLKIT_TEST_PASSWORD` | `scripts/lib/tuna-polkit-helper-stub.py:8-18` | Password the stub polkit helper accepts (default `tuna-proof`). |
| `TUNA_REQUIRE_IBUS`, `TUNA_REQUIRE_WAYLAND_INFO`, `TUNA_REQUIRE_GSD_MEDIA_KEYS` | `scripts/tuna-gtk-shell-proof` | `1` fails the matching stage when its tool is missing instead of skipping it. |
| `TUNA_PROOF_SESSION_GRACE` | `scripts/lib/tuna-proof-session` | Seconds (default 10) a stopped proof has for its own cleanup, and teardown waits after TERM before KILL. |
| `TUNA_PROOF_INOTIFY_NEED` | `scripts/lib/tuna-proof-preflight` | Free inotify instances (default 32) a proof needs; with fewer it refuses to start. |
| `TUNA_WALKTHROUGH_REPO_ROOT` | `scripts/tuna-walkthrough:393` | Repository the walkthrough freshness check reads. |
| `TUNA_TRACE_WORK_DEADLINE` | `scripts/lib/perf_operation_budget.py:44-48` | Deadline handed from a performance script to its helpers. |
| `XDG_STATE_HOME` | `scripts/tuna-nested` | Parent of the default artifacts directory, `$XDG_STATE_HOME/tuna-nested/<socket>`. |

The other `TUNA_*` names in `scripts/` are set by a proof for its own child
processes and are not options: the `TUNA_*_PRIVATE_BUS` and
`TUNA_A11Y_PRIVATE_SESSION` markers that stop a script re-running itself
under `scripts/lib/tuna-proof-session`, that helper's `TUNA_PROOF_SESSION`
run marker and `TUNA_PROOF_SESSION_BUS_PID`, the `TUNA_STUB_*_LOG` call logs, the
`TUNA_TEST_*` controls for `scripts/lib/tuna-test-window.py`,
`TUNA_FLASH_PROOF_ARTIFACTS` and `TUNA_PROOF_SOURCE_SHA` for proof helper
scripts, and the ownership marker `TUNA_GRID_COMPARISON_OWNER`.
`scripts/ci-select-lanes` and the proof identity
helpers in `scripts/lib/` read the `GITHUB_*` and `RUNNER_*` variables GitHub
Actions provides.

## Examples

Run the nested session with the GTK shell at 150 percent, keeping Xwayland's
own output in the log:

```sh
cargo build -p tuna-shell-gtk
TUNA_SCALE=1.5 TUNA_XWAYLAND_DEBUG=1 \
  scripts/tuna-nested run --shell-bin target/debug/tuna-shell-gtk
```

Trace lock and unlock while you reproduce a lock bug:

```sh
TUNA_LOCK_TRACE=1 scripts/tuna-nested run --shell-bin target/debug/tuna-shell-gtk
```

Slow every shell animation down five times, to watch a transition:

```sh
GNOME_SHELL_SLOWDOWN_FACTOR=5 scripts/tuna-nested run --shell-bin target/debug/tuna-shell-gtk
```
