---
sidebar_position: 7
title: "RELEASE"
---

This repository ships five installer frontends from two branches:

| Branch | Role | Who pushes to it |
|---|---|---|
| `dev` | Integration. Every PR targets it. | People, via PRs. Bots push `[skip ci]` screenshot refreshes. |
| `prod` | What ships. Always a fast-forward of `dev`. | Only `promote.yml`. Nobody pushes to `prod` by hand. |

Everything between the two is automated. The only manual actions that exist
are escape hatches, listed at the end.

## The pipeline

```
PR ──merge──▶ dev ──validate──▶ promote.yml ──fast-forward──▶ prod ──▶ release.yml
                                    ▲                                     │
                    Flatpak, Python Tests, Go Tests,                      ├─ GitHub release (GNOME bundles, --latest)
                    Screenshots (×5), Flatpak (frontends),                └─ Publish Flatpak (×5) to the tuna-os remote
                    CI (niri backend), cargo-sources (cosmic),
                    and each other workflow that runs on dev
```

### 1. Validate on `dev`

Every push to `dev` runs the validation workflows. A PR runs the same set
before merge, so `dev` is rarely red, but the promotion gate reads the checks
on the actual `dev` commit, never the PR's.

| Workflow | Gates | Runs on |
|---|---|---|
| `flatpak.yml` | GNOME production (x86_64 + aarch64) and devel bundles build | every push |
| `python-test.yml` | GTK frontend unit + UI tests, coverage ratchet | every push |
| `go-test.yml` | fisherman submodule vet + tests + race | every push |
| `flatpak-frontends.yml` | kde / cosmic / niri / xfce Flatpaks build (publish=false) | when that frontend changed |
| `screenshots-*.yml` | each frontend launches, renders every page, pixel audit passes | when that frontend changed |
| `ci-niri.yml`, `cargo-sources-cosmic.yml` | frontend-specific checks | when relevant |
| `e2e.yml` | every frontend drives its real backend path to Done, and the recipe each produced is installed by fisherman and booted in a VM | every push |
| `validate-flatpak.yml` | each GNOME Flatpak manifest is valid JSON with an app id, a runtime and a command | every push |
| `recipe-compliance.yml` | the five frontends write the same recipe for each case in `shared/recipe/fixtures/compliance.json`. Its `Recipe compliance` job is in `REQUIRED_CHECKS` | every push |
| `cargo-test-cosmic.yml` | COSMIC frontend `cargo test` | when the COSMIC sources changed |
| `browser-walkthrough.yml`, `wasm-kde.yml` | GNOME, XFCE and Niri advance in a browser; the KDE frontend compiles for WebAssembly | when that frontend changed |
| `wasm-cosmic.yml` | advisory: the COSMIC frontend compiles for WebAssembly against the pinned tuna-os forks. It never blocks promotion | when the COSMIC frontend changed |
| `actionlint.yml` | the workflow files pass actionlint | when a workflow changed |
| `actions-security.yml` | `.github/workflows/actions.lock` agrees with the workflows, and zizmor finds no problem (see "Action pinning") | every push |
| `sbom.yml` | each frontend's SPDX SBOM builds and passes the release check (dry run: a run artifact only) | when an SBOM input changed |
| `ste.yml` | the Markdown prose stays in the `.ste-budget` | when a Markdown file changed |
| `walkthrough.yml` | cross-frontend parity page regenerates | after any screenshot job |

A push to `dev` also refreshes the `latest-dev` **pre-release** with the GNOME
devel bundle. That is the only release-like thing `dev` does. Nothing on
`dev` reaches `/releases/latest/` or the Flatpak remote any more.

### 2. Promote (`promote.yml`)

Fires when any validation workflow completes on `dev`, every hour as a
catch-up, and on demand. Each firing:

1. Picks the candidate: the newest `dev` commit that is not a bot
   `[skip ci]` commit (those carry no checks and must not stall promotion).
2. Refuses to move `prod` anywhere but forward: the candidate must descend
   from the current `prod`. There is no rewind path in CI.
3. Waits out the **soak window** (`SOAK_MINUTES`, 30 by default) so an
   immediate fix-up push supersedes the commit before it ships. The job
   sleeps for the remainder of the window, then looks at `dev` again: a
   newer commit that landed meanwhile supersedes the candidate, and this
   run stops. The hourly schedule is not what ends the soak. GitHub runs
   this repository's cron ticks hours late, and on the first day none
   fired at all.
4. Reads every check run on the candidate through the Checks API and
   requires: none still running, none failed/cancelled/timed out, and each
   name in `REQUIRED_CHECKS` present and successful. Path-filtered jobs are
   not required by name: when they did not run there is nothing to validate,
   and when they did run, a red one blocks like any other.
5. If all of that holds, fast-forwards `prod` to the candidate and
   dispatches `release.yml` on `prod`.

A firing that finds checks still running after the soak exits green with the
reason in the job summary. Only the last workflow to finish on a commit sees
"everything complete", and that firing promotes.

A `triage` job runs first. It ends a firing at once when that firing is not
the last check to finish on its commit. Only the firings that can decide
something enter the gate's concurrency group.

GitHub keeps one pending run per group and cancels the run it displaces.
The group once covered the whole workflow. Each push to `dev` then cancelled
the firings that queued behind a gate asleep in its soak.
`tests/unit/test_promote_gate.py` holds the new layout.

Every `flatpak-builder` step in `flatpak.yml` and `publish-oci.yml` runs
twice at most. The builder container sometimes fails with `Failed to update
org.gnome.Sdk: Invalid cross-device link`. One such failure on a `dev` commit
stops every later promotion, because the gate needs `Build (devel)` green.
If it fails twice, rerun the failed jobs with `gh run rerun <id> --failed`.

`prod` is created by the first successful promotion. Nothing needs to exist
beforehand.

### 3. Release (`release.yml`)

Runs only on `prod` (dispatched by promote.yml) or on a hand-pushed `v*` tag.
It refuses any other ref, and refuses a dispatch whose `expected_sha` no
longer matches `prod` HEAD, which is how two promotions racing each other
lose safely.

1. Builds the GNOME bundles by calling `flatpak.yml` (same job, same
   artifacts).
2. Cuts the GitHub release, tagged `vYYYY.MM.DD-<short sha>`, marked
   `--latest`, carrying `org.bootcinstaller.Installer.flatpak`,
   `org.bootcinstaller.Installer.Devel.flatpak` and, when the aarch64 build
   produced one, `org.bootcinstaller.Installer-aarch64.flatpak`. It then
   verifies both `/releases/latest/download/` URLs resolve before continuing.
3. Publishes each frontend's Flatpak to the tuna-os remote through the shared
   `tuna-os/.github` reusable workflow, but only the frontends whose tree
   changed since the last commit that a release run published for that
   frontend (`shared/ci/release_changes.py`). An unchanged frontend is not
   republished. A frontend whose publish failed is published again by the
   next release run, with no change to its files.

The release also carries supply-chain evidence (#151).

- `<frontend>.spdx.json`: one SPDX SBOM for each frontend. It lists the
  Flatpak that the release commit builds. The `sbom` job makes it. Syft
  (`anchore/sbom-action`) reads the lock files of the build. These are the
  fisherman `go.mod`, the Niri backend `go.mod` and the COSMIC `Cargo.lock`.
  Then `shared/ci/flatpak_sbom.py` adds the app, its runtime and its SDK.
  It also adds each module of the Flatpak manifest, with its URL, checksum,
  tag or commit.
  The GNOME SBOM describes the production manifest. The Devel bundle builds
  the same modules.
- A GitHub build-provenance attestation for each `.flatpak` bundle and each
  SBOM (`actions/attest-build-provenance`). The attestation is keyless: the
  run signs it with its OIDC identity through Sigstore, and GitHub keeps it.
  Only the `release` job has `id-token: write` and `attestations: write`.

The `sbom` job calls `sbom.yml`. A pull request and a push to `dev` run the
same workflow as a dry run when an input of the SBOM changes. The dry run
uploads a run artifact only, with no attestation and no release. A release
with no SBOM for a frontend fails before `gh release create`.

The date + sha tag is deliberate: it is monotonic, unique per promotion, and
never a rolling name an immutable-release ruleset can permanently ban (see
`runbooks/auto-release-rollback.md` for the history).

## Downstream contract

| Consumer wants | URL | Comes from |
|---|---|---|
| The GNOME installer a live ISO installs | `/releases/latest/download/org.bootcinstaller.Installer.flatpak` | the last promoted `prod` commit |
| The GNOME devel app id, same commit | `/releases/latest/download/org.bootcinstaller.Installer.Devel.flatpak` | the last promoted `prod` commit |
| Bleeding edge, unvalidated | `/releases/download/latest-dev/org.bootcinstaller.Installer.Devel.flatpak` | every push to `dev` (pre-release) |
| Any frontend from the tuna-os Flatpak remote | `https://tunaos.org/flatpak/index/static` | the last promoted `prod` commit |

**What changed for downstreams:** before this flow, `/releases/latest/` and
the Flatpak remote were rewritten on every push to `dev`, gated on nothing but
"the bundle built". Now they move only when a `dev` commit has passed every
check and the soak window. A consumer that wants `dev` bits takes the
`latest-dev` pre-release, which is the same asset it was before.

## Verify a release

Download a bundle and its SBOM from the release, then ask GitHub for the
attestation. You need the GitHub CLI 2.49 or later.

```bash
tag=vYYYY.MM.DD-abcdef1
gh release download "$tag" --repo tuna-os/bootc-installer \
  --pattern 'org.bootcinstaller.Installer.flatpak' --pattern '*.spdx.json'
gh attestation verify org.bootcinstaller.Installer.flatpak \
  --repo tuna-os/bootc-installer \
  --signer-workflow tuna-os/bootc-installer/.github/workflows/release.yml
gh attestation verify kde.spdx.json --repo tuna-os/bootc-installer
```

A pass shows that `release.yml` in this repository built the file, and it
shows the commit and the run. `--signer-workflow` refuses a file that
another workflow attested. To check with no GitHub CLI, download the
Sigstore bundle with `gh attestation download <file> --repo
tuna-os/bootc-installer`, then give it to `cosign verify-blob-attestation
--bundle`, with `--certificate-identity-regexp` set to the `release.yml`
workflow and `--certificate-oidc-issuer
https://token.actions.githubusercontent.com`.

The SBOM lists what the Flatpak contains or builds from. Open it with any
SPDX tool, for example `jq '.packages[].name' kde.spdx.json`. The four
frontends other than GNOME have no `.flatpak` bundle in the release. They
ship as OCI images in `ghcr.io/tuna-os/bootc-installer`, and those images
have no attestation yet.

## Escape hatches

| Situation | Do this |
|---|---|
| Gate is wrong and a commit must ship now | Actions → *Promote dev → prod* → Run workflow with `force: true`. The soak and check gate are skipped; the fast-forward rule is not. |
| Promote a specific older commit on `dev` | Same dispatch with `sha:`. It must be on `dev` and ahead of `prod`. |
| Hotfix that cannot wait for `dev` | Push a `v*` tag on a commit; `release.yml` runs for the tag. Prefer a normal PR to `dev` and a forced promotion. |
| A bad release is `latest` | `runbooks/auto-release-rollback.md`: demote it with `gh release edit --latest=false` and promote the last good one. Never delete releases or tags. |
| Republish a frontend's Flatpak by hand | Actions → *Publish Flatpak* → Run workflow on `prod`, and select the frontend. |
| A publish job fails with `permission_denied: write_package` | Every frontend now publishes to the one package `ghcr.io/tuna-os/bootc-installer` (tags `gnome`, `kde`, `cosmic`, `niri`, `xfce`, each also `-<arch>` and `-<tag>-<arch>`; GNOME keeps `latest`). That package belongs to this repository, so this should not recur. If it does, the token lacks `packages: write` on the calling workflow. |
| Pause promotion | Disable the *Promote dev → prod* workflow in the Actions UI. Merges keep landing on `dev`; nothing ships until it is re-enabled. |

## Knobs

All in `.github/workflows/promote.yml`:

- `SOAK_MINUTES`: minimum age of a commit before it may ship.
- `REQUIRED_CHECKS`: check-run names that must be present and green. Add a
  workflow's job name here when it should block promotion even on commits
  that did not trigger it by path.
- The `workflow_run` list: workflows whose completion re-evaluates the gate.
  Every workflow that a push to `dev` can start belongs in this list. The
  gate reads the check runs of all of them, and only the last one to finish
  can promote.

`tests/unit/test_promote_gate.py` reads the workflow files and keeps the two
lists true:

- Each `workflow_run` entry is the `name:` of a workflow file.
- Each workflow that a push to `dev` starts is in the `workflow_run` list.
- Each `REQUIRED_CHECKS` entry is the name of one job, in one workflow that
  runs on every push to `dev`.
- Each workflow that runs on every push to `dev` (no path filter) has a job
  in `REQUIRED_CHECKS`. If such a workflow does not start, the gate refuses
  the commit.

The test has two exclusion sets, `NOT_A_TRIGGER` and `NOT_REQUIRED`. The two
sets are empty. An entry needs a reason in the test file.

When you add a workflow that runs on `dev`, add its `name:` to the
`workflow_run` list. If it has no path filter, also add one of its job names
to `REQUIRED_CHECKS`. When you rename a workflow or a job, change the name
in `promote.yml` in the same commit.

## Action pinning

Every action `uses:` in `.github/workflows/` names an exact release tag, or
a branch for `dtolnay/rust-toolchain@stable` and the org's own `tuna-os/*`
actions. `.github/workflows/actions.lock` records the commit that each one
runs. `actions-security.yml` runs `gh actions-lock --verify`, which fails
when the lockfile and the workflows do not agree, and zizmor. To change an
action, edit its `uses:` line, then run `gh actions-lock`. Renovate waits 7
days before it takes a new action release. Container images stay pinned by
digest. The lockfile does not cover a reusable workflow in another
repository, so `tuna-os/*` reusable workflows are pinned to a full commit
SHA with `# main` as a trailing comment. Renovate updates that SHA.

## Things the flow does not do

- It does not run fisherman's full image matrix. `e2e.yml` installs and
  boots one canary per frontend recipe; the matrix over every supported
  image lives in `tuna-os/fisherman` (`bootcrew-vm.yml`), and the live-ISO
  smoke test in `tuna-os/tunaOS` (`installer-smoke.yml`).
- It does not version the fisherman submodule. Renovate moves the pointer:
  the gitlink tracks fisherman's `prod` branch (`.gitmodules`,
  `renovate.json` group `fisherman`), which only advances after fisherman's
  own promote gate. Every Flatpak builds fisherman from the submodule, so the
  gitlink is the only pin. Renovate opens one PR to `dev`
  and merges it when every check is green; from there it ships like any other
  change. To pin by hand, run `shared/ci/fisherman_pins.py --commit <sha>`.
- It does not need a personal access token. `GITHUB_TOKEN` pushes do not
  trigger push workflows, which is why `release.yml` is dispatched explicitly
  rather than triggered by the push to `prod`.
