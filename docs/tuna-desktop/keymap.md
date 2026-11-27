---
sidebar_position: 23
title: "keymap"
mdx:
  format: md
---

The single reference for every keyboard chord in the session:
shell chords drive the panel, dock, popups, and overview; the
compositor owns window chords. The two sets never overlap — shell
chords stay off Super+{tap,PgUp,PgDn,arrows,R,T} and Alt+{Tab,F4},
pinned by collision tests on both crates.

## Shell: focus movement

The shell keeps one keyboard cursor on a region: the panel strip
(clock, three tiles, hosted indicator cells), the dock slots, an
open popup's rows, or the overview's result list. The focused stop
paints an accent ring.

| Chord | Effect |
|---|---|
| Tab / Shift+Tab | Next / previous stop or row, wrapping |
| Left / Right | Previous / next stop or row |
| Up / Down | Panel to dock and back; rows inside a popup or the overview |
| F6 | Cycle panel and dock regions (skips an empty dock) |
| Super+D | Focus the dock |
| Alt+F1 | Focus the panel |

While the overview is open, movement keys walk the result list;
the region keys still jump the shell underneath.

## Shell: activation and Escape

| Chord | Effect |
|---|---|
| Enter, overview open | Activate the focused result row (top hit from any other region) |
| Enter, overview closed | Activate the focused stop: strip stops toggle their popups, dock slots take a left press (launch, switch, stack), popup rows fire |
| Typing, overview open | Search query (restarts the result cursor) |
| Backspace, overview open | Erase a query character |
| Escape, popup open | Close the popup, restore the parked shell focus |
| Escape, overview open, no popup | Dismiss the overview onto the previously focused window |
| Escape, all closed | No-op |

Opening a popup or the overview parks the live cursor on a return
stack; closing settles back through it, so focus never sticks on a
closed surface. No chord here is rebindable yet; there is no AT-SPI
bridge yet.

## Compositor: windows and session

| Chord | Effect |
|---|---|
| Super tap | Toggle the overview |
| Super+PgUp / Super+PgDn | Switch workspace (plus Shift: move the focused window and follow) |
| Alt+Tab / Shift+Alt+Tab | Step the window switcher; Alt release commits, Escape cancels |
| Super+Up / Super+Down | Maximize / restore the focused window |
| Super+Left / Super+Right | Tile the focused window left / right half |
| Alt+F4 | Ask the focused window to close |
| Super+Shift+T | Flip floating / strip session mode |
| Super+R / Super+Shift+R | Step the focused column through width presets (strip mode) |
| Super+Left / Super+Right | Strip mode: focus the column left / right (plus Shift: move the column) |
| Super+Up / Super+Down | Strip mode, in a shared column: focus the window above / below (plus Shift: move it); a lone window keeps the gnome meaning above |
| Super+[ / Super+] | Strip mode: a lone window joins the bottom of the column on that side; a window sharing a column leaves it for a new column on that side (niri `consume-or-expel-window-left/right`) |
| Super+, / Super+. | Strip mode: take the next column's top window into the focused column / send its bottom window out to a new column on the right (niri `consume-window-into-column` / `expel-window-from-column`) |
| Super+left-drag | Move a window; in strip mode drop it at the nearest column gap, or into a column at the nearest window edge. The modifier follows `mouse-button-modifier` |
| Super+middle-drag | Resize from the edges of the window third under the pointer; its middle third is a plain click. Strip mode: the column width, or the window's height inside a shared column. Right instead of middle with `resize-with-right-button` |
| Super+right-click | GNOME's window menu, in both modes. Middle instead of right with `resize-with-right-button` |

## GTK shell: top bar, menus, overview

The GTK shell follows GNOME 51's chords, every one rebindable
through its settings key (`org.gnome.shell.keybindings`,
`org.gnome.desktop.wm.keybindings`, `org.gnome.mutter.keybindings`,
`org.gnome.settings-daemon.plugins.media-keys`):

| Chord | Effect |
|---|---|
| Ctrl+Alt+Tab / Ctrl+Alt+Shift+Tab | Focus the top bar: first / last control (`switch-panels`) |
| Tab / Shift+Tab, bar focused | Walk every panel control: Activities, clock, tray icons, accessibility, system |
| Left / Right, bar focused, no menu | Walk the bar's controls (an open menu owns the arrows) |
| Down, panel menu button focused | Open its menu with the first item focused (popupMenu.js `_onKeyPress`) |
| Left / Right, panel menu open | Move inside the menu; at its edge, close it and open the neighbouring panel menu (panelMenu.js `_onMenuKeyPress`, PopupMenuManager `_changeMenu`) |
| Enter / Space, bar focused | Activate the focused control; on Activities, toggle the overview |
| Escape, panel menu open | Close the menu; focus stays on its button |
| Escape, bar focused, no menu | Return focus to the client |
| Super+S / Super+V | Quick settings / date menu; Tab, arrows and Enter operate them, Escape closes |
| Shift+F10 / Menu, quick settings | On a toggle with a menu (or its arrow), the volume slider, or Power Off: open that menu (St `popup-menu`) |
| Delete / BackSpace, notification focused | Close it: a banner as dismissed, a list message or collapsed group from the list (messageList.js) |
| Enter / Escape, date menu message list | Enter on a collapsed group expands it (focus moves into it); Escape collapses it back onto the group before the menu closes (calendar.js) |
| Super+A | App grid: Tab or Down from the search entry focuses the first tile, arrows and Tab walk the tiles across pages, PgUp/PgDn turn pages, Enter launches, Escape leaves |
| Tab / Down, overview entry, no search | Into the window previews (the app grid on Super+A), named by window title; arrows and Tab move between them, Enter activates the window, Up from the top row or Shift+Tab from the first returns to the entry, typing returns to it with the text (overviewControls.js focus chain) |
| Super+1..9 / Super+Ctrl+1..9 | Dash app: switch-or-launch / open a new window |
| Super+N | Focus the notification banner itself (Enter activates it, Tab reaches its buttons); Escape releases the keyboard and expires the banner (messageTray.js) |
| Super+Alt+S | Screen reader on/off (gsd's `screenreader` key) |
| Print / Shift+Print / Alt+Print | Screenshot UI / fullscreen shot / window shot (S/C/W pick, Enter, Space or Ctrl+C captures, Escape closes) |

While the bar holds keyboard focus, NORMAL/OVERVIEW chords pause
(the compositor's exclusive-popup mode); volume, brightness and
input-source keys keep working. Opening the overview hands the
keyboard over; closing it releases a hold the bar never won.

## P-A11Y-02 audit: every pointer action's keyboard route

Enumerated from `crates/shell-gtk/src` (every `connect_clicked`,
`GestureClick`, drag/drop and long-press handler) against gnome-shell
51.0 (`js/ui`, `src/st`). "GNOME route" cites where GNOME 51 binds the
key; where GNOME has no keyboard route the row is parity, not a gap.
Proof gates are in `scripts/tuna-gtk-shell-proof` (the P-A11Y-02 ones
in `scripts/lib/tuna-keyboard-routes-proof.sh`, also run alone with
`--keyboard-routes-only`); each drives real X11 keys through the
nested session and reads the AT-SPI tree or the bus back. Banner-focus
gates wait up to five seconds for the exact banner's showing/focused
state after one chord; they do not repeat the key or accept another
focused control.

| Surface | Pointer action | Tuna keyboard route | GNOME 51 route | Evidence | State |
|---|---|---|---|---|---|
| Top bar | Activities click | Super tap; Ctrl+Alt+Tab then Enter on Activities | `toggle-overview`; panel.js Top Bar group (ctrlAltTab.js) | G-PANEL-FOCUS, G-OVERVIEW-STATE-KEYS | Done |
| Top bar | Clock / System / Accessibility / input-source click | Ctrl+Alt+Tab, Tab/arrows, Enter; Down opens with focus inside; Super+V / Super+S | popupMenu.js `_onKeyPress` (Space/Return toggle, Down opens and focuses) | G-PANEL-FOCUS, G-PANEL-MENU-KEYS, G-KEYBINDINGS | Done |
| Top bar | Hover another panel button while a menu is open (switch menus) | Left/Right at the open menu's edge | panelMenu.js `_onMenuKeyPress`, popupMenu.js PopupMenuManager key-focus `_changeMenu` | G-PANEL-MENU-KEYS | Done (keyboard); pointer hover-switch itself is not implemented |
| Top bar | Tray icon click / menu rows | Ctrl+Alt+Tab, Tab to the icon, Enter, rows by Tab + Enter | panel.js / StatusNotifier extension behaviour | — (no items in the proof env) | Owned by ShellFeatureGaps (`tray.rs`); Left/Right menu switching does not leave tray menus |
| Top bar | Screencast indicator Stop | Ctrl+Alt+Tab, Tab, Enter | panel indicator button | — (no recorder in the proof env) | Implemented, unproven |
| Quick settings | Toggles, sliders, round buttons, menu rows | Super+S, Tab/arrows, Enter/Space; sliders take arrows | St focus manager | G-KEYBINDINGS, A11Y-QS | Done |
| Quick settings | Arrow of a toggle with a menu; volume menu arrow; Power Off | Also Shift+F10 / Menu on the toggle, the slider or Power Off | st-widget.c `popup-menu` keys; quickSettings.js QuickMenuToggle/QuickSlider, status/system.js ShutdownItem | G-QS-MENU-KEY | Done |
| Quick settings | Power rows (Suspend, Restart…, Power Off…, Log Out…) | Tab + Enter; the dialog focuses Cancel, Escape cancels | endSessionDialog.js | G-POWER-ESCAPE | Done |
| Date menu | Calendar days, month arrows, Today, events card, Clear, DND | Super+V, Tab/arrows + Enter | calendar.js / dateMenu.js `can_focus` buttons | G-KEYBINDINGS (menu), A11Y golden | Done |
| Date menu | World Clocks card, Weather card (open Clocks, open Weather) | Super+V, Tab/arrows + Enter | dateMenu.js `WorldClocksSection` / `WeatherSection` `can_focus` buttons | G-DATEMENU-WORLD-CLOCKS (activated through the accessible action), G-DATEMENU-WEATHER (also Shift+Tab to the card, which scrolls into view, and Enter) | Done |
| Date menu | Notification close button | Delete/BackSpace on the focused message, or Tab to Close + Enter | messageList.js Message bindings (`_closeIfAllowed`) | G-NOTIFICATION-KEYS | Done |
| Date menu | Collapsed group click (expand), Collapse button | Enter expands with focus inside; Escape collapses back onto the group before the menu closes | messageList.js group `clicked`; calendar.js `_keyController` Escape | G-NOTIFICATION-KEYS | Done |
| Date menu | Message body click (activate) | — | Message `vfunc_clicked` (Enter) | — | Pointer action itself absent from Tuna's list cards (P-NT row) |
| Banner | Banner click (default action), expand button, action buttons, Close | Super+N expands the banner and focuses it (Enter activates it); Tab + Enter its buttons, Close first (the expand arrow is not `can_focus`); Delete closes; Escape releases and expires it | `focus-active-notification` (`_expandActiveNotification`); messageTray.js Escape `close` binding; messageList.js Delete | G-NOTIFICATION-FOCUS-KEY, G-NOTIFICATION-KEYS, G-ORCA-SPEECH-NOTIFY | Done |
| Overview | Search entry, result click | Typing, Enter (top hit), Tab/Down to a row + Enter | searchController.js `_onKeyPress` | G-OV-LAUNCH, G-SEARCH-ACTIVATE | Done |
| Overview | Window preview click | Super, Tab/Down from the search entry, arrows/Tab + Enter (Up or Shift+Tab back to the entry); or Alt+Tab | windowPreview.js Return `activate`, focus chain overviewControls.js `vfunc_navigate_focus` | G-ORCA-SPEECH-PREVIEWS, G-WINDOW-SWITCHER, G-SWITCHER | Done |
| Overview | Window preview close button | Alt+Tab to the window, Alt+F4 | none: the close St.Button is not `can_focus` (windowPreview.js) | G-WM-KEYS | Parity |
| Overview | Drag a preview to another workspace | Super+Shift+PgUp/PgDn | none (drag only, dnd.js) | G-WM-KEYS | Parity |
| Overview | Workspace thumbnail click | Super+PgUp/PgDn, Ctrl+Alt+arrows | none: thumbnails are not focusable (workspaceThumbnail.js) | G-WS-POPUP, J-WS-NEXT | Parity |
| Overview | Dash item click / Show Apps | Super+1..9 / Super+Ctrl+1..9, Super+A | Dash Ctrl+Alt+Tab group (dash.js); `toggle-application-view` | G-KEYBINDINGS | Dash focus group: open (Ctrl+Alt+Tab group popup) |
| App grid | Icon click, page arrows/dots | Super+A, Tab/Down from the search entry, arrows/Tab across pages, PgUp/PgDn turn pages, Enter launches, Escape leaves | arrows/Tab (St focus), PgUp/PgDn/Home/End (appDisplay.js AppDisplay bindings) | G-ORCA-SPEECH-GRID | Done; Home/End (first/last page) not bound |
| App grid | Icon right-click / long press (context menu) | — | Shift+F10 / Menu (appDisplay.js AppIcon `popup-menu`) | — | Pointer action absent: Tuna has no app-icon context menu yet |
| App grid | Folder click, rename, remove; drag to reorder, into/out of folders | Enter on the folder icon opens the dialog (Rename focused); Escape unwinds without saving; reorder: none | folder: Enter on the icon; reorder: none (dnd only) | Verified in source | Folder: done; reorder: parity |
| Background | Right-click / long press background menu | — | none (backgroundMenu.js gestures only) | — | Parity (Tuna has no background menu) |
| Window menu | Rows (Alt+Space or Super+right-click) | Alt+Space, Up/Down, Enter, Escape | windowMenu.js PopupMenu; St focus Up/Down | G-WM-KEYS, G-WINDOW-MENU-KEYS | Done |
| Alt+Tab | Click an item | Alt+Tab / arrows / Q / W, F4; release commits | switcherPopup.js, altTab.js `_keyPressHandler` | G-WINDOW-SWITCHER, G-SWITCHER-GROUP | Done |
| Ctrl+Alt+Tab | Group popup (Windows, Top Bar, Dash, Search, Apps) | Ctrl+Alt+Tab focuses the bar directly. GNOME's ctrlAltTab.js does the same for a quick press in a session whose only group is the bar, but with Ctrl+Alt held it shows CtrlAltTabPopup, a switcher of the focus groups, Tab stepping while held and release focusing the selection | ctrlAltTab.js `CtrlAltTabPopup` | G-PANEL-FOCUS | Open: no held-modifier group popup and no overview groups |
| Screenshot UI | Mode buttons, selection drag, window pick, Capture, close | S/C/W/V/P, arrows (+Alt/Shift/Ctrl), R, Enter/Space/Ctrl+C, Escape | screenshot.js binding pool | G-SCREENSHOT-UI, G-SCREENSHOT-KEYS, G-SCREENSHOT-CTRL-C | Done |
| Lock | Curtain click/drag; prompt; Cancel | Any key but Shift/Caps lifts, Enter submits, Escape lowers | unlockDialog.js `_onKeyPress` | G-LOCK-CURTAIN-CLOCK, G-LOCK-FIRST-PRINTABLE | Done; lock-screen panel (`switch-panels`) open, #352 |
| Dialogs | Polkit, network secrets, end-session, run, consent, display change, audio selection, location, kbd-a11y confirm, folder | Exclusive keyboard, first control focused, Tab/Enter, Escape cancels | ModalDialog keys | G-POLKIT, G-POWER-ESCAPE, G-LOCKDOWN-COMMAND-LINE, G-SCREENSHOT-UI | Done |
| OSK | Key taps, long press, swipe | Not applicable: the physical keyboard | none: OSK keys are not `can_focus` (keyboard.js) | — | Parity |
| IBus candidates | Candidate / page click | The engine's keys through the focused field | candidatePopup.js (no focus) | G-IME-CANDIDATES | Parity |
| Pointer a11y | Dwell click-type chooser | Ctrl+Alt+Tab to its panel button | dwellClick.js panel menu | — | Implemented, unproven |
