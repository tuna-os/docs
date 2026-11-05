---
sidebar_position: 2
---

# Getting Started with TunaOS

Start here to choose an image and a way to try it. If you have no preference,
choose **Albacore with GNOME**, then [test it in a VM](#test-in-a-vm-first).
You can make these choices in a few minutes; the download and installation
will take longer.

## 1. Choose your variant and desktop

Follow these three questions in order. Keep your choice from each step.

1. **Which base and update pace do you want?**
   - Unsure, or want a stable daily desktop? Choose **[Albacore](albacore.md)**
     (AlmaLinux 10).
   - Want newer packages on an enterprise base for development? Choose
     **[Yellowfin](yellowfin.md)** (AlmaLinux Kitten).
   - Need to test upcoming Enterprise Linux changes? Choose
     **[Skipjack](skipjack.md)** (CentOS Stream).
   - Want Fedora's newer kernel and tools, and accept a beta? Choose
     **[Bonito](bonito.md)**. For Ubuntu, Arch, Debian, or other preferences,
     use the [full variant guide](choosing-a-variant.md).
2. **What hardware will run it?**
   - A VM or a standard PC? Keep the regular image.
   - An older Intel/AMD CPU? Check the
     [CPU requirements](system-requirements.md#architecture-support) for
     Albacore or Yellowfin's legacy CPU option before you download.
   - A new PC that needs a newer kernel? Check the **HWE** edition.
   - NVIDIA graphics for CUDA, AI, or graphics work? Check the **NVIDIA** edition.
   - ARM hardware, including Apple Silicon? Check the architecture and
     device-specific instructions in the [variant guide](choosing-a-variant.md)
     before you choose media. An ARM image is not a universal ARM installer.
3. **How do you want to use the desktop?**
   - Unsure or want the default desktop? Choose **GNOME**.
   - Want many desktop settings? Choose **KDE Plasma**.
   - Want keyboard-driven tiling? Choose **[Niri](niri-quickstart.md)**.
   - Want to try System76's desktop? Choose **[COSMIC](cosmic-quickstart.md)**.
   - Prefer a lightweight classic desktop? Check **XFCE** availability.
     For Pantheon, see **[Gurnard](gurnard-pantheon.md)**.

For example, a stable daily desktop in a VM leads to **Albacore + regular +
GNOME**. A developer on a new laptop may choose **Yellowfin + HWE + GNOME**.
See the [desktop comparison](desktop-comparison.md) for more detail.

Check the [system requirements](system-requirements.md) before you start:
plan for at least 4 GB RAM and 20 GB of disk space on physical hardware.
Confirm that your selected variant publishes the architecture and desktop
you need. GNOME and GNOME-HWE have pre-built ISOs; other flavors can need
an image switch after installation or a custom ISO.

## 2. Choose your start path

### Fresh install

Use this path to install on a physical machine.

1. Back up your files. The installer can erase the selected disk.
2. Open [Downloads](/download) and select your ISO. For the default choice,
   get [Albacore GNOME](https://download.tunaos.org/live-isos/albacore-gnome-latest.iso).
3. [Verify the download](verifying-downloads.md), then write the ISO to a USB
   drive with Rufus or another image writer. Check the destination: the image writer erases that USB drive.
4. Boot the USB from your firmware's boot menu. Review the
   [Secure Boot guide](secure-boot.md) if it does not boot.
5. Follow the [installation guide](installation.md) and
   [installer walkthrough](installer.mdx). Check the target disk before
   you confirm installation, then reboot and remove the USB.

### Rebase from an existing bootc system

Use this path if you already run a bootc system. Back up your files first.
Read the [bootc-migrate guide](bootc-migrate/index.md) to install the tool and
check its source-system, filesystem, and backend support. For a system that uses a package manager instead of bootc, use the fresh
install path.

For Albacore GNOME, check the migration before making changes:

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/albacore:gnome --dry-run
```

Resolve any reported problems, then run:

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/albacore:gnome
sudo systemctl reboot
```

For another flavor, use the exact image reference on its variant page.
The migration carries user data and configuration across and keeps the old
deployment available as a fallback. After reboot, check the desktop, network,
files, and applications. Read the migration guide before you commit the
migration. The `commit` command removes the old OSTree fallback. Changes to
the two systems' `/var` trees do not stay in sync.

### Test in a VM first

Use this path to try the desktop on a virtual disk, separate from your host OS.

1. Download and [verify](verifying-downloads.md) the Albacore ISO with regular GNOME.
2. Create a VM in virt-manager or your hypervisor. Set **UEFI firmware**,
   **2 CPU cores**, **8 GB RAM**, and a **50 GB virtual disk**. The minimum
   VM size is 4 GB RAM and 25 GB disk.
3. Attach the ISO as the VM's boot media, boot it, and install onto the virtual
   disk. Disconnect the ISO after installation and boot from that disk.
4. Complete initial setup, then take a snapshot before you experiment.

The [VM walkthrough](tunaos/evaluating-in-a-vm.md) has QEMU commands and
host setup instructions. To inspect an OS image with a container runtime:

```bash
podman pull ghcr.io/tuna-os/albacore:gnome
podman image inspect ghcr.io/tuna-os/albacore:gnome
```

A container image pull does not boot a desktop or create a VM. Use the ISO
path above to test the full desktop.

## 3. After your first boot

1. Complete the initial setup wizard and connect to the network.
2. Check the active image with `bootc status`. Read
   [updates and rollback](bootc-rollback.md) before your first update.
3. Install desktop apps from Flathub in the Software app. Use Homebrew for
   command-line tools; see the [Homebrew guide](tunaos/homebrew.md).
4. Open desktop settings to set your display, keyboard, and appearance.
   Use the [customization guide](layering.md) for packages and custom images,
   or the [COSMIC](cosmic-quickstart.md) and [Niri](niri-quickstart.md) guides
   for those desktops.
5. If something fails, check the [FAQ](faq.md) and
   [problem diagnosis guide](tunaos/troubleshooting.md). Ask in
   [Matrix](https://matrix.to/#/%23tunaos:reilly.asia) or report a problem in
   [TunaOS issues](https://github.com/tuna-os/tunaOS/issues). Include your
   hardware, image from `bootc status`, and the steps that led to the problem.
