// scripts/lib/org-doc-transform.mjs
// Pure Markdown-to-MDX transformation and frontmatter utilities for
// aggregating organization documents into the Docusaurus site.

const ORG = 'tuna-os';

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
      // Same again for inline `code` spans within the prose. A span may wrap
      // onto the next line of its paragraph (CommonMark allows it), but not
      // across a blank line.
      return part
        .split(/(`(?:[^`\n]|\n(?![ \t]*\n))*`)/g)
        .map((span, j) => (j % 2 === 1 ? span : fn(span)))
        .join('');
    })
    .join('');
}

// The HTML elements a synced README may use and MDX renders as HTML.
const HTML_ELEMENTS = new Set([
  'a', 'abbr', 'area', 'audio', 'b', 'base', 'embed', 'link', 'meta', 'track', 'blockquote', 'br', 'caption', 'center', 'cite',
  'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'li', 'mark', 'ol', 'p',
  'picture', 'pre', 'q', 's', 'samp', 'small', 'source', 'span', 'strong',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'tr', 'u', 'ul', 'var', 'video', 'wbr',
]);

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
    // Anything else after `<` is text. A synced README never means JSX, so
    // `<catalog>` and `<frontend>` (placeholders in a table or in emphasis),
    // `<<` and `<-` would otherwise reach MDX as tags it cannot close. Only a
    // known HTML element, a closing tag or a comment keeps its `<`.
    s = s.replace(/<(?!\/?(?:[a-zA-Z][\w-]*)\b|!--)/g, '&lt;');
    s = s.replace(/<(\/?)([a-zA-Z][\w-]*)\b/g, (whole, slash, name) =>
      HTML_ELEMENTS.has(name.toLowerCase()) ? whole : `&lt;${slash}${name}`,
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
function fixRelativeLinks(content, repo, srcDir = '', branch = 'main') {
  // Convert relative repo links to absolute GitHub links.
  // [something](./foo.md) → [something](https://github.com/tuna-os/<repo>/blob/<branch>/foo.md)
  // But keep intra-doc links within the Docusaurus site as-is.
  // Strategy: any repo-relative link (./, ../, or bare) is resolved against
  // the repo root and rewritten to github.com — not just .md/.rst links, so
  // LICENSE, package-factory.yaml and CLAUDE.md#anchor stop shipping as 404s.
  //
  // branch is the repo's actual default branch (tuna-os/docs#263):
  // bootc-installer/fisherman use dev, changelog-action/kde-build-meta/mariner
  // use master. Hardcoding main here rewrote their links to a branch that
  // does not exist for them, 404ing every repo-relative link and image.
  const prefix = srcDir ? `${srcDir.replace(/\/+$/, '')}/` : '';
  const base = `https://github.com/${ORG}/${repo}/blob/${branch}`;
  // Images need bytes, not a page. github.com/…/blob/… answers text/html, so
  // an <img> pointed at it renders broken; raw.githubusercontent.com answers
  // image/png. Only the site's own assets can use a repo-relative path, and
  // the synced files' assets are not copied into this repo.
  const raw = `https://raw.githubusercontent.com/${ORG}/${repo}/${branch}`;
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
  // Rewrite repo-relative markdown links to absolute URLs.
  //
  // A repo-relative link can point at a markdown file, a plain file
  // (LICENSE, package-factory.yaml), the GitHub release list (../../releases),
  // or carry an anchor (CLAUDE.md#adding-a-new-page). All of those live in
  // the source repo, not on the docs site, so they must resolve against
  // github.com — the previous .md/.rst-only regexes left the rest 404ing
  // (#135).
  const github = `https://github.com/${ORG}/${repo}`;
  c = c.replace(
    /(?<!!)\]\(([^()\s][^()]*)\)/g,
    (m, target) => {
      // An anchor belongs to the destination, not to the path that has to
      // be resolved against the repo root.
      const hash = target.indexOf('#');
      const path = hash === -1 ? target : target.slice(0, hash);
      const anchor = hash === -1 ? '' : target.slice(hash);

      // Absolute URLs, angle-bracket targets, mailto:/data:/ftp: links,
      // pure anchors and site-absolute paths are not repo-relative.
      if (
        path === '' ||
        path.startsWith('<') ||
        /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(path)
      ) {
        return m;
      }

      const cleaned = clean(path);
      if (cleaned === '') return m;

      // `releases` is the GitHub releases page, not a file in the repo.
      if (cleaned === 'releases') return `](${github}/releases${anchor})`;

      return `](${base}/${cleaned}${anchor})`;
    },
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

// SYNCED_INDEX matches the front matter frontmatter() writes, and only that.
//
// This is the one mark every docs/<slug>/ tree this script creates carries: the
// index page is written from the upstream README before anything else, and its
// front matter is built here rather than copied from the source repo. The blank
// line before `status:` is part of the template above and is what separates it
// from front matter a person typed — see docs/mariner/index.md, which has the
// same three keys with no blank line.
//
// Anything that reads this as "the tree is generated" is reading a fact about
// how the file was produced. That is deliberately not the same question as
// "does this file link to GitHub", which is what ste-lint used to ask and which
// any hand-written page may answer yes to.
//
// The matcher is written out rather than derived from the template, so a change
// to frontmatter() does not silently change what counts as generated. The test
// in scripts/__tests__/sync-org-docs.test.mjs feeds frontmatter()'s real output
// through isSyncedIndex, so the two cannot drift apart quietly: edit one and
// that test fails.
// `mdx: {format: md}` is added after the fact by markUnparseable (below), so an
// index it marked is still one this script wrote.
const SYNCED_INDEX = /^---\nsidebar_position: \d+\nsidebar_label: "[^"]*"\n\nstatus: \S+\n(?:mdx:\n  format: md\n)?---\n/;

// isSyncedIndex reports whether a document's front matter was written by this
// script's frontmatter() rather than by a person.
function isSyncedIndex(content) {
  return SYNCED_INDEX.test(content);
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

// withFormatMd adds `mdx: {format: md}` at the end of the front matter.
function withFormatMd(content) {
  return content.replace(/^(---\n[\s\S]*?\n)---\n/, '$1mdx:\n  format: md\n---\n');
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

export {
  ORG,
  HTML_ELEMENTS,
  slugify,
  onProse,
  sanitizeHtml,
  fixRelativeLinks,
  frontmatter,
  subFrontmatter,
  isSyncedIndex,
  SYNCED_INDEX,
  getStatusBanner,
  withFormatMd,
  rejectExpressions,
  findExpression,
};
