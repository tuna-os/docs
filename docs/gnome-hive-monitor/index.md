---
sidebar_position: 1
sidebar_label: "gnome-hive-monitor"

status: unknown
---

Watch a [kubestellar/hive](https://github.com/kubestellar/hive) instance from
the GNOME top bar, and file an idea into it without a browser.

You can configure the extension for any hive. Point it at a self-hosted spoke, the
hosted hub, or someone else's instance.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## What it shows

The panel reads the hive's own `GET /api/widget`:

| Field | Shown as |
|---|---|
| `mode` | Governor mode — `SURGE` / `BUSY` / `QUIET` / `IDLE` |
| `issues`, `prs` | Queue depth, `issues/prs`, optional |
| `running`, `paused` | Agent counts, in the menu |
| `last_eval` | How long since the governor last evaluated |

**A paused agent flips the icon to a warning.** The widget helps you detect paused lanes.
A hive can appear healthy from the outside while some lanes do no work.
The governor still computes those agents as due and then silently skips them.

The menu also shows a capacity state. Current Hive servers do not supply it,
so it is **unknown**; unknown is not the same as idle or unreachable. A
confirmed queue limitation uses the warning icon. The menu shows when data
is stale. Authentication errors remain separate from network errors.

### Proposed capacity contract

This is a client-side proposal, not yet a Hive protocol guarantee. The monitor
accepts an optional `capacity_state` field on `/api/widget`, using only these
fixed values:

| Value | Meaning |
|---|---|
| `queue_limited` | Queued work cannot be dispatched because of a confirmed capacity limit. |
| `available` | A fresh evaluation found no capacity limit blocking queued work; it does not imply an empty queue. |
| `stale` | The capacity evaluation is no longer fresh. |
| `unknown` | The capacity state cannot be determined. |

A missing, invalid, or unrecognized value is unknown. The monitor does not
infer a limit from queue depth. It does not display text from the server.
Hive must opt in to supply this aggregate and set a freshness limit. Hive must
return stale or unknown for a failed or old probe, not a limit.

The aggregate itself can reveal fleet activity. Hive must not expose it by
default without an explicit decision from its maintainers. It must never
contain provider names, account identifiers, subscription figures, or
credentials. The monitor does not call the owner-only provider-headroom
endpoint. Existing servers show unknown until Hive adopts this contract.

## Filing an idea

*New Idea…* opens a small dialog and creates a **GitHub issue** on a repository
you configure, labelled `ai-fix-requested` by default.

Ideas go to GitHub because GitHub issues form the hive's work queue.
The governor polls these issues. Queue depth controls its SURGE/BUSY/QUIET modes.

Each agent uses beads for its internal state. Inception creates whole new
projects. Neither accepts ideas for an existing project.
Point it at one of the hive's **managed repositories** or the governor will never see the issue.

## Install

```bash
git clone https://github.com/tuna-os/gnome-hive-monitor.git \
  ~/.local/share/gnome-shell/extensions/hive-monitor@tunaos.org
cd ~/.local/share/gnome-shell/extensions/hive-monitor@tunaos.org
glib-compile-schemas schemas/
```

Then log out and back in. GNOME Shell only scans for *new* extension
directories at session start. On Wayland, you cannot restart the shell in place.
After that:

```bash
gnome-extensions enable hive-monitor@tunaos.org
gnome-extensions prefs  hive-monitor@tunaos.org
```

## Configuration

| Setting | Notes |
|---|---|
| **Hive URL** | e.g. `https://hive.example.org`, no trailing slash |
| **Hive token** | The hive's `HIVE_DASHBOARD_TOKEN` |
| **Refresh interval** | 15–3600s, default 60 |
| **Repository** | `owner/name` an idea becomes an issue in |
| **GitHub token** | Needs only `issues:write` on that repository |
| **Labels** | Comma-separated, default `ai-fix-requested` |

### About the hive token

It is sent as the `X-Hive-Internal` header, which is the only credential a hive
accepts for server-to-server reads:

- `Authorization: Bearer` is **disabled** on a direct-route spoke (one with
  `dashboard.authorized_users` set) — it returns 401.
- A browser session cookie works, but an extension has no way to complete a
  GitHub device-flow login to get one.

`X-Hive-Internal` is **read-only**. The hive rejects mutations made with it
(`owner access required`), so this extension can never change your fleet's
configuration — by design. It reads status; the only thing it writes is a
GitHub issue, with your GitHub token.

Treat the hive token as a secret: it grants read access to your fleet's status.

## Requirements

GNOME Shell 45–50 (ESM extensions). Uses only `gi://` modules that ship with
the shell — no external dependencies.

## License

Apache-2.0, matching upstream hive.

## Contributing

See the [contribution guide](https://github.com/tuna-os/gnome-hive-monitor/blob/main/CONTRIBUTING.md) to develop locally, check the schema, pack the extension, and send pull requests.
