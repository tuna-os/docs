---
sidebar_position: 8
title: "architecture"
---

**Status:** Tier 1 (nested developer preview) is implemented; tier 2 (daily-driver candidate) and release qualification remain open and are tracked in [the roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md). Open decisions and release gates below still apply; sections marked *target* describe design that is not yet shipped.  
**Date:** 27 September 2026  
**Name:** Tuna Desktop (Rust Wayland desktop session), formerly Roost. Crates, binaries, packages and environment variables were renamed in [#536](https://github.com/tuna-os/tuna-desktop/pull/536); [#505](https://github.com/tuna-os/tuna-desktop/issues/505) tracks the subsequent compatibility transition.

## Product decision

Build a new desktop session with a familiar GNOME-inspired overview, panel, quick settings, applications, notifications, workspaces, lock screen, and accessibility behavior. It is an independent desktop, not a drop-in GNOME Shell rewrite. It launches existing GTK/libadwaita applications and does not load existing GNOME Shell extensions, implement private Mutter APIs, or claim GNOME upstream status without agreement.

The parity target is a named, pinned GNOME release and configuration on the same hardware. GNOME-required window behavior remains part of that target; alternative or scrollable tiling modes and third-party extensions are optional capabilities.

## Process and authority boundaries

- **Compositor:** Rust process built with Smithay. Owns seats, outputs, focus, stacking, workspace/window state, input routing, frame scheduling, capture authorization, and privileged protocol exposure. It remains authoritative when the shell is slow or disconnected.
- **Shell host:** one supervised Wayland client initially, containing panel, overview, launcher, and quick settings. It draws its own surfaces and sends intent through a versioned control API. It never owns focus or window policy.
- **Recovery and lock:** minimal recovery affordance is available when the shell is absent. Lock state remains in the compositor; unlock requires a reviewed authentication path. Production credential binding and lock implementation are release-gate decisions.
- **Extensions (target):** separate, untrusted processes behind a capability broker. No privileged compositor Wayland socket, arbitrary native plugin ABI, raw input, clipboard, capture, filesystem, or network access by default. Wasmtime is a later optional worker implementation, not the security boundary by itself. Neither the separate-process isolation nor the capability broker is shipped; both remain release-gated work.
- **Extensions (current):** `crates/shell-host/src/extensions.rs` runs Rhai scripts from the user extension directory *in-process* inside `tuna-shell-host`. The engine replaces the module resolver with a dummy (no `import` from disk), captures `print` as notices, aborts scripts past an operation budget (`MAX_OPS`), and registers only a small hand-built API (`bar_cell`, `dock_badge`, `on_press`, `notice`); errors disable the script. This is containment inside the shell process, not process isolation: a Rhai engine bug or resource exhaustion affects the shell host itself.
- **System integration:** reuse system services and portals where appropriate. The portal backend mediates consent; compositor-enforced grants authorize capture and are revocable.

Use Smithay/calloop's event model initially. Pointer/input/frame paths must not synchronously wait for shell, extensions, search, disk, or network work. The shell toolkit choice is GTK4/libadwaita ([ADR 0006](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0006-gtk4-libadwaita-shell.md)); accessibility and visual parity remain acceptance criteria.

## Delivery tiers

1. **Nested developer preview:** nested compositor, floating windows, focus/workspaces, one shell host, overview trigger/window list, restart and resynchronization, GLES-over-EGL rendering, lock prototype, lifecycle harness. The pinned nested backend has no software-rendering fallback, so this tier requires a working EGL implementation ([ADR 0001](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0001-nested-backend-smithay-pin.md)); Mesa llvmpipe satisfies it in VMs and CI. Not a secure daily-driver session.
2. **Daily-driver candidate:** DRM/KMS via logind/libseat, multi-output/hotplug, XWayland, clipboard/drag-and-drop, IME/accessibility, secure lock/auth, suspend/resume, portals, settings/session integration, support matrix, conformance and fault tests. Ship only after security/usability gates.
3. **Later measured work:** optional tiling variants, public extension distribution and broader physical-device qualification. Required RemoteDesktop, color/HDR and other GNOME capabilities remain in v1; ADR 0008 permits explicitly named emulated-device evidence for its listed hardware-only rows while deferring their physical-device qualification.

## Program speks

The delivery order, dependencies, acceptance-evidence map, decision gates, and research rules are maintained in [the program roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md). The Spektacular registry contains:

0. Program baseline and technical spikes.
1. Nested compositor and shell recovery (first buildable vertical slice).
2. Shell workflow parity.
3. Hardware session and application compatibility.
4. Secure session, accessibility, and system integration.
5. Extension broker and public API (optional post-core capability).
6. Performance, packaging, and release readiness.
7. GNOME 51 animation parity (required capability and performance evidence).

Each spek has its own draft `plan.md`, `context.md`, and `research.md`; plans remain drafts until dependencies and evidence are reviewed. The first spek does not claim full desktop parity.

## Cross-cutting release gates

- Apps remain connected through ordinary shell and extension crashes; compositor crashes are reported as session failures.
- Lock failure never exposes application surfaces or redirects input to them.
- Capture and remote input use portal consent and compositor-validated authorization.
- Keyboard and screen-reader journeys, IME, RTL, large text, reduced motion, and localization are tested end to end.
- Same-hardware GNOME comparison reports startup, idle CPU, whole-session PSS, input latency, frame pacing and soak growth. Targets are based on a pinned baseline and reproducible traces. GPU and total-power comparisons are follow-up work under ADR 0008, not v1 comparison gates.
- Recovery from a failed shell/config/package upgrade reaches a login-capable session without deleting user data.

The [security model](https://github.com/tuna-os/tuna-desktop/blob/main/docs/security-model.md) consolidates the threat model, trust boundaries, current-versus-target state and known limitations behind these gates.

## Decisions still open

The historical baseline decision in [ADR 0007](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0007-gnome51-marlin-baseline.md) selects **GNOME 51 on the Marlin image family** as the parity/performance comparator. [ADR 0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md) broadens the v1 target to **every TunaOS variant**, each qualified from its own image digest or explicitly unsupported with a recorded reason. The published Marlin GNOME image measured on October 4 contained GNOME Shell 50.5; a GNOME 51 comparison must identify its separately upgraded reference payload. See [the current roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) for actual qualification and release limits.

Remaining qualification includes the physical GPU/support matrix beyond the Marlin VM, reviewed same-UID/service authority boundaries, GNOME-required window behavior, the key-specific [settings compatibility map](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md), complete portal/capture grant lifecycles and bootc packaging/rollback. Existing implementation and acceptance are recorded in [the roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) and [parity ledger](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md); these are not all unstarted architecture decisions.

Current backend reality: the compositor runs nested (winit) or as a DRM/KMS hardware session (libseat, udev, GBM/EGL, libinput), chosen automatically by whether a host display exists. The hardware path is exercised on vkms in CI and in actual Marlin VM lifecycle lanes. Real-GPU, final-image and all-variant release qualification remain separate evidence gates tracked on the roadmap board.
