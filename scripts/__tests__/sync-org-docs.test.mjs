#!/usr/bin/env node

// Unit tests for the sync command and its document transform module.
//
// Tests the pure helper functions used by the org-wide doc aggregation
// script. Clone/git/gh operations are not tested here — those are
// integration/end-to-end concerns.
//
// These tests import the real functions. The transformation cases import the
// pure module directly, while orchestration and reconciliation cases import
// the command module. The command guards its main() call so importing either
// module never touches the network.
//
// The .test_*.mjs companions register cases with this file's existing harness.
// Only this entry point matches the *.test.mjs discovery glob, so each case
// runs once and contributes to the same summary and exit status.
//
// Usage:
//   node scripts/__tests__/sync-org-docs.test.mjs

import { strict as assert } from 'node:assert';
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listOrgRepos,
  checkListing,
  discoverRepos,
  findCaseCollisions,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
  RETRY_DELAY_MS,
} from '../sync-org-docs.mjs';
import transformTests from './sync-org-docs.test_transform.mjs';
import linksTests from './sync-org-docs.test_links.mjs';
import policyTests from './sync-org-docs.test_policy.mjs';

// ── Test helpers ──────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;

// Async tests run after the synchronous ones, before the summary.
const pending = [];
function asyncTest(name, fn) {
  pending.push(async () => {
    try {
      await fn();
      pass++;
      console.log(`  ✓ ${name}`);
    } catch (e) {
      fail++;
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  });
}

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${name}: ${e.message}`);
  }
}

console.log('\n📋 sync-org-docs tests\n');

transformTests(test);
linksTests(test);
policyTests(test, asyncTest);

// ── listOrgRepos: the repo listing must cross page boundaries ─────────────────
//
// The bug in #103 was invisible because its output was well-formed: the first
// 30 names, no error, exit 0. So this exercises the real command line against a
// stub `gh` on PATH rather than a stubbed-out function — the flags have to
// actually reach gh for the fix to hold, and a test that mocked listOrgRepos
// itself would pass just as happily against the unpaginated call.
//
// The stub reproduces the part of gh's behaviour that shapes the code: with
// --paginate and --jq, gh runs the filter once per page and concatenates the
// results, so the caller receives one name per line across every page.

console.log('\nlistOrgRepos');

// stubGh writes a fake `gh` into a fresh dir and returns that dir.
//   pages    — array of arrays of repo names, one array per API page
//   paginate — when false, the stub ignores --paginate and answers page 1
//              only, which is the pre-fix behaviour
function stubGh(pages, {paginate = true, publicRepos = null, archivedRepos = 0} = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'gh-stub-'));
  const total = pages.reduce((n, p) => n + p.length, 0);
  const archivedFrom = total - archivedRepos;
  let globalIdx = 0;
  const body = pages
    .map((names, i) => {
      const entries = names
        .map((n) => {
          // The real call emits one `name<TAB>archived` line per repo; emit a
          // literal tab so listOrgRepos parses the real shape.
          const flag = globalIdx >= archivedFrom ? 'true' : 'false';
          globalIdx += 1;
          return `'${n}\t${flag}'`;
        })
        .join(' ');
      return `  ${i}) printf '%s\\n' ${entries} ;;`;
    })
    .join('\n');
  writeFileSync(
    join(dir, 'gh'),
    `#!/bin/sh
# Fake gh for tests. Asserts the flags the real call must carry, then replays
# canned pages the way 'gh api --paginate --jq' concatenates them.
[ "$1" = "api" ] || { echo "stub gh: expected 'api', got '$1'" >&2; exit 64; }
case "$2" in
  orgs/tuna-os) printf '%s\\n' '${publicRepos === null ? '' : publicRepos}' ; exit 0 ;;
esac
case "$2" in
  *per_page=*) ;;
  *) echo "stub gh: no per_page in '$2'" >&2; exit 65 ;;
esac
paginate=0
jq_archived=0
prev=""
for a in "$@"; do
  [ "$a" = "--paginate" ] && paginate=1
  [ "$prev" = "--jq" ] && case "$a" in *archived*) jq_archived=1 ;; esac
  prev="$a"
done
[ "$paginate" = "1" ] || { echo "stub gh: called without --paginate" >&2; exit 66; }
[ "$jq_archived" = "1" ] || { echo "stub gh: --jq filter does not mention 'archived'" >&2; exit 67; }
last=${paginate ? pages.length - 1 : 0}
i=0
while [ "$i" -le "$last" ]; do
  case "$i" in
${body}
  esac
  i=$((i + 1))
done
`,
  );
  chmodSync(join(dir, 'gh'), 0o755);
  return dir;
}

// withPath runs fn with dir at the front of PATH, then restores it.
function withPath(dir, fn) {
  const saved = process.env.PATH;
  process.env.PATH = `${dir}:${saved}`;
  try {
    return fn();
  } finally {
    process.env.PATH = saved;
  }
}

// 137 repos over two pages: the shape the tuna-os org is actually in, and the
// case the old call got wrong. 100 + 37, because PER_PAGE is 100.
const page1 = Array.from({length: PER_PAGE}, (_, i) => `repo-${String(i).padStart(3, '0')}`);
const page2 = Array.from({length: 37}, (_, i) => `repo-${String(i + PER_PAGE).padStart(3, '0')}`);

test('collects repos from every page, not just the first', () => {
  const {names} = withPath(stubGh([page1, page2]), () => listOrgRepos());
  assert.equal(names.length, page1.length + page2.length);
  assert.ok(names.includes('repo-000'), 'lost the first page');
  assert.ok(names.includes('repo-136'), 'lost the last page — this is #103');
});

test('passes --paginate and per_page to gh', () => {
  // The stub exits non-zero if either is missing, so a call that dropped them
  // throws here rather than silently returning a short list.
  assert.doesNotThrow(() => withPath(stubGh([page1, page2]), () => listOrgRepos()));
});

test('de-duplicates names repeated across a page boundary', () => {
  const {names} = withPath(stubGh([['a', 'b'], ['b', 'c']]), () => listOrgRepos());
  assert.deepEqual(names, ['a', 'b', 'c']);
});

test('an unpaginated gh yields only page 1 — the regression this guards', () => {
  // Same stub with paginate off: proves the assertion above is load-bearing
  // and that a listing capped at a page still looks perfectly well-formed.
  const {names} = withPath(stubGh([['a', 'b'], ['c']], {paginate: false}), () =>
    listOrgRepos(),
  );
  assert.deepEqual(names, ['a', 'b']);
});

test('the --jq filter excludes archived repos (#154)', () => {
  // The stub itself refuses to answer (exit 67) unless the --jq argument
  // mentions 'archived' — so this only passes if the real call actually
  // filters, the same way the --paginate test above only passes if the real
  // call actually paginates. A stub that just returned a canned non-archived
  // list would pass whether or not listOrgRepos ever asked for the filter.
  assert.doesNotThrow(() => withPath(stubGh([page1, page2]), () => listOrgRepos()));
});

test('counts archived repos so the truncation check sees the full listing (#278)', () => {
  // The last two names are archived: they are counted but not synced.
  const {names, archived} = withPath(
    stubGh([['a', 'b'], ['c', 'd', 'e']], {archivedRepos: 2}),
    () => listOrgRepos(),
  );
  assert.deepEqual(names, ['a', 'b', 'c']);
  assert.equal(archived, 2);
});

// ── findCaseCollisions: a case-insensitive filesystem sees one file, not two ───
//
// tacklebox/USER-GUIDE.md (synced) and tacklebox/user-guide.md (hand-authored)
// coexisted until #153 removed the duplicate by hand — invisible on every
// case-sensitive dev machine and CI runner, and a broken checkout on macOS.
// A future sync run can recreate this the same way it happened the first
// time, so this guards against the class of bug, not just that one instance.

console.log('\nfindCaseCollisions');

// mkTree materializes a nested {name: content | subtree} description as real
// files under a fresh temp dir and returns that dir's path.
function mkTree(spec, root = mkdtempSync(join(tmpdir(), 'case-collision-'))) {
  for (const [name, value] of Object.entries(spec)) {
    const path = join(root, name);
    if (typeof value === 'string') {
      writeFileSync(path, value);
    } else {
      mkdirSync(path, {recursive: true});
      mkTree(value, path);
    }
  }
  return root;
}

test('reports nothing for a tree with no collisions', () => {
  const root = mkTree({tacklebox: {'user-guide.md': 'x', 'index.md': 'y'}, tromso: {'index.md': 'z'}});
  assert.deepEqual(findCaseCollisions(root), []);
});

test('flags two files that differ only by case in the same directory', () => {
  const root = mkTree({tacklebox: {'USER-GUIDE.md': 'synced', 'user-guide.md': 'hand-authored'}});
  const collisions = findCaseCollisions(root);
  assert.equal(collisions.length, 1);
  assert.deepEqual(
    [...collisions[0]].sort(),
    ['tacklebox/USER-GUIDE.md', 'tacklebox/user-guide.md'],
  );
});

test('flags a directory-name collision, not just a filename collision', () => {
  const root = mkTree({Tromso: {'index.md': 'a'}, tromso: {'Index.md': 'b'}});
  const collisions = findCaseCollisions(root);
  assert.equal(collisions.length, 1);
  assert.deepEqual(
    [...collisions[0]].sort(),
    ['Tromso/index.md', 'tromso/Index.md'],
  );
});

test('does not flag files with the same case in different directories', () => {
  const root = mkTree({tacklebox: {'index.md': 'a'}, tromso: {'index.md': 'b'}});
  assert.deepEqual(findCaseCollisions(root), []);
});

// ── checkListing: truncation has to be loud ───────────────────────────────────

console.log('\ncheckListing');

test('accepts a listing that is longer than the org public count', () => {
  const {fatal, warnings} = checkListing(137, 130);
  assert.deepEqual(fatal, []);
  assert.deepEqual(warnings, []);
});

test('accepts an active-only listing once archived repos are counted (#278)', () => {
  // 37 active + 20 archived against an org that reports 57 public repos:
  // the shape that broke the daily sync on 08-14. The listing is complete,
  // so the archived count must be part of the cross-check — and its
  // presence should be loud, just not fatal.
  const {fatal, warnings} = checkListing(57, 57, PER_PAGE, 20);
  assert.deepEqual(fatal, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /archived/);
});

test('still fails when even the full listing is short of the org count', () => {
  const {fatal} = checkListing(37, 57, PER_PAGE, 20);
  assert.equal(fatal.length, 1);
  assert.match(fatal[0], /truncated/);
  assert.match(fatal[0], /archived/);
});

test('fails a listing shorter than the org public repo count', () => {
  const {fatal} = checkListing(DEFAULT_PAGE_SIZE, 57);
  assert.equal(fatal.length, 1);
  assert.match(fatal[0], /truncated/);
});

test('fails an empty listing rather than reading it as nothing to do', () => {
  const {fatal} = checkListing(0, null);
  assert.equal(fatal.length, 1);
  assert.match(fatal[0], /empty/);
});

test('warns on exactly 30 — the default page size, the #103 signature', () => {
  const {warnings} = checkListing(DEFAULT_PAGE_SIZE, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /default page size/);
});

test('warns on an exact multiple of the page size', () => {
  const {warnings} = checkListing(PER_PAGE * 2, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /page boundary/);
});

test('says nothing about an ordinary count with no cross-check', () => {
  const {fatal, warnings} = checkListing(47, null);
  assert.deepEqual(fatal, []);
  assert.deepEqual(warnings, []);
});

// ── discoverRepos: a truncated listing gets one retry before it's fatal ────────
//
// #242: the daily sync failed on a listing that held 37 of the org's 57
// public repos — not a --paginate regression (checkListing's original job),
// but a transient truncation (the run's own evidence pointed at secondary
// rate limiting mid-pagination). discoverRepos absorbs a one-off like that
// with a single retry, while still failing for good on a listing that stays
// short every time — the shape a real --paginate regression takes.

console.log('\ndiscoverRepos');

// fakeExec answers the two gh calls listOrgRepos/orgPublicRepoCount make,
// returning canned per-attempt {repoCount, publicCount} pairs. The attempt
// counter advances on the orgPublicRepoCount call, which always runs second
// within a single discoverRepos attempt.
function fakeExec(attempts) {
  let i = 0;
  return (cmd) => {
    const {repoCount, publicCount, archivedRepos = 0} = attempts[Math.min(i, attempts.length - 1)];
    if (cmd.includes('/repos?')) {
      return Array.from(
        {length: repoCount},
        (_, n) => `repo-${n}\t${n >= repoCount - archivedRepos ? 'true' : 'false'}`,
      ).join('\n');
    }
    if (cmd.startsWith('gh api orgs/')) {
      i += 1;
      return String(publicCount);
    }
    throw new Error(`fakeExec: unexpected command: ${cmd}`);
  };
}

test('does not retry when the first listing is already fine', () => {
  const sleeps = [];
  const result = discoverRepos(
    fakeExec([{repoCount: 57, publicCount: 57}]),
    (ms) => sleeps.push(ms),
  );
  assert.equal(result.attempts, 1);
  assert.deepEqual(result.fatal, []);
  assert.deepEqual(sleeps, []);
});

test('does not retry when archived repos explain a short active list (#278)', () => {
  // The real org shape: 57 repos returned, 20 of them archived, 37 active.
  // The listing is complete — no retry, no fatal, just the archived warning.
  const sleeps = [];
  const result = discoverRepos(
    fakeExec([{repoCount: 57, publicCount: 57, archivedRepos: 20}]),
    (ms) => sleeps.push(ms),
  );
  assert.equal(result.attempts, 1);
  assert.equal(result.listed.length, 37);
  assert.equal(result.archived, 20);
  assert.deepEqual(result.fatal, []);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /archived/);
  assert.deepEqual(sleeps, []);
});

test('retries once and recovers from a transient truncation', () => {
  const sleeps = [];
  const result = discoverRepos(
    fakeExec([
      {repoCount: 37, publicCount: 57}, // attempt 1: truncated, same shape as #242
      {repoCount: 57, publicCount: 57}, // attempt 2: clean
    ]),
    (ms) => sleeps.push(ms),
  );
  assert.equal(result.attempts, 2);
  assert.equal(result.listed.length, 57);
  assert.deepEqual(result.fatal, []);
  assert.deepEqual(sleeps, [RETRY_DELAY_MS]);
});

test('gives up after a second attempt that is still short', () => {
  const result = discoverRepos(
    fakeExec([{repoCount: 30, publicCount: 57}]), // same short answer every time
    () => {},
  );
  assert.equal(result.attempts, 2);
  assert.equal(result.fatal.length, 1);
  assert.match(result.fatal[0], /truncated/);
});

// ── summary ───────────────────────────────────────────────────────────────────

for (const run of pending) await run();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
