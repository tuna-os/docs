---
sidebar_position: 20
title: "input capture"
---

Tuna Desktop serves `org.gnome.Mutter.InputCapture` (#1040), the private
interface xdg-desktop-portal-gnome's InputCapture portal drives for Input
Leap, Deskflow and other libei receivers. It follows mutter 51
(`meta-input-capture.c`, `meta-input-capture-session.c`,
`org.gnome.Mutter.InputCapture.xml`); code in
`crates/compositor/src/mutter/input_capture.rs`, `capture_eis.rs` and
`runtime/input_capture.rs`.

**Admission.** Only the authenticated installed portal backend may call
`CreateSession` (`Authority::admit_portal`): the same identity check as
capture, but not the shell PID. Every session method requires the session's
unique owner and is denied while locked (mutter's `check_permission` plus the
lock); `Close` needs only the owner. Signals go to the owner only. At most 64
sessions and 1024 barriers per session.

**Interface.** `SupportedCapabilities` is 3 (keyboard and pointer, as the XML
numbers them; touch is not captured). `CreateSession`'s capabilities are
accepted and, as in mutter, change nothing. `GetZones` returns a serial and
the logical monitors as `(width, height, x, y)`. `AddBarrier(serial, (x1, y1,
x2, y2))` checks, in mutter's order and with its messages: serial ("State out
of date", BadAddress), state ("Session already enabled"), then
`check_barrier`: axis-aligned, not a point, on exactly one monitor edge,
overlapping no monitor, and, for horizontal lines, not reaching past the
right end of the primary monitor's row. Ids are the lowest free from 1.
`ClearBarriers` works in any state. `Enable`, `Disable` ("Already enabled",
"Session not enabled"), `Release(a{sv})` ("Capture not active";
`cursor_position` `(dd)` warps the pointer there, clamped to the outputs),
`ConnectToEIS` and `Close` follow mutter. A monitor change bumps the serial,
disables the session and emits `ZonesChanged`.

**Capture.** After `Enable`, relative pointer motion from a physical device
that crosses a barrier outward activates the session: the crossing motion
still moves the pointer to the edge, `Activated(barrier_id, activation_id,
cursor_position)` reports the crossing point, and from then on pointer
motion, buttons, scroll and keys reach no client (the pointer stays put).
They go to the session's EIS receiver as mutter sends them: a "captured
relative pointer" (pointer, button, scroll; one region per zone) and a
"captured keyboard" (the current keymap, sealed), emulating with the
activation id as sequence; wheel notches as `scroll_discrete` in v120,
continuous scroll as `scroll` with `scroll_stop`. Touchpad swipes stay local,
as mutter's `process_event` passes gestures. A key or button pressed into a
capture is released into it, also after the capture ends; releases of
presses from before it stay local. Captured input still counts as user
activity for idle and auto-lock. `Release` lets the next motion pass the
barrier (mutter's released barrier state). A pointer constraint (locked
pointer) crosses nothing. Super+Shift+Escape (mutter's
`cancel-input-capture` default) disables the session once every captured
key and button is released.

**Ending.** `Release`, `Disable`, `Close`, the cancel shortcut, a monitor
change, lock and owner loss end a capture with `Deactivated`; lock and
owner loss close the session (`Closed`) within the 100 ms revocation scan,
and the compositor closes every session the moment it locks. Nothing is
captured, and no barrier activates, while locked. One EIS receiver per
session; a sender context is refused.

**Differences from mutter 51.** `Disabled` is emitted when the compositor
turns an enabled session off on its own (cancel shortcut, monitor change, an
EIS client binding neither pointer nor keyboard); mutter declares the signal
but never emits it, and the portal forwards it to the application as the
portal's `Disabled`. A barrier on no monitor edge is refused with "Barrier
not adjacent to any monitor edge". Captured-press counts restart with each
activation. Not implemented: the cursor is not hidden while capturing, the
session clipboard on the capture session (`org.gnome.Mutter.Clipboard` at
the session path), keymap changes during an EIS connection, absolute
pointers and tablets crossing barriers, and the configurable cancel
keybinding.

Tests: `cargo test -p tuna-compositor input_capture` runs the barrier,
state-machine, router and private-bus tests
(`mutter/input_capture_bus_tests.rs`, which drive a reis receiver client).
