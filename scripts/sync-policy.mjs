// Sync policy module: encapsulate filtering rules for repo sync.
//
// Extracted from sync-org-docs.mjs to isolate policy (what can be skipped,
// what is hand-authored, what docs to filter) from orchestration.

/**
 * Repos to skip (moved, dead, or internal-only).
 * This is the single source of truth for what never gets synced.
 */
const SKIP_REPOS = new Set([
  'fisherman', 'tuna-installer',  // moved to projectbluefin
  'bootc-builder', 'bootc-isos',  // legacy
  'images', 'packages', 'egg', 'dakota',  // buildstream infra
  'demo-repository', '.github', 'docs',  // boilerplate / this repo
  'first-setup', 'thinkpad-x13s-gnome-build-meta',  // internal
  'tables', 'letters', 'decks',  // archived Python apps, superseded by gtk-office-suite
]);

/**
 * docs/<slug>/ trees that are hand-authored and must never be overwritten
 * by upstream README or docs/ folder syncs, even if a repo exists.
 */
const HAND_AUTHORED_DOCS = new Set([
  'mariner',
  'gtk-office-suite',
  'mandelbrot',
  'remora',
  'dakota',
  'blueshell',
  'ghostty',
]);

/**
 * Repos whose docs/ folder should NOT be synced (too noisy / internal).
 * For these repos, only root .md files are synced into the target slug,
 * and the docs/ folder contents are left alone.
 */
const SKIP_DOCS_DIR = new Set([
  'tunaOS',
]);

/**
 * Per-repo root doc file filters. Maps repo name → array of filenames.
 * Empty array or missing key means "sync all root .md files".
 */
const ROOT_DOC_FILTER = {
  tunaOS: ['README.md', 'ROADMAP.md', 'SECURITY.md', 'CONTRIBUTING.md'],
};

/**
 * SyncPolicy encapsulates all filtering rules in one place.
 * Methods return true/false for filtering decisions.
 */
export class SyncPolicy {
  /**
   * Should this repo be synced at all?
   */
  shouldSync(repoName) {
    return !SKIP_REPOS.has(repoName);
  }

  /**
   * Is the docs/<slug>/ tree hand-authored and protected from overwrites?
   */
  isHandAuthored(slug) {
    return HAND_AUTHORED_DOCS.has(slug);
  }

  /**
   * Should the docs/ folder be skipped for this repo?
   * If true, only root .md files are synced.
   */
  shouldSkipDocsDir(repoName) {
    return SKIP_DOCS_DIR.has(repoName);
  }

  /**
   * Get the root doc file filter for this repo.
   * Returns null for "sync all root .md files", or an array of allowed filenames.
   */
  getRootDocFilter(repoName) {
    return ROOT_DOC_FILTER[repoName] ?? null;
  }

  /**
   * Names of repos to skip (for logging/reporting).
   */
  get skippedRepos() {
    return [...SKIP_REPOS];
  }

  /**
   * Names of hand-authored doc slugs (for validation).
   */
  get handAuthoredSlugs() {
    return [...HAND_AUTHORED_DOCS];
  }
}

export const DEFAULT_POLICY = new SyncPolicy();
