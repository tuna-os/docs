---
sidebar_position: 4
title: "Security"
---

## Supported Versions

Only the latest release is actively supported.

| Version | Status |
|---|---|
| Latest release | ✅ Supported |
| Older releases | ❌ Unsupported — upgrade to latest |
| `main` branch | ⚠️ Best effort (development) |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via GitHub Security Advisory.

1. Go to the repository's **Security** tab
2. Click **Report a vulnerability**
3. Fill out the form with details of the issue

You can expect an acknowledgement within 48 hours and a resolution within 90 days.

## Image Signatures

CI signs the OCI images with cosign and no key. See
[`docs/signing.md`](https://github.com/tuna-os/brussels/blob/main/docs/signing.md) for the check and its limits. An
installed system does not enforce this signature.

## Secure Boot Signing Key

The tunaOS Secure Boot key signs systemd-boot and the kernel in the publish
job. The secrets are `TUNAOS_SB_KEY` and `TUNAOS_SB_CERT`.

- The key belongs in the GitHub environment `secure-boot-signing`. The
  branch policy of that environment admits `main` only. A workflow on any other branch cannot read an environment secret.
- Only the `build_final` job of `build-multirunner.yml` names that environment.
  A test fails if another job reads the two secrets.
- State on 2026-11-25: the environment exists, but the two secrets are still
  organisation secrets. The owner must run `tunaos-secure-boot-lockdown.sh`
  with the key file. The script sets the environment secrets and deletes the
  organisation secrets. Until then, a workflow on a branch can read the key.

See [`docs/secure-boot.md`](https://github.com/tuna-os/brussels/blob/main/docs/secure-boot.md) for the details and the
limits.

## Disclosure Policy

- Report vulnerabilities to the maintainers through a private channel first.
- The maintainers prepare a fix before public disclosure.
- The maintainers disclose the issue after they release a fix or after 90 days,
  whichever is sooner.
