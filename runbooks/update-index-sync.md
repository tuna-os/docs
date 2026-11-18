# Runbook: Sync the vendored update-index.py

`.github/scripts/update-index.py` is a vendored copy of `scripts/update-index.py`
in `tuna-os/flatpak-index`. The `flatpak-index` copy is canonical. Do not edit
the copy here. The two copies have drifted before, and no check compares them.

## When to run this

- `flatpak-index` changed `scripts/update-index.py`.
- `build-flatpaks.yml` fails at the step that runs `update-index.py`.
- `flatpak-sanity.yml` fails on a change to the script.

## Detect drift

```bash
curl -fsSL https://raw.githubusercontent.com/tuna-os/flatpak-index/main/scripts/update-index.py \
  | diff -u - .github/scripts/update-index.py
```

No output means the copies match. Any output means drift.

## Sync

1. Confirm the source repo is still canonical. The docstring at the top of
   its `scripts/update-index.py` says "This is the canonical copy".
2. Replace the local file with the canonical file:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/tuna-os/flatpak-index/main/scripts/update-index.py \
     -o .github/scripts/update-index.py
   ```

3. Update `.github/scripts/tests/test_update_index.py` if the new behavior
   changes its expected results.
4. Run the detect command again. The output must be empty.
5. Open a PR. CI runs `flatpak-sanity.yml` for changes to the script.

## Which workflows use the script

- `build-flatpaks.yml` runs it to update the OCI index.
- `flatpak-sanity.yml` runs when the script or its tests change.

## Fixes that apply to both copies

Open an issue in `tuna-os/flatpak-index`. Fix it there first, then sync here.

## Open questions

- No script or CI check compares the two copies. This runbook is manual.
- A migration of `build-flatpaks.yml` to a shared composite action in
  `tuna-os/.github` may remove the vendored copy. If it does, retire this
  runbook.
