---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-11-13 | **Status**: Alpha — first release blocked

Part of the [TunaOS](https://tunaos.org) ecosystem. XFCE Linux is the
lightweight XFCE Wayland OCI image, built from source with BuildStream.

## Current strategic focus

The near-term goal is one reproducible, installable Beta release. Release
readiness is measured by a promoted outcome, not by the presence of workflows
or the closure of implementation issues.

As of 2026-11-13, the repository has no GitHub Release or Git tag. Since the
2026-10-31 update, these changes landed: ISO detached-signature preservation
with cosign 3 (#252), media-input binding for the embedded ISO payload (#274),
and E2E fixes for the plain and LUKS install checks (#248, #275, #280). Earlier
changes: the runner disk exhaustion fix (#161),
key-based Cosign image signing (#164), and publication, signing, and scanning
on scheduled builds (#241). The source build of XFCE (#167) and the
single-layer composition (#168) were merged into the `v4` branch, not `main`;
the #167 source build is ported to `main` for #294. The scheduled
multi-runner build last succeeded on 2026-11-02 and has failed or been
cancelled on every scheduled run since (latest: 2026-11-13, chunk build and
cache-restore failures). The live-ISO workflow's `Sign ISO` failure is fixed:
the run on `main` at e077aa4 (2026-11-13) succeeded. Manually dispatched plain
and LUKS install checks passed on 2026-11-13, but the scheduled checks last ran
red. The project therefore remains in Alpha even though the stable-promotion
machinery exists.

## Alpha → Beta release gate

All evidence below must refer to the same candidate commit. The release tracker
stays open until every row is evidenced.

| Outcome | Exit evidence | Status (2026-11-13) |
| --- | --- | --- |
| Reproducible OCI image | A scheduled multi-runner build publishes an image and records its immutable digest | Blocked — last successful scheduled multi-runner build was 2026-11-02; scheduled runs from 2026-11-03 through 2026-11-13 failed or were cancelled; the release tracker has no candidate digest |
| Matching live media | ISO, checksum, signature, and certificate are published for the candidate | In progress — `Sign ISO (cosign keyless)` failures were fixed; the live-ISO run at e077aa4 (2026-11-13) succeeded, but no candidate image digest exists to match it against |
| Install validation | Plain and LUKS install E2E checks pass against the candidate | In progress — manually dispatched plain and LUKS checks passed on 2026-11-13 (8a8c8b1); latest scheduled checks failed (LUKS 2026-11-09, plain 2026-11-10, #135) |
| Stable promotion | `stable` resolves to the candidate digest and the promotion workflow verifies the image and ISO objects | Blocked on build and install gates; the weekly `promote-stable` schedule last failed on 2026-10-13 |
| Discoverable release | A GitHub Release records the digest, signed artifact URLs, known limitations, and upgrade path | Not started — no releases or tags |
| User-path validation | The public install guide is followed successfully against the promoted candidate | Not started |

The first five rows are release blockers. User-path validation may be completed
with a release candidate, but must be recorded before Beta is announced.

## Operating cadence

- Review the release gate weekly while any blocker is red.
- Link each row to a durable workflow run, digest, artifact, or documentation
  check in the release tracker.
- Reopen the release tracker when evidence regresses before promotion.
- Do not count workflow implementation or a single isolated green job as a
  completed release outcome.

## After the first Beta

1. Publish a documented release cadence and support window.
2. Track XFCE and base-runtime currency with upgrade-test evidence.
3. Validate the lightweight positioning with boot-time, memory, and image-size
   measurements against at least one mainstream TunaOS desktop.
4. Evaluate HWE and ARM64 only after the Beta release gate is repeatable; each
   additional hardware target must include an owner and ongoing CI capacity.

## Contributing

See [CONTRIBUTING.md](https://github.com/tuna-os/brussels/blob/main/CONTRIBUTING.md).
