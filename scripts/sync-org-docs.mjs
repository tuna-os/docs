#!/usr/bin/env node
// Aggregates READMEs and docs from every active project in the tuna-os
// GitHub org into the Docusaurus site. Reads no project-specific config
// here — new repos with a README are automatically picked up.
//
// Usage:
//   node scripts/sync-org-docs.mjs

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

// Projects that get their own doc section. Add a slug → label entry to
// give a repo a human-readable name; repos not listed here still get
// picked up but use their raw repo name as the label.
const PROJECTS = {
  tunaOS:      {label: 'TunaOS',           icon: '🐟', slug: 'tunaos',          status: 'stable'},
  tacklebox:   {label: 'Tacklebox',        icon: '🧰', slug: 'tacklebox',       status: 'stable'},
  tromso:      {label: 'Tromsø',           icon: '🏔️', slug: 'tromso',           status: 'alpha'},
  'xfce-linux': {label: 'XFCE Linux',      icon: '🖥️', slug: 'xfce-linux',      status: 'alpha'},
  'github-copr': {label: 'COPR Builds',    icon: '🔧', slug: 'copr',            status: 'internal'},
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

// Per-repo filter: only sync these root doc files (case-insensitive match).
// Empty array = sync all root .md files.
const ROOT_DOC_FILTER = {
  tunaOS: ['README.md', 'ROADMAP.md', 'SECURITY.md', 'CONTRIBUTING.md'],
  'github-copr': ['README.md', 'ARCHITECTURE.md'],
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
const HAND_AUTHORED = new Set([
  'mariner',
  'gtk-office-suite',
  'mandelbrot',
  'remora',
  'dakota',
]);

// Repos whose docs/ folder should NOT be synced (too noisy / internal).
const SKIP_DOCS_DIR = new Set();

// Per-repo subdirectory to sync instead of docs/ (for repos with nested doc structure).
const DOCS_SUBDIR = {
  tunaOS: 'docs/book/src',
};

const ORG = 'tuna-os';
const DOCS_DIR = 'docs';

// GitHub's REST list endpoints page. 100 is the maximum per_page; 30 is the
// default, and therefore the number this script used to stop at.
const PER_PAGE = 100;
const DEFAULT_PAGE_SIZE = 30;

function cloneRepo(repo) {
  const tmp = execSync('mktemp -d', {encoding: 'utf8'}).trim();
  execSync(`git clone --depth=1 https://github.com/${ORG}/${repo}.git ${tmp}`, {
    stdio: 'pipe',
    timeout: 60_000,
  });
  return tmp;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

// onProse applies fn to the prose of a markdown document, leaving fenced code
// blocks and inline-code spans exactly as they were.
//
// Every MDX-safety rewrite below is a regex over `<`, and README files are
// mostly shell. `--since=<30d>` in a bash sample and `<30s` in a prose table
// look identical to a regex; only one of them may be escaped. Rewriting inside
// a fence produces a site that builds and documents commands that do not run,
// which is worse than the build failure it replaces.
function onProse(content, fn) {
  // Split on fenced blocks, keeping the fences as separator captures so the
  // odd-indexed parts are code and pass through untouched.
  const parts = content.split(/(^```[\s\S]*?^```$|^~~~[\s\S]*?^~~~$)/gm);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // a fenced block
      // Same again for inline `code` spans within the prose.
      return part
        .split(/(`[^`\n]*`)/g)
        .map((span, j) => (j % 2 === 1 ? span : fn(span)))
        .join('');
    })
    .join('');
}

function sanitizeHtml(content) {
  // Make GitHub-flavoured markdown parse as MDX.
  //
  // The source repos are not wrong: `<details><summary>x</summary>`, autolinks
  // and `<30s` are all correct GFM and render properly on GitHub. MDX reads a
  // bare `<` as the start of a JSX tag, so the same text is a syntax error
  // here. That makes this the sync boundary's problem, not something to push
  // back onto ten upstream repos which would only regress the next time
  // somebody writes ordinary markdown.
  let c = content;
  // Replace <picture>...</picture> blocks with just the img tag
  c = c.replace(/<picture>[\s\S]*?<img\s[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/picture>/gi, '![]');
  // Remove align attributes on divs that confuse MDX
  c = c.replace(/<div\s+align="[^"]*">/gi, '<div>');
  // Remove HTML comments that contain markdown (breaks MDX)
  c = onProse(c, (s) => s.replace(/<!--[\s\S]*?-->/g, ''));

  c = onProse(c, (s) => {
    // <details><summary>x</summary> on one line: MDX parses the whole line as
    // a paragraph, so <details> is still open when the paragraph ends. The
    // same tags on separate lines parse as a block and accept markdown inside.
    s = s.replace(
      /^([ \t]*)<details>[ \t]*<summary>([\s\S]*?)<\/summary>[ \t]*$/gm,
      '$1<details>\n$1<summary>$2</summary>',
    );
    // Autolinks: <https://example.com> is CommonMark, but MDX sees a tag whose
    // name starts with `/`. The link text is the URL either way.
    s = s.replace(/<((?:https?|ftp):\/\/[^\s<>]+)>/g, '[$1]($1)');
    // <email@domain> or <number+name@domain>
    s = s.replace(/<(\d+[+]?[^>]*@[^>]+)>/g, '&lt;$1&gt;');
    // A `<` used as less-than: `<30s`, `<5%`. A JSX tag name cannot start with
    // a digit or whitespace, so anything that does is arithmetic, not markup.
    s = s.replace(/<(?=[\d\s=])/g, '&lt;');
    // Void elements. HTML lets <img src="…"> stand alone; JSX has no void
    // elements, so MDX keeps looking for </img> and reports the mismatch
    // against whatever closes next — the error names </details>, several
    // lines away from the actual cause.
    s = s.replace(
      /<(img|br|hr|input|meta|link|source|col|area|base|embed|track|wbr)\b([^>]*?)\s*\/?>/gi,
      (_, tag, attrs) => `<${tag}${attrs.trimEnd()} />`,
    );
    return s;
  });
  return c;
}

// fixRelativeLinks rewrites repo-relative links and images to absolute URLs.
//
// srcDir is the directory the file was read from, relative to the repo root —
// '' for a README, 'docs' for a file synced out of docs/. A relative path
// resolves against the file that contains it, not against the repo root, so
// docs/user-guide.md saying `screenshots/a.png` means docs/screenshots/a.png.
// Ignoring srcDir produced URLs that 404: the site still built, because
// Docusaurus only validates repo-local images, and shipped broken ones.
function fixRelativeLinks(content, repo, srcDir = '') {
  // Convert relative repo links to absolute GitHub links.
  // [something](./foo.md) → [something](https://github.com/tuna-os/<repo>/blob/main/foo.md)
  // But keep intra-doc links within the Docusaurus site as-is.
  // Strategy: links that start with ./  or ../ and end with .md or .rst
  // get the full GitHub URL.
  const prefix = srcDir ? `${srcDir.replace(/\/+$/, '')}/` : '';
  const base = `https://github.com/${ORG}/${repo}/blob/main`;
  // Images need bytes, not a page. github.com/…/blob/… answers text/html, so
  // an <img> pointed at it renders broken; raw.githubusercontent.com answers
  // image/png. Only the site's own assets can use a repo-relative path, and
  // the synced files' assets are not copied into this repo.
  const raw = `https://raw.githubusercontent.com/${ORG}/${repo}/main`;
  const IMAGE = /\.(?:png|svg|jpe?g|gif|webp)$/i;
  // Resolve a path written inside srcDir against the repo root, collapsing
  // the ./ and ../ segments the way the source repo's own renderer would.
  const clean = (p) => {
    const out = [];
    for (const seg of (prefix + p).split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') out.pop();
      else out.push(seg);
    }
    return out.join('/');
  };

  // Images first, so the link rules below cannot claim them.
  // Both ./-prefixed and bare relative paths; absolute URLs, anchors and
  // site-absolute paths are left alone.
  let c = content.replace(
    /!\[([^\]]*)\]\((?!https?:|#|\/|data:)([^)\s]+)([^)]*)\)/g,
    (m, alt, p, rest) => (IMAGE.test(p) ? `![${alt}](${raw}/${clean(p)}${rest})` : m),
  );
  // Raw HTML <img src="…">. Markdown image syntax is handled above, but
  // README files also use HTML tags for the width attribute, and a relative
  // src there is just as broken. Site-absolute /img/… paths belong to this
  // repo's static/ and are left alone.
  c = c.replace(
    /(<img\b[^>]*?\bsrc=")(?!https?:|\/|data:)([^"]+)(")/gi,
    (_, pre, p, post) => `${pre}${raw}/${clean(p)}${post}`,
  );
  // Links to files that live in the source repo.
  c = c.replace(
    /]\((\.[^)]*\.(?:md|rst))\)/gi,
    (_, p) => `](${base}/${clean(p)})`,
  );
  // Also fix bare relative paths without leading ./
  c = c.replace(
    /]\(((?!https?:|#|\/)[^)]*\.(?:md|rst))\)/gi,
    (_, p) => `](${base}/${clean(p)})`,
  );
  return c;
}

function frontmatter(title, position, slug, status) {
  return `---
sidebar_position: ${position}
sidebar_label: "${title}"

status: ${status || 'unknown'}
---

`;
}

function subFrontmatter(title, position) {
  return `---
sidebar_position: ${position}
title: "${title}"
---\n\n`;
}

function getStatusBanner(status) {
  const banners = {
    alpha:        '> ⚠️ **Alpha** — early development. Not production-ready. APIs and behaviour may change without notice.',
    experimental: '> ⚠️ **Experimental** — proof of concept. Not for production use. Expect breakage.',
    beta:         '> 🚧 **Beta** — feature-complete but still stabilizing. Feedback welcome.',
    internal:     '> 🔧 **Internal tooling** — used by the TunaOS build pipeline. Not user-facing.',
    deprecated:   '> ⚠️ **Deprecated** — no longer actively maintained.',
  };
  return banners[status] || null;
}

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
function listOrgRepos(exec = execSync) {
  const out = exec(
    `gh api "orgs/${ORG}/repos?per_page=${PER_PAGE}" --paginate --jq '.[].name'`,
    {encoding: 'utf8'},
  );
  return [...new Set(String(out).split('\n').map((n) => n.trim()).filter(Boolean))];
}

// orgPublicRepoCount reads how many public repos the org says it has.
//
// This is a second, independent source of truth for "how long should the
// listing be". Any token can see every public repo of a public org, so a
// listing shorter than this number was cut short — that is a fact about the
// listing, not a heuristic. Returns null when the count cannot be read, so a
// missing cross-check degrades to the weaker signals below instead of failing
// the sync.
function orgPublicRepoCount(exec = execSync) {
  try {
    const n = Number(
      String(exec(`gh api orgs/${ORG} --jq '.public_repos'`, {encoding: 'utf8'})).trim(),
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
// `count` is the raw listing length, before SKIP is applied — SKIP removes
// repos that do exist, so filtering first would mask a real shortfall.
function checkListing(count, publicRepos = null, perPage = PER_PAGE) {
  const fatal = [];
  const warnings = [];

  if (count === 0) {
    fatal.push(
      `the ${ORG} repo listing came back empty. An empty org is not a real ` +
      'answer here, so treat this as a failed listing rather than as nothing to do.',
    );
  }
  if (publicRepos !== null && count < publicRepos) {
    fatal.push(
      `the listing holds ${count} repos but ${ORG} reports ${publicRepos} public ` +
      'repos, and every token can see every public repo of a public org. The ' +
      'listing is truncated — check that --paginate survived on the gh api call.',
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

function main() {
  // Discover repos from the org.
  const listed = listOrgRepos();
  const publicRepos = orgPublicRepoCount();
  const {fatal, warnings} = checkListing(listed.length, publicRepos);

  console.log(
    `🔎 ${listed.length} repos listed in ${ORG}` +
    (publicRepos === null
      ? ' (org repo count unavailable — cross-check skipped)'
      : ` (org reports ${publicRepos} public)`),
  );
  for (const w of warnings) console.warn(`⚠️  suspicious repo listing: ${w}`);
  for (const f of fatal) console.error(`✗ ${f}`);
  if (fatal.length) process.exit(1);

  // A slug in HAND_AUTHORED that matches nothing on disk protects nothing, and
  // does it quietly — the same shape of bug as the truncation above.
  for (const slug of HAND_AUTHORED) {
    if (!existsSync(join(DOCS_DIR, slug))) {
      console.warn(`⚠️  HAND_AUTHORED lists '${slug}', but docs/${slug}/ does not exist`);
    }
  }

  const skipped = listed.filter((n) => SKIP.has(n));
  const repos = listed.filter((n) => !SKIP.has(n));
  let synced = 0;
  let protectedDirs = 0;
  const failures = [];

  const sidebar = [];
  let globalPos = 100; // start after existing docs

  for (const repo of repos) {
    const meta = PROJECTS[repo] || {label: repo, icon: '📄', slug: slugify(repo)};
    const slug = meta.slug || slugify(repo);

    if (HAND_AUTHORED.has(slug)) {
      protectedDirs++;
      console.log(`\n🖐 ${repo} → docs/${slug}/ is hand-authored — left alone`);
      continue;
    }

    console.log(`\n📥 ${repo} → docs/${slug}/`);

    let dir;
    try {
      dir = cloneRepo(repo);
      const targetDir = join(DOCS_DIR, slug);
      mkdirSync(targetDir, {recursive: true});

      let localPos = 1;

      // ── README.md → index page ──
      const readmePath = join(dir, 'README.md');
      if (existsSync(readmePath)) {
        let content = readFileSync(readmePath, 'utf8');
        content = sanitizeHtml(content);
        content = fixRelativeLinks(content, repo, '');
        // Remove the leading # Title (Docusaurus uses frontmatter for title)
        content = content.replace(/^# .*\n\n?/, '');
        const statusBanner = getStatusBanner(meta.status || 'unknown');
        let fm = frontmatter(meta.label, localPos++, slug, meta.status || 'unknown');
        if (statusBanner) {
          fm += statusBanner + '\n\n';
        }
        content = fm + content;
        writeFileSync(join(targetDir, 'index.md'), content);
        console.log(`  ✓ README.md → index.md`);
      }

      // ── Additional root docs ──
      const EXTRA = ['ARCHITECTURE', 'CONTRIBUTING', 'ROADMAP', 'TODO', 'SECURITY', 'SPEC'];
      const rootFilter = ROOT_DOC_FILTER[repo] || null;
      for (const file of readdirSync(dir).sort()) {
        const upper = file.replace(/\.(md|rst)$/, '');
        if (file === 'README.md') continue;
        if (rootFilter !== null) {
          // Use explicit allowlist
          if (!rootFilter.includes(file)) continue;
        } else {
          // Default: only known doc files
          if (!EXTRA.includes(upper)) continue;
        }
        let content = readFileSync(join(dir, file), 'utf8');
        content = sanitizeHtml(content);
        content = fixRelativeLinks(content, repo, '');
        content = content.replace(/^# .*\n\n?/, '');
        const title = upper.charAt(0) + upper.slice(1).toLowerCase();
        content = subFrontmatter(title, localPos++) + content;
        writeFileSync(join(targetDir, file), content);
        console.log(`  ✓ ${file}`);
      }

      // ── docs/ folder (recursive) ──
      const docsSubdir = DOCS_SUBDIR[repo] || 'docs';
      const docsDir = join(dir, docsSubdir);
      if (existsSync(docsDir) && readdirSync(docsDir).length > 0) {
        for (const file of readdirSync(docsDir).sort()) {
          // Skip mdBook metadata files
          if (file === 'SUMMARY.md') continue;
          if (!file.endsWith('.md') && !file.endsWith('.rst')) continue;
          let content = readFileSync(join(docsDir, file), 'utf8');
          content = sanitizeHtml(content);
          content = fixRelativeLinks(content, repo, docsSubdir);
          content = content.replace(/^# .*\n\n?/, '');
          const title = file.replace(/\.(md|rst)$/, '').replace(/[-_]/g, ' ');
          content = subFrontmatter(title, localPos++) + content;
          writeFileSync(join(targetDir, file), content);
          console.log(`  ✓ docs/${file}`);
        }
      }
      synced++;
    } catch (e) {
      failures.push(`${repo}: ${e.message}`);
      console.error(`  ✗ Failed: ${e.message}`);
    } finally {
      // Each repo is cloned into its own mktemp -d and was never removed, so
      // a full run left ~25 shallow clones behind. On the CI runner that is
      // invisible because the runner is thrown away; run it twice on a
      // workstation with a 2G /tmp and the disk fills.
      if (dir) rmSync(dir, {recursive: true, force: true});
    }
  }

  // Say what the run actually covered. Until now a run that reached a third of
  // the org and a run that reached all of it printed the same thing and exited
  // 0, so partial coverage could only be noticed by spotting an absence.
  console.log(
    `\n📊 ${listed.length} listed · ${skipped.length} in SKIP · ` +
    `${protectedDirs} hand-authored · ${synced} synced · ${failures.length} failed`,
  );
  if (failures.length) {
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error(
      `✗ ${failures.length} of ${synced + failures.length} attempted repos did not sync. ` +
      'Exiting non-zero: ' +
      'a run that covered part of the org must not report success.',
    );
    process.exit(1);
  }
}

export {
  sanitizeHtml,
  fixRelativeLinks,
  onProse,
  frontmatter,
  subFrontmatter,
  getStatusBanner,
  slugify,
  listOrgRepos,
  orgPublicRepoCount,
  checkListing,
  HAND_AUTHORED,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
};

// Only clone and rewrite when run as a command. The transforms above are
// imported by the tests, which must not touch the network.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
