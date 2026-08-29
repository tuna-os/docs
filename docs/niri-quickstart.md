---
sidebar_position: 11
sidebar_label: "Niri quick-start"
title: "Niri window-manager quick-start"
description: "A quick-start guide to the Niri scrollable-tiling Wayland window manager on TunaOS."
---

# ⚡ Niri Window Manager Quick-Start

[Niri](https://github.com/YaLTeR/niri) is a modern, scrollable-tiling Wayland compositor written in Rust. It puts your windows on a single ribbon that runs sideways without end, not in fixed grid tiles and not in a stack that overlaps.

TunaOS ships Niri on several bases. These are **[Bonito](/bonito)** (Fedora 44), **[Yellowfin](/yellowfin)** (AlmaLinux Kitten 10), **[Albacore](/albacore)** (AlmaLinux 10), **[Skipjack](/skipjack)** (CentOS Stream 10), **[Marlin](/marlin)** (Arch Linux), and **[Grouper](/grouper)** (Ubuntu 26.04).

:::tip[Visual overview]
To explore the Fedora 44 base variant that ships Niri, see the **[Bonito overview →](/bonito)** page.
:::

---

## What is Niri?

Niri is a keyboard-focused tiling compositor, built for Wayland from the start. It is not like a conventional desktop or a conventional window manager. It uses a **scrollable tiling** model:

- **Traditional Desktop Environments (GNOME, KDE Plasma, XFCE):** Windows float freely and overlap on a two-dimensional desktop plane. To find a window, you often drag it, or you minimize another one, or you step through `Alt+Tab`.
- **Traditional Tiling Window Managers (i3, Sway, Hyprland):** These split the screen into rigid areas, or into a BSP grid. Each new window makes the other windows smaller, until the text is too cramped to read.
- **Niri's Scrollable Tiling (The Infinite Ribbon):** Niri puts your windows into vertical columns on an endless horizontal ribbon. A new window or column does not shrink the windows you already have. The view slides along the ribbon when you move between windows.

```
       ┌───────────┐ ┌───────────────────┐ ┌───────────┐
... ── │ Window A  │ │    Window B       │ │ Window D  │ ── ...
       │           │ ├───────────────────┤ │           │
       │           │ │    Window C       │ │           │
       └───────────┘ └───────────────────┘ └───────────┘
         Column 1           Column 2          Column 3
               <─────── Horizontal Ribbon ───────>
```

---

## Getting Started

### Available Images

You can pull or switch to any of the TunaOS Niri images:

```bash
# Bonito (Fedora 44)
ghcr.io/tuna-os/bonito:niri

# Yellowfin (AlmaLinux Kitten 10)
ghcr.io/tuna-os/yellowfin:niri

# Albacore (AlmaLinux 10)
ghcr.io/tuna-os/albacore:niri

# Skipjack (CentOS Stream 10)
ghcr.io/tuna-os/skipjack:niri

# Marlin (Arch Linux)
ghcr.io/tuna-os/marlin:niri

# Grouper (Ubuntu 26.04)
ghcr.io/tuna-os/grouper:niri
```

### Switching to Niri with bootc

From an existing TunaOS installation, switch to the Niri flavor with `bootc switch`:

```bash
# Switch to Bonito Niri
sudo bootc switch ghcr.io/tuna-os/bonito:niri
sudo systemctl reboot
```

Or choose the **Niri** option in the desktop picker when you install from the live ISO.

---

## Default Keyboard Shortcuts

In Niri, almost all actions use the **Mod** key (the `Super` / `Windows` key, or `Command` on macOS keyboards).

### Navigation & Focus

| Shortcut | Action |
| --- | --- |
| `Mod` + `Left` / `Right` (or `Mod` + `H` / `L`) | Focus the previous or next column on the ribbon |
| `Mod` + `Up` / `Down` (or `Mod` + `K` / `J`) | Focus the window above or below in the current column |
| `Mod` + `Home` / `End` | Focus the first or last column on the ribbon |
| `Mod` + `Shift` + `Left` / `Right` (or `Mod` + `Shift` + `H` / `L`) | Move the current column left or right |
| `Mod` + `Shift` + `Up` / `Down` (or `Mod` + `Shift` + `K` / `J`) | Move the active window up or down within its column |
| `Mod` + `MouseWheelDown` / `MouseWheelUp` | Scroll the horizontal ribbon |

### Workspaces

Niri stacks the workspaces from top to bottom.

| Shortcut | Action |
| --- | --- |
| `Mod` + `Page_Down` / `Page_Up` | Switch to the workspace below or above |
| `Mod` + `1` … `9` | Switch directly to workspace 1 through 9 |
| `Mod` + `Shift` + `Page_Down` / `Page_Up` | Move the active column to the workspace below or above |
| `Mod` + `Shift` + `1` … `9` | Move the active column to workspace 1 through 9 |

### Window Management & Sizing

| Shortcut | Action |
| --- | --- |
| `Mod` + `R` | Cycle through preset column widths |
| `Mod` + `Minus` (`-`) / `Mod` + `Equal` (`=`) | Decrease or increase the active column width |
| `Mod` + `Shift` + `Minus` / `Mod` + `Shift` + `Equal` | Decrease or increase the active window height |
| `Mod` + `F` | Maximize column width |
| `Mod` + `Shift` + `F` | Fullscreen the active window |
| `Mod` + `C` | Center the focused column on screen |
| `Mod` + `W` | Toggle tabbed column display |
| `Mod` + `Q` or `Mod` + `Shift` + `Q` | Close the active window |

### Applications & Session

| Shortcut | Action |
| --- | --- |
| `Mod` + `Return` or `Mod` + `T` | Open a terminal |
| `Mod` + `Space` or `Mod` + `D` | Open the application launcher (`fuzzel` / `rofi`) |
| `Mod` + `Shift` + `E` | Quit the Niri session |
| `Mod` + `Shift` + `/` | Show keyboard shortcuts help overlay |

---

## Configuration (`config.kdl`)

Niri uses the [KDL schema language](https://kdl.dev/) for configuration. The KDL format is node-based, readable, and structured.

### Configuration Path

Niri looks for configuration in your user home directory:

```
~/.config/niri/config.kdl
```

If the file does not exist yet, create the directory and copy the system default template:

```bash
mkdir -p ~/.config/niri
cp /etc/niri/config.kdl ~/.config/niri/config.kdl
```

### Validating and Reloading

To check your configuration for syntax errors without a restart:

```bash
niri --validate
```

Niri reloads the configuration each time you save `~/.config/niri/config.kdl`. You can also ask for a reload:

```bash
niri msg action reload-config
```

---

## Common Customizations

### 1. Application Launcher and Terminal

Bind your preferred launcher (`fuzzel`, `rofi-wayland`, `walker`) and terminal (`ptyxis`, `foot`, `alacritty`, `kitty`) in the `binds` section:

```kdl
binds {
    Mod+Return { spawn "ptyxis"; }
    Mod+Space  { spawn "fuzzel"; }
    Mod+D      { spawn "fuzzel"; }
}
```

### 2. Gaps and Layout Geometry

Adjust outer and inner window gaps, default column proportions, and focus ring borders in the `layout` block:

```kdl
layout {
    // Gap size between windows in pixels
    gaps 16

    // Preset column widths cycled with Mod+R
    preset-column-widths {
        proportion 0.33333
        proportion 0.5
        proportion 0.66667
        proportion 1.0
    }

    // Default width for newly opened columns
    default-column-width { proportion 0.5; }

    // Focus indicator ring around the active window
    focus-ring {
        width 2
        active-color "#7fc8ff"
        inactive-color "#505050"
    }
}
```

### 3. Wallpaper and Startup Applications

Use `spawn-at-startup` nodes to run background services, wallpaper daemons, and status bars when Niri starts:

```kdl
// Set desktop wallpaper with swaybg or wbg
spawn-at-startup "swaybg" "-m" "fill" "-i" "/usr/share/backgrounds/tunaos/default.png"

// Start status bar
spawn-at-startup "waybar"

// Start notification daemon
spawn-at-startup "mako"
```

### 4. Window Rules (Floating Windows and Sizing)

Write a rule that matches an application ID. The rule can float the window, or give it a size:

```kdl
window-rule {
    match app-id="org.gnome.Calculator"
    open-floating true
}

window-rule {
    match app-id="pavucontrol"
    open-floating true
    default-column-width { fixed 650; }
}

window-rule {
    match app-id="org.mozilla.firefox"
    default-column-width { proportion 0.66667; }
}
```

---

## Managing Applications & System Updates

### Installing Graphical Applications (Flatpak)

TunaOS enables [Flathub](https://flathub.org/) by default. Install graphical apps via `flatpak`:

```bash
# Install Firefox
flatpak install flathub org.mozilla.firefox

# Install VS Code
flatpak install flathub com.visualstudio.code
```

Flatpak writes its desktop entries to `/var/lib/flatpak/exports/share/applications` and to `~/.local/share/flatpak/exports/share/applications`. A launcher such as `fuzzel` or `rofi` finds them through `XDG_DATA_DIRS`.

### Installing CLI Tools (Homebrew)

All TunaOS variants include [Homebrew](https://brew.sh/) for command-line developer tools:

```bash
brew install neovim ripgrep starship fzf
```

Homebrew binaries are located in the user path (`/var/home/linuxbrew/.linuxbrew/bin`) and are available immediately in all terminal shells.

### System Updates with bootc

TunaOS uses [bootc](https://github.com/bootc-dev/bootc) for atomic, transactional operating system management:

```bash
# Check for and stage image updates
sudo bootc upgrade

# Apply updates and reboot into the new image
sudo systemctl reboot
```

:::info[Safe background staging]
`bootc` stages an update into a separate root deployment in the background. It does not touch the libraries in use, and your Niri session continues. You reboot only when you are ready.
:::

If an update causes an issue, rollback to the previous deployment at any time:

```bash
sudo bootc rollback
sudo systemctl reboot
```

---

## Troubleshooting

### Displays and HiDPI Output Scaling

To list the monitors that are connected:

```bash
niri msg outputs
```

Set the resolution, the refresh rate, and the scale factor in `~/.config/niri/config.kdl`:

```kdl
output "eDP-1" {
    mode "2880x1800@120.000"
    scale 1.5
    position x=0 y=0
}

output "DP-1" {
    mode "3840x2160@60.000"
    scale 2.0
    position x=2880 y=0
}
```

### Screen Sharing and Portals

Niri uses PipeWire and `xdg-desktop-portal` to share your screen with OBS Studio, Discord, or a web browser:

- Ensure `xdg-desktop-portal-gnome` or `xdg-desktop-portal-gtk` and `xdg-desktop-portal` are active.
- Verify that `XDG_CURRENT_DESKTOP=niri` is present in your session environment.

To record the screen from the command line, use `wl-screenrec`:

```bash
wl-screenrec -f output.mp4
```

### X11 Application Support (XWayland)

TunaOS builds include XWayland support. If an X11 app does not scale correctly, verify the `xwayland` configuration block in `config.kdl`:

```kdl
xwayland {
    // Enabled by default on TunaOS
}
```

### Inspecting Running State

Query active windows, workspaces, and compositor outputs:

```bash
# View list of open windows
niri msg windows

# View active outputs
niri msg outputs

# View active workspaces
niri msg workspaces
```

---

## Upstream Documentation & Resources

- [YaLTeR/niri GitHub Repository](https://github.com/YaLTeR/niri) — Official source code and issue tracker
- [Niri Official Wiki](https://github.com/YaLTeR/niri/wiki) — Full upstream documentation and tutorials
- [Niri Configuration Reference](https://github.com/YaLTeR/niri/wiki/Configuration:-Overview) — Full reference for the KDL nodes
- [Bonito Variant Guide](/docs/bonito) — Fedora 44 base variant documentation
- [Desktop Environment Comparison](/docs/desktop-comparison) — Comparison of desktop workflows on TunaOS
- [Manage images with bootc](/docs/tunaos/bootc-usage) — Full guide to bootc on TunaOS
