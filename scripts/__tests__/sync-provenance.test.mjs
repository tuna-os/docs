import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {main} from '../sync-org-docs.mjs';

const root = mkdtempSync(join(tmpdir(), 'sync-provenance-'));
try {
  const docsDir = join(root, 'docs');
  mkdirSync(docsDir);
  const provenancePath = join(root, 'snapshot.json');
  const discover = () => ({listed: ['fixture', 'mariner', 'tunaOS'], publicRepos: 3, fatal: [], warnings: [], attempts: 1});
  mkdirSync(join(docsDir, 'mariner'));
  writeFileSync(join(docsDir, 'mariner/index.md'), 'Protected');
  mkdirSync(join(docsDir, 'tunaos'));
  writeFileSync(join(docsDir, 'tunaos/introduction.md'), 'Protected introduction');
  const clone = () => {
    const dir = mkdtempSync(join(root, 'source-'));
    writeFileSync(join(dir, 'README.md'), '# Fixture\n\nExample.\n');
    writeFileSync(join(dir, 'CONTRIBUTING.md'), '# Contributing\n\nHelp.\n');
    mkdirSync(join(dir, 'docs'));
    writeFileSync(join(dir, 'docs/README.md'), '# Nested\n\nNested docs.\n');
    return {dir, branch: 'dev', revision: 'a'.repeat(40)};
  };
  const options = {docsDir, provenancePath, discover, clone, now: () => '2026-11-02T12:00:00.000Z'};
  await main(options);
  const before = JSON.parse(readFileSync(provenancePath));
  assert.equal(before.fixture.pages['fixture/index'], 'README.md');
  assert.equal(before.fixture.pages['fixture/CONTRIBUTING'], 'CONTRIBUTING.md');
  assert.equal(before.fixture.pages['fixture/docs-README'], 'docs/README.md');
  assert.equal(before.mariner, undefined);
  assert.equal(before.tunaOS.pages['tunaos/introduction'], undefined);
  const page = readFileSync(join(docsDir, 'fixture/index.md'), 'utf8');
  await assert.rejects(main({...options, clone: () => {throw new Error('simulated network failure');}}), /sync failed/);
  const after = JSON.parse(readFileSync(provenancePath));
  assert.deepEqual(after.fixture, {...before.fixture, status: 'stale', error: 'Source refresh failed'});
  assert.equal(readFileSync(join(docsDir, 'fixture/index.md'), 'utf8'), page);
  assert.equal(readFileSync(join(docsDir, 'mariner/index.md'), 'utf8'), 'Protected');
  assert.equal(readFileSync(join(docsDir, 'tunaos/introduction.md'), 'utf8'), 'Protected introduction');
  await main(options);
  assert.deepEqual(JSON.parse(readFileSync(provenancePath)), before);
  console.log('Provenance integration passed: paths, protection, failed fetch retention, recovery.');
} finally {
  rmSync(root, {recursive: true, force: true});
}
