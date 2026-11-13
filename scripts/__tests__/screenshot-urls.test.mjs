#!/usr/bin/env node
// Unit tests for the screenshot URL mapping
// (src/components/ShotImg/screenshot-urls.ts). The file has no imports, and
// Node 24 strips erasable TypeScript natively.

import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mod = await import(
  pathToFileURL(join(ROOT, 'src/components/ShotImg/screenshot-urls.ts')).href
);
const {desktopShotPath, installerShotPath, releaseUrl, r2Url, screenshotSources} = mod;

const REL = 'https://github.com/tuna-os/tunaos/releases/download/screenshots';
const R2 = 'https://download.tunaos.org/screenshots';

// These rows are the table in tuna-os/tunaOS docs/SCREENSHOT-RELEASE.md.
test('desktop shots map to the root release assets', () => {
  const p = desktopShotPath('yellowfin', 'gnome');
  assert.equal(p, 'yellowfin-gnome-latest.png');
  assert.equal(releaseUrl(p), `${REL}/yellowfin-gnome-latest.png`);
  assert.equal(r2Url(p), `${R2}/yellowfin-gnome-latest.png`);
});

test('installer shots map `installer/` to `installer__`', () => {
  assert.equal(
    releaseUrl(installerShotPath('cosmic_', '01_welcome')),
    `${REL}/installer__cosmic_01_welcome-latest.png`,
  );
  assert.equal(
    releaseUrl(installerShotPath('smoke-kde_', '03')),
    `${REL}/installer__smoke-kde_03-latest.png`,
  );
  assert.equal(
    r2Url(installerShotPath('smoke-kde_', '03')),
    `${R2}/installer/smoke-kde_03-latest.png`,
  );
});

test('the release is tried first and R2 second', () => {
  const [first, second] = screenshotSources('yellowfin-gnome-latest.png');
  assert.ok(first.startsWith(REL));
  assert.ok(second.startsWith(R2));
});
