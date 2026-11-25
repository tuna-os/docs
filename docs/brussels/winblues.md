---
sidebar_position: 12
title: "winblues"
---

Remember when a window had an edge that you could feel? brussels-winblues
brings the desktop of the 1990s to a modern operating system. It has gray
bevels, navy title bars, pixel icons, and an hourglass pointer. A penguin sits
on the Start button.

Below that look is Brussels: an immutable bootc image with XFCE and a Wayland
session. xfwl4, the Wayland compositor of XFCE, draws the window frames of the
[Chicago95](https://github.com/grassmunk/Chicago95) theme by grassmunk and its
contributors. The Start menu, the taskbar, and the applications are the XFCE
programs, with no changes.

![The desktop with the open Start menu, the file manager, and the appearance settings](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/hero.webp)

**There is no public image yet.** You cannot pull or install it. The build
pipeline will publish it as `ghcr.io/tuna-os/brussels-winblues`, with the same
tags as the base image.

The variant follows the example of the
[winblues](https://github.com/winblues) project, especially blue95. It is a
separate project. It does not include winblues code or artwork.

## Gallery

These pictures are from a virtual machine that booted the image. They show the
default settings, and nobody edited them. They show a local build on an
earlier base: see [How to make the pictures](#how-to-make-the-pictures).

| | |
| --- | --- |
| ![The Start menu](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/start-menu.webp) The Start menu | ![The file manager Thunar](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/file-manager.webp) Files, in Thunar |
| ![The XFCE settings manager](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/settings.webp) Settings | ![The appearance settings](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/appearance.webp) Appearance |
| ![The window About Xfce](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/about.webp) About Xfce | ![The desktop](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/desktop.webp) The desktop |

There is no picture of the terminal. `xfce4-terminal` cannot start in this
base, because the library `libvte-2.91` is missing. The current source tree
builds that library.

The login screen is the default GDM screen. The theme does not change it.

![The GDM login screen](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/login.webp)

The image logs in automatically, so this picture has the automatic login off.
[Issue 290](https://github.com/tuna-os/brussels/issues/290) is about that
default and other development defaults.

## How to make the pictures

`scripts/capture-screenshots.py` boots a disk image in QEMU, moves the mouse,
opens the programs, and saves the screen. It uses a snapshot, so the disk
image does not change. It needs Linux, KVM, and OVMF files.

1. Build and export the base image, and run `just export-variant winblues`.
2. Run `just image_name=brussels-winblues generate-bootable-image`.
3. Run the script:

   ```bash
   scripts/capture-screenshots.py bootable.raw shots \
     --ovmf-code /usr/share/edk2/ovmf/OVMF_CODE.fd \
     --ovmf-vars /usr/share/edk2/ovmf/OVMF_VARS.fd
   ```

4. Look at each picture. Then run `cwebp -lossless -metadata none` for each
   picture, and put the result in `docs/images/winblues/`.

The pictures of 2026-11-25 show this image:

- Base: `ghcr.io/tuna-os/xfce-linux:nightly-20261102`, digest
  `sha256:6409a488869c09e7a327483f710d9cbfe7f7da30b8bbf763a23f93ab5c9e3056`.
  It is older than the XFCE source build in this repository, and it has xfwl4
  0.1.0. Its `os-release` file still has the name GNOME OS.
- Layer (local image ID `628c61934c23`): the commands of `elements/winblues/chicago95.bst` and the files in
  `files/winblues/`, added with `variants/winblues/Containerfile`.
  BuildStream did not run. The commands ran in the base image, as
  `scripts/winblues-layer.sh` does.

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
- The `branding_W95` images of the GTK theme, its flag and Internet Explorer
  badges, and its busy animation. The animation is a waving Windows flag.
- Icons that show the Windows or Internet Explorer logo, or the Office marks.
  Icons that show the MSN, MS-DOS, or Visual Studio logos. The theme also uses
  these marks for LibreOffice, Wine, and software updates. The element finds
  these icons by name. Then it removes each icon with the same image content,
  under any name.
- The Chicago95 sound theme and the startup sound. These sounds come from
  Windows 95.
- The Chicago95 Plymouth theme. It copies the Windows 95 boot screen.
- The Chicago95 fonts, `Extras/`, and wallpapers, except the terminal color
  scheme.

The start menu icon is Tux, from the `Chicago95-tux` icon theme of the same
project. The download folder icon is the plain folder. The build stops if one
of the removed images is still in the installed files.

We looked at each different image of the icon theme on contact sheets on
2026-11-25. That is not a legal review. These risks remain:

- Many icons copy the style of Windows 95 icons, for example the trash and
  the folders. They are not logos, but they can be similar to copyrighted
  artwork.
- Some icons show the marks of other products, for example Firefox, Netscape,
  Yahoo, Adobe, WinRAR, and ZoneAlarm.
- Two names refer to Microsoft products. "Chicago95" is the name of the
  theme, and "winblues" is the name of the variant.

[Issue 330](https://github.com/tuna-os/brussels/issues/330) asks the owner about these risks. Report an icon that
shows a Microsoft trademark, and we will add it to the list in
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
- **Not tested on hardware.** We examined the variant in a virtual machine
  only.
- **Window frame.** In the pictures, part of the frame is missing on some
  windows. Refer to [issue 329](https://github.com/tuna-os/brussels/issues/329).
- **Free space.** Thunar shows 0 bytes of free space for `/usr`, because the
  root file system is a read-only composefs image.

## Credits

- [Chicago95](https://github.com/grassmunk/Chicago95) by grassmunk and its
  contributors. The license is GPL-3.0+/MIT, as its README says. The image has the
  license text in `/usr/share/licenses/chicago95`. This includes the GTK, xfwm4,
  and notification themes, the icons, the cursors, and the terminal color
  scheme.
- Tux by Larry Ewing, made with The GIMP. The pixel version comes from
  Chicago95.
- [winblues](https://github.com/winblues) and blue95 by ledif. These
  projects are the model for the panel layout and the selection of
  settings. The variant does not include winblues code or artwork.
