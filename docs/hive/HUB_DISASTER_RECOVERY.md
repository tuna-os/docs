---
sidebar_position: 5
title: "HUB DISASTER RECOVERY"
---

How to back up the Hive hub and its spoke fleet, and how to rebuild everything
from zero after a catastrophic loss.

---

## ⚠️ Read this first

### 1. `HIVE_BACKUP_KEY` must be escrowed OUTSIDE the cluster

Backups use AES-256-GCM with `HIVE_BACKUP_KEY`. **The backup is worthless if
the key stays in the failed cluster.** Store it in a password manager or an
offline copy.

There is no key-recovery mechanism. A lost key means an unreadable archive.

```bash
openssl rand -hex 32     # generate; store the output OUT OF BAND
```

The key is deliberately **independent of `/data/saas/hmac.key`**. `hmac.key`
is part of the backup payload. Do not derive the backup key from it. The archive
would fail to decrypt after the disaster.

### 2. `hmac.key` is a single point of failure for all user tokens

`/data/saas/hmac.key` (32 bytes) is the AES key for **every** user's
`encrypted_token` (see `encryptToken`/`decryptToken` in `pkg/hub/saas.go`).
There is no KMS, no escrow, no second copy anywhere.

**If `hmac.key` is lost, all ~88 users' stored GitHub tokens become permanent
ciphertext.** Every user must authorize again through OAuth. No restore
procedure can recover the key. This backup prevents that outcome.

### 3. A spoke boots from `hive.yaml.runtime` — the overlay is merged only when there is none

> **Corrected twice.** This section first said that `copy-config` restores
> `/data/hive.yaml.runtime` and that this one file brings a spoke back. The
> init container does that on only 3 of 51 live hives. It then said the
> dashboard overlay is the layer that wins on every boot. The main container
> contradicts that: it boots from `/data/hive.yaml.runtime` whenever the PVC
> holds one, and merges the overlay only when it does not. Restore both files,
> from the same backup. See "What the hive boots from" below.

The fleet runs **two different `copy-config` variants**, baked into each
spoke's Deployment at provision time and never migrated.

| Variant | Init-container behaviour | Hives |
|---|---|---|
| **A/B — `.runtime` wins** | restores `/data/hive.yaml.runtime` over the seed | **3**: `kubestellar-console`, `projectbluefin-knuckle`, `aslom-hive-agent` |
| **C — seed wins** | copies the ConfigMap seed; merely *echoes* whether `hive.yaml.runtime` exists | **48**: everything else (15 on hive-oke, 33 on vllm-d) |

Variant C, which is what new hives get:

```sh
cp /etc/hive-seed/hive.yaml /etc/hive/hive.yaml && echo configmap-copied
if [ -f /data/hive.yaml.runtime ]; then echo runtime-config-exists-for-recovery
elif [ -f /data/hive.yaml.bak ]; then echo legacy-runtime-config-exists-for-recovery; fi
```

Note it only *reports* the runtime config. It never restores from it.

> **Naming.** Before the rename, this file used `hive.yaml.bak`; it now uses
> `hive.yaml.runtime`. Writers use the new name. Readers accept the legacy name.
> No code renames or deletes the legacy file on a PVC. A hive that has not saved
> since the upgrade still has `hive.yaml.bak` and boots from it.

> Backups capture both names. During recovery, copy the name that the archive
> contains to `hive.yaml.runtime`.

> Outside Kubernetes — Docker, Podman, LXC, or a bare host binary — no
> Kubernetes pod selects this branch. This file is the boot-time source because
> no ConfigMap or overlay exists. To recover such a hive, restore its data
> volume, not the seed. See `src/docs/config-layering.md`.

**How to tell which variant a hive runs** — this is the only way to know:

```sh
kubectl -n hive-hosted-<id> get deploy -o jsonpath\
='{.items[*].spec.template.spec.initContainers[?(@.name=="copy-config")].command}'
```

#### What the hive boots from

The `copy-config` init container is not the whole story. The main container
decides which file wins (`src/deploy/entrypoint.sh:387-418`).

**Steady state, in Kubernetes.** The entrypoint reads the PVC runtime config
first: `/data/hive.yaml.runtime`, or the legacy `/data/hive.yaml.bak` when only
that one exists. It copies that file over the ConfigMap seed and boots from the
result. It does **not** merge the dashboard overlay on this path. The log line
is:

```
[entrypoint] K8s mode — booting from runtime config /data/hive.yaml.runtime (ConfigMap is a seed, not merged)
```

**First boot, and a hive reprovisioned onto an existing PVC.** The PVC holds no
runtime config, so the entrypoint merges `/data/hive.yaml.dashboard` over the
ConfigMap seed (`src/deploy/entrypoint.sh:419-560`). The overlay wins for
`acmm_level` and the GitHub App credentials. The seed wins for `hub.is_public`.
The entrypoint then writes the merged result to `/data/hive.yaml.runtime`
(`src/deploy/entrypoint.sh:562`), so every later boot takes the steady-state
path above.

The ConfigMap seed stays small. In sampled hives it provides 4–11% of the
effective config and lacks top-level blocks (`policies`, `data`, `knowledge`,
`notifications`, `hive_id`). The state that matters is on the PVC.

#### Restore `hive.yaml.runtime` and the overlay together

**`/data/hive.yaml.runtime` is the file a restored spoke boots from.** A stale
runtime file on the PVC wins over a current overlay. Nothing reports the
conflict. The spoke starts, the entrypoint skips the overlay, and the
`dashboard overlay merged over ConfigMap seed` log line never appears.

Restore the runtime file from the same backup as the overlay. As an
alternative, delete the runtime file on the PVC. The next boot then merges the
overlay and writes a new runtime file.

`/data/hive.yaml.dashboard` is still required. It is the only layer that holds
a dashboard-installed GitHub App. The merge path reads it after you reprovision
a hive onto an existing PVC. See `src/docs/config-layering.md` for the
precedence order. Query `GET /api/config/provenance` on an active spoke to
identify the source for any field.

The two files are similar but not interchangeable. The overlay contains no
secrets by design: `dashboardOverlayBytes` replaces `HIVE_GITHUB_TOKEN` with
`${HIVE_GITHUB_TOKEN}` and clears the pod-env-derived `dashboard.auth_token`.
The runtime file copies the merged config and keeps those secrets. Live values
on `projectbluefin-knuckle` show the difference:

```
/data/hive.yaml.runtime        14609 B   auth_token: 55c076f9…
/data/hive.yaml.dashboard  14547 B   auth_token: ""
```

On a hive with no such env vars set the two files are byte-identical — but that
is incidental, not structural. **Capture both.**

### 4. A PVC-only backup is NOT restorable

Four Kubernetes Secrets live **outside** the hub PVC and are required:

| Secret | Without it |
|---|---|
| `hive-hub-secrets` | OAuth login broken for all users; Slack messaging disabled |
| `oci-api-key` | Hub cannot provision spoke storage or write backups |
| `hive-hub-kubeconfigs` | Hub cannot reach remote spoke clusters (vllm-d) |
| `hive-hub-tls` | Cert-manager reissues automatically (not fatal) |

`hive-backup` captures these automatically and **fails the backup** if any of
the first three is missing.

> **New hub credential?** Put it in the **existing `hive-hub-secrets`**
> Secret. Do not create another Secret. That Secret already appears in
> `hubbackup.DefaultHubSecrets`, so backup and restore capture each new key
> at no extra cost. A new Secret disappears during recovery unless you also
> add it to `DefaultHubSecrets`.
>
> This is why the Slack bot token (`HIVE_HUB_SLACK_BOT_TOKEN`, see
> [Slack DMs](#slack-messaging)) is a key in `hive-hub-secrets`.

---

## What is backed up

| Included | Why |
|---|---|
| `/data/saas/**` | users, hives, keys, timeline, provisioning state |
| `/data/hub-registry.json` | the 50-hive fleet registry |
| 4 Kubernetes Secrets | credentials outside the PVC |
| per-spoke `hive.yaml.dashboard`, `hive.yaml.runtime`, `gh-app-key*.pem`, `hive-id` | rebuild each spoke |

**Deliberately excluded** as regenerable agent scratch: `nous/`, `home/`,
`beads/`, `logs/`. These are ~110MB of the hub's ~125MB and ~796MB per spoke.
Excluding them keeps an archive at roughly **300–400KB**, small enough to retain
30 daily copies and restore in minutes.

The excluded data contains agent history and learned context. It does not
affect the ability to run.

### What is NOT recoverable by any backup

- **GitHub App consent** — if someone creates a new App registration, each org
  owner must approve the installation again.
- **In-flight agent work** at the moment of loss.
- **`hmac.key` if it was never backed up** — see above.

---

## Backup

The `hive-hub` CronJob is opt-in and does not run by default. The kustomization
omits `src/deploy/k8s/backup-cronjob.yaml`; apply that file after you create
Secret `hive-hub-backup-key`. Put `HIVE_BACKUP_KEY` in the `backup-key` field
and check ConfigMap `hive-hub-backup-config`. The image follows the `stable`
release channel.

Each run builds and encrypts the archive, uploads it to OCI Object Storage,
downloads it, verifies checksums, and prunes old archives. A run fails when
self-verification fails. It does not report a good backup.

```bash
hive-backup run                    # to object storage
hive-backup run -local out.enc     # to a local file
hive-backup run -skip-spokes=true  # hub-only backup (no spoke exec)
hive-backup verify                 # verify newest stored archive
hive-backup list                   # list stored archives
hive-backup extract -file f.enc -dest ./restore
```

Environment:

| Variable | Meaning |
|---|---|
| `HIVE_BACKUP_KEY` | **required** AES-256 key (64-char hex or base64). No default; unset aborts. |
| `HIVE_BACKUP_BUCKET` | OCI Object Storage bucket |
| `HIVE_BACKUP_RETENTION` | archives to keep (default 30) |
| `HIVE_BACKUP_DATA_DIR` | hub data dir (default `/data`) |
| `HIVE_BACKUP_OCI_ENDPOINT` | Object Storage endpoint override (default: regional endpoint) |
| `HIVE_HUB_NAMESPACE` | hub namespace for Secret collection (default `hive-hub`) |
| `HIVE_KUBECONFIG_DIR` | per-cluster kubeconfigs for remote spokes (default `/etc/hive/kubeconfigs`) |
| `OCI_*` | credentials, from the existing `oci-api-key` Secret |

### Spoke gaps are recorded, not hidden

A spoke with zero replicas or no active pod has no readable data. The archive
lists such hives in `MANIFEST.json` under `spoke_errors`; `run` and `verify`
print the list. **Check this output.** A backup can succeed and still miss
spokes. The manifest shows the gap before you need the archive.

---

## Restore runbook — rebuilding from zero

Assumes: total loss of the hub cluster. You have the escrowed
`HIVE_BACKUP_KEY` and access to the OCI bucket.

### Step 0 — Get the archive

```bash
export HIVE_BACKUP_KEY=<from your password manager>
export HIVE_BACKUP_BUCKET=<bucket>
hive-backup list
hive-backup verify                      # confirm it is intact BEFORE relying on it
hive-backup extract -file <archive> -dest ./restore
```

`./restore` now contains `hub/`, `secrets/`, `spokes/`, `MANIFEST.json`.
Read `MANIFEST.json` → `spoke_errors` to see which spokes the archive missed.

### Step 1 — Provision a cluster

Create a Kubernetes cluster and the `hive-hub` namespace. Recreate the hub PVC
(RWX; on OKE this is an NFS/FSS-backed PV).

```bash
kubectl create namespace hive-hub
kubectl apply -f <your hub PVC manifest>
```

### Step 2 — Restore the Kubernetes Secrets

```bash
for f in restore/secrets/*.json; do
  kubectl apply -n hive-hub -f "$f"
done
```

You may omit `hive-hub-tls`; cert-manager reissues it.

### Step 3 — Restore the hub PVC data

Start a helper pod with the hub PVC mounted. Then stream the data into it:

```bash
kubectl apply -n hive-hub -f - <<'YAML'
apiVersion: v1
kind: Pod
metadata: {name: restore-helper}
spec:
  restartPolicy: Never
  containers:
  - name: shell
    image: busybox:1.36
    command: ["sh","-c","sleep 3600"]
    volumeMounts: [{name: data, mountPath: /data}]
  volumes:
  - name: data
    persistentVolumeClaim: {claimName: hive-hub-data-rwx}
YAML

kubectl wait --for=condition=Ready pod/restore-helper -n hive-hub --timeout=120s
tar cf - -C restore/hub saas hub-registry.json \
  | kubectl exec -i -n hive-hub restore-helper -- sh -c 'cd /data && tar xf -'
```

Verify before the next step, especially `hmac.key`:

```bash
kubectl exec -n hive-hub restore-helper -- sh -c \
  'ls /data/saas/users | wc -l; sha256sum /data/saas/hmac.key'
kubectl delete pod restore-helper -n hive-hub
```

### Step 4 — Start the hub

Deploy the hub. On boot it reads `/data/saas` and `/data/hub-registry.json`.

The restore keeps `hmac.key`, `hub-secret.key`, and `webhook-secret.key`. The
system does not regenerate them:

- existing user tokens still decrypt — **no mass re-OAuth**
- spokes still authenticate with their existing `hub-secret`
- GitHub webhooks still validate

**Hive IDs and vanity URLs stay stable** because they come from
`hub-registry.json` and `saas/hives/<id>/meta.json`, both restored verbatim.

### Step 5 — Rebuild spokes

For each hive in the registry, provision the namespace, PVC and Deployment as
normal, then restore its config **before first start** (or restart after):

```bash
HIVE=hosted-example-abcd
NS=hive-hosted-$HIVE
POD=$(kubectl get pods -n $NS --field-selector=status.phase=Running \
        -o jsonpath='{.items[0].metadata.name}')

# Restore BOTH config files, from the same backup. hive.yaml.runtime is what
# the main container boots from whenever the PVC holds one. The overlay is what
# a first boot merges over the seed when it does not, and it is where a
# dashboard-installed GitHub App lives. A stale runtime file silently beats a
# current overlay.
#
# Archives taken before the hive.yaml.bak -> hive.yaml.runtime rename carry the
# legacy name. Restore whichever the archive has, under the NEW name.
kubectl cp restore/spokes/$HIVE/hive.yaml.dashboard $NS/$POD:/data/hive.yaml.dashboard -c hive
RUNTIME_SRC=restore/spokes/$HIVE/hive.yaml.runtime
[ -f "$RUNTIME_SRC" ] || RUNTIME_SRC=restore/spokes/$HIVE/hive.yaml.bak
kubectl cp "$RUNTIME_SRC" $NS/$POD:/data/hive.yaml.runtime -c hive
kubectl cp restore/spokes/$HIVE/hive-id       $NS/$POD:/data/hive-id       -c hive
for k in restore/spokes/$HIVE/gh-app-key*.pem; do
  kubectl cp "$k" $NS/$POD:/data/$(basename "$k") -c hive
done

kubectl rollout restart deploy/hive -n $NS
```

Confirm the spoke used the restored config. The `copy-config` log says which
init-container variant ran (see §3). The log of the main container says what
the hive booted from:

```bash
kubectl logs -n $NS -c copy-config $POD
#   variant A/B  -> "override-used"     (runtime config restored)
#   variant C    -> "configmap-copied"  (seed copied; runtime config NOT read)

kubectl logs -n $NS -c hive $POD | grep '\[entrypoint\]'
#   runtime config restored (the normal case):
#     expect: "booting from runtime config /data/hive.yaml.runtime"
#   overlay restored with NO runtime config on the PVC:
#     expect: "dashboard overlay merged over ConfigMap seed"
#     NOT:    "dashboard overlay invalid, using ConfigMap seed as-is"
```

The best confirmation is to ask the spoke directly:

```bash
kubectl -n $NS exec $POD -c hive -- \
  curl -s localhost:3002/api/config/provenance | jq '.overlay_rejected, .fields'
```

### Step 6 — Re-link GitHub

Manual, and unavoidable:

- If the **OAuth App** still exists, restore `hive-hub-secrets`.
- If someone recreated the **GitHub App**, every org owner must re-approve the
  installation. Its private keys are in `restore/hub/saas/app-keys/` and
  `restore/spokes/*/gh-app-key*.pem`; reuse them if the App survived.
- Re-point DNS / ingress for `hive.hivecommons.dev`.

### Step 7 — Verify

- [ ] user count matches (`ls /data/saas/users | wc -l`)
- [ ] users can log in with the restored `hmac.key`
- [ ] hive count and vanity URLs unchanged
- [ ] spokes appear online and heartbeat to the hub
- [ ] `copy-config` logged `override-used` on A/B or `configmap-copied` on C
- [ ] The log of the hive container names the config it booted from: the
      runtime config on a normal restore, or the merged overlay when the PVC
      holds no runtime config
- [ ] a fresh `hive-backup run` succeeds against the rebuilt hub

---

## Automated vs manual

| Automated | Manual |
|---|---|
| Archive creation, encryption, upload | Escrowing `HIVE_BACKUP_KEY` |
| Integrity self-verification, retention | Cluster/PVC provisioning |
| Hub state + Secrets + spoke config capture | Applying Secrets and PVC data |
| Gap reporting via manifest | GitHub App re-consent, DNS |

---

## Testing status

The drill used production data in read-only mode. It wrote only to a throwaway
namespace and deleted that namespace afterward. Counts below reflect the drill
date. A larger fleet will produce different counts; that does not show a
restore failure:

- Backup of the real hub: **423 files, all 50 spokes, all 4 Secrets**
- Archive is opaque ciphertext — no plaintext leakage
- The GCM tag rejects a bad key and bit flips
- Production and restored `hmac.key` bytes matched
- **All 88 user tokens decrypt after restore**
- Restored `hive.yaml.dashboard` and `hive.yaml.runtime` matched the live spoke
- The restored Secrets matched live values in a throwaway namespace
- A live pod received data from the Hub PVC: 88 users, 50 hives

**UNTESTED** — The drill did not simulate a production meltdown:

- Restore on a fresh, empty cluster
- Start the hub server with restored data (Step 4)
- Spoke re-adoption and heartbeat after restore (Step 5)
- GitHub App/OAuth re-linkage (Step 6)
- Scheduled in-cluster CronJob
- Upload to OCI Object Storage from inside the cluster
- An out-of-band check confirmed write permission with the hub credentials.
- The team has not tested the in-cluster upload path.

---

# Spoke self-service backup (owner-triggered)

This is a **second, complementary** backup. It differs from the fleet-wide hub
backup above. A spoke owner triggers it from the avatar menu on the spoke
dashboard (**Back up this hive**). The browser downloads an encrypted archive.

## Why it exists — and why it includes beads

The hub backup is config-only. It excludes `/data/beads`, `/data/nous`,
`/data/home`, and `/data/logs`. Across ~50 spokes, these paths total about
40GB. Nightly jobs would run too slowly, and recovery would take too long.
Issue #2318 records this trade-off.

A single owner can back up one hive on demand. That cost differs greatly. This
backup **includes `/data/beads`** — the agent work ledger that #2318 identifies
as the most painful documented loss. After a hub-only restore, agents return
with no record of work they found, claimed, deferred, or closed. This backup
preserves that record.

## What is captured

| Path | Why |
|---|---|
| `hive.yaml.dashboard` | The **overlay** — the writable layer a first boot merges over the seed (see below) |
| `hive.yaml.runtime` | The steady-state boot input; also the only copy that keeps env-derived secrets |
| `hive-id` | Hive identity as known to the hub |
| `hive-state.json` | Agent runtime state |
| `gh-app-key*.pem` | GitHub App private keys — **credentials** |
| `beads/<agent>/**` | The agent work ledger, one directory per agent |

Bead directories are **discovered, not hardcoded**. A production spoke had ten
(`architect`, `brainstorm`, `ci-maintainer`, `guide`, `outreach`, `quality`,
`scanner`, `sec-check`, `strategist`, `supervisor`), not the five named in
# 2318, so a fixed list would silently miss ledgers.

### What is excluded, and why

| Path | Size (measured) | Why excluded |
|---|---|---|
| `nous/` | **287MB** | Timestamped learned-context snapshots; regenerable and by far the largest directory |
| `logs/` | 32MB | Diagnostic, not state |
| `graph/`, `snapshots/`, `vaults/` | ~19MB | Derived/bulk artifacts |
| `prompt-history.jsonl` | 3.1MB | Diagnostic transcript |
| `audit.jsonl` | 860KB | A record *of* actions, not state needed to reconstitute the hive |
| `dashboard-sessions.json` | 1KB | **Live browser session tokens** — credentials with no restore value; restoring them would resurrect sessions that should have expired |
| `hive.yaml` | 16KB | The *stale* ConfigMap seed — not authoritative |

**Archive size: about 3–5MB before compression** on a measured production
spoke. Beads use 2.6MB; the whole PVC uses about 796MB.
The small archive streams to a browser and stays responsive.

## Capture `hive.yaml.runtime` and the overlay, not `hive.yaml`

The hub backup has the same silent trap.

`/etc/hive/hive.yaml` is **not** the file to back up. A sampled production
spoke had a root-owned copy that lagged the live config by days. The boot
process writes it from the PVC on each boot.

Capture these two files:

| File | Why |
|---|---|
| `/data/hive.yaml.runtime` | The file the main container boots from whenever the PVC holds one — the steady state on every hive, and the init-container source on variant A/B. Also the only copy that keeps env-derived secrets. |
| `/data/hive.yaml.dashboard` | The **overlay** — the only layer the dashboard writes. A first boot, and a hive reprovisioned onto an existing PVC, merges it over the ConfigMap seed. It is the only layer that holds a dashboard-installed GitHub App. |

They are similar but **not interchangeable**. The overlay has no secrets. A
later restore can silently lose the owner's settings when you back up the wrong
file. Tests enforce this.

## Encryption is mandatory

The archive contains private keys for the GitHub App. The archive always uses
AES-256-GCM and the same code path as the hub backup.

- The key comes from **governor config** (`governor.backup.key_file`). The hive
  owner sets it in the dashboard under **Governor Config → Security → Backup**.
  As a fallback, the spoke reads **`HIVE_BACKUP_KEY`**. No default exists.
- Hosted-spoke owners do not have access to the deployment environment. An
  environment-only key would block their backups (#4129).
- The service writes the value to `/data/secrets/backup_encryption_key` (mode
  `0600`). `hive.yaml` stores the path. APIs and logs never return the value.
- If no source supplies a key, the endpoint returns `412 Precondition Failed`
  and refuses the request. It never streams plaintext credentials to a browser.
- The key is **not in the archive** and cannot come from it. An artifact that
  includes its own key has no encryption. The owner must keep the key separate.
- The service returns `Cache-Control: no-store` and uses `POST` only. A
  cross-origin navigation or `<img>` tag cannot fetch the response.

The UI says that the service encrypts the file and omits the key. A
`412` response links the owner to the Governor Config panel to set the key. If
the owner clears the key, the endpoint still refuses. No path produces an
unencrypted archive.

## Authorization

**Owner-only**, enforced server-side on both `POST /api/backup` and
`GET /api/backup/status`, matching `handleConfigDownload` and
`handleSelfUpgrade`. Viewers and read-write members get `403`. Hiding the menu
entry for non-owners is UX; the server check is the boundary.

## Restore procedure

No restore button exists. Restore can disrupt a live hive, so an operator must
follow a documented procedure, not a one-click control. The archive uses the
hub format, so the same tooling reads it.

```bash
# 0. Decrypt and verify. Uses the SAME archive format as the hub backup,
#    so hive-backup verifies and extracts it unchanged.
export HIVE_BACKUP_KEY=<the key escrowed for THIS hive — the same value set in
                        Governor Config → Security → Backup, if that is where
                        it was configured>
hive-backup verify -file hive-spoke-backup-<id>-<ts>.tar.gz.enc
hive-backup extract -file hive-spoke-backup-<id>-<ts>.tar.gz.enc -dest ./restore

# Layout:
#   ./restore/MANIFEST.json
#   ./restore/spoke/{hive.yaml.dashboard,hive.yaml.runtime,hive-id,hive-state.json,gh-app-key*.pem}
#   ./restore/beads/<agent>/**

# 1. Identify the target spoke pod.
NS=hive-hosted-hosted-<org>-<repo>-<suffix>
POD=$(kubectl -n $NS get pods --field-selector=status.phase=Running \
        -o jsonpath='{.items[0].metadata.name}')

# 2. Scale down so agents are not writing beads while you restore them.
kubectl -n $NS scale deploy/hive --replicas=0
kubectl -n $NS wait --for=delete pod/$POD --timeout=120s
```

Then bring up a pod with the PVC mounted and copy the files back:

```bash
kubectl -n $NS scale deploy/hive --replicas=1
POD=$(kubectl -n $NS get pods --field-selector=status.phase=Running \
        -o jsonpath='{.items[0].metadata.name}')

# 3. Config FIRST. Restore BOTH, from the same backup: hive.yaml.runtime is
#    what the hive boots from whenever the PVC holds one, and the overlay is
#    what a first boot merges over the seed when it does not.
#    Pre-rename archives carry hive.yaml.bak — restore it under the new name.
kubectl -n $NS cp ./restore/spoke/hive.yaml.dashboard $POD:/data/hive.yaml.dashboard -c hive
RUNTIME_SRC=./restore/spoke/hive.yaml.runtime
[ -f "$RUNTIME_SRC" ] || RUNTIME_SRC=./restore/spoke/hive.yaml.bak
kubectl -n $NS cp "$RUNTIME_SRC" $POD:/data/hive.yaml.runtime -c hive
kubectl -n $NS cp ./restore/spoke/hive-id         $POD:/data/hive-id       -c hive
kubectl -n $NS cp ./restore/spoke/hive-state.json $POD:/data/hive-state.json -c hive

# 4. GitHub App keys. Mode 0600 — never world-readable.
for k in ./restore/spoke/gh-app-key*.pem; do
  kubectl -n $NS cp "$k" $POD:/data/$(basename "$k") -c hive
  kubectl -n $NS exec $POD -c hive -- chmod 600 /data/$(basename "$k")
done

# 5. The bead ledger.
for d in ./restore/beads/*/; do
  agent=$(basename "$d")
  kubectl -n $NS exec $POD -c hive -- mkdir -p /data/beads/$agent
  kubectl -n $NS cp "$d" $POD:/data/beads/$agent -c hive
done

# 6. Restart so the boot-time merge picks up the restored config.
kubectl -n $NS rollout restart deploy/hive
kubectl -n $NS rollout status  deploy/hive --timeout=300s
```

**Verify:** The dashboard loads and the hive ID matches. The owner's config
changes appear, not ConfigMap defaults. Agents show prior bead counts; the
ledger is not empty.

### Bead ownership

Bead directories use each agent's UID on the spoke (`hive-scanner`,
`hive-quality`, …). If agents cannot write ledgers after a restore, match
ownership to nearby directories. Do not weaken the mode.

## Testing status

**Verified:**

- Unit tests capture `hive.yaml.dashboard` and `hive.yaml.runtime` and exclude
  `hive.yaml`.
- For every discovered agent, unit tests capture its beads.
- Unit tests exclude `nous`/`logs`/`home`/`audit.jsonl`/`dashboard-sessions.json`.
- In the unit tests, App keys enter the archive, and the archive is opaque
  ciphertext.
- The tests reject a wrong key and bit flips.
- The tests need manifest digests with values; `Verify` checks the data.
- The build fails without a key.
- Tests record missing files; they do not omit them.
- For hostile hive IDs, tests keep them inside the filename.
- On both endpoints, handler tests return `403` for `read`, `read-write`,
  `write`, and `viewer`. They also test the three config endpoints.
- Handler tests return `412` with no key from any source and offer no download.
- Handler tests check the `no-store` header and an `.enc` attachment.
- Tests confirm that the backup succeeds and decrypts with a governor config key.
- Tests return `412` after the owner clears the key.
- Tests keep the key out of every response, `hive.yaml`, and stored config
  struct.
- `hubbackup.Extract` extracts both archives through one format and restore path.
- A production spoke supplied the layout, file divergence, bead names, and sizes.

**UNTESTED:**

- The team has not run the restore procedure against a live spoke.
- No real backup ran against a user's hive. Tests used temporary directories only.
- Tests did not cover a multi-MB browser download in a real browser.

---

## Slack messaging

The hub can send Slack DMs to one user, a hive owner, or every user. The
service gets recipients from the **existing** `slack_id` field in each user
record (`/data/saas/users/<GitHubUsername>.json`). Admins edit that field in
the Users panel.

### Credential

The bot token is read from the environment with **no default**:

| Variable | Source |
|---|---|
| `HIVE_HUB_SLACK_BOT_TOKEN` | key on the existing `hive-hub-secrets` Secret |

The token is a key in `hive-hub-secrets`, not a new Secret. It therefore belongs
to the DR-captured set (`hubbackup.DefaultHubSecrets`) and survives a restore.
**Never commit the token to this repository.** A previous leak forced a git
history scrub.

Add the key and keep the other keys:

```bash
kubectl -n <hub-namespace> patch secret hive-hub-secrets \
  --type merge \
  -p "{\"stringData\":{\"slack-bot-token\":\"$SLACK_BOT_TOKEN\"}}"
```

...and reference it from the hub Deployment:

```yaml
- name: HIVE_HUB_SLACK_BOT_TOKEN
  valueFrom:
    secretKeyRef:
      name: hive-hub-secrets
      key: slack-bot-token
      optional: true   # unset simply disables Slack messaging
```

The token needs the `chat:write` scope. A webhook will **not** work: a webhook is
bound to one channel at creation time and cannot DM a user.

If the variable is unset, the send endpoints return **503** naming the variable.
They never report a successful send that did not happen.

### Endpoints

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/saas/slack/user/{username}` | admin, or the user themselves | |
| `POST /api/saas/hives/{id}/slack` | hive owner or admin | messages the hive's owner |
| `POST /api/saas/admin/slack/broadcast` | **admin only** | requires confirmation |

Body: `{"message": "...", "dry_run": false, "confirm": "..."}`.

### Broadcast safety

A broadcast reaches every user with a `slack_id`. No caller can recall a
broadcast:

1. **Dry-run first.** `{"dry_run": true}` sends nothing. It returns the recipient
   count, the **names** it skips, a message preview, and an estimated duration.
2. **Confirm explicitly.** A real broadcast needs `"confirm": "SEND TO ALL
   USERS"`. The client must send this typed string; a boolean cannot trigger the
   broadcast by accident. Without it the request returns **409** and reports the
   blast radius.
3. **Slack sends one message per second in a background goroutine.** Slack
   throttles `chat.postMessage` at roughly 1/sec. A run for ~88 users takes
   about a minute and a half. The HTTP response returns the estimate at once.

### Users without a Slack ID are skipped VISIBLY

A user without a `slack_id` cannot receive a message. Each response reports the
count and names omitted users. A broadcast writes the full list to the hub log.
Silent drops are not acceptable: "sent to 61" while 27 people hear nothing is
worse than a clear failure.
