---
sidebar_position: 2
title: "Contributing"
---

Thank you for contributing to `tuna-installer-xfce`! This document details development prerequisites, local testing procedures, and submission guidelines.

## Prerequisites

- **Python**: 3.10+
- **PyGObject & GTK3**: `python3-gobject`, `gtk3`
- **Testing**: `pytest`

### Fedora/RHEL Installation

```bash
sudo dnf install -y python3-gobject gtk3 python3-pytest
```

## Running Unit Tests

Execute the unit test suite across `tests/test_core.py` and `tests/test_readiness.py`:

```bash
pytest tests/
```

Alternatively, run via Python's standard `unittest` module:

```bash
python3 -m unittest discover tests/
```

## Local Development & Manual Testing

Run the GTK3 installer wizard directly:

```bash
./tuna-installer-xfce
```

Headless GUI screenshot generation and verification can be run via:

```bash
python3 tests/gui/capture-screens.py /tmp/screenshots
```

## Flatpak Packaging

To build and test the Flatpak manifest locally:

```bash
flatpak-builder --user --install --force-clean build flatpak/org.tunaos.InstallerXfce.json
flatpak run org.tunaos.InstallerXfce
```

## Pull Request Guidelines

- Ensure all pytest unit tests pass cleanly before submitting changes.
- Verify GTK3 UI components operate properly via keyboard navigation.
- Include Developer Certificate of Origin (DCO) sign-off on all commits (`git commit -s`).
