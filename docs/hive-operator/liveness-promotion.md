---
sidebar_position: 3
title: "liveness promotion"
---

The watchdog (`hive-rotate.sh watchdog`: the `hive-watchdog`,
`hive-watchdog-reef`, `hive-watchdog-hanthor` CronJobs, every 5 minutes) and
the nudge backstop (`hive-nudge.sh nudge`: the `hive-nudge` CronJob, :13 and
:43) run in the `HiveSpoke` controller, gated by **one field per spoke**,
`spec.livenessMode`, independent of `spec.rotationMode`.

- **Observe** computes nothing.
- **Shadow** (every spoke today) runs both passes on schedule — the watchdog
  every `spec.liveness.watchdogIntervalMinutes` (5), the nudge every
  `nudgeIntervalMinutes` (30) — reads what bash reads (`/api/status`, the
  live pane via `GET /api/pane/<agent>?lines=60` for every agent that looks
  unhealthy or is mid-turn, the `governor:` block, `last_kick` ages) and
  records the exact pass in `.status.liveness` without acting:
  - `.watchdogPlanText` — the pass as the job prints it (a heal shows
    `restarted (would restart)` where bash shows the hive's answer);
  - `.watchdogPlan` — the actions (`restart`, `rotate-off`, `repair`,
    `effort`, `hygiene`, `wake`, `needs-human`) with reasons;
  - `.nudgePlanText` / `.nudgePlan` — this spoke's share of the nudge output
    (check-mode suffix ` — would nudge`), capped at 4 as an apply would be;
  - `.journal` — heal backoff per agent, stall clocks, pending provider
    resets, last hygiene. Kept **as if every action succeeded**, so the
    backoff ladder is warm and comparable with bash's at promotion.
- **Enforce** performs the same plan with the X-Hive-Internal token:
  `POST /api/restart/<agent>` (for agy/muse in the same exec that first
  reopens the shared first-run files), `POST /api/effort/<agent>/<e>`, the
  hourly/wizard shared-home permission repair exec, mismatch repair through
  the rotation actuator's atomic `PUT /api/config/agent/<a>/models`, and
  `POST /api/kick/<agent>` for overdue agents.

Two actions are **placements**, and placement belongs to rotation:

| action | applied when | otherwise |
|---|---|---|
| rotate-off (auth / shell / muse approval prompt → a positively measured healthy rung, `rotation.ChooseRungHealthy`) | `rotationMode: Enforce` **and** `livenessMode: Enforce` | reported (`error: reported only: rotationMode is Shadow`) and the agent is restarted in place |
| renewal wake-up (an exhausted provider's reset passed) | `rotationMode: Enforce` (rotation becomes due immediately; next reconcile applies) | reported; the bash rotate re-decides on its own 20-minute tick |

Mismatch repair (a backend/model pair that cannot launch → its own tier's
rung on the SAME backend) and effort fixes are liveness actions: only the
watchdog ever did them.

## What was ported (parity checklist)

| bash (live, 2026-10-01) | operator |
|---|---|
| `pane_classify_text`: ready / wizard / auth / approval / shell / empty, chrome-anchored patterns, wizard > auth > approval > shell | `liveness.Classify` |
| re-read the live pane (`GET /api/pane`) for agents not ready in the snapshot or `busy=working` | `liveness.NeedsLivePane` + controller fetch (reads, all modes) |
| `pane_stalled`: `busy=working` and an identical pane for ≥ 60 min; skipped when the `/api/status` snapshot is > 900 s old (with bash's line) | `liveness.Watchdog`, journal `.panes` |
| `watchdog_backoff_s`: 5, 10, 20 … 120 min; reset on first `liveness ok` | `liveness.BackoffSeconds`, journal `.heals` |
| at most 3 restart-causing actions per pass (repair, effort, heal); 170 s time budget | `Policy.MaxMutations`; executor time budget |
| `repair_mismatch` (never a pinned agent) | `rotation.MismatchRepair` |
| agy `--effort` drift (`effort_change`) | `liveness.EffortChange` vs v6's `reasoningEffort` |
| copilot device flow → NEEDS HUMAN LOGIN, never restarted | `KindHuman`, condition message |
| `choose_rung_healthy`: measured, not exhausted, not current, escape hatch, Kiro cadence guard, sort tie-break QUIRK | `rotation.ChooseRungHealthy` |
| `heal_restart` agy/muse perms + restart in one exec | `boundAPI.Restart(fixPerms)` |
| `gemini_hygiene` hourly and on a wizard heal | `KindHygiene`, journal `.hygieneAt` |
| renewal wake-up via `resets.d` (incl. the QUIRK: a reading already below threshold clears its own stamp) | journal `.resets`, `KindWake` |
| nudge: longest cadence across all governor modes × 2, floor 30 min, ≤ 4 successful kicks per spoke, skip paused / on-demand / disabled, never past `BUDGET_EXHAUSTED` | `liveness.LongestCadences`, `liveness.Nudge`; `HiveSpoke.status.budgetExhausted` |

Known, deliberate differences (shadow-diff classes, not logic):

- **Pins.** The live watchdog CronJobs do not set `HIVE_ROTATE_PIN`, so bash
  would repair or rotate-off a pinned agent (school/supervisor). The
  operator honours `spec.pins`.
- **Effort source.** Bash compares against the effort it last *set* (a file
  on the ops PVC); the operator against v6's own `reasoningEffort`.
- **Nudge order.** Bash's awk walks its hash in an unspecified order before
  applying the per-spoke cap; the operator uses first appearance in the
  governor block. Differs only with > 4 overdue agents on one spoke.
- **Nudge footer** is per spoke (bash prints one for the fleet).

## Prerequisites

1. Deploy this build (CRD + operator). Every spoke stays `livenessMode:
   Shadow` (the default; `config/samples/fleet.yaml` sets it explicitly).
2. Soak at least 24 h and diff, read-only:

   ```sh
   export KUBECONFIG=~/.kube/config-aws-migration
   go run ./cmd/hive-shadow-diff --live --liveness     # exit 0 = no unexplained difference
   # or against the deployed operator's own pass:
   kubectl -n hive logs job/<newest hive-watchdog-hanthor job> > wd.log
   kubectl get hivespoke hanthor -o json > spoke.json
   go run ./cmd/hive-shadow-diff --watchdog-bash wd.log --spoke spoke.json
   ```

   The two sides never see the same instant and both jobs act, so each
   difference is classed: `skew/acted` (bash healed or kicked it and the
   operator now sees the result), `skew/time` (it became unhealthy/overdue
   after the job), `journal` (backoff lines), `logic` (blocks promotion; add
   a golden test from the log before fixing). The soak should include at
   least one real heal (stalls happen several times a day across the fleet).

3. **Promote rotation first** for the spoke (docs/rotation-promotion.md).
   Liveness in Enforce with rotation still in Shadow works, but its
   rotate-offs and renewal wake-ups are only reported.

## Promote one spoke (hanthor first, then reef, then school)

The watchdog is per spoke; one change, applied together and committed to the
dotfiles manifests (`talos-k8s/hive/ops/cronjobs.yaml`) in the same PR:

```sh
kubectl patch hivespoke hanthor --type merge -p '{"spec":{"livenessMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-watchdog-hanthor -p '{"spec":{"suspend":true}}'
```

**hive-nudge is fleet-wide.** It loops over `HIVE_NUDGE_NAMESPACES`
(default `hive hive-reef hive-hanthor`; the live CronJob does not set it), so
narrow it in the same change, and suspend it with the last spoke:

```sh
# hanthor promoted:
kubectl -n hive set env cronjob/hive-nudge HIVE_NUDGE_NAMESPACES="hive hive-reef"
# reef promoted:
kubectl patch hivespoke reef --type merge -p '{"spec":{"livenessMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-watchdog-reef -p '{"spec":{"suspend":true}}'
kubectl -n hive set env cronjob/hive-nudge HIVE_NUDGE_NAMESPACES="hive"
# school promoted (last): nothing left for bash
kubectl patch hivespoke school --type merge -p '{"spec":{"livenessMode":"Enforce"}}'
kubectl -n hive patch cronjob hive-watchdog -p '{"spec":{"suspend":true}}'
kubectl -n hive patch cronjob hive-nudge -p '{"spec":{"suspend":true}}'
```

Verify within one watchdog interval (5 min) and one nudge interval (30 min):

```sh
kubectl get hivespoke hanthor -o jsonpath='{range .status.conditions[*]}{.type}={.status} {.reason}: {.message}{"\n"}{end}'
#   WatchdogPassed=True Planned: N agent(s) healed (Enforce)
kubectl get hivespoke hanthor -o jsonpath='{.status.liveness.watchdogAt} {.status.liveness.nudgeAt}{"\n"}'
kubectl get hivespoke hanthor -o jsonpath='{.status.liveness.watchdogPlanText}' | tr ',' '\n'
kubectl get hivespoke hanthor -o jsonpath='{.status.liveness.watchdogPlan}'
kubectl get hivespoke hanthor -o jsonpath='{.status.liveness.journal}'
```

`LivenessEnforced=False NoActuator` means the hive API was unreachable that
reconcile; it planned as Shadow and retries.

## Rollback (per spoke)

```sh
kubectl patch hivespoke hanthor --type merge -p '{"spec":{"livenessMode":"Shadow"}}'
kubectl -n hive patch cronjob hive-watchdog-hanthor -p '{"spec":{"suspend":false}}'
kubectl -n hive set env cronjob/hive-nudge HIVE_NUDGE_NAMESPACES="hive hive-reef hive-hanthor"
# school: also  kubectl -n hive patch cronjob hive-nudge -p '{"spec":{"suspend":false}}'
```

Bash starts with whatever backoff files it last wrote on the PVC (possibly
old): at worst one extra heal of an agent the operator was backing off.

## Caveats while spokes are mixed

- Never run both watchdogs for one spoke in Enforce: two healers double the
  restarts, and v6 counts every one into its crash-loop breaker.
- The bash watchdog of an un-promoted spoke still runs a full bash rotate
  apply on a renewal wake-up (see docs/rotation-promotion.md).
- `HIVE_WATCHDOG_*` / `HIVE_NUDGE_*` overrides on a CronJob must be carried
  into `spec.liveness` before promotion (none are set today).
