---
sidebar_position: 1
sidebar_label: "suite-common-rust"

status: unknown
---

> ⚠️ **This crate has been superseded.**
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
> instead, or extract it from there if standalone publishing is desired.
>
> This repository is retained for historical reference only.

## Overview & API Summary

`suite-common-rust` (`suite_common_rs`) provides foundational GTK4 and libadwaita UI scaffolding routines:

- `make_app(id: &str) -> adw::Application`: Constructs an `adw::Application` instance with automatic libadwaita initialization.
- `make_header_bar() -> adw::HeaderBar`: Builds a standard header bar with an integrated hamburger menu (`About`).
- `make_toolbar() -> gtk4::Box`: Builds a horizontal formatting toolbar with linked toggle buttons (`B`, `I`, `U`).
- `is_dark_mode() -> bool`: Queries system color scheme preference via `adw::StyleManager`.

## Migration

```toml
# Instead of this crate, use:
[dependencies]
suite-common = { git = "https://github.com/tuna-os/gtk-office-suite", rev = "c3f3f2bead236afe75fe30871a6f624f4e671e08", package = "suite-common" }
suite-common-core = { git = "https://github.com/tuna-os/gtk-office-suite", rev = "c3f3f2bead236afe75fe30871a6f624f4e671e08", package = "suite-common-core" }
```

Keep both dependencies on the same reviewed full commit SHA. Update the `rev`
deliberately when adopting upstream changes so dependency review remains
reproducible.

## Testing & Contributing

Install the stable Rust toolchain (including Cargo) and the native GTK4 and
libadwaita development libraries before building. The maintained
[gtk-rs Linux installation guide](https://gtk-rs.org/gtk4-rs/stable/latest/book/installation_linux.html)
lists the packages for Fedora, Debian, and Arch derivatives; use the equivalent
vendor packages on other platforms.

```bash
cargo test
```

The test process can exit successfully without a display, but most tests then
return before asserting widget behavior. Run it in a graphical session or with
a display runner to exercise the GTK4 and libadwaita assertions.

See [CONTRIBUTING.md](https://github.com/tuna-os/suite-common-rust/blob/main/CONTRIBUTING.md) for contribution guidelines, local testing notes, and DCO requirements.
