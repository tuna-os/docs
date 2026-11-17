---
sidebar_position: 23
title: "keyboard native parity"
---

This bounded source audit covers the two inactivity-timeout settings and selected keyboard aid semantics on completion source `f14e8cf6a28a7bca657d26fd03cc478c8345d88c`. It does not qualify every keyboard capability or installed image. Runtime keyboard and audible-output acceptance remain separate.

## Primary reference

The reference is the official [Mutter51.0 source archive](https://gitlab.gnome.org/api/v4/projects/GNOME%2Fmutter/repository/archive.tar.gz?sha=51.0), root `mutter-51.0/`, SHA256 `243f76255b7cd9a9ce56ac1d2e0fb01806d2814355a988477ebafd1a1bc2e7fc`. Paths and line numbers below refer to that archive, not legacy X11 implementations or an unpinned upstream branch.

## Timeout settings stay Ignored

`src/backends/meta-input-settings.c:1418` maps `timeout-enable` to `META_A11Y_TIMEOUT_ENABLED`; line1447 reads `disable-timeout` into `MetaKbdA11ySettings.timeout_delay`. Loading a setting does not establish native enforcement.

A search of every C/header file in this pinned archive finds `timeout_delay` only in that loader and `src/backends/meta-input-settings-private.h:50`. `META_A11Y_TIMEOUT_ENABLED` occurs only in the loader and the enum documentation/definition in `src/meta/meta-enums.h`. The native aid engine has no consumer of either value: `src/backends/native/meta-keyboard-a11y.c:1131` applies the active aid settings, and line1180 processes key events, without an inactivity timer or a timeout disable action.

Tuna's `crates/shell-gtk/src/kbd_a11y.rs::read` does not transport these keys, and `crates/compositor/src/input_aids.rs` has no inactivity-timeout action. Both inventory rows therefore remain **Ignored**, as compatibility limitations pending the enforcing-owner disposition in [#365](https://github.com/tuna-os/tuna-desktop/issues/365). Native GNOME51 does not supply a timeout behavior to copy. This audit adds no no-op protocol fields and does not claim the keys are Honored. An actual inactivity feature would need an explicit behavior decision about affected aids, restored holds and persisted choices.

The absence check is reproducible from the pinned archive without relying on names alone:

```python
import tarfile
with tarfile.open('mutter-51.0.tar.gz') as archive:
    for member in archive.getmembers():
        if member.isfile() and member.name.endswith(('.c', '.h')):
            body = archive.extractfile(member).read().decode()
            for number, line in enumerate(body.splitlines(), 1):
                if 'timeout_delay' in line or 'META_A11Y_TIMEOUT_ENABLED' in line:
                    print(member.name, number, line)
```

## Further source checks

- `enable` is the native keyboard shortcut switch, not a global gate on every aid. Mutter's `meta-keyboard-a11y.c:1187` gates the five-Shift/eight-second-Shift shortcut handler with `META_A11Y_KEYBOARD_ENABLED`; Mouse, Bounce, Slow and Sticky Keys each use their own feature flags afterward. Tuna's `KeyboardAids.shortcuts` and independent feature checks follow that separation. A negative control must exercise an aid enabled while shortcuts are off.
- **Toggle Keys has a concrete parity gap.** Mutter's `src/backends/native/meta-seat-impl.c:664` calls its Toggle Keys notification only when `xkb_state_update_key` changes `XKB_STATE_LEDS`; the aid flag gates the bell at `meta-keyboard-a11y.c:1172`. Tuna's `InputAids::deliver` instead rings on a delivered Caps Lock or Num Lock press selected by base keysym. This does not prove an actual LED-state change and omits other LED-changing mappings, such as Scroll Lock. LED transitions, repeated/nonchanging presses and remapped keys need bounded runtime qualification before declaring beep parity.
- **Sticky Keys has a modifier-coverage gap.** Mutter51 uses the actual XKB depressed modifier mask and modifier-event classification (`meta-keyboard-a11y.c:468-540`), excluding the lock mask. Tuna supports a `Level3` modifier internally, but production `runtime/aids.rs::canonical_role` maps `ISO_Level3_Shift` to no aid role (its unit test explicitly pins this), and maps `Alt_R` to Alt rather than Level3. A configured AltGr/Level3 selector therefore lacks that production Sticky Keys role. Actual non-US keymap and latched-modifier probes are needed before claiming full modifier parity.
- Slow, Bounce, Sticky and shortcut beep preferences reach `AidEffect::Bell`, which `runtime/aids.rs` sends to the shared bell policy. That identifies a consumer; source comparison alone does not establish audible output, visual-only policy behavior, or hardware volume/mute acceptance.

These findings leave keyboard capability completion and owner disposition open; timeout compatibility and actual LED-change bell behavior must not be hidden by a broad keyboard settings claim.

## Bounded followup implementation

The followup compares Smithay's actual `keyboard.led_state()` immediately before and after each key delivered through the aid pipeline. `InputAids::led_changed` rings only for an observed change while Toggle Keys is enabled; a Caps/Num keysym alone no longer rings. Keymap configuration does not use that delivered-input path. `ISO_Level3_Shift` now maps to the existing Level3 role, preserving physical key identity through synthetic release and the existing lock/keymap ownership reset.

The existing CI GTK proof adds actual German AltGr tap→`@` once→plain `q`, aid-off negative control, shortcuts-off independence, keymap restoration with a pending Level3 latch, Caps/Num LED transition counts, remapped Caps-to-Control no-LED negative control, and preference-off negative control. Rust regressions cover LED-change/preference gates and Level3 release on ownership reset. These are committed acceptance probes, not completed runtime qualification until exact-head CI executes them. No inactivity timer or protocol fields were added.
