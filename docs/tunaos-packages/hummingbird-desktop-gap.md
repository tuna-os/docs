---
sidebar_position: 17
title: "hummingbird desktop gap"
---

Measured 2026-08-06.  Every number below came out of a real rpm-md index, not
out of a name, a release number or a base-image string.  Reproduce with:

```
scripts/measure-hummingbird-gap.py \
  --report-json docs/hummingbird-desktop-gap.json \
  --build-order build-order-hummingbird-desktops.yml
```

The machine-readable result — including the per-desktop package lists, the
BuildRequires cycles and the checksums of the indexes it was computed from — is
`docs/hummingbird-desktop-gap.json`.

## Why this was measured

`LUKS hummingbird:gnome` fails on `tuna-os/tunaOS` (run 31100096864, job
92611346523).  The image builds an artifact tagged `gnome` that contains no
GNOME, and the desktop contract refuses to ship it: no `gnome-shell`, no
wayland session file, no `gdm`, no `nautilus`, no `gvfsd`, no
`xdg-desktop-portal-gnome`, no `gnome-keyring-daemon`, no pipewire/wireplumber
user units, no compiled dconf database.

The chain in that log is:

1. `Chroot not found in the given Copr project (hummingbird-20251124-x86_64)`
2. `TUNAOS_COPR_ENABLE_FAILED repo=jreilly1821/c10s-gnome-50-fresh`
3. `dnf versionlock` → `No package found` for gnome-shell, mutter, gdm,
   gnome-session-wayland-session, gnome-settings-daemon, gnome-control-center,
   gsettings-desktop-schemas, gtk4, libadwaita, pango, xdg-desktop-portal and
   xdg-desktop-portal-gnome.

Step 3 is the interesting one: the fallback to base repos found nothing.  This
document establishes why.

## Index provenance

| index | revision | primary.xml sha256 | entries |
|---|---|---|---|
| `public-hummingbird/x86_64` | 1786016019 | `b92541eaf43fd4a8976710fa0035ae0c69b38aae7a0f241d61d87cd9bdd2a512` | 3384 binary package names, 16506 (name, evr, arch) tuples |
| Fedora Rawhide `Everything/x86_64/os` | 1785994410 | `dc3c7ec50508105e880c74f0178bf4723e770c73766654d833d1b2ad541e3774` | 66629 binary packages |
| Fedora Rawhide `Everything/source/tree` | 1785994313 | `87746b33eb94ca586ebc3d9407fc5c57ca6e8d9db8c899bc43aaa4fcd8ab5318` | 23178 SRPMs (used for BuildRequires ordering) |

The declared and observed checksums matched on all three.

## Finding 1 — Hummingbird is Fedora Rawhide, not EL10 and not Fedora 43

`build_scripts/lib.sh` on tunaOS sets `IS_FEDORA` by testing whether the base
image ref contains `fedora`.  `quay.io/hummingbird-community/bootc-os:latest`
does not, so hummingbird routes down the **el10** section of
`manifests/desktops/gnome.yaml` — the CentOS-Stream-10 GNOME-50 COPR path.
That is a misclassification, and the index says so:

| package | hummingbird | Fedora 43 | Fedora Rawhide (45) |
|---|---|---|---|
| glib2 | 2.89.3-1.hum1 | 2.86.5-1 | 2.89.3-1.fc45 |
| systemd | 261.2-1.hum1 | 258.10-1 | 261.2-1.fc45 |
| gcc | 16.1.1-2.hum1 | 15.3.1-1 | 16.1.1-4.fc45.1 |
| harfbuzz | 14.3.0-1.hum1 | — | 14.3.0-1.fc45 |
| qt6-qtbase | 6.11.1-5.hum1 | — | 6.11.1-5.fc45 |
| rust | 1.97.1-2.hum1 | — | 1.97.1-2.fc45 |
| meson | 1.11.2-2.hum1 | — | 1.11.2-2.fc45 |
| rpm | 6.0.1-6.hum1 | — | 6.0.92-2.fc45 |

Of 38 core packages present in both indexes, **30 are at the byte-identical
upstream version *and* release as Rawhide** and differ only in dist tag.  Every
one of Hummingbird's 16506 index entries carries `.hum1`.

So Hummingbird is a Fedora Rawhide rebuild.  It is not EL10 and it is nowhere
near Fedora 43.

## Finding 2 — flipping `IS_FEDORA` would not have fixed it

The task brief was right to be suspicious.  Routing hummingbird to the `fedora`
section of `manifests/desktops/gnome.yaml` sends `dnf install gnome-shell …` at
Hummingbird's own repository, which contains:

```
gnome-shell   no      gtk4       no      cairo    no      pipewire   no
mutter        no      libadwaita no      wayland  no      wireplumber no
gdm           no      pango      no      mesa     no      dconf      no
nautilus      no      gvfs       no      libdrm   no      polkit     no
gsettings-desktop-schemas no      xdg-desktop-portal no   at-spi2-core no
```

Of the 58 packages tunaOS's GNOME manifest installs on a Fedora-family host,
Hummingbird ships exactly **one**: `avahi`.  Substring scans over all 3384
names return zero hits for `cairo` (only `harfbuzz-cairo`), `wayland`, `mesa`,
`libdrm`, `libxkbcommon`, `pixman`, `graphene`, `gdk`, `atk`, `at-spi`,
`librsvg`, `json-glib`, `libsoup`, `accountsservice`, `NetworkManager`,
`flatpak`, `gstreamer`, `upower`, `colord`, `iso-codes` and
`xkeyboard-config`.

The SBOM attached to the amd64 image
(`sha256:7fd344ca54b30cbc9566bd5ebaa133da2ebe5bea8d2ff656eecbfa6206243c3d.sbom`,
SPDX-2.3, blob `sha256:bbe06272fa16dfc1…`) agrees: 829 SPDX package entries,
444 distinct names, none of gnome-shell / mutter / gdm / nautilus / gtk / cairo
/ wayland / mesa / pipewire / pango.

Hummingbird publishes a base OS.  It does not publish a desktop.

## Finding 3 — Fedora Rawhide's binaries cannot simply be enabled instead

The obvious shortcut — point dnf at Fedora Rawhide, since Hummingbird tracks it
— does not work.  The eight packages that *do* diverge are the load-bearing
ones:

| package | hummingbird | Rawhide | consequence |
|---|---|---|---|
| glibc | 2.43-8.hum1 | 2.44-1.fc45 | 637 Rawhide binaries require `GLIBC_2.44`, which Hummingbird does not provide |
| libxml2 | 2.15.3 (`libxml2.so.16`) | 2.13.9 (`libxml2.so.2`) | soname mismatch **in both directions** |
| openssl | 3.5.6 (`libcrypto.so.3`) | 4.0.1 (`libcrypto.so.4`) | soname mismatch |
| python3 | 3.14.6 | 3.15.0~b4 | different `libpython3.x.so.1.0` |
| fontconfig | 2.17.1 | 2.18.2 | (the same class of break that bit skipjack; see AGENTS.md) |

Within the GNOME closure alone, 20 packages require `libxml2.so.2`, 5 require
`GLIBC_2.44` and 5 require `libcrypto.so.4` / `libssl.so.4`.  Those are hard
install failures, not warnings.  The packages have to be **rebuilt against
Hummingbird's buildroot**, which is exactly what this repository is for.

## Finding 4 — the size of the gap

Roots are each desktop's `install_packages` plus `required_packages` from
`manifests/hummingbird-desktops.yaml`.  Closure is transitive `Requires:`
against Rawhide, stopping wherever Hummingbird can already satisfy the
capability from any package, `Provides:` or shipped file.

| desktop | roots | already in target | binaries to build | **source packages to build** | tiers |
|---|---|---|---|---|---|
| gnome | 58 | 1 (`avahi`) | 405 | **298** | 10 |
| kde | 13 | 0 | 459 | **384** | 19 |
| cosmic | 22 | 0 | 201 | **163** | 10 |
| niri | 26 | 0 | 369 | **310** | 10 |
| xfce | 15 | 0 | 316 | **248** | 12 |
| **union** | | | | **670** | |

Two roots are absent from Fedora entirely and cannot be sourced from dist-git:
`dms-greeter` (niri, DankMaterialShell) and `xfwl4` (xfce, the Wayland xfwm
fork).  Those stay `upstream_rpm:` / `local:` sources in the catalog.

This is not "a subset of GNOME is missing".  It is the whole desktop stack —
`mesa`, `webkitgtk`, `samba`, `gstreamer1`, `pipewire`, `pulseaudio`, `cairo`,
`gtk3`, `gtk4`, `NetworkManager` — plus GNOME on top.

## Finding 5 — build order, and the bootstrap cycle

Tiers are a topological order over the **BuildRequires** graph taken from
Fedora's *source* repository index (that is what rpm records on an `src`
package), condensed by strongly connected components first.  Ordering by
runtime `Requires:` instead produces a single 142-package tier and is wrong;
`--source-reference ''` falls back to it and the report labels which was used
(`tier_ordering`).

Every desktop has a genuine BuildRequires cycle that no ordering can break.
For GNOME it has 60 members:

```
ModemManager NetworkManager at-spi2-core bluez cairo colord flite gcr
gdk-pixbuf2 geoclue2 geocode-glib glib-networking glycin gnome-desktop3
gnome-settings-daemon gobject-introspection graphene gsettings-desktop-schemas
gssdp gstreamer1 gstreamer1-plugins-bad-free gstreamer1-plugins-base gtk3 gtk4
gupnp gupnp-igd gweather-locations json-glib libadwaita libcanberra
libcloudproviders libdecor libepoxy libgudev libgusb libgweather libical
libinput libmbim libnice libnotify libpcap libproxy libqmi libqrtr-glib
librsvg2 libsecret libsndfile libsoup3 libwacom mpg123 mutter pango pipewire
polkit ppp pulseaudio pygobject3 sbc upower xorg-x11-server-Xwayland
```

plus `{libglvnd, libva, mesa}` and `{libxkbcommon, xkeyboard-config}`.  These
are marked `bootstrap: true` in the generated build order.  They need the
treatment this repository already uses for EL10 —
`src/gnome-50/glib2/glib2-bootstrap.spec` and
`gobject-introspection-bootstrap.spec` — or a first `--nocheck`/reduced-feature
pass, then a second full pass.  The mock config keeps Fedora Rawhide as a
priority-99 buildroot fallback precisely so the first pass has headers to build
against; Rawhide is never a repository on a produced image.

## Finding 6 — the gap is a runtime closure, and Python pays for it

Re-measured 2026-08-08, after tier `niri-00` failed eight python-\* packages
identically in runs 31231968581, 31242725235 and 31248093019.  Hummingbird's
index had moved on (revision `1786137625`, primary sha256
`3c2eaf99d82289b58747895801df4d7a9e5fbe4328899d7e93626b5ffb0f0c68`, 16617
`(name, evr, arch)` tuples) but the Python column had not:

| | hummingbird | Fedora Rawhide (45) | Fedora 44 |
|---|---|---|---|
| python3 | 3.14.6-2.2.hum1 | 3.15.0~rc1-1.fc45 | 3.14.6-1.fc44 |

Rawhide has been through the Python 3.15 rebuild; Hummingbird has not.  Every
noarch Python module carries `Requires: python(abi) = <x.y>`, so this is not a
soft version skew — **8919 of Rawhide's 66644 binary packages transitively
require `python(abi) = 3.15`** and cannot enter this buildroot at all.

Hummingbird ships a *partial* Python stack: `pyproject-rpm-macros`,
`python-srpm-macros 3.14`, `python3-devel`, `python3-setuptools 83.0.0`,
`python3-pip 26.2`, `python3-packaging`, `python3-pytest`, `python3-pathspec`,
`python3-pluggy` — and not one PEP 517 build backend.  No `flit-core`,
`hatchling`, `poetry-core`, `wheel`, `installer`, `build`, `editables`,
`trove-classifiers`, `Cython` or `expandvars`.  So `%pyproject_buildrequires`
emits a capability whose only provider is a Rawhide 3.15 build, and dnf5 says:

```
python3-flit-core-3.12.0-12.fc45.noarch requires python(abi) = 3.15,
  but none of the providers can be installed
installed package python3-pip-26.2-0.1.hum1.noarch requires python(abi) = 3.14
```

**Why the build order never listed them.** `measure-hummingbird-gap.py`
computes `closure()` over runtime `Requires:` only.  BuildRequires are used to
*order* that set, never to extend it — `tier_sources().link()` drops a
requirement whose provider is not already in the runtime-derived build set:

```python
dependency = binary_to_source.get(provider)
...
if dependency and dependency in sources and dependency != source:
    edges[source].add(dependency)
```

A build backend never appears in any runtime closure, so it was never a
candidate.  Reading the same Rawhide *source* index the tier ordering already
uses, **60 build-only providers carrying `python(abi)` are needed by the 670
packages and are in neither Hummingbird nor the build order** — `Cython`,
`gi-docgen` (30 consumers), `python-docutils` (14), `python-sphinx` (12),
`python-wheel` (10), `python-build` (8), `python-dbusmock` (8),
`python-setuptools_scm` (7) and so on.  This is not specific to `niri-00`; it
reaches every desktop.

**Why building them all is not the answer on its own.** Fedora's specs
BuildRequire their test suites, and `--nocheck` skips `%check` without removing
a single `BuildRequires`.  Taking the transitive BuildRequires closure of just
the eight `niri-00` packages, following only edges that Rawhide cannot satisfy
because of the ABI split, yields **640 source packages** — `python-build` alone
pulls `filelock`, `pyproject-hooks`, `pytest-mock`, `pytest-rerunfailures`,
`pytest-xdist`, `setuptools_scm`, `virtualenv` and `uv`.  That is a Python mass
rebuild, not a tier.

**What was pinned instead.**  638 of those 640 already exist in Fedora 44 at
`python(abi) = 3.14` — the same interpreter version Hummingbird ships.  (The
two that do not are `python-roman-numerals` and `python-vcs-versioning`, both
new in Rawhide's Sphinx chain.)  So `mock/hummingbird-ci.cfg` pins Fedora 44 at
priority 50, `includepkgs=python3-*,flit`: below Hummingbird, so the
interpreter, setuptools, pip and pytest still come from the target; above
Rawhide, so a 3.14 module beats a 3.15 one; and confined by `includepkgs`, so
no Fedora 44 C library can enter the chroot and the soname split in Finding 3
is untouched.  With that pin, none of the eight — and none of the PEP 517
bootstrap tiers added alongside them — has a remaining unsatisfiable
`python(abi)` BuildRequires.

The pin is temporary by construction: it must be removed when Hummingbird's own
`python3` reaches 3.15, or it would build 3.14 modules for a 3.15 target.
`tests/test_hummingbird_python_abi_pin.py` asserts the priority ordering, the
`includepkgs` confinement and the presence of that expiry note.

## Finding 7 — the base-image component audit (#228)

Audited against `quay.io/hummingbird-community/bootc-os:latest`: the base
image carries **262 packages** (a minimal bootc container OS with the CKI ARK
kernel) and ships `NetworkManager` (1.54.3-3.fc43) — and none of the desktop
submodules the editions need.  The manifest now declares that audit as data:
`components:` in `manifests/hummingbird-desktops.yaml` names each base-image
gap and the desktop edition that must install it, and
`scripts/validate-hummingbird-catalog.py` fails any commit that drops a
component from its desktop's `install_packages`:

| desktop | audited components | coverage |
|---|---|---|
| gnome | `NetworkManager-openvpn-gnome`, `NetworkManager-openconnect-gnome`, `NetworkManager-wwan`, `gnome-keyring`, `nautilus`, `xdg-desktop-portal-gnome`, `xdg-desktop-portal-gtk` | all in `install_packages` |
| kde | `xdg-desktop-portal-kde` | in `install_packages` |
| niri | `NetworkManager-tui`, `blueman`, `brightnessctl`, `playerctl`, `pavucontrol`, `gnome-keyring`, `nautilus`, `xdg-desktop-portal-gnome`, `xdg-desktop-portal-gtk`, `SwayNotificationCenter`, `waybar`, `fuzzel` | all in `install_packages` |
| xfce | `greetd`, `gtkgreet`, `cage`, `xdg-desktop-portal-gtk` | `greetd`/`gtkgreet`/`cage` added with this fix |

`greetd` + `gtkgreet` + `cage` are the XFCE Wayland greetd login path from the
upstream parity register (`docs/UPSTREAM_PARITY.md`); they were missing from
the xfce edition and are added here.  `gtkgreet` is a project recipe
(`packages/gtkgreet`), `greetd` is rebuilt from `src/hummingbird/greetd`, and
`cage` is a Fedora distro package.  The COSMIC/Niri/DMS COPR suites stay out
of the produced image (parity rule 1) and are rebuilt as project recipes; the
Tideforge test-cell request for Hummingbird stage 1+ desktop layers is a build-
pipeline item, not a manifest change.

## What was NOT verified

Honesty about the boundary of the measurement:

* **No RPM was built.** 670 source packages is a build-farm job, not a
  session's work.  Nothing has been published to
  `r2:bluefin/hummingbird/20251124-x86_64/` yet, and that path currently serves
  no repodata.
* The closure follows `Requires:` only.  `Recommends:` are excluded, so the
  real installed set is somewhat larger; weak deps do not change which packages
  must exist.
* Rich/boolean dependencies (`(a or b)`) are skipped rather than solved.  Four
  appeared in the GNOME closure, all of them `if`-guarded optional loaders.
* Provider choice for a capability with several providers is "exact name match,
  else shortest name" (`choose_provider`).  A different choice would move a few
  source packages in or out of the list.
* `x86_64` only.  `aarch64` is a separate index and has not been measured.
* Finding 6 is index arithmetic, not a build.  **No mock chroot was created and
  no package was rebuilt with the Fedora 44 pin in place.**  What is verified is
  that every `python(abi)`-carrying BuildRequires of the eight `niri-00`
  packages and of the PEP 517 bootstrap tiers has a provider in Fedora 44 at
  `python(abi) = 3.14` whose version satisfies the recorded constraint
  (`poetry-core >= 2` → 2.3.0, `cython >= 3.2` → 3.2.4, `flit-core >= 3.11 < 4`
  → 3.12.0, `blinker >= 1.4` → 1.9.0, `cssselect >= 0.7` → 1.4.0).  Whether
  dnf5 composes the transaction the priority table predicts can only be
  established by a real run of the workflow.
* Finding 6's `python(abi)` reachability is computed with the same
  `choose_provider` rule as the rest of this document, and treats
  `(A if B)`-guarded rich dependencies as inert — every one of them in this set
  is `(python3dist(tomli) if python3-devel < 3.11)`, which is false here.
