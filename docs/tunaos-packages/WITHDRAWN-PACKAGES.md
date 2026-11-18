---
sidebar_position: 21
title: "WITHDRAWN PACKAGES"
---

## The problem

A target's gap measurement generates its build order as (desktop closure)
minus (what upstream ships), so the moment upstream adopts a package this
factory correctly stops rebuilding it. That is only half of reacting to an
upstream publish: **nothing withdrew the copy already published.** The build
order shrinks; the served index does not, and the stale rebuild stays
indexed at whatever version it was cut at, indefinitely.

That would be harmless if version comparison decided which copy a consumer
installs. It does not. The desktop manifests that enable a target's rebuild
repository do so at `priority: 5`, and dnf's `priority` is **absolute**, not
a tie-break: a package from a higher-priority repository wins even when a
lower-priority one (the upstream the rebuild exists to track) offers a
newer build. So for any name both repositories carry, ours is what
installs -- and when ours is the older build, upstream's fix never reaches
the image. See [tunaos-packages#525](https://github.com/tuna-os/tunaos-packages/issues/525).

`scripts/check-upstream-shadowing.py`, wired into `upstream-drift.yml`,
detects this: it compares a target's served index against its declared
upstream index and reports every name where ours is older.

## The remedy is exclusion, not deletion

The obvious remedy -- delete the stale RPM from the live bucket -- is
exactly the shape of mistake [#124 / INCIDENT-repo-wipe-gnome](https://github.com/tuna-os/tunaos-packages/blob/main/INCIDENT-repo-wipe-gnome.md)
exists to prevent, and `scripts/publish-rpm-wave.sh`'s NEVER SHRINK guard
would refuse a publish whose local tree came out smaller than the one it
synced down -- correctly, since crossing that guard on purpose needs an
audited path the guard cannot tell apart from the bug it exists to catch.

It does not have to cross it. `createrepo_c -x PATTERN` excludes a file
from the repodata it generates **without touching the file**:

- the RPM stays in the synced-down tree exactly where it was;
- `count_rpms` (what the NEVER SHRINK guard checks) still counts it, so the
  guard never observes a withdrawal happening and never has to be told to
  allow one;
- and the served index -- what `check-upstream-shadowing.py` measures, and
  what dnf resolves against -- simply stops naming the withdrawn build, so
  upstream's copy (served from its own repository, carrying no priority) is
  what a consumer installs.

Removing the manifest entry below un-withdraws the package on the very
next publish: the file never left, so the next `createrepo_c` run indexes
it back in. No bucket deletion, no new destructive capability, no new
credential, and nothing a contributor runs against production --
publication stays exactly where
[CONTRIBUTING.md](https://github.com/tuna-os/tunaos-packages/blob/main/CONTRIBUTING.md#pull-requests) puts it, in trusted
GitHub environments only.

## How to withdraw a package

1. Run `python3 scripts/check-upstream-shadowing.py --target <target>` (or
   read the `upstream-shadowing-<target>` artifact `upstream-drift.yml`
   already uploads) to get the exact `package` and `served_evr` of what is
   shadowed.
2. Add one entry per `(name, evr)` under that target in
   `manifests/withdrawn-packages.yaml`:

   ```yaml
   targets:
     hummingbird:
       - name: sudo
         evr: "1.9.17-1.p2.fc43"
         reason: "public-hummingbird ships 1.9.17-16.p2.3.hum1 (#525)"
   ```

   Anchored on name **and** evr on purpose: the gap measurement already
   stops asking the factory to rebuild a name upstream ships, so an entry
   here only ever matches the exact stale build that earned it. A future
   rebuild of the same name at a different evr -- upstream dropping the
   package, or this factory legitimately catching back up -- is a
   different glob and is served normally; nothing here can suppress it by
   accident.
3. Open a PR. `tests/test_withdrawn_packages.py` validates the manifest
   (declared targets are real, no duplicate entries, no glob metacharacters
   in `name`/`evr`); `scripts/check-upstream-shadowing.py` stops failing
   for that `(name, evr)` as soon as the entry is merged -- it is reported
   as `withdrawn, pending publish` instead of an unactioned failure, so the
   drift check does not stay red waiting on a decision that has already
   been made.
4. The withdrawal takes effect on the **next publish** through whichever
   path reaches that target's prefix. For hummingbird that is both
   `build-chain-fanout.yml`'s dedicated publish job and
   `publish-build-chain-rpms.yml`'s matrix publisher (the
   `hummingbird-x86_64` / `hummingbird-aarch64` cells in
   `manifests/package-builds.yaml` reach the same prefix the fanout
   workflow does) -- both plan their excludes from this manifest via
   `scripts/plan-withdrawn-excludes.py`, so withdrawal holds regardless of
   which path a maintainer dispatches next.

No one needs to *do* anything to make withdrawal happen beyond merging the
manifest entry: publication was already a deliberate, dispatch-only human
action before this (`docs/PACKAGE_FACTORY.md`'s "adding a publisher trigger
that is not a deliberate human dispatch is out of contract"), and this
rides that same dispatch rather than adding a new one.

## Removing an entry

Delete it once `check-upstream-shadowing.py`'s `served_evr` for the package
no longer matches: either the next publish indexed a build no longer older
than upstream's, or the name dropped out of the overlap entirely (upstream
stopped shipping it, and the gap measurement is rebuilding it again).

## What this does not cover

- **Reverse dependencies are not simulated for a withdrawal.** The NEVER
  BREAK RDEPS gate in `publish-rpm-wave.sh` simulates whether a *staged
  wave* breaks an existing package's resolution; it does not simulate
  removing a name from repodata. In practice this is low risk -- the
  premise of a withdrawal is that upstream's repository (enabled
  alongside ours, without priority) still serves the name, so a consumer
  that needed it resolves it from there instead -- but an exact-version
  `Requires:` on a withdrawn NEVRA from some other still-served package in
  the same repository would not be caught before publish. The mitigation
  is the same one that makes withdrawal safe to begin with: it is
  reversible in one manifest edit and the next publish.
- **This is per target, not per architecture.** `check-upstream-shadowing.py`
  measures the architecture implied by a target's `r2_path` (x86_64 for
  hummingbird today). An entry's glob has no architecture in it on
  purpose, so it excludes the same `(name, evr)` on every architecture
  that happens to have published it, but nothing here measures aarch64
  separately to confirm there is anything to exclude there.
