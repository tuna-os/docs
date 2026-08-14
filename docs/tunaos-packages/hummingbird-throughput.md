---
sidebar_position: 17
title: "hummingbird throughput"
---

Measured from the GitHub Actions logs of five real `Build Hummingbird desktops`
runs, 2026-07-25 to 2026-08-08.  Per-package numbers come from mock's own
`INFO: Done(...) Config(hummingbird-ci) N minutes M seconds` / `ERROR:
Exception(...)` lines; wall clock comes from the log timestamps of `==> Build
chain starting` to `==> ===== Summary`.

Method note: `build-chain.sh` runs each package in a background subshell whose
stdout is a pipe, so a worker's whole block of output carries the timestamp of
when the worker *exited*.  Per-package durations therefore have to be read off
mock's own timers, not off the surrounding log timestamps.

## The runs

| run | tier(s) | packages built | Σ mock | build-step wall | Σ mock / wall |
|---|---|---|---|---|---|
| [31137480986](https://github.com/tuna-os/tunaos-packages/actions/runs/31137480986) | gnome-00 | 106 | 282.0 m | 288.4 m | **97.8%** |
| [31158689244](https://github.com/tuna-os/tunaos-packages/actions/runs/31158689244) | gnome-00 | 106 | 240.5 m | 246.2 m | **97.7%** |
| [31179614825](https://github.com/tuna-os/tunaos-packages/actions/runs/31179614825) | gnome-01 | 29 | 75.7 m | 77.5 m | **97.6%** |
| [31215339645](https://github.com/tuna-os/tunaos-packages/actions/runs/31215339645) | kde-00 | 47 | 87.6 m | 90.3 m | **97.0%** |
| [31242725235](https://github.com/tuna-os/tunaos-packages/actions/runs/31242725235) | niri-00 | 12 | 15.7 m | 16.4 m | **95.6%** |

194 distinct packages, 6.80 hours of mock time.
min 42 s, p10 52 s, median 77.5 s, mean 126 s, p90 186 s, max 2686 s.

## Finding 1 — the job runs at concurrency 1.0, not 2

Σ mock is 95.6%–97.8% of the build step's entire wall clock, in every run, with
`--jobs 2`.  Two workers cannot both be inside mock 97% of the time; one can.
The `flock /local-repo/repo.lock` around `mock --rebuild` in
`build_package_podman` is **exclusive**, so `--jobs` selects how many workers
wait.  This is exactly what #266 diagnosed from the source; these are the
numbers that confirm it from the outside.

Nothing else in the build step is worth optimising until that lock is a
reader/writer split: at concurrency 1, every scheduling improvement upstream of
it is invisible.

## Finding 2 — 34% of mock time is rebuilding the same buildroot, 194 times

`Start: creating root cache` appears once per package across all five runs.
`unpacking root cache` appears **zero** times.  `/var/cache/mock` is not
mounted (`MOCK_CACHE_DIR` was unset for this workflow), so it lives inside the
per-package `podman run --rm` container and is discarded with it.  Every
package therefore pays `installing minimal buildroot with dnf5` in full, and
then pays again to tar a root cache nothing will ever read.

The shortest mock invocation observed anywhere in the corpus is **42 s**
(`python-aiohappyeyeballs`, which did chroot init and then failed at
`%pyproject_buildrequires`); the shortest *successful* one is **46 s**
(`vpnc-script`, whose `%install` copies a single shell script).  The eight
`niri-00` packages that failed at `%pyproject_buildrequires` — i.e. that did
chroot init, then stopped — ran 42–52 s.

Taking 43 s as the floor: it is paid 194 times, **2.32 h of the 6.80 h,
34.1%.**  It is a floor, not an average, so this is the conservative end.

Mock is built to avoid this and `--uniqueext` does not defeat it.  From
`mockbuild/buildroot.py`:

```python
self.shared_root_name = config['root']
if 'unique-ext' in config:
    config['root'] = "%s-%s" % (config['root'], config['unique-ext'])
...
self.cachedir = os.path.join(self.cache_topdir, self.shared_root_name)
```

The cache is keyed on the name from *before* uniqueext is appended, so
per-package chroots share one cache by design, with an fcntl lock (shared to
unpack, exclusive to rebuild) in `plugins/root_cache.py`.  On a hit,
`_init()` recomputes `chroot_was_initialized` after the preinit hooks, finds
the chroot populated, and skips `_init_pkg_management()` — and
`_rebuild_root_cache()` then declines to re-tar it.

It is safe against the local repo changing mid-run, which it does after every
tier: the root cache holds only the *minimal* buildroot, `BuildRequires` are
resolved after the unpack against the live repos, and mock's
`templates/fedora-rawhide.tpl` — which `mock/hummingbird-ci.cfg` includes —
sets `metadata_expire=0` in `[main]`, so cached metadata is revalidated on
every transaction.

## Finding 3 — there is a long pole, but it is 11%, not 93%

The largest single package in the corpus is `highway` at **44.8 m**, then
`abseil-cpp` at 30.0 m.  `highway` is 16% of gnome-00's mock time in the run it
appeared in, 11% of the tier's wall clock.

That matters for how much parallelism is worth buying, not for whether to buy
any.  For gnome-00 (Σ 16921 s, max 2707 s) the wall clock with W workers is
`max(Σ/W, max_pkg)`:

| W | 1 | 2 | 4 | 6 | 8 | 16 |
|---|---|---|---|---|---|---|
| gnome-00 wall | 282 m | 141 m | 70 m | 47 m | 45 m | 45 m |

The long pole binds from W≈7. Below that the packing is essentially perfect —
**at W=4 the tier barrier wastes no measurable time at all** (4 × 4230 s =
16920 s against Σ 16921 s).

## What that means for issue #267's three items

1. **Tier barriers.**  Real, but worth nothing yet.  At the 4 vCPU the job runs
   on, a tier's idle tail is ~0; a DAG wavefront only starts paying above ~6
   concurrent builds per tier, which requires both #266 and more cores.
2. **One runner per dispatch.**  This is the live ceiling.  680 packages at the
   measured 126 s mean is **~23.8 h of serialised mock**, and it is being asked
   of one runner out of the org's 60.  `desktop: all` cannot ever complete:
   gnome-00 alone was 288 m against a 360 m job cap.
3. **Runner size.**  Not actionable.  Blacksmith runners were removed org-wide
   on 2026-08-08 and every `runs-on:` in this repository is now `ubuntu-latest`
   or `ubuntu-24.04-arm`; no larger GitHub-hosted label is in use anywhere here
   and there is nothing to verify an entitlement against.  Note also that four
   concurrent mock builds on 4 vCPU share those 4 cores with `%{_smp_mflags}`,
   so for the compile-bound tail (`highway`, `abseil-cpp`) in-job concurrency
   repacks the cores rather than multiplying them — only more machines do that.

## Runner budget

One job per desktop is **5 concurrent runners** for the `desktop: all` path,
plus one short-lived `plan` job.  That is 8% of the org's 60, and it displaces
nothing that runs on a cron: this workflow is `workflow_dispatch` only.

The bootstrap tiers (10 packages, ~10 m) are rebuilt by each desktop job rather
than being built once and handed over.  That is 40 runner-minutes of duplicate
work, entirely off the critical path, against the alternative of a cross-job
dependency plus an artifact round-trip.  Sharding *within* a tier was rejected
for the same reason at a larger scale: each additional job pays the fixed
per-job cost measured at **184 s** (setup + checkout + apt + podman pull + R2
seed, run 31242725235, 05:54:29→05:57:33), so one job per package for all 680
would spend ~35 runner-hours on setup to parallelise ~24 runner-hours of work.

## Canary A/B, and the flag that made the first attempt worthless

Tier `niri-00`, 24 packages, `force: true`, `publish: false`, same runner
class, both after #266 landed (so `--jobs $(nproc)` = 4):

| run | branch | build-chain wall | Σ mock | `creating root cache` | `unpacking root cache` |
|---|---|---|---|---|---|
| [31265993115](https://github.com/tuna-os/tunaos-packages/actions/runs/31265993115) | `main` | **39.02 m** | 74.2 m | 24 | 0 |
| [31268488082](https://github.com/tuna-os/tunaos-packages/actions/runs/31268488082) | + `MOCK_CACHE_DIR` | **39.49 m** | — | 24 | 0 |

**No improvement.**  The mount was correct — the log shows mock writing
`/var/cache/mock/hummingbird-ci/root_cache/cache.tar.gz` with return code 0,
on the shared path with no uniqueext in it, exactly as
`buildroot.py`'s `shared_root_name` predicts.  What it also shows, 18 times:

```
INFO: /tmp/mock-configdir/hummingbird-ci.cfg newer than root cache; cache will be rebuilt
```

`_unpack_root_cache` unlinks the tarball when any file in `config_paths` is
newer than it.  `build-chain.sh` assembles the configdir inside every
package's container with

```sh
cp -a /etc/mock/. /tmp/mock-configdir/
cp    /repo-mock/*.cfg /tmp/mock-configdir/
```

and the second `cp` has no `-p`, so `hummingbird-ci.cfg` is stamped with the
current time microseconds before mock starts — always newer than a cache any
earlier package wrote.  Every package deleted the cache, rebuilt the
buildroot, re-tarred it, and threw it away.

With `-p` the profile keeps its checkout mtime, which precedes every cache
the run writes.  That is the whole fix, and nothing in the run reports its
absence: an invalidated root cache is merely slow.

Concurrency, for the record, is now 74.2 m of mock over 39.02 m of wall =
**1.90**, not the 4 that `--jobs $(nproc)` asks for, and per-package mock
time roughly doubled (median 77.5 s at jobs=2-but-serialised, 138.5 s at
jobs=4) because four builds share four cores with `%{_smp_mflags}`.  That is
the ceiling more machines address and in-job concurrency does not.

## Summary Status (#267)

* **One runner per dispatch**: Matrixed plan/build jobs implemented in PR #277.
* **Mock chroot root cache**: Shared cache directory with `-p` flag implemented in PR #277.
* **Runner size**: GitHub-hosted 4-vCPU standard runners in use across org.
* **DAG wavefront**: Documented; evaluated for higher worker concurrency tiers.

