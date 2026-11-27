---
sidebar_position: 1
sidebar_label: "bst-ci"
title: "bst-ci"
hide_title: true

status: unknown
---

Shared workflows for GitHub Actions that the BuildStream desktop-image repos
of tuna-os call. The callers now are `tuna-os/tromso`,
`tuna-os/brussels` (formerly `tuna-os/xfce-linux`) and `tuna-os/athens`
(`lint-bst.yml` only). Any other repo that builds a desktop image with
BuildStream can use them too, in or out of the `tuna-os` org.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Why

The pipeline for a chunked build on many runners has three stages: plan,
core, and parallel dependency chunks. The stages keep their CAS state in zstd
tarballs on GHCR. This pipeline is the same in each desktop repo, except for
the image name, the build target, and the number of chunks. Maintainers
copied it by hand between `tromso` and `brussels`, and the copies drifted.
Each CI fix had to go in twice, and it was easy to forget one copy.

## Usage

```yaml
jobs:
  multirunner:
    uses: tuna-os/bst-ci/.github/workflows/multirunner-build.yml@main
    with:
      image_name: your-image
      bst_target: oci/your-image.bst
      num_chunks: '10'      # optional, default 10
      core_split: '200'     # optional, default 200

  build_final:
    needs: multirunner
    if: always() && !contains(needs.*.result, 'failure') && !contains(needs.*.result, 'cancelled')
    runs-on: ubuntu-24.04
    # ... export, sign, push — stays in your own repo. See "Scope" below.
```

`multirunner-build.yml` runs `scripts/ci-build-matrix.py` (also in this repo)
inside the pinned `bst2` container. The script divides the uncached elements
into a core set and `num_chunks` round-robin chunks, with composite cache
keys. It is a plain script, and it makes no assumptions about the repo that
calls it.

`multirunner-build.yml` checks this repo out into `.bst-ci/` next to the
checkout of the caller, and runs the script from there. Thus **consumers must
not keep their own copy** of this script. tromso and brussels both had a
copy. Both repos removed it when this workflow no longer used it.

### Stop chunks from a rebuild of the same expensive elements

Chunks are **round-robin** slices of the dependency order. Thus chunk *i* holds
elements from all parts of the graph. Some of these elements are near the
end, and their transitive closure is almost everything. A chunk builds each
dependency that is not already in the core CAS that it restored. Thus
different chunks do the same work again.

A measurement on tuna-os/brussels found 2.6× (487 distinct elements, 1281
element builds in one run). On tuna-os/tromso, the factor was 3.4×. In each
run, 4–5 chunks built LLVM, and each LLVM build took about 2 hours.

Three inputs address this, and none of them disturbs the chunk caches that
are already on GHCR:

| Input | Default | What it does |
| --- | --- | --- |
| `extra_core_targets` | `''` | Extra elements built in `build_core` *in addition to* the first `core_split` plan entries. The chunk matrix is still derived from `core_split` alone, so chunk names and cache keys are unchanged. Anything listed here is built once and reaches every chunk through the shared core CAS. |
| `soft_core_budget` | `false` | Lets `build_core` exhaust its budget without failing the job. Core is a cache-warming job whose partial CAS is pushed either way, so when you deliberately give it more work than fits in one job the timeout is a checkpoint, not a fault. Only exit code 124 is softened. |
| `soft_chunk_budget` | `false` | Lets dependency chunks treat exit code 124 as a cache-warming checkpoint instead of failing the run. This allows the caller's `build_final` job to consume the partial CAS and lets later runs resume from the rolling cache. Real build errors still fail. |

An increase of `num_chunks` is *not* a substitute. With round-robin slices,
more chunks copy the duplicated closure onto more runners, and do not divide
the work. Also, the workflow names each chunk from its first element
(`chunk{i}-{label}`). Thus a change to `num_chunks` **or** `core_split` gives
every chunk a new name and discards every warm chunk cache. The maintainers
added `extra_core_targets` for this reason. With it, you can move the shared
spine into core and not pay that cost.

`core_budget_minutes` (default `'270'`) sets the `timeout` around the
`bst build` of core. This timeout must stay inside the 360-minute job timeout.
It must also leave time for the archive and push of the CAS that follow it,
and that step grows with the cache. One chunk took 16 minutes to push a CAS
of a similar size.

`chunk_budget_minutes` (default `'270'`) sets the same timeout for each
dependency chunk. A job-level timeout cancels the job and discards the whole
chunk. A large chunk CAS can take an hour to push. If the chunks of a repo
stop at 6 hours in the "Push Chunk CAS" step, decrease this value.

Cache restores extract the compressed blob as it streams from the registry.
They do not keep a compressed copy beside the expanded CAS.
Legacy source archives, logs and temporary CAS files do not enter the restore.
This avoids the extra disk copy that exhausted an Athens runner during restore.
A missing cache leads to a fresh build; a corrupt download or extraction fails.

The registry can stop a large download before the end. The restore then
continues from the last byte with an HTTP `Range` request, and the job does
not fail. The restore calculates the SHA-256 of the full stream. If the value
is not the layer digest in the manifest, the step fails.

Enable `soft_chunk_budget` when chunks often reach their budget but still
make useful progress. A chunk that times out publishes only its
`:latest` cache tag, which moves forward with each run. It does not publish
the exact `:<cache_key>` tag, because that tag means that the chunk is
complete. Thus repeated runs converge, and a chunk that is not complete
cannot show as complete.

Keep the input disabled when a timeout must stop the final assembly.
`soft_core_budget` applies the same policy for exit code 124 to the serial
core job. The two inputs are independent.

The build jobs use `--on-error quit`.
After a task fails, they finish active tasks and stop.
They do not start more work after a compilation error.

The action caches sources in `~/.cache/buildstream/sources`.
The `just bst` recipe mounts this host directory.
Keys include the runner architecture, element definitions, project configuration,
includes, and patches. The architecture-specific prefix allows reuse after
recipe changes. The plan job uses the same host mount as core and chunk builds.

The core job and each chunk use separate restore and save actions.
They save sources even if compilation fails.
Each snapshot key includes its stage, run ID, and `github.run_attempt`.
Cache entries are immutable.
The save action therefore uses a new key for each snapshot.

The restore uses the newest snapshot for the same recipes and architecture first.
If none exists, it uses an older snapshot for that architecture.
The plan job has a separate cache for junction discovery.
A chunk with an exact GHCR hit does not save sources because it ran no fetch.
See GitHub's [cache strategies](https://github.com/actions/cache/blob/main/caching-strategies.md#saving-cache-even-if-the-build-fails) for the explicit save policy.

The CAS archives on GHCR omit sources and unfinished `cas/staging`/`cas/tmp` entries.
Thus each chunk does not upload the source cache again.
This also reduces the temporary disk space that an archive needs.
Archive pipelines use `pipefail`: a failed tar operation must not publish
a truncated archive as an exact-key hit.

These changes reduce disk pressure but do not guarantee that a large CAS fits
a hosted runner. If the core archive fails, the job fails.

A chunk archive failure does not fail the job.
The chunk archive keeps 1 GiB of runner disk free.
If less space is free, or if the archive fails, the job gives a warning and
skips the cache push. The next run builds that chunk again.

Before each snapshot, the job stops its builder containers.
It matches both the pinned image and the workspace bind mount.
Thus another job on a shared runner can continue without interruption.
A timeout can stop the `just` client but leave its container active.
The stop prevents changes to CAS objects during the archive.
Archives also omit daemon logs and sockets; separate artifacts retain build logs.

`runner_label` / `runner_label_aarch64` (default `ubuntu-24.04` /
`ubuntu-24.04-arm`) set `runs-on` for the plan job, core, and the chunks. Only
this lever can make a *single* expensive element build faster. Chunks cannot
divide the build of one `bst` element across runners. A job waits forever in
the queue if the caller repository has no runner with its label. Thus set a
label only if you know that it resolves there.

## Verification without a build

The tests and lint checks here do not need BuildStream, podman, or a real
chunked build:

- `tests/pytest/` contains unit tests for the pure functions in
  `ci-build-matrix.py`. It also contains CLI tests that run the script as a
  subprocess against a synthetic `build-plan.txt`, with no `bst show`.
  To run them on your machine, use `pytest tests/pytest/ -v`.
- `actionlint` and `yamllint` check every workflow file. This includes the
  `.github/workflows/test.yml` file of this repo, so this repo lints itself.
  The runner-label configuration includes GitHub's Ubuntu 26.04 image because
  the pinned actionlint list does not yet include it.
- GitHub does not validate the contract between repos for you. Thus, before
  you change the `inputs:`/`outputs:` contract of `workflow_call`, do these
  steps:
  1. Search both consumers for `with:` keys and `needs.multirunner.outputs.*`
     references.
  2. Make sure that this repo still matches what the consumers expect.
- `scripts/lint_bst.py` is a static lint for `.bst` element files (see below).

### `scripts/lint_bst.py`

This script finds two classes of mistake in new or changed `.bst` files. It
does not need BuildStream, a junction fetch, or a real build. It needs
Python 3 and PyYAML (`python3 -m pip install pyyaml`):

1. **Structure**: invalid YAML and a missing `kind:` are errors. If the
   script does not know a BuildStream plugin kind, it gives a warning, not an
   error. The unknown kind can be a typo, such as `kind: meason`. But the
   list in the script possibly does not include every valid third-party
   plugin.
2. **Cross-reference**: the script finds each junction-qualified dependency
   in a new or changed file. This is a name with a `:` in it, for example
   `freedesktop-sdk.bst:components/foo.bst`. The script then compares each
   of these names with all the `.bst` files that are already in the tree.

   The script flags a dependency if no other file refers to it. The
   dependency possibly does not exist in the junctioned project. The script
   knows only if *this* codebase used that name with success before. It does
   not know if the name is real.

   The script found this type of gap on its first use. A new `cage.bst` for
   tuna-os/brussels#39 referred to
   `freedesktop-sdk.bst:components/wlroots.bst`. No other element in
   `tromso` or `brussels` used that dependency. Thus that PR needed a
   second look before the merge.

```sh
# Lint an entire tree (structural checks only):
python3 scripts/lint_bst.py path/to/elements

# Also flag unconfirmed dependencies introduced by specific new/changed files:
python3 scripts/lint_bst.py path/to/elements --check-new path/to/elements/foo/new-thing.bst

# In CI, pair --check-new with a diff against the PR's base branch to
# scope it to files actually touched by the PR, e.g.:
#   git diff --name-only --diff-filter=AM origin/main... -- '*.bst'
```

The script exits with 0 unless it finds a structural error (invalid YAML,
missing `kind:`). By default, an unknown kind or an unconfirmed dependency
gives only a warning. These findings tell you to look at something, and they
are not always failures. When you trust their false-positive rate, add
`--strict` to make unconfirmed dependencies fatal. Unknown kinds stay
warnings.

### Reusable lint workflow

Consumers do not copy the lint commands into their CI. They call
`.github/workflows/lint-bst.yml`:

```yaml
jobs:
  lint-bst:
    uses: tuna-os/bst-ci/.github/workflows/lint-bst.yml@main
    with:
      elements_roots: elements  # optional; separate more roots with spaces
      strict: false             # optional
```

The workflow checks out `scripts/lint_bst.py` at `${{ job.workflow_sha }}`.
Thus the `uses:` ref pins the workflow and the linter together. For a pull
request or a merge group, the workflow lints the full tree. It also checks
the added or modified `.bst` files under `elements_roots` for unconfirmed
dependencies. For other events, it does only the structural checks on the
full tree.

## Local builds from the CI cache

`scripts/cas_bootstrap.py` copies the CAS archives that the workflow
publishes into the BuildStream cache of a developer machine. After that,
`bst build` rebuilds only the elements whose cache key is different from the
published key. The script reads the registry. It cannot write to it.

It needs Python 3, `zstd` and `tar`. It does not need `oras` or a login. The
cache packages of `tromso` and `xfce-linux` are public. The script asks GHCR
for an anonymous token with the `pull` scope only.

```bash
# Show the published archives, their sizes and dates
python3 scripts/cas_bootstrap.py list tuna-os/tromso tromso core

# Download, verify and extract the core archive into a cache directory
python3 scripts/cas_bootstrap.py pull tuna-os/tromso tromso ~/.cache/buildstream core

# Count the cached elements of a target
bst show --deps all --format '%{name}||%{state}' oci/tromso.bst \
  | python3 scripts/cas_bootstrap.py states
```

The script gives these guarantees:

- **Integrity**: the script calculates the SHA-256 of the downloaded file.
  It extracts the archive only when the value equals the layer digest in the
  registry manifest.
- **Resume**: a download that stops continues from the last byte with an HTTP
  `Range` request. The registry stops a large download after some minutes,
  and `oras` cannot continue it. Thus the script does not call `oras`.
- **No repeated work**: the script records the digest of each stage in
  `<cache_dir>/.cas-bootstrap/`. A second run skips a stage when the
  published digest is the same.
- **Disk check**: the script stops before a download when the disk is too
  small. It needs room for the archive and for three times that size.
- **No push**: the script has no command that writes to the registry.

The default stage is `core`. It holds the shared spine of the graph and each
chunk job starts from it. A chunk stage has a name from the planner, for
example `chunk0-cmake`. The log of the `planning` job of a nightly run shows
the names. Each chunk archive is a full snapshot that also contains the core
elements, so one chunk archive is 12 GB to 24 GB. Get a chunk only when you
work on its elements.

Use the same pinned `bst2` image as CI, or the cache keys do not match. If a
cache package is private, make a token with the `read:packages` scope, write
it to a Docker-style auth file, and give that file with `--auth-file`.

A consumer repository must not keep a copy of this script. Get it at a
pinned commit of this repository and check its SHA-256 before you run it.
`tromso` does this in `just/local-cache.just` (`just bootstrap-cache` and
`just build-local`). To port it to a different repository, copy that file
and change the repository name, the image name and the default target.

## Scope

This repo owns the **plan, core, and parallel dependency chunks**. These are
the parts of the pipeline that are the same in each repo and that change
most frequently. This repo does **not** own these parts:

- **`build_final`** (export, `bootc container lint`, GHCR push, cosign
  signature, Trivy scan). Each consumer repo keeps this job. A keyless cosign
  signature contains the identity of the workflow that *calls* this one, in
  the Fulcio certificate. Assume that this shared workflow made the
  signature. Then the signature of each consumer would show the identity of
  `tuna-os/bst-ci`, not its own. Then the verification instructions in the
  README of each consumer would not work.
- **ISO builds, Containerfiles, dracut modules, install scripts**. These are
  different for each desktop, with different base images and live-session
  setup. They are not good candidates for a shared abstraction.

## Versioning

You can pin the workflow to a commit SHA. This repository has no tags or
releases, so a SHA is the only stable ref to pin.

```yaml
jobs:
  multirunner:
    uses: tuna-os/bst-ci/.github/workflows/multirunner-build.yml@<sha>
    with:
      image_name: your-image
      bst_target: oci/your-image.bst
```

The `uses:` ref selects one versioned unit: both the reusable workflow and
`scripts/ci-build-matrix.py`. The plan job checks the helper out at
`${{ job.workflow_sha }}`, the exact commit from which GitHub loaded the
reusable workflow. A helper change therefore cannot bypass a consumer's pin.

Existing callers that pass `bst_ci_ref` can keep using it when it identifies
the same ref or commit as `uses:`. The input only asserts compatibility:
it cannot select a different helper revision. A mismatch stops the workflow
before it checks out the helper. New callers should omit it.

If a change here breaks a consumer, read `runbooks/rollback.md`. It gives two
levers for a rollback:

- **Lever A**: Revert the bad change on `main`. Each consumer recovers when
  its pinned SHA moves to the revert commit.
- **Lever B**: Pin one consumer's `uses:` line to a good SHA. The workflow and
  helper move together; other consumers keep their own pins.

The runbook also tells you which GHCR chunk caches a rollback can affect, and
how to verify the rollback.

## Incident records

Use [`runbooks/incident-template.md`](https://github.com/tuna-os/bst-ci/blob/main/runbooks/incident-template.md) to record
a shared-workflow incident. It captures the resolved workflow and helper-script
SHAs, affected consumers, containment choice, and recovery proof. Keep the
rollback procedure in [`runbooks/rollback.md`](https://github.com/tuna-os/bst-ci/blob/main/runbooks/rollback.md).

## Consumers

| Repository | Calls | Caller workflow |
| --- | --- | --- |
| [tuna-os/tromso](https://github.com/tuna-os/tromso) | `multirunner-build.yml` | `.github/workflows/build-tromso-multirunner.yml` |
| [tuna-os/brussels](https://github.com/tuna-os/brussels) (formerly `xfce-linux`) | `multirunner-build.yml` | `.github/workflows/build-multirunner.yml` |
| [tuna-os/athens](https://github.com/tuna-os/athens) | `lint-bst.yml` | `.github/workflows/test.yml` |

Each consumer pins a commit SHA of this repository in its `uses:` line.
In tromso and brussels, Renovate updates that SHA. Athens has no Renovate
configuration, so a person must update its SHA. A change on `main` reaches a
consumer only when the SHA in that consumer moves.
