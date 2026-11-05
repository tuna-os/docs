# Runbook: Syncing the Vendored update-index.py

## What This Is

`.github/scripts/update-index.py` is a vendored copy of
`scripts/update-index.py` in [`tuna-os/flatpak-index`](https://github.com/tuna-os/flatpak-index).
The docs copy is made by hand from the source. Nothing auto-syncs it, so the
two can drift. The flatpak-index copy is the source of truth; this repo copy is
a downstream mirror. Sync always flows from flatpak-index to docs.

## When Drift Appears

- `tuna-os/flatpak-index` changes `update-index.py` (a new fix or feature).
- Flatpak or the OCI bundle format changes (a new label, a changed config).
- `build-flatpaks.yml` starts to fail, or the published index is missing an
  entry or points at the wrong app.

## Detect Drift

Diff the vendored copy against the canonical source.

```bash
# Fetch the canonical source from flatpak-index
curl -sfL https://raw.githubusercontent.com/tuna-os/flatpak-index/main/scripts/update-index.py -o /tmp/update-index.canonical.py

# Compare it with the vendored copy
diff -u .github/scripts/update-index.py /tmp/update-index.canonical.py
```

Lines that start with `-` come from the vendored copy; lines that start with
`+` come from the source. Any such lines mean the copies disagree. An empty
output means they agree.

## Confirm The Source Is Authoritative

`tuna-os/flatpak-index` owns the script. This repo only mirrors it. When the
copies disagree, the flatpak-index version wins. Do not edit the vendored copy
to match a change that belongs upstream; update it to match the source instead.

## Sync

Replace the vendored copy with the canonical source, then confirm the diff is
empty.

```bash
# Overwrite the vendored copy with the canonical source
curl -sfL https://raw.githubusercontent.com/tuna-os/flatpak-index/main/scripts/update-index.py -o .github/scripts/update-index.py

# The diff must now be empty
diff -u .github/scripts/update-index.py /tmp/update-index.canonical.py
```

Keep the file byte-for-byte identical to the source. It is a copy, not a fork.
The script is self-contained (standard library only), so never add a
dependency to it.

## Test Before You Commit

The script has a pytest suite in `.github/scripts/tests/`. Run it locally.

```bash
python3 -m pytest .github/scripts/tests/test_update_index.py
```

Then lint the change and run the Node tests.

```bash
just preflight
```

## Verify In CI

`build-flatpaks.yml` is the workflow that runs the vendored script. It runs
daily at 06:00 UTC and on manual dispatch. It clones this repo as the index
target, runs `update-index.py` to rebuild the OCI index, and commits the result
to `static/flatpak/index/static`. Push the branch and watch that workflow. The
CI does not run the pytest suite here, so the local run above is the test.

## Notes

- You can also reach the canonical source through the
  ``update-flatpak-index`` composite action in ``tuna-os/.github``. The vendored
  copy still stands on its own; use the action only where a workflow already
  calls it.
- If the diff shows a change you cannot explain, read the flatpak-index commit
  that made it before you sync it. A change that is still open there is not ready
  to land in the mirror.
