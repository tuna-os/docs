---
sidebar_position: 4
title: "GNOME HIG AUDIT"
---

Audited against **gnome-spec** (`himachal:~/dev/gnome-spec`) v1.1.0 — the
GNOME GUI Specification compiled from HIG v47 plus source audits of 33 GNOME
Core/Circle apps. Section numbers below refer to `GNOME-GUI-SPEC.md`.

The closest reference app is **GNOME Software** (`audits/gnome-software.md`) —
same problem domain (system updates), same shape (hero status + list of
pending changes + detail drill-down).

Scope: static audit of the widget tree as constructed in `src/`. Screenshot
verification is tracked separately in `docs/GUI_TESTING.md`.

---

## Summary

| Area | Verdict |
|---|---|
| Window architecture | ✅ Correct |
| Icon style | ✅ Symbolic throughout |
| Empty/status states | ✅ `AdwStatusPage` used consistently (15 sites) |
| Destructive-action dialogs | ✅ Correctly reserved for non-undoable actions |
| Transient feedback | ✅ Toasts (20 sites) |
| **Adaptive design** | ❌ **No breakpoints at all** |
| **Settings storage** | ❌ **Hand-rolled JSON, not GSettings** |
| **Navigation pattern** | ❌ **Hand-rolled `gtk::Stack` instead of `AdwNavigationView`** |
| **Tooltips** | ❌ 4 in the entire app; icon-only back button has none |
| **Access keys** | ❌ 3 `use_underline` sites, all in the menu |
| Preferences search | ❌ Explicitly disabled |

### Status as of 2026-07-26

| # | Finding | State |
|---|---|---|
| 1 | Adaptive breakpoints | ✅ **fixed** — the real cause was `gtk::Stack` being homogeneous by default, so it requested the largest width of *every* page including hidden ones; the visible idle page inherited the ~555px minimum of the history/changelog rows. With `hhomogeneous`/`vhomogeneous` off, plus `AdwBreakpoint`, `width-request` 400→360, and wrapping row labels, the content minimum dropped **579px → 240px** and the window renders correctly at 360×640. Verified by the `narrow` screenshot check. |
| 2 | GSettings migration | ✅ **fixed** — `data/*.gschema.xml.in`, templated on `application_id` so Devel and release get separate schemas and cannot clobber each other's config. An existing `settings.json` is imported exactly once, guarded by a `migrated-from-json` key rather than by deleting the file (so a downgrade still works, and a stale file can't later overwrite GSettings changes). Verified end-to-end: a JSON file with distinctive values (`weekly`, `42`, `dry_run=true`, `include_app_updates=false`) appeared verbatim in dconf with the guard flipped. **Deliberately fail-safe**: `gio::Settings::new()` aborts the process on an unknown schema id, and the schema only exists once installed — so the lookup is checked first and the legacy JSON path remains the fallback. That matters because `Settings::load()` is what `privileged()` consults, and a hard dependency would turn "schema missing" into "dry-run silently stops working". The handle is thread-local, since `gio::Settings` is `!Send + !Sync` and `Settings::load()` is called from background threads. |
| 3 | `AdwNavigationView` | ✅ **fixed** — the root of `StatusView` is now an `AdwNavigationView`. The three genuine drill-downs (Image Source, Image History, What's New) are `AdwNavigationPage`s pushed by tag; the five *state* pages (idle/updating/complete/up_to_date/error) correctly stay in a `gtk::Stack`, since those are mutually exclusive states of one screen rather than places you navigate to. This buys edge-swipe back, Escape / Alt+Left, focus restoration on pop, and per-page titles. Returning home is a `pop_to_tag("main")` rather than a push, so the stack cannot grow each time the user goes back. |
| 4 | Tooltips | ✅ **fixed** — the header-bar back button and the history expander chevron now carry both `tooltip-text` and an accessible label. A full sweep of the remaining icon-only controls found the rest (pin, pull, roll back, calendar month nav, copy log, what's new, change image) already had tooltips; the original count of "4" came from a per-line grep that missed tooltips set on an adjacent builder line. |
| 5 | Access keys | ✅ **fixed** — the preferences dialog had **zero** `use-underline` rows; access keys added to all nine focusable rows (Automatic Background Updates, Include App Updates, Configure Automatic Updates, Check Interval, Custom Interval, Pause on Metered Connections, Developer Mode, Enable Hardware Checks, Save to /etc/uupd/config.json). Group and page titles are headings, not focusable controls, so they are deliberately left alone. |
| 6 | Preferences search | ✅ fixed — `set_search_enabled(true)`. |

Also fixed while auditing, though not HIG findings as such: the dev-mode banner
claimed "updates are simulated" during a dry run, which was simply untrue —
it now distinguishes the two safety modes.

Six findings, ordered by impact below. Findings 1–3 are architectural and
affect the gnome-control-center panel deliverable directly; 4–6 are
mechanical.

---

## 1. No adaptive breakpoints ❌

**Spec §8.1, §2, Checklist "Adaptive: works at 360px width minimum".**

`grep -rn "Breakpoint" src/` returns nothing. The window declares:

```rust
// src/app.rs:855
adw::ApplicationWindow {
    set_default_size: (750, 700),
    set_width_request: 400,
    set_height_request: 500,
```

A hard `width_request: 400` means the window *cannot* be narrowed to the
360px the HIG requires, and nothing re-lays-out when it approaches that.

**Why it matters more than usual here.** This is not only a phone-form-factor
concern. The second deliverable embeds `UpdatesPanel` into
gnome-control-center, whose content pane is resized by the *shell's* own
breakpoints — Settings collapses to a single-pane layout on narrow windows.
A panel that refuses to go below 400px will either clip or force the whole
Settings window wider than the user asked for.

**Fix.** Add an `AdwBreakpoint` on the window at `max-width: 550sp`, and have
the rebase dialog's calendar grid + details panel switch from side-by-side to
stacked. `rebase_dialog.rs:47` already notes the 720px sizing is a tight fit —
that comment is the same problem observed from the other side.

---

## 2. Settings are hand-rolled JSON, not GSettings ❌

**Spec §9.1 and Anti-Patterns: "Create custom settings storage → Use
GSettings/GSchema".**

There is no `*.gschema.xml` anywhere in the tree. `src/settings.rs` writes
`$XDG_CONFIG_HOME/finupdate/settings.json` by hand.

**Consequences beyond spec compliance:**

- **No `dconf` visibility** — settings can't be inspected, reset, or managed
  by policy the way every other GNOME app's can.
- **No change notification.** GSettings emits `changed::` signals; JSON does
  not. This is why the code re-reads `Settings::load()` at call sites
  (`status_view.rs:1920`, `:2051`, `:2362`, `:3324`) instead of binding once —
  and why those sites had to re-check `dry_run` defensively, since another
  part of the app may have rewritten the file in the meantime.
- **The control-center panel is the real problem.** gnome-control-center
  panels are expected to expose their settings through GSettings so the
  Settings search index can find them. A JSON blob is invisible to it.

**Fix.** Define `org.tunaos.finupdate.gschema.xml`, migrate the
`Settings` fields, and use `gio::Settings::bind()` for the switch/combo/spin
rows — which also removes the manual `Rc<RefCell<Settings>>` plumbing in
`preferences.rs`. Keep a one-shot importer for existing `settings.json` files.

Note this composes cleanly with the new `RuntimeOverrides` layer: CLI
overrides stay in-memory and GSettings becomes the persistent tier.

---

## 3. Navigation is a hand-rolled `gtk::Stack` ❌

**Spec §3 "Stack + Back Navigation", Anti-Patterns: "Mix navigation
patterns".**

The app implements hierarchical drill-down (`PageChanged` / `GoBack`,
`app.rs:147`, `:724`, `:992`) over a raw `gtk::Stack`
(`status_view.rs:947`), with the back button's visibility toggled by hand
(`app.rs:910`, `status_view.rs:320`).

`AdwNavigationView` exists for exactly this and provides, for free:

- the back button and its visibility,
- **edge-swipe back gestures** (currently absent — a touch/trackpad
  regression against every other GNOME app),
- per-page titles wired into `AdwHeaderBar`,
- correct focus restoration when popping a page,
- `Escape`/`Alt+Left` handling.

**Distinguish two uses of `gtk::Stack` here.** Using a stack to switch
*visual state* (Idle → Updating → Complete → Error, `status_view.rs:947`) is
legitimate and should stay — that's state, not navigation. The finding is
specifically about *page* navigation (`preferences`, changelog, rebase
subpages), which should become `AdwNavigationView`.

`ffi.rs:252` and `:277` already describe the panel widgets as destined for an
`AdwNavigationView` — the control-center side assumes this shape, so the
standalone app is the odd one out.

---

## 4. Tooltips are nearly absent ❌

**Spec Checklist "All buttons have `tooltip-text`"; Anti-Patterns: "Skip
tooltips on header bar buttons".**

Four `set_tooltip_text` calls exist in the whole app:

| Site | Widget |
|---|---|
| `app.rs:871` | Main Menu |
| `status_view.rs:1111` | Change image variant |
| `status_view.rs:1218` | What's new |
| `status_view.rs:1650` | Copy log |

The **header bar back button is icon-only with no tooltip** (`app.rs:910`):

```rust
let back_btn = gtk::Button::builder()
    .icon_name("go-previous-symbolic")
    .visible(false)
    .build();
```

An icon-only control with no tooltip and no accessible label is unusable with
a screen reader and unclear to a new user. Every icon-only button needs
`tooltip_text` (which libadwaita also surfaces as the accessible name).

---

## 5. No access keys ❌

**Spec Checklist "Access keys on all labeled controls"; Anti-Patterns: "Skip
access keys".**

Three `use_underline` sites exist, all in the menu model (`_Keyboard
Shortcuts`, `_About Finupdate`, `_Quit` — `app.rs:880`). None of the
preference rows, dialog buttons, or action buttons declare one.

**Fix.** Add `_` to labels and `use-underline: true` on `AdwSwitchRow`,
`AdwComboRow`, `AdwSpinRow`, and every `AlertDialog` response.

---

## 6. Preferences search is explicitly disabled ❌

**Spec §9.4 and Checklist "`search-enabled: true`".**

```rust
// src/ui/preferences.rs:55
dialog.set_search_enabled(false);
```

The preferences dialog has multiple groups plus a nested uupd subpage with
eight-plus rows — comfortably past the point where search earns its place.
This looks like a deliberate choice made when the dialog was smaller; it
should be flipped back on.

---

## What is already right

Worth recording so it doesn't regress:

- **Window architecture** (§2) — `AdwApplicationWindow` → `AdwToolbarView` →
  `AdwHeaderBar` + `AdwWindowTitle`. Textbook.
- **Icons** (§7.4) — every icon reference is `-symbolic`. No exceptions found.
- **Status pages** (§6.4) — `AdwStatusPage` at 15 sites for empty/terminal
  states.
- **Dialog discipline** (§6.3, Anti-Patterns "confirmation dialogs for
  undoable actions") — `AdwAlertDialog` is used **only** for genuinely
  irreversible operations: reboot, powerwash, factory reset, rollback, image
  switch/pin/unpin, and the NVIDIA-downgrade warning. Everything transient
  goes to a toast. This is the distinction most apps get wrong, and finupdate
  gets it right.
- **Preferences containers** (§4.1) — correct
  `AdwPreferencesDialog` → `AdwPreferencesPage` → `AdwPreferencesGroup` →
  row hierarchy.

---

## Suggested order

1. **GSettings migration** (#2) — unblocks the panel deliverable and removes
   the re-read-settings-everywhere pattern that made dry-run hard to reason
   about.
2. **`AdwNavigationView`** (#3) — the panel already assumes this shape.
3. **Breakpoints** (#1) — needed before the panel can be embedded honestly.
4. Tooltips (#4), access keys (#5), preferences search (#6) — mechanical,
   independently landable, good first commits.
