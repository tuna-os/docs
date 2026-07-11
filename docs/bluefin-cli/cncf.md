---
sidebar_position: 5
title: "Cloud Native (K8s)"
---

# ☸️ Cloud Native Bundle

The **Cloud Native (CNCF)** bundle installs Kubernetes and cloud-native tooling:

```bash
bluefin-cli bundle install k8s
```

## What's installed

| Tool | Description |
|---|---|
| [`kubectl`](https://kubernetes.io/docs/tasks/tools/) | Kubernetes CLI |
| [`helm`](https://helm.sh) | Kubernetes package manager |
| [`k9s`](https://k9scli.io) | Terminal UI for Kubernetes |
| [`k3d`](https://k3d.io) | Lightweight K3s in Docker |
| [`cilium`](https://cilium.io) | eBPF-based networking |
| [`kubectx`/`kubens`](https://github.com/ahmetb/kubectx) | Fast context/namespace switching |
| [`popeye`](https://popeyecli.io) | Kubernetes cluster sanitizer |

## Usage

```bash
# Start a local cluster
k3d cluster create tunaos-demo

# Switch context
kubectx k3d-tunaos-demo

# View cluster in terminal UI
k9s

# Scan for best practices
popeye
```
