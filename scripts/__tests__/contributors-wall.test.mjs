// contributors-wall.test.mjs — unit tests for the wall-of-fame data layer.
// No network: exercises the bot filter, merge, and feed validation only.
import assert from 'node:assert/strict';
import {isHumanContributor, mergeContributors, validateFeed} from '../build-contributors.mjs';

// --- bot / AI filter ---
for (const login of [
  'renovate',
  'Renovate-Bot',
  'dependabot',
  'github-actions',
  'claude',
  'CLAUDE-BOT',
  'copilot-sweeper',
  'sweep-bot',
  'devin-ai',
  'codex',
  'gemini-cli',
  'random-bot',
  'someone[bot]',
]) {
  assert.equal(isHumanContributor(login, 'User'), false, `${login} must be excluded`);
}
assert.equal(isHumanContributor('octocat', 'Bot'), false, 'API Bot type must be excluded');
for (const login of ['hanthor', 'octocat', 'some-human', 'RenovateFan42']) {
  assert.equal(isHumanContributor(login, 'User'), true, `${login} must be included`);
}
assert.equal(isHumanContributor('', 'User'), false);
assert.equal(isHumanContributor(null, 'User'), false);

// EXTRA_BOT_LOGINS is read at import time; covered by the -bot suffix rule instead.
assert.equal(isHumanContributor('org-greeter-bot', 'User'), false);

// Only merged PRs count; inherited commits never enter this input.
const mergedAt = '2026-10-17T17:00:00.000Z';
const merged = mergeContributors([
  {
    repo: 'a',
    pulls: [
      {id: 101, merged_at: mergedAt, user: {login: 'HanThor', id: 1, type: 'User'}},
      {id: 102, merged_at: mergedAt, user: {login: 'renovate', id: 99, type: 'Bot'}},
      {id: 103, merged_at: null, user: {login: 'not-merged', id: 3, type: 'User'}},
      {id: 104, merged_at: mergedAt, user: null},
    ],
  },
  {
    repo: 'b',
    pulls: [
      {id: 201, merged_at: mergedAt, user: {login: 'hanthor', id: 1, type: 'User'}},
      {id: 202, merged_at: mergedAt, user: {login: 'octocat', id: 2, type: 'User'}},
      // Page overlap must not count a merged PR twice.
      {id: 202, merged_at: mergedAt, user: {login: 'octocat', id: 2, type: 'User'}},
    ],
  },
]);
assert.deepEqual(merged, [
  {login: 'HanThor', id: 1, merged_prs: 2, repos: ['a', 'b']},
  {login: 'octocat', id: 2, merged_prs: 1, repos: ['b']},
]);

// --- feed schema ---
const feed = {
  org: 'tuna-os',
  generated_at: '2026-10-17T17:00:00.000Z',
  contributors: [{login: 'hanthor', id: 1, merged_prs: 2, repos: ['a']}],
};
assert.deepEqual(validateFeed(feed), feed);
for (const mutate of [
  (f) => (f.org = ''),
  (f) => (f.generated_at = 'yesterday'),
  (f) => (f.contributors[0].merged_prs = 0),
  (f) => (f.contributors[0].repos = []),
  (f) => (f.extra = 1),
  (f) => {
    delete f.contributors[0].merged_prs;
    f.contributors[0].contributions = 12031;
  },
]) {
  const bad = structuredClone(feed);
  mutate(bad);
  assert.throws(() => validateFeed(bad));
}
console.log('contributors-wall tests: OK');
