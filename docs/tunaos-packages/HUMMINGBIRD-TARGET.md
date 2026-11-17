---
sidebar_position: 11
title: "HUMMINGBIRD TARGET"
---

What "build for Hummingbird" means in this repository, stated once with the
measurements behind it, so the same facts stop being re-derived from
version strings.  Written 2026-09-02 after comparing this factory with
[projectbluefin/utah-packages](https://github.com/projectbluefin/utah-packages),
which built GNOME 51 for Hummingbird in a fraction of the time this
repository has spent on it.  Every number below came out of a real
`primary.xml`; the reproduction is
`scripts/check-hummingbird-installability.py` and
`scripts/gap_engine.py --catalog manifests/hummingbird-desktops.yaml`.

**Hummingbird's own documentation is authoritative** over anything here.
When the two disagree, theirs wins and this file is the bug
([https://hummingbird-project.io/docs/](https://hummingbird-project.io/docs/), [https://gitlab.com/redhat/hummingbird](https://gitlab.com/redhat/hummingbird)).

## 1. What Hummingbird is, by ABI

Indexes read 2026-09-02, x86_64 (`primary.xml` sha256 prefixes:
public-hummingbird `5c75eb01881b`, Fedora 44 `c48e47563bbf`, Rawhide
`8daf5868c675`):

| package | hummingbird | fedora 44 | rawhide |
|---|---|---|---|
| glibc | 2.43-8.4.hum1 | 2.43-2.fc44 | 2.44.9000-1.fc46 |
| openssl-libs | 3.5.8-0.1.hum1 (`libcrypto.so.3`) | 3.5.5-1.fc44 (`.so.3`) | 4.0.2-1.fc46 (**`.so.4`**) |
| python3 | 3.14.7-1.hum1 | 3.14.3-2.fc44 | 3.15.0~rc1-1.fc45 |
| perl-libs | 5.42.2-525.hum1 | 5.42.1-523.fc44 | 5.44.0-527.fc45 |
| libxml2 | 2.15.3-0.1.4.hum1 | 2.12.10-6.fc44 | 2.13.9-4.fc45 |
| glib2 | 2.89.3-1.hum1 | 2.88.0-1.fc44 | 2.89.4-1.fc46 |
| harfbuzz | 14.3.1-1.hum1 | 12.3.2-1.fc44 | 14.4.0-1.fc46 |

Two things are true at once, and the 2026-08-06 measurement
(`docs/hummingbird-desktop-gap.md`, Finding 1) saw only the first:

- The packages Hummingbird **rebuilds** (glib2, harfbuzz, gcc, rust, meson)
  are at Rawhide's versions.  That is why "30 of 38 core packages match
  Rawhide" was a true sentence.
- The packages that **define the ABI** -- glibc, openssl, python, perl -- are
  Fedora 44's.  Hummingbird is an overlay of rebuilt packages on a pinned
  Fedora release; its own container repository maps the "rawhide" variant to
  `fedora-44.repo` (`redhat/hummingbird/containers`, `images/variables.yml`),
  and its `mock/mock.cfg` composes the build root from that release's
  repositories with the Hummingbird Pulp repos shadowing them by priority.

So the build root is **Fedora 44 plus public-hummingbird at higher
priority**.  That is what Hummingbird builds in, what utah-packages builds
in, and -- since 2026-09-02 -- what `mock/hummingbird-ci*.cfg` builds in.

## 2. What the Rawhide root cost

The Rawhide root was not a harmless approximation.  Read off our own
published prefix, `repo.tunaos.org/hummingbird/20251124-x86_64` (index
`dacef1b3b4c9…`, 8738 binaries):

```
libm.so.6(GLIBC_2.44)(64bit)   needed by gstreamer1-plugins-good, libavutil-free, zvbi
```

Those three were built, signed, published, and cannot install on the target
they were built for: Hummingbird's glibc is 2.43.  utah-packages hit the
same class one soname over (`gnome-shell` built on Rawhide needing
`libcrypto.so.4`) and documented it as the reason for the Fedora 44 root.
The three interpreter pins the old config carried (`[fedora-44-python]`,
`[fedora-44-perl]`, `[fedora-44-mpich]`, each an `includepkgs` list) were
patching Fedora 44 back in one namespace at a time, and each said "remove
when Hummingbird catches up with Rawhide".  It was never going to.

## 3. Does what we publish resolve on Hummingbird?

The question a consumer image asks, and the one utah-packages gates its
publish on (it runs the consumer transaction inside the bootc-os image with
only Hummingbird and its factory enabled).  Static answer, 2026-09-02, roots
from `manifests/hummingbird-desktops.yaml`, closure over
public-hummingbird ∪ the named repository, nothing pre-installed:

| repositories enabled | gnome roots absent | closure | unresolved capabilities |
|---|---|---|---|
| hummingbird alone | 53 of 58 | 94 | 5 |
| hummingbird + **utah-packages** (Pages mirror, 421 binaries) | 33 | 208 | 185 |
| hummingbird + **tunaos-hummingbird** (8738 binaries) | 3 | 602 | **30** |
| hummingbird + Fedora 44 (if a consumer enabled it) | 0 | 695 | 0 |

Per desktop, against our prefix: gnome 30 unresolved, kde 25, cosmic 9,
niri 28, xfce 18 -- **no desktop is resolvable today**, and the blockers are
concrete (`scripts/check-hummingbird-installability.py` prints them):

- the GLIBC_2.44 leak above (gnome, kde, cosmic all reach it);
- `gdm` requires `gnome50-el10-compat`, an EL10-only package, because
  `src/gnome-51` is a byte copy of `src/gnome-50` (#537);
- `gtk4` requires `libgstplay-1.0.so.0` and nothing ships
  `gstreamer1-plugins-bad-free` (#540);
- libraries the closure needs and the chain has not produced: libcanberra,
  evolution-data-server (`libecal`, `libedataserver`), webkitgtk6.0,
  libosinfo, samba (`libsmbclient`), udisks2, libvorbis, poppler-data;
- roots in neither repository: `fprintd-pam`, `gnome-disk-utility`,
  `gnome-user-share`.

Two readings of that table matter more than the counts.  First, the
utah-packages row is **not** evidence that utah's approach fails: its Pages
mirror lags the OCI image utah consumes, and its consumer contract is
Bluefin's list, not this catalog's 58 roots.  Second, the Fedora 44 row is
the shape of the shortcut: a Hummingbird image that enabled Fedora 44
would resolve GNOME 50 entirely, modulo the name conflicts the walk cannot
see (`libxml2` 2.12 vs 2.15 under one name).  This factory exists because
consumer images do not enable Fedora 44; that row is the ceiling, not the
plan.

`scripts/check-hummingbird-installability.py` runs daily
(`.github/workflows/hummingbird-installability.yml`), advisory, per arch.
It becomes a gate the day a desktop first resolves. Since §10 it is also
a *ratchet* on the publish path. This does not wait for that day:
a wave may fix blockers, but it may not add one.

## 4. What utah-packages does differently, and what this repository took

| | utah-packages | tunaos-packages before | after 2026-09-02 |
|---|---|---|---|
| build root | Fedora 44 + public-hummingbird (priority) | Rawhide + hummingbird + three F44 pins | Fedora 44 + public-hummingbird + our prefix |
| recipes | Rawhide dist-git, pinned by commit | Rawhide dist-git, imported at build time | unchanged |
| sources | upstream release tarballs, SHA-512 locked | dist-git lookaside | unchanged (see §6) |
| what gets built | a hand-curated, dependency-first list (193 sources) | the measured runtime closure (670 sources, 18 tiers) | unchanged (see §5) |
| staging | 5 stages, each a local repo for the next | tiers over one topological order, `[local-build]` | unchanged |
| disttag | `.hum1.bfin` (sorts above `.hum1`) | `.bfin1` (sorts below `.hum1`) | unchanged, deliberate: a rebuild never shadows the base |
| publish | OCI image, consumed with `COPY --from` by digest | R2 prefix behind a Worker | unchanged |
| **installability gate** | dnf transaction inside the bootc-os image before publish | none | static checker, daily; container gate is the next step |
| preflight | resolves every recipe's BuildRequires in the real root, as a worklist | `scripts/preflight-buildrequires.py` exists | unchanged |

The root and the gate are the two that decide whether output is usable.
The rest is scope.

## 5. Why the gap did not shrink when the reference moved

An obvious hypothesis was that measuring the closure against Rawhide
inflated it.  Measured, same day, same roots:

| reference | gnome sources to build | kde | cosmic | niri | xfce |
|---|---|---|---|---|---|
| Rawhide (committed) | 301 | 375 | 175 | 297 | 268 |
| Fedora 44 | 311 | 378 | 152 | 306 | 256 |

No.  The closure is what the roots need that Hummingbird does not ship, and
Hummingbird ships no desktop stack at all; every cairo, gdk-pixbuf and
pipewire is a gap whichever Fedora you read the Requires: from.  The
reference stays Rawhide, because the recipes are Rawhide's and Rawhide's
binary index is the closest proxy for what those recipes produce.

What utah-packages did about the size was not a measurement trick.  It
built a *narrower contract* -- one desktop, Bluefin's list -- and it built
it in the right root, so what came out installed.  This catalog declares
five desktops; that is a scope decision for the maintainer, and §7 makes
the case.

## 6. Open, and deliberately not asserted

- **Rawhide recipes on a Fedora 44 root will hit version floors.**  Rawhide
  specs BuildRequire what Rawhide has.  The toolchain floors are covered --
  Hummingbird itself ships gcc 16, rust 1.97, meson 1.11 at priority 10 --
  but library floors (utah met `pango >= 1.58`, `wayland-protocols >=
  1.48`, `gsettings-desktop-schemas >= 51.alpha`) will surface as
  `preflight-buildrequires.py` findings and become build-order entries.
  That is the expected cost, and it is the cost utah paid.
- **Published GLIBC_2.44 leaks must be rebuilt.**  The static installability
  check covers both every desktop closure and `retained_packages`: served
  output that is intentionally outside those closures but still needs repair.
  `pandoc-cli` is retained until its full runtime closure (`ghc-pandoc` and
  `pandoc-cli`) is rebuilt in the Fedora 44 root; otherwise removing it from
  a desktop build order leaves the incompatible artifact published (#557).
  The checker's `needer_from: published` column identifies these leaks.
- **The overlay uses name masks for packages.**  DNF's priority filter drops a *name*
  from every lower-priority repo. A Fedora 44 package can need a library that
  the base ships with another soname. The package does not resolve that
  library. F44 `fontforge` wants `libxml2.so.2`. The base `libxml2` 2.15
  provides `.so.16`, so F44's `libxml2` is never a candidate.
  The list had four names. It kept those names *out*. For each package, choose
  one action: exclude the Fedora name or build against the base. This is a
  per-package decision, not a global list. utah-packages carries this list as
  `HB_EXCLUDE` (libicu, ruby-default-gems, gpgme, qt6-qtbase).
- **Upstream sources.**  utah's direct-source model (fetch the release
  tarball, verify SHA-512, fail closed) is the Hummingbird project's own
  freshness model; this repository still builds from dist-git lookaside.
  Not changed here; it is orthogonal to whether output installs.
- **The container gate.**  The static checker cannot judge version
  constraints or conflicts.  The next step is utah's step verbatim: run the
  catalog's roots through `dnf --assumeno install` inside
  `quay.io/hummingbird-community/bootc-os` with only public-hummingbird
  and our prefix enabled, in `verify-package-factory-cell.sh`, and refuse
  to publish a wave that regresses it.

## 7. The decision this measurement asks for

tunaOS's hummingbird images consume `ghcr.io/projectbluefin/common` and
`ghcr.io/ublue-os/brew` by digest today.  `ghcr.io/projectbluefin/utah-packages`
is published the same way, is Bluefin's GNOME 51 for Hummingbird, and is
built by the project tunaOS is derived from.  Building a second GNOME 51 for
the same base, in this repository, on a smaller team, is the part of the
plan that has not been paying back.

Proposed split, for the maintainer to decide (tracked in the issue that
accompanies this document):

- **GNOME on hummingbird: consume utah-packages.**  tunaOS's
  `manifests/desktops/gnome.yaml` hummingbird section points at the OCI
  repository by digest; `src/gnome-51` here stops being a second copy.
- **This factory builds what utah does not:** the KDE, COSMIC, Niri and
  XFCE stacks for Hummingbird, in the Fedora 44 root, gated on
  installability -- the same shape, one desktop at a time, dependency-first.
- **Both factories share the base-image audit** (`components:` in the
  catalog) so a package neither builds is a named gap, not a surprise.

That is the model utah-packages proved: right root, one contract, a gate
that asks the consumer's question.  Not a bigger build order.

## 8. Taken, 2026-09-02, and what it measured

The split in §7 is implemented, on both sides:

- **tunaOS** (`hummingbird:gnome`): `image-versions.yaml` pins
  `ghcr.io/projectbluefin/utah-packages` by digest, `Containerfile.el10`
  bind-mounts its `/repository` at `/run/utah-packages` for the gnome
  stage's install, and `manifests/desktops/gnome.yaml`'s hummingbird
  section enables it as a `file://` repo at priority 4, above the
  `tunaos-hummingbird` prefix (5).
- **This factory**: the same digest is a `consumed_indexes` entry on the
  hummingbird target (`manifests/package-factory.yaml`), read straight out
  of the registry by `scripts/oci_repository.py` (token, manifest, one
  streamed layer; only `repository/repodata/*` is kept).  The gap engine
  counts everything utah ships as already had; the installability walk
  enables it; the container gate (`scripts/check-hummingbird-installability-container.sh`,
  utah's `dnf --assumeno` step verbatim in shape, inside the pinned
  bootc-os image) materialises it from the digest and asks dnf.  The
  catalog's gnome desktop is `consumed_from: utah-packages`; its roots stay
  declared so the audit and both gates still cover them.

Measured on the regeneration that landed with it (target primary
`3f8c4b86…`, utah primary `38da5357…`, 421 binaries counted as had):

| desktop | sources to build, before | after | Δ |
|---|---|---|---|
| gnome | 301 | 248 | −53 |
| kde | 375 | 353 | −22 |
| cosmic | 175 | 115 | −60 |
| niri | 297 | 252 | −45 |
| xfce | 268 | 115 | −153 |
| bluefin (parity set) | 392 | 186 | −206 |
| **build order, packages** | **778** | **664** | **−114** |

Two readings.  The GNOME row is the smallest shrink, not the largest:
utah's 421 binaries are Bluefin's contract, and this catalog's 58 GNOME
roots reach past it (the `fedora` list's extras -- `gnome-initial-setup`,
`ptyxis`, `gjs`, `nautilus` and five more are still built here from
`src/gnome-51`).  The other four desktops shrink because utah ships the
platform every desktop stands on -- gtk4, glib2, pipewire, mesa, the
portals -- and that is the part of the closure this factory no longer has
to build twice.  The reference is unchanged (Rawhide, §5).

What was NOT cut, because measurement said otherwise (§7's "scope
decision"): openSUSE Tumbleweed serves a resolvable index on both
architectures (`rpm/opensuse-tumbleweed/{x86_64,aarch64}`, 2026-09-02),
so it stays declared -- with the note that no tunaOS manifest consumes it
yet (sailfin's niri reads Tumbleweed's own repositories); the flat apt
repositories serve amd64 **and** arm64 debs, so the deb targets keep both;
EL10, Fedora and Hummingbird have aarch64 legs.  The only architecture
that fails the bar is `arch`'s aarch64: no leg, no index, no consumer.
Narrowing it is decided but ships separately: editing `architectures`
schedules every Arch cell, and the Arch engine cannot yet build a cell
whose runtime dependencies are sibling recipes (`dms-cli` needs `dms` and
`quickshell`; `makepkg` has no repository to find them in), so that PR
waits on same-wave sibling staging for the Arch engine.  GNOME-on-DEB was
not removed either: it is its own measured chain now
(`manifests/gnome51-deb.yaml`, `docs/gnome51-deb-gap.json`), not the
1-of-9 recipe gap the July readiness note described.

## 9. What the first legs on this root failed, and why it was not the root

Run 33597624514 (this branch, both architectures, 2026-09-02) was the first
full build on the Fedora 44 root.  Both legs hit the four-hour deadline with
the chain healthy -- x86_64 built 132 packages and deferred 646, aarch64
built 189 and deferred 622 -- and failed three:

| package | leg | what dnf or rpmbuild said | on main's Rawhide root |
|---|---|---|---|
| `langtable` | both | `%check`: `xmllint: command not found` | identical (runs 33580878734, both legs) |
| `python-dbus-next` | aarch64 | builddep: `python3-pytest-asyncio-1.1.0-3.fc44 requires python3.14dist(pytest) < 9`, `cannot install both python3-pytest-9.1.1-1.1.hum1 and python3-pytest-8.4.2-3.2.hum1` | never reached (deferred) |
| `python-aiohappyeyeballs` | aarch64 | same | never reached (deferred) |

**langtable** is Fedora's spec calling a tool it never names: Koji's
buildroot carries libxml2, Hummingbird's does not.  It is now a vendored spec
in `src/hummingbird/langtable/` differing from Rawhide's by one
`BuildRequires: libxml2`, and the build order no longer re-imports it.

**pytest-asyncio** is the shape of failure this root will keep producing and
the one to recognise: a BuildRequires-only tool that Fedora 44 ships in a
version window Hummingbird's own packages have moved out of.  Hummingbird
publishes pytest 9.1.1 (with 8.4.2 and 9.0.3 beside it in the same Pulp
repository); F44's pytest-asyncio wants `< 9`; mock's `best=1` will not settle
for the older pytest, so the transaction fails rather than degrades.  Three
answers were possible:

- `best=0`, which is what utah-packages effectively runs (plain `dnf builddep`
  in a container, where `best` defaults off).  It fixes this and every case
  like it silently -- including the ones where "the older candidate" is a C
  library's `-devel` and the produced binary then wants a soname the image no
  longer ships.  Rejected: this file's own rule is fail closed.
- an `excludepkgs=` for the newer pytest, the by-name precedent
  `mock/hummingbird-ci.cfg` already uses for docutils/sphinx.  Rejected: it
  would build every consumer against a pytest the target no longer installs.
- build Rawhide's pytest-asyncio 1.4.0 (`pytest < 10`) first, so local-build
  (priority 1) masks Fedora's by name.  Taken: `bootstrap-04` in
  `manifests/hummingbird-desktops.yaml`, next to the PEP-517 backends the
  measurement cannot discover for the same reason (they appear only in
  BuildRequires).

The rule that falls out: **a BuildRequires-only tool whose Fedora 44 copy
cannot install beside the target's own packages is built here from the
Rawhide reference.**  `tests/test_the_first_fedora44_legs_taught_two_buildroot_gaps.py`
pins both fixes to the files the chain reads.

## 9. Buildroot consumes utah-packages (2026-10-08)

§8 put utah in the gap engine and the installability walk. The mock
buildroot still resolved utah-shipped BuildRequires from Fedora 44.
The build order already excludes what utah ships. Measure-target-gap
counts 421 utah binaries as had. The rest of the rebuild was all in
the root, not in the plan.

`mock/hummingbird-ci*.cfg` now has `[utah]` at priority 11. It sits
between the base (10) and our prefix (12, was 11). Utah wins ties, so
a stale factory RPM can never hide the build utah did. The repo is
`file:///run/utah-repo/repository`. Utah has no HTTP baseurl.

`scripts/materialize-consumed-repo.py` streams the pinned OCI digest.
It fails closed. With `--allow-empty` it writes valid empty repodata
for arches utah does not publish (aarch64 today).

The chain-band workflow caches the tree by pin and mounts it for
the build. Its cache action is commit-pinned to a published release:
an unresolved action reference stops every fan-out shard before the
package build begins. `build-chain.sh` stops a hummingbird config
without the tree. `tests/test_materialize_consumed_repo.py` covers the
extractor, the fail-closed paths, and the empty-repo shape.

## 10. Why the leak outlived the root move, and what now stops it (2026-10-24)

§2 named three packages that leaked from the Rawhide buildroot:
`gstreamer1-plugins-good`, `libavutil-free`, and `zvbi`.
They need `libm.so.6(GLIBC_2.44)`, which Hummingbird's glibc 2.43 cannot provide.
§6 said they "must be rebuilt". The root moved to Fedora 44 on 2026-09-02.
The measurement on 2026-10-24 used the live indexes
(`repo.tunaos.org/hummingbird/20251124-x86_64`, 8822 binaries, utah
`38da5357…` consumed). The prefix still answers:

| capability | needed by, in OUR prefix | class |
|---|---|---|
| `libm.so.6(GLIBC_2.44)(64bit)` | `libavutil-free`, `libavfilter-free`, `zvbi` | `abi_symbol` |
| `libjsoncpp.so.26()(64bit)` | `openxr-libs`, `waybar` | `abi_soname` |

The root was never the whole mechanism. `build-chain.sh --served-nvrs`
treats the published index as the durable record of what exists (#544).
A package from the wrong root has exactly the NVR that the correct root
would produce: the same `%{VERSION}` and `.bfin1`.
Every leg since the move computed the NVR, found it served, and skipped it.
Seven weeks of waves could not fix these packages; no step requested a rebuild.

Three changes, each small, together a closed loop:

1. **The checker classifies each unresolved capability.**
   `scripts/check-hummingbird-installability.py` assigns one of three labels.
   With `abi_symbol`, the index serves the library but not the symbol version.
   With `abi_soname`, it serves another major version.
   With `absent`, nothing serves the name at any version: build that package.

   A rebuild can fix the first two classes, but only for a package from our prefix.
   `--print-rebuild-names` prints exactly those packages.
2. **Do not skip served packages that the target cannot install.**
   `scripts/list-served-nvrs.py --except-names` withholds these names and all binaries from the same source.
   The skip uses the first binary that `rpmspec -q` names for the spec.
   Thus, to withhold `libavutil-free` alone changes nothing if the index still serves `ffmpeg-free`.
   Both chain callers (`publish-build-chain-rpms.yml`, `chain-band.yml`) pass this option for hummingbird.

   On the live index, 5 names withhold 146 NVRs out of 14353 served.
   These are the ffmpeg, zvbi, openxr and waybar source builds.
   Everything else still skips, so legs stay incremental.
3. **A wave that regresses installability does not publish.**
   `publish-rpm-wave.sh` signs and indexes the tree.
   Before `rclone sync` makes it the served index, the publisher checks the exact bytes about to ship.
   It walks `file://…/repo` with `--fail-on-regression` against `docs/hummingbird-installability-baseline.json`.
   A wave may fix blockers, but it may not add one.

   A desktop that resolved must continue to resolve.
   The contract compares sets, not counts.

This is not a green gate: no desktop resolves yet.
The x86_64 counts on this date were: gnome 24 unresolved, kde 24, niri 22, tuna 17, xfce 14, cosmic 10.
A requirement for green would refuse every wave forever.
The baseline records this distance per architecture, with provenance for the indexes used in the measurement.
When the target's own repository changes, refresh it deliberately:

```
scripts/check-hummingbird-installability.py --arch x86_64 --write-baseline
scripts/check-hummingbird-installability.py --arch aarch64 --write-baseline
```

and commit the diff — a baseline that refreshes itself is a gate that
ratchets nothing.

## 11. Native Tuna power and sound closure (2026-10-31)

Image run `tunaOS/41213419115`, job `124573016129`, stops in the
Tuna package transaction. Both the native and Utah TuneD 2.28 packages
need `(rpm-ostree if bootc)`. Commit
`552f03c0fd7fbd62e62d7a1e89c4fa7bb01a291f` in Fedora TuneD dist-git gives
the reason. The bootloader plugin uses rpm-ostree to manage kernel arguments
when the native bootc API `loader-entries set-options-for-source` is not
available. The dependency is real. Do not remove it, fabricate a capability
or drop the power-profile provider.

The Tuna roots now explicitly include the real `rpm-ostree` source.
At commit `daf6d42a0d7c21f60fb770ddd56bd7bf7cab442c`, the Fedora dist-git
spec builds rpm-ostree 2026.3 with its vendored Rust source. The
existing native chain imports and builds it in the Fedora 44 plus
Hummingbird root. The image gets no Fedora binary repository.
The generated order includes its runtime closure and the real BuildRequires
order. It does not assume that a rich dependency became a build root.

Tuna Desktop beta.2 release 2 built in run `41213268502`, but the
publisher refused to sync: `libcanberra` was a new unresolved Tuna
requirement. A signature on the unpublished tree did not publish it. The
baseline stays unchanged. The roots now explicitly include libcanberra and
use the Fedora dist-git spec for it, not the EL10 replacement rules in
`src/deps/libcanberra`. The inspected upstream commit was
`58ede5c70d9f6885b0d5e24695fc50c258ebe5c8`.
The generated chain builds libvorbis before libcanberra and keeps its
real ALSA, GStreamer and PulseAudio backend packages.

The source change is not a package or image qualification receipt.
Native build CI must produce the real RPMs. Then the signed publisher must
pass its unchanged regression gate and serve the new index.
Only then may tunaOS advance its package pin and run image and runtime
qualification. Existing image PR `tunaOS#3885` retains its manual merge
fence and the observed beta.1 pin until that served evidence exists.

## 12. The current utah-packages pin closes Tuna (2026-11-14)

The section 11 blockers came from a stale input, not from a missing build.
The consumed utah-packages pin was `sha256:9cb66729…`, set on 2026-09-02.
Renovate moves the tunaOS pin, but nothing moved this one.

On 2026-11-14, the pin on tunaOS main is `sha256:fc3c1f34…`. That
repository has 2615 binary packages, against 421 in the old pin. Utah
builds them in Hummingbird's own root. They include these packages:

- `rpm-ostree-2026.3-1.hum1.bfin`, the provider for TuneD's
  `(rpm-ostree if bootc)`.
- `tuned-2.28.0-1.hum1.bfin` and `tuned-ppd`.
- `libcanberra-0.30-1.hum1.bfin` with its backends, and `libvorbis`.
- `iw`, which `tuned` needs.

Run `41213268502` measured the old pin, so its gate saw no `libcanberra`.
With the new pin, `scripts/check-hummingbird-installability.py --arch x86_64`
resolves the `tuna` set with zero blockers. dnf gives the same answer.

We used the pinned `bootc-os` base (`sha256:00006de2…`), with
`tunaos-hummingbird` at priority 5 and utah at priority 4. In it, dnf
resolves the full Tuna list of tunaOS. That transaction installs 527
packages. `rpm-ostree`, `libcanberra` and `tuned` come from utah.

This change moves the pin to the tunaOS pin and records a new x86_64
baseline. The aarch64 baseline does not change, because utah has no
aarch64 build. The new pin also adds three blockers outside Tuna:

- `gnome`: `ppp`, which `NetworkManager-ppp` from the target needs.
- `kde` and `niri`: `libIex-3_2.so.31` and `libOpenEXR-3_2.so.31`, which
  `kf6-kimageformats` from utah needs.

These blockers do not come from our packages. The baseline records them,
and also each blocker that the new pin closes. A wave that adds a new
blocker still fails the gate.

This change does not regenerate the build order. A regeneration against
the Rawhide of today adds `glibc`, `openssl`, `llvm` and `python3.15`.
That drift is for the scheduled drift review, not for this change. The
order keeps `rpm-ostree` and `libcanberra` as the fallback if utah drops
them. Images prefer utah at priority 4.

To publish Tuna Desktop beta.3, dispatch `publish-build-chain-rpms.yml`
with `cells=hummingbird-x86_64` and `tiers=local-00`. That leg builds
only `src/hummingbird/tuna-desktop`. Its buildroot uses the new utah pin,
and its gate compares against the new baseline.
