#!/usr/bin/env node
// Unit tests for the ImagePicker release-selection policy
// (src/components/ImagePicker/selection.ts), with no React or DOM involved.
//
// selection.ts is TypeScript that imports through the Docusaurus `@site/`
// alias. Node 24 strips erasable TypeScript natively, so the only thing this
// needs is a resolve hook mapping `@site/x` to `<repo>/x(.ts)`.

import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {dirname, join} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@site/')) {
      const base = join(ROOT, specifier.slice('@site/'.length));
      for (const candidate of [base, `${base}.ts`, join(base, 'index.ts')]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
          specifier = pathToFileURL(candidate).href;
          break;
        }
      }
    }
    const resolved = nextResolve(specifier, context);
    // package.json has no "type", so say what these files are rather than
    // letting Node guess and warn on every import.
    return resolved.url.endsWith('.ts') ? {...resolved, format: 'module-typescript'} : resolved;
  },
});

const sel = await import('../../src/components/ImagePicker/selection.ts');
const {VARIANTS} = await import('../../src/data/variants.ts');

test('variant list covers every published, non-rolling variant (not a hardcoded subset)', () => {
  const ids = sel.VARIANT_OPTIONS.map((o) => o.value);
  const expected = VARIANTS.filter((v) => !(v.id in sel.ROLLING_SIBLING_OF)).map((v) => v.id);
  assert.deepEqual(ids, expected);
  assert.ok(ids.length > 4, 'more than the four variants it once hardcoded');
  for (const sibling of Object.keys(sel.ROLLING_SIBLING_OF)) {
    assert.ok(!ids.includes(sibling), `${sibling} folds into its stable sibling`);
  }
});

test('step flow for a full tunaOS variant with desktops and editions', () => {
  const s = {product: 'tunaos', variant: 'albacore', desktop: 'gnome', edition: 'hwe'};
  assert.equal(sel.getNextStep('product', s), 'variant');
  assert.equal(sel.getNextStep('variant', s), 'desktop');
  assert.equal(sel.getNextStep('desktop', s), 'edition');
  assert.equal(sel.getNextStep('edition', s), 'result');
  assert.equal(sel.getPrevStep('result', s), 'edition');
  assert.equal(sel.getPrevStep('edition', s), 'desktop');
  assert.equal(sel.getPrevStep('product', s), null);
  assert.deepEqual(sel.getVisibleSteps(s), ['product', 'variant', 'desktop', 'edition', 'result']);
});

test('standard-only variants skip the edition step', () => {
  const s = {product: 'tunaos', variant: 'gurnard', desktop: 'gnome'};
  assert.equal(sel.hasExtraEditions('gurnard'), false);
  assert.equal(sel.getNextStep('desktop', s), 'result');
  assert.equal(sel.getPrevStep('result', s), 'desktop');
  assert.ok(!sel.getVisibleSteps(s).includes('edition'));
});

test('base-only variants skip the desktop step and fall back to their published tag', () => {
  const baseOnly = VARIANTS.find((v) => v.desktops.length === 0 || sel.getDesktopOptions(v.id).length === 0);
  if (!baseOnly) return;
  const s = {product: 'tunaos', variant: baseOnly.id};
  assert.equal(sel.hasDesktopOptions(baseOnly.id), false);
  assert.equal(sel.getNextStep('variant', s), 'result');
  assert.equal(sel.getPrevStep('result', s), 'variant');
  assert.deepEqual(sel.getVisibleSteps(s), ['product', 'variant', 'result']);
  assert.match(sel.buildImageName(s), new RegExp(`^ghcr\\.io/tuna-os/${baseOnly.id}:`));
});

test('non-tunaOS products jump straight to the result', () => {
  for (const product of ['dakota', 'tromso', 'xfce']) {
    const s = {product};
    assert.equal(sel.getNextStep('product', s), 'result');
    assert.equal(sel.getPrevStep('result', s), 'product');
    assert.deepEqual(sel.getVisibleSteps(s), ['product', 'result']);
    assert.match(sel.getIsoUrl(s, null), /^https:\/\/download\.tunaos\.org\/.+-live-latest\.iso$/);
  }
});

test('buildImageName composes registry, variant, desktop and edition suffix', () => {
  assert.equal(
    sel.buildImageName({product: 'tunaos', variant: 'yellowfin', desktop: 'kde', edition: 'nvidia'}),
    'ghcr.io/tuna-os/yellowfin:kde-nvidia',
  );
  assert.equal(
    sel.buildImageName({product: 'tunaos', variant: 'albacore', desktop: 'gnome50', edition: 'hwe'}),
    'ghcr.io/tuna-os/albacore:gnome50-hwe',
  );
  assert.equal(
    sel.buildImageName({product: 'tunaos', variant: 'marlin', desktop: 'gnome', edition: 'standard'}),
    'ghcr.io/tuna-os/marlin:gnome',
  );
});

test('getIsoUrl trusts the ISO index for HWE/NVIDIA/GNOME 50 combos instead of hardcoding them', () => {
  const s = {product: 'tunaos', variant: 'albacore', desktop: 'gnome50', edition: 'hwe'};
  assert.equal(sel.getIsoUrl(s, new Set()), null);
  assert.equal(sel.getIsoUrl(s, null), null, 'unknown until the index loads');
  assert.equal(
    sel.getIsoUrl(s, new Set(['albacore-gnome50-hwe-latest'])),
    'https://download.tunaos.org/live-isos/albacore-gnome50-hwe-latest.iso',
  );
  assert.equal(sel.getIsoUrl({product: 'tunaos', variant: 'albacore'}, new Set(['albacore-gnome-latest'])), null);
});

test('getIsoUrl resolves names that are in the published static/iso-index.json', () => {
  const index = JSON.parse(readFileSync(join(ROOT, 'static', 'iso-index.json'), 'utf8'));
  const names = new Set(index.categories.flatMap((c) => c.isos.map((i) => i.name)));
  const iso = [...names].find((n) => /^[a-z-]+-(gnome|kde|cosmic|niri)(-nvidia|-hwe|-cachyos)?-latest$/.test(n)
    && VARIANTS.some((v) => n.startsWith(`${v.id}-`) && !v.localBuildOnly));
  if (!iso) return;
  const variant = VARIANTS.filter((v) => iso.startsWith(`${v.id}-`)).sort((a, b) => b.id.length - a.id.length)[0].id;
  const rest = iso.slice(variant.length + 1, -'-latest'.length);
  const [desktop, edition = 'standard'] = rest.split('-');
  const url = sel.getIsoUrl({product: 'tunaos', variant, desktop, edition}, names);
  assert.equal(url, `https://download.tunaos.org/live-isos/${iso}.iso`);
});

test('local-build-only variants never claim a downloadable ISO', () => {
  const local = VARIANTS.find((v) => v.localBuildOnly);
  if (!local) return;
  const s = {product: 'tunaos', variant: local.id, desktop: 'gnome'};
  assert.equal(sel.getIsoUrl(s, new Set([`${local.id}-gnome-latest`])), null);
});

test('builder and docs URLs', () => {
  assert.equal(
    sel.getBuilderUrl('ghcr.io/tuna-os/albacore:gnome-hwe'),
    'https://iso.tunaos.org/?image=tuna-os%2Falbacore%3Agnome-hwe',
  );
  assert.equal(sel.getDocsUrl({product: 'tunaos', variant: 'bonito', desktop: 'kde', edition: 'nvidia'}), '/docs/bonito#kde-nvidia');
  assert.equal(sel.getDocsUrl({product: 'xfce'}), '/xfce-linux');
});
