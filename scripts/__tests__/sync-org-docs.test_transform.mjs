// Transform cases registered by sync-org-docs.test.mjs.

import { strict as assert } from 'node:assert';
import { onProse, sanitizeHtml, readmeIndex, isSyncedIndex } from '../lib/org-doc-transform.mjs';
import { docOutputNames } from '../sync-org-docs.mjs';

export default function transformTests(test) {
  // ── onProse: the fence guard ──────────────────────────────────────────────────
  //
  // Every MDX-safety rewrite is a regex over `<`, and the synced files are
  // mostly shell. `cmd <input` in a bash sample and `<30s` in a prose table look
  // identical to a regex, but only one may be escaped. A rewrite that reaches
  // into a fence yields a site that builds and documents commands that do not
  // run — strictly worse than the build failure it replaced.

  console.log('onProse');

  test('flattened imports preserve both root ROADMAP and docs roadmap', () => {
    const outputs = docOutputNames(['index.md', 'ROADMAP.md'], ['roadmap.md', 'install.md']);
    assert.equal(outputs.get('roadmap.md'), 'docs-roadmap.md');
    assert.equal(outputs.get('install.md'), 'install.md');
  });

  test('flattened imports reserve index and natural prefixed filenames', () => {
    const files = ['index.md', 'roadmap.md', 'docs-roadmap.md', 'ROADMAP.md'];
    const outputs = docOutputNames(['ROADMAP.md'], files);
    assert.equal(outputs.get('index.md'), 'docs-index.md');
    assert.equal(outputs.get('docs-roadmap.md'), 'docs-roadmap.md');
    assert.equal(new Set([...outputs.values(), 'index.md', 'ROADMAP.md'].map(s => s.toLowerCase())).size, 6);
    assert.deepEqual(docOutputNames(['ROADMAP.md'], [...files].reverse()), outputs);
  });

  test('README imports have distinct routes from the generated index and natural prefixed pages', () => {
    const outputs = docOutputNames(['index.md'], ['README.md', 'index.md', 'docs-README.md']);
    assert.equal(outputs.get('README.md'), 'docs-docs-README.md');
    assert.equal(outputs.get('index.md'), 'docs-index.md');
    assert.equal(outputs.get('docs-README.md'), 'docs-README.md');
    assert.equal(docOutputNames([], ['readme.md']).get('readme.md'), 'docs-readme.md');
  });

  test('README index retargets links to the removed H1 to the page top', () => {
    const source = '# TunaOS Flatpak Index\n\n[Top](#tunaos-flatpak-index)\n';
    const out = readmeIndex(source, {
      repo: 'flatpak-index', branch: 'main', label: 'flatpak-index',
      position: 1, slug: 'flatpak-index',
    });
    assert.ok(isSyncedIndex(out));
    assert.ok(out.endsWith('[Top](#)\n'));
    assert.doesNotMatch(out, /^# TunaOS Flatpak Index$/m);
  });

  test('README title link rewrites preserve other anchors and code examples', () => {
    const source = '# Title\n\n[Top](#title "Start") and [Other](#other)\n' +
      '[top]: #title\n\n`[Top](#title)`\n\n```md\n[Top](#title)\n```\n';
    const out = readmeIndex(source, {
      repo: 'example', branch: 'main', label: 'Example', position: 1, slug: 'example',
    });
    assert.ok(out.includes('[Top](# "Start") and [Other](#other)'));
    assert.ok(out.includes('[top]: #\n'));
    assert.ok(out.includes('`[Top](#title)`'));
    assert.ok(out.includes('```md\n[Top](#title)\n```'));
  });

  test('leaves fenced blocks untouched', () => {
    const src = 'prose\n\n```bash\ngit log --since=<30d>\n```\n\nmore prose\n';
    const out = onProse(src, (s) => s.replace(/</g, '&lt;'));
    assert.match(out, /--since=<30d>/, 'fenced code was rewritten');
  });

  test('leaves inline code untouched but still rewrites prose', () => {
    const out = onProse('run `foo <bar>` when x < y\n', (s) => s.replace(/</g, '&lt;'));
    assert.match(out, /`foo <bar>`/, 'inline code was rewritten');
    assert.match(out, /x &lt; y/, 'prose was not rewritten');
  });

  test('handles tilde fences', () => {
    const src = '~~~\na <30 b\n~~~\n';
    assert.equal(onProse(src, (s) => s.replace(/</g, '&lt;')), src);
  });

  // ── sanitizeHtml ──────────────────────────────────────────────────────────────
  //
  // The source repos are not wrong: one-line <details><summary>, autolinks and
  // `<30s` are all correct GitHub-flavoured markdown. MDX reads a bare `<` as
  // the start of a JSX tag, so the same text is a syntax error here.

  console.log('\nsanitizeHtml');

  test('escapes a placeholder that is not an HTML element (hive backend-setup, a table cell)', () => {
    const out = sanitizeHtml('| `catalog` | lists the <catalog> entries | yes |\n');
    assert.ok(out.includes('&lt;catalog>'), out);
  });

  test('escapes a placeholder inside emphasis', () => {
    const out = sanitizeHtml('*Talks to the <frontend> over a socket*\n');
    assert.equal(out, '*Talks to the &lt;frontend> over a socket*\n');
  });

  test('escapes the placeholders that broke ten consecutive sync runs (#359)', () => {
    // tunaos-packages TIDEFORGE-ACTION-CACHE.md and wootc manual-testing.md:
    // prose on GitHub, an unclosed JSX tag to MDX, and the daily sync red from
    // 08-22 to 08-31 until both shapes are escaped here.
    assert.match(sanitizeHtml('restore key is <artifact-digest>\n'), /&lt;artifact-digest>/);
    assert.match(sanitizeHtml('run it on <your> machine\n'), /&lt;your>/);
  });

  test('escapes a < that cannot start a tag (paperwm: <<, <-)', () => {
    assert.equal(sanitizeHtml('Use Super+<< to move, a <- b\n'), 'Use Super+&lt;&lt; to move, a &lt;- b\n');
  });

  test('leaves a code span that wraps onto the next line alone', () => {
    const md = '- `bootc install --source-imgref=docker://<image>\n  --karg=root=UUID=<uuid>`, then reboot\n';
    assert.equal(sanitizeHtml(md), md);
  });

  test('keeps real HTML elements, closing tags and code', () => {
    const md = '<details>\n<summary>More</summary>\n\n<img src="a.png" />\n\n</details>\n\n`<catalog>`\n';
    assert.equal(sanitizeHtml(md), md);
  });

  test('splits one-line details/summary across lines', () => {
    const out = sanitizeHtml('<details><summary>More</summary>\n\ntext\n\n</details>\n');
    assert.match(out, /<details>\n<summary>More<\/summary>/);
  });

  test('leaves an already-split details/summary alone', () => {
    const src = '<details>\n<summary>More</summary>\n\ntext\n\n</details>\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('keeps the indent when splitting details/summary', () => {
    const out = sanitizeHtml('  <details><summary>x</summary>\n');
    assert.match(out, /^ {2}<details>\n {2}<summary>x<\/summary>/);
  });

  test('turns an autolink into a markdown link', () => {
    const out = sanitizeHtml('see <https://example.com/a> ok\n');
    assert.match(out, /\[https:\/\/example\.com\/a\]\(https:\/\/example\.com\/a\)/);
  });

  test('does not rewrite an autolink inside a fence', () => {
    const src = '```\ncurl <https://example.com>\n```\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('leaves an ordinary markdown link alone', () => {
    const src = '[text](https://example.com)\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('escapes less-than before a digit', () => {
    assert.match(sanitizeHtml('| CI | runs in <30s |\n'), /&lt;30s/);
  });

  test('escapes less-than before whitespace', () => {
    assert.match(sanitizeHtml('a < b\n'), /a &lt; b/);
  });

  test('does not escape a real HTML tag', () => {
    const src = '<div>hi</div>\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('leaves less-than in a fenced shell sample', () => {
    const src = '```bash\ntest $x -lt 5 && cmd <input.txt\n```\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('escapes an email-style autolink', () => {
    assert.match(sanitizeHtml('<12345+bot@users.noreply.github.com>\n'), /&lt;12345\+bot@/);
  });

  test('leaves an HTML comment inside a fence', () => {
    const src = '```html\n<!-- keep me -->\n```\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('removes an HTML comment in prose', () => {
    assert.doesNotMatch(sanitizeHtml('a\n<!-- drop -->\nb\n'), /drop/);
  });

  test('drops align attributes on divs', () => {
    assert.match(sanitizeHtml('<div align="center">\n'), /<div>/);
  });

  test('self-closes a void img tag', () => {
    const out = sanitizeHtml('<img src="a.png" alt="x" width="390">\n');
    assert.match(out, /<img src="a\.png" alt="x" width="390" \/>/);
  });

  test('leaves an already self-closed void tag alone', () => {
    const src = '<img src="a.png" />\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('self-closes every void element', () => {
    for (const tag of ['br', 'hr', 'input', 'meta', 'link', 'source']) {
      assert.match(sanitizeHtml(`<${tag}>\n`), new RegExp(`<${tag} />`), `${tag} not closed`);
    }
  });

  test('does not touch a void tag inside a fence', () => {
    const src = '```html\n<img src="a.png">\n```\n';
    assert.equal(sanitizeHtml(src), src);
  });

  test('does not treat a shell placeholder as a tag', () => {
    // `corral ct create <name> --image <img>` lives in a fenced block.
    const src = '```\ncorral ct create <name> --image <img>\n```\n';
    assert.equal(sanitizeHtml(src), src);
  });
}
