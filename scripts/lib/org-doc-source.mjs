// Source adapter for the organization-doc sync.
//
// Encapsulates GitHub API repository discovery, count validation,
// pagination truncation retry, and temporary git cloning/branch discovery.

import {execSync} from 'node:child_process';

const ORG = 'tuna-os';
const PER_PAGE = 100;
const DEFAULT_PAGE_SIZE = 30;
const RETRY_DELAY_MS = 5000;

// cloneRepo clones a repository into a temporary directory using depth 1,
// then reads back the actual default branch from the clone HEAD.
// Returns {dir, branch}.
function cloneRepo(repo, org = ORG, exec = execSync) {
  const tmp = exec('mktemp -d', {encoding: 'utf8'}).trim();
  exec(`git clone --depth=1 https://github.com/${org}/${repo}.git ${tmp}`, {
    stdio: 'pipe',
    timeout: 60_000,
  });
  const branch = exec('git rev-parse --abbrev-ref HEAD', {
    cwd: tmp,
    encoding: 'utf8',
  }).trim();
  return {dir: tmp, branch};
}

// listOrgRepos returns every repo name in the org, across every page.
// Returns {names, archived}: `names` is the de-duplicated list of active
// (non-archived) repos, and `archived` is the count of archived repos.
function listOrgRepos(exec = execSync, org = ORG, perPage = PER_PAGE) {
  const out = exec(
    `gh api "orgs/${org}/repos?per_page=${perPage}" --paginate --jq ` +
      `'.[] | "\\(.name)\\t\\(.archived)"'`,
    {encoding: 'utf8'},
  );
  const names = new Set();
  let archived = 0;
  for (const line of String(out).split('\n')) {
    const [name, flag] = line.split('\t');
    if (!name || !name.trim()) continue;
    if (flag === 'true') {
      archived += 1;
      continue;
    }
    names.add(name.trim());
  }
  return {names: [...names], archived};
}

// orgPublicRepoCount reads how many public repos the org says it has.
// Returns null when the count cannot be read or is invalid.
function orgPublicRepoCount(exec = execSync, org = ORG) {
  try {
    const n = Number(
      String(exec(`gh api orgs/${org} --jq '.public_repos'`, {encoding: 'utf8'})).trim(),
    );
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// checkListing looks for the fingerprints of a truncated repo listing.
function checkListing(count, publicRepos = null, perPage = PER_PAGE, archived = 0, org = ORG) {
  const fatal = [];
  const warnings = [];

  if (count === 0) {
    fatal.push(
      `the ${org} repo listing came back empty. An empty org is not a real ` +
      'answer here, so treat this as a failed listing rather than as nothing to do.',
    );
  }
  if (publicRepos !== null && count < publicRepos) {
    fatal.push(
      `the listing holds ${count} repos (${archived} archived, so ${count - archived} active) ` +
      `but ${org} reports ${publicRepos} public ` +
      'repos, and every token can see every public repo of a public org. The ' +
      'listing is truncated — check that --paginate survived on the gh api call.',
    );
  }
  if (archived > 0 && publicRepos !== null && count >= publicRepos) {
    warnings.push(
      `${archived} repos are archived and excluded from the sync; the listing is ` +
      `complete (${count} repos total, org reports ${publicRepos} public).`,
    );
  }
  if (count > 0 && count === DEFAULT_PAGE_SIZE) {
    warnings.push(
      `exactly ${DEFAULT_PAGE_SIZE} repos — GitHub's default page size, and the ` +
      'exact signature of the bug in #103. Verify this is a coincidence.',
    );
  } else if (count > 0 && count % perPage === 0) {
    warnings.push(
      `exactly ${count} repos, a whole multiple of the ${perPage}-per-page size. ` +
      'That is what a listing that stopped at a page boundary looks like.',
    );
  }
  return {fatal, warnings};
}

// Synchronous sleep so discoverRepos can back off between attempts.
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// discoverRepos lists org repos and cross-checks the count, retrying once
// before treating a fatal truncation as real.
function discoverRepos(exec = execSync, sleep = sleepSync, org = ORG, perPage = PER_PAGE) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const {names, archived} = listOrgRepos(exec, org, perPage);
    const publicRepos = orgPublicRepoCount(exec, org);
    const {fatal, warnings} = checkListing(
      names.length + archived,
      publicRepos,
      perPage,
      archived,
      org,
    );
    if (!fatal.length || attempt === 2) {
      return {listed: names, archived, publicRepos, fatal, warnings, attempts: attempt};
    }
    console.warn(
      `⚠️  repo listing looked truncated on attempt ${attempt} ` +
      `(${names.length + archived} repos) — retrying once in case this is transient ` +
      '(e.g. secondary rate limiting mid-pagination) rather than a real ' +
      '--paginate regression.',
    );
    sleep(RETRY_DELAY_MS);
  }
  /* istanbul ignore next -- loop above always returns by attempt 2 */
  return undefined;
}

export {
  ORG,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
  RETRY_DELAY_MS,
  cloneRepo,
  listOrgRepos,
  orgPublicRepoCount,
  checkListing,
  sleepSync,
  discoverRepos,
};
