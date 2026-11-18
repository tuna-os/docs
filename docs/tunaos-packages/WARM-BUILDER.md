---
sidebar_position: 20
title: "WARM BUILDER"
---

To bring a desktop up on a new target follows a loop: *build, hit a wall, fix
one spec, build again*. On CI that loop costs a wave. Every leg runs on an
ephemeral runner, so the second try pays again for every package the first one
built. The warm builder is the same chain on a host where three items survive
between tries.

```
just warm-status hummingbird-x86_64      # what this host has banked
just warm hummingbird-x86_64             # build; skip everything already banked or served
just warm-forget hummingbird-x86_64 gtk4 # drop one source package's output
```

## What persists, and why each one matters

| Path under `<state>/<cell>/` | What it buys |
| --- | --- |
| `local-repo/` | `build-chain.sh` skips any package whose exact NVR is already there. This is what turns attempt 2 into "rebuild gtk4 and its dependents" instead of "rebuild 580 packages". |
| `mock-cache/<config>/root_cache` | mock unpacks the minimal buildroot instead of creating it. Measured at 34.1% of all mock time across five real runs (`docs/hummingbird-throughput.md`, Finding 2). |
| `served-nvrs.txt` | what the published index already carries, refreshed each run, so the warm host skips CI's progress too rather than duplicating it. |

None of this is new machinery. `build-chain.sh` has had the NVR skip and the
`MOCK_CACHE_DIR` mount for a long time; `package-factory-cell.yml` deliberately
points the cache at `runner.temp`, where the win is only *within* one job. The
warm builder points both at a volume that outlives the run.

## Provisioning a host

Anything that can run rootless podman with ~200 GB of disk. The pool in `.github/runs-on.yml` fits this workload (16 vCPU, 8 parallel mock
roots, 64 GB memory, 200 GB gp3). An equivalent VM is a reasonable target.

```bash
# Fedora / EL host
sudo dnf install -y podman createrepo_c rpm-build git-core just python3-pyyaml

# Ubuntu host
sudo apt-get install -y podman createrepo-c rpm git just python3-yaml
# Ubuntu 24.04 confines rootless podman's first clone(); the hosted images turn
# this off and the stock AMIs do not (#564).
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0

git clone https://github.com/tuna-os/tunaos-packages && cd tunaos-packages
export TUNAOS_WARM_STATE=/var/lib/tunaos-warm     # a persistent volume
just warm-status hummingbird-x86_64
```

Put `TUNAOS_WARM_STATE` on the largest persistent disk you have. A full chain for hummingbird banks several GB of RPMs plus the root cache.

## The loop

```bash
just warm hummingbird-x86_64                       # ~first run: the whole gap
# ... gtk4 fails on pango ...
$EDITOR src/gnome-51/pango/pango.spec
just warm-forget hummingbird-x86_64 gtk4           # drop gtk4's output
just warm-forget hummingbird-x86_64 pango
just warm hummingbird-x86_64                       # rebuilds only those two + dependents
```

`--forget` drops everything a *source package* produced — `gtk4`,
`gtk4-devel`, `gtk4-devel-docs` — and nothing that merely shares a prefix, so
`gtk4-layer-shell` survives. Mistakes in either direction are silent. If you leave `gtk4-devel` behind,
dependents compile against headers from the failed build. If you remove
`gtk4-layer-shell`, a single package retry turns into a chain.

Anything `build-chain.sh` understands rides through unchanged:

```bash
just warm hummingbird-x86_64 --tiers bootstrap-00,bootstrap-01
just warm hummingbird-x86_64 --package src/gnome-51/gtk4
just warm hummingbird-x86_64 --jobs 8
just warm hummingbird-x86_64 --dry-run
```

## What it is not

**It is not a publisher.** It never touches R2, never signs anything, and its
`local-repo/` is not a repository anyone consumes. Promotion stays with the gated publishers, for the reasons
`INCIDENT-repo-wipe-gnome.md` records. The warm host gets a chain green fast.
Then CI builds and publishes it from a clean runner, where the result is
reproducible.

**It is not a second definition of a cell.** The manifest, mock config, image
and served index all come from `manifests/package-builds.yaml` and
`manifests/package-factory.yaml`, never from flags. A warm builder with its own definition of a cell would drift from CI. The
failure mode of that drift is a green local build that CI cannot reproduce.

## Using it as a self-hosted runner instead

The same state directories work if you register the host as a GitHub
self-hosted runner and set `MOCK_CACHE_DIR` and `--local-repo` to paths outside
the workspace. That gets the warm start on CI's side too. However, a long-lived machine
holds credentials for the repository. Make this trade deliberately without accidental
drift. The ephemeral RunsOn pool in `.github/runs-on.yml` is the alternative:
cold, but disposable.

See `docs/rfc/rfc012-request-driven-convergence.md` for how this fits the
request → converge → blocker loop.
