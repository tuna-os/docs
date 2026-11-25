#!/usr/bin/env node
// The X13s link on /download must never be a 404: it exists only when the
// live index lists the exact object tunaOS publishes.
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {join, dirname} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {buildIsoIndex} from '../lib/iso-index.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return resolved.url.endsWith('.ts') ? {...resolved, format: 'module-typescript'} : resolved;
  },
});
const {findX13sIso} = await import(join(ROOT, 'src/data/x13s.ts'));

const indexOf = (paths) => {
  const built = buildIsoIndex(paths.map((Path) => ({Path, Name: Path.split('/').pop(), Size: 5, ModTime: '2026-11-24T00:00:00Z'})));
  const isos = built.categories.find((c) => c.id === 'live-isos')?.isos ?? [];
  return {entries: new Map(isos.map((i) => [i.name, i])), all: isos, generatedAt: null};
};

test('the published object is found with its real URL', () => {
  const iso = findX13sIso(indexOf(['live-isos/bonito-gnome-x13s-latest-arm64.iso']));
  assert.equal(iso.url, 'https://download.tunaos.org/live-isos/bonito-gnome-x13s-latest-arm64.iso');
});

test('nothing is offered while it is unpublished, loading, or only the archived ISO exists', () => {
  assert.equal(findX13sIso(null), null);
  assert.equal(findX13sIso(indexOf(['bonito-x13s/bonito-x13s-latest.iso', 'live-isos/bonito-gnome-latest-arm64.iso'])), null);
});
