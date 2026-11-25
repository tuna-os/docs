---
sidebar_position: 6.5
sidebar_label: "Verifying downloads"
title: "Verify TunaOS downloads and images"
description: "Verify the image behind a TunaOS ISO, inspect Software Bills of Materials (SBOMs), and check keyless signatures with cosign."
---

# Verify TunaOS Downloads and Images

TunaOS gives you several ways to check what you downloaded. This guide covers the signatures from Cosign and the Software Bills of Materials (SBOMs). It applies to ISOs, container images, and package repositories.

---

## 1. Verify an ISO

TunaOS has no prebuilt ISOs, so the download server has no ISO checksum files.
TunaOS Media Writer or the [ISO builder](https://iso.tunaos.org) makes the ISO
from a container image on GitHub Container Registry (GHCR). To check what went
into your ISO, verify the signature of that container image. See
[section 2](#2-verify-container-image-signatures-with-cosign).

---

## 2. Verify Container Image Signatures with Cosign

TunaOS signs its container images with [Sigstore Cosign](https://github.com/sigstore/cosign). The signatures are keyless: GitHub Actions makes them through OpenID Connect (OIDC).

### Install Cosign

Install `cosign` using Homebrew or your package manager:

```bash
brew install cosign
```

### Verify Keyless Signatures

To check an official image against the identity that GitHub Actions signs with:

```bash
cosign verify \
  --certificate-identity-regexp "https://github.com/tuna-os/" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/tuna-os/albacore:latest
```

When valid, `cosign` prints the certificate claims, issuer URL, and confirmation that the signature is valid.

### Verify with the Public Key

TunaOS also provides a `cosign.pub` public key in the root of the [TunaOS repository](https://github.com/tuna-os/tunaOS).

To verify with `cosign.pub`:

```bash
# Download the public key
curl -O https://raw.githubusercontent.com/tuna-os/tunaOS/main/cosign.pub

# Verify the container image
cosign verify --key cosign.pub ghcr.io/tuna-os/albacore:latest
```

### Verify Repository Metadata Signatures (Cloudflare R2)

TunaOS hosts its RPM and DEB repositories on Cloudflare R2, keyless-signed. You can check a metadata blob such as `repomd.xml` on its own:

```bash
cosign verify-blob \
  --key cosign.pub \
  --signature repomd.xml.sig \
  repomd.xml
```

---

## 3. Inspect Software Bills of Materials (SBOM)

TunaOS attaches an SPDX / CycloneDX SBOM to container images during the build workflow. You can inspect the list of included packages and dependencies or scan for vulnerabilities.

### Download the Image SBOM

Use `cosign` to download the embedded SBOM:

```bash
cosign download sbom ghcr.io/tuna-os/albacore:latest > albacore-sbom.json
```

### Inspect Packages with Syft

Use [Syft](https://github.com/anchore/syft) to inspect packages in the image:

```bash
# Install syft
brew install syft

# View package list
syft ghcr.io/tuna-os/albacore:latest
```

### Scan for Vulnerabilities with Grype

Use [Grype](https://github.com/anchore/grype) to scan the downloaded SBOM or container image:

```bash
# Install grype
brew install grype

# Scan the SBOM file
grype sbom:albacore-sbom.json

# Or scan the container image directly
grype ghcr.io/tuna-os/albacore:latest
```

---

## 4. Secure Boot and UEFI Validation

The official base images use signed shim loaders and kernels. The signature comes from the Microsoft UEFI CA, or from an upstream distribution key (AlmaLinux, Red Hat, Canonical, Debian).

To check Secure Boot status and enroll MOK keys on installed systems, see the [Secure Boot & UEFI Guide](./secure-boot.md).

---

## Related Documentation

- [Download and install](/download)
- [Secure Boot & UEFI Guide](./secure-boot.md)
- [Manage images with bootc](./tunaos/bootc-usage.md)
- [TunaOS Security Policy](./tunaos/SECURITY.md)
