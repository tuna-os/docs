---
sidebar_position: 1
sidebar_label: "Brussels"
title: "Brussels"
hide_title: true

status: alpha
---

> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/tuna-os/brussels/blob/main/LICENSE)

**An OCI image with XFCE Wayland, built through BuildStream** — a lightweight
and immutable OS image with the XFCE desktop.

Part of the [TunaOS](https://tunaos.org) ecosystem.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Features

- **Lightweight** — XFCE desktop optimized for low-resource systems
- **Immutable** — OCI-based, atomic updates via `bootc`
- **Wayland** — modern display protocol
- **BuildStream** — reproducible builds from source

## Quick Start

> **Not published yet:** `ghcr.io/tuna-os/brussels` has no public image yet.
> Until it has, use the earlier name `ghcr.io/tuna-os/xfce-linux` with the
> same tags. It gets the same image.

```bash
# Pull the image
podman pull ghcr.io/tuna-os/brussels:latest

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/brussels:latest
```

### Earlier name: XFCE Linux

This project was "XFCE Linux", and its image was
`ghcr.io/tuna-os/xfce-linux`. That name is now an alias of the same digest,
so an installed system continues to update. To move to the new name, run
`sudo bootc switch ghcr.io/tuna-os/brussels:<tag>`. See
[`docs/migration-brussels.md`](https://github.com/tuna-os/brussels/blob/main/docs/migration-brussels.md) for the checks
and the schedule.

## brussels-winblues: party like it is 1995, on Wayland

![The brussels-winblues desktop: a file manager and the appearance settings with beveled gray windows, navy title bars, and an open Start menu](https://raw.githubusercontent.com/tuna-os/brussels/main/docs/images/winblues/hero.webp)

Gray bevels. Navy title bars. A chunky taskbar and a penguin on the Start
button. Below them is a 2026 system: an immutable image, XFCE, and a Wayland
compositor (xfwl4) that draws this classic look.

The look is the [Chicago95](https://github.com/grassmunk/Chicago95) theme.
The variant is one small layer on top of Brussels.

**You cannot install it yet.** We have not published the image. See more
pictures and the details in [`docs/winblues.md`](https://github.com/tuna-os/brussels/blob/main/docs/winblues.md).

## Stable release channel

The release workflow publishes the first stable channel only after all checks
pass. The checks cover the nightly image, matching live ISO, plain install, and
LUKS install. After promotion, use the immutable image at:

```bash
podman pull ghcr.io/tuna-os/brussels:stable
sudo bootc switch ghcr.io/tuna-os/brussels:stable
```

The workflow publishes the stable live ISO and checksum under
`https://pub-<configured-r2-domain>/xfce-linux/stable/`. Their names are
`xfce-linux-live-latest.iso` and `xfce-linux-live-latest.iso-CHECKSUM`.
The promotion workflow verifies both objects before it marks the release as
ready. Thus, downstream download pages can safely use those stable names.

## Verifying Signatures

**OCI images:** CI signs each image digest with cosign and no key.

```bash
cosign verify ghcr.io/tuna-os/brussels:latest \
  --certificate-identity https://github.com/tuna-os/brussels/.github/workflows/build-multirunner.yml@refs/heads/main \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

Images from before this change have no signature, and the command fails for
them. See [`docs/signing.md`](https://github.com/tuna-os/brussels/blob/main/docs/signing.md) for `:stable`, the variants,
and the limits. `bootc` does not enforce this signature.

**Live ISO signatures** (`.sig` and `.cert` files accompany each dated ISO,
such as `xfce-linux-live-<date>-<sha>.iso.sig`):

```bash
cosign verify-blob xfce-linux-live-<date>-<sha>.iso \
  --certificate xfce-linux-live-<date>-<sha>.iso.cert \
  --signature xfce-linux-live-<date>-<sha>.iso.sig \
  --certificate-identity-regexp '^https://github\.com/tuna-os/(brussels|xfce-linux)/\.github/workflows/build-iso\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Docs

- [Brussels on tunaos.org](https://tunaos.org/docs/brussels)
- [Contribution guide](https://github.com/tuna-os/brussels/blob/main/CONTRIBUTING.md)
- [Documentation index](https://github.com/tuna-os/brussels/blob/main/docs/README.md): the XFCE component set, the
  session and screen lock, the `brussels-winblues` variant, signatures,
  and the CI and ISO pipeline

## License

Apache 2.0 — see [LICENSE](https://github.com/tuna-os/brussels/blob/main/LICENSE).
