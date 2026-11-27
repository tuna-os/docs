---
sidebar_position: 32
title: "troubleshooting"
---

Candidates do not form published supply. Keep failed tries and check each
architecture against its native base before publication.

## Pinned factory runner exits 126

**Symptom:** A consumer checks out an immutable commit, then reports
`env: 'scripts/run-package-factory-cell.sh': Permission denied`.

**Cause:** Git tracks the runner as mode `100644` in commit
`c0998b94bd7b4fbc67360c239e439de6debf539b` and its parent.
Factory workflows use `bash` and do not need an executable file.
Consumers that execute the script through its shebang need that mode.

**Fix:** Track the runner as executable (`100755`).
Consumers can execute it directly or use Bash.
Pin a commit with this fix. Do not change source hashes or chmod downloaded sources.
The Bats test executes the runner through `env`.

## Old partial RPMs in a new candidate

**SYMPTOM:** The candidate initializer reports that its repository is not empty.
[CI run 38073315753](https://github.com/tuna-os/tunaos-packages/actions/runs/38073315753)
failed at this check.

**CAUSE:** The workflow restored RPMs from an earlier try. A new try
uses a new key for signatures; those RPMs lack authentication as inputs.

**FIX:** Initial Alma builds start with an empty repository. To resume, you need
an authenticated snapshot of immutable dependencies. Keep the earlier artifacts.

## Kitten release package

**SYMPTOM:** Mock cannot find `almalinux-release` in Kitten BaseOS.
[CI run 38074178800](https://github.com/tuna-os/tunaos-packages/actions/runs/38074178800)
reached the native repository and failed during bootstrap.

**CAUSE:** Kitten supplies `almalinux-kitten-release`.

**FIX:** Use that package in both Kitten architecture configurations.

## Missing CPU proof

**SYMPTOM:** A signed installation succeeds, but CPU collection fails.

**CAUSE:** Installation does not prove that every binary and linked dependency
satisfies the requested CPU baseline.

**FIX:** Read `collection.json` and `verifier-result.json` in the CI evidence
artifact. Repair the reported input or dependency; retain the failure gate.
The public key, signed RPM bytes and compiler observation must survive failure.

## Mock bootstrap cannot read its candidate key

**Symptom:** Native Alma canaries report Curl37 for `/keys/candidate-public.gpg`
([run 38080413978](https://github.com/tuna-os/tunaos-packages/actions/runs/38080413978)).

**Cause:** Mock excludes the bind-mount plugin from bootstrap. A copy of that configuration
does not expose the key there. Mock mounts the roots of local repositories before DNF starts.

**Fix:** Stage only the public key in the signed local repository and reference
that mounted path. Keep the checks for package and metadata signatures enabled. Native CI
canaries must prove this repair.

## COSMIC Debian session installs without its desktop

**Symptom:** The session package installs, but its required siblings are absent.

**Cause:** `cosmic-session` declared empty Debian and Ubuntu runtime lists.
The single-package gate could not resolve siblings, so the declaration omitted
them. That did not prove a usable desktop.

**Fix:** Declare the versioned session siblings and launcher dependencies in
control files for Debian. Both queues include all providers. The complete candidate
installation must pass with signatures before this supply becomes ready.

## Snapshot artifact lookup fails

**Symptom:** [Resume run 38081590705](https://github.com/tuna-os/tunaos-packages/actions/runs/38081590705) fails before verification.

**Cause:** Repository-wide artifact metadata returns invalid JSON.

**Fix:** Query exact workflow and source runs, then their artifacts. Retain authentication and the shared request limit.

## Portable payload digest changes after extraction

**Symptom:** `just check` fails
`test_tideforge_intermediate.py::test_one_payload_digest_is_reused_by_two_target_plans`
with expected tree digest
`898945fe81d0a9aa5cd778e6cffb801cdca4b2a4a5fcffde88cdfbbc25836959`
but actual digest
`b71256f1f4aaf8dc42af9e95b3843f3b70e3869366167c0a8ae90cf31e6e3107`.

**Cause:** The archive that failed has three directories listed as `0775` and its
`built once\n` message as `0664`. The `tarfile` data filter of Python clears
group-write from the message and extracts it as `0644`. The filter also ignores
the permissions of archived directories and uses the umask of the extraction
process. The inventory includes permissions, so a byte-identical payload can
fail verification.

**Fix:** Verification and carrier extraction share `extract_payload`. It keeps
the normal `0777` permission bits after the filter checks path, link, file
type and ownership. Creation and extraction reject setuid, setgid and sticky
modes; the regression test for the consumer
stages `0775` directories and a `0664` file. It tests a different verifier umask
and read-only files. It also keeps the tests for unsafe archive
members. Do not replace the expected digest or drop modes from the
inventory.

## Source archives after an upstream rename

**Symptom:** The source URL still works, but its archive fails the hash check.

**Cause:** GitHub changed the root path in each archive after three repositories moved from `AvengeMedia` to `duxlabs-dev`.

**Fix:** Use the commit URLs in the recipes. Keep the hash check.

We restored the old root paths and ran `gzip -n -6`.
Each result matched its original SHA-256 hash.

We then compared each commit archive with its original archive.
We compared paths without the root prefix.
File bytes, types, modes, owners, times and link targets matched for every entry.
The recipes retain their versions, releases and targets.
A future repository rename can still change archive paths.

| Package | Original SHA-256 | Commit | Entries |
| --- | --- | --- | --- |
| `danksearch` | `9454a2935c149ca3eb64106d59c266f513daff90438bac8b58e3a66b477521a9` | `1269b4688cc94cbd271e1cbbf19a6e7caa2293de` | 65 |
| `dgop` | `afd2f9542ce25c739b13d6213fdfbc5493bce537d5afec309b4df945e318ff1a` | `ac77511bbb9ae52ae8f04b9d7e15116a4d4838eb` | 131 |
| `dms-cli` | `2fa4fccb9e3fd259fb5e2c8d6e5fe329096f893ca6b8ac9766c699061e0b347c` | `74896fb87cb9e4bb866dbabcfd754e3e649ad0c7` | 1804 |
