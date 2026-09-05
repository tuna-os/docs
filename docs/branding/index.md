---
sidebar_position: 1
sidebar_label: "branding"

status: unknown
---

Flat vector marks for every TunaOS variant, drawn as one system: same
geometry language, one accent color per variant, and each species identified
by its real field mark — not just a palette swap.

| Mark | Accent | Field mark |
|---|---|---|
| `tunaos.svg` | `#2EC4B6` sonar | Master mark — roundel + fish |
| `albacore.svg` | `#7FB7D9` ice | Very long pectoral fin |
| `yellowfin.svg` | `#F4C542` yellow | Sickle dorsal/anal fins + finlets |
| `skipjack.svg` | `#6C8EF5` periwinkle | Horizontal belly stripes |
| `bonito.svg` | `#F4A259` coral | Oblique back stripes |
| `marlin.svg` | `#3D7BF4` cobalt | Spear bill + sail dorsal |
| `flounder.svg` | `#C4915C` sand | Flat oval, both eyes on one side, speckles |
| `grouper.svg` | `#C75146` red | Deep body, downturned mouth, spiny dorsal, spots |
| `guppy.svg` | `#E05299` magenta | Tiny body, huge two-tone fan tail |

Detail color everywhere: `#0B1B2B` (abyss) — mid-tone accents keep the marks
legible on both light and dark backgrounds. All files are 128×128 viewBox,
self-contained (no external refs), safe for Flatpak/live-ISO offline use.

## Usage

- Installer Source-step cards: render at 96 px.
- Welcome pages / ISO boot menus: 128–512 px, scale freely.
- These are the source of truth. Consumers should pin a commit or release from
  this repository and verify copied files against `branding-manifest.json`.
- The installer consumer is
  [`tuna-os/fisherman:data/images/`](https://github.com/tuna-os/fisherman/tree/main/data/images/).
  Update its pin and vendored assets together; do not copy an unversioned branch
  tip.

`branding-manifest.json` is the machine-readable asset contract. Its
`schema_version` covers the manifest format, while each value binds an asset
name to its SHA-256 digest. Consumers can reject missing, extra, or modified
assets before packaging an installer.

## Maintaining the manifest

After intentionally changing an SVG, update its digest in
`branding-manifest.json` from the repository root:

```bash
asset=albacore.svg
digest=$(sha256sum "$asset" | cut -d ' ' -f 1)
jq --arg asset "$asset" --arg digest "sha256:$digest" \
  '.assets[$asset] = $digest' branding-manifest.json > branding-manifest.json.new
mv branding-manifest.json.new branding-manifest.json
```

Replace `albacore.svg` with the asset that changed. Keep the manifest update in
the same commit as the SVG change. Before committing, verify every declared
asset and make sure the manifest neither omits nor names an extra SVG:

```bash
jq -r '.assets | to_entries[] | "\(.value | sub("sha256:"; ""))  \(.key)"' \
  branding-manifest.json | sha256sum --check --strict

diff -u \
  <(find . -maxdepth 1 -type f -name '*.svg' -printf '%f\n' | sort) \
  <(jq -r '.assets | keys[]' branding-manifest.json | sort)
```

Both commands should finish without errors or differences.

## Running Tests

An automated Python test suite is provided in `tests/test_branding.py` to validate manifest schema compliance, SVG dimensions (128x128), SHA-256 digest matching, asset completeness, and absence of external references.

Run the test suite using Python's standard `unittest` module:

```bash
python3 -m unittest discover -s tests
```

## License

CC-BY-4.0 — see [LICENSE](https://github.com/tuna-os/branding/blob/main/LICENSE). These marks may be used to refer to the
TunaOS project (installers, docs, community content, etc.) with attribution;
use does not imply endorsement by the TunaOS project.
