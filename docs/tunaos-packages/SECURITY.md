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

This repository provides RPM spec files and patches to build GNOME desktop
packages on Enterprise Linux 10 via COPR. Security considerations include:

- **Spec provenance**: The specs track dist-git from Fedora Rawhide or F43. We keep
  modifications as local patches and document them in `SRPM-CHANGES.md`.
- **Source integrity**: `spectool` downloads source tarballs at build time from
  upstream URLs (`Source:` tags in specs). A `sources` file in each package records
  the SHA512 hashes for verification.
- **Build isolation**: COPR build chroots are ephemeral. For self-hosted GHA
  builds, mock runs inside a podman container with no network access during
  `%build`/`%install`.
- **No secrets in repo**: Encrypted secrets in GitHub Actions store build secrets
  (GPG key, R2 credentials); we never commit secrets.
- **Pinned actions**: We pin actions in GitHub Actions to commit SHAs.
- **GPG signatures**: The pipeline signs RPMs with GPG before upload.

## Disclosure Policy

We follow coordinated disclosure:

1. The reporter submits a vulnerability privately
2. We investigate and develop a fix
3. We deploy the fix to new COPR builds
4. We publish the advisory after deployment

See [AGENTS.md](https://github.com/tuna-os/tunaos-packages/blob/main/AGENTS.md) and [COPR-REPORT.md](https://github.com/tuna-os/tunaos-packages/blob/main/COPR-REPORT.md) for build architecture details.
