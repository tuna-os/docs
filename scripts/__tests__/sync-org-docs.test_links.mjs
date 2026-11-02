// Links cases registered by sync-org-docs.test.mjs.

import { strict as assert } from 'node:assert';
import { fixRelativeLinks } from '../lib/org-doc-transform.mjs';

export default function linksTests(test) {
  // ── fixRelativeLinks ──────────────────────────────────────────────────────────
  //
  // Images need bytes, not a page: github.com/…/blob/… answers text/html, so an
  // image pointed at it renders broken. raw.githubusercontent.com answers
  // image/png.

  console.log('\nfixRelativeLinks');

  test('gives a bare relative image a raw.githubusercontent URL', () => {
    const out = fixRelativeLinks('![Fleet](docs/screenshots/web-fleet.png)\n', 'corral');
    assert.equal(
      out.trim(),
      '![Fleet](https://raw.githubusercontent.com/tuna-os/corral/main/docs/screenshots/web-fleet.png)',
    );
  });

  test('strips ./ from a relative image path', () => {
    const out = fixRelativeLinks('![x](./a/b.png)\n', 'corral');
    assert.match(out, /raw\.githubusercontent\.com\/tuna-os\/corral\/main\/a\/b\.png/);
    assert.doesNotMatch(out, /main\/\.\//);
  });

  test('never points an image at a blob URL', () => {
    const out = fixRelativeLinks('![x](./a.png)\n![y](b/c.svg)\n', 'corral');
    assert.doesNotMatch(out, /!\[[^\]]*\]\(https:\/\/github\.com/);
  });

  test('covers every image extension the repos use', () => {
    for (const ext of ['png', 'svg', 'jpg', 'jpeg', 'gif', 'webp']) {
      const out = fixRelativeLinks(`![x](img/a.${ext})\n`, 'corral');
      assert.match(out, /raw\.githubusercontent\.com/, `${ext} was not rewritten`);
    }
  });

  test('leaves an absolute image URL alone', () => {
    const src = '![badge](https://github.com/tuna-os/x/actions/workflows/ci.yml/badge.svg)\n';
    assert.equal(fixRelativeLinks(src, 'corral'), src);
  });

  test('keeps an image title attribute', () => {
    const out = fixRelativeLinks('![x](a.png "the title")\n', 'corral');
    assert.match(out, /main\/a\.png "the title"\)/);
  });

  test('sends a relative .md link to the blob URL', () => {
    const out = fixRelativeLinks('[docs](./CONTRIBUTING.md)\n', 'corral');
    assert.match(out, /github\.com\/tuna-os\/corral\/blob\/main\/CONTRIBUTING\.md/);
  });

  test('sends a bare relative .md link to the blob URL', () => {
    const out = fixRelativeLinks('[roadmap](ROADMAP.md)\n', 'corral');
    assert.match(out, /github\.com\/tuna-os\/corral\/blob\/main\/ROADMAP\.md/);
  });

  test('leaves an anchor link alone', () => {
    const src = '[top](#heading)\n';
    assert.equal(fixRelativeLinks(src, 'corral'), src);
  });

  test('rewrites a relative src on a raw HTML img tag', () => {
    const out = fixRelativeLinks('<img src="docs/screenshots/a.png" width="390">\n', 'corral');
    assert.match(out, /src="https:\/\/raw\.githubusercontent\.com\/tuna-os\/corral\/main\/docs\/screenshots\/a\.png"/);
  });

  test('leaves an absolute src on an img tag alone', () => {
    const src = '<img src="https://example.com/a.png" />\n';
    assert.equal(fixRelativeLinks(src, 'corral'), src);
  });

  test('leaves a site-absolute img src alone, it belongs to static/', () => {
    const src = '<img src="/img/screenshots/a.png" alt="x" />\n';
    assert.equal(fixRelativeLinks(src, 'corral'), src);
  });

  // A relative path resolves against the file that contains it, not the repo
  // root. docs/user-guide.md saying `screenshots/a.png` means
  // docs/screenshots/a.png. Getting this wrong yields a 404 that still builds,
  // because Docusaurus does not validate remote images.

  test('resolves a relative image against the source subdirectory', () => {
    const out = fixRelativeLinks('![Fleet](screenshots/generated/web-fleet.png)\n', 'corral', 'docs');
    assert.match(out, /main\/docs\/screenshots\/generated\/web-fleet\.png/);
  });

  test('resolves ../ back out of the source subdirectory', () => {
    const out = fixRelativeLinks('![x](../assets/a.png)\n', 'corral', 'docs');
    assert.match(out, /main\/assets\/a\.png/);
    assert.doesNotMatch(out, /\.\./);
  });

  test('resolves a nested source subdirectory', () => {
    const out = fixRelativeLinks('![x](img/a.png)\n', 'tunaOS', 'docs/book/src');
    assert.match(out, /main\/docs\/book\/src\/img\/a\.png/);
  });

  test('a README at the repo root is unaffected', () => {
    const out = fixRelativeLinks('![x](docs/screenshots/a.png)\n', 'corral', '');
    assert.match(out, /main\/docs\/screenshots\/a\.png/);
  });

  test('resolves an HTML img src against the source subdirectory', () => {
    const out = fixRelativeLinks('<img src="screenshots/a.png" />\n', 'corral', 'docs');
    assert.match(out, /main\/docs\/screenshots\/a\.png/);
  });

  test('resolves a relative .md link against the source subdirectory', () => {
    const out = fixRelativeLinks('[spec](design/spec.md)\n', 'corral', 'docs');
    assert.match(out, /blob\/main\/docs\/design\/spec\.md/);
  });

  test('leaves a site-absolute link alone', () => {
    const src = '[guide](/docs/corral/user-guide)\n';
    assert.equal(fixRelativeLinks(src, 'corral'), src);
  });

  // #263: bootc-installer/fisherman use dev, changelog-action/kde-build-meta/
  // mariner use master — hardcoding main rewrote their links to a branch that
  // does not exist for them, 404ing every repo-relative link and image.

  test('uses the given branch for a blob link, not a hardcoded main', () => {
    const out = fixRelativeLinks('[docs](./CONTRIBUTING.md)\n', 'bootc-installer', '', 'dev');
    assert.match(out, /github\.com\/tuna-os\/bootc-installer\/blob\/dev\/CONTRIBUTING\.md/);
    assert.doesNotMatch(out, /\/blob\/main\//);
  });

  test('uses the given branch for a raw image URL, not a hardcoded main', () => {
    const out = fixRelativeLinks('![x](a.png)\n', 'changelog-action', '', 'master');
    assert.match(out, /raw\.githubusercontent\.com\/tuna-os\/changelog-action\/master\/a\.png/);
    assert.doesNotMatch(out, /\/main\//);
  });

  test('defaults to main when no branch is given, for backward compatibility', () => {
    const out = fixRelativeLinks('[docs](./CONTRIBUTING.md)\n', 'corral');
    assert.match(out, /\/blob\/main\/CONTRIBUTING\.md/);
  });

  // Repo-relative links that are not .md/.rst files used to fall through the
  // regexes unchanged and ship as 404s on the docs site (#135). A LICENSE, a
  // YAML file, a release-list link and an anchored .md link all live in the
  // source repo, so each has to resolve against github.com.

  test('sends a bare LICENSE link to the blob URL', () => {
    const out = fixRelativeLinks('[License](LICENSE)\n', 'tunaOS');
    assert.equal(
      out.trim(),
      '[License](https://github.com/tuna-os/tunaOS/blob/main/LICENSE)',
    );
  });

  test('sends dual-license filenames to the blob URL', () => {
    const out = fixRelativeLinks('[MIT](LICENSE-MIT) or [Apache](LICENSE-APACHE)\n', 'bootc-migrate');
    assert.match(out, /blob\/main\/LICENSE-MIT/);
    assert.match(out, /blob\/main\/LICENSE-APACHE/);
  });

  test('points a releases link at the GitHub releases page', () => {
    const out = fixRelativeLinks('[Releases](../../releases)\n', 'bootc-migrate');
    assert.equal(
      out.trim(),
      '[Releases](https://github.com/tuna-os/bootc-migrate/releases)',
    );
  });

  test('sends a relative YAML link to the blob URL', () => {
    const out = fixRelativeLinks(
      '[`manifests/package-factory.yaml`](../manifests/package-factory.yaml)\n',
      'tunaos-packages',
      'docs',
    );
    assert.equal(
      out.trim(),
      '[`manifests/package-factory.yaml`](https://github.com/tuna-os/tunaos-packages/blob/main/manifests/package-factory.yaml)',
    );
  });

  test('rewrites the path of an anchored .md link and keeps the anchor', () => {
    const out = fixRelativeLinks('[CLAUDE.md](CLAUDE.md#adding-a-new-page)\n', 'Tavern');
    assert.equal(
      out.trim(),
      '[CLAUDE.md](https://github.com/tuna-os/Tavern/blob/main/CLAUDE.md#adding-a-new-page)',
    );
  });

  test('sends a bare non-markdown file link to the blob URL', () => {
    const out = fixRelativeLinks(
      '[formula](contrib/homebrew/bluefin-cli.rb)\n',
      'bluefin-cli',
    );
    assert.equal(
      out.trim(),
      '[formula](https://github.com/tuna-os/bluefin-cli/blob/main/contrib/homebrew/bluefin-cli.rb)',
    );
  });

  test('rewrites a reference-style definition pointing at a directory to the tree URL', () => {
    const out = fixRelativeLinks('[runtime]: runtime/\n', 'iced', '', 'master');
    assert.match(out, /github\.com\/tuna-os\/iced\/tree\/master\/runtime/);
  });

  test('rewrites a reference-style definition from docs/ against the repo root', () => {
    const out = fixRelativeLinks(
      '[ADR 0001]: architecture-decisions/0001-linear-storage-dag-overlay.md\n',
      'spindle', 'docs',
    );
    assert.match(out, /github\.com\/tuna-os\/spindle\/blob\/main\/docs\/architecture-decisions\/0001-linear-storage-dag-overlay\.md/);
  });

  test('keeps the anchor on a reference-style definition', () => {
    const out = fixRelativeLinks('[tour example]: examples/README.md#tour\n', 'iced', '', 'master');
    assert.match(out, /blob\/master\/examples\/README\.md#tour/);
  });

  test('leaves absolute and footnote definitions alone', () => {
    const src = '[ruma]: https://github.com/ruma/ruma\n[^1]: See the matrix spec\n';
    assert.equal(fixRelativeLinks(src, 'spindle', 'docs'), src);
  });
}
