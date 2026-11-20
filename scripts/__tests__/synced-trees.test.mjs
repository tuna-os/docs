import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {frontmatter} from '../lib/org-doc-transform.mjs';
import {syncedTrees} from '../synced-trees.mjs';

const root = mkdtempSync(join(tmpdir(), 'synced-trees-'));
try {
  const page = (rel, text) => {
    const full = join(root, 'docs', rel);
    mkdirSync(join(full, '..'), {recursive: true});
    writeFileSync(full, text);
  };
  // Written by the sync: its front matter, as the sync composes it.
  page('wootc/index.md', frontmatter('wootc', 1, 'wootc', 'active') + '# wootc\n');
  page('wootc/guide.md', '# Guide\n');
  // Synced tree whose marker page sits below the top level.
  page('nested/sub/index.md', frontmatter('nested', 2, 'nested', 'active'));
  // Hand-written pages: no sync front matter.
  page('guides/intro.md', '---\nsidebar_position: 1\ntitle: "Intro"\n---\n# Intro\n');
  page('intro.md', '# Top-level page\n');
  // Sync-shaped, but on the list the sync refuses to overwrite.
  page('mariner/index.md', frontmatter('mariner', 3, 'mariner', 'active'));

  const trees = syncedTrees(root, new Set(['mariner']));
  assert.deepEqual(trees, ['docs/nested', 'docs/wootc'],
    'only trees carrying the sync front matter, minus HAND_AUTHORED');

  assert.deepEqual(syncedTrees(join(root, 'missing')), [],
    'no docs/ directory means nothing is synced');
  console.log('synced-trees: ok');
} finally {
  rmSync(root, {recursive: true, force: true});
}
