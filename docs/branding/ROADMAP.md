---
sidebar_position: 3
title: "Roadmap"
---

**Last updated**: 2026-11-16 | **Maintainer**: tuna-os (hanthor)

---

## Mission

Own the TunaOS visual identity as one system: a lettermark wordmark and a Noto
emoji mark per variant, generated in tunaOS — and delivered to every consumer (variant images,
installers, docs, press kit) as a **versioned contract**, not a file drop.

---

## Current Status

- **Assets**: `marks/` (Noto emoji marks, `marks/tunaos.svg` master) and
  `wordmarks/` (light and dark lettermarks per variant), copied from tunaOS
  `scripts/branding/make-lettermarks.py` output, plus `branding-manifest.json`.
- **Distribution**: **unversioned** — this repository has no tags or GitHub
  releases. Issue #66 remains open. `tuna-os/fisherman` vendors copies of five
  marks (`albacore`, `bonito`, `skipjack`, `tunaos`, `yellowfin`) in
  `data/images/`. It has no `branding-manifest.json`, no source revision pin,
  and no automated digest or freshness check. The other variants and the
  `wordmarks/` set have no consumer path there.
- **Validation**: `tests/test_branding.py` validates the manifest and SVG asset
  contract, enforced in CI (`ci.yml`) on every push and pull request via the
  terminal `required-checks` gate (#9, closed).
- **Health**: the open P0 is the versioned release and consumer sync contract
  (#66). The maintainer closed #7 as a duplicate of #66 on 2026-11-10.

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Versioned release contract — tags + documented consumer pin | #66 | 🟡 Open — zero tags/releases |
| P1 | ROADMAP-coverage entry in org ROADMAP tally | #1295 | ✅ Indexed in `.github/ROADMAP-INDEX.md` |

---

## Quarterly Goals

### Previous Quarter (2026 Q3)

**Theme**: make identity versioned

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| First tagged release + consumer contract doc | hanthor | #7 | ⏸ Carried forward — no tag, release, or consumer pin |
| Manifest validation enforced in CI | hanthor | #9 | ✅ Done |

### Current Quarter (2026 Q4)

**Theme**: version the identity and close the consumer delivery chain

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Publish first tagged release + document consumer pin | hanthor | #66 | ⬜ Open |
| Deliver `marks/` and `wordmarks/` to `fisherman` with manifest, pin and freshness checks | tuna-os | #66 | ⬜ Open |
| Keep the org ROADMAP index entry current | tuna-os | #1295 | ✅ Done |

### Next Quarter (2027 Q1)

**Theme**: scale to new variants

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| New-variant mark process (hummingbird/gurnard et al.) documented | tuna-os | (org variant tracking) | ⬜ Not started |
