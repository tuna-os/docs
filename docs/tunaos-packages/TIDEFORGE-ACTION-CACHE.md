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
result index and `blobs/sha256/<artifact-digest>` for immutable content. Protected
main jobs alone may publish trusted R2 results, writing blobs first and the
ActionResult last.
