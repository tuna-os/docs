---
sidebar_position: 3
title: "Contributing"
---

TunaOS Packages contains several package pipelines. Before you change a
package, identify which pipeline owns it and preserve that pipeline's source,
build, install, and runtime gates.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Get started

1. Fork the repository and clone your fork.
2. Create a feature branch from the latest `main`.
3. Read [ARCHITECTURE.md](https://github.com/tuna-os/tunaos-packages/blob/main/ARCHITECTURE.md) and the documentation for the
   pipeline you plan to change.
4. Make the smallest package, manifest, and test changes needed.
5. Run focused checks, then the full repository check where practical.
6. Push the feature branch and open a pull request. Do not push directly to
   `main`.

Useful pipeline references:

- [Package factory contract](https://github.com/tuna-os/tunaos-packages/blob/main/docs/PACKAGE_FACTORY.md) — supported targets,
  source policy, promotion gates, and `packages/*/package.yaml` recipes
- [Patch policy](https://github.com/tuna-os/tunaos-packages/blob/main/docs/PATCH_POLICY.md) — when and how to carry downstream patches
- [GNOME 50 repository publication](https://github.com/tuna-os/tunaos-packages/blob/main/docs/GNOME50-REPO-PUBLISH.md) — operator
  steps for the native EL10 repository
- [XFWL4 port guide](https://github.com/tuna-os/tunaos-packages/blob/main/docs/XFWL4-PORTING.md) — target-specific XFCE/XFWL4
  packages
- [Upstream parity register](https://github.com/tuna-os/tunaos-packages/blob/main/docs/UPSTREAM_PARITY.md) — source and behavior
  differences that need explicit records
- [Withdrawing a shadowed package](https://github.com/tuna-os/tunaos-packages/blob/main/docs/WITHDRAWN-PACKAGES.md) — removing a
  served build from a target's index without deleting it, when upstream
  ships a newer one

`AGENTS.md` contains additional GNOME 49/50 conventions. Its scope note lists
the package families it does and does not cover.

## Choose the correct package layout

Do not create a generic source directory or tarball unless the package spec
needs one. Existing packages use one of these layouts:

| Path | Use |
| --- | --- |
| `src/<family>/<package>/` | Native RPM spec, patches, and source metadata |
| `packages/<package>/package.yaml` | Package-factory recipe for supported cross-distribution targets |
| `packaging/<format>/` | Shared format-specific packaging and helpers |
| `build-order*.yml` | Native build dependency order |
| `manifests/` | Factory catalog, dependency trees, target queues, and build contracts |

Start from a nearby package in the same family. If adding a package-factory
recipe, use `packages/_template/package.yaml` and declare only targets the
recipe can build and verify. Keep native EL10 compatibility work in the native
RPM pipeline until the package meets the promotion contract.

When you change a native spec:

- keep the package after its build-time dependencies in the applicable
  `build-order*.yml` file;
- place patches beside the owning spec and follow `docs/PATCH_POLICY.md`;
- record manual changes to GNOME specs or sources in `SRPM-CHANGES.md` where that
  log applies; and
- add a focused regression test for compatibility or pipeline behavior that
  is not evident from a successful build alone.

## Validate changes

Install the pinned Python tools that CI uses:

```bash
python3 -m pip install -r requirements-ci.txt
```

This file pins pytest, pytest-cov, PyYAML, jsonschema and ruff. `just check` runs ruff
first, so without ruff it stops before the tests start.

Run focused tests during development. For example:

```bash
python3 -m pytest tests/test_parse_build_order.py -v
python3 scripts/parse-build-order.py build-order.yml --validate
```

Run the repository's combined fast checks before you submit:

```bash
just check
```

This runs three checks: the `ruff.toml` lint policy (`just lint-python`, with
E501 excluded), the Python test suite, and validation of the primary
build-order manifest. CI also checks YAML, shell scripts, every build-order
manifest, and the Bats suite. If your change touches shell workflows, install Bats and run
the relevant file under `tests/bats/`; see
[`tests/bats/README.md`](https://github.com/tuna-os/tunaos-packages/blob/main/tests/bats/README.md) for setup and examples.

Two other CI checks can fail a pull request:

- The `actions-security` workflow verifies `.github/workflows/actions.lock`
  and scans the workflows with zizmor. If you change a `uses:` line in a
  workflow, update `actions.lock` in the same pull request.
- The `Prose` workflow (`ste.yml`) checks `README.md`, `CONTRIBUTING.md`,
  `SECURITY.md` and the files in `docs/` against Simplified Technical English.
  `.ste-budget` holds the current number of problems. One new STE problem in
  these files makes the check fail. To run the same linter, you
  need Node.js and a clone of [tuna-os/.github](https://github.com/tuna-os/.github).
  From the root of this repository, run:

  ```bash
  node ../.github/.github/actions/ste-lint/ste-lint.mjs --max "$(cat .ste-budget)"
  ```

  Change `../.github` if you cloned tuna-os/.github to a different directory.

For a local RPM build, use the target declared by the owning pipeline:

```bash
./scripts/build-local.sh <package> <target>
```

Container and Mock builds are slower than the fast checks. Run the relevant
build when practical and state clearly in the pull request when it was not run.
A build alone is not a release gate: package promotion also needs a clean
staged install and the applicable runtime or desktop validation.

## Pull requests

Include in the pull request description:

- package family and target distributions or architectures affected;
- source or patch provenance and why a downstream change is required;
- manifests or build-order files changed;
- commands run and their results; and
- staged install or runtime checks run, or why they remain for CI or an
  operator.

Do not combine unrelated updates in one pull request. Automated source updates must open
review pull requests and must not publish directly. Credentials for signatures and publication
belong only in trusted GitHub environments; never use production
publication commands or commit secrets from a contributor workstation.

## Style

- Shell: use `set -euo pipefail` and satisfy ShellCheck.
- Python: follow PEP 8 and add focused pytest coverage.
- YAML: use two-space indentation and validate the affected manifest.
- Commits: use imperative subjects and explain choices that are not obvious.

All contributions must follow [CODE_OF_CONDUCT.md](https://github.com/tuna-os/tunaos-packages/blob/main/CODE_OF_CONDUCT.md). Report
vulnerabilities through the private process in [SECURITY.md](https://github.com/tuna-os/tunaos-packages/blob/main/SECURITY.md), not
through a public issue.
