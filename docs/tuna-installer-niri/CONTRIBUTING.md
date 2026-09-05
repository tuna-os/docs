---
sidebar_position: 2
title: "Contributing"
---

Thank you for contributing to `tuna-installer-niri`! This document provides instructions for building, testing, and developing both the Go backend and QML frontend.

## Prerequisites

- **Go**: 1.24+ (for building and testing the installer backend; follow the
  version declared in `installer/go.mod`. The Flatpak build uses its own pinned
  toolchain.)
- **Quickshell**: Required for running the QML UI directly on Niri/Wayland
- **Python 3 & PyQt6**: (Optional) Required for running headless UI tests and screenshot generation

## Building & Testing

### Go Backend

To run backend tests:

```bash
cd installer
go test ./...
```

To build the backend binary:

```bash
cd installer
go build -o tuna-installer-backend .
```

### QML Frontend & Headless Testing

To launch the QML frontend directly using Quickshell:

```bash
cd installer && go build -o tuna-installer-backend .
TUNA_BACKEND=$PWD/tuna-installer-backend quickshell -p ../ui/installer.qml
```

To run headless UI tests and capture screen walkthroughs (without Quickshell/Wayland):

```bash
pip install PyQt6
python3 tests/gui/capture-screens.py /tmp/screenshots
```

## Flatpak Packaging

To build and test the Flatpak package locally:

```bash
flatpak-builder --user --install --force-clean build flatpak/org.tunaos.InstallerNiri.json
flatpak run org.tunaos.InstallerNiri
```

## Pull Request Guidelines

- Ensure `go test ./...` passes cleanly in `installer/`.
- Verify code readability and adhere to standard Go/QML formatting patterns.
- All commits must include DCO sign-off (`git commit -s`).
