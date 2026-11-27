---
sidebar_position: 11
title: "signing"
---

CI signs the OCI images with cosign and no key (keyless). The `sign_final`
job of `build-multirunner.yml` gets a certificate from Fulcio for the GitHub
Actions identity of that workflow. The certificate is valid for minutes, and
Rekor logs the signature. CI holds no key for this, so no key can leak.

Images from before the first build with this job have no signature.
`cosign verify` fails for them.

## Verify an image

Use cosign 3. For `:latest` and the nightly tags, which come from `main`:

```bash
cosign verify ghcr.io/tuna-os/brussels:latest \
  --certificate-identity https://github.com/tuna-os/brussels/.github/workflows/build-multirunner.yml@refs/heads/main \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

For `:stable`, which a build on the branch `stable` makes:

```bash
cosign verify ghcr.io/tuna-os/brussels:stable \
  --certificate-identity https://github.com/tuna-os/brussels/.github/workflows/build-multirunner.yml@refs/heads/stable \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

The same commands work for `ghcr.io/tuna-os/xfce-linux` (the alias) and for
`ghcr.io/tuna-os/brussels-winblues`.

Give the full identity. Do not use a pattern that accepts each ref. A
workflow on any branch of this repository gets a certificate. Only the ref
tells the branches apart.

## What the signature proves

It proves that `build-multirunner.yml` on that branch signed the digest. It
does not prove that the installed system checked it.

The two branches do not give the same proof. No branch `stable` exists on
2026-11-25, and no ruleset protects that name. A person with write access
can create it and run a changed workflow there. The result has the `stable`
identity. See "The limits that stay" in [`secure-boot.md`](https://github.com/tuna-os/brussels/blob/main/docs/secure-boot.md).

## Why bootc does not enforce it

`bootc` verifies an image through
[containers-policy(5)](https://github.com/containers/image/blob/main/docs/containers-policy.json.5.md).
Its `sigstoreSigned` requirement accepts a public key (`keyPath`), a Fulcio
identity (`fulcio`) or a certificate chain (`pki`). The `fulcio` form needs
`oidcIssuer` and `subjectEmail`, and compares the second with the e-mail
address in the certificate. A GitHub Actions certificate holds no e-mail
address. It holds the URI of the workflow, and no field matches that URI.

`policy.json` thus cannot demand this workflow identity. The image ships no
such policy, and an update installs with no signature check. The check above
is a manual one.

A `fulcio` entry that drops the identity is not possible, and it would be no
help: each GitHub repository can get a certificate.

## If enforcement is necessary

Enforcement needs a key pair in addition to the keyless signature:

1. A maintainer makes the pair with `cosign generate-key-pair`. The private
   half goes in an environment that admits protected branches only, as for
   the Secure Boot key. `cosign.pub` goes in this repository.
2. `sign_final` makes a second signature with the key, in the format that
   `containers-policy(5)` reads.
3. The image ships `/usr/share/pki/containers/brussels.pub`, and
   `/etc/containers/policy.json` with one `sigstoreSigned` entry for
   `ghcr.io/tuna-os/brussels` and one for the alias. Do not enable one name
   only. A system on the other name would then fail each update.

No one has decided to do this. `zirconium-dev/zirconium-hawaii` is a model.

## Two names

The image has two names during the transition in
[`migration-brussels.md`](https://github.com/tuna-os/brussels/blob/main/docs/migration-brussels.md): `ghcr.io/tuna-os/brussels`
and the alias `ghcr.io/tuna-os/xfce-linux`. Both names point to one digest.
A signature does not move with the digest: cosign stores it in the
repository that it signs. So `sign_final` signs the digest one time for each
name in `PUBLISH_NAME` and `ALIAS_NAMES`.

## Live ISOs

`build-iso.yml` signs the ISO files in the same keyless way. README.md gives
the command.
