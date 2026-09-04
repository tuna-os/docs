---
sidebar_position: 1
sidebar_label: "bst-ci"

status: unknown
---

Shared reusable GitHub Actions workflows for tuna-os's BuildStream
desktop-image repos (currently `tuna-os/tromso`, `tuna-os/xfce-linux`) —
and open to any other BuildStream-based desktop image repo, in or out of
the `tuna-os` org.

## Why

The multi-runner chunked-build pipeline (plan → core → parallel dep chunks,
sharing CAS state via GHCR-hosted zstd tarballs) is identical across every
desktop repo except for the image name, build target, and chunk count. It
was being hand-copied between `tromso` and `xfce-linux`, which drifts:
every CI fix had to be applied twice, and it was easy to forget one.

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

`scripts/ci-build-matrix.py` (also in this repo) is what `multirunner-build.yml`
runs inside the pinned `bst2` container to split uncached elements into a
core set + `num_chunks` round-robin chunks with composite cache keys. It's
a plain script with no repo-specific assumptions — `multirunner-build.yml`
checks this repo out into `.bst-ci/` alongside the caller's own checkout
and invokes it from there, so **consumers should not carry their own copy**
of this script (tromso and xfce-linux both used to; both had it removed
once this workflow stopped needing it).

### Making chunks stop rebuilding the same expensive elements

Chunks are **round-robin** slices of the dependency order, so chunk *i* holds
elements scattered across the whole graph — including elements near the very
end, whose transitive closure is almost everything. A chunk therefore builds
whatever its dependencies need that is not already in the core CAS it
restored, and different chunks redo the same work. On tuna-os/xfce-linux this
was measured at 2.6× (487 distinct elements, 1281 element-builds in one run),
and on tuna-os/tromso at 3.4×; LLVM alone was built by 4–5 chunks per run at
~2 hours each.

Two inputs address this, and neither disturbs existing GHCR chunk caches:

| Input | Default | What it does |
| --- | --- | --- |
| `extra_core_targets` | `''` | Extra elements built in `build_core` *in addition to* the first `core_split` plan entries. The chunk matrix is still derived from `core_split` alone, so chunk names and cache keys are unchanged. Anything listed here is built once and reaches every chunk through the shared core CAS. |
| `soft_core_budget` | `false` | Lets `build_core` exhaust its budget without failing the job. Core is a cache-warming job whose partial CAS is pushed either way, so when you deliberately give it more work than fits in one job the timeout is a checkpoint, not a fault. Only exit code 124 is softened. |
| `soft_chunk_budget` | `false` | Lets dependency chunks treat exit code 124 as a cache-warming checkpoint instead of failing the run. This allows the caller's `build_final` job to consume the partial CAS and lets later runs resume from the rolling cache. Real build errors still fail. |

Raising `num_chunks` is *not* a substitute: with round-robin slicing it
multiplies the duplicated closure across more runners rather than dividing
the work, and because chunk names are derived from each chunk's first element
(`chunk{i}-{label}`), changing `num_chunks` **or** `core_split` renames every
chunk and discards every warm chunk cache. `extra_core_targets` was added
specifically so the shared spine can be moved into core without paying that.

`core_budget_minutes` (default `'270'`) sets the `timeout` around core's
`bst build`. It has to stay inside the 360-minute job timeout with room for
the CAS archive+push that follows, which grows with the cache: a chunk push
of a comparable CAS has been measured at 16 minutes. The chunk budget is
deliberately left at 270 — a job-level timeout cancels the job and throws
away the whole chunk, so the remaining headroom there is not worth spending.

Enable `soft_chunk_budget` when chunks routinely reach that 270-minute limit
but still make useful progress. A timed-out chunk publishes only its rolling
`:latest` cache tag; it does not publish the exact `:<cache_key>` tag, because
that tag means the chunk completed. This makes repeated runs converge without
allowing a partial chunk to masquerade as complete. Leave the input disabled
when a timeout should block final assembly. `soft_core_budget` applies the same
exit-code-124 policy to the serial core job; the two inputs are independent.

`runner_label` / `runner_label_aarch64` (default `ubuntu-24.04` /
`ubuntu-24.04-arm`) set `runs-on` for planning, core and chunks. This is the
only lever that shortens a *single* expensive element: nothing about chunking
can split one `bst` element build across runners. A label that is not
provisioned for the calling repository queues forever, so only set it to a
label known to resolve there.

## Verification without a build

Both scripts and workflows here are checked without needing BuildStream,
podman, or a real chunked build to run:

- `tests/pytest/` — unit tests for the pure functions in
  `ci-build-matrix.py`, plus CLI-level tests that drive the script as a
  subprocess against a synthetic `build-plan.txt` (no `bst show` required).
  Run locally: `pytest tests/pytest/ -v`.
- `actionlint` + `yamllint` on every workflow file, including this repo's
  own `.github/workflows/test.yml` (dogfooded — this repo lints itself).
- Before changing the `workflow_call` `inputs:`/`outputs:` contract,
  grep both consumers for `with:` keys and `needs.multirunner.outputs.*`
  usages to make sure nothing here silently stops matching what they
  expect — GitHub doesn't validate that across repos for you.
- `scripts/lint_bst.py` — static lint for `.bst` element files (see below).

### `scripts/lint_bst.py`

Catches two classes of mistake in new/changed `.bst` files without
BuildStream, a junction fetch, or a real build. It requires Python 3 and
PyYAML (`python3 -m pip install pyyaml`):

1. **Structural**: invalid YAML and a missing `kind:` are errors. An
   unrecognized BuildStream plugin kind (including a possible typo such as
   `kind: meason`) is reported as a non-fatal warning because the script's
   built-in list may not include every valid third-party plugin.
2. **Cross-reference**: every junction-qualified dependency (anything with
   a `:` in it, e.g. `freedesktop-sdk.bst:components/foo.bst`) named by a
   new/changed file is checked against every `.bst` file already in the
   tree. A dependency referenced nowhere else is flagged — it may not
   actually exist in the junctioned project; this script only knows
   whether *this* codebase has ever successfully referenced it before, not
   whether it's real. It found exactly this kind of gap on first use:
   scaffolding `cage.bst` for tuna-os/xfce-linux#39 referenced
   `freedesktop-sdk.bst:components/wlroots.bst`, which nothing else in
   either `tromso` or `xfce-linux` had ever depended on — worth a second
   look before that PR merges.

```sh
# Lint an entire tree (structural checks only):
python3 scripts/lint_bst.py path/to/elements

# Also flag unconfirmed dependencies introduced by specific new/changed files:
python3 scripts/lint_bst.py path/to/elements --check-new path/to/elements/foo/new-thing.bst

# In CI, pair --check-new with a diff against the PR's base branch to
# scope it to files actually touched by the PR, e.g.:
#   git diff --name-only --diff-filter=AM origin/main... -- '*.bst'
```

Exits 0 unless a structural error is found (invalid YAML, missing `kind:`).
Unknown-kind and unconfirmed-dependency findings are warnings by default
since they're "go check this" signals, not certain failures. Pass `--strict`
to make unconfirmed-dependency findings fatal once you've built confidence
in their false-positive rate; unknown-kind warnings remain non-fatal.

## Scope

This repo owns the **planning + core + parallel dependency chunks** —
the mechanically identical, highest-churn part of the pipeline. It does
**not** own:

- **`build_final`** (export, `bootc container lint`, GHCR push, cosign
  signing, Trivy scan) — kept in each consuming repo. Cosign's keyless
  signing embeds the *calling* workflow's identity in the Fulcio
  certificate; if signing happened inside this shared workflow instead,
  every consumer's published signature would carry `tuna-os/bst-ci`'s
  identity instead of their own, breaking the verification instructions
  in each repo's README.
- **ISO building, Containerfiles, dracut modules, install scripts** —
  these differ meaningfully per desktop (different base images, different
  live-session setup) and aren't good candidates for a shared abstraction.

## Versioning

Consumers can pin the workflow by commit SHA:

```yaml
jobs:
  multirunner:
    uses: tuna-os/bst-ci/.github/workflows/multirunner-build.yml@<sha>
    with:
      image_name: your-image
      bst_target: oci/your-image.bst
```

Two caveats, both of which matter when you are pinning in order to be able to
roll back:

- **This repository publishes no tags or releases yet**, so a SHA is the only
  ref that resolves. Both current consumers track `main`.
- **A pin freezes the workflow definition only.** The `planning` job checks the
  helper scripts out into `.bst-ci` with `ref: main` hardcoded, so a pinned
  consumer still runs the current `scripts/ci-build-matrix.py` — the script
  that computes chunk names, the chunk matrix and the GHCR cache keys. There is
  no input for overriding that ref; passing one that the workflow does not
  declare fails the run at load time.

`runbooks/rollback.md` covers what to do when a change here breaks a consumer,
which of the two rollback levers covers which kind of regression, and the cache
blast radius to expect afterwards.

## Consumers

- [tuna-os/tromso](https://github.com/tuna-os/tromso)
- [tuna-os/xfce-linux](https://github.com/tuna-os/xfce-linux)
