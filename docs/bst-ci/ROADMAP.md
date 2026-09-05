---
sidebar_position: 3
title: "Roadmap"
---

This document tracks strategic goals, pinning contracts, and maintenance schedules for `bst-ci` shared BuildStream CI infrastructure.

## Strategic Overview

`bst-ci` provides reusable BuildStream CI actions and workflows across all Tuna OS desktop image variant repositories.

## Roadmap Milestones

### Q3 2026: Supply-Chain Hardening & Pinning Policies
- [ ] Enforce strict commit SHA / digest pinning for external GitHub actions and containers.
- [ ] Eliminate implicit fallback checkouts of `main` branch across reusable workflows.
- [ ] Add explicit unit and integration test suites for linting and build-matrix helper scripts.

### Q4 2026: Multi-Architecture Build Acceleration & Observability
- [ ] Implement caching and artifact retention policies for BuildStream runners.
- [ ] Expand architecture coverage matrix for ARM64 and RISC-V image builds.
- [ ] Provide standardized telemetry for image build durations and failure modes.
