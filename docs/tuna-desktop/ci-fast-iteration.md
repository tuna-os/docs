---
sidebar_position: 11
title: "ci fast iteration"
---

A pull request pays for a queue (the self-hosted scale sets in
[ci-runners.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/ci-runners.md) share karnataka with every VM) and then for a
build before any proof runs. Guest-side code does not need either to be
tried: boot one small VM from the published image once, copy the files you
changed into it, run the proof there.

## What each step costs

Measured on `karnataka` with `corral` v0.7.0+36 on 2026-11-07, 2 CPU / 4 GiB /
30 GiB VMs from `ghcr.io/tuna-os/marlin@sha256:d77db560…`:

| Step | Wall time | Command |
| --- | --- | --- |
| Container-disk VM to Running | 23 s | `corral create NAME --kubevirt --container-disk quay.io/containerdisks/fedora:latest --node karnataka --cpu 1 --mem 1G --start` |
| Delete a VM and its disk | 15 s | `corral delete NAME -f --wait` |
| Install the published image (one time) | 326 s on an idle node | `corral bootc create NAME --image REPO@sha256:… --node karnataka --cpu 2 --mem 4G --disk 30Gi --user tuna-test --password-stdin` |
| Cold boot to the GDM greeter | 35–42 s | `corral restart NAME`, then poll `corral screenshot` |
| One `corral ssh -u root -c` call | 7–14 s | each call is a fresh virtctl tunnel |
| Copy changed files and run a command | about 15 s + the command | `scripts/tuna-corral-sync` (below) |

The install is paid once per image digest; keep the VM and reuse it.

Two measured limits:

- `corral wait --paint` alone is not "GDM is up". It turned true about 24 s
  after a restart on a frame that still differed completely from the greeter
  (mean grey difference 115 of 255); the greeter matched at 35–42 s. Also wait
  for `--unit gdm.service` and a greeter session over SSH, the conditions
  `scripts/tuna-corral-journey` passes to `corral wait`.
- Under CI load the node is the bottleneck, not the VM. With the runner sets
  busy, `uptime` on karnataka read a load average of 460 and memory pressure
  (`/proc/pressure/memory`) avg60 76%; an install that takes 326 s idle
  failed in its builder's `pull` step after 19 min 37 s. Check `ssh karnataka
  uptime` before blaming your change, and do not start installs while a CI run
  is in flight.

## The loop

```sh
# Once per image digest (about 6 minutes). VM names must start with
# tuna-q-variant- ; use your own suffix and delete it when done.
printf '%s\n' "$(openssl rand -hex 12)" | corral bootc create tuna-q-variant-dev-$USER \
  --image ghcr.io/tuna-os/marlin@sha256:<digest> --node karnataka \
  --cpu 2 --mem 4G --disk 30Gi --user tuna-test --password-stdin
corral start tuna-q-variant-dev-$USER

# Every edit: copy only what changed, run the proof as root in the guest.
scripts/tuna-corral-sync --vm tuna-q-variant-dev-$USER \
  --path scripts/lib/ci-select-lanes-tests.py --path scripts/ci-select-lanes -- \
  python3 scripts/lib/ci-select-lanes-tests.py

# When finished.
corral delete tuna-q-variant-dev-$USER -f --wait
kubectl --context karnataka-k3s -n corral-vms get vmi,pvc | grep dev-$USER   # must print nothing
```

`scripts/tuna-corral-sync` packs the `--path` files (directories recurse) into
a gzip tar, writes it into the guest as base64 in `corral ssh` arguments
(`corral ssh` does not forward stdin, so keep the payload to what you edited;
it refuses more than 2 MB), unpacks it under `/var/tmp/tuna-src` and runs the
command there. The command is run without a shell: wrap pipes in
`sh -c '…'`. Its exit status is nonzero when the guest command fails.

The guest is the Arch-based Tuna image with Python 3.14 and no git checkout,
so a test that shells out to `git ls-files` or reads files you did not copy
fails there. Copy those files too, or run that test on the host.

Run the host-only part of the proof first; it takes seconds and needs no VM:

```sh
python3 scripts/lib/ci-select-lanes-tests.py
python3 -m pytest scripts/tests -q -k '<module you touched>'
```

## What this does not replace

The loop proves guest-side Python and shell against the real image. It is
not the `marlin-vm` lane: that boots the image built from your exact source
with `tuna-vm-lane`, and the pull request still has to pass it. Use the loop
to arrive at that run green on the first push.

`scripts/tuna-corral-journey` (see [corral-journey.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md))
resolves the VM by its canonical id (`kubevirt/karnataka-k3s/corral-vms/NAME`).
With `corral` v0.7.0+36, `corral wait` on that id, and on
`kubevirt//corral-vms/NAME`, reported `not found` for a Running VM while the
bare name resolved, and the journey stopped after its 900 s wait. It needs a
`corral` with canonical-id wait support before it can run end to end here.
