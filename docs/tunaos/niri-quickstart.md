---
sidebar_position: 4
sidebar_label: "Niri quick-start"
---

# Niri quick-start on Bonito

This guide is for the **Bonito Niri** image, TunaOS's Fedora-based experimental
variant. Niri is a Wayland compositor that uses **scrollable tiling**: windows
are arranged in columns across an effectively horizontal workspace. Opening a
window adds it to the focused column, and moving focus scrolls the layout into
view. This is different from GNOME or KDE, where windows normally overlap and
are moved or resized with the mouse.

Niri is keyboard-friendly, but you can still use the pointer, touchpad, and
normal Wayland applications. If you are new to tiling, keep the default config
for a day and use the hotkey overlay to learn the flow.

## Install or switch to Bonito Niri

The published image is:

```text
ghcr.io/tuna-os/bonito:niri
```

Install the Bonito Niri ISO from the [TunaOS downloads page](/download), or
switch an existing compatible bootc system with:

```bash
sudo bootc switch ghcr.io/tuna-os/bonito:niri
```

Reboot after switching and choose **Niri** at the login screen if more than one
session is installed. Bonito is experimental, so keep a known-good image
available if you are trying it on important hardware.

## First five minutes

On a normal login, `Mod` means the **Super/Windows** key. (When Niri is run
nested in another compositor, `Mod` means **Alt**.) The default configuration
opens a terminal with `Mod+T` and an application launcher with `Mod+D`.

The most useful default bindings are:

| Keys | Action |
| --- | --- |
| `Mod+Shift+/` | Show Niri's important-hotkeys overlay |
| `Mod+T` | Open a terminal (`alacritty`) |
| `Mod+D` | Open the launcher (`fuzzel`) |
| `Mod+Q` | Close the focused window |
| `Mod+H/J/K/L` | Focus left / down / up / right |
| `Mod+Ctrl+H/J/K/L` | Move the focused window or column |
| `Mod+U/I` | Focus the previous / next workspace |
| `Mod+Ctrl+U/I` | Move the column to the previous / next workspace |
| `Mod+1` … `Mod+9` | Focus workspace 1 … 9 |
| `Mod+Ctrl+1` … `Mod+Ctrl+9` | Move the column to workspace 1 … 9 |
| `Mod+R` | Cycle the column width presets |
| `Mod+F` | Maximize the focused column |
| `Mod+Shift+F` | Fullscreen the focused window |
| `Mod+O` | Toggle the overview |
| `Mod+Shift+E` | Quit Niri (confirm before using) |

The default config also binds `Mod+Left/Down/Up/Right` as alternatives to
`Mod+H/J/K/L`. `Mod+Ctrl` changes a focus action into a move action: this is
the key idea that makes it easy to grow and rearrange columns. For the complete
and version-specific list, open the overlay or compare your config with the
[upstream default configuration](https://github.com/niri-wm/niri/blob/main/resources/default-config.kdl).

## Customize the configuration

Niri's user configuration is:

```text
~/.config/niri/config.kdl
```

Start from the generated default instead of writing a file from scratch. Niri
live-reloads this file after you save it. Validate it before logging out:

```bash
niri validate
```

Here are a few small customizations. Add them to the matching section in
`config.kdl`; do not create duplicate `layout` or `binds` sections unless you
intend to replace the defaults.

### Change the launcher or terminal

Replace the command in the relevant bind. `spawn` takes the executable and
each argument separately:

```kdl
binds {
    Mod+D { spawn "wofi" "--show" "drun"; }
    Mod+T { spawn "foot"; }
}
```

Use an executable that is present in your image or in your user environment.
The stock config uses `fuzzel` and `alacritty` as examples.

### Adjust gaps and window widths

```kdl
layout {
    gaps 12
    default-column-width { proportion 0.5; }
}
```

The built-in `Mod+R` action cycles the preset widths. See the [layout
documentation](https://niri-wm.github.io/niri/Configuration:-Layout.html) for
more options.

### Set a wallpaper at login

Niri does not provide a wallpaper manager. Start one from the config if you
have installed one, for example:

```kdl
spawn-at-startup "swww-daemon"
spawn-at-startup "swww" "img" "~/Pictures/wallpaper.png"
```

Some wallpaper programs need a shell for expansion or pipelines; use
`spawn-sh-at-startup` for those commands. Keep startup programs lightweight so
the session stays responsive.

### Configure a high-DPI display

Find the output name and available modes from inside Niri:

```bash
niri msg outputs
```

Then add an output block. Fractional scales such as `1.5` are supported:

```kdl
output "eDP-1" {
    scale 1.5
}
```

Use the exact output name reported by `niri msg outputs`. Niri normally chooses
an appropriate scale automatically; an explicit value is useful when text is
too small or too large.

## Install applications

Bonito follows the TunaOS **Flatpak-first** model. Install graphical apps from
Flathub and launch them from `Mod+D`:

```bash
flatpak install flathub org.mozilla.firefox
flatpak run org.mozilla.firefox
```

Flatpak desktop files should appear in the launcher after installation. For
command-line tools and developer utilities, Bonito also includes Homebrew:

```bash
brew install jq ripgrep
```

Homebrew applications are user-managed and do not become part of the bootc
image. If a newly installed command is not found, start a new terminal or
check that Homebrew's environment setup is loaded.

## Updates and your Niri session

Niri, its system services, and the rest of the base OS are delivered together
in the bootc image. Check for an update and apply it with:

```bash
bootc status
sudo bootc upgrade
```

The new deployment becomes active after a reboot. Your home directory,
Flatpaks, Homebrew files, and `~/.config/niri/config.kdl` are separate from the
immutable deployment and should remain in place. If a new Niri version changes
a config option, compare your file with the [current default
config](https://github.com/niri-wm/niri/blob/main/resources/default-config.kdl),
run `niri validate`, and reboot into the previous deployment if necessary.

## Troubleshooting

### Niri will not start or the screen is black

Switch to another TTY with `Ctrl+Alt+F3`, log in, and inspect the session
output. Validate the config first; a KDL typo can prevent the compositor from
starting. For output and GPU problems, run `niri msg outputs` from a working
session and consult Niri's [getting-started troubleshooting
notes](https://niri-wm.github.io/niri/Getting-Started.html).

In a VM, enable 3D acceleration. On multi-GPU systems, the upstream guide's
DRM-device notes can help identify the right render device.

### A display has the wrong scale or position

Run `niri msg outputs`, copy the exact connector name into an `output` block,
and set `scale`, `mode`, or `position` explicitly. For configurations that
change when a monitor is connected, use [Kanshi as described in the Niri
FAQ](https://niri-wm.github.io/niri/FAQ.html).

### Screen sharing does not work

Portal-based recording needs a D-Bus session, PipeWire, and
`xdg-desktop-portal-gnome`; it also needs Niri to be started as a full session
through `niri-session` or a display manager. Restart the affected app after
fixing the session, then retry its screen-share dialog. See the upstream
[screencasting guide](https://niri-wm.github.io/niri/Screencasting.html) for
window capture, monitor capture, and privacy rules.

### A screen locker leaves a red screen

The red screen is Niri's locked-session background. Switch to a TTY and start a
locker on the Niri display, or add `allow-when-locked=true` to the locker bind
so it can be restarted while locked. The upstream [Niri
FAQ](https://niri-wm.github.io/niri/FAQ.html) has the recovery command and
other known issues.

## Keep learning

- [Niri documentation](https://niri-wm.github.io/niri/)
- [Niri getting started](https://niri-wm.github.io/niri/Getting-Started.html)
- [Configuration introduction](https://niri-wm.github.io/niri/Configuration:-Introduction.html)
- [Niri source and issue tracker](https://github.com/niri-wm/niri)
- [Bonito variant overview](/bonito)
