---
sidebar_position: 1
title: Why TunaOS for enterprises
description: Position TunaOS for enterprise decision makers with a cost, lifecycle, and security comparison to other desktop OS models.
---

# Why TunaOS for enterprises

TunaOS builds bootc-based, immutable desktop images on Enterprise Linux bases. This page explains the cost, the support lifecycle, and the security posture for an enterprise buyer. It compares TunaOS to other desktop models.

## Cost of ownership

TunaOS cuts costs for enterprise IT desktops across license fees, image drift, and rebuild work.

- **No per-host license fee for the base.** Bases from AlmaLinux and CentOS Stream carry no license fee. This differs from RHEL, which charges per host. TunaOS itself has open source code. See [Choose a variant](/docs/choosing-a-variant).
- **Less image drift.** Every machine runs the same signed image. A new update swaps the whole image at once. There is no slow drift apart from the standard. This cuts the work to fix machines that have gone off standard.
- **Faster recovery.** A broken update rolls back in one step. You do not re-image a machine by hand. See the [deployment guide](/docs/guides/ENTERPRISE-DEPLOYMENT-GUIDE).

How TunaOS compares to other models:

| Model | Image model | Base cost | Customization |
| --- | --- | --- | --- |
| **TunaOS** | bootc, immutable | Free Enterprise Linux bases | Signed container images |
| **Fedora Atomic Desktop** | rpm-ostree, immutable | Free (Fedora) | Layer RPMs at the edge; no LTS tag |
| **RHEL** | yum/dnf, transactional | Per-host license | Traditional packages |
| **nixOS** | Nix, declarative | Free | Declarative config in the Nix language |

TunaOS keeps a familiar model. Admins manage images with bootc, dnf, Flatpak, and Homebrew.

nixOS declares the whole system in the Nix language. Pick TunaOS for a familiar image model. Pick nixOS for declarative config. See the [desktop comparison](/docs/desktop-comparison) for details.

## Support lifecycle

TunaOS ships image tags on a date-based schedule. Each tag fits a different user:

- **daily** — the latest build. For testers.
- **weekly** — the most stable build of the week. For regular users.
- **lts** — a quarterly snapshot. TunaOS recommends this tag for enterprise deployments. The `lts` tag means long-term support.

An enterprise fleet usually runs the `lts` tag. You get a stable, reviewed snapshot on a quarterly schedule. You do not chase the latest build. See the [tunaOS version guide](https://github.com/tuna-os/tunaOS/blob/main/VERSIONING.md).

Each supported variant has a stated support window. The [tunaOS roadmap](/docs/tunaos/ROADMAP) tracks which variants are stable, beta, or experimental. Pick a `Stable` variant for a production fleet.

## Security posture

TunaOS signs and scans every image. The [security policy](/docs/tunaos/SECURITY) lists the model:

- **Keyless verification.** TunaOS signs every image keylessly with [Sigstore Cosign](https://github.com/sigstore/cosign). The build uses the short-lived identity of the CI workflow. There is no long-lived verification key to steal or rotate.
- **SBOM attestations.** Each image ships with a signed Software Bill of Materials (SBOM). The SBOM lists every package in the image.
- **Pinned base images.** TunaOS builds from base images that use explicit digests. The build blocks if a base image changes.
- **Security scans.** The build scans the image for known vulnerabilities.
- **Coordinated disclosure.** Teams fix flaws, ship updates, and post advisories.

No permanent verification key or password can leak. This shrinks the attack surface for software delivery.

## Where to go next

- [Enterprise Deployment Guide](/docs/guides/ENTERPRISE-DEPLOYMENT-GUIDE) — deploy and manage a fleet.
- [Migration from Fedora Atomic](/docs/guides/MIGRATION-FROM-FEDORA-ATOMIC) — move workstations to TunaOS.
- [FAQ](/docs/faq) — common operations questions.
