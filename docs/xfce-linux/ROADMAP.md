---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-22 | **Status**: Alpha — first release blocked

Part of the [TunaOS](https://tunaos.org) ecosystem. XFCE Linux is the
lightweight XFCE Wayland OCI image, built from source with BuildStream.

## Current strategic focus

The near-term goal is one reproducible, installable Beta release. Release
readiness is measured by a promoted outcome, not by the presence of workflows
or the closure of implementation issues.

As of 2026-08-22, the repository has no GitHub Release or Git tag. Scheduled
multi-runner image builds and their downstream live-ISO runs remain red, so the
project remains Alpha even though the stable-promotion machinery exists.

## Alpha → Beta release gate

All evidence below must refer to the same candidate commit. The release tracker
stays open until every row is evidenced.

| Outcome | Exit evidence | Status (2026-08-22) |
| --- | --- | --- |
| Reproducible OCI image | A scheduled multi-runner build publishes an image and records its immutable digest | Blocked — latest scheduled build failed |
| Matching live media | ISO, checksum, signature, and certificate are published for the candidate | Blocked — downstream live-ISO run failed |
| Install validation | Plain and LUKS install E2E checks pass against the candidate | Blocked — latest scheduled install checks failed |
| Stable promotion | `stable` resolves to the candidate digest and the promotion workflow verifies the image and ISO objects | Blocked on build and install gates |
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

See [CONTRIBUTING.md](https://github.com/tuna-os/xfce-linux/blob/main/CONTRIBUTING.md).
