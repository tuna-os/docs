---
sidebar_position: 6
title: "accessibility shell"
---

The GTK shell consumes `org.gnome.desktop.a11y always-show-universal-access-status` live. Its accessibility indicator appears when requested or when any menu feature is enabled, matching [GNOME Shell 51's indicator](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/status/accessibility.js). The ten rows follow the reference order: High Contrast, Zoom, Large Text, Screen Reader, Screen Keyboard, Visual Alerts, Sticky Keys, Slow Keys, Bounce Keys, Mouse Keys. Boolean rows bind their GNOME settings bidirectionally; Large Text uses factor 1.25 when enabled and resets the schema default when disabled. Accessibility Settings launches `gnome-control-center universal-access`.

This implements menu settings and visibility. It does not implement AccessX, or compositor visual alerts. Those remain separately recorded capability gaps; a toggle state alone proves no functional assistive feature. Screen Reader (also Super+Alt+S) starts the distribution Orca in a hardware session, or in a nested one started with `--screen-reader`; what Orca says on the shell is gated by `scripts/tuna-orca-speech-proof` (P-A11Y-06).

The Orca search proof waits for each character's actual speech-dispatcher
utterance before sending the next character, then checks the complete ordered
`s p e e c h` sequence. This tests character echo rather than typing speed:
Orca cancels pending speech on each keypress, so a fixed input delay can drop
letters when the speech sink is busy.

## Screen reader keys while locked (#936)

The owned screen reader remains the user's trusted AT while locked. Its
KeyboardMonitor receives complete key presses and releases, including the
password's keysym, Unicode character, physical keycode and keyboard modifier
state. There is no password redaction and no restriction to keys whose focused
surface is the lock prompt. Its watches and grabs, including Orca-modifier
commands and `GrabKeyboard`, remain effective across lock/unlock. This is not
permission to send input to an ordinary session client: the separate lock
surface route and post-unlock held-key quarantine enforce that boundary.

This follows the **51.1 source**, not an inference from a Tuna speech result:

- [Mutter's `meta_a11y_manager_notify_clients`](https://github.com/GNOME/mutter/blob/9134e3a5869ce232bf95b77519005865747ba603/src/backends/meta-a11y-manager.c#L617-L681)
  never checks lock state, password purpose or focus. `WatchKeyboard` watches
  every key; without it, a grab match is also watched. The only content mask
  removes Clutter's five mouse-button modifier bits; keyboard modifiers,
  keysym, Unicode and keycode remain intact. `notify_client` unicasts
  `(buuuq)` to that grabber's unique bus name. Grabs consume matching presses
  and their releases; custom modifiers grab chords, with the native
  accessibility modifier double-press exception. Lock does not clear grabs
  or synthesize modifier releases.
- [`events.c`](https://github.com/GNOME/mutter/blob/9134e3a5869ce232bf95b77519005865747ba603/src/core/events.c#L148-L167)
  calls it before WM shortcuts, Wayland text input and the stage-grab routing.
  The preconditions are that captured input has not already consumed the
  event and the focused window does not inhibit shortcuts, not lock-prompt
  focus. A consumed AT grab stops routing before the screen shield too.
- [GNOME Shell's screen shield](https://github.com/GNOME/gnome-shell/blob/33da06854e229c256afd5872fedd83c28cbfa176/js/ui/screenShield.js#L199-L205)
  takes a `LOCK_SCREEN` modal stage grab; [`pushModal`](https://github.com/GNOME/gnome-shell/blob/33da06854e229c256afd5872fedd83c28cbfa176/js/ui/main.js#L695-L736)
  sets Clutter focus. Neither unregisters the keyboard watcher nor sanitizes
  its events. Mutter's [access checker](https://github.com/GNOME/mutter/blob/9134e3a5869ce232bf95b77519005865747ba603/src/backends/meta-a11y-manager.c#L409-L411)
  admits the owner of `org.gnome.Orca.KeyboardMonitor` (apart from its explicit
  unsafe/debug modes).

Tuna keeps its stricter admission: the same-UID unreaped compositor-owned Orca
PID must own the monitor name, and signals target its admitted unique bus
owner only. Owner loss, replacement and child revocation still invalidate
queued delivery; overflow still fails closed and reliably resets disclosed
custom modifiers. Lock itself is no longer a transport reset. The AT can
read these secrets because it is the user's own trusted screen reader,
exactly as in Mutter; they are not broadcast to other bus listeners, logged,
or delivered to session surfaces.

### Unlock focus and held-key quarantine (#939)

The authoritative compositor unlock transition calls
`WindowManager::unlock_input` once to hand keyboard focus back to the actual
session keyboard owner. The handoff uses the normal focus policy without
raising a window: overview, exclusive layer surfaces and popup grabs retain
their priority over the ordinary focused window. It does not wait for a later
pointer motion or ordinary key to repair seat focus.

Every seat key physically held at that transition is quarantined from ordinary
session input until its genuine release. Quarantined keys are removed from the
forwarded pressed-key set before focus is restored, so the new owner's keyboard
enter cannot disclose lock-held keys. Physical pressed state and XKB state are
preserved; unlock does not invent releases or reset held modifiers. Repeated
presses and the eventual release cannot reach session clients or trigger
ordinary session shortcuts. A subsequent fresh press is eligible for normal
routing again.

Trusted AT interception remains first, before ordinary-session quarantine
filtering, including runtime repeat/release filtering. The admitted screen
reader therefore receives genuine lock keys and genuine held-key releases,
even when the session must suppress those events. This quarantine is not an
AT transport reset or a change to the GNOME 51.1 trust policy described above.
These are routing requirements, not an additional test or CI receipt.

`G-ORCA-SPEECH-LOCK-DBUS` locks after Escape through `ScreenSaver.Lock`;
`G-ORCA-SPEECH-LOCK-SUPER-L` uses the ordinary complete chord. Each requires
exactly one spoken bullet per typed character, no plaintext character or word,
and a real PAM unlock. `G-ORCA-SPEECH-LOCK` requires both. This removes the
old dependence on Orca's last pre-lock key. Search and password echo are
acknowledged per character rather than paced by a fixed sleep: Orca cancels
pending speech on every press, so a busy speech-dispatcher can legitimately
discard earlier utterances before its logging synthesizer runs (the search
flake in CI run 41148163143). The ordered echo and exact bullet-count
assertions are retained; the next key waits for actual speech, never a retry.
The native VM privacy gate now checks that the same trusted AT hears lock
keys while the ordinary client hears neither password input nor an
AT-grabbed key's post-unlock release; `V-NORMAL-INPUT-FAIL-CLOSED` is unchanged.

Local cancellation reproduction (Ubuntu 26.04, Orca 50.3): adding a 400 ms
delay only to the real speech-dispatcher logging synthesizer reproduces the
CI symptom with the original 150 ms typing pace: the search gate hears only
`h`. With the same sink delay and unchanged ordered assertion, per-character
acknowledgment hears all six letters and reaches Speech Probe. The normal
full speech proof also passes both lock variants, nine bullets each. These
are real Orca/speech-dispatcher runs, not a substituted event/speech source.

## Screen magnifier (#349)

The shell mirrors `screen-magnifier-enabled` and every `org.gnome.desktop.a11y.magnifier` key into the session snapshot `$XDG_RUNTIME_DIR/tuna-magnifier.json` (see the `tuna-magnifier` crate), now and on every change. Super+Alt+8 (toggle, autorepeat ignored) and Super+Alt+=/- (factor plus/minus one, rounded) are media-keys schema keys: in the session gsd-media-keys handles them and flips the same settings; without it (the nested preview) the shell binds them itself. Key defaults and ranges match [gsettings-desktop-schemas 51.0](https://github.com/GNOME/gsettings-desktop-schemas/blob/51.0/schemas/org.gnome.desktop.a11y.magnifier.gschema.xml.in).

The compositor draws [gnome-shell 51.0's ZoomRegion](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/magnifier.js) as a live render transform on every output frame (`crates/compositor/src/magnifier.rs`): the scene renders offscreen, the zoom region composes the system background, the region of interest, the cross-hairs and the pointer sprite magnified at scale x factor, and the output frame shows it through the Clutter/Shell color effects (desaturate, brightness/contrast, invert lightness) with the accent border and the system pointer outside a half-screen region. Screenshots and screen casts read back the same passes, without the pointer sprite. Tracking follows magnifier.js: `_setViewPort` rounding, centered/proportional/push modes, edge clamping unless `scroll-at-edges`, lens mode, the 1 s pointer rest before caret and focus moves, and 100 ms animated scrolls and factor changes. Focus and caret come from AT-SPI events of the focused widget in the active window (`crates/compositor/src/focus_caret.rs`); the lock screen magnifies too, and while locked only the lock surface's own events steer it, so its frame holds nothing but the lock UI.

Proof (`scripts/tuna-magnifier-proof`, nested winit session): M-OFF..M-TRACK and M-DISABLE read shell screenshot captures; M-FOCUS runs a libadwaita window with `GTK_A11Y=none` to prove the window-centre fallback, M-ATSPI-FOCUS moves GTK focus between an entry and a button and requires the view centered on each widget. The live gates read x11grab frames of the nested window, which include the magnified sprite: M-LIVE (factor 2 doubles a known two-colour widget around the pointer), M-CLICK (clicks under the magnified sprite land on the widget it shows), M-KEYS (Super+Alt+8, Super+Alt+=/-), M-CURSOR (sprite footprint doubles), M-INVERT, M-CROSSHAIRS, M-HALF (left half zoomed, right half unmagnified) and M-LOCK (the magnified locked frame contains no window pixels).

Accepted differences from GNOME 51: touch points are mapped back through the zoom so a tap lands on what is shown under the finger (GNOME leaves touch unmapped); applications without AT-SPI fall back to the text-input caret rectangle and the focused window's centre; each monitor gets its own zoom region instead of GNOME's single region spanning the stage; focus inside shell popovers is not tracked. Not yet proven: brightness/contrast/saturation pixels (unit-tested only), caret tracking from a live text client, and hardware multi-output measurement. The on-screen keyboard (`screen-keyboard-enabled`) has no consumer yet.

`org.gnome.desktop.a11y.interface keyboard-focus-visible-timeout` controls focus indication in shell GTK windows. Positive values are seconds, zero keeps keyboard focus visible, and negative uses the toolkit default. [GTK 4.23.3's window implementation](https://github.com/GNOME/gtk/blob/4.23.3/gtk/gtkwindow.c) supports the corresponding toolkit property. When that property is absent, a weak-window policy refreshes the old fixed timeout until the requested duration expires, preserves pointer-driven clearing, and observes newly created windows. The old [GTK 4.14.5 default](https://github.com/GNOME/gtk/blob/4.14.5/gtk/gtkwindow.c) is three seconds. Missing schemas/keys remain safe on older hosts. The shell policy does not change external applications' toolkit settings.

## Focused proof

`scripts/tuna-gtk-accessibility-proof GTK_TEST_EXECUTABLE SOURCE_COMMIT ARTIFACT_DIRECTORY` runs the ignored `accessibility::tests::live_menu_and_focus_settings` test using actual GTK widgets, settings callbacks, and timers. Each run owns a mode 0700 runtime directory, private session and accessibility buses, a free Xvfb display, and memory settings, and records binary/source identity plus GTK version. A persistent guard queries the private bus for its daemon and registry processes, retains pidfds before the test starts, and verifies their exit before the runtime directory is removed. Query failure refuses proof. The dedicated focus schema fixture allows older hosts to exercise the new key without changing installed schemas or the user's settings.

Scope: source GTK widget behavior on the recorded host. Nested shell pixels from real keys and the restart case are covered by the journey gates in the next section. External toolkit clients, native output sessions, the installed image and paired GNOME behavior still need qualification. Pure policy tests and this focused source proof alone do not close P-A11Y-05.

The wrapper emits `G-A11Y-PREFS pass` in `assertions.txt` only after the actual widget receipt, retained pidfds, verified registry/bus/launcher/Xvfb exits, and removed runtime directory all succeed. It clears previous receipts and assertions before starting. CI runs this proof explicitly; listing an ignored Cargo test is insufficient evidence that it ran.

### Local receipt (2026-10-10)

Exact implementation source `88aa154950603ca5d60efc0d678b5a349c557fcc` was compiled after a workspace package clean under the shared build-and-freeze guard, with one build job and development/test debug info disabled. The frozen test executable is `/tmp/tuna-v1-a11y-qualified-binaries/gtk-tests`, SHA256 `d4885c49ee1e61e0e9f938622af45aab276a977a64f71e2c0b6b799af1827cf7`.

- All nonignored GTK unit tests: **122 passed**, two graphical tests deliberately ignored by this invocation. Log: `/tmp/tuna-v1-a11y-qualified-unit-tests.log`.
- Actual graphical accessibility test: **1 passed** in 18.82 seconds. Artifacts: `/tmp/tuna-v1-a11y-proof-qualified`. Checks include each available boolean row's setting-to-widget and widget-to-setting directions, indicator visibility, ten-row structure, Large Text reset/1.25, one-second/default/forever focus, existing visible windows, inherited transient visibility, and pointer-style focus clearing.
- Strict GTK lint: `cargo clippy -p tuna-shell-gtk --all-targets -- -D warnings` passed. Log: `/tmp/tuna-v1-a11y-clippy.log`.
- Shellcheck, shell syntax, Rust formatting, and the 429-key settings inventory check passed.

The manifest records host GTK **4.14.5**, private display/session/accessibility bus identities and mode 0700 runtime. `owned-accessibility.json` confirms retained pidfds and verified exit for the private registry and bus daemon; the runtime directory was removed. The newer native GTK property branch is source-reviewed and compiled but was not exercised on this host. The remaining qualification scope above applies; this is a partial P-A11Y-05 receipt.

## Focus indication and the accessibility menu in the running shell (#351)

The GTK shell journey (`scripts/tuna-gtk-shell-proof`, or only these gates with `--a11y-focus-only`) checks both with real keys sent through the nested window (XTEST into the compositor's keyboard), not by setting widget state. `scripts/lib/tuna-focus-ring-timeline.py` presses the key, then reads the panel strip from the X server every 40 ms and records when each control's focus indication appears and clears. The before, half-second, first-lit and first-expired frames are kept as evidence.

- **G-FOCUS-RING:** Ctrl+Alt+Tab, then Tab, light GNOME 51's focus indication on exactly the focused panel control (Activities, then the clock) and on no other control. As in [`panel_button`'s `&:focus`](https://github.com/GNOME/gnome-shell/blob/51.0/data/theme/gnome-shell-sass/_drawing.scss), that indication is the hover fill: white at 17% over the black bar, with no ring. An open menu's fill still takes priority. Before this gate, the panel showed libadwaita's blue outline, and the gate fails against that look.
- **G-FOCUS-RING-TIMEOUT:** `keyboard-focus-visible-timeout` decides when the indication clears after a real key, while the control keeps keyboard focus (checked in the accessible tree). The default (-1) clears it at the toolkit's three seconds (measured 3.0 s). A value of 2 clears it at 2 s (measured 2.1 s). A value of 5 outlasts GTK 4.14's own three-second timer and clears at 5 s (measured 5.1 s). A value of 0 never clears it during an 8 s window.
- **G-A11Y-MENU-CLOSE-STABLE** (#1077): two readers (`scripts/lib/tuna-a11y-tree-reader.py`) walk the shell's whole AT-SPI tree in a loop, child count then each child by index, across 20 rounds of the window menu (Alt+Space, Escape), quick settings and the calendar (panel clicks, Escape) and a notification banner (Notify, CloseNotification) opening and closing. The shell process must be the same afterwards, each reader must have completed at least 20 passes and seen every surface up, and the log must hold no `g_variant_new_object_path` critical. GTK before 4.25 answers the application root's `GetChildAtIndex` for an index past the visible toplevels with the last toplevel it lists, and crashes when that one is hidden (GNOME/gtk#8444, fixed by !10440). The shell keeps the panel, which is always mapped, last in GTK's toplevel list (`accessibility::keep_last_toplevel`), so the panel is the application's last child in the tree. Without that the gate fails in its first round.
- **G-A11Y-MENU-RESTART:** with every menu feature off and `always-show-universal-access-status` off, the indicator is hidden. Turning always-show on shows it live. Real keys then open the menu (Ctrl+Alt+Tab, Tab to Accessibility, Enter, Tab to Visual Alerts) and Space turns Visual Alerts on. With always-show turned off again, the indicator stays up for the enabled feature. The proof then sends SIGTERM to the shell and the compositor's supervisor restarts it. The restarted shell shows the indicator, and its menu, opened with real keys again, shows Visual Alerts checked. Space turns it off and the indicator hides live.
- **G-SHELL-STABLE** still fails on any shell exit, except one: it allows exactly one `ShellExited`, and only inside the log byte range of G-A11Y-MENU-RESTART's deliberate restart (from the kill until the restarted shell's indicator is confirmed). An exit anywhere else, or a second exit inside that range, fails it.

Onset and expiration are separate assertions: the indication must first appear within **0.8 s** of `xdotool key` returning, and then satisfy the unchanged timeout window (default 2.8–3.9 s, 2-second setting 1.8–2.9 s, 5-second setting 4.8–5.9 s, zero with no observed expiration during 8 s). A failed check prints the control's measured `lit_from` and `lit_until`; late onset is a `G-FOCUS-RING` failure, not evidence that the timeout cleared the ring. Regression fixtures preserve both bounds and distinguish the captured late-onset cases from genuine early expiration.

Scope and remaining differences from GNOME 51:

- These gates run in the nested GTK session on the CI host's GTK 4.14, so the older-toolkit timer path is exercised. The native `gtk-keyboard-focus-visible-timeout` property path (GTK 4.23.3 and later) is not exercised in a running shell.
- The installed-package run proves only the focus gates. It keeps its original shell for G-INSTALLED-STABLE, so it skips the restart gate.
- Paired GNOME 51 captures and hardware sessions are still missing.
- GNOME Shell's own St chrome does not read `keyboard-focus-visible-timeout`: a focused GNOME panel button stays lit for as long as it has key focus. Tuna's shell is GTK and applies the key, so with the default its panel indication clears after three seconds while focus stays. This is a known difference, not a GNOME behaviour.

## On-screen keyboard (#349)

`crates/shell-gtk/src/osk.rs` ports gnome-shell 51.0's `js/ui/keyboard.js`. Layouts are GNOME's own `data/osk-layouts` JSON (bundled as a GResource, `crates/shell-gtk/osk-layouts/`), resolved as `_updateLayout` does: the current input source's group, then the group without its variant, then `us`, with the `digits`, `number`, `phone`, `email` and `url` models and `-extended` layouts by content purpose (`osk_layout.rs`). Key behaviour (`osk_model.rs`) follows `_addRowKeys`: levels and their latch, long-press extended keys, modifiers, the emoji pager and the language menu; open and close keep GNOME's 300 ms rest time and the 50 ms focus-out delay.

The keyboard shows when `screen-keyboard-enabled` is set or the compositor reports touch-mode auto-show (mutter's `update_touch_mode` with a touchscreen last used), and the focused field asks for the input panel: mutter treats enabling an already focused text-input-v3 (version 1) as that request, which GTK sends on a click into its field. The compositor tracks text-input-v3 itself (`crates/compositor/src/osk.rs`), independent of IBus; Smithay now always sends text-input enter/leave (`third-party/smithay/TEXT-INPUT-FOCUS-API-PATCH.diff`). The session keyboard is a layer surface with no keyboard interactivity, so the field keeps focus. Typing goes through the control socket (`OskInput`, wire 0.43) as `KeyboardController` does: a key's string is committed to the focused text input, or (no input-method focus, or modifiers latched) pressed as keysyms on the active layout with Shift or AltGr for their level, which also reaches X11 clients. It hides on the hide key, focus loss, `on_screen_input_provided` and when the setting goes off.

On the lock screen each lock window embeds its own keyboard, opened by the unlock prompt's focus, that edits only that prompt; the compositor reports no text-input focus and refuses `OskInput` while locked, and the session keyboard is hidden.

Proof (`scripts/tuna-osk-proof`, nested winit session, real xdotool clicks through the nested window on a GTK 4 probe with two entries and on the keys the shell's AT-SPI tree names): G-OSK-SHOW (with `screen-keyboard-enabled` off a click into an entry shows nothing; on, the click shows the keyboard no sooner than the 300 ms rest time, focus moving between entries keeps it up through the 50 ms focus-out delay, and focus on a button hides it no sooner than that delay), G-OSK-TYPE (tapped keys reach the client's entry, which keeps the focus), G-OSK-SHIFT (shift types one uppercase letter; the long-press caps latch types uppercase until tapped off) and G-OSK-LOCK (locked, the session keyboard is hidden and never maps, the lock screen's keyboard taps the password into the unlock prompt and unlocks through PAM, and the session's entries see no change).

Open: auto-capitalisation from surrounding text, IBus-routed keys for IBus sources, word-wise delete, shifting the focused window above the keyboard, and GNOME's bottom-edge touch drag.
