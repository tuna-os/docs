---
sidebar_position: 7
title: "ALMA RUST BOOTSTRAP"
---

`tunaos-rust193` builds the official checksum-pinned Rust 1.93 source release
with the signed native Alma Rust/Cargo 1.92 compiler. Upstream's release
`src/stage0` identifies 1.92 as its bootstrap predecessor:
https://raw.githubusercontent.com/rust-lang/rust/1.93.0/src/stage0

The package installs rustc, Cargo, and the standard libraries at
`/opt/tunaos/rust-1.93`. It does not provide or replace the system `rust` or
`cargo` packages. COSMIC background needs the isolated package
on Alma and selects its fixed binary path. Other target paths stay unchanged.

Bootstrap uses local `/usr/bin/rustc` and `/usr/bin/cargo`, offline vendored
dependencies, locked dependency resolution, source LLVM, and disabled CI
compiler/LLVM/GCC downloads. The policy for Alma supplies C/C++ and
Rust flags; bootstrap copies those measured flags into its configuration.
The native host triple must match the actual execution architecture.

This is candidate source preparation. Actual CI must prove native bootstrap,
signed installation, compiler execution and ELF/runtime/CPU closure on all
four Alma/Kitten architecture combinations. All build budgets stay fixed.

The LLVM and Rust builds may exceed a job budget.
That outcome blocks supply. A later job must resume authenticated work.
Do not use binaries from another distribution to meet this requirement. The compiler must provide Rust 1.93 or newer.

## Source requirements

These release manifests declare `rust-version = "1.93"`.
Each URL matches the release tag in its factory recipe.
A source requirement does not prove a successful build or CPU compatibility.

| Consumer | Release manifest |
| --- | --- |
| cosmic-app-library | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-app-library/epoch-1.9.0/Cargo.toml) |
| cosmic-bg | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-bg/epoch-1.9.0/Cargo.toml) |
| cosmic-files | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-files/epoch-1.9.0/Cargo.toml) |
| cosmic-comp | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-comp/epoch-1.9.0/Cargo.toml) |
| cosmic-greeter | [epoch-1.10.0](https://raw.githubusercontent.com/pop-os/cosmic-greeter/epoch-1.10.0/Cargo.toml) |
| cosmic-initial-setup | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-initial-setup/epoch-1.9.0/Cargo.toml) |
| cosmic-notifications | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-notifications/epoch-1.9.0/Cargo.toml) |
| cosmic-launcher | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-launcher/epoch-1.9.0/Cargo.toml) |
| cosmic-session | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-session/epoch-1.9.0/Cargo.toml) |
| cosmic-osd | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-osd/epoch-1.9.0/Cargo.toml) |
| cosmic-settings | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-settings/epoch-1.9.0/Cargo.toml) |
| cosmic-term | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-term/epoch-1.9.0/Cargo.toml) |
| cosmic-workspaces | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-workspaces-epoch/epoch-1.9.0/Cargo.toml) |

The full Alma CI run `38083963027` also exposed a Rust 1.93 requirement
in the locked dependencies of `cosmic-panel`.
Three more consumers pin `libcosmic` commits that declare Rust 1.93:

| Consumer | Release lockfile | Locked libcosmic manifest |
| --- | --- | --- |
| cosmic-applets | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-applets/epoch-1.9.0/Cargo.lock) | [03c8f93](https://raw.githubusercontent.com/pop-os/libcosmic/03c8f93b294ad239ea935f6dd3c14a15acde8d0d/Cargo.toml) |
| cosmic-osk | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-osk/epoch-1.9.0/Cargo.lock) | [87ab817](https://raw.githubusercontent.com/pop-os/libcosmic/87ab8179e1bd9880239c340855ae8862034bd0e8/Cargo.toml) |
| cosmic-settings-daemon | [epoch-1.9.0](https://raw.githubusercontent.com/pop-os/cosmic-settings-daemon/epoch-1.9.0/Cargo.lock) | [d921602](https://raw.githubusercontent.com/pop-os/libcosmic/d921602cde8248c070b493ce43b0edd388e19b9a/Cargo.toml) |

All 17 consumers select the isolated provider on Alma and Kitten only.
Other recipes retain their existing compiler inputs.
