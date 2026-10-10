import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateBuildHealth, parseBuildHealth, displayStatus, requiredBuildTargets} from '../src/data/build-health.mjs';
import {buildHealthResponse} from '../worker/build-health.mjs';
const now = Date.parse('2026-10-10T12:00:00Z');
const coverage = JSON.parse(readFileSync(new URL('../src/data/build-health-required.json', import.meta.url)));
const fixture = () => ({schemaVersion: 1, kind: 'build-health', generatedAt: new Date(now).toISOString(), sourceRevision: 'a'.repeat(40), coverageDigest: coverage.coverageDigest,
  collection: {status: 'available', sources: [{id: 'tunaos', repository: 'tuna-os/tunaOS', status: 'available', evidence: []}]},
  freshnessPolicy: {buildSeconds: 172800, feedSeconds: 3600}, targets: requiredBuildTargets.map(target => ({target: {...target}, required: true, scheduled: true,
    latestAttempt: null, lastVerifiedPublication: null, packageReadiness: {status: 'missing', measuredAt: null, evidence: []}, contractStatus: 'missing', status: 'missing', reasons: ['required-attempt-missing'], measuredAt: null}))});
assert.equal(validateBuildHealth(fixture(), now).targets.length, 269);
for (const mutate of [f => f.extra = true, f => f.schemaVersion = 2, f => f.targets.pop(), f => f.targets.push(f.targets[0]),
  f => f.targets[0].target.platform = 'linux/amd64/v3', f => f.targets[0].required = false, f => f.coverageDigest = 'sha256:' + 'b'.repeat(64),
  f => f.generatedAt = '2026-02-31T00:00:00Z', f => f.generatedAt = '2027-01-01T00:00:00Z', f => f.targets[0].status = 'healthy',
  f => f.collection.sources[0].evidence = [{url: 'https://github.com/other/repo/actions/runs/1'}],
  f => f.collection.sources[0].evidence = [{url: 'https://github.com/tuna-os/tunaOS/actions/runs/1?secret=x'}]]) {
  const feed = fixture(); mutate(feed); assert.throws(() => validateBuildHealth(feed, now));
}
// Valid healthy evidence is independent of collector availability declarations.
const healthy = () => {
  const feed = fixture();
  const row = feed.targets[0];
  const digest = 'sha256:' + 'b'.repeat(64);
  row.status = 'healthy'; row.contractStatus = 'pass'; row.measuredAt = feed.generatedAt;
  row.packageReadiness = {status: 'healthy', measuredAt: feed.generatedAt,
    factoryDigest: digest, contractDigest: 'sha256:' + 'c'.repeat(64),
    evidence: [{url: 'https://github.com/tuna-os/tunaos-packages/actions/runs/2', digest}]};
  row.latestAttempt = {identity: {repository: 'tuna-os/tunaOS', workflow: '.github/workflows/🐟-albacore.yml',
    runId: 1, runAttempt: 1, sourceRevision: 'a'.repeat(40), startedAt: feed.generatedAt},
    status: 'success', measuredAt: feed.generatedAt, imageDigest: digest,
    evidence: [{url: 'https://github.com/tuna-os/tunaOS/actions/runs/1', digest}]};
  row.lastVerifiedPublication = {repository: 'ghcr.io/tuna-os/albacore', digest,
    evidence: ['https://ghcr.io/tuna-os/albacore@' + digest]};
  return feed;
};
assert.equal(validateBuildHealth(healthy(), now).targets[0].status, 'healthy');
for (const mutate of [
  f => f.collection.sources[0].status = 'unavailable',
  f => f.collection.sources[0].status = 'stale',
  f => f.collection.sources[0].status = 'unknown',
  f => f.collection.sources.push({...f.collection.sources[0]}),
  f => f.collection.sources[0].repository = 'unapproved/repository',
  f => f.targets[0].latestAttempt.identity.workflow = '.github/workflows/../private.yml',
  f => f.targets[0].latestAttempt.measuredAt = null,
  f => f.targets[0].latestAttempt.imageDigest = 'sha256:' + 'd'.repeat(64),
  f => f.generatedAt = new Date(now + 1).toISOString(),
  f => f.targets[0].measuredAt = new Date(now + 1).toISOString(),
  f => f.targets[0].latestAttempt.measuredAt = new Date(now + 1).toISOString(),
  f => f.targets[0].latestAttempt.identity.startedAt = new Date(now + 1).toISOString(),
  f => f.targets[0].packageReadiness.measuredAt = new Date(now + 1).toISOString(),
]) {
  const feed = healthy(); mutate(feed); assert.throws(() => validateBuildHealth(feed, now));
}
assert.deepEqual(parseBuildHealth(JSON.stringify(healthy()), now), healthy());
for (const raw of [
  JSON.stringify(fixture()).replace('"schemaVersion":1', '"schemaVersion":2,"schemaVersion":1'),
  JSON.stringify(fixture()).replace('"schemaVersion":1', '"schemaVersion":2,"schema\\u0056ersion":1'),
  '{"value":1e999}', '{"value":NaN}', '{"value":Infinity}',
  '{"nested":{"value":1,"value":2}}', '{"value":01}', '{"value":true,}',
  '['.repeat(22) + '0' + ']'.repeat(22), ' '.repeat(2097153),
]) {
  assert.throws(() => parseBuildHealth(raw, now));
}
assert.equal(displayStatus(fixture().targets[0], fixture(), now), 'missing');
assert.equal(displayStatus(fixture().targets[0], fixture(), now + 3600001), 'stale');
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
try {
  Date.now = () => now;
  let upstream;
  globalThis.fetch = async (url, options) => {upstream = {url, options}; return new Response(JSON.stringify(fixture()), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});};
  const response = await buildHealthResponse(new Request('https://tunaos.org/api/build-health?upstream=secret', {headers: {Cookie: 'secret', Authorization: 'secret'}}));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), fixture());
  assert.equal(upstream.url, 'https://raw.githubusercontent.com/tuna-os/tunaOS/main/docs/build-health.json');
  assert.deepEqual(upstream.options.headers, {Accept: 'application/json'});
  assert.equal(upstream.options.redirect, 'manual');
  assert.equal((await buildHealthResponse(new Request('https://tunaos.org/api/build-health', {method: 'HEAD'}))).body, null);
  for (const reply of [() => new Response(null, {status: 302, headers: {Location: 'https://example.invalid'}}),
    () => new Response(JSON.stringify(fixture()).replace('"schemaVersion":1', '"schemaVersion":2,"schemaVersion":1'), {headers: {'Content-Type': 'application/json'}}),
    () => Response.json({}), () => new Response('{}', {headers: {'Content-Type': 'text/html'}}),
    () => new Response('{}', {headers: {'Content-Type': 'application/json', 'Content-Length': '2097153'}}),
    () => new Response('x'.repeat(2097153), {headers: {'Content-Type': 'application/json'}}),
    () => {throw Error('private transport failure');}]) {
    globalThis.fetch = async () => reply();
    const result = await buildHealthResponse(new Request('https://tunaos.org/api/build-health'));
    assert.equal(result.status, 503); assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await result.json(), {error: 'build_health_unavailable'});
  }
  let called = false;
  globalThis.fetch = async () => {called = true; throw Error('unexpected');};
  assert.equal((await buildHealthResponse(new Request('https://tunaos.org/api/build-health', {method: 'POST'}))).status, 405);
  assert.equal(called, false);
  // The deadline includes the response body, even when fetch resolves at once.
  const originalTimeout = globalThis.setTimeout;
  try {
    globalThis.setTimeout = callback => originalTimeout(callback, 1);
    globalThis.fetch = async () => new Response(new ReadableStream({start() {}}), {headers: {'Content-Type': 'application/json'}});
    assert.equal((await buildHealthResponse(new Request('https://tunaos.org/api/build-health'))).status, 503);
  } finally {globalThis.setTimeout = originalTimeout;}
} finally {globalThis.fetch = originalFetch; Date.now = originalNow;}
console.log('build health coverage, schema, evidence links, privacy and bounded proxy tests pass');
