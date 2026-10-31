// Organization-level coordination. Dependencies can be supplied without git,
// GitHub, or process exits, so failure isolation is testable on a local tree.
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {discoverRepos} from './org-doc-discovery.mjs';
import {createSyncPolicy, slugify} from './org-doc-policy.mjs';
import {createMarkdownPipeline} from './org-doc-pipeline.mjs';
import {syncRepository} from './org-doc-syncer.mjs';
import {findCaseCollisions} from './org-doc-validation.mjs';

async function synchronizeDocumentation({
  org = 'tuna-os', docsDir = 'docs', policy = createSyncPolicy(),
  discover = () => discoverRepos(undefined, undefined, org, logger),
  sync = syncRepository, logger = console, pipeline = createMarkdownPipeline({logger}),
} = {}) {
  const discovery = await discover();
  const {listed, publicRepos, fatal, warnings, attempts} = discovery;
  const result = {
    discovery, synced: 0, skipped: 0, protectedDirs: 0, removed: 0,
    refusedRemovals: 0, failures: [], collisions: [], ok: false,
  };
  logger.log(`🔎 ${listed.length} repos listed in ${org}` +
    (publicRepos === null ? ' (org repo count unavailable — cross-check skipped)'
      : ` (org reports ${publicRepos} public)`) +
    (attempts > 1 ? ` (attempt ${attempts}/2)` : ''));
  for (const warning of warnings) logger.warn(`⚠️  suspicious repo listing: ${warning}`);
  for (const error of fatal) logger.error(`✗ ${error}`);
  if (fatal.length) return result;

  for (const slug of policy.handAuthored) {
    if (!existsSync(join(docsDir, slug))) {
      logger.warn(`⚠️  HAND_AUTHORED lists '${slug}', but ${docsDir}/${slug}/ does not exist`);
    }
  }
  for (const repo of listed) {
    if (!policy.shouldSync(repo)) {
      result.skipped++;
      continue;
    }
    const meta = policy.metadata(repo);
    const slug = meta.slug || slugify(repo);
    if (policy.isHandAuthored(slug)) {
      result.protectedDirs++;
      logger.log(`\n🖐 ${repo} → ${docsDir}/${slug}/ is hand-authored — left alone`);
      continue;
    }
    try {
      const synced = await sync(repo, {org, docsDir, policy, pipeline, logger});
      if (synced.synced) result.synced++;
      result.removed += synced.removed;
      result.refusedRemovals += synced.refusedRemovals;
    } catch (error) {
      result.failures.push(`${repo}: ${error.message}`);
      logger.error(`  ✗ Failed: ${error.message}`);
    }
  }
  logger.log(`\n📊 ${listed.length} listed · ${result.skipped} in SKIP · ` +
    `${result.protectedDirs} hand-authored · ${result.synced} synced · ${result.failures.length} failed · ` +
    `${result.removed} removed (no longer upstream) · ${result.refusedRemovals} refused (looked hand-written)`);
  if (result.failures.length) {
    for (const failure of result.failures) logger.error(`  ✗ ${failure}`);
    logger.error(`✗ ${result.failures.length} of ${result.synced + result.failures.length} attempted repos did not sync. ` +
      'Exiting non-zero: a run that covered part of the org must not report success.');
  }
  // Check the whole tree, including untouched hand-authored content. Also run
  // after partial sync failures so the returned validation result is complete.
  result.collisions = findCaseCollisions(docsDir);
  if (result.collisions.length) {
    logger.error(`\n✗ ${result.collisions.length} case-insensitive path collision(s) under ${docsDir}/:`);
    for (const group of result.collisions) logger.error(`  ✗ ${group.join('  ==  ')}`);
    logger.error('These paths are distinct on a case-sensitive filesystem but identical on ' +
      'a case-insensitive one (macOS) and are served as duplicate routes either ' +
      'way. Remove or rename one of each pair.');
  }
  result.ok = !result.failures.length && !result.collisions.length;
  return result;
}

export {synchronizeDocumentation};
