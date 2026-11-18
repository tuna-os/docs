---
sidebar_position: 10
title: "GNOME50 REPO PUBLISH"
---

The GNOME 50 family index for EL10 is `https://repo.tunaos.org/gnome50/10-stream-x86_64/`.
The workflow `publish-build-chain-rpms.yml` writes it for `gnome50-el10-x86_64`.
The run publishes it as an OCI image, `ghcr.io/tuna-os/tunaos-packages:gnome50-el10-x86_64`,
with a cosign signature by digest (`docs/PACKAGE_FACTORY.md`, "Promotion contract").

## What was there before the first factory publish (2026-09-03)

The prefix was not empty and it was not factory output. The since-deleted
`refresh-gnome50-r2.yml` (runs 30926227247 and 30928751255, 2026-08-04)
downloaded the `jreilly1821/c10s-gnome-50` COPR and `rclone sync`ed it into
`bluefin/gnome50/10-stream-x86_64/` and `bluefin/repo/10-x86_64/`. Those RPMs
carry the signature of the COPR project key (`99b9f29ec528e021`).
A consumer that trusts `public.gpg` with `gpgcheck=1` cannot install them.
For example, tunaOS run 33750514082 failed because the public key was absent.

Meanwhile the factory cell `gnome50-el10-x86_64` had never published.
Its catalog `r2_path` was `repo/10-x86_64`, the tideforge mirror prefix.
The planner `scripts/plan-build-chain-publish.py` refuses this prefix because two
`rclone sync` writers into one prefix delete each other's packages.
Run 33751204743 stopped at plan for that reason. The weekly
build-chain run of 2026-08-30 (33303057118) had built 57 of the family's 58
packages across 19 tiers; the one failure was `input-remapper`'s spec
missing `BuildRequires: systemd-rpm-macros`.

Maintainer directive, 2026-09-03: nothing below GNOME 50 ships in tunaOS, and
no more COPR -- build in GitHub, consume like `projectbluefin/utah-packages`.

## What the publisher does now

1. `manifests/package-builds.yaml` gives `gnome50-el10-x86_64` its own prefix,
   `gnome50/10-stream-x86_64`, the shape `gnome51/` and `xfce/` already use.
2. The script `scripts/publish-rpm-wave.sh --evict-foreign` runs in the
   build-chain publisher. It removes RPMs whose header signature does not
   match the publisher key before index creation. Thus, the family prefix
   carries only packages that the factory built and signed. It refuses to
   evict files if the fresh wave does not show the publisher key. A wrong key
   derivation must not empty a served tree.
3. The sync then deletes the COPR mirror from the bucket. Next,
   `createrepo_c` indexes the factory tree and signs `repomd.xml`. Finally, the
   publisher pushes the tree as an OCI image whose digest tunaOS pins.

## How to (re)publish

Dispatch `Publish build-chain RPMs` with `cells=gnome50-el10-x86_64`,
`dry_run=false`. The build job builds the chain in the CentOS Stream 10 mock
root. It reuses the nightly banked partial where the action key matches.
The publish job executes the steps above, and the run summary prints the
image digest. `verify` then asserts every published package resolves from the
served index.

For installed systems the live endpoint stays `https://repo.tunaos.org`; the
OCI digest is the image build's input.
