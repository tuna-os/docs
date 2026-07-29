---
sidebar_position: 5
title: Command and subcommand guide
---

# Command and subcommand guide

Global flags apply to built-in commands and plugins:

```text
--backend, -b qemu|kubevirt|incus|libvirt   one-shot backend
--context NAME                              one-shot named context
--demo                                      safe built-in demonstration fleet
```

Use `corral <command> --help` for the authoritative flags in your installed
version and `corral completion bash|zsh|fish` for shell completion.

## Fleet and lifecycle

| Command | Purpose |
|---|---|
| `corral` | Open the TUI |
| `corral list` | Aggregate all configured contexts and peers |
| `corral create NAME` | Create a VM; select source, resources, and destination with flags |
| `corral info NAME` | Print backend information for one VM |
| `corral start|stop|restart NAME` | Change power state |
| `corral pause|unpause NAME` | Freeze or resume where supported |
| `corral delete NAME` | Remove a VM and Corral-managed resources |
| `corral clone SOURCE DEST` | Clone a supported VM |
| `corral migrate NAME --node NODE` | Move a KubeVirt VM |
| `corral scale NAME --cpu N --mem SIZE` | Change CPU and memory |
| `corral screenshot NAME -o FILE.png` | Capture a local QEMU framebuffer |

Common creation examples:

```bash
corral create installer --backend qemu --iso ./installer.iso --cpu 4 --mem 8G
corral create api --backend kubevirt --context homelab \
  --container-disk quay.io/containerdisks/fedora:42
corral create sandbox --backend incus --context lab \
  --image images:ubuntu/24.04
```

## Access and networking

| Command | Purpose |
|---|---|
| `corral ssh NAME` | Resolve the correct direct, backend, or peer transport |
| `corral viewer NAME` | Open the graphical console |
| `corral logs NAME` | Show backend logs |
| `corral networks` | List KubeVirt Multus attachments |
| `corral addnic NAME` | Add a secondary network interface |
| `corral lanservice NAME` | Manage LAN exposure |

SSH accepts the usual user, identity, command, port, and local-forward options:

```bash
corral ssh dev -u core -i ~/.ssh/id_ed25519
corral ssh db -L 5432:127.0.0.1:5432
```

## Storage and VM operations

| Command | Subcommands or role |
|---|---|
| `corral snapshot` | `create`, `ls`, `restore`, `rm` |
| `corral adddisk` / `rmdisk` | Attach or detach supported disks |
| `corral export` | Export a disk in a supported format |
| `corral template` | Mark and manage templates |
| `corral gc` | Collect expired ephemeral resources; supports dry-run |

## Containers

```bash
corral ct create devbox --image docker.io/library/debian:bookworm --privileged
corral ct list
corral ct start devbox
corral ct console devbox
corral ct stop devbox
corral ct delete devbox
```

## Configuration, diagnostics, and federation

| Command | Subcommands |
|---|---|
| `corral context` | `add`, `list`, `get`, `use`, `remove` |
| `corral peer` | `add`, `list`, `remove` |
| `corral doctor` | Diagnose all targets or one `--context`; apply safe fixes with `--fix` |
| `corral web` | Start the dashboard/API; use `--demo` for a fixture fleet |
| `corral completion` | Generate shell completion |

## Plugins and marketplace

```bash
corral plugin search
corral plugin info bootc
corral plugin install bootc
corral plugin list
corral plugin update bootc
corral plugin pin bootc
corral plugin remove bootc

corral marketplace list
corral marketplace add internal https://example.test/corral/index.json
corral marketplace validate ./index.json
corral marketplace disable internal
```

Installed executables named `corral-NAME` become `corral NAME`. First-party
plugins include bootc, backup, Windows, GPU, snapshot scheduling, VM scheduling,
Proxmox compatibility, and the current VDI pool slice. Backend support varies;
inspect `corral plugin info NAME` before assuming a workflow is portable.
