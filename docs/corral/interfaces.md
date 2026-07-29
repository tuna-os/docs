---
sidebar_position: 3
title: TUI and Web UI walkthrough
---

# TUI and Web UI walkthrough

Corral has three views of the same fleet: commands for automation, a terminal
UI for fast operations, and a browser dashboard for visual management. Try the
complete interface without a hypervisor or cluster:

```bash
corral --demo
corral web --demo
```

Demo mode uses the real interface and API code against an in-memory fleet. It
is safe to start, stop, tag, and delete its instances.

## Terminal UI

Run `corral` with no subcommand. The left pane is a searchable inventory; on a
wide terminal, the right pane explains the selected instance's backend,
context, canonical ID, placement, address, resources, and capabilities.

![The Corral TUI fleet with details for the selected instance](/img/screenshots/corral/tui-fleet.png)

The footer is the everyday command map:

| Key | Action |
|---|---|
| `↑` / `↓` | Move through the fleet |
| `/` | Search names, IDs, backends, contexts, nodes, and addresses |
| `Tab`, `[` / `]` | Cycle the full fleet and individual contexts |
| `Enter` | Open actions supported by the selected instance |
| `s` / `x` | Start or stop the selected instance |
| `r` | Refresh all visible backends |
| `d` | Open backend-aware Doctor results |
| `?` | Open the command deck |
| `q` | Quit |

![The TUI command deck](/img/screenshots/corral/tui-help.png)

Actions are capability-aware. A KubeVirt VM can expose migration and snapshot
operations that do not appear for a backend that cannot perform them. Partial
backend failures become warnings; they do not hide healthy instances.

## Web dashboard

Start the local server and open `http://127.0.0.1:8006`:

```bash
corral web
```

The Datacenter page aggregates every configured context and peer. Use the tree
to move between fleet, node, VM, container, health, extension, multiview, and
settings pages. Tags and bulk selection make a large fleet manageable.

![Datacenter view of the unified demo fleet](/img/screenshots/corral/web-fleet.png)

Select an instance to see its canonical identity and live state. Lifecycle,
console, hardware, networking, snapshot, and export controls are shown only
where the backend supports them.

![VM summary with lifecycle controls](/img/screenshots/corral/web-vm-summary.png)

### Create an instance

1. Select **Create VM**.
2. Choose a catalog image, container disk, URL, ISO, PVC, or supported plugin
   workflow.
3. Choose the destination backend/context and resources.
4. Review networking and cloud-init, then create.

![The create wizard driven by the automated demo capture](/img/screenshots/corral/web-create.png)

### Diagnose a target

Select **Cluster health** to see checks relevant to the configured backends.
The CLI equivalent is `corral doctor`; scope either surface to a context when
debugging one remote.

![Backend and cluster health checks](/img/screenshots/corral/web-doctor.png)

## Remote web and Corral peers

An in-cluster `corral web` can be added to a local dashboard even when the
local machine has no kubeconfig:

```bash
corral peer add homelab https://corral.example.ts.net --token "$CORRAL_PEER_TOKEN"
corral peer list
```

Corral prefers a directly reachable guest endpoint. If that probe fails, CLI
SSH/console commands and the browser can relay through the remote Corral.
Tailscale is a first-class discovery and ingress option, but ordinary
Kubernetes ingress and private networks are supported too.

## Rebuild these screenshots

The images on this page are not hand-edited mockups. From a Corral checkout:

```bash
npm install --prefix e2e
node scripts/capture-docs.mjs ../docs/static/img/screenshots/corral
```

The script starts `corral web --demo`, drives Chromium, runs the real TUI under
`tmux`, and overwrites the complete screenshot set deterministically.
