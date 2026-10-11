// Markdown transformation pipeline: sanitize, fix links, add frontmatter.
//
// Extracted from sync-org-docs.mjs to isolate the transformation pipeline
// (input: raw content → output: transformed content ready to write).

/**
 * onProse applies a transformation function to prose, skipping fenced code blocks
 * and inline code spans.
 *
 * Used to rewrite HTML/links safely: fenced blocks are left exactly as-is,
 * so `--since=<30d>` in bash samples is never escaped, and only prose is
 * transformed.
 */
export function onProse(content, fn) {
  // Split on fenced blocks, keeping the fences as separator captures so the
  // odd-indexed parts are code and pass through untouched.
  const parts = content.split(/(^```[\s\S]*?^```$|^~~~[\s\S]*?^~~~$)/gm);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // a fenced block
      // Same again for inline `code` spans within the prose.
      return part
        .split(/(`(?:[^`\n]|\n(?![ \t]*\n))*`)/g)
        .map((span, j) => (j % 2 === 1 ? span : fn(span)))
        .join('');
    })
    .join('');
}

const HTML_ELEMENTS = new Set([
  'a', 'abbr', 'area', 'audio', 'b', 'base', 'embed', 'link', 'meta', 'track', 'blockquote', 'br', 'caption', 'center', 'cite',
  'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'li', 'mark', 'ol', 'p',
  'picture', 'pre', 'q', 's', 'samp', 'small', 'source', 'span', 'strong',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'tr', 'u', 'ul', 'var', 'video', 'wbr',
]);

/**
 * Sanitize GitHub-flavored markdown for MDX compatibility.
 *
 * MDX reads a bare `<` as JSX, so autolinks (`<https://...>`), `<30s`
 * (less-than in prose), and `<details>` tags need escaping. This stage
 * rewrites the upstream markdown to parse correctly as MDX without changing
 * semantic meaning.
 */
export function sanitizeHtml(content) {
  let c = content;
  // Replace <picture>...</picture> blocks with just the img tag
  c = c.replace(/<picture>[\s\S]*?<img\s[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/picture>/gi, '![]');
  // Remove align attributes on divs that confuse MDX
  c = c.replace(/<div\s+align="[^"]*">/gi, '<div>');
  // Remove HTML comments that contain markdown (breaks MDX)
  c = onProse(c, (s) => s.replace(/<!--[\s\S]*?-->/g, ''));

  c = onProse(c, (s) => {
    // <details><summary>x</summary> on one line: separate tags onto their own lines
    s = s.replace(
      /^([ \t]*)<details>[ \t]*<summary>([\s\S]*?)<\/summary>[ \t]*$/gm,
      '$1<details>\n$1<summary>$2</summary>',
    );
    // Autolinks: <https://example.com> → [URL](URL)
    s = s.replace(/<((?:https?|ftp):\/\/[^\s<>]+)>/g, '[$1]($1)');
    // Email: <email@domain> → &lt;email@domain&gt;
    s = s.replace(/<(\d+[+]?[^>]*@[^>]+)>/g, '&lt;$1&gt;');
    // Less-than: `<30s`, `<5%` → escape the bracket
    s = s.replace(/<(?=[\d\s=])/g, '&lt;');
    // Void elements: <img src="…"> → <img src="…" />
    s = s.replace(
      /(<img|br|hr|input|meta|link|source|col|area|base|embed|track|wbr)\b([^>]*?)\s*\/?>/gi,
      (_, tag, attrs) => `<${tag}${attrs.trimEnd()} />`,
    );
    // Unknown tags: <catalog> → &lt;catalog&gt;
    s = s.replace(/<(?!\/?(?:[a-zA-Z][\w-]*)\b|!--)/g, '&lt;');
    s = s.replace(/<(\/?)([a-zA-Z][\w-]*)\b/g, (whole, slash, name) =>
      HTML_ELEMENTS.has(name.toLowerCase()) ? whole : `&lt;${slash}${name}`,
    );
    return s;
  });
  return c;
}

/**
 * Fix relative links and images to absolute GitHub URLs.
 *
 * A repo-relative link (./foo.md, ../bar.md, LICENSE) resolves against
 * the repo root and becomes an absolute GitHub URL. Intra-doc links within
 * the Docusaurus site stay as-is. This fixes 404s from synced README links
 * that worked on GitHub but point nowhere in the docs site.
 */
export function fixRelativeLinks(content, repo, org, srcDir = '', branch = 'main') {
  const prefix = srcDir ? `${srcDir.replace(/\/+$/, '')}/` : '';
  const base = `https://github.com/${org}/${repo}/blob/${branch}`;
  const raw = `https://raw.githubusercontent.com/${org}/${repo}/${branch}`;
  const IMAGE = /\.(?:png|svg|jpe?g|gif|webp)$/i;

  // Resolve a path written inside srcDir against the repo root.
  const clean = (p) => {
    const out = [];
    for (const seg of (prefix + p).split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') out.pop();
      else out.push(seg);
    }
    return out.join('/');
  };

  // Images first, so link rules below cannot claim them.
  let c = content.replace(
    /!\[([^\]]*)\]\((?!https?:|#|\/|data:)([^)\s]+)([^)]*)\)/g,
    (m, alt, p, rest) => (IMAGE.test(p) ? `![${alt}](${raw}/${clean(p)}${rest})` : m),
  );
  // Raw HTML <img src="…">
  c = c.replace(
    /(<img\b[^>]*?\bsrc=")(?!https?:|\/|data:)([^"]+)(")/gi,
    (_, pre, p, post) => `${pre}${raw}/${clean(p)}${post}`,
  );
  // Repo-relative markdown links
  const github = `https://github.com/${org}/${repo}`;
  c = c.replace(
    /(?<!!)\]\(([^()\s][^()]*)\)/g,
    (m, target) => {
      const hash = target.indexOf('#');
      const path = hash === -1 ? target : target.slice(0, hash);
      const anchor = hash === -1 ? '' : target.slice(hash);

      if (
        path === '' ||
        path.startsWith('<') ||
        /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(path)
      ) {
        return m;
      }

      const cleaned = clean(path);
      if (cleaned === '') return m;

      if (cleaned === 'releases') return `](${github}/releases${anchor})`;

      return `](${base}/${cleaned}${anchor})`;
    },
  );
  return c;
}

/**
 * Remove the leading # Title from a markdown document.
 * Docusaurus uses frontmatter for the title, so the H1 is redundant.
 */
export function removeTitle(content) {
  return content.replace(/^# .*\n\n?/, '');
}

/**
 * Frontmatter for the index page of a synced repo tree.
 * Includes sidebar position and status label.
 */
export function indexFrontmatter(title, position, slug, status) {
  return `---
sidebar_position: ${position}
sidebar_label: "${title}"

status: ${status || 'unknown'}
---

`;
}

/**
 * Frontmatter for sub-pages within a synced repo tree.
 */
export function pageFrontmatter(title, position) {
  return `---
sidebar_position: ${position}
title: "${title}"
---\n\n`;
}

/**
 * Transform a synced markdown file through the full pipeline.
 *
 * @param {string} content - Raw markdown from the source repo
 * @param {object} options - Configuration:
 *   - repo: repository name
 *   - org: organization name
 *   - branch: default branch of the source repo
 *   - srcDir: subdirectory within repo ('' for root, 'docs' for docs/)
 *   - removeHeading: remove leading H1? (default true)
 *   - addFrontmatter: frontmatter config (title, position, slug, status)
 * @returns {string} Transformed markdown ready to write
 */
export function transformContent(content, options) {
  const {
    repo,
    org,
    branch = 'main',
    srcDir = '',
    removeHeading = true,
    addFrontmatter = null,
  } = options;

  let result = content;
  result = sanitizeHtml(result);
  result = fixRelativeLinks(result, repo, org, srcDir, branch);
  if (removeHeading) result = removeTitle(result);
  if (addFrontmatter) {
    const {title, position, slug, status, type} = addFrontmatter;
    const fm = type === 'index'
      ? indexFrontmatter(title, position, slug, status)
      : pageFrontmatter(title, position);
    result = fm + result;
  }
  return result;
}
