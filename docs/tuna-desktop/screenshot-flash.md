---
sidebar_position: 45
title: "screenshot flash"
---

The compositor consumes the `flash` argument of `Screenshot` and `ScreenshotWindow`, after the PNG has been saved successfully. `FlashArea` uses the same authenticated caller policy, rechecks that the session is unlocked on delivery, and rejects invalid output bounds using widened arithmetic.

The reference is [GNOME Shell 51 Flashspot](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/screenshot.js#L3225): white immediately, fading over 500 ms with out-quad. The shared motion preference scales that duration, retains the fade in reduced motion, and suppresses it with animations off. Locking clears feedback. At most 32 simultaneous feedback rectangles and screenshot completion replies are retained. A flashing screenshot completes its D-Bus reply when the fade ends; locking or disabling animations ends pending feedback promptly. `FlashArea` replies immediately after admission, matching the reference method.

Feedback is a separate output scene pass, above normal content and below the idle shield. Capture and screencast offscreen scenes leave this pass empty, so the feedback cannot enter the saved PNG or recording. Native damage signatures include the pass and its opacity commit metadata; removal also changes the scene signature. Rectangles are projected independently for each output.

## Verification scope

Three independent state tests passed: 1.0/0.25/absent at 0/250/500 ms, zero-duration and invalid geometry rejection, and bounded concurrent feedback with immediate clearing. This is not a runtime pixel receipt. The source still requires the guarded compositor build, actual authenticated D-Bus requests, output pixel measurements, false/failed/locked negative cases, and paired GNOME/native hardware qualification before this part of P-AN-10 can pass.

## Focused runtime proof

`scripts/tuna-screenshot-flash-proof --bundle <frozen-bundle> --artifacts <new-directory>` checks production D-Bus admission through a supervised proof caller and actual nested output pixels. It covers a white flash at start, out-quad midpoint, completion, saved-PNG isolation, delayed Screenshot replies, failed capture, FlashArea bounds, and unauthorized callers. Invalid frozen identities fail before private services start. A receipt records the exact source and running compositor bytes, then verifies owned process exits and runtime removal before writing assertions.

This fixture does not exercise the GTK screenshot UI, hardware scanout, cursor inclusion, locked/motion-off sessions, or a paired GNOME comparison. Those remain separate qualification work. The new combined source must pass its build and runtime proof before any success is claimed.
