---
sidebar_position: 5
title: "rotation promotion"
---

Rotation (`hive-rotate.sh`) and pacing (`hive-pace.sh`) move into the
`HiveSpoke` controller together, gated by one field: `spec.rotationMode`.

- **Shadow** (every spoke today) computes the full plan every reconcile —
  `.status.rotationPlanText`, `.status.contributorPlanText` (primary only),
  and, every 20 minutes, the fleet-wide `.status.pacePlanText` — and applies
  nothing.
- **Enforce** applies the same plan for *that spoke's agents only*: one atomic
  `PUT /api/config/agent/{name}/models` per placement (X-Hive-Internal token),
  `pause`/`resume` for strands, at most once per `spec.rotation.intervalMinutes`
  (20, the CronJob cadence). Pace notches are applied for that spoke's agents,
  with one notch per provider per 20 minutes across all Enforce spokes (the
  pool's `.status.pace.lastActuation`).

Promotion is **per spoke**: hanthor first, then reef, then school (the
primary, which also owns the contributor replicas and the
`hive/hive-provider-usage` publication). Each step changes the spoke and
retires that spoke's share of the bash jobs **in the same change**. Two
controllers actuating the same agents fight: that is how reef's sec-check was
restarted ~25 times in one evening when pace and rotate disagreed.

## What moves, what stays

| bash | after promotion of spoke X |
|---|---|
| `hive-rotate-X` (apply, */20) | suspended — operator rotation for X |
| `hive-pace` (5,25,45, every namespace in `HIVE_PACE_NAMESPACES`) | X removed from `HIVE_PACE_NAMESPACES`; suspended with the last spoke |
| `hive-watchdog-X` (*/5) | **stays** until X's `livenessMode` is promoted ([liveness-promotion.md](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md)) — see caveats |
| `hive-nudge` (:13,:43, every namespace in `HIVE_NUDGE_NAMESPACES`) | stays; narrowed per spoke by liveness promotion, not rotation |
| journals on the `hive-ops-state` PVC (`stranded`, `pace-demoted`, `kiro-evict`, `canary-cool-*`) | X's rows live in `HiveSpoke X .status.journal`; pace-demoted rows are seeded from the live placement at promotion (condition `PaceJournalSeeded`) |
| `hive/hive-provider-usage` publication (primary rotate) | the operator republishes it once **school** is in Enforce |
| contributor replica scaling (primary rotate) | the operator, once **school** is in Enforce |

## Prerequisites (once)

1. Deploy this operator build with the new CRDs and the pools. The hive-usage
   (ccusage) sidecar is **not** needed — do not apply
   `config/usage/hive-usage-patch.yaml` (it restarts the hive pods):

   ```sh
   kubectl apply -f config/crd -f config/rbac -f config/manager
   kubectl apply -f config/usage/usagepools.yaml      # kiro anthropic openai google meta
   kubectl apply -f config/samples/fleet.yaml         # every spoke Shadow
   ```

2. Let it soak in Shadow. Each pool needs history before it has a verdict:
   ≥ 1 h of samples for the generic fit, ≥ 20 min for the Kiro budget. Check:

   ```sh
   kubectl get usagepools -o custom-columns=NAME:.metadata.name,READING:.status.rotationReading.note,PACE:.status.pace.verdict
   kubectl get usagepool kiro -o jsonpath='{.status.pace.kiroBudget.line}{"\n"}'
   kubectl -n hive logs job/<newest hive-pace job> | grep '^kiro budget'
   ```

3. Shadow diff must be clean on consecutive ticks (at least 24 h, including at
   least one tick where pace or rotation actually moved something):

   ```sh
   export KUBECONFIG=~/.kube/config-aws-migration
   go run ./cmd/hive-shadow-diff --live          # read-only; exit 0 = identical
   # or per spoke against the deployed operator's own status:
   kubectl -n hive logs job/<newest hive-rotate-hanthor job> > bash.log
   kubectl get hivespoke hanthor -o json > spoke.json
   go run ./cmd/hive-shadow-diff --bash bash.log --spoke spoke.json
   ```

   Classify every difference before promoting (DESIGN.md §7): snapshot skew
   (`/api/status` lags; `--live` undoes a newer pace job's moves for you),
   ladder (the hive-tiers AA cache on school), or logic. Only logic blocks.

## Promote hanthor

One change, applied together (and committed to the dotfiles manifests —
`talos-k8s/hive/ops/cronjobs.yaml` — in the same PR, or the next `kubectl
apply` of the ops manifests reverts it):

```sh
kubectl patch hivespoke hanthor --type merge -p '{"spec":{"rotationMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-rotate-hanthor -p '{"spec":{"suspend":true}}'
kubectl -n hive set env cronjob/hive-pace HIVE_PACE_NAMESPACES="hive hive-reef"
```

Verify within one reconcile (2 min) and one rotation interval (20 min):

```sh
kubectl get hivespoke hanthor -o jsonpath='{range .status.conditions[*]}{.type}={.status} {.reason}: {.message}{"\n"}{end}'
#   RotationPlanned=True, RotationEnforced=True Applied, PaceJournalSeeded=True (if any agent sits demoted)
kubectl get hivespoke hanthor -o jsonpath='{.status.rotationPlanText}' | tr ',' '\n'
kubectl get hivespoke hanthor -o jsonpath='{.status.journal}'
kubectl get hivespoke hanthor -o jsonpath='{.status.pacePlan}'
kubectl -n hive-system logs deploy/hive-operator --since=30m | grep -i hanthor
```

`RotationEnforced=False NoActuator` means the hive API was unreachable that
reconcile; it plans as Shadow and retries.

## Promote reef

Same step:

```sh
kubectl patch hivespoke reef --type merge -p '{"spec":{"rotationMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-rotate-reef -p '{"spec":{"suspend":true}}'
kubectl -n hive set env cronjob/hive-pace HIVE_PACE_NAMESPACES="hive"
```

## Promote school (last)

school is the primary: its rotate job also scales the contributor Deployments
and publishes `hive/hive-provider-usage`; the operator takes both over. With
school promoted no namespace is left for bash pacing, so `hive-pace` is
suspended rather than narrowed:

```sh
kubectl patch hivespoke school --type merge -p '{"spec":{"rotationMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-rotate -p '{"spec":{"suspend":true}}'
kubectl -n hive patch cronjob hive-pace -p '{"spec":{"suspend":true}}'
```

Then check `kubectl -n hive get cm hive-provider-usage -o jsonpath='{.data.measured_by} {.data.updated_at}'`
moves every 20 min and `.status.contributorPlanText` matches what the bash job
used to print.

## Rollback (per spoke, same shape in reverse)

```sh
kubectl patch hivespoke hanthor --type merge -p '{"spec":{"rotationMode":"Shadow"}}'
kubectl -n hive patch cronjob hive-rotate-hanthor -p '{"spec":{"suspend":false}}'
kubectl -n hive set env cronjob/hive-pace HIVE_PACE_NAMESPACES="hive hive-reef hive-hanthor"
# school: also  kubectl -n hive patch cronjob hive-pace -p '{"spec":{"suspend":false}}'
```

What the bash side then sees:

- Agents the operator **stranded** are paused with trigger `dashboard-api`;
  bash has no stranded row for them, so its auto-resume resumes them, and its
  placement re-strands them if the provider is still exhausted. Self-healing.
- Agents the operator's pacer **demoted** have no row in bash's
  `pace-demoted`: bash rotate reads a demoted T1 agent as off-tier and moves
  it back onto a T1 rung on its next tick (an effective restore). To keep the
  demotion, append `<ns>/<agent>|<backend>|<model>` rows from
  `.status.journal.paceDemoted` to `/state/hive-rotate/pace-demoted` first.
- `.status.journal` stays on the spoke; a later re-promotion reuses it (rows
  whose agent is no longer below the original rung are ignored).

## Known caveats while spokes are mixed

- **hive-watchdog-X keeps running until X's liveness is promoted**
  (`spec.livenessMode`, [liveness-promotion.md](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md)). Its
  healing is unaffected, but two of its paths place agents: the renewal
  wake-up runs a full `hive-rotate.sh apply` for X when a provider reset
  passes, and the auth/shell/approval rotate-off uses `choose_rung_healthy`.
  The planners agree (shadow diff), so the renewal apply makes the operator's
  placement a second time; the rotate-off is a watchdog decision the operator
  then keeps (a healthy in-tier rung is sticky). Promote rotation first, then
  liveness: the operator's own watchdog applies rotate-offs and renewal
  wake-ups only when `rotationMode` is Enforce too.
- **Kiro budget during the mixed window**: bash pace computes the budget over
  its namespaces' agents, the operator over the whole fleet but applies only
  its own spoke's share. Both see the same Kiro burn, so in one tick each may
  take its share of demotions; the next tick is `settling` for both (the burn
  is never fitted across the last actuation). At most one extra notch.
- **Generic pace**: one notch per provider per 20 min across *operator* Enforce
  spokes; bash pace may take its own notch for its namespaces in the same tick.
- The operator does not read the bash PVC: hive-tiers' AA cache rows
  (`tiers.tsv`, anthropic/openai only) are not in the ModelLadder. They affect
  only agents placed on claude/codex rungs on school; add them to
  `ModelLadder.spec.builtin` (or set `benchmarkURL`) if school gains such
  agents before promotion.
