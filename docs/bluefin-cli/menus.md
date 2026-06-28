---
sidebar_position: 6
title: "Menu System"
---

# 🎯 Menu System

Bluefin CLI provides an interactive TUI menu system for easy navigation of all features:

## Main Menu

Run without arguments to open the main menu:

```bash
bluefin-cli
```

The menu presents:
- **Bling** — toggle shell enhancements
- **Bundles** — install curated tool sets
- **MOTD** — configure the Message of the Day
- **Wallpapers** — install desktop backgrounds
- **Starship** — browse and apply prompt themes
- **Status** — view current configuration

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `↑`/`↓` | Navigate items |
| `Enter` | Select item |
| `Esc` | Back / exit |
| `Tab` | Switch panes |
| `Ctrl+C` | Quit |

## Command-line mode

All menu items are also available as CLI flags for scripting:

```bash
# Toggle bling features from CLI
bluefin-cli bling toggle starship

# Install a bundle non-interactively
bluefin-cli bundle install cli --yes

# Show status as JSON
bluefin-cli status --json
```
