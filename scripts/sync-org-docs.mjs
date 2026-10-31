#!/usr/bin/env node
// Aggregates READMEs and docs from every active project in the tuna-os
// GitHub org into the Docusaurus site. Reads no project-specific config
// here — new repos with a README are automatically picked up.
//
// Usage:
//   node scripts/sync-org-docs.mjs

import {existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  sanitizeHtml,
  fixRelativeLinks,
  onProse,
  frontmatter,
  subFrontmatter,
  isSyncedIndex,
  getStatusBanner,
} from './lib/org-doc-transform.mjs';
import {
  cloneRepo,
  discoverRepos,
  ORG,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
  RETRY_DELAY_MS,
  listOrgRepos,
  orgPublicRepoCount,
  checkListing,
} from './lib/org-doc-source.mjs';

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

// Per-repo filter: only sync these root doc files (case-insensitive match).
// Empty array = sync all root .md files.
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

const DOCS_DIR = 'docs';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}
// filesToRemove reconciles what a repo's sync wrote against what its
// docs/<slug>/ tree already held, so a page deleted upstream is deleted here
// too instead of outliving its source indefinitely (the kde-build-meta case:
// TRACKING-POLICY.md stayed published for weeks after the workflow it
// documented, and the repo itself, were retired).
//
// Takes plain arrays rather than touching the filesystem, so this is testable
// without a real docs/ tree: `existingFiles` is what readdirSync(targetDir)
// found before this run wrote anything, `writtenFiles` is every filename this
// run's three write sites (README, root docs, docs/ folder) actually wrote.
//
// A file present before and not written this run is a candidate for removal
// only if this script can prove it wrote it originally:
//   - index.md is provable via isSyncedIndex — frontmatter()'s front matter
//     is deliberately unlike anything a person types (see the comment above
//     SYNCED_INDEX).
//   - Every other synced filename is provable by construction, not content:
//     this function is only ever called with the targetDir of a repo this
//     run is actively syncing (never a HAND_AUTHORED slug, which `continue`s
//     before reaching this loop at all), and every non-index write in that
//     loop goes through subFrontmatter() — whose front matter shape is
//     deliberately indistinguishable from a hand-written page's (see
//     docs/flatpak/guide.md, cited in the isSyncedIndex tests). So content
//     cannot tell a synced subpage from a hand-added one in the general
//     case — but *which directory this run is allowed to touch* already
//     answers that question for every file this function is asked about,
//     because the caller never asks it about a directory it didn't just
//     finish writing into.
//
// `existingFiles` must already exclude directory entries before it's passed
// in — a synced repo's targetDir can hold a genuine subdirectory this script
// never created (docs/iso-builder/img/, docs/tunaos/installer-walkthrough/ —
// both real, both manually maintained), and this function has no way to
// re-check that a name it's given isn't one; the caller does that filtering
// (readdirSync with withFileTypes, keeping only isFile() entries) before ever
// calling this.
//
// `couldWrite(file)` says whether this run could have written `file` at all.
// A repo in SKIP_DOCS_DIR has its docs/ folder left alone, so its targetDir
// mixes synced root docs with pages written by hand here (docs/tunaos/
// introduction.md, building.md, …). Those were never this script's to write,
// so they are never candidates — without this, every run deleted them and
// the site build then failed on the sidebar entries that point at them.
function filesToRemove(existingFiles, writtenFiles, readIndexContent, couldWrite = () => true) {
  const written = new Set(writtenFiles);
  const removable = [];
  const refused = [];
  for (const file of existingFiles) {
    if (written.has(file)) continue;
    if (!couldWrite(file)) continue;
    if (file === 'index.md') {
      const content = readIndexContent();
      if (content !== null && isSyncedIndex(content)) {
        removable.push(file);
      } else {
        refused.push(file);
      }
      continue;
    }
    removable.push(file);
  }
  return {removable, refused};
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

// findCaseCollisions walks rootDir recursively and returns groups of file
// paths (relative to rootDir, forward-slash separated) that are distinct but
// become identical when lowercased.
//
// tacklebox/USER-GUIDE.md (synced) and tacklebox/user-guide.md (hand-authored)
// coexisted in the tree until #153 removed the duplicate by hand. On a
// case-sensitive filesystem (every CI runner, every Linux dev machine) that
// is two files and nothing complains. On a case-insensitive one (macOS,
// default-configured) it is one file silently overwriting the other on
// checkout, and Docusaurus would serve the two source paths as duplicate
// routes even where the filesystem itself tolerates it. A future sync run
// can recreate this class of bug the same way the first one happened, so
// this is a standing guard, not a one-off cleanup.
function findCaseCollisions(rootDir) {
  const byLower = new Map();
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), rel);
        continue;
      }
      const lower = rel.toLowerCase();
      if (!byLower.has(lower)) byLower.set(lower, []);
      byLower.get(lower).push(rel);
    }
  };
  walk(rootDir, '');
  return [...byLower.values()].filter((paths) => paths.length > 1);
}

// Root docs keep their public routes. Flattened docs/ pages receive a prefix
// only when their name would overwrite another import, including index.md.
// Reserve natural names first so a generated prefix cannot steal a later page.
function docOutputNames(rootFiles, docFiles) {
  const used = new Set(['index.md', ...rootFiles].map(name => name.toLowerCase()));
  const reserved = new Set([...used, ...docFiles.map(name => name.toLowerCase())]);
  const outputs = new Map();
  for (const file of [...docFiles].sort()) {
    let output = file;
    if (used.has(output.toLowerCase())) {
      output = `docs-${file}`;
      while (reserved.has(output.toLowerCase())) output = `docs-${output}`;
    }
    used.add(output.toLowerCase());
    reserved.add(output.toLowerCase());
    outputs.set(file, output);
  }
  return outputs;
}

function main() {
  // Discover repos from the org.
  const {listed, publicRepos, fatal, warnings, attempts} = discoverRepos();

  console.log(
    `🔎 ${listed.length} repos listed in ${ORG}` +
    (publicRepos === null
      ? ' (org repo count unavailable — cross-check skipped)'
      : ` (org reports ${publicRepos} public)`) +
    (attempts > 1 ? ` (attempt ${attempts}/2)` : ''),
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
  let removed = 0;
  let refusedRemovals = 0;
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
    let branch;
    try {
      ({dir, branch} = cloneRepo(repo));
      const targetDir = join(DOCS_DIR, slug);
      mkdirSync(targetDir, {recursive: true});

      // Snapshot what's already there before writing anything, so removal
      // (below) can tell "was here before, not written this run" from "this
      // run just created it". Directories are excluded up front — img/,
      // installer-walkthrough/ and the like are never something this script
      // wrote and must never be candidates for removal.
      const existingFiles = readdirSync(targetDir, {withFileTypes: true})
        .filter(e => e.isFile())
        .map(e => e.name);
      const writtenFiles = [];

      let localPos = 1;

      // ── README.md → index page ──
      const readmePath = join(dir, 'README.md');
      if (existsSync(readmePath)) {
        let content = readFileSync(readmePath, 'utf8');
        content = sanitizeHtml(content);
        content = fixRelativeLinks(content, repo, '', branch);
        // Remove the leading # Title (Docusaurus uses frontmatter for title)
        content = content.replace(/^# .*\n\n?/, '');
        const statusBanner = getStatusBanner(meta.status || 'unknown');
        let fm = frontmatter(meta.label, localPos++, slug, meta.status || 'unknown');
        if (statusBanner) {
          fm += statusBanner + '\n\n';
        }
        content = fm + content;
        writeFileSync(join(targetDir, 'index.md'), content);
        WRITTEN.push(join(targetDir, 'index.md'));
        writtenFiles.push('index.md');
        console.log(`  ✓ README.md → index.md`);
      }

      // ── Additional root docs ──
      const rootFilter = ROOT_DOC_FILTER[repo] || null;
      for (const file of readdirSync(dir).sort()) {
        const upper = file.replace(/\.(md|rst)$/, '');
        if (file === 'README.md') continue;
        if (rootFilter !== null) {
          // Use explicit allowlist
          if (!rootFilter.includes(file)) continue;
        } else {
          // Default: only known doc files
          if (!ROOT_DOC_NAMES.includes(upper)) continue;
        }
        let content = readFileSync(join(dir, file), 'utf8');
        content = sanitizeHtml(content);
        content = fixRelativeLinks(content, repo, '', branch);
        content = content.replace(/^# .*\n\n?/, '');
        const title = upper.charAt(0) + upper.slice(1).toLowerCase();
        content = subFrontmatter(title, localPos++) + content;
        writeFileSync(join(targetDir, file), content);
        WRITTEN.push(join(targetDir, file));
        writtenFiles.push(file);
        console.log(`  ✓ ${file}`);
      }

      // ── docs/ folder (recursive) ──
      const docsSubdir = DOCS_SUBDIR[repo] || 'docs';
      const docsDir = join(dir, docsSubdir);
      if (!SKIP_DOCS_DIR.has(repo) && existsSync(docsDir) && readdirSync(docsDir).length > 0) {
        const docFiles = readdirSync(docsDir, {withFileTypes: true})
          .filter(entry => entry.isFile() && entry.name !== 'SUMMARY.md' && /\.(md|rst)$/.test(entry.name))
          .map(entry => entry.name);
        const outputs = docOutputNames(writtenFiles, docFiles);
        for (const file of docFiles.sort()) {
          const output = outputs.get(file);
          let content = readFileSync(join(docsDir, file), 'utf8');
          content = sanitizeHtml(content);
          content = fixRelativeLinks(content, repo, docsSubdir, branch);
          content = content.replace(/^# .*\n\n?/, '');
          const title = file.replace(/\.(md|rst)$/, '').replace(/[-_]/g, ' ');
          content = subFrontmatter(title, localPos++) + content;
          writeFileSync(join(targetDir, output), content);
          WRITTEN.push(join(targetDir, output));
          writtenFiles.push(output);
          console.log(`  ✓ ${docsSubdir}/${file} → ${output}`);
        }
      }

      // ── Reconcile deletions ──
      // A page removed upstream (kde-build-meta's TRACKING-POLICY.md, deleted
      // alongside the workflow it documented) otherwise stays published here
      // forever: every write above is unconditional, and nothing until now
      // ever looked at what was already in targetDir.
      const {removable, refused} = filesToRemove(
        existingFiles,
        writtenFiles,
        () => {
          const indexPath = join(targetDir, 'index.md');
          return existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : null;
        },
        SKIP_DOCS_DIR.has(repo) ? file => isRootDoc(file, rootFilter) : undefined,
      );
      for (const file of removable) {
        rmSync(join(targetDir, file), {force: true});
        removed++;
        console.log(`  ✗ removed (no longer upstream): ${file}`);
      }
      for (const file of refused) {
        refusedRemovals++;
        console.warn(
          `  ⚠️  ${file} looks hand-written and is no longer upstream — ` +
          'left in place. Add its slug to HAND_AUTHORED if it should stay ' +
          'permanently, or delete it by hand if it should go.',
        );
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
    `${protectedDirs} hand-authored · ${synced} synced · ${failures.length} failed · ` +
    `${removed} removed (no longer upstream) · ${refusedRemovals} refused (looked hand-written)`,
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

  // Case-collision guard (#154): run after every write, not just the ones
  // this invocation made, so a collision introduced by a hand edit sitting
  // next to synced content is still caught the next time sync runs.
  const collisions = findCaseCollisions(DOCS_DIR);
  if (collisions.length) {
    console.error(`\n✗ ${collisions.length} case-insensitive path collision(s) under ${DOCS_DIR}/:`);
    for (const group of collisions) console.error(`  ✗ ${group.join('  ==  ')}`);
    console.error(
      'These paths are distinct on a case-sensitive filesystem but identical on ' +
      'a case-insensitive one (macOS) and are served as duplicate routes either ' +
      'way. Remove or rename one of each pair.',
    );
    process.exit(1);
  }
}

// Every page this run wrote, for markUnparseable.
const WRITTEN = [];

// markUnparseable compiles each synced page as MDX, the way the site build
// will, and marks one that does not compile `mdx: {format: md}` (Docusaurus's
// per-page front matter, `frontMatter.mdx.format`) so Docusaurus reads
// it as CommonMark instead.
//
// sanitizeHtml handles the shapes of upstream markdown seen so far, but an
// upstream README is free to contain anything GitHub renders, and one page MDX
// cannot parse fails the whole site build: every synced update then waits
// until someone teaches the sanitizer the new shape. As CommonMark the page
// builds, and only its raw HTML is lost (it shows as text). The warning names
// the page so the sanitizer can learn the shape later.
async function markUnparseable(paths, compile = null) {
  const mdxCompile = compile ?? (await import('@mdx-js/mdx')).compile;
  const remarkGfm = compile ? null : (await import('remark-gfm')).default;
  let marked = 0;
  for (const path of paths) {
    const content = readFileSync(path, 'utf8');
    const fm = content.match(/^---\n[\s\S]*?\n---\n/);
    if (!fm || /\nmdx:\n  format: md\n/.test(fm[0])) continue;
    try {
      // HTML comments as the site's markdown.mdx1Compat.comments reads them.
      const body = content.slice(fm[0].length).replace(/<!--[\s\S]*?-->/g, '');
      await mdxCompile(body, remarkGfm ? {remarkPlugins: [remarkGfm, rejectExpressions]} : {});
    } catch (e) {
      writeFileSync(path, withFormatMd(content));
      marked++;
      console.warn(`  ⚠️  ${path} is not valid MDX (${String(e.message).split('\n')[0]}); built as CommonMark`);
    }
  }
  return marked;
}

// rejectExpressions fails the compile on a JavaScript expression or import.
// `{server}` in an upstream README is prose to GitHub, but MDX compiles it to a
// reference to a variable that does not exist, and the page then fails when
// the site renders it rather than when it compiles. A synced page never means
// JavaScript, so any expression marks it.
function rejectExpressions() {
  return (tree) => {
    const walk = (node) => {
      const found = findExpression(node);
      if (found) throw new Error(`JavaScript expression \`${found}\` in prose`);
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function findExpression(node) {
  if (node.type === 'mdxjsEsm') return node.value.trim().split('\n')[0];
  if ((node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') && node.value.trim()) {
    return `{${node.value.trim()}}`;
  }
  for (const attr of node.attributes ?? []) {
    if (attr.type === 'mdxJsxExpressionAttribute') return `{${attr.value}}`;
    if (attr.value?.type === 'mdxJsxAttributeValueExpression') return `{${attr.value.value}}`;
  }
  return null;
}

// withFormatMd adds `mdx: {format: md}` at the end of the front matter.
function withFormatMd(content) {
  return content.replace(/^(---\n[\s\S]*?\n)---\n/, '$1mdx:\n  format: md\n---\n');
}

export {
  sanitizeHtml,
  fixRelativeLinks,
  onProse,
  frontmatter,
  subFrontmatter,
  isSyncedIndex,
  getStatusBanner,
  filesToRemove,
  isRootDoc,
  markUnparseable,
  rejectExpressions,
  withFormatMd,
  slugify,
  listOrgRepos,
  orgPublicRepoCount,
  checkListing,
  discoverRepos,
  findCaseCollisions,
  docOutputNames,
  HAND_AUTHORED,
  PER_PAGE,
  DEFAULT_PAGE_SIZE,
  RETRY_DELAY_MS,
};

// The command module is imported by tests for orchestration and reconciliation
// helpers; its guarded main() call keeps those imports network-free.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
  await markUnparseable(WRITTEN);
}
