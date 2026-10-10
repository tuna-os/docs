import schema from './build-health.schema.json' with {type: 'json'};
import identity from './build-health-identity.schema.json' with {type: 'json'};
import coverage from './build-health-required.json' with {type: 'json'};

// Schema and required coverage are copied from the reviewed upstream producer.
// A coverage change requires an explicit refresh; omitted rows cannot look green.
export const requiredBuildTargets = coverage.targets.map(row => row.target);
const key = target => [target.variant, target.flavor, target.platform, target.cpuBaseline, target.hardwareScope].join('|');
const requiredKeys = new Set(requiredBuildTargets.map(key));
const evidenceRepositories = new Set(['tuna-os/tunaOS', 'tuna-os/tunaos-packages']);
const fail = () => {throw Error('Invalid build health feed');};
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) fail();
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 19) !== value.slice(0, 19)) fail();
  return parsed;
}
function evidenceUrl(value) {
  let url;
  try {url = new URL(value);} catch {fail();}
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) fail();
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'github.com' && evidenceRepositories.has(parts.slice(0, 2).join('/')) &&
      (/^\/tuna-os\/(?:tunaOS|tunaos-packages)\/actions\/runs\/[1-9]\d*(?:\/attempts\/[1-9]\d*|\/job\/[1-9]\d*)?$/.test(url.pathname) ||
       /^\/tuna-os\/(?:tunaOS|tunaos-packages)\/commit\/[0-9a-f]{40}$/.test(url.pathname))) return;
  // Served proof files and digest-bound registry references are public evidence.
  if (url.hostname === 'repo.tunaos.org' && /^\/(?:alma10|alma10-kitten|rpm|repo|gnome49|gnome50|xfce)\/[A-Za-z0-9._/-]+$/.test(url.pathname) && !parts.some(part => part === '.' || part === '..')) return;
  if (url.hostname === 'ghcr.io' && /^\/tuna-os\/[a-z0-9._-]+(?:@sha256:[0-9a-f]{64})$/.test(url.pathname)) return;
  fail();
}
function validate(value, rule, depth = 0) {
  if (depth > 20) fail();
  if (rule.$ref) {
    const prefix = 'identity.schema.json#/$defs/';
    if (!rule.$ref.startsWith(prefix)) fail();
    const referred = identity.$defs[rule.$ref.slice(prefix.length)];
    if (!referred) fail();
    return validate(value, referred, depth + 1);
  }
  if (rule.anyOf) {
    for (const alternative of rule.anyOf) {
      try {validate(value, alternative, depth + 1); return;} catch { /* try exact alternatives */ }
    }
    fail();
  }
  if ('const' in rule && value !== rule.const) fail();
  if (rule.enum && !rule.enum.includes(value)) fail();
  if (!rule.type && rule.enum) return;
  switch (rule.type) {
    case 'null': if (value !== null) fail(); break;
    case 'boolean': if (typeof value !== 'boolean') fail(); break;
    case 'integer': if (!Number.isSafeInteger(value) || (rule.minimum !== undefined && value < rule.minimum)) fail(); break;
    case 'string':
      if (typeof value !== 'string' || value.length > 2048 || (rule.minLength && value.length < rule.minLength) || (rule.pattern && !(new RegExp(rule.pattern)).test(value))) fail();
      if (rule.format === 'date-time') timestamp(value);
      if (rule.format === 'uri') evidenceUrl(value);
      break;
    case 'array':
      if (!Array.isArray(value) || value.length > 1000 || value.length < (rule.minItems || 0)) fail();
      for (const item of value) validate(item, rule.items, depth + 1);
      break;
    case 'object':
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
      if ((rule.required || []).some(field => !Object.hasOwn(value, field))) fail();
      for (const [field, item] of Object.entries(value)) {
        if (!Object.hasOwn(rule.properties || {}, field)) {if (rule.additionalProperties === false) fail();}
        else validate(item, rule.properties[field], depth + 1);
      }
      break;
    default: fail();
  }
}
export function validateBuildHealth(feed, now = Date.now()) {
  validate(feed, schema);
  if (!Number.isFinite(now) || timestamp(feed.generatedAt) > now || feed.coverageDigest !== coverage.coverageDigest) fail();
  if (feed.freshnessPolicy.buildSeconds !== 172800 || feed.freshnessPolicy.feedSeconds > 86400) fail();
  const sourceIds = new Set();
  for (const source of feed.collection.sources) {
    if (!evidenceRepositories.has(source.repository) || sourceIds.has(source.id)) fail();
    sourceIds.add(source.id);
  }
  const seen = new Set();
  for (const row of feed.targets) {
    const targetKey = key(row.target);
    if (!row.required || !requiredKeys.has(targetKey) || seen.has(targetKey)) fail();
    seen.add(targetKey);
    const attempt = row.latestAttempt;
    if (attempt && (!evidenceRepositories.has(attempt.identity.repository) || !/^\.github\/workflows\/[^/\\\s?#]+\.ya?ml$/.test(attempt.identity.workflow))) fail();
    for (const value of [row.measuredAt, attempt?.measuredAt, attempt?.identity.startedAt, row.packageReadiness.measuredAt]) {
      if (value != null && timestamp(value) > now) fail();
    }
    if (row.lastVerifiedPublication && !/^ghcr\.io\/tuna-os\/[a-z0-9._-]+$/.test(row.lastVerifiedPublication.repository)) fail();
    if (row.status === 'healthy' && (!row.scheduled || feed.collection.status !== 'available' || row.contractStatus !== 'pass' || row.packageReadiness.status !== 'healthy' ||
        feed.collection.sources.some(source => source.status !== 'available') ||
        !row.measuredAt || !row.packageReadiness.measuredAt || !row.packageReadiness.factoryDigest || !row.packageReadiness.contractDigest || !row.packageReadiness.evidence.length ||
        !attempt || !attempt.measuredAt || attempt.status !== 'success' || !attempt.evidence.length || !attempt.imageDigest || attempt.imageDigest !== row.lastVerifiedPublication?.digest)) fail();
  }
  if (seen.size !== requiredKeys.size) fail();
  return feed;
}
export function displayStatus(row, feed, now = Date.now()) {
  if (now - timestamp(feed.generatedAt) > feed.freshnessPolicy.feedSeconds * 1000) return 'stale';
  if (feed.collection.status !== 'available' && row.status === 'healthy') return 'unknown';
  if (row.status === 'healthy' && [row.measuredAt, row.latestAttempt?.measuredAt, row.packageReadiness.measuredAt].some(time => !time || now - timestamp(time) > feed.freshnessPolicy.buildSeconds * 1000)) return 'stale';
  return row.status;
}


// Scan the raw document before parsing so duplicate fields cannot hide evidence.
export function parseBuildHealth(text, now = Date.now()) {
  const limit = 2 * 1024 * 1024;
  if (typeof text !== 'string' || text.length > limit || new TextEncoder().encode(text).byteLength > limit) fail();
  let position = 0;
  const whitespace = () => {while (position < text.length && /[ \t\r\n]/.test(text[position])) position++;};
  function string() {
    const start = position;
    if (text[position++] !== '"') fail();
    while (position < text.length) {
      const character = text[position++];
      if (character === '"') {
        try {return JSON.parse(text.slice(start, position));} catch {fail();}
      }
      if (character === '\\') {
        if (position >= text.length) fail();
        position++;
      }
    }
    fail();
  }
  function value(depth) {
    if (depth > 20) fail();
    whitespace();
    const character = text[position];
    if (character === '"') {string(); return;}
    if (character === '{') {
      position++; whitespace();
      const keys = new Set();
      if (text[position] === '}') {position++; return;}
      while (true) {
        whitespace();
        const field = string();
        if (keys.has(field)) fail();
        keys.add(field); whitespace();
        if (text[position++] !== ':') fail();
        value(depth + 1); whitespace();
        const next = text[position++];
        if (next === '}') return;
        if (next !== ',') fail();
      }
    }
    if (character === '[') {
      position++; whitespace();
      if (text[position] === ']') {position++; return;}
      while (true) {
        value(depth + 1); whitespace();
        const next = text[position++];
        if (next === ']') return;
        if (next !== ',') fail();
      }
    }
    const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(position));
    if (!match) fail();
    position += match[0].length;
    const scalar = JSON.parse(match[0]);
    if (typeof scalar === 'number' && !Number.isFinite(scalar)) fail();
  }
  value(0); whitespace();
  if (position !== text.length) fail();
  return validateBuildHealth(JSON.parse(text), now);
}
