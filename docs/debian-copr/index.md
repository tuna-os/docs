---
sidebar_position: 1
sidebar_label: "debian-copr"

status: unknown
---

**Debian/Ubuntu APT build system with GitHub Actions and Cloudflare R2 — the apt-world sibling of [tunaos-packages](https://github.com/tuna-os/tunaos-packages).**

Part of the [TunaOS](https://tunaos.org) ecosystem.

## Why this exists

TunaOS's `grouper` variant (Ubuntu 26.04 bootc) needs the Wayland-native
XFCE stack — [`xfwl4`](https://gitlab.xfce.org/xfce/xfwl4) (the Rust/Smithay
compositor) plus the Wayland-adapted xfce4 components (panel, session,
settings, thunar, xfdesktop...) — the same stack `tunaos-packages` builds as
RPMs for EL10. Ubuntu's own archives don't carry these yet, so we build
and host `.deb`s ourselves, same tiered-dependency model as `tunaos-packages`:

- **`sbuild`** (not `mock`) builds each package in a clean, cached chroot.
- **`reprepro`** manages the APT repository (signed, incremental).
- **GitHub Actions** drives tiered builds — a package only builds once
  every package in its tier's dependencies is already in the repo.
- **Cloudflare R2** hosts the resulting repo, served from
  `deb.tunaos.org` (mirrors `repo.tunaos.org`'s RPM hosting).

## Structure

- `src/xfce-wayland/<package>/debian/` — Debian packaging (`control`,
  `rules`, `changelog`, `copyright`, `install`, `source/format`) per
  component, orbiting each package's real upstream source (fetched via
  `debian/watch` / a pinned tarball or git commit, same as tunaos-packages's
  Source0 pins).
- `build-order.yml` — tiered dependency manifest (identical schema in
  spirit to tunaos-packages's; a package's tier can't build until every
  earlier tier is in the repo).
- `sbuild/` — sbuild chroot config (Ubuntu 26.04 `noble`+1 / `resolute`).
- `scripts/build-chain.sh` — builds one package via `sbuild`, updates the
  local repo via `reprepro`.
- `.github/workflows/` — lint/validate, incremental (PR) build, and the
  full tiered distributed build + R2 publish.

## Status

Bootstrapping — `xfwl4` is the first package (proves the pipeline: a
Rust/cargo build wrapped in a `.deb`, no upstream Debian packaging to
crib from since it's a brand-new upstream project). The rest of the
stack follows the same tier order as `tunaos-packages`'s `build-order-xfce.yml`.

🐟 Part of the [Tuna OS](https://github.com/tuna-os) ecosystem.
