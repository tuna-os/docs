---
sidebar_position: 1
sidebar_label: "debian-copr"

status: unknown
---

> [!WARNING]
> **Deprecated — this repository is not consumed by anything and is not
> maintained.** The Wayland XFCE stack ships as RPMs from
> [`tuna-os/tunaos-packages`](https://github.com/tuna-os/tunaos-packages); no
> TunaOS image installs `.deb`s from here. See
> [Why this is deprecated](#why-this-is-deprecated) below. Read the rest as a
> record of what was built, not as instructions.

**Debian/Ubuntu APT build system with GitHub Actions and Cloudflare R2 — the apt-world sibling of [tunaos-packages](https://github.com/tuna-os/tunaos-packages).**

Part of the [TunaOS](https://tunaos.org) ecosystem.

## Why this exists

TunaOS's `grouper` variant (Ubuntu 26.04 bootc) needs the Wayland-native
XFCE stack — [`xfwl4`](https://gitlab.xfce.org/xfce/xfwl4) (the Rust/Smithay
compositor) plus the Wayland-adapted xfce4 components (panel, session,
settings, thunar, xfdesktop...) — the same stack `tunaos-packages` builds as
RPMs for EL10. Ubuntu's own archives don't carry these yet, so we build
and host `.deb`s ourselves, same tiered-dependency model as `tunaos-packages`:

- **Podman** runs each build in a fresh container created from
  `builder/Containerfile`; `mk-build-deps` and `dpkg-buildpackage` perform the
  build inside that container.
- **`reprepro`** manages the APT repository (signed, incremental).
- **GitHub Actions** validates changes on pull requests and provides a
  manually dispatched build-and-publish workflow. A package only builds once
  every package in its tier's dependencies is already in the repo.
- **Cloudflare R2** hosts the resulting repo, served from
  `deb.tunaos.org` (mirrors `repo.tunaos.org`'s RPM hosting).

## Structure

- `src/xfce-wayland/<package>/debian/` — Debian packaging (`control`,
  `rules`, `changelog`, `copyright`, `install`, `source/format`) per
  component. `upstream-source.txt` identifies the source archive fetched for
  each build, similar to tunaos-packages's Source0 pins.
- `build-order-xfce.yml` — tiered dependency manifest (identical schema in
  spirit to tunaos-packages's; a package's tier can't build until every
  earlier tier is in the repo).
- `builder/Containerfile` — Ubuntu 26.04 (`resolute`) build environment.
- `scripts/build-chain.sh` — builds one package in Podman, then updates the
  local repository via `reprepro`.
- `.github/workflows/validate.yml` — YAML, shell, and manifest validation for
  pushes and pull requests.
- `.github/workflows/build-xfce-distributed.yml` — manually dispatched build
  and R2 publish workflow.

## Validate changes locally

Install `yamllint`, `shellcheck`, and PyYAML, then run the same checks as the
validation workflow:

```bash
yamllint -d '{extends: default, rules: {line-length: disable}}' \
  build-order-xfce.yml conf/distributions .github/workflows/
shellcheck scripts/*.sh
python3 - <<'PYEOF'
import pathlib
import sys

import yaml

with open("build-order-xfce.yml", encoding="utf-8") as manifest_file:
    manifest = yaml.safe_load(manifest_file)

missing = []
for tier in manifest["tiers"]:
    for package in tier["packages"]:
        path = pathlib.Path(package["path"])
        if not (path / "debian" / "control").exists():
            missing.append(str(path))
        if not (path / "upstream-source.txt").exists():
            missing.append(f"{path} (no upstream-source.txt)")

if missing:
    print("Missing packaging:", missing)
    sys.exit(1)
PYEOF
```

To exercise a package build, first build the container image and install the
host-side tools used by `scripts/build-chain.sh` (`podman`, `reprepro`, and
`flock`). Then run:

```bash
podman build -t localhost/debian-copr-builder:resolute \
  -f builder/Containerfile builder/
./scripts/build-chain.sh --package src/xfce-wayland/xfwl4
```

## Status

Bootstrapping — `xfwl4` is the first package (proves the pipeline: a
Rust/cargo build wrapped in a `.deb`, no upstream Debian packaging to
crib from since it's a brand-new upstream project). The rest of the
stack follows the same tier order as `tunaos-packages`'s `build-order-xfce.yml`.

🐟 Part of the [Tuna OS](https://github.com/tuna-os) ecosystem.

## Why this is deprecated

The APT path was never wired up to a consumer. Checked against `tuna-os/tunaOS`
at the time of writing:

- **Nothing references this repo or its remote.** No occurrence of
  `debian-copr` or `deb.tunaos.org` anywhere in that tree.
- **`grouper` does not install these packages.** `manifests/desktops/xfce.yaml`
  has an `apt:` section, and it installs stock `xfce4` / `xfce4-goodies` from
  Ubuntu's own archives — the X11 desktop. It adds no tunaOS apt repository and
  never mentions `xfwl4`.
- **The Wayland stack is consumed as RPMs.** Only the `el10:` section pulls
  `xfwl4` and the Wayland-adapted components, from
  `https://repo.tunaos.org/xfce/10-stream-x86_64/` — built by
  `tunaos-packages`, not here.
- This repo has exactly one package (`xfwl4`) and never left the bootstrapping
  stage described above.

If the APT channel is revived, start from `tunaos-packages`: the tier order and
the per-component build fixes are worked out there first, and this repo was
always meant to mirror it.
