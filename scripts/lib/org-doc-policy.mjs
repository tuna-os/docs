// Site-specific sync configuration and ownership rules.
// Projects that get their own doc section. Add a slug → label entry to
// give a repo a human-readable name; repos not listed here still get
// picked up but use their raw repo name as the label.
const PROJECTS = {
  tunaOS:      {label: 'TunaOS',           icon: '🐟', slug: 'tunaos',          status: 'stable'},
  tacklebox:   {label: 'Tacklebox',        icon: '🧰', slug: 'tacklebox',       status: 'stable'},
  tromso:      {label: 'Tromsø',           icon: '🏔️', slug: 'tromso',           status: 'alpha'},
  'xfce-linux': {label: 'XFCE Linux',      icon: '🖥️', slug: 'xfce-linux',      status: 'alpha'},
  // NOTE: 'github-copr' was renamed to 'tunaos-packages'; the listing picks
  // it up under its real name (default slug 'tunaos-packages'). The old
  // docs/copr/ tree was hand-maintained leftovers from before the rename
  // (stale GNOME version, orphaned since sync target moved to
  // docs/tunaos-packages/) and was removed rather than kept in sync.
  Tavern:      {label: 'Tavern',          icon: '🍺', slug: 'tavern',          status: 'stable'},
  'bluefin-cli': {label: 'bluefin-cli',   icon: '⌨️', slug: 'bluefin-cli',      status: 'stable'},
};

// Repos to skip (moved, dead, or internal-only).
const SKIP = new Set([
  'fisherman', 'tuna-installer',  // moved to projectbluefin
  'bootc-builder', 'bootc-isos',  // legacy
  'images', 'packages', 'egg', 'dakota',  // buildstream infra
  'demo-repository', '.github', 'docs',  // boilerplate / this repo
  'first-setup', 'thinkpad-x13s-gnome-build-meta',  // internal
  'tables', 'letters', 'decks',  // archived Python apps, superseded by gtk-office-suite
]);

// Per-repo filter: only sync these exact root filenames besides README.md.
// An empty array excludes all additional root docs; no entry uses the defaults.
const ROOT_DOC_FILTER = {
  tunaOS: ['README.md', 'ROADMAP.md', 'SECURITY.md', 'CONTRIBUTING.md'],
};

// docs/<slug>/ trees that are written by hand here and must never be
// overwritten from an upstream README, even though a repo of the same name
// exists in the org.
//
// These survived only by accident: each maps to a repo that fell past the
// first page of the unpaginated repo listing, so the sync never reached it
// (#103). Paginating the listing reaches them all, and the write path is
// unconditional — writeFileSync, no comparison, no prompt — so without this
// set the first paginated run would replace every page below with its
// upstream README and drop the site-specific content.
//
// What makes each one hand-authored, so a future reader can re-check rather
// than trust the list:
//   mariner          — :::tip pointing at the /mariner showcase page (#61)
//   gtk-office-suite — landing page for three apps, one repo
//   mandelbrot       — site-specific prose, no upstream equivalent
//   remora           — site-specific prose, no upstream equivalent
//   dakota           — :::tip plus an external-project banner (repo is also
//                      in SKIP; listed here so the protection does not rest
//                      on a SKIP entry that exists for a different reason)
//   blueshell        — :::tip pointing at the /blueshell showcase page, plus
//                      site-specific install and upstream-tracking prose; the
//                      upstream README is written for contributors, not for
//                      this site
//   ghostty          — not a tuna-os repo at all: the page documents what the
//                      TunaOS remote republishes. Listed so it stays safe if a
//                      repo of that name ever appears in the org
const HAND_AUTHORED = new Set([
  'mariner',
  'gtk-office-suite',
  'mandelbrot',
  'remora',
  'dakota',
  'blueshell',
  'ghostty',
]);

// Repos whose docs/ folder should NOT be synced (too noisy / internal).
const SKIP_DOCS_DIR = new Set([
  // tunaOS's docs/ holds developer/maintainer references (AGENT_GUIDE.md,
  // CI_SPEC.md, TESTING.md, …) that are deliberately NOT part of the
  // user-facing site (see tuna-os/tunaos docs/README.md). The old
  // DOCS_SUBDIR 'docs/book/src' value silently no-opped after the in-repo
  // mdBook was removed; this makes that intent explicit and protects the
  // hand-authored docs/tunaos/ pages (introduction.md, building.md, …) from
  // being bulk-synced over.
  'tunaOS',
]);

// Per-repo subdirectory to sync instead of docs/ (for repos with nested doc structure).
const DOCS_SUBDIR = {};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

// The root files the sync copies besides README.md, when a repo has no
// ROOT_DOC_FILTER entry.
const ROOT_DOC_NAMES = ['ARCHITECTURE', 'CONTRIBUTING', 'ROADMAP', 'TODO', 'SECURITY', 'SPEC'];

// isRootDoc reports whether `file` in a targetDir is one the README or
// root-docs stage writes: index.md, or a root doc the repo's filter allows.
function isRootDoc(file, rootFilter = null) {
  if (file === 'index.md') return true;
  if (rootFilter !== null) return rootFilter.includes(file);
  return /\.(md|rst)$/.test(file) && ROOT_DOC_NAMES.includes(file.replace(/\.(md|rst)$/, ''));
}
// A policy can be supplied independently of repository discovery and I/O.
function createSyncPolicy({
  projects = PROJECTS,
  skip = SKIP,
  handAuthored = HAND_AUTHORED,
  rootDocFilter = ROOT_DOC_FILTER,
  skipDocsDir = SKIP_DOCS_DIR,
  docsSubdir = DOCS_SUBDIR,
} = {}) {
  return {
    handAuthored,
    shouldSync: repo => !skip.has(repo),
    metadata: repo => projects[repo] || {label: repo, icon: '📄', slug: slugify(repo)},
    isHandAuthored: slug => handAuthored.has(slug),
    getRootDocFilter: repo => rootDocFilter[repo] || null,
    shouldSyncRootDoc(repo, file) {
      if (file === 'README.md') return false;
      const filter = this.getRootDocFilter(repo);
      return filter !== null ? filter.includes(file)
        : ROOT_DOC_NAMES.includes(file.replace(/\.(md|rst)$/, ''));
    },
    shouldSyncDocsDir: repo => !skipDocsDir.has(repo),
    getDocsSubdir: repo => docsSubdir[repo] || 'docs',
    couldWrite(repo, file) {
      return this.shouldSyncDocsDir(repo) || isRootDoc(file, this.getRootDocFilter(repo));
    },
  };
}

export {createSyncPolicy, HAND_AUTHORED, isRootDoc, slugify};
