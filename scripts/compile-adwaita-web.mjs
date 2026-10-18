#!/usr/bin/env node
// Precompiles the raw TypeScript sources that @gjsify packages ship
// (adwaita-web and adwaita-icons have no built JS) into sibling .js files
// with the repo's own Babel, so the bundler resolves their explicit `.js`
// import specifiers natively and no webpack config is needed.
//
// Runs on `postinstall` (fresh clones, CI) and `prebuild` (belts and
// braces for long-lived checkouts after a package update). Only writes
// inside node_modules; skips files whose output is newer than the source.

import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {transformFileAsync} = require('@babel/core');
const presetTypescript = require('@babel/preset-typescript');

const ROOT = process.cwd();
const SCOPE = join(ROOT, 'node_modules', '@gjsify');

function* walk(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (
      /\.[mc]?ts$/.test(entry.name) &&
      !/\.d\.[mc]?ts$/.test(entry.name) &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.startsWith('test.')
    ) {
      yield path;
    }
  }
}

let compiled = 0;
let skipped = 0;
for (const src of walk(SCOPE)) {
  const out = src.replace(/\.[mc]?ts$/, '.js');
  try {
    if (statSync(out).mtimeMs >= statSync(src).mtimeMs) {
      skipped += 1;
      continue;
    }
  } catch {
    // No output yet — compile below.
  }
  const {code} = await transformFileAsync(src, {
    babelrc: false,
    configFile: false,
    presets: [[presetTypescript, {allowDeclareFields: true, onlyRemoveTypeImports: true}]],
    filename: src,
  });
  writeFileSync(out, `${code}\n`);
  compiled += 1;
}
console.log(`adwaita-web sources ready (${compiled} compiled, ${skipped} up to date)`);

// Point package entry targets at the emitted .js siblings: several manifests
// map their entry (`main`, `exports`) straight at a `.ts` source, which the
// bundler would load untransformed. Only rewrites when the emitted file
// exists, so reruns and already-built manifests are no-ops.
function rewriteTarget(value, dir) {
  if (typeof value !== 'string' || !/\.[mc]?ts$/.test(value) || value.endsWith('.d.ts')) return value;
  const emitted = join(dir, value).replace(/\.[mc]?ts$/, '.js');
  try {
    statSync(emitted);
  } catch {
    return value;
  }
  return value.replace(/\.[mc]?ts$/, '.js');
}

function rewriteExports(node, dir) {
  if (Array.isArray(node)) return node.map((v) => rewriteExports(v, dir));
  if (node !== null && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, rewriteExports(v, dir)]));
  }
  return rewriteTarget(node, dir);
}

for (const entry of readdirSync(SCOPE, {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const manifestPath = join(SCOPE, entry.name, 'package.json');
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    continue;
  }
  const dir = join(SCOPE, entry.name);
  const next = {
    ...manifest,
    main: manifest.main === undefined ? undefined : rewriteTarget(manifest.main, dir),
    exports: manifest.exports === undefined ? undefined : rewriteExports(manifest.exports, dir),
  };
  writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
}
