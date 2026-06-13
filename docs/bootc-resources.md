---
sidebar_position: 9
---

# Bootc Resources

Curated links and references for working with bootable containers — from concepts to production.

## Getting Started

- [bootc-dev/bootc](https://github.com/bootc-dev/bootc) — the official project repo. Start here for the high-level overview.
- [Getting Started with Bootable Containers](https://docs.fedoraproject.org/en-US/bootc/getting-started/) — Fedora's guide covering core concepts, benefits, and first steps.
- [What are Bootable Containers?](https://www.youtube.com/watch?v=cBom7aDuy9w) — IBM Tech video intro.
- [Flock 2024: Bootable Containers Deep Dive](https://www.youtube.com/watch?v=uNZuYBq5XfI) — Dan Walsh on image-based OS.

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
