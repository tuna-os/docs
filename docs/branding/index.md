---
sidebar_position: 1
sidebar_label: "branding"

status: unknown
---

The tunaOS identity has two forms. Both come from
[tuna-os/tunaOS](https://github.com/tuna-os/tunaOS).

| Form | Source in tunaOS | Use |
|---|---|---|
| Wordmark (lettermark) | `system_files/usr/share/tunaos/lettermarks/<variant>.svg` and `<variant>-dark.svg` | Wide contexts: headers, cards, hero, login screens |
| Noto emoji mark | `system_files/usr/share/tunaos/logos/<variant>.svg` and `system_files/usr/share/pixmaps/tunaos.svg` | Small icons: favicons, app and distro icons, terminal |

The wordmark names the variant in the Baloo 2 typeface beside its Noto emoji
mark. Use the `-dark` file on dark backgrounds. The emoji mark alone is for
places too small for text.

## Usage

- Consumers pin a tunaOS commit and copy the files they need.
- Consumers verify the copied files against a SHA-256 manifest. This site
  keeps its copy in `static/img/identity/` with `identity-manifest.json`.
  `scripts/check-identity-assets.test.mjs` verifies it.
- Put no other emoji in interface text.

## License

CC-BY-4.0 — see [LICENSE](https://github.com/tuna-os/branding/blob/main/LICENSE). These marks may be used to refer to the
TunaOS project (installers, docs, community content, etc.) with attribution;
use does not imply endorsement by the TunaOS project.
