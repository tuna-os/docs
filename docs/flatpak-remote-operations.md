---
title: Flatpak remote operations
description: Publish, validate, and troubleshoot the TunaOS Flatpak remote.
---

The `tunaos-org` Cloudflare Worker serves the TunaOS Flatpak remote from
`static/flatpak/` in **tuna-os/docs**. The remote descriptor is
[tuna-os.flatpakrepo](https://tunaos.org/flatpak/tuna-os.flatpakrepo) and the index is
[index/static](https://tunaos.org/flatpak/index/static). App images live in GHCR.

For client setup, see the [app guide](./flatpak/guide.md). This page covers
publication and recovery. Run the local commands from a docs checkout unless
a command says otherwise. You need Node.js 24, npm, Python 3, and `just` for
site checks; registry audits also need network access to GHCR.

## Publishing workflow

There are three parts to a release:

1. **Build and upload the image.** An application's publish workflow builds
   a Flatpak, exports it with `flatpak build-bundle --oci`, then uploads it
   to `ghcr.io/tuna-os/<app>`.
2. **Update the production index.** The publisher reads the OCI layout with
   `update-index.py` or the shared index action. It commits the changed
   `static/flatpak/index/static` to `tuna-os/docs`. The index records the
   manifest digest, architecture, tags, and Flatpak and AppStream labels.
3. **Deploy the site assets.** A build of docs publishes that index and the
   remote descriptor through the `tunaos-org` Worker. Flatpak clients read
   the index, then download images from GHCR by digest.

[tuna-os/flatpak-index](https://github.com/tuna-os/flatpak-index) owns the
index tooling and app metadata guidance. Its root `index/static`, remote
descriptor, and GitHub Pages site are historical snapshots. A change to those
files does not update production. Each publisher updates this repository directly.
There is no daily copy of that snapshot into this repository.
See the [application lifecycle runbook](https://github.com/tuna-os/flatpak-index/blob/main/docs/APP-LIFECYCLE.md)
for steps to add, update, pause, or retire an app.

This repository also has a [central builder](https://github.com/tuna-os/docs/blob/main/.github/workflows/build-flatpaks.yml).
It runs daily at 06:00 UTC and on manual dispatch. Its matrix selects the
apps and source branches. It builds OCI artifacts, uploads them to GHCR,
and uses this repository's `.github/scripts/update-index.py` to update the
production index.

Inspect the current workflow before you retry a build.
Some publish commands use `|| true`. A successful job alone does not
prove that every image upload and index update succeeded.

### Deployment triggers and credentials

[deploy-flatpak.yml](https://github.com/tuna-os/docs/blob/main/.github/workflows/deploy-flatpak.yml)
runs on pushes to `main` that touch `static/flatpak/**`, and on manual
dispatch. Its deploy job runs only in `tuna-os/docs`. It installs the locked
npm dependencies, builds the **whole site**, installs Wrangler 4, then runs
`wrangler deploy`. `wrangler.jsonc` names the `tunaos-org` Worker and serves
`build/` as static assets. The job needs `CLOUDFLARE_API_TOKEN` from repository
secrets. Cloudflare Workers Builds also publishes on pushes to `main`, as
described in the [repository README](https://github.com/tuna-os/docs#deployment).

Application publishers use `GITHUB_TOKEN` for their GHCR upload and
`FLATPAK_INDEX_TOKEN` for the cross-repository index commit. The latter needs
Contents read/write access scoped to `tuna-os/docs`.

GitHub [suppresses workflow runs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)
for pushes made with the repository's own `GITHUB_TOKEN`. If the index commit has no deploy run, check which token made it.
Check deployment logs and the served index before you declare a release live.
Keep token values out of commands, URLs, logs, and issue reports. A maintainer
must resolve missing secrets or account permissions.

## Local validation

### Review the candidate index

Work on a branch based on current docs `main`. To generate an entry from
a local OCI export, replace the example path and registry repository below.
Use the artifact and image you intend to publish:

```bash
python3 .github/scripts/update-index.py \
  --oci-dir /path/to/app.oci \
  --index-file static/flatpak/index/static \
  --repo-name tuna-os/example \
  --require-appstream \
  --tags latest
git diff -- static/flatpak/index/static
```

The updater reads a single-image OCI layout. It changes the entry for the
same registry repository, architecture, and Flatpak ref, and preserves other
entries. Run it for each intended architecture. Check that the diff has the
right app ID, branch, digest, and architecture and has no unrelated deletions.
OCI architecture names such as `amd64` and `arm64` correspond to Flatpak ref
architectures `x86_64` and `aarch64`.

`--require-appstream` rejects images without the AppStream appdata and icon
labels. It does not upload the image or check that its digest is available
to anonymous GHCR clients. Confirm the upload succeeded before the index
goes live. For a new app, update `static/flatpak/expected-apps.json` with its
registry name, ID (or `ids`), and required `archs`; `archs_planned` entries
only produce warnings. Keep any `appstream/*.flatpakref` files consistent
with the published IDs.

### Run the local checks

```bash
npm ci
node scripts/prepare-flatpak-icons.mjs
python3 .github/scripts/check-flatpak-remote.py
just preflight
just build
git diff -- static/flatpak/
```

Install the tools listed in the [contributor guide](https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md)
first. The icon step writes PNG files under `static/flatpak/icons/` and adds
remote icon URLs to AppStream XML in the candidate index. `npm run build` also
runs that step through `prebuild`. Review these changes before you commit.

The sanity checker verifies the descriptor's `DefaultBranch` and OCI
authenticator, expected app IDs and required architectures, AppStream XML
and remote icon URLs, and local `.flatpakref` targets. Required failures
return a nonzero exit code. The check warns about planned architectures and apps absent from the list. This structural check does not install apps or test GHCR pulls.

For a registry-backed metadata audit, clone `tuna-os/flatpak-index` beside
this checkout and run its script against the candidate:

```bash
python3 ../flatpak-index/scripts/enrich-index.py \
  static/flatpak/index/static --check
```

This reads the digests already in the candidate from GHCR and compares their
labels. `--check` does not write the file. A failure can mean missing labels,
invalid metadata, or a registry access problem; read the per-image output.
It does not discover a newer image from a mutable tag.

## Verify production

After the reviewed index change lands and the deployment finishes:

```bash
python3 .github/scripts/check-flatpak-remote.py \
  --base-url https://tunaos.org/flatpak
curl -fsSL https://tunaos.org/flatpak/index/static -o /tmp/tuna-served-index.json
python3 ../flatpak-index/scripts/enrich-index.py /tmp/tuna-served-index.json --check
```

Compare the affected entry's digest, ref, and architecture with the intended
docs commit. The site adds remote icon metadata at build time, so raw index
bytes can differ from the committed file. In live mode, the checker cannot list the
`.flatpakref` files. It skips that local-only check.

The [sanity workflow](https://github.com/tuna-os/docs/blob/main/.github/workflows/flatpak-sanity.yml)
checks the local files on PRs and `main` pushes that change `static/flatpak/**`.
Manual dispatch also checks local files. Its daily 12:00 UTC run checks
the live remote. In flatpak-index, `check-metadata.yml` audits the **served**
index at 06:17 UTC or on manual dispatch. It does not validate that
repository's snapshot or a proposed docs branch.

For client verification, use a disposable test account or VM with Flatpak:

```bash
flatpak remote-add --user --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak remote-ls --user tuna-os
flatpak install --user tuna-os org.tunaos.tables
```

Use the same installation scope for subsequent commands. `--if-not-exists`
keeps an existing remote's settings; inspect `flatpak remotes --user --show-details`
if its URL is wrong. An install checks image and runtime availability.
The structural check does not test these downloads.

The [smoke workflow](https://github.com/tuna-os/docs/blob/main/.github/workflows/flatpak-smoke-test.yml)
runs daily at 12:30 UTC. It installs every expected app and launches apps
under Xvfb or headless Sway. Installer apps are install-tested only. Scheduled
runs can file, update, or close issues in app repositories with
`FLATPAK_SMOKE_ISSUE_TOKEN`. Manual dispatch defaults to `file_issues=false`;
leave that setting off for diagnostic runs to avoid issue writes.

## Troubleshooting

| Symptom | Check and recovery |
| --- | --- |
| App builds, but clients see an old version | Compare the publisher's OCI digest, docs `main`, and the served entry. If docs is old, inspect the index update and push logs, token permissions, and push conflicts. Re-run the publisher against current `main`; never force-push over other apps' updates. If only the served entry is old, inspect the deploy logs and deployed revision. |
| Deploy fails or no deploy starts | Check the `main` and path filters, the token used for the index push, and the upstream-only job condition. A full-site npm or Docusaurus failure blocks this deploy too. Fix the reported build error through review. A maintainer can dispatch the deploy workflow after confirming the intended index is on `main`. |
| Sanity check reports missing apps or architectures | Compare `expected-apps.json` with every image ref and architecture. Rebuild and publish the missing artifact; do not remove an expected app or required architecture just to pass the check. Check for a publisher that overwrote another ref in a shared GHCR repository. |
| Software centre shows a bare ID, no icon, or unknown licence | Check for both `org.flatpak.*` and `org.freedesktop.appstream.*` labels in the image and index. Run the registry audit. If the image lacks metadata, fix its metainfo and icons and rebuild. If only the index lacks labels, use the repair procedure below. Check the icon preparation output and the served icon URL too. |
| Image download returns 401 or a digest is missing | Verify the GHCR package is public and that the exact indexed digest was uploaded. Check the publisher's upload logs, including ignored upload errors. The current docs descriptor declares `AuthenticatorName=org.flatpak.Authenticator.Oci`; preserve it. |
| `flatpak remote-info` returns 401 | This client command has a known OCI token-handshake limitation; see [flatpak-index#96](https://github.com/tuna-os/flatpak-index/issues/96). Check `remote-ls` and an install before treating this response as a remote outage. |
| `Nothing matches` or updates appear absent | Check the remote URL, `DefaultBranch=master` in the current descriptor, the image's ref branch, and user/system scope. For a user installation, use `flatpak update --user`. Do not change branch metadata to hide a missing published ref. |
| Metadata CI fails while a candidate looks correct | Confirm which file was checked. The flatpak-index metadata workflow reads production. A pending or failed docs deployment can leave that check red until the intended index is served. |

To restore labels from already-published images, run this on a docs branch:

```bash
python3 ../flatpak-index/scripts/enrich-index.py static/flatpak/index/static
node scripts/prepare-flatpak-icons.mjs
python3 .github/scripts/check-flatpak-remote.py
git diff -- static/flatpak/
```

Without `--check`, enrichment writes labels from the registry for existing
digests; it does not select a new release. Review the diff and use the normal
PR and deployment process. For an incorrect release digest, regenerate the
affected entry from the intended OCI export. Preserve unrelated entries. Record the affected app, architecture, digest,
docs commit, workflow run URLs, and failed check output in the incident.

## Maintain the index tooling

This repository vendors `.github/scripts/update-index.py` from
`tuna-os/flatpak-index/scripts/update-index.py`. Do not assume the copies
match. The shared [update-flatpak-index action](https://github.com/tuna-os/.github/tree/main/.github/actions/update-flatpak-index)
also contains a copy. The [weekly drift workflow](https://github.com/tuna-os/.github/blob/main/.github/workflows/flatpak-tooling-drift-check.yml)
uses flatpak-index as canonical, checks the action copy, and includes docs
in its publisher list. Check that workflow's current coverage and results
when you change tooling. Some
repository notes describe the previous coverage.

Before you sync the vendored file, fetch the companion repository's current
`main` and compare the files:

```bash
git -C ../flatpak-index fetch origin main
git -C ../flatpak-index show origin/main:scripts/update-index.py > /tmp/tuna-update-index.py
diff -u /tmp/tuna-update-index.py .github/scripts/update-index.py
```

Review differences before you copy the file. Port any needed local fixes to the source
and coordinate the action copy and affected application publishers. Preserve
both label prefixes and replacement by architecture **and Flatpak ref** so
apps that share a registry repository do not erase each other. A byte comparison
can flag a change to the script description as well as its behavior. Inspect both.

For a reviewed sync, run the docs Python tests (needs `pytest`):

```bash
python3 -m pytest .github/scripts/tests
just preflight
just build
```

If the canonical script changes, also run its upstream unittest and Ruff
checks as described in flatpak-index's contributor instructions. New
publishers should prefer the shared tooling. A migration must update the
workflow caller before it deletes its vendored script.
