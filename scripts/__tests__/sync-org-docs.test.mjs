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
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  sanitizeHtml,
  fixRelativeLinks,
  onProse,
  frontmatter,
  subFrontmatter,
  isSyncedIndex,
  getStatusBanner,
  slugify,
  listOrgRepos,
  checkListing,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
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

// ── isSyncedIndex ─────────────────────────────────────────────────────────────
//
// ste-lint asks isSyncedIndex which docs/<slug>/ trees this script owns, and
// skips those trees because the next sync overwrites them. The matcher is
// written out separately from the template it matches, so these cases feed the
// template's real output through it: change frontmatter() without changing the
// matcher and this fails, instead of a tree quietly leaving or entering the
// style budget.

console.log('\nisSyncedIndex');

test('matches what frontmatter() writes', () => {
  assert.ok(isSyncedIndex(frontmatter('Corral', 101, 'corral', 'stable')));
  assert.ok(isSyncedIndex(frontmatter('X', 1, 'x', null)), 'including the unknown-status default');
});

test('matches an index page with its body and status banner', () => {
  const page = frontmatter('Tromsø', 1, 'tromso', 'alpha') +
    getStatusBanner('alpha') + '\n\nThe image builds with BuildStream.\n';
  assert.ok(isSyncedIndex(page));
});

test('rejects front matter a person typed', () => {
  // docs/mariner/index.md — the same three keys, no blank line before status.
  assert.ok(!isSyncedIndex(
    '---\nsidebar_position: 1\nsidebar_label: "Mariner"\nstatus: alpha\n---\n\nMariner.\n',
  ));
});

test('rejects a subpage template', () => {
  // subFrontmatter is sidebar_position plus a quoted title, which is also what
  // a hand-written page uses — docs/flatpak/guide.md has exactly that shape and
  // no upstream repo. Only the index template decides.
  assert.ok(!isSyncedIndex(subFrontmatter('Contributing', 2)));
});

test('rejects a page with no front matter', () => {
  assert.ok(!isSyncedIndex('# Mandelbrot\n\nA Matrix client.\n'));
});

test('rejects front matter that is not at the start of the file', () => {
  assert.ok(!isSyncedIndex('Intro paragraph.\n\n' + frontmatter('X', 1, 'x', 'alpha')));
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

// ── listOrgRepos: the repo listing must cross page boundaries ─────────────────
//
// The bug in #103 was invisible because its output was well-formed: the first
// 30 names, no error, exit 0. So this exercises the real command line against a
// stub `gh` on PATH rather than a stubbed-out function — the flags have to
// actually reach gh for the fix to hold, and a test that mocked listOrgRepos
// itself would pass just as happily against the unpaginated call.
//
// The stub reproduces the part of gh's behaviour that shapes the code: with
// --paginate and --jq, gh runs the filter once per page and concatenates the
// results, so the caller receives one name per line across every page.

console.log('\nlistOrgRepos');

// stubGh writes a fake `gh` into a fresh dir and returns that dir.
//   pages    — array of arrays of repo names, one array per API page
//   paginate — when false, the stub ignores --paginate and answers page 1
//              only, which is the pre-fix behaviour
function stubGh(pages, {paginate = true, publicRepos = null} = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'gh-stub-'));
  const body = pages
    .map((names, i) => `  ${i}) printf '%s\\n' ${names.map((n) => `'${n}'`).join(' ')} ;;`)
    .join('\n');
  writeFileSync(
    join(dir, 'gh'),
    `#!/bin/sh
# Fake gh for tests. Asserts the flags the real call must carry, then replays
# canned pages the way 'gh api --paginate --jq' concatenates them.
[ "$1" = "api" ] || { echo "stub gh: expected 'api', got '$1'" >&2; exit 64; }
case "$2" in
  orgs/tuna-os) printf '%s\\n' '${publicRepos === null ? '' : publicRepos}' ; exit 0 ;;
esac
case "$2" in
  *per_page=*) ;;
  *) echo "stub gh: no per_page in '$2'" >&2; exit 65 ;;
esac
paginate=0
for a in "$@"; do [ "$a" = "--paginate" ] && paginate=1; done
[ "$paginate" = "1" ] || { echo "stub gh: called without --paginate" >&2; exit 66; }
last=${paginate ? pages.length - 1 : 0}
i=0
while [ "$i" -le "$last" ]; do
  case "$i" in
${body}
  esac
  i=$((i + 1))
done
`,
  );
  chmodSync(join(dir, 'gh'), 0o755);
  return dir;
}

// withPath runs fn with dir at the front of PATH, then restores it.
function withPath(dir, fn) {
  const saved = process.env.PATH;
  process.env.PATH = `${dir}:${saved}`;
  try {
    return fn();
  } finally {
    process.env.PATH = saved;
  }
}

// 137 repos over two pages: the shape the tuna-os org is actually in, and the
// case the old call got wrong. 100 + 37, because PER_PAGE is 100.
const page1 = Array.from({length: PER_PAGE}, (_, i) => `repo-${String(i).padStart(3, '0')}`);
const page2 = Array.from({length: 37}, (_, i) => `repo-${String(i + PER_PAGE).padStart(3, '0')}`);

test('collects repos from every page, not just the first', () => {
  const names = withPath(stubGh([page1, page2]), () => listOrgRepos());
  assert.equal(names.length, page1.length + page2.length);
  assert.ok(names.includes('repo-000'), 'lost the first page');
  assert.ok(names.includes('repo-136'), 'lost the last page — this is #103');
});

test('passes --paginate and per_page to gh', () => {
  // The stub exits non-zero if either is missing, so a call that dropped them
  // throws here rather than silently returning a short list.
  assert.doesNotThrow(() => withPath(stubGh([page1, page2]), () => listOrgRepos()));
});

test('de-duplicates names repeated across a page boundary', () => {
  const names = withPath(stubGh([['a', 'b'], ['b', 'c']]), () => listOrgRepos());
  assert.deepEqual(names, ['a', 'b', 'c']);
});

test('an unpaginated gh yields only page 1 — the regression this guards', () => {
  // Same stub with paginate off: proves the assertion above is load-bearing
  // and that a listing capped at a page still looks perfectly well-formed.
  const names = withPath(stubGh([['a', 'b'], ['c']], {paginate: false}), () =>
    listOrgRepos(),
  );
  assert.deepEqual(names, ['a', 'b']);
});

// ── checkListing: truncation has to be loud ───────────────────────────────────

console.log('\ncheckListing');

test('accepts a listing that is longer than the org public count', () => {
  const {fatal, warnings} = checkListing(137, 130);
  assert.deepEqual(fatal, []);
  assert.deepEqual(warnings, []);
});

test('fails a listing shorter than the org public repo count', () => {
  const {fatal} = checkListing(DEFAULT_PAGE_SIZE, 57);
  assert.equal(fatal.length, 1);
  assert.match(fatal[0], /truncated/);
});

test('fails an empty listing rather than reading it as nothing to do', () => {
  const {fatal} = checkListing(0, null);
  assert.equal(fatal.length, 1);
  assert.match(fatal[0], /empty/);
});

test('warns on exactly 30 — the default page size, the #103 signature', () => {
  const {warnings} = checkListing(DEFAULT_PAGE_SIZE, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /default page size/);
});

test('warns on an exact multiple of the page size', () => {
  const {warnings} = checkListing(PER_PAGE * 2, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /page boundary/);
});

test('says nothing about an ordinary count with no cross-check', () => {
  const {fatal, warnings} = checkListing(47, null);
  assert.deepEqual(fatal, []);
  assert.deepEqual(warnings, []);
});

// ── summary ───────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
