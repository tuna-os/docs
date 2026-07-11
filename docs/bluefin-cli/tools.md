---
sidebar_position: 8
title: "Tools"
---

# 🧰 Tools Bundle

The **CLI tools bundle** installs essential developer utilities:

```bash
bluefin-cli bundle install cli
```

## What's installed

| Tool | Description |
|---|---|
| [`eza`](https://eza.rocks) | Modern `ls` replacement |
| [`bat`](https://github.com/sharkdp/bat) | `cat` with syntax highlighting |
| [`ripgrep`](https://github.com/BurntSushi/ripgrep) | Ultra-fast grep |
| [`fd`](https://github.com/sharkdp/fd) | Fast `find` replacement |
| [`procs`](https://github.com/dalance/procs) | Modern `ps` |
| [`du-dust`](https://github.com/bootandy/dust) | Disk usage analyzer |
| [`bottom`](https://github.com/ClementTsang/bottom) | Graphical system monitor |
| [`zoxide`](https://github.com/ajeetdsouza/zoxide) | Smarter `cd` |
| [`atuin`](https://github.com/atuinsh/atuin) | Synced shell history |

## Usage

```bash
# List files with icons and colors
eza --icons --long --git

# Search code with syntax highlighting
rg --type rust "fn main"

# Navigate with zoxide
z tunaos  # jumps to ~/projects/tunaOS
z projects  # fuzzy match

# View process tree
procs

# Check disk usage
dust
```
