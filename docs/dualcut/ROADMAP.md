---
sidebar_position: 3
title: "Roadmap"
---

Dualcut is a native GNOME video editor built around one JSON project document.
Humans can edit in the GTK interface while scripts and agents use the same
document through TypeScript, HTTP, or direct file edits.

This roadmap tracks product outcomes rather than feature volume. Detailed
capability comparisons live in [PARITY.md](https://github.com/tuna-os/dualcut/blob/main/PARITY.md), architectural decisions
in [docs/adr/](https://github.com/tuna-os/dualcut/blob/main/docs/adr), and implementation work in GitHub issues.

## Current state

The native Rust/GStreamer rewrite is substantially shipped:

- GTK4/libadwaita editor, multi-track timeline, preview, inspector, undo/redo,
  templates, captions, effects, keyframes, and export queue are available.
- The JSON document, schema, headless renderer, local HTTP API, TypeScript
  scripting surface, and bundled agent skill are available.
- MP4/WebM and additional professional export profiles are available.
- x86_64 and aarch64 Flatpaks are built by CI for GitHub Releases and the
  TunaOS Flatpak remote.

`main` contains ongoing runtime, UI, licensing, dependency, documentation, and release-maintenance
changes. Because both advertised installation channels are tag-driven,
release currency is the immediate adoption priority.

## Near term — release currency and Beta gate

Tracking issue: [#108](https://github.com/tuna-os/dualcut/issues/108)

Dualcut is ready to move from rewrite milestones to a verifiable product gate.
The next release candidate should satisfy all of the following:

- [ ] Cut a maintenance release from a green `main`; record the version in
  AppStream metadata and release notes.
- [ ] Verify x86_64 and aarch64 bundles install and launch from GitHub Releases.
- [ ] Verify the same commit is available through the TunaOS Flatpak remote on
  both architectures.
- [ ] Run the documented walkthrough against the release artifacts and publish
  current screenshots.
- [ ] Triage every open user-facing issue into the Beta gate, a later horizon,
  or an explicit deferral.
- [ ] Resolve or explicitly defer the four gaps listed in `PARITY.md`:
  keyframed speed ramps, richer caption-model management, freeform masks, and
  full color grading.
- [ ] Recruit at least five early users outside the core maintainer/agent loop;
  capture install outcome, first export outcome, crash reports, and the three
  most common workflow blockers.
- [ ] Publish a Beta decision note summarizing the evidence above, supported
  architectures, known limitations, and the next review date.

The Beta label should describe evidence, not feature completeness. A release is
Beta-ready when both install paths are current and reproducible, the primary
edit-to-export journey succeeds for the early-user cohort, and known limitations
are visible before installation.

## Mid term — workflow confidence

After the Beta gate, prioritize the workflows that determine repeat use:

1. Make edit, preview, save, reopen, and export reliable across representative
   short-form and multi-track projects.
2. Add regression fixtures for projects created by the GUI, HTTP API, and
   TypeScript surface so every editing surface remains interoperable.
3. Measure preview responsiveness and export success on supported hardware;
   publish minimum/recommended requirements from observed results.
4. Turn early-user feedback into a small, ranked backlog rather than expanding
   the parity matrix by default.
5. Define a predictable release rhythm and a maximum age for fixes on `main`
   that affect installed users.

## Long term — differentiated adoption

Dualcut should compete on its agent-editable project model, not on matching
every mature editor feature-for-feature. Once workflow confidence is established:

- publish end-to-end recipes where an agent drafts an edit and a human refines
  it in the native UI;
- stabilize and version the document/API compatibility contract;
- build a reusable template ecosystem with provenance and compatibility data;
- evaluate broader distribution only after the current Flatpak channels have
  reliable release and feedback loops; and
- revisit deferred parity gaps using observed user demand and technical risk.

## Release and roadmap operating rules

- Git tags, GitHub Releases, AppStream metadata, and the TunaOS Flatpak remote
  must identify the same user-visible version.
- A user-impacting fix is not shipped until both advertised install paths have
  been verified.
- Each roadmap item needs an owner, an issue, an observable outcome, and a
  review date before work starts.
- Review this document at every release and at least monthly while pre-1.0.
- Keep architecture rationale in ADRs and capability detail in `PARITY.md` so
  this document remains a concise statement of priorities and evidence.

## Historical rewrite record

The removed Vite/React prototype is preserved in tag `v0.13.0` and earlier.
The native stack decisions—Rust, GStreamer Editing Services, GTK4/libadwaita,
Vello, and an embedded TypeScript runtime—are recorded in
[docs/adr/](https://github.com/tuna-os/dualcut/blob/main/docs/adr). Those decisions remain current; the completed rewrite
checklist no longer serves as the active product roadmap.
