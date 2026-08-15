---
sidebar_position: 9
---

<!-- ste-disable-file: this page is a bibliography. The link text reproduces the titles of external talks, guides and repositories, and rewriting a title misquotes its author. -->

# Bootc Resources

Curated links and references for working with bootable containers — from concepts to production.

## Getting Started

- [bootc-dev/bootc](https://github.com/bootc-dev/bootc) — the official project repo. Start here for the high-level overview.
- [Getting Started with Bootable Containers](https://docs.fedoraproject.org/en-US/bootc/getting-started/) — Fedora's guide covering core concepts, benefits, and first steps.
- [Rollback & Update Troubleshooting](bootc-rollback.md) — what to do when an update breaks your system.

## Talks and Recordings

Newest first. Every link below was checked against the video's own metadata,
so the titles are the ones the speakers gave them.

### 2026

- [Project Lightning Talk: What's Exciting Now In Bootc, And What's Next?](https://www.youtube.com/watch?v=txFg5kPwQvY)
  — Colin Walters at KubeCon + CloudNativeCon Europe 2026 (CNCF). Soft reboots,
  factory reset, the `bcvk` tool for local VMs, then composefs and verified
  container storage with Secure Boot and custom keys.
- [Contribfest: Get Started Contributing to bootc](https://kccnceu2026.sched.com/event/2EF7a/)
  — Joseph Marrero Corchado, Laura Santamaria, Preethi Thomas, Alice Frosi and
  Colin Walters at KubeCon EU 2026. A working session, not a recording.
- [Reproducible, Immutable, Bootable: Exploring bootc with Podman Desktop](https://www.youtube.com/playlist?list=PLU1vS0speL2Z6ye8yTW9lWG-GlairkWA0)
  — DevConf.IN 2026. How container build methods make an OCI image into a
  Linux system that boots and updates.
- [DevConf.CZ 2026 live streams](https://www.youtube.com/playlist?list=PLMmZih2q_v3I)
  — the full playlist. It holds the 2026 bootable-container sessions.

### 2025

- [Bootable Containers in Action: Hands on with Deploying AI Workloads](https://www.youtube.com/watch?v=KDOySCVhphI)
  — Carol Chen and Cedric Clyburn at CentOS Connect 2025.
- [From Container to Bare Metal: Redefining OS Build with bootc – VP Bank](https://www.youtube.com/watch?v=acKbf3V3rJk)
  — Chainguard's "In Containers We Trust" series, August 2025. A production
  account from a bank.
- [What are Bootc and bootable containers?](https://www.youtube.com/watch?v=1p1pCoHFkP0)
  — Dan Walsh and Colin Walters, March 2025.
- [Bootable Containers and Image Mode: Transforming Linux OS Management with Bootc](https://archive.fosdem.org/2025/schedule/event/fosdem-2025-4513-bootable-containers-and-image-mode-transforming-linux-os-management-with-bootc/)
  — FOSDEM 2025. Image-based deployment, boot integrity, and management.

### 2024

- [Keynote: What if you could boot a container?](https://www.youtube.com/watch?v=ERVyBc_fElY)
  — Dan Walsh, Stef Walter and Colin Walters at DevConf.CZ 2024. The talk that
  introduced bootc to a wide audience.
- [Flock 2024: Bootable Containers — A deep dive into image based OS](https://www.youtube.com/watch?v=uNZuYBq5XfI)
  — Dan Walsh at Flock 2024.
- [Bootc: Getting Started with Bootable Containers](https://www.youtube.com/watch?v=bf1xqjLeA9M)
  — Valentin Rothberg for the Fedora Project, September 2024.
- [What Are Bootable Containers? Podman, Containerization & Edge Use Cases](https://www.youtube.com/watch?v=cBom7aDuy9w)
  — IBM Technology. A short introduction.

## How It Works

- [Understanding `bootc install`](https://bootc-dev.github.io/bootc/bootc-install.html) — how a container image becomes a bootable system.
- [Filesystem layout](https://bootc-dev.github.io/bootc/filesystem.html) — immutable `/usr`, mutable `/etc` and `/var`.
- [Pre-tuned real-time bootable containers](https://developers.redhat.com/articles/2025/03/06/how-pre-tuned-real-time-bootable-containers-work) — Red Hat Developer deep-dive.
- [Building images — best practices](https://bootc-dev.github.io/bootc/building/guidance.html) — configuration, nested containers, and the project's future direction.

## Desktop Building with Bootc

- [ublue-os/image-template](https://github.com/ublue-os/image-template) — start here to build your own custom desktop OS image.
- [Universal Blue](https://universal-blue.org/) — custom immutable Atomic Desktop images built on bootc.

### Base Images

| Image | Source | Registry |
|-------|--------|----------|
| CentOS Stream 10 | [GitLab](https://gitlab.com/redhat/centos-stream/containers/bootc) | `quay.io/centos-bootc/centos-bootc:stream10` |
| Fedora 44 | [GitLab](https://gitlab.com/fedora/bootc/base-images) | `quay.io/fedora/fedora-bootc:44` |
| AlmaLinux 10 | [GitHub](https://github.com/AlmaLinux/bootc-images) | `quay.io/almalinuxorg/almalinux-bootc:10` |

### Community Images

- **[TunaOS](https://github.com/tuna-os/tunaOS)** — cloud-native Enterprise Linux desktops.
  - **Yellowfin** — AlmaLinux Kitten 10
  - **Albacore** — AlmaLinux 10
  - **Bonito** — Fedora 44 (pure bootc)
  - **Skipjack** — CentOS Stream 10
- [HeliumOS](https://www.heliumos.org/) — KDE CentOS-based desktop image.
- [AlmaLinux Atomic Desktop](https://github.com/AlmaLinux/atomic-desktop) — KDE and GNOME base images on AlmaLinux.
- [AlmaLinux Atomic Workstation](https://github.com/AlmaLinux/atomic-workstation) — opinionated GNOME workstation on AlmaLinux.

## Deploying on Bare Metal / Edge

- [System provisioning and bootc, now and the future](https://pretalx.devconf.info/devconf-cz-2025/talk/RKW3WM/) — Colin Walters (OpenShift/CoreOS, bootc maintainer).
- [RamaEdge os-builder](https://github.com/RamaEdge/os-builder) — k3s and MicroShift baked into bootc images for edge devices.
- [Keynote: Revolutionize your OS deploy with bootc](https://pretalx.devconf.info/devconf-cz-2025/talk/YT9CKK/) — DevConf.CZ 2025.

## What About Nix?

- [Nix-Fedora-Toolbox](https://thrix.github.io/nix-toolbox/)
- [Managing Your Laptop with Bootable Containers, Fedora Toolbox, Nix, and Home Manager](https://pretalx.devconf.info/devconf-cz-2025/talk/G9JURJ/) — DevConf.CZ 2025.

## Security

- **Syft** — SBOM generation.
  - [Example: Bluefin LTS SBOM in GHA](https://github.com/ublue-os/bluefin-lts/blob/bce36a272851767cb805df8e73458b902f44f67c/.github/workflows/reusable-build-image.yml#L163)
  - [Example bootc repo using Syft and Grype](https://github.com/SNThrailkill/Bootc-Fedora)

- **Trivy** — SARIF vulnerability scanning.
  - [Trivy-scan example](https://github.com/RamaEdge/os-builder/blob/main/.github/actions/trivy-scan/action.yml)

## Future

- [Shape the Future of Linux: Contribute to bootc](https://developers.redhat.com/blog/2025/07/23/shape-future-linux-contribute-bootc-open-source-project) — bootc accepted into the **CNCF Sandbox** (July 2025).
