---
slug: remora-local-layering
title: "Remora: The Fish That Rides Your Image"
authors: [james]
tags: [tools, bootc, layering, remora]
date: 2026-07-11
---

# Remora: The Fish That Rides Your Image

Every image-based distro eventually gets asked the same question: *"okay, but
how do I just install a package?"* Today TunaOS ships its answer. **remora**
is local layering done the container-native way — and it works identically on
every variant in the fleet, whether the base speaks dnf, zypper, pacman, apt,
emerge, or apk.

```bash
sudo remora install htop
```

That's it. That's the interface.

<!-- truncate -->

## The problem with the old answers

On traditional image-based systems the answer was `rpm-ostree install` —
package layering bolted onto the ostree deployment. It works, but it's slow,
it's rpm-only, and it fights the image model instead of using it: your
"image" quietly stops being the image anyone else has, with no Containerfile
anywhere that says how.

Meanwhile the bootc world already had a better pattern hiding in plain
sight. The Universal Blue forums, akdev1l's
[zerolayer](https://github.com/akdev1l/zerolayer), and repos like
[renner0e/server](https://github.com/renner0e/server) all converged on the
same move: **run the image factory locally.** Keep a Containerfile deriving
`FROM` your base, rebuild it on a timer with `Pull=newer`, and
`bootc switch` to the result. Your customizations become an image build like
any other — inspectable, reproducible, rollback-able.

The pattern is right. The ergonomics were "maintain a git repo of build
scripts on your server." Remora is that pattern with the ergonomics of a
package manager.

## What remora actually does

A remora is the fish that hitches a ride on a bigger fish. This one hitches
onto whatever image you're booted from:

```
/etc/remora/remora.yaml ──► generated Containerfile ──► podman quadlet (Pull=newer)
                                                              │  daily / on demand / via uupd
                                                              ▼
                                                localhost/remora:latest
                                                              │
                                                              ▼
                                     bootc switch --transport=containers-storage
```

`sudo remora init` sets the whole factory up. `remora install` / `remora
remove` edit a small YAML manifest and rebuild. When upstream publishes a new
base image, the next rebuild pulls it and re-applies your layers on top —
you're never stranded on an old base, and you never lose your changes to an
update. Every change is a new image; rolling back is just `bootc rollback`.

Need more than packages? Drop scripts in `/etc/remora/build_files/`, overlay
files via `/etc/remora/system_files/`, or use the manifest's `extra_run` for
extra repos and keys. Exotic builders welcome — a
[BuildStream](https://buildstream.build/) `bst build` step is just another
build script. Remora doesn't wrap your tools; it gives them a home in the
image build.

## One tool, six package managers

TunaOS is [13 fishes across every major Linux family](/blog/13-fishes-in-the-sea),
so a Fedora-only layering tool was never going to fly. Remora detects the
base's package manager and generates the right build — dnf on Yellowfin,
zypper on Sailfin, pacman on Marlin, apt on Flounder and Grouper, emerge on
Guppy, apk on Alpine bases —
with per-manager cache mounts so rebuilds stay fast, and a `bootc container
lint` gate so broken images never reach your bootloader.

The distro stays a dial. Your `remora.yaml` doesn't care which fish it's
riding.

## `dnf install` now tells you the truth

Here's my favorite part. On an image-based system, `dnf install` against the
host was always broken — it just failed with a confusing read-only filesystem
error. Now:

```
$ sudo dnf install htop
This is a bootc (image-based) system: /usr is read-only, so 'dnf' cannot change packages here.
Package changes are layered onto your image with remora:
  remora install htop
Run that now? [y/N]
```

`sudo remora shims` installs these interceptors in `/usr/local/bin` (opt-in,
cleanly removable, and they never touch files they didn't create). Only the
*mutating* commands are caught — `dnf search`, `pacman -Q`, `apt show` all
pass straight through to the real binary. The muscle memory you've had for
twenty years now teaches you the image model instead of fighting it.

## Updates ride uupd

TunaOS images already use [uupd](https://github.com/ublue-os/uupd) for
staged, sensible updates — battery-aware, metered-network-aware,
inhibitor-respecting. Remora doesn't reinvent any of that. If uupd is
present, `remora init` drops in a two-line systemd override so every uupd run
rebuilds your local image *first*, then applies it through uupd's normal
machinery. No new daemons, no dependencies in either direction, no second
update schedule to reason about.

## Try it

Remora ships preinstalled on current TunaOS images (and it's a single static
binary on [any other bootc system](https://github.com/tuna-os/remora)):

```bash
sudo remora init
sudo remora install htop cmatrix
sudo remora enable        # rebuild automatically
remora status
```

Docs live [here](/docs/remora/), source at
[tuna-os/remora](https://github.com/tuna-os/remora). Credit where it's due:
this stands on the local-image-factory work of the Universal Blue community,
zerolayer, and renner0e — remora just makes the pattern feel like a package
manager.

The fish rides on. 🐟
