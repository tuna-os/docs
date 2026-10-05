---
sidebar_position: 1
sidebar_label: "XFCE Linux"

status: alpha
---

> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/tuna-os/xfce-linux/blob/main/LICENSE)

**An OCI image with XFCE Wayland, built through BuildStream** — a lightweight
and immutable OS image with the XFCE desktop.

Part of the [TunaOS](https://tunaos.org) ecosystem.

## Features

- **Lightweight** — XFCE desktop optimized for low-resource systems
- **Immutable** — OCI-based, atomic updates via `bootc`
- **Wayland** — modern display protocol
- **BuildStream** — reproducible builds from source

## Quick Start

```bash
# Pull the image
podman pull ghcr.io/tuna-os/xfce-linux:latest

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/xfce-linux:latest
```

## Stable release channel

The release workflow publishes the first stable channel only after all checks
pass. The checks cover the nightly image, matching live ISO, plain install, and
LUKS install. After promotion, use the immutable image at:

```bash
podman pull ghcr.io/tuna-os/xfce-linux:stable
sudo bootc switch ghcr.io/tuna-os/xfce-linux:stable
```

The workflow publishes the stable live ISO and checksum under
`https://pub-<configured-r2-domain>/xfce-linux/stable/`. Their names are
`xfce-linux-live-latest.iso` and `xfce-linux-live-latest.iso-CHECKSUM`.
The promotion workflow verifies both objects before it marks the release as
ready. Thus, downstream download pages can safely use those stable names.

## Verifying Signatures

CI signs each OCI image with [cosign](https://github.com/sigstore/cosign) and
a project key. The public half is `cosign.pub` in this repository. The build
copies it into the image at `/usr/share/pki/containers/xfce-linux.pub`, where
`bootc` reads it. See [`docs/signing.md`](https://github.com/tuna-os/xfce-linux/blob/main/docs/signing.md).

The project uses a key, not a keyless signature, because `bootc` verifies
through containers-policy(5). That policy type takes a path to a public key
and cannot express a Fulcio certificate identity.

**OCI images:**

```bash
cosign verify --key cosign.pub ghcr.io/tuna-os/xfce-linux:latest
```

**Live ISO signatures** (`.sig` and `.cert` files accompany each dated ISO,
such as `xfce-linux-live-<date>-<sha>.iso.sig`):

```bash
cosign verify-blob xfce-linux-live-<date>-<sha>.iso \
  --certificate xfce-linux-live-<date>-<sha>.iso.cert \
  --signature xfce-linux-live-<date>-<sha>.iso.sig \
  --certificate-identity-regexp 'https://github.com/tuna-os/xfce-linux/\.github/workflows/build-iso\.yml@.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Docs

- [XFCE Linux on tunaos.org](https://tunaos.org/docs/xfce-linux)
- [Contribution guide](https://github.com/tuna-os/xfce-linux/blob/main/CONTRIBUTING.md)

## License

Apache 2.0 — see [LICENSE](https://github.com/tuna-os/xfce-linux/blob/main/LICENSE).


## Contribute compute — no code needed

No time to write code? You can still push this project's backlog forward. A TunaOS AI-agent hive works on this repository. Lend the hive your AI subscription or API tokens, and your machine runs tasks from this project's backlog.

- 🏫 [Contribute compute to the school hive](https://school.tunaos.org/contribute)
