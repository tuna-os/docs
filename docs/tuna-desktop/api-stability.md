---
sidebar_position: 6
title: "api stability"
---

This page records what the workspace crates promise to code that depends
on them, how the cross-process contracts between Tuna Desktop components
are versioned, which Rust toolchain is supported, and how dependencies are
pinned. Release (package) versioning is a separate policy, described in
[the release guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release.md) and
[ADR 0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md).

## Summary

- Every workspace crate is an **internal** crate. None is published to
  crates.io, and none makes a SemVer promise to outside users.
- The compositor and shell meet through **cross-process contracts**: the
  shell control protocol, D-Bus interfaces, and shared files. These are
  versioned on their own terms (below). A component built from one commit
  is only guaranteed to work with the other components from that commit.
- **No MSRV is declared.** The supported toolchain is the current stable
  Rust that CI installs.

## Crates and tiers

All crates are `version = "0.1.0"`, edition 2021, and have no `publish`
key in their manifests. A crates.io lookup for each package name returns
404, so none of them is published. Release builds stamp the binaries'
`--version` from the git tag through `TUNA_VERSION`, falling back to
`CARGO_PKG_VERSION` (`scripts/tuna-release:75-80`,
`crates/compositor/src/main.rs:27`). The crate versions are not bumped per
release.

| Crate | Kind | In-repo dependents | Tier |
|---|---|---|---|
| `tuna-shell-control` (`crates/shell-control-schema`) | library | compositor, shell-host, shell-gtk, backlight | internal; its wire format is a cross-process contract |
| `tuna-wallpaper` | library | compositor | internal |
| `tuna-backlight` | library | shell-gtk | internal |
| `tuna-magnifier` | library | compositor, shell-gtk | internal; its session JSON file is a cross-process contract |
| `tuna-shell-host` | library + `tuna-shell-host`, `tuna-ibus-bridge` binaries | shell-gtk | internal |
| `tuna-compositor` | library + `tuna-compositor`, `tuna-session` binaries | shell-host (tests only) | internal |
| `tuna-shell-gtk` | binary | none | internal |
| `tuna-wallpaper-svg` | binary | none | internal |

The crates could not be published as they stand. For example,
`tuna-compositor` depends on `tuna-wallpaper` by path with no version
(`crates/compositor/Cargo.toml:50`), which `cargo publish` rejects.

### What "internal" means

- Any public item may change or be removed in any commit, without a
  version bump or deprecation period.
- A change to a crate's public API migrates every in-repository caller in
  the same pull request. Do not leave compatibility shims or deprecated
  aliases behind.
- `pub` exists to cross crate boundaries inside the workspace. It is not an
  external API commitment.
- Each library's crate-level rustdoc states its tier, and each crate
  README links here.

### Tiers available later

- **unstable:** published as `0.x` for a named external consumer.
  Breaking changes bump the minor version (`0.x` → `0.(x+1)`), as Cargo's
  SemVer rules treat 0.x minor releases as breaking.
- **stable:** `1.x` or later, with a reviewed public API. Breaking changes
  require a major version bump.

No crate is in either tier today. Promoting a crate requires all of these
in the same change:

- a named consumer;
- manifest versions on all of its path dependencies;
- a declared `rust-version` (see below);
- a CI check of API compatibility against the last published version;
- an update to this page.

## Cross-process contracts

These are what actually has to stay compatible between running
processes.

### Shell control protocol (`tuna-shell-control`)

The protocol between the compositor and the shell is a `u32`
little-endian length prefix followed by a postcard body
([ADR 0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md)). Its version is
`ProtocolVersion { major, minor }`. `ProtocolVersion::CURRENT` in
`crates/shell-control-schema/src/lib.rs` is the single source of truth,
and its doc comment lists what each minor added.

**How peers check versions.**

- The compositor refuses a `Hello` with a different major, sending a typed
  `IncompatibleVersion` error. Otherwise it records the peer's minor
  (`crates/compositor/src/control.rs:509-522`).
- The shell accepts a compositor whose major matches and whose minor is
  not newer than its own (`ProtocolVersion::is_compatible_with`,
  `crates/shell-control-schema/src/lib.rs:211-217`;
  `crates/shell-host/src/control.rs:452-467`).
- Decoding rejects a foreign major before any other `Hello` handling
  (`lib.rs:2006-2013`).

**Postcard is positional.** Enum variants are encoded by index and struct
fields in order. Appending a variant or field therefore changes the bytes,
and the doc comments repeatedly note "Positional postcard peers must ship
together." The packages always ship the compositor and shells from one
commit. The rules for a wire change are:

1. Bump `minor` once per wire change, and add a line to the
   `ProtocolVersion::CURRENT` doc comment saying what it adds.
2. Append new `Message`, `CommandKind`, `StateOp` variants and new fields
   after the existing ones. Never reorder, remove or retype existing ones
   within a major.
3. When a message is new in minor N, the compositor sends it only to peers
   advertising minor N or later. Examples: `NativeOutputInventory` (0.37)
   and `AuthEvent` (0.44), in `crates/shell-control-schema/README.md`.
   Reject commands a peer's minor cannot have sent.
4. Bound every new collection and string at decode time (`MAX_*`
   constants, `DecodeError::CollectionTooLong`). Frames over
   `MAX_FRAME_BYTES` (1 MiB) are rejected before decoding.
5. Bump `major` only for a deliberate incompatible reset. The current
   major is 0.
6. **Concurrent pull requests.** Minor numbers are assigned at merge time.
   Develop against "main's minor + 1" and keep the schema additions easy to
   renumber. Before merge, rebase onto `origin/main`, take main's current
   minor + 1, append your variants after whatever main has, and update the
   minor-gated sends to the final number.

### D-Bus interfaces

- **GNOME interfaces** that Tuna Desktop serves, such as
  `org.gnome.Mutter.*`, `org.gnome.Shell.*` and `org.gnome.SessionManager`,
  follow the upstream GNOME 51 definitions. Their compatibility is
  GNOME's, not ours. Deviations are bugs unless documented
  ([portal and D-Bus integration](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-integration.md)).
- **Private `org.tuna.*` interfaces**, such as `org.tuna.Screenshot`
  (`crates/compositor/src/screenshot.rs:95`), are internal. Both sides
  ship together and may change in any commit.

### Shared files and names

- **Magnifier settings.** The shell writes a session-scoped JSON file that
  the compositor reads (`crates/magnifier/src/lib.rs:1-12`). It is
  internal, and both sides ship together.
- **Layer-shell namespaces.** The constants in
  `crates/shell-control-schema/src/layer_namespaces.rs` are shared so the
  shell and compositor cannot drift apart.

## Minimum supported Rust version

No crate declares `rust-version`, and there is no `rust-toolchain` file.
The supported toolchain is **the current stable Rust release**. CI's
build, lint and test jobs install `stable` through `dtolnay/rust-toolchain`
(`.github/workflows/ci.yml`). Two workflows pin their own toolchains for
reproducibility: fuzzing uses a dated nightly (`.github/workflows/fuzz.yml`)
and measured coverage a fixed stable (`.github/workflows/measured-coverage.yml`).

This is deliberate:

- the workspace ships binaries built in CI and packages, not libraries for
  outside consumers;
- the GTK 4, libadwaita, zbus and Smithay stacks raise their own minimums
  regularly;
- a declared MSRV would need its own CI job to stay true.

As a floor, not a promise: the highest `rust-version` declared by a
locked dependency is 1.92 (the gtk-rs 0.11/0.22 family), so older
compilers cannot build the workspace. List the declared values with:

```sh
cargo metadata --format-version 1 --locked | jq -r '.packages[] | select(.rust_version) | "\(.rust_version) \(.name)"' | sort -V | tail -5
```

Building with any toolchain older than current stable is unsupported, even
if it works. A crate promoted to the unstable or stable tier must declare
`rust-version` in its manifest and gain a CI job on that toolchain.

## Dependency pinning

- `Cargo.lock` is committed. Release builds use `--locked`
  (`scripts/tuna-release:81`, `packaging/arch/PKGBUILD:84`).
- `[workspace.dependencies]` in the root `Cargo.toml` pins the
  protocol-critical stack exactly (`=`):
  - `smithay`, `calloop`, `wayland-server`, `wayland-client`,
    `wayland-protocols` and `wayland-protocols-wlr`, per
    [ADR 0001](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0001-nested-backend-smithay-pin.md), for reproducible
    protocol behaviour;
  - `postcard`, because its encoding is the control-protocol wire format;
  - `rustix`, `xkbcommon` and `freedesktop-desktop-entry`.
- Other dependencies use ordinary caret requirements, for example
  `zbus = "6"`, `gtk4 = "0.11"` and `rhai = "1.26"`, and float within
  those ranges through lockfile updates.
- `smithay` and `reis` are patched to reviewed source snapshots in
  `third-party/` (`[patch.crates-io]` in `Cargo.toml`). Renovate is disabled
  for `third-party/**` (`renovate.json`), so those move only through an
  explicit upstream review.
- Renovate (`renovate.json`) and Dependabot (`.github/dependabot.yml`,
  weekly Cargo updates) open update PRs. Each must pass the same CI gates
  as any other change.
