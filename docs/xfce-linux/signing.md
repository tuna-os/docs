---
sidebar_position: 8
title: "signing"
---

XFCE Linux signs its OCI images with a cosign key. It does not use keyless
signatures.

## Why a key

`bootc` verifies an image through
[containers-policy(5)](https://github.com/containers/image/blob/main/docs/containers-policy.json.5.md).
Its `sigstoreSigned` requirement takes a public key on disk:

```json
{ "type": "sigstoreSigned", "keyPath": "/usr/share/pki/containers/xfce-linux.pub" }
```

No policy type can express both a Fulcio certificate identity and an OIDC
issuer, which is what a keyless signature carries. A person who runs
`cosign verify` can check such a signature. The tool that consumes the
image cannot. This repository moved off keyless for that reason.

`zirconium-dev/zirconium-hawaii` reached the same conclusion. Its
`cosign.pub` and `/usr/share/pki/containers/` layout is the model here.

## Create the key

A maintainer with repository admin runs one command. It creates the pair and
sends the private half straight to GitHub Actions secrets. The key therefore
stays out of a shell history, and out of a file that someone must remember
to delete:

```bash
cosign generate-key-pair github://tuna-os/xfce-linux
```

That command writes `cosign.pub` to the current directory. It also sets two
repository secrets, `COSIGN_PRIVATE_KEY` and `COSIGN_PASSWORD`.

This repository's workflow reads `SIGNING_SECRET` and
`SIGNING_SECRET_PASSWORD`. So either rename those two secrets, or create the
pair locally and set them by hand:

```bash
cosign generate-key-pair
gh secret set SIGNING_SECRET          -R tuna-os/xfce-linux < cosign.key
gh secret set SIGNING_SECRET_PASSWORD -R tuna-os/xfce-linux
rm -f cosign.key
git add cosign.pub && git commit -m "chore: add the image signature public key"
```

Commit `cosign.pub`. It is the public half, and it belongs in the repository.

## Before the key exists

The workflow runs its sign step only when `SIGNING_SECRET` holds a value.
Without that secret the build still publishes and the sign step reports
skipped. The build logs a warning:

```
::warning::SIGNING_SECRET is not set — published an unsigned image.
```

You can therefore see an unsigned publish in the log.

## Still to do

The image does not yet carry the public key or a policy file, and that
change cannot land before `cosign.pub` exists. It needs an element much like
zirconium's `elements/zirconium/common.bst`:

- copy `cosign.pub` to `/usr/share/pki/containers/xfce-linux.pub`
- ship `/etc/containers/policy.json` with a `sigstoreSigned` entry for
  `ghcr.io/tuna-os/xfce-linux` that names that `keyPath`
- add `/etc/containers/policy.json` to the element's `overlap-whitelist`,
  because the base layer ships one

Until that change lands, CI signs each image, but the installed system does
not enforce the signature.

## Verify an image

```bash
cosign verify --key cosign.pub ghcr.io/tuna-os/xfce-linux:latest
```

## Live ISOs

`build-iso.yml` still signs ISO artifacts without a key, which is correct. A
person verifies an ISO; `bootc` does not. The
`--certificate-identity-regexp` instructions in README.md still apply to
those files.
