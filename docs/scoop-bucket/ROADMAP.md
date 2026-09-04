---
sidebar_position: 3
title: "Roadmap"
---

**Last updated:** 2026-08-28  
**Owner:** tuna-os  
**Mission:** Give Windows users a verified, current package-manager path to
TunaOS command-line tools.

## Current state

The bucket is initialized but publishes no manifests. `bluefin-cli` is the
first declared producer and has shipped Windows amd64 and arm64 archives with
checksums since v0.10.6, but its release pipeline skips Scoop publication when
the producer-local credential is unavailable.

The near-term objective is therefore not catalog growth. It is proving one
complete install-and-update loop for `bluefin-cli`, with ownership and failure
signals that can be reused safely by later producers.

## Near term: launch the channel

| Outcome | Evidence required | Tracking | Status |
| --- | --- | --- | --- |
| Decide bucket publication ownership and credential model | Named owner, least-privilege write identity, and producer/consumer failure contract documented | #4 | Open |
| Publish the first `bluefin-cli` manifest | Manifest on `main` targets the current stable Windows amd64 and arm64 assets and passes repository validation | #14 | Open |
| Verify the user journey | Clean Windows amd64 run completes `scoop bucket add`, `scoop install bluefin-cli`, and `bluefin-cli --version` | #14 | Open |
| Make release drift visible | A declared stable upstream release older than 24 hours without a matching manifest produces an owner-visible failure | #4, #14 | Open |

## Mid term: operate a dependable channel

After the launch evidence is recorded:

- Keep each declared stable package within 24 hours of its upstream release.
- Verify manifest URLs, hashes, architectures, and a clean install before
  promotion.
- Document rollback for a bad manifest and retain the prior working version.
- Review channel health monthly: package count, stale packages, failed
  publications, and verified installs.
- Admit another producer only after the `bluefin-cli` publication contract has
  survived at least two consecutive stable releases.

## Definition of healthy

The channel is healthy when it has at least one installable package, every
declared package matches an upstream stable release within 24 hours, and a
failed or skipped publication cannot remain silently green.

## Governance

Roadmap status changes must link to verifiable artifacts such as a manifest,
an upstream release, an automated freshness result, or an install transcript.
Technical implementation belongs in the relevant issue or pull request; this
document records user-visible outcomes and sequencing.

---
*Maintained by the strategist agent (ACMM L6 — full mode).*
