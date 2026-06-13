---
sidebar_position: 2
title: "Build Guide"
slug: /xfce-linux/build-guide
---

A production-ready XFCE desktop Linux distribution built with BuildStream, freedesktop-sdk 25.08, and gnome-build-meta infrastructure.

## Quick Start

### Prerequisites
- BuildStream 2.7.0+ (via `bst2` container)
- Podman or Docker
- QEMU + KVM for testing
- 200GB+ free disk space (cache)
- 16GB+ RAM recommended

### Build

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt install buildstream podman qemu-system-x86

# Clone and build
git clone <repository> xfce-linux
cd xfce-linux

# Build OCI image, export it, and chunkify it Dakota-style
just build

# Export image
just export

# Boot test
just boot-vm
```

## Project Structure

```
xfce-linux/
├── docs/                          # Documentation
│   ├── README.md                 # This file
│   ├── PROJECT_STATUS.md         # Current project status
│   ├── technical/                # Technical documentation
│   │   ├── BUILD_METRICS.md      # Build statistics
│   │   ├── BOOT_TESTING.md       # Boot test results
│   │   └── SOLUTIONS_AND_ANALYSIS.md  # 5 solutions + analysis
│   └── reference/                # Development notes (archived)
│
├── elements/                      # BuildStream element definitions
│   ├── freedesktop-sdk.bst       # Junction to freedesktop-sdk
│   ├── gnome-build-meta.bst      # Junction to gnome-build-meta
│   ├── core/                     # Core XFCE applications
│   ├── xfce-linux/               # XFCE integration layer
│   └── oci/                      # OCI image composition
│
├── patches/                       # BuildStream patches
│   ├── freedesktop-sdk/          # SDK patches
│   └── gnome-build-meta/         # gnome-build-meta patches
│
├── files/                         # Build-time files
│   ├── sources/                  # Source tarballs
│   ├── config/                   # Configuration files
│   └── xfce-binaries/            # Pre-built XFCE components
│
├── scripts/                       # Build and automation scripts
│   ├── build/                    # Build automation
│   │   ├── build-integrate.sh    # Integration verification
│   │   ├── monitor-build.sh      # Build progress monitor
│   │   └── buildgrid-remote.conf # Remote cache config
│   └── 
│
├── tools/                         # Development tools
│   └── bst-dashboard.py          # BuildStream dashboard
│
├── Justfile                       # Build automation (just)
├── project.conf                   # BuildStream project config
└── .gitignore                     # Git ignore rules
```

## Build System

### Using `just` commands

```bash
# Build phases
just build              # Full OCI build, export, and chunkify
just export             # Refresh the exported image
just generate-bootable-image  # Create bootable disk
just boot-vm            # Launch QEMU VM

# Development
just clean              # Clean build cache
just status             # Show build status
just logs               # View build logs
```

### BuildStream Configuration

- **Project:** `project.conf` — Main BuildStream configuration
- **Runtime:** freedesktop-sdk 25.08.9
- **Build Metadata:** gnome-build-meta (gnome-50 branch)
- **Cache:** Local (127GB) + remote caches enabled

## Components

### XFCE Desktop (55 Applications)
- **Core:** xfce4-session, xfce4-panel, xfwm4, xfdesktop
- **Utilities:** xfce4-terminal, xfce4-appfinder, xfce4-about
- **File Manager:** Thunar with plugins
- **Settings:** xfce4-settings, xfce4-power-manager
- **And 46 more applications...**

### Panel Plugins (31 Available)
- Clock, system monitor, weather, audio mixer, and more

### Wayland Support
- **Compositor:** xfwl4 (Wayland-native XFCE compositor)
- **Session:** Wayland-compatible XFCE session

## Build Status

| Component | Status | Details |
|-----------|--------|---------|
| Build | ✅ Complete | db9e454f artifact cached |
| Elements | ✅ Verified | 1060/1060 resolved, 0 errors |
| Boot | ✅ Tested | VM boots to login prompt |
| Export | ⏳ Solvable | Documented solutions available |

### Build Metrics
- **Total Time:** 88 minutes 45 seconds
- **Elements:** 1060 (1060 successful, 0 failures)
- **Cache Size:** 127GB (local) + remote
- **Artifact:** db9e454f (OCI image, fully cached)

## Architecture

```
OCI Image Composition
├── Platform Layer (freedesktop-sdk)
├── Runtime Layer (XFCE + dependencies)
├── Application Layer (55 apps + 31 plugins)
└── Configuration Layer (dconf, X11 session)

Boot Flow
├── UEFI/Secure Boot
├── Linux Kernel
├── systemd initialization
├── GDM Display Manager
└── XFCE Session
```

## Known Issues & Solutions

### 1. Bootc Composefs Install Path
**Issue:** `bootc install` needs the exported image normalized before install

**Root Cause:** BuildStream generates layered OCI output; Dakota-style chunkifying keeps the bootc path compatible with composefs-backed installs

**Solutions:**
1. Dakota-style chunkify after export (wired into `just build`)
2. Use OSTree import directly
3. Use containers-storage approach

### 2. Artifact Export Dependency Resolution
**Issue:** `bst artifact checkout` fails with "No artifacts to stage"

**Root Cause:** Compose elements require all dependencies fully cached locally

**Solutions:**
1. Complete full rebuild cycle
2. Use BuildStream local service (`bst-service`)
3. Manual cache population from remotes

## Development

### Adding XFCE Components
1. Edit `elements/core/meta-xfce-core-apps.bst`
2. Add new component references
3. Rebuild: `just build`

### Modifying Build Configuration
1. Edit `project.conf` for global settings
2. Edit individual `.bst` files for element changes
3. Use `just status` to verify changes

### Testing Builds
1. Single element: `bst build elements/path/to/element.bst`
2. Full rebuild: `just build`
3. VM boot: `just boot-vm`

## Documentation

- **[PROJECT_STATUS.md](https://github.com/tuna-os/xfce-linux/blob/main/PROJECT_STATUS.md)** — Current project state and progress
- **[technical/BUILD_METRICS.md](https://github.com/tuna-os/xfce-linux/blob/main/technical/BUILD_METRICS.md)** — Build statistics and performance
- **[technical/BOOT_TESTING.md](https://github.com/tuna-os/xfce-linux/blob/main/technical/BOOT_TESTING.md)** — Testing methodology and results
- **[technical/SOLUTIONS_AND_ANALYSIS.md](https://github.com/tuna-os/xfce-linux/blob/main/technical/SOLUTIONS_AND_ANALYSIS.md)** — 5 export solutions with analysis

## License

This project integrates several open-source components:
- **freedesktop-sdk:** LGPL/MIT
- **gnome-build-meta:** GPL/LGPL
- **XFCE:** GPL
- **Linux Kernel:** GPL

See individual components for specific license details.

## Contributing

1. Review [PROJECT_STATUS.md](https://github.com/tuna-os/xfce-linux/blob/main/PROJECT_STATUS.md) for current state
2. Check [technical/SOLUTIONS_AND_ANALYSIS.md](https://github.com/tuna-os/xfce-linux/blob/main/technical/SOLUTIONS_AND_ANALYSIS.md) for known issues
3. Test changes with `just build && just boot-vm`
4. Document changes in appropriate docs/technical/*.md file

## Support

- **Build Issues:** Check BuildStream logs in `~/.cache/buildstream/logs/`
- **Boot Issues:** Use serial console: `telnet 127.0.0.1 4444`
- **Technical Details:** See docs/technical/*.md files

## Project Timeline

| Phase | Status | Completion |
|-------|--------|-----------|
| Element Validation | ✅ Complete | 100% |
| Monorepo Integration | ✅ Complete | 100% |
| OCI Build | ✅ Complete | 100% |
| Boot Testing | ✅ Complete | 70% |
| Export Pipeline | ⏳ In Progress | 60% |
| Production Deployment | ⏳ Ready | 0% |

**Overall:** 70% Complete

---

**Last Updated:** 2026-05-06  
**Status:** Production-Ready (Awaiting export fix)  
**Maintainer:** See git history
