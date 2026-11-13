---
title: Accessibility features configuration guide
description: Configure screen reading, visual and input assistance, alerts, and language input on TunaOS desktops.
---

Start with the settings for your desktop. Features depend on the desktop version,
image, and application. A setting shown in upstream documentation might be absent
from your image. Test essential tasks before you choose a desktop; see the
[desktop comparison](./desktop-comparison.md).

## Find your settings

Press **Super** (often the Windows key), open the application launcher, and search
for Settings. On GNOME, you can also open Settings with `gnome-control-center`.

| Desktop | Where to start | Availability notes |
| --- | --- | --- |
| GNOME | Settings → Accessibility | Screen Reader, Zoom, Large Text, contrast, typing and pointer assistance. |
| KDE Plasma | System Settings → Accessibility (or search for Accessibility) | Screen Reader, keyboard filters, mouse navigation, bell and zoom settings vary by Plasma version. |
| COSMIC | COSMIC Settings → Accessibility; also check the accessibility applet | Test each required feature on your image. A visible shortcut or toggle does not prove that all apps support it. |
| XFCE | Settings Manager → Accessibility, or `xfce4-accessibility-settings` | Enable Assistive Technologies for Orca; keyboard assistance and keypad mouse controls are here. |
| Niri | User configuration and desktop utilities | There is no single accessibility settings panel. Screen reading requires a full Niri session; see below. |

Sources: [GNOME accessibility](https://help.gnome.org/gnome-help/a11y.html),
[Plasma accessibility](https://docs.kde.org/stable_kf6/en/plasma-desktop/kcontrol/kcmaccess/index.html),
[XFCE accessibility](https://docs.xfce.org/xfce/xfce4-settings/accessibility), and
[COSMIC settings](https://github.com/pop-os/cosmic-settings).

Change one setting at a time. Note its old value and how to turn it off before
you change keyboard filters, zoom, or pointer behavior. User-session settings do not
necessarily apply to the login screen, installer, or disk-unlock prompt.

## Screen readers and speech

### Enable and configure Orca

Orca reads accessible application controls through speech or a braille display.
It needs to run in your desktop session, with a speech service that works and voice.

1. On GNOME, open Settings → Accessibility → Seeing → Screen Reader. The default
   **Super+Alt+S** shortcut toggles it; press it again to turn it off.
2. On Plasma, open System Settings → Accessibility → Screen Reader and enable it.
   Plasma uses Orca. **Konsole is a terminal emulator, not a screen reader.**
3. On XFCE, enable Assistive Technologies in Accessibility, then log out and in
   if requested. Start Orca from the application menu. Use Session and Startup →
   Application Autostart if you need it at each login.
4. On COSMIC, try the Screen Reader toggle in Accessibility. Check the behavior on your release. System76 documents limits in its
   [shortcut reference](https://www.system76.com/support/pop-cosmic-keyboard-shortcuts).
5. On Niri, start a full session through the display manager or `niri-session`.
   Nested Niri and a plain `niri` process do not expose the same accessibility
   interfaces. Follow the [Niri accessibility guide](https://github.com/niri-wm/niri/wiki/Accessibility)
   for Orca startup and version requirements.

If Orca is present, run `orca --setup` from a terminal to open its preferences.
Choose a keyboard layout, voice, language, rate, and volume. Start with a slow
rate. Read the [Orca manual](https://help.gnome.org/orca/) for its modifier key,
commands to read text, and application-specific controls.

If the toggle gives no speech, check output volume and the selected sound device.
Try `orca --version` in a terminal to check whether Orca is installed. If it is
missing, report your image and desktop to TunaOS support. Do not assume that a
package installed in a development container can read the host desktop. Follow the
[host package guidance](./layering.md) before you change the host image.

### Test a real workflow

Open Settings, a text editor, and a browser. Use **Tab** and **Shift+Tab** to move
between controls. Check that Orca speaks focus, control names, values, and typed text. Read a web heading and link, save a file, then repeat after login.

Test
GTK and Qt apps separately. If one app is silent, try another app before you change
the whole session. Custom controls and inaccessible documents can limit what Orca reads.

### Text-to-speech and dictation

To read selected content, use an application's read-aloud feature where
available; configure its voice and language in that app. Orca's speech settings
do not control every application's text-to-speech engine.

Speech-to-text is a separate tool, not an Orca mode. TunaOS does not promise that one tool provides dictation on all desktops. In an app that offers dictation, select the
microphone and recognition language, grant microphone access, and dictate a short
sentence into a test document. Check punctuation and correction controls. Check
whether the app sends audio to a service before you use private text.
If the feature is absent, use the keyboard or on-screen keyboard as you check
the app's supported speech-input options.

## Visual and reading assistance

- **GNOME:** In Accessibility → Seeing, try High Contrast, Large Text, and Zoom.
  Open Zoom options to change magnification and how zoom follows focus.
- **Plasma:** Search System Settings for Colors, Fonts, Cursors, and Accessibility.
  Choose a high-contrast color scheme, increase font and cursor size, and configure
  Zoom where available. Dark mode alone does not guarantee high contrast.
- **XFCE:** Use Appearance → Style and Fonts, Mouse and Touchpad → Theme, and
  Display for scale options. Available themes depend on the image.
- **COSMIC:** Check Accessibility, Appearance, and Displays for available contrast,
  text, and scale controls. Test magnification with the applications you use.
- **Niri:** Follow its accessibility guide for zoom controls supported by your
  version. Use output scale and app text size where needed. Back up
  `~/.config/niri/config.kdl` before edits; see the [Niri quick-start](./niri-quickstart.md).

For optional fonts such as OpenDyslexic or Atkinson Hyperlegible, download font
files from the font project's official site. Place them in
`~/.local/share/fonts/`, then reopen the app. Select the font in its preferences.
Try a short page before you change every app. Font preference is individual; these
fonts do not guarantee that text is easier to read. Remove the added files to uninstall them.

Increase the space between lines and browser text size if useful. Reduce animation in desktop
settings where offered, and disable app notifications that distract you. Check that the
pointer, text selection, and keyboard focus remain visible in both light and dark
apps. Use **Ctrl+plus**, **Ctrl+minus**, and **Ctrl+0** for browser zoom.

## Motor assistance and keyboard-only work

In GNOME Accessibility → Typing, Plasma Accessibility, or XFCE Accessibility →
Keyboard, enable one filter and test it in a text editor:

| Setting | Effect | What to adjust |
| --- | --- | --- |
| Sticky Keys | Press modifiers and a letter in sequence, instead of together. | Test Ctrl, then C to copy selected text. |
| Slow Keys | Accept a key only after you hold it down. | Increase the acceptance delay in small steps. |
| Bounce Keys | Ignore repeated presses within a delay. | Set a delay that still permits intentional repeated letters. |

COSMIC and Niri might not offer the same filters in your version. Use the settings
that are present; do not copy settings commands from GNOME and expect them to change
another compositor.

Common app navigation uses **Tab/Shift+Tab**, arrow keys, **Enter** to activate,
**Space** to toggle a checkbox, and **Esc** to close a menu. **Alt+Tab** switches
windows on many desktops. Check your desktop's shortcut settings for conflicts.
See [Plasma shortcuts](./plasma-shortcuts.md), the
[COSMIC quick-start](./cosmic-quickstart.md), and the Niri quick-start for window
and workspace commands. Practice these tasks without a mouse: open an app, save a file, and open settings.

For pointer alternatives:

- In GNOME Accessibility → `Pointing & Clicking`, try Mouse Keys or Hover Click
  (dwell click). Set a comfortable dwell delay, then test a click and a drag.
- In Plasma Accessibility, check Mouse Navigation; in XFCE Accessibility → Mouse,
  enable mouse emulation with the keypad. These controls generally need a numeric keypad.
- In Mouse and Touchpad settings, adjust pointer speed, tap-to-click, and scroll speed.
  Touchpad gestures depend on the desktop; retain a keyboard route to each task.
- An on-screen keyboard can help if your desktop provides one. Test it in your
  applications and at login separately.

There is no verified universal setup for an eye tracker for TunaOS. Before you choose a
device, check its vendor's Linux, Wayland/X11, calibration, and click-emulation
support for your desktop. Test movement, selection, and recovery after the device loses focus
with a fallback input device. X11-only pointer tools might not work on Wayland.

## Hearing assistance and media

In GNOME Accessibility → `Hearing`, enable Visual Alerts and choose the window or
screen flash. Plasma Accessibility → System Bell offers visual bell controls.
Test with an application that emits a system bell; app sounds may use a different
notification path. Avoid alerts that flash if they cause discomfort.

Enable notification banners in your desktop and each important app. Check that a
message remains visible long enough to read, including while Do Not Disturb is
active or you lock the screen. Do not rely on sound alone for important events.

In your media player or call app, select a subtitle/caption track or enable
captions in its settings. Check caption language and timing with a short clip;
media without captions needs a transcript or a caption service. Audio description
is a separate narrated track for visual content: select it in the audio-track menu
when supplied. It does not replace captions.

## International input and right-to-left text

A keyboard layout defines the keys; an input method also composes characters and presents
candidate choices. A change to the interface language does not by itself add either.

1. On GNOME, open Settings → Keyboard → Input Sources → Add Input Source. Select
   your language and layout or input method. Older versions may place this under
   Region & Language. Use **Super+Space** to switch sources. See
   [GNOME input sources](https://help.gnome.org/gnome-help/keyboard-layouts.html).
2. On Plasma, use System Settings → Keyboard → Layouts for layouts. For a
   composition engine, check the installed input-method settings (often IBus or
   Fcitx 5). On XFCE use Keyboard → Layout; COSMIC has Input Devices → Keyboard.
   On Niri, follow its keyboard configuration and the input framework's session
   instructions. Layout selection alone does not start an input-method engine.
3. For Chinese, select an available Pinyin or other preferred engine. For Japanese,
   a Japanese engine such as Mozc; for Korean, Hangul. For Indic and Southeast
   Asian languages, choose the relevant layout or composition engine. Availability
   depends on installed language support. If absent, ask support about your image.
   Do not run package commands for a different TunaOS base.
4. For Arabic or Hebrew, add the language's layout. In the editor, select
   right-to-left paragraph direction where needed. Test mixed text, numbers, and
   punctuation; a layout does not set every document's paragraph direction.
5. Type a sentence in a plain text editor and browser. Check candidate selection,
   the source switch, and font glyphs after login. Test each sandboxed app.
   Do not start multiple input frameworks in the same session.

## When a feature does not work

Record the TunaOS image/tag, desktop version, Wayland or X11 session, application,
and the smallest steps that reproduce the problem. State whether the same task
works in another app and whether it fails before or after login. Remove private
text from logs and screenshots. Use the [support page](/support) for help; report
missing image components separately from application accessibility failures.
