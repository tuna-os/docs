---
sidebar_position: 10
title: "winblues"
---

brussels-winblues is a variant of the brussels image. It has the same
operating system and the same XFCE session on xfwl4. The variant adds the
Chicago95 theme, which gives a look like the classic desktops of the 1990s.
The variant follows the example of the winblues project, specially blue95.
It is not a copy of winblues, and it does not use the winblues names or
logos.

Image: `ghcr.io/tuna-os/brussels-winblues`, with the same tags as the base
image (`latest`, `nightly`, `nightly-<date>`, `<commit>`, and `stable`).

## How the variant is built

1. `elements/winblues/chicago95.bst` builds the Chicago95 files from the
   upstream source tree. It uses a commit of the master branch. The last
   tag, v3.0.1, is from June 2022, and 164 later commits are not in it.
2. `elements/winblues/config.bst` installs the xfconf system defaults from
   `files/winblues/`.
3. `elements/oci/layers/brussels-winblues.bst` puts these two trees
   together. The tree does not contain files from the base image.
4. `variants/winblues/Containerfile` adds the tree on top of the base image
   as one layer.
5. The `build_final` job in `build-multirunner.yml` builds, checks, pushes,
   and signs the variant. The `VARIANTS` variable lists the variants.

To build the variant on your computer, build and export the base image
first. Then run `just export-variant winblues`.

The variant changes system defaults only. A user who changes a setting
keeps that change.

## What blue95 ships, and what this variant does

blue95 is Fedora Atomic with the XFCE packages of Fedora, xfwm4, and LightDM. This table
compares blue95 with brussels-winblues.

| Item | blue95 | brussels-winblues |
| --- | --- | --- |
| GTK theme | Chicago95, with five local patches | Chicago95 without patches |
| Window decorations | Chicago95 xfwm4 theme with 28 px title bars (patch) | Chicago95 xfwm4 theme as upstream ships it. xfwl4 draws it. |
| Icons | Chicago95, with extra icons | Chicago95, without the trademarked images (see below) |
| Cursors | Chicago95 animated hourglass | The same |
| Notifications | Chicago95 notifyd theme, bottom right | The same |
| Panel | One bottom panel: Whisker Menu, launchers, task list, tray, volume, clock | One bottom panel: Applications Menu with the label "Start", show desktop, task list, tray, clock |
| Terminal colors | Chicago95 color scheme in the user skeleton | The color scheme is installed. Select it in the terminal settings. |
| Sounds | Chicago95 sound theme and a Windows 95 startup sound | Not shipped |
| Boot splash | Chicago95 Plymouth theme | Not shipped. The XFCE splash of the base image stays. |
| Wallpapers and fonts | Chicago95 wallpapers, DOS and bitmap fonts | Not shipped |
| Login screen | LightDM GTK greeter theme | Not applicable. brussels uses GDM. |
| Applications | Pale Moon, Audacious with a Winamp skin, JS Paint, others | Not shipped |

## Trademarked artwork

The variant does not ship artwork that shows Microsoft trademarks:

- The Chicago95 start-button images and the `misc/` folder of the theme.
  These images show the Windows logo.
- The `branding_W95.png` image of the theme.
- Icons that show the Windows logo, the Internet Explorer logo, or the
  Office document marks. The element finds these icons by name. Then it
  removes each icon with the same image content, under any name.
- The Chicago95 sound theme and the startup sound. These sounds come from
  Windows 95.
- The Chicago95 Plymouth theme. It copies the Windows 95 boot screen.

The start menu icon is Tux, from the `Chicago95-tux` icon theme of the same
project. The build stops if one of the removed images is still in the
installed files.

Nobody has examined the other 15,000 icons one at a time. Report an icon
that shows a trademark, and we will add it to the list in
`elements/winblues/chicago95.bst`.

## Gaps under xfwl4

xfwl4 reads the `theme` property of the xfwm4 channel. It draws the xfwm4
theme from its `themerc` file and its XPM and PNG images. The Chicago95
`themerc` keys all work: `button_layout`, `button_offset`,
`button_spacing`, `title_alignment`, the title offsets,
`frame_border_top`, and `show_app_icon`. xfwl4 also reads the cursor theme from the xsettings
channel. It shows animated cursors.

These items do not work, or nobody has tested them yet:

- **Applications that draw their own title bar.** An application with a
  header bar draws its own title bar. Thus it does not get the xfwm4
  theme. Most GTK 4 and libadwaita applications are of this type. xfwl4
  draws the title bar of a GTK 3 application that has no header bar. Thus it
  gets the Chicago95 title bar.
- **Whisker Menu, the volume plugin, and the notification plugin.** The
  image does not build these panel plugins yet. The panel uses only the
  plugins that xfce4-panel includes.
- **Desktop background.** xfdesktop stores the background for each monitor
  name. A system default cannot select a monitor name, so the variant keeps
  the default background.
- **Title bar height.** blue95 changes the Chicago95 theme to make 28 px
  title bars. This variant uses the upstream theme without changes.
- **Not tested on hardware.** The configuration files pass the checks in
  CI. Nobody has examined the variant in a session yet.

## Credits

- [Chicago95](https://github.com/grassmunk/Chicago95) by grassmunk and its
  contributors. GPL-3.0-or-later and MIT. This includes the GTK, xfwm4,
  and notification themes, the icons, the cursors, and the terminal color
  scheme.
- Tux by Larry Ewing, made with The GIMP. The pixel version comes from
  Chicago95.
- [winblues](https://github.com/winblues) and blue95 by ledif. These
  projects are the model for the panel layout and the selection of
  settings. The variant does not include winblues code or artwork.
