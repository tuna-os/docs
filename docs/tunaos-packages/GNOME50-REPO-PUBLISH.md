---
sidebar_position: 7
title: "GNOME50 REPO PUBLISH"
---

The GNOME 50 family index for EL10 is `https://repo.tunaos.org/gnome50/10-stream-x86_64/`,
written by `publish-build-chain-rpms.yml` for the cell `gnome50-el10-x86_64`
and published in the same run as an OCI image, `ghcr.io/tuna-os/tunaos-packages:gnome50-el10-x86_64`,
cosign-signed by digest (`docs/PACKAGE_FACTORY.md`, "Promotion contract").

## What was there before the first factory publish (2026-09-03)

The prefix was not empty and it was not factory output. The since-deleted
`refresh-gnome50-r2.yml` (runs 30926227247 and 30928751255, 2026-08-04)
downloaded the `jreilly1821/c10s-gnome-50` COPR and `rclone sync`ed it into
`bluefin/gnome50/10-stream-x86_64/` and `bluefin/repo/10-x86_64/`. Those RPMs
carry the COPR project key's signature (`99b9f29ec528e021`, vendor
"Fedora Copr - user jreilly1821"), so a consumer that trusts `public.gpg` with
`gpgcheck=1` cannot install a single one of them -- tunaOS run 33750514082
failed on exactly that: `GPG check FAILED ... Public key for
glib2-2.88.0-4.el10.x86_64.rpm is not installed`.

Meanwhile the factory's own `gnome50-el10-x86_64` cell had never published:
its catalog `r2_path` was `repo/10-x86_64`, the tideforge mirror prefix, which
`scripts/plan-build-chain-publish.py` refuses by name because two
`rclone sync` writers into one prefix delete each other's packages
(run 33751204743 was refused at plan for that reason). The weekly
build-chain run of 2026-08-30 (33303057118) had built 57 of the family's 58
packages across 19 tiers; the one failure was `input-remapper`'s spec
missing `BuildRequires: systemd-rpm-macros`.

Maintainer directive, 2026-09-03: nothing below GNOME 50 ships in tunaOS, and
no more COPR -- build in GitHub, consume like `projectbluefin/utah-packages`.

## What the publisher does now

1. `manifests/package-builds.yaml` gives `gnome50-el10-x86_64` its own prefix,
   `gnome50/10-stream-x86_64`, the shape `gnome51/` and `xfce/` already use.
2. `scripts/publish-rpm-wave.sh --evict-foreign` (passed only by the
   build-chain publisher) removes every RPM in the synced-down tree whose
   header signature is not by the publisher's key before indexing, so the
   family prefix carries only what the factory built and signed. It refuses
   to evict anything if the freshly signed wave itself does not read as the
   publisher's own -- a wrong key-id derivation must not empty a served tree.
3. The sync-up then deletes the COPR mirror from the bucket, `createrepo_c`
   indexes the factory tree, `repomd.xml` is detach-signed, and the same tree
   is pushed as the OCI image whose digest tunaOS pins.

## How to (re)publish

Dispatch `Publish build-chain RPMs` with `cells=gnome50-el10-x86_64`,
`dry_run=false`. The build job builds the chain in the CentOS Stream 10 mock
root (resuming the nightly's banked partial where the action key matches),
the publish job does the steps above, and the run summary prints the image
digest. `verify` then asserts every published package resolves from the
served index.

For installed systems the live endpoint stays `https://repo.tunaos.org`; the
OCI digest is the image build's input.
