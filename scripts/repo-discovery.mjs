// Repository discovery module: fetch and validate the org's repository list.
//
// Extracted from sync-org-docs.mjs to isolate discovery concerns (API calls,
// pagination, result validation) from sync orchestration.

import {execSync} from 'node:child_process';

const PER_PAGE = 100;
const DEFAULT_PAGE_SIZE = 30;
const RETRY_DELAY_MS = 5000;

/**
 * List all non-archived repos in the organization.
 *
 * Returns {names, archived}: `names` is the de-duplicated list of active
 * repos; `archived` is the count of archived repos in the same listing.
 * GitHub's archived flag is included per line (name\tarchived) so the
 * listing needs only one gh call.
 */
export function listOrgRepos(org, exec = execSync) {
  const out = exec(
    `gh api "orgs/${org}/repos?per_page=${PER_PAGE}" --paginate --jq ` +
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

/**
 * Read how many public repos the org reports.
 *
 * This is an independent source of truth for "how long should the listing be".
 * Any token can see every public repo of a public org, so a listing shorter
 * than this number was cut short — that is a fact about the listing, not a
 * heuristic. Returns null when the count cannot be read.
 */
export function orgPublicRepoCount(org, exec = execSync) {
  try {
    const n = Number(
      String(exec(`gh api orgs/${org} --jq '.public_repos'`, {encoding: 'utf8'})).trim(),
    );
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Validate that the repo listing is complete, not truncated mid-page.
 *
 * Returns {fatal, warnings}: `fatal` lists blocking errors; `warnings` lists
 * signs of incompleteness that should be reviewed manually.
 *
 * count = active + archived repos before any SKIP filtering is applied.
 * publicRepos = what the org says it has (may be null if API call failed).
 */
export function checkListing(count, publicRepos = null, perPage = PER_PAGE, archived = 0) {
  const fatal = [];
  const warnings = [];

  if (count === 0) {
    fatal.push(
      `the org listing came back empty. An empty org is not a real ` +
      'answer here, so treat this as a failed listing rather than as nothing to do.',
    );
  }
  if (publicRepos !== null && count < publicRepos) {
    fatal.push(
      `the listing holds ${count} repos (${archived} archived, so ${count - archived} active) ` +
      `but org reports ${publicRepos} public ` +
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

/**
 * Synchronous sleep. Used to back off between discovery attempts without
 * rewriting to async/await. Atomics.wait blocks the event loop on purpose.
 */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Discover repos from the org, with retry logic for transient failures.
 *
 * Returns {listed, publicRepos, archived, fatal, warnings, attempts}.
 * `fatal` is non-empty only if the listing appears truncated; fatal errors
 * should cause the sync to exit rather than proceed with incomplete data.
 *
 * A structural bug produces the same short listing on both attempts and still
 * fails after the retry. A transient failure (secondary rate limiting) is
 * absorbed by a single retry without masking a real regression.
 */
export function discoverRepos(org, exec = execSync, sleep = sleepSync) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const {names, archived} = listOrgRepos(org, exec);
    const publicRepos = orgPublicRepoCount(org, exec);
    const {fatal, warnings} = checkListing(
      names.length + archived,
      publicRepos,
      PER_PAGE,
      archived,
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

export {PER_PAGE, DEFAULT_PAGE_SIZE, RETRY_DELAY_MS};
