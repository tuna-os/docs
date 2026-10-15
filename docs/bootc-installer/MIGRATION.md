---
sidebar_position: 5
title: "MIGRATION"
---

This repository now holds every TunaOS / Bluefin bootc installer frontend.
Four of them were separate repositories until 2026-09-17; they were imported
with `git subtree add`, so their full history is here (`git log
frontends/kde` works), and the old repositories are frozen with a pointer
back. This page records what moved, what did not, and every open pull request
and issue that existed on the old repositories at the moment of the move, so
nothing is lost in the shuffle. Tracking epic:
[bootc-installer#83](https://github.com/tuna-os/bootc-installer/issues/83).

## Layout

| Path | Frontend | Toolkit | Was |
|---|---|---|---|
| `bootc_installer/` (+ `data/`, `flatpak/`, `tests/`) | GNOME | GTK4 / libadwaita, Python | this repository, unchanged location |
| `frontends/kde/` | KDE Plasma | Qt 6 / Kirigami, C++ + QML | `tuna-os/tuna-installer-kde` |
| `frontends/cosmic/` | COSMIC | libcosmic / iced, Rust | `tuna-os/tuna-installer-cosmic` |
| `frontends/niri/` | Niri | Quickshell QML + Go backend | `tuna-os/tuna-installer-niri` |
| `frontends/xfce/` | XFCE | GTK3 / PyGObject | `tuna-os/tuna-installer-xfce` |
| `fisherman/` | backend (all five) | Go | `tuna-os/fisherman`, still a **submodule**, still its own repo |
| `shared/` | the shared core | | new |

`shared/` is where parity work lands from now on:

- `shared/recipe/fisherman-recipe.schema.json`: the recipe every frontend
  writes for fisherman. Canonical copy; `frontends/kde/` keeps a byte-identical
  copy because its Flatpak builds from that directory alone, and
  `tests/unit/test_shared_recipe_schema.py` fails when they diverge.
- `shared/walkthrough/parity_report.py`: the screen contract (which screens
  every installer must show, matched by heading text) and the report writer.
  The niri and xfce harnesses import it; the GNOME harness imports it; KDE
  (`tests/parity_report.h`) and COSMIC still vendor their own copy and are
  checked for drift in CI.
- `shared/walkthrough/aggregate.py`: builds
  [`docs/walkthrough/`](https://github.com/tuna-os/bootc-installer/blob/dev/docs/walkthrough/README.md), the one page that shows all
  five installers screen by screen with the parity matrix on top.

## What moved, mechanically

- Each old repo's `.github/workflows/*` became a root workflow with the
  frontend's name in it: `screenshots-<name>.yml`, `publish-flatpak-<name>.yml`,
  plus `ci-niri.yml` and `cargo-sources-cosmic.yml`. Bodies are unchanged
  apart from `working-directory: frontends/<name>` and path filters.
- The GNOME frontend gained the screenshot harness it never had
  (`tests/gui/capture-screens.py`, `screenshots-gnome.yml`).
- Publishing to the tuna-os Flatpak remote no longer happens on every push.
  It happens on promotion to `prod`, for every frontend, see
  [`RELEASE.md`](https://github.com/tuna-os/bootc-installer/blob/dev/docs/RELEASE.md).
- `.ste-budget` is the sum of the five repos' budgets (368 + 54 + 60 + 25 +
  36 = 543). The per-frontend `.ste-budget` files are left in place as a
  record; only the root one is read.
- Each frontend keeps its own `README.md`, `AGENTS.md`, `DESIGN.md`,
  `docs/`, `LICENSE`, `renovate.json`, `codecov.yml`. The last two are
  inert now (Renovate and Codecov read the root files); folding their rules
  into the root configs is a follow-up.

## What did not move

- **fisherman** stays a separate repository and a submodule. It has its own
  release cut (`release-cut.yml` → GoReleaser) and its own `dev`/`prod`. The
  four imported frontends' Flatpak manifests still build fisherman from a
  pinned `tuna-os/fisherman` commit rather than from the submodule; unifying
  that pin is a follow-up.
- The GNOME frontend stays at the repository root rather than under
  `frontends/gnome/`. Moving it touches meson, the Flatpak manifest, every
  workflow and every test path at once; it is a separate PR once this one
  has settled.
- The old repositories are not deleted. They carry a "moved" banner and
  should be archived once their open items below are re-homed.

## Follow-ups this migration creates

1. ~~Give this repository write access to the GHCR packages of the four
   frontends.~~ Resolved differently: every frontend now publishes to the
   one package this repository owns, `ghcr.io/tuna-os/bootc-installer`.
   The tags are `gnome`, `kde`, `cosmic`, `niri` and `xfce`, each also
   with `-<arch>` and `-<tag>-<arch>`; GNOME keeps `latest`. The old
   `ghcr.io/tuna-os/tuna-installer-{kde,cosmic,niri,xfce}` packages stay
   at the last builds of the old repositories. Live-ISO builds that still
   pull those names must move to the new tags.
2. Re-file or transfer the open issues below against this repository (GitHub
   can transfer issues between repos in the same org; PRs cannot be
   transferred and must be re-opened against `frontends/<name>/`).
3. Archive the four old repositories.
4. Fold `frontends/*/renovate.json` (notably COSMIC's Cargo.lock automerge)
   into the root `renovate.json`.
5. Point the four imported Flatpak manifests at the fisherman submodule.
6. Move the GNOME frontend under `frontends/gnome/`.

Done since the move: the COSMIC capture writes the strings each page renders
(`ui::page_text`) to `texts.json`, so its parity row is measured like the
others.

---

## Open pull requests and issues at the time of the move (as of 2026-09-17)

Summary: bootc-installer 4 PRs / 23 issues; fisherman 5 PRs / 31 issues; tuna-installer-kde 1 PR / 22 issues; tuna-installer-cosmic 3 PRs / 26 issues; tuna-installer-niri 3 PRs / 24 issues; tuna-installer-xfce 1 PR / 19 issues. Total: 17 open PRs, 145 open issues.

## tuna-os/bootc-installer

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#88](https://github.com/tuna-os/bootc-installer/pull/88) | [sec-check] fix: upgrade geolocation API to HTTPS (labels: hold) | hanthor-hive-agent[bot] | sec/fix-unencrypted-http -> dev | 2026-09-17 |
| [#86](https://github.com/tuna-os/bootc-installer/pull/86) | [architect] refactor: extract disk plan boundary (labels: agent/architect, architecture, hold, hive/hive-school-tunaos) | hanthor-hive-agent[bot] | arch/refactor-disk-plan -> dev | 2026-09-15 |
| [#75](https://github.com/tuna-os/bootc-installer/pull/75) | test(slurp): cover fisherman-path resolution, budget math, and scan lifecycle (labels: hold) | hanthor-hive-agent[bot] | quality/slurp-coverage -> dev | 2026-09-07 |
| [#72](https://github.com/tuna-os/bootc-installer/pull/72) | [quality] test: cover WirelessRow security classification and device status logic (labels: hold) | hanthor-hive-agent[bot] | quality/network-security-status-tests -> dev | 2026-09-06 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#89](https://github.com/tuna-os/bootc-installer/issues/89) | [sec-check] Missing top-level permissions blocks in GitHub Actions workflows | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-17 |
| [#87](https://github.com/tuna-os/bootc-installer/issues/87) | [sec-check] Insecure unencrypted HTTP API endpoint in bootc_installer/core/timezones.py | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-17 |
| [#85](https://github.com/tuna-os/bootc-installer/issues/85) | [architect] Disk wizard collapses six boundaries into one GTK module | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-15 |
| [#84](https://github.com/tuna-os/bootc-installer/issues/84) | need docs guidbook. and a slimmed down readme and automated screenshot walkthrough like other projects | hanthor | — | 2026-09-15 |
| [#83](https://github.com/tuna-os/bootc-installer/issues/83) | [epic] Consolidate all bootc-installer frontend repos into monorepo | hanthor | — | 2026-09-15 |
| [#82](https://github.com/tuna-os/bootc-installer/issues/82) | [architect] Host execution policy is fragmented across GTK and core modules | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-15 |
| [#80](https://github.com/tuna-os/bootc-installer/issues/80) | [architect] Progress view owns privileged execution and UI lifecycle | hanthor-hive-agent | architecture, tech-debt | 2026-09-14 |
| [#79](https://github.com/tuna-os/bootc-installer/issues/79) | [bug] User password is not hashed before it gets passed to fisherman | certifiedfoolio | bug | 2026-09-13 |
| [#78](https://github.com/tuna-os/bootc-installer/issues/78) | [bug] Don't hardcode the set of groups to add the user to | certifiedfoolio | bug | 2026-09-10 |
| [#74](https://github.com/tuna-os/bootc-installer/issues/74) | [ci-maintainer] actionlint.yml/validate-flatpak.yml cancel-in-progress evicts dev/prod push runs, masking real failures as 'cancelled' | hanthor-hive-agent | ci, agent/ci-maintainer, hive/hive-school-tunaos | 2026-09-07 |
| [#71](https://github.com/tuna-os/bootc-installer/issues/71) | Simplified Technical English: 368 findings to clear | hanthor | — | 2026-09-06 |
| [#64](https://github.com/tuna-os/bootc-installer/issues/64) | [telemetry] Audit: Observability Stack & Recommended Enhancements | hanthor-hive-agent | hive/hive-keen-mink, agent/telemetry | 2026-09-03 |
| [#62](https://github.com/tuna-os/bootc-installer/issues/62) | A committed OSTree store (17,364 objects) is still in git history | hanthor | — | 2026-09-02 |
| [#61](https://github.com/tuna-os/bootc-installer/issues/61) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#60](https://github.com/tuna-os/bootc-installer/issues/60) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#59](https://github.com/tuna-os/bootc-installer/issues/59) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#57](https://github.com/tuna-os/bootc-installer/issues/57) | [operations] no rollback runbook for a bad auto-release marked --latest | hanthor-hive-agent | hive/hive-keen-mink, agent/operations | 2026-09-02 |
| [#56](https://github.com/tuna-os/bootc-installer/issues/56) | [quality] coverage: defaults/network.py (Wi-Fi/NM setup) has 0% measured GTK-integration coverage | hanthor-hive-agent | hive/hive-keen-mink, quality, testing, agent/quality | 2026-09-02 |
| [#51](https://github.com/tuna-os/bootc-installer/issues/51) | [ACMM L4] Add Auto-QA self-tuning | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#48](https://github.com/tuna-os/bootc-installer/issues/48) | [architect] GUI and fisherman duplicate the install recipe contract without compatibility validation | hanthor-hive-agent | hive/hive-keen-mink, agent/architect, architecture, tech-debt | 2026-09-01 |
| [#38](https://github.com/tuna-os/bootc-installer/issues/38) | [guide] bootc-installer README, CONTRIBUTING, and CLAUDE.md reference stale projectbluefin/ URLs | hanthor-hive-agent | documentation, hive/hive-keen-mink, agent/guide | 2026-09-02 |
| [#37](https://github.com/tuna-os/bootc-installer/issues/37) | [strategist] Establish a Tuna-owned, verified installer distribution channel | hanthor-hive-agent | hive/hive-keen-mink, roadmap, agent/strategist | 2026-08-25 |
| [#23](https://github.com/tuna-os/bootc-installer/issues/23) | We PR fixes an features upstream | hanthor | — | 2026-08-20 |

## tuna-os/fisherman

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#222](https://github.com/tuna-os/fisherman/pull/222) | [sec-check] fix: explicitly chmod transient LUKS key file to 0600 (labels: hold) | hanthor-hive-agent[bot] | sec/fix-fisherman-luks-key-perms -> dev | 2026-09-17 |
| [#216](https://github.com/tuna-os/fisherman/pull/216) | [sec-check] fix: use secure temporary file creation for installer recipe in TUI | hanthor-hive-agent[bot] | sec/fix-fisherman-tmpfiles -> dev | 2026-09-11 |
| [#213](https://github.com/tuna-os/fisherman/pull/213) | [sec-check] fix: set restrictive permissions (0600) on temporary LUKS passphrase file (labels: hold) | hanthor-hive-agent[bot] | sec/fix-fisherman-luks-temp-file -> dev | 2026-09-10 |
| [#195](https://github.com/tuna-os/fisherman/pull/195) | [telemetry] feat: emit structured error event on fatal install failure | hanthor-hive-agent[bot] | telemetry/fatal-error-event -> dev | 2026-09-06 |
| [#179](https://github.com/tuna-os/fisherman/pull/179) | [guide] docs: refresh test and TUI requirements (labels: hive/hive-keen-mink, agent/guide) | hanthor-hive-agent[bot] | guide/docs-current-script-and-tui-requirements -> dev | 2026-09-06 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#221](https://github.com/tuna-os/fisherman/issues/221) | [sec-check] Insecure permissions on transient LUKS key file in StageFirstBootEnrollment | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-17 |
| [#219](https://github.com/tuna-os/fisherman/issues/219) | [bug] Partition guid is not set for root partition on sealed composefs images w/ encryption enabled | certifiedfoolio | bug | 2026-09-13 |
| [#218](https://github.com/tuna-os/fisherman/issues/218) | [sec-check] Security compliance and posture audit complete | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-12 |
| [#217](https://github.com/tuna-os/fisherman/issues/217) | [sec-check] Workflows lack default top-level permissions block or explicit least-privilege scoping | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-12 |
| [#215](https://github.com/tuna-os/fisherman/issues/215) | [sec-check] Insecure temporary file creation for installer recipe in TUI | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-11 |
| [#214](https://github.com/tuna-os/fisherman/issues/214) | [sec-check] Workflows lack default top-level permissions block | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-11 |
| [#212](https://github.com/tuna-os/fisherman/issues/212) | [sec-check] Insecure permissions on temporary LUKS passphrase file in EnrollTPM2 | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-10 |
| [#211](https://github.com/tuna-os/fisherman/issues/211) | [bug] sealed composefs based install via bootc-installer fails with ENOSPC | certifiedfoolio | bug | 2026-09-09 |
| [#209](https://github.com/tuna-os/fisherman/issues/209) | [shared-ci] Bootcrew VM Boot (E2E tests) failing across tuna-os/fisherman | hanthor-hive-agent | hive/hive-good-frog, ci, agent/ci-maintainer | 2026-09-05 |
| [#208](https://github.com/tuna-os/fisherman/issues/208) | [sec-check] Workflows lack default top-level permissions: contents: read | hanthor-hive-agent | security, agent/security, hive/hive-good-frog | 2026-09-05 |
| [#206](https://github.com/tuna-os/fisherman/issues/206) | [strategist] SELinux shim privilege-escalation fix (#161) has never reached a consumer — wootc pin 60 commits behind dev | hanthor-hive-agent | hive/hive-keen-mink, agent/strategist, roadmap | 2026-09-03 |
| [#205](https://github.com/tuna-os/fisherman/issues/205) | [strategist] Q3 release items all regressed since 2026-08-23 — release machinery built, never once dispatched | hanthor-hive-agent | hive/hive-keen-mink, agent/strategist, roadmap | 2026-09-03 |
| [#204](https://github.com/tuna-os/fisherman/issues/204) | [quality] missing-workflow: tui/ Go module has real tests but zero CI execution | hanthor-hive-agent | hive/hive-keen-mink, quality, testing, agent/quality | 2026-09-03 |
| [#203](https://github.com/tuna-os/fisherman/issues/203) | [shared-ci] required-canaries failing across tuna-os/fisherman | hanthor-hive-agent | hive/hive-keen-mink, agent/scanner, hive/advisory | 2026-09-06 |
| [#200](https://github.com/tuna-os/fisherman/issues/200) | [ACMM L0] Add Coverage gate | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#199](https://github.com/tuna-os/fisherman/issues/199) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#198](https://github.com/tuna-os/fisherman/issues/198) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#197](https://github.com/tuna-os/fisherman/issues/197) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#193](https://github.com/tuna-os/fisherman/issues/193) | [shared-ci] required-canaries (vm-boot-required) failing across tuna-os/fisherman | hanthor-hive-agent | hive/hive-keen-mink, agent/scanner | 2026-09-03 |
| [#192](https://github.com/tuna-os/fisherman/issues/192) | [ACMM L4] Add Auto-QA self-tuning | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#189](https://github.com/tuna-os/fisherman/issues/189) | [guide] docs: update CONTRIBUTING.md Go version requirement for TUI module and document TUI build/test instructions | hanthor-hive-agent | documentation, hive/hive-keen-mink, agent/guide | 2026-09-02 |
| [#183](https://github.com/tuna-os/fisherman/issues/183) | [guide] document the TUI Go 1.26.2 toolchain requirement | hanthor-hive-agent | documentation, hive/hive-keen-mink, agent/guide | 2026-09-02 |
| [#182](https://github.com/tuna-os/fisherman/issues/182) | [guide] refresh Bootcrew script interfaces and verification behavior | hanthor-hive-agent | documentation, hive/hive-keen-mink, agent/guide | 2026-09-02 |
| [#178](https://github.com/tuna-os/fisherman/issues/178) | [architect] TUI invokes a nonexistent backend command and has no executable contract test | hanthor-hive-agent | architecture, hive/hive-keen-mink, tech-debt, agent/architect | 2026-09-02 |
| [#176](https://github.com/tuna-os/fisherman/issues/176) | slim down deployment or some solution for computers with low memory less than 8 GB | hanthor | — | 2026-08-29 |
| [#175](https://github.com/tuna-os/fisherman/issues/175) | repository says it's been moved and migrated but actually were actively developing here | hanthor | — | 2026-09-02 |
| [#173](https://github.com/tuna-os/fisherman/issues/173) | [sec-check] Published SSH test images allow known-password root login | hanthor-hive-agent | security, agent/security, hive/hive-keen-mink | 2026-08-28 |
| [#162](https://github.com/tuna-os/fisherman/issues/162) | [strategist] The org's install engine has no settled home, no current release, and two consumers pinning different upstreams | hanthor-hive-agent | documentation, release, hive/hive-keen-mink, agent/strategist | 2026-09-02 |
| [#160](https://github.com/tuna-os/fisherman/issues/160) | [sec-check] SELinux disabled on every install by default — selinuxDisabled hardcoded true in all installer frontends and the recipe schema | hanthor-hive-agent | security, agent/security, hive/hive-keen-mink | 2026-08-23 |
| [#106](https://github.com/tuna-os/fisherman/issues/106) | [ci-maintainer] advisory bootcrew matrix red on 7+ PRs: bootc install-to-filesystem 'Creating imgstorage: No such file or directory' after invalid xfs+composefs combos dropped | hanthor-hive-agent | — | 2026-09-02 |
| [#54](https://github.com/tuna-os/fisherman/issues/54) | Dependency Dashboard | renovate | — | 2026-09-02 |

## tuna-os/tuna-installer-kde

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#86](https://github.com/tuna-os/tuna-installer-kde/pull/86) | [strategist] planning: refresh ROADMAP currency for aarch64 flatpak and ste governance | hanthor-hive-agent[bot] | strategy/tuna-installer-kde-roadmap -> main | 2026-09-16 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#87](https://github.com/tuna-os/tuna-installer-kde/issues/87) | [sec-check] Missing top-level permissions block in ste.yml workflow | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#85](https://github.com/tuna-os/tuna-installer-kde/issues/85) | [strategist] align Q3/Q4 installer roadmap with aarch64 flatpak delivery and ste governance | hanthor-hive-agent | agent/strategist, hive/hive-school-tunaos, roadmap | 2026-09-16 |
| [#84](https://github.com/tuna-os/tuna-installer-kde/issues/84) | [architect] Disk model collapses hardware discovery into the UI thread | hanthor-hive-agent | architecture, tech-debt, agent/architect, hive/hive-school-tunaos | 2026-09-15 |
| [#83](https://github.com/tuna-os/tuna-installer-kde/issues/83) | [architect] InstallerController collapses install-runtime boundaries | hanthor-hive-agent | architecture, tech-debt | 2026-09-14 |
| [#82](https://github.com/tuna-os/tuna-installer-kde/issues/82) | [architect] Screenshot generator bypasses the PR validation boundary | hanthor-hive-agent | architecture, tech-debt, agent/architect, hive/hive-school-tunaos | 2026-09-08 |
| [#81](https://github.com/tuna-os/tuna-installer-kde/issues/81) | [quality] coverage-gap: InstallerController::drainBuffer()/appendLine()/fail() have zero unit or e2e refs | hanthor-hive-agent | quality, testing, agent/quality, hive/new-hive-99 | 2026-09-07 |
| [#80](https://github.com/tuna-os/tuna-installer-kde/issues/80) | [quality] coverage-gap: InstallerController::encryptionLabel() only 1 of 4 branches ever exercised | hanthor-hive-agent | quality, testing, agent/quality, hive/new-hive-99 | 2026-09-06 |
| [#79](https://github.com/tuna-os/tuna-installer-kde/issues/79) | Simplified Technical English: 54 findings to clear | hanthor | — | 2026-09-06 |
| [#72](https://github.com/tuna-os/tuna-installer-kde/issues/72) | [telemetry] Audit: what the installer can and cannot tell you when an install fails | hanthor-hive-agent | hive/hive-keen-mink, agent/telemetry | 2026-09-03 |
| [#70](https://github.com/tuna-os/tuna-installer-kde/issues/70) | [ACMM L0] Add Coverage gate | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#69](https://github.com/tuna-os/tuna-installer-kde/issues/69) | [ci-maintainer] screenshots.yml pushes to main without rebase — a merge during the run loses the refreshed walkthrough and reds main | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#68](https://github.com/tuna-os/tuna-installer-kde/issues/68) | [ci-maintainer] codecov.yml and biome.json declare gates that no workflow runs | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#67](https://github.com/tuna-os/tuna-installer-kde/issues/67) | [ci-maintainer] Flatpak manifest, AppStream metadata and the recipe schema have no pre-merge check — the first job that builds them is the publish on main | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#66](https://github.com/tuna-os/tuna-installer-kde/issues/66) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#65](https://github.com/tuna-os/tuna-installer-kde/issues/65) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#64](https://github.com/tuna-os/tuna-installer-kde/issues/64) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#60](https://github.com/tuna-os/tuna-installer-kde/issues/60) | [strategist] Frontend-to-backend recipe contract lives inside one frontend and no repo owns it | hanthor-hive-agent | hive/hive-keen-mink, architecture, agent/strategist | 2026-09-02 |
| [#55](https://github.com/tuna-os/tuna-installer-kde/issues/55) | [architect] Flatpak publisher delegates write authority to a mutable workflow branch | hanthor-hive-agent | hive/hive-keen-mink, architecture, tech-debt, agent/architect | 2026-08-31 |
| [#51](https://github.com/tuna-os/tuna-installer-kde/issues/51) | [sec-check] Privileged Flatpak backend is built from mutable fisherman dev branch | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-30 |
| [#48](https://github.com/tuna-os/tuna-installer-kde/issues/48) | [guide] ROADMAP lists completed security and backend-test work as open | hanthor-hive-agent | documentation, agent/guide, hive/hive-keen-mink | 2026-08-29 |
| [#47](https://github.com/tuna-os/tuna-installer-kde/issues/47) | CI runs no tests on pull requests — only the screenshot capture | hanthor | — | 2026-09-06 |
| [#3](https://github.com/tuna-os/tuna-installer-kde/issues/3) | Dependency Dashboard | renovate | — | 2026-09-06 |

## tuna-os/tuna-installer-cosmic

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#92](https://github.com/tuna-os/tuna-installer-cosmic/pull/92) | [strategist] planning: refresh ROADMAP.md for September 2026 | hanthor-hive-agent[bot] | strategy/cosmic-installer-roadmap-sept2026 -> main | 2026-09-17 |
| [#88](https://github.com/tuna-os/tuna-installer-cosmic/pull/88) | [strategist] planning: refresh ROADMAP currency for Q3 2026 status & release policy | hanthor-hive-agent[bot] | strategy/cosmic-roadmap-currency -> main | 2026-09-16 |
| [#84](https://github.com/tuna-os/tuna-installer-cosmic/pull/84) | [architect] refactor: extract system backend (labels: hold) | hanthor-hive-agent[bot] | arch/refactor-cosmic-backend-boundary -> main | 2026-09-15 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#91](https://github.com/tuna-os/tuna-installer-cosmic/issues/91) | [strategist] tuna-installer-cosmic ROADMAP currency refresh for Q3/Q4 2026 | hanthor-hive-agent | agent/strategist, roadmap, hive/hive-school-tunaos | 2026-09-17 |
| [#90](https://github.com/tuna-os/tuna-installer-cosmic/issues/90) | [sec-check] Missing top-level permissions block in ste.yml workflow | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#89](https://github.com/tuna-os/tuna-installer-cosmic/issues/89) | [sec-check] Missing top-level permissions block in cargo-sources.yml workflow | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#87](https://github.com/tuna-os/tuna-installer-cosmic/issues/87) | [strategist] tuna-installer-cosmic ROADMAP currency refresh for Q3 2026 status & release policy | hanthor-hive-agent | agent/strategist, roadmap, hive/hive-school-tunaos | 2026-09-16 |
| [#86](https://github.com/tuna-os/tuna-installer-cosmic/issues/86) | [sec-check] Missing top-level permissions and excessive PR write scope in CI workflows | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#85](https://github.com/tuna-os/tuna-installer-cosmic/issues/85) | [architect] Fisherman progress protocol is collapsed into a terminal log blob | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-15 |
| [#83](https://github.com/tuna-os/tuna-installer-cosmic/issues/83) | [architect] COSMIC application object collapses backend lifecycle boundaries | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-15 |
| [#82](https://github.com/tuna-os/tuna-installer-cosmic/issues/82) | [architect] Sixteen installer contract tests exist but no CI workflow runs them | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-14 |
| [#81](https://github.com/tuna-os/tuna-installer-cosmic/issues/81) | [architect] Flatpak publisher delegates write authority to a mutable workflow ref | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-14 |
| [#79](https://github.com/tuna-os/tuna-installer-cosmic/issues/79) | [quality] coverage: page-navigation state machine and encryption_ok() gate covered by neither unit nor e2e tests | hanthor-hive-agent | quality, testing, agent/quality, hive/new-hive-99 | 2026-09-07 |
| [#78](https://github.com/tuna-os/tuna-installer-cosmic/issues/78) | Simplified Technical English: 60 findings to clear | hanthor | — | 2026-09-06 |
| [#72](https://github.com/tuna-os/tuna-installer-cosmic/issues/72) | [ACMM L0] Add Coverage gate | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#70](https://github.com/tuna-os/tuna-installer-cosmic/issues/70) | [ci-maintainer] screenshots.yml pushes to main without rebase — concurrent merge turns a passing capture into a red run and drops the refreshed screenshots | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#69](https://github.com/tuna-os/tuna-installer-cosmic/issues/69) | [quality] No CI job runs cargo test — 20 unit tests never execute, and codecov.yml is dead config | hanthor-hive-agent | hive/hive-keen-mink, quality, testing, agent/quality | 2026-09-02 |
| [#68](https://github.com/tuna-os/tuna-installer-cosmic/issues/68) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#67](https://github.com/tuna-os/tuna-installer-cosmic/issues/67) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#66](https://github.com/tuna-os/tuna-installer-cosmic/issues/66) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#65](https://github.com/tuna-os/tuna-installer-cosmic/issues/65) | [strategist] Implement UI screen coverage matrix and pre-merge CI gates for COSMIC installer | hanthor-hive-agent | hive/hive-keen-mink, agent/strategist, roadmap | 2026-09-02 |
| [#64](https://github.com/tuna-os/tuna-installer-cosmic/issues/64) | [strategist] Installer parity gate has not passed since 2026-07-18 while all four frontends ship to users daily | hanthor-hive-agent | hive/hive-keen-mink, architecture, agent/strategist | 2026-09-02 |
| [#62](https://github.com/tuna-os/tuna-installer-cosmic/issues/62) | [ci-maintainer] Rust unit tests are not executed in CI | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#54](https://github.com/tuna-os/tuna-installer-cosmic/issues/54) | [sec-check] Publish job grants write permissions and inherited secrets to a mutable reusable workflow ref | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-28 |
| [#53](https://github.com/tuna-os/tuna-installer-cosmic/issues/53) | [sec-check] Flatpak build imports privileged fisherman backend from mutable external dev branch | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-28 |
| [#40](https://github.com/tuna-os/tuna-installer-cosmic/issues/40) | [sec-check] just cargo-sources executes an unpinned generator from flatpak-builder-tools master and unpinned pip installs to produce the committed vendoring manifest | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-23 |
| [#37](https://github.com/tuna-os/tuna-installer-cosmic/issues/37) | [architect] Screenshot harness ships in the installer — TUNA_CAPTURE_DIR puts the released binary into fixture mode | hanthor-hive-agent | enhancement, hive/hive-keen-mink, agent/architect | 2026-08-23 |
| [#36](https://github.com/tuna-os/tuna-installer-cosmic/issues/36) | [architect] COSMIC is the only frontend that emits no parity report — its screen coverage is unmeasured in both matrices | hanthor-hive-agent | enhancement, hive/hive-keen-mink, agent/architect | 2026-08-23 |
| [#3](https://github.com/tuna-os/tuna-installer-cosmic/issues/3) | Dependency Dashboard | renovate | — | 2026-09-06 |

## tuna-os/tuna-installer-niri

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#79](https://github.com/tuna-os/tuna-installer-niri/pull/79) | [strategist] planning: refresh ROADMAP currency for Q3 exit readiness and multi-arch release status | hanthor-hive-agent[bot] | strategy/niri-roadmap -> main | 2026-09-16 |
| [#73](https://github.com/tuna-os/tuna-installer-niri/pull/73) | [quality] tests: cover openInstallLog and writeRecipe error branches | hanthor-hive-agent[bot] | quality/test-log-writerecipe-errors -> main | 2026-09-07 |
| [#70](https://github.com/tuna-os/tuna-installer-niri/pull/70) | [quality] tests: cover runInstall validation, defaults, and fisherman exec paths (labels: hold) | hanthor-hive-agent[bot] | quality/test-runinstall-coverage -> main | 2026-09-06 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#81](https://github.com/tuna-os/tuna-installer-niri/issues/81) | [sec-check] missing top-level permissions block in screenshots.yml workflow | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#80](https://github.com/tuna-os/tuna-installer-niri/issues/80) | [sec-check] missing top-level permissions block in ste.yml workflow | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-16 |
| [#78](https://github.com/tuna-os/tuna-installer-niri/issues/78) | [strategist] tuna-installer-niri ROADMAP currency refresh for Q3 exit readiness and multi-arch release status | hanthor-hive-agent | roadmap, agent/strategist, hive/hive-school-tunaos | 2026-09-16 |
| [#77](https://github.com/tuna-os/tuna-installer-niri/issues/77) | [architect] Flatpak publisher delegates write authority to a mutable workflow | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-16 |
| [#76](https://github.com/tuna-os/tuna-installer-niri/issues/76) | [architect] Flatpak publisher delegates write authority to mutable shared workflow | hanthor-hive-agent | architecture, tech-debt | 2026-09-14 |
| [#75](https://github.com/tuna-os/tuna-installer-niri/issues/75) | [architect] QML wizard collapses views, transport, and recipe policy into one root component | hanthor-hive-agent | architecture, tech-debt | 2026-09-13 |
| [#74](https://github.com/tuna-os/tuna-installer-niri/issues/74) | [architect] QML-backend JSON contract has no integration gate | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-08 |
| [#71](https://github.com/tuna-os/tuna-installer-niri/issues/71) | [quality] coverage: fishermanCommand/hostCommand Flatpak branch has zero unit or e2e coverage | hanthor-hive-agent | quality, testing, agent/quality, hive/new-hive-99 | 2026-09-07 |
| [#69](https://github.com/tuna-os/tuna-installer-niri/issues/69) | Simplified Technical English: 25 findings to clear | hanthor | — | 2026-09-06 |
| [#64](https://github.com/tuna-os/tuna-installer-niri/issues/64) | [architect] Recipe construction lives untested in QML — defaultImage falls back to albacore:gnome on a niri installer | hanthor-hive-agent | hive/hive-keen-mink, agent/architect, architecture, tech-debt | 2026-09-03 |
| [#61](https://github.com/tuna-os/tuna-installer-niri/issues/61) | [quality] codecov.yml declares a 45% coverage gate that no workflow feeds | hanthor-hive-agent | hive/hive-keen-mink, quality, testing, agent/quality | 2026-09-03 |
| [#60](https://github.com/tuna-os/tuna-installer-niri/issues/60) | [ACMM L0] Add Coverage gate | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#59](https://github.com/tuna-os/tuna-installer-niri/issues/59) | [ci-maintainer] screenshots.yml: failed runs ship a stale walkthrough.gif, and the main push has no rebase or retry | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#58](https://github.com/tuna-os/tuna-installer-niri/issues/58) | [ci-maintainer] .golangci.yml and codecov.yml declare gates that no workflow runs | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#57](https://github.com/tuna-os/tuna-installer-niri/issues/57) | [ci-maintainer] CI cancel-in-progress applies to main pushes — run 33662977635 passed every step and was cancelled 34s in | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#56](https://github.com/tuna-os/tuna-installer-niri/issues/56) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#55](https://github.com/tuna-os/tuna-installer-niri/issues/55) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#54](https://github.com/tuna-os/tuna-installer-niri/issues/54) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#51](https://github.com/tuna-os/tuna-installer-niri/issues/51) | [strategist] Installer family has shipped for two months with no version identity; the release-model decision has no owner | hanthor-hive-agent | hive/hive-keen-mink, roadmap, agent/strategist | 2026-09-02 |
| [#43](https://github.com/tuna-os/tuna-installer-niri/issues/43) | [strategist] ROADMAP status drifted within five days — add evidence-backed refresh cadence | hanthor-hive-agent | hive/hive-keen-mink, roadmap, agent/strategist | 2026-08-29 |
| [#40](https://github.com/tuna-os/tuna-installer-niri/issues/40) | [sec-check] Publish workflow trusts mutable reusable workflow while forwarding all secrets | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-29 |
| [#39](https://github.com/tuna-os/tuna-installer-niri/issues/39) | [sec-check] Screenshot CI executes unpinned PyQt6 with repository write access | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-08-29 |
| [#25](https://github.com/tuna-os/tuna-installer-niri/issues/25) | [architect] Niri cannot create a user account — the recipe struct omits 'user', and 5 more fields are declared but never populated | hanthor-hive-agent | hive/hive-keen-mink, agent/architect | 2026-08-23 |
| [#3](https://github.com/tuna-os/tuna-installer-niri/issues/3) | Dependency Dashboard | renovate | — | 2026-09-06 |

## tuna-os/tuna-installer-xfce

### Open pull requests

| Number | Title | Author | Head -> Base | Updated |
|---|---|---|---|---|
| [#73](https://github.com/tuna-os/tuna-installer-xfce/pull/73) | [strategist] planning: refresh ROADMAP currency for tuna-installer-xfce | hanthor-hive-agent[bot] | strategy/xfce-installer-refresh -> main | 2026-09-16 |

### Open issues

| Number | Title | Author | Labels | Updated |
|---|---|---|---|---|
| [#74](https://github.com/tuna-os/tuna-installer-xfce/issues/74) | [sec-check] Missing top-level permissions block in GitHub Workflows drop-bot-review-requests.yml and screenshots.yml | hanthor-hive-agent | security, agent/security, hive/hive-school-tunaos | 2026-09-17 |
| [#72](https://github.com/tuna-os/tuna-installer-xfce/issues/72) | [strategist] tuna-installer-xfce ROADMAP currency refresh for Q3/Q4 2026 milestones | hanthor-hive-agent | agent/strategist, hive/hive-school-tunaos, roadmap | 2026-09-16 |
| [#71](https://github.com/tuna-os/tuna-installer-xfce/issues/71) | [architect] Core module collapses seven backend boundaries | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-16 |
| [#69](https://github.com/tuna-os/tuna-installer-xfce/issues/69) | [architect] Install process lifetime is not owned outside GTK callbacks | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-14 |
| [#68](https://github.com/tuna-os/tuna-installer-xfce/issues/68) | [architect] Flatpak publisher delegates write authority to a mutable workflow ref | hanthor-hive-agent | agent/architect, architecture, tech-debt, hive/hive-school-tunaos | 2026-09-09 |
| [#65](https://github.com/tuna-os/tuna-installer-xfce/issues/65) | [quality] test-infrastructure: no CI workflow runs the pytest suite | hanthor-hive-agent | quality, testing, agent/quality, hive/new-hive-99 | 2026-09-06 |
| [#64](https://github.com/tuna-os/tuna-installer-xfce/issues/64) | Simplified Technical English: 36 findings to clear | hanthor | — | 2026-09-06 |
| [#57](https://github.com/tuna-os/tuna-installer-xfce/issues/57) | [sec-check] screenshots.yml runs PR-supplied code with a contents:write token on pull_request | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-09-02 |
| [#56](https://github.com/tuna-os/tuna-installer-xfce/issues/56) | [sec-check] Publish job inherits all secrets into a mutable @main reusable workflow with contents+packages write | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-09-03 |
| [#55](https://github.com/tuna-os/tuna-installer-xfce/issues/55) | [sec-check] Privileged fisherman backend and its Polkit policy are built from an unpinned external dev branch | hanthor-hive-agent | hive/hive-keen-mink, security, agent/security | 2026-09-02 |
| [#54](https://github.com/tuna-os/tuna-installer-xfce/issues/54) | [ACMM L0] Add Coverage gate | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#52](https://github.com/tuna-os/tuna-installer-xfce/issues/52) | [ci-maintainer] failed screenshot captures upload the previous run's walkthrough.gif and PNGs — the always() artifact is not evidence about the failing run | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#51](https://github.com/tuna-os/tuna-installer-xfce/issues/51) | [ci-maintainer] screenshots.yml commits to main with a bare git push — a concurrent merge fails the run and drops the refreshed images | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/ci-maintainer | 2026-09-02 |
| [#50](https://github.com/tuna-os/tuna-installer-xfce/issues/50) | [ACMM L0] Add CI/CD pipeline | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#49](https://github.com/tuna-os/tuna-installer-xfce/issues/49) | [ACMM L0] Add E2E tests | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#48](https://github.com/tuna-os/tuna-installer-xfce/issues/48) | [ACMM L0] Add Test suite | hanthor-hive-agent | acmm, ai-fix-requested | 2026-09-02 |
| [#44](https://github.com/tuna-os/tuna-installer-xfce/issues/44) | [strategist] No installer repo has pre-merge CI — every merge publishes straight to the live Flatpak remote | hanthor-hive-agent | hive/hive-keen-mink, ci, agent/strategist | 2026-09-02 |
| [#23](https://github.com/tuna-os/tuna-installer-xfce/issues/23) | [architect] 40 unit tests exist and nothing runs them — no workflow invokes pytest | hanthor-hive-agent | enhancement, hive/hive-keen-mink, agent/architect | 2026-08-23 |
| [#3](https://github.com/tuna-os/tuna-installer-xfce/issues/3) | Dependency Dashboard | renovate | — | 2026-09-06 |
