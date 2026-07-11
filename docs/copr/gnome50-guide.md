---
sidebar_position: 2
title: "GNOME 50 on EL10 Guide"
---

# 🖥️ Getting GNOME 50 on CentOS Stream 10

CentOS Stream 10 ships with GNOME 46. The **github-copr** project provides GNOME 50 packages for EL10, giving you the latest GNOME experience on a stable Enterprise Linux base.

## What You Get

| Feature | EL10 Stock | With COPR |
|---|---|---|
| GNOME version | 46 | **50** |
| Performance | Good | **Improved** — faster shell, less jank |
| HDR support | ❌ | ✅ |
| Color management | Basic | **Advanced** — ICC profiles per display |
| Core apps | Outdated | **Latest** — Files, Text, Calendar, etc. |
| Wayland | ✅ | ✅ (improved) |

## Quick Install

Run these commands as root on a CentOS Stream 10 system:

```bash
# Enable the COPR repository
dnf -y install dnf-plugins-core
dnf copr enable -y jreilly1821/c10s-gnome-50

# Install GNOME 50
dnf -y install gnome-shell gdm mutter gnome-session nautilus gnome50-el10-compat

# Reboot into the new GNOME
systemctl reboot
```

## Detailed Installation

### Step 1: Enable COPR

```bash
# Install prerequisites
sudo dnf install -y dnf-plugins-core

# Enable the TunaOS GNOME 50 COPR
sudo dnf copr enable -y jreilly1821/c10s-gnome-50
```

### Step 2: Install GNOME 50

```bash
# Install the full GNOME 50 desktop
sudo dnf install -y gnome-shell gdm mutter gnome-session nautilus gnome50-el10-compat
```

The `gnome50-el10-compat` package provides EL10-specific compatibility fixes that aren't in upstream Fedora.

### Step 3: Reboot

```bash
sudo systemctl reboot
```

After reboot, you should see GNOME 50 at the login screen.

## Using with TunaOS

If you're already running a TunaOS image, you get GNOME 50 automatically on supported variants:

```bash
# Yellowfin and Albacore GNOME variants already include GNOME 50
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome
sudo systemctl reboot
```

## Verifying the Installation

```bash
# Check GNOME version
gnome-shell --version
# Should show: GNOME Shell 50.x

# Check mutter version
mutter --version

# Verify via Settings → About
```
## Troubleshooting

| Problem | Fix |
|---|---|
| `dnf copr enable` fails | Ensure `dnf-plugins-core` is installed |
| GDM won't start | Check `journalctl -u gdm -b` for errors |
| GNOME Shell crashes | Try `gnome-shell --replace` from a VT (`Ctrl+Alt+F2`) |
| Missing extensions | Some GNOME 46 extensions may not work with GNOME 50. Check [extensions.gnome.org](https://extensions.gnome.org) for updates |
| Slow after upgrade | Run `sudo dnf update` and reboot. Rebuild font cache: `fc-cache -f` |

## Architecture

Packages are built automatically in COPR (`jreilly1821/c10s-gnome-50`) targeting `epel-10-x86_64`:

- **~50 packages** pull directly from Fedora Rawhide dist-git
- **8 packages** require modified specs (checked into [github-copr](https://github.com/tuna-os/github-copr))
- **1 package** (`gnome50-el10-compat`) is EL10-specific

See [ARCHITECTURE](ARCHITECTURE.md) for the full build details.

## See Also

- [COPR Builds Architecture](ARCHITECTURE.md) — how the build pipeline works
- [GNOME 49 on CentOS Bootc](gnome49-centos-bootc.md) — older GNOME 49 guide
- [TunaOS Installation](../installation.md) — getting started with TunaOS
