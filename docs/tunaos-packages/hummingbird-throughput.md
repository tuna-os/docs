---
sidebar_position: 29
title: "hummingbird throughput"
---

Measured from the GitHub Actions logs of five real `Build Hummingbird desktops`
runs, 2026-07-25 to 2026-08-08.  Per-package numbers come from mock's own
`INFO: Done(...) Config(hummingbird-ci) N minutes M seconds` / `ERROR:
Exception(...)` lines; wall clock comes from the log timestamps of `==> Build
chain starting` to `==> ===== Summary`.

Method note: `build-chain.sh` runs each package in a background subshell with
a pipe for stdout.  Thus, a worker's whole output block carries the timestamp
of when the worker *exited*.  Read per-package durations from mock's own
timers, not from the adjacent log timestamps.

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

First split that lock into reader/writer modes.  Until then, no other build-step
optimization helps: at concurrency 1, improvements to the schedule upstream
of the lock are invisible.

## Finding 2 — 34% of mock time is rebuilding the same buildroot, 194 times

`Start: creating root cache` appears once per package across all five runs.
`unpacking root cache` appears **zero** times.  The workflow does not mount
`/var/cache/mock` (`MOCK_CACHE_DIR` was unset).  The directory lives inside the
per-package `podman run --rm` container; podman discards both together.  Every
package therefore pays `installing minimal buildroot with dnf5` in full, and
then pays again to tar a root cache nothing will ever read.

The shortest invocation of mock in the corpus took **42 s**:
`python-aiohappyeyeballs` did chroot init and then failed at
`%pyproject_buildrequires`.  The shortest *successful* invocation took **46 s**:
`vpnc-script`, whose `%install` copies a single shell script.  The eight
`niri-00` packages that failed at `%pyproject_buildrequires` ran 42–52 s.
They did chroot init, then stopped.

The floor is 43 s per package.
Across 194 packages, that costs **2.32 h of the 6.80 h, 34.1%.**
This is a floor, not an average.  Thus, the estimate is conservative.

Mock is built to avoid this and `--uniqueext` does not defeat it.  From
`mockbuild/buildroot.py`:

```python
self.shared_root_name = config['root']
if 'unique-ext' in config:
    config['root'] = "%s-%s" % (config['root'], config['unique-ext'])
...
self.cachedir = os.path.join(self.cache_topdir, self.shared_root_name)
```

Mock keys the cache on the name from *before* it appends uniqueext.
By design, all packages use the same cache for their chroots.
`plugins/root_cache.py` uses an fcntl lock: shared to unpack, exclusive to rebuild.  On a hit,
`_init()` recomputes `chroot_was_initialized` after the preinit hooks, finds
the chroot populated, and skips `_init_pkg_management()` — and
`_rebuild_root_cache()` then declines to re-tar it.

The cache remains safe when the local repo changes mid-run, after every tier.
The root cache holds only the *minimal* buildroot.  After the unpack, mock
resolves `BuildRequires` against the live repos.
Mock's `templates/fedora-rawhide.tpl` — which `mock/hummingbird-ci.cfg` includes —
sets `metadata_expire=0` in `[main]`.  Thus, on every transaction,
mock checks that cached metadata remains valid.

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

The long pole binds from W≈7. Below that, the schedule has almost no gaps.
**At W=4 the tier barrier wastes no measurable time at all**:
4 × 4230 s = 16920 s against Σ 16921 s.

## What that means for issue #267's three items

1. **Tier barriers.**  Real, but worth nothing yet.  The job runs on 4 vCPU;
   a tier's idle tail is ~0.  A DAG wavefront helps only above ~6 concurrent
   builds per tier.  That needs both #266 and more cores.
2. **One runner per dispatch.**  This is the live ceiling.  680 packages at the
   measured 126 s mean need **~23.8 h of serialised mock**.
   Only one of the org's 60 runners does that work.
   `desktop: all` cannot ever complete:
   gnome-00 alone was 288 m against a 360 m job cap.
3. **Runner size.**  Not actionable.  On 2026-08-08, the org stopped use of
   large runners from third parties.  Every `runs-on:` in this repository is now `ubuntu-latest`
   or `ubuntu-24.04-arm`.  No larger GitHub-hosted label is in use anywhere here.
   There is nothing to verify an entitlement against.
   Four concurrent mock builds on 4 vCPU share those 4 cores with `%{_smp_mflags}`.
   For the compile-bound tail (`highway`, `abseil-cpp`), in-job concurrency
   repacks the cores; it cannot multiply them.  Only more machines do that.

## Runner budget

One job per desktop is **5 concurrent runners** for the `desktop: all` path.
A short-lived `plan` job also runs.  That is 8% of the org's 60, and it displaces
nothing that runs on a cron: this workflow is `workflow_dispatch` only.

Each desktop job rebuilds the bootstrap tiers (10 packages, ~10 m).
The alternative builds them once and hands them over.  The duplicate work costs
40 runner-minutes, entirely off the path that determines completion time.
The alternative needs a cross-job dependency plus an artifact round-trip.

For the same reason, the design rejects shards *within* a tier at a larger scale.
Each additional job pays a fixed cost of **184 s** for setup.
The measurement covers setup + checkout + apt + podman pull + R2 seed
(run 31242725235, 05:54:29→05:57:33).
Thus, one job per package for all 680 would spend ~35 runner-hours on setup
to parallelise ~24 runner-hours of work.

## Canary A/B, and the flag that made the first attempt worthless

Tier `niri-00`, 24 packages, `force: true`, `publish: false`, same runner
class, both after #266 landed (so `--jobs $(nproc)` = 4):

| run | branch | build-chain wall | Σ mock | `creating root cache` | `unpacking root cache` |
|---|---|---|---|---|---|
| [31265993115](https://github.com/tuna-os/tunaos-packages/actions/runs/31265993115) | `main` | **39.02 m** | 74.2 m | 24 | 0 |
| [31268488082](https://github.com/tuna-os/tunaos-packages/actions/runs/31268488082) | + `MOCK_CACHE_DIR` | **39.49 m** | — | 24 | 0 |

**No improvement.**  The mount was correct.  The log shows that mock wrote
`/var/cache/mock/hummingbird-ci/root_cache/cache.tar.gz` with return code 0.
The shared path has no uniqueext, exactly as
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

The second `cp` has no `-p`, so it stamps `hummingbird-ci.cfg` with the
current time microseconds before mock starts.  That timestamp is always newer
than a cache any earlier package wrote.  Every package deleted the cache,
rebuilt the buildroot, re-tarred it, and threw it away.

With `-p` the profile keeps its checkout mtime, which precedes every cache
the run writes.  That is the whole fix, and nothing in the run reports its
absence: an invalidated root cache is merely slow.

Concurrency is now 74.2 m of mock over 39.02 m of wall = **1.90**,
not the 4 that `--jobs $(nproc)` asks for.
Mock time per package roughly doubled: median 77.5 s at jobs=2-but-serialised,
138.5 s at jobs=4.  Four builds share four cores with `%{_smp_mflags}`.
More machines address that ceiling; in-job concurrency does not.

## Postscript, 2026-08-25 — Finding 2 came back

The `-p` fix and the shared-cache mount both landed in PR #277, and the
measurement above is what justified them.
`.github/workflows/build-hummingbird-desktops.yml` connected both fixes.
`6d4b77a` removed that workflow along with the rest of the hummingbird-specific
pipeline (#517).  Its replacement, `package-factory-cell.yml`, never set
`MOCK_CACHE_DIR`.  From that commit until 2026-08-25, every nightly paid the
full cost in section 2 again.  Nothing said so, because an unshared root cache
is only slow.

Restored on the branch for #512, with two changes to what #277 did:

* the mount is `<config>/root_cache`, not all of `/var/cache/mock`.  The
  sibling `yum_cache` accumulates every `BuildRequires` RPM a desktop closure
  downloads.  That risk was acceptable when a run was one tier.
  It is not acceptable now that a run is 4.5 h.
  The continuation shards resume from its partial output.
  Thus, an `ENOSPC` in hour three costs the night, not a package;
* it is `runner.temp`, not `actions/cache`.  Hundreds of packages in one job
  benefit from the cache.  The first package of each job rebuilds the tarball once.
  That costs less than a gigabyte transfer through the cache service.

`tests/test_the_mock_root_cache_is_actually_shared.py` pins all three modes
of silent failure.  One made #277's first try worthless: a cache path mock
never looks at.

## Summary Status (#267)

* **One runner per dispatch**: Matrixed plan/build jobs implemented in PR #277.
* **Root cache for mock chroots**: PR #277 implemented a shared cache directory with the `-p` flag.  #517 lost those connections; #512 restored them (see postscript).
* **Runner size**: The org uses standard GitHub-hosted runners with 4 vCPU.
* **DAG wavefront**: Documented; evaluated for tiers where more workers run concurrently.
