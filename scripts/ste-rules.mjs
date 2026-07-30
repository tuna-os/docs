#!/usr/bin/env node

// ASD-STE100 Simplified Technical English — the rule engine.
//
// STE is a controlled language: a set of writing rules plus a dictionary of
// approved words, each with one approved meaning and one approved part of
// speech. It exists so that technical documentation reads the same way to
// every reader, including readers whose first language is not English.
//
// # What this file is, and is not
//
// The rules below implement ASD-STE100's Part 1 Writing Rules, which are
// published and describable. The Part 2 Dictionary is a controlled document
// owned by ASD (asd-ste100.org) and is not reproduced here — shipping a copy
// would be a licensing problem, and an out-of-date copy would be worse than
// none.
//
// What `unapprovedWords` holds instead is a working subset: the non-approved
// words that occur most in this repository, each mapped to the approved word
// STE gives for that meaning. It is a lint aid, not the normative dictionary.
// A clean run here means "no known violation", not "certified conformant".
//
// Every rule carries the STE rule number it implements, so a reader can look
// up the actual text rather than take this file's word for it.

// ── Rule 1.5 / 2.2 — approved words ───────────────────────────────────────────

// Non-approved words mapped to their approved replacement. Lower case; the
// checker matches whole words case-insensitively and preserves the writer's
// capitalisation in the suggestion.
export const unapprovedWords = new Map([
  // Verbs with an approved synonym
  ['utilize', 'use'], ['utilise', 'use'], ['utilizing', 'use'],
  ['employ', 'use'], ['employs', 'uses'],
  ['leverage', 'use'], ['leverages', 'uses'],
  ['commence', 'start'], ['commences', 'starts'],
  ['terminate', 'stop'], ['terminates', 'stops'],
  ['obtain', 'get'], ['obtains', 'gets'],
  ['require', 'need'], ['requires', 'needs'],
  ['attempt', 'try'], ['attempts', 'tries'],
  ['assist', 'help'], ['assists', 'helps'],
  ['permit', 'let'], ['permits', 'lets'],
  ['perform', 'do'], ['performs', 'does'],
  ['facilitate', 'help'], ['facilitates', 'helps'],
  ['ascertain', 'find out'],
  ['comprise', 'have'], ['comprises', 'has'],
  ['possess', 'have'], ['possesses', 'has'],
  ['indicate', 'show'], ['indicates', 'shows'],
  ['modify', 'change'], ['modifies', 'changes'],
  ['initiate', 'start'], ['initiates', 'starts'],
  ['implement', 'make'], ['implements', 'makes'],
  ['additionally', 'also'],
  ['approximately', 'about'],
  ['subsequently', 'then'],
  ['previously', 'before'],
  ['currently', 'now'],
  ['presently', 'now'],
  ['prior to', 'before'],
  ['in order to', 'to'],
  ['due to the fact that', 'because'],
  ['in the event that', 'if'],
  ['a number of', 'some'],
  ['the majority of', 'most'],
  ['at this point in time', 'now'],
  ['it should be noted that', ''],
  ['please note that', ''],
  // Adjectives and adverbs with no approved sense
  ['numerous', 'many'],
  ['sufficient', 'enough'],
  ['adequate', 'enough'],
  ['optimal', 'best'],
  ['robust', 'strong'],
  ['seamless', 'simple'],
  ['seamlessly', 'without problems'],
  ['effortless', 'simple'],
  ['effortlessly', 'easily'],
  ['powerful', 'strong'],
  ['elegant', 'simple'],
  ['blazing', 'fast'],
  ['blazingly', 'very'],
  ['painless', 'simple'],
  ['trivial', 'simple'],
  ['myriad', 'many'],
  ['plethora', 'many'],
  ['vast', 'large'],
  ['crucial', 'important'],
  ['critical', 'important'],
  ['essentially', ''],
  ['basically', ''],
  ['simply', ''],
  ['just', ''],
  ['actually', ''],
  ['really', ''],
  ['very', ''],
  ['quite', ''],
  ['fairly', ''],
  ['rather', ''],
]);

// Multi-word phrases have to be matched before single words, longest first,
// or "in order to" gets reported three times as three separate problems.
export const unapprovedPhrases = [...unapprovedWords.keys()]
  .filter((w) => w.includes(' '))
  .sort((a, b) => b.length - a.length);

// ── Rule 3.1 / 3.2 — sentence length ──────────────────────────────────────────

// STE sets different limits by text type: an instruction must be short enough
// to follow under load, a description may carry a little more.
export const MAX_WORDS_PROCEDURAL = 20;
export const MAX_WORDS_DESCRIPTIVE = 25;

// Rule 3.6 — a descriptive paragraph holds at most six sentences.
export const MAX_SENTENCES_PER_PARAGRAPH = 6;

// Rule 1.4 — a noun cluster of more than three words is ambiguous, because
// the reader cannot tell which noun modifies which.
export const MAX_NOUN_CLUSTER = 3;

// ── Rule 2.x — verb forms ─────────────────────────────────────────────────────

// Rule 3.4: use the active voice. Passive constructions hide who acts, which
// matters most in an instruction.
const passivePattern =
  /\b(?:is|are|was|were|be|been|being|gets?|got)\s+(?:not\s+)?(?:[a-z]+ly\s+)?([a-z]+(?:ed|en))\b/gi;

// Some -ed/-en words after "is/are" are adjectives, not passives. STE allows
// them, and flagging them would drown the real findings.
const adjectivalParticiples = new Set([
  'based', 'related', 'located', 'named', 'called', 'known', 'limited',
  'required', 'supported', 'expected', 'advanced', 'detailed', 'dedicated',
  'automated', 'unattended', 'installed', 'enabled', 'disabled', 'used',
  'interested', 'experienced', 'complicated', 'connected', 'distributed',
]);

// Rule 4.1 — do not use the -ing form as a noun (a gerund) or in a complex
// verb form. Present participles inside an approved technical name are fine,
// so a short allow-list keeps the noise down.
const allowedIngWords = new Set([
  // Not verbs at all — nouns that happen to end in -ing.
  'during', 'string', 'thing', 'anything', 'something', 'nothing', 'everything',
  'bring', 'ring', 'king', 'wing', 'spring', 'setting', 'settings',
  'engineering', 'networking', 'computing', 'operating', 'programming',
  // "building" is deliberately absent: in this repository it is almost always
  // the gerund ("building the image"), not the noun ("a building").
  'debugging', 'logging', 'training', 'meaning', 'warning', 'heading',
  'listing', 'mapping', 'padding', 'binding', 'bindings', 'tooling',
  // Established adjectives and one preposition. STE's objection is to the -ing
  // form used as a noun or inside a complex verb tense; "an existing file" and
  // "the following steps" are neither, and flagging them buries the findings
  // that are real.
  'existing', 'missing', 'including', 'excluding', 'following', 'remaining',
  'corresponding', 'outstanding', 'ongoing', 'upcoming', 'leading', 'trailing',
  'matching', 'interesting', 'willing', 'sibling', 'ceiling',
]);

// ── the checks ────────────────────────────────────────────────────────────────

// splitSentences breaks text into sentences without tripping over the
// abbreviations and version numbers technical prose is full of.
export function splitSentences(text) {
  const protectedText = text
    .replace(/\b(e\.g|i\.e|etc|vs|Dr|Mr|Ms|Inc|Ltd|Fig|No|approx)\./gi, // Every dot in the abbreviation, not just the first: String.replace
      // with a string argument swaps a single occurrence, which left
      // "e.g." ending a sentence and splitting it in two.
      (m) => m.split('.').join(''))
    .replace(/(\d)\.(\d)/g, '$1$2');
  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(//g, '.').trim())
    .filter(Boolean);
}

// countWords counts words as STE does: a hyphenated compound is one word, and
// numbers count.
export function countWords(sentence) {
  return sentence
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /\w/.test(w)).length;
}

// checkSentenceLength implements rules 3.1 and 3.2.
export function checkSentenceLength(sentence, {procedural = false} = {}) {
  const limit = procedural ? MAX_WORDS_PROCEDURAL : MAX_WORDS_DESCRIPTIVE;
  const words = countWords(sentence);
  if (words <= limit) return null;
  return {
    rule: procedural ? 'STE 3.1' : 'STE 3.2',
    message: `sentence is ${words} words; the limit is ${limit} for ${procedural ? 'instructions' : 'descriptive text'}`,
  };
}

// checkPassiveVoice implements rule 3.4.
export function checkPassiveVoice(sentence) {
  const findings = [];
  for (const match of sentence.matchAll(passivePattern)) {
    const participle = match[1].toLowerCase();
    if (adjectivalParticiples.has(participle)) continue;
    findings.push({
      rule: 'STE 3.4',
      message: `passive voice ("${match[0].trim()}"); say who or what does the action`,
    });
  }
  return findings;
}

// checkGerunds implements rule 4.1.
export function checkGerunds(sentence) {
  const findings = [];
  // Only words the writer chose, not ones inside code spans or links.
  const stripped = sentence.replace(/`[^`]*`/g, ' ').replace(/\[[^\]]*\]\([^)]*\)/g, ' ');
  for (const match of stripped.matchAll(/\b([a-z]{4,}ing)\b/gi)) {
    const word = match[1].toLowerCase();
    if (allowedIngWords.has(word)) continue;
    findings.push({
      rule: 'STE 4.1',
      message: `"-ing" form ("${match[1]}"); use a simple verb or a noun`,
    });
  }
  return findings;
}

// checkUnapprovedWords implements rules 1.5 and 2.2.
export function checkUnapprovedWords(sentence) {
  const findings = [];
  const stripped = sentence.replace(/`[^`]*`/g, ' ');
  const seen = new Set();

  for (const phrase of unapprovedPhrases) {
    const re = new RegExp(`\\b${phrase.replace(/ /g, '\\s+')}\\b`, 'gi');
    if (re.test(stripped)) {
      const approved = unapprovedWords.get(phrase);
      findings.push({
        rule: 'STE 1.5',
        message: approved
          ? `"${phrase}" is not approved; use "${approved}"`
          : `"${phrase}" is not approved; delete it`,
      });
      seen.add(phrase);
    }
  }

  for (const match of stripped.matchAll(/\b[a-z]+\b/gi)) {
    const word = match[0].toLowerCase();
    if (!unapprovedWords.has(word) || word.includes(' ') || seen.has(word)) continue;
    seen.add(word);
    const approved = unapprovedWords.get(word);
    findings.push({
      rule: 'STE 1.5',
      message: approved
        ? `"${match[0]}" is not approved; use "${approved}"`
        : `"${match[0]}" adds nothing; delete it`,
    });
  }
  return findings;
}

// Words that cannot be part of a noun cluster: if one appears, the run ends.
// Without a part-of-speech tagger this list is what keeps rule 1.4 honest —
// "without sacrificing system stability" is a preposition, a participle and
// two nouns, not a four-noun cluster, and reporting it would train the reader
// to ignore the rule.
const clusterBreakers = new Set([
  // determiners and pronouns
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'its', 'their', 'our',
  'your', 'my', 'his', 'her', 'it', 'we', 'you', 'they', 'he', 'she', 'i',
  'each', 'every', 'any', 'some', 'all', 'both', 'no', 'other', 'another',
  // prepositions and conjunctions
  'of', 'in', 'on', 'to', 'for', 'and', 'or', 'with', 'from', 'by', 'at',
  'as', 'if', 'when', 'while', 'after', 'before', 'during', 'without',
  'within', 'across', 'between', 'through', 'into', 'onto', 'over', 'under',
  'alongside', 'about', 'above', 'below', 'against', 'per', 'via', 'than',
  'but', 'so', 'because', 'since', 'until', 'unless', 'though', 'although',
  'where', 'which', 'who', 'whom', 'whose', 'what', 'how', 'why', 'then',
  // common verbs and auxiliaries
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would',
  'shall', 'should', 'may', 'might', 'must', 'need', 'needs', 'let', 'lets',
  'use', 'uses', 'used', 'make', 'makes', 'made', 'get', 'gets', 'got',
  'run', 'runs', 'set', 'sets', 'add', 'adds', 'give', 'gives', 'take',
  'takes', 'see', 'sees', 'show', 'shows', 'offer', 'offers', 'built',
  'build', 'builds', 'work', 'works', 'keep', 'keeps', 'come', 'comes',
  'go', 'goes', 'want', 'wants', 'know', 'knows', 'find', 'finds', 'put',
  'read', 'reads', 'write', 'writes', 'start', 'starts', 'stop', 'stops',
  'install', 'installs', 'boot', 'boots', 'open', 'opens', 'close', 'closes',
  'select', 'selects', 'click', 'press', 'enter', 'type', 'choose', 'chooses',
  // adverbs and qualifiers
  'not', 'also', 'only', 'now', 'here', 'there', 'more', 'most', 'less',
  'least', 'very', 'too', 'well', 'still', 'yet', 'again', 'once', 'always',
  'never', 'often', 'usually', 'first', 'next', 'last', 'new', 'newer',
  'latest', 'same', 'own', 'such', 'many', 'much', 'few', 'several',
]);

// checkNounCluster implements rule 1.4.
//
// Deliberately conservative. A real noun cluster is a run of nouns with
// nothing between them, and telling a noun from a verb needs a part-of-speech
// tagger this repository has no business carrying. So a run ends at any
// punctuation, any markup boundary, and any word on clusterBreakers — and an
// -ing word ends it too, since a participle is not a noun in a cluster.
//
// The result under-reports rather than over-reports. That is the right way
// round: a rule that cries wolf gets switched off.
export function checkNounCluster(sentence) {
  const stripped = sentence.replace(/`[^`]*`/g, ' ');
  const findings = [];
  // Only whitespace continues a run. Any punctuation — comma, colon, bracket,
  // dash, markup emphasis — ends it, because a cluster is words sitting
  // directly against each other. Splitting on punctuation and then ignoring
  // that it was there is what turns "**DX (Developer Experience)**:
  // Pre-configured" into a false four-noun cluster.
  const tokens = stripped.split(/\s+/);
  let run = [];

  const flush = () => {
    if (run.length > MAX_NOUN_CLUSTER) {
      findings.push({
        rule: 'STE 1.4',
        message: `noun cluster of ${run.length} words ("${run.join(' ')}"); use at most ${MAX_NOUN_CLUSTER}, and add prepositions`,
      });
    }
    run = [];
  };

  for (const token of tokens) {
    // A token carrying punctuation ends the run after itself: "images," is
    // still a noun, but nothing after the comma is part of the same cluster.
    const trailingBreak = /[^\w-]$/.test(token);
    const leadingBreak = /^[^\w-]/.test(token);
    const word = token.replace(/^[^\w-]+|[^\w-]+$/g, '').toLowerCase();

    if (leadingBreak) flush();
    if (!word || clusterBreakers.has(word) || /ing$/.test(word) || /^\d+$/.test(word) ||
        /[^\w-]/.test(word)) {
      flush();
      continue;
    }
    run.push(token.replace(/^[^\w-]+|[^\w-]+$/g, ''));
    if (trailingBreak) flush();
  }
  flush();
  return findings;
}

// checkParagraphLength implements rule 3.6.
export function checkParagraphLength(sentences) {
  if (sentences.length <= MAX_SENTENCES_PER_PARAGRAPH) return null;
  return {
    rule: 'STE 3.6',
    message: `paragraph has ${sentences.length} sentences; the limit is ${MAX_SENTENCES_PER_PARAGRAPH}`,
  };
}

// checkSentence runs every sentence-level rule.
export function checkSentence(sentence, opts = {}) {
  const findings = [];
  const long = checkSentenceLength(sentence, opts);
  if (long) findings.push(long);
  findings.push(...checkPassiveVoice(sentence));
  findings.push(...checkGerunds(sentence));
  findings.push(...checkUnapprovedWords(sentence));
  findings.push(...checkNounCluster(sentence));
  return findings;
}
