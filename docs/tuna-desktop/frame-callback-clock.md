---
sidebar_position: 17
title: "frame callback clock"
---

`wl_callback.done` timestamps now come from the compositor's existing
`CLOCK_MONOTONIC` presentation clock. A callback's time is independent of the
number of rendered frames, output refresh rate, and periods with no client
redraw. This changes the timestamp, not the backend's callback scheduling.

The wire probe in `crates/compositor/examples/frame_callback_clock.rs` creates
an actual SHM xdg-toplevel, requests 15 frame callbacks, and pauses its requests
for one second after callback 5. It records the received 32-bit timestamps and
client elapsed time. The existing scroll proof runs it before the browser
journey and retains `frame-callback-clock.log`. Total elapsed/callback drift
and the pause delta must each stay within 150 ms. Subtraction wraps at 32 bits;
the protocol does not require an absolute timestamp epoch.

The retained pre-correction package `8019c16641ebb9e42330306071e8224c31cea620`
(Arch artifact from CI run 37184167578) was tested in a private nested session
on Fedora 45 with GNOME 51 portal libraries. Its actual callback clock advanced
992 ms over 2,129 ms of client elapsed time. Across the one-second pause, it
advanced 560 ms over 1,064 ms. These measurements are in
[8019-baseline.csv](https://github.com/tuna-os/tuna-desktop/blob/main/docs/frame-callback-clock/8019-baseline.csv); the new probe's
thresholds reject that behavior.

The corrected candidate still requires its exact-head graphical CI result.
This test does not establish rendering latency, idle CPU improvement, or
GNOME performance parity.
