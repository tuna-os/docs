# Cloud-Native Linux Desktop: Understanding TunaOS Architecture and Bootc Integration

*Published: TBD | Author: TunaOS Community*

## Introduction

Most Linux desktops ship as a collection of packages you install via `apt`, `dnf`, or `pacman`. When you update, you're replacing hundreds of individual files across your system. If an update breaks something, you're stuck troubleshooting or diving into RPM/DEB dependency hell.

TunaOS takes a different approach: your entire OS — kernel, libraries, desktop, tools — arrives as **one atomic unit**: a container image. Think of it like updating your phone: either the update succeeds completely, or you're still on the old version. No partial states, no broken dependencies.

This guide explains **how** TunaOS achieves this through bootc, and **why** this matters for desktop users.

## The Problem: Traditional Package Management

### Package-at-a-Time Updates

Traditional distros update packages individually:

```
Old state:  [kernel-6.8] [glibc-2.39] [gdm-46.0] [... 300 others ...]
Update:     dnf upgrade
New state:  [kernel-6.9] [glibc-2.40] [gdm-47.0] [... mixed ...]
```

Risks:
- **Partial failure**: Update stalls halfway; reboot into a broken state
- **Dependency conflicts**: New package requires library version mismatch
- **Kernel + userspace mismatch**: Kernel updated but related drivers didn't; boot fails
- **Rollback complexity**: To undo, you must downgrade N packages in correct order

### No Atomicity

If your computer loses power during an update:
- You're stuck in a partially-updated state
- Recovery requires expert intervention (emergency shell, chroot, etc.)
- Or: reinstall from scratch

## The Solution: Bootc (Bootable Containers)

**Bootc** is a project by the Fedora/RHEL community to build bootable Linux systems from OCI container images. Instead of packages, you define your OS as a Containerfile:

```dockerfile
FROM quay.io/almalinux/10

# Add development tools
RUN dnf install -y gcc git python3

# Add custom configuration
COPY config/system.conf /etc/system.conf

# Install desktop
RUN dnf install -y gnome-desktop
```

Build this image → push to a registry → bootc upgrades your system to that image.

**Key advantage**: The entire OS is versioned as **one artifact**.

## How TunaOS Uses Bootc

TunaOS builds on bootc's foundation by adding:

### 1. **Multi-Variant Strategy**

Instead of one monolithic distro, TunaOS maintains separate images for different bases:

```
ghcr.io/tuna-os/albacore:gnome           ← AlmaLinux 10 + GNOME 51
ghcr.io/tuna-os/bonito:kde                ← Fedora 44 + KDE Plasma 6
ghcr.io/tuna-os/flounder:cosmic          ← Debian 13 + COSMIC
ghcr.io/tuna-os/marlin:niri               ← Arch Linux + Niri
```

Each variant:
- Starts from its own Enterprise Linux base (AlmaLinux, Fedora, Debian, etc.)
- Adds a curated desktop environment
- Shares build tooling and testing infrastructure

**Benefit**: Users choose the base + desktop that matches their needs, without maintaining fork overhead.

### 2. **Reproducible Builds**

Every TunaOS image is built from:
- A **BuildStream manifest** (declarative build graph)
- **Git commit hash** (immutable source pointer)
- **Pinned dependencies** (specific package versions, not "latest")

Given the same commit, TunaOS produces **byte-for-byte identical images**. This means:
- Security audits are reproducible
- Users can verify image integrity
- Bugs are deterministic (not "it worked last time")

**Claim evidence**: [tuna-os/tunaos/.github/workflows](https://github.com/tuna-os/tunaos/blob/main/.github/workflows) contains build orchestration; `.github/build-config.yml` pins variant definitions; [tuna-os/tunaos-packages](https://github.com/tuna-os/tunaos-packages) manifests record package versions.

### 3. **System Layers + Atomic Updates**

TunaOS uses **ostree** (the immutable OS storage system under bootc) to compose images:

```
[Base Layer: AlmaLinux 10 + bootc]
     ↓
[Desktop Layer: GNOME 51]
     ↓
[Customizations: Laptop drivers, GPU support]
     ↓
[Immutable /usr, writable /var and /home]
```

When you upgrade:

```
Current:   /ostree/deploy/albacore/deploy-xyz123/ → booted from this version
Upgrade:   Downloads new image manifest
Compose:   Creates new /ostree/deploy/albacore/deploy-abc789/
Finalize:  Sets bootloader to new version
Reboot:    One seamless transition to new image
Rollback:  Bootloader still points to deploy-xyz123 if you need it
```

**No partial states**: Either the new image is fully staged, or you're still on the old one.

### 4. **Immutable vs. Mutable**

TunaOS keeps most of the OS immutable:

```
Immutable (from image):  /usr, /etc (mostly), /opt
Mutable (persistent):    /home (user data), /var (logs, caches), /root (root home)
```

When you `rpm-ostree install something`, it creates a **new layer** on top:

```
Old image: [base + gnome]
+ rpm-ostree install vim → [base + gnome + vim layer]
```

This layer persists across reboots until you rebase to a new image version.

**Benefits**:
- Base OS stays clean and reproducible
- Users can customize without losing upgrades
- Rollback removes customizations (resets to base)

## TunaOS Build Infrastructure

### Stage 1: Image Composition (BuildStream)

TunaOS uses **BuildStream**, an open-source build tool for complex systems:

```yaml
# manifests/albacore.yaml
kind: project
name: tunaos

elements:
  almalinux:
    type: ostree
    source: quay.io/almalinux/10
  
  gnome:
    type: gnome-desktop
    depends: almalinux
    packages:
      - gnome-shell
      - gnome-settings
      - gdm
  
  albacore:
    type: ostree
    depends: gnome
    # Final image composition
```

BuildStream tracks dependencies and rebuilds only what changed.

**Claim evidence**: [tuna-os/tunaos manifests/ directory](https://github.com/tuna-os/tunaos/tree/main/manifests) contains BuildStream element definitions per desktop and variant.

### Stage 2: CI/CD (GitHub Actions)

1. **Trigger**: Commit to main branch
2. **Build**: GitHub Actions runs BuildStream; produces OCI images
3. **Test**: Boot ISO, LUKS encryption, desktop session startup
4. **Sign**: Images signed with cosign (supply-chain security)
5. **Publish**: Push to ghcr.io/tuna-os registry
6. **Distribute**: ISOs to Cloudflare R2 (CDN)

**Claim evidence**: [.github/workflows/build-\*.yml](https://github.com/tuna-os/tunaos/tree/main/.github/workflows) workflows; [.github/build-config.yml](https://github.com/tuna-os/tunaos/blob/main/.github/build-config.yml) build matrix.

### Stage 3: Release Channels

TunaOS publishes three channels:

| Channel | Update Frequency | Use Case |
|---------|------------------|----------|
| **stable** | Monthly | Production systems, conservative users |
| **beta** | Weekly | Testing & feedback |
| **rawhide** | Daily | Developers, Fedora upstream sync |

Users configure which channel they track:

```bash
# Switch to beta channel
bootc switch --transport registry \
  ghcr.io/tuna-os/albacore:beta
```

## Desktop Environment Integration

Each TunaOS variant includes a complete desktop environment. TunaOS ships minimal, curated sets of applications:

### GNOME 51
- Default GNOME 51 Shell and settings
- Essential: Files, Calendar, Software (GNOME Software for app installation)
- Pre-enabled: Flatseal (for Flatpak permission management)
- GPU support: NVIDIA/AMD drivers pre-installed on select variants

### KDE Plasma 6
- Full KDE ecosystem: Plasma Workspace, Discover, Konsole
- Configuration: Pre-tuned for touchpad and multi-monitor support
- Customization: Full theming and panel configuration available

Similar integration for COSMIC, XFCE, Niri, Pantheon.

**Claim evidence**: [tuna-os/tunaos manifests/desktops/](https://github.com/tuna-os/tunaos/tree/main/manifests/desktops) contains per-desktop package lists and configurations.

## Updates & Rollback in Practice

### Automatic Updates

TunaOS enables automatic background updates (can be disabled):

```bash
# Check update status
bootc status

# Applied updates show in journal
journalctl -u rpm-ostreed -n 50

# See version history
bootc history
```

### Rollback (One-Command Recovery)

If an update breaks something:

```bash
# Rollback to previous image
sudo bootc rollback

# Reboot
sudo systemctl reboot
```

You're back to the previous version, with user data intact.

**Limitation**: Rollback removes rpm-ostree layers (packages you installed on top). Your base OS returns to its published state, but `/home` is preserved.

## Comparison: TunaOS vs. Traditional Distros

| Feature | TunaOS | Traditional (dnf/apt) |
|---------|--------|----------------------|
| **Update atomicity** | Atomic; either succeeds or reverts | Partial updates possible |
| **Rollback** | 1-command, instant | Manual downgrade or reinstall |
| **Reproducibility** | Bit-for-bit identical images | Depends on package versions |
| **Configuration** | Immutable base + mutable overlays | All files mutable |
| **Customization** | rpm-ostree layers or Flatpak | Package manager or manual |
| **Complexity** | Simpler for users; more infra | Simpler infra; user troubleshoots |

## Why This Matters

### For Individual Users
- **Stability**: No broken updates; easy recovery
- **Simplicity**: OS updates "just work"
- **Trust**: Reproducible images = verifiable security

### For Enterprises
- **Predictability**: Same image deployed to 1000 machines
- **Compliance**: Reproducible builds satisfy audit requirements
- **Cost**: Fewer support tickets from broken updates

### For Developers
- **Container workflow**: Familiar Docker-like tools
- **Upstream integration**: Close feedback loop with bootc maintainers
- **Experimentation**: Layer tools on top without touching base

## Limitations & Tradeoffs

### What TunaOS Does Well
✅ Atomic OS updates  
✅ Easy rollback  
✅ Reproducible builds  
✅ Multi-variant ecosystems  

### What Still Requires Workarounds
⚠️ **Kernel module compilation** (DKMS): Requires persistent overlay layer; not rebuilt after base updates  
⚠️ **Custom system libraries**: Must use Flatpak, distrobox, or layers  
⚠️ **System package conflicts**: Less flexibility than traditional package managers  
⚠️ **Debugging**: Understanding ostree storage takes learning  

## Next Steps

Want to dive deeper?

1. **Try TunaOS**: [Download and install](https://tunaos.org/download) an image
2. **Read bootc docs**: [bootc project documentation](https://github.com/bootc-dev/bootc)
3. **Explore ostree**: [ostree project](https://ostreedev.github.io/ostree/)
4. **Join the community**: [TunaOS Discussions](https://github.com/tuna-os/tunaos/discussions)

## Claim Evidence

This guide makes the following verifiable claims:

- **Bootc definition & project**: [https://github.com/bootc-dev/bootc](https://github.com/bootc-dev/bootc)
- **Ostree (immutable OS storage)**: [https://ostreedev.github.io/ostree/](https://ostreedev.github.io/ostree/)
- **BuildStream (build tool)**: [https://buildstream.build/](https://buildstream.build/)
- **TunaOS uses bootc**: [tuna-os/tunaos README](https://github.com/tuna-os/tunaos#what-is-tunaos) describes bootc integration
- **Atomic updates & rollback**: Implemented by bootc/ostree; verified by `bootc status` and `bootc rollback` CLI
- **Reproducible builds**: [tuna-os/tunaos/.github/build-config.yml](https://github.com/tuna-os/tunaos/blob/main/.github/build-config.yml) pins versions; commit-hash-based versioning
- **Supply-chain signing**: [tuna-os/tunaos GitHub Actions workflows](https://github.com/tuna-os/tunaos/tree/main/.github/workflows) use cosign for image signing
- **Multi-variant strategy**: [ROADMAP.md "Active Variants"](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md#active-variants) lists 12 variants
- **Desktop integration**: [tuna-os/tunaos manifests/desktops/](https://github.com/tuna-os/tunaos/tree/main/manifests/desktops) per-desktop configurations
- **Automatic updates**: Enabled by default in TunaOS images; configurable via `systemctl` units

---

*Questions or corrections? [Open a discussion](https://github.com/tuna-os/tunaos/discussions) or contribute to [TunaOS docs](https://github.com/tuna-os/docs).*
