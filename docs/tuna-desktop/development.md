---
sidebar_position: 14
title: "development"
---

Welcome to Tuna Desktop. This guide covers everything you need to set up your development environment, understand the codebase structure, and contribute to the project.

## Prerequisites

### Rust toolchain

- **Rust stable** with `rustfmt` and `clippy`, from [rustup.rs](https://rustup.rs):
  `rustup component add rustfmt clippy`. CI builds with the current stable
  toolchain. No crate declares a `rust-version` (MSRV); all crates use
  edition 2021, and some dependencies need a recent stable compiler. The
  [API stability policy](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md#minimum-supported-rust-version)
  explains why and what would change it.
- **Git**.

### System packages

The list below is what the CI `check` job installs on Ubuntu 24.04
(`.github/workflows/ci.yml`); it is enough to build, lint and test the
whole workspace:

```sh
sudo apt-get install -y \
  libseat-dev libinput-dev libudev-dev libgbm-dev libdrm-dev \
  libxkbcommon-dev pkg-config libgtk-4-dev libpipewire-0.3-dev \
  libfontconfig1-dev librsvg2-common libadwaita-1-dev libgweather-4-dev \
  libpam-wrapper libpam0g-dev libclang-dev zstd \
  libglib2.0-dev libglib2.0-bin libglib2.0-dev-bin \
  python3-yaml gsettings-desktop-schemas \
  meson ninja-build libwayland-dev wayland-protocols
scripts/ci-install-gtk4-layer-shell
```

Ubuntu 24.04 does not package gtk4-layer-shell, which the GTK shell links;
`scripts/ci-install-gtk4-layer-shell` builds it from source and installs it
under `/usr/local`. The `pipewire` crate also needs libclang (`libclang-dev`)
at build time; GitHub's runners have it preinstalled. `libpam-wrapper` is
only needed for the lock-screen PAM test, which skips without it.

To run a nested session, also install the libraries the nested backend
loads at startup and, on a machine without a display, Xvfb:

```sh
sudo apt-get install -y libxkbcommon-x11-dev libegl1 libgl1-mesa-dri libgbm1 xvfb
```

Each proof script needs a few more packages; [running tests locally](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md)
lists them per script.

On Arch Linux (TunaOS Marlin's base), the `arch-package` CI job builds with:

```sh
sudo pacman -S --needed base-devel git rust pkgconf clang pipewire gtk4 \
  gtk4-layer-shell libadwaita libgweather-4 libxkbcommon libxkbcommon-x11 mesa wayland \
  dbus glib2 seatd libinput systemd-libs libdrm \
  libsecret libcanberra sound-theme-freedesktop gnome-settings-daemon gnome-session \
  librsvg glycin gdk-pixbuf2 fontconfig adwaita-fonts namcap
```

### Spektacular CLI (planning work only)

Building, testing and running Tuna Desktop do not need Spektacular. You need it
only to read or change specs and plans, which are managed through the
[Spektacular](https://github.com/hivecommons/spektacular) CLI rather than by
editing `.spektacular/` by hand. It is a Go program; with a Go toolchain
installed:

```sh
go install github.com/hivecommons/spektacular@latest
export PATH="$(go env GOPATH)/bin:$PATH"
spektacular version check
```

## Project Structure

The project is a Cargo workspace with eight crates. The crate manifests and
existing crate `README.md` files describe their purpose and dependencies.

```
tuna-desktop/
├── crates/
│   ├── backlight/            # tuna-backlight: bounded backlight/owned-connector reads
│   ├── compositor/           # tuna-compositor and tuna-session binaries (Smithay)
│   ├── shell-control-schema/ # tuna-shell-control: compositor/shell IPC protocol
│   ├── shell-host/           # tuna-shell-host: original shell binary and shared shell logic
│   ├── shell-gtk/            # tuna-shell-gtk: GTK4/libadwaita shell (ADR 0006)
│   ├── wallpaper/            # tuna-wallpaper: wallpaper decoding
│   ├── wallpaper-svg/        # tuna-wallpaper-svg: bounded native stream helper
│   └── magnifier/            # tuna-magnifier: shared session magnifier settings
│
├── docs/                     # architecture, roadmap, test strategy, ADRs, guides
├── packaging/                # Arch package and Marlin image (scripts/tuna-release builds the .deb)
├── scripts/                  # nested launcher, proof scripts, release and ledger tools
├── tests/                    # a11y golden trees, GNOME 51 reference container
└── Cargo.toml                # workspace configuration and pinned dependencies
```

## Setting Up Your Environment

1. **Clone the repository:**

   ```bash
   git clone https://github.com/tuna-os/tuna-desktop.git
   cd tuna-desktop
   ```

2. **Build all crates:**

   ```bash
   cargo build --workspace
   ```

3. **Run the tests** (see [running tests locally](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md) for clippy,
   fmt and the nested proofs CI runs):

   ```bash
   cargo test --workspace
   ```

The compositor also supports a nested-only build without its default DRM and
XWayland features:

```sh
cargo build --locked -p tuna-compositor --no-default-features
cargo check --locked -p tuna-compositor --no-default-features
```

The existing CI `check` job runs the second command to guard this configuration.
Winit rendering and its shared scene/damage tracking remain available; disabling
default features does not remove the nested backend's EGL/GLES requirements.

## Running the Nested Compositor

The nested compositor runs inside your current Wayland or X11 session for safe development and testing. It creates a Tuna Desktop session as a client of your host display.

### First-time setup

```bash
# Build and start a nested Tuna Desktop session
./scripts/tuna-nested run
```

This command:

- Builds `tuna-compositor` and `tuna-shell-host` (debug build)
- Starts the compositor on a private socket (named `tuna-nested-<pid>` by default)
- Logs output to `~/.local/state/tuna-nested/tuna-nested-<pid>/nested.log`
- Displays the socket name and log path for reference

The session runs until you press Ctrl+C or terminate the process.

### Testing shell crashes and recovery

Tuna Desktop implements a supervised shell-host restart mechanism. Test it with:

```bash
# In one terminal, start the nested session:
./scripts/tuna-nested run

# In another terminal, simulate a shell crash:
./scripts/tuna-nested kill-shell --socket tuna-nested-<pid>
```

The compositor will:

1. Detect the shell-host crash
2. Display a recovery overlay
3. Restart the shell-host automatically within a bounded restart budget
4. Keep all application connections alive during the restart

See `docs/nested-session.md` for details on the crash recovery design.

## Understanding Spektacular Workflows

Tuna Desktop uses Spektacular for planning and tracking implementation work. Each work item has:

- **Spec**: A specification document (in `.spektacular/specs/`)
- **Plan**: Implementation roadmap and checklist (in `.spektacular/plans/`)
- **Context**: Mutable tracking state and work artifacts

### Common Spektacular commands

```bash
# List specs (use the full timestamp-prefixed name in later commands)
spektacular spec file list

# Start the plan workflow for a spec
spektacular plan new --data '{"name":"<full spec name>"}'
```

Run `spektacular <command> --help` for the rest. For more details, see the [Spektacular repository](https://github.com/hivecommons/spektacular) and [CONTRIBUTING.md](https://github.com/tuna-os/tuna-desktop/blob/main/CONTRIBUTING.md).

Spektacular is initialized for Codex. Each program unit has a spek plus a
draft plan, context and research artifacts. Review a draft plan against the
current implementation and open decision gates before its implementation
workflow starts.

### Continuing from the first spek

The first spek is
[nested compositor and shell recovery](https://github.com/tuna-os/tuna-desktop/blob/main/.spektacular/specs/20260927170317-a01f0011-001-nested-compositor-shell-recovery.md).
Use a spek's full timestamp-prefixed name from `spektacular spec file list`:

```sh
spektacular version check
spektacular plan new --data '{"name":"20260927170317-a01f0011-001-nested-compositor-shell-recovery"}'
```

The plan workflow refreshes its draft from the current source and the
linked spek. Complete its walkthrough and review before starting
implementation; the implementation workflow then starts with the full plan
name.

## Architecture and Design

For deeper understanding of Tuna Desktop's design:

- **Architecture overview**: Read `docs/architecture.md` for the compositor/shell separation, nested recovery design, and long-term roadmap
- **Design decisions**: Check `docs/adr/` (Architecture Decision Records) for rationale on key choices (e.g., Smithay pinning, backend selection)
- **Verification strategy**: See `docs/test-strategy.md` for how we validate each layer (unit tests, protocol probes, integration tests, hardware qualification)
- **Test strategy and matrix**: Tuna Desktop targets multiple environments, GPU configurations, and client types; the test strategy document details the coverage plan

## Workflow for contributors

1. **Choose a spec**: Find an open spec in `.spektacular/specs/` or create one
2. **Review the plan**: Check the associated plan in `.spektacular/plans/` for implementation guidance
3. **Implement**: Edit crates as needed, using the test strategy guide to add tests
4. **Test locally**: Follow [running tests locally](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md) and use `./scripts/tuna-nested run` to validate
5. **Create a PR**: Reference the spec number and plan state in your PR body
6. **Update spec/plan state**: Once merged, update the spec and plan in Spektacular to reflect completion

## Common tasks

### Adding a new protocol feature

1. Define the protocol in `crates/shell-control-schema/`
2. Implement compositor side in `crates/compositor/`
3. Implement shell-host side in `crates/shell-host/`
4. Add a protocol probe in `.spektacular/work/` if appropriate
5. Document the change in `docs/adr/` if it's a significant choice

### Writing a test

- Unit tests: Add inline tests in the crate (follow `#[cfg(test)]` patterns)
- Protocol probes: Add scripts under `scripts/`
- Nested integration: Use `./scripts/tuna-journey` as a base or add a new harness

**Timing rule (#72).** Never gate a test on a fixed iteration budget or a
sleep length: a loaded CI runner exhausts both. Wait on a wall-clock
deadline that is generous (seconds, not milliseconds) and only makes a
slow run slower, or make the ordering deterministic (a latch the test
releases, a manual clock, a counter of finished workers). Assert on
state, never on elapsed time, except for explicit no-hang bounds. There
is no retry policy for deterministic tests: `gh run rerun --failed` is a
diagnostic, not a fix.

### Debugging

- Compositor logs: Check the output of `./scripts/tuna-nested run` or tail the log file; [nested session troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md#troubleshooting) explains the common lines
- Shell-host logs: Printed to the same log file as the compositor
- Nested shell interaction: Use `./scripts/tuna-nested shell-pid` to identify the shell process for attaching a debugger
- Build, install, login and CI problems: [troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md)
- Logs in a GDM session, restarting the shell, the lock screen and debuggers: [session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md)
- Trace output and every other variable the code reads: [environment variables](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md)

### Performance

See the [performance profiling guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/performance-profiling.md). It covers
local `perf` and Sysprof profiling, the compositor's `frame_cost` state,
RSS/PSS memory measurement, the paired GNOME 51 comparison, and the CI
regression gates.

## Reporting issues

If you find a bug or have a feature request:

1. Check existing issues in the repository
2. Open a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Environment (distro, GPU, Rust version, Tuna Desktop commit); [filing a bug](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md#filing-a-bug) lists the details and the commands that print them
3. Reference relevant specs in `.spektacular/specs/` if applicable

## Further reading

- **Nested session architecture**: `docs/nested-session.md`
- **Roadmap**: `docs/roadmap.md` for the full vision and current priorities
- **Smithay documentation**: https://docs.rs/smithay/latest/smithay/
- **Wayland protocol specs**: https://wayland.freedesktop.org/
- **Spektacular**: https://github.com/hivecommons/spektacular

Welcome to the project, and happy hacking!
