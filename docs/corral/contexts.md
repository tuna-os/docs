---
sidebar_position: 4
title: Backends, contexts, and peers
---

# Backends, contexts, and peers

A **backend** is a driver (`qemu`, `kubevirt`, `incus`, or `libvirt`). A
**context** is one named destination for that driver. A **peer** is another
Corral server whose inventory is federated into this one.

## Add destinations

```bash
# This workstation
corral context add laptop --backend qemu

# Two independent Kubernetes clusters
corral context add homelab --backend kubevirt --context homelab-admin
corral context add production --backend kubevirt --context production-admin

# An existing Incus remote (configured with `incus remote add`)
corral context add incus-lab --backend incus --context lab

# Local or SSH-transported libvirt
corral context add libvirt-local --backend libvirt --context qemu:///system
corral context add hypervisor --backend libvirt \
  --context qemu+ssh://admin@hypervisor/system
```

List and switch defaults with kubectx-like commands:

```bash
corral context list
corral context use homelab
corral context get
```

Switching the default changes the destination for unqualified commands; it
does not hide other contexts from `list`, the TUI, or the web dashboard.

For scripts and one-off commands, be explicit:

```bash
corral create test --backend incus --context lab --image images:ubuntu/24.04
corral list --context production
corral doctor --context hypervisor
```

Bare instance names work only when unique. Automation should use the canonical
identity printed by `corral list` when duplicate names exist.

## Backend authentication

Corral delegates target authentication to respected native transports instead
of inventing another credential store:

- **KubeVirt** uses kubeconfig users, exec credential plugins, certificates,
  and service-account tokens through `kubectl`/`virtctl`.
- **Incus** uses the trust and client credentials already attached to the
  named Incus remote.
- **libvirt** uses the URI transport: Unix socket permissions/polkit locally,
  and OpenSSH agents, keys, host verification, and config for `qemu+ssh`.
- **QEMU** is local and governed by the user's KVM and systemd-session access.

These credentials authenticate Corral to a backend. Web login, peer service
tokens, and guest SSH/RDP credentials are separate security boundaries.

## Federate another Corral

```bash
corral peer add cluster https://corral.cluster.example --token "$TOKEN"
corral peer list
```

Peer identities remain part of every VM's canonical identity. Corral attempts
direct SSH, VNC, RDP, and advertised endpoints first and uses peer HTTP or
WebSocket relay only as a fallback for complicated network topologies.
