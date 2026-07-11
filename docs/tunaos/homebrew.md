---
sidebar_position: 8
title: "Homebrew Guide"
---

# 🍺 Using Homebrew on TunaOS

Homebrew is **baked into every TunaOS image** — no installation needed. Just open a terminal and run `brew`. This guide covers day-to-day Homebrew usage on TunaOS, from installing CLI tools to managing graphical apps with Tavern.

## Quick Start

```bash
# Update the package index
brew update

# Install a CLI tool
brew install htop neovim jq ripgrep

# Install a graphical app (cask)
brew install --cask visual-studio-code

# See what's installed
brew list

# Clean up old versions
brew cleanup
```

## What's Pre-Installed

TunaOS images ship with Homebrew and a curated set of CLI tools already available:

| Tool | Purpose | Command |
|---|---|---|
| [`eza`](https://eza.rocks) | Modern `ls` replacement | `eza --icons --long` |
| [`bat`](https://github.com/sharkdp/bat) | `cat` with syntax highlighting | `bat file.rs` |
| [`ripgrep`](https://github.com/BurntSushi/ripgrep) | Ultra-fast grep | `rg pattern` |
| [`fd`](https://github.com/sharkdp/fd) | Fast `find` | `fd '.md'` |
| [`zoxide`](https://github.com/ajeetdsouza/zoxide) | Smarter `cd` | `z tunaos` |
| [`atuin`](https://github.com/atuinsh/atuin) | Synced shell history | `atuin search` |
| [`starship`](https://starship.rs) | Cross-shell prompt | `starship preset nerd-font-symbols` |

## Installing Developer Tools

### Languages and Runtimes

```bash
# Python version management
brew install pyenv
pyenv install 3.12

# Node.js
brew install node

# Go
brew install go

# Rust
brew install rustup-init
rustup default stable

# JDK
brew install openjdk
```

### Containers

```bash
# Podman is pre-installed, but you can also install Docker CLI
brew install docker docker-compose
```

### Database Clients

```bash
brew install postgresql-client mysql-client redis
```

## Managing with Tavern (GUI)

For a graphical experience, use **[Tavern](/tavern)** — TunaOS's native GTK4 Homebrew client:

```bash
# Install Tavern via Flatpak
flatpak remote-add --user --if-not-exists tuna-os oci+https://tuna-os.github.io/Tavern
flatpak install --user tuna-os dev.hanthor.Tavern
```

Tavern provides:
- **Browse** — discover popular formulae and casks
- **Search** — instant search across 6,000+ packages
- **Install/Remove** — one-click package management
- **Brewfile support** — bulk-install entire environments
- **Dark mode** — native Libadwaita theme

## Using Brewfiles

Brewfiles let you declare your entire dev environment in a file:

```ruby
# ~/Brewfile
tap "homebrew/bundle"
tap "homebrew/cask"

# CLI tools
brew "htop"
brew "neovim"
brew "jq"
brew "ripgrep"

# Apps
cask "visual-studio-code"
cask "docker"

# Fonts
cask "font-fira-code-nerd-font"
```

Install everything at once:

```bash
brew bundle install --file ~/Brewfile
```

## Fonts

Install Nerd Fonts for terminal icons and programming ligatures:

```bash
# Search available fonts
brew search font

# Install Fira Code Nerd Font
brew install --cask font-fira-code-nerd-font

# Install multiple at once
brew install --cask font-jetbrains-mono-nerd-font font-noto-sans-nerd-font
```

## Updating Everything

```bash
# Update Homebrew itself and formulae list
brew update

# Upgrade all installed packages
brew upgrade

# Upgrade a specific package
brew upgrade neovim

# Clean up
brew cleanup --prune=all
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `brew: command not found` | Homebrew should be pre-installed. Run `brew help`. If missing, run the installer: `/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"` |
| `Permission denied` | Homebrew is installed in your home directory and doesn't need sudo. Ensure `brew doctor` passes. |
| Formula not found | Run `brew update` first to refresh the package index |
| Cask won't install | Some casks are macOS-only. Tavern filters these automatically on Linux |
| Slow `brew update` | This is normal on first run. Subsequent updates use incremental fetching |

## See Also

- [Tavern](/tavern) — graphical Homebrew client for TunaOS
- [Bluefin CLI](/bluefin-cli) — CLI tool for shell config and bundle installation
- [Homebrew Documentation](https://docs.brew.sh) — official docs
