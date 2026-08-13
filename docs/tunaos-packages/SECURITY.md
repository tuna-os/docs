---
sidebar_position: 5
title: "Security"
---

## Supported Versions

Only the `main` branch is actively supported. COPR build specs in this
repository target the following RPM delivery channels:

| Project | Base OS | Branch | Status |
|---|---|---|---|
| `c10s-gnome-50` | CentOS Stream 10 | `main` | ✅ Supported |
| `c10s-gnome-49` | CentOS Stream 10 | `main` | ✅ Supported |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via GitHub Security Advisories:

1. Go to the [Security tab](https://github.com/tuna-os/tunaos-packages/security)
2. Click **Report a vulnerability**
3. Provide a detailed description of the issue, including steps to reproduce

You can expect:
- **Acknowledgment** within 48 hours
- **Status update** within 5 business days
- **Resolution timeline** based on severity

## RPM Supply Chain Security

This repository provides RPM spec files and patches for building GNOME desktop
packages on Enterprise Linux 10 via COPR. Security considerations include:

- **Spec provenance**: Specs track Fedora Rawhide / F43 dist-git. Modifications
  are carried as local patches and documented in `SRPM-CHANGES.md`.
- **Source integrity**: Source tarballs are downloaded at build time via
  `spectool` from upstream URLs (`Source:` tags in specs). SHA512 hashes are
  recorded in per-package `sources` files for verification.
- **Build isolation**: COPR build chroots are ephemeral. For self-hosted GHA
  builds, mock runs inside a podman container with no network access during
  `%build`/`%install`.
- **No secrets in repo**: Build secrets (GPG key, R2 credentials) are stored in
  GitHub Actions encrypted secrets, never committed.
- **Pinned actions**: Third-party GitHub Actions are pinned to commit SHAs.
- **GPG signing**: Self-hosted pipeline RPMs are GPG-signed before upload.

## Disclosure Policy

We follow coordinated disclosure:
1. Reporter submits vulnerability privately
2. We investigate and develop a fix
3. Fix is deployed to new COPR builds
4. Advisory is published after deployment

See [AGENTS.md](https://github.com/tuna-os/tunaos-packages/blob/main/AGENTS.md) and [COPR-REPORT.md](https://github.com/tuna-os/tunaos-packages/blob/main/COPR-REPORT.md) for build architecture details.
