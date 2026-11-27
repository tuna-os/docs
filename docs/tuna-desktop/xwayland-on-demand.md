---
sidebar_position: 63
title: "xwayland on demand"
---

The compositor reserves a display lock and both pathname/abstract X11 listening
sockets when X11 compatibility is enabled. It advertises DISPLAY to applications
before starting a process. Native Wayland startup remains idle. Read readiness
on a listening socket records the first X11 need without accepting its queued
connection; the exact socket owner is handed to Smithay to start XWayland.

The version remains Smithay 0.7.0, with additive APIs documented in
third-party/smithay/ROOST-PATCH.md. Internal XWaylandClientData and process
construction stay within Smithay. No fork or new upstream version is used.

Advertised display and actual X11 window-manager readiness are separate. Helpers
that connect to X11, including icon readers, must wait for window-manager
readiness instead of treating DISPLAY advertisement as permission to connect.
The native IBus bridge remains available from startup. Its XIM helper is a
separate X11 client: it starts only after the window manager is ready and is
stopped and reaped on server loss before a fresh helper can start. Native bridge,
address probe and supervised shell discard inherited IBUS_ADDRESS; only the XIM
helper receives the address discovered for the private Wayland-named bus.

On server/manager failure the compositor removes the old source, compatibility
windows and client, then retries on the same display with the existing bounded
restart budget (initial attempt plus three retries, 500 ms exponential backoff
capped at 5 s). Native windows keep their IDs. Graceful shutdown drops owned
listening sockets and display lock. Missing XWayland/socket preparation is
non-fatal to the native session.

The GTK proof requires native startup without an owned XWayland process,
first-client mapping through the reserved sockets, real process termination,
compatibility-window cleanup and same-display reconnect while native IDs stay
unchanged, then socket/lock cleanup at graceful shutdown. These gates passed
on candidate `3719d3f39a657e6f447c000cff94e23fec41d710` in
[CI 37192378020](https://github.com/tuna-os/tuna-desktop/actions/runs/37192378020),
along with package and Marlin VM checks; all 13 current-head checks succeeded
before merge. Physical GPU/VT behavior is separate.
