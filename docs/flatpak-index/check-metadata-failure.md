---
sidebar_position: 10
title: "check metadata failure"
---

`check-metadata.yml` is the only production health check that this repository
owns. The workflow runs every day at 06:17 UTC and by manual request. It audits
the served Flatpak remote against the registry and against the production
catalog declaration.

This runbook explains what the check validates, how to read a red run, and who
fixes each failure.

## What the check validates

The workflow downloads the served index and the production declaration, then
runs these checks in this order:

```sh
curl -sSfL -o served-index.json https://tunaos.org/flatpak/index/static
curl -sSfL -o expected-apps.json https://tunaos.org/flatpak/expected-apps.json
python3 scripts/catalog.py expected-apps.json --readme README.md --index served-index.json
./scripts/enrich-index.py served-index.json --check
FLATPAK_INDEX_FILE=served-index.json python3 -m unittest tests/test_index.py -v
```

`catalog.py` compares the served index and the README with
`expected-apps.json`. It reports a served registry or app ID that the
declaration does not list. It reports a declared pair of app ID and
architecture that the remote does not serve. It also reports README install IDs
that differ from the declaration.

`enrich-index.py --check` audits every digest in the served index. For each
digest, it reads the AppStream labels that the registry publishes. It does not
read `expected-apps.json`. It reports a failure when an entry lacks metadata
that software centres need. It prints warnings for entries that install
correctly but show an empty frame in a software centre.

`tests/test_index.py` checks the structure of the served index: digests, media
types, Flatpak labels, image sizes, and the AppStream catalogue.

A red run means at least one check failed. The workflow stops at the first
step that fails, so a later check may not have run. The check reads the served
index from `tuna-os/docs`, not from this repository. A failure may mean that the
production index is stale. It may not mean a fault in this repository.

## What the check does not validate

The check does not install an application. It does not confirm that a registry
tag still points at the digest that the served index records.

## Read a red run

Find the step that failed first. The step name tells you which check failed.

For `catalog.py`, each line shows one difference. For
`enrich-index.py`, a red run prints lines that start with `!` for failures and
`~` for warnings. Read the `!` lines first. Each line names an application and
an architecture. Match each failure to one root cause below. The fix lives in a
different repository for each cause.

### Catalog mismatch

Symptom: `catalog.py` prints `undeclared registry entry`, `invalid or
undeclared ref`, `missing <id> on <arch>`, or a README difference.

An app reached the remote without a declaration, or a declared app is not on
the remote, or the README table differs from the declaration. Update
`static/flatpak/expected-apps.json` in `tuna-os/docs`, or the README table in
this repository. See
[Keep the advertised catalog in sync](https://github.com/tuna-os/flatpak-index/blob/main/docs/APP-LIFECYCLE.md#keep-the-advertised-catalog-in-sync).

### Wrong registry

Symptom: `enrich-index.py` prints `index names registry <value>, expected
'https://ghcr.io'` and stops. It reads no labels.

The served index names a registry that is not GHCR. Flatpak pulls each image
from the registry that the index names. This is not a deployment lag. Do not
wait.

Find the commit in `tuna-os/docs` that changed the `Registry` field. Undo that
change. If no maintainer made that change, replace the index write token.

### Stale served index

Symptom: the run prints `image(s) are missing labels present in the registry`.
The registry has these labels. The production index in `tuna-os/docs` has no
new publish yet, or the Cloudflare Pages deploy has not finished.

This is a deployment lag. It is not a metadata fault. Wait for the next publish
of `tuna-os/docs`. Wait for the Pages deploy to propagate. Re-run the check after
the deploy. If the run stays red, read the other root causes.

### Missing metadata

Symptom: the run prints `image has no AppStream metadata (...); it needs a
metainfo file`. The application image lacks the labels that build the remote's
AppStream catalogue.

Fix the metainfo and icon of the application in its own repository. Publish a
new OCI image. The updater replaces the entry for the same architecture. Re-run
the served-index audit.

### Registry read error

Symptom: the run prints `could not read labels -- <error>`. The check could not
read the labels for a digest.

Check the `REGISTRY_TOKEN` secret. Confirm the digest still exists in the
registry, and a new publish replaces it. If the error repeats, the registry may
be unavailable. Wait, and re-run.

### Malformed catalogue

Symptom: the run prints `AppStream catalogue does not parse`. The application
has metainfo XML that the parser cannot read.

Fix the metainfo XML in the application repository. Publish a new image, and
re-run the served-index audit.

## Escalation

1. Re-run the check to prove the failure is real. A propagation delay clears on
   the next run.
2. Read the output of the failed step. Match each failure to a root cause.
3. Route the fix:
   - Catalog mismatch: update the declaration in `tuna-os/docs` or the README
     table here. Owner: the person who adds, renames, or retires the app.
   - Wrong registry: undo the `Registry` change in `tuna-os/docs`. Owner: the
     index operator.
   - Stale served index: redeploy `tuna-os/docs`. Owner: the deployer.
   - Missing metadata or malformed catalogue: fix the application repository.
     Owner: the application maintainer.
   - Registry read error: check the token, or wait for the registry. Owner: the
     index operator.
4. Re-run the served-index audit after the fix. A green run proves the fix.

This repository does not own the production index or the deploy. Do not edit
`tuna-os/docs/static/flatpak/index/static` directly. Make the change through the
normal review path in the application repository or `tuna-os/docs`.
