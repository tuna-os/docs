---
sidebar_position: 3
title: "Plasma keyboard shortcuts"
---

# KDE Plasma keyboard shortcuts

This is a quick reference for the Plasma 6 session in Tromsø. KDE calls the
Windows or Super key **Meta**; this page uses `Meta` for that key.

Shortcut assignments are configurable, and a Tromsø image may receive a
different assignment when Plasma changes its defaults. If a shortcut does not
work, search for the action in **System Settings → Shortcuts** before assuming
that the feature is unavailable.

## Window management

These are the useful KWin defaults and actions to check first:

| Shortcut | Action |
| --- | --- |
| `Alt+Tab` | Switch between open windows. Hold `Alt` and press `Tab` again to move through the task switcher. |
| `Alt+F4` | Close the active window. |
| `Meta+Up` | Maximize the active window. |
| `Meta+Down` | Minimize the active window. |
| `Meta+Left` | Quick-tile the active window to the left half of the screen. |
| `Meta+Right` | Quick-tile the active window to the right half of the screen. |
| `Meta+W` | Open KWin Overview, when the Overview effect is enabled. |
| `Ctrl+F12` | Peek at the desktop. |

You can also drag a window to a screen edge to quick-tile it. Dragging a
window to a corner can tile it into a quarter of the screen when corner
tiling is enabled.

## Applications and search

| Shortcut | Action |
| --- | --- |
| `Alt+Space` | Open KRunner. Type an application name, file name, calculation, or web shortcut, then press `Enter`. |
| `Alt+F2` | Open KRunner (an alternative to `Alt+Space`). |
| `Meta` | Open the Application Launcher in the standard Plasma configuration. |
| `Ctrl+Esc` | Open the process and window list. |
| `Ctrl+Alt+T` | Open a terminal if Tromsø has a terminal shortcut assigned. This is not universal across Plasma installations; use KRunner and type `Konsole` if it is unavailable. |

`Meta` alone is not the GNOME-style Overview shortcut. In the standard Plasma
configuration it opens the Application Launcher; KRunner is normally
`Alt+Space` or `Alt+F2`, and Overview is `Meta+W`.

Once KRunner is open, use the arrow keys to select a result and `Enter` to
launch it. KRunner can also switch to a window or virtual desktop when you
type its name.

## Virtual desktops and activities

Virtual desktops and Activities are different Plasma features: virtual
desktops organize windows, while Activities organize sets of widgets and
desktop context.

| Action | Where to find it |
| --- | --- |
| Switch to the next or previous virtual desktop | **System Settings → Shortcuts → KWin**; search for `Switch to Next Desktop` or `Switch to Previous Desktop`. |
| Switch to a desktop in a direction | **System Settings → Shortcuts → KWin**; search for `Switch One Desktop to the Left/Right/Up/Down`. |
| See all windows and desktops | `Meta+W` opens Overview when enabled. |
| Switch Activities | `Meta+Tab` and `Meta+Shift+Tab` are the documented Plasma Activity shortcuts. |

The exact number of virtual desktops and their key bindings are user
settings. Do not rely on `Ctrl+F1`–`Ctrl+F4` being present: that mapping is
common in older Plasma configurations, but it may be unset or assigned to
another action in Plasma 6.

## Common application shortcuts

These are standard shortcuts implemented by many KDE applications, including
Dolphin, Konsole, and Kate:

| Shortcut | Action |
| --- | --- |
| `Ctrl+N` | New document, tab, or window (depending on the application). |
| `Ctrl+O` | Open a file. |
| `Ctrl+S` | Save. |
| `Ctrl+Shift+S` | Save As. |
| `Ctrl+W` | Close the current document or tab. |
| `Ctrl+F` | Find text. |
| `Ctrl+C` / `Ctrl+V` | Copy / paste. |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo. |
| `F11` | Toggle fullscreen in applications that support it. |

An application can add its own actions or change these bindings. Check that
application's **Settings → Configure Keyboard Shortcuts** when a standard
shortcut behaves differently.

## Change a shortcut

1. Open **System Settings** from the Application Launcher, or press `Meta` and
   type `System Settings`.
2. Select **Shortcuts**. On some Plasma layouts this appears under **Keyboard**
   or **Workspace**.
3. Choose **Global Shortcuts** to change Plasma and KWin actions, or **Standard
   Shortcuts** to change common application actions.
4. Search for the action, select it, and choose **Default**, **Custom**, or
   **None**. For a custom binding, click the shortcut field and press the key
   combination.
5. Apply the change. If the new combination conflicts with another action,
   Plasma will show the conflict so you can choose which binding to keep.

The **KWin** and **Plasma Workspace** components contain most desktop-wide
actions. The search box is usually faster than browsing the component list.

## Sources

- [KDE Plasma Handbook: KRunner and documented Plasma shortcuts](https://docs.kde.org/stable_kf6/en/plasma-desktop/plasma-desktop/plasma-desktop.pdf)
- [KDE Plasma Handbook: current shortcut list](https://docs.kde.org/stable_kf6/en/plasma-desktop/plasma-desktop/shortcuts.html)
- [KDE documentation: configuring standard and global shortcuts](https://docs.kde.org/stable_kf6/en/plasma-desktop/kcontrol/keys/index.html)
- [KDE UserBase: Plasma tips and KWin window bindings](https://userbase.kde.org/Plasma/Tips)
- [KDE announcement: Overview and Meta-key changes in Plasma 6.7](https://kde.org/announcements/plasma/6/6.7.0/)
