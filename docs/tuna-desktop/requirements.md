---
sidebar_position: 42
title: "requirements"
---

**Status:** Active. Defines the parent requirements `R1`–`R16` that the
[roadmap's traceability table](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#requirement-traceability) assigns
to speks.
**Source:** each entry restates what [the roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md) and
[the test strategy](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-strategy.md) already say about that requirement. It
adds no new scope. Turning these summaries into fuller normative statements
is a parent requirement change and follows the roadmap's change control.

## Naming rule

Two requirement namespaces exist, and they must never be confused:

- **Parent requirements** are `R1`–`R16`, defined here. In `docs/` a bare
  `R<n>` always means a parent requirement.
- **Spec requirements** are numbered inside each spek (each spec has its own
  `R1`, `R2`, ...). Outside the spec itself, always write them qualified
  with the spek number: `001-R5` is requirement R5 of spec 001, and is not
  parent requirement `R5`. A bare `R<n>` inside a spec document means that
  spec's own requirement.

Test IDs follow the same rule. In `Tuna-<spek>-<requirement>-<case>`
([test strategy §4](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-strategy.md#4-test-design-and-traceability)), the
`<requirement>` field is the spec requirement of the named spek:
`Tuna-001-R5-01` is case 01 of `001-R5`. The link from a spec requirement
up to a parent requirement is recorded in the spec and in this register,
not in the test ID.

## Register

| ID | Requirement | Owning spek(s) | Covers | Test strategy coverage |
|---|---|---|---|---|
| R1 | Activities/overview | 002; 004 for service backend | GNOME-like overview workflow, proven by baseline journeys, recordings, and responsiveness and failure cases | §3a parity evidence (overview reference journey) |
| R2 | Launch/search | 002; 004 for service backend | App launch and search, with the same evidence as R1 | §3a (search and launch journey); §3 slow-search injection |
| R3 | Panel/system controls | 002; 004 for service backend | Top panel and system controls such as quick settings, with the same evidence as R1 | §3a (quick settings, calendar journeys) |
| R4 | Windows/workspaces/input gestures | 001 foundation; 002 parity; 003 output/input compatibility | Window lifecycle and focus, workspaces, input gestures; proven by lifecycle and focus tests and hotplug and gesture journeys | §3 window, input, and output journeys |
| R5 | Notifications | 002 UI/behavior; 004 service and locked privacy | freedesktop notifications: history, actions, Do Not Disturb, and behavior while locked | §3 locked-session notification redaction; §3a (notifications journey) |
| R6 | Session/lock | 004 | Session lock that fails closed, PAM handoff, and lock behavior across VT switch, resume and hotplug faults | §3 security and privacy (while locked) |
| R7 | Applications/peripherals | 003; 004 for portal capture | GTK, Qt and XWayland apps; clipboard, drag and drop, IME; screen-share consent and revoke | §2 matrix (clients, input paths); §3 window and output journeys |
| R8 | Accessibility/language | 000 toolkit spike; 002/004 implementation | Keyboard and AT-SPI access, large text, high contrast, reduced motion, touch, RTL | §3 accessibility and localization |
| R9 | Settings interoperability | 004 | A published settings compatibility map and a migration journey ([settings map](https://github.com/tuna-os/tuna-desktop/blob/main/docs/settings-map.md)) | — |
| R10 | Shell failure isolation | 001 | Killing and restarting the shell leaves app surfaces alive and resyncs state | §3 session and recovery (100-run shell kill) |
| R11 | Extension boundary | 005 | Extension quotas, revocation, and crash and resource containment, with security cases | §3 security and privacy (extension messages) |
| R12 | Bounded critical path | 001, 002, 005, 006 | Tracing and fault tests show the compositor never blocks on the shell, extensions, search or I/O | §3 injected slow search, blocked calls, stalled extension, large IPC |
| R13 | Display correctness | 003, 006 | Scale, hotplug and mixed-refresh matrix with measured behavior and fallbacks | §2 matrix (outputs, scales); §3 window, input, and output journeys |
| R14 | Capture/privileged surfaces | 000 threat model; 003 integration; 004 enforcement; 005 extension denials | Spoofing, capture consent and revoke, and unauthorized layer or capture attempts | §3 security and privacy |
| R15 | Recoverable configuration/upgrade | 006 | Recovery from a broken package or configuration without user-data loss | §3 packaging and recovery |
| R16 | Comparable performance | 000 baseline; 006 release comparison | Raw comparable traces, variance and soak results against the GNOME baseline | §5 performance and reliability gates |

Owning speks and evidence are maintained in the
[roadmap's traceability table](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#requirement-traceability); change
both together.
