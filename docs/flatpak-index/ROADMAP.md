---
sidebar_position: 3
title: "Roadmap"
---

This roadmap turns the TunaOS Flatpak remote into a single, reviewable
distribution service. It covers index ownership and publication; application
features and packaging roadmaps remain in their respective repositories.

## Current state

The production remote at `https://tunaos.org/flatpak/` is served from
`tuna-os/docs`, while this repository contains a historical index snapshot and
a separate GitHub Pages deployment. Application repositories publish OCI
images and are currently documented to push index updates directly to `docs`
with a `FLATPAK_INDEX_TOKEN`.

Until the consolidation decision below is complete, treat the index under
`tuna-os/docs/static/flatpak/` as production and this repository as a reference
snapshot. Do not infer production state from this repository's Pages site.

## Near term: decide and make drift visible

Target: one planning cycle.

- Name an accountable owner for the remote and choose its long-term source
  repository: move production ownership here, or formally retire this
  repository as an index host.
- Inventory every documented app ID, OCI reference, supported architecture,
  and publisher workflow against the served production index.
- Define a freshness SLO from a successful app publish to remote availability.
- Add a production check that installs or inspects every catalog entry from the
  served URL and reports catalog, digest, architecture, and metadata drift.
- Document an incident owner and a tested rollback procedure for a bad index
  publication.

Exit gate: the ownership decision is recorded, the production source is named
in both repositories, and drift is measured from the user-facing endpoint.

## Mid term: consolidate publication

Target: the cycle after the ownership decision.

- Route index changes through one reviewed publisher contract rather than
  giving every application repository a long-lived cross-repository write
  credential.
- Require publisher input to identify the app ID, immutable OCI digest,
  architecture set, source revision, and intended channel.
- Validate the candidate index before publication and the served index after
  deployment.
- Remove or redirect the non-authoritative Pages deployment and delete the
  historical snapshot once consumers and documentation no longer depend on it.
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

Record the ownership decision and dates here when approved. Until then, this
roadmap describes direction rather than a commitment to move production out of
`tuna-os/docs`.
