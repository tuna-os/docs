// CI only: compare reviewed copies against an exact upstream checkout.
// A source-policy update is a reviewed pin/copy change, never a mutable sync.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const pin = JSON.parse(await readFile(new URL('./build-health-source.json', import.meta.url), 'utf8'));
assert.equal(pin.repository, 'tuna-os/tunaOS');
assert.match(pin.revision, /^[0-9a-f]{40}$/);
const root = process.argv[2];
assert.ok(root, 'explicit upstream checkout is required');
const head = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding: 'utf8'});
assert.equal(head.status, 0, head.stderr);
assert.equal(head.stdout.trim(), pin.revision, 'upstream checkout must match reviewed source pin');
for (const [upstream, local] of [
  ['schemas/build-health.schema.json', 'build-health.schema.json'],
  ['schemas/identity.schema.json', 'build-health-identity.schema.json'],
]) {
  assert.deepEqual(await readFile(resolve(root, upstream)), await readFile(new URL(`../src/data/${local}`, import.meta.url)), `${local} drifted from pinned upstream`);
}
const generated = spawnSync('python3', ['scripts/contracts/targets.py'], {cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
assert.equal(generated.status, 0, generated.stderr);
const coverage = JSON.parse(generated.stdout);
const declared = JSON.parse(await readFile(new URL('../src/data/build-health-required.json', import.meta.url), 'utf8'));
assert.deepEqual(declared, coverage, 'required target copy drifted from pinned upstream resolver');
assert.equal(coverage.targets.length, pin.requiredCount);
assert.equal(coverage.coverageDigest, pin.coverageDigest);
console.log(`Pinned build health source ${pin.revision}: schemas and ${pin.requiredCount} targets agree`);
