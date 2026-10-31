import assert from 'node:assert/strict';
import {parseFactoryHealth, sweepAge} from '../src/data/factory-health.mjs';

const summary = {
  factory_health: {green: 47, total: 143},
  install: {passed: 31, tested: 52, total: 52},
  lifecycle: {passed: 133, tested: 168, total: 168},
  never_tested: 96,
  known_regressions: {blocking: 2, advisory: 3},
  last_full_sweep: '2026-10-20',
};

assert.deepEqual(parseFactoryHealth(JSON.stringify({cells: {}, summary})), summary);
assert.equal(parseFactoryHealth('{'), null);

for (const mutate of [
  value => { value.summary.factory_health.green = 144; },
  value => { value.summary.install.tested = -1; },
  value => { value.summary.lifecycle.total = 1.5; },
  value => { delete value.summary.known_regressions.advisory; },
  value => { value.summary.last_full_sweep = '2026-02-30'; },
]) {
  const payload = {summary: structuredClone(summary)};
  mutate(payload);
  assert.equal(parseFactoryHealth(JSON.stringify(payload)), null);
}

const noon = Date.parse('2026-10-24T12:00:00Z');
assert.equal(sweepAge('2026-10-24', noon), 'today');
assert.equal(sweepAge('2026-10-23', noon), '1 day ago');
assert.equal(sweepAge('2026-10-20', noon), '4 days ago');
assert.equal(sweepAge('2026-10-25', noon), 'unknown');
assert.equal(sweepAge('not-a-date', noon), 'unknown');

console.log('factory health parsing and sweep age tests pass');
