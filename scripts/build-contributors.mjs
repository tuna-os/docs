// build-contributors.mjs — credit authors of merged PRs to tuna-os projects
// in src/data/contributors.json for the homepage wall of fame.
//
// Usage: GH_TOKEN=... node scripts/build-contributors.mjs [--org tuna-os]
//
// Network: lists public org repos, including forks and archived projects,
// then their closed PRs. Only merged PR authors receive credit; inherited
// commit history is not a contribution to this org. Writes committed JSON;
// the site loads avatars from avatars.githubusercontent.com.
//
// Human-only rule (exported for tests): exclude API type Bot, [bot] suffix,
// and a curated blocklist of automation + AI-agent accounts. Extend
// EXTRA_BOT_LOGINS below when a new bot shows up on the wall.
import {writeFileSync} from 'node:fs';

const BLOCKED_EXACT = new Set(
  [
    // dependency / CI automation
    'renovate',
    'renovate-bot',
    'dependabot',
    'github-actions',
    'codecov',
    'codecov-io',
    'mergify',
    'mergify-bot',
    'bors',
    'bors-bot',
    'greenkeeper',
    'greenkeeper-bot',
    'allcontributors',
    'all-contributors',
    'pre-commit-ci',
    'semantic-release-bot',
    // AI coding agents that open PRs under their own login
    'claude',
    'claude-bot',
    'claude-code-bot',
    'copilot',
    'copilot-sweeper',
    'sweep',
    'sweep-bot',
    'devin',
    'devin-ai',
    'cursor',
    'cursor-bot',
    'codex',
    'gemini-cli',
    'goose',
    'aider',
    'opencode',
    'kilocode',
    'antigravity',
    ...(process.env.EXTRA_BOT_LOGINS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  ].map((s) => s.toLowerCase()),
);

export function isHumanContributor(login, type) {
  if (!login || typeof login !== 'string') return false;
  const lower = login.toLowerCase();
  if (type === 'Bot') return false;
  if (lower.endsWith('[bot]')) return false;
  if (BLOCKED_EXACT.has(lower)) return false;
  // Defensive: <name>-bot / <name>[bot] variants not in the list above.
  if (/-bot$/.test(lower)) return false;
  return true;
}

export function mergeContributors(perRepo) {
  // perRepo: [{repo, pulls: [{id, merged_at, user: {login, id, type}}]}]
  const byLogin = new Map();
  const seenPulls = new Set();
  for (const {repo, pulls} of perRepo) {
    for (const pull of pulls ?? []) {
      const c = pull.user;
      if (!pull.merged_at || !Number.isSafeInteger(pull.id) || seenPulls.has(pull.id)) continue;
      if (!isHumanContributor(c?.login, c?.type) || !Number.isSafeInteger(c.id)) continue;
      seenPulls.add(pull.id);
      const key = c.login.toLowerCase();
      const existing = byLogin.get(key);
      if (existing) {
        existing.merged_prs += 1;
        if (!existing.repos.includes(repo)) existing.repos.push(repo);
      } else {
        byLogin.set(key, {login: c.login, id: c.id, merged_prs: 1, repos: [repo]});
      }
    }
  }
  return [...byLogin.values()].sort(
    (a, b) => b.merged_prs - a.merged_prs || a.login.localeCompare(b.login),
  );
}

export function validateFeed(feed) {
  if (!feed || typeof feed !== 'object' || Array.isArray(feed)) throw Error('Invalid feed');
  const keys = Object.keys(feed).sort().join();
  if (keys !== 'contributors,generated_at,org') throw Error('Invalid fields');
  if (typeof feed.org !== 'string' || !feed.org) throw Error('Invalid org');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(feed.generated_at))
    throw Error('Invalid generated_at');
  if (!Array.isArray(feed.contributors)) throw Error('Invalid contributors');
  for (const c of feed.contributors) {
    if (Object.keys(c).sort().join() !== 'id,login,merged_prs,repos')
      throw Error('Invalid contributor fields');
    if (
      typeof c.login !== 'string' ||
      !c.login ||
      !Number.isSafeInteger(c.id) ||
      !Number.isSafeInteger(c.merged_prs) ||
      c.merged_prs <= 0
    )
      throw Error('Invalid contributor');
    if (
      !Array.isArray(c.repos) ||
      c.repos.length === 0 ||
      !c.repos.every((r) => typeof r === 'string' && r)
    )
      throw Error('Invalid repos');
  }
  return feed;
}

async function api(path, token) {
  const headers = {Accept: 'application/vnd.github+json', 'User-Agent': 'tunaos-docs-contributors'};
  if (token) headers.Authorization = `Bearer ${token}`;
  const out = [];
  let url = `https://api.github.com${path}`;
  while (url) {
    const res = await fetch(url, {headers});
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      const wait = Math.max(
        0,
        Number(res.headers.get('x-ratelimit-reset')) * 1000 - Date.now() + 5000,
      );
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw Error(`GitHub API ${res.status} for ${url}`);
    out.push(...(await res.json()));
    const link = res.headers.get('link') ?? '';
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
  }
  return out;
}

async function main() {
  const org = process.argv.includes('--org')
    ? process.argv[process.argv.indexOf('--org') + 1]
    : 'tuna-os';
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
  const repos = await api(`/orgs/${org}/repos?per_page=100&type=public`, token);
  console.error(`repos: ${repos.length}`);
  const perRepo = [];
  for (const repo of repos) {
    const pulls = await api(
      `/repos/${org}/${repo.name}/pulls?state=closed&sort=created&direction=asc&per_page=100`,
      token,
    );
    perRepo.push({repo: repo.name, pulls});
    console.error(`  ${repo.name}: ${pulls.length} closed PRs`);
  }
  const feed = {
    org,
    generated_at: new Date().toISOString(),
    contributors: mergeContributors(perRepo),
  };
  validateFeed(feed);
  const outPath = new URL('../src/data/contributors.json', import.meta.url);
  writeFileSync(outPath, JSON.stringify(feed, null, 2) + '\n');
  console.error(`wrote ${feed.contributors.length} contributors -> ${outPath.pathname}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();
