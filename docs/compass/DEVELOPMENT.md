---
sidebar_position: 5
title: "DEVELOPMENT"
---

This guide covers setting up a development environment to build and contribute to Compass.

## Prerequisites

### Rust and Toolchain

Compass requires Rust. The toolchain is pinned in `rust-toolchain.toml` to ensure reproducible
builds:

- **Current development version**: 1.94.1
- **MSRV** (Minimum Supported Rust Version): 1.89 (enforced in CI)

Install Rust via [rustup](https://rustup.rs), which automatically fetches the pinned version:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Once rustup is installed, run any `cargo` command and it will fetch the pinned Rust 1.94.1
automatically.

### Node.js

Node.js is required for TypeScript builds, extension runtime generation, and some development
scripts.

- **Version**: 22.18 or later (for the `emoji` generation target)
- **npm**: comes with Node.js

Install from [nodejs.org](https://nodejs.org) or via your distribution's package manager.

### System Packages

Compass builds on Linux only. Its Wayland client needs the xkbcommon headers, which CI also
installs:

**Debian / Ubuntu:**

```sh
sudo apt install build-essential git pkg-config libxkbcommon-dev
```

**Fedora:**

```sh
sudo dnf install @development-tools git pkg-config libxkbcommon-devel
```

**Arch:**

```sh
sudo pacman -S base-devel git pkg-config libxkbcommon
```

### Development Tools

**Biome** (TypeScript formatter):
Installed via npm as part of the TypeScript workspace. See the extension development section
below.

**flatpak-cargo-generator.py** (for Flatpak builds):
Required only if you are packaging Compass as a Flatpak. Install via:

```sh
git clone https://github.com/flatpak/flatpak-builder-tools.git
export PATH="$PATH:$(pwd)/flatpak-builder-tools"
```

**Flatpak** (optional, for testing Flatpak builds):

```sh
# Debian / Ubuntu
sudo apt install flatpak flatpak-builder

# Fedora
sudo dnf install flatpak flatpak-builder

# Arch
sudo pacman -S flatpak
```

**QEMU and Podman** (optional, for higher-tier tests):
Required only for the VM and container test tiers:

```sh
# Debian / Ubuntu
sudo apt install podman qemu-system-x86-64

# Fedora
sudo dnf install podman qemu-system-x86-64

# Arch
sudo pacman -S qemu-full podman
```

## Build and Run Locally

### Quick Start

Build the Compass engine and open the launcher:

```sh
make dev
```

This runs `cargo build --workspace` and then `cargo run -p compass -- start`, starting the engine
with the launcher open.

### Build Release Binary

For an optimized build:

```sh
cargo build --release -p compass
./target/release/compass start
```

### Using Nix (Optional)

If you have Nix and [direnv](https://direnv.net) installed, the development environment is
automatically loaded when you enter the repository:

```sh
cd compass
# direnv loads the Nix dev shell automatically
```

Without direnv, enter the dev shell manually:

```sh
nix develop
```

The dev shell includes Rust, Node.js, and all necessary build tools. Run `make dev` as usual
inside the Nix shell.

## Running Tests

Compass uses a **test ladder** with four tiers, each proving different aspects of the system.
Start with the cheapest tier that answers your question.

### Test Ladder Overview

| Tier | Command | Time | Proves |
|---|---|---|---|
| **t0** | `make test-t0` | seconds | Logic: unit + integration tests |
| **t1** | `make test-t1` | ~3 s/backend | Paint: renderer produces correct pixels |
| **t2** | `make test-t2` | ~92 s | Session: real Mutter + portal in a container (requires Podman) |
| **t3** | `make test-t3` | ~30 min | Target: real GNOME in a VM (CI only) |

### Per-Edit Loop

The fastest combined test:

```sh
make test-fast    # t0 + t1: logic and paint
```

### Individual Tiers

**t0 — Logic tests** (no display needed):

```sh
make test-t0
```

**t1 — Paint tests** (GPU rendering):

```sh
make test-t1
```

This runs on both wgpu (if a Vulkan adapter exists) and tiny-skia. On a machine without Vulkan
drivers:

```sh
sudo apt install mesa-vulkan-drivers   # Debian/Ubuntu
```

**t2 — Container session** (requires Podman):

```sh
make test-t2
```

**t3 — VM tier** (CI only, but runnable locally via GitHub Actions):

```sh
gh workflow run vm-tier.yaml --ref $(git branch --show-current)
```

### Rust CI Checks

Run the checks that the Rust CI job runs:

```sh
make check-rust
```

This runs:

1. Formatting check (`cargo fmt --all -- --check`)
2. Linting (`cargo clippy --workspace --all-targets -- -D warnings`)
3. Tests (`cargo test --workspace --all-targets` and `cargo test --workspace --doc`)

The Rust CI job also runs an advisory module-size report, which `make check-rust` does not:
`python3 scripts/architecture/module-size.py` warns about any Rust file under `crates/` over
1500 lines that is not in `scripts/architecture/allowlist.txt` (#330). It never fails the build.
Split a new oversized file, or allowlist it with the issue that tracks the split.

## Formatting and Linting

Always run these before submitting a PR:

```sh
make format          # Format Rust and TypeScript
make lint-rust       # Run Clippy
```

Separately:

```sh
cargo fmt --all              # Format Rust
cd src/typescript && biome format --write .   # Format TypeScript
```

## Code Organization

For an overview of what each crate does, see [docs/crates.md](https://github.com/tuna-os/compass/blob/main/docs/crates.md). Start there when you're
making a change to understand which crate owns the logic you're modifying.

## Separation of Concerns

- **`compass-ui`**: Presentation layer (Iced widgets)
- **`compass-core`**: Application logic (state, ranking, config, commands)
- **`compass-search`**: Fuzzy matching
- **`compass-*`**: Specialized subsystems (platform, sandbox, extensions, storage, IPC)

Logic that a test would want to check belongs in a testable crate, not in the UI.

## Architecture Decisions

Key design decisions are recorded in [docs/rust-engine/adr/](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/adr). Read these before
proposing significant architectural changes.

## Extension Development

### TypeScript Extension SDK

Extensions use the `@vicinae/api` SDK (Compass is fork-compatible with Vicinae):

```sh
cd src/typescript/api
npm install
```

### Create a New Extension

```sh
# In the launcher, run "Create Extension" command
```

or manually:

```sh
npm install -g @vicinae/cli

# Then follow the prompts
vici create
cd my-extension
npm install
npx vici develop
```

See [docs/extensions.md](https://github.com/tuna-os/compass/blob/main/docs/extensions.md) for full details.

## Common Tasks

### Regenerate Protocol Bindings

After editing `figura/*.fig`:

```sh
make figen
```

### Update Emoji Database

Regenerate the glyph table (requires Node 22.18+):

```sh
make emoji
```

### Update Flatpak Dependencies

Regenerate the offline dependency manifest:

```sh
make flatpak-sources
```

Requires `flatpak-cargo-generator.py` on `PATH`.

### Build and Test Flatpak

```sh
make flatpak-rust
make flatpak-run
```

### Benchmark

Measure performance against the pinned upstream release:

```sh
just bench-compare
```

See [docs/rust-engine/BENCHMARKS.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/BENCHMARKS.md) for details.

## Troubleshooting

### `cargo` command fails or hangs

Ensure rustup has fetched the pinned toolchain:

```sh
rustup show
```

The output should show `1.94.1`.

### Biome formatting fails in TypeScript

Ensure Node.js is installed and up to date. Check:

```sh
node --version   # should be 22.18 or later
```

### t1 tests fail with "no Vulkan driver"

Install GPU drivers for testing:

```sh
# Debian/Ubuntu
sudo apt install mesa-vulkan-drivers

# Or use software rendering (already tested)
ICED_TEST_BACKEND=tiny-skia cargo test -p compass-ui --test paint
```

### `make dev` fails with missing dependencies

Ensure all prerequisites are installed:

```sh
cargo build --workspace
make check-rust    # runs full check suite
```

## Getting Help

- [CONTRIBUTING.md](https://github.com/tuna-os/compass/blob/main/CONTRIBUTING.md): How to report bugs and contribute
- [AGENTS.md](https://github.com/tuna-os/compass/blob/main/AGENTS.md): Coding rules and crate separation
- [docs/rust-engine/RENDER-HARNESSES.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RENDER-HARNESSES.md): Testing guide
- [docs/crates.md](https://github.com/tuna-os/compass/blob/main/docs/crates.md): Crate organization
- [GitHub Issues](https://github.com/tuna-os/compass/issues): Report bugs or discuss features
