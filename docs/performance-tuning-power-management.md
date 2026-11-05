---
sidebar_position: 9
title: "System performance and power management"
description: "A guide to tune performance and manage power on TunaOS. It covers CPU governors, power profiles, thermal control, profiling tools, desktop settings, and container limits."
---

# System Performance and Power Management

TunaOS runs well out of the box. This page shows how to tune it for speed or for battery life. Pick the section that matches your goal.

:::tip[Pick one goal]
Run for speed on a desk plugged to power. Run for battery life on a laptop off power. Do not mix the two settings all day. Switch them when your power source changes.
:::

## Understand System Performance

Your CPU changes its speed to save power. This speed comes from a governor. TunaOS uses the `schedutil` governor by default. It matches CPU speed to work in real time.

Choose a governor for your work:

- **`performance`**: Keep the CPU at its top speed. Use this for games or builds. It draws more power and makes the fan run.
- **`powersave`**: Keep the CPU at its lowest speed. Use this for light work. It saves power but slows heavy tasks.
- **`schedutil`**: Match CPU speed to work. This is the default. It suits most users.
- **`ondemand`**: Raise CPU speed on work. It is older than `schedutil`. Most systems use `schedutil` instead.

Check the current governor and its limits:

```bash
cpupower frequency-info
```

Install the tool with `kernel-tools`, then read the info:

```bash
sudo dnf install kernel-tools
cpupower frequency-info
```

TunaOS gives a faster kernel. The `-cachyos` flavors add the CachyOS kernel for speed. See the [Marlin page](marlin.md#cachyos-kernel-overlay) for details.

## Manage Laptop Power

Power profiles give broad control. TunaOS uses `power-profiles-daemon`. It offers three profiles:

- **`power-saver`**: Lower performance to save battery.
- **`balanced`**: Keep a balance. This is the default.
- **`performance`**: Give full power. Use it on mains power.

Set the profile from Settings, or from the command line:

```bash
powerprofilesctl get
powerprofilesctl set performance
```

Run `powerprofilesctl list` to see the profiles and their holds.

### Change Display and Wireless Power

The screen uses much power. Lower its brightness, and set a short idle timeout:

1. Lower the brightness in Settings.
2. Set a short idle timeout in Settings.

Lower wireless power use on Wi-Fi and Bluetooth to keep links stable. It can save power on bad links. Try it only if a link drops often.

### Suspend and Hibernate

TunaOS sleeps when you close the lid or run this command:

```bash
sudo systemctl suspend
```

Sleep keeps your work in RAM. It uses little power. The system wakes in seconds.

Hibernate writes your work to disk and shuts down. It uses no power.

TunaOS uses `zram` for memory by default. It uses disk as RAM. So hibernation needs room on disk. Set up swap on disk first. Then enable the hibernate target:

```bash
sudo systemctl enable hibernate.target
```

## Control Heat

Heat lowers speed. CPUs slow down when they get hot. Systems call this drop in speed throttle. TunaOS runs `thermald` to keep the CPU cool. It stays on by default:

```bash
sudo systemctl enable --now thermald
systemctl status thermald
```

Read temperatures with `sensors`. Install `lm-sensors` first:

```bash
sudo dnf install lm-sensors
sensors --auto
sensors
```

High temps hurt the CPU and battery. Keep vents clear. Use a hard, flat surface under the laptop. Air flow matters.

## Profile Performance

Find the process that uses much CPU or memory. `htop` shows live usage:

```bash
sudo dnf install htop
htop
```

Watch disk use with `iotop`, and GPU use with `nvtop` on NVIDIA systems:

```bash
sudo dnf install iotop nvtop
htop
iotop
nvtop
```

Find slow code with `perf`. It records events and shows where time goes. Install it and run a sample:

```bash
sudo dnf install kernel-tools perf
perf stat <command to run>
perf record --call-graph dwarf <command to run>
perf report
```

Turn a `perf` record into a picture. Use a flame graph tool:

```bash
perf record --call-graph dwarf -- /usr/bin/task
perf script > out.stacks
./flamegraph.pl out.stacks > out.svg
```

## Tune the Desktop

Each desktop has effects that use GPU and CPU. Turn them down for speed.

**GNOME**: Turn off effects in Settings. Go to Accessibility > Display, and turn on Reduce motion and Reduce transparency.

**KDE Plasma**: Turn off desktop effects. Open System Settings > Effects, and turn off the effects.

**COSMIC**: Use the Performance power profile. It gives full speed to the desktop.

Stop services you do not need. List the enabled services:

```bash
systemctl list-unit-files --state=enabled
```

Stop one that your work does not need:

```bash
sudo systemctl disable --now <service name>
```

## Run Containers and VMs Fast

Podman and virtual machines take CPU and memory. Set limits so one task takes all. Give a Podman container a share of CPU:

```bash
podman run --cpus 2 --memory 2g image name
```

Nested virtualization slows the host. It also needs host support. Turn it on only when your VM needs it. Give the VM its own CPUs, and do not give it more than the host has.
