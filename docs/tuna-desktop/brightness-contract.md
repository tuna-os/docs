---
sidebar_position: 8
title: "brightness contract"
---

The GTK shell exports `org.gnome.Shell.Brightness` at
`/org/gnome/Shell/Brightness`: readonly boolean `HasBrightnessControl`, void
`SetDimming(b)` and `SetAutoBrightnessTarget(d)`, and the payloadless
`BrightnessChanged` user-update signal. This candidate still requires fresh
Rust, GTK and native VM qualification; source and controlled fixtures do not
qualify physical backlight hardware.

Positive capability requires a bounded readable kernel backlight associated by
its actual raw type and canonical DRM connector ancestry with the exact
compositor-owned GPU and connector object, plus the actual system bus. A new
append-only native inventory carries the selected char-device rdev, kernel
connector ID and canonical object identity; OutputInfo stays binary unchanged.
The authority is captured at actual discovery, gated by the live owned FD and
session activity at publication, and revalidated at brightness admission and
completion. Empty authority explicitly revokes prior association. Same-name
connectors on other GPUs never confer authority. Nested sessions have no native
authority; the controlled GTK fixture supplies a bounded, FD-verified synthetic
manifest only beside its explicit backlight-root override. The native receipt
refuses either override. The lit-output inventory does not establish
display power-save support. Unassociated legacy ACPI backlights retain the
existing global helper; they do not establish this interface's capability.
A VM with an actually empty kernel inventory must report false. Harmless dimming
disable and negative automatic-target reset succeed without eligible hardware.
Positive unsupported operations fail. Nonfinite targets are explicitly refused
by this bounded adapter; upstream JavaScript does not define the same explicit
error contract.

The associated controller shares user intent across UI, keys and policy calls.
Normalized zero maps to `max(1, max_brightness / 100)`, except actual raw
backlights with max_brightness &lt;99 use minimum zero, matching GNOME51's
small-range hardware rule. Values interpolate through the usable range. Global controls preserve monitor ratios,
including when all values are zero during the same controller lifetime. Dimming clips the effective level to the
live installed `idle-brightness` setting. Automatic brightness uses the GNOME
user-bias formula. Disabling either policy restores the user baseline after
exact actual readback. Policy changes do not emit a user-update signal.
External hardware changes cancel dimming before subsequent policy derivation.

The installed session requires GNOME Settings Daemon's power schemas for
`idle-brightness` and policy updates (`gnome-settings-daemon-common` on Debian,
`gnome-settings-daemon` on Arch). These are runtime package dependencies; the
controlled proof uses the same installed schema rather than a private substitute.

Each hardware transaction uses asynchronous logind calls with a two-second
call bound and exact device, range, output-membership and post-call readback
checks. Partial writes and refusals return failure; requested percentages are
never presented as observed values. Concurrent user requests are refused while
an owned transaction is pending; live idle-key changes coalesce to the latest
value and apply after completion. Individual backlight scalar reads and the
inventory are bounded; rejected inventory preserves the user baseline while
withholding capability. This does not claim blocking filesystem metadata calls
have a real-time deadline.

`G-BRIGHTNESS-CONTRACT` exercises the real session-bus adapter against an
explicitly synthetic associated sysfs/logind fixture: user baseline, dim/restore,
automatic bias/reset, live idle-key mutation/restoration, refused writes, exact
readback mismatch, nonfinite rejection and no policy user-update signals.
`V-BRIGHTNESS-CONTRACT` uses the actual native VM kernel inventory and original
shell owner PID/UID/start identity, requiring empty inventory, false capability,
unsupported positive operations and successful harmless resets. Neither proves
real panel luminance or physical logind permissions.

At the controlled post-`idle-brightness` restore boundary, sysfs readback can
precede completion of the owned asynchronous logind transaction. The proof
retries only the exact side-effect-free `brightness update already pending`
refusal, pacing attempts by up to 50ms within the same five-second absolute
deadline and 100-attempt cap. Every attempt keeps principal/signal verification
and its receipt; unrelated errors fail immediately and accepted operations are
never repeated. This admission pacing changes no device policy or assertion.

Display power saving is the compositor's: DisplayConfig `PowerSaveMode`
follows Mutter 51 (`crates/compositor/src/power_save.rs`). gsd's blank (3)
stops scanout and turns every CRTC off on hardware; its unblank (0) repaints
and modesets back; -1 is ignored. `G-POWER-SAVE-MODE` drives gsd 51's
dim → blank → unblank → undim sequence in the nested proof: the dim lowers
the controlled backlight, the blank stops frames while the pointer moves,
the unblank repaints and the undim restores the exact user baseline.
`D-POWER-SAVE` in `scripts/tuna-drm-smoke` blanks a locked session on vkms:
3 turns the connector off and the compositor's main loop all but sleeps
(Mutter's 100 ms dummy flip and the hidden windows' beat, #1122); 0 lights
the connector again with a full repaint of the still lock screen at once.

The power-save proof waits for an in-flight idle-brightness transaction
before both dimming and undimming. Only a
`brightness update already pending` refusal permits another admission
attempt, within the existing ten-second bound. Other errors fail immediately;
an accepted call must still complete its own transaction and satisfy the
unchanged backlight and scanout assertions.

Issue #355 remains open for physical hardware, connector association on other
backlight topologies, persistence across shell restart, cloned-monitor policy,
ambient sensor integration, the hardware CRTC disable, a session
gnome-settings-daemon power plugin (idle/suspend and battery/AC policy),
external service and shipped-image qualification. Two adapter behaviors
differ from GNOME Shell 51 and stay open: `idle-brightness` is followed live
(GNOME reads it once when the shell starts) and positive operations fail
without an associated backlight (GNOME accepts them).

Primary contracts and formulas: GNOME Shell 51.0
[`org.gnome.Shell.Brightness.xml`](https://github.com/GNOME/gnome-shell/blob/51.0/data/dbus-interfaces/org.gnome.Shell.Brightness.xml),
[`brightnessManager.js`](https://github.com/GNOME/gnome-shell/blob/51.0/js/misc/brightnessManager.js),
[`shellDBus.js`](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/shellDBus.js),
GNOME Settings 51.0
[`cc-power-panel.c`](https://github.com/GNOME/gnome-control-center/blob/51.0/panels/power/cc-power-panel.c),
GNOME Settings Daemon 51.0
[`gsd-power-manager.c`](https://github.com/GNOME/gnome-settings-daemon/blob/51.0/plugins/power/gsd-power-manager.c),
and Mutter 51.0
[`org.gnome.Mutter.DisplayConfig.xml`](https://github.com/GNOME/mutter/blob/51.0/data/dbus-interfaces/org.gnome.Mutter.DisplayConfig.xml),
[`meta-monitor-manager.c`](https://github.com/GNOME/mutter/blob/51.0/src/backends/meta-monitor-manager.c),
[`meta-monitor-manager-native.c`](https://github.com/GNOME/mutter/blob/51.0/src/backends/native/meta-monitor-manager-native.c)
and
[`meta-renderer-native.c`](https://github.com/GNOME/mutter/blob/51.0/src/backends/native/meta-renderer-native.c).

Protocol: control protocol 0.37 appends `NativeOutputInventory` after the
existing messages without changing `OutputInfo` or earlier indices. A peer
advertising a minor below 37 receives no native inventory and cannot derive
exact native backlight capability. The shared `tuna-backlight` crate holds the
bounded sysfs reads (inventory, scalar, readback, connector identity).
The default requested-level sysfs readback is distinct from optional
hardware-reported actual_brightness; no panel luminance claim.
