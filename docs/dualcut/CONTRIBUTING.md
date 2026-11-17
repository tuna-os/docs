---
sidebar_position: 2
title: "Contributing"
---

> **Deprecation notice:** New development has moved to
> [shrimply](https://github.com/soirihiroka/shrimply). Please port useful
> ideas there instead of starting new feature work in this repository. See
> [DEPRECATED.md](https://github.com/tuna-os/dualcut/blob/main/DEPRECATED.md).

Thanks for helping with **dualcut** — the GNOME video editor with dual usage:
edit manually in the timeline/inspector, or programmatically via a live JSON
document, TypeScript scripts, and an HTTP API.

This guide covers how to build, what to read before you start, and what CI
checks your contribution must pass.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Before you start

Read these — they are short and will save you (and reviewers) time:

- **[CONTEXT.md](https://github.com/tuna-os/dualcut/blob/main/CONTEXT.md)** — the domain glossary. The words used across
  the document schema, engine, UI, and docs have exact meanings; when they
  appear in code or issues, they mean precisely what this file says.
- **[AGENTS.md](https://github.com/tuna-os/dualcut/blob/main/AGENTS.md)** — how the project document works and the
  surfaces for editing it (file / HTTP / TS scripts). Required reading if
  your change touches the document model, ops, or rendering.
- **[PARITY.md](https://github.com/tuna-os/dualcut/blob/main/PARITY.md)** — where dualcut stands against mainstream
  editors, split GUI vs. backend. Check it if your change adds a feature.
- **[ROADMAP.md](https://github.com/tuna-os/dualcut/blob/main/ROADMAP.md)** — the native, GPU-accelerated rewrite plan.
  `engine/` is the current implementation.

## Project layout

| Path | What lives here |
|---|---|
| `engine/` | The Rust engine: document model (`engine/src/document.rs`), rendering (GStreamer Editing Services), the HTTP server, the GTK4/libadwaita UI |
| `engine/schema/` | The canonical document schema: `dualcut.d.ts` (TS types) + `dualcut.schema.json` (JSON Schema) |
| `skills/dualcut/references/` | Bundled copies of the schema used by the agent skill — **must stay byte-identical** to `engine/schema/` (CI enforces this) |
| `docs/` | `USER_GUIDE.md` (user documentation), `guide/` (screenshots), `recipes/`, `adr/` |
| `tests/` | Integration / render smoke tests |
| `scripts/` | Release and build scripts (`release.sh` builds the Flatpak on every `v*` tag) |

## Setting up a dev environment

The [Flatpak manifest](https://github.com/tuna-os/dualcut/blob/main/engine/build-aux/org.tunaos.dualcut.json) is the
canonical dependency list for the shipped app. The names of native packages
differ by platform; [`engine/Cargo.toml`](https://github.com/tuna-os/dualcut/blob/main/engine/Cargo.toml) defines the enabled
Rust features and native version requirements. In particular, `preview`
now needs **libadwaita >= 1.8**. The headless `render` and `serve`
binaries do not need GTK/libadwaita.

### Rust (all native platforms)

Install stable Rust using [rustup](https://rustup.rs/), then run:

```sh
rustup update stable
rustup default stable
rustup component add clippy rustfmt
rustc --version
cargo --version
```

Use a current stable compiler: the engine uses Rust edition 2024 and its
locked dependencies may need a newer compiler than the edition minimum.
Run commands below from the repository root unless stated otherwise.

### Fedora (CI environment)

```sh
sudo dnf install -y cargo rust clippy clang-devel pkgconf-pkg-config \
  gtk4-devel libadwaita-devel gstreamer1-devel \
  gstreamer1-plugins-base-devel gst-editing-services-devel \
  gstreamer1-plugins-good gstreamer1-plugins-bad-free \
  gstreamer1-plugins-base-tools gstreamer1-plugins-good-extras \
  gstreamer1-plugin-libav mesa-vulkan-drivers python3-pillow \
  xorg-x11-server-Xvfb xset xz
```

CI uses Fedora 45; [ci.yml](https://github.com/tuna-os/dualcut/blob/main/.github/workflows/ci.yml) is authoritative for
its package list and checks. In this workflow, Rust comes from the Fedora
packages; use either those packages or rustup consistently.

### Ubuntu / Debian

```sh
sudo apt update
sudo apt install -y build-essential git curl pkg-config clang libclang-dev \
  cmake ninja-build xz-utils libgtk-4-dev libadwaita-1-dev \
  libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libges-1.0-dev \
  gstreamer1.0-tools gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav \
  mesa-vulkan-drivers python3-pil xvfb x11-xserver-utils
```

On Ubuntu, enable the `universe` repository if packages such as
[`libges-1.0-dev`](https://packages.ubuntu.com/search?keywords=libges-1.0-dev)
are unavailable. Install Rust as described above. Do not use an older
compiler from the distribution. Check the UI prerequisite before you build:

```sh
pkg-config --modversion gtk4 libadwaita-1
pkg-config --atleast-version=1.8 libadwaita-1
```

Ubuntu 24.04 and Debian 12 ship libadwaita older than 1.8. Their native
packages can support headless development, but cannot build `preview` as
configured. Use a newer distribution with compatible packages, the Fedora
container below, or the GNOME SDK from the Flatpak manifest for UI work.
Do not lower the Cargo feature requirement to silence a version error.

### macOS (Intel and Apple Silicon, Homebrew)

Install the Xcode command-line tools (`xcode-select --install`) and
[Homebrew](https://brew.sh/), including its printed `brew shellenv` setup.
Then install native dependencies and Rust as above:

```sh
brew install pkgconf gstreamer gtk4 libadwaita cmake ninja llvm
export PKG_CONFIG_PATH="$(brew --prefix)/lib/pkgconfig:$(brew --prefix)/share/pkgconfig${PKG_CONFIG_PATH:+:$PKG_CONFIG_PATH}"
export LIBCLANG_PATH="$(brew --prefix llvm)/lib"
pkg-config --modversion gstreamer-1.0 gst-editing-services-1.0 gtk4 libadwaita-1
pkg-config --atleast-version=1.8 libadwaita-1
```

Homebrew's [GStreamer formula](https://formulae.brew.sh/formula/gstreamer)
now contains GES and the plugin sets; separate `gst-*` formulae are no longer
needed. `brew --prefix` handles `/opt/homebrew` on Apple Silicon and
`/usr/local` on Intel. Keep the terminal, Rust target, and Homebrew packages
on the same architecture (`uname -m`; `rustc -vV`). On Apple Silicon, avoid
mixing Rosetta Intel libraries with an ARM Rust compiler. Do not combine
Homebrew libraries with a separate GStreamer framework or MacPorts tree.

macOS is a native development path, not a CI-tested release target. Start
with the headless build below. GTK uses its macOS backend; Linux Xvfb,
Wayland, and Vulkan-driver package instructions do not apply. GPU preview
and the `scripting` feature may expose platform-specific issues. When you
file a bug, report the feature that fails and the tool/library versions.

### NixOS / Nix development shell

For a Linux shell that does not change system packages, save this as a local
`shell.nix` (the repository does not maintain a pinned flake):

```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    cargo rustc clippy rustfmt pkg-config clang cmake ninja
  ];
  buildInputs = with pkgs; [
    gtk4 libadwaita libclang vulkan-loader mesa
    gst_all_1.gstreamer gst_all_1.gst-editing-services
    gst_all_1.gst-plugins-base gst_all_1.gst-plugins-good
    gst_all_1.gst-plugins-bad gst_all_1.gst-plugins-ugly
    gst_all_1.gst-libav
  ];
  LIBCLANG_PATH = "${pkgs.libclang.lib}/lib";
}
```

Enter with `nix-shell`, then run the verification below. Use a nixpkgs
revision that provides libadwaita >= 1.8 and a current Rust compiler. For
reproducibility, pin that revision with your Nix tooling. Retain the
lock/pin alongside your local shell; `<nixpkgs>` alone follows your channel
and is not reproducible. See the [NixOS GStreamer guide](https://wiki.nixos.org/wiki/GStreamer)
for plugin discovery in shells. On non-NixOS Linux, GPU work may also
need host-driver integration; use headless tests first.

### Isolated Linux environment (Podman or Docker)

From the repository root, enter the same Fedora release used by CI:

```sh
podman run --rm -it --userns=keep-id \
  -v "$PWD:/work:Z" -w /work quay.io/fedora/fedora:45 bash
```

For Docker, replace `podman` with `docker` and omit `--userns=keep-id`;
files created by Docker's root user may need their ownership restored on
the host. Inside the container, run the Fedora installation command above
as root (omit `sudo`), then the verification and checks below. Source and
`engine/target` persist in the mounted checkout; installed packages disappear
on exit. This is a disposable development shell, not a pinned image.

This command supports headless builds/tests. It does not forward a desktop
session or GPU. For the UI smoke test use CI's Xvfb recipe; for interactive
UI work use a native Linux desktop or a separately configured display/GPU
container. On macOS, Podman/Docker need their Linux VM.

### Verify the environment and build

```sh
pkg-config --modversion gstreamer-1.0 gst-editing-services-1.0
gst-inspect-1.0 --version
gst-inspect-1.0 nlecomposition
gst-inspect-1.0 textoverlay
gst-inspect-1.0 x264enc
gst-inspect-1.0 avenc_aac
cd engine
cargo build --locked --bin render --bin serve
# Render the built-in demo (no external media needed):
cargo run --locked --bin render -- /tmp/dualcut-check.mp4
# Optional UI (requires libadwaita >= 1.8 and a desktop session):
cargo run --locked --features preview,vector,scripting --bin preview -- examples/demo-project.json
```

GES is a library: verify its development files with `pkg-config` and its
NLE runtime elements with `gst-inspect-1.0 nlecomposition`. Do not
assume that a plugin named `ges` exists. Remove `/tmp/dualcut-check.mp4`
after you check the rendered video. Run the full CI checks in the
next section before you submit changes.

### Troubleshooting

- **Missing `.pc` file / GTK version error:** install development packages,
  not only runtime libraries. Inspect `pkg-config --modversion` for the
  library named in the error. `PKG_CONFIG_PATH` must point at the same
  package manager and architecture as your compiler. A version below 1.8
  for libadwaita needs a newer environment for `preview`.
- **Missing GStreamer element / codec:** inspect the named element directly
  with `gst-inspect-1.0`. MP4 export needs `x264enc` and `avenc_aac`; install
  the ugly and libav plugin sets (bundled by Homebrew). Use
  `GST_DEBUG=2` on the command that fails for discovery errors. Check for stale
  `GST_PLUGIN_PATH` / `GST_PLUGIN_SYSTEM_PATH` overrides that point at another
  installation before you change them. `pkg-config` success alone does not
  prove runtime plugins are present.
- **Rust edition or MSRV error:** update stable Rust and check `which cargo`
  and `rustc -vV` for an older distribution compiler that shadows rustup.
  Keep `Cargo.lock`; if you delete it, the dependency set changes.
- **libclang or `scripting` build failure:** check the clang development
  package / `LIBCLANG_PATH`. The `scripting` feature uses rusty_v8 and may
  download a target-specific archive; a proxy or unsupported target can
  fail independently of GTK. Try the headless build without optional
  features to isolate it.
- **No display / GPU adapter:** `serve` and basic renders work without a
  desktop. `preview` needs a graphical session; the `vector` feature needs a
  GPU backend that works (or a compatible software driver). For smoke tests
  of the Linux UI, use the CI Xvfb recipe. Do not force a Wayland session.

## Making a change

1. **Branch from `main`** — use a descriptive name, e.g.
   `git checkout -b fix/crossfade-offset` or `feat/export-webm`.
2. **Keep commits focused** and sign them with DCO:
   `git commit -s` (your commit must carry a `Signed-off-by` trailer).
3. **Run the checks CI will run** before pushing:

   ```sh
   # 1. Schema copies must be byte-identical to the agent skill bundle
   diff engine/schema/dualcut.d.ts skills/dualcut/references/dualcut.d.ts
   diff engine/schema/dualcut.schema.json skills/dualcut/references/dualcut.schema.json

   # 2. Clippy — warnings are errors
   (cd engine && cargo clippy --all-features -- -D warnings)

   # 3. Unit tests
   (cd engine && cargo test --all-features)

   # 4. Release render build (vector feature)
   (cd engine && cargo build --release --features vector)
   ```

4. **Open a PR** describing what changed and why; link any related issue.

### If you change the schema

`engine/schema/dualcut.d.ts` and `engine/schema/dualcut.schema.json` are the
canonical types — update **both**, then copy them into
`skills/dualcut/references/` so the bundled agent skill stays in sync. CI
fails if they drift.

### If you change docs

- User-facing behavior belongs in `docs/USER_GUIDE.md`.
- CI does not commit screenshots to `main`. The `screenshots` workflow
  uploads them as the `guide-screenshots` artifact, and its job summary
  says when `docs/guide/` is out of date. If your change makes them out of
  date, download that artifact and commit it to `docs/guide/` in your pull
  request.
- Recipes (e.g. auto-captions) live in `docs/recipes/`.
- Architectural decisions go in `docs/adr/`.

## Code of conduct

Be respectful and constructive. Follow the same norms as the rest of the
TunaOS organization (see the [org-level Code of Conduct](https://github.com/tuna-os/.github/blob/main/CODE_OF_CONDUCT.md)).

## Questions?

Open an issue — the maintainers and the automated hive agents monitor the
tracker. For anything about the document model specifically, `CONTEXT.md`
and `AGENTS.md` are the authoritative references.
