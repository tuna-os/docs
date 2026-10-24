#!/usr/bin/env node
// Unit tests for src/utils/isoNaming.ts — the shared convention that turns
// a variant + flavor image ref into the live-ISO filename published to
// https://download.tunaos.org/live-isos/ (see scripts/build-iso-index.mjs
// for the authoritative naming scheme).
//
// isoNaming.ts is dependency-free TypeScript. Node 24 strips erasable
// TypeScript natively, so the only thing this needs is the resolve hook
// below saying what .ts files are (package.json has no "type"), following
// scripts/__tests__/image-picker-selection.test.mjs.
//
// Usage:
//   node scripts/__tests__/iso-naming.test.mjs

import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {join, dirname} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return resolved.url.endsWith('.ts') ? {...resolved, format: 'module-typescript'} : resolved;
  },
});

const {ISO_BASE_URL, isoNameForImage} = await import(join(ROOT, 'src/utils/isoNaming.ts'));
const {VARIANTS} = await import(join(ROOT, 'src/data/variants.ts'));

test('ISO_BASE_URL is the published live-ISO directory', () => {
  assert.equal(ISO_BASE_URL, 'https://download.tunaos.org/live-isos');
});

test('composes <variant>-<tag>-latest from a ghcr image ref', () => {
  assert.equal(isoNameForImage('albacore', 'ghcr.io/tuna-os/albacore:gnome'), 'albacore-gnome-latest');
  assert.equal(isoNameForImage('yellowfin', 'ghcr.io/tuna-os/yellowfin:kde'), 'yellowfin-kde-latest');
  assert.equal(isoNameForImage('gurnard', 'ghcr.io/tuna-os/gurnard:base'), 'gurnard-base-latest');
});

test('hyphenated edition tags are carried through whole', () => {
  assert.equal(
    isoNameForImage('albacore', 'ghcr.io/tuna-os/albacore:gnome-hwe'),
    'albacore-gnome-hwe-latest',
  );
  assert.equal(
    isoNameForImage('albacore', 'ghcr.io/tuna-os/albacore:gnome-nvidia'),
    'albacore-gnome-nvidia-latest',
  );
  assert.equal(
    isoNameForImage('marlin', 'ghcr.io/tuna-os/marlin:gnome-cachyos'),
    'marlin-gnome-cachyos-latest',
  );
});

test('the variant id is used verbatim, not parsed back out of the image ref', () => {
  // VariantLanding passes the variant it is rendering, whose id is the
  // published name; the repo part of the ref is not consulted.
  assert.equal(isoNameForImage('bonito-rawhide', 'ghcr.io/tuna-os/bonito:gnome'), 'bonito-rawhide-gnome-latest');
});

test('every flavor image in the real VARIANTS data maps to its published name', () => {
  // Cross-check against the data that actually drives the site, parsing
  // the tag independently (last colon segment) so a parsing change in the
  // implementation cannot agree with itself here.
  let checked = 0;
  for (const variant of VARIANTS) {
    for (const flavor of variant.flavors ?? []) {
      const tag = flavor.image.split(':').at(-1);
      assert.equal(
        isoNameForImage(variant.id, flavor.image),
        `${variant.id}-${tag}-latest`,
        flavor.image,
      );
      checked++;
    }
  }
  assert.ok(checked > 50, `expected the full flavor catalog, checked only ${checked}`);
});

test('an image ref with no tag yields null, never a fabricated name', () => {
  assert.equal(isoNameForImage('albacore', 'ghcr.io/tuna-os/albacore'), null);
  assert.equal(isoNameForImage('albacore', ''), null);
});

test('an empty tag yields null', () => {
  assert.equal(isoNameForImage('albacore', 'ghcr.io/tuna-os/albacore:'), null);
});

test('characterization: a registry-with-port ref is outside the documented contract', () => {
  // The documented ref shape is ghcr.io/tuna-os/<variant>:<tag> — exactly
  // one colon. With a port the current split(':')[1] parsing returns the
  // port segment instead of the tag. This pins the current behavior so
  // fixing it is a deliberate test change, not a silent one; no flavor in
  // VARIANTS uses a port, so nothing published is affected today.
  assert.equal(
    isoNameForImage('albacore', 'ghcr.io:5000/tuna-os/albacore:gnome'),
    'albacore-5000/tuna-os/albacore-latest',
  );
});
