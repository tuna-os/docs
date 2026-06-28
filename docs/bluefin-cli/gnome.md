---
sidebar_position: 5
title: "GNOME Extensions"
---

# 🖥️ GNOME Extensions

Bluefin CLI can install and manage GNOME Shell extensions and desktop customization tools:

```bash
bluefin-cli bling toggle gnome-extensions
```

## What's available

| Extension | Purpose |
|---|---|
| [AppIndicator](https://extensions.gnome.org/extension/615/) | System tray icons |
| [Blur My Shell](https://extensions.gnome.org/extension/3193/) | Blur effect for UI elements |
| [Dash to Dock](https://extensions.gnome.org/extension/307/) | Transforms dash into a dock |
| [GSConnect](https://extensions.gnome.org/extension/1319/) | KDE Connect integration |
| [Just Perfection](https://extensions.gnome.org/extension/3843/) | Fine-tune GNOME UI |
| [Tiling Assistant](https://extensions.gnome.org/extension/3733/) | Window tiling |

## Managing extensions

```bash
# List installed extensions
bluefin-cli status

# Toggle extension category
bluefin-cli bling toggle gnome-extensions

# Enable/disable specific extensions
gnome-extensions enable blur-my-shell@aunetx
```
