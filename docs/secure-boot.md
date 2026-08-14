---
sidebar_position: 8.5
title: "Secure Boot & UEFI Guide"
---

# Secure Boot & UEFI Guide

This guide covers TunaOS's Secure Boot posture across base distributions, how to verify your UEFI boot state, enrolling Machine Owner Keys (MOK) for NVIDIA drivers or custom kernel modules, and troubleshooting common UEFI issues.

## Overview & Posture per Base Variant

TunaOS images inherit their Secure Boot signatures and shim posture from their underlying base Linux distributions. All official TunaOS base images use shim loaders signed by the Microsoft UEFI CA.

| Variant | Base Distribution | Secure Boot Status | Signed Shim & Kernel | Notes |
|---------|-------------------|--------------------|----------------------|-------|
| **Albacore** | AlmaLinux 10 | ✅ Supported | Signed by AlmaLinux OS Foundation | Full Secure Boot support out of the box |
| **Yellowfin** | AlmaLinux Kitten 10 | ✅ Supported | Signed by AlmaLinux OS Foundation | Pre-release EL10 base; signed shim included |
| **Skipjack** | CentOS Stream 10 | ✅ Supported | Signed by Red Hat | Full Secure Boot support out of the box |
| **Bonito** | Fedora 44 | ✅ Supported | Signed by Fedora / Red Hat | Full Secure Boot support out of the box |
| **Grouper** | Ubuntu 26.04 | ✅ Supported | Signed by Canonical | Full Secure Boot support out of the box |
| **Marlin** | Arch Linux / CachyOS | ⚠️ Manual Enrollment | Custom / Unsigned | Arch base requires MOK / custom key enrollment |
| **Flounder** | Debian 13 (Trixie) | ✅ Supported | Signed by Debian | Full Secure Boot support out of the box |
| **Sailfin** | openSUSE Tumbleweed | ✅ Supported | Signed by openSUSE | Full Secure Boot support out of the box |
| **Guppy** | Gentoo Linux | ⚠️ Manual Enrollment | Custom / Unsigned | Source-based; manual key signing required |

---

## Verifying Boot & Secure Boot State

You can inspect your UEFI environment and Secure Boot status using standard command-line utilities included in TunaOS.

### 1. Check Systemd-Boot & UEFI Status

Run `bootctl status` to view your firmware type and Secure Boot state:

```bash
bootctl status
```

Look for the following lines in the output:

```text
System:
      Firmware: UEFI 2.80 (Lenovo 1.45)
 Secure Boot: enabled (user-mode)
```

### 2. Check Secure Boot State with `mokutil`

Use `mokutil` to query the Secure Boot state directly from EFI variables:

```bash
mokutil --sb-state
```

Expected output when Secure Boot is active:

```text
SecureBoot enabled
```

### 3. Check EFI Variables via Sysfs

Verify that your system booted in UEFI mode by checking for efivars:

```bash
ls -d /sys/firmware/efi/efivars
```

If this directory exists, your system booted in UEFI mode.

---

## Enrolling MOK Keys for NVIDIA & Custom Kernel Modules

When using the **NVIDIA** driver variant or building out-of-tree kernel modules via DKMS, the module binaries must be signed with a key trusted by your system's MOK (Machine Owner Key) database.

### Automatic MOK Key Generation

TunaOS NVIDIA images generate a local MOK keypair during build/install at `/etc/pki/akmods/certs/public_key.der`.

### Enrolling the Key

To enroll the TunaOS MOK key into your system's MOK database:

1. Import the key using `mokutil`:
   ```bash
   sudo mokutil --import /etc/pki/akmods/certs/public_key.der
   ```
2. Enter a one-time password when prompted (you will need this password during reboot).
3. Reboot your system:
   ```bash
   sudo systemctl reboot
   ```
4. Upon reboot, the **MOK Management** screen (Blue Screen) will appear:
   - Select **Enroll MOK**.
   - Select **View Key** to confirm the key details (issued to TunaOS/akmods).
   - Select **Continue** and confirm with **Yes**.
   - Enter the password created in step 2.
   - Select **Reboot**.

Once enrolled, the NVIDIA kernel modules (`nvidia.ko`, `nvidia-drm.ko`, etc.) will load cleanly with Secure Boot enabled.

For variant-specific driver details, see the [Installation Guide](installation.md#nvidia-formerly-gdx).

---

## Common UEFI & Secure Boot Troubleshooting

### 1. "Verification failed: (0x1a) Security Violation"
- **Cause**: The system attempted to boot a kernel or bootloader signed by an untrusted key, or Secure Boot rejected an unsigned binary.
- **Solution**: Ensure you are running an official signed variant (e.g. Albacore, Bonito, Yellowfin). If using custom or third-party modules, follow the [MOK Key Enrollment](#enrolling-the-key) steps above.

### 2. `mokutil` returns "EFI variables are not supported on this system"
- **Cause**: The system was booted in Legacy BIOS (CSM) mode rather than UEFI mode.
- **Solution**: Enter your motherboard BIOS/UEFI settings, disable Legacy BIOS / CSM support, and ensure boot mode is set to **UEFI Only**.

### 3. TPM 2.0 & Measured Boot Notes
- TunaOS supports TPM 2.0 automatic LUKS unlock via `systemd-cryptenroll`.
- Secure Boot must be enabled for TPM 2.0 PCR 7 (Secure Boot policy state) measurements to remain stable across updates.
- For full details on LUKS + TPM 2.0 setup, refer to the [LUKS Testing Reference](bootc-migrate/luks-testing.md).

---

## Related Documentation

- [System Requirements](system-requirements.md)
- [Installation Guide](installation.md)
- [LUKS & TPM 2.0 Reference](bootc-migrate/luks-testing.md)
- [Runtime Troubleshooting](tunaos/troubleshooting.md)
