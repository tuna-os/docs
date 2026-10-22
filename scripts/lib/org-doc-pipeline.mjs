// Content transformation and MDX validation happen before any destination write.
import {sanitizeHtml, fixRelativeLinks, frontmatter, subFrontmatter, getStatusBanner} from './org-doc-transform.mjs';
import {createMdxValidator} from './org-doc-mdx.mjs';

function transformPage(raw, {repo, branch, org = 'tuna-os', srcDir = '', title, position, index = false, slug, status = 'unknown'}) {
  let content = sanitizeHtml(raw);
  content = fixRelativeLinks(content, repo, srcDir, branch, org);
  content = content.replace(/^# .*\n\n?/, '');
  if (!index) return subFrontmatter(title, position) + content;
  const banner = getStatusBanner(status);
  return frontmatter(title, position, slug, status) + (banner ? banner + '\n\n' : '') + content;
}

function createMarkdownPipeline(options = {}) {
  const validate = createMdxValidator(options);
  return (raw, metadata) => validate(transformPage(raw, metadata), metadata.path);
}

export {transformPage, createMarkdownPipeline};
