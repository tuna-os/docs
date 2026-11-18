---
sidebar_position: 8
title: "PROVENANCE ADMISSION"
---

This is a proposal, **not an enforced publication policy**. Now,
`tuna-os/docs` serves the production catalog; application workflows can write
it directly. The owner and publication entry point remain open decisions in
[#171](https://github.com/tuna-os/flatpak-index/issues/171) and
[#168](https://github.com/tuna-os/flatpak-index/issues/168). The shared
`publish-flatpak-index` action, the `update-flatpak-index` action, and vendored
`update-index.py` copies are distinct paths. An admission check in only this
repository would not stop the other writers or protect deployment.

## Candidate contract

- The eventual reviewed publisher only accepts entries from an explicit,
  review-controlled mapping. It maps app/ref and registry repository to
  producer repository, release workflow, permitted source refs, architectures,
  and self-hosted runner policy. Each project's maintainers must decide if they
  trust the release runner of that project. Do not assume all self-hosted
  runners are acceptable or categorically reject them without that decision.
  Policy changes need independent review, and the app that publishes must not
  supply them.
- Resolve any tag once to the exact raw bytes of the manifest and their sha256
  digest. Verify a producer attestation that is cryptographically valid. Verify
  that it is for that *same digest*, the expected producer repository and
  workflow, and an allowed source ref. The check fails closed if an attestation
  is missing, malformed, unverifiable, or has the wrong repository, workflow or
  ref. Never verify a tag and later re-resolve it for publication. Confirm that
  the verifier binds the subject, the signer and the ref. Before you enable
  enforcement, test the verifier against real producer attestations.
- If the attested root is an OCI index, verify every selected child manifest
  against its descriptor digest. Before you read labels, verify each config
  blob against its descriptor digest. For a single manifest, verify its config
  in the same way. Reject malformed or unsupported digests, fetch failures and
  byte mismatches; do not skip a private or missing image. Preserve each
  distinct Flatpak ref, branch and architecture, including installer frontends,
  and both Flatpak and AppStream labels. Scope replacement to the allowed app
  and ref so one producer cannot replace another producer's entries.
- Build and validate the entire candidate, but do not change the live catalog.
  On any failure, make sure the previous production artifact is still
  available. Deploy only the complete validated candidate using the selected
  publication mechanism.
  Audit the served artifact and retain an operator rollback path. Restrict all
  alternate write paths, or they bypass admission entirely.

The [Frostyard implementation](https://github.com/frostyard/flatpak-index/blob/ff27263767e7d95fc777a24592c1d5ff85931b82/scripts/build-index.py)
shows how to verify a root attestation and hash child/config bytes. This
proposal does not adopt its missing/private-image skip or its blanket
self-hosted-runner denial. Producer provenance is not a Flatpak client
signature: it does not authenticate the catalog to clients. This document
asserts no cosign signature of the current index. Reproducible rebuilds can
provide additional evidence but are not a substitute for client trust or
provenance verification.

## Current partial protection and verification needed

The metadata auditor uses the `oci.py` registry helper. This helper checks the
raw sha256 bytes of digest-addressed manifests and configs before it parses
them. A tag passed as a manifest reference remains mutable, and this check does
not authenticate it. This is an integrity check against the caller's digest,
**not** an attestation, an admission gate, or a check on the local OCI layout
read by `update-index.py`. You also must not treat the repair command as an
atomic production publisher.

Before you roll out the proposed gate, inventory and migrate all production
writers, select and protect the publisher, and agree the per-project policy.
Exercise missing/wrong attestations and tampered bytes, valid releases with
multiple refs/branches/architectures, and failed updates that leave the prior
catalog untouched. Run the complete affected publisher and registry test
modules. Then use a disposable Flatpak remote in user scope to run `remote-ls`
and a no-deploy installation against the candidate, but do not publish it.
Finally verify the served endpoint after a separately authorized deployment.
The local registry tests on their own do not establish this end-to-end
behavior.
