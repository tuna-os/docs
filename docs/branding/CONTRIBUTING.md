---
sidebar_position: 2
title: "Contributing"
---

`branding` holds the TunaOS marks: lettermark wordmarks in `wordmarks/` and
Noto emoji marks in `marks/`. It also
holds the machine-readable asset manifest (`branding-manifest.json`) that
downstream consumers — installers, docs, ISO welcome screens — pin against
and verify.
There is no application to build here. Contributions are mostly
marks copied from the tunaOS generator, manifest updates, doc changes, and the Python test suite
in `tests/`.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Proposing or updating a brand asset

1. For anything beyond a small fix, open an issue first that describes the
   change (new variant, palette tweak, etc.).
2. Do not draw or edit marks here. Change
   `scripts/branding/make-lettermarks.py` in tuna-os/tunaOS, then copy its
   output into `marks/` and `wordmarks/`. `tests/test_branding.py` enforces
   these properties:
   - Emoji marks have a 128x128 viewBox.
   - Each variant mark has a light and a `-dark` wordmark.
   - No external references (fonts, images, `url()`).
   - Each asset name in the manifest ends in `.svg`.
   - Only the static SVG elements that the test allows (`ALLOWED_ELEMENTS`
     in the test), so no `<style>`, `<script>`, `<text>`, `<image>`, `<a>`, `<set>`
     or `<foreignObject>`. Adding an element needs a reviewed change to that list.
   - No `<!DOCTYPE>` and no `<?…?>` instruction other than the XML declaration.
   - Every `url(` points at `#id`, in any letter case. No attribute value has
     a backslash or a quote.
   - Namespaced attributes are limited to `xlink:href`, `xml:space` and `xml:lang`.
   - No `on*` event handlers or `javascript:` URIs.
3. After you change an SVG, regenerate `branding-manifest.json` from the
   repository root. This updates both `assets` and `canonical_assets`:

   ```bash
   python3 scripts/branding_manifest.py update
   ```

   Keep the manifest update in the same commit as the SVG change. Make sure
   that each SVG in `marks/` and `wordmarks/` has an entry in the manifest, and that the manifest has
   no other entries (see the `diff` check in `README.md`).

## Running the test suite

> **CI does not regenerate the manifest for you.** CI
> (`.github/workflows/ci.yml`) only verifies it: it never updates
> `branding-manifest.json`. If an SVG changes and its digests do not, the
> build fails. Downstream consumers, such as fisherman, check the files
> they copy against this manifest. A digest that disagrees with its file is a
> supply-chain break for them. Catch it locally before you open a PR.

Checklist before you open a PR:

- [ ] Run `python3 scripts/branding_manifest.py update` after you change an
  SVG, and commit the manifest with the SVG.
- [ ] `python3 -m unittest discover -s tests`
- [ ] `ruff check .`
- [ ] The `sha256sum --check` and `diff` manifest checks from `README.md`.

```bash
python3 -m unittest discover -s tests
```

The suite validates the manifest schema and makes sure that the manifest
matches the set of SVGs. It also checks the SHA-256 digests, the 128x128
viewBox of emoji marks, and that no file has external references. Run the suite (and the
manual `jq`/`sha256sum` checks in `README.md`) before you open a pull request.

## Code style

[Ruff](https://docs.astral.sh/ruff/) lints the Python code in `tests/` and
`scripts/`, as CI does (the configuration is in `ruff.toml`):

```bash
ruff check .
```

## Branch and PR convention

Use a short, prefixed branch name that describes the change (e.g. `fix/`,
`docs/`, `feat/`, `chore/`), matching the convention used across `tuna-os`
repositories, and reference any issue the PR addresses.

## Reporting issues

Open an issue in this repository. For anything security-related, use the
private channel described in `tuna-os/.github`'s `SECURITY.md`, not a
public issue.
