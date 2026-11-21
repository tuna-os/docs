---
sidebar_position: 22
title: "install"
---

> **Backends.** `tuna-compositor --backend auto` (the default) runs as a
> DRM/KMS hardware session when started without a host display, for example
> as a GDM session or from a TTY, and as a nested window otherwise. A hardware
> session needs a seat from logind or seatd. Hardware support is new: it is
> proven on the kernel's virtual KMS device in CI (`scripts/tuna-drm-smoke`)
> and not yet qualified on real GPUs. The compositor draws the cursor,
> including client cursor images, into each frame; no KMS cursor plane is used.

## Test-drive in a VM (one command)

On Linux or macOS, evaluate Tuna Desktop without building it or installing Tuna Desktop packages. The script needs these host tools first; it checks for them and stops with install hints if any is missing:

- QEMU (`qemu-system-x86_64` or `qemu-system-aarch64`, matching the host architecture, plus `qemu-img`). On Linux, `/dev/kvm` is strongly recommended; without it QEMU falls back to very slow TCG emulation.
- Podman with working rootless user namespaces (on macOS, an initialized and running `podman machine`).
- cosign, to verify the image signature.
- About 10 GiB free in `$HOME` and `/var/tmp`, and network access to GitHub, `ghcr.io` and the Sigstore verification services.

The guest architecture follows the host (x86_64 or aarch64). Corral and its bootc plugin are the only components the script installs for you.

```sh
curl -fsSL https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/scripts/try-tuna-desktop | bash
```

This downloads Corral (checksum-verified), pulls and cosign-verifies the published TunaOS image, and launches Tuna Desktop in local QEMU with a local-only browser console over noVNC. Stop anytime with Ctrl-C. See `scripts/try-tuna-desktop` for options (`TRY_TUNA_MEM`, `TRY_TUNA_PORT`, etc.).

If it stops with `no signatures published for ...`, the pipeline published that build unsigned: the script checks signatures before the multi-GB download and refuses an image that cannot pass verification. Retry when a signed build publishes, or set `TRY_TUNA_IMAGE` to a signed build.

## From the Debian-format package

The package ships the preferred GTK shell beside the compositor. The first
installed-package CI target is Ubuntu 26.04 amd64. CI includes a clean
`ubuntu:26.04` container install with only declared dependencies and installed
binary version checks; real session and hardware qualification remain
separate acceptance requirements. Packages must be built against their target
distribution's libraries. The required gtk4-layer-shell version is at least
1.1; [Debian 13 stable provides 1.0.4](https://packages.debian.org/trixie/libgtk4-layer-shell0),
so that target still needs a genuine packaged backport and separate installed
session qualification. [Ubuntu 26.04 provides 1.3.0](https://packages.ubuntu.com/resolute/amd64/libgtk4-layer-shell0).
A package built on Ubuntu does not establish Debian 13 ABI compatibility.

```sh
sudo apt install ./tuna-desktop_X.Y.Z_amd64.deb
```

Dependencies resolve automatically on a target with the declared runtime
packages available: GTK at least 4.14, libadwaita, gtk4-layer-shell,
libgweather 4.4 and `python3` for the shipped GeoClue agent-policy helper. Location services
need `geoclue-2.0`, which the package recommends rather than requires;
without it the session runs and hides the location indicator. After
installing, the Tuna Desktop session is
selectable from the login screen. Upgrading installs the newer package over
the older one; the [legacy-upgrade guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md) explains the
temporary two-file bridge, explicit session reselection, preserved settings
and conflict recovery. Package replacement alone does not qualify login or
unlock on an existing session. In particular, do not rely on it to repair an
administrator-removed PAM service. The guide lists the native tests still
required for each supported route. If you uninstall, removing the package
drops the Tuna Desktop-owned program files and session entries while
preserving user data. See `docs/release.md` for the release process.

## From source

Install the complete package list in
[Prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites) first (Ubuntu and Arch lists,
matching the CI `check` job). The compositor builds its DRM and PipeWire
features by default, so it needs the libseat, libinput, libudev, GBM, libdrm,
PipeWire, libclang and xkbcommon development packages
(`crates/compositor/Cargo.toml`); the GTK shell needs GTK 4, libadwaita,
gtk4-layer-shell and, for the date menu's world clocks and weather,
libgweather 4 (`crates/shell-gtk/Cargo.toml`). Where the distribution has no gtk4-layer-shell
package, `scripts/ci-install-gtk4-layer-shell` builds it. At run time the
nested backend additionally dlopens the EGL/Mesa display libraries
(`libegl1`, `libgl1-mesa-dri`, `libgbm1` on Ubuntu).

```sh
cargo build --release \
  -p tuna-compositor -p tuna-shell-host -p tuna-shell-gtk
```

Binaries land in `target/release/`: `tuna-compositor`, `tuna-shell-gtk`,
`tuna-shell-host`, and `tuna-session` (the last is a second binary target of
the compositor crate).

## Installing

```sh
PREFIX=/usr/local
install -Dm0755 target/release/tuna-compositor "$DESTDIR$PREFIX/bin/tuna-compositor"
install -Dm0755 target/release/tuna-shell-gtk  "$DESTDIR$PREFIX/bin/tuna-shell-gtk"
install -Dm0755 target/release/tuna-shell-host "$DESTDIR$PREFIX/bin/tuna-shell-host"
install -Dm0755 target/release/tuna-session   "$DESTDIR$PREFIX/bin/tuna-session"
install -Dm0644 share/wayland-sessions/tuna.desktop \
  "$DESTDIR$PREFIX/share/wayland-sessions/tuna.desktop"
```

Keep the binaries side by side: `tuna-session` finds its
`tuna-compositor` sibling by directory. The compositor picks its shell
from `TUNA_SHELL_BIN` when set, then `tuna-shell-gtk` and then
`tuna-shell-host` beside it, then the same two on `PATH`. Set
`TUNA_SHELL_BIN=tuna-shell-host` to run the legacy shell.

## Logging in through GDM

GDM is the supported login manager. It lists the entries in
`/usr/share/wayland-sessions`: choose **Tuna Desktop** from the session menu
on the login screen. The entry's `Exec=` line is `tuna-session`, never the
compositor directly, so shell supervision stays in the loop, and
`X-GDM-SessionRegisters=true` tells GDM the session registers itself.

The lock screen authenticates through the `tuna-lock` PAM service, and
fingerprint unlock through `tuna-lock-fingerprint` (`pam_fprintd` plus your
`login` account stack, like GDM's `gdm-fingerprint`). The packages install
both; a source install needs them too. Without `tuna-lock`, PAM falls back to
the `other` service (deny on most distributions) and a locked session cannot
be unlocked; without `tuna-lock-fingerprint`, only fingerprint unlock fails:

```sh
install -Dm0644 share/pam.d/tuna-lock /etc/pam.d/tuna-lock
install -Dm0644 share/pam.d/tuna-lock-fingerprint /etc/pam.d/tuna-lock-fingerprint
```

Fingerprint unlock also needs `pam_fprintd.so`: the `libpam-fprintd`
package on Debian and Ubuntu, `fprintd` on Arch.

## When something goes wrong

[Troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md) covers package, build and login
problems; [session operations](https://github.com/tuna-os/tuna-desktop/blob/main/docs/session-operations.md) covers logs, the lock
screen and recovering a running session.
