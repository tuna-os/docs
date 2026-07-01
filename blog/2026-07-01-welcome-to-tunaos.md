---
slug: welcome-to-tunaos
title: Welcome to TunaOS — Cloud-Native Enterprise Linux Desktops
authors: [hanthor]
tags: [tunaos, announcement, enterprise-linux, bootc, immutable-desktop]
date: 2026-07-01
---

# Welcome to TunaOS 🐟

We're excited to launch the TunaOS blog — your new source for updates, deep dives, case studies, and community stories about building and running cloud-native Enterprise Linux desktops.

## What is TunaOS?

TunaOS is a collection of **[bootc](https://github.com/containers/bootc)-based OCI desktop images** built on Enterprise Linux foundations. Think of it as "cloud-native desktop as code" — your entire operating system is a container image that you can version, sign, distribute via any OCI registry, and atomically update.

| Variant | Base | Desktop | Best For |
|---|---|---|---|
| **Albacore** 🐟 | AlmaLinux 10 | GNOME 46 | Production enterprise deployments |
| **Yellowfin** 🐠 | AlmaLinux Kitten | GNOME 47 | Cutting-edge GNOME on stable EL |
| **Skipjack** 🍣 | CentOS Stream 10 | KDE Plasma 6 | KDE users on EL foundation |
| **Bonito** 🎣 | Fedora 44 | COSMIC (Rust) | Early adopters and Rust enthusiasts |

## Why Now?

Enterprise Linux is undergoing a transformation:

- **CentOS Stream** is now the upstream for RHEL, making EL-based innovation faster
- **bootc** graduated to [CNCF Sandbox](https://www.cncf.io/sandbox-projects/), validating container-native OS management
- **Modern desktops** (GNOME 47+, KDE Plasma 6, COSMIC) are ready for the enterprise
- **OCI registries** have become the universal distribution mechanism

TunaOS sits at the intersection of these trends, offering a desktop experience that IT teams can manage with the same tools they use for containers and Kubernetes.

## What to Expect from This Blog

- **Release notes** — every TunaOS variant update with changelogs and migration notes
- **Deep dives** — bootc internals, image layering, CI/CD pipeline architecture
- **Case studies** — real-world TunaOS deployments from the community
- **Community spotlights** — featured projects, contributors, and ecosystem partners
- **Tutorials** — getting started guides for every variant and tool

## Get Started

Ready to try TunaOS? It's as simple as:

```bash
# Switch your existing bootc system to TunaOS
sudo bootc switch --enforce-container-sigpolicy ghcr.io/tuna-os/yellowfin:gnome
```

Or check out the [Installation Guide](/docs/installation) for your first bare-metal or VM deployment.

## Join the Community

- **Matrix**: [#tunaos:reilly.asia](https://matrix.to/#/%23tunaos:reilly.asia)
- **GitHub**: [tuna-os/tunaOS](https://github.com/tuna-os/tunaOS)
- **Documentation**: [tunaos.org/docs](https://tunaos.org/docs)

We're just getting started. Watch this space for more updates!

---

*The TunaOS Team*
