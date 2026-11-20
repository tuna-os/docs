---
sidebar_position: 6
title: "crates"
---

Compass is a Cargo workspace (`crates/`) plus the TypeScript extension SDK and runtime
(`src/typescript/`). This page says what each part is for and where to start on a given kind of
change. Each crate's own module documentation (`cargo doc --workspace --no-deps --open`) goes into
the detail, and the [architecture decisions](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/README.md) record why it is shaped this
way.

## The rule that shapes it

`compass-ui` is presentation: it turns state into Iced widgets and input into messages. The
decisions live in crates that can be tested without a display, mostly `compass-core`. Shared
crates must not depend on Linux-specific ones; `crates/compass-platform/tests/the_seam_holds.rs`
checks that, and the crates allowed to be Linux-bound are marked below. [AGENTS.md](https://github.com/tuna-os/compass/blob/main/AGENTS.md)
has the full rules.

## The binary and the UI

| Crate | What it is |
|---|---|
| `compass` | The `compass` command: the CLI, the engine (`compass serve`, the IPC server and the services it runs), on-demand startup from `toggle`/`show`/`query`, and the wiring of every other crate. Linux-bound. |
| `compass-ui` | The Iced launcher window: every view, the settings, the onboarding flow. |

## Application logic

| Crate | What it is |
|---|---|
| `compass-core` | Application state and the decisions about it: the app index and ranking, frecency, `compass.json`, commands, the calculator, snippets, themes, the extension stores, Rhai and script commands' manifests, and more. No UI dependency. |
| `compass-search` | Fuzzy matching: the matcher and the weighted-field searchable trait every list uses. |
| `compass-xdg` | Desktop entries, MIME associations, XDG directories and terminals. |

## Storage

| Crate | What it is |
|---|---|
| `compass-db` | Schema migrations shared by every database. The migrations match upstream Vicinae's, so an existing profile keeps working. |
| `compass-sqlcipher-sys` | Opens Compass's databases: rusqlite over SQLCipher, keyed. One of the two crates allowed `unsafe` ([ADR-0019](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr/0019-an-unsafe-bridge-for-the-launchers-surface.md)). |
| `compass-crypto` | The clipboard history's encryption at rest, and the keys kept in the desktop keyring. |
| `compass-clipboard` | The clipboard history store. |
| `compass-local-storage` | Per-extension key/value storage, as the Raycast `LocalStorage` API sees it. |
| `compass-oauth-store` | Extensions' OAuth token sets. |

## Extensions

| Crate | What it is |
|---|---|
| `compass-extension-api` | The seam every extension tier sits behind. |
| `compass-worker-host` | Runs TypeScript extension workers: the framing to the Node runtime, the API services they call, cgroup memory limits. Linux-bound. |
| `compass-sandbox` | The Landlock filesystem boundary and seccomp filter a worker runs behind, and `compass-sandbox-exec`, which applies them. |
| `compass-script` | Rhai scripts, the in-process extension tier ([RHAI-SCRIPTS.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RHAI-SCRIPTS.md)). |
| `compass-ipc` | The engine's Unix-socket protocol, used by the CLI and the launcher window. |
| `compass-figura` | Generates the TypeScript bindings for the extension runtime's protocol from `figura/*.fig` (`make figen`). |

## Platform

| Crate | What it is |
|---|---|
| `compass-platform` | What the platform can be asked to do, as traits, so other platforms can be added as backends. |
| `compass-platform-linux` | The Linux implementations: launching, and compositor IPC for KWin, Hyprland and niri, among others. Linux-bound. |
| `compass-wayland` | Wayland protocols beyond what Iced provides: activation, layer shell, foreign toplevels, data control, hotkeys, the virtual keyboard. Used on wlroots compositors, never on GNOME. Linux-bound. |
| `compass-wayland-protocols` | Generated bindings for Wayland protocols no published crate carries yet. Linux-bound. |
| `compass-wayland-foreign` | Turns the toolkit window's raw Wayland handles into proxies. The other crate allowed `unsafe`. Linux-bound. |
| `compass-portals` | The XDG desktop portals Compass uses, such as GlobalShortcuts. Linux-bound. |
| `compass-shell` | The client for the Compass GNOME Shell extension (`extensions/gnome-shell`). Linux-bound. |
| `compass-power` | Power actions over systemd-logind. Linux-bound. |
| `compass-media` | Media players over MPRIS. Linux-bound. |
| `compass-input-server` | The small privileged helper behind snippet keyword expansion. Linux-bound. |
| `compass-a11y-linux` | The launcher window's accessibility tree on AT-SPI, through AccessKit's Unix adapter (ADR-0022). Linux-bound. |

## Tests

| Crate | What it is |
|---|---|
| `compass-testkit` | Shared fixtures, corpora and the harnesses described in [RENDER-HARNESSES.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RENDER-HARNESSES.md). |

## TypeScript and other directories

| Path | What it is |
|---|---|
| `src/typescript/api` | The extension SDK, published as `@vicinae/api` so store extensions run unchanged, and the `vici` CLI that builds and develops extensions. |
| `src/typescript/extension-manager` | The extension runtime the engine runs under Node (`make extension-runtime`). |
| `src/typescript/raycast-api-compat` | The Raycast API compatibility layer. |
| `extensions/gnome-shell` | The GNOME Shell helper extension. |
| `extensions/rhai-examples` | The Rhai scripts Compass ships. |
| `extensions/raycast-linux-overrides.json` | Per-extension Linux fixes for Raycast extensions, including the host programs each may run ([RAYCAST-LINUX-SHIM.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RAYCAST-LINUX-SHIM.md)). |
| `figura/` | The IDL for the extension runtime's protocol. |
| `packaging/` | Flatpak, AppImage, Arch, Nix and Homebrew packaging ([packaging/README.md](https://github.com/tuna-os/compass/blob/main/packaging/README.md)). |

## Where to start

| You want to change… | Start in |
|---|---|
| How results are found or ranked | `compass-core` (`root_items`, `rank`, `apps`) and `compass-search` |
| A setting | `compass-core::config` and `compass-core::settings_catalog`, then the view in `compass-ui` |
| How a view looks or responds to keys | `compass-ui` |
| A builtin command | `compass-core::commands` for what it is, `compass-ui` for its view |
| What extensions can do | the SDK in `src/typescript/api`, the service in `compass-worker-host`, the protocol in `figura/` |
| What extensions may touch | `compass-sandbox` and `compass::extension_runner` |
| A desktop integration | `compass-platform` for the trait, `compass-platform-linux` or `compass-wayland` for Linux |
| Packaging | `packaging/` and `scripts/packaging/` |
