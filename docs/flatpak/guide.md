---
sidebar_position: 2
title: "App Guide"
---

# 📦 Using TunaOS Flatpaks

TunaOS publishes Flatpak applications through a custom OCI remote, providing sandboxed, auto-updating apps for the GNOME desktop.

## What's Available

| App | Description | Flatpak ID | Source |
|---|---|---|---|
| **Tables** 📊 | Spreadsheet app (400+ functions) | `org.tunaos.tables` | [GitHub](https://github.com/tuna-os/tables) |
| **Decks** 📽️ | Presentation app | `org.tunaos.decks` | [GitHub](https://github.com/tuna-os/decks) |
| **Letters** 📝 | Word processor | `org.tunaos.letters` | [GitHub](https://github.com/tuna-os/letters) |
| **Tavern** 🍺 | Homebrew GUI client | `dev.hanthor.Tavern` | [GitHub](https://github.com/tuna-os/Tavern) |

### Rust Previews (lighter, faster)

Native GTK4 Rust rewrites are available with a `-rust` suffix:

```bash
flatpak install tuna-os org.tunaos.tables-rust
flatpak install tuna-os org.tunaos.decks-rust
flatpak install tuna-os org.tunaos.letters-rust
```

## Adding the Remote

### One-time setup

```bash
flatpak remote-add tuna-os https://docs.tuna-os.org/flatpak/tuna-os.flatpakrepo
```

Or via the OCI registry directly:

```bash
flatpak remote-add --if-not-exists tuna-os oci+https://tuna-os.github.io/flatpak-index
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

# Rust preview
flatpak install tuna-os org.tunaos.tables-rust
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
| `Remote \"tuna-os\" not found` | Add the remote first: `flatpak remote-add tuna-os https://docs.tuna-os.org/flatpak/tuna-os.flatpakrepo` |
| App won't launch | Try `flatpak run org.tunaos.tables --log-level=debug` |
| Update fails | Run `flatpak repair` then `flatpak update` |
| Permission denied | Flatpaks are sandboxed. Use Flatseal to manage permissions |

## See Also

- [Office Suite](/gtk-office-suite) — Tables, Decks, Letters overview
- [Tavern Guide](/tavern/guide) — Homebrew GUI user guide
- [Flatpak Documentation](https://docs.flatpak.org) — official Flatpak docs
