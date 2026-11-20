---
sidebar_position: 1
sidebar_label: "athens"
title: "athens"
hide_title: true

status: unknown
---

![Athens wordmark](https://raw.githubusercontent.com/tuna-os/athens/bst/branding/athens/athens-wordmark.svg)

The [Athens application icon](https://github.com/tuna-os/athens/blob/bst/branding/athens/athens-logo.svg) and wallpaper
are original TunaOS artwork, separate from Elementary OS branding. The desktop
components and recipe basis retain their upstream names and attribution.

![Athens desktop wallpaper preview](https://raw.githubusercontent.com/tuna-os/athens/bst/branding/athens/athens-wallpaper.png)

Athens is TunaOS's Pantheon-based BuildStream recipe. Its initial recipe and image-build setup are adapted from [JumpyVi's `elementary-build-meta`](https://github.com/jumpyvi/elementary-build-meta); this is not an original TunaOS implementation. Upstream Elementary/Pantheon components retain their own names, licenses, and attribution. See [LICENSE](https://github.com/tuna-os/athens/blob/bst/LICENSE) and the pinned source definitions under `elements/`.

## Build locally

Requirements:

- Podman
- `just`
- Mkosi meeting the minimum in `mkosi.conf`
- OpenSSL (`just genkey` runs `openssl` on the host)
- `sudo` access (`just build-image` and `just clean` run Mkosi as root)
- `zstd`
- `systemd`

Generate a local development signing key, then build the Mkosi disk image:

```bash
just genkey
just build-image
```

The Mkosi image and partition artifacts are written to `mkosi.output/`. This
path remains the existing disk-image build; it does not produce an OCI image.
It does not produce a qualified installer ISO or production release.

The committed configuration sets no root password. For a root login on a local
test build, write a password to `mkosi.images/os/mkosi.rootpw` (mode `0600`,
git-ignored) before building; Mkosi reads it in place of `RootPassword=`. Mkosi
stores that password inside the image's `/usr`, so do not hand such an image to
anyone else.

Build the separate Athens bootc OCI image with BuildStream, then export its OCI
layout to `buildstream-oci/`:

```bash
just build-oci
just export-oci
just load-oci
just lint-oci
```

`just export-oci` checks out the already-built `oci/athens.bst` artifact and
requires the `buildstream-oci/` destination not to exist. `just load-oci`
imports that local OCI layout into Podman without a registry operation;
`just lint-oci` runs `bootc container lint` on the imported image, then
`scripts/check-image-access.sh`, which fails if the image has an account with an
empty password, a stored root password, a `NOPASSWD` sudo rule or an autologin.
The target layers only Athens's Pantheon/codecs content over the GNOME OS OCI
base runtime and sets the `containers.bootc` image label. It does not produce a
disk image or push to a registry.

BuildStream elements can also be inspected or built directly inside the pinned
container with `just bst show oci/athens.bst` or
`just bst build oci/athens.bst`.

## Validation and status

Pull requests run YAML/action lint, structural BuildStream lint,
product-contract tests, and read-only BuildStream graph validation for
`x86_64` and `aarch64`. CI validates the graph; it does not compile either full
image or prove boot/install/deployment behavior. The OCI bootc path is
experimental and local-only; the local lint recipe has not been run, nor has
the image been tested through bootc installation/update flows.

Pull requests and pushes to `bst` also run `actions-security.yml`, which checks
the workflows themselves:

- The `lockfile` job runs `gh actions-lock --verify` (the
  [`github/gh-actions-lock`](https://github.com/github/gh-actions-lock)
  extension, version pinned in the job). It fails when
  `.github/workflows/actions.lock` no longer matches the `uses:` lines in the
  workflows, or when a locked pin no longer verifies upstream.
- The `zizmor` job runs the zizmor workflow security linter and fails on any
  finding.

The contract tests include `tests/test_access_invariants.py`. It fails when a
file either image build reads sets a root password, blanks a password, adds a
`NOPASSWD` sudo rule or turns on an autologin. Access for a test build belongs
in git-ignored local configuration, as under "Build locally".

`actions.lock` is generated; do not edit it by hand. After adding a workflow
or changing any `uses:` line (including a Dependabot action bump), install the
extension once with `gh extension install github/gh-actions-lock`, run
`gh actions-lock` from the repository root, and commit the updated lockfile in
the same pull request.

The GNOME OS junction's secure-boot key sources use its checked-in key-generation
template in the default `snakeoil` mode. No signing key is committed or used for
production signing; this does not establish a distributable secure-boot trust
contract.

Release publication, Athens update feeds, and production signing are not
configured. The inherited Elementary systemd-sysupdate sources and signing key
are intentionally excluded from the active Mkosi image until Athens has an
approved update endpoint and trust contract. Do not distribute generated
images as production releases.

## Acknowledgments

- [JumpyVi](https://github.com/jumpyvi) for the original BuildStream recipe and image-build basis in [`elementary-build-meta`](https://github.com/jumpyvi/elementary-build-meta).
- [Elementary OS](https://github.com/elementary) and Pantheon component maintainers for the desktop components and upstream recipes.
- [FreeDesktopSDK](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) for build cache and upstream elements.
- [GnomeOS](https://gitlab.gnome.org/GNOME/gnome-build-meta) for remote element definitions.
- [Zirconium](https://github.com/zirconium-dev/zirconium-hawaii) for the repository template.
