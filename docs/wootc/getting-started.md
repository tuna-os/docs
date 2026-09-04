---
sidebar_position: 17
title: "getting started"
---

This page walks you from "I found wootc" to the installer's first screen,
including the two Windows warnings you **will** see on the way. They look
alarming; here is exactly what they are and why they appear.

## 1. Download

Grab the latest `wootc.exe` from the
[Releases page](https://github.com/tuna-os/wootc/releases/latest). Save it
anywhere — Downloads is fine. There is nothing to "install"; wootc is a
single program you run.

Prefer a specific distribution? The same release page carries branded
builds of the identical engine — `Bazzite-Installer.exe`,
`Bluefin-Installer.exe`, `Aurora-Installer.exe`, `TunaOS-Installer.exe`.
They pre-select their own images and download the whole OS while still on
Windows, which is the right choice on a Wi-Fi-only laptop.

Command-line folks can use winget once the package clears Microsoft's
one-time review: `winget install TunaOS.wootc`.

Want to check your download? Every release ships a `SHA256SUMS` file;
compare with PowerShell's `Get-FileHash .\wootc.exe` — the app performs the
same verification on every boot artifact it downloads for itself.

Your browser may say something like *"wootc.exe isn't commonly downloaded"*
and hide the file behind a menu. That message means exactly what it says —
not many people have downloaded this exact file yet — and nothing more.
Choose **Keep** (in Edge: `…` → *Keep* → *Keep anyway*).

## 2. The blue "Windows protected your PC" screen

When you first open `wootc.exe`, Windows SmartScreen shows a full-screen
blue warning: **"Windows protected your PC — Microsoft Defender SmartScreen
prevented an unrecognized app from starting."**

This appears because wootc is not yet *code-signed* — signing certificates
are how big publishers pre-register software with Microsoft, and wootc is an
open-source project that hasn't bought one. The warning is about
*recognition*, not about anything found in the file.

To continue: click **More info**, then **Run anyway**.

If you want to verify the download first (a good habit): the Releases page
lists a SHA-256 checksum for each file. In PowerShell,
`Get-FileHash .\wootc.exe` prints yours to compare.

## 3. The administrator prompt

Next, Windows asks: *"Do you want to allow this app from an unknown
publisher to make changes to your device?"*

wootc needs administrator rights for exactly the work it exists to do —
create a disk file, add the one-time boot entry, and read the system
information it shows you. "Unknown publisher" is the same unsigned-app
recognition issue as above. Choose **Yes**.

## 4. You're in

From here, the app itself takes over — and the first screen tells you the
most important thing before asking you for anything:

> Bring Windows to Linux — keep everything.

Everything wootc does before the first reboot lives in one folder
(`C:\wootc`) plus a one-time startup entry, and the installer explains each
step as it happens. If you ever change your mind, **Settings → Apps →
TunaOS (wootc) → Uninstall** puts things back — see the
[user guide](https://github.com/tuna-os/wootc/blob/main/docs/user-guide.md#9-uninstall--put-everything-back) for exactly
what that does.
