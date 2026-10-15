import {readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

// Recursively collects markdown files (.md/.mdx) under dir.
export function walkMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMarkdownFiles(full));
    } else if (/\.(md|mdx)$/i.test(entry)) {
      out.push(full);
    }
  }
  return out;
}
