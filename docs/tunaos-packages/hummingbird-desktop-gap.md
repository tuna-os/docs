---
sidebar_position: 11
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
