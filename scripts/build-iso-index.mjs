#!/usr/bin/env node
// Transforms `rclone lsjson` output (on stdin) into the structured
// iso-index.json the /download page consumes.
//
// Usage:
//   rclone lsjson R2:bluefin --recursive --files-only \
//     --include "*.iso" --include "*SHA256SUMS*" \
//   | node scripts/build-iso-index.mjs > static/iso-index.json
//
// The bucket (bluefin) is served at https://download.tunaos.org. Objects
// are grouped by their top-level prefix, which maps 1:1 to a product line
// (live-isos/ = the main TunaOS desktops, dakota/, ubuntu-26.04/, etc.).
// Unknown prefixes still render under a generic category, so a new ISO
// repo that starts uploading is picked up automatically with no code
// change here.

import {
  BASE_URL,
  CATEGORIES,
  titleCase,
  detectArch,
  buildIsoIndex,
} from './lib/iso-index.mjs';

function readStdin() {
  return new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (buf += c));
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
  });
}

export async function main() {
  const raw = (await readStdin()).trim();
  const entries = raw ? JSON.parse(raw) : [];
  const out = buildIsoIndex(entries);
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

// Only execute when invoked directly as a CLI script.
const isMain = process.argv[1] && (
  process.argv[1].endsWith('/build-iso-index.mjs') ||
  process.argv[1].endsWith('build-iso-index.mjs')
);

if (isMain) {
  await main();
}

// Re-exported for backward compatibility.
export {detectArch, titleCase, CATEGORIES, BASE_URL, buildIsoIndex};
