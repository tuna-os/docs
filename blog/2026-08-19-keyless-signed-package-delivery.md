---
slug: keyless-signed-package-delivery
title: "How TunaOS ships trusted packages — keyless-signed RPM/DEB repos on Cloudflare R2"
authors: [james]
tags: [tunaos, sigstore, cosign, rekor, sbom, supply-chain, cloudflare, r2, bootc, immutable, packages, el10]
date: 2026-08-19
draft: true
---

<!-- ste-disable-file: supply-chain / platform-engineering content; supports the Chainguard collaboration angle (#1339) and the EL10 native RPM migration off Fedora COPR. -->

An immutable OS is only as trustworthy as the pipeline that builds it. TunaOS
is built around bootc — every desktop variant is a container image, updated
atomically on the upstream schedule. But containers are only half the story:
packages are how you extend a desktop without layering whole images. This
post is about how we ship those packages so that every artifact carries a
verifiable signature, a software bill of materials, and a public audit trail.

<!-- truncate -->

## The short version

- **Native repos, not COPR/PPA soup** — TunaOS rebuilds every package from
  source in a clean buildroot and publishes validated RPM (`rpm-md`) and DEB
  (APT) repositories to **Cloudflare R2**, retiring the Fedora COPR
  compatibility path from GNOME 51 onward.
- **Keyless signing with Sigstore/cosign** — nothing signs with a stored
  private key. GitHub Actions OIDC identity is the key, and every signature
  lands in the **Rekor transparency log**.
- **SBOMs + provenance on every artifact** — SPDX SBOM attestations are
  generated and attached at publish time, so verification is a two-command
  exercise instead of a leap of faith.

## Why a package factory at all?

TunaOS's desktop variants are assembled from container images that pull in
desktop environments on the EL10 (AlmaLinux/CentOS Stream) base. Backporting
desktop software to that base — GNOME 51, COSMIC, Pantheon, and friends —
means packaging software that the base distro doesn't ship, and packaging it
in a way that survives an *immutable* host: no hand-rolled COPR repos living
on some engineer's laptop.

The [tuna-os/tunaos-packages](https://github.com/tuna-os/tunaos-packages)
repository is the source-controlled factory for that work. It builds and
signs packages in GitHub Actions, tests them against declared distro targets,
and publishes **only validated repositories** to R2.

## The promotion contract

A package doesn't just get uploaded. Every candidate has to:

1. Build in the target buildroot with only the declared build dependencies
2. Pass package tests and lint checks on the built artifact
3. Install from an **ephemeral** staged repository into a clean container
4. Pass a command/file/service smoke test — including session-affecting
   packages like desktop shells
5. Only then get **signed and promoted** to the stable R2 path

The split-package contract is even enforced: a runtime/dev split like
`xfconf` proves both halves install independently, the dev half pulls in the
runtime half, and no headers leak into the runtime half.

Upstream source is treated as input data, not as a repo to enable: before
importing a package, its upstream commit/tag, license, patches, and target
compatibility are recorded — and TunaOS **never enables an upstream COPR,
PPA, or binary repository inside a produced image**. If a binary isn't good
enough to rebuild, it doesn't ship.

## Keyless signing

The supply-chain standard here is Sigstore. All TunaOS images are signed with
**cosign keyless signing (OIDC)** — there is no long-lived signing key to
leak or rotate. The GitHub Actions workflow identity itself is the
certificate:

```bash
cosign verify \
  --certificate-identity https://github.com/tuna-os/tunaOS/.github/workflows/reusable-build-image.yml@refs/heads/main \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  ghcr.io/tuna-os/yellowfin:gnome
```

Every signature is published to the **Rekor transparency log**, which means
the whole history of what was signed, by which workflow, at which time, is
public and tamper-evident — you can audit the past even if you never ran a
verification yourself.

## SBOMs, provenance, and verification

Alongside signatures, every published image carries **SPDX SBOM
attestations** and provenance bundles generated at build time. The same
discipline is rolling out across artifacts:

- **ISOs and installer payloads** ship checksum + SBOM verification bundles
  (see [VERIFY-ARTIFACTS.md](https://github.com/tuna-os/tunaOS/blob/main/docs/VERIFY-ARTIFACTS.md))
- The **bootc-installer-asahi** catalog only offers images that pass a
  golden-manifest verification harness — 36/36 checks per image
- The package factory's R2 repositories are only promoted after clean-build,
  clean-install, and smoke-test gates above

The result: a user verifying a download, an image, or an RPM has a short,
repeatable path from *"some file on the internet"* to *"signed by the TunaOS
CI at a specific commit, with a published SBOM"*.

## What this enables

- **Enterprise adoption** — procurement and security teams get real
  artifacts: signatures, SBOMs, transparency logs, and a source policy that
  forbids third-party binary repos. This is the story we tell in
  [ADOPTERS.md](https://github.com/tuna-os/tunaOS/blob/main/ADOPTERS.md)
  discussions with evaluation orgs.
- **Platform-engineering credibility** — TunaOS already targets the
  DevOps/platform crowd (bootc, container-native desktop, Corral VMs); a
  verifiable package supply chain is the missing piece that makes immutable
  desktops defensible in a regulated environment.
- **A collaboration surface** — keyless signing means we live in the same
  Sigstore ecosystem as everyone else doing this well. If you work on
  supply-chain tooling — cosign, Rekor, SBOM tooling, RPM repo hardening —
  TunaOS is a real-world bootc/EL10 consumer looking for partners.

## Try it

Grab an ISO or pull an image from the [download
page](https://tunaos.org/), verify it with cosign, and run a `dnf`/`apt`
update against the R2 repos. If verification *isn't* a two-command exercise
somewhere, that's a bug — file it in
[tuna-os/tunaos](https://github.com/tuna-os/tunaOS/issues) and we'll fix the
pipeline, not the docs.

---

*Cross-post idea: this is the Sigstore/Chainguard-ecosystem angle of the
TunaOS story — see tunaOS#1339. Draft for maintainer review; publish after
the EL10 native RPM repo (GNOME 51) is live in production.*
