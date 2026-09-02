---
sidebar_position: 12
sidebar_label: "COSMIC quick-start"
title: "COSMIC desktop quick-start"
description: "A quick-start guide to the COSMIC desktop environment on TunaOS, with keyboard shortcuts, applet setup, COSMIC Settings, and tile workflows."
---

# 🌌 COSMIC Desktop Quick-Start

[COSMIC](https://system76.com/cosmic) is an independent desktop environment from **System76**, written in Rust. It is built on Wayland, the `iced` toolkit, and the `cosmic-comp` compositor.

TunaOS ships COSMIC flavors on several bases. These are **[Bonito](/bonito)** (Fedora 44), **[Yellowfin](/yellowfin)** (AlmaLinux Kitten 10), **[Albacore](/albacore)** (AlmaLinux 10), **[Skipjack](/skipjack)** (CentOS Stream 10), and **[Marlin](/marlin)** (Arch Linux).

:::tip[Variant landing pages]
Each base has its own overview page. Start with the **[Bonito overview →](/bonito)** page for the Fedora 44 base.
:::

---

## What is COSMIC?

Most desktop environments build on an older window manager, or on a web runtime. COSMIC does neither. System76 wrote every core part in Rust, from the compositor up.

- **🦀 Memory-safe and fast:** The core parts are `cosmic-comp`, `cosmic-panel`, `cosmic-applets`, and `cosmic-settings`. Rust gives them stability and low latency.
- **🎨 Hybrid tile and float modes:** You can switch a workspace between automatic tiles and windows that float freely. One workspace can hold both.
- **🧩 Modular applets:** Panels and docks are containers. Independent applets go inside them, and you can add, move, or remove each one.
- **⚡ Native Wayland:** COSMIC runs on Wayland alone. It supports fractional scale factors, variable refresh rate (FreeSync and G-Sync), and modern graphics pipelines.

---

## Getting Started

### Available Images

You can pull or switch to any of the TunaOS COSMIC images:

```bash
# Bonito (Fedora 44)
ghcr.io/tuna-os/bonito:cosmic

# Yellowfin (AlmaLinux Kitten 10)
ghcr.io/tuna-os/yellowfin:cosmic
ghcr.io/tuna-os/yellowfin:cosmic-hwe
ghcr.io/tuna-os/yellowfin:cosmic-nvidia

# Albacore (AlmaLinux 10)
ghcr.io/tuna-os/albacore:cosmic
ghcr.io/tuna-os/albacore:cosmic-hwe

# Skipjack (CentOS Stream 10)
ghcr.io/tuna-os/skipjack:cosmic

# Marlin (Arch Linux)
ghcr.io/tuna-os/marlin:cosmic
```

### Switch to COSMIC with bootc

From an existing TunaOS installation, switch to the COSMIC flavor with `bootc switch`:

```bash
# Switch to Yellowfin COSMIC
sudo bootc switch ghcr.io/tuna-os/yellowfin:cosmic
sudo systemctl reboot
```

The TunaOS live ISO also offers **COSMIC Desktop** in its desktop picker.

---

## Default Keyboard Shortcuts

COSMIC uses the **Super** key as its main modifier. This is the `Windows` key on a PC keyboard, and the `Command` (`⌘`) key on a Mac keyboard.

### Navigation and Focus

| Shortcut | Action |
| --- | --- |
| `Super` + `Left` / `Down` / `Up` / `Right` (or `Super` + `H` / `J` / `K` / `L`) | Move focus to the adjacent window in that direction |
| `Super` + `Shift` + `Left` / `Down` / `Up` / `Right` (or `Super` + `Shift` + `H` / `J` / `K` / `L`) | Move the active window, or swap its position in the tile layout |
| `Super` + `PageUp` / `PageDown` (or `Super` + `Ctrl` + `Up` / `Down`) | Go to the previous or next workspace |
| `Super` + `Shift` + `PageUp` / `PageDown` | Move the active window to the previous or next workspace |
| `Super` + `1` … `9` | Go straight to workspace 1 through 9 |
| `Super` + `Shift` + `1` … `9` | Move the active window to workspace 1 through 9 |

### Window Management and Tiles

| Shortcut | Action |
| --- | --- |
| `Super` + `Y` | Turn automatic tiles on or off for the current workspace |
| `Super` + `G` | Group windows into one tabbed container |
| `Super` + `Shift` + `Space` | Toggle float mode for the active window |
| `Super` + `M` | Maximize or unmaximize the active window |
| `Super` + `F` | Toggle full-screen mode |
| `Super` + `Q` | Close the active window |
| `Super` + `R` | Enter resize mode; use the arrow keys or the mouse to adjust the split |
| `Super` + `D` | Show the desktop (minimize or restore the open windows) |

### Applications and System Controls

| Shortcut | Action |
| --- | --- |
| `Super` + `Return` / `Enter` | Open the terminal (`cosmic-term`, or the system terminal) |
| `Super`, or `Super` + `Space`, or `Super` + `/` | Open the COSMIC launcher and app search |
| `Super` + `A` | Open the Application Library |
| `Super` + `W` (or `Super` + `S`) | Open the workspace overview |
| `Super` + `V` | Open the clipboard history applet |
| `Super` + `L` | Lock the screen |
| `Super` + `Escape` | Open the power and session menu (log out, restart, power off) |
| `PrintScreen` | Start the screenshot tool (`cosmic-screenshot`) |
| `Super` + `PrintScreen` | Capture the active window |
| `Shift` + `PrintScreen` | Capture a custom screen area |

---

## Desktop Overview and Applet Setup

COSMIC divides the desktop into panels and docks. Modular Rust applets go inside them.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [App Menu] [Workspaces]            [Clock & Calendar]     [SysTray] [Status]│ ← Top Panel
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│                            Active Workspaces &                              │
│                            Tiled / Floated Apps                             │
│                                                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                    [ 🚀 ] [ 📁 ] [ 🌐 ] [ ⚙️ ] [ 💬 ]                        │ ← Bottom Dock
└─────────────────────────────────────────────────────────────────────────────┘
```

### What an Applet Is

An applet is an independent component that runs inside a panel or a dock. COSMIC ships these applets:

- **Workspaces indicator:** Shows the active virtual desktops, and moves you between them.
- **Application menu and library:** Opens any application you have installed.
- **Window list:** Shows the open windows, and the groups they belong to.
- **Clock and calendar:** Shows the time, the date, and your next events.
- **System indicators and tray:** Show audio, Wi-Fi, Bluetooth, battery, and tray items.
- **Notification center:** Collects system and application notifications, with a Do Not Disturb toggle.
- **Power and battery profiles:** Move between *Power Saver*, *Balanced*, and *Performance*.
- **Input method:** Shows the active keyboard layout, and moves between your layouts.

### Configure Panels and Docks

To change a panel, a dock, or an applet:

1. Open **COSMIC Settings** → **Desktop** → **Panel** or **Dock**. You can also right-click an empty part of a panel and select **Panel Settings**.
2. **Position and edge:** Put the panel on the top, bottom, left, or right edge of any monitor.
3. **Length and size:** Select **Dock**, which fits its contents, or **Panel**, which fills the screen edge.
4. **Applet placement:** Drag an applet between the **Start**, **Center**, and **End** sections.
5. **Add or remove applets:** Select **Add Applet** to insert one, or remove one you do not need.
6. **Autohide and opacity:** Select an autohide rule, then set the background opacity.

---

## COSMIC Settings

`cosmic-settings` is the central configuration application for the desktop. These are its main panes.

### Desktop and Appearance

- **Theme mode:** Select Light or Dark, or let the time of day select for you.
- **Accent colors:** Select a preset palette, or set your own primary and accent tones.
- **Container style and corner radius:** Adjust how round window corners, dialogs, and panels are.
- **Wallpapers (`cosmic-bg`):** Set a separate background per display. Slideshows and color fills also work.

### Window Management and Tiles

- **Auto-tile:** Turn automatic tiles on or off for each new workspace.
- **Active window hint:** Set the border color and the border thickness of the focused window.
- **Window gaps:** Set the inner gaps between tiles, and the outer gaps at the screen border.
- **Focus follows mouse:** Focus a window when the pointer moves over it.
- **Per-application rules:** Make an application, such as a calculator or a media player, always float.

### Keyboard and Custom Shortcuts

- **Shortcut editor:** Go to **Settings** → **Keyboard** → **Shortcuts** to see every system shortcut.
- **Custom shortcuts:** Select **Add Custom Shortcut** to bind a key combination to a command or an application.

### Displays and Fractional Scale

- **Display arrangement:** Drag the displays to match how they sit on your desk.
- **Scale:** COSMIC supports fractional scale factors such as 100%, 125%, 150%, 175%, and 200%.
- **Refresh rate and VRR:** Set the variable refresh rate (Adaptive Sync) for each monitor.

---

## Workspaces and Tile Workflows

COSMIC gives you a hybrid tile manager.

### Tile Mode

Turn automatic tiles on with `Super + Y`. Each new window then splits the active tile.

- **Horizontal and vertical splits:** Windows divide the screen in equal parts.
- **Window groups (tabs):** Press `Super + G` to put several windows in one tabbed container. Move between the tabs with `Super + Left` and `Super + Right`.
- **Reorder:** Press `Super + Shift + Arrow`, or drag the title bar of a window to a new place in the tile tree.

### Float Mode

With automatic tiles off, windows float as they do on a conventional desktop. You can still snap a window to a screen edge, or maximize it with `Super + M`.

---

## Application Ecosystem

COSMIC includes a set of native Rust applications, built with `libcosmic`:

| Application | Command | Description |
| --- | --- | --- |
| **COSMIC Files** | `cosmic-files` | Fast, tabbed file manager with search and file previews |
| **COSMIC Terminal** | `cosmic-term` | GPU-accelerated terminal emulator with custom palettes and profiles |
| **COSMIC Text Editor** | `cosmic-edit` | Lightweight code and text editor with syntax highlight |
| **COSMIC App Store** | `cosmic-store` | Graphical front end for Flathub applications and updates |
| **COSMIC Screenshot** | `cosmic-screenshot` | Interactive screenshot and screen recorder tool |

### Install More Software

TunaOS ships **Flatpak** (with Flathub) and **Homebrew**:

```bash
# Graphical applications via Flatpak
flatpak install flathub org.mozilla.firefox
flatpak install flathub com.visualstudio.code
flatpak install flathub com.spotify.Client

# Command-line tools via Homebrew
brew install neovim starship ripgrep fzf
```

---

## System Updates and Rollbacks

TunaOS updates the base operating system atomically with `bootc`:

```bash
# Check for and stage image updates in the background
sudo bootc upgrade

# Apply the update and reboot
sudo systemctl reboot
```

If an update causes a problem, go back to the previous deployment:

```bash
# Roll back to the previous deployment
sudo bootc rollback
sudo systemctl reboot
```

---

## Troubleshooting

### Wayland Screen Share and Portals

COSMIC shares your screen with browsers, Discord, and OBS Studio through `xdg-desktop-portal-cosmic`.

- Check that `xdg-desktop-portal-cosmic` and `xdg-desktop-portal` run in your user session:
  ```bash
  systemctl --user status xdg-desktop-portal-cosmic
  ```
- Check that `XDG_CURRENT_DESKTOP=COSMIC` is set.

### Restart a Desktop Component

To restart one component on its own:

```bash
# Restart the COSMIC panel
systemctl --user restart cosmic-panel

# Inspect the user session log
journalctl --user -u cosmic-session -b
```

### Display or Graphics Problems

- On an NVIDIA GPU, use the `-nvidia` image tag, such as `ghcr.io/tuna-os/yellowfin:cosmic-nvidia`.
- Check that the GPU driver is in use with `lspci -k | grep -A 2 -E "VGA|3D"`.

---

## Upstream Documentation and Resources

- [System76 COSMIC Desktop](https://system76.com/cosmic) — the official project page
- [COSMIC Epoch repository](https://github.com/pop-os/cosmic-epoch) — source code and issue tracker
- [COSMIC Applets repository](https://github.com/pop-os/cosmic-applets) — official and community applets
- [COSMIC desktop overview](./tunaos/cosmic-desktop.md) — an overview of COSMIC on TunaOS
- [Desktop environment comparison](./desktop-comparison.md) — how the TunaOS desktops compare
- [Manage images with bootc](./tunaos/bootc-usage.md) — the full bootc guide for TunaOS
