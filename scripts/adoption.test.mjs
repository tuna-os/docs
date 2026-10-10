import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAdoption, estimateText, adoptionWarnings} from '../src/data/adoption.mjs';
// index.js is a Worker module; this repository's package otherwise defaults to CJS.
const source = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8').replace("'../src/data/adoption.mjs'", JSON.stringify(new URL('../src/data/adoption.mjs', import.meta.url).href)).replace("'./build-health.mjs'", JSON.stringify(new URL('../worker/build-health.mjs', import.meta.url).href));
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
} finally {globalThis.fetch = oldFetch;}
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
assert.deepEqual(config.assets.run_worker_first, ['/api/adoption', '/api/build-health']);
assert.deepEqual(config.services, [{binding: 'COUNTME', service: 'tunaos-countme'}]);
assert.match(readFileSync('src/pages/metrics.tsx', 'utf8'), /Missing data is not zero adoption/);
console.log('adoption public-schema and application header-copy tests pass');
