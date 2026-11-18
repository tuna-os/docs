---
sidebar_position: 2
title: "Contributing"
---

Thank you for your contribution to `bst-ci`! Other repositories can call the shared workflows for GitHub Actions in this repository. The repository also supplies the scripts that make the build matrix for BuildStream desktop images across `tuna-os` (such as `tuna-os/tromso` and `tuna-os/brussels`).

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Development and Local Verification

You can verify all workflows and scripts in this repository on your own machine. You do not need BuildStream, Podman, or a live runner for a chunked build.

### 1. Run the Unit Tests

The unit tests cover the logic that plans the build matrix (`scripts/ci-build-matrix.py`). They also cover the static lint of `.bst` elements (`scripts/lint_bst.py`).

Prerequisites:

- Python 3.10+
- `pytest` and `PyYAML`

```bash
pip install pytest pyyaml
pytest tests/pytest/ -v
```

CI also runs `ruff` on the Python files. The rules are in `ruff.toml`:

```bash
pip install ruff
ruff check .
```

### 2. Lint the Workflows and the YAML

CI uses `actionlint` and `yamllint` to lint the workflows in `.github/workflows/`. Make sure that each YAML file that you change passes these linters on your machine.

The `yamllint` job in `.github/workflows/test.yml` checks the full tree with a relaxed configuration (`config_data`). The default `yamllint` configuration reports errors that CI does not report, for example long lines. To get the CI result, use the same configuration:

```bash
yamllint -d '{extends: default, rules: {line-length: disable, document-start: disable, truthy: disable, comments-indentation: disable, braces: {level: warning, max-spaces-inside: 1}, brackets: {level: warning, max-spaces-inside: 1}}}' .
actionlint
```

If you change `config_data` in `test.yml`, change this command too.

### 3. Static Lint of `.bst` Elements

`scripts/lint_bst.py` does structural checks on `.bst` files. It also cross-checks the junction references in them. It does not fetch the external junction repositories:

```bash
# Structural check on an element tree
python3 scripts/lint_bst.py path/to/elements

# Check unconfirmed dependencies on newly added elements
python3 scripts/lint_bst.py path/to/elements --check-new path/to/elements/new-element.bst
```

### 4. Lock the Actions

`.github/workflows/actions-security.yml` runs on each pull request and on each push to `main`. It has two jobs:

- `lockfile` runs `gh actions-lock --verify` from the [`github/gh-actions-lock`](https://github.com/github/gh-actions-lock) extension. The job fails when `.github/workflows/actions.lock` does not agree with the `uses:` lines in the workflows. It also fails when a locked pin does not verify upstream.
- `zizmor` runs the [zizmor](https://docs.zizmor.sh/) security linter on the workflows. The job fails when zizmor reports a problem.

The `gh actions-lock` command writes `actions.lock`. Do not edit that file by hand. The extension needs the GitHub CLI, and you must sign in with `gh auth login`. When you add a workflow or change a `uses:` line, run these commands from the root of the repository:

```bash
gh extension install github/gh-actions-lock --pin v0.4.1
gh actions-lock
```

Then commit the new lockfile in the same pull request. `gh actions-lock --verify-local` is an offline check. It makes sure that each `uses:` line has an entry in the lockfile. It does not verify the source of the pin.

If zizmor reports a problem that you accept, add a `# zizmor: ignore[<rule>] <reason>` comment to that line. The `uses:` line in `.github/workflows/ste.yml` has an example.

### 5. Check the Prose

`.github/workflows/ste.yml` checks Markdown prose against Simplified Technical English (ASD-STE100). It runs when a pull request changes a Markdown file, `.ste-budget` or `ste.yml`. It checks `README.md`, `CONTRIBUTING.md`, and the Markdown files in `docs/` and `blog/`. The linter and its rules are in `tuna-os/.github`.

`.ste-budget` holds the maximum number of findings. The value is `0`, thus one new problem fails the check. The log shows each problem with its file, line and rule. Do not increase the budget to make a pull request pass.

To run the check on your machine, you need Node.js 24 or later and a clone of `tuna-os/.github`. Run the linter from the root of this repository:

```bash
git clone https://github.com/tuna-os/.github ../tuna-os-dotgithub
node ../tuna-os-dotgithub/.github/actions/ste-lint/ste-lint.mjs --max 0
```

## Guidelines for Changes

1. **Keep the interface contracts**: Before you change `inputs:` or `outputs:` in `.github/workflows/multirunner-build.yml`, make sure that the consumer repositories (`tuna-os/tromso` and `tuna-os/brussels`) still work with them. For `.github/workflows/lint-bst.yml`, also check `tuna-os/athens`.
2. **DCO Sign-off**: All commits must include a `Signed-off-by:` line (`git commit -s`).
3. **No Direct Merges**: Open a Pull Request for review.
