---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-08-29 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Generate trustworthy release changelogs for container images: diff the RPM
package sets between two versions (skopeo), verify the attestation (cosign),
and emit a changelog — so every TunaOS release records what changed, verified,
not guessed.

---

## Current Status

- **Role**: candidate organization GitHub Action for verified container-image
  changelogs. No production consumer is currently visible in the tuna-os
  organization.
- **Distribution**: **unversioned** — no tags, no releases; consumers pin to
  the mutable default branch if they follow the README.
- **Trust**: the action verifies cosign attestations; dependency trust-anchor
  pinning landed in PR #14.
- **Validation**: GitHub reports zero Actions runs in this repository, so no
  end-to-end execution of the org fork is recorded.
- **Ownership**: this repository remains a fork of
  `hanthor/changelog-action`; the adopt-versus-retire decision is tracked in
  tuna-os/tunaOS#2167 because Issues are disabled in this repository.

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Decide adopt versus retire; name an owning repository | tuna-os/tunaOS#2167 | ⬜ Not started |
| P0 | If adopted: one green production run, then v1.x + immutable consumer pin | tuna-os/tunaOS#2167 | ⬜ Not started |
| P1 | Pin cosign/oras trust anchors | PR #14 | ✅ Done |
| P2 | Document tag-pattern and correct input names | PR #13 | ✅ Done |
| P2 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ⬜ Not started |

---

## Quarterly Goals

### Current Quarter (2026 Q3)

**Theme**: prove the verifier has an owner and a consumer

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Choose adopt or retire by 2026-09-15 | hanthor | tuna-os/tunaOS#2167 | ⬜ Not started |
| If adopted, complete one green production execution | hanthor | tuna-os/tunaOS#2167 | ⬜ Not started |
| After the green run, cut v1.x and migrate the named consumer | hanthor | tuna-os/tunaOS#2167 | ⬜ Not started |
| Pin cosign/oras trust anchors | hanthor | PR #14 | ✅ Done |

### Next Quarter (2026 Q4)

**Theme**: trust and cadence

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| If adopted, publish a release-currency SLO and owner | tuna-os | tuna-os/tunaOS#2167 | ⬜ Not started |
| If retired, archive the fork and document the supported replacement | tuna-os | tuna-os/tunaOS#2167 | ⬜ Not started |

---

*ROADMAP added by strategist agent (ACMM L6 — full mode). Signed-off-by: hanthor-hive-agent[bot] &lt;290068839+hanthor-hive-agent[bot]@users.noreply.github.com&gt;*
