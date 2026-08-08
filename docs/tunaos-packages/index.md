---
sidebar_position: 1
sidebar_label: "tunaos-packages"

status: unknown
---

`tunaos-packages` is TunaOS's source-controlled package repository. It owns
the native packaging, patches, build ordering, validation, signing, and
publication work needed to ship curated desktop stacks independently of
third-party repositories.

## Current state

The active production implementation is the native EL10 RPM build chain for
GNOME and XFWL4. Package specifications and EL10 compatibility fixes live in
`src/`; build order is declared in `build-order*.yml`; GitHub Actions invokes
`scripts/build-chain.sh` in isolated Mock environments.

The project is migrating publication to GitHub Actions and Cloudflare R2. Any
remaining COPR projects are compatibility/bootstrap infrastructure, not a
desired end state. They will remain available until their GitHub/R2 replacement
has passed build, staged-install, and desktop runtime gates. Do not remove or
rewrite the native GNOME EL10 specs while that migration is incomplete.

See [ARCHITECTURE.md](https://github.com/tuna-os/tunaos-packages/blob/main/ARCHITECTURE.md) for the currently deployed RPM/R2
pipeline and [COPR-AUDIT.md](https://github.com/tuna-os/tunaos-packages/blob/main/COPR-AUDIT.md) for the historical package-source
inventory.

## How a package moves through the repository

```text
upstream source + native packaging/patches
        ↓
build-order manifest
        ↓
GitHub Actions + Mock build environment
        ↓
repository install and desktop/runtime validation
        ↓
sign and publish to the TunaOS repository
```

The build chain is deliberately native for the difficult EL10 GNOME bootstrap:
it supports RPM scriptlets, file triggers, SELinux policy, bootstrap variants,
and dependency workarounds that a generic recipe format does not yet model.

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/gnome-50/`, `src/deps/` | Native EL10 GNOME RPM specs, patches, and source metadata |
| `src/xfce-wayland/` | Native XFCE/XFWL4 RPM packaging |
| `build-order.yml` | GNOME 50 bootstrap/build dependency order |
| `build-order-xfce*.yml` | XFCE/XFWL4 build order for EL10 and Fedora |
| `scripts/build-chain.sh` | Shared local/CI RPM build engine |
| `.github/workflows/` | Per-package, distributed, validation, signing, and publication workflows |
| `manifests/hummingbird-desktops.yaml` | Fedora Hummingbird desktop RPM catalog |

## Adding or changing a package

1. Prefer the target distribution's package when it already meets TunaOS's
   version and integration requirements.
2. Add or update the native spec, patches, and source metadata under `src/`.
3. Place the package in the correct build-order manifest, after its build-time
   dependencies.
4. Build it in the declared Mock target and install it from the staged
   repository.
5. Add a focused runtime/desktop gate before promoting it to users.

Useful local commands:

```bash
just --list
python3 scripts/parse-build-order.py build-order.yml --validate
./scripts/build-chain.sh --help
```

## Tideforge and cross-distro packaging

Tideforge is a single-recipe abstraction for straightforward packages across
RPM, DEB, and Pacman targets. Supported targets, the upstream-source policy,
and the migration away from COPRs and PPAs are defined in
[the package-factory contract](https://github.com/tuna-os/tunaos-packages/blob/main/docs/PACKAGE_FACTORY.md).

It must prove source, build, install, and runtime parity before it replaces any
native EL10 GNOME packaging. Native specs remain the authoritative production
path for EL10-specific compatibility work until then.

## Release policy

Packages are promoted only after their source and packaging are reviewed, the
target build succeeds, the staged repository installs cleanly, and the relevant
desktop/session validation passes. Automated source updates should open review
PRs; they must never publish directly.
