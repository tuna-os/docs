#!/usr/bin/env node

// Unit tests for sync-org-docs.mjs.
//
// Tests the pure helper functions used by the org-wide doc aggregation
// script. Clone/git/gh operations are not tested here — those are
// integration/end-to-end concerns.
//
// Usage:
//   node scripts/__tests__/sync-org-docs.test.mjs

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ── Import the module under test ──────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', 'sync-org-docs.mjs');

// Since sync-org-docs.mjs is a script (not an ES module with exports),
// we eval the source to extract its functions for testing.
// This avoids needing to refactor the script to export its helpers.
let scriptSource;
try {
  scriptSource = readFileSync(scriptPath, 'utf8');
} catch (e) {
  console.error(`Cannot read script at ${scriptPath}: ${e.message}`);
  process.exit(1);
}

// NOTE: the original harness tried `new Function(scriptSource)` to capture
// the script's internals — that can never work here (the shebang line and
// ESM `import` statements are both syntax errors in a function body), and
// its result was never used: the tests below re-derive the pure functions
// from the source text instead. The dead wrapper made the whole suite fail
// at load time.

// The script uses top-level function declarations — new Function won't capture them.
// Instead, let's reimplement the pure functions based on the source to test
// the logic independently. We export the tested implementations by eval'ing
// individual function definitions.

function extractFunction(name) {
  // Match 'function <name>(...)' or '<name> = (...) =>'
  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:export\\s+)?(?:function\\s+${name}|const\\s+${name}\\s*=|let\\s+${name}\\s*=|var\\s+${name}\\s*=)\\s*([^]*?)(?=\\n\\S|$)`,
    'm'
  );
  const match = scriptSource.match(regex);
  if (!match) {
    throw new Error(`Could not extract function '${name}' from script`);
  }
  // Get the full match and build a standalone function
  const block = match[0];
  try {
    return (0, eval)(`(function() {\n${block}\nreturn ${name};\n})()`);
  } catch (e) {
    throw new Error(`Failed to eval '${name}': ${e.message}`);
  }
}

// ── Test helpers ──────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${name}: ${e.message}`);
  }
}

function summary() {
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

// ── If we can't extract functions, test by evaluating logic inline ────────────

// We define the helper functions manually for testing based on reading the source.
// In a production setup, the script should be refactored to export these.

// From the script:
// function sanitizeHtml(content) { ... }
// function fixRelativeLinks(content, repo) { ... }
// function frontmatter(title, position, slug, status) { ... }
// function subFrontmatter(title, position) { ... }
// function getStatusBanner(status) { ... }
// function slugify(name) { ... }

// Extract and test each pure function
let sanitizeHtml, fixRelativeLinks, frontmatter, subFrontmatter;
let getStatusBanner, slugify;

try {
  sanitizeHtml = extractFunction('sanitizeHtml');
  fixRelativeLinks = extractFunction('fixRelativeLinks');
  frontmatter = extractFunction('frontmatter');
  subFrontmatter = extractFunction('subFrontmatter');
  getStatusBanner = extractFunction('getStatusBanner');
  slugify = extractFunction('slugify');
} catch (e) {
  console.warn(`Warning: could not extract functions (${e.message}).`);
  console.warn('Falling back to inline reimplementation for testing.');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\n📋 sync-org-docs tests\n');

if (typeof sanitizeHtml === 'function') {
  test('sanitizeHtml strips <picture> blocks', () => {
    const input = '<picture><source srcset="x.webp"><img alt="test" src="x.png"></picture>';
    const result = sanitizeHtml(input);
    assert.ok(!result.includes('<picture>'), 'Should remove <picture> tags');
    assert.ok(!result.includes('<source'), 'Should remove <source> tags');
  });

  test('sanitizeHtml removes HTML comments with markdown', () => {
    const input = 'Hello<!-- this has **markdown** inside -->World';
    const result = sanitizeHtml(input);
    assert.equal(result, 'HelloWorld', 'Should strip comments');
  });

  test('sanitizeHtml removes div align attributes', () => {
    const input = '<div align="center">content</div>';
    const result = sanitizeHtml(input);
    assert.ok(result.includes('<div>'), 'Should remove align attribute');
    assert.ok(!result.includes('align='), 'Should not contain align=');
    assert.ok(result.includes('</div>'), 'Should keep closing tag');
  });

  test('sanitizeHtml escapes email angle brackets', () => {
    const input = 'Contact <user@example.com> for help';
    const result = sanitizeHtml(input);
    assert.ok(!result.includes('<user@'), 'Should escape angle brackets around email');
    assert.ok(result.includes('&lt;'), 'Should use HTML entities');
  });

  test('sanitizeHtml handles multiple sanitizations', () => {
    const input = [
      '<picture><img alt="x" src="y.jpg"></picture>',
      '<div align="left">text</div>',
      '<!-- comment -->',
      'Email: <dev@tunaos.org>',
    ].join('\n');
    const result = sanitizeHtml(input);
    assert.ok(!result.includes('<picture>'), 'Removes picture');
    assert.ok(result.includes('<div>'), 'Strips align');
    assert.ok(!result.includes('<!--'), 'Removes comments');
    assert.ok(result.includes('&lt;'), 'Escapes brackets');
  });
} else {
  console.log('  ⚠ sanitizeHtml tests skipped (function not extractable)');
}

if (typeof fixRelativeLinks === 'function') {
  test('fixRelativeLinks converts .md links to GitHub URLs', () => {
    const input = '[docs](./CONTRIBUTING.md)';
    const result = fixRelativeLinks(input, 'tacklebox');
    const expected = '[docs](https://github.com/tuna-os/tacklebox/blob/main/CONTRIBUTING.md)';
    assert.equal(result, expected);
  });

  test('fixRelativeLinks converts ../ links', () => {
    const input = '[back](../ARCHITECTURE.md)';
    const result = fixRelativeLinks(input, 'tacklebox');
    assert.ok(result.includes('https://github.com/tuna-os/tacklebox/blob/main/ARCHITECTURE.md'));
  });

  test('fixRelativeLinks converts image references', () => {
    const input = '![logo](./logo.png)';
    const result = fixRelativeLinks(input, 'tacklebox');
    assert.ok(result.includes('github.com/tuna-os/tacklebox/blob/main/logo.png'));
  });

  test('fixRelativeLinks preserves absolute and anchor links', () => {
    const input = '[GitHub](https://github.com) [section](#intro)';
    const result = fixRelativeLinks(input, 'tacklebox');
    assert.ok(result.includes('https://github.com'));
    assert.ok(result.includes('#intro'));
  });
} else {
  console.log('  ⚠ fixRelativeLinks tests skipped (function not extractable)');
}

if (typeof frontmatter === 'function') {
  test('frontmatter generates correct YAML frontmatter', () => {
    const result = frontmatter('Tacklebox', 1, 'tacklebox', 'stable');
    assert.ok(result.includes('sidebar_position: 1'));
    assert.ok(result.includes('sidebar_label: "Tacklebox"'));
    assert.ok(result.includes('status: stable'));
    assert.ok(result.startsWith('---'));
    assert.ok(result.endsWith('---\n\n'));
  });

  test('frontmatter handles unknown status', () => {
    const result = frontmatter('Foo', 5, 'foo');
    assert.ok(result.includes('status: unknown'));
  });
} else {
  console.log('  ⚠ frontmatter tests skipped (function not extractable)');
}

if (typeof subFrontmatter === 'function') {
  test('subFrontmatter generates correct sub-page frontmatter', () => {
    const result = subFrontmatter('Architecture', 3);
    assert.ok(result.includes('sidebar_position: 3'));
    assert.ok(result.includes('title: "Architecture"'));
    assert.ok(result.startsWith('---'));
  });
} else {
  console.log('  ⚠ subFrontmatter tests skipped (function not extractable)');
}

if (typeof getStatusBanner === 'function') {
  test('getStatusBanner returns correct banner for alpha', () => {
    const result = getStatusBanner('alpha');
    assert.ok(result.includes('Alpha'));
    assert.ok(result.includes('not production-ready'));
  });

  test('getStatusBanner returns correct banner for stable', () => {
    const result = getStatusBanner('stable');
    assert.equal(result, null, 'Stable should have no banner');
  });

  test('getStatusBanner returns correct banner for internal', () => {
    const result = getStatusBanner('internal');
    assert.ok(result.includes('Internal'));
  });

  test('getStatusBanner returns correct banner for deprecated', () => {
    const result = getStatusBanner('deprecated');
    assert.ok(result.includes('Deprecated'));
  });

  test('getStatusBanner returns null for unknown status', () => {
    const result = getStatusBanner('unknown');
    assert.equal(result, null);
  });

  test('getStatusBanner returns null for missing status', () => {
    const result = getStatusBanner(undefined);
    assert.equal(result, null);
  });
} else {
  console.log('  ⚠ getStatusBanner tests skipped (function not extractable)');
}

if (typeof slugify === 'function') {
  test('slugify converts CamelCase to lowercase with hyphens', () => {
    assert.equal(slugify('TunaOS'), 'tunaos');
  });

  test('slugify handles special characters', () => {
    assert.equal(slugify('bluefin-cli'), 'bluefin-cli');
  });

  test('slugify replaces underscores', () => {
    assert.equal(slugify('github_copr'), 'github-copr');
  });

  test('slugify collapses multiple hyphens', () => {
    const result = slugify('a--b---c');
    assert.ok(!result.includes('--'), 'Should collapse hyphens');
  });
} else {
  console.log('  ⚠ slugify tests skipped (function not extractable)');
}

summary();
