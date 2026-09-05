---
sidebar_position: 3
title: "Roadmap"
---

**Status:** Deprecated; retirement decision pending  
**Canonical replacement:** [`tuna-os/gtk-office-suite/suite-common`](https://github.com/tuna-os/gtk-office-suite/tree/main/suite-common)  
**Decision target:** 2026-09-15  
**Tracking:** [#26](https://github.com/tuna-os/suite-common-rust/issues/26), [#15](https://github.com/tuna-os/suite-common-rust/issues/15)

This repository is a historical standalone extraction. New features belong in
the canonical `gtk-office-suite` monorepo. The work below turns that statement
into a verifiable archive-or-maintain decision.

## Decision gate

The accountable maintainer should record an owner and complete these checks by
the decision target:

- [ ] Search Tuna OS repositories for Cargo, lockfile, workflow, and
  documentation references to `suite-common-rust`, `suite-common-rs`, and this
  repository URL.
- [ ] Confirm known consumers have migrated to the canonical monorepo crate or
  document why they still require this implementation.
- [ ] Validate that the README migration example resolves to the intended
  reviewed revision of the replacement.
- [ ] Triage every open issue and pull request as migrate, close, or required
  legacy maintenance.
- [ ] Name the maintainer accountable for the final decision.

## Outcomes

### Archive

Choose this outcome when no supported consumer requires the standalone crate.

- Disable Renovate and other write automation.
- Close or redirect remaining issues and pull requests.
- Update the repository description to identify the canonical replacement.
- Remove stale branches after preserving any required history.
- Archive the GitHub repository and link the replacement prominently.

### Supported legacy maintenance

Choose this outcome only when a verified consumer cannot yet migrate.

- Record the consumer, blocker, and migration owner in #26.
- Limit accepted changes to security and migration-blocking fixes.
- Disable automatic dependency merging.
- Set a new retirement review date no later than 2026-12-15.
- Keep new feature development in `gtk-office-suite`.

## Success measure

By 2026-09-15, the repository is either archived or has a named owner, a
documented remaining consumer, a constrained maintenance policy, and a dated
follow-up retirement review. Open automation work should no longer contradict
the chosen lifecycle state.
