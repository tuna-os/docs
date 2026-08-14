---
sidebar_position: 7
title: "Niri quick-start"
---

# Niri quick-start on Bonito

[Niri](https://niri-wm.github.io/niri/) is a scrollable-tiling Wayland
compositor. Instead of arranging windows in a fixed grid, it keeps columns in
a horizontal strip: opening a window adds a column and moving focus scrolls
along that strip. This makes keyboard-driven workflows fast, while still
letting you float a window when tiling is not useful.

[Bonito](bonito) is TunaOS's Fedora-based variant. Its Niri flavor is the
`ghcr.io/tuna-os/bonito:niri` image. Bonito is a beta, fast-moving platform, so
expect Niri and its companion tools to evolve more quickly than a stable
desktop image.

## Get into a Niri session

Start with the [Bonito page](bonito) and the [TunaOS download
page](https://tunaos.org/download). If a Bonito Niri live ISO is listed, use it
for a new installation. If the download page has a Bonito ISO but not a Niri
ISO, install Bonito first and switch the installed system to the Niri image:

```bash
sudo bootc switch ghcr.io/tuna-os/bonito:niri
sudo systemctl reboot
```

At the login screen, choose the **Niri** session if more than one session is
available. The first login may show a short setup delay while the session and
its desktop helpers start. Press `Mod+Shift+/` to display Niri's built-in hotkey
overlay. On a normal hardware session, `Mod` means the **Super/Windows** key;
when testing Niri nested inside another compositor, it means **Alt**.

## The mental model

Niri has columns and workspaces rather than the familiar “one window fills a
desktop” model:

- A column can contain one or more windows. New windows usually become a new
  column beside the focused one.
- Focus moves left and right between columns and up and down within a column.
- Workspaces are dynamic. An empty workspace is kept at the end, and more are
  created as needed; there is no need to pre-create a fixed number.
- A window can be moved between columns, sent to another workspace, floated,
  fullscreened, or temporarily shown as a tabbed column.

For the first few minutes, open a terminal, launcher, and browser, then use
the arrows or `H`/`J`/`K`/`L` to move focus. The overview (`Mod+O`) is a useful
mouse-friendly map of all workspaces when the layout becomes unfamiliar.

## Essential keybindings

These are the important bindings from Niri's default configuration. TunaOS may
adjust the programs launched by the terminal and launcher bindings; the
hotkey overlay (`Mod+Shift+/`) is the authoritative list for the installed
image.

| Keys | Action |
| --- | --- |
| `Mod+Shift+/` | Show the hotkey overlay |
| `Mod+T` | Open a terminal |
| `Mod+D` | Open the application launcher |
| `Mod+O` | Toggle the workspace overview |
| `Mod+Q` | Close the focused window |
| `Mod+H` / `Mod+Left` | Focus the column to the left |
| `Mod+L` / `Mod+Right` | Focus the column to the right |
| `Mod+J` / `Mod+Down` | Focus the window below |
| `Mod+K` / `Mod+Up` | Focus the window above |
| `Mod+Ctrl+H/J/K/L` | Move the focused column or window |
| `Mod+U` / `Mod+Page Down` | Focus the next workspace |
| `Mod+I` / `Mod+Page Up` | Focus the previous workspace |
| `Mod+1` … `Mod+9` | Focus workspace 1 through 9 |
| `Mod+Ctrl+1` … `Mod+Ctrl+9` | Move the focused column to a workspace |
| `Mod+F` | Maximize the focused column |
| `Mod+Shift+F` | Fullscreen the focused window |
| `Mod+V` | Toggle floating for the focused window |
| `Mod+W` | Toggle tabbed display for the focused column |
| `Mod+Minus` / `Mod+Equal` | Make the column narrower or wider |
| `Print` | Take a screenshot |

The exact action names and all available bindings are maintained upstream in
Niri's [default configuration](https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl)
and [key-bindings documentation](https://github.com/YaLTeR/niri/wiki/Configuration%3A-Key-Bindings).

## Customize the configuration

Niri reads your user configuration from:

```text
~/.config/niri/config.kdl
```

If it does not exist, begin with the default configuration supplied by your
image rather than writing a complete file from scratch. Niri's configuration
is KDL, and most changes apply when you save the file. You can validate a file
before loading it:

```bash
niri validate
```

If your build supports it, reload a changed file without logging out:

```bash
niri msg action load-config-file --path "$HOME/.config/niri/config.kdl"
```

Keep a backup before making several changes:

```bash
cp ~/.config/niri/config.kdl ~/.config/niri/config.kdl.backup
```

### Launchers and terminals

The default config includes `Mod+T` for a terminal and `Mod+D` for an
application launcher. Change the command in the `binds` section to a program
installed on your system. For example:

```kdl
binds {
    Mod+T { spawn "foot"; }
    Mod+D { spawn "fuzzel"; }
}
```

Keep the rest of the default `binds` block when replacing it: unlike most
sections, an empty `binds {}` does not inherit Niri's default keybindings.

### Gaps and borders

Adjust the space between columns in the `layout` section:

```kdl
layout {
    gaps 8
}
```

The default configuration also contains `border` and `focus-ring` sections
for changing border width and colors. Copy those sections from the default
config and change only the values you need.

### Wallpaper

Niri does not require a wallpaper program. Add one to the session startup or
run it from a terminal. For example, with `swaybg` installed:

```kdl
spawn-at-startup "swaybg" "-i" "/home/you/Pictures/wallpaper.jpg" "-m" "fill"
```

For a wallpaper that changes over time, use a Wayland-compatible tool such as
`swww` and start its daemon before setting the image. Niri's
[upstream configuration guide](https://niri-wm.github.io/niri/Configuration:-Introduction)
has the current syntax for startup commands and output-specific settings.

## Install applications

Use Flatpak for graphical applications. TunaOS enables Flathub by default;
you can install an app from the terminal or use a graphical software center:

```bash
flatpak search browser
flatpak install flathub org.mozilla.firefox
flatpak run org.mozilla.firefox
```

Use [Homebrew](tunaos/homebrew.md) for command-line tools, fonts, and other
developer utilities. Homebrew is included in TunaOS:

```bash
brew install fuzzel swaybg wev
```

`wev` is useful when configuring unusual keyboard layouts because it reports
the XKB name of a key. Applications that do not provide a native Wayland
portal may use Xwayland; Niri integrates with `xwayland-satellite` for those
applications when it is available in the image.

## Updates and rollback

Niri is part of the Bonito bootc image, not a package set you should update by
manually replacing files in the system image. Check and stage updates with
bootc, then reboot into the new deployment:

```bash
bootc status
sudo bootc upgrade
sudo systemctl reboot
```

Your user config in `~/.config/niri/` remains in your home directory across
image updates. If a new image causes a problem, use the previous deployment:

```bash
sudo bootc rollback
sudo systemctl reboot
```

Read [Managing TunaOS with Bootc](tunaos/bootc-usage.md) for variant switching,
layering, automatic updates, and more rollback detail.

## Troubleshooting

### The display is too small or blurry

Niri uses Wayland logical coordinates and supports fractional scaling. Inspect
the output name with:

```bash
niri msg outputs
```

Then add an `output` block to your config, using the exact output name:

```kdl
output "eDP-1" {
    scale 1.5
}
```

If a display does not appear, check the cable and the output name first. For
GPU-specific problems, compare the regular Bonito Niri image with the
`nvidia` flavor and see the [TunaOS troubleshooting guide](tunaos/troubleshooting.md).

### Screen recording or screen sharing does not work

Wayland screen capture is mediated by PipeWire and the desktop portal. Install
or update the app through Flatpak when possible, and allow its screen-capture
request when the portal asks. If an application offers both X11 and Wayland
backends, prefer its native Wayland backend. Check the portal services with:

```bash
systemctl --user --type=service | grep -E 'pipewire|wireplumber|xdg-desktop-portal'
```

The [Niri screencasting documentation](https://niri-wm.github.io/niri/Screencasting)
lists compositor-specific requirements and current limitations.

### A keybinding or app does not behave as expected

Press `Mod+Shift+/` to confirm the installed binding, then validate the config:

```bash
niri validate
journalctl --user -b | grep -i niri
```

Remember that `Mod` is Super in a normal session but Alt when Niri is nested in
another compositor. If a legacy X11 application is broken, look for an update
or enable its Wayland mode; Xwayland is a compatibility layer, not a complete
replacement for native Wayland behavior.

For compositor bugs or missing features, check the [Niri issue
tracker](https://github.com/YaLTeR/niri/issues) and include the Niri version,
GPU, outputs, and relevant journal entries when reporting a problem.
