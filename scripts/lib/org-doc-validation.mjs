// Ownership-aware reconciliation and whole-tree validation.
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {isSyncedIndex} from './org-doc-transform.mjs';

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

export {filesToRemove, findCaseCollisions};
