#!/usr/bin/env node
// Verifies the vendored tunaOS identity (wordmarks and emoji marks) against
// static/img/identity/identity-manifest.json.
//
// The files are vendored from tuna-os/tunaOS, not built. Nothing else notices
// when one is hand-edited, truncated by a bad copy, or added without its
// digest. This gate holds the copy to the manifest.
//
// `--write` regenerates the digests after a refresh. Use it only right after
// you copy fresh files from tunaOS (see static/img/identity/README.md).

import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'img', 'identity');
const MANIFEST = join(ROOT, 'identity-manifest.json');
const DIRS = ['emoji', 'wordmarks'];

const digest = (rel) => `sha256:${createHash('sha256').update(readFileSync(join(ROOT, rel))).digest('hex')}`;
const present = DIRS.flatMap((d) =>
  readdirSync(join(ROOT, d))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => `${d}/${f}`),
).sort();

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

if (process.argv.includes('--write')) {
  manifest.assets = Object.fromEntries(present.map((rel) => [rel, digest(rel)]));
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote ${present.length} digest(s) to ${MANIFEST}`);
  process.exit(0);
}

let failures = 0;
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
    failures++;
  }
}

const declared = Object.keys(manifest.assets).sort();

check(
  'every declared file is present',
  declared.every((f) => present.includes(f)),
  `missing: ${declared.filter((f) => !present.includes(f)).join(', ')}`,
);
check(
  'no undeclared file is present',
  present.every((f) => declared.includes(f)),
  `extra: ${present.filter((f) => !declared.includes(f)).join(', ')}`,
);
check('the master emoji mark is present', present.includes('emoji/tunaos.svg'));

for (const rel of declared) {
  if (!present.includes(rel)) continue;
  const got = digest(rel);
  check(`${rel} matches its digest`, got === manifest.assets[rel], `got ${got}`);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — re-vendor from tuna-os/tunaOS rather than editing these files.`);
  process.exit(1);
}
console.log(`\n${declared.length} file(s) verified against the identity manifest.`);
