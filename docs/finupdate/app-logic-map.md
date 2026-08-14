---
sidebar_position: 7
title: "app logic map"
---

> **Status note (2026-07-26).** This document had drifted from the code. Known
> corrections, now applied below:
>
> * §6.2 described Developer Mode and the three simulator scenarios as
>   hamburger-menu items. They are **CLI-only** (`--dev-mode`, `--no-dev-mode`,
>   `--sim=<scenario>`) — see `preferences.rs` and `main.rs`. The menu now holds
>   only Keyboard Shortcuts / About / Quit.
> * Whole features were missing: **Powerwash**, **Factory Reset**, **Restart
>   Tonight**, **unpin-to-stream**, and **rollback**. All live in
>   `src/ui/status_view.rs` and are listed in §4 below.
> * The GUI test rows referenced `tests/smoke/` (dogtail/behave). That suite
>   cannot run on a build host. The primary suite is now
>   `tests/gui/test_features.py` (Broadway + screenshots + action journal);
>   see `docs/GUI_TESTING.md`.
> * Every privileged command now routes through `src/privileged.rs` and is
>   recorded to a JSONL action journal (`src/action_journal.rs`), so the
>   "Touches" column in §4 is machine-checkable rather than aspirational.

A complete inventory of states, messages, user actions, backend touch-points,
and side effects in finupdate. The purpose of this document is to drive test
coverage — every row should be traceable to one or more tests (unit or
dogtail).

This document is **load-bearing** for the test suite. When you add a new state
or message, update the table here and the matching test entry. When a test
fails, find the row it covers and use the "Touches" column to narrow down
which code paths to inspect.

---

## 1. Top-level state machine (`AppState` in `src/app.rs:63`)

```
                       ┌───────────────────────────────────────────┐
                       │                                           │
              ┌────────▼────────┐  StartUpdate       ┌────────────┐│
              │      Idle       │ ──────────────────►│  Updating  ││
              │ (default)       │                    └─────┬──────┘│
              └────────┬────────┘                          │       │
                       ▲                       UpdateComplete      │
            CloseRequest               ┌──────────────────┼────┐   │
            (when active)              │                  │    │   │
                       │       ┌───────▼──────┐  ┌────────▼─┐  │   │
                       │       │   Complete   │  │   Error  │  │   │
                       │       └───────┬──────┘  └────────┬─┘  │   │
                       │               │ Dismiss/Retry    │    │   │
                       └───────────────┼──────────────────┘    │   │
                                       │                       │   │
                                       │ UpdateUpToDate        │   │
                                       │                ┌──────▼─┐ │
                                       └───────────────►│UpToDate│◄┘
                                                        └────────┘
```

| From state | Event (`AppMsg`)        | To state    | Side effects                                |
|------------|-------------------------|-------------|---------------------------------------------|
| Idle       | `StartUpdate`           | Updating    | spawn orchestrator / simulator; start timer |
| Updating   | `UpdateComplete`        | Complete    | stop timer; emit "Updates complete" toast; D-Bus state=Complete |
| Updating   | `UpdateUpToDate`        | UpToDate    | stop timer; no reboot prompt                |
| Updating   | `UpdateFailed(msg)`     | Error(msg)  | stop timer; emit error toast; D-Bus state=Failed |
| Updating   | `CancelUpdate`          | Idle        | send SIGKILL via `cancel_tx`; log line     |
| Complete   | (user dismisses banner) | Idle        | reset to idle state page                    |
| Error      | (user retries)          | Idle        | reset; "Check for Updates" becomes active   |
| Any        | `CloseRequest`          | (no change) | if Updating: refuses close + toast warning  |

Tests covering this:
- Unit: `src/update_worker.rs::tests::success_scenario_emits_all_four_modules_then_complete`
- Unit: `src/update_worker.rs::tests::already_up_to_date_short_circuits_after_system`
- Unit: `src/update_worker.rs::tests::failure_scenario_emits_error_after_system`
- Unit: `src/update_worker.rs::tests::cancellation_emits_error_and_stops`
- GUI: `tests/smoke/features/finupdate.feature` scenarios tagged `@simulator`

---

## 2. Pre-flight (`PreflightStatus` in `src/app.rs:78`)

Runs on launch in a background tokio runtime. Calls `bootc upgrade --check`
(exit 0 = available, 77 = up to date, other = unknown).

| Status            | When                                | UI effect                          |
|-------------------|-------------------------------------|------------------------------------|
| `Checking`        | initial state on launch             | hero shows spinner + "Checking…"   |
| `UpdateAvailable` | bootc returned 0                    | "Update ready" pill + suggested action |
| `UpToDate`        | bootc returned 77                   | "Up to date" pill                  |
| `Unknown`         | bootc errored, missing, or cancelled| neutral hero, manual check button only |

Touches: `src/app.rs` (preflight closure starting ~L377) → `bootc upgrade --check`.

Tests:
- Unit: none yet (pure shell call) — **gap**: extract the exit-code → status mapping into a pure function and test it.
- GUI: `tests/smoke/features/finupdate.feature` `@launch` — verifies hero appears.

---

## 3. Message flow (`AppMsg` in `src/app.rs:115`)

Every variant must be exercised at least once. Grouped by intent:

### 3.1 Update lifecycle
| Msg                          | Source                          | Handler outcome             | Test |
|------------------------------|---------------------------------|-----------------------------|------|
| `StartUpdate{skip_metered}`  | "Update" / install banner click | → Updating, spawn worker    | GUI @simulator |
| `OpenCheckDialog`            | "Check for Updates" click       | shows update_check_dialog   | GUI @launch + dialog scenario (**add**) |
| `CheckComplete(CheckResult)` | check dialog closes             | updates hero + banner state | **gap** |
| `InstallFromCheck`           | check dialog "Install all"      | → StartUpdate(true)         | **gap** |
| `OutputLine(line)`           | orchestrator stdout             | appends to log_lines + log_view | unit (simulate_update) |
| `ModuleStarted(m)`           | orchestrator/sim                | segmented progress + DBus   | unit (simulate_update) |
| `ModuleFinished(m, status)`  | orchestrator/sim                | mark segment complete/failed | unit (simulate_update) |
| `UpdateComplete`             | orchestrator exit 0             | → Complete; toast            | unit + GUI @simulator |
| `UpdateUpToDate`             | orchestrator exit 77            | → UpToDate                  | unit + GUI @simulator |
| `UpdateFailed(msg)`          | orchestrator non-zero / cancel  | → Error                     | unit + GUI @simulator |
| `CancelUpdate`               | "Cancel" button while running   | fires cancel_tx; → Idle     | unit (cancellation) + GUI (**add**) |

### 3.2 Reboot
| Msg              | Source                  | Handler outcome                              | Test |
|------------------|-------------------------|----------------------------------------------|------|
| `RequestReboot`  | "Reboot now" click      | shows confirm dialog                         | GUI (**add**) |
| `ConfirmReboot`  | confirm dialog yes      | `pkexec systemctl reboot` (skipped in dev)  | manual only |

### 3.3 Dialogs
| Msg                       | Source            | Outcome                            | Test |
|---------------------------|-------------------|------------------------------------|------|
| `ShowRebaseDialog`        | menu              | opens rebase_dialog                | GUI (**add**) |
| `ShowAbout`               | menu              | opens AdwAboutDialog                | GUI (**add**) |
| `ShowPreferences`         | menu              | opens AdwPreferencesDialog          | GUI @preferences |
| `SettingsChanged(s)`      | preferences close | persists; refreshes hero text       | unit (settings round-trip) + GUI (**add**) |

### 3.4 Dev mode
| Msg                        | Source                  | Outcome                              | Test |
|----------------------------|-------------------------|--------------------------------------|------|
| `ToggleDevMode(bool)`      | menu                    | persists; reveals banner             | GUI (**add**) |
| `SetSimScenario(s)`        | menu (3 items)          | changes which scenario fires next    | GUI @simulator (writes settings.json instead) |
| `PreflightResult(s)`       | bg thread               | updates hero/pill                    | unit (**gap**) |

### 3.5 Navigation / window
| Msg                  | Source             | Outcome                              | Test |
|----------------------|--------------------|--------------------------------------|------|
| `PageChanged(name)`  | StatusView output  | header back button visibility        | GUI (**add**) |
| `GoBack`             | back button click  | navigates stack                      | GUI (**add**) |
| `Quit`               | menu / Ctrl+Q      | window close                         | GUI @close |
| `CloseRequest`       | window close       | block if Updating, else allow        | GUI (**add** — requires forcing the active state) |

---

## 4. Backend touch-points (the "actually fires on the host" boundary)

These are the only places finupdate reaches outside the sandbox. If a test
*doesn't* exercise dev mode, it will hit one of these. Each row is a polkit
prompt OR a public-network round-trip.

| Touch                                              | When                            | Caller                              | Cost      | Test seam |
|----------------------------------------------------|---------------------------------|-------------------------------------|-----------|-----------|
| `bootc upgrade --check`                            | on launch (preflight)           | `src/app.rs` preflight closure      | direct (no pkexec) | (would need fake binary on PATH) |
| `bootc status --json`                              | rebase dialog open + registry detect | `src/registry_client.rs`        | **root**  | castrojo/finupdate#9 |
| `flatpak-spawn --host pkexec /app/bin/finupdate-runner` | StartUpdate (non-dev)      | `src/orchestrator.rs::run`          | pkexec    | mock runner in tests (**add**) |
| `pkexec systemctl reboot`                          | ConfirmReboot (non-dev)         | `src/app.rs` reboot handler         | pkexec    | journal action `reboot` |
| `pkexec shutdown -r 02:00`                         | "Restart Tonight" on the hero row | `status_view.rs::schedule_reboot_tonight` | pkexec | journal action `schedule_reboot` |
| `pkexec bootc switch <ref>`                        | Rebase dialog "Switch"/"Pin"    | `rebase_dialog.rs::run_bootc_switch` | pkexec   | journal action `switch_image`, args.target |
| `pkexec bootc switch <stream-ref>`                 | "Unpin to :stream"              | `status_view.rs::run_unpin_to_stream` | pkexec  | journal action `unpin` |
| `pkexec bootc install reset --experimental --apply`| Factory Reset (confirmed)       | `status_view.rs::run_bootc_install_reset` | pkexec | journal action `factory_reset` |
| `flatpak uninstall --user --all -y` + `distrobox rm -f -a` | Powerwash (confirmed)   | `status_view.rs::run_powerwash`     | host (no root) | journal actions per step |
| `pkexec systemctl enable --now uupd.timer`         | Preferences toggle (uupd present) | `src/uupd_compat.rs::set_uupd_timer` | pkexec | manual |
| `pkexec install … /etc/uupd/config.json`           | uupd subpage "Apply"            | `src/uupd_compat.rs::write_config`  | pkexec    | manual |
| `flatpak-spawn --host cat /etc/uupd/config.json`   | uupd subpage open               | `src/uupd_compat.rs::read_config`   | none      | unit (parser tests) |
| GHCR `/v2/<repo>/tags/list` + manifest HEAD        | rebase dialog populate          | `src/registry_client.rs::fetch_versions` | net  | **gap** (unit test with wiremock) |
| GHCR `/v2/<repo>/referrers/<digest>` + blob pull   | changelog SBOM diff             | `src/sbom_diff.rs::fetch_and_diff_sboms` | net  | unit (parse_spdx, diff_packages) + **gap** (integration) |
| GitHub `/repos/<o>/<r>/commits`                    | changelog "what's new" tab      | `src/ui/status_view.rs` ~L2660      | net (anon, rate-limited) | **gap** |
| D-Bus session bus publish (state, progress, message) | every state change            | `src/dbus_progress.rs`              | none      | **gap** (introspect with `gdbus`) |

---

## 5. Persistent state surfaces

| Surface                                                                | Owned by             | What writes it                          | What reads it                            | Test |
|------------------------------------------------------------------------|----------------------|-----------------------------------------|------------------------------------------|------|
| `$XDG_CONFIG_HOME/finupdate/settings.json`                             | `Settings`           | Preferences dialog, menu toggles        | `Settings::load` at startup              | unit round-trip |
| `$XDG_CACHE_HOME/finupdate/sbom-cache/<digest>`                        | `sbom_diff`          | `pull_sbom` after successful fetch      | `load_cache` on next call                | unit (cache_path) |
| `/etc/uupd/config.json` (read+write via pkexec)                        | host                 | `uupd_compat::write_config`             | `uupd_compat::read_config` + uupd itself | unit (schema) |
| `/etc/systemd/system/uupd.timer` enabled state                         | host (systemctl)     | `uupd_compat::set_uupd_timer`           | `uupd_compat::is_uupd_timer_active`      | unit (parser) |
| D-Bus name `org.tunaos.finupdate` (session bus)                | `ProgressDBus`       | every state transition                  | GNOME Shell extension                    | **gap** |

---

## 6. UI surfaces and their accessible names (for dogtail selectors)

Verified via `Dump AT-SPI tree of "finupdate" to artifact` step (run once
against a fresh build). Update when widget names change.

### 6.1 Main window
| Widget                       | Role         | Name / aria-label              | Selector |
|------------------------------|--------------|--------------------------------|----------|
| Application window           | frame        | "Finupdate"                    | `app.child("Finupdate", roleName="frame")` |
| Header bar menu button       | toggle button| "Main Menu"                    | `app.child("Main Menu", roleName="toggle button")` |
| Header bar back button       | push button  | (icon only — uses tooltip)     | `app.child(roleName="push button", description="Back")` |
| Dev-mode banner              | banner       | "Developer Mode — updates are simulated" | by name |

### 6.2 Hamburger menu items
| Item                        | Role        | Triggers           |
|-----------------------------|-------------|--------------------|
| "Preferences"               | menu item   | `ShowPreferences`  |
| "Developer Mode"            | menu item (check) | `ToggleDevMode(bool)` |
| "Simulate Success"          | menu item   | `SetSimScenario(Success)` |
| "Simulate Failure"          | menu item   | `SetSimScenario(Failure)` |
| "Simulate Already Up To Date" | menu item | `SetSimScenario(AlreadyUpToDate)` |
| "Rebase to Previous Version…" | menu item | `ShowRebaseDialog` |
| "About Finupdate"           | menu item   | `ShowAbout`        |
| "Keyboard Shortcuts"        | menu item   | (opens shortcuts window) |
| "Quit"                      | menu item   | `Quit`             |

### 6.3 Idle page (the "main" stack page)
| Widget                       | Role         | Name |
|------------------------------|--------------|------|
| Hero row                     | list item    | (image ref) |
| Status pill                  | label        | "Up to date" / "Update ready" / "Checking…" |
| "Check for Updates" button   | push button  | "Check for Updates" |
| Banner install button        | push button  | "Install Updates" |

### 6.4 Preferences dialog (`src/ui/preferences.rs`)
| Widget                                  | Role         | Notes |
|-----------------------------------------|--------------|-------|
| Dialog                                  | dialog       | "Preferences" |
| "Automatic Background Updates" row      | switch       | conditional on `is_uupd_installed()` |
| "Configure Automatic Updates" row       | (activatable) | pushes uupd subpage |
| "Check Interval" combo                  | combo box    | options: Hourly / Daily / Weekly / Custom |
| "Custom Interval" spin                  | spin button  | revealed only when Custom |
| "Pause on Metered Connections" row      | switch       | |
| "Developer Mode" row                    | switch       | always visible |

### 6.5 uupd config subpage
| Widget                                  | Role        | Notes |
|-----------------------------------------|-------------|-------|
| Page                                    | page tab    | "Automatic Updates" |
| "Enable Hardware Checks" row            | switch      | gates the four spin rows |
| "Minimum Battery" row + spin            | spin button | 0–100, suffix "%" |
| "Maximum CPU Load" row + spin           | spin button | 0–100 |
| "Maximum Memory Use" row + spin         | spin button | 0–100 |
| "Maximum Network Activity" row + spin   | spin button | 0–100_000_000 B/s |
| "System" / "Flatpak" / "Brew" / "Distrobox" rows | switch | enabled=on means `disable: false` in JSON |
| "Apply Changes" button                  | push button | triggers pkexec install |

### 6.6 Updating page
| Widget                | Role          | Name |
|-----------------------|---------------|------|
| Segmented progress bar| (custom draw) | drives off `ModuleStarted/ModuleFinished` events |
| Elapsed time label    | label         | "0:42" format |
| Log view (scroll)     | scroll pane   | line-by-line stdout/stderr |
| Cancel button         | push button   | "Cancel" |
| Copy log button       | push button   | "Copy" |

### 6.7 Complete / Error / UpToDate pages
| Page      | Status page title     | Buttons             |
|-----------|-----------------------|---------------------|
| Complete  | "Updates complete"    | "Reboot Now", "Later" |
| Error     | "Update failed" + msg | "Retry", "Dismiss" |
| UpToDate  | "Already up to date"  | (none — auto-dismiss) |

---

## 7. Test coverage matrix (current → goal)

Legend: ✅ covered, ⚠️ partial, ❌ missing.

| Area                                    | Unit | GUI | Notes |
|-----------------------------------------|------|-----|-------|
| Settings round-trip                     | ✅   | ❌  | add: write via Preferences dialog, verify file |
| UpdateInterval enum                     | ✅   | ❌  | add: combo change → file write |
| UupdConfig schema (incl. unknown fields)| ✅   | —   | |
| uupd timer state parsing                | ✅   | —   | |
| Orchestrator marker parser              | ✅   | —   | |
| Simulate update event sequence          | ✅   | ⚠️ | unit covers all 3 scenarios; GUI covers 1, add 2 more |
| Cancellation                            | ✅   | ❌  | add: GUI cancel mid-run |
| SBOM diff_packages                      | ✅   | —   | |
| SPDX parsing                            | ✅   | —   | |
| Registry image-ref parsing              | ✅   | —   | |
| Registry version fetch (HTTP)           | ❌   | ❌  | add: wiremock-based unit test |
| GitHub commits fetch                    | ❌   | ❌  | add: wiremock-based unit test |
| Preflight exit-code mapping             | ❌   | ⚠️ | extract pure fn; GUI verifies pill text |
| App state machine (full)                | ❌   | ⚠️ | GUI covers happy paths; add Error→Idle, Complete→Idle |
| D-Bus property publishing               | ❌   | ❌  | add: `gdbus introspect` assertion |
| Reboot guard (CloseRequest while Updating) | ❌ | ❌  | needs GUI in Updating state, attempt close |
| uupd subpage save                       | ❌   | ❌  | add: edit a spin, click Apply, parse written JSON |

**Top three coverage gaps to close first:**
1. Wire a wiremock-based test for `registry_client::fetch_versions` — it's the rebase dialog's data spine and is currently untested.
2. Extract the preflight exit-code mapping into a pure function and unit-test it (currently inlined in `app.rs`).
3. Add a dogtail scenario that forces `Updating` state then attempts window close — this verifies the cancel-or-block guard which has historically broken.

---

## 8. How to use this map when adding a test

1. Find the row that describes what you're testing.
2. Use the "Touches" or selector column to know which file/widget to drive.
3. Mark the matrix cell ✅ once the test lands.
4. If the row doesn't exist yet, **add it here in the same PR** — otherwise the map drifts and stops being load-bearing.
