---
sidebar_position: 1
sidebar_label: "COPR Builds"
status: internal
---

> 🔧 **Internal tooling** — used by the TunaOS build pipeline. Not user-facing.

RPM packages bringing GNOME 50 to CentOS Stream 10 (EL10), hosted on
[COPR](https://copr.fedorainfracloud.org/coprs/jreilly1821/c10s-gnome-50/).

Packages are built in COPR (`jreilly1821/c10s-gnome-50`) targeting `epel-10-x86_64`.
Most packages build directly from Fedora Rawhide dist-git. A small set require local spec
modifications to work on EL10 — those are documented below.

## Quick Install

```bash
dnf -y install dnf-plugins-core
dnf copr enable -y jreilly1821/c10s-gnome-50
dnf -y install gnome-shell gdm mutter gnome-session nautilus gnome50-el10-compat
```

## Architecture

```
Fedora Rawhide dist-git  ──▶┐
                             ├──▶  COPR (epel-10-x86_64)  ──▶  repo.tunaos.org
Our GitHub repo (main)   ──▶┘
```

- **~50 packages** pull directly from Fedora Rawhide dist-git — no local spec needed.
- **8 packages** require a modified spec checked into this repo (see below).
- **1 package** (`gnome50-el10-compat`) is EL10-specific, not in Fedora at all.

Build method per package is tracked in [`COPR-AUDIT.md`](https://github.com/tuna-os/github-copr/blob/main/COPR-AUDIT.md).

## Modified Specs (Diverge from Rawhide)

These packages cannot use Fedora Rawhide dist-git directly and must be built from the
specs in this repository. Each entry documents exactly what was changed and why.

---

### `glib2` — `src/gnome-50/glib2/`

**Build method:** SRPM upload
**Our version:** 2.87.3 · **Rawhide:** 2.87.5

Changes from rawhide required for EL10:

- **Manual meson invocation** — replaced `%meson` / `%meson_build` / `%meson_install`
  macros with explicit `meson setup --prefix=/usr --libdir=/usr/lib64 --buildtype=plain`
  calls. The `BuildSystem: meson` macro had EL10 compatibility issues.
- **Simplified BuildRequires** — removed `pkgconfig(gi-docgen)`, `/usr/bin/rst2man`,
  `shared-mime-info`, `dbus-daemon`, `update-desktop-database` (not available or needed
  on EL10 at build time). Added `BuildRequires: gobject-introspection-devel` in their place.
- **Added `%transfiletriggerin` scriptlets** — runs `glib-compile-schemas` when schemas
  are installed. EL10's stock `%post` scriptlets from mock-installed RPMs may not fire;
  this ensures schemas are always compiled.
- **Removed `Conflicts: gobject-introspection < 1.79.1`** — avoids complications with
  EL10's stock gobject-introspection version.
- **Version lag** — currently at 2.87.3; rawhide is at 2.87.5. Needs rebasing.

---

### `gdm` — `src/gnome-50/gdm/`

**Build method:** SCM (`just copr-scm-build src/gnome-50/gdm`)
**Our version:** 50~rc · **Rawhide:** 50~rc (same)

Changes from rawhide required for EL10:

- **Added `Requires: gnome50-el10-compat`** — pulls in the PAM fix for GDM's dynamic
  greeter user allocation on EL10. GDM 50 allocates greeter users (`gdm-greeter-N`)
  dynamically via systemd's Varlink userdb API. EL10's `pam_unix.so` calls `unix_chkpwd`
  which cannot resolve these dynamic users, returning `PAM_AUTHINFO_UNAVAIL` and
  preventing the greeter session from launching. `gnome50-el10-compat` overrides
  `/etc/pam.d/systemd-user` with `account required pam_permit.so` to work around this.

> This is the only change from rawhide. All patches, build flags, and install sections
> are identical to Fedora's GDM spec.

---

### `gjs` — `src/gnome-50/gjs/`

**Build method:** SCM (`just copr-scm-build src/gnome-50/gjs`)
**Our version:** 1.87.90 · **Rawhide:** 1.87.90 (same)

Changes from rawhide required for EL10:

- **Tests disabled** (`%bcond_with tests`) — rawhide unconditionally runs the gjs test
  suite via `xwfb-run`, which requires `xwayland-run`, `dbus-x11`, `mesa-dri-drivers`,
  and `mutter` at build time. None of these are available in the EL10 COPR buildroot.
  All test BuildRequires and the `%meson_test` call are gated behind `%{with tests}`,
  which defaults to off.
- **Manual meson invocation** — same pattern as glib2: explicit `meson setup` instead
  of `%meson` macro, for EL10 compat.

> `gjs-bootstrap.spec` also exists in the same directory for breaking the circular dep
> with mutter during initial bootstrapping. `just copr-scm-build` automatically selects
> `gjs.spec` (non-bootstrap).

---

### `gnome-desktop3` — `src/gnome-50/gnome-desktop3/`

**Build method:** SCM (`just copr-scm-build src/gnome-50/gnome-desktop3`)
**Our version:** 44.5 · **Rawhide:** 44.5 (same)

Changes from rawhide required for EL10:

- **Removed `BuildRequires: pkgconfig(gtk+-3.0)`** — gtk3 is not available in EL10's
  COPR build environment.
- **Added `-Dlegacy_library=false`** to meson options — disables `libgnome-desktop-3`
  (the legacy gtk3 library). Without this, the build fails trying to link against gtk3.
  The gtk4 library (`libgnome-desktop-4`) is still built normally and is what GNOME 50
  packages actually use.
- **Removed `Requires: gnome-desktop3` from gnome-desktop4 subpackage** — since the
  base package no longer ships a runtime library.
- **Removed `%files` entries for `libgnome-desktop-3*`** — not built.

---

### `gtk4` — `src/gnome-50/gtk4/`

**Build method:** SCM (`just copr-scm-build src/gnome-50/gtk4`)
**Our version:** 4.21.6-2 · **Rawhide:** 4.21.6 (same upstream)

Changes from rawhide required for EL10 (all gated behind `%if !0%{?rhel}`):

- **Gated `BuildRequires: pkgconfig(gstreamer-player-1.0)`** — `gstreamer1-plugins-bad-free-devel`
  depends on `libgtk-3.so.0`, which is not available in EL10.
- **Added `-Dmedia-gstreamer=disabled`** — the gstreamer media backend uses a `gstreamer-full`
  meson wrap that isn't available in the EL10 COPR buildroot. With `--wrap-mode=nodownload`
  enforced, meson would error out trying to fetch it. Gated behind `%if 0%{?rhel}`.
- **Gated `Requires: gstreamer1-plugins-bad-free-libs`** — runtime dep dropped on EL10
  since the gstreamer backend is disabled.

---

### `tinysparql` — `src/deps/tinysparql/`

**Build method:** SCM (`just copr-scm-build src/deps/tinysparql`)
**Our version:** 3.11~rc · **Rawhide:** 3.11~rc (same)

Changes from rawhide required for EL10 (all gated behind `%if !0%{?rhel}`):

- **Gated `BuildRequires: asciidoc`** — `asciidoc` requires `source-highlight`, which
  requires `libboost_regex.so.1.83.0`. EL10 ships boost with an ABI-incompatible version
  and `source-highlight` has not been rebuilt against it, so the dep chain is broken.
- **Gated `-Dman-pages` meson option** — man page generation requires `asciidoc`.
  On EL10 the option is set to `disabled`; on Fedora it uses `auto`.
- **Gated `%files` entries for `tinysparql*.1` man pages** — not generated on EL10.

---

### `gnome-autoar` — `src/deps/gnome-autoar/`

**Build method:** SCM (`just copr-scm-build src/deps/gnome-autoar`)
**Our version:** 0.4.5-4 · **Rawhide:** 0.4.5 (same upstream)

Changes from rawhide required for EL10:

- **Added `-Dgtk=false`** — disables the `gnome-autoar-gtk` widget subpackage, which
  requires `gtk+-3.0`. gtk3 is not in EL10.
- **Added `-Dvapi=false`** — disables Vala bindings (tied to the gtk widget).
- **Added `-Dgtk_doc=false` and `-Dtests=false`** — removes unnecessary gtk-doc and
  test dependencies.
- **Removed `BuildRequires: pkgconfig(gtk+-3.0)` and `vala`**.
- **Removed `%files` entries** for `libgnome-autoar-gtk-0*`, `GnomeAutoarGtk-0.1.*`,
  vala bindings, and gtk-doc.

> nautilus uses `gnome-autoar-0` (the core archive library), not the gtk widget.
> Disabling gtk has no functional impact.

---

### `gnome50-el10-compat` — `src/deps/gnome50-el10-compat/`

**Build method:** SRPM upload
**Not in Fedora** — EL10-specific workaround package

This package ships runtime fixes required to run GNOME 50 on EL10 that do not apply
to Fedora:

- **`/etc/pam.d/systemd-user` override** — replaces the account phase with
  `account required pam_permit.so`. EL10's `pam_unix` calls `unix_chkpwd` which cannot
  resolve GDM 50's dynamically-allocated greeter users (`gdm-greeter-N`), causing
  `PAM_AUTHINFO_UNAVAIL` and a broken greeter session.

- **SELinux policy modules** installed via `semodule -X 300`:
  - `gdm-gnome50.pp` — allows `xdm_t` to create/unlink sockets in
    `systemd_userdbd_runtime_t` directories, write `passwd_file_t`, create `etc_t`
    files. EL10's stock `xdm_t` policy does not permit GDM 50's Varlink userdb socket.
  - `gdm-userdb-connect.pp` — allows `systemd_userdbd_t`, `chkpwd_t`, and related
    domains to connect to `xdm_t` unix sockets.

> Install `gnome50-el10-compat` whenever you install `gdm`. It is automatically pulled
> in as a dependency of the COPR-built `gdm` package.

---

## Package Source Quick Reference

```
# Must use local spec (SCM or SRPM upload):
glib2               → SRPM   src/gnome-50/glib2/
gdm                 → SCM    src/gnome-50/gdm/
gjs                 → SCM    src/gnome-50/gjs/
gtk4                → SCM    src/gnome-50/gtk4/
gnome-desktop3      → SCM    src/gnome-50/gnome-desktop3/
gnome-autoar        → SCM    src/deps/gnome-autoar/
tinysparql          → SCM    src/deps/tinysparql/
gnome50-el10-compat → SRPM   src/deps/gnome50-el10-compat/

# Everything else uses Fedora Rawhide dist-git directly:
mutter, gnome-shell, gtk4, libadwaita, pipewire, pango, fontconfig,
xdg-desktop-portal, xdg-desktop-portal-gnome, gobject-introspection,
gsettings-desktop-schemas, gnome-session, gnome-control-center,
gnome-settings-daemon, nautilus, meson, glycin, mozjs140, gi-docgen,
localsearch, tinysparql, libnotify, avahi, cairo, blueprint-compiler, …
```

Full per-package audit with exact diffs: [`COPR-AUDIT.md`](https://github.com/tuna-os/github-copr/blob/main/COPR-AUDIT.md)

## Local Development

```bash
just copr-build <package>                      # Build from Fedora Rawhide dist-git
just copr-scm-build src/gnome-50/<package>     # Build from our modified spec
just copr-scm-build src/deps/<package>         # Build from our modified spec

just copr-status                               # Check recent build status
just copr-logs <build-id>                      # Download and view build logs
```

See [`CLAUDE.md`](https://github.com/tuna-os/github-copr/blob/main/CLAUDE.md) for the full build workflow, known EL10 quirks, and
debugging tips.

## Known EL10 Runtime Issues

All addressed by installing `gnome50-el10-compat`. See [`workarounds/README.md`](https://github.com/tuna-os/github-copr/blob/main/workarounds/README.md)
for details.

| Issue | Fix |
|-------|-----|
| SELinux: `xdm_t` policy blocks GDM 50's Varlink socket | Custom policy modules in `gnome50-el10-compat` |
| PAM: `pam_unix` can't resolve dynamic greeter users | `/etc/pam.d/systemd-user` override |
| GLib schemas not compiled after install | `%transfiletriggerin` in our `glib2` spec |
| No Wayland by default | Set `WaylandEnable=true` in `/etc/gdm/custom.conf` |

## License

MIT
