---
sidebar_position: 1
sidebar_label: "XFCE Linux"

status: alpha
---

> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**XFCE Wayland OCI image built with BuildStream** — a lightweight, immutable desktop OS image with the XFCE desktop environment.

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

The first stable channel is published only after the nightly image, matching
live ISO, plain install, and LUKS install checks are green. Once promoted,
the immutable image is available at:

```bash
podman pull ghcr.io/tuna-os/xfce-linux:stable
sudo bootc switch ghcr.io/tuna-os/xfce-linux:stable
```

The stable live ISO and checksum are published under
`https://pub-<configured-r2-domain>/xfce-linux/stable/` as
`xfce-linux-live-latest.iso` and `xfce-linux-live-latest.iso-CHECKSUM`.
The promotion workflow verifies both objects before reporting the release
ready, so downstream download pages can safely point at those stable names.

## Verifying Signatures

OCI images and live ISOs are signed keylessly with [cosign](https://github.com/sigstore/cosign)
via GitHub Actions OIDC (Sigstore/Fulcio) — no long-lived signing key to leak or rotate.

**OCI images:**

```bash
cosign verify ghcr.io/tuna-os/xfce-linux:latest \
  --certificate-identity-regexp 'https://github.com/tuna-os/xfce-linux/\.github/workflows/build-multirunner\.yml@.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

**Live ISOs** (`.sig`/`.cert` are published alongside each dated ISO, e.g.
`xfce-linux-live-<date>-<sha>.iso.sig`):

```bash
cosign verify-blob xfce-linux-live-<date>-<sha>.iso \
  --certificate xfce-linux-live-<date>-<sha>.iso.cert \
  --signature xfce-linux-live-<date>-<sha>.iso.sig \
  --certificate-identity-regexp 'https://github.com/tuna-os/xfce-linux/\.github/workflows/build-iso\.yml@.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Docs

- [XFCE Linux on tunaos.org](https://tunaos.org/docs/xfce-linux)
- [Contributing](https://github.com/tuna-os/xfce-linux/blob/main/CONTRIBUTING.md)

## License

Apache 2.0 — see [LICENSE](LICENSE).
