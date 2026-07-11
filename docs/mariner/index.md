---
sidebar_position: 1
sidebar_label: "Mariner"
status: alpha
---

:::tip[Visual overview]
Prefer a visual tour? See the **[Mariner overview →](/mariner)** landing page.
:::

**Mariner** is a GTK4 + libadwaita file manager for the GNOME desktop. It drives
the same widgets as GNOME Files (Nautilus), so it looks and behaves like home —
then adds type-ahead navigation, dual-pane split view, a Quick Look preview, a
command palette, full-text search, and a built-in disk analyzer on top.

## ✨ Key Features

* **⌨️ Type-ahead navigation** — start typing and Mariner jumps straight to the matching file.
* **🪟 Dual-pane split view** (`F3`) — two folders side by side; copy/move between them without juggling windows.
* **👀 Quick Look preview** (`Space`) — instant preview for images, video, audio, text, and code.
* **⌘ Command palette** (`Ctrl+P`) — run any command or jump to a recent folder.
* **🔍 Full-text search** (`Ctrl+F`) — file *contents*, not just names, with an optional ripgrep-powered filter.
* **📊 Built-in disk analyzer** — see what's eating your disk space without a separate app.

## Installation

### Flatpak (TunaOS remote)

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.mariner
```

### Arch Linux (AUR)

```bash
paru -S mariner-git      # or: yay -S mariner-git
```

### From source

Requires Node ≥ 22.18, GTK ≥ 4.16, and libadwaita ≥ 1.5:

```bash
git clone https://github.com/tuna-os/mariner.git
cd mariner
npm install
npm start
```

## Status

Mariner is currently **Beta** — the big features above are stable daily-driver
material; permission editing in the Properties dialog is still on the roadmap.

## Links

* [GitHub](https://github.com/tuna-os/mariner)
