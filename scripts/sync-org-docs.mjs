#!/usr/bin/env node
// Aggregates READMEs and docs from every active project in the tuna-os
// GitHub org into the Docusaurus site. Reads no project-specific config
// here — new repos with a README are automatically picked up.
//
// Usage:
//   node scripts/sync-org-docs.mjs

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';

// Projects that get their own doc section. Add a slug → label entry to
// give a repo a human-readable name; repos not listed here still get
// picked up but use their raw repo name as the label.
const PROJECTS = {
  tunaOS:      {label: 'TunaOS',           icon: '🐟', slug: 'tunaos',          status: 'stable'},
  tacklebox:   {label: 'Tacklebox',        icon: '🧰', slug: 'tacklebox',       status: 'stable'},
  'bootc-installer-tui': {label: 'bootc-installer', icon: '💻', slug: 'bootc-installer', status: 'stable'},
  'dakota-iso': {label: 'Dakota',          icon: '🎣', slug: 'dakota',          status: 'stable'},
  'ubuntu-26.04-iso': {label: 'Ubuntu ISO',icon: '🟠', slug: 'ubuntu',          status: 'stable'},
  chunkah:     {label: 'chunkah',          icon: '📦', slug: 'chunkah',         status: 'experimental'},
  'bonito-x13s': {label: 'Bonito X13s',    icon: '💪', slug: 'bonito-x13s',     status: 'experimental'},
  'dakota-x13s': {label: 'Dakota X13s',    icon: '💪', slug: 'dakota-x13s',     status: 'experimental'},
  tromso:      {label: 'Tromsø',           icon: '🏔️', slug: 'tromso',           status: 'alpha'},
  'tromso-iso': {label: 'Tromsø ISO',      icon: '🏔️', slug: 'tromso-iso',      status: 'alpha'},
  'xfce-linux': {label: 'XFCE Linux',      icon: '🖥️', slug: 'xfce-linux',      status: 'alpha'},
  'xfce-linux-iso': {label: 'XFCE Linux ISO', icon: '🖥️', slug: 'xfce-linux-iso', status: 'alpha'},
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
]);

// Per-repo filter: only sync these root doc files (case-insensitive match).
// Empty array = sync all root .md files.
const ROOT_DOC_FILTER = {
  tunaOS: ['README.md', 'ROADMAP.md', 'SECURITY.md', 'CONTRIBUTING.md'],
  'github-copr': ['README.md', 'ARCHITECTURE.md'],
  'dakota-iso': ['README.md', 'CONTRIBUTING.md'],
  'ubuntu-26.04-iso': ['README.md', 'CONTRIBUTING.md'],
  'bonito-x13s': ['README.md', 'CONTRIBUTING.md'],
  'dakota-x13s': ['README.md', 'CONTRIBUTING.md'],
};

// Repos whose docs/ folder should NOT be synced (too noisy / internal).
const SKIP_DOCS_DIR = new Set();

// Per-repo subdirectory to sync instead of docs/ (for repos with nested doc structure).
const DOCS_SUBDIR = {
  tunaOS: 'docs/book/src',
};

const ORG = 'tuna-os';
const DOCS_DIR = 'docs';

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

function sanitizeHtml(content) {
  // Strip HTML that MDX can't parse (picture tags, unclosed void elements, etc.)
  let c = content;
  // Replace <picture>...</picture> blocks with just the img tag
  c = c.replace(/<picture>[\s\S]*?<img\s[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/picture>/gi, '![]');
  // Remove align attributes on divs that confuse MDX
  c = c.replace(/<div\s+align="[^"]*">/gi, '<div>');
  // Remove HTML comments that contain markdown (breaks MDX)
  c = c.replace(/<!--[\s\S]*?-->/g, '');
  // Escape angle brackets in non-HTML contexts that MDX interprets as JSX
  // E.g., <email@domain> or <number+name@domain>
  c = c.replace(/<(\d+[+]?[^>]*@[^>]+)>/g, '&lt;$1&gt;');
  return c;
}

function fixRelativeLinks(content, repo) {
  // Convert relative repo links to absolute GitHub links.
  // [something](./foo.md) → [something](https://github.com/tuna-os/<repo>/blob/main/foo.md)
  // But keep intra-doc links within the Docusaurus site as-is.
  // Strategy: links that start with ./  or ../ and end with .md or .rst
  // get the full GitHub URL.
  const base = `https://github.com/${ORG}/${repo}/blob/main`;
  let c = content.replace(
    /]\((\.[^)]*\.(?:md|rst|png|svg|jpg))\)/gi,
    (_, p) => {
      const clean = p.replace(/^\.\//, '');
      return `](${base}/${clean})`;
    },
  );
  // Also fix bare relative paths without leading ./
  c = c.replace(
    /]\(((?!https?:|#|\/)[^)]*\.(?:md|rst))\)/gi,
    (_, p) => `](${base}/${p})`,
  );
  // Fix image references
  c = c.replace(
    /!\[([^\]]*)\]\((\.[^)]+)\)/g,
    (_, alt, p) => {
      const clean = p.replace(/^\.\//, '');
      return `![${alt}](${base}/${clean})`;
    },
  );
  return c;
}

function frontmatter(title, position, slug, status) {
  return `---
sidebar_position: ${position}
sidebar_label: "${title}"
slug: /docs/${slug}
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

function main() {
  // Discover repos from the org
  const repos = execSync(
    `gh api orgs/${ORG}/repos --jq '.[].name'`,
    {encoding: 'utf8'},
  ).trim().split('\n').filter(n => n && !SKIP.has(n));

  const sidebar = [];
  let globalPos = 100; // start after existing docs

  for (const repo of repos) {
    const meta = PROJECTS[repo] || {label: repo, icon: '📄', slug: slugify(repo)};
    const slug = meta.slug || slugify(repo);

    console.log(`\n📥 ${repo} → docs/${slug}/`);

    try {
      const dir = cloneRepo(repo);
      const targetDir = join(DOCS_DIR, slug);
      mkdirSync(targetDir, {recursive: true});

      let localPos = 1;

      // ── README.md → index page ──
      const readmePath = join(dir, 'README.md');
      if (existsSync(readmePath)) {
        let content = readFileSync(readmePath, 'utf8');
        content = sanitizeHtml(content);
        content = fixRelativeLinks(content, repo);
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
        content = fixRelativeLinks(content, repo);
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
          content = fixRelativeLinks(content, repo);
          content = content.replace(/^# .*\n\n?/, '');
          const title = file.replace(/\.(md|rst)$/, '').replace(/[-_]/g, ' ');
          content = subFrontmatter(title, localPos++) + content;
          writeFileSync(join(targetDir, file), content);
          console.log(`  ✓ docs/${file}`);
        }
      }
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
  }
}

main();
