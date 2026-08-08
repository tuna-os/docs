#!/usr/bin/env node

// Unit tests for the ASD-STE100 linter.
//
// The rules are only worth having if they are accurate. A checker that reports
// correct prose as a violation gets switched off, and then nothing is checked
// at all — so about half of these tests are for what must NOT be reported.
//
// Usage:
//   node scripts/__tests__/ste-lint.test.mjs

import {strict as assert} from 'node:assert';
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  splitSentences, countWords,
  checkSentenceLength, checkPassiveVoice, checkGerunds,
  checkUnapprovedWords, checkNounCluster, checkParagraphLength,
} from '../ste-rules.mjs';
import {stripNonProse, blocks, lintText, isGenerated, generatedDirs} from '../ste-lint.mjs';
import {frontmatter, subFrontmatter, HAND_AUTHORED} from '../sync-org-docs.mjs';

// generatedDirs takes a root, so the tests can build trees instead of asserting
// against whatever the last sync happened to leave on disk.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`  FAIL: ${name}\n    ${e.message}`);
  }
}

const has = (findings, fragment) =>
  findings.some((f) => f.message.includes(fragment));

// ── sentence splitting ────────────────────────────────────────────────────────

test('splits on sentence ends', () => {
  assert.equal(splitSentences('Install it. Then start it.').length, 2);
});

test('a version number does not end a sentence', () => {
  const s = splitSentences('Use version 2.4 of the tool.');
  assert.equal(s.length, 1, `got ${JSON.stringify(s)}`);
  assert.ok(s[0].includes('2.4'), 'the version number survives the split');
});

test('an abbreviation does not end a sentence', () => {
  const s = splitSentences('Use a container, e.g. podman, to build it.');
  assert.equal(s.length, 1, `got ${JSON.stringify(s)}`);
});

test('counts hyphenated compounds as one word', () => {
  assert.equal(countWords('a bootc-based system'), 3);
});

// ── rule 3.1 / 3.2, sentence length ───────────────────────────────────────────

test('an instruction over 20 words is reported', () => {
  const long = Array.from({length: 22}, (_, i) => `word${i}`).join(' ');
  assert.ok(checkSentenceLength(long, {procedural: true}));
});

test('an instruction of 20 words is not reported', () => {
  const ok = Array.from({length: 20}, (_, i) => `word${i}`).join(' ');
  assert.equal(checkSentenceLength(ok, {procedural: true}), null);
});

test('descriptive text gets the longer limit', () => {
  const s = Array.from({length: 22}, (_, i) => `word${i}`).join(' ');
  assert.equal(checkSentenceLength(s, {procedural: false}), null);
  assert.ok(checkSentenceLength(s, {procedural: true}));
});

// ── rule 3.4, active voice ────────────────────────────────────────────────────

test('passive voice is reported', () => {
  assert.ok(has(checkPassiveVoice('The image is published to the registry.'), 'passive voice'));
});

test('an adjectival participle is not passive', () => {
  assert.equal(checkPassiveVoice('The tool is based on podman.').length, 0);
  assert.equal(checkPassiveVoice('The feature is supported.').length, 0);
});

test('active voice is not reported', () => {
  assert.equal(checkPassiveVoice('The workflow publishes the image.').length, 0);
});

// ── rule 4.1, -ing forms ──────────────────────────────────────────────────────

test('a gerund is reported', () => {
  assert.ok(has(checkGerunds('Building the image takes ten minutes.'), '-ing'));
});

test('an established adjective is not a gerund', () => {
  // These would otherwise dominate the report and teach the reader to ignore it.
  for (const s of [
    'Use an existing installation.',
    'The following steps apply.',
    'Report a missing dependency.',
    'Install the tools, including podman.',
  ]) {
    assert.equal(checkGerunds(s).length, 0, `reported on: ${s}`);
  }
});

test('a noun that ends in -ing is not a gerund', () => {
  assert.equal(checkGerunds('Change the setting in the file.').length, 0);
});

test('code spans are not checked for gerunds', () => {
  assert.equal(checkGerunds('Run `docker build --pulling` now.').length, 0);
});

// ── rule 1.5, approved words ──────────────────────────────────────────────────

test('a non-approved word is reported with its replacement', () => {
  assert.ok(has(checkUnapprovedWords('Utilize the tool.'), 'use "use"'));
});

test('a phrase is reported once, not as its parts', () => {
  const findings = checkUnapprovedWords('Run the check in order to see the result.');
  assert.equal(findings.length, 1, `got ${JSON.stringify(findings)}`);
  assert.ok(findings[0].message.includes('in order to'));
});

test('a filler word is reported as deletable', () => {
  assert.ok(has(checkUnapprovedWords('This is very simple.'), 'delete it'));
});

test('code spans are not checked for approved words', () => {
  assert.equal(checkUnapprovedWords('Run `utilize --very` now.').length, 0);
});

// ── rule 1.4, noun clusters ───────────────────────────────────────────────────

test('a four-noun cluster is reported', () => {
  assert.ok(has(checkNounCluster('The desktop environment flavor list is long.'), 'noun cluster'));
});

test('three nouns are allowed', () => {
  assert.equal(checkNounCluster('The desktop environment flavor is set.').length, 0);
});

// These are the false positives that made the first version of this rule
// useless: punctuation and markup have to end a run.
test('punctuation ends a noun cluster', () => {
  assert.equal(checkNounCluster('**DX (Developer Experience)**: Pre-configured for use.').length, 0);
  assert.equal(checkNounCluster('Tromso (KDE), XFCE Linux, and Dakota (GNOME) ship now.').length, 0);
  assert.equal(checkNounCluster('It orchestrates USBs, disk images, and ISOs.').length, 0);
});

test('a preposition or verb ends a noun cluster', () => {
  assert.equal(checkNounCluster('It works without sacrificing system stability.').length, 0);
  assert.equal(checkNounCluster('We now offer specialized desktop flavors.').length, 0);
});

// ── rule 3.6, paragraph length ────────────────────────────────────────────────

test('a paragraph over six sentences is reported', () => {
  assert.ok(checkParagraphLength(Array(7).fill('A sentence.')));
  assert.equal(checkParagraphLength(Array(6).fill('A sentence.')), null);
});

// ── extraction ────────────────────────────────────────────────────────────────

test('front matter is not prose', () => {
  const out = stripNonProse('---\ntitle: "Utilize"\n---\n\nThe text.\n');
  assert.ok(!out.includes('title'), out);
});

test('fenced code is not prose', () => {
  const out = stripNonProse('Text.\n\n```sh\nutilize --very\n```\n\nMore text.');
  assert.ok(!out.includes('utilize'), out);
});

test('tables and headings are not prose', () => {
  const out = stripNonProse('# Utilize\n\n| a | b |\n|---|---|\n| utilize | x |\n\nReal text.');
  assert.ok(!out.includes('Utilize'), out);
  assert.ok(out.includes('Real text'), out);
});

test('a link keeps its text and drops its target', () => {
  const out = stripNonProse('See [the guide](https://example.com/utilize).');
  assert.ok(out.includes('the guide'), out);
  assert.ok(!out.includes('utilize'), out);
});

test('list items are treated as instructions', () => {
  const found = blocks('- Do the thing\n- Do the other thing');
  assert.equal(found.length, 2);
  assert.ok(found.every((b) => b.procedural), JSON.stringify(found));
});

test('a paragraph is not an instruction', () => {
  const found = blocks('This is a description of the system.');
  assert.equal(found[0].procedural, false);
});

test('a list stuck to a paragraph is split from it', () => {
  // Markdown needs no blank line between them, and joining the two produced a
  // finding for a seven-word noun cluster that was really three bullets.
  const found = blocks('Give these three items:\n- Full name\n- Username\n- Password');
  assert.equal(found.length, 4, JSON.stringify(found));
  assert.equal(found[0].procedural, true, 'items come first, and are instructions');
  const lead = found.find((b) => !b.procedural);
  assert.ok(lead && lead.text.startsWith('Give these'), JSON.stringify(found));
  assert.ok(found.every((b) => !b.text.includes('Username Password')),
    'bullets must not be concatenated: ' + JSON.stringify(found));
});

// ── generated-tree detection ──────────────────────────────────────────────────
//
// Whether a tree is generated decides whether its findings are this repo's debt
// or another repo's, so the cases below cover both ways of getting it wrong.
// Under-detection puts prose nobody here may edit into the budget (#102);
// over-detection takes prose this repo does own out of the checker entirely,
// which is the quieter and worse failure.

test('the rewritten-link mark is recognised', () => {
  assert.ok(isGenerated('See [README](https://github.com/tuna-os/corral/blob/main/../README.md)'));
});

test('a plain relative link does not carry the mark', () => {
  assert.ok(!isGenerated('See [the guide](./guide.md) for more.'));
});

// A tree fixture: docs/<slug>/ holding the named files, under a temp root.
function fixture(trees) {
  const root = mkdtempSync(join(tmpdir(), 'ste-lint-'));
  for (const [slug, files] of Object.entries(trees)) {
    mkdirSync(join(root, 'docs', slug), {recursive: true});
    for (const [name, body] of Object.entries(files)) {
      writeFileSync(join(root, 'docs', slug, name), body);
    }
  }
  return root;
}

const slugsOf = (root) => [...generatedDirs(root)].map((d) => basename(d)).sort();

// What the sync writes into a tree it creates.
const syncedIndex = frontmatter('Widget', 1, 'widget', 'alpha') + 'The widget starts.\n';
const syncedPage = subFrontmatter('Contributing', 2) + 'Open a pull request.\n';

test('a tree is generated when its index page came from the sync', () => {
  const root = fixture({widget: {'index.md': syncedIndex}});
  assert.deepEqual(slugsOf(root), ['widget']);
});

test('a synced tree with no rewritten links at all is still found', () => {
  // The #102 regression. Seven synced files held no relative link, so the old
  // fingerprint never landed anywhere in their trees and 28 findings against
  // prose owned by another repo sat in this repo's budget.
  const root = fixture({
    'dakota-iso': {'index.md': syncedIndex, 'CONTRIBUTING.md': syncedPage},
  });
  assert.deepEqual(slugsOf(root), ['dakota-iso']);
});

test('the whole tree is claimed, not only the marked file', () => {
  const root = fixture({
    widget: {'index.md': syncedIndex, 'guide.md': 'Plain prose, no front matter.\n'},
  });
  const dirs = [...generatedDirs(root)];
  assert.equal(dirs.length, 1);
  assert.ok(existsSync(join(dirs[0], 'guide.md')));
});

test('a hand-written page that links to GitHub is not a generated tree', () => {
  // docs/faq.md and docs/community.md link to tunaOS/blob/main/CONTRIBUTING.md
  // by hand. Reading that as "the sync wrote this" is how prose this repo owns
  // stopped being checked.
  const root = fixture({
    guides: {'index.md': 'See [CONTRIBUTING](https://github.com/tuna-os/tunaOS/blob/main/CONTRIBUTING.md).\n'},
  });
  assert.deepEqual(slugsOf(root), []);
});

test('front matter a person typed is not the sync template', () => {
  // docs/mariner/index.md: the same three keys, no blank line before status.
  const handWritten = '---\nsidebar_position: 1\nsidebar_label: "Mariner"\nstatus: alpha\n---\n\nMariner is a file manager.\n';
  const root = fixture({mariner2: {'index.md': handWritten}});
  assert.deepEqual(slugsOf(root), []);
});

test('a HAND_AUTHORED tree is never generated', () => {
  // The sync refuses to overwrite these, so this repo is answerable for their
  // prose. Both lists come from sync-org-docs.mjs, so they cannot disagree.
  const slug = [...HAND_AUTHORED][0];
  const root = fixture({[slug]: {'index.md': syncedIndex}});
  assert.deepEqual(slugsOf(root), [], `${slug} is hand-authored and must be checked`);
});

test('this repo\'s own synced trees are found', () => {
  const found = new Set(slugsOf(ROOT));
  assert.ok(found.size > 0, 'no generated trees found in a repo that syncs org docs');
  // The seven files from #102, by tree.
  for (const slug of ['dakota-iso', 'dakota-x13s', 'xfce-linux-iso', 'bonito-x13s',
    'ubuntu-26-04-iso', 'tromso-iso']) {
    assert.ok(found.has(slug), `docs/${slug}/ is synced and must not be in the budget`);
  }
  for (const slug of HAND_AUTHORED) {
    assert.ok(!found.has(slug), `docs/${slug}/ is hand-authored and must be checked`);
  }
});

// ── end to end ────────────────────────────────────────────────────────────────

test('clean STE prose produces no findings', () => {
  const clean = [
    '---', 'title: "Test"', '---', '',
    'The system starts the container.', '',
    '1. Open the file.',
    '2. Change the value.',
    '',
  ].join('\n');
  const findings = lintText(clean);
  assert.equal(findings.length, 0, JSON.stringify(findings, null, 2));
});

test('non-conformant prose produces findings', () => {
  const findings = lintText('Building the image is performed in order to utilize the cache.');
  assert.ok(findings.length >= 2, JSON.stringify(findings));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
