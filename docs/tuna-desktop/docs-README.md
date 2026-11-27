---
sidebar_position: 5
title: "README"
---

Every document under `docs/`, with what it is and when to read it. Living
documents describe the current main branch. The documents under
[Reports and evidence](#reports-and-evidence-dated-historical) are dated
snapshots: they record what was true on their date and are not current
state.

When a document and the code disagree, the code, its tests, CI
([`.github/workflows/ci.yml`](https://github.com/tuna-os/tuna-desktop/blob/main/.github/workflows/ci.yml)) and `scripts/` are
authoritative; fix the document in the same pull request. Spektacular specs
and plans under `.spektacular/` are historical records, not current state
(see [AGENTS.md](https://github.com/tuna-os/tuna-desktop/blob/main/AGENTS.md)).

## Where to find it

| Looking for | Read |
|---|---|
| How close v1 is, with evidence per item | [v1.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md), its status section |
| Which GNOME 51 capabilities pass, and which test proves each | [parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md) |
| What is planned and in what order | [roadmap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) and the GitHub roadmap project |
| Installing or test-driving a build | [install.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md) |
| Running checks locally before a pull request | [testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#before-opening-a-pr) (`just check`) |
| Which CI lanes a pull request runs | [testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#which-lanes-a-pull-request-runs); `scripts/ci-select-lanes` is authoritative |
| Running a nested proof | [testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#nested-proofs) (`just proof <name>`) |
| How the parity ledger is checked against test results | [testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#parity-ledger-check) and [parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md#how-to-update) |
| The shell-control wire version and its rules | `ProtocolVersion::CURRENT` in [`crates/shell-control-schema/src/lib.rs`](https://github.com/tuna-os/tuna-desktop/blob/main/crates/shell-control-schema/src/lib.rs); rules in [api-stability.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md#shell-control-protocol-tuna-shell-control) |
| Wayland globals Tuna Desktop advertises | [protocols.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/protocols.md) |
| Every keyboard shortcut | [keymap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/keymap.md) |
| Every environment variable | [environment.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md) |
| Which GSettings keys are honoured | [settings-map.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md), [settings-desktop-inventory.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-desktop-inventory.md) |
| Cutting or recovering a release | [release.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release.md), [release-rollback.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release-rollback.md) |
| Performance budgets and the regression gate | [perf/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md#regression-gate-315), [`perf/budgets.json`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/budgets.json) |
| Trust boundaries and security release gates | [security-model.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md); report vulnerabilities per [SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md) |
| Why something was decided | [adr/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md) |
| Session logs and diagnostics | [session-operations.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md), [troubleshooting.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md) |

## Start here

- [../README.md](https://github.com/tuna-os/tuna-desktop/blob/main/README.md) — what Tuna Desktop is, its status, and how
  to try it.
- [v1.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md) — the v1 definition, the public victory checklist and the
  current evidence for each item. Read to know what "done" means.
- [roadmap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) — public roadmap, delivery sequence, requirement
  traceability and change control.
- [architecture.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/architecture.md) — process and authority boundaries
  between compositor, shell host and extensions. Read before a structural
  change.
- [../CONTRIBUTING.md](https://github.com/tuna-os/tuna-desktop/blob/main/CONTRIBUTING.md) — how to contribute, the test
  rule for features, and DCO sign-off.

## Use

- [install.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md) — test-drive in a VM, install the TunaOS image,
  the Debian-format package or from source, and log in through GDM.
- [../packaging/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md) — package targets, the
  Marlin image, and upgrading from the former name.
- [nested-session.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md) — run Tuna Desktop in a window,
  the shell crash-recovery journey, nested troubleshooting.
- [troubleshooting.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md) — fixes for building,
  installing, logging in and test failures.
- [session-operations.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md) — how a session starts and
  ends, where logs go, diagnostics.
- [keymap.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/keymap.md) — every keyboard chord in the session.
- [environment.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md) — every environment variable the code
  reads.
- [walkthrough.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough.md) — every feature as it looks today.
  Generated by `scripts/tuna-walkthrough page` from
  [walkthrough.tsv](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough.tsv) and
  [walkthrough-visual.tsv](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough-visual.tsv); do not edit by hand.
- [legacy-upgrade.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md) — upgrading installations that
  predate the rename, and recovering a blocked settings upgrade.

## Develop and test

- [development.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md) — prerequisites, project structure,
  running the nested compositor, common tasks.
- [testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md) — every CI check run locally: `just` recipes,
  lane selection, nested proofs, the Marlin VM lane, the ledger check,
  stress and fuzzing.
- [test-strategy.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-strategy.md) — verification layers and required
  journeys. Read when deciding how a requirement is proved.
- [requirements.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/requirements.md) — parent requirements R1–R16 used for
  roadmap traceability.
- [api-stability.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/api-stability.md) — crate stability tiers,
  shell-control wire versioning, MSRV and dependency pinning.
- [protocols.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/protocols.md) — Wayland globals compared with Mutter 51;
  changes update `crates/compositor/tests/protocols.rs` too.
- [portal-service-integration.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-integration.md) — adding or
  changing a D-Bus interface or portal backend.
- [extensions.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/extensions.md) — the current Rhai script host and the
  planned extension architecture.
- [ci-runners.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/ci-runners.md) — the self-hosted CI runners and fork
  isolation.
- [ci-fast-iteration.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/ci-fast-iteration.md) — trying guest-side changes
  in one reused karnataka VM (`scripts/tuna-corral-sync`) before you push.
- [reference-repos.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/reference-repos.md) — read-only reference checkouts
  (niri, cosmic-comp, Mutter, GNOME Shell); never copy their source.
- [research/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/research/README.md) — evidence rules for research
  notes and upstream reports.
- [visual-capture-refresh.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/visual-capture-refresh.md) — how README and
  walkthrough media are produced and refreshed.
- [visual-capture-matrix.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/visual-capture-matrix.md) — which frame
  covers each ledger row and walkthrough state
  (`scripts/tuna-visual-capture --check-matrix`).
- [walkthrough-template.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough-template.md) — the template
  `scripts/tuna-capture --render-walkthrough` fills.

## Parity and v1 qualification

- [parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md) — one row per GNOME 51 capability
  with status and the tests that prove it; CI checks it.
- [gnome-parity.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/gnome-parity.md) — pixel measurements against GNOME 51,
  element by element.
- [settings-map.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md) — how GNOME 51 GSettings schemas map
  to Tuna Desktop behaviour.
- [settings-desktop-inventory.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-desktop-inventory.md) — every
  `gsettings-desktop-schemas` 51 key and its status; checked by
  `scripts/tuna-settings-inventory-check`.
- [gnome-settings-audit.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/gnome-settings-audit.md) — GNOME 51 Settings
  and feature gap re-audit against a named main commit.
- [v1-variant-qualification.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1-variant-qualification.md) — which
  TunaOS variants qualify, per image digest.
- [vm-lifecycle.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/vm-lifecycle.md) — the Marlin VM lifecycle proof run by
  the `marlin-vm` CI jobs.
- [corral-journey.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md) — the daily-driver journey on a
  published image in a Corral VM.
- [marlin-tuna-nightly.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin-tuna-nightly.md) — the nightly run
  against the published Marlin Tuna image.
- [upgrade-recovery.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/upgrade-recovery.md) — the upgrade, rollback and
  crash-recovery proof behind the release safety-net gate.
- [soak.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md) — endurance evidence and the bounded nightly soak.
- [datetime-proof.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/datetime-proof.md) — Date & Time qualification gates.
- [niri-parity.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity.md) — scroll mode compared with niri.
- [window-minimize-qualification.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/window-minimize-qualification.md) —
  minimize and restore against GNOME Shell 51.

## Feature notes

How one feature matches GNOME 51 and how it is proved. New notes go in
[`testing/`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing); older ones still sit at the top of `docs/`.

- [accessibility-shell.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/accessibility-shell.md) — GTK accessibility
  preferences and indicator.
- [brightness-contract.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/brightness-contract.md) — the
  `org.gnome.Shell.Brightness` adapter.
- [input-capture.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/input-capture.md) — `org.gnome.Mutter.InputCapture`.
- [modal-dim.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/modal-dim.md) — attached modal parent dimming.
- [network-agent.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/network-agent.md) — the NetworkManager secret agent.
- [portal-screenshot-consent.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-screenshot-consent.md) — Screenshot
  portal consent through the installed backends.
- [portal-service-channel.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/portal-service-channel.md) — the
  `org.gnome.Mutter.ServiceChannel` bootstrap for the portal backend.
- [wellbeing-effect-protocol.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/wellbeing-effect-protocol.md) — GNOME 51
  semantics of the wellbeing grayscale and fade effects.
- [window-lifecycle.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/window-lifecycle.md) — window map and destroy
  effects.
- [xwayland-on-demand.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/xwayland-on-demand.md) — XWayland socket
  activation.
- [testing/cursor-v1-integration.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/cursor-v1-integration.md) —
  cursor qualification.
- [testing/frame-callback-clock.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/frame-callback-clock.md) —
  frame callback timestamps from the presentation clock.
- [testing/ibus-properties.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/ibus-properties.md) — IBus panel
  properties.
- [testing/idle-event-sources.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/idle-event-sources.md) —
  compositor idle wake scheduling.
- [testing/keyboard-input-aids.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/keyboard-input-aids.md) —
  Sticky, Slow, Bounce and Mouse Keys.
- [testing/keyboard-native-parity.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/keyboard-native-parity.md) —
  source audit of keyboard accessibility against Mutter 51.
- [testing/multitasking-preferences.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/multitasking-preferences.md)
  — GNOME multitasking preferences in the live session.
- [testing/native-sound-proof.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/native-sound-proof.md) — media
  keys and output volume.
- [testing/notification-action-lifecycle.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/notification-action-lifecycle.md)
  — notification actions.
- [testing/screenshot-flash.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/screenshot-flash.md) — screenshot
  flash feedback;
  [testing/screenshot-flash-proof.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/screenshot-flash-proof.md)
  runs its proof.
- [testing/screenshot-keyboard.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/screenshot-keyboard.md) —
  keyboard control of the screenshot selection.
- [testing/wellbeing-effects.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/wellbeing-effects.md) — wellbeing
  grayscale and fade rendering.

## Performance

- [performance-profiling.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/performance-profiling.md) — profiling CPU,
  frame cost and memory locally, and what the CI gates measure. Start here.
- [perf/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md) — paired GNOME 51 resource samples, the
  regression gate and how budgets ratchet.
- [perf/budgets.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/budgets.json) — enforced budgets
  ([ADR 0009](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0009-performance-regression-budgets.md)); only ratchet
  tighter.
- [perf/compositor-overview-tracing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/compositor-overview-tracing.md)
  — overview action-to-scanout tracing.
- [perf/gnome-overview-sysprof.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/gnome-overview-sysprof.md) — GNOME
  Shell's own Sysprof scopes in the paired VM.
- [perf/corral-guest-aggregate-cpu.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/corral-guest-aggregate-cpu.md)
  — guest CPU observer for Corral VMs.
- [perf/corral-installed-visual-capture.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/corral-installed-visual-capture.md)
  — visual capture of an installed fixture.
- [perf/corral-benchmark-disk.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/corral-benchmark-disk.md) —
  exporting a paired benchmark disk from the performance workflow.

## Security

- [security-model.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md) — threat model, trust boundaries,
  known limitations and release gates. Start here for any change to lock,
  capture, portals, D-Bus caller checks or extensions.
- [capture-security.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md) — screen capture admission
  and revocation; recorded run manifests in
  [capture-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-evidence.json) and
  [capture-security-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security-evidence.json).
- [remote-desktop.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop.md) — remote desktop consent and
  input; recorded run manifest in
  [remote-desktop-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/remote-desktop-evidence.json).
- [privacy-enforcement.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/privacy-enforcement.md) — camera, microphone
  and sound-output kill switches.
- [security/lock-conversations.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/lock-conversations.md) —
  lock-screen authentication conversations.
- [security/pam-conversation-relay.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/pam-conversation-relay.md),
  [security/private-pam-helper.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/private-pam-helper.md),
  [security/auth-consumer-foundation.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/auth-consumer-foundation.md),
  [security/password-owner-epoch.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/password-owner-epoch.md),
  [security/fingerprint-prompt-guards.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security/fingerprint-prompt-guards.md)
  — the PAM authentication path, piece by piece.
- [../SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md) — reporting a vulnerability.

## Design decisions (ADRs)

[adr/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/README.md) holds the decision register and the ADR
format. Architecture decisions are recorded there, not in other documents.

- [0001](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0001-nested-backend-smithay-pin.md) — nested backend and the
  pinned Smithay revision. Decided.
- [0002](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0002-shell-control-ipc-envelope.md) — shell-control IPC
  envelope and activation tokens. Decided.
- [0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md) — shell supervision
  and recovery. Decided.
- [0004](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0004-no-split-preserve-seams.md) — one repository with
  extraction seams. Decided.
- [0005](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0005-control-socket-peer-authentication.md) — control-socket
  peer authentication. Decided.
- [0006](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0006-gtk4-libadwaita-shell.md) — the shell uses GTK4 and
  libadwaita. Decided.
- [0007](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0007-gnome51-marlin-baseline.md) — GNOME 51 baseline on
  TunaOS Marlin. Decided.
- [0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md) — beta track and v1
  scope across TunaOS variants. Decided.
- [0009](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0009-performance-regression-budgets.md) — GNOME-relative
  performance budgets with a ratchet. Decided.
- [0010](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0010-same-uid-trusted-identity.md) — trusted shell, lock and
  portal identity under one UID. Proposed.
- [0011](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0011-lock-auth-and-capture-grant-lifecycle.md) — lock/auth and
  capture grant lifecycle. Proposed.

## Releases

- [release.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release.md) — the release runbook and notes template.
- [release-rollback.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release-rollback.md) — recovering from a bad
  release.
- [releases/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/releases) — notes for each published prerelease.
- [reviews/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/reviews) — the visual review each release tag requires;
  copy [reviews/TEMPLATE.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/reviews/TEMPLATE.md).

## Reports and evidence (dated, historical)

Snapshots of one run, commit or date. Read them for history and
provenance; take current state from the living documents above.

- [perf/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf) dated reports:
  [CPU investigation](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-08-cpu-investigation.md),
  [overview card workers](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-10-overview-card-workers.md),
  [stock VM acquisition](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-10-stock-vm-acquisition.md),
  [CPU parity attribution](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-15-cpu-parity-attribution.md),
  [preview chrome bounds](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-16-preview-chrome-bounds.md),
  [gate variance](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-29-gate-variance.md), and the paired sample
  bundles in `perf/2026-10-0*/`.
- [soak/2026-10-31-24h/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak/2026-10-31-24h/README.md) — the first 24-hour
  endurance soak.
- [marlin/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin) — dated evidence bundles from Marlin VM runs (journeys,
  settings, privacy, RDP, polkit, published-image diagnosis).
- [variants/2026-10-31/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31) — variant qualification
  matrices and receipts.
- [niri-parity/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity) — paired niri frames behind
  [niri-parity.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/niri-parity.md).
- [testing/frame-callback-clock/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/frame-callback-clock) — the
  baseline behind [testing/frame-callback-clock.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing/frame-callback-clock.md).
- [test-coverage/2026-10-04-initial-baseline.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-coverage/2026-10-04-initial-baseline.md)
  — the first measured coverage baseline.
- [visual-capture-corral-request.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/visual-capture-corral-request.md) — a
  2026-10-29 request for installed-image captures.
- [walkthrough/](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough) — walkthrough and README media;
  `walkthrough/manifest.json` is historical.
