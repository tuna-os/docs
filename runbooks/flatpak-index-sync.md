# Runbook: Syncing the Vendored Flatpak update-index Script

## Overview

This repository vendors a copy of the `update-index.py` script from [tuna-os/flatpak-index](https://github.com/tuna-os/flatpak-index/blob/main/scripts/update-index.py) at `.github/scripts/update-index.py`. The script is used in `.github/workflows/deploy-flatpak.yml` to add or update application entries in the Flatpak OCI remote index.

Because it is vendored and not dynamically fetched, it can drift from the canonical source. This runbook documents how to detect, verify, and sync the copy.

## When to Sync

Sync the script when:

- The canonical script in `tuna-os/flatpak-index` has been updated (e.g., to support new Flatpak metadata, AppStream labels, or OCI image config fields)
- Your local diff detects mismatches (see Detection below)
- The `deploy-flatpak.yml` workflow fails with an error related to indexing or OCI image handling
- You are updating Flatpak tooling and need to verify the indexing logic is compatible

## Detection

### 1. Fetch the Current Canonical Version

```bash
# Clone or update flatpak-index to get the latest canonical script
git clone https://github.com/tuna-os/flatpak-index /tmp/flatpak-index-check
# Or if already cloned: cd /tmp/flatpak-index-check && git fetch origin main
```

### 2. Compare Against the Vendored Copy

```bash
diff -u /tmp/flatpak-index-check/scripts/update-index.py .github/scripts/update-index.py
```

If the output is empty, the scripts are in sync. If there are differences, continue to the Sync procedure below.

### 3. Understand the Differences

Review the diff for:

- **Algorithm changes** (e.g., new OCI config merging logic) — these require careful testing
- **Metadata preservation** (e.g., AppStream labels) — important to keep for Flatpak software centres
- **Error handling or validation** — may affect robustness of the publish workflow
- **Docstring updates** — documentation-only, lowest risk

## Sync Procedure

### 1. Update the Vendored Copy

```bash
cp /tmp/flatpak-index-check/scripts/update-index.py .github/scripts/update-index.py
```

### 2. Verify It Is Executable

```bash
chmod +x .github/scripts/update-index.py
```

### 3. Test Locally (Dry Run)

The script is used in `deploy-flatpak.yml` to merge OCI image metadata. To validate the script logic without a full build:

```bash
# If you have a test OCI image bundle, untar it and inspect:
cd /tmp/test-flatpak-bundle
python3 ../../docs/.github/scripts/update-index.py --help
```

The script should display its usage without errors. If it fails to parse or has syntax errors, the Flatpak workflow will also fail.

### 4. Test the Workflow (Recommended)

If you can trigger a test publish:

1. Create a minimal test app or use an existing image
2. Push a PR that includes your synced script
3. Merge to a staging branch and run `.github/workflows/deploy-flatpak.yml` manually
4. Verify the Flatpak remote index updates correctly and the OCI image metadata is preserved

### 5. Commit the Change

```bash
git add .github/scripts/update-index.py
git commit -s -m "chore(flatpak): sync vendored update-index script with tuna-os/flatpak-index"
```

If this sync resolves a specific issue, use:

```bash
git commit -s -m "chore(flatpak): sync vendored update-index script with tuna-os/flatpak-index

Syncs .github/scripts/update-index.py to canonical version in tuna-os/flatpak-index.
Picks up [reason, e.g., AppStream label preservation, new OCI config fields]."
```

## Verification After Merge

Once the PR is merged and deployed:

1. Monitor the Flatpak remote index for completeness (check for app metadata, icons, descriptions)
2. Verify software centres can fetch and display applications from the TunaOS Flatpak remote
3. If AppStream metadata is missing or broken, see the deployment troubleshooting in the [docs site diagnostics runbook](./site-diagnostics.md)

## Cross-Repository Coordination

If you are also updating the canonical script in `tuna-os/flatpak-index`, coordinate the timing:

1. Land the change in `tuna-os/flatpak-index` first
2. Wait for that PR to merge and for a release if one is required
3. Then sync this repository's vendored copy using this runbook

This ensures the script versions stay coherent and changes are testable in their source repo before being imported.
