---
sidebar_position: 28
title: "nested session"
---

One command starts the 001 nested desktop slice: a supervised compositor
session with the shell panel attached.

```sh
scripts/tuna-nested run [--socket NAME] [--shell-bin PATH] [--artifacts DIR]
```

Defaults: socket `tuna-nested-<pid>`, shell binary from the workspace
build, artifacts under
`$XDG_STATE_HOME/tuna-nested/<socket>` (else
`~/.local/state/tuna-nested/<socket>`). The script builds both binaries,
starts `tuna-compositor` on a private socket, and records
`nested.log` plus `compositor.pid` in the artifacts dir. Needs a host
Wayland/X session with EGL (llvmpipe is fine); headless CI cannot run
it — automation covers the same paths headless (see below).

## Crash and reconnect journey

1. Launch with `scripts/tuna-nested run`. The nested window appears;
   the panel attaches as a top strip.
2. Open application clients inside the session (e.g.
   `WAYLAND_DISPLAY=<socket> <app>` from another terminal).
3. Kill the shell: `scripts/tuna-nested kill-shell --socket <socket>`.
   Application windows stay mapped and the background shifts to deep
   red: the compositor-owned recovery overlay covers the session.
4. The compositor respawns the shell within its finite restart budget
   (bounded backoff visible in `nested.log` as `shell supervision`
   lines). The panel re-attaches and resyncs from a full snapshot —
   the exact window and workspace set, never partial state.
5. While the overlay is visible, keyboard input stays on the shield:
   Up/Down move the selection, Enter refreshes the window list, R relaunches the shell,
   Esc dismisses. If the restart budget is spent, the session stays
   calm and observable until an operator relaunch (R).

## Environment hygiene

`WAYLAND_DISPLAY` points at the private socket for the compositor
process and its shell child only. The parent shell and the host
session are never mutated; shutdown restores the previous value.
`TUNA_CONTROL_SOCKET` hands the shell child its control socket path
(overview feed); without it the panel runs with an empty overview.
Neither variable is exported by the launcher into your shell.

Host pointer grab/ungrab follows the winit backend: click into the
nested window to capture input; the host escape combination releases
it (see the winit backend docs for the exact key).

## Failure artifacts and redaction

Every supervision or control event is logged with codes, revisions,
and counts only. Window titles, activation tokens, and frame content
never enter logs: `RunArtifact` carries a content-free snapshot hash
instead of the window set, and control errors name categories, not
payloads. When reporting a failure, attach `nested.log` plus the
revision/restart counts from it — that is the complete artifact.

The headless proof for environments without EGL: `cargo test
--workspace` runs the 100-run fault harness
(`hundred_fault_runs_keep_apps_alive_and_resync`), which kills,
disconnects, stalls, crash-loops, and gap-forces shell peers and
asserts app survival, exact resync, budget exhaustion, and artifact
redaction on every run.

## Provisional visuals

The slice-1 overlay visual is the background shift plus the input
shield; full overlay text rendering (window list pixels) arrives with
shell workflow parity (002). The panel's 200 Hz control poll loop is
likewise provisional pacing for the shell binary only — compositor
input, focus, and frame paths never wait on it.

## Troubleshooting

### Reading `nested.log`

The compositor and its shell child both write to `nested.log`. Compositor
lines start with `tuna-compositor:`; the default shell's fatal errors
start with `tuna-shell-host:`. The lines that matter most:

| Line | Meaning |
|---|---|
| `tuna-compositor: nested session on <socket> (<w>x<h>)` | Arguments parsed; the compositor is about to open its backend and socket. It prints before any backend error, so it does not prove the session started. |
| `tuna-compositor: nested backend unavailable: ...` | The window/GLES backend could not start: no host display or no EGL. See below. |
| `tuna-compositor: nested socket failed: ...` | The Wayland socket could not be created. See below. |
| `tuna-compositor: shell supervision: ShellExited { code: ... }` | The shell child exited. `code: None` means a signal killed it (for example `kill-shell`). |
| `tuna-compositor: shell supervision: RestartScheduled { delay_ms: N }` | A restart is armed after `N` ms of backoff; budget remains. |
| `tuna-compositor: shell supervision: BudgetExhausted` | The restart budget is spent; the shell stays down until you press R on the overlay. |
| `tuna-compositor: shutdown after N frames, N clients, N shell restarts` | Clean exit, with the session's totals. |

Lines naming a D-Bus service (`serving ...`, `... is taken; ... off`) say
whether the compositor claimed a GNOME service name on the session bus.
`is taken` is expected when you run nested inside a GNOME session, which
already owns those names.

### Build fails on a missing library

`pkg-config` errors naming `libseat`, `libinput`, `libudev`, `gbm`,
`libdrm`, `xkbcommon`, `gtk4`, `libadwaita-1`, `gweather4`,
`libpipewire-0.3` or `gtk4-layer-shell-0` mean a development package is
missing; install the list under
[Prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites). Ubuntu 24.04 does
not package gtk4-layer-shell: build it with
`scripts/ci-install-gtk4-layer-shell`. The `pipewire` crate also needs
libclang at build time.

### `nested backend unavailable`

The nested backend is winit with GLES over EGL and has no software
fallback ([ADR 0001](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0001-nested-backend-smithay-pin.md)). Check that:

- `DISPLAY` or `WAYLAND_DISPLAY` is set in the shell you launch from.
  Without either, `--backend auto` (the default) picks the DRM/KMS
  hardware backend instead of a nested window, which fails without a seat.
- EGL and libxkbcommon-x11 are installed. Both are loaded when the backend
  starts, not at build time, so a build can succeed and the run still
  fail. On Ubuntu: `libxkbcommon-x11-dev`, `libegl1`, `libgl1-mesa-dri`,
  `libgbm1`. Mesa's llvmpipe software driver is enough; no GPU is needed.

### EGL or DRI3 warnings

Under Xvfb, in a VM, or over a remote X connection, Mesa may print
`libEGL warning:` lines (for example about DRI3) and fall back to software
rendering. They come from Mesa, not Tuna Desktop, and are harmless when no
`nested backend unavailable` line follows and the session runs. CI's
proof jobs run under Xvfb this way on every change.

### `nested socket failed`

The compositor creates its socket in `$XDG_RUNTIME_DIR`. Make sure that is
set (some `su`, `sudo` and container setups leave it unset), and pick
another name with `--socket` if a previous run left a socket of the same
name behind.

### The nested window does not appear

1. Look for `nested session on` in `nested.log`. If it is missing, the
   build or the launch failed; the terminal running `scripts/tuna-nested
   run` shows the cargo error.
2. If the log ends with `nested backend unavailable` or `nested socket
   failed`, see the sections above.
3. On a headless machine there is no window to see. Start a virtual
   display and capture it instead, as the proof scripts do:

   ```sh
   Xvfb :98 -screen 0 1280x800x24 &
   DISPLAY=:98 scripts/tuna-nested run
   ```

### The panel does not appear, or the background turns deep red

Deep red is the recovery overlay: the shell is not running.
`scripts/tuna-nested shell-pid --socket <socket>` prints
`shell not running (overlay covers the session)` while it is down.
`nested.log` then shows `ShellExited` lines with the shell's own error
just before them. A shell started on a compositor without
`zwlr_layer_shell_v1` reports `compositor offers no zwlr_layer_shell_v1`
rather than drawing a misplaced surface. After `BudgetExhausted` the
session stays up without a shell until you press R.

`scripts/tuna-nested run` starts `tuna-shell-host`. To run the GTK shell
([ADR 0006](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0006-gtk4-libadwaita-shell.md)) instead, build it and pass
it explicitly:

```sh
cargo build -p tuna-shell-gtk
scripts/tuna-nested run --shell-bin target/debug/tuna-shell-gtk
```

### Filing a bug

Open an issue with the details below; [troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md#filing-a-bug)
lists what to add for installed and hardware sessions:

- the exact command you ran and what you saw;
- `nested.log` from the artifacts directory. Compositor lines carry codes,
  revisions and counts only (see the redaction note above), but the shell
  child's stderr lands in the same file, so read it before attaching;
- the commit (`git rev-parse HEAD`) and the output of
  `target/debug/tuna-compositor --version`;
- the host: distro, kernel, whether you ran inside Wayland, X11 or Xvfb,
  and the GPU driver or Mesa version;
- for a proof script failure, the whole artifacts directory, which also
  holds the frames and `assertions.txt`.
