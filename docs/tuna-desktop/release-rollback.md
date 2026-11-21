---
sidebar_position: 40
title: "release rollback"
---

[docs/release.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release.md) covers cutting a release. This covers what to
do once one is already tagged, built, or published and turns out to be
wrong — a regression caught after the tag, a `.deb` that fails on a target
it was supposed to support, or a Marlin image digest that shouldn't have
been promoted.

There is no automated rollback. `scripts/tuna-release` and
`.github/workflows/baseline.yml` only build and publish forward; nothing in
this repository un-publishes a release or repoints a tag. The steps below
are the manual recovery path, ordered by how far the bad release already
traveled.

## 1. Confirm it's actually bad before touching anything

Check what's already live:

- `gh release view vX.Y.Z` — is the `.deb`, notes, and walkthrough media
  attached? Has anyone downloaded it (`gh release view vX.Y.Z --json
  assets` includes download counts)?
- Does `docs/walkthrough.md` on `main` already point at this tag's media?
  (Step 9 of the release checklist commits this separately from the tag
  push, so a release can be tagged and even packaged without the docs site
  referencing it yet — check before assuming public visibility.)
- Is the regression in the GTK shell/compositor itself, or only in
  packaging (missing dependency, wrong binary, bad metadata)? This decides
  whether you need a new build or just a corrected package.

If nothing has been downloaded and the walkthrough page doesn't reference
the tag yet, you likely only need step 2 (delete) and a corrected re-release
under the next patch version — skip straight there.

## 2. Pull the published artifact

```sh
gh release delete vX.Y.Z --repo tuna-os/tuna-desktop
```

This is reversible up to the point someone already has the `.deb` — the
release metadata and asset can be recreated, but you cannot force an update
on whoever already downloaded and installed it. Do this first regardless of
how far the bad release traveled, so no one else picks it up while you work
out the rest.

Do **not** delete or move the git tag itself yet (see step 4) — the release
and the tag are separate; `gh release delete` removes the GitHub Release
object and its assets, not `refs/tags/vX.Y.Z`.

## 3. Decide forward-fix vs. tag surgery

Default to a **forward fix**: cut `vX.Y.Z+1` (or the next patch) with the
regression fixed, following the normal checklist in
[docs/release.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release.md). This is almost always correct — the tag
history stays truthful, and `scripts/tuna-release`'s version-stamp
enforcement and the visual-review gate (`docs/reviews/vX.Y.Z.md`) both
assume tags are append-only.

Only consider moving or deleting the git tag itself (`git tag -d vX.Y.Z &&
git push origin :refs/tags/vX.Y.Z`) if the tagged commit is actively
harmful to publish under any version — e.g. it leaked something it
shouldn't have, or the visual review was filled in incorrectly and the
`TBD`-check in `tuna-release` was bypassed with `--allow-dirty` by mistake.
Tag deletion is harder to reverse once anyone has fetched it (`git fetch
--tags` on a clone that already has it won't drop it locally), and it
breaks `git describe` for anyone who built from that commit. If you do
delete a tag, say so in the release notes for the replacement version so
the gap in the sequence is explained rather than silently skipped.

## 4. If the bad build reached a Marlin image

A signed Marlin image promotion is a separate, heavier-weight publish than
the `.deb` (see item 3 in [the public roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#public-roadmap) — update/rollback
evidence for the admitted image is explicitly tracked as still-open
qualification work, not yet a solved problem). If a bad Tuna Desktop
package made it into a promoted Marlin image digest:

- Do not try to hand-patch the running image. Treat this the same as any
  other bad Marlin promotion and follow whatever rollback path the image
  pipeline that promoted it documents (that pipeline, not this repository,
  owns the bootc image's own rollback — check its runbooks, not this one).
- File or update an issue here noting which Tuna Desktop tag was in the bad
  digest, so the image-side rollback can cite the right component version
  when writing its own incident notes.
- For the user, `sudo bootc rollback` and a reboot return to the previous
  deployment. [upgrade-recovery.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/upgrade-recovery.md) is the proof that
  this keeps their home, settings and shell state for a given pair of
  digests; run it on the previous image and the candidate before promoting.

## 5. Update the public-facing trail

- Regenerate `walkthrough-media/walkthrough.md` for the replacement tag:
  `scripts/tuna-capture --artifacts walkthrough-media --render-walkthrough
  vX.Y.Z+1`, then upload it with that release's replacement media and update
  the release-notes link. Do not stamp release links into the canonical
  `docs/walkthrough.md`; its manifest-generated feature tour has a separate
  [visual capture workflow](https://github.com/tuna-os/tuna-desktop/blob/main/docs/visual-capture-refresh.md).
- Add a line to the replacement version's release notes under "Known
  limitations" or a new "Corrections" heading naming what was wrong with
  the withdrawn tag, so the gap in the version sequence has a public
  explanation instead of looking like a skipped number.
- If the regression reached users before being caught (not just caught in
  review before download), consider whether it needs an entry in
  [docs/parity-ledger.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md) — a shipped-then-reverted
  regression against a GNOME 51 behavior is exactly what that ledger
  tracks, and it's easy to forget once the fire is out.

## What this does not cover

- Crash recovery at runtime (shell restart budgets, the recovery overlay,
  disconnect/reconnect, stale-revision snapshots) is a different problem:
  the recovery contract in `crates/compositor/tests/recovery.rs`, and on the
  published image the crash steps of [upgrade-recovery.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/upgrade-recovery.md).
  This document is about recovering from having published the wrong build
  in the first place.
- The Debian/Ubuntu package `.deb` rollback above does not apply to the
  Marlin bootc image's own update/rollback mechanism; its user-state proof
  is [upgrade-recovery.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/upgrade-recovery.md).
