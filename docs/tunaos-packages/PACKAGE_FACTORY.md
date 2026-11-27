---
sidebar_position: 12
title: "PACKAGE FACTORY"
---

This repository is the source-controlled package factory for TunaOS. It builds
and signs packages in GitHub Actions, tests them against declared distro
targets, and publishes only validated repositories to Cloudflare R2.

## Supported targets

| Target | Format | Repository | Status |
|---|---|---|---|
| EL10 | RPM | rpm-md | supported |
| Fedora ELN | RPM | rpm-md | supported |
| Ubuntu 26.04 Resolute (`ubuntu`) | DEB | APT | supported foundation |
| Ubuntu 24.04 Noble (`noble`) | DEB | APT | supported; index pending first publish |
| Debian Sid | DEB | APT | supported foundation |
| openSUSE Tumbleweed | RPM | rpm-md | supported foundation |
| Arch | pkg.tar.zst | pacman | scaffold |
| Gentoo | gpkg | Portage binhost + overlay | supported foundation |

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
| EL10 | mock + native specs (`src/gnome-5x`, `src/deps`, `src/xfce-wayland`) | `centos-stream-10-ci` (+CRB, EPEL as build inputs) | clean-install cell (the Lima/GDM boot workflow `build-gnome50-verify.yml` was retired in #430) |
| Fedora | mock + native specs | `fedora-44-ci` | clean-install cell |
| Fedora ELN | mock + native specs / Tideforge | `fedora-eln-ci` | clean-install cell |
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
**tromso and brussels** (KDE and XFCE on freedesktop-sdk, BuildStream)
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
  On a pull request, cells selected only because shared code changed
  (factory scripts, the cell workflow, `build-chain.sh`, a format adapter, a
  target contract) are rotated: each push builds
  `PACKAGE_FACTORY_ROUND_ROBIN_SIZE` of them (repository variable, default 3,
  `0` builds all), chosen by run number. Cells whose own recipe, manifest or
  sources changed always build. The push to `main` builds the whole set.
- **`package-factory-cell.yml`** is the single reusable build boundary every
  cell runs through. It derives a content-addressed action key from the
  cell's exact inputs, restores only an exact cached result (and re-verifies
  every restored byte), and otherwise builds fresh: render or import the
  native packaging, fetch the checksum-locked sources, build in a clean
  target buildroot with only the declared dependencies, lint the artifacts,
  stage them in an ephemeral repository, and clean-install them in a second
  container before running the recipe's command/file/service smoke check.

The Tumbleweed build, RPM lint and clean-install containers first refresh their
native repositories and run `zypper dup --no-allow-vendor-change`, before they
add factory repositories or install dependencies. A container image
can contain newer runtime libraries than the selected repository snapshot.
An isolated dependency install can then fail on exact runtime/development
version pairs. The native distribution transaction keeps that baseline
consistent. It does not change recipe version requirements or accept broken
dependencies. Factory repository priorities and package checks stay unchanged.

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

For Hummingbird, the publisher checks installability after it signs and
indexes the wave, but before `rclone sync` makes that index public.
`scripts/check-hummingbird-installability.py --fail-on-regression`
walks the new tree. It refuses a wave that leaves a desktop worse off than
`docs/hummingbird-installability-baseline.json` records.
This is a ratchet, not a green gate: no Hummingbird desktop resolves yet.
It answers the question before a sync makes the wave public.

The same walk names packages that the index serves but the target cannot install.
The chain's served-NVR skip no longer counts these as built
(`list-served-nvrs.py --except-names`).
The chain can then rebuild an ABI leak in the correct root.
Waves no longer skip it (#629).

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
`publish-tideforge-arch.yml`, `publish-tideforge-gentoo.yml`,
`publish-build-chain-rpms.yml`) are
`workflow_dispatch`-only curated waves: a human names the wave, the publisher
rebuilds or promotes only cells the factory gate has covered, and each
publisher ends with a verify job that installs the wave from the *served*
index (`scripts/verify-published-wave.py` on the build-chain path) before
the run may go green. Folding these per-format
publishers into one promotion step behind the factory boundary is tracked in
# 484; until then, adding a publisher trigger that is not a deliberate human
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

Recipes inherit every architecture declared by each target unless their optional
top-level `architectures` mapping narrows admission for that target:

```yaml
targets: [arch]
architectures:
  arch: [x86_64]
```

Each key must name a target in the recipe's `targets`.
Each value is a list of unique architectures from that target.
The list cannot be empty.
An omitted target keeps all its architectures.
Factory discovery and the Arch publisher use the same rule.

Without `--arches`, the publisher builds each recipe for its admitted architectures.
It publishes each architecture that has a build.
An explicit choice must support all selected recipes.
The publisher rejects an unsupported choice; it does not skip a package.

Each row for publication has a `packages` field.
The field lists the recipes built for that architecture, separated by commas.
The verifier uses that field, not the global input.
For `gdm,greetd`, x86_64 verifies both packages.
ARM verifies only greetd when GDM admits x86_64.

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

Use `outputs.arch` for pacman metadata. Set `conflicts`, `replaces`, and `backup`
to lists. Tideforge emits these as PKGBUILD arrays. These fields do not change
RPM or Debian relations.

`tuna-desktop` conflicts with and replaces `roost`. Its `backup` list names
`etc/pam.d/tuna-lock` and `etc/pam.d/roost-lock`. Use exact relative paths from
`files.common`. Do not repeat paths. Absolute paths, traversal, whitespace and
glob patterns are invalid.

`outputs.arch.options` carries native makepkg options such as `!lto`.
For native install/upgrade hooks, declare
`outputs.arch.install_script: {path: packages/NAME/NAME.install, sha256: HASH}`.

Keep the file inside its recipe's directory. Use regular UTF-8 text.
Tideforge rejects symlinks, traversal and payloads with a different hash.
It copies the file into `NAME.install` and sets PKGBUILD `install=NAME.install`.
Pacman runs the native hooks.

Index native archives with either `.pkg.tar.zst` or `.pkg.tar.xz`.
`arch-clean-install.sh` uses the same publisher before the package install.
This checks the index, not the production signatures.

`provides` alone does not let pacman remove another package. The `backup` field
in a new archive does not change the old archive. Test the real transaction
with administrator edits, deletion and combined effective `NoUpgrade` and
`NoExtract` policy. A PKGBUILD is not transaction evidence.

When an upstream source archive omits required git submodules, use the optional
`sources` list rather than an unpinned clone in a build command. Each auxiliary
archive has an HTTPS URL, SHA-256, filename, destination below the primary
source tree, and optional `strip_components`. Tideforge renders those archives
as native RPM/Pacman sources and extracts them before the build. This keeps a
complex source closure reviewable and reproducible; a recipe is not eligible
for promotion until its target CI builds the complete closure.

A `custom` recipe can add a step for one target only. An auxiliary source
with `targets: [<target>]` is unpacked only for that target.
`build.targets.<target>.commands` run before `build.commands`, and
`install.targets.<target>.commands` run after `install.commands`, in the same
shell. Tideforge rejects a target the recipe does not enable. Use this only
when one target lacks something the others have. Example: `tuna-desktop`
builds a private gtk4-layer-shell on trixie, because trixie's own is too old.

A custom recipe's deb build owns its whole lifecycle: `debian/rules` runs
`dh $@ --buildsystem=none`, so debhelper never configures or tests upstream's
own build system beside the recipe's scripts. A custom recipe that declares
several `outputs.deb.packages` installs into `debian/tmp` (handed to the
install script as an absolute path, as `%{buildroot}` is) and each package's
`files` become its `.install` list. Example: `gtk4-layer-shell` on noble,
split into `libgtk4-layer-shell0` and `libgtk4-layer-shell-dev`.

`noble` is Ubuntu 24.04, gurnard's base, published as
`https://repo.tunaos.org/tideforge/ubuntu-noble/` (`publish-tideforge-debs.yml`
label `ubuntu-noble`). Noble's default Rust is 1.75, so its `rust` capability
is Ubuntu's versioned `rustc-1.97`/`cargo-1.97`; a recipe puts
`/usr/lib/rust-1.97/bin` first on `PATH`. Noble never shipped
gtk4-layer-shell, so `packages/gtk4-layer-shell` builds it there as a system
library.

The `gentoo` target (format `gpkg`, [ADR 0002](https://github.com/tuna-os/tunaos-packages/blob/main/docs/adr/0002-gentoo-overlay-and-gpkg-binhost.md))
renders a recipe into an ebuild in a one-package overlay named `tunaos`. The
recipe must use `build_system: custom` and declare `outputs.gpkg.category`
(the ebuild's category, e.g. `gui-wm`). A recipe that needs the `rust`
capability inherits `cargo.eclass`; `build.rust_version` sets its
`RUST_MIN_VER`. The cell emerges the ebuild inside the target's stage3 into a
gpkg, and its verify installs that gpkg into a fresh stage3 with no overlay.
`publish-tideforge-gentoo.yml` signs the gpkgs into the binhost at
`https://repo.tunaos.org/gentoo/binpkgs/<arch>/` and serves the overlay as
`https://repo.tunaos.org/gentoo/overlay/tunaos-overlay.zip`.

Cargo recipes build with `--locked` by default.  An upstream release with a
demonstrably stale *root-package* entry in an otherwise pinned `Cargo.lock` may
set `build.cargo_locked: false`, but it must include a specific
`build.cargo_lock_reason` and is accepted only after the resulting lockfile
diff has been reviewed in the target build.

### GNOME 51 redirected smartcards: native SSSD

Arch revision `49a6c3408d0431606b99d1ddb035ce2e40c071ea`
is the base for `sssd`.
It retains the paths from `configure`, the `sssd` user and `!lto`.
It keeps sysusers, tmpfiles and the logrotate backup.
The hooks restore the groups and capabilities.

The Kerberos plugins link `libverto`. Declare it as a runtime dependency.

Version 2.13.1 adds two changes from SSSD:

- [f2696b80](https://github.com/SSSD/sssd/commit/f2696b80a153d8ad61f66e4611efd2dff3c6410c)
  forwards allowlisted, validated `GDM_AUTH_SESSION_ID` through the PAM
  request and into `p11_child`/`krb5_child`. The responder can then select
  the card from the correct GRD session.
- [b1f2ffc7](https://github.com/SSSD/sssd/commit/b1f2ffc7d3f74d5fd1c0091d98c19f5401b4013b)
  grants only the dedicated SSSD user the upstream
  `org.gnome.remotedesktop.use-grd-pcscd` action.

Version 2.13.1 keeps `state->sss_certmap_ctx` as unchanged context.
See [the backport](https://github.com/tuna-os/tunaos-packages/blob/main/packages/sssd/f2696b80-grd-session-2.13.1.patch).
See [the comparison](https://github.com/tuna-os/tunaos-packages/blob/main/packages/sssd/f2696b80-backport-provenance.json) for the hashes.
Apply both patches with `--fuzz=0`.

The build uses the source archive and two patches with fixed hashes.
This does not prove a published package or a login with a card through GDM.
Normal factory CI must build and install the package.
GRD51/GDM51 consumers must test actual redirection.

The package does not enroll a domain or change PAM or OpenSC configuration.
It does not enable smartcards or start a listener. Administrators must opt in.
Tests for password/NTLM transport, Kerberos PKINIT and PAM with cards are distinct.

### Maintained native Arch split packages

Use `outputs.arch.native_pkgbuild` to retain an owned PKGBUILD.
Tideforge does not generate a model of split packages.
The native contract is not a pacman metadata array.
With this contract, the owned PKGBUILD supplies all arrays, including `backup`.
Its `path` and `sha256` pin `packages/<name>/PKGBUILD`.
The `files` list pins up to sixteen patches in that recipe's `patches/` directory.

Each input must be a regular UTF-8 file inside the recipe.
Each file can contain at most 1 MiB.
The renderer preserves all bytes and line breaks.
The action key covers the recipe directory and the renderer.
It also covers the shared code for admission.

`packages` lists every required output.
`optional_packages` lists other outputs that makepkg can generate.
The verifier rejects missing, duplicate or unknown outputs.
It rejects mismatched versions or architectures and checks exact dependencies.
Optional symbols cannot replace a required package.

`packages/gdm/` builds GDM and libgdm **51.1.1-1.1**.
Its base is [Arch revision 36e76b2b](https://gitlab.archlinux.org/archlinux/packaging/packages/gdm/-/commit/36e76b2b4674dc196e611782c4f8f6d5e476e231).
It keeps the PAM configuration and declarations for conffiles.
It keeps the Meson checks, Xsession patch and split ownership.
`prepare()` applies both patches to the release archive.
Both archive and patches have fixed hashes.

GDM needs the exact libgdm version from the same build.
`gdm-debug` can accompany that pair.
It cannot replace either package.
The recipe admits x86_64 only.
We do not claim ARM or CPU qualification.

The patch sends `SetSessionName(get_session_name(self))` before `Open` starts to save account details.
It does not change program sessions.
It does not change the resolver for explicit, saved or fallback choices.

In [run 41245509890](https://github.com/tuna-os/tuna-desktop/actions/runs/41245509890),
two observers saw no calls to set the session for User1001.
Worker markers: unavailable; debug off.
Their absence proves nothing about the save stage.
This evidence supports the candidate.
It does not prove the cause or runtime behavior.

We applied both patches to the verified archive.
Only `data/Xsession.in` and `daemon/gdm-session.c` changed.
We ran a C smoke with the patched function and original resolver.
Explicit, saved and fallback names reached the setter before `Open`.
Program sessions skipped the setter.
A missing conversation emitted no calls.

The smoke used stubs for the worker and default lookup.
Those stubs do not test real GDM, PAM, D-Bus or AccountsService.
We deleted the temporary source and binary.
Tests check admission, bounds for rendered files, and metadata for both packages.
The C smoke is not a permanent test.

The factory built both unsigned packages on x86_64.
It also built `gdm-debug`.
Meson: one pass, zero failures.
The validator accepted the pair.
The verifier installed both packages from the staged repository.
It checked their ELF closure, versions and owners.

Both containers reported 8 GiB memory.
Both reported zero swap and CPU quota 200%.
We removed both containers.

The build warned about backup paths that the package did not contain.
We kept these warnings.
We did not change upstream PAM configuration or declarations for conffiles.
These checks do not prove login or creation of a physical record for AccountsService.

This change does not enable signed publication.
It does not change image pins.
Runtime checks must pass before promotion.
The consumer must select both packages after its last `pacman -Syu`.
It must check both versions.
Both journeys must pass before we call the issue fixed.

Source checks and the C smoke do not prove those journeys.
The package build and staged installation do not prove them.

### Queue-only pull requests and native canaries

A target queue can serve several native release families. With
`--canary-common`, a queue-only change tests the first declared tier of every
selected native cell. Keep all family and architecture combinations. Do not
collapse them to one representative. Run 39466490732 selected twelve chains for GNOME with no depth limit. The queue
branch returned before this bound took effect.

A change to a cell's own manifest or source still builds the full chain.
For example, a GNOME queue change plus a GNOME 51 manifest change selects six
full GNOME 51 cells and six GNOME 50 canaries. Dependency-graph edits and runs
without `--canary-common` retain full builds. This does not establish a policy
that every pull request must avoid full builds. The tests in
`tests/test_target_queue_canary_bounds.py` cover these distinctions.

### One isolated manual attempt

The `single_attempt` boolean is optional and defaults to false. Use it only
with a manual dispatch, one exact full-chain `cell`, and `source_revision`
set to the full commit SHA. The planner rejects a different run SHA,
selectors, shared-change modes, and batch offsets. Leave the other dispatch
fields empty. Normal PR, push, and scheduled runs keep their existing rules.

This mode runs one native job with a 360-minute limit and a 4.5-hour soft
build budget. It adds no continuation jobs. The plan and artifact jobs also
use runner time. A partial result remains partial: the final step fails if
the chain deferred, after the workflow retains the available artifacts.
Failure logs and partial packages remain available for diagnosis.

Complete,
validated outputs can enter the Actions cache. Deferred outputs cannot.

A manual run does not promote to the authoritative R2 cache, the shared ORAS
store, live repositories, or family OCI tags. EL10 artifacts from this run
have checksums and SBOM metadata, but no production RPM signatures or
main-push attestations. A successful job proves its existing build and smoke
checks; dependency closure for the full desktop and boot qualification remain separate.
