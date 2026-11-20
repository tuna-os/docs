---
sidebar_position: 8
title: "session and locking"
---

This page tells how a brussels session starts and how it locks. brussels is
Wayland-only. It does not ship an X11 session, the xfwm4 window manager, or
LightDM.

## Session start

1. GDM shows the sessions in `/usr/share/wayland-sessions`. The default
   session is `xfwl4`.
2. `xfwl4.desktop` comes from the xfwl4 source tree without changes. It runs
   `xfwl4 --backend=tty`.
3. xfwl4 starts `xfce4-session`. xfce4-session starts the panel, the desktop,
   the settings daemon, and the other session clients.

xfce4-session also has a `xfce-wayland.desktop` entry. That entry runs
`startxfce4 --wayland`, and the default compositor for that command is labwc.
brussels does not ship labwc, so the image removes that entry.

## Display manager

The xfwl4 documentation does not ask for a specific display manager. Any
display manager that starts the sessions in `wayland-sessions` can start
xfwl4. brussels keeps GDM, which comes from the gnomeos parent image. GDM
works without changes.

The repository also builds greetd and ReGreet. They are not enabled. ADR 0001
records the plan to change to greetd.

## Screen lock

xfwl4 4.21.1 has the `ext-session-lock-v1` protocol and the
`ext-idle-notify-v1` protocol. A Wayland screen locker uses these protocols.

The XFCE screen locker is xfce4-screensaver. Its 4.20 releases have a Wayland
back end that uses `ext-session-lock-v1`. Upstream builds that back end only
when the build sets `-Dwayland=enabled`. brussels builds xfce4-screensaver
4.20.2 with the Wayland back end and without the X11 back end.

The Wayland back end needs libwlembed. libwlembed has no release tag, so the
image uses a fixed commit.

xfce4-screensaver starts with the session from its autostart entry.
`xflock4` and the panel lock action send a lock request to xfce4-session.
xfce4-session then calls the `LockCommand` property, if it has a value.
If not, it sends the request to xfce4-screensaver through D-Bus.

### Status

The Wayland back end is experimental upstream. Nobody has tested it on a
brussels system yet. If the lock does not work, the fallback is a
locker from outside XFCE that uses `ext-session-lock-v1`, for example
gtklock or swaylock. To use the fallback, set the
`/general/LockCommand` property of the `xfce4-session` channel.
