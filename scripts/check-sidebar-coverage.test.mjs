import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {extractSidebarIds, isReachable, findMarkdownFiles} from './check-sidebar-coverage.mjs';

// --- extractSidebarIds -----------------------------------------------------

const sidebarSource = `
const sidebars = {
  tutorialSidebar: [
    'intro',
    {type: 'category', label: 'Tools', items: ['wootc/getting-started', {type: 'doc', id: 'wootc/index'}]},
    {type: 'link', label: 'External', href: '/albacore'},
  ],
};
`;

const ids = extractSidebarIds(sidebarSource);
assert.ok(ids.has('intro'), 'bare array entries are extracted');
assert.ok(ids.has('wootc/getting-started'), 'nested array entries are extracted');
assert.ok(ids.has('wootc/index'), '{type: "doc", id: ...} entries are extracted');
// hrefs are not doc ids and must not be mistaken for one.
assert.ok(!ids.has('albacore'), 'link hrefs are not treated as doc ids');

// --- isReachable ------------------------------------------------------------

const reachableIds = new Set(['wootc/index', 'wootc/getting-started', 'community']);
assert.equal(isReachable('wootc', reachableIds), true, 'slug reachable via nested id');
assert.equal(isReachable('community', reachableIds), true, 'slug reachable via exact match');
assert.equal(isReachable('hive', reachableIds), false, 'slug with no matching id is unreachable');
// A slug must not falsely match as a substring of an unrelated id.
const trickyIds = new Set(['wootcamp/index']);
assert.equal(isReachable('wootc', trickyIds), false, 'prefix match requires the "/" boundary');

// --- findMarkdownFiles -------------------------------------------------------

const fixtureDir = mkdtempSync(join(tmpdir(), 'sidebar-coverage-test-'));
try {
  mkdirSync(join(fixtureDir, 'nested'));
  writeFileSync(join(fixtureDir, 'index.md'), '# hi');
  writeFileSync(join(fixtureDir, 'nested', 'page.mdx'), '# nested');
  writeFileSync(join(fixtureDir, 'notes.txt'), 'not markdown');

  const found = findMarkdownFiles(fixtureDir).map((f) => f.replace(fixtureDir, '')).sort();
  assert.deepEqual(found, ['/index.md', '/nested/page.mdx'], 'only .md/.mdx files are found, recursively');
} finally {
  rmSync(fixtureDir, {recursive: true, force: true});
}

console.log('check-sidebar-coverage.test.mjs: all assertions passed');
