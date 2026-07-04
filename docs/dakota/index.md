---
sidebar_position: 1
sidebar_label: "Dakota (Bluefin)"
---

:::tip[Visual overview]
Prefer a visual tour? See the **[Dakota overview →](/dakota)** landing page.
:::

> 🦖 **External project** — maintained by [Project Bluefin](https://projectbluefin.io). See [projectbluefin/dakota](https://github.com/projectbluefin/dakota).

Dakota is a freedesktop.org and GNOME OS image, designed from the ground up by Project Bluefin. It is **the reference BuildStream desktop** — the model that Tromsø, XFCE Linux, and Zirconium Hawaii all follow.

## Built-in feedback loop

Dakota ships with a structured hardware diagnostic loop:

| Command | What it does |
|---|---|
| `ujust report` | Captures system state, opens a pre-filled issue |
| `ujust confirm <issue>` | Adds your hardware fingerprint to an existing issue |
| `ujust verify <issue>` | Confirms a fix works on your machine |

No telemetry. No phone-home. Every report is reviewed before it leaves your machine.

## Already running Bluefin?

You don't need to reinstall to get Dakota's ComposeFS backend — see
[Migrating from Bluefin](/docs/dakota/migration) for the in-place migration
tool and its interactive wizard.

## See also

- [Tromsø](/tromso) — KDE Plasma on the same freedesktop-sdk base
- [XFCE Linux](/xfce-linux) — XFCE on the same freedesktop-sdk base
- [Zirconium Hawaii](/hawaii) — Niri on the same freedesktop-sdk base
