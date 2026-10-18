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

// --- Delivery routing: public downloads vs qualified builder presets ---
// (Task 15 cut-over). Policies here are synthetic — empty, one entry, or a
// removed entry — so these tests assert routing behavior, never the current
// reviewed table contents.

const ISO_NAME = 'albacore-gnome-hwe-latest';
const ISO_URL = `https://download.tunaos.org/live-isos/${ISO_NAME}.iso`;
const CUTOVER_SEL = {product: 'tunaos', variant: 'albacore', desktop: 'gnome', edition: 'hwe', platform: 'x86_64-v2'};
const UPSTREAM_V2 = 'linux/amd64/v2';

function cutoverPolicy(platform = UPSTREAM_V2) {
  return {
    schemaVersion: 1,
    kind: 'delivery-cutover',
    cutover: [
      {
        target: {variant: 'albacore', flavor: 'gnome-hwe', platform},
        evidence: 'synthetic-test-entry',
        preset: {},
      },
    ],
    retained: [`${ISO_NAME}.iso`],
  };
}

const EMPTY_POLICY = {schemaVersion: 1, kind: 'delivery-cutover', cutover: [], retained: []};

test('default platform is the v2 baseline where the variant ships one', () => {
  assert.equal(sel.defaultPlatform('albacore'), 'x86_64-v2');
  assert.equal(sel.defaultPlatform('yellowfin'), 'x86_64-v2');
  // Behavioral cross-check against the real coverage data, not a second
  // hardcoded table: the default follows whatever the variant publishes.
  for (const v of VARIANTS) {
    const expected = v.platforms.includes('amd64-v2')
      ? 'x86_64-v2'
      : v.platforms.includes('amd64')
        ? 'x86_64'
        : 'aarch64';
    assert.equal(sel.defaultPlatform(v.id), expected, `${v.id} defaults from its published platforms`);
  }
});

test('empty policy keeps prebuilt R2 behavior, including the v2 default', () => {
  const names = new Set([ISO_NAME]);
  const explicit = sel.getDeliveryRoute(CUTOVER_SEL, names, EMPTY_POLICY);
  assert.equal(explicit.kind, 'prebuilt');
  assert.equal(explicit.url, ISO_URL);
  assert.equal(explicit.url, sel.getIsoUrl(CUTOVER_SEL, names));
  // No platform picked: albacore defaults to x86_64-v2 and still prebuilt.
  const {platform: _dropped, ...noPlatform} = CUTOVER_SEL;
  const implicit = sel.getDeliveryRoute(noPlatform, names, EMPTY_POLICY);
  assert.equal(implicit.kind, 'prebuilt');
  assert.equal(implicit.url, ISO_URL);
});

test('qualified target routes browser-first with the retained R2 ISO secondary', () => {
  const route = sel.getDeliveryRoute(CUTOVER_SEL, new Set([ISO_NAME]), cutoverPolicy());
  assert.equal(route.kind, 'builder-preset');
  assert.equal(
    route.url,
    'https://iso.tunaos.org/?image=tuna-os%2Falbacore%3Agnome-hwe&platform=x86_64-v2',
  );
  assert.equal(route.retainedUrl, ISO_URL, 'retained R2 download exposed as the fallback');
  assert.ok(route.prerequisites?.browsers, 'browser prerequisites travel with the builder action');
  // The picker-id default resolves to the same qualified target.
  const {platform: _dropped, ...noPlatform} = CUTOVER_SEL;
  const viaDefault = sel.getDeliveryRoute(noPlatform, new Set([ISO_NAME]), cutoverPolicy());
  assert.equal(viaDefault.kind, 'builder-preset');
  assert.equal(viaDefault.retainedUrl, ISO_URL);
});

test('qualified target without a published ISO still routes builder-first with null retained', () => {
  const route = sel.getDeliveryRoute(CUTOVER_SEL, new Set(), cutoverPolicy());
  assert.equal(route.kind, 'builder-preset');
  assert.equal(route.retainedUrl, null);
});

test('ARM64 without a prebuilt is unsupported, never an x86_64 download', () => {
  // Published ISOs are x86-64 builds: the index hit must not leak through.
  const route = sel.getDeliveryRoute({...CUTOVER_SEL, platform: 'aarch64'}, new Set([ISO_NAME]), EMPTY_POLICY);
  assert.equal(route.kind, 'unsupported');
  assert.equal(route.reason, 'no-prebuilt');
  assert.ok(!('url' in route && route.url), 'no mismatched-arch download offered');
  assert.ok(route.builderUrl.includes('platform=aarch64'), 'fallback keeps the requested platform');
});

test('local-build-only stays blocked even with a matching cut-over entry', () => {
  const local = VARIANTS.find((v) => v.localBuildOnly);
  if (!local) return;
  const policy = {
    schemaVersion: 1,
    kind: 'delivery-cutover',
    cutover: [
      {
        target: {variant: local.id, flavor: 'gnome', platform: 'linux/amd64'},
        evidence: 'synthetic-test-entry',
        preset: {},
      },
    ],
    retained: [],
  };
  const route = sel.getDeliveryRoute(
    {product: 'tunaos', variant: local.id, desktop: 'gnome', platform: 'x86_64'},
    new Set([`${local.id}-gnome-latest`]),
    policy,
  );
  assert.equal(route.kind, 'unsupported');
  assert.equal(route.reason, 'local-build-only');
});

test('platform outside the variant coverage is an explicit blocker, not a substitution', () => {
  // Only the v2-baseline variants publish amd64-v2: a v2 pick elsewhere has no build.
  const nonV2 = VARIANTS.find((v) => !v.localBuildOnly && !v.platforms.includes('amd64-v2'));
  assert.ok(nonV2, 'expected a variant without v2 coverage to test against');
  const route = sel.getDeliveryRoute(
    {product: 'tunaos', variant: nonV2.id, desktop: 'gnome', platform: 'x86_64-v2'},
    new Set([ISO_NAME]),
    EMPTY_POLICY,
  );
  assert.equal(route.kind, 'unsupported');
  assert.equal(route.reason, 'unsupported-platform');
  assert.ok(!('url' in route && route.url), 'no download from another platform substituted');
});

test('rollback: removing the cut-over entry restores prebuilt routing', () => {
  const names = new Set([ISO_NAME]);
  assert.equal(sel.getDeliveryRoute(CUTOVER_SEL, names, cutoverPolicy()).kind, 'builder-preset');
  const rolledBack = sel.getDeliveryRoute(CUTOVER_SEL, names, EMPTY_POLICY);
  assert.equal(rolledBack.kind, 'prebuilt');
  assert.equal(rolledBack.url, ISO_URL);
});

test('non-tunaOS products stay on prebuilt even with a cut-over policy', () => {
  const route = sel.getDeliveryRoute({product: 'dakota'}, null, cutoverPolicy());
  assert.equal(route.kind, 'prebuilt');
  assert.match(route.url, /^https:\/\/download\.tunaos\.org\/dakota\//);
});
