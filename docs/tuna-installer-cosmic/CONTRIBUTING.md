---
sidebar_position: 2
title: "Contributing"
---

Thank you for contributing to `tuna-installer-cosmic`! This document provides guidelines and instructions for setting up your environment, making changes, running local verification, and submitting pull requests.

---

## Development Setup

### System Prerequisites

To build and test the COSMIC installer locally (Ubuntu/Fedora/Debian):

```bash
# System dependencies required by libcosmic and wgpu/rendering
sudo apt-get install -y pkg-config cmake clang \
  libwayland-dev libxkbcommon-dev libfontconfig-dev libfreetype-dev \
  libinput-dev libudev-dev libgbm-dev libegl1-mesa-dev libssl-dev

# Screenshot capture prerequisites (optional for capture testing)
sudo apt-get install -y mesa-vulkan-drivers xvfb imagemagick
```

Ensure you have Rust installed via [rustup](https://rustup.rs/) and `just` installed (`cargo install just` or via package manager).

---

## Local Verification Commands

Before opening a pull request, run the following verification steps:

### 1. Build and Check

```bash
# Compile debug build
just check
# or
cargo build

# Compile release build
cargo build --release
```

### 2. Unit Tests

The backend logic — recipe defaults and JSON serialization, encryption-choice
filtering, `os-release` parsing, offline and readiness detection — is covered by
unit tests. They are pure logic and open no window, so they need no compositor,
Vulkan ICD or Xvfb:

```bash
# Run the test suite
just test
# or
cargo test --locked

# Run it with coverage (writes lcov.info)
just coverage
```

`just coverage` needs `cargo-llvm-cov` (`cargo install cargo-llvm-cov`) and the
`llvm-tools-preview` component (`rustup component add llvm-tools-preview`).

### 3. Check Cargo Sources for Flatpak

If you mutate `Cargo.lock` or add/update dependencies, you **must** update `flatpak/cargo-sources.json`:

```bash
# Regenerate cargo sources
just cargo-sources

# Verify cargo sources match Cargo.lock
just check-cargo-sources
```

### 4. Screenshot Capture Tests

The repository renders and verifies screenshot assets for all wizard steps using headless Vulkan (lavapipe) and Xvfb:

```bash
# Run screenshot capture and generate walkthrough GIF
just capture

# Test the pixel gate selftest
just capture-selftest
```

---

## Pull Request Guidelines

1. **Keep Changes Scoped**: Focus PRs on a single bug fix, feature, or documentation update.
2. **DCO Sign-off Required**: All commits must include Developer Certificate of Origin sign-off (`git commit -s`).
3. **CI Checks**: Ensure the `cargo-sources` check, Flatpak build, and `screenshots` workflows pass in GitHub Actions. None of them runs the test suite, so run `just test` yourself before opening the PR.
4. **Do Not Merge Your Own PR**: PRs require review or automated merging.
