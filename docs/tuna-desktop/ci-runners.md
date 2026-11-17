---
sidebar_position: 10
title: "ci runners"
---

Most `ci` lanes run on self-hosted GitHub Actions runners on `karnataka`, the
k3s node that also hosts KubeVirt, corral-web and the `punjab` VM. GitHub's
own runners are still used for fork pull requests, for the lanes listed under
[What runs where](#what-runs-where), and for everything when the
[rollback switch](#roll-back-to-github-hosted-runners) is on.

Everything below assumes `kubectl --context karnataka-k3s`, `helm` (v3.8+ or
v4), `gh` logged in as an org admin, and `ssh karnataka` with sudo.

## Components

| Piece | Where | What |
| --- | --- | --- |
| ARC controller | namespace `arc-systems`, Helm release `arc` | `gha-runner-scale-set-controller` chart; watches only `tuna-ci` |
| Scale set `tuna-ci-24.04` | namespace `tuna-ci`, release `tuna-ci-24-04` | [values](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/values-24.04.yaml); jobs that use `ubuntu-latest` on GitHub |
| Scale set `tuna-ci-26.04` | namespace `tuna-ci`, release `tuna-ci-26-04` | [values](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/values-26.04.yaml); jobs that use `ubuntu-26.04` on GitHub |
| Runner image | node-local containerd, `localhost/tuna-ci-runner:<ubuntu>-<runner>-<stamp>` | [Containerfile](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/image/Containerfile), built by [build-image](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/build-image) |
| Guard rails | [cluster.yaml](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/cluster.yaml) | namespace, admission policy, NetworkPolicy, quota, priority class |
| Scratch storage | namespace `tuna-ci-storage`, StorageClass `tuna-ci-scratch` | [storage.yaml](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/storage.yaml); helper-free static local volume pool on `vg1/tuna_ci_scratch` (nvme1n1) |
| Scripts | [.github/runners](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners) | `build-image` (images), `deploy` (guard rails + scratch provisioner + Helm releases) |
| GitHub side | org `tuna-os` | runner group `tuna-desktop-karnataka` (only repository: `tuna-os/tuna-desktop`), secret `tuna-ci-github` in `tuna-ci` |

Both chart releases use the same chart version (0.15.1 at install).

## What runs where

The `runs-on` of a moved job is a YAML alias (`*runner-24` / `*runner-26`)
of the expressions anchored on `select-lanes` and `orca-speech` in
`.github/workflows/ci.yml`. They pick the self-hosted scale set when the
repository variable `CI_RUNNERS` is not `hosted` **and** the event is a push,
schedule, dispatch or a pull request whose head repository is
`tuna-os/tuna-desktop`; otherwise the original GitHub-hosted label.

| Runner | Lanes |
| --- | --- |
| `tuna-ci-24.04` | select-lanes, check, fprint-phase-proof, app-content, scroll-proof, grid-cancel-comparison, gtk-shell, native-reference-context, parity-ledger, docs-shots, ci-gate |
| `tuna-ci-26.04` | journey, orca-speech, portal-security, remote-security, niri-parity |
| GitHub-hosted, always | arch-package, drm-smoke, marlin-vm (pull requests: the primary lifecycle leg only; push, schedule and dispatch add the Orca 51 leg and both paired reference members), marlin-image (push, schedule and dispatch only), gdm51-native-package |

Why the always-hosted lanes stay hosted:

- **arch-package** is a `container:` job; the runner needs a Docker daemon
  to start the job container, and a daemon needs a privileged pod.
- **drm-smoke** loads `vkms` (and may install its kernel modules) into the
  runner's kernel. On karnataka that is the shared host kernel under punjab
  and KubeVirt, a Fedora kernel the Ubuntu module install cannot target, and
  the module would expose a DRM device to the whole node.
- **marlin-vm** needs more than `/dev/kvm`: it runs
  `podman run --privileged --pid=host -v /dev:/dev … bootc install to-disk
  --via-loopback`, i.e. loop devices and a privileged container, which is
  root on the node. KVM through KubeVirt's device plugin would work, the
  disk build would not.
- **marlin-image** builds the OCI image and, on `main`, pushes it to GHCR
  with a `packages: write` token. Publishing stays on GitHub's ephemeral VMs
  so a compromised long-lived node (or its shared image store) can never
  sign or push a release image.

The required `gdm51-native-package` factory remains GitHub-hosted and feeds
only the ordinary lifecycle images' final GDM overlay and fresh-account
admission. The paired GNOME/Tuna members keep their shared
`Containerfile.reference`, original `104870` platform payload and stock GDM;
they do not apply that overlay or relax the original byte inventory.

journey once failed self-hosted in "Qualify disposable Debian lifecycle"
(`end of file on stdin at conffile prompt`); that came from #899 changing
the tuna-lock conffile, which fails hosted runs too, not from the runners
(#930 restores the bytes). The podman lanes (journey, portal-security,
remote-security, niri-parity) use the pods' rootless podman.

Other workflows (`stress`, `fuzz`, `baseline`, …) still use GitHub-hosted
runners; the same aliases can move them.

## Private GTK AT-SPI comparison dependency

`grid-cancel-comparison` stages Ubuntu GTK `4.14.5+ds-0ubuntu0.10` with
upstream commit `21d3eb76b68d6758122eddaf00b5823f9b2d7f34` using the existing
workflow-owned `ci-tool` action. The installer checks both Ubuntu source
archive hashes and the patch hash; it retains the license, Ubuntu patch
series, build options, compiler identity and runtime ELF hash/build ID.
The host GTK and runner image are not replaced. Only this job activates the
private library through `LD_LIBRARY_PATH`, identically for the unchanged old
and fixed product roles. Cache publication remains restricted to trusted main.

Before either product role runs, `gtk-atspi-root-proof` uses separate private
D-Bus/Xvfb sessions to require stock GTK's actual SIGSEGV negative control and
the repaired runtime's real AT-SPI behavior: named visible children resolve,
an invisible-tail index and an index with all windows hidden return remote
InvalidArgument, and valid children remain queryable after remapping.
The proof checks the mapped patched ELF against the source-build receipt.
Its receipts and build provenance accompany the comparison artifact; core
dumps are disabled for this dependency fixture. This toolkit regression proof
is not product acceptance: the old-negative/fixed-positive Escape comparison
and all selected exact-head lanes must still pass.

The old role is the pinned pre-#674 source, whose page hint widens while its
preview icons slide in. A pointer parked by a motion that lands in that slide
is counted as dwelling on the next-page hint, and the page turns a second
later (main run
[`43259379979`](https://github.com/tuna-os/tuna-desktop/actions/runs/43259379979):
`actual carousel page changed before Escape`). In that role only, the harness
delivers one more real motion inside the admitted neutral gap after the slide,
so the old pager tests its settled hint; the fixed role and the `gtk-shell`
gate keep the pointer parked, and every later check is the same for both.
A role that fails prints the end of its `output-<role>.txt`, including the
proof's `FAIL` line, in the job log.

## Keep required checks on the workflow's tested source

The `check` job uses `actions/checkout`'s default PR merge ref, like the
native DRM and VM lanes. Its workflow and required test scripts must come
from that same tree. In run
[`41274593021`](https://github.com/tuna-os/tuna-desktop/actions/runs/41274593021),
the merge-ref workflow invoked `scripts/lib/a11y-focus-proof-tests.py`,
but the explicit older head checkout lacked it, so `check` stopped with
`[Errno 2] No such file or directory`. Checking out the merge ref preserves
the real predicate suite instead of adding a placeholder or making it
optional. The check job exports its actual checked commit as `tested_sha`;
the authentication, fingerprint and grid comparison proofs check out that
exact output. Their admission receipts bind it to the checkout and commit
tree separately from the API's triggering `head_sha` (the PR head, not its
merge tree). Lane selection remains head-only because it computes the PR
diff. Record the actual tested commit in evidence, never interchange it with
the triggering head.

The same run's `drm-smoke` passed output, shell, idle, frame pacing, scale
and monitor-mode gates, then failed `D-COLORD` before its private colour
service became ready; `colord.log` was empty. That does not establish a
compositor colour regression or a passing colour gate. Readiness is judged
by the real private-bus `GetDevices` reply within the unchanged 30 seconds,
not by unprivileged `kill -0` of a potentially root-owned sudo launcher
(which can return EPERM for a live process). There is no unbounded wait.
The private bus and every colour, gamma and restart assertion remain required.

The changed-source hosted run
[`41390839901`](https://github.com/tuna-os/tuna-desktop/actions/runs/41390839901)
subsequently passed all 19 DRM assertions, including the actual colord,
gamma, calibration and restart gates. It exposed two separate prerequisite
defects: `check` reached its real strip-capture tests but lacked Pillow
(`ModuleNotFoundError: PIL`), and the pinned Orca factory entry point was
invoked as an executable despite its non-executable source mode
(`Permission denied`, exit 126). Declare `python3-pil` in the check job's
existing apt dependencies and run that consumer with `/usr/bin/python3`.
Invoke the unchanged pinned factory through Bash, like the GDM native
factory. Neither a self-hosted preinstalled dependency nor a cache hit is a
dependency declaration; do not skip the consumer or replace the pinned build.

In [CI 41395937699](https://github.com/tuna-os/tuna-desktop/actions/runs/41395937699),
both native profiles passed all 32 fresh-account gates and 14 strip cases,
and the real typed slideshow/SVG and pinned Orca journeys passed. The
required check still failed
`control::tests::native_outputs_cleared_on_failed_redial_and_transport_loss`:
the fixture merely dropped one peer descriptor, then treated any polling
error as proof of transport loss. An open duplicate instead means transient
`WouldBlock`, for which retaining the current inventory is correct.

Deliberate peer-loss fixtures must use the file's existing `shutdown(Both)`
convention before dropping the descriptor: a concurrent fork can retain a
copy until exec. The regression now deliberately retains a duplicate,
distinguishes open-endpoint `WouldBlock` from actual shutdown/EOF, and
requires terminal failed-redial I/O before judging native-output revocation.
All eleven deliberate closure fixtures use that convention. No production
state transition, polling interval, acceptance guard or test is removed.

The maintained-media check additionally needs read-only Actions access to
authenticate the exact uploaded source-artifact bytes before replaying
receipts against proposed canonical media; dependency auditing remains
tokenless and fatal. Its real recording tests require FFmpeg (including
`ffprobe`) and Pillow in the check job, not just in a capture producer.
The GDM 51 final overlay belongs to the lifecycle images after the
distribution/Orca branches. The paired GNOME/Tuna reference rows retain
their separately admitted immutable base, while lifecycle image receipts
retain the verified native platform digest rather than rereading a mutable
tag after the build. These are source and admission contracts, not a claim
that this merge has runtime or current-image qualification.

## What a pull request runs

Hosted minutes are the scarce resource, so a pull request pays only for what
it can affect:

- `select-lanes` and `check` always run; a **draft** pull request runs nothing
  else (marking it ready for review starts the proof lanes).
- Every proof lane waits for `check` (`needs: check`, directly or through
  `arch-package`), so a red `check` does not also burn the lanes.
- `scripts/ci-select-lanes` picks the lanes: docs, other non-runtime files and
  the tooling of other workflows (its `NO_LANE` list) pick none, a lane's own
  proof script picks that lane, an edit confined to some lane jobs of `ci.yml`
  picks those lanes, and any other code picks `gtk-shell` plus a rotating
  slice. Shared CI inputs still pick every lane.
- A newer push supersedes the older run (`concurrency` with
  `cancel-in-progress`, except for `main`).
- `marlin-tuna-nightly` qualifies the published image on schedule and
  dispatch only; dispatch it on a branch to test a change to it.

## Queue supersession and closed pull requests

Every PR-triggered workflow already has native workflow/ref (or PR-number)
`concurrency`: a new push supersedes the older run for that PR without
requiring an Actions write token in PR jobs. Keep those groups separate
between workflows. The `ci` and measured-coverage workflows deliberately do
not cancel an in-progress `main` run: successful main CI supplies the
performance baseline. Native concurrency keeps at most one running and one
pending run per group; it replaces older pending runs, not every main run
finishing in order. Existing schedule, manual and performance concurrency
policies remain unchanged.

Closing a PR does not create a newer run in its concurrency group, so native
supersession cannot retire its queued work. The repository-owned
[`cleanup-closed-pr-runs.yml`](https://github.com/tuna-os/tuna-desktop/blob/main/.github/workflows/cleanup-closed-pr-runs.yml)
runs every 15 minutes (subject to GitHub schedule delays), using
[`scripts/ci-cleanup-closed-pr-runs`](https://github.com/tuna-os/tuna-desktop/blob/main/scripts/ci-cleanup-closed-pr-runs).
It only cancels runs still `queued`, triggered by `pull_request`, with
nonempty, explicit API PR associations **all confirmed closed**. Open PR
heads, running jobs, push, scheduled, manual and performance-baseline
schedule/dispatch runs are not cleanup targets. There is no age threshold,
branch-name inference, force-cancel, local process reaper or semaphore here.
Runs with absent/ambiguous PR associations are intentionally left alone.

The sweep completes a bounded listing (maximum 1,000 filtered runs) and its
candidate PR reads before any cancellation. Failed, incomplete or changing
listings and invalid API responses fail closed. Each candidate run and its
PR states are read again immediately before cancellation; started runs and
reopened PRs are skipped. GitHub has no atomic conditional-cancel endpoint,
so a run can still start or a PR reopen in the interval after that last read.
An API/cancellation failure stops the pass; the next schedule can retry.

Cleanup has one native concurrency owner on GitHub-hosted runners, a
10-minute job limit, and only job-level `contents: read`, `actions: write`
and `pull-requests: read`. It checks out the trusted default-branch event
SHA, never PR code; manual dispatch on another branch is skipped. There is
no `pull_request_target` trigger.

Behavioral smoke checks (the first two are read-only):

```sh
python3 scripts/tests/test_ci_closed_pr_cleanup.py
GH_TOKEN=$(gh auth token) GITHUB_REPOSITORY=tuna-os/tuna-desktop \
  python3 scripts/ci-cleanup-closed-pr-runs
gh workflow run cleanup-closed-pr-runs.yml --ref main
# Explicit opt-in for a manual mutating pass (scheduled passes apply):
gh workflow run cleanup-closed-pr-runs.yml --ref main -f apply=true
```

For an end-to-end queue check, push twice to a disposable open PR and inspect
each workflow's runs: the newer head should supersede the older PR run while
main/scheduled work keeps its existing policy. Close the disposable PR while
one of its runs is queued, then dispatch cleanup and inspect its log and the
run status. A dry run should only print `Would cancel`; an apply pass should
cancel only the closed PR's queued run. The offline suite covers open heads,
running/scheduled/manual work, reopened/shared PRs, missing associations and
API/list failures without contacting GitHub.

## Security model

The repository is public, so the controls assume a job can run arbitrary
code as root inside its pod.

1. **Only this repository's own branches reach the runners.**
   - Workflow: the `runs-on` expression above sends fork pull requests to
     GitHub-hosted runners. `scripts/lib/ci-runner-guard-tests.py` (in
     `check`) dry-runs every alias for own/fork/rollback cases, rejects any
     other self-hosted `runs-on`, and runs the job-started hook below.
   - Runner image: a fork could edit that expression in its own pull
     request, so every job first runs
     [`job-started.sh`](https://github.com/tuna-os/tuna-desktop/blob/main/.github/runners/image/job-started.sh)
     (`ACTIONS_RUNNER_HOOK_JOB_STARTED`, baked into the image, out of reach
     of workflows). It fails the job before checkout unless the repository
     is `tuna-os/tuna-desktop` and the event is `push`,
     `workflow_dispatch`, `schedule`, or `pull_request` whose head
     repository is `tuna-os/tuna-desktop`.
   - GitHub: the runner group `tuna-desktop-karnataka` has a single selected
     repository, and the repository requires maintainer approval before
     workflows run for **all** outside contributors' pull requests
     (Settings → Actions → General → "Require approval for all external
     contributors").
2. **One job per pod, no state persists between jobs.** ARC registers each pod
   as an ephemeral just-in-time runner; the runner exits after one job and the
   pod is deleted. Kubernetes owns its generic ephemeral PVCs and deletes them
   with the pod. The scratch StorageClass's `Delete` reclaim policy makes
   the static provisioner wipe every entry (including dotfiles) from the
   released slot, delete the old PV, and only then offer a new PV for it.
   Cleanup failure keeps the slot unavailable. No shared writable cache exists.
3. **The pod cannot become the node.** The admission policy
   `tuna-ci-runner-pods` rejects any pod in `tuna-ci` that is not in its own
   user namespace (`hostUsers: false`), is privileged, shares host
   namespaces, binds host ports, mounts anything but emptyDir or fresh generic
   ephemeral `tuna-ci-scratch` volumes, mounts a service account token, or
   adds a capability other than `SYS_ADMIN`. Existing PVC references,
   hostPath, other storage classes, pre-bound volumes and data sources are
   forbidden. Root
   and `CAP_SYS_ADMIN` in the pod (needed for `sudo apt-get` and rootless
   podman's nested user namespace) map to an unprivileged 65536-uid range on
   the node. No host paths are mounted; `/dev/net/tun` (podman's network)
   comes from KubeVirt's device plugin.
4. **No cluster access.** No service account token is mounted and the
   service accounts have no roles. NetworkPolicy `runners-internet-only`
   denies all ingress and allows egress only to cluster DNS and public
   addresses: the Kubernetes API (Service and `:6443` on every node
   address), the kubelet, other namespaces' pods and Services (corral-web,
   punjab, KubeVirt) and link-local metadata are unreachable.
5. **Headroom.** ResourceQuota `runner-ceiling` caps the namespace at 14 pods,
   56 CPU / 196 GiB limits, 28 CPU / 82 GiB requests: up to 14 runners
   run at once (karnataka: 28 CPU / 125 GiB allocatable; punjab is sized at
   12 cores / 24 GiB). Each runner asks for
   1.5 CPU / 5 GiB and is limited to 4 CPU / 14 GiB. The 45 GiB
   ephemeral-storage limit covers the container writable layer/logs, **not**
   the separate scratch PVCs (see below). Runner pods use PriorityClass
   `tuna-ci-runner` (-100, never preempts): new VMs and cluster services
   preempt them, and the kubelet evicts them first under
   memory pressure.
   All 14 new pods reserve 21 CPU / 70 GiB together; the request quota allows
   older pods during rollout. The scheduler also accounts for VM reservations.
   Aggregate memory limits exceed node capacity: they are not a guarantee that
   every runner can peak at once. Check memory pressure and disk latency before
   raising concurrency further.

The ARC listener uses the GitHub credential in secret `tuna-ci-github`
(`tuna-ci` namespace, copied by the controller to `arc-systems`). Runner
pods never mount it and cannot reach the API to read it.

### Dedicated runner scratch (nvme1n1)

`/home/runner/work` (including Cargo targets and rust-cache restore),
`/var/lib/containers`, and `/home/runner/.local/share/containers` are three
fresh generic ephemeral volumes per runner, requesting 40 / 10 / 10 GiB.
`/dev/shm` remains a 2 GiB memory emptyDir. All 14 runners request 840 GiB
on the 900 GiB ext4 LV `vg1/tuna_ci_scratch`, mounted at
`/var/lib/tuna-ci-scratch` on nvme1n1; nvme0n1 still holds the unchanged
kubelet/containerd roots and unrelated workloads.

The upstream `sig-storage-local-static-provisioner` v2.10.0 discovers 42
pre-created bind-mounted slots (three per runner). It cleans released
filesystem volumes **inside its long-running process**, not helper pods or
Jobs, before recreating the PVs. The StorageClass uses
`kubernetes.io/no-provisioner` and `WaitForFirstConsumer`. Each slot reports
the shared filesystem's total capacity, not its requested 40/10 GiB, and
**neither requests nor advertised PV capacities are enforced write quotas**.
The 900 GiB LV is shared physical capacity, not 42 independent 900 GiB disks.
Monitor `df -h /var/lib/tuna-ci-scratch`; allow headroom for filesystem
overhead and asynchronous wipe, and reduce concurrency before it fills.
There is no persistent compiler cache and no extra access from runner pods.
Only the provisioner in `tuna-ci-storage` mounts the host pool. The
k3s-managed `local-path` addon and existing PVCs are unchanged.

On this bootc/ostree host, install the persistent mount unit in writable
`/etc`, not a modified OS image. Initial setup (only for the confirmed empty
VG on nvme1n1; never format an existing LV):

```sh
ssh karnataka 'sudo pvs; sudo vgs; sudo lvs; sudo lsblk -f'
ssh karnataka 'sudo lvcreate -L 900G -n tuna_ci_scratch vg1 &&
  sudo mkfs.ext4 -m 0 -L tuna-ci-scratch /dev/vg1/tuna_ci_scratch &&
  sudo mkdir -p /var/lib/tuna-ci-scratch'
scp .github/runners/scratch.mount karnataka:/tmp/tuna-ci-scratch.mount
ssh karnataka 'unit=$(systemd-escape --path --suffix=mount /var/lib/tuna-ci-scratch) &&
  sudo install -m 0644 /tmp/tuna-ci-scratch.mount "/etc/systemd/system/$unit" &&
  sudo systemctl daemon-reload &&
  sudo systemctl enable --now "$unit" &&
  sudo restorecon /var/lib/tuna-ci-scratch &&
  sudo touch /var/lib/tuna-ci-scratch/.nvme-scratch'
scp .github/runners/prepare-scratch-pool .github/runners/scratch-pool.service karnataka:/tmp/
ssh karnataka 'sudo mkdir -p /etc/tuna-ci &&
  sudo install -m 0755 /tmp/prepare-scratch-pool /etc/tuna-ci/prepare-scratch-pool &&
  sudo install -m 0644 /tmp/scratch-pool.service /etc/systemd/system/tuna-ci-scratch-pool.service &&
  sudo systemctl daemon-reload &&
  sudo systemctl enable --now tuna-ci-scratch-pool.service'
ssh karnataka 'findmnt /var/lib/tuna-ci-scratch; sudo lvs -o lv_name,vg_name,devices'
.github/runners/deploy --sets-only
```

The mount and pool service are ordered before k3s on future boots; **do not
restart k3s, containerd, kubelet or unrelated pods** to deploy them. Pool
preparation verifies the mounted LV and `.nvme-scratch` marker before making
slots. Never create that marker on the underlying unmounted directory.
The provisioner's hostPath requires an existing pool (`Directory`, not
`DirectoryOrCreate`); an absent LV/pool fails closed instead of provisioning
on nvme0n1. Both deploy modes apply guard rails and storage before updating
runner templates. Running jobs keep their old volumes until completion.

To verify a rollout, inspect a newly created runner's PVC ownerReferences,
its PV's `local.path`, and `findmnt -T /home/runner/work` inside that pod.
Compare pod `metadata.creationTimestamp` with the runner container's
`state.running.startedAt` before/after, including provisioning time; observe
both disks' `/sys/block/nvme*n1/stat` counters over the same interval while
a real CI `check` job runs. Check that deleted pods' PVCs disappear and their
released slots are wiped before a new PV is offered, and that shared pods
retain their UIDs/restart counts.

For storage rollback, first use the hosted-runner switch below and drain
the scale sets. Do not delete the provisioner while slots still need reclaim:
wait for all `tuna-ci-scratch` claims to disappear and all 42 slots/PVs to be
empty/Available, then
`kubectl --context karnataka-k3s delete -f .github/runners/storage.yaml`.
Delete the now-unclaimed pool PVs before any future reinstall so they cannot
be bound while cleanup is disabled. Only then stop/disable the pool service,
unmount its 42 bind mounts, and disable/unmount the filesystem if needed.
Leave the LV intact until explicitly deciding to destroy its data. A Helm
rollback to pre-scratch values restores the old per-pod writable-layer/
emptyDir paths for new jobs without restarting shared workloads, but
restores nvme0n1 contention.

#### Runtime maintenance: short-lived helper completion

The first rollout used local-path-provisioner v0.0.37. On this host's
containerd `v2.3.4-k3s1.36`, some short-lived helpers created their directory
but remained `Running`; `failed to get task: context deadline exceeded`,
`FailedKillPod`, and 120-second `ProvisioningFailed` timeouts prevented PVCs
from binding. The same symptom affected the pre-existing default provisioner
and old runner cleanup before this change. Runner templates were rolled back
to emptyDir, restoring 3–6-second starts, before switching to this helper-free
pool. No shared runtime/service or workload was restarted.

This is a maintenance-window runtime investigation, not a confirmed fixed
bug: containerd [v2.3.5](https://github.com/containerd/containerd/releases/tag/v2.3.5)
includes CRI I/O-stream deadlock fixes, but no captured stack proves that
they explain this host's failure. Do not restart/upgrade k3s or containerd
during shared-host CI recovery. Preserve shim/task evidence and qualify an
upgrade separately in a maintenance window.

### Node prerequisite: NetworkPolicy enforcement

k3s enforces NetworkPolicy with its embedded kube-router, which reads rules
with `iptables-save`. Tailscale in nftables mode writes rules that
`iptables-save` cannot parse, which silently stops **all** NetworkPolicy
enforcement (`Aborting sync. Failed to run iptables-save` in the k3s log).
karnataka therefore runs tailscaled in iptables mode:

```
# /etc/systemd/system/tailscaled.service.d/10-firewall-iptables.conf
[Service]
Environment=TS_DEBUG_FIREWALL_MODE=iptables
```

`k3s.service` depends on `tailscaled.service`, so restarting tailscaled
restarts k3s (workloads keep running; the API is down for ~10 s). Check
enforcement after any tailscale or k3s upgrade:

```
ssh karnataka 'sudo iptables-save -t filter >/dev/null && echo ok'
ssh karnataka "sudo journalctl -u k3s --since -10min | grep -c 'Aborting sync'"   # expect 0
```

## Install from scratch

```
# 1. Guard rails (namespace, admission policy, NetworkPolicy, quota, priority).
#    Prepare the dedicated scratch LV/mount as above before deploying runners.
kubectl --context karnataka-k3s apply -f .github/runners/cluster.yaml

# 2. GitHub runner group restricted to this repository.
rid=$(gh api repos/tuna-os/tuna-desktop --jq .id)
gh api -X POST orgs/tuna-os/actions/runner-groups -f name=tuna-desktop-karnataka \
  -f visibility=selected -F "selected_repository_ids[]=$rid" -F allows_public_repositories=true

# 3. Credential, from files, never on the command line (see "Credentials").
kubectl --context karnataka-k3s -n tuna-ci create secret generic tuna-ci-github \
  --from-file=github_app_id=app_id --from-file=github_app_installation_id=installation_id \
  --from-file=github_app_private_key=app.pem

# 4. Images: builds both on karnataka, imports them into k3s' containerd and
#    points values-24.04.yaml / values-26.04.yaml at the new tags.
.github/runners/build-image

# 5. Guard rails again (idempotent), ARC controller, both scale sets.
.github/runners/deploy
```

Check: `kubectl -n tuna-ci get autoscalingrunnersets` shows both `Running`,
and `gh api orgs/tuna-os/actions/runner-groups/<id>/runners` lists the idle
`tuna-ci-24.04-runner-*`.

### Credentials

The listener needs a GitHub credential that may create runner registration
tokens for the org. Preferred: a GitHub App owned by `tuna-os` with only
**Organization → Self-hosted runners: Read and write**, installed on the org
(secret keys `github_app_id`, `github_app_installation_id`,
`github_app_private_key`). A classic PAT works too (key `github_token`, scope
`admin:org`), but carries far more power than ARC needs. Replace the secret
in place and restart the listeners:

```
kubectl --context karnataka-k3s -n tuna-ci create secret generic tuna-ci-github \
  --from-file=… --dry-run=client -o yaml | kubectl --context karnataka-k3s apply -f -
kubectl --context karnataka-k3s -n arc-systems delete pod -l app.kubernetes.io/component=runner-scale-set-listener
```

Files holding credentials: create with `umask 077`, delete after use, strip
the trailing newline (`tr -d '\n'`), never echo them.

## Upgrade

**Runner image** (GitHub stops sending jobs to runners more than 30 days
behind the latest `actions/runner` release, so rebuild at least monthly, and
whenever a job needs a new preinstalled tool):

```
.github/runners/build-image             # new tags written into the values files
.github/runners/deploy --sets-only      # new pods use them; running jobs finish on the old
git commit .github/runners/values-*.yaml
# after running jobs finished, drop the old tags:
ssh karnataka 'sudo k3s ctr -n k8s.io images ls -q | grep tuna-ci-runner'
ssh karnataka 'sudo k3s ctr -n k8s.io images rm localhost/tuna-ci-runner:<old tag>'
```

`values-24.04.yaml` and `values-26.04.yaml` differ only in the scale set
name, image and min/max runners; change both together.

### Preinstalled CI dependencies and image smoke checks

The image preinstalls the common `ci.yml` compositor/shell development
packages (seat/input/udev, DRM/GBM/EGL, Wayland, GTK4/libadwaita, GLib,
PipeWire, font/rendering and PAM headers/wrapper) and the nested proof
runtime (X11/XWayland, media, AT-SPI/Python, IBus, keyring and desktop
portals). This moves repeated apt download/unpack work out of individual
jobs, reducing contention on the node's disk; it does not add runner slots
or a shared writable compiler cache. Each job still gets its own ephemeral
pod and keeps its workflow apt steps for hosted-runner compatibility and
package updates.

Package versions come from the image's own Ubuntu release repositories.
Only 26.04 preinstalls distro `libgtk4-layer-shell-dev`, Orca and
speech-dispatcher for journey/orca-speech. 24.04 keeps the existing pinned
`scripts/ci-install-gtk4-layer-shell` build in its jobs: that release has no
distro package. Do not replace 26.04's distro library with a `/usr/local`
build; its installed-package proofs require distro provenance.

Build only when the node has disk-I/O headroom, not while tuning or running
a heavily loaded queue. `build-image` already builds the releases
sequentially, imports their images, and updates the two local values files;
it does **not** deploy them. No rebuild or rollout is implied by changing
the Containerfile. After review, build and smoke both imported tags before
the separate rollout:

```bash
set -euo pipefail
.github/runners/build-image karnataka
# Offline library/package checks only: these do not register a runner.
for ubuntu in 24.04 26.04; do
  while read -r key ref; do
    [[ "$key" == image: ]] || continue
    ssh karnataka "sudo k3s ctr -n k8s.io run --rm '$ref' \
      'tuna-runner-smoke-${ubuntu//./-}' /bin/sh -ec '
        pkg-config --exists libseat libinput libudev gbm libdrm xkbcommon \
          wayland-client gtk4 libadwaita-1 gweather4 libpipewire-0.3
        dpkg-query -W libpam0g-dev libpam-wrapper libgtk-4-dev \
          libadwaita-1-dev libgweather-4-dev libglib2.0-dev meson xwayland
        test -x /opt/tuna-ci/job-started.sh
        if [ \"$ubuntu\" = 26.04 ]; then
          pkg-config --atleast-version=1.1 gtk4-layer-shell-0
          dpkg-query -W libgtk4-layer-shell-dev orca speech-dispatcher
        else
          ! pkg-config --exists gtk4-layer-shell-0
        fi
      '"
  done < ".github/runners/values-${ubuntu}.yaml"
done
# Deploy only after both smoke checks and review of the new image tags.
.github/runners/deploy --sets-only
```

These checks are not full job qualification. After rollout, require passing
`check`/`gtk-shell` (24.04) and `journey`/`orca-speech` (26.04) on the exact
reviewed commit, including their existing package/proof assertions. Until
the images have been built and these lanes pass, runtime compatibility and
the reduction in apt time remain unverified.

Images are node-local and `imagePullPolicy: Never`; if kubelet image garbage
collection ever removes one (disk above 85%), pods fail with
`ErrImageNeverPull`: rebuild.

**ARC chart**: controller and scale sets must run the same chart version.
Bump `ARC_CHART_VERSION`'s default in `deploy` (and the version in this
page), then run `.github/runners/deploy`: it upgrades the controller first.

## Scale

`minRunners` (idle, pre-registered pods) and `maxRunners` live in the values
files: 24.04 is 1–10, 26.04 is 0–4. Keep `maxRunners` of both sets within the
quota's 14 pods; the scheduler can still withhold slots for VM reservations.
Change the quota in `cluster.yaml` only after checking punjab and KubeVirt
(`kubectl describe node karnataka`). Apply guard rails with
`kubectl --context karnataka-k3s apply -f .github/runners/cluster.yaml`, then
runner values with `.github/runners/deploy --sets-only`. A temporary change
without editing files applies the same `--set` to both sets:

```
.github/runners/deploy --sets-only -- --set maxRunners=2
```

## Drain (maintenance on karnataka)

1. Send new jobs to GitHub: `gh variable set CI_RUNNERS -b hosted -R tuna-os/tuna-desktop`.
2. Stop creating runners:
   `.github/runners/deploy --sets-only -- --set minRunners=0 --set maxRunners=0`.
   Running jobs finish; idle runners are removed.
3. Wait for `kubectl --context karnataka-k3s -n tuna-ci get pods` to be
   empty (or cancel the remaining runs).
4. Undo in reverse order: `.github/runners/deploy --sets-only`, then
   `gh variable delete CI_RUNNERS -R tuna-os/tuna-desktop`.

Jobs already queued for a `tuna-ci-*` label when you flip the variable keep
waiting for that label: re-run them (`gh run rerun <id> --failed` after
cancelling) so they pick the hosted label.

## Roll back to GitHub-hosted runners

One switch:

```
gh variable set CI_RUNNERS -b hosted -R tuna-os/tuna-desktop
```

Every job evaluated afterwards uses its original GitHub-hosted label
(`ubuntu-latest` / `ubuntu-26.04`); assertions are identical on both.
Re-run queued runs as in [Drain](#drain-maintenance-on-karnataka).
`gh variable delete CI_RUNNERS -R tuna-os/tuna-desktop` switches back.

On 2026-11-02, the five `tuna-ci-26.04` jobs in PR #985's run
`41274593021` remained queued without an assigned runner. Read-only ARC
inspection found all four existing 26.04 runner pods in `ErrImageNeverPull`
for approximately 24 hours: their `imagePullPolicy: Never` image
`localhost/tuna-ci-runner:26.04-2.338.2-202610310435` was absent on
`karnataka`. This is a runner-image provisioning failure, not evidence that
the queued journey, Orca, portal, remote or niri gates passed or failed.
The existing `CI_RUNNERS=hosted` rollback switch was enabled for newly
evaluated jobs, without creating runners, loading images or changing gate
coverage. That switch does not repair ARC or move already queued jobs.
The reviewed source correction must get a new changed-head run; retain its
predecessor's actual VM receipts before retiring only that obsolete PR run.

Full removal:

```
helm --kube-context karnataka-k3s uninstall tuna-ci-24-04 tuna-ci-26-04 -n tuna-ci
helm --kube-context karnataka-k3s uninstall arc -n arc-systems
# After all scratch claims/PVs have reclaimed (keep the provisioner until then):
kubectl --context karnataka-k3s delete -f .github/runners/storage.yaml
kubectl --context karnataka-k3s delete -f .github/runners/cluster.yaml
kubectl --context karnataka-k3s delete namespace arc-systems
gh api -X DELETE orgs/tuna-os/actions/runner-groups/<id>
ssh karnataka 'sudo k3s ctr -n k8s.io images ls -q | grep tuna-ci-runner | xargs -r sudo k3s ctr -n k8s.io images rm'
```

and replace the `*runner-24` / `*runner-26` aliases and anchors in `ci.yml`
with `ubuntu-latest` / `ubuntu-26.04`.

## Caches

`actions/cache` (and `Swatinem/rust-cache` on top of it) works unchanged on
the self-hosted runners: it talks to GitHub's cache service over HTTPS, and
the cache keys (`ubuntu-24.04`, `ubuntu-26.04` from `/etc/os-release`) match
the hosted runners', so both share entries. As before, only trusted `main`
runs save Rust caches; pull requests restore.

A shared sccache volume or bucket was considered and not deployed. Jobs run
as root in their pod, so any job that could write a shared compiler cache
could plant objects that later `main` builds (and published images) link,
and a shared volume would break "nothing persists between jobs". sccache has
no per-entry integrity check that would make a shared writable cache safe
across branches.

## Troubleshooting

| Symptom | Look at |
| --- | --- |
| Jobs stay queued on a `tuna-ci-*` label | `kubectl -n arc-systems logs -l app.kubernetes.io/component=runner-scale-set-listener`; `kubectl -n tuna-ci get ephemeralrunners`; `kubectl -n tuna-ci describe resourcequota` |
| Pod rejected | `kubectl -n tuna-ci get events` (admission policy message names the rule) |
| `refused this job` in "Set up job" | the job-started hook: fork, foreign repository or disallowed event |
| A step misses a tool GitHub's image has | add it to the Containerfile's package list, rebuild, roll |
| Nested podman/docker errors | needs `/dev/net/tun` (tun resource), the ephemeral scratch storage mounts and `SYS_ADMIN`, all in the values files |
| Controller cannot get a registration token | credential expired or lacks org runner permission; replace the secret |
| Scratch PVC stays Pending | `kubectl -n tuna-ci-storage logs daemonset/tuna-ci-scratch-provisioner`; check pool service/mounts, Available PV count and free space; do not fall back to the OS disk |
