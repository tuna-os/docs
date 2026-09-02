---
sidebar_position: 13
sidebar_label: "Plasma shortcuts"
title: "KDE Plasma keyboard shortcuts"
description: "A keyboard shortcuts cheat sheet and navigation reference for KDE Plasma 6 on Tromsø and TunaOS."
---

# KDE Plasma Keyboard Shortcuts

Tromsø ships KDE Plasma 6 on an immutable base. This cheat sheet lists the default Plasma 6 shortcuts for windows, virtual desktops, navigation, and applications.

On PC keyboards, `Meta` refers to the **Windows** key. On Mac keyboards, `Meta` refers to the **Command** (`⌘`) key.

---

## Window Management & Tiling

| Shortcut | Action |
| --- | --- |
| `Meta` + `Left` | Quick tile active window to the left half |
| `Meta` + `Right` | Quick tile active window to the right half |
| `Meta` + `Up` | Maximize active window |
| `Meta` + `Down` | Restore or minimize active window |
| `Meta` + `Shift` + `Left` | Tile window to the top-left or bottom-left corner |
| `Meta` + `Shift` + `Right` | Tile window to the top-right or bottom-right corner |
| `Meta` + `T` | Open the interactive Plasma tiling layout editor |
| `Alt` + `Tab` | Switch between open windows (hold `Alt` to step forward) |
| `Alt` + `Shift` + `Tab` | Step backward through open windows |
| `Alt` + `F4` | Close the active window |
| `Alt` + `F3` | Open the window operations menu |
| `Meta` + `D` | Toggle Show Desktop (minimize or restore all windows) |
| `Alt` + Left Click + Drag | Move window from anywhere inside the window frame |
| `Alt` + Right Click + Drag | Resize window from anywhere inside the window frame |

:::tip[Interactive Tiling]
Plasma 6 includes built-in custom tiling zones. Press `Meta + T` to edit your screen layout tiles. When you move a window, hold the `Shift` key to snap it into a predefined tile zone.
:::

---

## Virtual Desktops & Overview

| Shortcut | Action |
| --- | --- |
| `Meta` + `W` | Open KWin Overview (grid of all virtual desktops and windows) |
| `Meta` + `Tab` | Toggle Present Windows on the current virtual desktop |
| `Ctrl` + `F9` | Present Windows on current desktop |
| `Ctrl` + `F10` | Present Windows across all virtual desktops |
| `Ctrl` + `F1` … `Ctrl` + `F4` | Switch directly to Virtual Desktop 1, 2, 3, or 4 |
| `Ctrl` + `Alt` + `Left` / `Right` | Switch to the previous or next virtual desktop |
| `Ctrl` + `Alt` + `Shift` + `Left` / `Right` | Move the active window to the previous or next virtual desktop |

---

## Applications & System Navigation

| Shortcut | Action |
| --- | --- |
| `Meta` (tap) | Open the Application Launcher (Kickoff menu) |
| `Alt` + `Space` (or `Meta` + `Space`) | Open KRunner (search apps, calculate, run commands) |
| `Ctrl` + `Alt` + `T` | Open Konsole terminal |
| `Meta` + `E` | Open Dolphin file manager |
| `Meta` + `V` | Open the clipboard history popup |
| `Meta` + `L` | Lock the session screen |
| `PrintScreen` | Launch Spectacle for full-screen screenshot |
| `Shift` + `PrintScreen` | Launch Spectacle to capture a rectangular region |
| `Meta` + `Shift` + `PrintScreen` | Launch Spectacle to capture the active window |
| `Ctrl` + `Alt` + `Delete` | Open the session log out / shutdown dialog |

---

## Key Differences from GNOME Defaults

Users who switch from GNOME or Bluefin to KDE Plasma (Tromsø) should note these default differences:

| Action / Feature | KDE Plasma 6 (Tromsø) | GNOME (Default) |
| --- | --- | --- |
| **Tap `Super` / `Meta`** | Opens Application Launcher menu | Opens Activities Overview |
| **Desktop Overview** | `Meta` + `W` | `Super` |
| **Command / Quick Search** | `Alt` + `Space` (KRunner) | `Super` search |
| **Terminal Shortcut** | `Ctrl` + `Alt` + `T` (Konsole) | Not bound by default |
| **File Manager** | `Meta` + `E` (Dolphin) | Not bound by default |
| **Clipboard History** | `Meta` + `V` (built-in) | Needs extension |
| **Corner Tiling** | `Meta` + `Shift` + `Arrow` | Needs extension or manual drag |
| **Custom Tile Zones** | `Meta` + `T` (native editor) | Needs extension |

---

## Customize Shortcuts

To change keyboard shortcuts or add custom shortcuts:

1. Open **System Settings** (search in Kickoff or KRunner).
2. Navigate to **Keyboard** → **Shortcuts** (or search for **Shortcuts** in System Settings).
3. Select an application or KWin component to view its key bindings.
4. Click a shortcut entry and press your preferred key combination.
5. Click **Apply** to save changes.

To create a custom command shortcut (for example, to launch a custom script or container):

1. In **System Settings → Shortcuts**, click **Add New** → **Command**.
2. Name the shortcut, enter the command path, and assign a key combination.
3. Click **Apply**.

---

## Sources & Upstream Documentation

- [KDE UserBase Plasma 6 Shortcuts](https://userbase.kde.org/Plasma/Shortcuts) — Canonical upstream reference
- [KWin manual](https://docs.kde.org/stable5/en/kwin/user-guide/index.html) — the window manager and its tile zones
- [Tromsø quick start](./tromso/getting-started.md) — how to install and build Tromsø
- [Desktop environment comparison](./desktop-comparison.md) — how the TunaOS desktops compare
