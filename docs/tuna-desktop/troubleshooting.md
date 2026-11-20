---
sidebar_position: 53
title: "troubleshooting"
---

Fixes for problems building, installing, logging in to and testing Tuna
Desktop, how to get more output, and what to put in a bug report. Two other
pages go deeper:

- [Nested session troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md#troubleshooting) explains
  `nested.log` and the nested window's failures.
- [Session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md) covers a running session: its
  processes, logs in the journal, restarting the shell, the lock screen and
  debuggers.

Messages quoted here are the program's exact output; search for the text you
see.

## First, which build is running?

Every binary prints its version, which is the release it was built from:

```sh
tuna-compositor --version
tuna-session --version
tuna-shell-gtk --version
```

In a checkout, use `target/debug/` (or `target/release/`) in front of the
names, and add `git rev-parse HEAD`.

## Building

| Symptom | Cause and fix |
|---|---|
| `pkg-config` cannot find `libseat`, `libinput`, `libudev`, `gbm`, `libdrm`, `xkbcommon`, `gtk4`, `libadwaita-1`, `gweather4`, `libpipewire-0.3` or `gtk4-layer-shell-0` | A development package is missing. Install the list in [Prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites) for your distribution. |
| `gtk4-layer-shell-0` is missing on Ubuntu 24.04 | Ubuntu 24.04 does not package it. Build it with `scripts/ci-install-gtk4-layer-shell`, as CI does. The shell needs version 1.1 or later. |
| The `pipewire` or `libspa` crate's build script fails to find `libclang` | Install `libclang-dev` (Ubuntu) or `clang` (Arch); bindgen needs it at build time. |
| A dependency says it needs a newer `rustc` | No MSRV is declared and CI uses the current stable toolchain. Run `rustup update stable`. |
| The machine runs out of memory or disk while building several worktrees | Use the `just` recipes: builds share two machine-wide slots (one per 8 GiB of RAM) at half the CPUs each, and run `just gc` when less than 20 GiB is free. See [local iteration with `just`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#local-iteration-with-just). |
| `just build` or `just proof` waits on `tuna-semaphore: all N slots ... are busy` | Other worktrees hold every build or proof slot; it starts when one frees. A proof holds its slot for at most `TUNA_PROOF_TIMEOUT` (45) minutes. |
| `cargo fmt --check` or clippy fails in CI but not locally | CI runs `cargo clippy --workspace --all-targets -- -D warnings`, so any warning fails. Run `just check` before pushing. |

## Starting the compositor

| Message | Cause and fix |
|---|---|
| `tuna-compositor: nested socket failed: XDG_RUNTIME_DIR is unset` | Your shell has no runtime directory, common after `su` or `sudo` and in containers. Run the compositor from your own login session, which has `/run/user/<uid>`. |
| `tuna-compositor: nested socket failed: control socket directory is not private to this user` | `XDG_RUNTIME_DIR` must be a directory you own with no permissions for group or others (mode `0700`), like `/run/user/<uid>` (`crates/compositor/src/control.rs:1664-1669`). |
| `tuna-compositor: nested backend unavailable: drm backend: ...` | There was no `DISPLAY` or `WAYLAND_DISPLAY`, so `--backend auto` chose the hardware backend, and it failed. From inside a desktop, check those variables or pass `--backend winit`. On a text console, see [hardware session](#the-hardware-session-fails-to-start) below. |
| `tuna-compositor: nested backend unavailable: ...` (anything else) | No EGL or no xkbcommon-x11. See [nested session troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md#nested-backend-unavailable). |
| `tuna-compositor: settings upgrade blocked (...)` | See [below](#settings-upgrade-blocked). |

### Settings upgrade blocked

Before it starts anything, the compositor checks the settings directories that
were renamed with the project, for example `~/.cache/tuna`. When an old and a
new copy both exist, or a path is not a plain directory you own, it refuses to
choose between them and exits:

```text
tuna-compositor: settings upgrade blocked (/home/me/.cache/<old> -> /home/me/.cache/tuna): current-only path must be an owned real directory without other writers. ...
```

Nothing has been changed or deleted. Back up both paths, decide which one you
want, and move the other aside. The [upgrade and recovery
guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md#recovery-and-downgrade) lists every directory the
check covers and what it accepts (`crates/compositor/src/user_upgrade.rs`).

When you only want a throwaway session from a checkout, run it with a fresh
`HOME` and the XDG directories unset, as `just proof` does.

### The hardware session fails to start

The hardware (DRM/KMS) backend needs a seat from logind or seatd. Messages
start with `tuna-compositor: nested backend unavailable: drm backend:`
followed by the step that failed (`crates/compositor/src/drm.rs:390-433`):

| Step in the message | What to check |
|---|---|
| `libseat session: ...` | The process is not in an active seat session. Start it from GDM or from a login on a virtual terminal, not over SSH or in a container. |
| `open drm device: /dev/dri/cardN: ... Operation not permitted` | The seat did not grant the device: the session is not the active one on that seat. |
| `egl display`, `egl context`, `gles` | The GPU's Mesa driver is missing or broken. |

With several GPUs, `TUNA_DRM_DEVICE=/dev/dri/cardN` chooses one. CI proves
the backend on the kernel's virtual KMS driver (`scripts/tuna-drm-smoke`,
[running tests locally](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-proofs)); physical GPUs are not
qualified yet.

## Installing and upgrading

### Debian-format package

- Install the file with a path, so apt resolves its dependencies:
  `sudo apt install ./tuna-desktop_X.Y.Z_amd64.deb`.
- The package targets Ubuntu 26.04. On older releases or Debian 13,
  dependency resolution fails because the package needs gtk4-layer-shell 1.1
  or later ([install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#from-the-debian-format-package)).
  Build from source there instead.
- `/etc/pam.d/tuna-lock` and `/etc/pam.d/tuna-lock-fingerprint` (fingerprint
  unlock) are configuration files. If you changed or deleted one, dpkg can
  stop and ask what to do during an upgrade; an unattended upgrade then leaves
  the package unconfigured. Answer the prompt, then run
  `sudo dpkg --configure -a`.
- Upgrading from a package with the project's former name is covered in the
  [upgrade and recovery guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md).

To reproduce a dependency problem in a clean container, as CI does:

```sh
scripts/check-deb-clean-install tuna-desktop_X.Y.Z_amd64.deb
```

### Arch package

Build it from a checkout with:

```sh
TUNA_LOCAL_SRC="$PWD" makepkg -f --dir packaging/arch
```

Every PAM file is in the package's `backup` array, so pacman keeps a file you
changed and writes the new one as `.pacnew` beside it. Compare the two and
merge by hand ([legacy upgrade](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md#arch-replacement)).

### From source

- `tuna-session` finds the compositor, and the compositor finds the shell, by
  looking in the directory they are installed in first. Install all four
  binaries into the same directory
  ([install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#installing)).
- Install `share/pam.d/tuna-lock` as `/etc/pam.d/tuna-lock`, or the lock
  screen cannot be unlocked, and `share/pam.d/tuna-lock-fingerprint` as
  `/etc/pam.d/tuna-lock-fingerprint`, or fingerprint unlock fails.

### TunaOS Marlin

The preview image is installed with `bootc switch`
([packaging](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md#tunaos-marlin)). The image keeps GNOME on
the login screen, so you can still log in when Tuna Desktop does not start.
To go back to the deployment you switched from, run `sudo bootc rollback` and
reboot.

## Logging in

GDM is the only supported display manager. The greetd greeter and its unlock
route were removed in #866; configurations that start Tuna Desktop from
greetd are no longer supported.

### Tuna Desktop is not in GDM's session menu

GDM lists `/usr/share/wayland-sessions/*.desktop`. Check that the entry is
there and that its `TryExec` program is on the system `PATH`; display managers
hide an entry whose `TryExec` cannot be found:

```sh
cat /usr/share/wayland-sessions/tuna.desktop
command -v tuna-session
```

A source install under `/usr/local` must also install the entry there, as in
the [install guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#installing), and GDM must see it in
`/usr/share/wayland-sessions`.

### The login returns to the login screen

The compositor exited. Log in to another session (GNOME, or a text console)
and read the failed session's lines from the journal:

```sh
journalctl -b _UID=$(id -u) -o cat --no-pager | grep -E '^tuna-'
```

Look for the last `tuna-compositor:` lines before the session ended: a
`drm backend` failure, `settings upgrade blocked`, or a `panicked` line. See
[session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md#logs) for the lines a healthy
start prints.

### The session starts but shows no panel

The compositor is running but the shell is not. The journal shows
`shell supervision: ShellExited` lines, and the shell's own error just before
them. After five failed starts the compositor logs `BudgetExhausted` and stops
retrying; press R on the recovery overlay to try again
([restarting the shell](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md#restarting-the-shell)). To rule
out the GTK shell, try the same build nested with the legacy shell, which is
what `scripts/tuna-nested run` starts.

### GDM keeps choosing another session

GDM remembers the session file name you last used. Pick **Tuna Desktop**
explicitly once; see
[remembered GDM sessions](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md#remembered-gdm-sessions) when you
upgraded from the former name.

### The lock screen does not accept the password

See [the lock screen](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md#lock-screen) for the PAM checks
and for unlocking from another terminal.

## Tests and CI

### Locally

Run what CI's `check` job runs before you push:

```sh
just check
```

- The PAM tests print `pam_unlock: pam_wrapper not installed, skipped` and
  pass without `pam_wrapper`. Set `TUNA_REQUIRE_PAM_WRAPPER=1` to make that a
  failure, as CI does ([before opening a PR](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#before-opening-a-pr)).
- A failing proof script keeps its artifacts directory and prints its path.
  Read `nested.log` and `assertions.txt` there first. `just proof <name>` runs
  one with a fresh `HOME` so your own settings cannot affect it.
- Start `tuna-gtk-shell-proof` from an empty artifacts directory; a reused one
  carries the previous run's notifications over
  ([nested proofs](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-proofs)).

### In CI

```sh
gh pr checks <PR>
gh run view <run-id> --log-failed
just ci-artifacts <run-id>
```

`gh run view --log-failed` prints only the failed steps' logs.
`just ci-artifacts` downloads a run's artifacts (frames, logs,
`assertions.txt`) and prints where they went.

- A PR runs only the proof lanes its change can affect. The `select-lanes`
  job's summary says which and why ([which lanes a pull request
  runs](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#which-lanes-a-pull-request-runs)).
- The `parity-ledger` job fails when a test that a row of
  `docs/parity-ledger.md` cites is renamed or removed. Update the row in the
  same PR ([parity ledger check](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#parity-ledger-check)).
- Do not re-run a deterministic test until it passes. `gh run rerun <run-id>
  --failed` tells you whether a failure is intermittent; it does not fix one.
  The [timing rule](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#writing-a-test) explains how to remove the
  cause.

## Getting more output

- Run the failing program with `RUST_BACKTRACE=1` in its environment to get a
  backtrace from a panic.
- Each `TUNA_*_TRACE` variable adds detailed output for one area: the lock,
  pointer input, Xwayland, IBus, the app grid, menus or media keys. The
  [environment variable reference](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md#debugging-and-trace-output)
  lists them.
- `TUNA_COMPOSITOR_STATE=/abs/path.json` makes the compositor keep a JSON
  snapshot of its state there
  ([session state snapshot](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md#session-state-snapshot)).

## Filing a bug

Search the [existing issues](https://github.com/tuna-os/tuna-desktop/issues)
first. A new issue should include:

- what you did, what you expected and what happened instead;
- the version of each binary (the `--version` commands
  [above](#first-which-build-is-running)), and the commit for a source build;
- how you installed it: `.deb`, Arch package, Marlin image (`bootc status`
  shows the image), or source;
- how the session ran: nested in which host desktop, from GDM, or from a text
  console;
- the distribution, kernel (`uname -r`), GPU and Mesa version
  (`glxinfo -B` or `eglinfo` if installed);
- the log: `nested.log` from a nested run, or the journal lines from the
  command in [the login returns to the login
  screen](#the-login-returns-to-the-login-screen). Compositor lines carry no
  window titles or typed text, but other programs' lines in the same log can;
  read it before attaching it;
- for a proof or CI failure, the artifacts directory or the run URL.

For a security problem, follow [SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md) instead of
opening a public issue.
