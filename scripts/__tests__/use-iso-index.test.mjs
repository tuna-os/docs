#!/usr/bin/env node
// Unit tests for src/hooks/useIsoIndex.ts — the hook that fetches
// static/iso-index.json and shapes it into {entries, all, generatedAt}.
//
// The transformation used to be reachable only by rendering the hook in a
// real Docusaurus page. This file runs the real hook module in plain Node
// instead: Node 24 strips its erasable TypeScript natively, and the
// resolve hook below maps its two environment imports to the stubs in
// scripts/__tests__/stubs/ —
//   'react'                    -> stubs/react.mjs (records useState /
//                                 useEffect instead of rendering)
//   '@docusaurus/useBaseUrl'   -> stubs/use-base-url.mjs ('/base' prefix)
// global fetch is stubbed per test. No new dependency is introduced.
//
// Usage:
//   node scripts/__tests__/use-iso-index.test.mjs

import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {join, dirname} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STUBS = join(ROOT, 'scripts', '__tests__', 'stubs');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'react') {
      return {url: pathToFileURL(join(STUBS, 'react.mjs')).href, shortCircuit: true};
    }
    if (specifier === '@docusaurus/useBaseUrl') {
      return {url: pathToFileURL(join(STUBS, 'use-base-url.mjs')).href, shortCircuit: true};
    }
    const resolved = nextResolve(specifier, context);
    return resolved.url.endsWith('.ts') ? {...resolved, format: 'module-typescript'} : resolved;
  },
});

const {hookState, resetHookState} = await import(join(STUBS, 'react.mjs'));
const {baseUrlCalls, resetBaseUrlCalls} = await import(join(STUBS, 'use-base-url.mjs'));
const useIsoIndex = (await import(join(ROOT, 'src/hooks/useIsoIndex.ts'))).default;

// Entries shaped like the real static/iso-index.json (built by
// scripts/build-iso-index.mjs), trimmed to two categories.
const ISO_A = {
  name: 'albacore-gnome-latest',
  url: 'https://download.tunaos.org/live-isos/albacore-gnome-latest.iso',
  size: 7340032000,
  modified: '2026-09-06T19:12:53.581719888Z',
  arch: '',
  latest: true,
};
const ISO_A_DATED = {...ISO_A, name: 'albacore-gnome-20260906', latest: false};
const ISO_B = {...ISO_A, name: 'yellowfin-kde-latest', url: 'https://download.tunaos.org/live-isos/yellowfin-kde-latest.iso'};
const DAKOTA_ISO = {...ISO_A, name: 'dakota-live-latest', url: 'https://download.tunaos.org/dakota/dakota-live-latest.iso'};

const INDEX_FIXTURE = {
  generatedAt: '2026-09-06T19:53:53.313Z',
  categories: [
    {id: 'dakota', isos: [DAKOTA_ISO]},
    {id: 'live-isos', isos: [ISO_A, ISO_A_DATED, ISO_B]},
  ],
};

const EMPTY_SHAPE = {entriesSize: 0, all: [], generatedAt: null};

function fetchReturning(data, {ok = true, status = 200} = {}) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    return {ok, status, json: async () => data};
  };
  return calls;
}

// Run the hook and its effect, then let the fetch promise chain settle.
// Returns what the hook rendered plus every value it set state to.
async function runHook() {
  resetHookState();
  resetBaseUrlCalls();
  const rendered = useIsoIndex();
  assert.equal(typeof hookState.effect, 'function', 'hook registers an effect');
  const cleanup = hookState.effect();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  return {rendered, cleanup, sets: hookState.sets};
}

function shapeOf(index) {
  return {entriesSize: index.entries.size, all: index.all, generatedAt: index.generatedAt};
}

test('returns null while the index is still loading', async () => {
  fetchReturning(INDEX_FIXTURE);
  const {rendered, sets} = await runHook();
  // The useState initial value is the loading signal — surfaces render
  // their statically-known shape until the first set arrives.
  assert.equal(rendered, null);
  assert.equal(sets.length, 1, 'exactly one state update once the fetch lands');
});

test('fetches the index through useBaseUrl with no-cache', async () => {
  const calls = fetchReturning(INDEX_FIXTURE);
  await runHook();
  assert.deepEqual(baseUrlCalls, ['/iso-index.json']);
  assert.deepEqual(hookState.deps, ['/base/iso-index.json'], 'effect re-runs only if the URL changes');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/base/iso-index.json');
  assert.deepEqual(calls[0].options, {cache: 'no-cache'});
});

test('keeps only the live-isos category, keyed by name, siblings included', async () => {
  fetchReturning(INDEX_FIXTURE);
  const {sets} = await runHook();
  const index = sets[0];
  assert.ok(index.entries instanceof Map);
  assert.deepEqual([...index.entries.keys()], ['albacore-gnome-latest', 'albacore-gnome-20260906', 'yellowfin-kde-latest']);
  assert.equal(index.entries.get('albacore-gnome-latest'), ISO_A, 'entries carry the full entry objects');
  assert.equal(index.entries.has('dakota-live-latest'), false, 'other categories are not live ISOs');
  // `all` is every live ISO in index order — including the dated siblings
  // that share a base name with a -latest entry.
  assert.deepEqual(index.all, [ISO_A, ISO_A_DATED, ISO_B]);
  assert.equal(index.generatedAt, '2026-09-06T19:53:53.313Z');
});

test('duplicate names in the index: the later entry wins the map, both stay in all', async () => {
  const later = {...ISO_A, size: 999};
  fetchReturning({generatedAt: 't', categories: [{id: 'live-isos', isos: [ISO_A, later]}]});
  const {sets} = await runHook();
  assert.equal(sets[0].entries.size, 1);
  assert.equal(sets[0].entries.get(ISO_A.name), later);
  assert.equal(sets[0].all.length, 2);
});

test('no live-isos category yields an empty (but loaded) index', async () => {
  fetchReturning({generatedAt: '2026-09-06T19:53:53.313Z', categories: [{id: 'dakota', isos: [DAKOTA_ISO]}]});
  const {sets} = await runHook();
  assert.deepEqual(shapeOf(sets[0]), {entriesSize: 0, all: [], generatedAt: '2026-09-06T19:53:53.313Z'});
});

test('missing categories and missing generatedAt both degrade to empty/null', async () => {
  fetchReturning({});
  const {sets} = await runHook();
  assert.deepEqual(shapeOf(sets[0]), EMPTY_SHAPE);
});

test('an HTTP error resolves to the empty index, not a stuck loading state', async () => {
  fetchReturning(null, {ok: false, status: 503});
  const {sets} = await runHook();
  assert.equal(sets.length, 1);
  assert.deepEqual(shapeOf(sets[0]), EMPTY_SHAPE);
});

test('a rejected fetch resolves to the empty index', async () => {
  globalThis.fetch = async () => {
    throw new Error('network down');
  };
  const {sets} = await runHook();
  assert.equal(sets.length, 1);
  assert.deepEqual(shapeOf(sets[0]), EMPTY_SHAPE);
});

test('a response whose body is not JSON resolves to the empty index', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  });
  const {sets} = await runHook();
  assert.equal(sets.length, 1);
  assert.deepEqual(shapeOf(sets[0]), EMPTY_SHAPE);
});

test('unmounting before the fetch lands suppresses the state update', async () => {
  let resolveFetch;
  globalThis.fetch = () => new Promise((resolve) => {
    resolveFetch = resolve;
  });
  resetHookState();
  useIsoIndex();
  const cleanup = hookState.effect();
  assert.equal(typeof cleanup, 'function', 'effect returns its cleanup');
  cleanup();
  resolveFetch({ok: true, status: 200, json: async () => INDEX_FIXTURE});
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(hookState.sets, [], 'no setState on an unmounted hook');
});
