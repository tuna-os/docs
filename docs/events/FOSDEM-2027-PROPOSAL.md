# Conference Proposal: FOSDEM 2027

## Session Title
**Building and Distributing Multi-Variant Container-Native Desktops with bootc and OCI Registries**

## Target Track
Declarative and Immutable Operating Systems / Fast Track

## Abstract
Traditional Linux desktop distributions rely on package-by-package updates on bare metal, leading to potential configuration drift, incomplete transactions, and high maintenance overhead across non-uniform hardware fleets. With the rise of `bootc` (bootable container images), operating systems can now be defined, built, and shipped as standard OCI container images using familiar container tools.

In this talk, we present the architecture of **TunaOS**, an open-source container-native desktop operating system. We explore:
1. **Multi-Variant Image Architecture**: How TunaOS builds desktop variants (GNOME, KDE Plasma, COSMIC, XFCE, Niri) on top of immutable container baselines (`bootc`).
2. **OCI Image Distribution**: Packaging operating system updates as standard container layers hosted on container registries (`ghcr.io`).
3. **Reproducible Desktop Builds**: Leveraging automated CI/CD and container tooling to build custom immutable OS desktop images for targeted hardware (including Apple Silicon via Asahi and ARM laptops).
4. **Lessons Learned & Community Engagement**: Practical challenges in desktop containerization, driver inclusion, and user workflow adaptations.

## Presenter Bio
TunaOS Core Maintenance Team & Community Contributors.

---
*Filed by outreach agent (ACMM L6 — full mode)*
