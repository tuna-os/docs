---
sidebar_position: 8.5
description: "Tune TunaOS for older or low-memory machines. Turn down effects, pick a light desktop, expand memory with zram, and stop services you do not need."
---

# Performance Tuning for Low-Spec Hardware

TunaOS runs well on modern hardware. These tips make older machines fast. The targets of this page are systems with 4 to 6 GB of RAM and older or small CPUs. These tips suit any TunaOS variant.

Some tips cost nothing. Others change how your system uses memory and disk. Read the sections in order, or jump to the one that matches your problem.

---

## Check What Your System Uses

Know where your system spends its time before you change anything. Run these tools to see the truth.

- **Memory**: Run `free -h`. Look at the `avail` column. A low number means your system runs low on RAM.
- **Per-process use**: Run `htop`. It shows each process and its CPU and memory use.
- **Per-group use**: Run `systemd-cgtop`. It shows which service group uses the most CPU and memory.
- **Disk space**: Run `df -h`. The system slows when the root partition is full.

The [performance and power management guide](/performance-tuning-power-management) goes deeper. It shows `htop` and `perf`. It also finds slow code. This page focuses on old and low-memory machines.

---

## Pick a Light Desktop

The desktop takes much RAM and GPU on weak hardware. Use a lighter desktop to free resources for your work.

- **GNOME**: Rich and modern. It uses the most RAM and effects. Best on 8 GB or more.
- **XFCE**: Light and classic. It uses little RAM and runs fast on old CPUs. Pick this for 4 to 6 GB.
- **Niri**: A modern tiling screen. It uses less than GNOME and needs few mouse clicks. Pick this for a clean, fast look.
- **KDE Plasma**: Lighter than it looks, but its effects cost GPU on weak hardware.

See [Desktop comparison](desktop-comparison.md) for the full table. Pick an image that ships your desktop. Read [the variant guide](choosing-a-variant.md) for help.

To switch desktops, install one, then log out and pick it on the login screen. For example:

```bash
sudo dnf install @xfce-desktop
```

Log out, click the gear menu on the login screen, and choose XFCE. Then log in.

---

## Turn Down Effects and Animations

These desktops draw animations. They also show clear windows. These look nice but use GPU and CPU. Turn them down on weak hardware.

**GNOME**: Go to Settings > Accessibility. Turn on **Reduce motion** and **Reduce transparency**. This stops most animations.

To go further, turn off animations with one setting:

```bash
gsettings set org.gnome.desktop.interface enable-animations false
```

Use `true` to turn them back on.

**Niri** and other **Mutter** desktops use the same setting:

```bash
gsettings set org.gnome.desktop.interface enable-animations false
```

**KDE Plasma**: Open System Settings > Window Management > Window Effects. Turn off **Window animation** and **Fade**.

Disable extensions you do not use. Each one uses memory. In GNOME, open Extensions and turn off the ones you never click.

---

## Give Your Memory More Room

Low RAM is the main slow-down on old machines. When RAM fills, the system swaps to disk. Disk swap is slow. You can make it faster.

TunaOS already uses **zram** by default. zram makes a fast swap area in RAM instead of on disk. It uses a little CPU, but it is much faster than disk swap. Keep it on.

Check your swap and zram:

```bash
swapon --show
lsblk -o NAME,SIZE,STATUS | grep zram
```

Swapiness decides how hard the system swaps. The kernel default is 60. Many distros lower it to keep apps in RAM. On a low-memory machine with zram, a higher value keeps more apps open:

```bash
sudo sysctl vm.swappiness=100
```

Make it stick across reboots:

```bash
echo 'vm.swappiness=100' | sudo tee /etc/sysctl.d/60-lowspec.conf
```

A value of 100 suits tight RAM with zram. Lower values keep more apps in RAM. Test your speed and adjust to taste.

---

## Stop Services You Do Not Need

Every service that runs uses RAM and CPU. Some start only when you log in. Others run all the time. Stop the ones your work does not need.

Per-user services start when you log in. List them:

```bash
systemctl --user list-unit-files --state=enabled
```

Stop one you do not need:

```bash
systemctl --user disable --now <service name>
```

System-wide services run for the whole machine. List them:

```bash
systemctl list-unit-files --state=enabled
```

Stop one that your work does not need:

```bash
sudo systemctl disable --now <service name>
```

Check Bluetooth and print services if you never use them. Do not stop network, display, or login services. Those keep your system alive.

To read a service before you stop it:

```bash
systemctl cat <service name>
```

---

## SSD or HDD

The type of your disk changes how you tune swap.

**On an SSD**: Swap works well. Keep the default settings. zram still helps, since RAM beats any disk.

**On an HDD**: Swap is slow, and it hurts more here. Use zram in place of disk swap when you can. Keep the root partition clear, since a full disk slows the system more on an HDD.

---

## When Your System Feels Slow

Use this checklist when a system runs slow. Work from the top down.

1. **Too many apps open?** Check `htop`. Close what you do not use.
2. **Low memory?** Check `free -h`. Add zram or stop services.
3. **Slow disk?** Check `df -h`. Free space on the root partition.
4. **Heavy desktop?** Turn off animations, or switch to XFCE or Niri.
5. **One process uses much CPU?** Find it in `htop`. Decide if you need it.

Write down what you change, then test again. If a change makes things worse, undo it with the same command.

---

## More Help

This page covers the low-spec basics. The [performance guide](/performance-tuning-power-management) covers more. It lists governors, power profiles, heat, and tools to find slow code. Pick one goal, either speed or battery life, and do not mix them all day.

To learn more, read [the variant guide](choosing-a-variant.md) and [Desktop comparison](desktop-comparison.md).
