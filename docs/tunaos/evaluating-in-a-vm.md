---
sidebar_position: 5
title: "Evaluate TunaOS in a VM"
---

# Evaluate TunaOS in a VM

A virtual machine is the safest way to try TunaOS before installing it on
physical hardware. You can keep your existing operating system and files
untouched, take a snapshot before experimenting, and delete the VM when you
are finished. The steps below use QEMU/KVM on a Linux host; the same ISO also
works with other hypervisors listed in the [system requirements](../system-requirements.md).

## Before you start

Your host needs:

| Resource | Minimum | Recommended |
| --- | ---: | ---: |
| CPU | 2 virtualization-capable cores | 4 cores |
| Memory | 4 GB for the VM | 8 GB for the VM |
| Disk | 25 GB for the VM | 50 GB or more |
| Network | An internet connection | Broadband |

Leave additional memory and CPU for the host. Hardware virtualization must be
enabled in firmware (Intel VT-x or AMD SVM); on Linux, confirm that KVM is
available with:

```bash
test -r /dev/kvm && echo "KVM is available" || echo "Enable virtualization in firmware"
```

The VM will use QEMU's user-mode networking by default. That provides outbound
internet access without putting the guest directly on your LAN. It is enough
for downloading updates and Flatpaks. Use a bridged network only when the VM
must be reachable by other devices on your network.

## 1. Download an ISO

Open the [TunaOS download page](https://tunaos.org/download) and choose a
published variant and desktop. For a first evaluation, use a standard x86_64
variant such as Albacore or Yellowfin with GNOME. Download the latest **live
ISO**, not a container image. The download page is authoritative because the
published variants and ISO names can change.

Keep the checksum beside the ISO if one is provided. Before booting, verify it
from the directory containing the files:

```bash
sha256sum -c CHECKSUMS-latest.txt
```

If the checksum file uses a different filename, follow the command shown on the
download page. Do not continue with an ISO whose checksum does not match.

## 2. Create the VM with virt-manager

Install the QEMU/KVM and libvirt tools using your distribution's package
manager. On Fedora, for example:

```bash
sudo dnf install @virtualization virt-manager
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt "$USER"
```

Log out and back in after adding yourself to the `libvirt` group. Then:

1. Start **Virtual Machine Manager** (`virt-manager`).
2. Choose **Create a new virtual machine** and select **Local install media**.
3. Select the downloaded TunaOS ISO. If it is not detected automatically,
   choose **Generic Linux 2025** (or the closest generic Linux profile).
4. Allocate 4 GB RAM and 2 CPUs. Give the VM a 25 GB virtual disk; 50 GB is
   more comfortable for updates and applications. A qcow2 disk grows as it is
   used, so the configured size is a maximum rather than an immediate 25 GB
   allocation.
5. Before starting, open **Customize configuration**. Confirm that the disk
   bus is **VirtIO**, the network is connected, and the firmware is UEFI when
   available. Keep the default NAT network for a private, outbound-only VM.
6. Start the VM and choose the live environment. Use the TunaOS installer in
   the live desktop to install to the VM's virtual disk, then reboot and detach
   the ISO when prompted.

Take a snapshot after the first successful boot. In virt-manager, select the
VM and use **Snapshots → Create**. Name it something recognizable, such as
`fresh-install`. You can return to that state after testing a configuration or
an update.

## 3. QEMU/KVM from the command line

The following uses `qemu-img` to create a sparse qcow2 disk and boots the ISO
with KVM acceleration. Install `qemu-system-x86`, `qemu-utils`, and `ovmf`
using your distribution's package manager first.

```bash
ISO="$HOME/Downloads/tunaos.iso"
DISK="$HOME/VirtualMachines/tunaos-eval.qcow2"

mkdir -p "$(dirname "$DISK")"
qemu-img create -f qcow2 "$DISK" 25G

qemu-system-x86_64 \
  -enable-kvm \
  -machine q35 \
  -cpu host \
  -smp 2 \
  -m 4G \
  -drive "file=$DISK,format=qcow2,if=virtio" \
  -cdrom "$ISO" \
  -boot order=d \
  -nic user,model=virtio \
  -display gtk
```

Install TunaOS from the live session onto the virtual disk. After the
installer finishes, stop QEMU, remove `-cdrom`, `-boot order=d`, and start it
again. The guest then boots from `tunaos-eval.qcow2`:

```bash
qemu-system-x86_64 \
  -enable-kvm -machine q35 -cpu host -smp 2 -m 4G \
  -drive "file=$HOME/VirtualMachines/tunaos-eval.qcow2,format=qcow2,if=virtio" \
  -nic user,model=virtio -display gtk
```

Create a disposable snapshot before a risky test. This leaves the original
disk unchanged and makes the snapshot easy to remove:

```bash
qemu-img snapshot -c before-test "$HOME/VirtualMachines/tunaos-eval.qcow2"
qemu-img snapshot -l "$HOME/VirtualMachines/tunaos-eval.qcow2"
# Restore it later, after shutting down the VM:
qemu-img snapshot -a before-test "$HOME/VirtualMachines/tunaos-eval.qcow2"
```

For a headless VM, replace `-display gtk` with `-nographic` and add a serial
console option. A desktop evaluation is generally easier with virt-manager,
which provides a graphical console and snapshot controls.

## Building a qcow2 image from TunaOS sources

Most evaluators should download an ISO and install it as described above. A
contributor who has cloned the [TunaOS source repository](https://github.com/tuna-os/tunaOS)
can generate a VM disk directly instead:

```bash
sudo bootc image build-to-qcow2 \
  --output-format qcow2 \
  ghcr.io/tuna-os/yellowfin:gnome
```

The repository's `scripts/build-qcow2.sh` helper is useful when developing
TunaOS locally or when the image needs the repository's install configuration:

```bash
sudo ./scripts/build-qcow2.sh yellowfin gnome ghcr
```

It produces a 40 GiB qcow2 image after installing the bootc image to a disk.
The helper needs Podman, QEMU utilities, root privileges, and enough free
space for the temporary raw image. Boot the resulting file as the `-drive`
value in the QEMU command above, omitting the ISO and installer step.

## First boot and next steps

The first boot can take longer than subsequent boots while system services
initialize. Confirm that the desktop loads, the VM has an IP address, and the
network can reach the internet. Then try a Flatpak, open a terminal, and check
the image deployment:

```bash
bootc status
ip address
```

TunaOS is image-based: updates and variant changes are staged for a reboot,
and the previous deployment remains available for rollback. Continue with
[Managing TunaOS with Bootc](bootc-usage.md) to learn about layering, updates,
switching variants, and rollback. When you are done evaluating, shut down the
guest and delete its virtual disk, or keep the snapshot for another test; your
host installation is unaffected either way.
