// Policy cases registered by sync-org-docs.test.mjs.

import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { frontmatter, subFrontmatter, isSyncedIndex, getStatusBanner } from '../lib/org-doc-transform.mjs';
import { filesToRemove, isRootDoc, markUnparseable, rejectExpressions, withFormatMd, slugify } from '../sync-org-docs.mjs';

export default function policyTests(test, asyncTest) {
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

  // ── filesToRemove ─────────────────────────────────────────────────────────────
  //
  // Reconciles a repo's existing docs/<slug>/ files against what this run wrote,
  // so a page deleted upstream (kde-build-meta's TRACKING-POLICY.md, the
  // motivating case) is deleted here too. Pure and filesystem-free: the third
  // argument is a callback the real caller backs with readFileSync, tests back
  // with a plain string.

  console.log('\nfilesToRemove');

  test('removes nothing when every existing file was written this run', () => {
    const {removable, refused} = filesToRemove(
      ['index.md', 'install.md'],
      ['index.md', 'install.md'],
      () => frontmatter('X', 1, 'x', 'alpha'),
    );
    assert.deepEqual(removable, []);
    assert.deepEqual(refused, []);
  });

  test('removes a non-index file no longer written, unconditionally', () => {
    // Every non-index write in the real loop goes through subFrontmatter(),
    // whose shape cannot be told apart from a hand-written page's by content
    // alone (see the isSyncedIndex tests above) — but this function is only
    // ever asked about the targetDir a HAND_AUTHORED-excluded repo's own sync
    // just finished writing, so which directory is being asked about already
    // answers the question content can't.
    const {removable, refused} = filesToRemove(
      ['index.md', 'TRACKING-POLICY.md'],
      ['index.md'],
      () => frontmatter('X', 1, 'x', 'alpha'),
    );
    assert.deepEqual(removable, ['TRACKING-POLICY.md']);
    assert.deepEqual(refused, []);
  });

  test('removes a synced index.md no longer written', () => {
    const {removable, refused} = filesToRemove(
      ['index.md'],
      [],
      () => frontmatter('X', 1, 'x', 'alpha'),
    );
    assert.deepEqual(removable, ['index.md']);
    assert.deepEqual(refused, []);
  });

  test('refuses an index.md that does not match isSyncedIndex, and does not remove it', () => {
    // Cannot happen for a repo actively syncing (README.md always exists or the
    // write is skipped entirely, and the write always uses frontmatter()) — this
    // is the defensive case for an index.md a person dropped into a targetDir by
    // hand without adding the slug to HAND_AUTHORED.
    const {removable, refused} = filesToRemove(
      ['index.md'],
      [],
      () => '---\nsidebar_position: 1\nsidebar_label: "X"\nstatus: alpha\n---\n\nHand-written.\n',
    );
    assert.deepEqual(removable, []);
    assert.deepEqual(refused, ['index.md']);
  });

  test('refuses when index.md no longer exists to read (readIndexContent returns null)', () => {
    const {removable, refused} = filesToRemove(
      ['index.md'],
      [],
      () => null,
    );
    assert.deepEqual(removable, []);
    assert.deepEqual(refused, ['index.md']);
  });

  test('only calls readIndexContent when index.md is actually a removal candidate', () => {
    let calls = 0;
    filesToRemove(['index.md', 'other.md'], ['index.md', 'other.md'], () => {
      calls++;
      return frontmatter('X', 1, 'x', 'alpha');
    });
    assert.equal(calls, 0, 'index.md was written this run, so nothing should read it');
  });

  test('keeps hand-written pages in a repo whose docs/ folder is not synced', () => {
    // docs/tunaos/: tunaOS is in SKIP_DOCS_DIR, so only index.md and the
    // filtered root docs are written there; introduction.md and the rest are
    // hand-authored and must survive the run.
    const filter = ['README.md', 'ROADMAP.md', 'SECURITY.md', 'CONTRIBUTING.md'];
    const {removable, refused} = filesToRemove(
      ['index.md', 'ROADMAP.md', 'SECURITY.md', 'introduction.md', 'building.md'],
      ['index.md', 'ROADMAP.md'],
      () => frontmatter('X', 1, 'x', 'alpha'),
      file => isRootDoc(file, filter),
    );
    assert.deepEqual(removable, ['SECURITY.md']);
    assert.deepEqual(refused, []);
  });

  test('isRootDoc knows the default root docs and a repo filter', () => {
    assert.ok(isRootDoc('index.md'));
    assert.ok(isRootDoc('ROADMAP.md'));
    assert.ok(!isRootDoc('getting-started.md'));
    assert.ok(isRootDoc('SECURITY.md', ['SECURITY.md']));
    assert.ok(!isRootDoc('ROADMAP.md', ['SECURITY.md']));
  });

  // ── markUnparseable ───────────────────────────────────────────────────────────

  console.log('\nmarkUnparseable');

  test('withFormatMd ends the front matter with mdx: {format: md}, and the index stays synced', () => {
    const page = frontmatter('Hive', 1, 'hive', 'alpha') + 'Body\n';
    const out = withFormatMd(page);
    assert.ok(out.includes('mdx:\n  format: md\n---\n'), out);
    assert.ok(isSyncedIndex(out));
    assert.ok(out.endsWith('Body\n'));
  });

  asyncTest('marks a page MDX cannot compile and leaves one it can alone', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdx-'));
    const bad = join(dir, 'bad.md');
    const good = join(dir, 'good.md');
    writeFileSync(bad, subFrontmatter('Bad', 1) + 'lists the <catalog> entries\n');
    writeFileSync(good, subFrontmatter('Good', 2) + 'Fine.\n');
    const compile = async (body) => {
      if (body.includes('<catalog>')) throw new Error('Expected a closing tag for `<catalog>`');
    };
    const marked = await markUnparseable([bad, good], compile);
    assert.equal(marked, 1);
    assert.ok(readFileSync(bad, 'utf8').includes('mdx:\n  format: md\n'));
    assert.ok(!readFileSync(good, 'utf8').includes('format: md'));
    // A page already marked is not marked twice.
    assert.equal(await markUnparseable([bad], compile), 0);
  });

  asyncTest('rejectExpressions fails a page whose prose MDX would read as JavaScript', async () => {
    const {compile} = await import('@mdx-js/mdx');
    const rejects = async (body) => {
      try {
        await compile(body, {remarkPlugins: [rejectExpressions]});
        return false;
      } catch {
        return true;
      }
    };
    // Compiles, then throws `server is not defined` when the site renders it.
    assert.ok(await rejects('Run it against {server} first.\n'));
    assert.ok(await rejects('{server}\n'));
    assert.ok(await rejects('<img src={logo} />\n'));
    assert.ok(await rejects('import x from "y"\n\nText\n'));
    assert.ok(!(await rejects('Plain text, `{code}` and <img src="a.png" />.\n\n```\n{fenced}\n```\n')));
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
}
