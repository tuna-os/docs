---
sidebar_position: 34
title: "portal service integration"
---

This guide is for contributors who add or change a D-Bus interface, a
desktop-portal backend interface, or a client of a system service. It
describes how the existing services are wired, the rules every new one
follows, how failures are handled and how each layer is tested. The
security reasoning behind the caller checks is in the
[security model](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md).

## Who owns what

Tuna Desktop replaces GNOME Shell and Mutter, not the rest of GNOME. Apps
keep talking to the stock `xdg-desktop-portal` frontend. The GNOME portal
backend (`xdg-desktop-portal-gnome`) keeps doing the consent UI. Tuna
Desktop serves the Mutter and GNOME Shell interfaces that backend and the
GNOME settings daemons call.

- **The compositor** (`crates/compositor`) serves interfaces that need
  compositor state or authority: outputs, windows, capture, input, idle
  time, the session manager:
  - `org.gnome.Mutter.ScreenCast`, `.RemoteDesktop`, `.DisplayConfig`,
    `.ServiceChannel` and `.ColorManager`, plus
    `org.gnome.SettingsDaemon.Color`: `mutter.rs`, `mutter/remote_desktop.rs`,
    `color_manager.rs`.
  - `org.gnome.Shell.Introspect` and the private `org.tuna.Introspect`
    (calls the GTK shell relays from `org.gnome.Shell`): `introspect.rs`.
  - `org.gnome.Shell.Screenshot` and the private `org.tuna.Screenshot`:
    `screenshot.rs`.
  - `org.gnome.Mutter.IdleMonitor`: `idle_monitor.rs`.
  - `org.gnome.SessionManager`: `session_manager.rs`.
  - `org.freedesktop.a11y.KeyboardMonitor`: `a11y_keyboard.rs`.
- **The GTK shell** (`crates/shell-gtk`) serves interfaces backed by UI or
  GSettings: `org.gnome.Shell` (`shell_dbus.rs`, which also relays
  `/org/gnome/Shell/Introspect` to the compositor as GNOME Shell serves it
  under that name: `introspect_forward.rs`), the screen-saver API
  (`screensaver.rs`), the polkit agent (`polkit.rs`) and the NetworkManager
  secret agent (`network_agent.rs`). It also consumes system services for
  quick settings (`services.rs`) and search providers (`providers.rs`).
- **Shared shell code** (`crates/shell-host`) has the zbus edges both
  shells reuse: `org.freedesktop.Notifications` (`intake.rs`) and Tuna's
  own portal backend `org.freedesktop.impl.portal.desktop.tuna`, which
  serves `Lockdown` and `Access` (`lockdown.rs`). The GTK shell runs that
  publisher from `shell-gtk/src/privacy_portal.rs`.
- **The portal routing** is packaged configuration:
  - `packaging/marlin/tuna-portals.conf` selects backends per interface:
    `gnome;gtk;` by default, `tuna` for `Lockdown`, `gnome` for ScreenCast
    and Screenshot, `gtk` for Access.
  - `share/xdg-desktop-portal/portals/tuna.portal` registers Tuna's own
    backend for the `Tuna` desktop.

  `packaging/arch/PKGBUILD` and `scripts/tuna-release` install both files.

## How a compositor service is wired

Every compositor service has the same shape; `screenshot.rs:255-294` is
the smallest complete example, and `mutter.rs:1211-1405` the largest.

1. **Own thread, own connection.** `start()` spawns a named thread. The
   thread builds a session connection with `zbus::block_on` (zbus 6 has
   no blocking API; its runtime keeps serving the connection after
   `block_on` returns) and serves each object with `serve_at`.
2. **Claim the name without queueing.** The thread calls
   `request_name_with_flags(NAME, DO_NOT_QUEUE)`. On anything but
   `PrimaryOwner` it logs `<name> is taken; … off` and the service stays
   down. Nested inside a real GNOME session, GNOME already owns these
   names, so Tuna Desktop's copies stay off and the host keeps working.
3. **Never block the event loop.** D-Bus methods do not touch compositor
   state directly. They either read a shared snapshot that the runtime
   keeps current (`mutter::Outputs`, `mutter::Windows`, the `*Share` types),
   or send a request over a `calloop::channel` that the runtime has
   registered with `insert_source` (`runtime.rs:1219-1308`).
4. **Bound every reply.** A method that needs an answer from the event
   loop passes a `std::sync::mpsc` sender with the request and waits with
   `recv_timeout` (`screenshot.rs:19`, `112-118`). If the loop is gone, the
   method returns `Failed`. It never waits forever.
5. **Authorize per call, from the message header.** Take
   `#[zbus(header)]` and `#[zbus(connection)]` and decide using the bus's
   own credentials, not a name or an argument the caller supplies:
   - `Authority::admit` for capture-class calls. It requires the shell PID
     or the authenticated installed portal, and the session must be
     unlocked.
   - `Authority::authenticate_caller` when the locked result differs
     (Screenshot returns false, not `AccessDenied`).
   - `admit_service_connection` / `admit_connection` for display
     bootstrap.
   - An owner check (`owns_session`) on every call after creation.

   See `capture_security.rs:108-277`.
6. **Revoke from the service thread.** Long-lived grants are rechecked
   on a timer, and the service tears them down when the owner, the trusted
   name, the shell PID or the unlocked state goes away (`mutter.rs:1339-1392`).

Mirror the upstream interface exactly: same names, signatures, property
types and signal order as the pinned GNOME 51 source. Name the upstream
file in the module docs; `session_manager.rs:1-30` and `introspect.rs:1-9`
show the expected level of provenance.

## How shell services are wired

**GTK shell (gio).** Interfaces are exported with `gio::bus_own_name` on
the GLib main loop (`shell_dbus.rs:422`, `screensaver.rs:60`). Caller
checks run in the method handler. `shell_dbus.rs:372-396` checks the
sender against the owners of `ALLOWED_SENDERS`. `network_agent.rs:700-709`
answers only NetworkManager's current unique owner.

**System service clients.** `services.rs` is the pattern:

- every call is asynchronous on the GLib main loop;
- every call is bounded by `CALL_TIMEOUT_MS` (2000 ms);
- probes use `gio::DBusCallFlags::NO_AUTO_START`;
- a quick-settings tile whose daemon is not on the bus is hidden, as
  GNOME hides it (`services.rs:1-16`, `29`, `150-160`).

Search providers additionally cancel a query when a newer one starts
(`providers.rs:1-13`).

**Thunderbolt (`thunderbolt.rs`).** Like GNOME Shell's
`status/thunderbolt.js`, the shell depends on boltd
(`org.freedesktop.bolt` on the system bus, normally started by udev with
`bolt.service`) for Thunderbolt devices. It enrols a newly connected
device with `EnrollDevice(uid, "default", "none")` only when the session
is unlocked and polkit already allows `org.freedesktop.bolt.enroll`;
otherwise it posts GNOME's "Unknown" or "Unauthorized Thunderbolt
device" notice. Without boltd the proxy has no owner, so nothing is
enrolled, shown or logged.

**Shared zbus edges (`shell-host`).** `NotificationBus` and `LockdownBus`
expose `ensure()`, which tries to connect and own the name, and `poll()`.
The owner calls them from its periodic tick. "No bus" and "name taken"
both read as "no service", never as a hang (`intake.rs:1-19`,
`lockdown.rs:1-20`). Method calls arrive on zbus worker threads. Anything
that needs GSettings is handed to the owner's GLib context rather than
touching gio from a zbus thread.

**The shell never uses the portal itself.** It is part of the desktop the
GNOME backend serves, and it starts before `graphical-session.target`.
`portal_opt_out.rs` explains why GTK's own portal use is disabled
(dbus-daemon would block startup for the whole D-Bus timeout).
`session_services.rs:282-286` covers the matching ordering rule for the
graphical target.

## Adding a new service: checklist

1. **Pick the owner.** Put it in the compositor if it needs compositor
   state, input, outputs or capture authority. Put it in the GTK shell if
   it is UI, a dialog or GSettings-backed. Put zbus code that both shells
   need in `shell-host`.
2. **Pin the contract.** Link the upstream XML or source at the GNOME 51
   tag. Reproduce its caller policy (GNOME's `DBusSenderChecker`, portal
   only, owner only) unless you record why you differ.
3. **Follow the wiring above.** Use a dedicated thread or the GLib main
   loop, `DoNotQueue` name ownership that degrades to "off", snapshots or
   channels into the event loop, and bounded replies.
4. **Authorize.** Never treat a well-known bus name as identity for
   anything that grants capture, input or window contents. Use
   `capture_security::Authority`, or extend `ServiceClient` with the
   installed executable paths if a new GNOME provider must be admitted
   (`capture_security.rs:9-40`). Deny while locked unless the upstream
   contract says otherwise, and document the locked result.
5. **Bound resources.** Cap registries and per-caller objects. Existing
   caps: 256 ScreenCast sessions, 64 streams per session and 64 remote
   grants ([capture security](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md),
   [remote desktop](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md)); 32 live service connections
   ([service channel](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md)). Remove objects from the
   object server when their owner leaves.
6. **Portal backend interfaces.** If Tuna Desktop implements an
   `org.freedesktop.impl.portal.*` interface itself, add it to
   `tuna.portal`'s `Interfaces=` and route it in `tuna-portals.conf`. Both
   files are installed by the packaging listed above.
7. **Unsafe modes.** Only add a GNOME-style "unrestricted" switch for
   harnesses, name it `TUNA_<SERVICE>_UNRESTRICTED`, and keep it out of the
   packaged session. Existing ones: `TUNA_INTROSPECT_UNRESTRICTED`,
   `TUNA_SHELL_DBUS_UNRESTRICTED`.
8. **Document and track.** Add or update the parity ledger row through the
   normal process, plus a deep-dive page for anything security relevant.

## Failure handling

| Situation | Required behaviour | Example |
|---|---|---|
| No session bus | Log once, leave the service off, keep the session running | `mutter.rs:1282-1286`, `screenshot.rs:275-279` |
| Name already owned (nested under GNOME, a real daemon) | Log `… is taken; … off`. Do not queue for the name. Features that depend on it stay off. | `mutter.rs:1288-1338` |
| Daemon absent or stuck | Bounded asynchronous call. Hide the affected UI. Never block the main loop or the compositor. | `services.rs:1-16`, `29` |
| Event loop does not answer | `recv_timeout`, then `Failed` | `screenshot.rs:112-118` |
| Caller disconnects | Revoke grants and drop its objects. Inhibitors are removed when the caller's name vanishes. | `mutter.rs:1339-1392`, `session_manager.rs:1-30` |
| Locked session | Deny or return the documented locked result. Revoke live capture. | `capture_security.rs:170-204`, `runtime.rs:1661-1687` |
| Portal activation on dbus-daemon | Do not let the shell trigger portal activation during startup | `shell-gtk/src/portal_opt_out.rs` |

## Testing

**Unit and integration tests against a private bus.** Tests start their
own `dbus-daemon --session --nofork --print-address=1`, connect explicitly
to the printed address, and kill the daemon on drop. Look at the
`TestBus` helpers in `crates/compositor/src/session_manager.rs:946-985`,
`fprintd.rs:2166-2210` and `color_manager/tests.rs:354-390`, and the
`private_bus()` helpers in `crates/shell-host/src/intake.rs:500` and
`lockdown.rs:416`. Serve a stub of the remote service with
`#[zbus::interface]` on that bus (for example `FakeColord` in
`color_manager/tests.rs`). Cover at least these cases:

- the happy path;
- a caller that is not authorized, including a forged well-known name;
- owner disconnect and revocation;
- the locked session;
- an absent daemon and a stalled daemon (`fprintd.rs:2653-2690` bounds both).

The `shell-host` live tests print `SKIP …: no usable dbus-daemon on PATH`
and return when no daemon can start. The CI `check` job runs all of them
with `cargo test --workspace`. To run one module locally (the build needs
the [prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites)):

```sh
cargo test -p tuna-compositor --lib session_manager::
cargo test -p tuna-shell-host --lib lockdown::
```

GTK-side bus tests need a display and a session bus, as CI runs them:

```sh
env -u WAYLAND_DISPLAY -u WAYLAND_SOCKET dbus-run-session -- xvfb-run -a env GDK_BACKEND=x11 cargo test --locked -p tuna-shell-gtk --test lockdown -- --include-ignored --test-threads=1
```

**Real portal stack.** The `portal-security` CI lane runs the packaged
compositor and GTK shell against the installed GNOME 51 portal frontend,
backend and Nautilus in a container. It covers consent Cancel/Share, frame
consumption, owner Close, disconnect and lock revocation, and forged-name
denial. Its driver needs an unpacked Arch package and podman:

```sh
scripts/tuna-portal-security --candidate DIR --out DIR
```

`DIR` for `--candidate` must contain `usr/bin/tuna-compositor` and
`usr/bin/tuna-shell-gtk`; `--out` must be a fresh directory
(`scripts/tuna-portal-security:4-11`). Changes under
`tests/portal-reference/` or to that script select the lane
automatically (`scripts/ci-select-lanes`). Remote desktop has the
matching `remote-security` lane ([remote desktop](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md)).
Retain current-head evidence before claiming a portal journey works; the
service channel page records how earlier claims were qualified.

## References

- [Security model](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md)
- [Capture admission and revocation](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md)
- [GNOME provider service channel](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md)
- [Remote desktop](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md), [Screenshot consent](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-screenshot-consent.md)
- [Privacy device enforcement](https://github.com/tuna-os/tuna-desktop/blob/main/docs/privacy-enforcement.md),
  [NetworkManager secret agent](https://github.com/tuna-os/tuna-desktop/blob/main/docs/network-agent.md)
- [ADR 0005: control-socket peer authentication](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md)
