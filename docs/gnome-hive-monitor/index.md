---
sidebar_position: 1
sidebar_label: "gnome-hive-monitor"

status: unknown
---

Watch a [kubestellar/hive](https://github.com/kubestellar/hive) instance from
the GNOME top bar, and file an idea into it without opening a browser.

Nothing is hardcoded to a particular hive. Point it at a self-hosted spoke, the
hosted hub, or someone else's instance — it is all configuration.


## What it shows

The panel reads the hive's own `GET /api/widget`:

| Field | Shown as |
|---|---|
| `mode` | Governor mode — `SURGE` / `BUSY` / `QUIET` / `IDLE` |
| `issues`, `prs` | Queue depth, `issues/prs`, optional |
| `running`, `paused` | Agent counts, in the menu |
| `last_eval` | How long since the governor last evaluated |

**A paused agent flips the icon to a warning.** That is the failure this widget
exists to catch: a hive with paused lanes looks completely healthy from the
outside while part of it does nothing. The governor still computes those agents
as due and then silently skips them.

## Filing an idea

*New Idea…* opens a small dialog and creates a **GitHub issue** on a repository
you configure, labelled `ai-fix-requested` by default.

Ideas go to GitHub rather than to a hive bead on purpose — GitHub issues *are*
the hive's work queue. The governor polls them, and its SURGE/BUSY/QUIET modes
are driven by their depth. Beads are per-agent internal state, and Inception is
for scaffolding whole new projects; neither is an intake channel for "I had an
idea". Point it at one of the hive's **managed repositories** or the governor
will never see the issue.

## Install

```bash
git clone https://github.com/tuna-os/gnome-hive-monitor.git \
  ~/.local/share/gnome-shell/extensions/hive-monitor@tunaos.org
cd ~/.local/share/gnome-shell/extensions/hive-monitor@tunaos.org
glib-compile-schemas schemas/
```

Then log out and back in — GNOME Shell only scans for *new* extension
directories at session start, and on Wayland there is no way to restart the
shell in place. After that:

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
  GitHub device-flow login to obtain one.

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
