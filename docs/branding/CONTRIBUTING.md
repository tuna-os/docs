---
sidebar_position: 2
title: "Contributing"
---

`branding` holds the canonical TunaOS variant marks (SVGs) and the
machine-readable asset manifest (`branding-manifest.json`) that downstream
consumers — installers, docs, ISO welcome screens — pin against and verify.
There is no application to build here; contributions are mostly new or
updated SVG marks, manifest updates, doc changes, and the Python test suite
in `tests/`.

## Proposing or updating a brand asset

1. For anything beyond a small fix, open an issue first describing the
   change (new variant, palette tweak, etc.).
2. Follow the existing visual system described in `README.md`: 128x128
   viewBox, one accent color per variant, the real field mark of the
   species, `#0B1B2B` (abyss) for detail color, and no external references
   (fonts, images, `url()`) — these are the properties `tests/test_branding.py`
   enforces.
3. After changing an SVG, update its digest in `branding-manifest.json` from
   the repository root:

   ```bash
   asset=<name>.svg
   digest=$(sha256sum "$asset" | cut -d ' ' -f 1)
   jq --arg asset "$asset" --arg digest "sha256:$digest" \
     '.assets[$asset] = $digest' branding-manifest.json > branding-manifest.json.new
   mv branding-manifest.json.new branding-manifest.json
   ```

   Keep the manifest update in the same commit as the SVG change, and make
   sure the manifest neither omits nor names an extra SVG (see the `diff`
   check in `README.md`).

## Running the test suite

```bash
python3 -m unittest discover -s tests
```

This validates manifest schema compliance, that the manifest and the root
SVG set match exactly, SHA-256 digest matching, the 128x128 viewBox, and the
absence of external references. Run this (and the manual `jq`/`sha256sum`
checks documented in `README.md`) before opening a pull request.

## Code style

The Python test suite is linted with [Ruff](https://docs.astral.sh/ruff/)
(configured in `ruff.toml`):

```bash
ruff check tests/
```

## Branch and PR convention

Use a short, prefixed branch name describing the change (e.g. `fix/`,
`docs/`, `feat/`, `chore/`), matching the convention used across `tuna-os`
repositories, and reference any issue the PR addresses.

## Reporting issues

Open an issue in this repository. For anything security-related, use the
private channel described in `tuna-os/.github`'s `SECURITY.md` rather than a
public issue.
