---
sidebar_position: 2
title: "Contributing"
---

> ⚠️ **Notice: Deprecated Repository**
> `suite-common-rust` has been superseded by the [`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite) monorepo (`gtk-office-suite/suite-common/`).
> New features, expanded APIs, and core enhancements should be submitted directly to `gtk-office-suite`.

## Maintenance & Fixes

If submitting critical maintenance fixes to this legacy repository:

### Local Verification

This crate provides shared GTK4 and libadwaita UI components for Rust applications.

Before running the test suite, install the stable
[Rust toolchain](https://www.rust-lang.org/tools/install/) (including Cargo) and
the native GTK4 and libadwaita development libraries. Follow the maintained
[gtk-rs platform installation guide](https://gtk-rs.org/gtk4-rs/stable/latest/book/installation.html)
for the required vendor packages.

To run tests locally:

```bash
cargo test
```

> **Coverage note:** When GTK cannot open a display, most tests return before
> asserting behavior. A successful headless run therefore does not confirm the
> GTK helpers. Run the suite in a graphical session or with a display runner to
> exercise those assertions.

### Commit Guidelines & DCO

All contributions must include a Developer Certificate of Origin (DCO) sign-off line:
```bash
git commit -s -m "docs: add details for contributor guidelines"
```
