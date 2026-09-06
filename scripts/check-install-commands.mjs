#!/usr/bin/env node

// Check package names in documented Homebrew install commands. A registry outage
// is a warning; a definitive missing formula/cask is a documentation error.
//
// Third-party taps are resolved too, and scoped to the code block they were
// tapped in. `brew tap owner/name` followed by `brew install thing` documents
// thing-from-that-tap, and formulae.brew.sh only indexes homebrew-core and
// homebrew-cask, so checking a tap package against core alone reports every
// one of them as missing -- which is what this check did for corral-vm and
// tavern (both real, in tuna-os/homebrew-tap) until 2026-09-06.
//
// Scoping is per block rather than per file on purpose. A page may document
// the same package from more than one tap, and those are different claims:
// docs/bluefin-cli/index.md offers bluefin-cli from tuna-os/tap (never
// published) and from ublue-os/homebrew-experimental-tap (real). File-level
// scoping would let the working one mask the broken one. When a package
// resolves in some other tap the same file documents, that is a warning and
// not an error -- the page is accurate, it just leads with a command that
// does not work yet, and it says so itself.

import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = process.cwd();
const FORMULA_API = 'https://formulae.brew.sh/api/formula';
const CASK_API = 'https://formulae.brew.sh/api/cask';
// raw.githubusercontent rather than the GitHub API: no auth, and no 60-req/hr
// unauthenticated rate limit to trip over on a runner shared with other jobs.
const RAW = 'https://raw.githubusercontent.com';

// `brew tap owner/name` lives at github.com/owner/homebrew-name, except when
// the name already carries the prefix (ublue-os/homebrew-experimental-tap).
export function tapRepo(tap) {
  const [owner, name] = tap.split('/');
  return `${owner}/${name.startsWith('homebrew-') ? name : `homebrew-${name}`}`;
}

// Homebrew shards large taps into Formula/<letter>/; small ones stay flat.
function tapPaths(name) {
  const letter = name[0].toLowerCase();
  return [
    ['formula', `Formula/${name}.rb`],
    ['formula', `Formula/${letter}/${name}.rb`],
    ['cask', `Casks/${name}.rb`],
    ['cask', `Casks/${letter}/${name}.rb`],
  ];
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (/\.(md|mdx)$/i.test(entry.name)) files.push(path);
  }
  return files;
}

// Returns each fenced block's body plus the 1-based file line its first body
// line sits on. The line number used to be counted from the start of the
// block, so every reported location pointed into the wrong part of the file.
export function codeBlocks(markdown) {
  return [...markdown.matchAll(/```[^\n]*\n([\s\S]*?)\n```|~~~[^\n]*\n([\s\S]*?)\n~~~/g)]
    .map((match) => {
      const body = match[1] ?? match[2];
      // +1 for the fence line itself, +1 to make the body line 1-based.
      const offset = markdown.slice(0, match.index).split('\n').length + 1;
      return {body, offset};
    });
}

export function extractBrewPackages(markdown, filename = '<stdin>') {
  const found = new Map();
  for (const {body, offset} of codeBlocks(markdown)) {
    const lines = body.split('\n');
    // Taps active in this block. `brew tap` earlier in the block applies to
    // every `brew install` after it; a later block starts clean.
    const taps = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].replace(/\s*\\\s*$/, ' ');

      const tap = line.match(/^\s*(?:[$#]\s*)?brew\s+tap\s+([A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*)/);
      if (tap) {
        if (!taps.includes(tap[1])) taps.push(tap[1]);
        continue;
      }

      const match = line.match(/^\s*(?:[$#]\s*)?brew\s+install\s+(.+)/);
      if (!match || /no-verify\b/i.test(line)) continue;
      let command = match[1];
      const startLine = i;
      while (i + 1 < lines.length && /\\\s*$/.test(lines[i])) {
        i += 1;
        command += ` ${lines[i].replace(/\s*\\\s*$/, ' ')}`;
      }
      command = command.split('#', 1)[0];
      for (const token of command.split(/\s+/).map((item) => item.trim()).filter(Boolean)) {
        if (token.startsWith('-') || token.includes('$') || token.includes('<') || token.includes('>')) continue;
        const name = token.replace(/[;,]+$/, '');
        // Either a bare package, or `owner/tap/thing`, which carries its own
        // tap inline. Anything else (a path, a two-segment fragment) is not a
        // package name -- validate per segment, since the segment pattern
        // itself has no '/' in it.
        const parts = name.split('/');
        if (parts.length !== 1 && parts.length !== 3) continue;
        if (!parts.every((seg) => /^[A-Za-z0-9][A-Za-z0-9+_.-]*$/.test(seg))) continue;
        const inline = parts.length === 3 ? [`${parts[0]}/${parts[1]}`] : [];
        const bare = parts.length === 3 ? parts[2] : name;
        // Keyed by name *and* tap set: the same package documented under two
        // taps is two distinct claims, and only one of them may hold.
        const scope = [...inline, ...taps];
        const key = `${bare}\u0000${scope.join(',')}`;
        if (!found.has(key)) {
          found.set(key, {name: bare, taps: scope, filename, line: offset + startLine});
        }
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

// Does `name` exist in `tap`? Same outage semantics as core: 404 is a real
// answer, anything else throws so a GitHub hiccup stays a warning rather
// than turning into a documentation error.
export async function checkTap(name, tap, fetchImpl = fetch) {
  const repo = tapRepo(tap);
  for (const [kind, path] of tapPaths(name)) {
    if (await lookup(`${RAW}/${repo}/HEAD/${path}`, fetchImpl)) return `${kind} in ${tap}`;
  }
  return null;
}

// Resolve against homebrew-core/cask first, then the taps the code block
// itself tapped.
export async function resolve(name, taps, fetchImpl = fetch) {
  const core = await checkFormula(name, fetchImpl);
  if (core) return core;
  for (const tap of taps) {
    const hit = await checkTap(name, tap, fetchImpl);
    if (hit) return hit;
  }
  return null;
}

export async function checkFiles(files, fetchImpl = fetch, log = console) {
  const packages = [];
  // Every tap any block in a given file taps. Used only to soften a failure
  // into a warning: a package missing from its own block's tap but present in
  // another the same page documents is a page that leads with a command that
  // does not work yet, not a page naming something that does not exist.
  const tapsByFile = new Map();
  for (const filename of files) {
    const items = extractBrewPackages(readFileSync(filename, 'utf8'), filename);
    packages.push(...items);
    const all = tapsByFile.get(filename) ?? new Set();
    for (const item of items) for (const tap of item.taps) all.add(tap);
    tapsByFile.set(filename, all);
  }

  let errors = 0;
  const pending = [...packages];
  async function worker() {
    while (pending.length) {
      const item = pending.shift();
      const where = `${relative(ROOT, item.filename)}:${item.line}`;
      const scope = item.taps.length ? ` [${item.taps.join(', ')}]` : '';
      try {
        const kind = await resolve(item.name, item.taps, fetchImpl);
        if (kind) {
          log.log(`ok: ${item.name} (${kind})`);
          continue;
        }
        // Not where this block says it is. Before failing, check the rest of
        // the page.
        const others = [...(tapsByFile.get(item.filename) ?? [])].filter((t) => !item.taps.includes(t));
        let elsewhere = null;
        for (const tap of others) {
          elsewhere = await checkTap(item.name, tap, fetchImpl);
          if (elsewhere) break;
        }
        if (elsewhere) {
          log.warn(`${item.name} is not in${scope} — this page documents it as ${elsewhere} (${where})`);
        } else {
          log.error(`missing Homebrew formula/cask: ${item.name}${scope} (${where})`);
          errors += 1;
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
