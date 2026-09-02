import assert from 'node:assert/strict';
import {extractBrewPackages, checkFormula} from './check-install-commands.mjs';

const markdown = `
text
\`\`\`bash
brew install gcc ccache \\
  sparse
\`\`\`
\`brew install not-a-command\`
`;

assert.deepEqual(
  extractBrewPackages(markdown, 'fixture.md').map(({name}) => name),
  ['gcc', 'ccache', 'sparse'],
);

const responses = new Map([
  ['https://formulae.brew.sh/api/formula/gcc.json', {status: 200, ok: true}],
  ['https://formulae.brew.sh/api/formula/missing.json', {status: 404, ok: false}],
  ['https://formulae.brew.sh/api/cask/missing.json', {status: 200, ok: true}],
]);
const fakeFetch = async (url) => responses.get(url) ?? {status: 503, ok: false};

assert.equal(await checkFormula('gcc', fakeFetch), 'formula');
assert.equal(await checkFormula('missing', fakeFetch), 'cask');
console.log('check-install-commands tests: OK');
