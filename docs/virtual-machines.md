# Virtual machine setup

Use a VM to compare [variants](choosing-a-variant.md), test an image update,
or validate a deployment before you install on hardware. For a first install,
follow [the first VM walkthrough](tunaos/evaluating-in-a-vm.md). This guide
explains storage for bootc, recovery, and host settings beyond that walkthrough.

A container image is the input to bootc, not a bootable virtual disk. A
`podman pull` does not test firmware, the kernel, or the installer. Download
and [verify an ISO](verifying-downloads.md), then install it to a new virtual
disk with the [installation guide](installation.md).

## Hardware and firmware

Start with 2 vCPUs, 8 GiB RAM, and a 50 GiB virtual disk. The minimum is
4 GiB RAM and 25 GiB disk; leave room for image downloads, a rollback
deployment, Flatpaks, and user data. Sparse disks still need free space on
the host as they grow.

Match the ISO architecture to the guest CPU. An x86-64 guest CPU must expose
the instruction set required by the selected variant. Use host CPU features
for local KVM tests; a migration CPU model must work on every destination
host. An ARM host needs an ARM image for native acceleration; x86 emulation
is a separate, slower test.

Use UEFI firmware and keep a separate writable store for firmware variables for
each VM. Follow the [Secure Boot guide](secure-boot.md) for keys and signatures;
a hypervisor's default key set does not establish trust in a TunaOS image.
Let the installer create the EFI, boot, and root partitions. Do not put
bootc deployment directories on a host shared folder.

## KVM and libvirt on Linux

Enable hardware virtualization in the host firmware. Install QEMU/KVM,
libvirt, virt-manager, and OVMF with your host's package manager. In
virt-manager, create a VM from the ISO, select UEFI, and use VirtIO for disk
and network. Start with NAT networking and a virtual display. Eject the ISO
after installation and boot from the virtual disk.

These are **fragments** of libvirt domain XML, not a complete domain. Use
`virsh edit tunaos-test` with the VM shut down. Replace the existing CPU and
matching device elements; do not append duplicate devices.

```xml
<cpu mode='host-passthrough' migratable='off'/>
```

Inside the domain's `devices` element, a disk and NAT interface can look like:

```xml
<disk type='file' device='disk'>
  <driver name='qemu' type='qcow2'/>
  <source file='/var/lib/libvirt/images/tunaos-test.qcow2'/>
  <target dev='vda' bus='virtio'/>
</disk>
<interface type='network'>
  <source network='default'/>
  <model type='virtio'/>
</interface>
```

The `default` network must exist and be active in the same libvirt connection.
Libvirt must have permission to read the disk and ISO. Let libvirt select
firmware through its firmware configuration. Do not copy a firmware path
from another host. See the [libvirt domain format](https://libvirt.org/formatdomain.html)
for CPU, firmware, graphics, and device options.

## QEMU command line

This x86-64 example is for a Linux KVM host with a GTK display. Install QEMU
and OVMF first. Set the two firmware paths to a matching CODE/VARS pair from
your host package; names and sizes vary. Copy the VARS template once per VM.

```bash
OVMF_CODE=/usr/share/OVMF/OVMF_CODE_4M.fd
OVMF_VARS_TEMPLATE=/usr/share/OVMF/OVMF_VARS_4M.fd
cp "$OVMF_VARS_TEMPLATE" tunaos-vars.fd
qemu-img create -f qcow2 tunaos.qcow2 50G
qemu-system-x86_64 \
  -machine q35,accel=kvm -cpu host -smp 2 -m 8192 \
  -drive if=pflash,format=raw,readonly=on,file="$OVMF_CODE" \
  -drive if=pflash,format=raw,file=tunaos-vars.fd \
  -drive file=tunaos.qcow2,format=qcow2,if=virtio \
  -cdrom albacore-gnome-latest.iso -boot order=d \
  -device virtio-vga -display gtk \
  -netdev user,id=net0 -device virtio-net-pci,netdev=net0
```

On later boots, omit `-cdrom` and `-boot order=d`. Reuse the disk and VARS
file; do not run the creation commands again. For 3D acceleration, try
`-device virtio-vga-gl -display gtk,gl=on` in place of the display options.
This needs host OpenGL support. Use the basic display if it fails.

QEMU also runs on macOS and Windows, but this command's KVM and GTK settings
are Linux-specific. Select an accelerator, CPU model, firmware, and display
that your host supports; see [QEMU system invocation](https://www.qemu.org/docs/master/system/invocation.html).
Do not assume `-cpu host` works with software emulation.

## VirtualBox and Hyper-V

Use these settings for an initial evaluation. Test compatibility on your host release.

| Host | Initial settings | Compatibility checks |
| --- | --- | --- |
| VirtualBox | 64-bit Linux guest, EFI, 8 GiB RAM, 50 GiB disk, NAT, VMSVGA | Start without 3D acceleration. Check guest CPU features if the installer stops early. |
| Hyper-V | Generation 2 VM, 8 GiB RAM, 50 GiB VHDX, virtual switch | Check Secure Boot trust before booting. Use a console for first setup; confirm the switch supplies DHCP. |

A Generation 1 Hyper-V VM uses different firmware; create a Generation 2 VM
for this UEFI workflow. Neither host's virtual display is a passed-through
NVIDIA or AMD card. Follow the host documentation for
[VirtualBox](https://www.virtualbox.org/manual/ch03.html) or
[Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v).

## Cloud hypervisors

An ISO install does not produce a provider-ready cloud image by itself. For
AWS, Azure, or GCP, build or import a disk in the provider's required format.
Check architecture, UEFI, disk controller, network drivers, and guest
initialization support in that image. Confirm SSH keys and network access
before you rely on a remote-only boot. Do not assume cloud-init or automatic
expansion of the root disk is present.

There is no provider attestation or compatibility claim in this guide. Test
ordinary boot first. Secure Boot, measured boot, vTPM, and confidential VM
attestation each need a separate provider and image validation. Consult
[AWS VM Import/Export requirements](https://docs.aws.amazon.com/vm-import/latest/userguide/vmie_prereqs.html),
[Azure image preparation](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-upload-generic),
and [GCP image import](https://cloud.google.com/compute/docs/import/import-existing-image).

## Bootc storage and disk growth

The guest owns its virtual disk. Keep the installer layout unless you have a
tested reason to change it. Inspect it inside the guest:

```bash
lsblk -f
findmnt /sysroot
findmnt /var
readlink -f /home
df -h
bootc status
```

Bootc manages the image and deployments. `/var` holds persistent state;
`/home` commonly resolves to `/var/home`. `/etc` holds local configuration,
with changes carried into new deployments. OSTree-based installations use
`/sysroot/ostree` for deployment and object storage. Do not delete files there
to free space or mount a shared folder over it. Layouts can vary with the
bootc version; see the upstream [filesystem documentation](https://bootc.dev/bootc/filesystem.html)
and [sysroot reference](https://bootc.dev/bootc/bootc-sysroot.7.html).

A larger virtual disk on the host does not necessarily give the guest
a larger filesystem. Back up first, expand the host disk, then use `lsblk -f` to identify
the partition, filesystem, and any LUKS or LVM layers. If installed, `growpart`
can expand a partition into adjacent free space; it does not resize the
filesystem.

For example, **only for an unencrypted, non-LVM root on
`/dev/vda3`**, `sudo growpart /dev/vda 3` expands that partition. Then grow XFS
with `xfs_growfs` at its actual mount point, or ext4 with `resize2fs` on its
actual device. Other layouts need their own resize sequence. Do not apply
this example to an EFI or boot partition.

## Network configuration

Start with NAT and DHCP. Libvirt NAT and QEMU user
networking are different implementations; QEMU user networking does not
provide direct inbound access unless you configure a port forward.

Inside a NetworkManager-based guest, inspect the active profile:

```bash
nmcli device status
nmcli connection show --active
ip route
```

Run `sudo nmcli connection edit "PROFILE"` with the profile name from the
output above. Use the editor to set DHCP or a static address, gateway, and DNS.
Keep console access when you change a remote guest's profile. A static address
must belong to the virtual network's subnet and avoid its DHCP pool.

For LAN access, use a host bridge and attach the guest NIC to it. Bridge setup
depends on the host; Wi-Fi interfaces often cannot serve as an Ethernet
bridge. Keep unique MAC addresses and hostnames when you clone guests.

## GPU passthrough

Use a virtual GPU for ordinary desktop evaluation. A host NVIDIA card does
not need an NVIDIA guest image when the guest only sees a virtual GPU.

For PCI passthrough on KVM, first verify host IOMMU support and device group
isolation. Reserve the selected GPU and its required companion functions
for VFIO on the host, then assign them as PCI host devices in libvirt. Keep
another host display or remote console: the assigned GPU is unavailable to
the host while in use. Follow the host distribution's VFIO instructions;
IOMMU groups and reset behavior depend on the hardware.

Select a TunaOS NVIDIA image with drivers compatible with the passed-through
card. AMD passthrough needs a guest kernel, firmware, and Mesa stack that
support that card. Check Secure Boot module trust, and test a cold boot and
restart. Virtual GPU acceleration does not validate drivers for physical GPUs,
CUDA, or GPU reset behavior. See [custom images and drivers](layering.md)
before you change the OS image.

## Snapshots versus bootc rollback

`bootc rollback` selects a previous OS deployment; it is not a backup of user
data. `/var`, including home directories and application databases, persists
across deployment changes. Configuration under `/etc` follows deployment
semantics; do not use rollback as a tool to restore general configuration.
See [the rollback guide](bootc-rollback.md).

A VM snapshot can restore disk state, including user data, to an earlier
point. Shut the VM down for a simple consistent backup. Save all attached
disks, the writable store for UEFI variables, VM definition, and vTPM state if used.
A qcow2-only snapshot does not capture those other files or external services.

Keep every base and overlay disk in the chain for external snapshots.
Never use `qemu-img` to change a disk while the VM runs. See [QEMU disk images](https://www.qemu.org/docs/master/system/images.html).

Test update and rollback in a disposable copy. Record `bootc status`, update,
reboot, verify services, roll back, and reboot again. Check both the selected
image and persistent application data. Database format changes can make an
older application incompatible with the current data even after OS rollback.

## Move from a VM to hardware

Prefer a fresh install of the same image on the destination, then restore
data from a verified backup. Record the image reference and digest with
`bootc status`. Test physical storage, networking, graphics, and Secure Boot
with installation media before you replace an existing system.

Back up `/home` (its resolved location), application data in `/var`, and
configuration in `/etc`, with ownership, ACLs, extended attributes, and SELinux
labels preserved. Stop databases or use their native backup tools. Restore
home and application data selectively; compare `/etc` changes.
Do not replace the new machine's directory wholesale. Keep destination boot,
filesystem, network, and hardware configuration. Confirm that user IDs match.

Do not copy `/sysroot/ostree` as a data migration strategy. A raw clone of a virtual disk can carry the wrong partition sizes, boot entries, encryption setup,
and machine identity. Retain the original VM until you verify the restored
data and a full boot on the destination.

## CI and container tests

For repeatable VM tests, record the image digest, hypervisor version, domain
XML, and firmware version. Create a fresh disk or disposable clone per job;
keep logs and the `bootc status` output. A KVM runner needs access to
`/dev/kvm`; a VM runner needs nested virtualization support to accelerate
its guests. Separate jobs must not share writable disks or VARS files.

`systemd-nspawn` is useful for userspace service tests, but shares the host
kernel and does not exercise UEFI, guest drivers, or bootc boot selection.
Prepare a trusted root filesystem with systemd at
`/var/lib/machines/tunaos-test`. Start it in isolation with:

```bash
sudo systemd-nspawn --directory=/var/lib/machines/tunaos-test \
  --boot --private-network
```

That path must contain a complete container root, not an ISO or a mounted
bootc sysroot. Private networking has no external connectivity by default.
Use disposable data and see [systemd-nspawn](https://www.freedesktop.org/software/systemd/man/latest/systemd-nspawn.html)
for root preparation, privilege, and networking requirements. Use a VM for
installation, kernel, update/reboot, and rollback acceptance tests.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Installer does not boot | ISO checksum, guest architecture, CPU features, UEFI selection, and Secure Boot trust. |
| UEFI shell after installation | Eject the ISO, check disk boot order, and retain the VM's writable VARS file. |
| Black screen or compositor crash | Disable virtual 3D acceleration, try a basic virtual display, and inspect `journalctl -b -p err`. |
| No guest network | Virtual NIC connection, NAT network or switch state, DHCP, and `nmcli device status`. |
| Image pull fails | Guest DNS, clock, registry access, and available disk space; inspect `journalctl -b`. |
| Disk still full after host resize | Guest partition, encryption/LVM layers, and filesystem sizes. |
| Old image boots but application fails | Persistent data schema compatibility; restore application data from a matching backup if needed. |

Report the host OS, hypervisor version, guest image digest, virtual hardware,
and relevant logs when you [request help](community.md). Remove credentials
and personal data from logs before you post them.
