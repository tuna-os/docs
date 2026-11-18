---
sidebar_position: 16
title: "TIDEFORGE ACTION CACHE"
---

Tideforge identifies a package build by declared inputs, not by workflow runs.
The action key covers the recipe directory, target, and architecture. It also
includes the target contract, dependency slice, and the digest of the OCI
build image. Finally, it covers the renderers, dependency keys, and the
reproducibility contract with `SOURCE_DATE_EPOCH`.

The engine hashes only renderer inputs that a target uses. A change to the
Debian assembler does not invalidate RPM, Arch, or openSUSE actions. The engine
resolves every build image to an `image@sha256` digest before it generates the
key.

An ActionResult records the action key and each artifact's safe basename,
byte size, and SHA-256. Restore verifies the requested key, schema, unique safe
filenames, sizes, and hashes before a result may skip compilation. Lint,
clean-install, and smoke validation still run on hits.

GitHub Actions cache is an acceleration transport. Workflows restore before
compilation and save only after all validation; the cache action never saves
implicitly. R2 uses `actions/sha256/<action-key>.json` as the authoritative
result index and `blobs/sha256/<artifact-digest>` for immutable content. A
lease for an action key is at `leases/sha256/<action-key>.json`. Only jobs
on the protected `main` branch can publish trusted results to R2. They write
the blobs first and the ActionResult last.

## Authoritative CAS promotion and lease contract

1. **CAS layout**:
   - `actions/sha256/<action-key>.json`: the ActionResult. It is the commit marker.
   - `blobs/sha256/<artifact-digest>`: the artifact bytes, by digest.
   - `leases/sha256/<action-key>.json`: the lease for an action key.

2. **Leases**:
   - A worker gets a lease of 30 to 45 minutes before it builds or promotes (`scripts/tideforge-action-cache.py acquire-lease`).
   - A worker needs a valid lease to promote to the CAS.
   - When a lease expires, other workers look for a valid ActionResult.

3. **Order of the commit**:
   - The promote step verifies each blob, then writes it (`blobs/sha256/<digest>`).
   - The promote step writes the ActionResult (`actions/sha256/<action-key>.json`) last.
   - Thus, when an ActionResult is in the CAS, each blob that it refers to is also there.

4. **Promotion behind the factory boundary**:
   - Publication reads the ActionResults, verifies the digests and copies the bytes into the repository indexes.
   - Builds on the protected `main` branch publish the ActionResults and blobs to R2.

## CAS garbage collection

CAS reachability and garbage collection operates as a report-only mark-and-sweep
subsystem (`scripts/cas_gc.py`, #430 step 5). It marks reachable blobs from retained ActionResults and active repository
metadata. It applies an age grace period (default 7 days). It records
tombstones for sweep candidates without deletion of live content. See [CAS-GARBAGE-COLLECTION.md](https://github.com/tuna-os/tunaos-packages/blob/main/docs/CAS-GARBAGE-COLLECTION.md)
for the full specification and tombstone format.

## Reproducibility verification and quarantine

The reproducibility verifier monitors the cache-reuse contract: identical
inputs must return a verified result and skip compilation. For each sampled
cell, the job builds twice from canonical inputs and compares the artifact
digests. The verifier skips cells from the build chain: a chain can take the full
six-hour limit, so two builds cannot finish in one job.

The report job adds each divergent cell to `manifests/reproducibility-quarantine.yaml`.
On a cache hit, `package-factory-cell.yml` runs
`tideforge-action-cache.py quarantine-check`. A quarantined cell discards the
cached result and builds again. The report records aggregate rates (% reproducible per engine and
format) in `docs/reproducibility-status.json`. `scripts/factory-status.py`
shows them in `docs/FACTORY-STATUS.md`.
