---
sidebar_position: 2
title: "Architecture"
---

## Overview

This project implements a Copr-like RPM build and hosting system using:
- **GitHub Actions**: CI/CD pipeline for building RPMs
- **Mock**: Isolated chroot environments for building
- **Cloudflare R2**: Storage for RPMs and metadata
- **GPG**: Package signing for security

## System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GitHub Actions                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │  build-x86_64   │  │ build-aarch64   │  │  build (main job)      │ │
│  │  ubuntu-latest  │  │ ubuntu-latest-  │  │  - Checkout            │ │
│  │                 │  │ arm64            │  │  - Build container     │ │
│  │                 │  │                 │  │  - Import GPG          │ │
│  │                 │  │                 │  │  - Configure R2        │ │
│  │                 │  │                 │  │  - Build RPMs          │ │
│  │                 │  │                 │  │  - Sign RPMs           │ │
│  │                 │  │                 │  │  - Upload to R2        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Mock Container                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Isolated chroot environments per target                        │   │
│  │  - fedora-43-x86_64                                             │   │
│  │  - almalinux-10-x86_64                                          │   │
│  │  - centos-stream-10-x86_64                                      │   │
│  │  - (ARM64 targets)                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare R2                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │  /repo/         │  │  /sources/      │  │  /public.gpg           │ │
│  │  ├── fedora-43/ │  │  ├── glib/      │  │  (GPG public key)      │ │
│  │  ├── almalinux/ │  │  ├── gtk4/      │  │                        │ │
│  │  └── centos/    │  │  └── ...        │  │                        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Optional)
┌─────────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  - Custom domain routing                                        │   │
│  │  - dnf/yum metadata handling                                    │   │
│  │  - Security headers                                            │   │
│  │  - Request logging                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Build Pipeline

### 1. Trigger

- Push to `main` branch
- New tag (`v*`)
- dispatch

 Manual workflow### 2. Container Build

```dockerfile
FROM fedora:43

# Install build tools
RUN dnf install -y mock createrepo_c rpm-sign rpm-build ...
```

### 3. Chroot Initialization

Mock creates isolated environments:
- Downloads base packages
- Configures repos
- Sets up build user

### 4. SRPM Build

```bash
rpmbuild -bs my-package.spec  # Creates .src.rpm
```

### 5. RPM Build

```bash
mock -r fedora-43-x86_64 --srpm my-package.src.rpm
mock -r fedora-43-x86_64 --build my-package.src.rpm
```

### 6. Signing

```bash
rpmsign --addsign *.rpm
```

### 7. Upload

```bash
aws s3 sync output/ s3://bucket/repo/
createrepo_c --update .
```

## Storage Layout

```
r2://repo-james-rc/
├── public.gpg                          # GPG public key
├── repo/
│   ├── fedora-43-x86_64/
│   │   ├── my-package-1.0.0-1.fc43.x86_64.rpm
│   │   └── repodata/
│   │       ├── repomd.xml
│   │       ├── primary.xml.gz
│   │       └── ...
│   ├── almalinux-10-x86_64/
│   ├── almalinux-10-x86_64_v2/
│   ├── almalinux-10-aarch64/
│   ├── centos-stream-10-x86_64/
│   └── centos-stream-10-aarch64/
└── sources/                           # Lookaside cache
    ├── glib/
    │   └── glib-2.80.0.tar.xz
    └── ...
```

## Security

### GPG Signing

- Dedicated subkey for RPM signing
- Private key stored in GitHub Secrets
- Imported at build time
- All RPMs signed before upload

### Network Access

- R2 accessed via AWS CLI with scoped credentials
- Worker can add IP allowlisting
- CDN provides DDoS protection

## Retention Policy

The cleanup script (`scripts/cleanup.py`):

- Runs after each build
- Keeps latest 3 versions of each package
- Saves storage costs
- Configurable via `--keep` flag

## Multi-Architecture

### x86_64 Builds

- Standard runners: `ubuntu-latest`
- Native execution

### ARM64 Builds

- Free runners: `ubuntu-latest-arm64`
- Native execution on ARM
- Pre-installed QEMU in container for compatibility

### x86_64_v2

- Builds with SSE4.2/AVX2 optimizations
- Compatible with modern x86_64 CPUs
- Falls back gracefully on older CPUs

## Local Development

### Using justfile

```bash
# Build single target
just build fedora-43-x86_64

# Build all x86_64
just build-x86_64

# Build all targets
just build-all

# Publish to R2
just publish fedora-43-x86_64
```

### Using Container Script

```bash
./scripts/build-local.sh <package> <target>
```

## Dependencies

### Runtime

- `mock`: Chroot package builder
- `createrepo_c`: Repository metadata generator
- `rpm-sign`: RPM signing tool

### Build

- `rpm-build`: RPM building tools
- Distribution-specific mock configs

### Storage

- Cloudflare R2
- AWS CLI for S3 operations
