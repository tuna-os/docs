---
sidebar_position: 2
title: "Architecture"
---

## Purpose

This repository is a multi-distribution package factory. It imports or adapts
upstream package sources, plans reproducible build cells, builds each cell in a
target-specific environment, verifies the result, and publishes signed package
repositories through `repo.tunaos.org`.

The factory currently produces RPM, DEB, and Arch packages. It has two build
engines:

- **build-chain** builds curated package-family manifests in dependency order;
- **Tideforge** rebuilds individual recipes across their declared targets.

## Authoritative contracts

The architecture is defined by data contracts rather than by a single
workflow.

| Contract | Responsibility |
| --- | --- |
| `manifests/package-factory.yaml` | Targets, architectures, build roots, publication paths, and served indexes |
| `manifests/package-builds.yaml` | Package recipes and the targets on which each recipe is built |
| `build-order*.yml` | Curated dependency order for build-chain package families |
| `scripts/factory_contract.py` | Shared reader and validator for the factory contract |
| `scripts/plan-package-factory.py` | Converts contracts and a change set or selector into build cells |
| `.github/workflows/package-factory-cell.yml` | Reusable execution boundary for one planned cell |

`docs/PACKAGE_FACTORY.md` documents the schema and onboarding process. A new
target or package family is incomplete until its contract, planner, builder,
verification, and publisher agree.

## Data flow

```text
upstream source / local adaptation
               |
               v
package-factory.yaml + package-builds.yaml + build-order manifests
               |
               v
      planner emits build cells
               |
               v
   build-chain or Tideforge engine
               |
               v
   per-cell tests and installability checks
               |
               v
 signed, attested intermediate artifacts
               |
               v
 format-specific publisher -> Cloudflare R2
               |
               v
 Cloudflare Worker -> repo.tunaos.org served indexes
```

Planning is separate from execution. `.github/workflows/package-factory.yml`
selects cells for pull requests, pushes, schedules, and manual selectors, then
calls the reusable cell workflow. Long-running build-chain cells can publish a
partial artifact and resume in a continuation shard; the artifact is build
state, not a public repository.

## Build boundaries

### Build-chain

`scripts/build-chain.sh` orchestrates curated RPM families. A family manifest
defines tiers, and packages within a tier may build concurrently. The script
supports isolated Mock/Podman execution and a native RPM backend; backend
implementation is being moved behind `scripts/lib/build-chain/` interfaces.
Family publishers consume the resulting RPM artifacts and write only their
declared prefix.

### Tideforge

`scripts/tideforge.py` and its supporting modules execute the recipe catalog.
The target contract selects the format-specific builder and validation rules.
Tideforge publishers are split by repository format:

- `.github/workflows/publish-tideforge-rpms.yml`;
- `.github/workflows/publish-tideforge-debs.yml`;
- `.github/workflows/publish-tideforge-arch.yml`.

The portable experiment workflow is an evaluation surface, not a production
publisher.

## Target and repository boundaries

Targets are declared in `manifests/package-factory.yaml`. Supported target
shapes include EL and Fedora RPM repositories, Ubuntu and Debian APT
repositories, and Arch repositories. Hummingbird has additional bootstrap
constraints recorded in the contract and its focused documentation.

Three locations must not be conflated:

1. **Build state** is carried in workflow artifacts and local build roots.
2. **Write paths** are R2 prefixes owned by a format or family publisher.
3. **Read indexes** are URLs served through `repo.tunaos.org` and declared per
   target and architecture.

Write paths and read URLs can intentionally differ because the Cloudflare
Worker maps public routes to stored prefixes. Consumers must use
`published_index`; publishers must use their declared R2 path. See
`docs/GNOME50-REPO-PUBLISH.md` and `runbooks/r2-repo-publish-guard.md` for the
known family-specific mappings and destructive-sync safeguards.

## Publication boundary

Build cells do not publish directly to a public repository. They upload
intermediate artifacts. A publisher then:

1. downloads the artifacts for its format or family;
2. seeds and validates the existing repository state;
3. signs packages and repository metadata;
4. applies regression and shrink guards;
5. synchronizes the complete repository to its owned R2 prefix; and
6. verifies the served index rather than assuming the write succeeded.

The publishers require GitHub OIDC/attestation permissions and scoped R2/GPG
secrets. Public consumers trust the repository signing keys and the served
metadata, not workflow artifacts.

## Verification and observability

- Pull requests plan only affected cells; scheduled runs exercise complete
  families so dependency or base-distribution drift is observed.
- `scripts/verify-package-factory-cell.sh` verifies built cells before
  publication.
- `scripts/verify-published-wave.py` and format-specific checks verify the
  consumer-visible repository after publication.
- `scripts/factory-status.py` and `scripts/render-factory-site.py` derive the
  status site from manifests and served indexes.
- `scripts/check-gate-coverage.py` detects build cells not covered by their
  required gates.

Detailed target constraints and operational history belong in `docs/`,
runbooks, and regression tests. This document owns the stable component and
authority boundaries; update it when those boundaries change.

## Local development

Use the focused commands in `justfile` and `docs/PACKAGE_FACTORY.md`. At a
minimum, contract changes should run the manifest validators and planner tests;
engine changes should run the corresponding script tests and shell lint. Local
builds are evidence for a target, but publication remains the responsibility
of the gated publisher workflows.
