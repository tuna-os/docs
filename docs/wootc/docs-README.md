---
sidebar_position: 4
title: "README"
---

The [repository README](https://github.com/tuna-os/wootc/blob/main/README.md) explains the product and where to get it;
this index helps you find operating instructions, contracts, acceptance
evidence, and design history. A design or release-note filename is not proof
that its behavior ships. Use [verification status](https://github.com/tuna-os/wootc/blob/main/docs/status.md) and
[release instructions](https://github.com/tuna-os/wootc/blob/main/docs/RELEASING.md) for current decisions; dated experiments
and plans are context, not current operating instructions.

## Start here

- [Start here](https://github.com/tuna-os/wootc/blob/main/docs/getting-started.md) — download and open wootc.
- [User guide](https://github.com/tuna-os/wootc/blob/main/docs/user-guide.md) — use the migrated system and return to Windows.
- [Manual tests](https://github.com/tuna-os/wootc/blob/main/docs/manual-testing.md) — pre-flight checks for real hardware.
- [Verification status](https://github.com/tuna-os/wootc/blob/main/docs/status.md) — proven matrix cells and their evidence.
- [Philosophy](https://github.com/tuna-os/wootc/blob/main/docs/philosophy.md) — product goals and decision rules.

### Choose an entry point

| Reader | Read first | Then |
|---|---|---|
| End user | [Getting started](https://github.com/tuna-os/wootc/blob/main/docs/getting-started.md) | [User guide](https://github.com/tuna-os/wootc/blob/main/docs/user-guide.md), or [Coming from WSL](https://github.com/tuna-os/wootc/blob/main/docs/wsl-migration.md) |
| Contributor | [Contributing](https://github.com/tuna-os/wootc/blob/main/CONTRIBUTING.md), then [AGENTS.md](https://github.com/tuna-os/wootc/blob/main/AGENTS.md) | [Agent lessons](https://github.com/tuna-os/wootc/blob/main/docs/agent-lessons.md) before harness/deployer changes; [native shell contract](https://github.com/tuna-os/wootc/blob/main/docs/winui-shell.md#current-stdio-protocol-reference) for Go/WinUI integration |
| Maintainer/reviewer | [Verification status](https://github.com/tuna-os/wootc/blob/main/docs/status.md) | [Release instructions](https://github.com/tuna-os/wootc/blob/main/docs/RELEASING.md), [truth-pass record](https://github.com/tuna-os/wootc/blob/main/docs/docs-truth-pass.md), [roadmap](https://github.com/tuna-os/wootc/blob/main/ROADMAP.md) |
| Distro packager | [Distro adoption](https://github.com/tuna-os/wootc/blob/main/docs/distro-adoption.md) | [Brand distribution](https://github.com/tuna-os/wootc/blob/main/docs/branding-and-distribution.md), [upstream blessings](https://github.com/tuna-os/wootc/blob/main/docs/upstream-blessings.md), [backend contract](https://github.com/tuna-os/wootc/blob/main/docs/backend-contract.md) |
| IT evaluator | [IT-admin quick start](https://github.com/tuna-os/wootc/blob/main/docs/it-admin-quick-start.md) | [Manual testing](https://github.com/tuna-os/wootc/blob/main/docs/manual-testing.md), [destructive paths](https://github.com/tuna-os/wootc/blob/main/docs/destructive-paths.md); this is not a fleet-management product |

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
- [First-boot evidence](https://github.com/tuna-os/wootc/blob/main/docs/firstboot-evidence.md) — observed guest identity and completion records.
- [WSL migration](https://github.com/tuna-os/wootc/blob/main/docs/wsl-migration.md) — manual transfer boundaries; no automatic WSL distro or account import.
- [IT-admin quick start](https://github.com/tuna-os/wootc/blob/main/docs/it-admin-quick-start.md) — bounded single-machine evaluation, not fleet rollout.
- [Adoption outreach](https://github.com/tuna-os/wootc/blob/main/docs/adoption-outreach.md) — approval-gated invitations and scenario briefs, not claimed success stories.
- [E2E migration coverage](https://github.com/tuna-os/wootc/blob/main/docs/e2e-coverage.md) — each migrated item, its code, and its hosted E2E check.
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
- [v0.3.0-beta release notes](https://github.com/tuna-os/wootc/blob/main/docs/release-notes-v0.3.0-beta.md) — draft release material; consult tags and release evidence before you call it shipped.
- [v1.0.0 release notes](https://github.com/tuna-os/wootc/blob/main/docs/release-notes-v1.0.0.md) — release goals and evidence checklist, not a shipped-version claim.

## Document collections

- [`adr/`](https://github.com/tuna-os/wootc/blob/main/docs/adr) — architecture decision records.
  Includes [phase-1 architecture](https://github.com/tuna-os/wootc/blob/main/docs/adr/0001-phase1-first-architecture.md),
  [hardware matching](https://github.com/tuna-os/wootc/blob/main/docs/adr/0002-hardware-preflight-bootc-matching.md),
  [OneDrive placeholders](https://github.com/tuna-os/wootc/blob/main/docs/adr/0003-onedrive-files-on-demand-migration.md),
  [composefs/kernel matching](https://github.com/tuna-os/wootc/blob/main/docs/adr/0004-composefs-kernel-module-matching.md),
  the [VM-first correction](https://github.com/tuna-os/wootc/blob/main/docs/adr/0004-restore-vm-first-product.md), and
  [session-envelope unlock](https://github.com/tuna-os/wootc/blob/main/docs/adr/0005-session-envelope-unlock.md) (approval pending).
- [`specs/`](https://github.com/tuna-os/wootc/blob/main/docs/specs) — detailed migration proposals.
  Read [enterprise migration](https://github.com/tuna-os/wootc/blob/main/docs/specs/enterprise-migration.md) and
  [migration extensions](https://github.com/tuna-os/wootc/blob/main/docs/specs/migration-extensions.md) as proposals unless an
  implementation and its acceptance evidence are explicitly named.
- [`experiments/`](https://github.com/tuna-os/wootc/blob/main/docs/experiments) — dated research notes and implementation experiments.
- [`evidence/`](https://github.com/tuna-os/wootc/blob/main/docs/evidence) — checked-in evidence summaries.
- [`experiments/evidence/`](https://github.com/tuna-os/wootc/blob/main/docs/experiments/evidence) — experiment artifacts and provenance.
- [`screenshots/`](https://github.com/tuna-os/wootc/blob/main/docs/screenshots) — UI walkthrough images.
