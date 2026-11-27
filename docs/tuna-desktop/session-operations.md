---
sidebar_position: 44
title: "session operations"
---

How a Tuna Desktop session starts, runs and ends, where its logs go, and how
to inspect or recover a running session. For problems you hit before a
session is running (builds, packages, the login screen), see
[troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md). Every variable named here is in the
[environment variable reference](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md).

## The processes

A session is one long-lived compositor and a shell it supervises:

| Process | What it is | Started by |
|---|---|---|
| `tuna-session` | Launcher. Finds `tuna-compositor` beside itself (else on `PATH`), chooses the shell, sets `XDG_SESSION_TYPE=wayland` and, if unset, `XDG_CURRENT_DESKTOP=Tuna:GNOME`, then replaces itself with `tuna-compositor --shell-bin <shell> --startup-overview`. It does not stay running. | GDM, from `share/wayland-sessions/tuna.desktop` |
| `tuna-compositor` | The Smithay compositor. It owns outputs, input, focus, windows, workspaces, the lock state and the GNOME D-Bus services it serves. Its exit ends the session. | `tuna-session`, or you |
| `tuna-shell-gtk` (or the legacy `tuna-shell-host`) | The panel, overview, app grid, quick settings, notifications and the lock screen's drawing and password entry. An ordinary Wayland client of the compositor. | the compositor, as a supervised child |
| `tuna-compositor --internal-pam-conversation` | A private, short-lived helper that runs one PAM conversation for the lock screen. | the compositor, at each unlock attempt |
| `tuna-ibus-bridge`, `ibus-x11` | Input methods, when IBus is installed. | the compositor |
| `ibus-daemon` | The IBus daemon, with `--panel disable` (the shell is IBus's panel). Exactly one runs. | in a hardware session, GNOME's `IBus Daemon for GNOME` user unit (`org.freedesktop.IBus.session.GNOME.service`), which systemd stops with the session; only where that unit does not exist, and in nested sessions, the IBus bridge, as its own child, which the compositor retires at session end |
| `Xwayland` | X11 applications, when it is installed. | the compositor |
| `orca` | The screen reader, when it is turned on. | the compositor |

Sources: `crates/compositor/src/bin/tuna-session.rs`,
`crates/compositor/src/runtime.rs:396-431` (shell choice),
`crates/compositor/src/supervise.rs:420-435` (shell spawn),
`crates/compositor/src/pam_helper.rs:17`, `crates/compositor/src/ime.rs`,
`crates/compositor/src/orca.rs:333`.

### What the compositor and the shell each own

The split is described in [the architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#process-and-authority-boundaries).
In practice:

- **The shell can crash without ending the session.** Application windows stay
  mapped. The compositor covers the screen with its own recovery overlay and
  restarts the shell, which reconnects and receives the full window list again.
- **The compositor cannot.** If it exits or crashes, every application loses
  its display and the session ends.
- **The lock lives in the compositor.** The shell only draws the lock screen
  and collects the password; the compositor decides whether the session is
  locked and checks the password through PAM. If the shell dies while the
  screen is locked, the screen stays covered until a new shell draws the lock
  screen again (`crates/compositor/src/lock.rs:8-12`,
  `crates/compositor/src/runtime.rs:4852-4865`).

The shell talks to the compositor over a private control socket,
`$XDG_RUNTIME_DIR/tuna-<socket>.control`, whose path it gets from
`TUNA_CONTROL_SOCKET` (`crates/compositor/src/runtime.rs:853-861`,
`crates/compositor/src/supervise.rs:433`).

## Starting a session

### From GDM

Choose **Tuna Desktop** in the session menu on the login screen
([install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#logging-in-through-gdm)). GDM runs `tuna-session`.
With no host display, `--backend auto` picks the DRM/KMS backend, which takes
the seat from logind.

On the hardware backend the compositor then, in order
(`crates/compositor/src/session_services.rs:281-443`):

1. imports `WAYLAND_DISPLAY`, `XDG_CURRENT_DESKTOP`, `XDG_SESSION_TYPE` and an
   empty `DISPLAY` into the systemd user manager and the D-Bus activation
   environment, and logs `session services: display environment imported`;
2. starts `tuna-session.target` (`share/systemd/user/tuna-session.target`),
   which binds `graphical-session.target` and pulls in GNOME Settings Daemon's
   plugins through `gnome-session.target`, and logs `session services:
   graphical target active`;
3. holds GNOME's session leader FIFO (`$XDG_RUNTIME_DIR/gnome-session-leader-fifo`),
   so those targets stop when the compositor exits;
4. restarts `xdg-desktop-portal.service` so the portal picks up the session
   (`session services: portals refreshed`);
5. waits for the shell to own `org.gnome.Shell` on the session bus, then tells
   GDM the session and display are ready (`session services: GDM session and
   display registered`). After 15 seconds without the shell it logs `shell bus
   name not ready; still waiting` and keeps waiting.

A nested session skips all of this and never changes your host session's
environment.

### From a text console

Log in on a virtual terminal and run:

```sh
tuna-session > ~/tuna-session.log 2>&1
```

The compositor takes over the display, so its output would otherwise be lost.
Ctrl+Alt+F1 … F12 switch virtual terminals (`crates/compositor/src/drm.rs:1322-1337`).
The seat must come from logind or seatd.

### Nested, inside your current desktop

For development, from a checkout:

```sh
scripts/tuna-nested run
```

See the [nested session guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md). You can also run the
binaries directly. `--backend winit` forces a window even where `auto` would
choose DRM/KMS:

```sh
tuna-compositor --backend winit --socket tuna-test --shell-bin tuna-shell-gtk
```

`tuna-compositor --help` lists the other options.

## Stopping a session

- **Log Out** in the shell's power menu sends `SIGTERM` to the compositor
  (`crates/shell-gtk/src/power.rs:273-285`).
- The compositor shuts down cleanly on `SIGTERM`, `SIGINT` and `SIGHUP`: it
  stops the shell and its other children, stops `tuna-session.target`, starts
  `gnome-session-shutdown.target` and releases the leader FIFO, then logs
  `shutdown after N frames, N clients, N shell restarts`
  (`crates/compositor/src/runtime.rs:7794-7800`,
  `crates/compositor/src/session_services.rs:101-116`). GDM then shows the
  login screen again.
- If the session no longer responds, end it from another virtual terminal or
  over SSH. Find its ID, then terminate it:

  ```sh
  loginctl list-sessions
  loginctl terminate-session <ID>
  ```

Power Off, Restart and Suspend in the power menu go to logind. They are only
offered in a hardware session: in a nested one (`TUNA_SESSION_KIND` other than
`hardware`) they would act on your host machine
(`crates/shell-gtk/src/power.rs:158-170`, `:202-205`).

**Switch User…** sits under Log Out in a hardware session's power menu, as in
GNOME 51. It shows only when AccountsService reports more than one user
(`HasMultipleUsers`), your graphical session's logind seat can hold several
sessions (`CanMultiSession`), the session is not locked, and
`org.gnome.desktop.lockdown disable-user-switching` is off. Choosing it locks
the screen (unless `disable-lock-screen` is set, as in GNOME), then, as libgdm
does, activates GDM's login screen already on the seat or, on `seat0`, asks GDM
for a new one (`CreateTransientDisplay`). If that fails, the shell logs
`switch user failed` and you stay in your session, still locked
(`crates/shell-gtk/src/user_switch.rs`).

## Logs

The compositor and the shells print plain lines to standard error. Every line
starts with the program's name: `tuna-compositor:`, `tuna-shell-gtk:`,
`tuna-shell-host:`, `tuna-ibus-bridge:`. They log codes, counts and service
names, never window titles, typed text or passwords. There are no log levels;
the [trace variables](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md#debugging-and-trace-output) add more
output for one area at a time.

| Session | Where the output goes |
|---|---|
| `scripts/tuna-nested run` | `nested.log` in the artifacts directory, `$XDG_STATE_HOME/tuna-nested/<socket>/` by default |
| GDM | The systemd journal, under your user ID |
| Text console | Wherever you redirected it |

To read the current boot's Tuna Desktop lines from the journal, as the Corral
journey does (`scripts/tuna-corral-journey`, `Guest.journal`):

```sh
journalctl -b _UID=$(id -u) -o cat --no-pager | grep -E '^tuna-'
```

Add `-f` to follow it live. Processes the compositor starts, such as the IBus
bridge, write to the same stream. Xwayland's own output is discarded unless
`TUNA_XWAYLAND_DEBUG=1` is set.

Lines worth knowing (see also the
[nested log table](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md#reading-nestedlog)):

| Line | Meaning |
|---|---|
| `tuna-compositor: drm: output ...` | The hardware backend lit an output. The Marlin VM lane requires this line (`V-DRM`). |
| `tuna-shell-gtk: keybindings: N grabs, ...` | The GTK shell finished starting and registered its keyboard shortcuts. |
| `tuna-compositor: shell supervision: ShellExited { code: ... }` | The shell exited. `code: None` means a signal killed it. |
| `tuna-compositor: shell supervision: RestartScheduled { delay_ms: N }` | It will be restarted after `N` ms. |
| `tuna-compositor: shell supervision: BudgetExhausted` | It crashed too often and will not be restarted automatically. |
| `tuna-compositor: logind session unavailable: ...` | The compositor could not find its logind session, so `loginctl lock-session`/`unlock-session` and the locked hint do not work. |
| `tuna-compositor: lock client left while locked; staying locked` | The shell went away during a lock. The session stays locked. |
| `tuna-compositor: settings upgrade blocked (...)` | The startup guard refused to touch a settings directory. See [troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md#settings-upgrade-blocked). |
| `... panicked at ...` | A Rust panic. Re-run with `RUST_BACKTRACE=1` in the environment for a backtrace. |

### Session state snapshot

For deeper inspection, start the compositor with `TUNA_COMPOSITOR_STATE` set
to an absolute path. It then keeps a JSON snapshot of its state there:
windows, focus, workspaces, overview, lock, keyboard, input devices and the
cost of the last frame. It is meant for proofs, but it works in any session:

```sh
TUNA_COMPOSITOR_STATE=/tmp/tuna-state.json scripts/tuna-nested run
python3 -m json.tool /tmp/tuna-state.json
```

## Restarting the shell

The compositor restarts a shell that exits, up to five times per compositor
run, waiting 250 ms, 500 ms, 1 s, 2 s and then 4 s before each attempt
(`crates/compositor/src/supervise.rs:77-116`). While the shell is down the
compositor shows its recovery overlay, a list of the open windows. Up and Down
move the selection, Enter refreshes the list, R restarts the shell and refills
the restart budget, and Esc hides the overlay
(`crates/compositor/src/overlay.rs:69-105`, `crates/compositor/src/runtime.rs:2254-2265`).

To restart the shell yourself, for example after installing a new build, kill
it and let the compositor start it again. Each kill uses one of the five
restarts:

```sh
pkill -u "$USER" -x tuna-shell-gtk
```

In a nested session, `scripts/tuna-nested kill-shell --socket <socket>` kills
that session's shell only; the `pkill` above would also kill the shell of a
hardware session you are logged into.

## Lock screen

The session locks after five minutes without input, on Super+L, on
`loginctl lock-session`, and before suspend. The compositor checks the
password with the PAM service `tuna-lock`, installed as `/etc/pam.d/tuna-lock`
(`share/pam.d/tuna-lock`), which includes your distribution's `login` stack.
Fingerprint unlock goes through fprintd when a reader and an enrolled finger
are present, with its own PAM service `tuna-lock-fingerprint`, installed as
`/etc/pam.d/tuna-lock-fingerprint`: `pam_fprintd` plus the `login` account
stack, like GDM's `gdm-fingerprint`.

### When the password is not accepted

1. Check the service file exists. Without it PAM uses the `other` service,
   which denies everything on most distributions:

   ```sh
   ls -l /etc/pam.d/tuna-lock
   ```

   A source install must copy it from `share/pam.d/tuna-lock`
   ([install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#logging-in-through-gdm)).
2. The lock screen authenticates `$LOGNAME` (else `$USER`) from the
   compositor's environment (`crates/compositor/src/unlock.rs:70-77`).
3. Each attempt has 10 seconds; a PAM stack that hangs longer is treated as a
   failure (`crates/compositor/src/pam.rs:31-32`).
4. For more detail, reproduce with `TUNA_LOCK_TRACE=1` in the compositor's
   environment. It logs each authentication attempt's lifecycle, never the
   password.

To test a different PAM stack without touching `tuna-lock`, set
`TUNA_PAM_SERVICE` to another service name.

### When the fingerprint is not accepted

Check `/etc/pam.d/tuna-lock-fingerprint` exists (a source install copies it
from `share/pam.d/tuna-lock-fingerprint`) and that `pam_fprintd.so` is
installed (`libpam-fprintd` on Debian and Ubuntu, `fprintd` on Arch). Without
either, the finger is refused and the password still unlocks.
`TUNA_PAM_FINGERPRINT_SERVICE` names a different service for fingerprint
unlock.

### Getting out of a stuck lock screen

In a hardware session the compositor follows logind like GNOME Shell does
(`crates/compositor/src/logind_session.rs`). From another virtual terminal
(Ctrl+Alt+F3, for example) or over SSH, as the same user or root:

```sh
loginctl list-sessions
loginctl unlock-session <ID>
```

`loginctl show-session <ID> -p LockedHint` shows whether the compositor thinks
the session is locked. If unlocking does not help, end the session with
`loginctl terminate-session <ID>`; applications in it are closed.

A nested session has no logind session of its own. Stop its compositor
instead (Ctrl+C in the terminal running `scripts/tuna-nested run`).

## Attaching a debugger

Attaching to the compositor freezes the whole display, so do it from another
virtual terminal or over SSH, never from inside the session. Attaching to the
shell freezes only the panel and overview.

```sh
gdb -p "$(pgrep -x tuna-compositor)"
gdb -p "$(pgrep -x tuna-shell-gtk)"
```

On distributions that restrict `ptrace` (Ubuntu's default
`kernel.yama.ptrace_scope=1`), run `gdb` with `sudo`. `thread apply all bt`
prints every thread's stack. In a nested session,
`scripts/tuna-nested shell-pid --socket <socket>` prints the shell's PID.

## Watching resources

```sh
ps -o pid,rss,pcpu,etime,comm -C tuna-compositor,tuna-shell-gtk
```

For measurements:

- `TUNA_PERF_TRACE=1` makes the compositor write overview action-to-scanout
  timings to the journal, which `journalctl -b -t tuna-perf-native` shows.
- `frame_cost` in the `TUNA_COMPOSITOR_STATE` snapshot reports what the last
  frame drew and culled ([frame cost](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#frame-cost)).
- `scripts/tuna-stress` runs the bounded nested stress workload and records
  memory and file descriptor growth ([nested stress and torture suite](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-stress-and-torture-suite)).
- [Actual guest endurance evidence](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md) describes the long-running VM
  soak.

## On TunaOS Marlin

- The preview image is installed with `bootc switch`
  ([packaging](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md#tunaos-marlin)). bootc keeps the
  previous deployment; `sudo bootc rollback` boots it next time, which is the
  recovery path if a Tuna Desktop image will not log in.
- The image also ships GNOME. Choose it on the login screen to get a working
  desktop while you debug Tuna Desktop.
- Hardware support is proven in CI on virtual KMS and in Marlin VMs; physical
  GPUs are not qualified yet ([install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md)). Report what you see
  on real hardware with the details in
  [filing a bug](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md#filing-a-bug).
