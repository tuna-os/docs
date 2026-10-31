// Per-repository clone lifetime, write stages, and deletion reconciliation.
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {filesToRemove, docOutputNames} from './org-doc-validation.mjs';
import {slugify} from './org-doc-policy.mjs';

// Read the actual default branch from the clone (some projects use dev/master).
// Own cleanup even when git fails before a clone can be returned to the caller.
function cloneRepo(repo, org = 'tuna-os', exec = execFileSync) {
  const dir = mkdtempSync(join(tmpdir(), 'org-docs-'));
  try {
    exec('git', ['clone', '--depth=1', `https://github.com/${org}/${repo}.git`, dir], {
      stdio: 'pipe', timeout: 60_000,
    });
    const branch = exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: dir, encoding: 'utf8',
    }).trim();
    return {dir, branch};
  } catch (error) {
    rmSync(dir, {recursive: true, force: true});
    throw error;
  }
}

async function syncRepository(repo, {org = 'tuna-os', docsDir = 'docs', policy, pipeline, clone = cloneRepo, logger = console}) {
  const meta = policy.metadata(repo);
  const slug = meta.slug || slugify(repo);
  // Enforce ownership at the mutation boundary, even for direct callers.
  if (!policy.shouldSync(repo) || policy.isHandAuthored(slug)) {
    return {synced: false, files: [], removed: 0, refusedRemovals: 0};
  }
  logger.log(`\n📥 ${repo} → ${docsDir}/${slug}/`);
  let dir;
  try {
    let branch;
    ({dir, branch} = clone(repo, org));
    const targetDir = join(docsDir, slug);
    mkdirSync(targetDir, {recursive: true});
    // Subdirectories can contain hand-maintained assets and pages. Never
    // include them in the reconciliation candidate set.
    const existingFiles = readdirSync(targetDir, {withFileTypes: true})
      .filter(entry => entry.isFile()).map(entry => entry.name);
    const files = [];
    let position = 1;
    const writePage = async (sourceDir, file, target, title, index = false) => {
      const path = join(targetDir, target);
      const content = await pipeline(readFileSync(join(dir, sourceDir, file), 'utf8'), {
        repo, branch, org, srcDir: sourceDir, title, position: position++, index,
        slug, status: meta.status || 'unknown', path,
      });
      writeFileSync(path, content);
      files.push(target);
      logger.log(`  ✓ ${index ? 'README.md → index.md' : sourceDir ? `${sourceDir}/${file}` : file}`);
    };

    if (existsSync(join(dir, 'README.md'))) {
      await writePage('', 'README.md', 'index.md', meta.label, true);
    }
    for (const file of readdirSync(dir).sort()) {
      if (!policy.shouldSyncRootDoc(repo, file)) continue;
      const upper = file.replace(/\.(md|rst)$/, '');
      await writePage('', file, file, upper.charAt(0) + upper.slice(1).toLowerCase());
    }
    const docsSubdir = policy.getDocsSubdir(repo);
    const sourceDocs = join(dir, docsSubdir);
    if (policy.shouldSyncDocsDir(repo) && existsSync(sourceDocs)) {
      const docFiles = readdirSync(sourceDocs, {withFileTypes: true})
        .filter(entry => entry.isFile() && entry.name !== 'SUMMARY.md' && /\.(md|rst)$/.test(entry.name))
        .map(entry => entry.name);
      const outputs = docOutputNames(files, docFiles);
      for (const file of docFiles.sort()) {
        const output = outputs.get(file);
        const title = file.replace(/\.(md|rst)$/, '').replace(/[-_]/g, ' ');
        await writePage(docsSubdir, file, output, title);
      }
    }

    // Reconcile only after every write succeeds. Mixed trees are constrained
    // by the same policy that decided which source stages could write them.
    const {removable, refused} = filesToRemove(existingFiles, files, () => {
      const path = join(targetDir, 'index.md');
      return existsSync(path) ? readFileSync(path, 'utf8') : null;
    }, file => policy.couldWrite(repo, file));
    for (const file of removable) {
      rmSync(join(targetDir, file), {force: true});
      logger.log(`  ✗ removed (no longer upstream): ${file}`);
    }
    for (const file of refused) {
      logger.warn(`  ⚠️  ${file} looks hand-written and is no longer upstream — ` +
        'left in place. Add its slug to HAND_AUTHORED if it should stay ' +
        'permanently, or delete it by hand if it should go.');
    }
    return {synced: true, files, removed: removable.length, refusedRemovals: refused.length};
  } finally {
    if (dir) rmSync(dir, {recursive: true, force: true});
  }
}

export {cloneRepo, syncRepository};
