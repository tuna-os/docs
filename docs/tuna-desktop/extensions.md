---
sidebar_position: 17
title: "extensions"
---

This page covers two things. The first is the small Rhai script host that
exists today. The second is the planned extension architecture: what
public extensions would be allowed to do, and the constraints that design
must respect. Public extensions are optional, later work outside the
initial core release ([roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md)). The planning record is spek
005, "Extension broker and public API".

## Current: Rhai scripts in the legacy shell

Small Rhai scripts can extend the shell without rebuilding it. A script
can add a bar cell, set a dock badge and post user-visible notes.

**Only the legacy `tuna-shell-host` runs them.** The host lives in
`crates/shell-host/src/extensions.rs` and is driven from the legacy panel
(`crates/shell-host/src/panel.rs:1781-1787`). The default GTK shell
(`tuna-shell-gtk`, [ADR 0006](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0006-gtk4-libadwaita-shell.md)) loads no
scripts. To try them, choose the legacy shell with
`TUNA_SHELL_BIN=tuna-shell-host` ([packaging](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md)).

### Install

Copy a `.rhai` file into `$XDG_DATA_HOME/tuna-shell/extensions/`. The
default is `~/.local/share/tuna-shell/extensions/`
(`extension_dir()` in `extensions.rs`, `DATA_DIR_NAME` in `favorites.rs`).
When neither `XDG_DATA_HOME` nor `HOME` is an absolute path, no scripts are
loaded. The shell rescans the directory on its status tick, every two
seconds, and compares file modification times. Adding, editing or
deleting a file takes effect without a restart.

### API (allowlist; nothing else is reachable)

- `bar_cell(text, icon)`: contribute the strip cell (text plus an icon name
  from the theme).
- `on_press(id)`: declare the press action id for the cell.
- `press(id)`: optional script function the shell calls on press.
- `dock_badge(text)`: contribute the dock badge text.
- `notice(text)`: record a user-visible note.
- `print(text)`: captured into notes (never reaches stdout).

### How scripts run

Scripts run on the shell host's status tick with an operation budget of
`MAX_OPS` (200,000 Rhai operations). They are kept off the paint and event
paths. Painters read only the cached plain-data `ScriptOutput`. A press on
the strip is queued and delivered to the script's `press` function on the
next tick.

The engine replaces the module resolver with a dummy, so `import` cannot
read files. It silences `debug`, captures `print`, and registers only the
functions above (`extensions.rs:100-146`). There is no filesystem, network
or process surface. A script that fails is disabled with a visible note
naming the reason. Failures include a parse error, a runtime error, an
exceeded budget and a failing press handler. Fix the file and the shell
reloads it.

### Example

`crates/shell-host/sample-extensions/hello_cell.rhai` is a greeting cell
that notes its own presses.

### What this host is not

This is containment inside the shell process, not process isolation.

- Scripts share the shell host's address space and thread. A Rhai engine
  bug is a shell host bug.
- The engine configures no string, array or memory limits, so a script can
  exhaust the shell host's memory within its operation budget.
- Any process running as the user can write to the extension directory.
- The compositor is unaffected by all of this: the shell is a separate,
  supervised process, and apps stay connected across a shell restart
  ([ADR 0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md)).

These limits are recorded in the [security model](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md#known-limitations).

## Target architecture

The rest of this page is a planning document, not implementation
guidance. Nothing below is shipped.

### Scope and constraints

A public extension adds bounded, declarative contributions through
explicitly granted, revocable capabilities. Examples are indicators,
search results and layout requests. By default an extension cannot:

- observe raw input, keystrokes, the clipboard, pixels or window contents;
- read or write arbitrary files or use the network;
- inject input or drive window management directly;
- obtain capture, remote input or permission escalation through its own
  grants. Those keep their independent portal consent and compositor
  authorization ([capture security](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md)).

Example capability names from spek 005 are `read-workspace-summary`,
`add-indicator`, `add-search-provider` and `request-layout-change`. Any
future network permission is explicit, scoped, revocable and tested.

### Threat model

Extensions are untrusted code. The authority model follows the
[security model](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md):

- **Authority.** An extension holds only its granted capabilities. It never
  receives the compositor's privileged Wayland socket, the shell control
  socket or the shell's capture authority.
- **Isolation.** The operating-system process boundary and the broker's
  host-call policy are the security boundary. One process runs per
  extension, or per explicitly grouped package, supervised outside the
  compositor and the shell. WebAssembly guest isolation alone is not
  sufficient. Wasmtime may later run inside an isolated worker, but only
  after host imports, fuel, memory, filesystem and network permissions,
  and crash behaviour have security tests.
- **Crash and resource containment.** A crash, timeout, oversized message,
  memory or fuel exhaustion, or protocol violation disables that extension
  for the session with a user-visible diagnostic. The shell and compositor
  stay responsive. Each capability has a CPU/time budget, memory budget,
  message quota, restart policy and audit logging.
- **Revocation.** Revoking a grant while the extension runs stops broker
  and service access within a documented bound.

### IPC options

| Option | Fit |
|---|---|
| Native library loaded into the compositor or shell | Rejected. No native plugin ABI is allowed (spek 005 constraint, [architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#process-and-authority-boundaries)). |
| In-process interpreter (the current Rhai host) | Acceptable only for the legacy shell's local scripts. It cannot provide crash, memory or revocation containment. |
| Separate process speaking a broker protocol over a private Unix socket or socketpair | Preferred. It matches the control socket's framing and limits ([ADR 0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md)) and its peer authentication ([ADR 0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md)). An inherited socketpair avoids a connectable path. |
| Separate process on the session bus | Possible for providers that already speak D-Bus, such as GNOME search providers. Bus names are not identity, so the broker still authenticates the process and enforces quotas. |
| Wasmtime guest inside a broker-supervised worker | Later and optional; the worker process, not the guest, is the boundary |

### Constraints from the compositor/shell split

- The compositor stays authoritative and never waits on extension work. No
  extension call runs on the input or frame path
  ([architecture](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md#process-and-authority-boundaries)).
- The shell is a supervised child that restarts from a finite budget. A
  broker must survive, or cleanly resynchronize across, shell restarts, as
  the shell resynchronizes with a full snapshot ([ADR 0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md)).
- The shell renders extension UI from bounded declarative data. Search
  providers are asynchronous, cancellable and rate-limited, as the
  existing remote search providers are (`crates/shell-gtk/src/providers.rs`).

### Why in-process extensions are out of scope for public extensions

GNOME Shell loads extensions as JavaScript in its own process. There they
can monkey-patch any shell object, block the compositor's main loop, and
take the session down with them. Tuna Desktop's roadmap excludes
"in-process shell extensions" and "an unbounded plugin authority model"
([roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md)). An in-process extension cannot be revoked,
quota-limited or crash-contained in a way a reviewer can verify.

### Example use cases

- Panel indicators: weather, build status, a VPN state cell. These are
  declarative text, icon and press actions, like the current Rhai cell.
- Dock badges and counters.
- Additional overview search providers.
- Layout and tiling policy requests, applied by the compositor after
  validation.
- Keyboard-shortcut actions that run a granted, declarative action.

### Comparison with GNOME Shell extensions

| | GNOME Shell | Tuna Desktop target |
|---|---|---|
| Where code runs | Inside the shell/compositor process | Separate supervised process per extension |
| API surface | Any internal shell object | A small, versioned capability API |
| Failure | Can freeze or crash the session | Extension disabled for the session, shell and compositor unaffected |
| Permissions | None beyond the user's | Per-installation, revocable grants with a permission UI |
| Compatibility | Tied to GNOME Shell versions | Versioned API with a migration and deprecation policy. GNOME Shell extensions are not compatible. |

### When this work starts

Spek 005 depends on the threat model, a stable shell control boundary,
the shell's extension use-case inventory and the trusted-service and
consent model (specs 000, 001, 002 and 004). Roadmap decision gate 6
requires four things before public extensions:

- initial use cases map to a small capability set;
- the API compatibility policy has been reviewed;
- the permission UI has been reviewed;
- all broker containment criteria pass

([roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#global-decision-gates); requirement R11 in the
[requirements](https://github.com/tuna-os/tuna-desktop/blob/main/docs/requirements.md)). The API, once it exists, will need its
own versioning policy alongside the [crate API stability policy](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md).
