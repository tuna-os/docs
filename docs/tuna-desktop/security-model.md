---
sidebar_position: 46
title: "security model"
---

This is the entry point for security review of Tuna Desktop. It collects
the trust boundaries, the properties the design enforces and the gaps that
remain. Component deep dives are linked from each section. Report
vulnerabilities through [SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md), not public issues.

**Status.** Tuna Desktop is a developer preview. The architecture's first
delivery tier (nested developer preview) is explicitly "not a secure
daily-driver session" ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#delivery-tiers)). The
[ADR register](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md#decision-register) still lists the same-UID
threat model, trusted lock/portal identity and the production lock/auth and
portal/capture grant lifecycle as 1.0 release blockers.
[ADR 0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md) and
[ADR 0011](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0011-lock-auth-and-capture-grant-lifecycle.md) propose them;
the owner has not decided. Everything below describes what the code on
`main` does today. Planned behaviour is labelled **target**.

## What is protected

- **Screen contents.** Pixels of other applications, through capture,
  screenshots, screen casts and remote desktop.
- **Input.** Keystrokes and pointer events belong to the focused client.
  Nothing may inject input for another client without consent.
- **The lock.** While the session is locked, no application surface is
  shown or receives input, and only the session user's own credentials
  unlock it.
- **Window metadata.** Window titles and application identities are
  private. They are published only to the supervised shell (its window
  list and `ext_foreign_toplevel_list_v1`) and the portal's picker.
- **Shell authority.** Commands sent over the shell control socket can
  focus or close windows, drive the overview and engage the lock. Only the
  supervised shell may hold a session on that socket.

## Adversaries in scope

1. **Ordinary Wayland clients**, sandboxed or not. They may send arbitrary
   protocol requests, claim any app ID or title, and connect and disconnect
   at will. Through Wayland they must not capture the screen, type into
   other clients, see other windows' contents, place shell layers or get
   past the lock. What a native client can do outside Wayland is covered
   under [Out of scope](#out-of-scope).
2. **Sandboxed and non-native session-bus callers.** Flatpak and other
   sandboxed applications reach the session bus through a filtering proxy,
   and other callers may not be native processes of the session user. They
   may call the compositor's and shell's D-Bus interfaces they can reach,
   and may claim well-known names that nobody owns yet. Capture, remote
   input and window introspection must not be granted on the strength of a
   claimed name. Native same-user processes are out of scope
   ([ADR 0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md)).
3. **Processes of other users.** They must not reach the control socket or
   any per-session state.
4. **A person at a locked screen.** They can type and click on the lock
   surface. Lock failure must never expose application surfaces or send
   input to them.
5. **Hostile extension scripts** (see [extensions](https://github.com/tuna-os/tuna-desktop/blob/main/docs/extensions.md)). They must
   not reach the filesystem, network, processes, input or window contents.
6. **A crashing, hung or malformed shell.** Shell faults must not take
   applications down or block the compositor. A malformed control stream
   must not crash or stall the compositor.

## Out of scope

- **Native same-UID processes.** A native process running as the session
  user can kill the portal or gnome-remote-desktop and start the genuine,
  root-owned binary with `LD_PRELOAD`. That needs no `ptrace`, and Yama
  does not stop it. Every identity check then passes, and the process gets
  screen capture and remote input with no consent. No check of process
  attributes can prevent this under one UID; GNOME 51 makes the same choice
  with weaker checks
  ([ADR 0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md#residual-risks), R1).
  ADR 0005 likewise records that a process able to `ptrace` the shell
  "still wins; that is the platform's same-uid boundary, not something a
  socket can fix"
  ([ADR 0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md#consequences)).
  The same applies to a same-user process that edits the user's login
  environment, configuration, autostart entries or extension directory.
- **root, the kernel, GPU drivers and firmware.** Executable-identity
  checks trust root-owned, non-writable installed binaries (see below), so
  a root compromise defeats them by design.
- **Platform services**: GDM, logind, PAM and its modules, polkit and its
  setuid helper, NetworkManager, BlueZ, fprintd, PipeWire,
  xdg-desktop-portal and the GNOME portal backend. Tuna Desktop
  authenticates who it talks to but does not defend against these
  components misbehaving.
- **Physical attacks beyond the lock screen**: DMA, cold boot and similar.
- **Network attackers.** The compositor and shell expose no network
  listener. Network-facing remote desktop belongs to the portal/daemon
  stack; see [Remote desktop](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md).
- **GNOME Shell extensions and private Mutter APIs.** They are not loaded or
  supported ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#product-decision)).

## Components and trust boundaries

| Component | Trusted for | How the compositor recognises it | Code |
|---|---|---|---|
| Kernel, logind, libseat | Device access, session activity | Platform | `crates/compositor/src/drm.rs`, `logind_session.rs` |
| GDM | Login authentication; starts `tuna-session` from `share/wayland-sessions/tuna.desktop` | Platform. Since #866 GDM is the only supported login path. Tuna Desktop ships no greeter. | `share/wayland-sessions/tuna.desktop` |
| `tuna-compositor` | Everything below. Owns focus, stacking, input routing, the lock flag, capture authorization and privileged protocol exposure ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#process-and-authority-boundaries)) | The trusted computing base of the session | `crates/compositor` |
| Private PAM helper | Running the `tuna-lock` PAM transaction | Re-executes the compositor's own held image. It never takes an executable path from UI, environment or configuration ([private PAM helper](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/private-pam-helper.md)). | `crates/compositor/src/pam_helper.rs` |
| Supervised shell (`tuna-shell-gtk` by default, legacy `tuna-shell-host`) | UI intent, lock surfaces, layer surfaces (panel, overview, banners, dialogs), the shell's own capture UI | PID of the compositor's own shell child (`Authority::publish`, `runtime.rs:4881-4890`); for its Wayland connection, the accepted peer's PID at connect time (`runtime.rs:1169-1171`). Between restarts no process is trusted. | `crates/shell-gtk`, `crates/shell-host` |
| Compositor's IBus bridge | Typing for other clients (virtual keyboard) | A Wayland connection the compositor inserts itself with the `ime_bridge` flag (`ime.rs:360`, `lib.rs:328-331`) | `crates/compositor/src/ime.rs` |
| GNOME portal backend (`xdg-desktop-portal-gnome`) | Consent broker for ScreenCast, Screenshot and RemoteDesktop | Caller's bus-authenticated PID resolves to a root-owned, non-group/world-writable installed executable, and the caller currently owns `org.freedesktop.impl.portal.desktop.gnome` (`capture_security.rs:176-277`) | `crates/compositor/src/capture_security.rs` |
| GNOME providers (Nautilus file chooser, global-shortcuts provider) | Opening an ordinary display connection, and `mutter_x11_interop` | Same installed-executable check for the requested service type only (`capture_security.rs:9-40`). Confers no capture or input authority ([service channel](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md)). | `crates/compositor/src/mutter.rs:198-293`, `x11_interop.rs` |
| Applications | Nothing beyond their own surfaces | Ordinary clients. Discovered Flatpak/Snap identity is metadata only ([service channel](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md#optional-gnome-sandbox-identities-410)). | `crates/compositor/src/sandbox_identity.rs` |
| Extension scripts (current) | A bar cell, a dock badge and notes in the legacy shell | In-process Rhai inside `tuna-shell-host` | `crates/shell-host/src/extensions.rs` |
| Extensions (**target**) | Declared capabilities only | Separate processes behind a capability broker. Not implemented. | [extensions](https://github.com/tuna-os/tuna-desktop/blob/main/docs/extensions.md#target-architecture) |

### Shell control socket

The compositor and shell talk over a dedicated Unix socket with a
versioned, length-prefixed postcard protocol
([ADR 0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md),
`crates/shell-control-schema`). [ADR 0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md)
sets three layers of protection. First, the socket exists only in a private
`XDG_RUNTIME_DIR` with mode `0600`. Second, `SO_PEERCRED` is read before
any state is sent, and other UIDs are refused. Third, once supervising, the
compositor admits only the supervised child, pinned by `SO_PEERPIDFD`: a
bare `SO_PEERCRED` PID, or the pin of an exited process whose PID was
recycled onto the shell, is refused, as is every peer on a kernel without
`SO_PEERPIDFD` (before 6.5). At most eight peers may be pending
(`crates/compositor/src/control.rs`, `PeerGate::admits`,
`ControlHub::poll`). Decoding rejects frames over 1 MiB before postcard
runs, and also rejects trailing bytes, over-long titles, oversized
collections and a foreign major version
(`crates/shell-control-schema/src/lib.rs:1965-2015`). Evidence:
`crates/compositor/tests/peer_auth.rs`, `handshake.rs`, `control.rs`.

The shell is trusted for intent, not authority. It cannot unlock by
itself. A client's `unlock_and_destroy` never unlocks the session: the
compositor unlocks only after PAM verifies the password and the
compositor clears its own flag (`crates/compositor/src/session_lock.rs:1-11`).

### Lock and authentication

Lock state lives in the compositor. A lock request is considered only from
the supervised shell's pinned Wayland connection; every other client's is
refused on arrival, so it can neither replace nor cancel the shell's. The
runtime approves it only while that pinned process is still the held shell
child, and only the approved client's lock surfaces are shown
(`session_lock.rs`, `SessionLockHandler::lock`, `lock_request_verdict`).
The shell asks again, with backoff, if a request is refused while the
compositor still says locked (`shell-gtk/src/lock.rs`). Engaging the lock does four things: it cancels
pending accelerators, stops held remote-desktop input, publishes the
locked state to the capture authority and closes the overview
(`runtime.rs:1661-1687`). Unlock runs the session user's own PAM
transaction against the `tuna-lock` service (`share/pam.d/tuna-lock`) in a
private helper. Attempts are bound to the control connection, request,
attempt serial and lock epoch. Fingerprint unlock is its own PAM
transaction against the `tuna-lock-fingerprint` service
(`share/pam.d/tuna-lock-fingerprint`: `pam_fprintd` plus `login`'s account
stack, as GDM runs `gdm-fingerprint`), so the account stack decides a
fingerprint unlock as it decides a password one
([ADR 0011](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0011-lock-auth-and-capture-grant-lifecycle.md), F5; fixed in
# 1173).
See:

- [Lock-screen authentication conversations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/lock-conversations.md)
- [Password result ownership](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/password-owner-epoch.md)
- [PAM conversation relay](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/pam-conversation-relay.md)
- [Private PAM helper](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/private-pam-helper.md)
- [Fingerprint prompt guards](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/fingerprint-prompt-guards.md)
- [Authentication consumer foundation](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/auth-consumer-foundation.md)

#### Unlock keyboard boundary (#939)

The authoritative compositor unlock transition performs a one-shot
`WindowManager::unlock_input` handoff. It restores seat keyboard focus through
the normal no-raise focus policy, respecting overview ownership, exclusive
layer surfaces and popup grabs rather than unconditionally focusing or raising
the remembered application. Session input does not depend on a later pointer
motion to recover focus.

Before restoring focus, the compositor quarantines every physically held seat
key and removes it from the forwarded pressed-key set. The new keyboard
owner's enter event therefore excludes lock-held keys. Quarantine suppresses
their repeats and eventual releases for ordinary session clients and shortcuts
until genuine key-up; a fresh press can then route normally. Physical pressed
state and XKB state remain intact, without synthetic modifier releases.

This boundary does not hide password keys from the user's trusted assistive
technology. The same-UID, unreaped compositor-owned Orca process must own
`org.gnome.Orca.KeyboardMonitor`; delivery targets only its admitted unique bus
owner. Its keyboard interception runs before ordinary-session filtering,
including post-unlock quarantine, so it receives genuine presses and held-key
releases while its watches and grabs remain effective across lock/unlock.
Those events are not permission to forward input to ordinary session clients.

The reference is [Mutter 51.1's
`meta_a11y_manager_notify_clients`](https://github.com/GNOME/mutter/blob/9134e3a5869ce232bf95b77519005865747ba603/src/backends/meta-a11y-manager.c#L617-L681):
it does not redact password key content or gate keyboard monitoring on lock
state. [GNOME Shell 51.1's screen shield](https://github.com/GNOME/gnome-shell/blob/33da06854e229c256afd5872fedd83c28cbfa176/js/ui/screenShield.js#L199-L205)
instead takes a lock-screen modal stage grab. Trusted AT visibility and
ordinary-client isolation are separate policies; see
[screen reader keys while locked](https://github.com/tuna-os/tuna-desktop/blob/main/docs/accessibility-shell.md#screen-reader-keys-while-locked-936).
This describes the input boundary, not a new test or CI receipt.

### Capture, screenshots and remote desktop

Only the supervised shell or the authenticated installed portal backend
may create ScreenCast sessions, take screenshots or create RemoteDesktop
sessions (`Authority::authenticate_caller`, `capture_security.rs`). The
shell is the session-bus unique names it declared over its pinned control
session, never a PID. Claiming the portal's bus name alone is not
enough. Sessions belong to their unique creator, are single-use, and are
bounded at 256 sessions and 64 streams per session. Revocation is
permanent. A 100 ms scan on the D-Bus thread revokes a grant when its
owner disconnects, the trusted portal name changes hands, the shell no
longer declares the owner's name or the session locks (`mutter.rs`,
`Authority::owner_alive`). Capture paths also
refuse locked frames. Full detail and the qualification evidence:
[capture admission and revocation](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md),
[remote desktop](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md),
[input capture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/input-capture.md),
[screenshot consent](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-screenshot-consent.md).

### Privileged Wayland globals

- `zwp_virtual_keyboard_manager_v1` is visible only to the compositor's IBus
  bridge (`protocols.rs:171-181`).
- `zwlr_layer_shell_v1` is visible and bindable only to the supervised
  shell's connection (#1048). The compositor marks a native connection as
  the shell's when it accepts it, if the `SO_PEERPIDFD`-pinned peer process
  is the shell child it spawned and still holds. Without a pin (a kernel
  before 6.5, or a peer that already exited) the connection stays
  ordinary: a bare `SO_PEERCRED` PID may have been recycled onto the shell
  (`lib.rs`, `ClientState::admit_supervised_shell`; `layer.rs`,
  `is_shell_peer`; `runtime.rs`, the client listener). The global filter hides it from
  every other client and a blind bind by name is a protocol error
  (`lib.rs:1099-1107`). Shell surfaces are still told apart by namespace,
  but only the shell can create one. Evidence:
  `crates/compositor/tests/protocols.rs`
  (`layer_shell_is_visible_and_bindable_only_by_the_supervised_shell`).
- `mutter_x11_interop` is visible only to typed service-channel
  connections (`x11_interop.rs:65-67`).
- `ext_foreign_toplevel_list_v1` (every window's title and app id) is
  visible and bindable only to the supervised shell's connection, with the
  same filter as layer-shell (#1046). Evidence:
  `crates/compositor/tests/protocols.rs`
  (`the_shell_lists_toplevels_until_they_close_and_apps_cannot_bind_the_list`).
- `ext_session_lock_manager_v1` is advertised to every client outside a
  security context, but a lock is considered only from the supervised
  shell's pinned connection and granted only while its pinned process is
  the held shell child (`session_lock.rs`). Evidence:
  `crates/compositor/tests/session_lock_protocol.rs`
  (`a_foreign_lock_with_the_shells_pid_is_refused_on_arrival`,
  `a_hostile_client_spamming_lock_cannot_cancel_the_shells_lock`).
- `wp_security_context_manager_v1` lets a sandbox engine (Flatpak) open a
  listener whose clients join tagged with the context (#1046). Every
  privileged global's filter (`ClientState::privileged`: virtual keyboard,
  input method, `mutter_x11_interop`, layer-shell, the foreign toplevel
  list) refuses such a client whatever its other state, and it sees neither
  the session lock nor the manager itself, so it cannot nest a context.
  Evidence: `crates/compositor/tests/protocols.rs`
  (`security_context_clients_see_no_privileged_global`). A connection the
  listener cannot accept (no descriptor left: EMFILE, ENFILE) rests the
  listener 250 ms and is retried, instead of ending the event loop and the
  session (#1071, `security_listener.rs`;
  `crates/compositor/tests/security_context_accept.rs`).
- Input-method v2 is visible and bindable only to the compositor's IBus
  bridge, like the virtual keyboard (`protocols.rs`, `_input_method`).
  Evidence: `crates/compositor/tests/input_protocols.rs`
  (`ordinary_and_spoofed_clients_cannot_discover_or_force_bind_privileged_input_managers`).

### Session-bus interfaces

Each interface checks its caller itself. The main policies:

| Interface | Served by | Caller policy |
|---|---|---|
| `org.gnome.Mutter.ScreenCast`, `.RemoteDesktop`, `org.gnome.Shell.Screenshot`, `org.tuna.Screenshot` | compositor | Shell (its declared unique bus names) or authenticated installed portal. Denied while locked. |
| `org.gnome.Mutter.InputCapture` | compositor | `CreateSession`: authenticated installed portal only (`Authority::admit_portal`), not the shell. Session methods: the unique owner, denied while locked. Lock closes every session at once; owner loss within the 100 ms scan. No input is captured while locked ([input capture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/input-capture.md)). |
| `org.gnome.Mutter.ServiceChannel` | compositor | Same-user caller. Typed connections require the installed provider for that type. |
| `org.gnome.Shell.Introspect` | compositor | Shell (its declared unique bus names) or authenticated installed portal (`capture_security::Authority::admit`). Denied while locked. `TUNA_INTROSPECT_UNRESTRICTED=1` (test/development "unsafe mode") allows metadata only while unlocked (`introspect.rs`). |
| `/org/gnome/Shell/Introspect` on `org.gnome.Shell` | GTK shell relays to the compositor | The shell holds no window data and decides nothing: it forwards each call to the compositor's `org.tuna.Introspect` with the original caller's unique name. The compositor answers only when the relay is a unique name the supervised shell declared and the original caller passes the `org.gnome.Shell.Introspect` rule above (`Authority::admit_forwarded`; `shell-gtk/src/introspect_forward.rs`). |
| `org.gnome.Shell` (OSD, search, app grid) | GTK shell | Caller must own `org.gnome.Settings`, `org.gnome.SettingsDaemon.MediaKeys` or the GNOME portal name, as GNOME's `DBusSenderChecker`. `TUNA_SHELL_DBUS_UNRESTRICTED=1` disables this for harnesses (`shell-gtk/src/shell_dbus.rs:27-31`, `374-378`). |
| `org.gnome.Shell.NetworkAgent` (system bus) | GTK shell | Only NetworkManager's current unique owner ([network agent](https://github.com/tuna-os/tuna-desktop/blob/main/docs/network-agent.md)). |
| `org.freedesktop.impl.portal.Access` | shell (`org.freedesktop.impl.portal.desktop.tuna`) | Always answers "cancelled", so the requester is refused (`shell-host/src/lockdown.rs:66-83`). |

Neither `UNRESTRICTED` variable is set by the packaged session
(`share/wayland-sessions/tuna.desktop`, `crates/compositor/src/bin/tuna-session.rs`).

### Native CI reference observer (not product authority)

`packaging/marlin/vm-lane/tuna-vm-gnome-reference` is a fixed, finite CI
fixture, not a capture grant or a product authorization mechanism. Its root
controller owns `/proc` executable/start-generation observations and private
receipts. Its UID1000 child reads existing public Gio settings and AT-SPI
objects only. Same-UID access to `/proc/<pid>/exe` is **not** assumed:
an actual bus daemon can be non-dumpable without invalidating that daemon.
The fixture does not change dumpability, ptrace policy, proc mounts or bus
security policy.

The child inherits one private packet socketpair, with no listener or host
service. Each request is bound to the spawned child's kernel
`SCM_CREDENTIALS` and independently pinned process generation; socketpair
`SO_PEERCRED` identifies its creator and is not used as sender identity.
Requests cannot supply a PID, executable, command or arbitrary bus address.
Only the existing admitted session bus and the accessibility address
independently read from its pinned `org.a11y.Bus` owner are eligible.
Session-bus owner queries are limited to that launcher and Mutter
DisplayConfig. Accessibility owner queries are limited to the registry and
unique application names in its actual root inventory, refreshed for later
fixture launches.

For a socket observation the child transfers exactly one connected Gio FD.
The controller only inspects its address and kernel `SO_PEERCRED`; it never
reads, authenticates or issues D-Bus calls on the child's stream. It compares
that peer with its own independently connected fixed bus and original
process/socket pins. Separate root-owned read-only, no-autostart connections
resolve exact bus owners to UID/PID and `/proc` executable/hash/start/boot
identities before and after observation. Returned child receipts must match
those independent identities. Truncated packets, foreign senders, extra or
missing FDs, changed peers and unobserved owners fail closed; received FDs
are closed on success and failure. Packets are bounded to 64 KiB, requests
to 12010, trees to 6000 nodes, and all work shares the existing at-most-25s
operation deadline, including connection authentication.

The first terminal operation failure is retained through stop and missing
file probes; the host retrieves it before probing other receipts. This
preserves cause, not a pass: run `41490837174`'s Tuna reference artifact
`13168047462` recorded the UID1000 `/proc/1789/exe` permission failure.
The GNOME artifact `13166824093` retained only a later missing
`snapshot.json` file error after its original prepare failure was
overwritten. Its original cause cannot be recovered from the retained
member, serial command trace or job log. Controlled semantic regressions
are not native qualification; fresh actual reference evidence and physical
UI classification remain required for both legs.

## Current state compared with the target

| Area | Today on `main` | Target |
|---|---|---|
| Extensions | Rhai scripts run in-process in the legacy `tuna-shell-host` only. The default GTK shell loads none. Containment is a language sandbox with an operation budget. | Separate, untrusted processes behind a capability broker, with no privileged Wayland socket, native plugin ABI, raw input, clipboard, capture, filesystem or network by default ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#process-and-authority-boundaries), [extensions](https://github.com/tuna-os/tuna-desktop/blob/main/docs/extensions.md)) |
| Shell identity | PID of the compositor's child, checked on the control socket and for capture | Inherited pre-connected socketpair or another production credential, deferred to spek 004 ([ADR 0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md#alternatives-considered)) |
| Shell supervision | Compositor-owned child with a finite restart budget and capped backoff ([ADR 0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md), `supervise.rs`) | Production supervision and identity are a 004 gate |
| Activation tokens | Compositor-minted, one-use, 30 s, seat and app-ID bound ([ADR 0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md)) | Binding to `xdg_activation` external tokens deferred to 004 |
| Portal grants | Consent by the GNOME backend; compositor-enforced, revocable grants (above) | Complete grant lifecycle reviewed; open release blocker in the ADR register |

## Known limitations

- **Same-UID boundary.** Shell identity and executable-identity
  checks stop processes that only claim an identity. They do not stop a
  native same-user process, and it needs no `ptrace`: `LD_PRELOAD` into the
  genuine portal or grd binary is enough. Mitigations: a GNOME-style
  screen-sharing and remote-access indicator with Stop and
  gnome-remote-desktop sessions only while Remote Desktop is enabled in
  gsettings are being built; pidfd-pinned shell identity is #1171
  ([ADR 0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md#review-findings-and-dispositions)).
- **Name-based allowlists.** The `org.gnome.Shell` allowlist trusts
  whoever owns an allowlisted well-known name, as GNOME does. A same-user
  process that claims `org.gnome.Settings` first passes it. Those methods
  only show OSDs and open search or the app grid.
- **Extension sandbox is in-process.** The Rhai engine sets an operation
  budget but no string, array or memory limits (`extensions.rs:103-146`), so
  a script can exhaust the legacy shell host's memory. A Rhai engine bug is
  a shell host bug. The compositor is unaffected: the shell is a separate,
  supervised process.
- **Revocation latency** is the 100 ms scan plus one compositor tick. This is
  not a hard real-time bound under CPU starvation
  ([capture security](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md)).
- **Hardware.** Qualification covers the Marlin VM, vkms and CI. The
  physical GPU/support matrix is open
  ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#decisions-still-open)).
- **Sandboxed app identity** is best-effort metadata, unqualified for
  shipped Flatpak/Snap processes, and X11 windows have none
  ([service channel](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md#optional-gnome-sandbox-identities-410)).

## Release gates

These must pass before the security claims above can be called release
quality:

- The architecture's cross-cutting gates: apps survive shell and extension
  crashes, lock failure never exposes surfaces or redirects input, and
  capture and remote input use portal consent with compositor-validated
  authorization ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#cross-cutting-release-gates)).
- Roadmap decision gate 4: the threat model assigns trusted identities and
  lock/auth/portal/capture authority end to end, and specialist review
  leaves no unresolved critical issue. Gate 5: before 1.0, no critical
  lock/capture/input/clipboard/IME regression. Gate 6: before public
  extensions, broker containment criteria pass
  ([roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#global-decision-gates)).
- Requirements R6 (session/lock), R11 (extension boundary) and R14
  (capture/privileged surfaces) with their security cases
  ([requirements](https://github.com/tuna-os/tuna-desktop/blob/main/docs/requirements.md)).
- The ADR register rows for same-UID identity and the production
  lock/auth and portal/capture lifecycle, proposed in
  [ADR 0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md) and
  [ADR 0011](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0011-lock-auth-and-capture-grant-lifecycle.md) (#1162) and
  awaiting the owner's decision. Their residual risks, including the gaps
  they record, are part of the gate 4 review
  ([ADR register](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md#decision-register)).

The `portal-security` and `remote-security` CI lanes run the packaged
compositor and GTK shell against the installed GNOME portal stack
(`scripts/tuna-portal-security`, [testing](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md)). Their evidence
manifests are [capture-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-evidence.json) and
[capture-security-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security-evidence.json).

## Related documents

- [Program architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md)
- [Portal and D-Bus service integration](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-integration.md)
- [Extensions](https://github.com/tuna-os/tuna-desktop/blob/main/docs/extensions.md)
- [Privacy device enforcement](https://github.com/tuna-os/tuna-desktop/blob/main/docs/privacy-enforcement.md)
- [ADR 0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md),
  [ADR 0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md),
  [ADR 0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md)
