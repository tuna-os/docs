# Evaluating TunaOS in a VM

The lowest-friction way to try TunaOS is a virtual machine. Nothing touches your
existing disk, you can snapshot before every experiment, and undoing the whole
thing is deleting one file.

This guide takes about 15–20 minutes end to end, most of it waiting on the ISO
download.

## Why a VM first

TunaOS is a [bootc](./bootc-usage.md) system: the OS ships as a container image
and updates are atomic. That makes it *easier* to try than a traditional distro,
but installing to real hardware still means repartitioning a disk. A VM avoids
that entirely:

- **No repartitioning.** The virtual disk is a file in your home directory.
- **Snapshots.** Take one after first boot, then experiment with layering,
  updates and rollback knowing you can return to a known-good state in seconds.
- **Parallel evaluation.** Run Albacore and Bonito side by side and compare.
- **Disposable.** Deleting the VM removes every trace.

If you decide to install on real hardware afterwards, see
[Installation](../installation.md).

## 1. Pick and download an ISO

TunaOS publishes GNOME and GNOME-HWE ISOs every two weeks to
[download.tunaos.org](https://download.tunaos.org/live-isos/):

| Variant | GNOME | GNOME (HWE) |
| --- | --- | --- |
| **Albacore** (AlmaLinux 10) | [albacore-gnome-latest.iso](https://download.tunaos.org/live-isos/albacore-gnome-latest.iso) | [albacore-gnome-hwe-latest.iso](https://download.tunaos.org/live-isos/albacore-gnome-hwe-latest.iso) |
| **Yellowfin** (AlmaLinux Kitten 10) | [yellowfin-gnome-latest.iso](https://download.tunaos.org/live-isos/yellowfin-gnome-latest.iso) | [yellowfin-gnome-hwe-latest.iso](https://download.tunaos.org/live-isos/yellowfin-gnome-hwe-latest.iso) |

If you are unsure which variant to evaluate, start with **Albacore** — see
[Choosing Your TunaOS Variant](../choosing-a-variant.md).

Pick the plain **GNOME** image for a VM. HWE exists for newer physical hardware;
inside a hypervisor the virtual devices are the same either way, so it buys you
nothing here.

Other flavors (KDE, COSMIC, Niri, XFCE, NVIDIA) ship as container images rather
than ISOs. To evaluate one of those in a VM, install a published ISO first and
then rebase to the flavor you want with `bootc switch` — see
[bootc usage](./bootc-usage.md).

## 2. VM specifications

From [System Requirements](../system-requirements.md):

| | Memory | Disk |
| --- | --- | --- |
| **Minimum** | 4 GB | 25 GB |
| **Recommended** | 8 GB | 50 GB |

Two things worth setting above the minimum:

- **Disk.** A base installation is ~15–20 GB and roughly 25–30 GB once you add
  applications, so a 25 GB disk is genuinely minimal. Use 50 GB if you can —
  qcow2 images are sparse, so an unused 50 GB disk does not occupy 50 GB on your
  host.
- **CPU.** Give it 2+ cores. The installer and the first `bootc upgrade` are
  both noticeably faster.

Enable **EFI/UEFI firmware**. TunaOS images are built for UEFI boot; a VM left on
the legacy BIOS default will not boot the installer.

## 3. QEMU/KVM with virt-manager

`virt-manager` is the graphical route and the one to use if you have not done
this before.

1. Install it. On a Fedora-family host:

   ```bash
   sudo dnf install virt-manager
   ```

   On a Debian-family host:

   ```bash
   sudo apt install virt-manager
   ```

2. Launch **Virtual Machine Manager** and choose
   **File → New Virtual Machine**.
3. Select **Local install media (ISO image or CDROM)** and point it at the ISO
   you downloaded.
4. Set memory and CPUs (8192 MB, 2 cores).
5. Set the disk size (50 GB).
6. On the final screen, tick **Customize configuration before install**, then in
   **Overview** set **Firmware** to **UEFI**. Apply, then **Begin Installation**.

## 4. QEMU from the command line

If you would rather not install virt-manager, `qemu-system-x86_64` is enough.

Create the disk once:

```bash
qemu-img create -f qcow2 tunaos.qcow2 50G
```

Boot the installer:

```bash
qemu-system-x86_64 \
  -enable-kvm \
  -m 8192 \
  -smp 2 \
  -bios /usr/share/OVMF/OVMF_CODE.fd \
  -drive file=tunaos.qcow2,format=qcow2,if=virtio \
  -cdrom albacore-gnome-latest.iso \
  -boot d \
  -device virtio-vga-gl -display gtk,gl=on \
  -netdev user,id=net0 -device virtio-net-pci,netdev=net0
```

Notes on the flags that matter:

- `-enable-kvm` is what makes this usable rather than glacial. It needs
  `/dev/kvm`; add yourself to the `kvm` group if you get a permissions error.
- `-bios` points at OVMF, the UEFI firmware. The path differs by host distro —
  `/usr/share/OVMF/OVMF_CODE.fd` on Debian/Ubuntu,
  `/usr/share/edk2/ovmf/OVMF_CODE.fd` on Fedora. Install the `ovmf` (or `edk2-ovmf`)
  package if the file is missing.
- `virtio` for disk and network is markedly faster than the emulated defaults.
- `-device virtio-vga-gl -display gtk,gl=on` gives accelerated graphics, which a
  GNOME desktop appreciates. Drop both if your host lacks the support.

After the install finishes, drop `-cdrom` and `-boot d` to boot from the disk.

## 5. First boot

Run through the installer, reboot, and complete GNOME's initial setup.

Once you are at a desktop, take a snapshot before doing anything else — this is
the state you will want to come back to:

```bash
# virt-manager: Manage snapshots → +
# CLI, with the VM shut down:
qemu-img snapshot -c clean-install tunaos.qcow2
```

Then confirm the system is what you expect:

```bash
bootc status
```

That prints the container image the system is booted from, which is the thing
that makes this a bootc system rather than a package-managed one.

## 6. What to try next

With a snapshot in hand, the interesting parts are cheap to explore:

- **Layer a package** and reboot into it.
- **Update** with `bootc upgrade`, then **roll back** with `bootc rollback` and
  watch the previous image come back intact.
- **Rebase** to a different desktop flavor, or a different variant entirely,
  with `bootc switch`.

All three are covered in [bootc usage](./bootc-usage.md).

If TunaOS suits you, [Installation](../installation.md) covers real hardware,
and [System Requirements](../system-requirements.md) has the full compatibility
detail.

## Other hypervisors

VMware, VirtualBox and Parallels are all supported — see
[System Requirements](../system-requirements.md). The specifications above apply
to any of them; the one setting to check in each is that the VM is set to
**UEFI** rather than legacy BIOS firmware.
