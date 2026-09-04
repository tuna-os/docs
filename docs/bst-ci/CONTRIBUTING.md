---
sidebar_position: 2
title: "Contributing"
---

Thank you for contributing to `bst-ci`! This repository provides shared, reusable GitHub Actions workflows and build-matrix orchestration scripts for BuildStream-based desktop image builds across `tuna-os` (such as `tuna-os/tromso` and `tuna-os/xfce-linux`).

## Development and Local Verification

All workflows and scripts in this repository can be verified locally without requiring BuildStream, Podman, or a live chunked build runner.

### 1. Running Unit Tests

Unit tests cover the build matrix planning logic (`scripts/ci-build-matrix.py`) and static `.bst` element linting (`scripts/lint_bst.py`).

Prerequisites:
- Python 3.10+
- `pytest` and `PyYAML`

```bash
pip install pytest pyyaml
pytest tests/pytest/ -v
```

### 2. Workflow and YAML Linting

Workflows in `.github/workflows/` are linted using `actionlint` and `yamllint`. Ensure any modified YAML files pass local linting:

```bash
yamllint .github/workflows/
actionlint
```

### 3. Static `.bst` Element Linting

`scripts/lint_bst.py` performs structural checks and junction cross-reference verification on `.bst` files without fetching external junction repositories:

```bash
# Structural check on an element tree
python3 scripts/lint_bst.py path/to/elements

# Check unconfirmed dependencies on newly added elements
python3 scripts/lint_bst.py path/to/elements --check-new path/to/elements/new-element.bst
```

## Guidelines for Changes

1. **Preserve Interface Contracts**: Before modifying `inputs:` or `outputs:` in `.github/workflows/multirunner-build.yml`, verify compatibility against consumer repositories (`tuna-os/tromso` and `tuna-os/xfce-linux`).
2. **DCO Sign-off**: All commits must include a `Signed-off-by:` line (`git commit -s`).
3. **No Direct Merges**: Open a Pull Request for review.
