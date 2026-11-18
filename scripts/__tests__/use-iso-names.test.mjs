#!/usr/bin/env node
// Unit tests for src/hooks/useIsoNames.ts — the thin hook that answers
// "which live ISOs exist" as a Set of names, backed by useIsoIndex.
//
// The hook's whole contract is its handling of the index's three states
// (loading / loaded / loaded-but-empty), so this file runs the real
// useIsoNames.ts with only its './useIsoIndex' import stubbed (see
// scripts/__tests__/stubs/use-iso-index.mjs, mapped by the resolve hook
// below — the same Node 24 type-stripping approach as
// use-iso-index.test.mjs). The index transformation itself is covered
// against the real module in use-iso-index.test.mjs.
//
// Usage:
//   node scripts/__tests__/use-iso-names.test.mjs

import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {join, dirname} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STUBS = join(ROOT, 'scripts', '__tests__', 'stubs');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './useIsoIndex' && context.parentURL?.endsWith('src/hooks/useIsoNames.ts')) {
      return {url: pathToFileURL(join(STUBS, 'use-iso-index.mjs')).href, shortCircuit: true};
    }
    const resolved = nextResolve(specifier, context);
    return resolved.url.endsWith('.ts') ? {...resolved, format: 'module-typescript'} : resolved;
  },
});

const {holder} = await import(join(STUBS, 'use-iso-index.mjs'));
const useIsoNames = (await import(join(ROOT, 'src/hooks/useIsoNames.ts'))).default;

function indexWith(names) {
  return {
    entries: new Map(names.map((name) => [name, {name}])),
    all: names.map((name) => ({name})),
    generatedAt: '2026-09-06T19:53:53.313Z',
  };
}

test('passes null through while the index is loading', () => {
  // Callers depend on this distinction: null means "unknown yet, render
  // the static shape", an empty Set would mean "no ISOs exist".
  holder.current = null;
  assert.equal(useIsoNames(), null);
});

test('returns exactly the entry names as a Set', () => {
  holder.current = indexWith(['albacore-gnome-latest', 'albacore-gnome-20260906', 'yellowfin-kde-latest']);
  const names = useIsoNames();
  assert.ok(names instanceof Set);
  assert.deepEqual(
    [...names].sort(),
    ['albacore-gnome-20260906', 'albacore-gnome-latest', 'yellowfin-kde-latest'],
  );
  assert.ok(names.has('albacore-gnome-latest'));
  assert.equal(names.has('dakota-live-latest'), false);
});

test('a loaded-but-empty index yields an empty Set, not null', () => {
  holder.current = indexWith([]);
  const names = useIsoNames();
  assert.ok(names instanceof Set);
  assert.equal(names.size, 0);
});

test('each call returns a fresh Set the caller may mutate safely', () => {
  holder.current = indexWith(['albacore-gnome-latest']);
  const first = useIsoNames();
  first.add('caller-added');
  const second = useIsoNames();
  assert.notEqual(first, second);
  assert.equal(second.has('caller-added'), false);
  assert.equal(holder.current.entries.has('caller-added'), false, 'the shared index map is not mutated');
});
