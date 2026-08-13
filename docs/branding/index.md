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
- These are the source of truth; PR them to
  `projectbluefin/fisherman:data/images/` to replace the current placeholder
  clip-art (where `albacore.svg` is byte-identical to `tunaos.svg`).

Regenerate the preview sheet with cairosvg (see `sheet.py` pattern in repo
history / any cairosvg one-liner).
