---
sidebar_position: 9
title: "COSMIC Desktop"
---

# 🌌 COSMIC Desktop on TunaOS

[COSMIC](https://system76.com/cosmic) is a modern, Rust-based desktop environment by **System76** — the team behind Pop!_OS. Built from the ground up in Rust with the [iced](https://github.com/iced-rs/iced) GUI toolkit, COSMIC offers a fresh, performant desktop experience on Enterprise Linux.

TunaOS ships COSMIC on all base OS variants.

## Available Images

Pull any of these COSMIC variants:

```bash
# Yellowfin (AlmaLinux Kitten 10)
ghcr.io/tuna-os/yellowfin:cosmic
ghcr.io/tuna-os/yellowfin:cosmic-hwe
ghcr.io/tuna-os/yellowfin:cosmic-gdx

# Albacore (AlmaLinux 10)
ghcr.io/tuna-os/albacore:cosmic
ghcr.io/tuna-os/albacore:cosmic-hwe

# Skipjack (CentOS Stream 10)
ghcr.io/tuna-os/skipjack:cosmic

# Bonito (Fedora)
ghcr.io/tuna-os/bonito:cosmic
```

## Quick Start

Switch to a COSMIC variant:

```bash
# From an existing TunaOS installation
sudo bootc switch ghcr.io/tuna-os/yellowfin:cosmic
sudo systemctl reboot
```

Or install fresh from the ISO — select "COSMIC Desktop" from the desktop picker.

## What Makes COSMIC Special

- **🦀 Built in Rust** — memory-safe, fast, and modern. One of the first full desktop environments written in Rust.
- **🎨 Tiling + Floating** — hybrid window management. Press `Super+Enter` for a terminal in tiling mode, or drag windows freely.
- **⚡ Performant** — lightweight and responsive, even on older hardware.
- **🔧 Highly Configurable** — panel, dock, workspaces, and keybindings are all customizable through a settings app.
- **🌙 Built-in Dark Mode** — system-wide dark/light theme toggle.
- **🧩 Extensible** — applets and extensions via the COSMIC applet system.

## First Look

When you first boot COSMIC:

1. **Welcome dialog** — choose your layout (tiling vs floating default)
2. **Workspaces** — dynamic workspaces on the left. Press `Super+PageUp/Down` to switch.
3. **Panel** — top bar with app menu, system tray, and clock. Left side: workspaces. Right side: system indicators.
4. **Dock** — bottom dock with favorite apps. Auto-hides in tiling mode.
5. **App Launcher** — press `Super+Space` to open the launcher. Type to search.

## Customization

### Appearance

```bash
# Open Settings → Appearance
# Change theme: Dark, Light, or System
# Adjust accent color
# Toggle transparency effects
```

### Keybindings

| Shortcut | Action |
|---|---|
| `Super+Enter` | Open terminal |
| `Super+Space` | App launcher |
| `Super+D` | Show desktop |
| `Super+Left/Right` | Tile window |
| `Super+Shift+Left/Right` | Move window to workspace |
| `Super+PageUp/Down` | Switch workspace |
| `Super+Q` | Close window |
| `Super+F` | Fullscreen |

### COSMIC Settings

The COSMIC Settings app (pre-installed) provides deep customization:

- **Desktop** — wallpaper, dock behavior, hot corner
- **Panel** — position, clock format, applets
- **Window Management** — tiling gaps, focus follows mouse, minimize/maximize
- **Input** — keyboard shortcuts, mouse/touchpad, gestures
- **Notifications** — do not disturb, per-app notification settings

## Software

COSMIC runs standard GTK and Qt apps alongside native COSMIC apps. Install software normally:

```bash
# Flatpak (pre-enabled)
flatpak install flathub org.mozilla.firefox

# Homebrew (pre-installed)
brew install neovim

# COSMIC native apps will appear in the app launcher automatically
```

## Tiling vs Floating

COSMIC's hybrid approach lets you use both modes:

- **Tiling mode** — windows auto-tile. Press `Super+Enter` to open a terminal in a new tile.
- **Floating mode** — windows behave traditionally. Drag and resize freely.
- **Mixed** — some windows float (dialogs), others tile. Configure per-app in Settings.

Toggle between modes from the panel or with `Super+Y`.

## Troubleshooting

| Problem | Fix |
|---|---|
| COSMIC doesn't start | Ensure GPU drivers are loaded: `lspci -k \| grep -A 2 "VGA"` |
| Tiling not working | Check Settings → Window Management → Tiling is enabled |
| App launcher slow | This is normal on first launch. Subsequent launches are cached |
| Missing COSMIC applets | Run `cosmic-applets --version` to check; reinstall if needed |

## See Also

- [System76 COSMIC Website](https://system76.com/cosmic) — official project page
- [COSMIC GitHub](https://github.com/pop-os/cosmic-epoch) — source code
- [Managing with Bootc](bootc-usage.md) — switching variants and updates
- [GNOME Desktop](../installation.md) — TunaOS GNOME variant guide
