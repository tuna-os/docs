---
title: Start your computer from the USB stick
sidebar_label: Start from the USB stick
description: Open the boot menu of your PC or Intel Mac, choose the UEFI entry of the USB stick, and keep Secure Boot on.
---

# Start your computer from the USB stick

You have a USB stick with TunaOS on it. Now start the computer from that
stick. TunaOS then runs from the stick, and the installer opens.

:::warning Back up your files first
The installer erases the drive of the computer, with Windows or macOS and
all files on it. To keep Windows, use [wootc](https://tunaos.org/wootc)
instead of the USB stick.
:::

Do you not have a USB stick with TunaOS yet? Start on the
[download page](https://tunaos.org/download).

## On a PC

### 1. Open the boot menu

1. Put the USB stick in the computer.
2. Restart the computer.
3. When the screen goes dark, push the boot-menu key for your brand again
   and again, until a menu shows.

| Brand | Boot-menu key |
| --- | --- |
| Acer | F12 (if nothing shows, push F2, set **F12 Boot Menu** to on, then try again) |
| ASUS | Esc on laptops, F8 on desktops |
| Dell | F12 |
| Framework | F12 |
| Gigabyte | F12 |
| HP | Esc, then F9 |
| Lenovo ThinkPad or ThinkCentre | F12 (on some laptops, Fn and F12 together) |
| Lenovo IdeaPad or Yoga | F12, or the small Novo button on the side, then **Boot Menu** |
| Microsoft Surface | Hold Volume Down, then push and release the power button |
| MSI | F11 |
| Samsung | F10 or Esc |
| Toshiba or Dynabook | F12 |
| Other brands | Try F12, F11, F10, F9, F8 or Esc |

Does Windows start again? Use the Windows menu instead:

1. In Windows, open **Settings**, then **System**, then **Recovery**. (On
   Windows 10: **Settings**, **Update & Security**, **Recovery**.)
2. Next to **Advanced startup**, select **Restart now**.
3. Select **Use a device**, then select the USB stick.

### 2. Choose the UEFI entry of the USB stick

The boot menu shows the drives of the computer. The USB stick shows with its
brand name, for example `SanDisk` or `USB HDD`.

If the USB stick shows two times, choose the entry that starts with
**UEFI**. TunaOS does not start in the old "Legacy" or "CSM" mode.

### 3. Keep Secure Boot on

TunaOS starts with Secure Boot on. Do not turn Secure Boot off.

There is one exception: **Marlin** (Arch Linux) needs one more step at the
first start. Your computer must accept the TunaOS key (a "MOK" key) one
time. The [Secure Boot guide](secure-boot.md) shows how. All other images
start with no extra step.

If the screen shows a "Secure Boot violation" message, write the stick
again with TunaOS Media Writer and try one more time. If the message stays,
read the [Secure Boot guide](secure-boot.md).

## On a Mac with an Intel processor

1. Put the USB stick in the Mac.
2. Restart the Mac. Immediately push and hold the **Option** (⌥) key.
3. Release the key when the Mac shows the startup disks.
4. Select the disk with the name **EFI Boot**, then push Return.

Macs from 2018 to 2020 have a T2 security chip. Those Macs do not start from
a USB stick until you allow it:

1. Restart the Mac and hold **Command** (⌘) and **R** to open macOS Recovery.
2. Select **Utilities**, then **Startup Security Utility**.
3. Set **Secure Boot** to **No Security**. Under **Allowed Boot Media**,
   select the option for external or removable media.
4. Restart, then do the four steps above.

On T2 Macs, the keyboard, trackpad, sound and Wi-Fi can fail to work in
TunaOS. Test them in TunaOS from the USB stick before you install. Keep a
USB keyboard and mouse near.

Macs with an Apple chip (M1 and newer) cannot start TunaOS yet. See
[Apple Silicon Macs](apple-silicon.md).

## If the computer does not start from the stick

- Push the boot-menu key earlier. Start to push it immediately after the
  restart.
- Put the stick in a different USB port. Use a port on the computer, not on
  a USB hub.
- Write the stick again with TunaOS Media Writer.
- Use a different USB stick, with 16 GB or more.

## Next: install TunaOS

TunaOS starts from the stick and the installer opens. The
[installer guide](installer.mdx) shows each screen.
