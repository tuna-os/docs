---
sidebar_position: 12
title: "TIDEFORGE ACTION CACHE"
---

Tideforge identifies a package build by canonical declared inputs rather than a
workflow run. The key covers the complete recipe directory, selected target and
architecture, the selected target's contract and dependency-capability slice,
the immutable OCI build-image digest, the package-format renderer set, dependency
action keys, and the reproducibility contract including SOURCE_DATE_EPOCH.

Only renderer inputs used by a target are hashed: a Debian assembler change does
not invalidate RPM, Arch, or openSUSE actions. Every build image is resolved to
an image@sha256 digest before key generation.

An ActionResult records the exact action key plus every artifact's safe basename,
byte size, and SHA-256. Restore verifies the requested key, schema, unique safe
filenames, sizes, and hashes before a result may skip compilation. Lint,
clean-install, and smoke validation still run on hits.

GitHub Actions cache is an acceleration transport. Workflows restore before
compilation and save only after all validation; the cache action never saves
implicitly. R2 uses `actions/sha256/<action-key>.json` as the authoritative
result index and `blobs/sha256/<artifact-digest>` for immutable content. A
lease for an action key is at `leases/sha256/<action-key>.json`. Only jobs
on the protected main branch can publish trusted R2 results. They write
the blobs first and the ActionResult last.

## Authoritative CAS promotion and lease contract

1. **CAS layout**:
   - `actions/sha256/<action-key>.json`: the ActionResult. It is the commit marker.
   - `blobs/sha256/<artifact-digest>`: the artifact bytes, by digest.
   - `leases/sha256/<action-key>.json`: the lease for an action key.

2. **Leases**:
   - A worker gets a lease of 30 to 45 minutes before it builds or promotes (`scripts/tideforge-action-cache.py acquire-lease`).
   - A worker without a valid lease cannot promote to the CAS.
   - When a lease expires, other workers look for a valid ActionResult.

3. **Order of the commit**:
   - The promote step verifies each blob, then writes it (`blobs/sha256/<digest>`).
   - The promote step writes the ActionResult (`actions/sha256/<action-key>.json`) last.
   - Thus, when an ActionResult is in the CAS, each blob that it refers to is also there.

4. **Promotion behind the factory boundary**:
   - Publication reads the ActionResults, verifies the digests and copies the bytes into the repository indexes.
   - Builds on the protected main branch publish ActionResults and blobs to R2.
