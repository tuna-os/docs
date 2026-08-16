---
sidebar_position: 1
---

# 🐟 remora

**A container-native way to add local layers to bootc systems.**

A remora fish travels with a larger fish. This tool travels with your TunaOS
image. It holds a small manifest of your packages and your changes. It builds
a local derived image from that manifest. Then it rebases your system to the
new image. When the base image changes, remora builds the local image again.

On an image-based system, users ask how to install one package. remora is the
answer, and the answer is the same on each TunaOS variant: **dnf, zypper,
pacman, apt, portage (emerge), and apk**.

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

Your system updates in the same way as a stock TunaOS system. There is one
difference: remora first builds the update again, with your layers on top.
remora changes nothing in place. Each change makes a new image, and
`bootc rollback` reverses each change.

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

TunaOS desktop images include [uupd](https://github.com/tuna-os/finupdate). When
uupd is on the system, `remora init` connects the rebuilds to it with a
systemd drop-in. uupd then controls all of it: the schedule, the limits on
battery and network use, and the reboots. remora adds no other timers, and
neither tool depends on the other.

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
