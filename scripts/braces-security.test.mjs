import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const deepPattern = '{'.repeat(4000) + 'a,b' + '}'.repeat(4000);

// Exercise the actual transitive resolutions, including nested npm aliases.
for (const consumer of ['chokidar', 'micromatch']) {
  const consumerRequire = createRequire(require.resolve(consumer));
  const braces = consumerRequire('braces');
  assert.deepEqual(braces.expand('docs/{intro,guide}.{md,mdx}'), [
    'docs/intro.md', 'docs/intro.mdx', 'docs/guide.md', 'docs/guide.mdx',
  ]);
  assert.deepEqual(braces.expand('{01..03}'), ['01', '02', '03']);
  for (const expand of [false, true]) {
    assert.throws(() => braces(deepPattern, {expand}), SyntaxError,
      `${consumer} must reject excessive nesting before stack exhaustion`);
  }
}

const micromatch = require('micromatch');
assert.deepEqual(micromatch(['intro.md', 'guide.mdx', 'image.png'], '*.{md,mdx}'),
  ['intro.md', 'guide.mdx']);
assert.throws(() => micromatch.braces(deepPattern), SyntaxError);
console.log('braces-security.test.mjs: all assertions passed');
