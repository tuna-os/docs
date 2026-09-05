---
sidebar_position: 3
title: "Roadmap"
---

This repository is the supported Homebrew distribution channel for TunaOS
tools. Its success is measured by whether a supported upstream release becomes
installable and stays installable, not by the number of formula files added.

## Current state (August 2026)

| Package | Channel state | Upstream ownership |
| --- | --- | --- |
| `corral-vm` | Published at v0.6.0 | GoReleaser in `tuna-os/corral` |
| `tavern` | Hand-maintained cask at GitHub Release v0.1.9 | Manual; automation not assigned |
| `bluefin-cli` | Candidate; no formula | Admission and publisher not assigned |

The tap has syntax validation, while producer-to-consumer validation is tracked
in [#7](https://github.com/tuna-os/homebrew-tap/issues/7). Release-channel
ownership and freshness are tracked in
[#12](https://github.com/tuna-os/homebrew-tap/issues/12).

## Near term: define the supported channel

- [ ] Name an owner in each upstream repository for publishing or updating its
  tap entry.
- [ ] Set a release-currency objective: update a supported formula or cask, or
  publish a visible exception, within 48 hours of an eligible upstream release.
- [ ] Decide whether `bluefin-cli` meets the admission requirements and open an
  owned delivery tracker if accepted.
- [ ] Decide whether Tavern's authoritative version is its GitHub Release or its
  newer source tags before automating cask updates.

Exit condition: every entry in the catalog has an authoritative upstream
release source, an owner, and a documented update path.

## Mid term: make currency observable

- [ ] Add producer-consumer validation that checks URLs, checksums, and installs
  for proposed formula and cask changes (#7).
- [ ] Run a scheduled currency check that compares each tap entry with its
  authoritative upstream release and opens or updates one actionable alert.
- [ ] Exercise installs on the operating systems advertised by each entry;
  syntax-only validation is not an install signal.
- [ ] Record the release-to-tap delay and smoke-test result in pull requests.

Exit condition: the supported catalog passes scheduled install checks and no
entry exceeds the freshness objective without a visible exception.

## Longer term: grow through explicit admission

New packages should be admitted only when they have:

1. a stable, versioned upstream release with supported Homebrew assets or a
   reproducible source build;
2. an upstream owner and automated update path;
3. an install test on every advertised platform; and
4. a rollback or disable path for broken releases.

Review the catalog quarterly. Remove unsupported entries deliberately instead
of allowing them to become silent, stale installation paths.

## Health measures

| Measure | Target |
| --- | --- |
| Eligible release to tap update or exception | 48 hours or less |
| Supported entries with a named upstream owner | 100% |
| Scheduled install checks passing | 100% |
| Advertised pending entries without an owner/tracker | 0 |
