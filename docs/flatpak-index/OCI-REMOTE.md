---
sidebar_position: 7
title: "OCI REMOTE"
---

Do not point Flatpak at raw `ghcr.io`. A bare registry is not a remote.
Push app images to GHCR. Serve a Flatpak OCI index from an HTTPS host.
Add that host as an `oci+https://` remote. Flatpak reads the index, then
pulls blobs from GHCR by digest.

Our index lives at `https://tunaos.org/flatpak/index/static`. It names
`"Registry": "https://ghcr.io"`. Our remote file is
`https://tunaos.org/flatpak/tuna-os.flatpakrepo`.

## Publish a New App

1. Build the app with `flatpak-builder`. Tag the image with the
   `org.flatpak.ref` label, for example `app/org.tunaos.mariner/x86_64/master`.
2. Push the image to `ghcr.io/tuna-os/<app>` with skopeo or podman.
3. Add the app to the index with `scripts/update-index.py`. The index entry
   points at the GHCR manifest digest.
4. Flip the new GHCR package to public. New packages default to private,
   and private packages return 401 for anonymous pulls.

## The Remote Descriptor

The `tuna-os/docs` repository supplies the production descriptor at
[https://tunaos.org/flatpak/tuna-os.flatpakrepo](https://tunaos.org/flatpak/tuna-os.flatpakrepo). It sets `Url` to the
`oci+` form of [https://tunaos.org/flatpak](https://tunaos.org/flatpak) and now declares
`AuthenticatorName=org.flatpak.Authenticator.Oci` so Flatpak can get an
anonymous token from GHCR.

This repository's root `tuna-os.flatpakrepo` also points at the production
remote, but intentionally has no `AuthenticatorName`. Use the production
descriptor above for new installations.

The authenticator does not fix the known `remote-info` 401 (see
[tuna-os/flatpak-index#96](https://github.com/tuna-os/flatpak-index/issues/96)).
That client path fetches the manifest without the registry token handshake.
Keep the authenticator in the production descriptor.

## Install and Update (Client Side)

Add the remote once, in one scope:

```bash
flatpak remote-add --user tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
```

Then use the same scope for everything. A user-scope remote needs
`flatpak install --user` and `flatpak update --user`. Plain `flatpak update`
checks the system scope and reports nothing to update. For a machine-wide
setup, add with `--system` under sudo and drop `--user` from later commands.

Check a new remote with `flatpak remote-ls tuna-os`, not with
`flatpak remote-info`. `remote-info` fetches the manifest without the
registry token handshake and reports 401 against public GHCR remotes.
That 401 is a known client-side limitation of flatpak (see
[flatpak/flatpak#6852](https://github.com/flatpak/flatpak/issues/6852)),
not a broken remote.

## Signing

Unsigned OCI remotes install with `--no-gpg-verify`. Signed remotes
(flatpak 1.17 and later) use `--signature-lookaside` with a lookaside
location. We ship unsigned for now; keep `--no-gpg-verify` in the
documented commands until that changes.

## Escape Hatch

Flatpak 1.17 and later install a single image with no remote at all:

```bash
flatpak install --image docker://ghcr.io/tuna-os/mariner:master
```

Use this to test an image before it enters the index.

## Verify Changes to This Setup

```bash
flatpak remote-add --user tuna-os-test https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak remote-ls --user tuna-os-test
flatpak install --user --no-deps --no-deploy --noninteractive tuna-os-test <app-id>
flatpak remote-delete --user tuna-os-test
```

`--no-deploy` downloads the app but does not install it. `--no-deps` skips the runtime
so the check stays small. Expect `remote-info` to 401; that is the known
limitation above, not a failure.
