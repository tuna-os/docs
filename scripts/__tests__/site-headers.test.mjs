#!/usr/bin/env node
// Contract test for the response-header baseline in static/_headers.
//
// Cloudflare serves the built site with the headers that file names. The
// block for `/*` is the only place a security header is set for a page, and
// nothing else fails when a line leaves it: the site builds and renders the
// same without it.

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const HEADERS = new URL('../../static/_headers', import.meta.url);

// rules returns {path: {header-name: value}} for a _headers file: a path line
// starts in column 0, and each header line under it is indented.
function rules(text) {
  const out = {};
  let current = null;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = out[line.trim()] ??= {};
      continue;
    }
    const colon = line.indexOf(':');
    assert.ok(current && colon !== -1, `header line outside a rule: ${line}`);
    current[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim();
  }
  return out;
}

const directives = (policy) =>
  Object.fromEntries(
    policy.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
      const [name, ...values] = d.split(/\s+/);
      return [name, values.join(' ')];
    }),
  );

test('rules reads paths, headers and comments', () => {
  assert.deepEqual(rules('# note\n/a\n  X-One: 1\n\n/b/*\n  X-Two: a: b\n'), {
    '/a': {'x-one': '1'},
    '/b/*': {'x-two': 'a: b'},
  });
});

test('every path gets the baseline headers', () => {
  const all = rules(readFileSync(HEADERS, 'utf8'))['/*'];
  assert.ok(all, 'static/_headers has no rule for /*');
  assert.equal(all['x-content-type-options'], 'nosniff');
  const policy = directives(all['content-security-policy'] ?? '');
  assert.equal(policy['base-uri'], "'self'");
  assert.equal(policy['object-src'], "'none'");
});
