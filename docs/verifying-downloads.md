---
sidebar_position: 6.5
sidebar_label: "Verifying downloads"
title: "Verify TunaOS downloads and images"
description: "Verify ISO checksums, inspect Software Bills of Materials (SBOMs), and check keyless signatures with cosign on TunaOS."
---

# Verify TunaOS Downloads and Images

TunaOS gives you several ways to check what you downloaded. This guide covers checksums, Software Bills of Materials (SBOMs), and Cosign signatures. It applies to ISO downloads, container images, and package repositories.

---

## 1. Verify ISO Checksums (SHA-256)

Not every ISO category on the download server publishes a checksum file today. The [download page](/download) shows a **checksums** link for each category that has one, and no link for a category that does not. The `tacklebox` category is the one that publishes checksums now; the main `live-isos` lineup does not yet.

:::note[No checksum file for your ISO?]
Where no checksum file exists, the strongest check available is the Cosign signature on the container image the ISO was built from. See [section 2](#2-verify-container-image-signatures-with-cosign).
:::

### Verify on Linux and macOS

1. Open the [download page](/download), then select the **checksums** link for the category you downloaded from. That link gives you the exact file to fetch. Its name carries a date and a build hash:
   ```bash
   curl -O https://download.tunaos.org/tacklebox/bazzite-gnome-latest.iso
   curl -O https://download.tunaos.org/tacklebox/bazzite-gnome-SHA256SUMS-20260902-b37b7a2
   ```

2. Check the ISO against the list:
   ```bash
   sha256sum -c bazzite-gnome-SHA256SUMS-20260902-b37b7a2 --ignore-missing
   ```

   A good file gives you this output:
   ```text
   bazzite-gnome-latest.iso: OK
   ```

3. To print the hash and compare it yourself:
   ```bash
   sha256sum bazzite-gnome-latest.iso
   ```

### Verify on Windows (PowerShell)

Run `Get-FileHash` in PowerShell:

```powershell
Get-FileHash .\albacore-gnome-latest.iso -Algorithm SHA256
```

Compare the printed hash string with the hash in the `SHA256SUMS` file.

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

TunaOS also provides a `cosign.pub` public key in the root of the [tunaOS repository](https://github.com/tuna-os/tunaOS).

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

- [Installation Guide](./installation.md)
- [Secure Boot & UEFI Guide](./secure-boot.md)
- [Manage images with bootc](./tunaos/bootc-usage.md)
- [TunaOS Security Policy](./tunaos/SECURITY.md)
