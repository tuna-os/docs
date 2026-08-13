#!/usr/bin/env node

import {readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';

const DOCS_DIR = 'docs';

function filesUnder(root) {
  const files = [];
  for (const entry of readdirSync(root, {withFileTypes: true})) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function findCaseCollisions(paths, root = '.') {
  const byLowerPath = new Map();
  for (const path of paths) {
    const relativePath = relative(root, path);
    const key = relativePath.toLowerCase();
    const matches = byLowerPath.get(key) || [];
    matches.push(relativePath);
    byLowerPath.set(key, matches);
  }
  return [...byLowerPath.values()].filter((matches) => matches.length > 1);
}

function main() {
  const collisions = findCaseCollisions(filesUnder(DOCS_DIR), DOCS_DIR);
  if (collisions.length === 0) {
    console.log(`No case-colliding files found under ${DOCS_DIR}/`);
    return;
  }
  for (const matches of collisions) {
    console.error(`Case-colliding docs paths: ${matches.join(' and ')}`);
  }
  process.exitCode = 1;
}

export {findCaseCollisions, filesUnder};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
