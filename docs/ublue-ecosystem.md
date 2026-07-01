---
sidebar_position: 11
title: "Universal Blue Ecosystem"
---

# 🌐 TunaOS and the Universal Blue Ecosystem

TunaOS is part of the broader **Universal Blue** ecosystem — a family of [bootc](https://github.com/bootc-dev/bootc)-based desktop operating images built on Enterprise Linux foundations.

## What is Universal Blue?

[Universal Blue](https://universal-blue.org/) is an open-source project that provides custom, immutable desktop OS images built on Fedora and Enterprise Linux using bootc technology. It's the upstream home of [Bluefin](https://projectbluefin.io), the project TunaOS is forked from.

### Key Universal Blue Projects

| Project | Description | Base |
|---|---|---|
| [Bluefin](https://projectbluefin.io) | Developer-focused desktop — GNOME with enhancements | Fedora / AlmaLinux |
| [Bluefin LTS](https://github.com/ublue-os/bluefin-lts) | Long-term support variant of Bluefin | AlmaLinux 10 |
| [Bazzite](https://bazzite.gg) | Gaming-focused desktop for handhelds & HTPCs | Fedora |
| [Aurora](https://getaurora.dev) | KDE Plasma desktop, Bluefin's KDE sibling | Fedora |
| [Bluefin CLI](https://github.com/tuna-os/bluefin-cli) | Shell configuration manager (originated at uBlue) | Cross-platform |

## TunaOS's Relationship to Bluefin

TunaOS started as a **fork of Bluefin LTS** with a focus on:

| Aspect | Bluefin LTS | TunaOS |
|---|---|---|
| **Base OS** | AlmaLinux 10 | AlmaLinux 10 / CentOS Stream 10 / Fedora |
| **Desktops** | GNOME | GNOME, KDE, COSMIC, Niri, XFCE |
| **NVIDIA** | Supported | Supported (GDX variants) |
| **Homebrew** | Optional | Baked into every image |
| **TunaOS tools** | No | Tacklebox, Corral, Tavern, Office Suite |
| **Target audience** | General developers | Enterprise + Platform Engineering |

## What TunaOS Shares with Universal Blue

- **Same bootc image model** — OCI container images as OS
- **Same build tooling** — GitHub Actions, Containerfiles
- **Same immutable architecture** — atomic updates, rollbacks
- **Same community tools** — Homebrew, Flathub, Distrobox/Toolbox

## What Makes TunaOS Unique

1. **Multi-desktop** — 5 desktop environments on one base
2. **Enterprise Linux focus** — AlmaLinux and CentOS Stream as primary bases
3. **Own tool ecosystem** — Tacklebox (media), Corral (VMs), Tavern (Homebrew GUI)
4. **Rust office suite** — Tables, Decks, Letters
5. **GDX variants** — NVIDIA/CUDA pre-configured for AI/ML
6. **Bootc CNCF Sandbox** — TunaOS is a reference bootc implementation

## Cross-Promotion Opportunities

### For Universal Blue Users

If you use Bluefin, Aurora, or Bazzite:

```bash
# Try TunaOS for an Enterprise Linux desktop
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome

# Use TunaOS tools on Universal Blue
brew install tacklebox corral tavern
```

### For TunaOS Users

If you use TunaOS and want to explore the ecosystem:

```bash
# Try Bluefin for a Fedora-based experience
sudo bootc switch ghcr.io/ublue-os/bluefin-lts:latest

# Try Bazzite for gaming
sudo bootc switch ghcr.io/ublue-os/bazzite:gnome
```

## See Also

- [Universal Blue](https://universal-blue.org/) — main project site
- [Bluefin](https://projectbluefin.io) — developer desktop
- [Bazzite](https://bazzite.gg) — gaming desktop
- [Aurora](https://getaurora.dev) — KDE desktop
- [Bluefin CLI](/bluefin-cli) — shared shell tooling
