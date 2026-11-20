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
`just lint-oci` runs `bootc container lint` on the imported image.
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
