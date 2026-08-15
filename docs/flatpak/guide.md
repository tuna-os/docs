---
sidebar_position: 2
title: "App Guide"
---

# 📦 Using TunaOS Flatpaks

TunaOS publishes its Flatpak applications through a custom OCI remote. Each app runs in a sandbox, updates itself automatically, and targets the GNOME desktop.

## What's Available

| App | Description | Flatpak ID | Source |
|---|---|---|---|
| **Tables** 📊 | Pure Rust GTK4 spreadsheet | `org.tunaos.tables` | [GitHub](https://github.com/tuna-os/gtk-office-suite) |
| **Decks** 📽️ | Pure Rust GTK4 presentation app | `org.tunaos.decks` | [GitHub](https://github.com/tuna-os/gtk-office-suite) |
| **Letters** 📝 | Pure Rust GTK4 word processor | `org.tunaos.letters` | [GitHub](https://github.com/tuna-os/gtk-office-suite) |
| **Tavern** 🍺 | Homebrew GUI client | `org.tunaos.tavern` | [GitHub](https://github.com/tuna-os/Tavern) |
| **Mariner** 🛠️ | GTK4 + libadwaita file manager (GNOME Files alternative with type-ahead, dual-pane, Quick Look) | `org.tunaos.mariner` | [GitHub](https://github.com/tuna-os/mariner) |
| **Finupdate** 🔄 | GTK4/libadwaita update frontend (bootc/flatpak/brew/distrobox) | `org.tunaos.finupdate` | [GitHub](https://github.com/tuna-os/finupdate) |
| **Mandelbrot** 🌀 | GNOME Matrix messaging client (forked from Fractal, MatrixRTC voice/video) | `org.tunaos.mandelbrot` | [GitHub](https://github.com/tuna-os/mandelbrot) |
| **Dualcut** ✂️ | GNOME video editor (manual timeline + live JSON/scriptable editing) | `org.tunaos.dualcut` | [GitHub](https://github.com/tuna-os/dualcut) |
| **TunaOS Installer (COSMIC)** 🚀 | Live-ISO installer frontend | `org.tunaos.InstallerCosmic` | [GitHub](https://github.com/tuna-os/tuna-installer-cosmic) |
| **TunaOS Installer (KDE)** 🌊 | Live-ISO installer frontend | `org.tunaos.InstallerKde` | [GitHub](https://github.com/tuna-os/tuna-installer-kde) |
| **TunaOS Installer (Niri)** ⚡ | Live-ISO installer frontend | `org.tunaos.InstallerNiri` | [GitHub](https://github.com/tuna-os/tuna-installer-niri) |
| **TunaOS Installer (XFCE)** 🐭 | Live-ISO installer frontend | `org.tunaos.InstallerXfce` | [GitHub](https://github.com/tuna-os/tuna-installer-xfce) |
| **bootc-installer** 💾 | GTK4/libadwaita graphical installer (Flatpak) for bootc images | `org.bootcinstaller.Installer` | [GitHub](https://github.com/tuna-os/bootc-installer) |

> The list above mirrors the apps published to the tuna-os OCI index
> (`tunaos.org/flatpak/index/static`). Installer frontends are also
> preinstalled on the matching TunaOS live ISOs.

## Adding the Remote

### One-time setup

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
```

### Verify the remote

```bash
flatpak remotes | grep tuna-os
```

## Installing Apps

### CLI installation

```bash
# Single app
flatpak install tuna-os org.tunaos.tables

# Multiple apps at once
flatpak install tuna-os org.tunaos.tables org.tunaos.decks org.tunaos.letters

# Everything on the remote
flatpak install tuna-os org.tunaos.tables org.tunaos.decks org.tunaos.letters \
  org.tunaos.tavern org.tunaos.mariner org.tunaos.finupdate \
  org.tunaos.mandelbrot org.tunaos.dualcut
```

### GUI installation

Open **GNOME Software** or **KDE Discover** — after adding the remote, TunaOS apps appear in the app list for one-click installation.

## Managing Apps

### Update all Flatpaks

```bash
flatpak update
```

### List installed Flatpaks

```bash
flatpak list --app
```

### Remove an app

```bash
flatpak uninstall org.tunaos.tables
```

### Check for updates

```bash
flatpak update --check
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `Remote \"tuna-os\" not found` | Add the remote first: `flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo` |
| App won't launch | Try `flatpak run org.tunaos.tables --log-level=debug` |
| Update fails | Run `flatpak repair` then `flatpak update` |
| Permission denied | Flatpaks are sandboxed. Use Flatseal to manage permissions |

## See Also

- [Office Suite](/office) — Tables, Decks, Letters overview
- [Tavern Guide](/docs/tavern/guide) — guide to the Homebrew GUI
- [Flatpak Documentation](https://docs.flatpak.org) — official Flatpak docs
