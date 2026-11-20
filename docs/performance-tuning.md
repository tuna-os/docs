---
title: Performance Tuning for Low-Resource Hardware
description: Tune TunaOS on older computers with little memory, a slow CPU, or a hard disk drive.
---

This guide helps you make TunaOS faster on older computers. It is for systems with 4 to 6 GB of memory, an older CPU, or a hard disk drive (HDD). For power profiles and temperature checks, see [Performance Tuning and Power Management](./performance-tuning-power-management.md).

:::note
TunaOS is image-based, and the root file system is read-only. Change settings in your home directory or in `/etc`. Install extra tools in a [container](./layering.md). Check that a tool exists with `command -v <tool>` before you use it. The tools in the base image can change between variants.
:::

## Choose a lighter image

The desktop has the largest effect on memory use. Pick the lightest desktop that you can use every day.

- XFCE is a classic desktop for older hardware. The [desktop comparison](./desktop-comparison.md) lists it as the best fit for 4 to 8 GB systems.
- Niri is a tiling compositor that uses little memory. See the [Niri quickstart](./niri-quickstart.md).
- GNOME, KDE Plasma, and COSMIC give more features and use more memory.

Not every base image offers every desktop. Read the [variant guide](./choosing-a-variant.md) to see what is available. For a CPU from before 2013, use a variant that has an `x86_64_v2` build. See [System requirements](./system-requirements.md). Do not use the NVIDIA variant on a low-memory system. It needs 8 GB of memory or more.

## Measure first

Record a baseline before you change a setting.

```bash
free -h
uptime
top
```

| Symptom | Tool |
| --- | --- |
| Not enough memory | `free -h`, `vmstat 1` |
| High CPU use | `top`, `htop` |
| Slow disk | `iostat -x 1`, `iotop` |
| Slow startup | `systemd-analyze blame` |
| Services that use resources | `systemd-cgtop` |

`htop`, `iotop`, and `iostat` are not always in the base image. Install them in a container if they are missing. Press `q` to leave `top` and `systemd-cgtop`.

## Turn off animations

Animations use the GPU and the CPU. On GNOME, turn them off with `gsettings`:

```bash
gsettings set org.gnome.desktop.interface enable-animations false
```

To restore the default, run `gsettings reset org.gnome.desktop.interface enable-animations`.

On other desktops, open the system settings. Look for the pages for effects, animations, or window compositor settings, and turn them off.

## Tune memory and swap

When memory is full, the kernel moves data to swap. Swap on a disk is slow. Compressed swap in memory (zram) is faster on a system with little memory.

1. Look at the current swap devices:

   ```bash
   swapon --show
   zramctl
   ```

2. Read the current swappiness value. A higher value makes the kernel use swap sooner:

   ```bash
   sysctl vm.swappiness
   ```

3. To set a value for the current boot, run:

   ```bash
   sudo sysctl vm.swappiness=100
   ```

   This value is lost at the next boot.

4. To keep the value, create `/etc/sysctl.d/99-swappiness.conf`:

   ```ini
   vm.swappiness = 100
   ```

With zram, a high swappiness value is usual, because zram is faster than a disk. On a system that swaps to an HDD, use a low value, for example `10`, so the kernel swaps less. Change one value at a time, then compare the result with your baseline.

If `zramctl` shows no device, `zram-generator` can create one. Create `/etc/systemd/zram-generator.conf`:

```ini
[zram0]
zram-size = ram / 2
```

Then restart. This needs the `zram-generator` package in the image. If it is not there, open an issue to ask if your variant should include it.

## Tune the disk

An SSD and an HDD need different settings.

1. Find out if a disk is rotational. `1` is an HDD and `0` is an SSD:

   ```bash
   lsblk -d -o NAME,ROTA
   ```

2. Read the I/O scheduler of a disk. The active scheduler is in brackets:

   ```bash
   cat /sys/block/sda/queue/scheduler
   ```

Use the kernel default unless you measure a problem. Do not put swap on an HDD if you can use zram or an SSD. If you must use an HDD, keep the 7200 RPM minimum in [System requirements](./system-requirements.md).

## Stop services that you do not use

Each service that runs uses memory.

1. List the services that take the most time to start:

   ```bash
   systemd-analyze blame
   ```

2. List the services that are active:

   ```bash
   systemctl list-units --type=service --state=running
   ```

3. Stop a service that you do not need, and stop it so that it does not start at boot:

   ```bash
   sudo systemctl disable --now <service-name>
   ```

Read what a service does before you disable it. To undo the change, run `sudo systemctl enable --now <service-name>`. Also remove startup applications that you do not use. Do this in the settings of your desktop.

## Use less memory in applications

- Close applications that you do not use.
- Use fewer browser tabs and extensions.
- Install development tools in a container, and stop the container when you finish.

## Troubleshoot a slow system

1. Run `top`. Press `M` to sort by memory use. Find the process that uses the most.
2. Run `free -h`. If the available memory is low and swap is full, close applications or add zram.
3. Run `iostat -x 1`. If the disk is busy all the time, check for a process that reads or writes much data.
4. Run `systemd-analyze blame`. If the startup is slow, disable services that you do not need.
5. Check for heat. See [Check temperatures](./performance-tuning-power-management.md#check-temperatures).
6. If the system stays slow, choose a lighter desktop, or open an issue with your hardware and your measurements.

## Upstream documentation

- [Linux kernel documentation for `vm.swappiness`](https://docs.kernel.org/admin-guide/sysctl/vm.html)
- [`zram-generator` project](https://github.com/systemd/zram-generator)
- [`systemd-analyze` manual](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html)

## Related guides

- [System requirements](./system-requirements.md)
- [Desktop comparison](./desktop-comparison.md)
- [Image layers](./layering.md)
