---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-10-23 | **Status**: Active

This roadmap turns the TunaOS Flatpak remote into a single, reviewable
distribution service. It covers index ownership and publication; application
features and packaging roadmaps remain in their respective repositories.

> **Actively maintained.** The ownership decision in #171 names `tuna-os/docs`
> as the production catalog owner. This repository supplies index tooling and
> checks; it no longer keeps a reference snapshot.

## Current state

The production remote at `https://tunaos.org/flatpak/` is served from
`tuna-os/docs` by the `tunaos-org` Cloudflare Worker.
Application repositories publish OCI images and push index updates directly to
`docs` with a `FLATPAK_INDEX_TOKEN`.

Per issues #171 and #173, `tuna-os/docs` is the canonical catalog owner, and the
historical snapshot and GitHub Pages deployment in this repository have been
retired. Metadata checks in this repository validate the live served catalog at
`https://tunaos.org/flatpak/index/static`.

## Near term: decide and make drift visible

Target: one planning cycle.

- ~~Name an accountable owner and choose the source repository.~~ Decided in
  #171: `tuna-os/docs` (see the decision record below).
- Inventory every documented app ID, OCI reference, supported architecture,
  and publisher workflow against the served production index.
- Define a freshness SLO from a successful app publish to remote availability.
- Add a production check that installs or inspects every catalog entry from the
  served URL and reports catalog, digest, architecture, and metadata drift.
- Document an incident owner and a tested rollback procedure for a bad index
  publication.

Exit gate: the ownership decision is recorded (done), the production source is
named in both repositories, and drift is measured from the user-facing endpoint.

## Mid term: consolidate publication

Target: the cycle after the ownership decision.

- Route index changes through one reviewed publisher contract rather than
  giving every application repository a long-lived cross-repository write
  credential.
- Require publisher input to identify the app ID, immutable OCI digest,
  architecture set, source revision, and intended channel.
- Validate the candidate index before publication and the served index after
  deployment.
- Retired the non-authoritative Pages deployment and deleted the historical
  snapshot (completed in #173).
- Provide a contributor runbook for adding, updating, pausing, and retiring an
  application.

Exit gate: one repository owns production, one automation path publishes it,
and non-authoritative copies cannot be mistaken for the live remote.

## Long term: operate the remote as a product

- Publish availability and freshness history against the defined SLO.
- Review catalog health and unsupported architectures each release cycle.
- Track install success or another privacy-preserving adoption signal so the
  catalog roadmap is informed by user outcomes rather than repository activity.
- Establish lifecycle states and time-bounded removal notices for applications
  and channels.

## Success measures

| Outcome | Measure |
| --- | --- |
| Unambiguous ownership | One documented production repository and owner |
| Controlled publishing | Zero per-app long-lived cross-repository write credentials |
| Catalog integrity | Zero unexplained differences between declared and served entries |
| Freshness | Successful publications meet the agreed publish-to-availability SLO |
| Recoverability | A rollback exercise succeeds within the documented recovery target |
| Contributor clarity | One tested runbook covers add, update, pause, and retire workflows |

## Decision record

**Catalog ownership (#171, decided by the maintainer):**

- Canonical catalog: `static/flatpak/` in `tuna-os/docs` (entry point
  `static/flatpak/index/static`), served by the `tunaos-org` Cloudflare Worker
  at `https://tunaos.org/flatpak/`. It was already production, so this carries
  the least migration risk.
- `tuna-os/flatpak-index` is tooling and checks only. It keeps no hand-maintained
  or generated copy of the catalog (retired in #173).
- Application publish workflows write only to `tuna-os/docs`.
- Owner and rollback: `tuna-os/docs` maintainers own the catalog and perform
  rollback, as in [docs/APP-LIFECYCLE.md](https://github.com/tuna-os/flatpak-index/blob/main/docs/APP-LIFECYCLE.md).
