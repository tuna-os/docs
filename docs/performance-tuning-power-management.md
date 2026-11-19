---
title: Performance Tuning and Power Management
description: Measure performance, set power profiles, check temperatures, and find bottlenecks on TunaOS.
---

# Performance Tuning and Power Management

This guide shows how to measure the performance of your TunaOS system and how to save power on a laptop. It uses standard Linux tools. TunaOS is an image-based system, so the root file system is read-only. Install extra tools in a [container](./layering.md), or layer them with `bootc` as the layering guide describes.

:::note
This guide does not list TunaOS-specific tuning values. Which tools are in the base image can change between variants. Check that a command exists with `command -v <tool>` before you rely on it. If a tool is not there, install it in a container.
:::

## Measure a baseline

Measure before you change a setting. Then you can see if the change helped.

1. Look at the CPU, memory, and load:

   ```bash
   lscpu
   free -h
   uptime
   ```

2. Look at the live use of each process with `top`, or `htop` if it is installed.
3. Save the numbers. Compare them after each change.

## Set a power profile

Use a power profile to move between saving power and speed. Most desktops show the profile in the system menu.

| Profile | Use |
| --- | --- |
| Power Saver | Longer battery life, lower speed |
| Balanced | Default for daily use |
| Performance | Highest speed, more heat and noise |

COSMIC shows *Power Saver*, *Balanced*, and *Performance* in its power and battery applet. See the [COSMIC quickstart](./cosmic-quickstart.md).

If `powerprofilesctl` is installed, you can set the profile from a terminal:

```bash
powerprofilesctl get
powerprofilesctl set power-saver
```

Use `balanced` or `performance` in place of `power-saver` to select the other profiles.

## CPU frequency and governors

The kernel scales the CPU frequency with a governor. Read the active governor and the list of choices from `sysfs`:

```bash
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors
```

The governors you see depend on the CPU driver. Common names are `performance`, `powersave`, `ondemand`, and `schedutil`. Prefer a power profile over a direct governor change, because the power profile service can overwrite your change.

## Check temperatures

A hot system slows its CPU to protect itself. This is thermal throttling.

- Install `lm_sensors` in a container, then run `sensors` to read temperatures.
- Read the raw values from `/sys/class/thermal/thermal_zone*/temp`. Each value is in thousandths of a degree Celsius.
- If the CPU speed drops under load, and the temperature is high, clean the vents and check the fan.

## Suspend and hibernate

Suspend keeps the session in memory. Hibernate writes the memory to disk.

- Use `systemctl suspend` to suspend.
- Use `systemctl hibernate` to hibernate. Hibernate needs swap space that is large enough for your memory. It is not set up for you. TunaOS does not document a supported hibernate setup yet, so test it before you rely on it.

To stop a long task from being interrupted by sleep, see the sleep settings in the [live ISO notes](./bootc-installer/live-iso.md).

## Find bottlenecks

Find what limits the system before you tune it.

| Symptom | Tool |
| --- | --- |
| High CPU use | `top`, `htop`, `perf top` |
| Slow disk | `iostat`, `iotop` |
| Slow GPU | `nvtop`, and `nvidia-smi` on NVIDIA |
| Not enough memory | `free -h`, `vmstat 1` |

Install tools that the base image does not have in a container. `perf` needs access to kernel events and can need root privileges. For an NVIDIA system, see the [GPU and CUDA setup guide](./gpu-cuda-setup-guide.md).

## Desktop settings

Each desktop has its own power and effects settings. Open the system settings of your desktop, then look for the power, battery, and animation pages. To save power:

- Lower the screen brightness, and set a short screen-off time.
- Turn off Bluetooth and Wi-Fi when you do not use them.
- Close applications that you do not use.

Compare desktops in the [desktop comparison](./desktop-comparison.md). The [Marlin](./marlin.md) variant offers a CachyOS kernel that is tuned for performance.

## Limit containers

Podman can limit the resources of a container:

```bash
podman run --cpus 2 --memory 4g <image>
```

Use these limits to keep a build or a test from using all the resources of your system.

## Related guides

- [System requirements](./system-requirements.md)
- [Layering](./layering.md)
- [GPU and CUDA setup](./gpu-cuda-setup-guide.md)
