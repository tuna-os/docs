#!/usr/bin/env node
// Aggregates active tuna-os project READMEs/docs into the Docusaurus site.
// Usage: node scripts/sync-org-docs.mjs
import {pathToFileURL} from 'node:url';
import {synchronizeDocumentation} from './lib/org-doc-synchronizer.mjs';

// Compatibility exports for existing helper consumers. Each concern can also
// be imported directly without loading the command or its orchestration.
export * from './lib/org-doc-transform.mjs';
export * from './lib/org-doc-discovery.mjs';
export {HAND_AUTHORED, isRootDoc, slugify} from './lib/org-doc-policy.mjs';
export {filesToRemove, findCaseCollisions} from './lib/org-doc-validation.mjs';
export {markUnparseable, rejectExpressions, withFormatMd} from './lib/org-doc-mdx.mjs';
export {synchronizeDocumentation};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await synchronizeDocumentation();
  process.exitCode = result.ok ? 0 : 1;
}
