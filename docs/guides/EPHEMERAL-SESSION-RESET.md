# Ephemeral Session Reset for Shared Workstations

TunaOS gives shared workstations an immutable system base. This guide shows how to set up an ephemeral guest session that ends on inactivity and clears user state.

## Overview

A shared workstation serves many users in sequence:
- School computer labs
- Public library terminals
- Clinic rooms and nurse stations
- Shop floor and kiosk stations

On a standard installation, files written to `/home` stay on disk between logins. To protect user privacy and prevent storage buildup, you can configure the workstation to:
1. Automatically log out or reboot when the session is idle.
2. Mount the user home directory on a temporary filesystem (`tmpfs`) so data vanishes on session end.

## Step 1: Automatic Logout on Inactivity

Use `systemd-logind` to enforce a workstation-wide idle timeout.

Create a configuration drop-in file at `/etc/systemd/logind.conf.d/idle-timeout.conf`:

```ini
[Login]
IdleAction=reboot
IdleActionSec=10min
```

You can set `IdleAction` to `reboot`, `poweroff`, `lock`, or `suspend`. For shared public stations, `reboot` guarantees that the system restarts into a fresh state.

Restart the service or reboot the system to apply:

```bash
sudo systemctl restart systemd-logind
```

## Step 2: Ephemeral Home Directory via tmpfs

To discard downloads, caches, browser history, and session credentials on logout, mount the guest user's home directory in RAM using `tmpfs`.

Add an entry to `/etc/fstab`:

```text
tmpfs /home/guest tmpfs size=2G,mode=0700,uid=guest,gid=guest,nodev,nosuid 0 0
```

Because `tmpfs` lives in memory, the system drops all files in `/home/guest` when the machine reboots.

Alternatively, use `pam_mkhomedir` alongside a script to create directories for the desktop at login.

## Step 3: Automatic Guest Login

Configure your display manager to log in to the guest account automatically at boot.

For GDM (GNOME Display Manager), configure `/etc/gdm/custom.conf`:

```ini
[daemon]
AutomaticLoginEnable=True
AutomaticLogin=guest
```

## What is Cleared vs. What Persists

It is important to understand the boundaries of this setup:

| Path / Component | Behavior | Notes |
| :--- | :--- | :--- |
| `/home/guest/*` | **Cleared** | Ephemeral `tmpfs` is wiped at reboot or unmount. |
| `/tmp` | **Cleared** | Standard system `tmpfs` is wiped at reboot. |
| `/var/tmp` | **Persists** | Files in `/var/tmp` survive reboots. Clear via `tmpfiles.d` if needed. |
| `/var/log` | **Persists** | System logs survive reboots. |
| `/usr` | **Read-only** | Immutable base OS image; unmodified during user sessions. |

Ensure your applications do not write sensitive user tokens to persistent locations like `/var/tmp`.
