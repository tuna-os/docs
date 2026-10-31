// Exercise module boundaries against local repositories; no git/GitHub calls.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {createSyncPolicy} from '../lib/org-doc-policy.mjs';
import {transformPage, createMarkdownPipeline} from '../lib/org-doc-pipeline.mjs';
import {frontmatter, subFrontmatter, isSyncedIndex} from '../lib/org-doc-transform.mjs';
import {cloneRepo, syncRepository} from '../lib/org-doc-syncer.mjs';
import {synchronizeDocumentation} from '../lib/org-doc-synchronizer.mjs';
import {discoverRepos} from '../lib/org-doc-discovery.mjs';

const logger = {log() {}, warn() {}, error() {}};
const metadata = {repo: 'sample', branch: 'dev', title: 'Sample', position: 1};
const pipeline = createMarkdownPipeline({logger});

function fixture(t, initial = {}) {
  const root = mkdtempSync(join(tmpdir(), 'org-doc-sync-test-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  function put(path, content) {
    const target = join(root, path);
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, content);
  }
  mkdirSync(join(root, 'site'));
  mkdirSync(join(root, 'source'));
  for (const [path, content] of Object.entries(initial)) put(path, content);
  return {
    root, put, read: path => readFileSync(join(root, path), 'utf8'),
    options: {
      docsDir: join(root, 'site'), policy: createSyncPolicy(), pipeline, logger,
      clone: () => ({dir: join(root, 'source'), branch: 'dev'}),
    },
  };
}

const discovery = (listed, fatal = []) => () => ({
  listed, fatal, warnings: [], publicRepos: listed.length, archived: 0, attempts: 1,
});

test('pipeline preserves frontmatter, status, title removal, code, and source-relative links', async () => {
  const index = await pipeline('# Sample\n\n[Guide](guide.md)\n\n```sh\ncmd <input\n```\n', {
    ...metadata, index: true, slug: 'sample', status: 'alpha',
  });
  assert.ok(isSyncedIndex(index));
  assert.match(index, /status: alpha\n/);
  assert.match(index, /> ⚠️ \*\*Alpha\*\*/);
  assert.ok(!index.includes('# Sample'));
  assert.match(index, /https:\/\/github.com\/tuna-os\/sample\/blob\/dev\/guide.md/);
  assert.ok(index.endsWith('```sh\ncmd <input\n```\n'));
  assert.equal(transformPage('# Guide\n\n[Image](img/a.png)\n', {
    ...metadata, org: 'example', srcDir: 'docs',
  }), subFrontmatter('Sample', 1) + '[Image](https://github.com/example/sample/blob/dev/docs/img/a.png)\n');
});

test('pipeline marks expression prose before write and accepts code, GFM tables, and comments', async () => {
  const bad = await pipeline('Connect to {server}.\n', metadata);
  assert.match(bad, /mdx:\n  format: md\n---\n/);
  const good = await pipeline('<!-- upstream -->\n`{server}`\n\n| A | B |\n| - | - |\n| 1 | 2 |\n', metadata);
  assert.ok(!good.includes('format: md'));
});

test('sync writes README, root docs, and docs pages in order, then reconciles only files', async t => {
  const f = fixture(t, {
    'source/README.md': '# Sample\n\nReadme\n',
    'source/ROADMAP.md': '# Plan\n\nRoot\n',
    'source/docs/guide.md': '# Guide\n\n[Image](img/a.png)\n',
    'source/docs/SUMMARY.md': 'mdBook metadata',
    'source/notes.md': 'Unselected root page',
    'site/sample/old.md': 'Deleted upstream',
    'site/sample/img/a.svg': 'asset',
  });
  const result = await syncRepository('sample', f.options);
  assert.deepEqual(result, {synced: true, files: ['index.md', 'ROADMAP.md', 'guide.md'], removed: 1, refusedRemovals: 0});
  assert.equal(f.read('site/sample/index.md'), frontmatter('sample', 1, 'sample', 'unknown') + 'Readme\n');
  assert.equal(f.read('site/sample/ROADMAP.md'), subFrontmatter('Roadmap', 2) + 'Root\n');
  assert.equal(f.read('site/sample/guide.md'), subFrontmatter('guide', 3) + '[Image](https://github.com/tuna-os/sample/blob/dev/docs/img/a.png)\n');
  assert.equal(f.read('site/sample/img/a.svg'), 'asset');
  assert.ok(!existsSync(join(f.root, 'source')));
  assert.ok(!existsSync(join(f.root, 'site/sample/old.md')));
});

test('docs pages retain precedence over root pages with the same name', async t => {
  const f = fixture(t, {
    'source/ROADMAP.md': 'Root\n', 'source/docs/ROADMAP.md': 'Docs\n',
  });
  await syncRepository('sample', f.options);
  assert.equal(f.read('site/sample/ROADMAP.md'), subFrontmatter('ROADMAP', 2) + 'Docs\n');
});

test('mixed TunaOS tree protects manual pages while removing stale allowed root docs', async t => {
  const f = fixture(t, {
    'source/README.md': 'Readme\n', 'source/ROADMAP.md': 'Plan\n',
    'source/ARCHITECTURE.md': 'Not allowed',
    'source/docs/introduction.md': 'Must not overwrite',
    'site/tunaos/introduction.md': 'Written here',
    'site/tunaos/SECURITY.md': 'Deleted upstream',
    'site/tunaos/installer-walkthrough/index.md': 'Nested manual page',
  });
  const result = await syncRepository('tunaOS', f.options);
  assert.deepEqual(result.files, ['index.md', 'ROADMAP.md']);
  assert.equal(result.removed, 1);
  assert.equal(f.read('site/tunaos/introduction.md'), 'Written here');
  assert.equal(f.read('site/tunaos/installer-walkthrough/index.md'), 'Nested manual page');
});

test('skipped repositories and protected slugs never clone or mutate their tree', async t => {
  const f = fixture(t, {'site/blueshell/index.md': 'Manual'});
  f.options.clone = () => { throw new Error('must not clone'); };
  for (const repo of ['docs', 'blueshell']) {
    assert.equal((await syncRepository(repo, f.options)).synced, false);
  }
  assert.equal(f.read('site/blueshell/index.md'), 'Manual');
});

test('policy overrides apply consistently to selection, source directory, and reconciliation', async t => {
  const f = fixture(t, {
    'source/README.md': 'Readme', 'source/SPEC.md': 'Skip',
    'source/ROADMAP.md': 'Plan', 'source/book/guide.md': 'Nested docs',
  });
  f.options.policy = createSyncPolicy({
    projects: {sample: {label: 'Custom', slug: 'custom'}},
    rootDocFilter: {sample: ['ROADMAP.md']}, docsSubdir: {sample: 'book'},
  });
  const result = await syncRepository('sample', f.options);
  assert.deepEqual(result.files, ['index.md', 'ROADMAP.md', 'guide.md']);
  assert.match(f.read('site/custom/index.md'), /sidebar_label: "Custom"/);
});

test('missing README removes only a provably generated index and refuses a manual index', async t => {
  for (const generated of [false, true]) {
    const f = fixture(t, {'site/sample/index.md': generated ? frontmatter('sample', 1) + 'Old' : 'Manual'});
    const result = await syncRepository('sample', f.options);
    assert.equal(result.removed, generated ? 1 : 0);
    assert.equal(result.refusedRemovals, generated ? 0 : 1);
    assert.equal(existsSync(join(f.root, 'site/sample/index.md')), !generated);
  }
});

test('MDX fallback is present in the sole destination write', async t => {
  const f = fixture(t, {'source/README.md': '{server}\n'});
  const observations = [];
  f.options.pipeline = createMarkdownPipeline({logger, compile: async () => {
    observations.push(existsSync(join(f.root, 'site/sample/index.md')));
    throw new Error('invalid MDX');
  }});
  await syncRepository('sample', f.options);
  assert.deepEqual(observations, [false], 'validation must precede the page write');
  assert.match(f.read('site/sample/index.md'), /mdx:\n  format: md\n/);
  assert.ok(isSyncedIndex(f.read('site/sample/index.md')));
});

test('command keeps helper exports available without running discovery or sync on import', async () => {
  const command = await import('../sync-org-docs.mjs');
  assert.equal(command.synchronizeDocumentation, synchronizeDocumentation);
  assert.equal(command.discoverRepos, discoverRepos);
  assert.equal(command.frontmatter, frontmatter);
  assert.equal(typeof command.markUnparseable, 'function');
});

test('a later transformation failure leaves validated writes, cleans the clone, and skips reconciliation', async t => {
  const f = fixture(t, {
    'source/README.md': '{server}\n', 'source/ROADMAP.md': 'New',
    'site/sample/stale.md': 'Keep on failure',
  });
  f.options.pipeline = async (raw, metadata) => {
    if (!metadata.index) throw new Error('pipeline failed');
    return pipeline(raw, metadata);
  };
  await assert.rejects(syncRepository('sample', f.options), /pipeline failed/);
  assert.match(f.read('site/sample/index.md'), /mdx:\n  format: md\n/);
  assert.equal(f.read('site/sample/stale.md'), 'Keep on failure');
  assert.ok(!existsSync(join(f.root, 'source')));
});

test('failed destination write cleans the clone and skips reconciliation', async t => {
  const f = fixture(t, {'source/README.md': 'New', 'site/sample/stale.md': 'Keep'});
  mkdirSync(join(f.root, 'site/sample/index.md'));
  await assert.rejects(syncRepository('sample', f.options), /EISDIR/);
  assert.equal(f.read('site/sample/stale.md'), 'Keep');
  assert.ok(!existsSync(join(f.root, 'source')));
});

test('clone failures and default-branch lookup failures clean allocated temporary directories', () => {
  for (const failAt of ['clone', 'rev-parse']) {
    let directory;
    assert.throws(() => cloneRepo('sample', 'tuna-os', (command, args, options) => {
      assert.equal(command, 'git');
      if (args[0] === 'clone') directory = args.at(-1);
      else assert.equal(options.cwd, directory);
      if (args[0] === failAt) throw new Error('git failed');
      return '';
    }), /git failed/);
    assert.ok(directory);
    assert.ok(!existsSync(directory));
  }
});

test('fatal discovery prevents any sync or docs-tree mutation', async t => {
  const f = fixture(t);
  const result = await synchronizeDocumentation({
    ...f.options, discover: discovery(['sample'], ['truncated listing']),
    sync: () => { throw new Error('must not sync'); },
  });
  assert.equal(result.ok, false);
  assert.equal(result.synced, 0);
  assert.deepEqual(result.failures, []);
  assert.ok(existsSync(join(f.root, 'source')));
});

test('coordinator isolates repository failures and checks untouched trees for collisions', async t => {
  const f = fixture(t, {'site/manual/A.md': 'a', 'site/manual/a.md': 'b', 'source/README.md': 'New'});
  const attempted = [];
  const result = await synchronizeDocumentation({
    ...f.options, discover: discovery(['docs', 'blueshell', 'broken', 'sample']),
    sync: (repo, options) => {
      attempted.push(repo);
      if (repo === 'broken') throw new Error('clone failed');
      return syncRepository(repo, {...options, clone: f.options.clone});
    },
  });
  assert.deepEqual(attempted, ['broken', 'sample']);
  assert.equal(result.ok, false);
  assert.equal(result.synced, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.protectedDirs, 1);
  assert.deepEqual(result.failures, ['broken: clone failed']);
  assert.deepEqual(result.collisions, [['manual/A.md', 'manual/a.md']]);
  assert.ok(f.read('site/sample/index.md').endsWith('New'));
});

test('coordinator returns a successful summary for a complete sync', async t => {
  const f = fixture(t, {'source/README.md': 'New', 'site/sample/old.md': 'Old'});
  const result = await synchronizeDocumentation({
    ...f.options, discover: discovery(['sample']),
    sync: (repo, options) => syncRepository(repo, {...options, clone: f.options.clone}),
  });
  assert.equal(result.ok, true);
  assert.equal(result.synced, 1);
  assert.equal(result.removed, 1);
  assert.deepEqual(result.failures, []);
});

test('discovery can target an organization without process or docs-tree access', () => {
  const calls = [];
  const result = discoverRepos(command => {
    calls.push(command);
    return command.includes('/repos?') ? 'sample\tfalse\nretired\ttrue\n' : '2';
  }, () => { throw new Error('unexpected retry'); }, 'example', logger);
  assert.ok(calls.every(command => command.includes('orgs/example')));
  assert.deepEqual(result.listed, ['sample']);
  assert.equal(result.archived, 1);
  assert.deepEqual(result.fatal, []);
});
