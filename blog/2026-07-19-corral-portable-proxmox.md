---
slug: corral-portable-proxmox
title: "Corral v0.1: a portable Proxmox for people who already have a cluster (or just a laptop)"
authors: [james]
date: 2026-07-19
tags: [corral, kubevirt, qemu, virtualization, announcement]
---

I love Proxmox. I've run it for years. But Proxmox is a *distribution* — it
owns the whole machine, it's welded to Debian, and if your infrastructure has
moved on to Kubernetes it's a second world you have to maintain next to the
first.

[Corral](https://github.com/tuna-os/corral) is my answer to a question that
kept nagging me: what if the Proxmox experience — the datacenter tree, the
create wizard, one-click consoles, VMs and containers side by side — was just
a single static binary you point at whatever you already have?

![Corral demo tour](https://raw.githubusercontent.com/tuna-os/corral/main/docs/screenshots/demo.gif)

<!-- truncate -->

The short version:

- **Got a Kubernetes cluster?** Corral drives KubeVirt through `kubectl` and
  `virtctl` — no operator to install, no agent, no CRDs of its own.
- **Just a laptop?** The same commands run VMs on local QEMU/KVM under
  systemd, and as of this week the same dashboard shows them under a "local"
  node.
- **Got Tailscale?** Every VM lands on your tailnet automatically — SSH from
  your phone, VNC from the couch.

One binary. `create` / `start` / `ssh` / `viewer` / `clone` / `delete` work
identically on both backends, and Corral remembers which VM lives where.
There's a TUI for quick jobs, a Proxmox-style web dashboard for everything
else, and a Proxmox API compatibility layer if your Terraform provider
expects one.

And to be clear about what "one binary" means: the CLI, the TUI, *and* the
web UI are all in it. `brew install hanthor/tap/corral` and you have the
whole product — there's no separate web package or frontend build to deploy.

## Try it in 30 seconds, literally no cluster

```bash
curl -fsSL https://raw.githubusercontent.com/tuna-os/corral/main/scripts/install.sh | sh
corral --demo        # the TUI
corral web --demo    # the dashboard, on Proxmox's port naturally (8006)
```

`--demo` boots an in-memory fake cluster *inside* the binary: three nodes,
eight VMs in every state you'd meet in real life (running, stopped, paused,
mid-install, a paused Windows desktop, an ephemeral scratch VM with a TTL
counting down), two containers, live CPU metrics. It's not a mockup — the
real CLI, TUI, and web UI run their actual code paths against it, and the
state is live: stop a VM in the dashboard and watch the TUI agree.

I built it so I could polish the interfaces without burning a cluster, and it
turned out to be the best onboarding tool Corral has. It's also how CI drives
the frontend now — a headless browser clicks through the real dashboard
against `--demo` on every change.

## The part I care most about: your OS is a container image

This is the TunaOS connection. Point Corral at a *bootable container image*:

```bash
corral create dev --bootc ghcr.io/tuna-os/yellowfin:gnome --wait-ssh
```

It runs `bootc install to-disk` in a builder VM on the cluster, then boots
the result as a first-class VM. Your OS lives in a registry;
`corral bootc upgrade` moves the VM to the next build. Every TunaOS image —
and every Universal Blue image, and anything else bootc-bootable — becomes a
VM you can summon with one command. Proxmox structurally can't do that.

## Containers get the Proxmox treatment too

`corral ct create` makes a "pet pod" — a plain Kubernetes pod with a
persistent volume and an init process, presented like a Proxmox CT. In
privileged mode it seeds a full root filesystem onto the volume,
distrobox-style, so `apt install` survives a restart. There's even
`corral ct create myproj --devcontainer ./myproj` if your project already
has a devcontainer.json.

## Honest state of things

v0.1.x, five weeks old. The KubeVirt backend is the most exercised path;
local QEMU in the web UI landed this week (lifecycle + info; consoles still
route through the CLI). Windows VMs, GPU passthrough, and scheduled
snapshots/backups exist as plugins of varying maturity.

If you run VMs on Kubernetes and miss the way Proxmox *feels*, or you run
Proxmox and wish it were one binary instead of an operating system: give
`corral --demo` thirty seconds. That's the pitch.

Corral is Apache-2.0 at
[github.com/tuna-os/corral](https://github.com/tuna-os/corral) — stars very
welcome, they're the gate to homebrew-core.
