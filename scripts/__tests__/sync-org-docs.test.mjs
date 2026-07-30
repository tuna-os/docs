#!/usr/bin/env node

// Unit tests for sync-org-docs.mjs.
//
// Tests the pure helper functions used by the org-wide doc aggregation
// script. Clone/git/gh operations are not tested here — those are
// integration/end-to-end concerns.
//
// These import the real functions. The previous harness read the script as
// text and re-derived each function with `eval`, falling back to an inline
// copy when that failed. It always failed, so every case printed
// "skipped (function not extractable)" and the file exited 0: a suite that
// reported success while running nothing, and which could not have caught a
// regression in the script even when the eval worked, because it tested a
// copy. sync-org-docs.mjs now exports its helpers and guards main() behind a
// run-as-command check, so there is nothing left to work around.
//
// Usage:
//   node scripts/__tests__/sync-org-docs.test.mjs

import { strict as assert } from 'node:assert';
import {
  sanitizeHtml,
  fixRelativeLinks,
  onProse,
  frontmatter,
  subFrontmatter,
  getStatusBanner,
  slugify,
} from '../sync-org-docs.mjs';

// ── Test helpers ──────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${name}: ${e.message}`);
  }
}

console.log('\n📋 sync-org-docs tests\n');

// ── onProse: the fence guard ──────────────────────────────────────────────────
//
// Every MDX-safety rewrite is a regex over `<`, and the synced files are
// mostly shell. `cmd <input` in a bash sample and `<30s` in a prose table look
// identical to a regex, but only one may be escaped. A rewrite that reaches
// into a fence yields a site that builds and documents commands that do not
// run — strictly worse than the build failure it replaced.

console.log('onProse');

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

// ── frontmatter ───────────────────────────────────────────────────────────────

console.log('\nfrontmatter');

test('emits position, label and status', () => {
  const fm = frontmatter('Corral', 101, 'corral', 'stable');
  assert.match(fm, /sidebar_position: 101/);
  assert.match(fm, /sidebar_label: "Corral"/);
  assert.match(fm, /status: stable/);
});

test('falls back to unknown status', () => {
  assert.match(frontmatter('X', 1, 'x', null), /status: unknown/);
});

test('subFrontmatter emits a title', () => {
  const fm = subFrontmatter('Testing', 5);
  assert.match(fm, /sidebar_position: 5/);
  assert.match(fm, /title: "Testing"/);
});

// ── getStatusBanner ───────────────────────────────────────────────────────────

console.log('\ngetStatusBanner');

test('returns a banner for each known status', () => {
  for (const s of ['alpha', 'experimental', 'beta', 'internal', 'deprecated']) {
    assert.ok(getStatusBanner(s), `no banner for ${s}`);
  }
});

test('returns null for stable and for an unknown status', () => {
  assert.equal(getStatusBanner('stable'), null);
  assert.equal(getStatusBanner('nonsense'), null);
});

// ── slugify ───────────────────────────────────────────────────────────────────

console.log('\nslugify');

test('lowercases and collapses separators', () => {
  assert.equal(slugify('Bluefin_CLI'), 'bluefin-cli');
  assert.equal(slugify('XFCE Linux'), 'xfce-linux');
  assert.equal(slugify('tunaOS'), 'tunaos');
});

// ── summary ───────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
