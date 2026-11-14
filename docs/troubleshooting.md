---
title: Troubleshooting
description: Diagnose boot, update, desktop, hardware, and application problems on TunaOS.
---

Start with the section that matches your symptom. Run commands on the host,
not inside Toolbox or Distrobox. Some tools depend on your image; if a command
is absent, record that fact. Do not install host packages to run it.
Change one thing at a time and keep the exact error text.

## Boot and installation failures

- If the USB does not boot or the installer fails, [verify the download](verifying-downloads.md),
  Try another USB drive or writer. Check [system requirements](system-requirements.md).
  Older x86 hardware can need an `x86_64_v2` image.
- For a signature error or a rejected kernel module, follow the
  [Secure Boot guide](secure-boot.md#common-uefi--secure-boot-troubleshooting).
  Record `bootctl status` and `mokutil --sb-state` if available.
- If a new deployment fails, select the previous deployment in the boot menu.
  The menu and the key to open it depend on your firmware and bootloader.
  Once logged in, follow [update and rollback problems](#update-and-rollback-problems).
- If the desktop is black, try `Ctrl+Alt+F3` for a text console and log in.
  See [graphics and display](#graphics-and-display) before you change drivers.

In an emergency shell, use `systemctl --failed` and `journalctl -xb` to find the
first failed mount or service. Compare `lsblk -f` with `/etc/fstab` for missing
disks or wrong UUIDs. Back up configuration before you change it. A rescue shell
can need the root password; use a live ISO if you cannot log in.

If the bootloader is stuck or no deployment starts, boot a matching live ISO.
Use `lsblk -f` to identify disks and unlock encrypted storage with your recovery
key if needed. Back up data before repairs. Do not format partitions or run a
generic command to reinstall the bootloader: the layout and bootloader vary by image.
Report the firmware error, disk layout, and image name through the
[help channels](#when-all-else-fails).

## Update and rollback problems

First record the booted, staged, and rollback images:

```bash
bootc status
systemctl --failed
df -h / /var /boot
```

- For pull errors, check [network connectivity](#network-and-connectivity), the
  system clock (`timedatectl status`), the image reference, and the registry error.
  An authentication error differs from a missing tag or a connection timeout.
- If an update appears stuck, inspect `journalctl -b` for the update service or
  command that failed. Wait for the deployment to finish before you retry.
  Save its error and check free space; do not delete deployment files to free space.
- After a successful stage, reboot when ready and check `bootc status` again.
  A staged image is not yet the active image.
- For a regression, use the [rollback procedure](bootc-rollback.md).
  Save work before you reboot. Rollback needs an available previous deployment.
- If rollback fails or reports damaged OSTree objects, preserve the exact error
  and deployment status. Try the previous boot entry if available, then seek help.
  Do not remove `/ostree`, `/sysroot`, or boot entries to force recovery.

A rollback restores the image, but does not undo all changes to `/etc`, `/var`,
or your home directory. If the problem remains on the old image, check local
configuration and application data too. See the
[bootc upgrade and rollback reference](https://bootc.dev/bootc/bootc-upgrades.7.html).

If a package disappears after reboot, check which image runs. Packages
installed in a temporary `/usr` overlay disappear on reboot; packages inside a
container do not install host commands. Check `flatpak list`, `brew list`, or the
container's package list as appropriate. For a missing image package, report the
old and new image digests and the package name.

## Graphics and display

```bash
lspci -k
journalctl -b -k
printf '%s\n' "$XDG_SESSION_TYPE" "$XDG_CURRENT_DESKTOP"
```

Find the GPU and its driver in `lspci -k`; look for driver or firmware errors in
the kernel log. For failures to verify NVIDIA modules, use the
[Secure Boot guide](secure-boot.md). Use a supported driver image. Avoid vendor installers that write into `/usr`.

For flicker or missing monitors, test one display with a direct cable, then add
docks and other monitors one at a time. Select a supported resolution and refresh
rate in desktop settings. Note which connector and scale factor fail.

If the login screen offers another session, compare it after saving work and
logging out. Wayland and X11 sessions are not available on every desktop;
COSMIC and Niri use Wayland. If only one app fails, compare its Flatpak and native
versions when available and report the app version and session type.

## Network and connectivity

On images that use NetworkManager:

```bash
nmcli device status
nmcli connection show --active
nmcli device show
ip route
getent hosts tunaos.org
journalctl -b -u NetworkManager
```

If a device shows as disconnected, connect through desktop network settings. For WiFi,
check `rfkill list`, the hardware radio switch, and whether the expected network
appears. A missing adapter or firmware error belongs in the hardware report.

If connected without an address or default route, check the connection's DHCP
settings and router. Compare another device on that network. If addresses and
routes exist but name lookup fails, inspect the DNS servers shown by
`nmcli device show`. Use `resolvectl status` only if systemd-resolved is present.
Do not overwrite `/etc/resolv.conf` as a general fix.

For VPN failures, import the provider's profile in network settings and check
that your image has the required VPN plugin. Compare routes and DNS before and
after you connect. Test without the VPN only if your network policy allows it;
do not disable a required firewall. See the
[NetworkManager command reference](https://networkmanager.dev/docs/api/latest/nmcli).

## Audio and peripherals

Select the intended input and output in sound settings; check mute, volume, and
the device profile. Compare another app and a wired device with Bluetooth audio.
On PipeWire images, inspect:

```bash
wpctl status
systemctl --user status pipewire wireplumber
journalctl --user -b -u pipewire -u wireplumber
```

For Bluetooth, check `bluetoothctl show` and `systemctl status bluetooth` if these
tools are present. Charge the device and put it in discovery mode. Disconnect it from other hosts, then pair it in desktop settings.

For USB problems, compare `lsusb` and `journalctl -b -k` before and after you plug
in the device. Try a direct port and another cable. If the host sees the device
but one Flatpak cannot use it, inspect that app's permissions before you change
host drivers. Record the device ID and relevant kernel errors.

## Desktop environment issues

Compare the problem in a fresh user account if possible. If it occurs only in
your account, back up the relevant settings before you change them. Do not delete
your entire configuration directory to test a desktop bug.

| Desktop | First check |
| --- | --- |
| GNOME | Disable user extensions one at a time with the Extensions app; record the extension and GNOME versions. |
| KDE Plasma | Test the default theme and disable third-party widgets; distinguish a panel issue from an app crash. |
| COSMIC | Check the [COSMIC portal and session guidance](cosmic-quickstart.md#troubleshooting). |
| Niri | Run `niri --validate`; use the [Niri display and portal checks](niri-quickstart.md#troubleshooting). |
| Other desktops | Compare supported features in the [desktop comparison](desktop-comparison.md) and collect the user session log. |

For screen capture, check `systemctl --user status xdg-desktop-portal` and
`journalctl --user -b`. Use the portal backend for your desktop. Log out and back
in after session configuration changes, after saving work.

## Containers and overlays

Check whether the failure occurs on the host or only inside a container:

```bash
podman ps -a
podman logs CONTAINER
```

Replace `CONTAINER` with the affected container name. Run Podman as the same user
that created it; root and user containers have separate storage. Check container
DNS, bind mounts, and permissions if the host works. Back up container data before
you recreate a container; do not use a storage reset as a first repair step.

For read-only filesystem errors or conflicts from `rpm-ostree` packages on a bootc
host, record `bootc status` and any `rpm-ostree status` output available. Do not
mix commands to layer packages with bootc updates to resolve an error blindly.
Use the [customization guide](layering.md) to choose Flatpak, Homebrew, a development
container, or a derived image. A temporary `bootc usr-overlay` resets on reboot;
changes under `/etc` and `/var` can persist. Save temporary work before you reboot
and retry from a clean boot if an overlay interferes with an update.

## System performance

```bash
systemd-analyze time
systemd-analyze critical-chain
systemctl --failed
top
free -h
df -h
journalctl -b -1 -p warning
```

Use `systemd-analyze critical-chain` to locate boot delays, and `top` to identify sustained CPU
or memory use. High cache use alone does not mean the system lacks memory. Check the
journal for out-of-memory or disk errors. For shutdown delays, inspect the prior
boot log if the journal kept it. Record the slow unit and elapsed time before you change
its timeout or disable it. Compare the previous deployment to test whether an
image update introduced the delay.

## When all else fails

From a text console, functional deployment, or emergency shell, collect what you can:

```bash
cat /etc/os-release
uname -r
bootc status
systemctl --failed
journalctl --list-boots
journalctl -b -p warning
journalctl --user -b -p warning
```

Use `journalctl -b -1` for the prior boot when listed. Logs can need `sudo`;
a live ISO's `journalctl -b` describes the live session, not the installed system.
Review logs before you post and remove passwords, tokens, private hostnames,
network addresses, and other personal data. Share relevant excerpts and exact
errors. Avoid an unreviewed full journal.

Include the image reference and digest, desktop, hardware, steps to reproduce,
expected and actual results, recent local changes, and whether rollback helps.
For installation failures, add the ISO filename and checksum verification result.

- Start with [TunaOS issues](https://github.com/tuna-os/tunaOS/issues) for image,
  installer, or integration problems, or when the owner is unclear. Search for an
  existing report first.
- For a reproducible failure in bootc, check
  [bootc issues](https://github.com/bootc-dev/bootc/issues). For a systemd service
  failure, identify the failed unit and its owner before you report a systemd bug.
- If the problem follows an app, extension, or desktop across images, use that
  project's tracker. Link any TunaOS report so maintainers can follow the diagnosis.
- Ask the [community](community.md) for help when you cannot recover or identify
  the right tracker. For errors in this guide, use
  [docs issues](https://github.com/tuna-os/docs/issues).
