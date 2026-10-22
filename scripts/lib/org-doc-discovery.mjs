// Repository listing, completeness checks, and retry policy. No docs-tree writes.
import {execSync} from 'node:child_process';

// GitHub's REST list endpoints page. 100 is the maximum per_page; 30 is the
// default, and therefore the number this script used to stop at.
const PER_PAGE = 100;
const DEFAULT_PAGE_SIZE = 30;
const RETRY_DELAY_MS = 5000;

// listOrgRepos returns every repo name in the org, across every page.
//
// The call this replaced was `gh api orgs/<org>/repos --jq '.[].name'` with no
// --paginate, so GitHub answered with the default first page — 30 names — and
// the loop below simply never reached the rest (#103). Nothing failed and
// nothing was logged: a short list is indistinguishable from a small org,
// which is the whole reason it went unnoticed.
//
// Two properties of `gh --paginate --jq` decide how this is written:
//
//   * gh applies the jq filter to each page separately and concatenates the
//     results — it does not build one document out of the pages. So the filter
//     has to be a per-page filter. `.[].name` is one, and yields one name per
//     line across every page. A whole-document filter (`length`, `map(...)`,
//     `.[0]`) would answer once per page and look like it had worked.
//   * a repo can appear twice if the org list shifts between page requests, so
//     the names are de-duplicated rather than trusted to be unique.
//
// Returns {names, archived}: `names` is the de-duplicated list of active
// (non-archived) repos — what downstream actually syncs — and `archived` is
// the count of archived repos in the same listing, kept so the truncation
// cross-check can compare the *full* listing (active + archived) against
// org.public_repos, which includes archived public repos. Counting only the
// active names made a completed listing look truncated the first time twenty
// repos were archived at once: 57 public repos became 37 active + 20 archived
// and the guard read 37 < 57 as a --paginate regression (#278).
function listOrgRepos(exec = execSync, org = 'tuna-os') {
  // The archived flag rides along on each line (name<TAB>archived) so the
  // listing needs only one gh call; archived/read-only repos are still
  // dropped from `names` before anything downstream sees them. Without that
  // an archived repo's stale README/docs keep re-landing on the live site on
  // every sync run — SKIP only removes repos by name, so an archive after the
  // fact (rather than a rename or a move) was invisible here (#154).
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
      continue; // archived repos are counted but never synced (#154)
    }
    names.add(name.trim());
  }
  return {names: [...names], archived};
}

// orgPublicRepoCount reads how many public repos the org says it has.
//
// This is a second, independent source of truth for "how long should the
// listing be". Any token can see every public repo of a public org, so a
// listing shorter than this number was cut short — that is a fact about the
// listing, not a heuristic. Returns null when the count cannot be read, so a
// missing cross-check degrades to the weaker signals below instead of failing
// the sync.
function orgPublicRepoCount(exec = execSync, org = 'tuna-os') {
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
//
// Paginating the call fixes today's truncation. It does not make tomorrow's
// visible: the failure mode of #103 is that the wrong answer is a well-formed
// shorter list, so the only defence is to state out loud what a plausible
// answer looks like and complain when the listing is not one.
//
// `count` is the raw listing length (active + archived), before SKIP is
// applied — SKIP removes repos that do exist, so filtering first would mask
// a real shortfall. `archived` is how many of those repos are archived:
// org.public_repos counts archived public repos too, so an active-only count
// under-reports a complete listing (#278).
function checkListing(count, publicRepos = null, perPage = PER_PAGE, archived = 0, org = 'tuna-os') {
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

// discoverRepos lists org repos and cross-checks the count, retrying once
// before treating a fatal truncation as real. checkListing's job is to catch
// a permanent regression (#103: --paginate silently dropped from the gh api
// call) but a short listing can also come from something that clears itself
// on the next call — GitHub secondary-rate-limiting the account mid-
// pagination is the one that actually hit this script (#242: 37/57 repos,
// no --paginate regression in sight). A single retry absorbs that without
// masking a real regression: a structural bug produces the same short
// listing on both attempts and still fails after the retry.
function discoverRepos(exec = execSync, sleep = sleepSync, org = 'tuna-os', logger = console) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const {names, archived} = listOrgRepos(exec, org);
    const publicRepos = orgPublicRepoCount(exec, org);
    const {fatal, warnings} = checkListing(
      names.length + archived,
      publicRepos,
      PER_PAGE,
      archived,
      org,
    );
    if (!fatal.length || attempt === 2) {
      return {listed: names, archived, publicRepos, fatal, warnings, attempts: attempt};
    }
    logger.warn(
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

// Discovery uses synchronous gh calls and waits only between listing attempts.
// The injected sleep lets callers exercise retry handling without a real delay.
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
export {listOrgRepos, orgPublicRepoCount, checkListing, discoverRepos, PER_PAGE, DEFAULT_PAGE_SIZE, RETRY_DELAY_MS};
