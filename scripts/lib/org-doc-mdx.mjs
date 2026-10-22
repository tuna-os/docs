// MDX compile checks and CommonMark fallback, independent of repository sync.
import {readFileSync, writeFileSync} from 'node:fs';

function createMdxValidator({compile = null, logger = console} = {}) {
  let compiler;
  return async (content, path = 'page') => {
    const fm = content.match(/^---\n[\s\S]*?\n---\n/);
    if (!fm || /\nmdx:\n  format: md\n/.test(fm[0])) return content;
    // Load once per pipeline, outside the parse-error handler: missing tooling
    // is a sync failure, rather than evidence that every page is CommonMark.
    compiler ??= compile ? {compile, options: {}} : await loadCompiler();
    try {
      const body = content.slice(fm[0].length).replace(/<!--[\s\S]*?-->/g, '');
      await compiler.compile(body, compiler.options);
      return content;
    } catch (e) {
      logger.warn(`  ⚠️  ${path} is not valid MDX (${String(e.message).split('\n')[0]}); built as CommonMark`);
      return withFormatMd(content);
    }
  };
}

async function loadCompiler() {
  const [{compile}, {default: remarkGfm}] = await Promise.all([
    import('@mdx-js/mdx'), import('remark-gfm'),
  ]);
  return {compile, options: {remarkPlugins: [remarkGfm, rejectExpressions]}};
}

// Compatibility adapter for callers validating pages already on disk. The sync
// uses createMdxValidator directly and never needs a post-write repair pass.
async function markUnparseable(paths, compile = null) {
  const validate = createMdxValidator({compile});
  let marked = 0;
  for (const path of paths) {
    const content = readFileSync(path, 'utf8');
    const validated = await validate(content, path);
    if (validated !== content) {
      writeFileSync(path, validated);
      marked++;
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

export {createMdxValidator, markUnparseable, rejectExpressions, withFormatMd};
