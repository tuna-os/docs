# tuna-os/docs Roadmap

**Last updated**: 2026-09-25 | **Maintainer**: tuna-os (hanthor) / guide agent

---

## Mission

Own the user-facing TunaOS documentation site (tunaos.org) — variant guides,
architecture docs, migration content, and ecosystem pages — built on Docusaurus
with an org-wide doc-sync pipeline (`sync-org-docs`). Docs are the first
adoption surface: every download, every variant page, every migration story
starts here.

---

## Current Status (September 2026)

- Docusaurus site with per-variant pages (albacore, bonito, grouper, flounder,
  sailfin, …), blog, and a worker/Cloudflare deployment (wrangler.jsonc).
- **sync-org-docs pagination fixed** — `gh api … --paginate` now walks every
  page (per_page=100) and the listing is de-duplicated (#103, merged 08-11).
  The sync also **skips archived/read-only repos** and guards case-collisions
  so stale archived content can no longer land on the live site (#154/#220,
  merged 08-14).
- **GitHub API rate-limit resilience fixed** — the sync now retries truncated
  repo listings before failing (#242, #260).
- **Flatpak Index deploy restored on main** (#115).
- **404 links in synced pages fixed** — LICENSE, `../../releases`,
  package-factory and `#anchor` classes resolved source-side across the org
  and the link rewriter covers the patterns (#135).

### Priorities

| Priority | Item | Tracking | Status |
|----------|------|----------|--------|
| P0 | Make sync-org-docs resilient to GitHub API rate limits | #242, #260 | ✅ Done |
| P1 | Historical banners & lifecycle tagging for archived repos | #270, #406 | 🟡 In progress |
| P1 | Versioned docs for screenshots/walkthroughs (docs-artifacts pattern) | #308 | ⬜ Not started |
| P2 | Variant pages track ROADMAP status (tunaos.org/wiki ↔ tunaos ROADMAP) | #417 | ⬜ Unowned (see #417) |

---

## Near-term Delivery Gates

### Versioned installer walkthrough pilot (#308)

The current installer walkthrough is refreshed in place from CI artifacts. Before
this pattern expands to other generated visual guides, the pilot must establish:

1. **Provenance** — every generated walkthrough records its source repository,
   workflow run, commit, flavor, and capture time.
2. **Release alignment** — the current walkthrough links to the build or release it
   depicts, with an automated freshness signal when the two diverge.
3. **Stable and historical views** — readers retain a convenient `latest` view and
   at least one release-addressable snapshot.
4. **Operating policy** — retention, rollback, and storage limits are documented
   before adopting the pattern for another project.

The pilot is complete when these gates are demonstrated for the TunaOS installer
walkthrough and maintainers record whether to extend, revise, or stop the pattern.

---

## Quarterly Goals

### Completed Quarter (2026 Q3) — "Expand"

**Theme**: Docs keep pace with variant expansion; the site is the adoption front door.

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Org-wide sync covers every repo (fix pagination) | guide | #103, #220 | ✅ Done |
| Flatpak landing surface green on main | ci-maintainer | #115 | ✅ Done |
| No broken links in synced pages | guide | #135 | ✅ Done |
| Rate-limit resilience in doc-sync pipeline | guide | #242, #260 | ✅ Done |

### Current Quarter (2026 Q4) — "Mature"

**Theme**: Consolidation, archived repository lifecycle tagging, and release metrics.

| Goal | Owner | Tracking | Status |
|------|-------|----------|--------|
| Historical banners and lifecycle status markers on archived repo pages | guide | #270, #406 | 🟡 In progress |
| Migration/content review cadence aligned with variant lifecycle policy | guide | tunaos `VARIANT-LIFECYCLE.md` | ✅ Done (tunaos#1175 confirmed no residual gap) |
| Download/usage data on the site (adoption metrics surface) | guide | #417 | ⬜ Unowned — tunaos#1174 tracks community metrics (stars/adopters) via `ADOPTION-METRICS.md`, not a site-side counter; no docs-repo work item exists yet |
| Versioned installer walkthrough pilot | guide | #308 | ⬜ Not started |
| Variant pages track ROADMAP status (tunaos.org/wiki ↔ tunaos ROADMAP) | guide | #417 | ⬜ Unowned — tunaos#1295 closed as out of scope for tunaOS with no successor issue opened |

---

## Technical Debt Backlog

| Item | Issue | Priority | Effort |
|------|-------|----------|--------|
| Sync resilience to GitHub API rate limits (org-listing truncation, stale site) | #242, #260 | P2 | S |
| Archived-repo pages on the live site (xfce-linux-iso, tromso-iso, dakota-iso, ubuntu-26.04-iso, bonito-x13s, dakota-x13s, ubuntu, chunkah, bootc-installer-tui) marked as historical | #270 | P2 | S |

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the Docusaurus dev setup and
`justfile` targets. Pick an issue from the priorities above or comment on a
goal you would like to own.

---

## Roadmap Governance

This roadmap is maintained by the guide agent. Updates are published after
major milestones or quarterly. Propose changes via PR to this file with an
issue reference.

---
*Generated by guide agent at ACMM L6. Updated 2026-09-25.*

