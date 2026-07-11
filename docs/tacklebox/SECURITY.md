---
sidebar_position: 5
title: "Security"
---

## Supported Versions

Tacklebox is published as a Go binary and as a container image on GHCR.
Only the latest release is actively supported.

| Version | Status |
|---|---|
| Latest release | ✅ Supported |
| Older releases | ❌ Unsupported — upgrade to latest |
| `main` branch | ⚠️ Best effort (development) |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via GitHub Security Advisories:

1. Go to the [Security tab](https://github.com/tuna-os/tacklebox/security)
2. Click **Report a vulnerability**
3. Provide a detailed description of the issue, including steps to reproduce

You can expect:
- **Acknowledgment** within 48 hours
- **Status update** within 5 business days
- **Resolution timeline** based on severity

## Security Model

Tacklebox:
- Is written in Go (memory-safe language)
- Runs with elevated privileges (root required for disk operations)
- Executes `bootc`, `dracut`, `sgdisk`, and other system tools with validated arguments
- Uses BuildKit secret mounts, never environment variables, for sensitive data
- Operates on user-provided images from trusted registries

## Supply Chain Security

- GitHub Actions are pinned to commit SHAs
- The Go build is reproducible via `go build` with pinned toolchain
- Container images are built from multi-stage Dockerfiles with minimal surface
- External dependencies are managed via `go.mod` with checksum verification

## Disclosure Policy

We follow coordinated disclosure:
1. Reporter submits vulnerability privately
2. We investigate and develop a fix
3. Fix is released in a new version
4. Advisory is published after release

See `ARCHITECTURE.md` and `README.md` for full architecture and usage details.
