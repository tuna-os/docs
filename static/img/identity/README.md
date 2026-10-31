# Vendored tunaOS identity

These files are copied from
[tuna-os/tunaOS](https://github.com/tuna-os/tunaOS). The commit is in
`identity-manifest.json`. That repository is the source of truth. Fix a file
there, then vendor it again here. A local edit breaks the digest check.

- `wordmarks/<variant>.svg` and `wordmarks/<variant>-dark.svg` come from
  `system_files/usr/share/tunaos/lettermarks/`. Use them in wide contexts:
  headers, cards and the hero. The `-dark` file is for dark backgrounds.
- `emoji/<variant>.svg` comes from `system_files/usr/share/tunaos/logos/`.
  `emoji/tunaos.svg` comes from `system_files/usr/share/pixmaps/tunaos.svg`.
  Use them for small icons, the navbar logo and the favicon.

`identity-manifest.json` binds each file to its SHA-256 digest.
`scripts/check-identity-assets.test.mjs` verifies every vendored SVG against
it.

To refresh:

```bash
git clone --depth 1 https://github.com/tuna-os/tunaOS ~/src/tunaOS
T=~/src/tunaOS/system_files/usr/share
cp $T/tunaos/lettermarks/*.svg static/img/identity/wordmarks/
cp $T/tunaos/logos/*.svg static/img/identity/emoji/
cp $T/pixmaps/tunaos.svg static/img/identity/emoji/tunaos.svg
node scripts/check-identity-assets.test.mjs --write
node scripts/check-identity-assets.test.mjs
```

Then set the `commit` field in the manifest to the tunaOS commit you copied.

`src/data/identity.ts` maps variants to these files. A variant without its
own file falls back to the master `emoji/tunaos.svg`.
