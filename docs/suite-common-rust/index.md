---
sidebar_position: 1
sidebar_label: "suite-common-rust"

status: unknown
---

> ⚠️ **The project replaced this crate.**
>
> The canonical `suite-common` implementation now lives in the
> [gtk-office-suite](https://github.com/tuna-os/gtk-office-suite) monorepo
> (`gtk-office-suite/suite-common/`).
>
> This standalone crate is an early extraction that contains only the original
> small set of GTK and libadwaita helpers. The actively maintained monorepo
> version has a substantially expanded API and includes `suite-common-core`.
>
> **Do not add new dependencies on this crate.** Use the monorepo version
> instead. If you must publish a standalone crate, extract it from the monorepo.
>
> The project keeps this repository only as a historical reference.

## Overview & API Summary

`suite-common-rust` (`suite_common_rs`) gives basic helper functions for GTK4 and libadwaita UIs:

- `make_app(id: &str) -> adw::Application`: Constructs an `adw::Application` instance with automatic libadwaita initialization.
- `make_header_bar() -> adw::HeaderBar`: Builds a standard header bar with an integrated hamburger menu (`About`).
- `make_toolbar() -> gtk4::Box`: Builds a horizontal text-style toolbar with linked toggle buttons (`B`, `I`, `U`).
- `is_dark_mode() -> bool`: Returns true when the system uses a dark color scheme. It reads this from `adw::StyleManager`.

## Migration

```toml
# Instead of this crate, use:
[dependencies]
suite-common = { git = "https://github.com/tuna-os/gtk-office-suite", rev = "c3f3f2bead236afe75fe30871a6f624f4e671e08", package = "suite-common" }
suite-common-core = { git = "https://github.com/tuna-os/gtk-office-suite", rev = "c3f3f2bead236afe75fe30871a6f624f4e671e08", package = "suite-common-core" }
```

Keep both dependencies on the same commit SHA, and use the full SHA that you
reviewed. Change the `rev` only when you adopt upstream changes, so that other
people can do the same dependency review again.

## Testing & Contributing

Before you build, install the stable Rust toolchain (with Cargo) and the native
GTK4 and libadwaita development libraries. The
[gtk-rs installation guide for Linux](https://gtk-rs.org/gtk4-rs/stable/latest/book/installation_linux.html)
gives the packages for Fedora, Debian, and Arch. On other platforms, use the
equivalent vendor packages.

```bash
cargo test
```

The test process can exit with success when it has no display. But then most
tests stop before they examine the widgets. Run it in a graphical session or with
a display runner to exercise the GTK4 and libadwaita assertions.

For contribution guidelines, notes about local tests, and DCO requirements, refer to [the contributor guide](https://github.com/tuna-os/suite-common-rust/blob/main/CONTRIBUTING.md).
For the observability assessment, refer to [docs/observability.md](https://github.com/tuna-os/suite-common-rust/blob/main/docs/observability.md).


## Contribute compute — no code needed

No time to write code? You can still push this project's backlog forward. A TunaOS AI-agent hive works on this repository. Lend the hive your AI subscription or API tokens, and your machine runs contributor tasks from this project's backlog.

- 🪸 [Contribute compute to the reef hive](https://reef.tunaos.org/contribute)
