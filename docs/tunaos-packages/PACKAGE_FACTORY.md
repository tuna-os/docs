---
sidebar_position: 5
title: "PACKAGE FACTORY"
---

This repository is the source-controlled package factory for TunaOS. It builds
and signs packages in GitHub Actions, tests them against declared distro
targets, and publishes only validated repositories to Cloudflare R2.

## Supported targets

| Target | Format | Repository | Status |
|---|---|---|---|
| EL10 | RPM | rpm-md | supported |
| Ubuntu | DEB | APT | supported foundation |
| Debian Sid | DEB | APT | supported foundation |
| openSUSE Tumbleweed | RPM | rpm-md | scaffold |
| Arch | pkg.tar.zst | pacman | scaffold |

The authoritative target and R2-path contract is
[`manifests/package-factory.yaml`](https://github.com/tuna-os/tunaos-packages/blob/main/manifests/package-factory.yaml).

## Upstream source policy

Bluefin, Aurora, Fedora dist-git, and other upstream projects are inputs for
source and packaging metadata only. Before importing a package, record its
upstream commit/tag, license, patches, and target compatibility. TunaOS rebuilds
the package itself; it never enables an upstream COPR, PPA, or binary repository
in a produced image.

The current Bluefin, Aurora, and Zirconium parity inventory and delivery order
are maintained in [`UPSTREAM_PARITY.md`](https://github.com/tuna-os/tunaos-packages/blob/main/docs/UPSTREAM_PARITY.md).

## Promotion contract

Every candidate must build in the target buildroot, pass package tests, install
from the staged repository, and complete a desktop/runtime smoke test where the
package affects a session. Only then may CI sign and promote it to the stable R2
path. ORAS is suitable for immutable source/SBOM/provenance bundles, not as the
live DNF/APT/Pacman endpoint.

### What enforces this today

`build-tideforge-supported.yml` and `build-tideforge-arch.yml` are the
enforcement. For each covered recipe they render the native metadata, fetch the
checksum-locked source, build in a clean target buildroot with only the declared
build dependencies, lint the built artifact, publish it to an ephemeral
repository, and clean-install it in a second container before running a
command/file/service smoke check. `xfconf` additionally proves the
split-package contract: both halves are separate artifacts, the development
half pulls in the runtime half, and the headers are absent from the runtime
half.

### What the gate does not cover

Recorded here on purpose. A gate whose exceptions are implicit reads as full
coverage to the next person, which is the exact failure this section exists to
prevent.

| Not covered | Recipes | Why |
| --- | --- | --- |
| Clean install and smoke | all `cosmic-*`, `pop-icon-theme` | Payload-only. A staged install needs the rest of the COSMIC runtime closure, which is not factory-built yet. The build still blocks source/vendor/toolchain regressions. |
| Clean install and smoke (DEB) | `dms`, `dms-cli`, `dms-greeter` | `clean_install: false`. Their runtime closure on Ubuntu/Debian depends on `quickshell`, which has no DEB build yet. The el10 path does cover them, via the DMS stack integration job. |
| Any gate at all | `cosmic-greeter`, `xdg-desktop-portal-cosmic`, `xfwl4` | Present under `packages/` but in no matrix. Adding a recipe does not enrol it: it must be added to a workflow matrix *and* that workflow's `paths:` filter, or it is never built. |

Anything in this table is not eligible for promotion, whatever a green check
on the pull request suggests.

**There is currently no automated promotion of Tideforge artifacts to R2, and
that is deliberate.** `promote-to-prod.yml` and `promote-gnome49-to-prod.yml`
were removed from `main` after the GNOME repo wipe — see
`INCIDENT-repo-wipe-gnome.md`. Nothing publishes Tideforge output, so the
promotion contract above is presently satisfied by there being no promotion
path at all.

When a promotion workflow is reintroduced, it must depend on the gate jobs
above rather than re-deriving its own idea of "green". Two failure modes this
repository has already paid for:

- Do not add these jobs to branch protection's required checks. They are
  `paths`-filtered, so a PR that touches none of those paths never reports
  them and the branch blocks forever. That is #128, and #130 is its sibling.
- Do not gate on a workflow-level conclusion that includes skipped jobs. A
  skipped gate is not a passed gate.

## Package layout

New work should use this shape:

```text
packages/<name>/
  source.yaml             # upstream URL, revision, license, checksum
  rpm/<target>/*.spec     # RPM packaging and patches
  debian/                 # Debian packaging
  arch/PKGBUILD           # Arch scaffold when supported
  opensuse/*.spec          # openSUSE scaffold when supported
```

Existing `src/` packages are migrated incrementally; they remain build inputs
until their package directories are moved without changing the published NVR.

## Target-native overlays

Source graphs can be shared, but package metadata and compatibility work cannot.
For example, the GNOME queue in `manifests/target-queues/gnome.yaml` keeps the
EL10 bootstrap/spec and SELinux compatibility overlay native to RPM while
Debian Trixie and Ubuntu render and test DEB packages independently.

## Tideforge: experimental single-recipe workflow

Tideforge is developed in parallel with the established native RPM/DEB
pipelines. Those native pipelines remain the production distribution path until
Tideforge renders equivalent artifacts and passes the same build, install, and
runtime gates.

Use `packages/_template/package.yaml` as the only author-maintained recipe.
`scripts/tideforge.py` validates the recipe, shows its per-target build plan,
and renders native RPM or Debian packaging:

```bash
python3 scripts/tideforge.py validate packages/my-package/package.yaml
python3 scripts/tideforge.py plan packages/my-package/package.yaml --target el10
python3 scripts/tideforge.py render packages/my-package/package.yaml --target ubuntu --output out/ubuntu
```

Before adding a native dependency spelling to the catalog or promoting a
recipe, probe it in the actual target container. This resolves recipe
capabilities (for example `dbus-dev`) to native package names and checks the
live repository metadata without installing anything into the host:

```bash
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --dry-run
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --target el10
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --json
```

The tool emits target-native files because the package managers require them,
but maintainers edit one recipe. A target override is limited to the dependency
or build difference that cannot be made portable.

When an upstream source archive omits required git submodules, use the optional
`sources` list rather than an unpinned clone in a build command. Each auxiliary
archive has an HTTPS URL, SHA-256, filename, destination below the primary
source tree, and optional `strip_components`. Tideforge renders those archives
as native RPM/Pacman sources and extracts them before the build. This keeps a
complex source closure reviewable and reproducible; a recipe is not eligible
for promotion until its target CI builds the complete closure.

Cargo recipes build with `--locked` by default.  An upstream release with a
demonstrably stale *root-package* entry in an otherwise pinned `Cargo.lock` may
set `build.cargo_locked: false`, but it must include a specific
`build.cargo_lock_reason` and is accepted only after the resulting lockfile
diff has been reviewed in the target build.
