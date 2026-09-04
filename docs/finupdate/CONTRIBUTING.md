---
sidebar_position: 2
title: "Contributing"
---

Thank you for your interest in contributing to Finupdate and the Bluefin utility app ecosystem!

## Development Setup

Finupdate is designed for Bluefin and other immutable Fedora-based desktops. The recommended workflow uses **toolbox** for fast Rust iteration and **flatpak-builder** (via Flatpak) for full integration testing. This matches how GNOME apps are developed upstream.

### 1. Create a toolbox (one-time)

```bash
toolbox create finupdate
toolbox enter finupdate
```

Inside the toolbox, install build dependencies:

```bash
sudo dnf install -y \
  cargo rust \
  gtk4-devel libadwaita-devel \
  meson ninja-build \
  pkg-config
```

### 2. Install Flatpak build tools (on host, one-time)

```bash
flatpak install flathub org.flatpak.Builder
flatpak install flathub org.gnome.Sdk//50 org.gnome.Platform//50
```

### Quick Build & Test Cycle

```bash
# Fast cargo iteration — run inside toolbox:
toolbox run --container finupdate cargo build
toolbox run --container finupdate cargo check

# Full Flatpak build + install — run on host:
flatpak run org.flatpak.Builder --user --install --force-clean _flatpak \
  build-aux/org.tunaos.finupdate.Devel.json

# Run the Flatpak:
flatpak run org.tunaos.finupdate.Devel
```

Or use the `just` recipes (see [justfile](https://github.com/tuna-os/finupdate/blob/main/justfile)):

```bash
just build    # cargo check inside toolbox
just flatpak  # full Flatpak build + install
just run      # run the installed Flatpak
```

### Notes

- Keep `cargo build` and `flatpak-builder` output directories separate: toolbox builds go to `./target/`, Flatpak builds go to `./_flatpak/`. They don't conflict.
- `flatpak-builder` always builds inside the SDK sandbox — the toolbox is only for fast iteration.
- If you switch between the two, no cleanup is needed.

## Architecture Overview

Read [PATTERNS.md](https://github.com/tuna-os/finupdate/blob/main/PATTERNS.md) for the full architecture. Key principles:

1. **One component per file** — each relm4 component lives in its own `.rs` file
2. **Messages over callbacks** — all state changes happen through the relm4 message system
3. **Separate worker thread** — async I/O (subprocess, network) runs on tokio in a background thread
4. **State machine at app level** — the `AppState` enum drives all UI transitions

## Code Style

### Rust
- Follow standard `rustfmt` formatting (default config)
- Use `tracing` macros (`tracing::info!`, `tracing::error!`) not `println!`
- All public items need doc comments (`///`)
- Module-level doc comments (`//!`) explain the *pattern*, not just what the code does
- Prefer explicit error messages over `.unwrap()` in production paths

### GTK/Adwaita
- **No hardcoded pixel values** for spacing — use CSS classes (`margin-12`, etc.) or Adwaita defaults
- **No custom colors** — rely on Adwaita style classes (`suggested-action`, `destructive-action`, `dim-label`)
- **Symbolic icons only** — always use `name-symbolic` suffix
- **AdwStatusPage for states** — idle, error, success, and empty states
- **AdwToast for transient feedback** — "copied to clipboard", "update complete"

### Accessibility
- Every icon-only button must have `set_tooltip_text` AND `set_accessible_label`
- Keyboard navigation must work for all interactive elements
- Test in both light and dark mode

## Making Changes

### Adding a New Feature

1. Identify which layer owns the feature (`finupdate-core` for GTK-free backend
   behavior, `app.rs` for application state, or a focused module under `src/ui/`)
2. Add message variants to the appropriate `Input`/`Output` enum
3. Implement the handler in `update()`
4. Update the view! macro or init() if new widgets are needed
5. Update PATTERNS.md if the feature introduces a new pattern

### Adding a New Component

```bash
# Create the file:
touch src/ui/my_component.rs

# Add to src/ui/mod.rs:
pub mod my_component;
```

Then implement using the `#[relm4::component(pub)]` macro. See `log_view.rs`
for a small component or `update_list.rs` for a larger one.

### Modifying the Flatpak Manifest

The manifest is at `build-aux/org.tunaos.finupdate.Devel.json`. Key things:

- **New D-Bus permissions**: add to `finish-args` → `--talk-name=...`
- **New system access**: add to `finish-args` → `--filesystem=...`
- **SDK version changes**: update both `runtime-version` and `sdk-extensions` version

### Data Files

All data files use Meson templates (`.in` suffix) with placeholder substitution:
- `@APP_ID@` → the full application ID (includes `.Devel` suffix in dev builds)
- `@ICON@` → the icon name (matches APP_ID)

If you add a new data file, register it in `data/meson.build`.

## Commit Messages

Follow conventional commits:
```
feat: add feature description
fix: what was broken and how it's fixed
build: build system changes
docs: documentation only
refactor: code changes that don't add features or fix bugs
```

Include the Co-authored-by trailer for AI-assisted commits.

## Before Submitting a PR

Run through the HIG compliance checklist in [PATTERNS.md](https://github.com/tuna-os/finupdate/blob/main/PATTERNS.md#6-hig-compliance-checklist).

Quick sanity checks:
- [ ] `toolbox run --container finupdate cargo build` compiles cleanly with no warnings
- [ ] `toolbox run --container finupdate cargo clippy` passes
- [ ] `just test` (or `cargo test --all-targets`) passes all unit tests
- [ ] `just gui-test` passes Broadway GUI verification
- [ ] App launches and the new feature works visually
- [ ] Dark mode looks correct
- [ ] Keyboard navigation works
- [ ] No hardcoded colors or pixel values

## File Map

| File | Purpose |
|------|---------|
| `justfile` | `just` recipes for common dev tasks |
| `Cargo.toml` | Rust dependencies and metadata |
| `meson.build` | Top-level Meson build (deps, subdirs) |
| `meson_options.txt` | Build profile option (development/release) |
| `src/main.rs` | Entry point (logging, app launch) |
| `finupdate-core/src/config.rs` | Build-time constants |
| `finupdate-core/src/config.rs.in` | Meson template for config.rs |
| `finupdate-core/src/lib.rs` | GTK-free backend module map and boundary |
| `finupdate-core/src/service.rs` | Updater service interface and bootc implementation |
| `finupdate-core/src/registry_client/` | Image registry queries and family resolution |
| `finupdate-core/src/orchestrator.rs` | Privileged update runner protocol |
| `finupdate-core/src/update_worker.rs` | Update event stream and simulator |
| `finupdate-core/src/settings.rs` | GSettings preferences with JSON fallback |
| `src/app.rs` | Main window component + state machine |
| `src/ui/mod.rs` | UI module declarations |
| `src/ui/log_view.rs` | Scrollable log output |
| `src/ui/update_list.rs` | Per-module update cards with Nerd Mode |
| `src/ui/preferences.rs` | Preferences dialog |
| `src/changelog_widget.rs` | Embeddable changelog widget for the Settings panel |
| `src/rebase_widget.rs` | Embeddable image-switching widget for the Settings panel |
| `src/ffi.rs` | C ABI exported to the Settings panel |
| `src/meson.build` | Cargo build integration |
| `data/meson.build` | Install desktop/metainfo/icons |
| `data/*.desktop.in` | Desktop entry template |
| `data/*.metainfo.xml.in` | AppStream metadata template |
| `data/icons/*.svg` | App icons (regular + symbolic) |
| `build-aux/*.json` | Flatpak manifests (Devel + release) |
| `build-aux/dist-vendor.sh` | Vendor cargo deps for `meson dist` |
| `PATTERNS.md` | Reusable patterns for Bluefin apps |
| `CONTRIBUTING.md` | This file |

## Getting Help

- Open an issue at https://github.com/tuna-os/finupdate/issues
- Reference the [GNOME Developer Documentation](https://developer.gnome.org/)
- Reference the [relm4 book](https://relm4.org/book/stable/)
- Reference the [gtk4-rs docs](https://gtk-rs.org/gtk4-rs/stable/latest/docs/gtk4/)
