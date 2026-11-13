import assert from 'node:assert/strict';
import {copyFileSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// The shared STE job has no npm install step. Reproduce that environment
// outside the checkout so an installed node_modules cannot hide import errors.
const root = mkdtempSync(join(tmpdir(), 'sync-ownership-'));
try {
  mkdirSync(join(root, 'scripts/lib'), {recursive: true});
  for (const file of ['sync-org-docs.mjs', 'sync-org-docs.config.json', 'lib/org-doc-transform.mjs']) {
    copyFileSync(new URL(`../${file}`, import.meta.url), join(root, 'scripts', file));
  }
  const {isSyncedIndex, HAND_AUTHORED, frontmatter} = await import(
    pathToFileURL(join(root, 'scripts/sync-org-docs.mjs')).href
  );
  assert.equal(isSyncedIndex(frontmatter('Fixture', 1, 'fixture', 'unknown')), true);
  assert.equal(isSyncedIndex('# Handwritten page'), false);
  assert.equal(HAND_AUTHORED.has('mariner'), true);
  console.log('Ownership helpers work without npm dependencies');
} finally {
  rmSync(root, {recursive: true, force: true});
}
