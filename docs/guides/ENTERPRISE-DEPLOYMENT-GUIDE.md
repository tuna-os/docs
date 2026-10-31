---
sidebar_position: 3
title: Enterprise Deployment Guide
description: Deploy and manage TunaOS across a fleet of enterprise laptops and desktops with signed images, rollback, and fleet tooling.
---

# Enterprise deployment

TunaOS gives IT operations a container-managed base image for a fleet of laptops and desktops. Every machine runs the same signed image. The system files stay read-only. Updates are atomic. You can roll back a bad update in one step.

This guide covers management of fleets, compliance audits, and scale for 100 or more systems. For a thin-client and remote-workspace layout, see the [Enterprise VDI guide](/docs/guides/ENTERPRISE-VDI-DEPLOYMENT).

## Fleet management

TunaOS images live in a container registry. The public images use this path:

```
ghcr.io/tuna-os/<variant>
```

Replace `<variant>` with the variant name. Use `albacore` or `yellowfin` for example.

You have three ways to manage the fleet:

1. **Pull signed images from the public registry.** Each machine runs `bootc upgrade` on a timer. bootc pulls the signed image and installs it atomically.
2. **Mirror the registry in your network.** Copy the images to a registry you control. Machines pull from the mirror. This keeps updates fast and offline-ready.
3. **Build custom images in your build pipeline.** Add your tools to a base image with a `Containerfile`. The build signs the image. Every machine then gets the same custom image.

Use the [Corral](/docs/corral/index) platform to manage many machines from one console. Corral shows your fleet in one list. You can start, stop, and update guests from the web app or the mobile app.

Set an image policy on each machine. The machine checks the image signature before it boots an update. This stops unsigned images from boot.

### Update cadence

TunaOS publishes several image tags. Choose the tag that fits your stability need:

- **daily** — the latest build. For testers only.
- **weekly** — the most stable build of the week. For regular users.
- **lts** — a quarterly snapshot. TunaOS recommends this tag for enterprise deployments. The `lts` tag means long-term support.

Test a new tag on a small pilot group first. Watch it for one or two weeks. Then roll the tag out to the whole fleet. Stagger the rollout in batches. This limits the impact if a build has a problem.

## Compliance tracking

Enterprise audits need proof. TunaOS gives you three kinds of evidence:

- **Signed artifacts.** TunaOS signs every image keylessly with [Sigstore Cosign](https://github.com/sigstore/cosign). There is no long-lived verification key to steal. The build uses the short-lived identity of the CI workflow. See the [security policy](/docs/tunaos/SECURITY) for details.
- **SBOM attestations.** Each image ships with a signed Software Bill of Materials (SBOM). The SBOM lists every package in the image.
- **Pinned base images.** TunaOS builds from base images that use explicit digests. The build blocks if a base image changes.

### Verify a rollback

Every update keeps the previous deployment on disk. The boot menu shows two entries. If a new build breaks a tool, you roll back:

```bash
sudo bootc rollback
sudo systemctl reboot
```

Then verify the rollback:

```bash
bootc status
```

The output shows the image digest. Compare it to the digest you expect. This gives you a logged and verifiable rollback for audit. See the [rollback guide](/docs/bootc-rollback) for the full flow.

### Pin a known-good image

To hold a fleet on one verified image, pin it by digest:

```bash
skopeo inspect docker://ghcr.io/tuna-os/albacore:lts | jq '.Digest'
sudo bootc switch ghcr.io/tuna-os/albacore@sha256:...
```

Image digest pins stop auto updates. You resume updates when you return to the tag.

## Sizing for 100+ systems

Plan three things before you roll out the fleet:

- **Registry storage.** A base image is a few gigabytes. A mirror holds a copy per tag you keep. Plan for the tags you use, for example the weekly and lts tags.
- **Network bandwidth.** If 200 machines pull at once, they use 200 times the download rate. A local mirror removes this spike. Schedule updates off the workday.
- **Update cadence.** Batch the rollout. Deploy to one department per day. Watch for problems before the next batch.

Start with a pilot of 10 to 20 machines. Measure pull time, update time, and problem rate. Then size the mirror and the support workload from those numbers.

## Further reading

- [Choose a variant](/docs/choosing-a-variant) — pick a base OS for your fleet.
- [Enterprise VDI deployment](/docs/guides/ENTERPRISE-VDI-DEPLOYMENT) — thin-client and remote layouts.
- [bootc resources](/docs/bootc-resources) — how image updates work under the hood.
- [FAQ](/docs/faq) — common operations questions.
