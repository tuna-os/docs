import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAdoption, estimateText, adoptionWarnings} from '../../src/data/adoption.mjs';
// index.js is a Worker module; this repository's package otherwise defaults to CJS.
const source = readFileSync(new URL('../../worker/index.js', import.meta.url), 'utf8').replace("'../src/data/adoption.mjs'", JSON.stringify(new URL('../../src/data/adoption.mjs', import.meta.url).href)).replace("'./build-health.mjs'", JSON.stringify(new URL('../../worker/build-health.mjs', import.meta.url).href));
const {default: worker} = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const now = Date.parse('2026-09-27T12:00:00Z');
const margin = (key) => ({status: 'reported', counts: {[{variant: 'yellowfin', flavor: 'gnome', arch: 'x86_64', age_bucket: '2'}[key]]: 20}});
const fixture = () => ({schema: 1, methodology: 'tunaos-countme-v1', generated_at: '2026-09-27T00:00:00Z', collection_started: '2026-09-01T00:00:00Z', weeks: [{week_start: '2026-09-14', week_end: '2026-09-21', status: 'complete', total: {status: 'reported', count: 20}, dimensions: Object.fromEntries(['variant', 'flavor', 'arch', 'age_bucket'].map(key => [key, margin(key)]))}]});
assert.equal(validateAdoption(fixture(), now).schema, 1);
for (const mutate of [f => f.raw = 1, f => f.weeks[0].total.count = 3, f => f.weeks[0].week_end = '2026-09-28', f => f.weeks[0].dimensions.variant.counts.device_id = 'secret', f => f.weeks[0].total = {status: 'suppressed', count: null}, f => f.weeks[0].dimensions.variant.extra = 20, f => f.weeks[0].dimensions.variant.counts = {device_secret_123: 20}, f => f.weeks[0].dimensions.arch.counts = {x86_64: 30}, f => f.weeks.push({...f.weeks[0]})]) {
  const f = fixture(); mutate(f); assert.throws(() => validateAdoption(f, now));
}
assert.equal(estimateText({status: 'suppressed', count: null}), 'Suppressed for privacy');
assert.equal(estimateText({status: 'reported', count: 20}), '20–29');
assert.equal(estimateText({status: 'reported', count: 0}), '0');
assert.deepEqual(adoptionWarnings(fixture(), now), []);
assert.match(adoptionWarnings({...fixture(), weeks: []}, now).join(), /latest closed UTC week is missing/);
assert.match(adoptionWarnings({...fixture(), generated_at: '2026-09-25T12:00:00Z'}, now).join(), /more than 24 hours old/);
assert.deepEqual(adoptionWarnings({...fixture(), generated_at: '2026-09-26T12:00:00Z'}, now), []);
assert.deepEqual(adoptionWarnings({...fixture(), collection_started: '2026-09-22T00:00:00Z', weeks: []}, now), []);
assert.deepEqual(adoptionWarnings({...fixture(), collection_started: null, weeks: []}, now), []);
const oldFetch = globalThis.fetch;
try {
  let upstream;
  globalThis.fetch = async (url, options) => {upstream = {url, options}; return Response.json(fixture());};
  const response = await worker.fetch(new Request('https://tunaos.org/api/adoption?raw=true', {headers: {'Cookie': 'secret', 'CF-Connecting-IP': '192.0.2.1'}}), {});
  assert.equal(response.status, 200); assert.equal(upstream.url, 'https://countme.tunaos.org/v1/metrics');
  // The mock records application options, not Cloudflare-added transport headers.
  assert.deepEqual(upstream.options.headers, {'Accept': 'application/json'});
  assert.deepEqual(await response.json(), fixture());

  let boundCall;
  const bound = await worker.fetch(new Request('https://tunaos.org/api/adoption?raw=true', {headers: {'Cookie': 'secret', 'CF-Connecting-IP': '192.0.2.1'}}), {COUNTME: {fetch: async (url, options) => {boundCall = {url, options}; return Response.json(fixture());}}});
  assert.equal(bound.status, 200);
  assert.equal(boundCall.url, 'https://countme.tunaos.org/v1/metrics');
  assert.deepEqual(boundCall.options.headers, {'Accept': 'application/json'});
  assert.equal(boundCall.options.redirect, 'manual');
  const redirect = await worker.fetch(new Request('https://tunaos.org/api/adoption'), {COUNTME: {fetch: async () => new Response(null, {status: 302, headers: {Location: 'https://example.invalid'}})}});
  assert.equal(redirect.status, 503);
  globalThis.fetch = async () => Response.json({raw: 'secret'});
  const failure = await worker.fetch(new Request('https://tunaos.org/api/adoption'), {});
  assert.equal(failure.status, 503); assert.equal(failure.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await failure.json(), {error: 'adoption_metrics_unavailable'});
  assert.equal((await worker.fetch(new Request('https://tunaos.org/api/adoption', {method: 'POST'}), {})).status, 405);
  assert.equal(await worker.fetch(new Request('https://tunaos.org/metrics'), {ASSETS: {fetch: () => 'asset'}}), 'asset');

  // Each upstream failure path logs a distinct, fixed reason string server-side
  // (Cloudflare Workers Logs) so an operator can tell them apart without
  // reproducing the request. The log call must never carry the visitor's
  // cookie, IP, or query string — only fixed reasons and non-visitor detail
  // (upstream status, byte size, fixed failure categories).
  const oldError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);
  try {
    const req = () => new Request('https://tunaos.org/api/adoption', {headers: {'Cookie': 'secret', 'CF-Connecting-IP': '192.0.2.1'}});

    logged.length = 0;
    globalThis.fetch = async () => new Response(null, {status: 502});
    await worker.fetch(req(), {});
    assert.equal(logged.length, 1);
    assert.match(logged[0][0], /^adoption-proxy: upstream_http_error/);
    assert.equal(logged[0][1], 502);

    logged.length = 0;
    globalThis.fetch = async () => new Response('not json', {headers: {'content-type': 'text/plain'}});
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_wrong_content_type/);

    logged.length = 0;
    globalThis.fetch = async () => Response.json({not: 'valid'});
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_schema_mismatch/);

    logged.length = 0;
    globalThis.fetch = async () => new Response('{not valid json', {headers: {'content-type': 'application/json'}});
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_invalid_json/);

    logged.length = 0;
    globalThis.fetch = async () => new Response('x'.repeat(512001), {headers: {'content-type': 'application/json'}});
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_oversize_feed/);
    assert.ok(logged[0][1] > 512000);

    logged.length = 0;
    globalThis.fetch = async () => { throw Object.assign(Error('boom'), {name: 'TypeError'}); };
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_fetch_failed/);

    logged.length = 0;
    globalThis.fetch = async () => { throw Object.assign(Error('timed out'), {name: 'TimeoutError'}); };
    await worker.fetch(req(), {});
    assert.match(logged[0][0], /^adoption-proxy: upstream_timeout/);

    // No logged call ever contains the visitor's cookie, IP, or query string.
    for (const call of logged) {
      const text = call.map((value) => String(value)).join(' ');
      assert.ok(!text.includes('secret'), text);
      assert.ok(!text.includes('192.0.2.1'), text);
    }
  } finally { console.error = oldError; }
} finally {globalThis.fetch = oldFetch;}
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
assert.deepEqual(config.assets.run_worker_first, ['/api/adoption', '/api/build-health']);
assert.deepEqual(config.services, [{binding: 'COUNTME', service: 'tunaos-countme'}]);
assert.match(readFileSync('src/pages/metrics.tsx', 'utf8'), /Missing data is not zero adoption/);
console.log('adoption public-schema and application header-copy tests pass');


// Structured events must be useful without logging request or upstream content.
const oldLog = console.log;
const oldErrorLog = console.error;
const events = [];
console.log = (line) => events.push(JSON.parse(line));
console.error = () => {};
try {
  const request = (method = 'GET') => new Request('https://tunaos.org/api/adoption?secret=query', {method, headers: {Cookie: 'secret=cookie'}});
  const run = (fetch, method) => worker.fetch(request(method), {COUNTME: {fetch}});
  await run(async () => Response.json(fixture()));
  assert.equal(events[0].status, 200);
  assert.equal(events[0].upstream_status, 200);
  assert.equal(events[0].cache_policy, 'public-300-900');
  assert.ok(events[0].upstream_bytes > 0);
  assert.ok(events[0].duration_ms >= events[0].upstream_duration_ms);
  const head = await run(async () => Response.json(fixture()), 'HEAD');
  assert.equal(await head.text(), '');
  await run(async () => new Response(null, {status: 502}));
  assert.equal(events[2].reason, 'upstream_http_error');
  assert.equal(events[2].status, 503);
  await run(async () => {throw Error('secret=exception');});
  assert.equal(events[3].reason, 'upstream_fetch_failed');
  await run(async () => new Response('"secret=payload"', {headers: {'Content-Type': 'application/json'}}));
  assert.equal(events[4].reason, 'upstream_schema_mismatch');
  await run(() => {throw Error('must not fetch');}, 'POST');
  assert.equal(events[5].status, 405);
  assert.equal(events[5].method, 'OTHER');
  assert.equal(events.length, 6);
  assert.ok(!JSON.stringify(events).includes('secret'));
} finally {
  console.log = oldLog;
  console.error = oldErrorLog;
}
