#!/usr/bin/env node
// Verifies the vendored variant marks against the branding manifest that ships
// beside them (static/img/marks/branding-manifest.json, copied from
// tuna-os/branding along with the SVGs).
//
// The marks are vendored, not built, so nothing else notices when one is
// hand-edited, truncated by a bad copy, or added without its digest. The
// manifest is the asset contract that repository publishes; this holds the
// copy to it.

import {createHash} from 'node:crypto';
import {readFileSync, readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const MARKS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'img', 'marks');

let failures = 0;
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
    failures++;
  }
}

const manifest = JSON.parse(readFileSync(join(MARKS_DIR, 'branding-manifest.json'), 'utf8'));
const declared = Object.keys(manifest.assets).sort();
const present = readdirSync(MARKS_DIR).filter((f) => f.endsWith('.svg')).sort();

check(
  'every declared mark is present',
  declared.every((f) => present.includes(f)),
  `missing: ${declared.filter((f) => !present.includes(f)).join(', ')}`,
);

check(
  'no undeclared mark is present',
  present.every((f) => declared.includes(f)),
  `extra: ${present.filter((f) => !declared.includes(f)).join(', ')}`,
);

for (const name of declared) {
  if (!present.includes(name)) continue;
  const bytes = readFileSync(join(MARKS_DIR, name));
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  check(`${name} matches its digest`, digest === manifest.assets[name], `got ${digest}`);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — re-vendor from tuna-os/branding rather than editing these files.`);
  process.exit(1);
}
console.log(`\n${declared.length} mark(s) verified against the branding manifest.`);
