---
sidebar_position: 2
title: "Contributing"
---

Thanks for helping build the Wayland-native XFCE `.deb` stack for TunaOS's
`grouper` (Ubuntu bootc) variant. This is the apt-world sibling of
[tunaos-packages](https://github.com/tuna-os/tunaos-packages) — read that
repo's docs too if you haven't packaged for TunaOS before, since the tiered
build model is shared between both.

## Project layout

| Path | What lives here |
|---|---|
| `src/xfce-wayland/<package>/debian/` | Debian packaging (`control`, `rules`, `changelog`, `copyright`, `install`, `source/format`) for one component |
| `src/xfce-wayland/<package>/upstream-source.txt` | The upstream source archive URL pinned for that package's build |
| `build-order-xfce.yml` | Tiered dependency manifest — a package's tier can't build until every earlier tier is already in the repo |
| `builder/Containerfile` | The Ubuntu 26.04 (`resolute`) build environment image |
| `conf/`, `conf-unsigned/` | `reprepro` repository configuration (signed vs. unsigned intermediate imports) |
| `scripts/build-chain.sh` | Builds one package in a fresh Podman container, then imports the resulting `.deb`s into the local `reprepro` repo |
| `tests/test-build-chain.sh` | Bash assertions covering `scripts/build-chain.sh` against fixture directories |
| `.github/workflows/validate.yml` | yamllint, shellcheck, and build-order manifest validation on every push/PR |
| `.github/workflows/build-xfce-distributed.yml` | Manually dispatched build-and-publish-to-R2 workflow |

## Adding or updating a package

1. Add `src/xfce-wayland/<package>/debian/` with standard Debian packaging
   (`control`, `rules`, `changelog`, `copyright`, `source/format`, and
   `patches/` if needed) and `upstream-source.txt` naming the upstream
   archive.
2. Add the package to the correct tier in `build-order-xfce.yml` — it can
   only build once every package in earlier tiers is already published.
3. Validate locally (see below) before opening a PR.

## Validate changes locally

Install `yamllint`, `shellcheck`, and PyYAML, then run the same checks CI
runs in [`validate.yml`](https://github.com/tuna-os/debian-copr/blob/main/.github/workflows/validate.yml):

```bash
yamllint -d '{extends: default, rules: {line-length: disable}}' \
  build-order-xfce.yml conf/distributions .github/workflows/
shellcheck scripts/*.sh
```

Then run the packaging-manifest check ([`validate.yml`](https://github.com/tuna-os/debian-copr/blob/main/.github/workflows/validate.yml)
has the full script) to confirm every `build-order-xfce.yml` entry resolves
to real `debian/control` and `upstream-source.txt` files.

To exercise `scripts/build-chain.sh` itself:

```bash
bash tests/test-build-chain.sh
```

To exercise a real package build (needs `podman`, `reprepro`, `flock`):

```bash
podman build -t localhost/debian-copr-builder:resolute \
  -f builder/Containerfile builder/
./scripts/build-chain.sh --package src/xfce-wayland/xfwl4
```

## Pull requests

- Keep each PR focused on one package or one tooling change.
- Run the validation commands above before opening — CI runs the same
  checks and will otherwise fail on the same things.
- Explain which upstream release/artifact a packaging change targets.

## Project docs

- [README.md](https://github.com/tuna-os/debian-copr/blob/main/README.md) — why this repo exists and its architecture.
- [ROADMAP.md](https://github.com/tuna-os/debian-copr/blob/main/ROADMAP.md) — what's planned next.
