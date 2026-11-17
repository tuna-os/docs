---
sidebar_position: 22
title: "keyboard input aids"
---

The GTK accessibility menu persists Sticky, Slow, Bounce, and Mouse Keys
in `org.gnome.desktop.a11y.keyboard`. GTK now sends that schema's aid
settings with the seat settings. The compositor filters local DRM and
nested backend events before shortcuts, lock input, and client delivery.
Remote desktop injection keeps its existing input path.

This restores the state machine and GTK confirmation from PR #549 to the
current runtime. Control protocol 0.34 appends the aid settings and toggle
notification. The integration coordinator must reconcile the reserved 0.33
cursor fields before qualifying a combined candidate; both peers ship together.

Aid roles come from the configured active-layout base keysym, including
modifier remaps. Physical keycodes identify held keys and delivered events;
their physical location does not determine whether they are a modifier or
keypad aid. ISO Level 3 Shift is not treated as a Sticky Keys modifier.
Before lock engagement and successful unlock, pending Slow Keys and Shift
timers are cancelled, retained synthetic modifier/button presses are released
to their current owner, and Mouse Keys movement stops. The same reset runs before keymap/options
replacement and input-source changes, while the old map is still active.
Repeat and unrelated preference updates keep the current map and holds. Settings continue to
apply to fresh input after the ownership change. State summaries expose no
key identities and are null while locked.

The reference is [Mutter 51 keyboard accessibility](https://gitlab.gnome.org/GNOME/mutter/-/blob/51.0/src/backends/native/meta-keyboard-a11y.c).
Its seat filter uses keysyms for modifier and keypad roles and processes
Sticky, Slow, Bounce, Toggle, Mouse Keys, and Shift shortcuts. Settings
timeout fields remain ignored, matching the original implementation's scope.

The retained real nested input proof gates are G-A11Y-STICKY,
G-A11Y-SHORTCUTS, G-A11Y-SLOW, G-A11Y-BOUNCE, and G-A11Y-MOUSEKEYS.
G-A11Y-KEYMAP checks a real GTK Control latch across repeat changes, release
on live map replacement, and a configured physical Caps-to-Control chord.
Focused regressions cover configured roles, remapped modifier locations,
nonmodifier replacements, and cancellation/release on lock ownership changes.
These checks still require exact-candidate CI. This document does not qualify
physical keyboards, installed DRM sessions, every XKB option, XWayland,
or rendered GNOME parity. Issue #350 and original PR #549 remain open.
