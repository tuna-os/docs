---
sidebar_position: 8
title: "Vanilla vs Extra"
---

# 🔄 Vanilla vs Extra

Bluefin CLI supports two configuration profiles:

## Vanilla

A minimal, clean shell experience:

```bash
bluefin-cli bling set vanilla
```

- Default shell prompt (no Starship)
- Standard `ls` (no `eza`)
- Basic `grep` (no `ripgrep`)
- No shell history syncing

Best for: servers, minimal environments, or users who prefer stock tools.

## Extra

Full feature set with modern replacements:

```bash
bluefin-cli bling set extra
```

- Starship prompt with custom theme
- eza with icons and git status
- bat for file previews
- zoxide for smart navigation
- atuin for synced history
- Custom MOTD with system info

Best for: daily drivers, development machines, power users.

## Switching profiles

```bash
# Check current profile
bluefin-cli status

# Switch to extra
bluefin-cli bling set extra

# Switch back to vanilla
bluefin-cli bling set vanilla

# Toggle individual features
bluefin-cli bling toggle starship
bluefin-cli bling toggle eza
```
