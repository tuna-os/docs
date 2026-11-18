---
title: Desktop accessibility
description: Set up screen readers, keyboard navigation, larger text, and magnification on TunaOS desktops.
---

Use this guide to find accessibility controls in GNOME, KDE Plasma, COSMIC,
Niri, and XFCE. Features and package availability depend on your desktop
version and TunaOS image. Test your required apps, login screen, screen lock,
and assistive devices before you rely on a new desktop.

## Start here

- Open your desktop's settings and search for **Accessibility**.
- In most app dialogs, use `Tab` and `Shift+Tab` to move between controls,
  arrow keys to move within lists. Use `Space` to toggle a control and `Enter`
  to activate it. Use `Escape` to close a menu or dialog.
- `Super` (called `Meta` in Plasma) is usually the Windows key on a PC.
  Shortcuts below are upstream defaults; check your local shortcut settings.
- Sticky keys let you press each key in a combination separately. Slow keys
  reject a brief press. Bounce keys reject a repeated press. Enable only the
  modes you need, and check their delay settings if you cannot type.

## GNOME

Open **Settings → Accessibility**. Under **Seeing**, enable **Screen Reader**,
**High Contrast**, **Large Text**, or **Zoom**. Zoom has controls for cursor position,
color filters, and magnification. Display scale is separate, under
**Settings → Displays**.

| Default shortcut | Action |
| --- | --- |
| `Alt+Super+S` | Toggle the Orca screen reader |
| `Alt+Super+8` | Toggle desktop zoom |
| `Super` | Open the overview to search for apps |
| `Alt+Tab` | Switch apps |
| `Ctrl+Alt+Tab` | Move between desktop areas, such as the top bar |

The **Typing** controls include an on-screen keyboard, sticky keys, slow keys,
and bounce keys. Other controls help you adjust the pointer size and mouse buttons.
See [GNOME accessibility help](https://help.gnome.org/gnome-help/a11y.html)
and [shortcut settings](https://help.gnome.org/gnome-help/keyboard-shortcuts-set.html).

## KDE Plasma

Open **System Settings → Accessibility** (or search for it). Enable the
screen reader and configure keyboard assistance there. Sticky, slow, and
bounce keys can help when key combinations or repeated presses are difficult.

| Default shortcut | Action |
| --- | --- |
| `Meta+Alt+S` | Toggle the screen reader after login |
| `Alt+Tab` | Switch windows |
| `Alt+F2` | Open KRunner to launch an app or find a setting |

Search System Settings for **Zoom** to configure the desktop effect and its
shortcuts. Search for **Fonts** to change font sizes and **Display
Configuration** to change display scale. Under **Colors**, choose a scheme
with enough contrast; check the result in the apps you use. Search for
**Screen Edges** or **Desktop Effects** if pointer-triggered effects interfere
with navigation.

See [KDE's Plasma accessibility guide](https://userbase.kde.org/Accessibility/Plasma/en)
and the [reference for Plasma shortcuts](./plasma-shortcuts.md).

## COSMIC

Open **COSMIC Settings → Accessibility**, or use the Accessibility applet if
it is present. Look for the screen reader and magnifier controls. Use
`Super+=` to zoom in and `Super+-` to zoom out; `Super` plus the mouse wheel
also changes zoom. Check the local shortcut list if these do not work.
System76 describes these controls in its
[COSMIC accessibility and zoom announcement](https://system76.com/blog/post/cosmic-alpha-6-big-leaps-forward).

Use **Displays** for scale and **Desktop → Appearance** for text and theme
options. Check which contrast and keyboard assistance controls your installed
version provides. A GNOME setting with the same name does not configure COSMIC.
Use `Super+Space` for the launcher and `Super` plus an arrow key to move focus
between windows. See the [COSMIC quick-start](./cosmic-quickstart.md) and
[upstream COSMIC project](https://github.com/pop-os/cosmic-epoch) for settings,
release information, and issue reports.

## Niri

The [accessibility guide for Niri](https://github.com/niri-wm/niri/wiki/Accessibility)
describes support for Orca from version 25.08. Run a full desktop session
through the login manager or `niri-session`; a nested Niri window does not
expose the same accessibility interfaces. Orca also needs XWayland to work.

The default configuration uses `Super+Alt+S` to toggle Orca and
`Super+Shift+/` to show important hotkeys. Your TunaOS configuration can differ.
After you test Orca, you can add this to `~/.config/niri/config.kdl` to start
it with the session:

```kdl
spawn-at-startup "orca"
```

Remove that line to undo automatic startup. Do not add another autostart entry for Orca.
Upstream documents limits to panel focus and screen-reader coverage. Its guide
also describes zoom availability; check it for your installed release.
For larger content, set output scale in the Niri configuration and adjust
fonts and contrast in each app. See the [Niri quick-start](./niri-quickstart.md)
for output configuration and window navigation.

## XFCE

Open **Settings Manager → Accessibility** and enable **Assistive Technologies**
before you start Orca. Log out and back in after you change this option so the
session can load its accessibility modules. The same dialog provides sticky,
slow, and bounce keys, plus mouse emulation through the numeric keypad.
See the [XFCE accessibility manual](https://docs.xfce.org/xfce/xfce4-settings/accessibility).

Use **Appearance** to select a high-contrast style, if installed, and change
fonts. Use **Display** for the scale options your session supports. Magnifier
options depend on the window manager and whether the session uses X11 or
Wayland. Do not assume that an X11 zoom tool works on Wayland.
Use `Alt+Tab` to switch windows. Configure an Orca launch shortcut in
**Keyboard → Application Shortcuts**, and add `orca` under **Session and
Startup → Application Autostart** only after it works when launched manually.

## Configure Orca and speech

Orca reads accessible app controls through speech and can use refreshable braille devices that it supports. It does not make every app accessible. Start it
from your desktop's control above, or run `orca` in a terminal if it is installed.
Do not run it with `sudo`.

After you start Orca, open its preferences with `Insert+Space` in desktop layout
or `Caps Lock+Space` in laptop layout. Choose the keyboard layout, voice,
speech rate, and braille options you need. Use
[Orca's help](https://orca.gnome.org/) for commands and device configuration.
Test with a familiar app: move focus through its controls and confirm that
Orca speaks their labels. Test your braille display separately before daily use.

Text-to-speech reads text aloud; dictation converts speech into text. Orca
reads the screen; it does not provide general speech-to-text input. For dictation, use
an app that supports it and check its language support, microphone permission,
and audio privacy. Check whether audio stays on your device or goes to a service. A desktop's
screen reader switch does not enable dictation.

## TunaOS setup and troubleshooting

TunaOS uses bootc images. A missing host screen reader or speech service needs
an image-compatible installation method. An installation in a development
container does not configure your desktop session. Check the
[guide to host packages](./layering.md) before adding host packages. Package names and
availability vary by base. This guide does not certify feature or hardware
support across all TunaOS images.

| Problem | What to check |
| --- | --- |
| No speech anywhere | Test ordinary audio, check mute and the selected output, then check Orca's voice settings. Confirm `orca --version` works in the host terminal. |
| One app is silent | Test another app. The first app may not expose accessible controls. Record its version and whether it is a Flatpak, X11, or Wayland app. |
| Shortcut does nothing | Check the desktop's shortcut settings for a changed binding or conflict. Start the feature from Settings to separate a shortcut problem from a missing component. |
| Keys seem ignored or repeated | Review slow-key and bounce-key delays. Turn off the mode you enabled to test normal typing. |
| Text stays small | Check app font settings as well as display scale. App text zoom and desktop magnification are separate controls. |
| Speech works after login only | The login and lock screens have separate accessibility controls and package requirements. Test both; user autostart entries run only after login. |

For a Flatpak app, check its documented accessibility support and permissions
before you change sandbox settings. Do not override all permissions as a first step. For braille or other USB assistive devices, check the device's Linux
support and session permissions. Do not run
the desktop as root to bypass access errors.

If a problem remains, use [TunaOS support](./community.md). Include the image
name, desktop and app versions, session type, assistive technology, steps to
repeat the issue, and whether it also occurs in another app. Remove personal
text from logs or recordings before you share them.
