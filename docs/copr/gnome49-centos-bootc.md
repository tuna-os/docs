---
sidebar_position: 4
title: "gnome49 centos bootc"
---

This guide documents how to layer GNOME 49 onto a CentOS Stream 10
(`quay.io/centos-bootc/centos-bootc:stream10`) base bootc image, the
workarounds required, and the root-cause explanation for each one.

GNOME 49 targets Fedora 43 (F43). Because EL10 ships older versions of
several key libraries, a COPR repository and a small set of targeted
upgrades are required before installing the GNOME stack.

---

## 1. COPR Repository

All GNOME 49 packages are published to:

```
jreilly1821/c10s-gnome-49
```

Enable it before installing anything:

```bash
dnf -y copr enable jreilly1821/c10s-gnome-49
```

> **Keep the COPR enabled** for the full install so that transitive
> dependencies (mutter, gjs, typelibs, etc.) resolve from the same repo.
> You may disable it after the install is complete.

---

## 2. Required Pre-Upgrade Steps

These **must be done before** installing the GNOME group, in this order.
Installing GNOME first and upgrading later does not work — the symbol
errors occur at RPM install time (shared library linker resolution).

### 2a. Upgrade glib2 and fontconfig

```bash
dnf -y upgrade glib2 fontconfig
```

**Why glib2?**  
EL10 ships glib2 2.80.x. `gnome-shell` 49.4 requires
`g_variant_builder_init_static` (added in 2.82) and
`gi_repository_*` API (new in 2.84/2.86). Without the COPR version
(2.86.4), gnome-shell crashes immediately at startup.

**Why fontconfig?**  
The COPR `pango` 1.57.0 links against `FcConfigSetDefaultSubstitute`,
a symbol added in fontconfig 2.17.0. EL10 ships 2.15.0 which lacks this
symbol, causing a `symbol lookup error` that prevents gnome-shell from
starting.

### 2b. Upgrade gobject-introspection and gjs

```bash
dnf -y upgrade gobject-introspection gjs
```

**Why?**  
glib2 2.84+ introduced `libgirepository-2.0.so.0` (new `gi_repository_*`
API) alongside the existing `libgirepository-1.0.so.1` (old
`g_irepository_*` API). In glib2 2.86, both are full independent
implementations that both try to register the `GIRepository` GType.

The COPR `gjs` 1.86.0 links only `libgirepository-2.0`. If
`gobject-introspection` is not also upgraded, gnome-shell can end up
linking both libraries, causing:

```
cannot register existing type 'GIRepository'
g_once_init_leave_pointer: assertion 'result != 0' failed
```

Upgrading both to the COPR versions ensures only `-2.0` is loaded.

### 2c. Install the EL10 compatibility package

```bash
dnf -y install gnome49-el10-compat
```

This package (built from `src/gnome-49/gnome49-el10-compat/` in this
repo) provides two things:

**PAM fix** (`/etc/pam.d/systemd-user`):  
GDM 49 uses dynamic `gdm-greeter-N` users allocated via systemd's
Varlink userdb API. `pam_unix.so` calls `unix_chkpwd` which cannot
resolve these transient users, returning `PAM_AUTHINFO_UNAVAIL` and
blocking the session. The override replaces the account phase with
`pam_permit.so` for the `systemd-user` service.

**SELinux policy module** (`gdm-gnome49.pp`, priority 300):  
`selinux-policy` 43.1 (from COPR) does not include rules for GDM 49's
userdb Varlink socket architecture. Under enforcing mode the following
denials occur at startup:

| Source domain | Target | Permission | Effect |
|---|---|---|---|
| `xdm_t` | `systemd_userdbd_runtime_t:dir` | `add_name` | GDM can't create socket |
| `xdm_t` | `systemd_userdbd_runtime_t:sock_file` | `create` | GDM can't create socket |
| `xdm_t` | `passwd_file_t:file` | `write` | GDM can't lock passwd |
| `systemd_user_runtimedir_t` | `xdm_t:unix_stream_socket` | `connectto` | Session scope setup fails |
| `policykit_t`, `auditd_t`, `init_t`, etc. | `xdm_t:unix_stream_socket` | `connectto` | System services denied |

The module grants exactly these permissions. It is installed
automatically via `%post: semodule -X 300 -i gdm-gnome49.pp`.

---

## 3. Install the GNOME 49 Stack

```bash
dnf group install -y --nobest --allowerasing \
    -x PackageKit \
    -x PackageKit-command-not-found \
    "Common NetworkManager submodules" \
    "Core" \
    "Fonts" \
    "Guest Desktop Agents" \
    "Hardware Support" \
    "Printing Client" \
    "Standard" \
    "Workstation product core"

dnf -y install \
    -x gnome-software \
    -x PackageKit \
    -x PackageKit-command-not-found \
    NetworkManager-adsl \
    glib2 \
    gdm \
    dbus-daemon \
    gnome-bluetooth \
    gnome-color-manager \
    gnome-control-center \
    gnome-initial-setup \
    gnome-remote-desktop \
    gnome-session-wayland-session \
    gnome-settings-daemon \
    gnome-shell \
    gnome-user-docs \
    gvfs-fuse \
    gvfs-goa \
    gvfs-gphoto2 \
    gvfs-mtp \
    gvfs-smb \
    libsane-hpaio \
    nautilus \
    orca \
    ptyxis \
    sane-backends-drivers-scanners \
    xdg-desktop-portal-gnome \
    xdg-user-dirs-gtk \
    yelp-tools \
    gnome-disk-utility
```

> **Note on `dbus-daemon`**: GDM's `gdm-wayland-session` requires
> `dbus-daemon` to start the session message bus. It is only a
> `Recommends:` of gdm (not `Requires:`), so bootc image builds prune
> it. Install it explicitly.

---

## 4. Compile GLib Schemas

After installing the GNOME stack, compile schemas:

```bash
glib-compile-schemas /usr/share/glib-2.0/schemas
```

EL10's `%post` scriptlets may not run `glib-compile-schemas`
automatically in mock-installed or bootc-layered RPMs.

---

## 5. Versionlock

Lock the GNOME stack to prevent accidental downgrade back to EL10 base
versions:

```bash
dnf versionlock add \
    glib2 \
    fontconfig \
    gdm \
    gnome-shell \
    mutter \
    gnome-session-wayland-session \
    gnome-settings-daemon \
    gnome-control-center \
    gsettings-desktop-schemas \
    gtk4 \
    libadwaita \
    pango \
    xdg-desktop-portal \
    xdg-desktop-portal-gnome
```

Then disable the COPR (it should not be active at runtime):

```bash
dnf -y copr disable jreilly1821/c10s-gnome-49
```

---

## 6. Known Non-Fatal Issues

### `GSettings key enable-passkey-authentication not found`

```
JS ERROR: Error: GSettings key enable-passkey-authentication not found
in schema org.gnome.login-screen
```

This is logged at startup but does not prevent GDM from working.
The web-login patch in gnome-shell 49.4 references a GSettings key that
EL10's GDM schema does not define. GDM and the greeter session start
normally.

### `setroubleshootd` AVC denials

`setroubleshootd_t` generates AVC denials related to writing the RPM
database — a pre-existing setroubleshoot self-policy bug in EL10, not
related to GNOME. These are harmless.

---

## 7. Containerfile Example

```dockerfile
FROM quay.io/centos-bootc/centos-bootc:stream10

RUN dnf -y copr enable jreilly1821/c10s-gnome-49 && \
    dnf -y upgrade glib2 fontconfig gobject-introspection gjs && \
    dnf -y install gnome49-el10-compat && \
    dnf group install -y --nobest --allowerasing \
        -x PackageKit -x PackageKit-command-not-found \
        "Workstation product core" && \
    dnf -y install \
        -x gnome-software -x PackageKit -x PackageKit-command-not-found \
        gdm dbus-daemon gnome-shell gnome-session-wayland-session \
        gnome-settings-daemon gnome-control-center mutter \
        gnome-shell gnome-disk-utility nautilus ptyxis \
        xdg-desktop-portal-gnome xdg-user-dirs-gtk \
        gvfs-mtp gvfs-smb gvfs-goa gvfs-gphoto2 && \
    glib-compile-schemas /usr/share/glib-2.0/schemas && \
    systemctl enable gdm && \
    dnf versionlock add glib2 fontconfig gdm gnome-shell mutter \
        gnome-session-wayland-session gnome-settings-daemon \
        gnome-control-center gsettings-desktop-schemas gtk4 \
        libadwaita pango && \
    dnf -y copr disable jreilly1821/c10s-gnome-49 && \
    dnf clean all
```

---

## 8. Reference

- **COPR project**: https://copr.fedorainfracloud.org/coprs/jreilly1821/c10s-gnome-49/
- **Spec sources**: `src/gnome-49/` in this repository
- **Working build script**: `build_scripts/gnome.sh` in the tunaOS repo
- **Regression notes**: `REGRESSION-systemd-pam.md`
- **All spec modifications**: `SRPM-CHANGES.md`
