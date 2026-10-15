---
sidebar_position: 2
title: "Contributing"
---

> ⚠️ **Notice: Deprecated Repository**
> The [`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite) monorepo (`gtk-office-suite/suite-common/`) replaced `suite-common-rust`.
> Send new features, API changes, and core improvements directly to `gtk-office-suite`.

## Maintenance & Fixes

Use these steps when you send an important maintenance fix to this legacy repository.

### Local Verification

This crate provides shared GTK4 and libadwaita UI components for Rust applications.

Before you run the test suite, install the stable
[Rust toolchain](https://www.rust-lang.org/tools/install/) (including Cargo) and
the native GTK4 and libadwaita development libraries. For the necessary vendor
packages, refer to the
[gtk-rs installation guide](https://gtk-rs.org/gtk4-rs/stable/latest/book/installation.html).

To run tests locally:

```bash
cargo test
```

> **Coverage note:** When GTK cannot open a display, most tests stop before
> they examine the behavior. A successful headless run therefore does not confirm the
> GTK helpers. Run the suite in a graphical session or with a display runner to
> exercise those assertions.

### Commit Guidelines & DCO

All contributions must include a Developer Certificate of Origin (DCO) sign-off line:
```bash
git commit -s -m "docs: add details for contributor guidelines"
```


## Contribute compute — no code needed

No time to write code? You can still push this project's backlog forward. A TunaOS AI-agent hive works on this repository. Lend the hive your AI subscription or API tokens, and your machine runs contributor tasks from this project's backlog.

- 🪸 [Contribute compute to the reef hive](https://reef.tunaos.org/contribute)
