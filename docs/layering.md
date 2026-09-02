---
sidebar_position: 7.5
sidebar_label: "Layering & customization"
title: "Package layering and image customization with bootc"
description: "Learn how to customize TunaOS systems: when to use containers/Flatpaks, transient debugging with usr-overlay, building derived bootc images, and configuring kernel arguments."
---

# Package Layering & Image Customization

TunaOS is an immutable operating system managed by [bootc](https://github.com/bootc-dev/bootc). TunaOS mounts `/usr` read-only at runtime. That keeps your system stable, predictable, and safe to roll back.

This guide explains how to install software and customize your TunaOS installation:
1. When to use Flatpak, Homebrew, or container environments.
2. How to use `bootc usr-overlay` for transient debugging.
3. How to build a derived bootc image, then switch to it.
4. How to manage kernel arguments and boot configurations.

---

## Choosing the Right Customization Method

Before you change the base image, choose the lightest method that fits your use case:

| Use Case | Recommended Method | Example |
| --- | --- | --- |
| **Desktop applications** | [Flatpak](https://flathub.org/) | `flatpak install flathub org.mozilla.firefox` |
| **Command-line tools & utilities** | [Homebrew](https://brew.sh/) | `brew install ripgrep neovim starship` |
| **Development libraries & compilers** | **Toolbox / Distrobox** | `toolbox create && toolbox enter` |
| **Temporary debugging / troubleshooting** | **`bootc usr-overlay`** | `sudo bootc usr-overlay && sudo dnf install strace` |
| **Permanent system daemons, kernel modules, base packages** | **Derived bootc image** | `FROM ghcr.io/tuna-os/albacore:latest` Containerfile |

---

## Transient Customization: `bootc usr-overlay`

When you need temporary access to tools like `strace`, `gdb`, or `tcpdump` on the host, use `bootc usr-overlay`.

`bootc usr-overlay` sets up a writable `overlayfs` on `/usr` for the current boot session:

```bash
# Enable writable overlay on /usr
sudo bootc usr-overlay

# Install debugging packages using the native package manager
sudo dnf install -y strace tcpdump
```

:::warning[Reset on Reboot]
All modifications made to `/usr` through `bootc usr-overlay` disappear when you reboot the system.

However, `/etc` and `/var` are persistent writable directories on TunaOS. Configuration files and application data under `/etc` or `/var` stay in place after a reboot.
:::

---

## Persistent Customization: Building a Derived Image

`bootc` has no in-place `bootc layer add` command. To make a change persistent on bootc, you build a derived container image.

A derived image gives you three things:
- **Full reproducibility**: Your entire OS definition lives in a Git repository and `Containerfile`.
- **Atomic updates and rollbacks**: If an update or a package breaks the system, `sudo bootc rollback` puts the last good state back.
- **Supply-chain control**: You can build, test, and scan the image in CI before it reaches hardware.

### Step 1: Create a `Containerfile`

Create a `Containerfile` that starts `FROM` an official TunaOS base:

```dockerfile
FROM ghcr.io/tuna-os/albacore:latest

# Install additional packages into the image
RUN dnf install -y \
    zsh \
    tmux \
    wireguard-tools \
    && dnf clean all

# Copy custom systemd service files or scripts
COPY my-custom-daemon.service /etc/systemd/system/
RUN systemctl enable my-custom-daemon.service
```

### Step 2: Build and Push the Container Image

Build the container image using Podman and push it to a container registry (such as GitHub Packages, Quay.io, or Docker Hub):

```bash
# Build the image
podman build -t quay.io/myusername/my-tunaos:latest .

# Push to your registry
podman push quay.io/myusername/my-tunaos:latest
```

### Step 3: Switch Your System to the Derived Image

Use `bootc switch` to rebase your operating system to your new image:

```bash
# Switch to the custom image
sudo bootc switch quay.io/myusername/my-tunaos:latest

# Reboot into the custom deployment
sudo systemctl reboot
```

To pull and stage a later build of your image:

```bash
sudo bootc upgrade
sudo systemctl reboot
```

---

## Kernel Arguments (`kargs.d`)

On bootc you do not edit the GRUB configuration to change a kernel argument. The arguments live in the image, in TOML files under `/usr/lib/bootc/kargs.d/`. bootc reads them when it stages a deployment, so a rollback takes the old arguments back with it.

### Kernel Arguments in an Image

A build script, an overlay, or a package drops a TOML file into `/usr/lib/bootc/kargs.d/`.

The TunaOS NVIDIA overlay is a live example. It writes `/usr/lib/bootc/kargs.d/00-nvidia.toml`:

```toml
kargs = ["rd.driver.blacklist=nouveau", "modprobe.blacklist=nouveau", "nvidia-drm.modeset=1"]
```

To add your own argument, write the same kind of file in your `Containerfile`:

```dockerfile
RUN mkdir -p /usr/lib/bootc/kargs.d && \
    printf 'kargs = ["intel_iommu=on"]\n' > /usr/lib/bootc/kargs.d/10-custom.toml
```

Build the image, `bootc switch` to it, then reboot. The new argument is on the next boot.

### Inspect the Boot Entries

To see the deployments bootc knows about, and the boot loader state behind them:

```bash
# Deployments: booted, staged, and rollback
bootc status

# UEFI and systemd-boot state
bootctl status

# The kernel command line of the running system
cat /proc/cmdline
```

---

## Rollback & Status Inspection

You can view all staged, active, and rollback deployments with `bootc status`:

```bash
bootc status
```

If an updated image fails or causes issues, roll back to the previous deployment at any time:

```bash
# Roll back to the previous deployment
sudo bootc rollback

# Reboot into the previous image
sudo systemctl reboot
```

---

## Related Documentation

- [Manage images with bootc](./tunaos/bootc-usage.md)
- [Rollback and update guide](./bootc-rollback.md)
- [Installation guide](./installation.md)
- [Frequently asked questions](./faq.md)
- [Verify downloads and images](./verifying-downloads.md)
