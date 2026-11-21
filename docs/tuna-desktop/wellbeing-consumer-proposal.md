---
sidebar_position: 64
title: "wellbeing consumer proposal"
---

Follow-up to the w2-354 runtime wiring (`3e9692dd`). Review-verified gaps
between desired-state diagnostics (honest, kept) and working pixels/actions
(required for v1 acceptance). Nothing here edits excluded files; every item
is either implementable in-lane or explicitly handed off.

## 1. GrayscaleChanged pixels — HANDOFF (compositor hook + protocol)

`dispatch_screen_time` sets `EffectState.grayscale` and logs
(`wellbeing.rs:1858`). No compositor desaturate path exists on this branch;
`modal_dim.rs` only dims attached-modal parents. Proposal for root:
extend the #339 nightlight output-transform path (grayscale ≈ full
desaturation) or add a dedicated protocol op. Protocol 0.33/0.34 are
reserved; the lane makes no independent bump. Acceptance: pixel proof that
saturation drops at limit-reached and restores after, plus negative proof
(no change when disabled).

## 2. FadeScreen pixels — HANDOFF (same hook family)

`dispatch_break_ui` sets `EffectState.fade` and logs (`wellbeing.rs:1901`).
Same need as (1): compositor brightness factor. Acceptance: pixel proof of
the break fade in/out plus negative proof.

## 3. DismissNotice — HANDOFF (notification-center API)

`BreakUiEvent::DismissNotice` is an empty arm (`wellbeing.rs:1887`).
`notify.rs` exposes `post` but no dismiss/remove/clear API, and the
notification lane is excluded. Proposal: notification owner adds a
dismiss-by-id (or dismiss-app) API; the lane then adds a `dismiss_notice`
slot to `ShellHooks` and calls it from dispatch (additive, no notify
edits). Acceptance: posted notice visibly dismissed + negative proof
(history preserved per current resident-notice semantics).

## 4. StopCountdown — BEHAVIOR CORRECT, proof gap in-lane

`StopCountdown` clears only the model (`wellbeing.rs:1898`). Verified:
`osd.rs:18,133` hides the OSD 1.5 s after the last show, so no explicit
hide call is needed. Remaining work is a gate observing the OSD hide after
stop (follow-up round, in-lane proof change only).

## 5. Take/Delay/Skip notification actions — HANDOFF (notify actions)

Break `delay`/`skip` model methods exist but are `dead_code`
(`wellbeing.rs:1147,1163`); no notification action invokes them and
`notify.rs` has no action infrastructure. Proposal: notification owner
adds action support; the lane wires Take/Delay/Skip to it. Acceptance:
action proofs driving real model transitions + negative proof (no action
without the notice).

## Inventory

`docs/settings-desktop-inventory.md` fade-screen (×2) and grayscale rows
are corrected to `Honored (partial)` with explicit no-working-pixels
reasons (separate commit); desired-state diagnostics stay in the reasons.
These rows do not count toward acceptance until (1)/(2) land.
