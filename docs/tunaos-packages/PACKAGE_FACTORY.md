---
sidebar_position: 9
title: "PACKAGE FACTORY"
---

This repository is the source-controlled package factory for TunaOS. It builds
and signs packages in GitHub Actions, tests them against declared distro
targets, and publishes only validated repositories to Cloudflare R2.

## Supported targets

| Target | Format | Repository | Status |
|---|---|---|---|
| EL10 | RPM | rpm-md | supported |
| Ubuntu | DEB | APT | supported foundation |
| Debian Sid | DEB | APT | supported foundation |
| openSUSE Tumbleweed | RPM | rpm-md | supported foundation |
| Arch | pkg.tar.zst | pacman | scaffold |

The authoritative target and R2-path contract is
[`manifests/package-factory.yaml`](https://github.com/tuna-os/tunaos-packages/blob/main/manifests/package-factory.yaml).

## One contract, one build engine per target

The contract is shared; the engines are not.  A package counts only when it
builds in **its target's own root**, installs from the staged repository on
**that target**, and (where it touches a session) starts one.  Nothing built
for one target is ever repackaged for another: the build root is an ABI
input, and reusing binaries across roots trades build time for silent ABI
failures (measured twice -- `docs/experiments/tideforge-universal-intermediate.md`,
and the Rawhide-root `GLIBC_2.44` leak in `docs/HUMMINGBIRD-TARGET.md` §2).

| Target | Engine | Root | Runtime gate |
|---|---|---|---|
| EL10 | mock + native specs (`src/gnome-5x`, `src/deps`, `src/xfce-wayland`) | `centos-stream-10-ci` (+CRB, EPEL as build inputs) | `build-gnome50-verify.yml` (Lima VM, GDM) |
| Fedora | mock + native specs | `fedora-44-ci` | clean-install cell |
| Hummingbird | mock + Rawhide dist-git imports | Fedora 44 + public-hummingbird by priority (`hummingbird-ci*.cfg`) | static installability walk + `dnf --assumeno` inside the pinned bootc-os image |
| Ubuntu, Debian | Tideforge → `debian/` + container build | the target's own container | clean-install cell; session smokes declared, not yet implemented |
| openSUSE Tumbleweed | Tideforge → spec + zypper build | Tumbleweed container | clean-install cell |
| Arch | Tideforge/native PKGBUILD + makepkg | archlinux container | clean-install cell |

What every engine shares -- and what "one contract" means:

- **the roots**: a desktop manifest names what a tunaOS image installs;
  the gap engine measures the closure against the target's own index;
- **the gates**: install from the staged repository on the target, then
  the installability walk and (Hummingbird today, the rest to follow) the
  consumer transaction inside the target's image;
- **the status board** (`docs/FACTORY-STATUS.md`): built-vs-needed per
  target and architecture, from live indexes, so a target that publishes
  nothing says so;
- **the promotion rule** below.

Two things are deliberately *not* built here.  **GNOME on Hummingbird** is
consumed from `projectbluefin/utah-packages`, pinned by digest on the
hummingbird target as a `consumed_indexes` entry: whatever it ships is
counted as already had, never rebuilt (`docs/HUMMINGBIRD-TARGET.md` §7-8).
**tromso and xfce-linux** (KDE and XFCE on freedesktop-sdk, BuildStream)
are whole-OS images built in their own repositories; they are products in
tunaOS's family, not package sources for any target here.

A target is declared only with a build leg, a served index and a consumer.
Measured 2026-09-02: every declared architecture but `arch`'s aarch64 meets
that bar (it has none of the three; narrowing it waits on the Arch engine
learning to stage sibling recipes at build time, because editing the
declaration schedules every Arch cell); openSUSE meets the first two and is
waiting on the third.

## Asking for a desktop on a target

The deliverable is a stack, not a repository. `scripts/request.py` is the front
door, and it measures distance to a working desktop in ordered stages — the
packages tunaOS's `desktop` criterion hard-fails without, then what the image
installs, then the tail:

```
just want "gnome 51 on hummingbird"              # what it would build
just want-measured "gnome 51 on hummingbird"     # distance to a working stack
```

The ordering matters more than the count. Measured 2026-08-28, the hummingbird
index served 580/673 of the build order and 3/10 of the packages a GNOME
session requires: a convergence reporting the first number keeps spending waves
while `gdm` and `gnome-shell` are absent.

Whether it BOOTS is tunaOS's question, not this repo's —
`.github/green-criteria.yml` there defines green as builds + ships the declared
desktop + boots under QEMU emitting `TUNAOS_DESKTOP_CONTRACT_OK`. What this
side answers is the negative that costs whole runs: while the contract stage is
open, an image build cannot boot into a session.

For the bringup loop on a host that remembers between attempts, see
[WARM-BUILDER.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/WARM-BUILDER.md). For the design, see
[RFC 012](https://github.com/tuna-os/tunaos-packages/blob/main/docs/rfc/rfc012-request-driven-convergence.md).

## Upstream source policy

Bluefin, Aurora, Fedora dist-git, and other upstream projects are inputs for
source and packaging metadata only. Before importing a package, record its
upstream commit/tag, license, patches, and target compatibility. TunaOS rebuilds
the package itself; it never enables an upstream COPR, PPA, or binary repository
in a produced image.

The current Bluefin, Aurora, and Zirconium parity inventory and delivery order
are maintained in [`UPSTREAM_PARITY.md`](https://github.com/tuna-os/tunaos-packages/blob/main/docs/UPSTREAM_PARITY.md).

## Promotion contract

Every candidate must build in the target buildroot, pass package tests, install
from the staged repository, and complete a desktop/runtime smoke test where the
package affects a session. Only then may CI sign and promote it to the stable R2
path. ORAS is suitable for immutable source/SBOM/provenance bundles, not as the
live DNF/APT/Pacman endpoint.

The same promoted index is also published as an OCI image, one tag per
build-chain cell (`ghcr.io/tuna-os/tunaos-packages:gnome50-el10-x86_64`),
content `/repository` = the signed RPMs and repodata exactly as R2 serves them,
cosign-signed by digest. That is the **image build's** input, not the live
endpoint: tunaOS pins the digest in `image-versions.yaml` and bind-mounts
`/repository` as a `file://` repo for the desktop install, the way it consumes
`projectbluefin/utah-packages` for hummingbird:gnome. A digest names exactly
the index an image was built against; a bucket sync cannot move under it.
Installed systems keep reading `https://repo.tunaos.org` (maintainer directive
2026-09-03: no more COPR, build in GitHub like utah-packages; #673).

### What enforces this today

The unified factory from RFC 011 (`docs/rfc/rfc011-unified-gap-driven-factory.md`)
is the enforcement, in two workflows:

- **`package-factory.yml`** is the single planner and the required gate. It
  computes the affected coordinates `(package | native family, target,
  architecture, release track, engine)` from the changed paths — or the full
  ~300-cell matrix on `main` and on schedule — and emits only those cells.
- **`package-factory-cell.yml`** is the single reusable build boundary every
  cell runs through. It derives a content-addressed action key from the
  cell's exact inputs, restores only an exact cached result (and re-verifies
  every restored byte), and otherwise builds fresh: render or import the
  native packaging, fetch the checksum-locked sources, build in a clean
  target buildroot with only the declared dependencies, lint the artifacts,
  stage them in an ephemeral repository, and clean-install them in a second
  container before running the recipe's command/file/service smoke check.

Two engines produce the payloads inside that one boundary. `tideforge` cells
build one recipe from `packages/<name>/package.yaml` for one target/arch.
`build-chain` cells build a whole native-spec family (the EL10 GNOME
backports, Wayland XFCE, hummingbird's desktop closure) from a tiered
`build-order*.yml` manifest, on both architectures — see
`manifests/package-builds.yaml`.

Because a desktop family is too large for one CI job, the factory converges
across runs rather than in one:

- The nightly schedule (12:00 UTC) runs the hummingbird desktop cells; a
  weekly schedule (Sunday 03:00 UTC) runs every `build-chain` family, so a
  family nobody touches is still rebuilt and its defects surface instead of
  reading as green by absence. Each schedule has its own concurrency group
  and is never cancelled by a merge (#480).
- A cell that hits the 6-hour job ceiling uploads what it built as a
  `<cell>-partial` artifact, and the next run of the same cell restores it
  (key-matched, `scripts/restore-partial-chain-output.py`) and continues
  from there — the chain skips any package whose exact NVR already exists.
- One contract-driven drift workflow (`gap-drift.yml`, replacing the
  per-target copies) re-measures each declared gap against the live index
  when it changes and opens a review PR that adds new work and *removes*
  work the distro has caught up on.

`scripts/factory-status.py` measures the result — built vs needed per target
and per architecture, from the live published indexes — into
`docs/FACTORY-STATUS.md` on a daily schedule. Since the trend layer it
also measures IMPROVEMENT itself: every run diffs against the last
merged measurement, renders per-target deltas and days-without-movement
from a history the JSON carries forward, flags any name that was served
and no longer is as **REGRESSED** (the repo-wipe shape, caught at
measurement time — #519 was found by exactly this check's first run),
and alarms when the refresh itself stops landing.

That measurement is also published as a browsable page
(`scripts/render-factory-site.py` -> GitHub Pages, by `pages.yml`), so
"what has the factory built, for which targets, and what is it still
missing" is answerable without a checkout. The page is a VIEW and never a
second source: it renders `docs/factory-status.json`,
`manifests/package-factory.yaml` and `manifests/package-builds.yaml` and
nothing else, it lists every declared-but-unmeasurable target with the
reason so coverage is never mistaken for the whole picture, and it says so
in its own header when the measurement behind it has gone stale. It
republishes when the data it renders changes rather than on a schedule,
because the daily refresh lands through a bot PR at an hour no cron can
predict.

The same site carries a **package browser** for `repo.tunaos.org` itself,
which answers a different question: not "how much of the plan is built"
but "what is actually IN the repository" — until now answerable only by
adding the repo to a machine and asking dnf, i.e. by trusting it first in
order to find out what it holds. `scripts/snapshot-repo-contents.py`
reads every `published_index` the contract declares, through the same
format-neutral index layer the hygiene checks use, at the same URLs a
package manager would use. So the listing cannot show a package the repo
does not serve, nor hide one it does. An index that cannot be read is
recorded and named on the page with its reason rather than dropped —
silently missing names is exactly what #519 looked like from outside — and
one dead prefix does not fail the deploy. This half DOES run on a timer,
for the opposite reason to the status page: its source is not a file in
git, so no commit marks the moment a publish wave changes what is served.
Around the build loop sit four preventive checks adapted from the
sandogasa toolset (provenance, incident history, and the
capability-per-format matrix in `SANDOGASA-ADAPTATIONS.md`), built on
one format-neutral index layer (`scripts/repo_index.py`) so they treat
every declared format as an equal — RPM, DEB, and pacman alike, each
judged with its own version comparator:
`scripts/preflight-buildrequires.py` answers before dispatch whether a
build order can build (name-level and version-level) and whether its
binaries will install; `scripts/check-published-hygiene.py` audits the
served prefix combination of every target with an index for duplicate
entries, name fights, and file conflicts; every publish path — rpm
wave, deb repo, pacman repo — refuses a publish that leaves a served
package unresolvable (`check-reverse-deps.py`,
`check-index-regression.py`); and both build chains record per-package
buildroot manifests so a red run diffs against the last green one
(`scripts/diff-buildroots.py`). `tests/test_target_tooling_parity.py`
keeps this per-format equality a CI property rather than an intention.

### What the gate does not cover

Recorded here on purpose. A gate whose exceptions are implicit reads as full
coverage to the next person, which is the exact failure this section exists to
prevent.

| Not covered | Scope | Why |
| --- | --- | --- |
| Runtime/session gates | all recipes | The 12 gate types the target-queue manifests declare (`greetd-login`, `*-session-smoke`, `selinux-enforcing`, …) are not implemented — see `TIDEFORGE-READINESS.md` and RFC 011 Phase 3. The install + smoke check above is the deepest automated gate today. |
| Staged install against the full desktop closure | `build-chain` families | The clean-install verify resolves from the target's system repositories, the published factory index, and the cell's own artifacts. A root package whose runtime closure is not yet fully published can pass build + lint while its desktop cannot yet be assembled — `docs/FACTORY-STATUS.md` is the honest ledger of that distance. |

The old trap of a package directory existing but being in no matrix is now a
CI failure rather than a footnote: the full plan enrols every recipe for
every target its `package.yaml` declares (289 tideforge cells + 12
build-chain cells at the time of writing), and the catalog completeness
tests (`tests/test_catalog_completeness.py`) require every package the
factory executes to have a catalog entry whose payload exists on disk.

**Publication to R2 is deliberately manual.** `promote-to-prod.yml` and
`promote-gnome49-to-prod.yml` were removed from `main` after the GNOME repo
wipe — see `INCIDENT-repo-wipe-gnome.md`. The publishers that exist today
(`publish-tideforge-rpms.yml`, `publish-tideforge-debs.yml`,
`publish-tideforge-arch.yml`, `publish-build-chain-rpms.yml`) are
`workflow_dispatch`-only curated waves: a human names the wave, the publisher
rebuilds or promotes only cells the factory gate has covered, and each
publisher ends with a verify job that installs the wave from the *served*
index (`scripts/verify-published-wave.py` on the build-chain path) before
the run may go green. Folding these per-format
publishers into one promotion step behind the factory boundary is tracked in
#484; until then, adding a publisher trigger that is not a deliberate human
dispatch is out of contract.

When automated promotion is reintroduced, it must depend on the factory gate
rather than re-deriving its own idea of "green". Two failure modes this
repository has already paid for:

- Do not add `paths`-filtered jobs to branch protection's required checks. A
  PR that touches none of those paths never reports them and the branch
  blocks forever. That is #128, and #130 is its sibling.
- Do not gate on a workflow-level conclusion that includes skipped jobs. A
  skipped gate is not a passed gate.

## Package layout

New work should use this shape:

```text
packages/<name>/
  source.yaml             # upstream URL, revision, license, checksum
  rpm/<target>/*.spec     # RPM packaging and patches
  debian/                 # Debian packaging
  arch/PKGBUILD           # Arch scaffold when supported
  opensuse/*.spec          # openSUSE scaffold when supported
```

Existing `src/` packages are migrated incrementally; they remain build inputs
until their package directories are moved without changing the published NVR.

## Target-native overlays

Source graphs can be shared, but package metadata and compatibility work cannot.
For example, the GNOME queue in `manifests/target-queues/gnome.yaml` keeps the
EL10 bootstrap/spec and SELinux compatibility overlay native to RPM while
Debian Trixie and Ubuntu render and test DEB packages independently.

## Tideforge: experimental single-recipe workflow

Tideforge is developed in parallel with the established native RPM/DEB
pipelines. Those native pipelines remain the production distribution path until
Tideforge renders equivalent artifacts and passes the same build, install, and
runtime gates.

Use `packages/_template/package.yaml` as the only author-maintained recipe.
`scripts/tideforge.py` validates the recipe, shows its per-target build plan,
and renders native RPM or Debian packaging:

```bash
python3 scripts/tideforge.py validate packages/my-package/package.yaml
python3 scripts/tideforge.py plan packages/my-package/package.yaml --target el10
python3 scripts/tideforge.py render packages/my-package/package.yaml --target ubuntu --output out/ubuntu
```

Before adding a native dependency spelling to the catalog or promoting a
recipe, probe it in the actual target container. This resolves recipe
capabilities (for example `dbus-dev`) to native package names and checks the
live repository metadata without installing anything into the host:

```bash
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --dry-run
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --target el10
python3 scripts/probe-target-dependencies.py packages/my-package/package.yaml --json
```

The tool emits target-native files because the package managers require them,
but maintainers edit one recipe. A target override is limited to the dependency
or build difference that cannot be made portable.

When an upstream source archive omits required git submodules, use the optional
`sources` list rather than an unpinned clone in a build command. Each auxiliary
archive has an HTTPS URL, SHA-256, filename, destination below the primary
source tree, and optional `strip_components`. Tideforge renders those archives
as native RPM/Pacman sources and extracts them before the build. This keeps a
complex source closure reviewable and reproducible; a recipe is not eligible
for promotion until its target CI builds the complete closure.

Cargo recipes build with `--locked` by default.  An upstream release with a
demonstrably stale *root-package* entry in an otherwise pinned `Cargo.lock` may
set `build.cargo_locked: false`, but it must include a specific
`build.cargo_lock_reason` and is accepted only after the resulting lockfile
diff has been reviewed in the target build.
