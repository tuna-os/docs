---
sidebar_position: 8
title: "gui walkthrough"
---

CI renders every image below from the real GTK4 / libadwaita wizard with
`tests/gui/capture-screens.py`. The script uses the same `BootcWindow` that
the Flatpak presents. It drives the wizard page by page under Xvfb against
fixtures (two canned disks, no network, the repository's own `recipe.json`).
The UI has no mocks, and nothing touches a disk. See `.github/workflows/screenshots-gnome.yml`.

The cross-frontend view, with the KDE, COSMIC, Niri and XFCE installers side
by side and the parity matrix on top, is [`walkthrough/`](https://github.com/tuna-os/bootc-installer/blob/dev/docs/walkthrough/README.md).

<p align="center">
  <img src="https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/walkthrough.gif" alt="The GNOME installer, screen by screen" width="720" />
</p>

## The pages

| | |
|---|---|
| ![Welcome](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/01-welcome.png) | **Welcome**: what the installer is about to do, with power-off and credits. |
| ![Language](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/02-language.png) | **Language**: the language of the installed system. |
| ![Keyboard](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/03-keyboard.png) | **Keyboard**: the layout for this session and the installed system. |
| ![Time zone](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/04-timezone.png) | **Time zone**: the time zone of the installed system. |
| ![Image](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/05-image.png) | **Image**: choose the image to install from the catalog. |
| ![Phone companion](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/06-qr_companion.png) | **Phone companion**: optional QR pairing so the rest of the wizard can be typed from a phone. |
| ![Install location](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/07-disk.png) | **Install location**: whole disks only, plus the virtual-disk option for VMs. Nothing is written yet. |
| ![Encryption](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/08-encryption.png) | **Disk encryption**: LUKS with a passphrase, TPM2, or both. |
| ![User account](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/09-user.png) | **User account**: name, user name and password for the first account. |
| ![Confirm](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/10-confirm.png) | **Confirm**: the last screen before anything is written. |
| ![Installing](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/11-progress.png) | **Installing**: fisherman's install steps, with the log one click away. |
| ![Recovery key](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/12-recovery-key.png) | **Recovery key**: shown once after an encrypted install and must be acknowledged. |
| ![Done](https://raw.githubusercontent.com/tuna-os/bootc-installer/dev/docs/screenshots/13-done.png) | **Done**: restart into the new system. |

The user-account page shows only for an image that needs one. The capture
picks such an image on the image page, so the account page is in the set.

The number in each file name is the page's position in the wizard. When a
page is added or removed, the capture renumbers the files, and the tables
here and in [the install guide](https://github.com/tuna-os/bootc-installer/blob/dev/docs/guide/installing.md) must follow.
`screenshots/captions.json` lists the current names.

## What the capture checks

A PNG that exists is not a screenshot that rendered. The job audits each
frame from its own pixels (distinct colours, share of the largest flat
colour, ink fraction). The job fails when a page did not draw. The job also
compares the visible widget text of each page with the shared screen contract in
`shared/walkthrough/parity_report.py`, and writes the result to
`screenshots/walkthrough-gnome.json` for the aggregator.

Run it locally:

```bash
meson setup build -Dbuild-fisherman=false && ninja -C build
BOOTC_RESOURCE=build/bootc_installer/bootc-installer.gresource \
  xvfb-run -a -s "-screen 0 1400x1000x24" python3 tests/gui/capture-screens.py docs/screenshots
```
