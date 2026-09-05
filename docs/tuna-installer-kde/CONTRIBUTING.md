---
sidebar_position: 2
title: "Contributing"
---

Thank you for contributing to `tuna-installer-kde`, the Qt 6 / Kirigami
frontend that drives the [fisherman](https://github.com/tuna-os/fisherman)
bootc install backend! This document covers the local build/test workflow
and pull request guidelines.

## Prerequisites (Fedora)

Kirigami and Kirigami Addons are QML-only and resolved at runtime from the
QML import path — nothing links against KF6 at build time.

```bash
sudo dnf install -y cmake gcc-c++ ninja-build \
    qt6-qtbase-devel qt6-qtdeclarative-devel \
    kf6-kirigami kf6-kirigami-addons kf6-qqc2-desktop-style breeze-icons
```

## Build

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
./build/tuna-installer-kde
```

## Running Tests

### Backend unit tests (CTest / QtTest)

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Debug -DBUILD_TESTING=ON
cmake --build build
ctest --test-dir build --output-on-failure
```

### Screenshot capture harness

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_CAPTURE=ON
cmake --build build
./build/tuna-installer-capture
```

## Flatpak

Build and run the packaged app locally:

```bash
flatpak-builder --user --install --force-clean build-flatpak flatpak/org.tunaos.InstallerKde.json
flatpak run org.tunaos.InstallerKde
```

## Code style

- C++: match the existing style in `src/` (the codebase has no
  `.clang-format` yet — follow the conventions of the file you are editing).
- QML: one `SetupModule` per wizard step under
  `modules/<name>/contents/ui/main.qml`, using Kirigami/Kirigami Addons
  components and `Kirigami.Units` for metrics rather than hardcoded pixel
  values.
- JSON (the fisherman recipe schema, Flatpak manifest, Renovate config,
  and walkthrough screenshot metadata): formatted per `biome.json`.

## Pull requests

- Open pull requests against `main`.
- Run the backend test suite (`ctest`) before submitting.
- Describe which wizard screen(s) or recipe fields are affected, and note
  any change to the [recipe contract](https://github.com/tuna-os/tuna-installer-kde/blob/main/README.md#recipe) — it is shared
  with the other TunaOS installer frontends.
