#!/usr/bin/env node
// Tests for build-iso-index.mjs
//
// Runs the script with fixture rclone JSON on stdin and validates the
// output iso-index structure. Also directly tests the pure helper
// functions imported from the script.
//
// Usage:
//   node scripts/build-iso-index.test.mjs

import {strict as assert} from 'node:assert';
import {execSync} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

// ── Import helpers from the script ─────────────────────────────────────
// The script uses top-level await, so we import it as a URL with the
// query trick to re-evaluate.
const scriptUrl = new URL('./build-iso-index.mjs', import.meta.url);
const mod = await import(scriptUrl);

const detectArch = mod.detectArch;
const titleCase = mod.titleCase;

// ── Pure function tests ────────────────────────────────────────────────

// detectArch
assert.equal(detectArch('TunaOS-41-x86_64.iso'), 'x86_64');
assert.equal(detectArch('TunaOS-41-aarch64.iso'), 'aarch64');
assert.equal(detectArch('TunaOS-41-arm64.iso'), 'aarch64');
assert.equal(detectArch('dakota-x13s-20260601.iso'), 'aarch64');
assert.equal(detectArch('TunaOS-41-x86_64_v2.iso'), 'x86_64-v2');
assert.equal(detectArch('TunaOS-41-amd64.iso'), 'x86_64');
assert.equal(detectArch('unknown-file.iso'), '');
assert.equal(detectArch(''), '');
console.log('  ✓ detectArch: all 8 cases pass');

// titleCase
assert.equal(titleCase('live-isos'), 'Live Isos');
assert.equal(titleCase('xfce-linux'), 'Xfce Linux');
assert.equal(titleCase('ubuntu-26.04'), 'Ubuntu 26.04');  // dots preserved
assert.equal(titleCase('simple'), 'Simple');
assert.equal(titleCase(''), '');
console.log('  ✓ titleCase: all 5 cases pass');

// ── Integration test: full pipeline with fixture data ──────────────────

function buildFixture() {
  return JSON.stringify([
    {
      Path: 'live-isos/TunaOS-41-x86_64-20260601.iso',
      Name: 'TunaOS-41-x86_64-20260601.iso',
      Size: 2_500_000_000,
      ModTime: '2026-06-01T12:00:00Z',
    },
    {
      Path: 'live-isos/TunaOS-41-x86_64-latest.iso',
      Name: 'TunaOS-41-x86_64-latest.iso',
      Size: 2_500_000_001,
      ModTime: '2026-06-15T12:00:00Z',
    },
    {
      Path: 'dakota/dakota-x13s-20260601.iso',
      Name: 'dakota-x13s-20260601.iso',
      Size: 1_800_000_000,
      ModTime: '2026-06-01T12:00:00Z',
    },
    {
      Path: 'live-isos/TunaOS-41-x86_64-SHA256SUMS',
      Name: 'TunaOS-41-x86_64-SHA256SUMS',
      Size: 1024,
      ModTime: '2026-06-15T12:00:00Z',
    },
    {
      Path: 'unknown-prefix/test-build.iso',
      Name: 'test-build.iso',
      Size: 500_000_000,
      ModTime: '2026-06-10T12:00:00Z',
    },
    // A non-ISO file that should be filtered out
    {
      Path: 'live-isos/some-other-file.txt',
      Name: 'some-other-file.txt',
      Size: 100,
      ModTime: '2026-06-10T12:00:00Z',
    },
  ]);
}

function runScript(stdinData) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'iso-test-'));
  const fixturePath = join(tmpDir, 'fixture.json');
  writeFileSync(fixturePath, stdinData);

  const scriptPath = new URL('./build-iso-index.mjs', import.meta.url).pathname;
  const out = execSync(`node "${scriptPath}"`, {
    input: stdinData,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(out);
}

// Run integration test
const result = runScript(buildFixture());

// Check top-level structure
assert.equal(typeof result, 'object');
assert.equal(typeof result.generatedAt, 'string');
assert.equal(result.baseUrl, 'https://download.tunaos.org');
assert.equal(typeof result.count, 'number');
assert.ok(Array.isArray(result.categories));
console.log('  ✓ Top-level structure valid');

// Check count: 4 ISOs (the .txt file should be filtered out)
assert.equal(result.count, 4, `Expected 4 ISOs, got ${result.count}`);
console.log('  ✓ ISO count: 4');

// Check categories exist
const catIds = result.categories.map(c => c.id);
assert.ok(catIds.includes('live-isos'), 'Missing live-isos category');
assert.ok(catIds.includes('dakota'), 'Missing dakota category');
assert.ok(catIds.includes('unknown-prefix'), 'Missing unknown-prefix category');
console.log('  ✓ Categories: live-isos, dakota, unknown-prefix');

// Check live-isos category
const liveIsos = result.categories.find(c => c.id === 'live-isos');
assert.equal(liveIsos.label, 'TunaOS Desktop');
assert.equal(liveIsos.icon, '🐟');
assert.equal(liveIsos.order, 0);
assert.equal(liveIsos.isos.length, 2, 'Expected 2 ISOs in live-isos');

// Check latest ISO comes first
assert.ok(liveIsos.isos[0].latest, 'latest ISO should be first');
assert.equal(liveIsos.isos[0].name, 'TunaOS-41-x86_64-latest');
assert.equal(liveIsos.isos[1].latest, false);

// Check SHA256SUMS tracking
assert.ok(liveIsos.checksums?.includes('SHA256SUMS'), 'Missing SHA256SUMS reference');
console.log('  ✓ live-isos content verified');

// Check unknown prefix gets fallback metadata
const unknown = result.categories.find(c => c.id === 'unknown-prefix');
assert.equal(unknown.label, 'Unknown Prefix');
assert.equal(unknown.icon, '📀');
assert.equal(unknown.order, 99);
assert.equal(unknown.isos.length, 1);
assert.equal(unknown.isos[0].arch, ''); // test-build has no recognizable arch
console.log('  ✓ unknown-prefix fallback metadata');

// Check dakota category
const dakota = result.categories.find(c => c.id === 'dakota');
assert.equal(dakota.isos.length, 1);
assert.equal(dakota.isos[0].arch, 'aarch64');
console.log('  ✓ dakota arch detection');

// Categories should be sorted by order
const orders = result.categories.map(c => c.order);
for (let i = 1; i < orders.length; i++) {
  assert.ok(orders[i - 1] <= orders[i], 'Categories not sorted by order');
}
console.log('  ✓ Category sort order correct');

// ── Empty fixture ──────────────────────────────────────────────────────

const emptyResult = runScript('');
assert.equal(emptyResult.count, 0);
assert.deepEqual(emptyResult.categories, []);
console.log('  ✓ Empty input produces empty result');

// ── Only SHA256SUMS, no ISOs ───────────────────────────────────────────

const onlyChecksums = JSON.stringify([
  {
    Path: 'live-isos/TunaOS-41-x86_64-SHA256SUMS',
    Name: 'TunaOS-41-x86_64-SHA256SUMS',
    Size: 1024,
    ModTime: '2026-06-15T12:00:00Z',
  },
]);
const onlyCsResult = runScript(onlyChecksums);
assert.equal(onlyCsResult.count, 0);
// No ISOs means no category entries at all
assert.equal(onlyCsResult.categories.length, 0);
console.log('  ✓ Only SHA256SUMS → empty result');

// ── Done ───────────────────────────────────────────────────────────────

console.log('\n✓ All tests passed!');
