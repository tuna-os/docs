# Tiling Wayland Compositor (Niri) & Customization Guide

TunaOS provides Linux desktop customizers and power users with an immutable container-native baseline paired with scrollable-tiling Wayland compositors like **Niri**.

## Key Advantages for Power Users

1. **Immutable Compositor Baseline**: System libraries and Wayland display protocols remain locked in read-only `/usr`, ensuring graphics driver updates never break display servers.
2. **User Dotfile Isolation**: Custom keybindings, status bars (Waybar), and application styles reside strictly in `~/.config`, completely decoupled from base OS image updates.
3. **Scrollable-Tiling Architecture**: Niri provides an intuitive horizontal infinite layout combining keyboard-driven tiling with modern smooth animations.

## Niri Setup Quick-Start

### 1. Configuration & Keybindings
Edit your user Niri configuration at `~/.config/niri/config.kdl`:
```kdl
// Example Niri keybindings snippet
binds {
    Mod+Return { spawn "alacritty"; }
    Mod+D { spawn "fuzzel"; }
    Mod+Q { close-window; }
}
```

### 2. Bar & Notification Accessories (Flatpak / Homebrew)
Install modern Wayland status bars and notification daemons without host package conflicts:
```bash
brew install waybar fuzzel swaync
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
