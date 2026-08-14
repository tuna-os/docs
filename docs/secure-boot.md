---
sidebar_position: 8
title: "Secure Boot and UEFI verification"
---

# Secure Boot and UEFI verification

Secure Boot lets UEFI verify the boot components before it starts them. It is
different from disk encryption: Secure Boot authenticates the boot chain, while
TPM-backed encryption protects data at rest and can measure the boot state.

TunaOS images use the boot chain supplied by their base and image builder. The
exact signed artifacts can change when a base or bootloader is refreshed, so
verify the installed system and the release notes instead of assuming that a
variant's name guarantees Secure Boot support.

## Check the machine before installing

These commands are read-only. Run them from a TunaOS session or a recent Linux
live environment:

```bash
bootctl status
sudo mokutil --sb-state
test -d /sys/firmware/efi/efivars && echo "UEFI variables are available"
```

Expected results on a Secure Boot installation include `Secure Boot: enabled`
from `bootctl` or `mokutil`. If `mokutil` is unavailable, install it in the
live environment (`dnf install mokutil`, `apt install mokutil`, or the
equivalent for your distribution). If `/sys/firmware/efi/efivars` is absent,
the current session booted in legacy/CSM mode; reboot the installer in UEFI
mode before troubleshooting Secure Boot.

## Variant and base matrix

The bootloader and signing policy follow the base, but the TunaOS release
artifacts must still be checked. The table describes the expected verification
path, not a promise that every historical ISO is signed.

| TunaOS base | Variants | Secure Boot verification |
|---|---|---|
| AlmaLinux / AlmaLinux Kitten | Albacore, Yellowfin | Verify the AlmaLinux `shim`/GRUB chain with `mokutil` after boot; use the release's signed EFI artifacts. |
| CentOS Stream | Skipjack | Verify the CentOS Stream shim chain and the installed EFI loader; a custom locally-built image may need its own trust key. |
| Fedora | Bonito and Fedora-based flavors | Verify Fedora's signed shim/kernel path; Fedora updates can change the enrolled-key or module-signing requirements. |
| Ubuntu | Grouper and Gurnard | Verify the Ubuntu `shim-signed` path; locally rebuilt kernels or DKMS modules need a key enrolled in firmware. |
| Arch / CachyOS | Marlin | Treat Secure Boot as custom-key territory unless the published image explicitly documents a signed chain; enroll a MOK for locally built modules. |
| BuildStream bases | Tromsø and XFCE Linux | Check the release notes for the image's EFI signer and verify the actual loader; do not assume the base desktop's signing policy transfers to the image. |

## During installation

1. Boot the ISO from the firmware's UEFI entry, not its legacy/CSM entry.
2. If the firmware refuses the ISO, record the exact message and test the
   release's checksum before changing firmware settings.
3. Keep Secure Boot enabled when the release documents a compatible signed
   chain. If the ISO is explicitly unsigned, temporarily disable Secure Boot
   only for installation and re-enable it after installing a signed image.
4. Do not delete the existing platform keys (`PK`, `KEK`, or `db`) to work
   around one image. That weakens verification for every operating system on
   the machine.

## NVIDIA and other DKMS modules

Secure Boot can allow a signed kernel to start while rejecting an unsigned
third-party kernel module. This commonly affects NVIDIA DKMS builds. Prefer the
variant's documented driver package and signing flow. If the package manager
asks to create or enroll a Machine Owner Key (MOK):

1. Choose a temporary enrollment password when prompted.
2. Reboot into the firmware's **MOK Manager** screen.
3. Select **Enroll MOK**, review the key fingerprint, and enter the password.
4. Boot TunaOS and confirm `mokutil --sb-state` and the module load status.

For a locally built module, the general shape is:

```bash
sudo mokutil --import /path/to/your-public-key.der
sudo reboot
```

The module must also be signed with the matching private key using the kernel
tooling provided by the base (often `kmodsign` or `scripts/sign-file`) before
it is loaded. Keep private keys outside the image and never paste them into a
support request. Consult the base distribution's current DKMS documentation
for the exact key location and rebuild hook.

## Troubleshooting

### `Verification failed` or the firmware returns to its boot menu

- Confirm the machine is in UEFI mode and that the ISO checksum is correct.
- Reset no keys only as a last resort; first restore the vendor default keys
  if the firmware offers that option.
- Try the image's normal UEFI boot entry rather than a manually selected EFI
  file. Capture the firmware version and the exact loader path when reporting
  the problem.

### `Secure Boot: disabled` after installation

Check that the firmware setting was saved and that the system booted through
the intended UEFI entry. A CSM/Legacy boot cannot report Secure Boot as active.
On multi-boot systems, inspect `bootctl status` and the firmware BootOrder
before changing the TunaOS deployment.

### The NVIDIA driver does not load

First check the key and module state:

```bash
sudo mokutil --sb-state
sudo mokutil --list-enrolled
lsmod | grep -E '^nvidia|^nouveau' || true
journalctl -k -b | grep -iE 'nvidia|module verification|secure boot'
```

If the module is unsigned, rebuild it through the variant's package tooling and
complete MOK enrollment. Disabling Secure Boot is a diagnostic workaround, not
the preferred long-term fix.

### TPM or measured-boot questions

Secure Boot and TPM measured boot are related but independent. Secure Boot
checks signatures; a TPM records measurements and can unlock secrets under a
policy. See the [TunaOS TPM and disk-encryption guidance](https://github.com/tuna-os/tunaos/blob/main/docs/LUKS-TPM.md)
and your firmware documentation before changing PCR or enrollment settings.

## Further reading

- [System requirements](system-requirements) — UEFI, TPM, and hardware prerequisites.
- [TunaOS troubleshooting](tunaos/troubleshooting) — general boot and runtime diagnostics.
- [systemd-boot Secure Boot documentation](https://www.freedesktop.org/wiki/Software/systemd/systemd-boot/)
- [Fedora Secure Boot documentation](https://docs.fedoraproject.org/en-US/quick-docs/working-with-the-boot-loader/)
- [Ubuntu Secure Boot documentation](https://ubuntu.com/blog/how-to-sign-things-for-secure-boot)
- [ArchWiki Secure Boot](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot)
