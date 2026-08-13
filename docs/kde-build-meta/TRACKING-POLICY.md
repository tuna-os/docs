---
sidebar_position: 4
title: "TRACKING POLICY"
---

This document formalizes the source tracking and release management strategy for `kde-build-meta`.

---

## 1. Tracking Model: Rolling Master (`Option A`)

`kde-build-meta` maintains upstream KDE Linux alignment by tracking rolling `master` / development branches across KDE element groups:

- **KDE Frameworks, Plasma, and Applications**: Track rolling development sources via daily automated tracking (`.github/workflows/track-bst-sources.yml`).
- **Rationale**: Downstream consumer repositories (such as `tunaos`) rely on rolling nightly builds for early integration testing, while stability is enforced via downstream promotion gates.

---

## 2. Evaluation of Release Tag Tracking (`Option B`)

Switching to `track: v[0-9]*` release tags is currently **not adopted** due to:

- **Release Candidate Collision**: Upstream KDE publishes release candidate tags (e.g. `v6.9.0-rc1`). Standard `git_repo` tracking in BuildStream cannot filter out `-rc` or `-beta` suffixes natively, which would cause automated tracking to pin pre-release tags.
- **Future Tag-Tracking Prerequisites**: Transitioning to release tags in the future will require either an upstream BuildStream exclude-pattern feature or a custom pre-commit tracking step that strips pre-release candidate tags.
