#!/usr/bin/env node
// Unit tests for the pure delivery-cutover routing module
// (src/data/delivery-policy.mjs): pinned-source shape, platform maps,
// cut-over matching, route kinds, and builder-preset URL shape.
//
// The module is plain dependency-free ESM, so it imports directly — no
// Docusaurus alias hook, no React, no DOM, no site build. Every policy used
// here is synthetic (empty, single-cutover-entry, removed-entry): no test
// may hardcode the reviewed table contents, which grow as targets qualify.

import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  BUILDER_PREREQUISITES,
  BUILDER_URL,
  DELIVERY_POLICY,
  PICKER_PLATFORMS,
  POLICY_SOURCE,
  fromUpstreamPlatform,
  getBuilderPresetUrl,
  getDeliveryRoute,
  isCutOver,
  toDocsPlatform,
  toUpstreamPlatform,
} from '../../src/data/delivery-policy.mjs';

const VARIANT = 'albacore';
const FLAVOR = 'gnome-hwe';
const PICKER_PLATFORM = 'x86_64-v2';
const UPSTREAM_PLATFORM = 'linux/amd64/v2';
const ISO_URL = 'https://download.tunaos.org/live-isos/albacore-gnome-hwe-latest.iso';

// One reviewed-copy entry, as delivery-cutover.py would emit it: the target
// platform is the upstream string, never the picker id.
function cutoverPolicy(platform = UPSTREAM_PLATFORM) {
  return {
    schemaVersion: 1,
    kind: 'delivery-cutover',
    cutover: [
      {
        target: {variant: VARIANT, flavor: FLAVOR, platform},
        evidence: 'synthetic-test-entry',
        preset: {},
      },
    ],
    retained: ['albacore-gnome-hwe-latest.iso'],
  };
}

const EMPTY_POLICY = {schemaVersion: 1, kind: 'delivery-cutover', cutover: [], retained: []};

test('policy source pin and empty initial policy shape', () => {
  assert.equal(POLICY_SOURCE.repository, 'tuna-os/tunaOS');
  assert.match(POLICY_SOURCE.revision, /^[0-9a-f]{40}$/, 'pin is a full commit SHA, never a mutable ref');
  assert.equal(DELIVERY_POLICY.schemaVersion, 1);
  assert.equal(DELIVERY_POLICY.kind, 'delivery-cutover');
  assert.deepEqual(DELIVERY_POLICY.cutover, []);
  assert.deepEqual(DELIVERY_POLICY.retained, []);
});

test('platform maps round-trip between picker, upstream, and docs ids', () => {
  assert.deepEqual([...PICKER_PLATFORMS].sort(), ['aarch64', 'x86_64', 'x86_64-v2']);
  assert.equal(toUpstreamPlatform('x86_64'), 'linux/amd64');
  assert.equal(toUpstreamPlatform('x86_64-v2'), 'linux/amd64/v2');
  assert.equal(toUpstreamPlatform('aarch64'), 'linux/arm64');
  for (const picker of PICKER_PLATFORMS) {
    assert.equal(fromUpstreamPlatform(toUpstreamPlatform(picker)), picker);
  }
  assert.equal(toDocsPlatform('x86_64'), 'amd64');
  assert.equal(toDocsPlatform('x86_64-v2'), 'amd64-v2');
  assert.equal(toDocsPlatform('aarch64'), 'arm64');
  assert.equal(toUpstreamPlatform('bogus'), null);
  assert.equal(fromUpstreamPlatform('bogus'), null);
  assert.equal(toDocsPlatform('bogus'), null);
});

test('isCutOver matches the exact target via picker or upstream platform', () => {
  const policy = cutoverPolicy();
  assert.equal(isCutOver(VARIANT, FLAVOR, PICKER_PLATFORM, policy), true);
  assert.equal(isCutOver(VARIANT, FLAVOR, UPSTREAM_PLATFORM, policy), true);
  assert.equal(isCutOver(VARIANT, FLAVOR, PICKER_PLATFORM, EMPTY_POLICY), false);
  assert.equal(isCutOver(VARIANT, 'gnome', PICKER_PLATFORM, policy), false, 'different flavor is not cut over');
  assert.equal(isCutOver('yellowfin', FLAVOR, PICKER_PLATFORM, policy), false, 'different variant is not cut over');
  assert.equal(isCutOver(VARIANT, FLAVOR, 'aarch64', policy), false, 'different platform is not cut over');
  assert.equal(
    isCutOver(VARIANT, FLAVOR, PICKER_PLATFORM, {...EMPTY_POLICY, cutover: [null, {}, {target: null}]}),
    false,
    'malformed entries never match',
  );
});

test('builder-preset URL carries the full delivery target', () => {
  assert.equal(
    getBuilderPresetUrl({variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM}),
    `${BUILDER_URL}/?image=${encodeURIComponent(`tuna-os/${VARIANT}:${FLAVOR}`)}&platform=${PICKER_PLATFORM}`,
  );
  assert.equal(
    getBuilderPresetUrl({variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM}),
    'https://iso.tunaos.org/?image=tuna-os%2Falbacore%3Agnome-hwe&platform=x86_64-v2',
  );
});

test('empty policy keeps prebuilt behavior; missing ISO is unsupported, never mismatched', () => {
  const prebuilt = getDeliveryRoute(
    {variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM, isoUrl: ISO_URL},
    EMPTY_POLICY,
  );
  assert.equal(prebuilt.kind, 'prebuilt');
  assert.equal(prebuilt.url, ISO_URL, 'primary stays the retained R2 download');
  assert.ok(prebuilt.builderUrl.includes(`platform=${PICKER_PLATFORM}`), 'generic builder fallback exposed');

  const unsupported = getDeliveryRoute(
    {variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM, isoUrl: null},
    EMPTY_POLICY,
  );
  assert.equal(unsupported.kind, 'unsupported');
  assert.equal(unsupported.reason, 'no-prebuilt');
  assert.ok(!('url' in unsupported), 'no download URL offered at all');
  assert.ok(unsupported.builderUrl.includes(`platform=${PICKER_PLATFORM}`), 'fallback keeps the requested platform');
});

test('cut-over entry routes browser-first with the retained R2 ISO secondary', () => {
  const route = getDeliveryRoute(
    {variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM, isoUrl: ISO_URL},
    cutoverPolicy(),
  );
  assert.equal(route.kind, 'builder-preset');
  assert.equal(route.url, getBuilderPresetUrl({variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM}));
  assert.equal(route.retainedUrl, ISO_URL, 'retained R2 ISO exposed as the fallback');
  assert.equal(route.prerequisites, BUILDER_PREREQUISITES);
});

test('cut-over without a retained ISO still routes builder-first with null fallback', () => {
  const route = getDeliveryRoute(
    {variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM, isoUrl: null},
    cutoverPolicy(),
  );
  assert.equal(route.kind, 'builder-preset');
  assert.equal(route.retainedUrl, null);
});

test('rollback: removing the entry restores prebuilt routing', () => {
  const target = {variant: VARIANT, flavor: FLAVOR, platform: PICKER_PLATFORM, isoUrl: ISO_URL};
  assert.equal(getDeliveryRoute(target, cutoverPolicy()).kind, 'builder-preset');
  assert.deepEqual(getDeliveryRoute(target, EMPTY_POLICY), getDeliveryRoute(target, DELIVERY_POLICY));
  assert.equal(getDeliveryRoute(target, EMPTY_POLICY).kind, 'prebuilt');
});
