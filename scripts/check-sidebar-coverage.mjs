#!/usr/bin/env node

// Fails when a docs/<slug>/ tree synced by sync-org-docs.mjs has no entry
// reachable from sidebars.ts. Docusaurus still builds and routes those pages
// (onBrokenLinks is 'warn', and there is no equivalent setting for "page not
// in any sidebar"), so a page can be published, indexed by search, and
// linkable by direct URL while being impossible to find by navigating the
// site. See tuna-os/docs#312.
//
// sync-org-docs.mjs discovers new repos automatically; sidebars.ts is
// hand-written. Nothing connects the two, so the gap only grows: a repo
// added to the org gets a docs/<slug>/ tree the same day and a nav entry
// whenever someone happens to notice it is missing.
//
// This check closes that gap at the point a slug is introduced rather than
// leaving it to be rediscovered later: it compares the slugs that actually
// have files on disk against the doc ids reachable from sidebars.ts, and
// fails on anything present but unreachable — unless it is explicitly
// recorded in NOT_NAVIGABLE below, which makes "deliberately no nav entry"
// distinguishable from "forgotten".

import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isSyncedIndex} from './sync-org-docs.mjs';

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, 'docs');
const SIDEBARS_PATH = join(ROOT, 'sidebars.ts');

// Slugs with a docs/<slug>/ tree that are deliberately not reachable from any
// sidebar, with a one-line reason each. A slug here that later gains a real
// sidebar entry is harmless (it just stops needing the exemption); a slug
// missing from here fails the build the moment it stops being reachable.
const NOT_NAVIGABLE = new Set([
  // branding: docs/branding/index.md uses the same synced-index frontmatter
  // template as a real sync target (isSyncedIndex() matches on shape, not
  // provenance), but there is no tuna-os/branding repo — this tree is
  // hand-authored and was never meant to appear in a top-level nav category.
  'branding',
]);

// Extract every quoted doc id from sidebars.ts. This intentionally does not
// parse the file as TypeScript: ids appear as plain string literals (bare
// ['intro', 'faq'] entries, {id: '...'} object fields, {type: 'doc', id:
// '...'} links), and a regex over the source text catches all three shapes
// without needing a TS toolchain in this script.
function extractSidebarIds(source) {
  const ids = new Set();
  const idRe = /(?:^|[[,{]|id:)\s*['"]([a-zA-Z0-9/_-]+)['"]/g;
  let match;
  while ((match = idRe.exec(source)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

// A slug is "reachable" if any doc id in sidebars.ts starts with
// `${slug}/` (nested docs, the common case) or equals `slug` exactly (a
// single-page tree with no subdirectory, e.g. a bare 'community' doc id).
function isReachable(slug, sidebarIds) {
  if (sidebarIds.has(slug)) return true;
  const prefix = `${slug}/`;
  for (const id of sidebarIds) {
    if (id.startsWith(prefix)) return true;
  }
  return false;
}

function findMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...findMarkdownFiles(full));
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

// Only slugs whose index.md carries sync-org-docs.mjs's generated
// frontmatter are in scope: this check is about the producer/consumer gap
// between that script and sidebars.ts, not about every hand-authored page
// under docs/. A slug with files but no index.md (e.g. docs/guides/) is
// hand-maintained content with its own top-level sidebar category and is
// out of scope the same way.
function syncedSlugs() {
  return readdirSync(DOCS_DIR).filter((name) => {
    const full = join(DOCS_DIR, name);
    if (!statSync(full).isDirectory()) return false;
    const indexPath = join(full, 'index.md');
    try {
      return isSyncedIndex(readFileSync(indexPath, 'utf8'));
    } catch {
      return false;
    }
  });
}

function checkCoverage() {
  const sidebarSource = readFileSync(SIDEBARS_PATH, 'utf8');
  const sidebarIds = extractSidebarIds(sidebarSource);

  const unreachable = [];
  for (const slug of syncedSlugs()) {
    if (NOT_NAVIGABLE.has(slug)) continue;
    if (isReachable(slug, sidebarIds)) continue;
    const fileCount = findMarkdownFiles(join(DOCS_DIR, slug)).length;
    if (fileCount === 0) continue; // empty directory, nothing to reach
    unreachable.push({slug, fileCount});
  }
  return unreachable;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const unreachable = checkCoverage();
  if (unreachable.length > 0) {
    console.error('The following synced docs/<slug>/ trees have files but no id reachable from sidebars.ts:');
    for (const {slug, fileCount} of unreachable.sort((a, b) => b.fileCount - a.fileCount)) {
      console.error(`  ${slug} (${fileCount} file${fileCount === 1 ? '' : 's'})`);
    }
    console.error(
      '\nEach one is published and linkable but not navigable. Add a sidebar ' +
      'entry, or add the slug to NOT_NAVIGABLE in scripts/check-sidebar-coverage.mjs ' +
      'with a one-line reason if it should deliberately stay unlisted.',
    );
    process.exitCode = 1;
  } else {
    console.log('All synced doc trees are reachable from sidebars.ts.');
  }
}

export {extractSidebarIds, isReachable, findMarkdownFiles, syncedSlugs, checkCoverage, NOT_NAVIGABLE};
