---
sidebar_position: 1
sidebar_label: "hive-operator"

status: unknown
---

A Kubernetes operator for the tuna-os Hive fleet: the rotation, healing,
credential-sharing and pacing that currently run as ~12 shell CronJobs, modelled
as CRDs and controllers, with Prometheus metrics and a fleet dashboard.

**Status.** Six controllers exist: `HiveSpoke`, `ModelLadder`, `SharedAuth`,
`HiveRelease`, `UsagePool` and `HiveHousekeeping`. Every controller defaults to
Shadow. Rotation, pacing, the watchdog and the nudge run in Enforce on all three
spokes, and their bash CronJobs are suspended (see
[`docs/rotation-promotion.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/rotation-promotion.md) and
[`docs/liveness-promotion.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md)). `HiveRelease` owns
the hive image version ([`docs/release.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/release.md)). The remaining
hive-ops CronJobs are owned by `HiveHousekeeping`, and `hive-shared-auth` is
replaced by `SharedAuth` ([`docs/housekeeping.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/housekeeping.md)).

## Why

The scripts work. What they lack is a way to *notice*. Every incident this
operator is meant to prevent was detectable and undetected, because each left
the obvious signals green:

| incident | what was green | the number that would have caught it |
|---|---|---|
| fleet idle 8 hours | pods Running, panes healthy, providers with headroom, credentials valid | `hive_agent_idle_seconds` |
| spoke at 190% of budget, governor suppressing kicks | everything — suppression is *correct* behaviour | `hive_budget_exhausted` |
| 4 agents on a dead credential for 2 days | the spoke had no rotation coverage at all | `hive_credential_present` |
| 609 evicted pods → ingress down | node `Ready`, EC2 status checks passing | node metrics + `hive_spoke_reachable` |

None needed a cleverer controller. They needed an alertable series. That is the
point of this project; the controllers are how the numbers stay honest.

## Model

- **`HiveSpoke`** — one hive instance: namespace, org, installation, repos,
  budget, pins, holds. Status carries agents, providers, budget and idle times.
- **`ModelLadder`** — the placement ladder, `rank(benchmark) ∪ builtin`, gated by
  what the backends actually offer.
- **`SharedAuth`** — one credential store shared across spokes, verified by
  write-through. It is `hive-shared-auth.sh` ported rule for rule, diffed
  against the live script. In Enforce it is interlocked on that CronJob being
  suspended.
- **`HiveHousekeeping`** — the hive-ops CronJobs that stay shell (tiers,
  inventory, pi-kiro, cli-update, repo-sync, metrics, activity), rendered from
  one spec. Enforce adopts them in place, which keeps their Job history, and
  reverts drift. It also retires superseded jobs.
- **`HiveRelease`** — the hive image version: a tag (`v6-latest`) or semver line
  resolved to a digest, rolled canary-first through the spokes with preflight, a
  health gate that restores agent placements reset by the swap, soak, rollback
  and blocklist. The operator is the single writer of the image; any other change
  is reported as drift and, in Enforce, converged back.
- **`UsagePool`** — one provider *account's* quota windows. Consumption comes from session logs (hive-usage sidecar + ccusage). The limit is configured or learned from the provider's own reading. Status carries remaining, burn rate and ETA, per agent.

### Reconcile modes

Every controller is `Observe` → `Shadow` → `Enforce`, per object.

`Shadow` computes the full action set and records it (status, events, metrics
with `applied="false"`) without applying any of it — diff that against the
incumbent CronJob before promoting. Only move to `Enforce` once the shadow
output matches, **and suspend the corresponding CronJob in the same change**.
Two control planes issuing the same mutations is worse than none.

## Things that are true and not obvious

Hard-won; a rewrite will reintroduce every one of these unless it knows them.

**Auth is two credentials, not one.** `X-Hive-Internal: <token>` authenticates
*reads*; every mutation returns `owner access required`, and forged
`X-Hive-User`/`X-Hive-Role` headers are rejected. Writes need
`Cookie: hive_session=<id>` — underscore, not hyphen; `hive-session-v1` appears
in the binary and is not the cookie name. Sessions come only from a GitHub
device-flow login and live in `/data/dashboard-sessions.json`.

**Don't judge session expiry locally.** The store writes the pod's UTC offset,
callers write their own, and a lexicographic ISO-8601 compare across differing
offsets silently discards live sessions near the boundary. Take the newest by
expiry and let the server decide.

**`/api/status` lags writes by more than a read cycle.** It reported the old
model long after both calls returned `ok`. The authority is
`hive.yaml.runtime` and `hive-state.json` (`model_override`/`backend_override`).

**Switching backend and model is two calls with no transaction.** Between them
the agent sits on the new backend with the old model — `codex/claude-sonnet-5`
cannot launch. Verify after, and expect to retry.

**Rotation's own pauses are byte-identical to an operator's.** Rotation
authenticates with the owner session cookie, so a strand records as
`reason: "manual pause"`, `trigger: "dashboard-api"`, `by: <session owner>`.
The `stranded` journal is the only discriminator — and its rows name the
provider *at strand time*, which placement then moves away from, so a stale row
can point at a provider the agent no longer uses.

**`agents_due: null` means budget suppression as often as it means a stall.**
Check `budget.BUDGET_EXHAUSTED` before concluding anything, and never nudge past
it: that spends money someone explicitly capped.

**The ConfigMap is read once, at first boot.** After that it is inert forever.
Runtime config lives on the PVC; a stale persisted file silently downgrades to
compiled-in bootstrap defaults.

**A benchmark feed does not cover every provider you run.** Measured: zero
DeepSeek entries, and the only Google entries were models the CLI does not
offer. Letting the feed *replace* the built-in ladder deletes whole providers.
Union them, de-duplicated on provider **and model** — scoring a provider says
nothing about whether the rungs you actually run were the ones scored.

**Bands are scale-specific.** Thresholds carried across benchmarks made T1 empty:
cut-offs from a suite topping out at 89.5 matched nothing on an index that tops
out at 58.2, and every T1 agent would have stranded.

**A rung the backend doesn't offer must never be placed.** An agent launched on
an id the CLI rejects dies at startup and reads as a dead agent, not a bad
config. Gate the ladder on the live model list.

**hostPath and subPath can silently resolve to the wrong filesystem.** On this
node the same hostPath string reached device `0:66` for an existing PV and
`0:59` — an empty `DirectoryOrCreate` — for a freshly created one. `ls` renders
both plausibly. Only a write-through test distinguishes them.

**`$HOME` inside pod exec is `/root`, not the agents' home.** Spell out
`/data/home`, or every check inspects the wrong directory and reports a healthy
fleet as broken.

**busybox `date -d` rejects the state file's timestamps** (fractional seconds
plus numeric offset), so age arithmetic belongs in the hive pod, which has GNU
date. A checker that silently `continue`s on every agent prints exactly what a
healthy fleet prints.

**A pool is an account, not a spoke.** `.claude`, `.gemini` and `.codex` are RWX PVCs mounted by every spoke, and the contributor pods use the Claude one too. Every spoke's sidecar reads the same store. Count it once, by content fingerprint. Mount identity differs per pod for the same directory (st_dev 65 vs 66), so it can't be used.

**ccusage measures spend, never headroom.** No log says how much quota is left. Remaining quota is limit − consumption. The limit is learned by calibrating against the provider's reading, and that is only as good as ccusage's pricing: an unpriced model counts $0. `claude-opus-5-5` zeroed a whole 5h window. Watch `Priced=False`.

**ccusage ignores symlinked files, and Antigravity is slow.** A "recent files" symlink view reads as empty. One pass over 500 agy conversation DBs takes about 3 CPU-minutes.

**Unmeasured ≠ exhausted.** An unmeasured provider must stay eligible; a
positive reading at 100 must evacuate. Conflating them either strands a healthy
fleet or keeps filling a dead pool. `-1` is the sentinel.

## Metrics

`hive_agent_idle_seconds`, `hive_agent_paused{trigger}`, `hive_agents{state}`,
`hive_provider_used_percent`, `hive_budget_{used,limit}_tokens`,
`hive_budget_exhausted`, `hive_shared_auth_consistent{namespace,dir}`,
`hive_credential_present`, `hive_spoke_reachable`, `hive_reconcile_mode`,
`hive_actions_total{applied}`, `hive_reconcile_errors_total`,
`hive_release_target_phase{phase}`, `hive_release_rollbacks_total`.

Usage (operator):
- `hive_provider_usage_ratio`, `hive_pool_used_percent{source}`, `hive_provider_reading_percent`
- `hive_provider_{consumed,remaining,limit,burn_per_hour}`, `hive_provider_exhaustion_eta_seconds`
- `hive_agent_usage`, `hive_usage_source_up`, `hive_rotation_plan_decisions`

Usage (sidecar, `:9464/metrics`):
- `hive_usage_tokens_total`, `hive_usage_cost_usd_total`
- `hive_usage_window_{cost_usd,tokens}`
- `hive_usage_collect_{success,duration_seconds}`, `hive_usage_unpriced_model`

Two alerts worth having on day one:

```promql
# a fleet that stopped for no reason (idle beyond any cadence, budget NOT the cause)
hive_agent_idle_seconds > 28800 and on(spoke) hive_budget_exhausted == 0

# a credential store that is no longer shared — a login will not propagate
hive_shared_auth_consistent == 0
```

## Develop

```bash
make generate manifests   # deepcopy + CRDs + RBAC, all via `go run`
make build test
make run                  # against your current kubecontext; dashboard on :8082
```

```bash
kubectl apply -f config/crd
kubectl apply -f config/rbac
kubectl apply -f config/manager
kubectl apply -f config/samples/fleet.yaml
kubectl apply -f config/samples/release.yaml   # HiveRelease, Shadow
kubectl apply -f config/samples/housekeeping.yaml   # HiveHousekeeping, Shadow (docs/housekeeping.md)
kubectl apply -f config/usage/usagepools.yaml
```

The usage sidecar (`cmd/hive-usage`, image `ghcr.io/tuna-os/hive-operator/hive-usage`, built from `Dockerfile.usage`) goes into each spoke's hive Deployment via `config/usage/hive-usage-patch.yaml`. To try it on copied logs:

```bash
go run ./cmd/hive-usage --once --home /path/to/copy/of/data/home --ccusage "$(which ccusage)" --state ""
```

### Shadow diff against the bash rotate job

```bash
kubectl -n hive logs job/<latest hive-rotate job> > bash.log
kubectl get hivespoke school -o json > spoke.json
go run ./cmd/hive-shadow-diff --bash bash.log --spoke spoke.json   # exit 0 = identical
```

See DESIGN.md §7 for how to classify a difference before calling it a bug.

## Roadmap

1. ~~`SharedAuth` (shadow)~~ — done, now at parity with the live script.
   Promote it to Enforce and suspend `hive-shared-auth` in one change
   ([`docs/housekeeping.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/housekeeping.md) step 3).
8. ~~Housekeeping~~ — `HiveHousekeeping` owns the remaining hive-ops CronJobs
   and retires the superseded rotate/watchdog jobs.
2. ~~`ModelLadder`~~ — done (PR #15): inventory gate, benchmark union, and
   band derivation are implemented. It stays read-only by design — rotation
   consumes `Status.Effective`, `ModelLadder` itself never applies anything.
3. ~~`Rotation` shadow controller~~ — done (PR #15): provider probes and
   placement now run in Shadow across all three spokes. Promoting to Enforce
   and suspending the legacy `hive-rotate*` CronJobs is tracked in
   [`docs/rotation-promotion.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/rotation-promotion.md).
4. ~~`HiveRelease` shadow controller~~ — done: image version with canary, gate,
   soak, rollback, blocklist and drift detection. Promote to Enforce and
   **delete** `hive/hive-upgrade` in the same change; see
   [`docs/release.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/release.md).
5. ~~`Watchdog`~~ — ported into the HiveSpoke controller under
   `spec.livenessMode` (Shadow): pane classification with a live-pane
   recheck, stall detection, exponential heal backoff, mismatch/effort
   repair, rotate-off through the rotation planner. Promote per spoke with
   [`docs/liveness-promotion.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md).
6. ~~`Nudge`~~ — the budget-aware kick backstop, same field and doc.
7. ~~`Pace`~~ — ported with rotation (branch `rotation/enforce-ready`): the
   hive-pace fit and the Kiro credit budget run under `rotationMode`; promote
   per spoke with [`docs/rotation-promotion.md`](https://github.com/tuna-os/hive-operator/blob/main/docs/rotation-promotion.md).
