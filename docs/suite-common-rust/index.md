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
> This standalone crate (48 lines, gtk4-rs 0.9, libadwaita 0.7) is an early
> extraction that has fallen behind the monorepo version (760+ lines,
> gtk4-rs 0.11, libadwaita 0.9, plus `suite-common-core`).
>
> **Do not add new dependencies on this crate.** Use the monorepo version
> instead, or extract it from there if standalone publishing is desired.
>
> This repository is retained for historical reference only.

## Migration

```toml
# Instead of this crate, use:
[dependencies]
suite-common = { git = "https://github.com/tuna-os/gtk-office-suite", package = "suite-common" }
suite-common-core = { git = "https://github.com/tuna-os/gtk-office-suite", package = "suite-common-core" }
```
