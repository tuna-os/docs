---
sidebar_position: 3
title: "Roadmap"
---

> [!WARNING]
> **Deprecated.** Nothing consumes this repository's packages — see
> [README.md](https://github.com/tuna-os/debian-copr/blob/main/README.md#why-this-is-deprecated). The milestones below are kept
> as a record of intent; none of them is being worked.

This document tracks the strategic goals, release contracts, and milestone targets for the `debian-copr` APT package pipeline.

## Strategic Overview

`debian-copr` builds and hosts APT repository packages required by Debian-based image variants (such as `grouper`).

## Roadmap Milestones

### Q3 2026: Pipeline Stabilization & Security Pinning
- [ ] Pin build dependencies and rclone credentials to secure environment contexts.
- [ ] Implement automated build-chain validation tests in CI.
- [ ] Establish formal package manifest parity verification.

### Q4 2026: Multi-Variant Package Distribution & Release Contract
- [ ] Automate release signing and attestation verification.
- [ ] Support expanded packaging matrix for downstream Debian-family desktop variants.
- [ ] Implement release SLA monitoring for published APT repositories.
