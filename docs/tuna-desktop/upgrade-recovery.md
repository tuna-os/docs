---
sidebar_position: 55
title: "upgrade recovery"
---

This is the proof behind the v1 gate "Release safety nets hold: recovery
without data loss, proven upgrade path" ([v1 checklist](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md)). It runs on
the published Marlin Tuna image in a Corral VM:

```sh
~/.cache/tuna-journey-venv/bin/python scripts/tuna-corral-journey \
  --image ghcr.io/tuna-os/marlin@sha256:<source index digest> \
  --upgrade-to ghcr.io/tuna-os/marlin@sha256:<target index digest> \
  --node karnataka --vm tuna-q-variant-diag-upgrade-<run> \
  --out <new evidence directory>
```

`--upgrade-to` replaces the daily-driver tour of
[`tuna-corral-journey`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md) with the steps below. Everything
else is the journey's: the digest-pinned `corral bootc create`, the
`tuna-test` fixture account, the receipt-bound VM identity and its
UID-preconditioned cleanup, the noVNC console driven by Playwright, one
console frame and the user's `tuna-*` journal lines per step, and
`manifest.json`. Setup is in [corral-journey.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md#running-it).

Every reboot goes through `corral wait --boot-id` on the VM's canonical ID,
so Corral needs canonical-ID `wait` ([tuna-os/corral#701](https://github.com/tuna-os/corral/pull/701)).
Corral `v0.7.0+36.g76b6dd5` predates it: its `wait` reports `running: not
found` for a VM that is up, and the run stops after provisioning.

Both references must be pinned by digest and must differ. `bootc switch` to
an unchanged image reference prints "Image specification is unchanged" and
stages nothing, so there would be no switch and no rollback to prove. The
script refuses that before it creates a VM, as it refuses `--reuse` and
`--qualification-only`: the proof needs a fresh install.

## What it proves

The user's state is written in a real session on the source image and
then has to survive five things: `bootc switch` and a reboot into the
target, a shell crash, a shell crash while locked, a compositor crash, and
`bootc rollback` with a reboot back into the source.

| Step | What happens | Checked |
| --- | --- | --- |
| `source-booted` | Fresh install of the source digest, at GDM | `bootc status` booted image is the source; `tuna-desktop` version and binary hashes recorded |
| `source-login` | Real GDM password login | logind `gdm-password` session; `tuna-compositor` and `tuna-shell-gtk` run; no `gnome-shell` |
| `source-create-state` | Files, GSettings, a notification and a wellbeing transition | file fixture written; every GSettings key reads back; `Notify` returns an id and the shell persists it; lock and unlock |
| `source-logout` | Session ended, user manager stopped | whole-home inventory `home-source-logged-out.json`; wellbeing history written |
| `switch` | `bootc switch <target>` | exit 0; target staged; source still booted |
| `reboot-to-target` | `systemctl reboot` in the guest | new boot id; GDM ready; target booted; source is the rollback deployment |
| `target-home-preserved` | Inventory at GDM, before any login | every entry of the home identical to `source-logged-out` (type, mode, owner, size, SHA-256, link target) |
| `target-login` | Real GDM login on the target | as `source-login` |
| `target-state` | Settings and persisted shell state | every GSettings value; the notification is still in the shell's history; no wellbeing history entry lost |
| `target-open-windows` | Files and Settings from the overview search | both processes running |
| `target-shell-crash` | `SIGKILL` to `tuna-shell-gtk` | compositor PID unchanged; journal shows `ShellExited` then `RestartScheduled`, no `BudgetExhausted`; the new shell owns `org.gnome.Shell`; both apps still running; state checks again |
| `target-shell-crash-locked` | Super+L, then `SIGKILL` to the shell | locked first; logind `LockedHint` stays `yes` with the shell killed (where the compositor sets it); the restarted shell, a fresh process whose `GetActive` is the compositor's lock state, reports the session locked; the password unlocks through it; apps still running |
| `target-compositor-crash` | `SIGABRT` to `tuna-compositor`, as a panic or failed assertion ends it (a sent `SIGSEGV` only resets Rust's guard-page handler) | the session ends and GDM's greeter returns on seat0; surviving apps and `coredumpctl` recorded |
| `target-relogin`, `target-state-after-crash` | Log in again | session as before; state checks |
| `target-logout` | Session ended | inventory `home-target-logged-out.json`; file fixture intact |
| `rollback` | `bootc rollback` | exit 0; target still booted until the reboot |
| `reboot-to-source` | `systemctl reboot` | source booted; target is now the rollback deployment |
| `source-home-preserved` | Inventory at GDM, before any login | home identical to `target-logged-out` |
| `rollback-login`, `rollback-state` | The older release reads state the newer one wrote | as `target-state` |
| `rollback-logout` | Session ended | final inventory; file fixture intact |

Locked means the shell's `org.gnome.ScreenSaver.GetActive` returns true and,
on a compositor that sets it, logind's `LockedHint` is `yes`. The compositor
sets `LockedHint` from [#849](https://github.com/tuna-os/tuna-desktop/pull/849)
(v1.0.0-beta.3) on; beta.2's never does, so on beta.2 the hint is recorded,
not required. Each deployment is probed and the receipt records
`locked_hint_supported`.

The state under test:

- **Files**: `~/Documents/tuna-upgrade-proof/` with a text file naming the
  run's token, a 1 MiB binary derived from the token, an owner-only file, a
  symbolic link and an empty directory.
- **Settings**: color scheme, clock seconds, dash favorites, an app-grid
  folder (`org.gnome.desktop.app-folders`, the saved app layout) and the
  wellbeing break reminders, set through `gsettings` in the session. They
  are read back with `gsettings get`, so the check holds for whichever
  backend stores them; `manifest.json` records which of
  `~/.config/dconf/user` and `~/.config/glib-2.0/settings/keyfile` exist.
- **Notifications**: a D-Bus `Notify` naming the token, which the shell
  keeps in `~/.local/state/tuna-shell/notifications.json`.
- **Wellbeing**: `~/.local/share/gnome-shell/session-active-history.json`.
  An earlier entry may only disappear through the shell's own retention
  rules (older than 14 weeks, or an equal-time pair that cancels out).
- **Everything else in the home**: the byte-for-byte inventory compares the
  whole home across each reboot, with nobody logged in on either side, so
  any change there was made by the boot itself.

`~/.local/share/tuna/window-sessions.json`, the xdg-session-management
store, is in the home inventory and its size and hash are recorded at each
logout. No app on the image is known to opt in to session restore, so the
proof does not claim it; `scripts/tuna-session-restore-proof` covers restore
nested.

## What a pass does not prove

- **Windows across a compositor crash.** Recovery without losing windows
  is the shell's guarantee ([ADR 0003](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0003-nested-supervision-and-recovery.md)).
  The compositor is the Wayland server: when it dies, every app loses its
  display and its unsaved work, and the session ends
  ([session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md)). The proof checks that the
  user gets back to GDM, can log in again and has lost no saved state. It
  records which apps survived (normally none) but does not fail on it.
- **`/etc` merge and system policy.** Only the user's home and session are
  checked. Locally modified `/etc` files across the switch are a separate
  item in [legacy-upgrade.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md).
- **Logout through the menu.** Logout here is `loginctl terminate-session`,
  the same `SIGTERM` the menu's Log Out leads to. The menu path is the
  journey's. The power menu's Restart is not used: the reboot comes from
  the guest, as `bootc switch --apply` would do it.
- **Other hardware.** The KubeVirt profile of the journey applies: bochs-drm,
  no GPU, no sound card, no backlight.

## Reading a run

`manifest.json` has the usual step records, plus `upgrade`: the token, the
`bootc status` projection at each phase, the package versions on each
deployment, the `bootc switch`/`rollback` output, each reboot's
`corral wait` result, the inventory files with their hashes, the home
comparisons and the recovery observations (PIDs, supervision events, core
dumps). `home-*.json` are the inventories themselves.

A run that passes every step on a source and a target digest is the
evidence for that pair only. The release pair is the previous published
image and the release candidate's image.
