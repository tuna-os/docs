// contributors-data.test.mjs — guards the committed wall-of-fame dataset:
// schema-valid, filtered for bots, and sorted by merged PRs descending.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isHumanContributor, validateFeed} from '../build-contributors.mjs';

const feed = JSON.parse(readFileSync(new URL('../../src/data/contributors.json', import.meta.url)));
validateFeed(feed);
for (const c of feed.contributors) {
  assert.equal(isHumanContributor(c.login, 'User'), true, `${c.login} must pass the human filter`);
}
const counts = feed.contributors.map((c) => c.merged_prs);
assert.deepEqual(
  counts,
  [...counts].sort((a, b) => b - a),
  'must be sorted desc',
);
console.log(`contributors-data tests: OK (${feed.contributors.length} PR authors)`);
