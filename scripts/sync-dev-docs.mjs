#!/usr/bin/env node
// Syncs developer docs from tuna-os/tunaOS/docs/book/src/ into the
// Docusaurus site's docs/dev/ directory. Runs in CI; opens a PR on change.
//
// The source repo is the single source of truth — docs are authored
// alongside the code they document. This script pulls them so the
// Docusaurus site always renders the current version.
//
// Usage:
//   node scripts/sync-dev-docs.mjs

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';

const SOURCE_REPO = 'https://github.com/tuna-os/tunaOS.git';
const SOURCE_DIR = 'docs/book/src';
const TARGET_DIR = 'docs/dev';

// Map of source filename → Docusaurus frontmatter
// Files not listed here use a default sidebar_position based on order.
const FRONTMATTER = {
  'introduction.md': `---
sidebar_position: 1
---`,
  'building.md': `---
sidebar_position: 2
---`,
  'live-iso-generation.md': `---
sidebar_position: 3
---`,
  'ci-cd.md': `---
sidebar_position: 4
---`,
  'troubleshooting.md': `---
sidebar_position: 5
---`,
};

// Files in the book to skip (e.g., SUMMARY.md is an mdBook artifact)
const SKIP = new Set(['SUMMARY.md']);

function cloneSource() {
  const tmp = execSync('mktemp -d', {encoding: 'utf8'}).trim();
  execSync(
    `git clone --depth=1 --filter=blob:none --sparse ${SOURCE_REPO} ${tmp}`,
    {stdio: 'inherit'},
  );
  execSync(`git -C ${tmp} sparse-checkout set ${SOURCE_DIR}`, {
    stdio: 'inherit',
  });
  return join(tmp, SOURCE_DIR);
}

function fixMdLinks(content) {
  // Convert mdBook-style relative links to Docusaurus format.
  // E.g., [Building](building.md) stays as-is (Docusaurus handles it).
  // [Redfin Setup](../rhel-setup.md) becomes an absolute GitHub link.
  let c = content.replace(
    /\[([^\]]+)\]\(\.\.\/([^)]+)\)/g,
    '[$1](https://github.com/tuna-os/tunaOS/blob/main/docs/$2)',
  );
  return c;
}

function applyFrontmatter(filename, content) {
  const fm = FRONTMATTER[filename];
  if (!fm) return content;
  // Strip any existing mdBook-style title (# Title at start)
  // and replace with proper Docusaurus frontmatter.
  const cleaned = content.replace(/^# .*\n\n?/, '');
  return fm + '\n\n' + cleaned;
}

function main() {
  const srcDir = cloneSource();

  for (const file of readdirSync(srcDir).sort()) {
    if (!file.endsWith('.md') || SKIP.has(file)) continue;

    const content = readFileSync(join(srcDir, file), 'utf8');
    const processed = fixMdLinks(applyFrontmatter(file, content));
    const target = join(TARGET_DIR, file);

    const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
    if (existing === processed) continue;

    writeFileSync(target, processed);
    console.log(`Updated ${target}`);
  }

  console.log('Sync complete.');
}

main();
