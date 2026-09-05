---
sidebar_position: 1
sidebar_label: "finupdate"

status: unknown
---

**A modern GTK4/libadwaita system update frontend for Bluefin and Universal Blue**

Finupdate provides a graphical interface for running system updates on [Bluefin](https://projectbluefin.io) and Universal Blue systems. It orchestrates `bootc`, `flatpak`, `brew`, and `distrobox` directly — no `uupd` required. It's the first app in the Bluefin utility suite and serves as a reference implementation for future apps.

![GNOME 47+](https://img.shields.io/badge/GNOME-47%2B-blue)
![Rust](https://img.shields.io/badge/Rust-2024_edition-orange)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click system updates** — orchestrates `bootc`, `flatpak`, `brew`, and `distrobox` via a single pkexec elevation
- **Live log streaming** — real-time stdout/stderr from each update module
- **Elapsed timer** — shows how long the update has been running
- **Copy log** — clipboard integration for sharing output
- **Cancel support** — gracefully cancel a running update
- **Desktop notifications** — GNotification when update completes/fails
- **Reboot prompt** — confirmation dialog to restart after updates
- **Window close guard** — prevents accidental close during active updates
- **Last update time** — shows when `uupd` last ran successfully
- **Keyboard shortcuts** — Ctrl+Q (quit), Ctrl+? (shortcuts window)
- **About dialog** — accessible via hamburger menu
- **Flatpak sandbox aware** — uses `flatpak-spawn --host` when sandboxed
- **Dark mode** — automatic via libadwaita (follows system preference)
- **GNOME HIG compliant** — symbolic icons, proper spacing, accessibility

## Screenshots

The app has four states:

| Idle | Updating | Complete | Error |
|------|----------|----------|-------|
| Status page with "Check for Updates" button | Progress bar + live log + timer | Success page with reboot option | Error page with retry |

## Requirements

### Runtime
- GTK 4.16+ (GNOME 47+)
- libadwaita 1.7+
- `bootc` or `rpm-ostree` on the host system
- `flatpak`, `brew`, `distrobox` — optional; each module is skipped if the tool is absent
- `uupd` — optional; if present, enables the "Automatic background updates" toggle in Preferences

### Build
- Rust 1.85+ (edition 2024)
- Meson 0.59+
- GTK4 and libadwaita development headers

## Installing

Released builds are published to the TunaOS Flatpak remote for x86_64 and
aarch64:

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.finupdate
```

The remote is an OCI index backed by `ghcr.io/tuna-os/finupdate`; see
[tuna-os/flatpak-index](https://github.com/tuna-os/flatpak-index). Builds are
pushed by `.github/workflows/publish-flatpak.yml` on every push to `main`.

If a published build turns out to be broken, see
[runbooks/rollback-a-bad-finupdate-release.md](https://github.com/tuna-os/finupdate/blob/main/runbooks/rollback-a-bad-finupdate-release.md).

## Building

### Option A: Flatpak (recommended for testing)

```bash
# One-time: install the GNOME SDK and Rust extension
flatpak install flathub org.gnome.Sdk//50 org.gnome.Platform//50
flatpak install flathub org.freedesktop.Sdk.Extension.rust-stable//25.08
flatpak install flathub org.flatpak.Builder

# Build and install locally
flatpak run org.flatpak.Builder --user --install --force-clean _flatpak \
  build-aux/org.tunaos.finupdate.Devel.json

# Run
flatpak run org.tunaos.finupdate.Devel
```

### Option B: Native Meson build

Requires GTK4 and libadwaita dev packages installed:

```bash
# Fedora/Bluefin:
sudo dnf install gtk4-devel libadwaita-devel meson cargo

# Build
meson setup _build
meson compile -C _build

# Run
./_build/src/finupdate
```

### Option C: Cargo only (dev iteration)

If you have GTK4/libadwaita headers available (e.g., in a devcontainer):

```bash
cargo build          # Debug
cargo build --release  # Release
./target/release/finupdate
```

## Development

### Architecture

```
finupdate-core/src/       # GTK-free backend, reusable by GUI and CLI
├── service.rs           # UpdaterService interface and bootc implementation
├── registry_client/     # Image discovery, tag history, and family resolution
├── orchestrator.rs      # Privileged update runner protocol
├── update_worker.rs     # Update event stream and simulator
└── settings.rs          # GSettings preferences with JSON fallback

src/                      # GTK/libadwaita frontend and shared-library surface
├── main.rs              # GUI entry point and per-run test flags
├── app.rs               # Top-level relm4 application component
├── cli.rs               # Headless CLI entry point
├── ffi.rs               # C ABI used by the GNOME Settings panel
├── changelog_widget.rs  # Embeddable changelog widget
├── rebase_widget.rs     # Embeddable image-switching widget
└── ui/                  # Focused application views and dialogs
```

### State Machine

```
Idle ──[StartUpdate]──→ Updating ──[Complete]──→ Complete ──[Dismiss]──→ Idle
                            │                                              ↑
                            └──────[Error]──→ Error ──────[Retry/Dismiss]──┘
                            │
                            └──────[Cancel]──→ Idle
```

The backend boundary is enforced by the separate `finupdate-core` crate: it
does not depend on GTK and can be built and tested on a headless host. The GUI
crate re-exports that backend for compatibility, adds the relm4 application,
and exposes reusable widgets through the C ABI for the GNOME Settings panel.
See the module-level documentation in
[`finupdate-core/src/lib.rs`](https://github.com/tuna-os/finupdate/blob/main/finupdate-core/src/lib.rs) for the complete
backend map.

### Key Design Decisions

1. **relm4 over raw gtk4-rs** — Component model with message passing prevents callback spaghetti
2. **Tokio in a separate thread** — GTK owns the main thread; async I/O needs its own runtime
3. **mpsc channels (not callbacks)** — Decouples worker from UI; enables isolated unit testing
4. **gtk::Stack (not show/hide)** — Built-in crossfade transitions, no manual visibility management
5. **Imperative widget construction** — Some complex widgets built in `init()` when the view! macro can't express them

### Flatpak Sandbox Notes

When running in Flatpak, the app uses `flatpak-spawn --host` to execute commands on the host:
- Requires `--talk-name=org.freedesktop.Flatpak` in Flatpak manifest
- Detection: checks for `/.flatpak-info` file
- All host commands (uupd, systemctl) are automatically wrapped

### Environment Variables

| Variable | Effect |
|----------|--------|
| `RUST_LOG=finupdate=debug` | Enable debug logging |
| `RUST_LOG=trace` | Full trace output |
| `GTK_DEBUG=interactive` | GTK Inspector |

### Testing

```bash
# Run unit tests (Cargo or just)
cargo test --all-targets
just test

# Run Broadway GUI test suite
just gui-test
```

## Contributing

See [CONTRIBUTING.md](https://github.com/tuna-os/finupdate/blob/main/CONTRIBUTING.md) for development workflow and guidelines.

## Reusable Patterns

See [PATTERNS.md](https://github.com/tuna-os/finupdate/blob/main/PATTERNS.md) for documented architectural patterns that should be used by all future Bluefin utility apps.

## License

MIT — see [Cargo.toml](https://github.com/tuna-os/finupdate/blob/main/Cargo.toml)

## Related

- [Project Bluefin](https://projectbluefin.io) — the desktop OS this is built for
- [GNOME HIG](https://developer.gnome.org/hig/) — the design guidelines we follow
- [uupd](https://github.com/ublue-os/uupd) — optional host daemon; if installed, its timer can be toggled from Preferences
