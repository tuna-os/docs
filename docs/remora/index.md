---
sidebar_position: 1
---

# 🐟 remora

**Local layering for bootc systems, the container-native way.**

A remora rides along on a bigger fish. This one rides along on your TunaOS
image: it keeps a small manifest of packages and customizations, builds them
into a local derived image, and rebases your system to it — rebuilding
automatically whenever the base image updates. It's the answer to "how do I
just install a package?" on an image-based system, and it gives the same
answer on every TunaOS variant: **dnf, zypper, pacman, and apt**.

```bash
sudo remora init                 # one-time setup
sudo remora install htop vim     # layer packages, rebuild, rebase
sudo remora enable               # rebuild automatically when the base updates
```

remora ships preinstalled on TunaOS images. Source:
[tuna-os/remora](https://github.com/tuna-os/remora).

## How it works

```
/etc/remora/remora.yaml ──► Containerfile ──► podman quadlet (Pull=newer)
                                                     │
                                                     ▼
                                       localhost/remora:latest
                                                     │
                                                     ▼
                            bootc switch --transport=containers-storage
```

Your system keeps updating exactly like stock TunaOS — except the update is
rebuilt locally with your layers on top first. Nothing is mutated in place;
every change is a new image, every rollback is `bootc rollback`.

## The manifest

```yaml title="/etc/remora/remora.yaml"
base: ""                  # empty = follow the booted image
package_manager: ""       # empty = auto-detect
packages:
  - htop
  - tailscale
extra_run:                # verbatim shell before package install (repos, keys)
  - dnf config-manager addrepo --from-repofile=https://pkgs.tailscale.com/stable/fedora/tailscale.repo
schedule: "*-*-* 04:00:00"
```

Beyond packages:

- **`/etc/remora/build_files/*.sh`** — scripts run at the end of the build
  (enable services, tweak configs, call [BuildStream](https://buildstream.build/)
  or any other builder).
- **`/etc/remora/system_files/`** — copied over `/` verbatim.

## Package-manager shims

```bash
sudo remora shims
```

After this, `dnf install foo` (which can't work against a read-only `/usr`
anyway) explains what's going on and offers to run `remora install foo`.
Read-only commands — `search`, `info`, `pacman -Q` — pass straight through.
Remove anytime with `sudo remora shims --remove`.

## uupd integration

If [uupd](https://github.com/ublue-os/uupd) is present (it is, on TunaOS
desktop images), `remora init` hooks rebuilds into it with a plain systemd
drop-in: uupd's schedule, battery/network gating, and reboot handling drive
everything. No extra timers, no dependencies in either direction.

## Commands

| Command | Effect |
|---|---|
| `remora init` | Create `/etc/remora`, install quadlet + timer (+ uupd hook) |
| `remora install PKG...` | Add to manifest, rebuild, rebase |
| `remora remove PKG...` | Remove from manifest, rebuild, rebase |
| `remora list` | Show layered packages |
| `remora build` | Rebuild + rebase now |
| `remora enable` / `disable` | Toggle the rebuild timer |
| `remora status` | Booted image, manifest summary, timer state |
| `remora generate` | Regenerate the Containerfile only |
| `remora shims [--remove]` | Package-manager interception on/off |
