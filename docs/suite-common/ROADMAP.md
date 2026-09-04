---
sidebar_position: 3
title: "Roadmap"
---

Last updated: 2026-08-28

`suite-common` is the deprecated Python foundation for the former Python office
suite. The canonical implementation now lives in the
[`gtk-office-suite`](https://github.com/tuna-os/gtk-office-suite) Rust workspace.
This roadmap exists to end the legacy repository's lifecycle deliberately,
without breaking a supported consumer or turning deprecation into indefinite
maintenance.

## Current state

- The library is bugfix-only and has no published GitHub releases.
- The former application repositories are archived; their active successors
  live in `gtk-office-suite`.
- CI and dependency automation remain active.
- [#33](https://github.com/tuna-os/suite-common/issues/33) proposes renaming the
  repository for a compatibility window, while
  [#34](https://github.com/tuna-os/suite-common/issues/34) proposes retirement
  after consumer verification.

The rename and retirement paths are alternatives, not parallel work. Consumer
evidence determines which path applies.

## Near-term decision gate (target: 2026-09-15)

An assigned owner records all of the following in the lifecycle tracking issue:

1. Supported consumers, with repository and branch links, or an explicit
   finding that none remain.
2. The compatibility promises still required from this Python package.
3. One selected path below, its owner, and its completion date.

Repository-wide search is useful discovery evidence, but each claimed supported
consumer must be confirmed by its maintainer or current build configuration.

## Path A: retire

Choose this when no supported consumer remains.

- Close the rename proposal as unnecessary.
- Stop dependency and CI automation after the final green verification.
- Replace operational consumption guidance with a concise historical notice and
  canonical-successor link.
- Resolve or transfer open issues that still represent work for the Rust
  implementation.
- Archive the repository.

Completion evidence: no supported consumer, successor links resolve, remaining
issues are dispositioned, and GitHub reports the repository archived.

## Path B: time-boxed compatibility

Choose this only when at least one supported consumer still depends on the
Python package.

- Rename the repository to `suite-common-python` while keeping Python import and
  Meson identifiers stable.
- Publish the named consumers, supported fix classes, owner, and support end
  date in the README.
- Limit changes to that compatibility contract; new functionality belongs in
  `gtk-office-suite`.
- Re-enter Path A when the final consumer migrates or the support window ends.

Completion evidence: redirect verified, compatibility contract published, each
consumer has a migration tracker, and a dated retirement checkpoint exists.

## Measures

| Measure | Target |
| --- | --- |
| Lifecycle owner | Named by 2026-09-15 |
| Supported consumers | 100% identified and linked |
| Lifecycle path | One of A or B recorded by 2026-09-15 |
| Unbounded legacy maintenance | Zero work outside the selected contract |
| Terminal outcome | Repository archived after zero supported consumers |

## Out of scope

This roadmap does not add features, rename package/import identifiers, or set
the product roadmap for the Rust office suite. Those decisions belong in
`gtk-office-suite`.
