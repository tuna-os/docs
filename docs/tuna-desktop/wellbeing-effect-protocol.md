---
sidebar_position: 64
title: "wellbeing effect protocol"
---

For root: effect semantics corrected to actual GNOME 51 source (an
earlier revision of this proposal invented 3 s restore fades — GNOME
disables immediately on exit; only entry fades). Protocol 0.35 is
reserved for wellbeing pending the single combined schema; this lane
makes no schema edit. Root owns the final color/render consumer.

Primary sources (GNOME/gnome-shell @ 51.0, `js/misc/`):

- `timeLimitsManager.js`: `GRAYSCALE_FADE_TIME_SECONDS = 3` (L46),
  `GRAYSCALE_SATURATION = 1.0` full desaturation (L47).
- `breakManager.js`: `BRIGHTNESS_FADE_TIME_SECONDS = 3` (L44),
  `BRIGHTNESS_FACTOR = 0.6` (L45).

## Actual GNOME 51 semantics (cited)

Grayscale (limit reached):

- `Clutter.DesaturateEffect` named `desaturate`, attached once to
  `Main.layoutManager.uiGroup`
  (`timeLimitsManager.js` L1206-1210).
- Entry (LIMIT_REACHED + grayscale on): set `factor = 0.0`, enable, ease
  `@effects.desaturate.factor` to 1.0 over 3000 ms, `EASE_OUT_QUAD`
  (L1254-1260).
- Exit is IMMEDIATE, no fade: DISABLED removes the effect
  (`_ensureDisabled`, L1215-1221); ACTIVE calls `set_enabled(false)`
  (L1232). There is no restore animation in GNOME 51.

Break fade (break taken):

- `Clutter.BrightnessContrastEffect` named `brightness`, attached once
  to `Main.layoutManager.uiGroup` (`breakManager.js` L749-751).
- Entry (`_brightnessEffectOn`, L879-894): `set_brightness(127)`,
  enable, ease `@effects.brightness.brightness` to
  `Cogl.Color(127*0.6 each)` over 3000 ms, `EASE_OUT_QUAD`. Value range
  is [0,255] with 127 as the no-change midpoint (comment at L878).
- Exit is IMMEDIATE, no fade: DISABLED removes the effect (L757-763);
  ACTIVE and IDLE call `set_enabled(false)` (L801, L835).

Scope: both effects attach to the `uiGroup` actor. For Tuna the
equivalent scene-graph scope applies with the cursor excluded (cursor
exclusion to confirm with the compositor owner). Screenshots capture
through the same frame path, so pixel proofs read the transformed
frame.

Composition with color temperature: temperature applies AFTER the UI
effect in GNOME's output ordering (root-provided; pending
compositor-owner review — this proposal does not assume the reverse).

## Proposed wire shape (0.35)

Recommended: append one struct to the display/color settings push,
following the `SetInputSettings` pattern (sent at start and on every
change; compositor applies live):

```rust
/// Wellbeing output effects (#354). Added in 0.35.
pub struct WellbeingEffects {
    /// Full desaturation while the daily limit is reached.
    pub grayscale: bool,
    /// 0.6 brightness factor while a fading break runs.
    pub fade: bool,
}
```

A single struct keeps grayscale+fade atomic across one settings push.
The compositor implements GNOME's exact timing: 3 s `EASE_OUT_QUAD`
entry from the neutral value, immediate disable on exit. Exact host
struct choice is root's (pending 0.33/0.34 combined schema).

## Acceptance (not from logs)

- Pixel proofs: entry ramps (3 s ease to full desaturation / 0.6
  brightness) and immediate exits, sampled from real frames; negative
  proofs (no change when disabled; no restore fade — exit must read
  neutral at once, matching GNOME).
- Gate split: effect-state diagnostics stay as diagnostics; acceptance
  requires the transformed pixels.
- Inventory rows stay `Honored (partial)` until these proofs pass.
