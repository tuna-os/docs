---
sidebar_position: 2
title: "VDI"
---

# VDI — desktop pools

`corral-vdi` is Phase 1 of a small, self-hosted Virtual Desktop
Infrastructure built entirely on Corral primitives you already have:
`corral bootc` (desktop Linux images), `corral-windows` (Windows guests),
noVNC/RDP console bridges, and Tailscale exposure. This isn't a
Citrix/Horizon/oVirt competitor — it's "good VDI for personal or
small-team use," scoped to what fits in one Go binary and a tailnet.

Design doc: [RFC-0001](https://github.com/tuna-os/corral/blob/main/docs/rfc/0001-vdi-plugin.md).
Tracking issue: [#69](https://github.com/tuna-os/corral/issues/69).

## Mental model

A pool is **not** a new kind of object — it's just VMs with a
`corral.dev/vdi-pool=<name>` label. There's no pool CRD, no controller, no
reconciliation loop watching anything. `corral vdi pool create` clones N
VMs and labels them; `pool list` reads the labels back; `pool delete`
deletes the labeled VMs. If you're ever unsure what a command did,
`kubectl get vm -n <ns> -l corral.dev/vdi-pool` shows you the truth
directly — there's no other state to go stale.

Assignment works the same way: a `corral.dev/vdi-assigned-to=<user>` label
plus a `corral.dev/vdi-claimed-at` timestamp annotation on the member VM.
Nothing lives outside the Kubernetes API.

## Install

```bash
corral plugin install vdi
```

## Prerequisites

- A **golden VM** — an already-built, already-working VM you want to make
  copies of. Build it the normal way:
  - Desktop Linux: `corral bootc create mydesktop --image ghcr.io/ublue-os/bluefin:latest`
  - Windows: `corral windows create mydesktop --iso <url>` — see the
    [Windows plugin guide](/docs/corral/windows) for ISO sourcing
  - Anything else: `corral create mydesktop --kubevirt ...`
- KubeVirt's clone feature needs a `VolumeSnapshotClass` for persistent-disk
  VMs — `corral doctor` flags a missing one before you find out the hard way.

## Walkthrough

```bash
# 1. Build (or reuse) a golden VM, customize it, then stop it — clone from
#    a stopped VM for a clean disk state.
corral bootc create golden-desktop --image ghcr.io/ublue-os/bluefin:latest
corral start golden-desktop
# ...install packages, configure things...
corral stop golden-desktop

# 2. Create a pool of 3 clones.
corral vdi pool create devpool --from golden-desktop --size 3

# 3. See what's in it.
corral vdi pool list
#   devpool  (ns/corral-vms, 3 members)
#     devpool-1                free                     stopped
#     devpool-2                free                     stopped
#     devpool-3                free                     stopped

# 4. Hand one to a user — starts it if it was stopped.
corral vdi assign devpool alice
#   assigned devpool-1 → alice
#   connect:  corral vdi connect devpool-1

# 5. Connect — prints every reachable path, pick what fits the guest.
corral vdi connect devpool-1

# 6. Release it when done. Unassign always stops the VM — pooled desktops
#    don't stay running unclaimed.
corral vdi unassign devpool-1

# 7. Tear the whole pool down when you're finished with it.
corral vdi pool delete devpool
```

## What "connect" does today

`corral vdi connect <member>` **prints instructions** — it doesn't yet pick
a protocol and open a session for you automatically. One-click routing is
Phase 2 territory, and depends on in-browser RDP landing first (see
[ADR-0002](https://github.com/tuna-os/corral/blob/main/docs/adr/0002-browser-rdp-via-ironrdp.md))
so Windows members get the same one-click experience VNC already gives
Linux members. Until then:

| Guest | How to connect |
|---|---|
| Any VM | `corral web` → open the VM → Console tab (noVNC in the browser) — always works |
| Linux VM with RDP configured | The VM's Summary panel shows whether port 3389 answers; connect with a native RDP client via `virtctl port-forward` |
| Windows VM | Same RDP path — `corral-windows`-created VMs expose RDP through the proxy service |
| Any VM with SSH | `corral ssh <member>` |

## Troubleshooting

- **`golden VM "X" not found`** — the `--from` VM doesn't exist in the
  target namespace. Pass `-n` to match wherever it actually lives.
- **`timed out ... waiting for the clone to produce VM`** — KubeVirt's
  clone controller didn't produce the target VM within 2 minutes. Check
  `kubectl get virtualmachineclone -n <ns>` — a stuck clone is almost
  always a StorageClass/VolumeSnapshotClass issue.
- **`pool has no free members`** — every member is claimed. `corral vdi
  unassign` one, or create a bigger pool (no live resize yet).
- **Assigned member won't start** — `assign` surfaces the underlying
  `virtctl start` error directly. The assignment label is still set even
  if start failed; `unassign` to back out and retry.

## Current limitations (Phase 1 — by design)

- No self-serve "get a desktop" page — assignment is a CLI/admin action.
- No idle/logout reclaim — nothing notices "alice hasn't touched
  devpool-1 in 3 hours" and reclaims it automatically.
- No live pool resize — delete and recreate, or clone one more member by hand.
- No GPU-gating on pool create — if the golden VM needs a GPU, every clone
  needs one too; nothing stops you from over-provisioning.
- CT-backed pools aren't implemented — only VM golden sources work today.

None of this is hidden. Full phased plan:
[RFC-0001](https://github.com/tuna-os/corral/blob/main/docs/rfc/0001-vdi-plugin.md).
