#!/usr/bin/env node

// Check package names in documented Homebrew install commands. A registry outage
// is a warning; a definitive missing formula/cask is a documentation error.

import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = process.cwd();
const FORMULA_API = 'https://formulae.brew.sh/api/formula';
const CASK_API = 'https://formulae.brew.sh/api/cask';

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (/\.(md|mdx)$/i.test(entry.name)) files.push(path);
  }
  return files;
}

export function codeBlocks(markdown) {
  return [...markdown.matchAll(/```[^\n]*\n([\s\S]*?)\n```|~~~[^\n]*\n([\s\S]*?)\n~~~/g)]
    .map((match) => match[1] ?? match[2]);
}

export function extractBrewPackages(markdown, filename = '<stdin>') {
  const found = new Map();
  for (const block of codeBlocks(markdown)) {
    const lines = block.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].replace(/\s*\\\s*$/, ' ');
      const match = line.match(/^\s*(?:[$#]\s*)?brew\s+install\s+(.+)/);
      if (!match || /no-verify\b/i.test(line)) continue;
      let command = match[1];
      while (i + 1 < lines.length && /\\\s*$/.test(lines[i])) {
        i += 1;
        command += ` ${lines[i].replace(/\s*\\\s*$/, ' ')}`;
      }
      command = command.split('#', 1)[0];
      for (const token of command.split(/\s+/).map((item) => item.trim()).filter(Boolean)) {
        if (token.startsWith('-') || token.includes('$') || token.includes('<') || token.includes('>')) continue;
        const name = token.replace(/[;,]+$/, '');
        if (!/^[A-Za-z0-9][A-Za-z0-9+_.-]*$/.test(name)) continue;
        if (!found.has(name)) found.set(name, {name, filename, line: i + 1});
      }
    }
  }
  return [...found.values()];
}

async function lookup(url, fetchImpl) {
  const response = await fetchImpl(url, {headers: {'user-agent': 'tuna-os-docs-install-check'}});
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return true;
}

export async function checkFormula(name, fetchImpl = fetch) {
  if (await lookup(`${FORMULA_API}/${encodeURIComponent(name)}.json`, fetchImpl)) return 'formula';
  if (await lookup(`${CASK_API}/${encodeURIComponent(name)}.json`, fetchImpl)) return 'cask';
  return null;
}

export async function checkFiles(files, fetchImpl = fetch, log = console) {
  const packages = new Map();
  for (const filename of files) {
    for (const item of extractBrewPackages(readFileSync(filename, 'utf8'), filename)) {
      if (!packages.has(item.name)) packages.set(item.name, item);
    }
  }

  let errors = 0;
  const pending = [...packages.values()];
  async function worker() {
    while (pending.length) {
      const item = pending.shift();
      try {
        const kind = await checkFormula(item.name, fetchImpl);
        if (!kind) {
          log.error(`missing Homebrew formula/cask: ${item.name} (${relative(ROOT, item.filename)}:${item.line})`);
          errors += 1;
        } else {
          log.log(`ok: ${item.name} (${kind})`);
        }
      } catch (error) {
        log.warn(`could not verify ${item.name}: ${error.message} (registry unavailable)`);
      }
    }
  }
  await Promise.all(Array.from({length: Math.min(4, pending.length)}, worker));
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const files = args.length ? args : walk(join(ROOT, 'docs')).concat(join(ROOT, 'README.md'));
  const errors = await checkFiles(files);
  if (errors) process.exitCode = 1;
}
