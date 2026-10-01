---
sidebar_position: 3
title: "getting started"
---

Compass is a keyboard launcher for the Linux desktop. Open it with a key, type a few letters, and
press Enter to start an application, run a command, or search your clipboard history, files and
more.

## Install

Compass is published in the TunaOS Flatpak remote. Its runtime comes from Flathub, so add both:

```sh
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.compass
```

The AppImage, the Arch package (`compass-git`), the Nix flake and building from source are
described in the [README](https://github.com/tuna-os/compass#install).

## First run

Open **Compass** from your application grid. The first time, a short setup walks you through the
theme, the keyboard shortcut and a few recommended extensions. You can change all of them later.

Compass then keeps running in the background. Press Escape to hide the launcher, and your
keyboard shortcut to bring it back.

The examples on this page use the `compass` command. From the Flatpak, run it as
`flatpak run org.tunaos.compass`, for example `flatpak run org.tunaos.compass toggle`.

## Start Compass when you log in

Opening Compass from the application grid starts it for the rest of the session. To start it at
login instead, enable its systemd user unit:

```sh
systemctl --user enable --now compass
```

The unit starts with `graphical-session.target` and needs `WAYLAND_DISPLAY` in the systemd user
environment. GNOME and KDE Plasma provide both. Plain Sway does neither by default, so either
start Sway through [uwsm](https://github.com/Vladimir-csp/uwsm) or
[sway-systemd](https://github.com/alebastr/sway-systemd), or add these lines to the end of
`~/.config/sway/config`:

```text
exec systemctl --user import-environment WAYLAND_DISPLAY SWAYSOCK XDG_CURRENT_DESKTOP
exec systemctl --user start sway-session.target
```

with a `~/.config/systemd/user/sway-session.target` that binds to the graphical session:

```ini
[Unit]
Description=Sway session
BindsTo=graphical-session.target
Wants=graphical-session-pre.target
After=graphical-session-pre.target
```

Hyprland and niri sessions started through their own systemd integration (or uwsm) already
provide the target and the environment. Without systemd, run `compass start --hidden` from your
compositor's autostart instead, for example `exec compass start --hidden` in Sway.

## Set a keyboard shortcut

The launcher opens with `compass toggle`, which shows it or hides it. Compass has to be running
for this to work: open it once from the application grid, or run `compass start --hidden` when you
log in.

Compass asks for <kbd>Super</kbd>+<kbd>Space</kbd> by default. To change it, run **Open Settings**
and set **Launcher hotkey** under General, or set `launcher.hotkey` in the configuration file.

### GNOME

On GNOME 48 and later, Compass asks for the shortcut through the desktop's GlobalShortcuts portal
when it starts. GNOME shows a dialog that names the shortcut "Open the Compass launcher". Accept
it, and the key opens Compass from then on.

If you declined the dialog, or you prefer a different key, add a custom shortcut instead:

1. Open **Settings**, then **Keyboard**, then **View and Customize Shortcuts**.
2. Choose **Custom Shortcuts** and add one.
3. Set the command to `compass toggle` (or `flatpak run org.tunaos.compass toggle`) and pick a
   key.

### KDE Plasma

Plasma provides the same GlobalShortcuts portal, so Compass asks for the shortcut when it starts.
To use another key, open **System Settings**, then **Keyboard**, then **Shortcuts**, add a new
command shortcut, and set its command to `compass toggle`.

### Sway, Hyprland and niri

Bind the key in your compositor's configuration file.

Sway, in `~/.config/sway/config`:

```text
bindsym $mod+space exec compass toggle
```

Hyprland, in `~/.config/hypr/hyprland.conf`:

```text
bind = SUPER, SPACE, exec, compass toggle
```

niri, in the `binds` section of `~/.config/niri/config.kdl`:

```kdl
Mod+Space { spawn "compass" "toggle"; }
```

With the Flatpak, the command is `flatpak run org.tunaos.compass toggle`:

```text
bindsym $mod+space exec flatpak run org.tunaos.compass toggle
bind = SUPER, SPACE, exec, flatpak run org.tunaos.compass toggle
Mod+Space { spawn "flatpak" "run" "org.tunaos.compass" "toggle"; }
```

Reload the compositor's configuration after you edit it. On these compositors the
**Launcher hotkey** setting has no effect, because the compositor, not Compass, owns the key.

### Other desktops

Compass binds the key itself where the compositor offers a hotkey protocol (`xx-hotkey-v1`) or
the GlobalShortcuts portal. Anywhere else, bind a key to `compass toggle` in your desktop's
keyboard settings.

`compass doctor` says which of these mechanisms your session has.

## Extensions

Extensions add commands to Compass. Open the launcher and search for **Extension Store** to browse
community extensions, or **Raycast Store** to install Raycast extensions. Each Raycast extension
shows how well it works on Linux. Installed extensions show up in the launcher's search right away.

Compass runs extensions written for Vicinae unchanged. To write your own, see the
[Vicinae extension documentation](https://docs.vicinae.com/extensions/introduction).

## Configuration

Settings are stored in `~/.config/compass/compass.json`. The Flatpak keeps its own copy in
`~/.var/app/org.tunaos.compass/config/compass/compass.json`. Most settings can be changed with the
**Open Settings** command, and the file has a
[JSON Schema](https://github.com/tuna-os/compass/blob/main/packaging/schema/compass.schema.json)
that editors can use for completion and to flag misspelled keys.

Changes to the file apply as soon as it is saved, whether you edit it by hand or run a command such
as `compass theme set dracula`. A key Compass does not know, or a value of the wrong type, does not
stop the rest of the file from loading: Compass uses the default for that setting and says what is
wrong in its log, in `compass doctor` and at the bottom of the settings view.

If you used Vicinae before, Compass moves its settings over on first start.

## Themes

Choose a theme in **Settings › Appearance**, or with `compass theme list` and
`compass theme set <name>`. To make your own, start from the template:

```sh
compass theme paths          # the folders Compass reads themes from
mkdir -p ~/.local/share/compass/themes
compass theme template > ~/.local/share/compass/themes/my-theme.toml
compass theme check ~/.local/share/compass/themes/my-theme.toml
compass theme set my-theme
```

Compass reads theme files in the same format as Vicinae, so a Vicinae theme works as it is.

## Privacy

Compass sends no telemetry. On its own, it makes two kinds of request:

- It asks Compass's GitHub releases whether a newer version is out, at most every six hours. Turn
  this off with **Check for updates** in Settings, or `launcher.check_for_updates` in the
  configuration file.
- For the calculator's currency conversions, it downloads the European Central Bank's daily
  exchange rates from `www.ecb.europa.eu`, once a day while it runs. To stop this, set
  `COMPASS_DISABLE_AUTO_RATE_REFRESH=1` in Compass's environment; currency conversions then use
  the last rates downloaded, if any.

Everything else happens only when you ask for it, such as browsing the Vicinae Store or the
Raycast Store and installing an extension. What an installed extension does is up to it.

## Troubleshooting

`compass doctor` checks what works on your machine and explains what is missing, such as the
GlobalShortcuts portal or the GNOME Shell helper extension:

```sh
compass doctor
compass doctor --check-only
```

`--check-only` prints only the problems. When you
[report a bug](https://github.com/tuna-os/compass/issues/new), include the full `compass doctor`
output, your distribution and desktop, and how you installed Compass.
