---
sidebar_position: 4
title: "release"
---

`HiveRelease` (cluster-scoped, short name `hrel`) makes the operator the
**single writer** of the hive container image on every spoke (and optionally
the hub). It replaces the bash CronJob `hive/hive-upgrade`.

## Why

`hive-upgrade` tracked `^v5\.` GitHub releases and decided "ahead or behind"
by comparing semver against the `hive.tunaos.org/version` annotation. After the
fleet moved to v6 — which upstream publishes only as the moving tags
`v6-latest` / `edge`, with no semver — that comparison read v6 as behind, and the
job rolled every spoke back to v5 every night. The job is suspended. Two writers
of one field was the bug; `HiveRelease` is the one writer.

What changed relative to the script:

- **Tracks are tags or semver lines.** `track: v6-latest` resolves the tag to a
  digest; `track: ^v5\.` lists registry tags (paginated) and picks the newest
  non-prerelease match. The deployed image is always `repo:tag@sha256:…`.
- **Version labels come from the image, not the annotation.** For moving tags
  the label is `<line>-<revision12>` from the image's
  `org.opencontainers.image.revision` label (`v6-latest` → `v6-04d1e1ea4bdf`),
  matching the annotations already on the cluster.
- **Major-version guard.** A target is never moved across a major version
  (v5↔v6) unless the target sets `allowMajorChange: true` or a pin is given. A
  semver track also never downgrades a target that is ahead without a pin.
- **Drift.** The last image the operator wrote is `status.targets[].appliedImage`.
  Any other image on the Deployment is reported `Drifted` and, in Enforce,
  converged back through the normal gated rollout. The major-version guard is
  judged against the applied image, so an out-of-band v6→v5 swap *is* reverted.
- **Agent placements survive the swap.** v5↔v6 image swaps have reset agents'
  backend/model (the pi lane). Preflight snapshots every agent's
  backend/model/effort/paused from `/api/status` (overlaid with the
  `hive-state.json` override journal); after the rollout any changed placement is
  re-applied with the atomic `PUT /api/config/agent/{name}/models`, recorded in
  `status.targets[].placementsRestored`, and emitted as a `PlacementsRestored`
  event. An agent that disappears fails the gate. Paused state is compared but
  not changed (on-demand agents come back paused by design).

Carried over unchanged from the script: digest-not-tag; the node-architecture
gate (every node arch must be in the image index, or the target is `Held`);
preflight on the current image before any change; the rollback target written in
the same patch as the change; "could not measure" is never "unhealthy"; one
target at a time, canary first, with a soak; rollback + blocklist + stop on
failure; cooldown after a rollback.

## Modes

| mode | does |
|---|---|
| `Observe` | resolves desired, reports each target's current image and phase |
| `Shadow` (default) | also reports the plan (`status.lastResult`, `WouldRollout` event, `hive_actions_total{applied="false"}`) |
| `Enforce` | rolls the plan |

## The rollout (Enforce)

Per target, in spec order, persisted in `status.rollout` so an operator restart
resumes exactly where it was:

1. **Preflight** — the *current* image must pass the gate. Otherwise nothing is
   changed, a `PreflightFailed` event is emitted, and the next attempt waits one
   poll interval. Snapshot agent placements; record the rollback image (the
   spec's digest, or the digest the pod actually runs).
2. **Patching** — one strategic-merge patch sets the image and the annotations
   `hive.tunaos.org/version`, `previous-image`, `previous-version`,
   `upgraded-at`, `managed-by=hive-operator` (and clears `rolled-back-*`).
3. **Rolling** — wait up to 7m for the new pod, then up to 3m for the gate:
   Deployment rolled out, pod Ready, no CrashLoop/ImagePull errors, in-pod
   `GET /api/health` = 200, every pre-upgrade agent still present, placements
   restored. Non-spoke targets (hub) use `healthURL` (HTTP 200) instead.
4. **Soaking** — re-check every minute for `soak` (default 10m): restarts above
   the post-gate baseline, crashloop, health. Two consecutive measured failures
   fail the soak. Then the next target.

## Rollback behaviour

A **measured** failure (rollout timeout, not ready, crashloop, restarts, health
≠ 200, an agent lost) at Rolling or Soaking:

- patches the target back to `previous-image`, restoring the previous version
  annotations and adding `hive.tunaos.org/rolled-back-from` / `rolled-back-at`;
- adds the digest to `status.blocklist`, so it is never rolled again (a moving
  tag is `Held` until upstream moves it);
- waits for the rollback to be healthy and re-applies snapshotted placements;
- marks the target `RolledBack`, sets `Degraded=True`, emits `RollingBack` and
  `RolledBack` events, increments `hive_release_rollbacks_total{reason="gate"}`;
- **stops the rollout**: later targets are never touched; earlier targets keep the
  version they passed their own gate on;
- sets `status.nextAttempt` to now + `cooldown` (default 20h).

If the rollback itself does not recover within 10m, the target is `Failed` with
`ROLLBACK DID NOT RECOVER` and the exact kubectl commands to look at.

If the gate **could not be measured** (exec/RBAC/API error, `/api/status` still
initializing), the target is left on the new image, marked `Failed` with
`NOT rolled back — unmeasured is not unhealthy` and its rollback target, and the
rollout stops. Nothing is blocklisted.

Alerting: the script posted to Discord; the operator emits Events, conditions
and metrics instead. Alert on

```promql
hive_release_target_phase{phase=~"RolledBack|Failed|Drifted"} == 1
increase(hive_release_rollbacks_total[1d]) > 0
```

## Pin, blocklist, unblock

```sh
# freeze the fleet on one image (bypasses the blocklist and the major guard);
# pinning an older image is how to roll the whole fleet back on purpose — it goes
# through the same canary, gate and soak
kubectl patch hiverelease hive --type merge -p '{"spec":{"pin":"v6-latest@sha256:<digest>"}}'
kubectl patch hiverelease hive --type merge -p '{"spec":{"pin":null}}'          # unpin

# never deploy a digest or version label
kubectl patch hiverelease hive --type json -p '[{"op":"add","path":"/spec/blocklist/-","value":"sha256:<digest>"}]'

# unblock something the operator blocklisted after a false alarm
kubectl edit hiverelease hive --subresource=status    # remove it from status.blocklist
# retry before the cooldown ends: remove status.nextAttempt the same way
```

`spec.pin` applies to targets that follow the default image line; a target with
its own `image`/`track` takes its own `pin`.

## Promoting to Enforce

1. Deploy the operator build that contains this controller, then the CRD and RBAC
   (`config/crd`, `config/rbac`), then `config/samples/release.yaml` (Shadow).
2. Watch for at least one window: `kubectl get hrel hive -o yaml`. Every spoke
   should be `Current` or `Pending` with the expected version, the hub `Held`,
   no `Unknown`/`Drifted`, `RegistryReachable=True`.
3. **In the same change**, set Enforce **and delete the hive-upgrade CronJob**.
   Suspending is not enough — a later `kubectl apply` of the old manifests would
   unsuspend it and two writers would fight over the image again:

   ```sh
   kubectl patch hiverelease hive --type merge -p '{"spec":{"mode":"Enforce"}}'
   kubectl -n hive delete cronjob hive-upgrade
   ```

   and remove `talos-k8s/hive/upgrade/cronjob.yaml` from the manifests repo in the
   same commit. The `hive-upgrade-state` ConfigMap, script ConfigMap, and RBAC
   can go afterwards.
4. To move the hub to v6, set `allowMajorChange: true` on the hub target.

To back out: set `mode: Shadow`. A rollout in progress then freezes where it is
(nothing is patched in Shadow); set Enforce again to let it finish or roll back.
`spec.suspend: true` stops all evaluation.
