---
sidebar_position: 4
title: "README"
---

This directory contains current user guidance, engineering references, release
material, and historical investigations. Start with the first section, then
use topic sections for deeper detail. Documents marked **historical** record a
completed investigation or an earlier plan; they are not current operating
instructions.

## Start here

- [Start here](https://github.com/tuna-os/wootc/blob/main/docs/getting-started.md) — download and open wootc.
- [User guide](https://github.com/tuna-os/wootc/blob/main/docs/user-guide.md) — use the migrated system and return to Windows.
- [Manual tests](https://github.com/tuna-os/wootc/blob/main/docs/manual-testing.md) — pre-flight checks for real hardware.
- [Verification status](https://github.com/tuna-os/wootc/blob/main/docs/status.md) — proven matrix cells and their evidence.
- [Philosophy](https://github.com/tuna-os/wootc/blob/main/docs/philosophy.md) — product goals and decision rules.

## Product and architecture

- [Specification](https://github.com/tuna-os/wootc/blob/main/docs/SPEC.md) — complete product and protocol requirements.
- [Architecture boundary](https://github.com/tuna-os/wootc/blob/main/docs/architecture-boundary.md) — separates generic migration from bootc-specific code.
- [Backend contract](https://github.com/tuna-os/wootc/blob/main/docs/backend-contract.md) — measured deployment-backend interface.
- [Deployer experience](https://github.com/tuna-os/wootc/blob/main/docs/deployer-experience.md) — deployer screens, states, and recovery behavior.
- [GUI and Phase 1 architecture](https://github.com/tuna-os/wootc/blob/main/docs/gui-phase1-architecture.md) — Windows installer flow.
- [GUI walkthrough](https://github.com/tuna-os/wootc/blob/main/docs/gui-walkthrough.md) — screen-by-screen product flow.
- [Native Windows shell](https://github.com/tuna-os/wootc/blob/main/docs/winui-shell.md) — WinUI 3 status, transport, and cutover plan.
- [Plugin architecture](https://github.com/tuna-os/wootc/blob/main/docs/plugin-architecture.md) — program-migrator plugin design.
- [Session migration](https://github.com/tuna-os/wootc/blob/main/docs/session-migration.md) — copy, relink, and sign-in boundaries.
- [Managed VM](https://github.com/tuna-os/wootc/blob/main/docs/managed-vm.md) — Windows VM lifecycle and ownership.
- [E2E architecture](https://github.com/tuna-os/wootc/blob/main/docs/e2e-architecture.md) — test control plane for hosted runs and boot chain.
- [Non-bootc adoption](https://github.com/tuna-os/wootc/blob/main/docs/non-bootc-adoption.md) — support boundaries for other Linux systems.
- [Distro adoption](https://github.com/tuna-os/wootc/blob/main/docs/distro-adoption.md) — installer adaptation for another distribution.
- [Brand identity](https://github.com/tuna-os/wootc/blob/main/docs/branding.md) — product names and re-skinned builds.
- [Brand distribution](https://github.com/tuna-os/wootc/blob/main/docs/branding-and-distribution.md) — branded installers and offline packages.
- [Branded walkthroughs](https://github.com/tuna-os/wootc/blob/main/docs/branded-walkthroughs.md) — automated visual walkthroughs for each brand.

## Trust, storage, and recovery

- [Artifact authentication](https://github.com/tuna-os/wootc/blob/main/docs/artifact-authentication.md) — boot-artifact verification.
- [Destructive paths](https://github.com/tuna-os/wootc/blob/main/docs/destructive-paths.md) — inventory of operations that can remove or alter data.
- [NTFS on Linux](https://github.com/tuna-os/wootc/blob/main/docs/ntfs-on-linux.md) — filesystem hazards and mitigations.
- [systemd-boot](https://github.com/tuna-os/wootc/blob/main/docs/systemd-boot.md) — package and trust policy.
- [Windows state trust](https://github.com/tuna-os/wootc/blob/main/docs/windows-state-trust.md) — evidence required before Windows state changes.
- [VHDX exploration](https://github.com/tuna-os/wootc/blob/main/docs/vhdx-exploration.md) — dynamic root-disk investigation.
- [Borrowed from Libertix](https://github.com/tuna-os/wootc/blob/main/docs/borrowed-from-libertix.md) — adopted boot-chain and recovery designs.
- [Upstream blessings](https://github.com/tuna-os/wootc/blob/main/docs/upstream-blessings.md) — upstream provenance and permissions.

## Verification, testing, and release

- [Verification ladder](https://github.com/tuna-os/wootc/blob/main/docs/milestones.md) — phase-by-phase evidence gates.
- [Release instructions](https://github.com/tuna-os/wootc/blob/main/docs/RELEASING.md) — green-gated release process.
- [Alpha adopter program](https://github.com/tuna-os/wootc/blob/main/docs/alpha-adopter-program.md) — structured early-adopter tests.
- [Pre-filled profiles](https://github.com/tuna-os/wootc/blob/main/docs/prefilled-profile-testing.md) — migration tests with an existing Windows profile.
- [Native GUI soak](https://github.com/tuna-os/wootc/blob/main/docs/soak.md) — shell stability ledger for long runs.
- [Agent lessons](https://github.com/tuna-os/wootc/blob/main/docs/agent-lessons.md) — operational traps from E2E work.
- [Docs truth pass](https://github.com/tuna-os/wootc/blob/main/docs/docs-truth-pass.md) — dated documentation-versus-build checks.

## Plans and historical records

- [Implementation plan](https://github.com/tuna-os/wootc/blob/main/docs/plan.md) — remaining specification coverage.
- [Completion plan](https://github.com/tuna-os/wootc/blob/main/docs/finish-plan.md) — dakota, btrfs, and matrix work.
- [Project review](https://github.com/tuna-os/wootc/blob/main/docs/project-review-2026-09-26.md) — review snapshot from 2026-09-26.
- [dakota return-boot RCA](https://github.com/tuna-os/wootc/blob/main/docs/dakota-return-boot-rca.md) — **historical** Phase-2 hang investigation.
- [Phase-2 attach postmortem](https://github.com/tuna-os/wootc/blob/main/docs/phase2-attach-postmortem.md) — **historical** debugging record.
- [Phase-2 debug plan](https://github.com/tuna-os/wootc/blob/main/docs/phase2-debug-plan.md) — **historical** hypotheses and resolution path.
- [v0.3.0-beta release notes](https://github.com/tuna-os/wootc/blob/main/docs/release-notes-v0.3.0-beta.md) — release record and evidence status.
- [v1.0.0 release notes](https://github.com/tuna-os/wootc/blob/main/docs/release-notes-v1.0.0.md) — release goals and evidence checklist.

## Document collections

- [`adr/`](https://github.com/tuna-os/wootc/blob/main/docs/adr) — architecture decision records.
- [`specs/`](https://github.com/tuna-os/wootc/blob/main/docs/specs) — detailed migration proposals.
- [`experiments/`](https://github.com/tuna-os/wootc/blob/main/docs/experiments) — dated research notes and implementation experiments.
- [`evidence/`](https://github.com/tuna-os/wootc/blob/main/docs/evidence) — checked-in evidence summaries.
- [`experiments/evidence/`](https://github.com/tuna-os/wootc/blob/main/docs/experiments/evidence) — experiment artifacts and provenance.
- [`screenshots/`](https://github.com/tuna-os/wootc/blob/main/docs/screenshots) — UI walkthrough images.

- Use [status.md](https://github.com/tuna-os/wootc/blob/main/docs/status.md) and [release instructions](https://github.com/tuna-os/wootc/blob/main/docs/RELEASING.md) for current verification and release decisions. Use dated plans and investigations for context, not as substitutes for those sources.
