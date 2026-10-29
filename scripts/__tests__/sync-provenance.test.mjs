#!/usr/bin/env node
// Exercise the real sync command against a local Git repository, without GitHub.
import {strict as assert} from 'node:assert';
import {execFileSync, spawnSync} from 'node:child_process';
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sourceNotice} from '../lib/org-doc-transform.mjs';

assert.match(sourceNotice('sample', 'a'.repeat(40), 'docs/a (b).md', '2026-01-01T00:00:00.000Z'), /docs\/a%20%28b%29\.md\)/);

const root = mkdtempSync(join(tmpdir(), 'sync-provenance-test-'));
const sync = fileURLToPath(new URL('../sync-org-docs.mjs', import.meta.url));
const realGit = execFileSync('which', ['git'], {encoding: 'utf8'}).trim();
try {
  const source = join(root, 'source');
  const site = join(root, 'site');
  const bin = join(root, 'bin');
  mkdirSync(join(source, 'docs'), {recursive: true});
  mkdirSync(join(site, 'docs', 'mariner'), {recursive: true});
  mkdirSync(join(site, 'docs', 'tunaos'), {recursive: true});
  mkdirSync(bin);
  writeFileSync(join(source, 'README.md'), '# Sample\n\nReadme content\n');
  writeFileSync(join(source, 'ROADMAP.md'), '# Roadmap\n\nRoadmap content\n');
  writeFileSync(join(source, 'docs', 'guide.md'), '# Guide\n\nGuide content {broken}\n');
  writeFileSync(join(site, 'docs', 'mariner', 'index.md'), 'Hand authored\n');
  writeFileSync(join(site, 'docs', 'tunaos', 'introduction.md'), 'Mixed-tree manual\n');
  const git = (args) => execFileSync(realGit, args, {cwd: source, stdio: 'pipe'});
  git(['init', '-q']);
  git(['add', '.']);
  git(['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'fixture']);
  const sha = git(['rev-parse', 'HEAD']).toString().trim();
  writeFileSync(join(bin, 'gh'), '#!/bin/sh\ncase "$*" in *repos?*) printf "sample\\tfalse\\nmariner\\tfalse\\ntunaOS\\tfalse\\ntromso\\tfalse\\n";; *) echo 4;; esac\n');
  writeFileSync(join(bin, 'git'), `#!/bin/sh\nif [ "$1" = clone ]; then\n  [ "$FAIL_FETCH" = 1 ] && exit 1\n  exec "${realGit}" clone -q "$SOURCE" "$4"\nfi\nexec "${realGit}" "$@"\n`);
  chmodSync(join(bin, 'gh'), 0o755);
  chmodSync(join(bin, 'git'), 0o755);
  const env = {...process.env, PATH: `${bin}:${process.env.PATH}`, SOURCE: source};
  const run = (extra = {}) => spawnSync(process.execPath, [sync], {cwd: site, env: {...env, ...extra}, encoding: 'utf8'});
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const pages = ['index.md', 'ROADMAP.md', 'guide.md'];
  const originals = pages.map(file => readFileSync(join(site, 'docs', 'sample', file), 'utf8'));
  for (const [i, sourcePath] of ['README.md', 'ROADMAP.md', 'docs/guide.md'].entries()) {
    assert.ok(originals[i].includes(`https://github.com/tuna-os/sample/blob/${sha}/${sourcePath}`));
    assert.match(originals[i], /Last successful fetch: \d{4}-\d\d-\d\dT[^ ]+ · Status: current/);
  }
  assert.match(originals[2], /mdx:\n  format: md/);
  assert.equal(readFileSync(join(site, 'docs', 'mariner', 'index.md'), 'utf8'), 'Hand authored\n');
  assert.equal(readFileSync(join(site, 'docs', 'tunaos', 'introduction.md'), 'utf8'), 'Mixed-tree manual\n');
  const alpha = readFileSync(join(site, 'docs', 'tromso', 'index.md'), 'utf8');
  assert.match(alpha, /\*\*Alpha\*\*/);
  // A legacy/hand-written page has no marker and must not be labelled stale.
  writeFileSync(join(site, 'docs', 'sample', 'manual.md'), 'Manual page\n');
  const failed = run({FAIL_FETCH: '1'});
  assert.notEqual(failed.status, 0, 'failed fetch must retain the fail-closed gate');
  assert.match(failed.stderr, /3 tracked page\(s\) marked stale/);
  assert.equal(readFileSync(join(site, 'docs', 'tromso', 'index.md'), 'utf8'), alpha.replace(' · Status: current', ' · Status: stale'));
  for (const [i, file] of pages.entries()) {
    const stale = readFileSync(join(site, 'docs', 'sample', file), 'utf8');
    assert.equal(stale, originals[i].replace(' · Status: current', ' · Status: stale'));
  }
  assert.equal(readFileSync(join(site, 'docs', 'sample', 'manual.md'), 'utf8'), 'Manual page\n');
  assert.equal(readFileSync(join(site, 'docs', 'mariner', 'index.md'), 'utf8'), 'Hand authored\n');
  const repeat = run({FAIL_FETCH: '1'});
  assert.notEqual(repeat.status, 0);
  for (const [i, file] of pages.entries()) {
    assert.equal(readFileSync(join(site, 'docs', 'sample', file), 'utf8'), originals[i].replace(' · Status: current', ' · Status: stale'));
  }
  const recovered = run();
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.equal(readFileSync(join(site, 'docs', 'tunaos', 'introduction.md'), 'utf8'), 'Mixed-tree manual\n');
  for (const file of pages) {
    const page = readFileSync(join(site, 'docs', 'sample', file), 'utf8');
    assert.match(page, /Status: current/);
    assert.ok(page.includes(`/blob/${sha}/`));
  }
  console.log('sync provenance integration passed');
} finally {
  rmSync(root, {recursive: true, force: true});
}
