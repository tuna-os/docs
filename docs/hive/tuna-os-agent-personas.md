---
sidebar_position: 20
title: "tuna os agent personas"
---

**Status:** Proposed  
**Author:** Hive Contributor  
**Target Organization:** [tuna-os](https://github.com/tuna-os) (`hive.tunaos.org`)  
**Related Issue:** [tuna-os/hive#1](https://github.com/tuna-os/hive/issues/1)  
**Related Topics:** [tuna-os/hive#2](https://github.com/tuna-os/hive/issues/2), [tuna-os/hive#3](https://github.com/tuna-os/hive/issues/3), [tuna-os/hive#10](https://github.com/tuna-os/hive/issues/10)

---

## Executive Summary

The **Tuna OS** organization operates 62 repositories. They build an Enterprise Linux desktop for the cloud. The ecosystem has four kinds of product. The first kind is immutable images of [bootc](https://containers.github.io/bootc/) containers (on AlmaLinux, CentOS Stream, and Fedora). The others are package factories for many distributions, bare-metal installers with many frontends, and native desktop applications (GTK4/libadwaita, Qt6, COSMIC/Iced, and Rust).

Tuna OS now runs a fork of Hive (`hive.tunaos.org`) with standard generic personas (`scanner`, `quality`, `ci-maintainer`, `sec-check`, `architect`, `strategist`, `telemetry`, `operations`, `outreach`). These personas work well on general-purpose Go/TypeScript microservices and cloud controllers (such as KubeStellar). They do not know about:

1. **Containerized OS / bootc image lifecycles** (OSTree layer commits, base image rebases, kernel/NVIDIA/HWE hardware variant matrices, layer bloat).
2. **Cross-distro package and build matrices** (RPM `.spec` files, Debian `control`/`rules`, BuildStream `.bst` pipelines, GPG signatures on repositories).
3. **OS installers & hardware ports** (COSMIC/Iced, Qt6, GTK3, TUI/Niri, Windows `wootc`, Apple Silicon Asahi, EFI/systemd-boot/UKI, Secure Boot preflights).
4. **Desktop application integration** (GNOME HIG compliance, libadwaita style, Wayland protocol details, permissions of the Flatpak sandbox portal).
5. **Upstream fork synchronization** (keep clean modular forks of `hive`, `ghostty` -> `blueshell`, `fractal` -> `mandelbrot`, `nautilus` -> `mariner` with bugfixes that upstream can accept).
6. **Advocacy for the Linux desktop** (DistroWatch, Flathub/AppStream metadata, Universal Blue & bootc community outreach).

This document gives an investigation and an architectural specification for **6 custom agent personas**. They are built for the Tuna OS organization. It includes portable `AgentDefinition` specs, policy prompts, rules for lane routes, and an ACMM rollout strategy.

---

## Organization & Repository Landscape

The Tuna OS organization has 62 repositories. They fall into five operational domains:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  TUNA OS REPOSITORY DOMAINS                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  1. Immutable OS Images & Bootc Base                                                    │
│     ├── tunaOS             (Core bootc builder: yellowfin, albacore, skipjack)          │
│     ├── tromso             (BuildStream-based KDE Linux distribution)                   │
│     ├── brussels           (BuildStream-based XFCE Wayland OCI image)                   │
│     ├── remora             (User-friendly local layering for bootc systems)             │
│     ├── bootc-migrate      (Migration tooling for bootc systems)                        │
│     └── corral             (QEMU + KubeVirt VM manager with Proxmox-style web UI)       │
│                                                                                         │
│  2. Cross-Distro Packaging & Build Factories                                            │
│     ├── tunaos-packages    (RPM and DEB package factory, signing, R2 repository publish)│
│     ├── debian-copr        (Debian/Ubuntu APT repository builder)                       │
│     ├── flatpak-index      (TunaOS Flatpak remote & central application index)          │
│     ├── bst-ci             (Shared reusable BuildStream GitHub Actions workflows)       │
│     ├── homebrew-tap       (Homebrew tap for TunaOS CLI tools)                          │
│     └── scoop-bucket       (Windows Scoop bucket managed by GoReleaser)                 │
│                                                                                         │
│  3. Multi-Frontend Installers & Bare-Metal Hardware                                     │
│     ├── tuna-installer-cosmic (COSMIC / Iced / Rust frontend)                           │
│     ├── tuna-installer-kde    (Qt6 Widgets / C++ frontend)                              │
│     ├── tuna-installer-xfce   (GTK3 frontend)                                           │
│     ├── tuna-installer-niri   (TUI / Rust / Niri / wlroots frontend)                    │
│     ├── wootc                 (Windows bootc installer — dual boot without repartition) │
│     ├── bootc-installer-asahi (Apple Silicon / Asahi Linux installer & payload CI)      │
│     ├── fisherman             (Shared bootc installation engine backend)                │
│     └── iso-builder/tacklebox (In-browser WASM live ISO builder)                        │
│                                                                                         │
│  4. Native Desktop Apps & GNOME / GTK Ecosystem                                         │
│     ├── blueshell          (Ghostty fork with Ptyxis UI & container/distrobox/VMs)      │
│     ├── finupdate          (Graphical system updater for bootc/flatpak/brew/distrobox)  │
│     ├── gtk-office-suite   (Pure Rust GTK4 office suite: Tables, Decks, Letters)        │
│     ├── mandelbrot         (GNOME Matrix client with native MatrixRTC calling)          │
│     ├── spindle            (Linearized Matrix homeserver specification)                 │
│     ├── dualcut            (Dual-mode video editor: timeline + programmatic JSON)       │
│     ├── protota            (Browser-based Canva-like mockup tool for Adwaita UIs)       │
│     └── gnome-hive-monitor (GNOME Shell top bar extension for monitoring Hive)          │
│                                                                                         │
│  5. Upstream Forks & Upstream Synchronization                                           │
│     ├── hive               (AI agent orchestration — fork of kubestellar/hive)          │
│     ├── blueshell          (Fork of ghostty)                                            │
│     ├── mandelbrot         (Fork of fractal)                                            │
│     ├── mariner            (Fork of GNOME Files / nautilus with typeahead)              │
│     ├── bootc-installer    (Fork of Vanilla OS installer)                               │
│     └── kde-build-meta     (Mirror of GNOME/KDE build meta)                             │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Generic Personas Fall Short for Tuna OS

| Generic Hive Persona | Designed For (KubeStellar Baseline) | Tuna OS Reality & Gaps |
|---|---|---|
| **`ci-maintainer`** | Node.js / Go dependency bumps, GitHub Actions pinning | **Fails to understand OS builds:** Ignores upstream bootc base digests (AlmaLinux 10, CentOS Stream 10, Fedora ELN), OSTree commit integrity, container multi-arch chunk caching, and kernel/NVIDIA driver matrix testing. |
| **`quality`** | Unit test coverage (`go test`, `jest`, `pytest`) | **Fails on OS & installer validation:** Cannot execute hardware matrix smoke tests, ISO UEFI boot simulations, partition table dry-runs, or Wayland compositing checks. |
| **`architect`** | Go package boundaries, REST/gRPC API design | **Fails on OS architecture:** Does not evaluate OSTree image layer budgets, BuildStream junction dependencies, D-Bus interfaces, or systemd target ordering. |
| **`outreach`** | CNCF Landscape, Kubernetes Slack, Awesome-Lists | **Targeted at wrong ecosystem:** Looks for CNCF adopters rather than desktop Linux users, DistroWatch listings, Flathub entries, or Universal Blue community forums. |
| **`scanner`** | Web app vulnerabilities, unhandled errors | **Lacks OS domain knowledge:** Misses bootloader EFI partition sizing errors, SELinux policy denials on desktop images, and Flatpak portal breakout risks. |

---

## The 6 Custom Personas for Tuna OS

To address these domain-specific challenges, we suggest these six personas for agents:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      TUNA OS CUSTOM PERSONA SUITE                                    │
├──────────────────────────┬───────────────────────────────────────────────────────────────────────────┤
│ Persona                  │ Primary Role & Domain Specialization                                      │
├──────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
│ 1. `bootc-curator` 🐟    │ Immutable OS image lifecycle, base digest tracking, OSTree layer budgeting│
│ 2. `packager` 📦         │ RPM/DEB specfiles, BuildStream `.bst` elements, Flatpak remote indexing   │
│ 3. `desktop-integrator` 🎨│ GNOME/GTK4/libadwaita/Qt6/COSMIC apps, HIG adherence, Wayland/D-Bus/Portals │
│ 4. `installer-qa` 💿     │ Bare-metal & dual-boot installers, EFI/systemd-boot/UKI, Windows/Asahi QA │
│ 5. `upstream-shepherd` 🐑│ Fork synchronization, upstreamable bugfix extraction, clean rebase triage │
│ 6. `desktop-advocate` 📣 │ Desktop Linux community engagement, DistroWatch, Flathub/AppStream reach  │
└──────────────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

---

### 1. `bootc-curator` (OCI Bootc & OS Image Maintainer)

- **Emoji:** `🐟` | **Color:** `#0284c7` (Sky Blue)
- **Role:** `bootc-curator`
- **Target Repositories:** `tunaOS`, `tromso`, `brussels`, `remora`, `bootc-migrate`, `corral`
- **Lane Keywords:** `bootc`, `ostree`, `image`, `layer`, `yellowfin`, `albacore`, `skipjack`, `kernel`, `nvidia`, `hwe`, `base-image`, `digest`

#### Mission & Responsibilities

1. **Upstream Base Monitor:** Watch these upstream base images of containers: `almalinux:10-kitten`, `almalinux:10`, `quay.io/centos-bootc/centos-bootc:stream10`, `fedora-bootc:eln`. Detect upstream digest changes. Verify layer compatibility before you start an image rebuild.
2. **Layer Budget & Bloat Prevention:** Inspect Containerfiles and BuildStream elements. Find unnecessary layers, cache churn, and package caches that remain (`dnf clean all`, `rm -rf /var/cache/*`).
3. **Hardware Variant Checks:** Make sure that the desktop tags (`gnome`, `kde`, `cosmic`, `niri`, `xfce`) build cleanly with each hardware variant modifier (`-hwe`, `-nvidia`, `-asus`).
4. **Local Layers (`remora`) Compatibility:** Validate that changes to the system base do not break the extensions of local layers. `remora` manages these extensions in user space.

---

### 2. `packager` (Cross-Distro Package & Repository Engineer)

- **Emoji:** `📦` | **Color:** `#d97706` (Amber)
- **Role:** `packager`
- **Target Repositories:** `tunaos-packages`, `debian-copr`, `flatpak-index`, `bst-ci`, `homebrew-tap`, `scoop-bucket`
- **Lane Keywords:** `package`, `rpm`, `deb`, `spec`, `buildstream`, `bst`, `copr`, `flatpak`, `flathub`, `appstream`, `r2`, `signing`, `gpg`

#### Mission & Responsibilities

1. **RPM & DEB Spec Maintenance:** Automate updates to upstream versions. Generate changelogs (formatted with DCO standards). Update dependencies in RPM `.spec` files and Debian `debian/control` definitions.
2. **BuildStream `.bst` Junction Upkeep:** Keep BuildStream junctions (`bst-ci`, `tromso`, `brussels`) in sync with upstream Git repositories and release tarballs.
3. **Flatpak Remote & AppStream Index:** Audit `flatpak-index`. Check for XML metadata that AppStream accepts, icon sizes, category taxonomies, and runtime compatibility (GNOME 48/49, KDE 6).
4. **Repository Publication Integrity:** Validate the pipelines that sign GPG metadata. Validate the sync of the Cloudflare R2 / Copr mirror for RPM (`repomd.xml`) and DEB (`Release`, `Packages.gz`) indices.

---

### 3. `desktop-integrator` (Native Desktop App & UX Engineer)

- **Emoji:** `🎨` | **Color:** `#8b5cf6` (Purple)
- **Role:** `desktop-integrator`
- **Target Repositories:** `blueshell`, `finupdate`, `gtk-office-suite`, `mandelbrot`, `spindle`, `dualcut`, `protota`, `mariner`, `gnome-hive-monitor`
- **Lane Keywords:** `gtk`, `gtk4`, `libadwaita`, `adwaita`, `gnome`, `hig`, `wayland`, `wlroots`, `niri`, `portal`, `dbus`, `iced`, `cosmic`, `qt6`, `ui`, `ux`

#### Mission & Responsibilities

1. **GNOME HIG & libadwaita Compliance:** Make sure that desktop applications follow the GNOME guidelines for human interfaces. These include standard headerbars, adaptive breakpoints with `AdwBreakpoint`, and inheritance of the accent color of the system.
2. **Memory Safety & GObject Binding Hygiene:** Audit the Rust GTK bindings (`gtk4-rs`, `libadwaita-rs`). Check the disconnection of glib signals, the hygiene of `glib::clone!` captures, and dispatch to the main context.
3. **Wayland & Compositor Protocols:** Verify how windows behave on Wayland compositors (GNOME Mutter, KDE KWin, Niri / wlroots). Test `xdg-shell`, `xdg-desktop-portal`, and layer-shell integration.
4. **Flatpak Sandbox & Portal Permissions:** Make sure that apps such as `finupdate` ask for the correct D-Bus and Flatpak portal interfaces. Examples are `org.freedesktop.Flatpak`, `org.freedesktop.PackageKit`, and the systemd user bus. Apps must not ask for more.

---

### 4. `installer-qa` (Multi-Platform Installer & Hardware Specialist)

- **Emoji:** `💿` | **Color:** `#10b981` (Emerald)
- **Role:** `installer-qa`
- **Target Repositories:** `tuna-installer-cosmic`, `tuna-installer-kde`, `tuna-installer-xfce`, `tuna-installer-niri`, `wootc`, `bootc-installer-asahi`, `fisherman`, `iso-builder`
- **Lane Keywords:** `installer`, `fisherman`, `wootc`, `asahi`, `efi`, `systemd-boot`, `grub`, `uki`, `partition`, `dual-boot`, `secure-boot`, `arm64`, `apple-silicon`

#### Mission & Responsibilities

1. **`fisherman` Backend Contract Tests:** Make sure that the shared `fisherman` install backend stays API-compatible with all four desktop GUIs. These are COSMIC/Iced, KDE/Qt6, XFCE/GTK3, and Niri/TUI.
2. **Bootloader & Partition Safety:** Validate the layouts of disk partitions. Validate the size of the EFI system partition (minimum 1GB for UKIs). Validate the generated bootloader configuration (`systemd-boot`, GRUB, unified kernel images).
3. **Windows Dual-Boot Safety (`wootc`):** Enforce strict invariants that never destroy data. They apply when you resize Windows NTFS or dynamic disks and manage BCD boot entries.
4. **Apple Silicon & ARM64 Support (`bootc-installer-asahi`):** Verify how the installer stages the Asahi Linux payload. Verify that it keeps the device tree blob (DTB). Verify the m1n1/U-Boot integration.

---

### 5. `upstream-shepherd` (Fork Maintainer & Upstream Collaborator)

- **Emoji:** `🐑` | **Color:** `#ec4899` (Pink)
- **Role:** `upstream-shepherd`
- **Target Repositories:** `hive`, `blueshell`, `mandelbrot`, `mariner`, `bootc-installer`, `kde-build-meta`
- **Lane Keywords:** `upstream`, `fork`, `rebase`, `sync`, `cherry-pick`, `divergence`, `patch`, `ghostty`, `fractal`, `nautilus`, `kubestellar`

#### Mission & Responsibilities

1. **Upstream Divergence Audit:** Always monitor the drift of the merge base from upstream repositories (`kubestellar/hive`, `ghostty-org/ghostty`, `GNOME/fractal`, `GNOME/nautilus`).
2. **Discriminator (Fix or Fork Feature):** Tell generic bugfixes and Tuna OS changes apart. A generic bugfix goes upstream (e.g. a tag for a registry in `docker.yml` [tuna-os/hive#10](https://github.com/tuna-os/hive/issues/10)). A Tuna OS change is on purpose and stays in the fork.
3. **Upstream PR Authorship:** Prepare clean, standalone upstream PRs. Follow the upstream guide for contributors, the coding conventions, and the DCO sign-off rules.
4. **Clean Modular Rebases:** Replay downstream branches on top of new upstream releases. Flag hunks that conflict. Suggest architectural hooks or extensions that remove permanent diffs.

---

### 6. `desktop-advocate` (Linux Desktop Ecosystem & Community Steward)

- **Emoji:** `📣` | **Color:** `#f59e0b` (Gold)
- **Role:** `desktop-advocate`
- **Target Repositories:** `docs`, `branding`, `flatpak-index`, `.github`, `tunaOS`
- **Lane Keywords:** `community`, `outreach`, `distrowatch`, `flathub`, `docs`, `showcase`, `universal-blue`, `adopter`, `release-notes`, `marketing`

#### Mission & Responsibilities

1. **Desktop Directory & Distro Listings:** Maintain and update distribution listings. Cover DistroWatch, Linux distro databases, and Universal Blue / bootc portals of the community.
2. **AppStream & Flathub Discoverability:** Make sure that each Tuna OS application on `flatpak-index` has a rich AppStream description. Add translated summaries, release changelogs, and high-resolution screenshots.
3. **Release Communication & Documentation:** Generate release notes for users. Highlight new desktop features, supported hardware variants, and installer improvements.
4. **Contributor Intake & Good-First-Issues:** Curate issues for beginners in packages, the style of the desktop UI, and documentation. Target new open-source contributors.

---

## Persona Technical Specification Matrix

| Persona | Role Key | Default Mode | Backend / Model | Tools Preset | Primary Channels | Allowed ACMM Levels |
|---|---|---|---|---|---|---|
| **`bootc-curator`** | `bootc-curator` | `ISSUES_AND_PRS` | `claude` / `claude-sonnet-4-6` | `issues-prs` | `kick`, `webhook (push, release)` | L3, L4, L5, L6 |
| **`packager`** | `packager` | `ISSUES_AND_PRS` | `claude` / `claude-sonnet-4-6` | `issues-prs` | `kick`, `webhook (release, tag)` | L3, L4, L5, L6 |
| **`desktop-integrator`**| `desktop-integrator` | `ISSUES_AND_PRS` | `claude` / `claude-sonnet-4-6` | `issues-prs` | `kick`, `webhook (issues, PR)` | L3, L4, L5, L6 |
| **`installer-qa`** | `installer-qa` | `ISSUES_AND_PRS` | `claude` / `claude-sonnet-4-6` | `issues-prs` | `kick`, `schedule ("0 */6 * * *")` | L3, L4, L5, L6 |
| **`upstream-shepherd`** | `upstream-shepherd` | `ISSUES_AND_PRS` | `claude` / `claude-opus-5` | `issues-prs` | `kick`, `schedule ("0 8 * * *")` | L3, L4, L5, L6 |
| **`desktop-advocate`** | `desktop-advocate` | `ISSUES_ONLY` | `claude` / `claude-sonnet-4-6` | `issues-only`| `kick`, `schedule ("0 12 * * 1,4")` | L2, L3, L4, L5, L6 |

---

## Fleet Roster & Governor Configuration

This is the recommended governor configuration for `hive.tunaos.org`. It balances core maintenance and specialized domain expertise:

```yaml
# /etc/hive/hive.yaml or /data/hive.yaml.dashboard on hive.tunaos.org
project:
  name: "Tuna OS Fleet"
  org: "tuna-os"
  primary_repo: "tuna-os/tunaOS"
  website: "https://tunaos.org"
  hive_repo: "tuna-os/hive"

agents:
  # Core Infrastructure Personas
  supervisor:
    backend: claude
    model: claude-opus-5
    role: supervisor
    mode: ADVISORY
    bead_role: supervisor
  
  scanner:
    backend: claude
    model: claude-sonnet-4-6
    role: scanner
    mode: ISSUES_AND_PRS

  sec-check:
    backend: claude
    model: claude-sonnet-4-6
    role: sec-check
    mode: ISSUES_AND_PRS

  # Custom Tuna OS Domain Personas
  bootc-curator:
    backend: claude
    model: claude-sonnet-4-6
    role: bootc-curator
    mode: ISSUES_AND_PRS
    kick_template: bootc-curator.md
    lane_keywords: [bootc, ostree, image, layer, yellowfin, albacore, skipjack, kernel, nvidia, hwe]

  packager:
    backend: claude
    model: claude-sonnet-4-6
    role: packager
    mode: ISSUES_AND_PRS
    kick_template: packager.md
    lane_keywords: [package, rpm, deb, spec, buildstream, bst, copr, flatpak, flathub, appstream]

  desktop-integrator:
    backend: claude
    model: claude-sonnet-4-6
    role: desktop-integrator
    mode: ISSUES_AND_PRS
    kick_template: desktop-integrator.md
    lane_keywords: [gtk, gtk4, libadwaita, adwaita, gnome, hig, wayland, wlroots, niri, portal, dbus]

  installer-qa:
    backend: claude
    model: claude-sonnet-4-6
    role: installer-qa
    mode: ISSUES_AND_PRS
    kick_template: installer-qa.md
    lane_keywords: [installer, fisherman, wootc, asahi, efi, systemd-boot, grub, uki, partition]

  upstream-shepherd:
    backend: claude
    model: claude-opus-5
    role: upstream-shepherd
    mode: ISSUES_AND_PRS
    kick_template: upstream-shepherd.md
    lane_keywords: [upstream, fork, rebase, sync, cherry-pick, divergence, patch]

  desktop-advocate:
    backend: claude
    model: claude-sonnet-4-6
    role: desktop-advocate
    mode: ISSUES_ONLY
    kick_template: desktop-advocate.md
    lane_keywords: [community, outreach, distrowatch, flathub, docs, showcase]

governor:
  eval_interval_s: 300
  threshold_scaling: linear
  modes:
    surge:
      threshold: 20
      supervisor: 5m
      sec-check: 2m
      scanner: 15m
      bootc-curator: 1h
      packager: 1h
      desktop-integrator: 1h
      installer-qa: 2h
      upstream-shepherd: pause
      desktop-advocate: pause
    busy:
      threshold: 10
      supervisor: 5m
      sec-check: 5m
      scanner: 30m
      bootc-curator: 2h
      packager: 2h
      desktop-integrator: 2h
      installer-qa: 4h
      upstream-shepherd: 6h
      desktop-advocate: 12h
    quiet:
      threshold: 2
      supervisor: 10m
      sec-check: 10m
      scanner: 1h
      bootc-curator: 4h
      packager: 4h
      desktop-integrator: 4h
      installer-qa: 6h
      upstream-shepherd: 12h
      desktop-advocate: 24h
    idle:
      threshold: 0
      supervisor: 15m
      sec-check: 15m
      scanner: 2h
      bootc-curator: 6h
      packager: 6h
      desktop-integrator: 6h
      installer-qa: 12h
      upstream-shepherd: 24h
      desktop-advocate: 24h
```

---

## Phased Rollout Plan for `hive.tunaos.org`

To ensure stability and safety across the organization's repositories:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               PHASED ADOPTION ROADMAP                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Phase 1: Advisory & Discovery (ACMM L2)                                                │
│  • Deploy all 6 personas in ADVISORY mode (`mode: ADVISORY`).                           │
│  • Personas scan repositories, generate work beads, and log findings without opening     │
│    GitHub issues or PRs.                                                                │
│  • Maintainers review heartbeat logs and bead quality in the Hive dashboard.            │
│                                                                                         │
│  Phase 2: Issue-Only Screening (ACMM L4)                                                │
│  • Promote `bootc-curator`, `packager`, and `upstream-shepherd` to `ISSUES_ONLY`.       │
│  • Personas open tagged triage issues (e.g. `[bootc-curator]`, `[packager]`) for base   │
│    image updates, broken spec files, and upstream divergence.                           │
│  • Human maintainers evaluate issue precision and false-positive rates.                 │
│                                                                                         │
│  Phase 3: Semi-Autonomous Hold-Gated PRs (ACMM L5 — Recommended Target)                 │
│  • Promote mutating personas to `ISSUES_AND_PRS`.                                       │
│  • Every agent PR is automatically created with the `hold` label and signed with        │
│    `git commit -s`.                                                                     │
│  • Maintainers review diffs in batch and merge with one click.                          │
│                                                                                         │
│  Phase 4: Targeted Autonomous Merging (ACMM L6)                                         │
│  • Enable auto-merge on green CI (`ISSUES_PRS_MERGE`) strictly for low-risk,            │
│    hermetic tasks: upstream base digest updates in `tunaOS` and version revs in         │
│    `tunaos-packages`. Core installer and fork sync PRs remain hold-gated.               │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Reference Artifacts

The full reference deployment is in this location. It includes YAML `AgentDefinition` specs, Markdown policy prompts, and `hive-project.yaml`:

- [`examples/tuna-os/README.md`](https://github.com/tuna-os/hive/blob/v4/examples/tuna-os/README.md)
- [`examples/tuna-os/hive-project.yaml`](https://github.com/tuna-os/hive/blob/v4/examples/tuna-os/hive-project.yaml)
- [`examples/tuna-os/agents/`](https://github.com/tuna-os/hive/blob/v4/examples/tuna-os/agents)
