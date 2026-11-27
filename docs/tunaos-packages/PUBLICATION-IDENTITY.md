---
sidebar_position: 14
title: "PUBLICATION IDENTITY"
---

Evaluates frostyard/repogen's `PackageIdentity` / `DetectDigestConflicts`
against the factory's publishers. This change does not propose a cross-distro
version order. The native comparators in `scripts/repo_index.py` stay
authoritative.

## Identities in use today

| Format | Index key (name, evr, arch) | Source/binary | Isolation between targets |
| --- | --- | --- | --- |
| rpm | `primary.xml` name, epoch:ver-rel, arch (`src` for source) | `arch == src` | one prefix per target/arch (`published_index`) |
| deb | `Package`, `Version`, `Architecture` | `Source` field only | per-target flat repo |
| pkg.tar.zst | `.db` entry name, evr, arch | none | per-target `.db` |
| gpkg | `CPV`, version, `ARCH` | none | per-target binhost |

## Findings

- `check-published-hygiene.py` flags a repeated NEVRA inside one prefix. It
  also flags a name served from several prefixes. Its rows carry no digest.
  The same NEVRA with different bytes in two prefixes reads as `redundant`.
- `publish-rpm-wave.sh` replaces a same-named RPM in place (`cp`). Then it
  removes copies elsewhere by filename. It does not compare bytes. A rebuild
  under an unchanged NEVRA silently changes the served bytes.
- Equal names across formats, targets and architectures do not collide: each
  lives in its own prefix/index. `scripts/publication_identity.py` makes that
  qualification explicit and tested.

## What this change adds

`scripts/publication_identity.py`: format/target/arch/kind-qualified
`PackageIdentity`, `detect_digest_conflicts`, and `admit`, with tests in
`tests/test_publication_identity.py`. No publisher uses it yet.

A gate in `publish-rpm-wave.sh` (reject, or need a release bump) changes
publication behaviour. It is the follow-up. The follow-up also needs digests
in the index row readers.
