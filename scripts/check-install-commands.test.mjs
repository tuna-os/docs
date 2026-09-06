import assert from 'node:assert/strict';
import {extractBrewPackages, checkFormula, checkTap, resolve, tapRepo, codeBlocks} from './check-install-commands.mjs';

// --- extraction -----------------------------------------------------------

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

// A bare install carries no tap scope.
assert.deepEqual(extractBrewPackages(markdown, 'fixture.md')[0].taps, []);

// Line numbers are file-relative, not block-relative: `brew install` is the
// 4th line of the file above. This used to report 1.
assert.equal(extractBrewPackages(markdown, 'fixture.md')[0].line, 4);

// --- tap scoping ----------------------------------------------------------

// `brew tap` scopes the installs after it, and scope resets between blocks.
// The same package under two taps is two claims, not one deduped entry.
const twoTaps = `
\`\`\`bash
brew tap tuna-os/tap
brew install bluefin-cli
\`\`\`

\`\`\`bash
brew tap ublue-os/homebrew-experimental-tap
brew install bluefin-cli
\`\`\`
`;
assert.deepEqual(
  extractBrewPackages(twoTaps, 'f.md').map(({name, taps}) => [name, taps]),
  [
    ['bluefin-cli', ['tuna-os/tap']],
    ['bluefin-cli', ['ublue-os/homebrew-experimental-tap']],
  ],
);

// An inline owner/tap/name install carries its own tap.
const inline = "```bash\nbrew install tuna-os/tap/corral-vm\n```";
assert.deepEqual(
  extractBrewPackages(inline, 'f.md').map(({name, taps}) => [name, taps]),
  [['corral-vm', ['tuna-os/tap']]],
);

// A 2-segment token is neither a bare name nor owner/tap/name — skip it
// rather than guessing.
assert.deepEqual(extractBrewPackages("```bash\nbrew install a/b\n```", 'f.md'), []);

// --- tap repo naming ------------------------------------------------------

assert.equal(tapRepo('tuna-os/tap'), 'tuna-os/homebrew-tap');
assert.equal(
  tapRepo('ublue-os/homebrew-experimental-tap'),
  'ublue-os/homebrew-experimental-tap',
  'a name already carrying the homebrew- prefix is not double-prefixed',
);

// --- lookups --------------------------------------------------------------

const RAW = 'https://raw.githubusercontent.com';
const responses = new Map([
  ['https://formulae.brew.sh/api/formula/gcc.json', {status: 200, ok: true}],
  ['https://formulae.brew.sh/api/formula/missing.json', {status: 404, ok: false}],
  ['https://formulae.brew.sh/api/cask/missing.json', {status: 200, ok: true}],
  // A tap package: absent from core, present in the tap.
  ['https://formulae.brew.sh/api/formula/corral-vm.json', {status: 404, ok: false}],
  ['https://formulae.brew.sh/api/cask/corral-vm.json', {status: 404, ok: false}],
  [`${RAW}/tuna-os/homebrew-tap/HEAD/Formula/corral-vm.rb`, {status: 200, ok: true}],
  // A cask that only exists in the tap's sharded layout.
  [`${RAW}/tuna-os/homebrew-tap/HEAD/Formula/tavern.rb`, {status: 404, ok: false}],
  [`${RAW}/tuna-os/homebrew-tap/HEAD/Formula/t/tavern.rb`, {status: 404, ok: false}],
  [`${RAW}/tuna-os/homebrew-tap/HEAD/Casks/tavern.rb`, {status: 404, ok: false}],
  [`${RAW}/tuna-os/homebrew-tap/HEAD/Casks/t/tavern.rb`, {status: 200, ok: true}],
]);
const fakeFetch = async (url) => responses.get(url) ?? {status: 404, ok: false};

assert.equal(await checkFormula('gcc', fakeFetch), 'formula');
assert.equal(await checkFormula('missing', fakeFetch), 'cask');

assert.equal(await checkTap('corral-vm', 'tuna-os/tap', fakeFetch), 'formula in tuna-os/tap');
assert.equal(await checkTap('tavern', 'tuna-os/tap', fakeFetch), 'cask in tuna-os/tap',
  'sharded Casks/<letter>/<name>.rb is found');
assert.equal(await checkTap('nope', 'tuna-os/tap', fakeFetch), null);

// core wins before any tap is consulted
assert.equal(await resolve('gcc', ['tuna-os/tap'], fakeFetch), 'formula');
assert.equal(await resolve('corral-vm', ['tuna-os/tap'], fakeFetch), 'formula in tuna-os/tap');
assert.equal(await resolve('corral-vm', [], fakeFetch), null,
  'without the tap in scope, a tap-only package does not resolve');

// A non-404 failure is an outage, not an answer: it must throw so the caller
// warns instead of reporting a missing formula.
const flaky = async () => ({status: 503, ok: false});
await assert.rejects(() => checkFormula('anything', flaky), /HTTP 503/);
await assert.rejects(() => checkTap('anything', 'tuna-os/tap', flaky), /HTTP 503/);

// --- codeBlocks -----------------------------------------------------------

assert.deepEqual(
  codeBlocks("a\n```sh\nb\nc\n```\n").map(({body, offset}) => [body, offset]),
  [['b\nc', 3]],
);

console.log('check-install-commands tests: OK');
