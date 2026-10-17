import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requiredVariantPlatforms, architectureSummary} from '../src/data/variant-platforms.mjs';
const coverage = JSON.parse(readFileSync(new URL('../src/data/build-health-required.json', import.meta.url)));
const variants = [...new Set(coverage.targets.map(row => row.target.variant))];
assert.equal(coverage.targets.length, 269);
for (const variant of variants) {
  const expected = ['albacore', 'yellowfin'].includes(variant) ? ['amd64-v2', 'arm64'] : ['amd64', 'arm64'];
  assert.deepEqual(requiredVariantPlatforms(variant), expected, `${variant} must display exact required platforms`);
}
assert.equal(requiredVariantPlatforms('redfin').length, 0, 'local-only variant has no fabricated public target');
assert.equal(architectureSummary(requiredVariantPlatforms('albacore')), 'AMD64 (x86-64-v2) · ARM64');
assert.equal(architectureSummary(requiredVariantPlatforms('marlin')), 'AMD64 · ARM64');
const source = readFileSync(new URL('../src/data/variants.ts', import.meta.url), 'utf8');
assert.match(source, /requiredVariantPlatforms\(variant\.id\)/);
assert.match(source, /architectureSummary\(platforms\)/);
console.log('variant architecture labels derive from required coverage, including Alma v2 and ARM');
