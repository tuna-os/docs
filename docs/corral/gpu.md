---
sidebar_position: 7
title: "GPU"
---

# GPU — PCI/GPU passthrough

`corral gpu` discovers passthrough-capable devices on your cluster's
nodes, permits them in the KubeVirt CR, and attaches them to VMs. No
vGPU/SR-IOV time-slicing — this is whole-device passthrough, one device to
one VM at a time (the common case for a homelab GPU that isn't a
datacenter accelerator).

```bash
corral plugin install gpu
```

## Discover what's available

```bash
corral gpu list
```

Shows two things:
- **Device-plugin resources** actually present on each node (e.g.
  `amd.com/gpu: 1`) — requires the vendor's device plugin already running
  (AMD device plugin, NVIDIA GPU Operator, etc.)
- **`permittedHostDevices`** currently allowed in the KubeVirt CR — what
  VMs are actually able to request

If a device shows up in the first list but not the second, it's present on
the node but KubeVirt won't schedule it to any VM yet — that's what
`enable` fixes.

## Permit a device

```bash
corral gpu enable --vendor 1002:744c --resource amd.com/gpu
```

`--vendor` is the PCI vendor:device ID pair (`lspci -nn` format — the
hex pair in brackets, e.g. `[1002:744c]`). `--resource` is the Kubernetes
extended-resource name VMs will request against (matches whatever your
device plugin already advertises, e.g. `amd.com/gpu`, `nvidia.com/gpu`).

## Attach to a VM

```bash
corral gpu attach myvm --device amd.com/gpu
corral gpu detach myvm --name gpu0
```

The VM needs to be stopped and restarted for the device to actually show
up inside the guest (PCI passthrough is applied at VM spec level, not
hot-plugged).

## Cluster readiness

`corral doctor` includes a **GPU/PCI passthrough** check — it looks for
devices that are node-allocatable but not yet permitted anywhere in the
KubeVirt CR (a signal something's present but unused), and flags whether
your cluster has any passthrough-capable resources at all. Run it before
`corral gpu enable` to sanity-check the device actually exists where you
think it does.

## A note on multi-tenant GPU pools

If you're thinking about GPU-accelerated [VDI pools](/docs/corral/vdi): whole-device
passthrough (what this plugin does) gives one VM exclusive use of the GPU
at a time — it is **not** the same as vGPU/SR-IOV time-slicing across
multiple simultaneous VMs. Consumer and integrated GPUs (including AMD's
Strix Halo APU) generally don't support official SR-IOV yet; that's
currently scoped to AMD Instinct datacenter accelerators and one Radeon
PRO workstation card. See [RFC-0001](https://github.com/tuna-os/corral/blob/main/docs/rfc/0001-vdi-plugin.md#feasibility-honestly)
for the full breakdown.
