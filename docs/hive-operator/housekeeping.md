---
sidebar_position: 2
title: "housekeeping"
---

`HiveHousekeeping` (cluster-scoped, short name `hhk`) makes the operator the
single manager of the hive-ops CronJobs that stay shell scripts. `SharedAuth`
replaces one of them (`hive-shared-auth`) outright. After this change, every
hive-ops CronJob in ns `hive` is either owned by an operator CR or listed for
retirement.

| CronJob | schedule | managed by | end state |
|---|---|---|---|
| `hive-shared-auth` | `*/30` | `HiveHousekeeping/fleet`, then suspended | **replaced** by `SharedAuth/fleet` in Enforce |
| `hive-tiers` | 05:50 | `HiveHousekeeping/fleet` | suspend or drop. Its only consumer, school's bash `hive-rotate`, is suspended (#46). `ModelLadder.spec.benchmarkURL` reads the same AA feed natively. |
| `hive-inventory` | 05:40 | `HiveHousekeeping/fleet` | stays. `ModelLadder` reads `hive-model-inventory`. |
| `hive-pi-kiro` | :37 | `HiveHousekeeping/fleet` | stays |
| `hive-cli-update` | 05:10 | `HiveHousekeeping/fleet` | stays |
| `hive-repo-sync` | 03:17 | `HiveHousekeeping/fleet` | stays (see "Why not Go") |
| `hive-metrics` | :23 | `HiveHousekeeping/fleet` | stays |
| `hive-activity` | `*/5` | `HiveHousekeeping/fleet` | stays |
| `hive-rotate-{reef,hanthor}`, `hive-watchdog-{reef,hanthor}` | — | `spec.retire` | **delete**. Those spokes are in Enforce, and the jobs are suspended. |
| `hive-rotate`, `hive-watchdog`, `hive-pace`, `hive-nudge` | — | not listed (school's promotion, #46) | delete through `spec.retire` once school's promotion has soaked |
| `hive-data-janitor`, `hive-discord-*` | — | not hive-ops (other image and shape) | out of scope |

## Design

**The render is the desired state.** Each `spec.jobs[]` entry renders into a
complete CronJob. The rendered command is `bash /scripts/<script> <args>`. It
mounts the scripts ConfigMap at `/scripts`, `hive-ops-state` at `/state` and
an emptyDir at `/tmp`. It runs with the `hive-ops` SA, the hardened
security contexts, and the `workload-role: hive` node selector plus
control-plane toleration. `spec.template` holds what the jobs share. A job
overrides only schedule, args, env, resources, deadlines and suspend.

The render spells out every field the API server would otherwise default, so
"in sync" is a plain structural comparison. A job that matches is never
written to.

`config/samples/housekeeping.yaml` renders **identically** to all 8 live
CronJobs:

- `TestHousekeepingSampleRendersLive` checks it against the snapshot
  `internal/housekeeping/testdata/live-cronjobs-20261001T1915.yaml`.
- The live check is read-only: `go run ./cmd/hive-shadow-diff --live --housekeeping`.

**Modes**, per object and overridable per job (`jobs[].mode`):

- **Observe** records presence, schedule times and script hashes.
- **Shadow** (the default) renders and diffs. `.status.jobs[]` gets
  `state` (`Unadopted`, `Drifted`, `Missing`, `InSync`, `Conflict`,
  `Pruned`), `drift` (field paths) and the `action` Enforce would take. It
  writes nothing.
- **Enforce** works in three steps:
  1. **Adopts in place.** One Update adds the ownerReference
     (`HiveHousekeeping/fleet`, controller) and the label
     `hive.tunaos.org/housekeeping=fleet`. The object, UID and spec stay the
     same, so the Jobs it owns, which are its history, stay attached. If the
     spec already matches, adoption is metadata-only.
  2. **Converges drift.** Drift is reverted to the render, and the drifted
     fields are named in `action`. A missing job is created.
  3. **Prunes.** An owned job that is no longer listed is deleted.

  A CronJob controlled by anything else is `Conflict` and never touched.
  The controller watches the CronJobs it owns, so a hand edit is reverted
  within seconds. Unadopted jobs are re-diffed every `--housekeeping-interval`
  (10m).

**`spec.retire`** deletes legacy CronJobs. It deletes a job only in
Enforce, only while that job is suspended, and only when it has no active
Job. Anything else shows as `Blocked` with the reason. Shadow shows
`WouldDelete`.

**The scripts ConfigMap is observed, not owned.** `hive-ops-scripts` is
hashed per job into `.status.jobs[].script`. A missing key raises
`Degraded`. It is not rendered, for three reasons:

1. It is shared with the suspended rotate/watchdog/pace/nudge jobs and with
   `hive-lib.sh`.
2. Its live copy is ahead of dotfiles git. Today's authoritative source is
   the cluster, so a "source" the operator renders from would first have to
   be reconciled with it.
3. Embedding ~250 KB of shell in a CR or in the operator image would make
   the operator a release channel for scripts.

Script changes keep their current path (`kubectl apply` of the ConfigMap).
The hash in status makes each change visible.

### Why not Go (option b), except SharedAuth

- **tiers.** `ModelLadder` already has `benchmarkURL` and bands, the native
  path to the AA index. `tiers.tsv` fed only school's bash rotate, which is
  now suspended. Nothing is left to port. Suspend the job, or delete it with
  `jobs[]` (prune).
- **inventory.** Listing models means exec'ing each CLI inside each hive pod.
  A Go port would be the same execs with more code. `ModelLadder` already
  consumes its ConfigMap, and its stale-inventory-fails-open rule is what
  makes a late job harmless.
- **repo-sync.** It syncs governor repo lists with the GitHub App
  installation, which needs the app key and GitHub API. `HiveSpoke.spec.repos`
  is curated by hand for one spoke (hanthor) only. Making it authoritative is a
  behaviour change, not a port. Revisit once every spoke declares `repos`.
- **pi-kiro, cli-update, metrics, activity.** Pure side-effect jobs or data
  collectors. Owning the CronJob gives drift control and one place to
  configure them. A rewrite would add nothing.
- **SharedAuth** is the exception, because a controller already existed and
  was racing the bash script (next section).

## SharedAuth: parity and a safe Enforce

`internal/sharedauth` is `hive-shared-auth.sh` ported rule for rule. The
port fixed these gaps:

| gap in the old controller | now |
|---|---|
| fixed marker `.shared-auth-probe`, written by both sides. This caused the NOT SHARED alarms of 2026-09-24 | a unique marker per pass, `.shared-auth-probe.<stamp>`. A legacy marker is removed on cleanup. |
| default dirs included `.config/muse` (not shared on reef/hanthor, so it alarmed permanently) | the bash `HIVE_SHARED_AUTH_DIRS`: `.claude .gemini .codex` |
| exec failure counted as NOT SHARED | the bash's "could not read (exec failed) — not judged" |
| no agy statusLine repair | `repairAgyStatusLine` removes exactly `{"statusLine":{"command":"/status"}}` |
| ~15 execs per pass | batched like the bash: 1 write, 1 read per spoke, 1 cleanup, 1 credential/repair exec per spoke. Each exec has a 120 s timeout. |
| status re-queued itself: every status write triggered another pass (observedAt advanced every ~20 s live) | `GenerationChangedPredicate`; passes run every `--sharedauth-interval` (30m) or on spec change |
| terminating pod could be chosen | `hiveclient.Pod` skips pods with a deletionTimestamp, as `hive_pod` does |
| theme repair ran its own script | the bash's per-spoke script, with each repair switchable |

**The evidence:**

- `.status.report` is the pass in the bash's own output format.
- `TestGoldenLiveJob` reproduces job `hive-shared-auth-29847960`
  (2026-10-01 19:15Z) byte for byte.
- `TestDifferentialAgainstBash` runs the **live script** (testdata copy) and
  the port on identical local trees through a kubectl stub. It covers 7
  scenarios × check/reconcile: healthy, empty token, private copy plus no pod,
  null/missing theme, broken statusLine, missing credential, and an
  unwritable primary. It requires identical output, exit status, and files
  afterwards.

**The Enforce interlock.** `spec.incumbent` defaults to `hive/hive-shared-auth`.
While that CronJob exists and is not suspended, an Enforce SharedAuth runs as
Shadow. You can see this in `status.effectiveMode` and the `IncumbentActive=True`
condition. A read error also counts as active. Two writers on the shared
credential files cannot happen, whichever order the change is applied in.

## Cutover

All commands use `export KUBECONFIG=~/.kube/config-aws-migration`.

### 0. Deploy (no behaviour change)

```bash
kubectl apply -f config/crd          # new: hivehousekeepings; sharedauths gains fields
kubectl apply -f config/rbac         # cronjobs: get/list/watch/create/update/patch/delete
# bump config/manager/manager.yaml to this PR's sha image, then
kubectl apply -f config/manager
kubectl apply -f config/samples/housekeeping.yaml   # Shadow
kubectl apply -f config/samples/fleet.yaml          # SharedAuth dirs = bash's three; still Shadow
```

### 1. Shadow check

```bash
kubectl get hhk fleet -o yaml        # every job: state Unadopted, drift [] , script <hash>
go run ./cmd/hive-shadow-diff --live --housekeeping   # render vs live + SharedAuth report vs job log
```

Expect all 8 jobs `identical`. The SharedAuth report should match the newest
`hive-shared-auth` job log. Theme and agy repair lines are excluded, because
the bash runs `reconcile` and the Shadow operator runs `check`.

### 2. Adopt (keeps history)

```bash
kubectl patch hhk fleet --type=merge -p '{"spec":{"mode":"Enforce"}}'
kubectl -n hive get cronjob -l hive.tunaos.org/housekeeping=fleet   # all 8
kubectl -n hive get jobs | grep hive-metrics                        # history still there
```

The UIDs do not change. `kubectl get hhk fleet` then shows `InSync`. To promote
one job at a time, set `jobs[].mode: Enforce` on that job instead.

**From now on, change these CronJobs only through `HiveHousekeeping/fleet`.**
A `kubectl patch cronjob … suspend` or a re-apply of the old
`talos-k8s/hive/ops` manifests is drift, and the operator reverts it. In the
same change, drop the 8 CronJobs from `talos-k8s/hive/ops/cronjobs.yaml` in
dotfiles. Leave the ConfigMap there.

### 3. SharedAuth to Enforce: one change

Make both edits together:

```yaml
# HiveHousekeeping/fleet
  - name: hive-shared-auth
    suspend: true
# SharedAuth/fleet
  mode: Enforce
```

Applied in either order, the interlock holds repairs until the CronJob is
suspended. Then check:

```bash
kubectl get sauth fleet   # EFFECTIVE=Enforce
kubectl get sauth fleet -o jsonpath='{.status.conditions[?(@.type=="IncumbentActive")].status}'   # False
```

Once it has soaked, remove the job from `jobs[]` and Enforce prunes it.

### 4. Retire the superseded rotate/watchdog jobs

Hanthor (#45), reef and school (#46) run rotation and liveness in Enforce.
Their bash jobs are suspended. Uncomment `retire` in the sample (or patch it
in):

```yaml
  retire:
    - {name: hive-rotate-hanthor,   reason: "HiveSpoke hanthor rotationMode=Enforce"}
    - {name: hive-watchdog-hanthor, reason: "HiveSpoke hanthor livenessMode=Enforce"}
    - {name: hive-rotate-reef,      reason: "HiveSpoke reef rotationMode=Enforce"}
    - {name: hive-watchdog-reef,    reason: "HiveSpoke reef livenessMode=Enforce"}
    # after school's promotion has soaked (and only then):
    # - {name: hive-rotate,   reason: "HiveSpoke school rotationMode=Enforce"}
    # - {name: hive-watchdog, reason: "HiveSpoke school livenessMode=Enforce"}
    # - {name: hive-pace,     reason: "pace runs under rotationMode"}
    # - {name: hive-nudge,    reason: "nudge runs under livenessMode"}
```

In Shadow, `status.retired[]` shows `WouldDelete`. In Enforce it deletes the
CronJob and its old Jobs, with background propagation. A job that has been
unsuspended (a rollback) is `Blocked` and survives.

You can also delete them by hand:

```bash
kubectl -n hive delete cronjob hive-rotate-hanthor hive-watchdog-hanthor hive-rotate-reef hive-watchdog-reef
```

Once a job is deleted, rolling back to bash means re-applying it from
dotfiles (`talos-k8s/hive/ops/cronjobs.yaml`). The `hive-ops-state` journals
remain on the PVC.

### 5. hive-tiers

Its output has no reader now that school's bash rotate is suspended. To stop
it, set `suspend: true` on the job, or remove the job from `jobs[]` to prune
it. To feed the AA index into the ladder, set `ModelLadder.spec.benchmarkURL`
and `bands`. That is a separate, reviewed change, because it alters T1.

## Rollback and hazards

- **Never `kubectl delete hhk fleet` without `--cascade=orphan`.** The CronJobs
  are owned, so garbage collection deletes them and their Jobs. Use
  `kubectl delete hhk fleet --cascade=orphan`. GC then strips the
  ownerReferences and the CronJobs keep running as before.
- To stop the operator writing without releasing ownership, set
  `mode: Shadow`. The ownerReferences are inert without a controller acting
  on them.
- SharedAuth rollback: `mode: Shadow` plus `suspend: false` on
  `hive-shared-auth`.
- Changing `template` touches every job: one Update each. The pod template
  changes only for new Jobs. Running Jobs are not restarted.
