---
sidebar_position: 10
title: "Proxmox API"
---

# Proxmox API — compatibility layer

`corral proxmox` serves a subset of the Proxmox VE REST API
(`/api2/json/...`) backed by KubeVirt, so tools built for the Proxmox
ecosystem — the Terraform `bpg/proxmox` provider, Ansible, `proxmoxer` —
can manage your KubeVirt VMs without modification.

```bash
corral plugin install proxmox
corral proxmox serve --addr :8006
```

It's also **always available** embedded in `corral web` at the same
`/api2/json/...` paths — you don't need the standalone plugin if you're
already running the web UI.

## What's translated

- **Nodes** — Kubernetes nodes, exposed as Proxmox nodes with CPU/memory
  capacity and Ready condition
- **VMs** (`/nodes/{node}/qemu`) — KubeVirt VMs, with a stable numeric
  `vmid` bidirectionally mapped via a `corral.io/proxmox-vmid` label
  (pre-existing VMs without the label derive one from a CRC32 hash of
  their name, so it stays stable across restarts)
- **Storage** — Kubernetes StorageClasses, mapped to Proxmox storage
  types (Longhorn → `lvmthin`, local-path → `dir`)
- **Pools** — Kubernetes namespaces, one pool per namespace, VMs as
  members
- **Users/groups/roles** — a **read-only** view of Kubernetes RBAC
  translated into Proxmox's shape (four fixed roles: Administrator,
  Operator, Viewer, NoAccess, mapped from cluster-admin/admin/view/default
  privilege levels). See
  [ADR-0001](https://github.com/tuna-os/corral/blob/main/docs/adr/0001-k8s-rbac-to-proxmox-privileges.md)
  for the exact mapping.

Auth enforcement is delegated entirely to tailnet membership + Kubernetes
RBAC — the Proxmox privilege strings this layer returns are
presentation-only, for tooling that expects to see them, not an
independent authorization system.

## Full reference

[docs/proxmox-api.md](https://github.com/tuna-os/corral/blob/main/docs/proxmox-api.md)
in the corral repo has the complete endpoint list.
