---
sidebar_position: 4
title: "APP LIFECYCLE"
---

This repository contains index tooling and checks. The
`tunaos-org` Cloudflare Worker serves the production remote from `tuna-os/docs`
at `https://tunaos.org/flatpak/`. Follow this distinction for every lifecycle
change.

## Before changing an application

- Identify app ID, GHCR repository, supported architectures, current channel,
  and source revision.
- Work in the application repository for source, manifest, metainfo, and
  publisher workflow changes.
- Treat `tuna-os/docs/static/flatpak/index/static` as production. This repository
  no longer retains a local `index/static` snapshot.
- Keep `FLATPAK_INDEX_TOKEN` scoped to `tuna-os/docs` as documented in the
  publish workflow. Never put token values in commands or documentation.

## Add an application

1. Add the app's Flatpak manifest, metainfo, and icon in its application
   repository. Use the metadata and screenshot guides in this repository.
2. Configure the application publisher to build an OCI layout, push the image
   to GHCR, and update the production index. Prefer the shared
   `tuna-os/.github/actions/update-flatpak-index` action. If using the vendored
   script, pass:

   ```sh
   python3 .github/scripts/update-index.py \
     --oci-dir <app>.oci \
     --index-file index-repo/static/flatpak/index/static \
     --repo-name tuna-os/<app> \
     --require-appstream \
     --tags latest
   ```

3. Review the application change and publisher output together. The index
   entry must carry both Flatpak labels and AppStream labels.
4. Verify production after publication:

   ```sh
   curl -sSfL -o served-index.json \
     https://tunaos.org/flatpak/index/static
   ./scripts/enrich-index.py served-index.json --check
   ```

   This audit reads registry labels for the digests already named in the
   served index. It reports missing metadata but does not change the file.

## Update an application

1. Change source, manifest, metainfo, screenshots, or release notes in the
   application repository.
2. Publish a new OCI image through the existing application workflow. The
   updater replaces the matching application entry for the same architecture;
   it does not rewrite unrelated applications.
3. Confirm the candidate has the intended app ID, immutable manifest digest,
   architecture, channel, and AppStream labels. Then push the production
   index.
4. Run the production verification commands above. Check the app entry and
   metadata from the served index, not only the local OCI directory.

For a reviewed candidate index, run
`scripts/update-index.py` with `--oci-dir`, `--index-file`, `--repo-name`, and
`--tags`. Remember that this checkout is not the production source.

## Pause publication

The current updater has no `--pause` operation. Do not silently delete an entry
or change an image tag to simulate a pause.

1. Open a reviewed maintenance decision naming the app ID, reason, owner,
   start date, and whether existing installs remain supported.
2. Coordinate the decision in the application repository and `tuna-os/docs`
   before you change production. Do not disable or alter a publisher workflow
   without maintainer approval.
3. If the decision changes the production index, update it in `tuna-os/docs`.
   Follow the normal review path and include the decision.
4. Run the served-index audit and record whether the app remains listed. A
   paused app must have an explicit reactivation or retirement owner; this
   repository does not automate that state.

## Retire an application

The current updater adds or replaces entries; it has no delete operation.
Retirement therefore needs a coordinated, reviewed production change.

1. Confirm the app ID, GHCR image, publisher workflow, supported users, and
   replacement or end-of-life notice.
2. Stop future publisher updates through the application repository's normal
   maintainer-controlled process before you remove the production entry.
3. Remove the app entry in `tuna-os/docs` through review.
4. Run the served-index audit and verify the retired app is absent from the
   served index. Keep the retirement decision and date in the change record.

## Respond to a bad publication

A publication is bad when the served remote no longer matches the registry or
the documented catalog. Find it three ways: a drift check fails,
`enrich-index.py --check` reports missing or wrong metadata, or a user reports
`Nothing matches` for an app the remote should serve. Roll back to the last
known-good served index.

The `tunaos-org` Cloudflare Worker serves the production remote from `tuna-os/docs`, so a
rollback is a change to that repository, not this one. This checkout holds no
local `index/static`, so the recovery source is the prior commit to
`tuna-os/docs/static/flatpak/index/static`.

1. Confirm the publication is bad against the registry, not only against the
   docs:

   ```sh
   curl -sSfL -o served-index.json \
     https://tunaos.org/flatpak/index/static
   ./scripts/enrich-index.py served-index.json --check
   ```

   A `--check` result that prints "missing labels present in the registry"
   shows the registry has labels the served index lacks. That is a bad
   index. Roll back the served index.

   A result that prints "could not read labels" or "image has no AppStream
   metadata" is a registry fault. A rollback changes only the served index, so
   it cannot fix data in the registry. A result that flags only documentation
   is a drift check, not a rollback.

2. Find the last good publication as the prior commit to
   `tuna-os/docs/static/flatpak/index/static`.

3. Restore it in `tuna-os/docs` — revert the bad commit, or re-publish the
   previous good index. The Worker re-serves the static asset on push. Keep
   `FLATPAK_INDEX_TOKEN` scoped to `tuna-os/docs`; never put its value in a
   command, commit, or this document.

4. Re-verify from the served URL (step 1) and confirm the catalog, digest,
   architecture, and AppStream labels now match the registry.

5. Record the incident in the change record: the bad commit SHA, what you
   restored, the date, and the owner.

The incident owner is a `tuna-os/docs` maintainer: `tuna-os/docs` is the
canonical catalog owner (decision record in ROADMAP.md, #171). Any maintainer
with `FLATPAK_INDEX_TOKEN` may do the rollback. Run this procedure as a live
exercise at least once. A rollback nobody has exercised is not one.

## Checks

From this repository, run the test suite, which uses the standard library,
after documentation or script changes:

```sh
python3 -m unittest discover -s tests -v
```

If a publication changed metadata, also run the served-index audit. A non-zero
`--check` result means the live index needs review; it is not proof that the
application build failed.

## Keep the advertised catalog in sync

The production declaration at
[https://tunaos.org/flatpak/expected-apps.json](https://tunaos.org/flatpak/expected-apps.json) is the source of app IDs and
required architectures. When you add, rename, or retire an app, edit
`static/flatpak/expected-apps.json` in `tuna-os/docs`. Make this change
together with the production index and publisher changes described above. Use
`id` for one app or `ids` for a registry entry that publishes multiple apps
(such as the installer); `archs` applies to every declared ID. Keep optional
future architectures in `archs_planned` until the remote serves them.

Update the Available apps table in this repository's README to match those
IDs exactly, including case. Do not add a local copy of the declaration. To
check a proposed declaration before the docs deploy publishes it:

```sh
python3 scripts/catalog.py ../docs/static/flatpak/expected-apps.json --readme README.md
python3 scripts/catalog.py ../docs/static/flatpak/expected-apps.json --index served-index.json
```

On each pull request, CI compares the README IDs with the served declaration.
The scheduled check of the remote also compares the served index with the
declaration. Each served registry and app ID must be in the declaration. The
architecture of each ref must match its image. The remote must serve each
required pair of ID and architecture. Coordinate changes across the two
repositories; a deployment between their merges can temporarily fail parity.
