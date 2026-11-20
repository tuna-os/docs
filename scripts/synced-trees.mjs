#!/usr/bin/env node
// Print the docs/<slug>/ trees that sync-org-docs.mjs writes, one per line.
//
//   node scripts/synced-trees.mjs
//
// The Markdown Lint job passes each line to markdownlint as --ignore. The
// prose in these trees is authored in other repositories and overwritten on
// every sync, so a finding there is not this repo's to fix: an edit made here
// is reverted by the next sync. Without this, each sync PR that brought an
// upstream README with new findings failed the budget (#781: 969 > 966).
//
// The rule is the one the STE job already applies (generatedDirs in
// tuna-os/.github's ste-lint.mjs). A directory is synced when one of its files
// carries the front matter that the sync composes (isSyncedIndex), and it is
// not on the HAND_AUTHORED list that the sync itself refuses to overwrite. The
// two checks share one definition of "synced", so they cannot disagree about
// which prose this repo answers for.

import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isSyncedIndex} from './lib/org-doc-transform.mjs';
import {HAND_AUTHORED} from './sync-org-docs.mjs';

function* walk(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.mdx?$/.test(entry.name)) yield full;
  }
}

export function syncedTrees(root = process.cwd(), handAuthored = HAND_AUTHORED) {
  const docs = join(root, 'docs');
  let entries = [];
  try {
    entries = readdirSync(docs);
  } catch {
    return [];
  }
  const trees = [];
  for (const entry of entries.sort()) {
    if (handAuthored.has(entry)) continue;
    const dir = join(docs, entry);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of walk(dir)) {
      if (isSyncedIndex(readFileSync(file, 'utf8'))) {
        trees.push(relative(root, dir));
        break;
      }
    }
  }
  return trees;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const tree of syncedTrees()) console.log(tree);
}
