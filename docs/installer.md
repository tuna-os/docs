---
sidebar_position: 7
---

# Installer

TunaOS ships with **TunaOS First Setup**, a graphical installer built with GTK4 and Libadwaita. It runs automatically when you boot from a live ISO and guides you through installing TunaOS to disk, then setting up your system on first boot.

> TunaOS First Setup is a fork of [Vanilla OS First Setup](https://github.com/Vanilla-OS/first-setup), adapted for bootc-based installation on Enterprise Linux.

---

## Part 1: Installing to Disk

When you boot from a live ISO, the installer launches automatically and detects the live environment via the `tunaos.live=1` kernel parameter.

### Step 1 — Welcome

The welcome screen shows your variant's name and emoji and gives you three options:

- **Install** — begin the installation wizard
- **Try** — close the installer and explore the live desktop before committing
- **Accessibility** — open GNOME accessibility settings

### Step 2 — Disk Selection

Choose the disk to install to and configure partitioning options.

#### Filesystem

| Variant | Available filesystems | Default |
|---|---|---|
| Albacore, Skipjack | XFS, ext4 | XFS |
| Yellowfin, Bonito | XFS, Btrfs, Btrfs (subvolumes), ext4 | Btrfs (subvolumes) |

> Btrfs is not available on EL-based variants (Albacore, Skipjack) due to limited kernel support.

#### Full Disk Encryption (FDE)

Toggle **Encrypt this disk** to enable LUKS full disk encryption. You will be prompted to set and confirm a passphrase.

#### TPM Unlock

If your system has a TPM 2.0 chip, you can enable **TPM unlock** to automatically decrypt the disk on boot without entering a passphrase each time. Requires FDE to be enabled.

> ⚠️ The entire target disk will be erased. Make sure you have backups before continuing.

### Step 3 — Confirm

Review your choices (disk, filesystem, encryption) and confirm. This is the last chance to go back before data is written.

### Step 4 — Installation

The installer runs `bootc install to-disk` with experimental unified storage enabled. Progress is shown on screen. This typically takes 5–15 minutes depending on your hardware and internet connection.

### Step 5 — Done

Once complete, you are prompted to reboot. Remove the USB drive before the system restarts.

---

## Part 2: First Boot Setup

After rebooting into your new installation, First Setup runs once to configure your system.

### Language

Select your preferred language. This sets the system locale.

### Keyboard Layout

Choose your keyboard layout.

### Timezone & Location

Set your timezone, used for the system clock.

### Hostname

Set a name for your machine on the network (e.g. `james-laptop`).

### User Account

Create your primary user account:
- Full name
- Username
- Password

### Theme

Choose between light and dark mode for the GNOME desktop.

### Applications

Select additional Flatpak applications to install from Flathub. Core apps are already included in the image.

### Setup Progress

Selected apps and system-level configuration are applied. This may take a few minutes.

### Done

Your system is ready. First Setup will not run again on subsequent boots.

---

## Recovery Key

If you enabled Full Disk Encryption, a **recovery key** is generated and shown after installation. Store this somewhere safe — it can unlock your disk if you forget your passphrase or TPM unlock fails.

---

## Troubleshooting

### Installer doesn't launch on boot

Make sure you're booting from the ISO in UEFI mode. The live environment requires UEFI; legacy BIOS boot is not supported.

### No disks shown in disk selection

The installer only lists whole block devices. If you're running in a VM, ensure a virtual disk is attached. Existing partitions on a disk are not shown individually — the whole disk is selected and repartitioned.

### Installation fails or stalls

- Check that you have a working internet connection — the installer pulls the container image during install
- Ensure the target disk has at least 20 GB free
- Check [GitHub Issues](https://github.com/tuna-os/tunaOS/issues) for known problems

### TPM unlock not working after install

TPM unlock binds to the current secure boot state. If you change secure boot settings after installation, re-enroll with:

```bash
sudo systemd-cryptenroll --tpm2-device=auto --wipe-slot=tpm2 /dev/your-disk
```

---

## Source

The installer source is available at [github.com/tuna-os/first-setup](https://github.com/tuna-os/first-setup).
