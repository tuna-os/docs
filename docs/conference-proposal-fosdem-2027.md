# Conference Proposal: Container-Native Desktop OS Architecture with bootc

**Target Events**: FOSDEM 2027 (Containers & OS Devrooms) / Open Source Summit Europe 2027  
**Track**: Cloud Native / Linux Desktop / Systems Track  
**Format**: 30-minute Presentation with Demo  

---

## Abstract

Traditional Linux desktop distribution maintenance relies on complex package-by-package upgrades, drift-prone state machines, and distribution-specific installer scripts. Container-native operating systems change this model by packaging the entire operating system image as an OCI container artifact built via standard container tools (Containerfile / Dockerfile) and deployed onto hardware using `bootc`.

This presentation explores the practical engineering and community architecture behind **TunaOS** — an open-source container-native desktop OS matrix spanning GNOME, KDE, COSMIC, XFCE, and Niri desktop environments. We examine how bootable containers simplify image layering, automated build workflows, regression rollback mechanisms, and multi-distribution base switching (EL10, Fedora Rawhide, Debian Sid, Arch Linux).

---

## Proposal Outline

1. **Introduction: The Container-Native Desktop Paradigm**
   - Overview of `bootc` and bootable OCI container images.
   - Contrast between package-level updates and atomic image updates.
   - Declarative OS builds using standard CI/CD pipelines (GitHub Actions, BuildStream, Tideforge).

2. **Architecture & Multi-Variant Matrix**
   - Base layer abstraction: standardizing configuration across AlmaLinux, Fedora, Debian, Gentoo, and Arch Linux base images.
   - Desktop environment layering: packaging GNOME 51, COSMIC Epoch 1.5, KDE Plasma 6, and lightweight compositors (Niri, XFCE).
   - Enterprise & Hardware Tiers: Apple Silicon (Asahi Linux) and ARM64 (Snapdragon X Elite) image composition.

3. **Reliability, Rollbacks, and Customization**
   - Zero-downtime background updates via `bootc update`.
   - Boot-level verification and instant rollback logic using ostree/bootc state models.
   - WASM-based browser ISO customization (`iso-builder`).

4. **Community Adoption & Contributor Workflows**
   - Onboarding desktop users through container-native developer workflows.
   - Low-friction packaging and maintenance for community desktop variants.
   - Lessons learned from multi-distribution community collaboration.

---

## Speaker Biography

*TunaOS Core Maintenance & Community Outreach Team* — driving container-native desktop operating system adoption, open-source ecosystem partnerships, and immutable workstation research.
