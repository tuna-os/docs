---
sidebar_position: 3
title: "XFWL4 PORTING"
---

TunaOS must not ship X11 on any image. Today xfce is X11 everywhere except
EL10. This is the survey of what each ecosystem actually needs, measured
against the real base images rather than assumed.

## The finding

> **CORRECTION (measured, 2026-07-19).** An earlier version of this document
> claimed every distro needs exactly one package. That was wrong, and it was
> wrong because it was reasoned from package *presence* without ever running a
> build. A real build on Fedora 44 fails:
>
> ```
> Package dependency requirement 'libxfce4kbd-private-3 >= 4.21.4'
>   could not be satisfied.
> Package 'libxfce4kbd-private-3' has version '4.20.2',
>   required version is '>= 4.21.4'
> ```
>
> **xfwl4 4.21.0 requires the XFCE 4.21 libraries, and every base except
> Gentoo ships 4.20.x.** The corrected position is below.

**Only Gentoo needs nothing. Everywhere else needs the XFCE 4.21 core
libraries as well as `xfwl4`** — which is close to what EL10 already builds,
not the one-package job this document originally described.

XFCE 4.20 did add upstream Wayland support, and that part of the survey holds:
every base ships 4.20 or newer, their `xfce4-panel` already links
`libgtk-layer-shell` and `libwayland-client`, and the greeter stack
(`greetd` / `gtkgreet` / `cage`) is packaged in all of them. Those facts were
measured and are unchanged.

What they do not establish is that xfwl4 *builds* against 4.20. It does not.
The compositor tracks the 4.21 development series and its `-sys` crates pin
`>= 4.21.4` at the pkg-config level, so 4.20.x libraries fail the probe before
compilation starts. Package presence was never evidence of version adequacy —
only a build is.

So this is not "port a 20-package desktop stack to five ecosystems", which is
what EL10 required and what it looked like from the outside. EL10 is the
outlier: it ships essentially no XFCE at all, so `build-order-xfce.yml` builds
the whole stack. Everywhere else, rebuilding those packages would ship
worse-tested duplicates of what the distro already maintains.

`xfwl4` is the gap because it is a young Rust/Smithay compositor that only
Gentoo and AUR have picked up.

## Survey

Measured from the base images in `.github/build-config.yml` (tunaOS repo).

`libxfce4ui` version is the one that decides the work, since `xfwl4` needs
`>= 4.21.4`:

| Base | libxfce4ui | Meets xfwl4 >= 4.21.4 | Consequence |
|---|---|---|---|
| Gentoo | **4.21.9** | ✅ | nothing to build — xfwl4 also in tree |
| Fedora 44 | 4.20.2 | ❌ | needs 4.21 core libs + xfwl4 |
| Debian trixie | 4.20.1 | ❌ | needs 4.21 core libs + xfwl4 |
| Ubuntu resolute | 4.20.2 | ❌ | needs 4.21 core libs + xfwl4 |
| Arch / openSUSE | 4.20.x | ❌ | needs 4.21 core libs + xfwl4 |
| EL10 | (ours) | ✅ | already builds the whole stack |

Fedora is measured from a real build; Debian/Ubuntu from `apt-cache policy
libxfce4ui-2-dev`; Gentoo from packages.gentoo.org.

### What "4.21 core libs" means — measured on Fedora

Building the chain on fedora:44 settles it at **three packages**, each present
because a crate probe demanded it:

| Crate | Probe requirement | Fedora ships | We build |
|---|---|---|---|
| `xfconf-sys` | `libxfconf-0 >= 4.21.2` | 4.20.0 | **xfconf 4.21.2** |
| `libxfce4kbd-private-sys` | `libxfce4kbd-private-3 >= 4.21.4` | 4.20.2 | **libxfce4ui 4.21.7** |
| — | — | — | **xfwl4 4.21.0** |

Result: `xfwl4-4.21.0-1.fc44.x86_64.rpm`, EXIT=0.

Two packages are deliberately NOT in that set, and the reasons generalise:

- **`libxfce4util`** — our spec builds 4.20.1, *older* than Fedora's 4.20.2.
  Including it attempts a downgrade.
- **`libxfce4windowing`** — Fedora's 4.20.4 satisfies every probe, so building
  ours replaces a distro package for nothing.

EL10 builds the full stack because EL10 ships none of it. A distro that
already ships half the stack needs only the pieces below a version floor, so
EL10's tier list cannot be copied wholesale — the per-distro set has to be
derived from the probes, which means building.

Those packages carry the
distro's own names, so shipping them means TunaOS supplies a *newer* XFCE core
than the distro does. dnf/apt treat that as an upgrade rather than a conflict
(4.21.9 > 4.20.2), but it is a real maintenance commitment: TunaOS then owns
those libraries on that base until the distro catches up to 4.21/4.22.

That trade — carry the 4.21 core, or wait for the distro — is the actual
decision for each non-Gentoo base, and it was hidden by the original
one-package framing.

### Original per-base capability survey (unchanged, still accurate)

| Base | Variant(s) | XFCE | panel is Wayland-capable | greetd | gtkgreet | cage | rust | **xfwl4** |
|---|---|---|---|---|---|---|---|---|
| Fedora 44 | bonito, bonito-rawhide | 4.20.3/4.20.7 | ✅ | 0.10.3 | 0.8 | 0.3.1 | 1.96 | ❌ **build** |
| Debian trixie | flounder | 4.20.2/4.20.4 | ✅ | 0.10.3 | 0.8 | 0.2.0 | 1.85 | ❌ **build** |
| Debian sid | flounder-sid | ≥ trixie | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ **build** |
| Ubuntu resolute | grouper | 4.20.4/4.20.7 | ✅ | 0.10.3 | 0.8 | 0.2.1 | 1.93 | ❌ **build** |
| Arch | marlin | 4.20.4/4.20.7 | ✅ | 0.10.3 | `greetd-gtkgreet` 0.8 | 0.3.1 | 1.97 | ⚠️ AUR `xfwl4-git` |
| openSUSE TW | sailfin | 4.20.4/4.20.7 | ✅ | 0.10.3 | 0.8 | 0.3.1 | 1.97 | ❌ **build** |
| Gentoo | guppy | 4.21.2 | ✅ | in tree | 0.8 | in tree | ✅ | ✅ **`xfce-base/xfwl4` 4.21.0** |
| EL10 | yellowfin, albacore, skipjack | ✗ none | — | COPR | packaged here | base | ✅ | ✅ packaged here |

"panel is Wayland-capable" = `xfce4-panel` declares a dependency on
gtk-layer-shell **and** wayland-client, verified per base:

- deb: `apt-cache depends xfce4-panel` → `libgtk-layer-shell0`, `libwayland-client0`
- Arch: `pacman -Si xfce4-panel` → `gtk-layer-shell`
- openSUSE: `zypper info --requires` → `libgtk-layer-shell.so.0`, `libwayland-client.so.0`
- Fedora: `dnf repoquery --requires` → same two

## Work per ecosystem

Ordered by leverage. User-facing X11 exposure today is **bonito (+rawhide)** and
**flounder**; grouper/marlin/flounder-sid/sailfin are experimental per
tunaOS#641, so they are not shipping X11 to users yet.

### 1. Gentoo (guppy) — zero packaging

`xfce-base/xfwl4` 4.21.0 is already in the official Portage tree. Its
`keywords` are empty, meaning unkeyworded, so it needs an entry in
`package.accept_keywords` to install. That is a manifest change in the tunaOS
repo, not work here.

Note guppy currently has **no xfce flavor at all** (base/gnome/kde), so this is
adding a flavor rather than de-X11-ing one.

### 2. Fedora (bonito, bonito-rawhide) — reuse the RPM we have

`build-order-xfce-fedora.yml` + `mock/fedora-44-ci.cfg` already exist. One
package, one tier. Blocked only on `build-xfce-distributed.yml`, which still
hard-codes the centos-stream-10 mock runner and per-tier job blocks.

### 3. openSUSE (sailfin) — reuse the RPM, adjust macros

Same spec, different macros. Expect to differ on: `BuildRequires` names
(`pkgconfig(...)` style is portable, bare `-devel` names are not),
`%license` handling, and the `%{?rhel}` conditional which must not fire.
Skeleton: `packaging/opensuse/`.

### 4. Debian + Ubuntu (flounder, flounder-sid, grouper) — one `.deb` source

All three share one source package. Skeleton: `packaging/debian/`.

### 5. Arch (marlin) — PKGBUILD — built, measured

AUR `xfwl4-git` exists and tracks git rather than the 4.21.0 release. We
package our own, pinned to the same commit the RPM and .deb both build, so
every variant ships the identical compositor.

Confirmed by a real `makepkg` build (Arch container, `xfconf` +
`libxfce4ui` installed locally via `pacman -U` ahead of the compositor
build): same three-package set as Fedora, no fourth package needed.

- `xfconf` 4.21.2-1 — `makedepends` needed `glib2-devel` in addition to
  `glib2`: `glib-genmarshal` lives in the `-devel` split, and meson's
  `glib-2.0` probe wants it at configure time even though nothing links
  against it.
- `libxfce4ui` 4.21.7-1 — same `glib2-devel` fix applied pre-emptively.
- `xfwl4` 4.21.0-1 — built clean once the two above were installed;
  `pkg-config --modversion libxfconf-0` / `libxfce4kbd-private-3` confirmed
  the local packages satisfied both probes before `makepkg` ran.

Unlike Debian and Fedora, Arch's `libxfce4util` ships a `.vapi` (not just a
`.gir`), so vala did not need to be disabled — one less workaround than the
other two ecosystems needed.

`makepkg` builds with the network up, so `cargo fetch` works directly for
xfwl4's `smithay` git dependency — no vendor tarball step like the RPM/deb
builds need.

## What makes xfwl4 harder than a normal Rust package

These constraints come from `xfwl4.spec` and apply to **every** ecosystem, so
each packaging skeleton has to solve them again:

1. **`resources/xfce-wayland-protocols` is a git submodule.** It holds custom
   XFCE Wayland protocol XML and is *not* in the release tarball. The build
   references it by relative path, so it must be unpacked to exactly
   `resources/xfce-wayland-protocols/`.

2. **Cargo dependencies must be vendored.** `Cargo.toml` pulls `smithay` from
   git, which cargo cannot fetch in a network-isolated build. The RPM uses a
   pre-vendored `vendor.tar.gz` plus a `.cargo/config.toml` that redirects both
   crates.io *and* the smithay git source to it. Debian and Arch builds are
   also network-isolated by policy, so both need the same treatment.

3. **An upstream patch is required.** `WlrBufferConstraints.dma`'s cfg gate
   omits the udev feature while three call sites guard it under udev — a
   udev-only build (ours) fails to compile without
   `0001-fix-dma-cfg-gate-for-udev-backend.patch`.

4. **Feature flags are not default.** Build with
   `--no-default-features --features udev,egl,xwayland,smithay/renderer_pixman,smithay/renderer_gl`.

5. **`GETTEXT_SYSTEM=1` must be set.** Otherwise `gettext-sys`'s build.rs
   compiles its own GNU gettext, which then fails to link against
   `libintl_gettext`. On glibc targets gettext is in libc, so no linking is
   needed at all.

6. **`RUSTFLAGS="-C relocation-model=pic"`.**

## Status

Skeletons in `packaging/` are **scaffolds, not working builds** — they encode
the constraints above and the dependency names, and every one of them still
needs a real build to be trusted. None has been built yet.
