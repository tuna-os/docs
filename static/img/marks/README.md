# Vendored variant marks

Flat vector marks for the TunaOS variants, copied from
[tuna-os/branding](https://github.com/tuna-os/branding) at commit
`cf1a879c49e377250a1bddc50908e33a191e2771`. That repository is the source of
truth: **fix a mark there, then re-vendor here** — an edit to these files is
undone the next time they are refreshed, and it breaks the digest check.

`branding-manifest.json` is copied alongside them and is the asset contract:
it binds each file name to its SHA-256 digest.
`scripts/check-branding-marks.test.mjs` verifies every vendored SVG against it
on every test run, so a silent edit or a truncated copy fails rather than
shipping.

To refresh:

```bash
git clone --depth 1 https://github.com/tuna-os/branding /tmp/branding
cp /tmp/branding/*.svg /tmp/branding/branding-manifest.json static/img/marks/
node scripts/check-branding-marks.test.mjs
```

Then update the commit named above in the same change.

Not every variant has a mark. `src/data/marks.ts` maps the ones that do,
points the rolling-release siblings at their parent's mark, and falls back to
the master `tunaos.svg` for the rest.
