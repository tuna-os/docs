---
sidebar_position: 11
title: "SANDOGASA ADAPTATIONS"
---

[slopfest/sandogasa](https://github.com/slopfest/sandogasa) is a Rust
workspace of Fedora/CentOS/Debian packaging tools (Apache-2.0 OR MIT).
Several of its tools solve, in mature form, problems this factory had
been hitting reactively — each of the adaptations below is pinned to a
factory incident that predates it. The ideas and algorithms were
reimplemented in this repository's Python, not linked as binaries: the
algorithms are small, the factory already parses its own repo metadata,
and a Rust toolchain dependency for CI-side checks would cost more than
it saves.

Licensing: sandogasa is dual-licensed Apache-2.0 OR MIT, which permits
reimplementation and adaptation here; the per-file docstrings record the
origin. Test vectors for the version comparator are carried over
verbatim.

## What was adapted, and from where

| Factory piece | Adapted from | The incident it pins |
| --- | --- | --- |
| `scripts/rpm_vercmp.py` — librpm's rpmvercmp with `~`/`^`, EVR compare, constraint check | `sandogasa-rpmvercmp` crate (vectors carried over) | `FACTORY-STATUS.md` measures presence, not freshness; every version-aware check below needs this primitive |
| `scripts/preflight-buildrequires.py` `version_blocked` | ebranch `BlockedByBase` | libnotify `>= 0.8.7` unsatisfiable on both arches, found by mock 2.5 h in, twice (#480) |
| `scripts/preflight-buildrequires.py` `runtime_unsatisfied` | ebranch `check_installability` | gtkgreet → greetd, xfce4-pulseaudio-plugin → pulseaudio: runtime holes found at clean-install time after a 53-minute build (#480) |
| `scripts/check-published-hygiene.py` | hs-relmon `dupe-subpkgs` + `file-conflicts` | the createrepo_c `--update` stale-entry class (#358); 107 same-NEVRA pairs with differing checksums on xfce/10-stream (#471) |
| `scripts/check-reverse-deps.py` + the NEVER BREAK RDEPS gate in `publish-rpm-wave.sh` | ebranch `check-update` | the gnome50 bootstrap glib2 `Obsoletes` hijacking AppStream (run 32405815822); publishing a libnotify the factory could no longer rebuild |
| `scripts/extract-buildroot-manifest.py` + `scripts/diff-buildroots.py`, recorded per package by `build-chain.sh` into `artifacts/buildroots/` | koji-diff | the #480 libnotify buildroot diagnosis, reconstructed from issue comments when mock's root.log had the answer |
| `scripts/collect-cell-throughput.py` | koji-lag's measure-from-metadata approach | `docs/hummingbird-throughput.md` was a one-off hand scrape (it found concurrency 1.0 with `--jobs 2`); now re-runnable against any cell log |

## One level of support across targets

sandogasa itself is Fedora/CentOS-centric; adapting it naively would
have produced an EL-focused toolset bolted onto a multi-target factory.
The adaptations are therefore built on a format-neutral layer,
`scripts/repo_index.py`: one index shape for every reader (rpm-md
primary.xml, flat-APT Packages, pacman .db) and one version comparator
per format — `rpm_vercmp`, `deb_version` (validated against real
`dpkg --compare-versions`, 900/900 pairs), and libalpm's variant in
`pacman_db`. The comparators provably disagree on real versions, so no
format is ever judged with another's ruler.
`tests/test_target_tooling_parity.py` is the enforcement: a format
declared in `manifests/package-factory.yaml` without a reader, a
comparator, a publish gate, and a buildroot record is a red test.

| Capability | rpm (el10/fedora/hummingbird/tumbleweed) | deb (ubuntu/debian) | pkg.tar.zst (arch) |
| --- | --- | --- | --- |
| index reader + version comparator | ✅ | ✅ | ✅ |
| served-index hygiene | ✅ | ✅ (no file lists in flat APT → file-conflict check inert, said in-tool) | ✅ once a `published_index` is declared |
| reverse-dep publish gate | ✅ `publish-rpm-wave.sh` | ✅ `publish-tideforge-debs.yml` (old-vs-new Packages) | ✅ `publish-tideforge-arch.yml` (old-vs-new .db) |
| buildroot manifests + differ | ✅ mock root.log / installed_pkgs | ✅ dpkg-query after build-dep | — no arch build chain exists yet; the differ already parses any manifest a future one writes |
| build/version/runtime preflight | ✅ (gap-engine manifests) | measured by the deb backport gap engine (`measure-deb-backport-gap.py`, pre-existing) | — no chain to preflight yet |
| throughput timers | ✅ mock's own timers | — the deb chain logs no per-package timer; add one there before extending the tool | — |

## Where each runs

- **Preflight** (`preflight-buildrequires.py`): manual gate before
  dispatching a chain; now answers build-time satisfiability, version
  constraints, and runtime installability in one run.
- **Hygiene** (`check-published-hygiene.py`): ad hoc or scheduled;
  reads the same `published_index` contract every buildroot reads —
  every format, through `repo_index` — so a clean report covers the
  *combination* of prefixes a buildroot sees. First live run: 8
  findings on el10 (gtk-layer-shell and xfconf families served
  identically from both prefixes), hummingbird and both deb targets
  clean.
- **Reverse-dep gates**: every publish path refuses a publish that
  breaks what is already served, entirely locally. rpm gates inside
  `publish-rpm-wave.sh` (staged repodata vs the synced-down tree); deb
  and arch regenerate their whole index in place, so they gate
  old-vs-new (`check-index-regression.py`) in their publishers, with
  native semantics — apt's highest-version candidate and `|`
  alternatives on deb, libalpm ordering on arch. All are differential
  by design: only what a publish *newly* breaks counts, so
  distro-archive dependencies outside the view are never noise, and
  the blind spots all lean lenient (documented in each script).
- **Buildroot manifests**: the rpm chains record mock's resolved
  buildroot (opt-in via `BUILDROOT_MANIFESTS`, switched on by the cell
  runner, into `artifacts/buildroots/`); the deb chain records a
  dpkg-query snapshot after every `build-dep` into its uploaded
  `buildroots/`. One differ reads both conventions.
- **Throughput**: run by hand against a downloaded cell job log when
  the 6-hour-ceiling work needs numbers.

## What was considered and NOT adapted

Recorded so the next reader does not re-survey the same ground:

- The forge/bureaucracy tooling (Bodhi, Bugzilla, FESCo, Pagure ACLs,
  meetbot, activity reporting) has no counterpart in this factory's
  problem space.
- `dbranch` assumes Debian's dist-git/PPA workflow; the deb side here
  is the backport chain (`backport-deb-chain.yml`), a different shape.
- ebranch's `fedrq` shell-outs were not carried over: the factory
  already parses primary.xml itself, and a run-time dependency on a
  Fedora-packaged query tool would not work in the deb and arch legs.
- koji-lag's SQLite store is the right shape if throughput collection
  ever becomes scheduled; for on-demand use, stateless parsing of one
  log is enough and simpler.
