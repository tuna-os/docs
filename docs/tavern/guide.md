---
sidebar_position: 4
title: "User Guide"
---

# 🍺 Using Tavern

Tavern is a graphical Homebrew client for Linux — a native GTK4 "App Store" for managing your command-line tools and graphical applications.

## First Run

Launch Tavern from the app grid:

```bash
flatpak run dev.hanthor.Tavern
```

Or from the terminal (if installed via Homebrew cask):

```bash
tavern
```

The main window shows:
- **Browse** — featured and popular packages
- **Search** — search bar at the top
- **Installed** — your installed formulae and casks
- **Taps** — manage Homebrew tap repositories

## Searching for Packages

Type in the search bar to search across 6,000+ formulae and casks:

```bash
# Search for "node"
Type "node" in the search bar
# Results show formulae (node) and casks (nodeclipse)
```

Linux users: macOS-only casks are automatically filtered out.

## Installing a Package

1. **Search** for the package
2. Click on it to view details (description, version, dependencies)
3. Click the **Install** button
4. Watch progress in the task manager (bottom panel)

Packages install in parallel — multiple installs at once with a global progress indicator.

## Managing Installed Packages

### View installed

Click the **Installed** tab to see everything on your system.

### Update

```bash
# Check for updates in the Installed view
# Click "Update All" or update individual packages
```

### Uninstall

1. Find the package in Installed view
2. Click the **Remove** button
3. Confirm

## Using Brewfiles

Tavern supports Brewfiles — declarative environment files:

```ruby
# ~/Brewfile
tap "homebrew/bundle"
brew "htop"
brew "neovim"
cask "visual-studio-code"
cask "font-fira-code-nerd-font"
```

### Open a Brewfile

```bash
# File → Open Brewfile
# Or launch Tavern with a Brewfile
tavern ~/Brewfile
```

Tavern displays the Brewfile contents and lets you bulk-install or remove all listed packages.

## Managing Taps

Homebrew taps are additional package repositories:

```bash
# View current taps in the Taps view
# Add a tap:
brew tap hanthor/homebrew-tap

# Remove a tap from Tavern's Taps view
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+F` | Focus search bar |
| `Ctrl+Q` | Quit |
| `Escape` | Clear search / go back |
| `Ctrl+Tab` | Switch between views |

## Tips

- **Dark Mode** — Tavern follows the system theme automatically
- **Parallel installs** — Tavern installs multiple packages simultaneously
- **Progress tracking** — the bottom panel shows overall progress
- **macOS filtering** — casks only available on macOS are hidden on Linux

## Troubleshooting

| Problem | Fix |
|---|---|
| "Homebrew not found" | Ensure Homebrew is installed: `/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"` |
| No search results | Run `brew update` in the terminal to refresh the package index |
| Flatpak won't launch | Ensure the TunaOS remote is added: `flatpak remote-add --user --if-not-exists tuna-os oci+https://tuna-os.github.io/Tavern` |
| Packages not installing | Check `brew doctor` in terminal for Homebrew issues |

## See Also

- [Homebrew on TunaOS](../tunaos/homebrew.md) — using Homebrew from the CLI
- [Bluefin CLI](/bluefin-cli) — terminal-based shell config manager
- [Contributing](CONTRIBUTING.md) — how to help develop Tavern
- [Roadmap](ROADMAP.md) — planned features
