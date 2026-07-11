---
slug: remora-local-layering
title: "Remora: The Fish That Rides Your Image"
authors: [james]
tags: [tools, bootc, layering, remora]
date: 2026-07-11
---

# Remora: The Fish That Rides Your Image

Every image-based distro eventually gets the same question: "okay but how do
I just install a package." So here's my answer to that. It's called remora,
it's local layering done the container-native way, and it works the same on
every variant we ship, whether the base is running dnf, zypper, pacman, apt,
emerge, or apk.

```bash
sudo remora install htop
```

That's the whole interface. That's it.

<!-- truncate -->

## Why the old answers weren't good enough

On most image-based systems the answer was `rpm-ostree install`, which bolts
package layering onto the ostree deployment. It works, technically. But it's
slow, it's rpm-only, and it kind of fights the whole point of an image-based
system — your "image" quietly stops matching anything anyone else has, and
there's no Containerfile anywhere that explains how you got there.

Meanwhile the bootc crowd had already figured out a better way to do this,
I just hadn't seen anyone package it up properly. The Universal Blue forums,
akdev1l's [zerolayer](https://github.com/akdev1l/zerolayer), repos like
[renner0e/server](https://github.com/renner0e/server) — they all landed on
the same trick: run the image factory yourself, locally. Keep a Containerfile
that derives `FROM` your base, rebuild it on a timer with `Pull=newer`, and
`bootc switch` to whatever comes out. Your customizations become a normal
image build — you can inspect it, reproduce it, roll it back, whatever.

The pattern's right. It just had bad ergonomics — basically "go maintain a
git repo of build scripts on your server." Remora is that same pattern but
it feels like using a package manager instead.

## What it actually does

A remora is the fish that hitches a ride on a bigger fish, hence the name.
This one hitches onto whatever image you're currently booted from:

```
/etc/remora/remora.yaml ──► generated Containerfile ──► podman quadlet (Pull=newer)
                                                              │  daily / on demand / via uupd
                                                              ▼
                                                localhost/remora:latest
                                                              │
                                                              ▼
                                     bootc switch --transport=containers-storage
```

`sudo remora init` sets the whole thing up. `remora install` / `remora
remove` just edit a small YAML file and rebuild. When upstream ships a new
base image, the next rebuild grabs it and puts your layers back on top, so
you're never stuck on an old base and you never lose your changes either.
Every change is a new image, and rolling back is just `bootc rollback` like
normal.

Need more than packages? Drop scripts in `/etc/remora/build_files/`, overlay
files with `/etc/remora/system_files/`, or use `extra_run` in the manifest
for extra repos and keys. If you want something weirder, go for it — a
[BuildStream](https://buildstream.build/) `bst build` step is just another
build script as far as remora's concerned. It's not trying to wrap your
tools, it's just giving them somewhere to live in the image build.

## One tool, six package managers

We ship [13 variants across every major Linux family](/blog/13-fishes-in-the-sea),
so something that only worked on Fedora was never going to cut it. Remora
figures out the base's package manager and builds accordingly — dnf on
Yellowfin, zypper on Sailfin, pacman on Marlin, apt on Flounder and Grouper,
emerge on Guppy, apk on Alpine bases. Cache mounts are per-manager so rebuilds
stay fast, and there's a `bootc container lint` gate so a broken image never
makes it to your bootloader.

Your `remora.yaml` doesn't know or care which fish it's riding.

## `dnf install` finally tells you the truth

This is my favorite part, not gonna lie. On an image-based system, `dnf
install` against the host has always just been broken — you'd get some
confusing read-only filesystem error and be left to figure out why on your
own. Now:

```
$ sudo dnf install htop
This is a bootc (image-based) system: /usr is read-only, so 'dnf' cannot change packages here.
Package changes are layered onto your image with remora:
  remora install htop
Run that now? [y/N]
```

`sudo remora shims` puts these interceptors in `/usr/local/bin` — it's
opt-in, you can remove them cleanly, and they don't touch anything they
didn't create themselves. Only the commands that'd actually change something
get caught; `dnf search`, `pacman -Q`, `apt show` all just pass through
normally. Twenty years of muscle memory now points you at the right thing
instead of just failing on you.

## Updates go through uupd

We already use [uupd](https://github.com/ublue-os/uupd) for updates —
battery-aware, doesn't hammer you on metered connections, respects
inhibitors, all the stuff you'd want. Remora doesn't try to reinvent any of
that. If uupd's around, `remora init` drops in a two-line systemd override so
every uupd run rebuilds your local image first, then hands it off to uupd's
normal process. No new daemon, nothing depending on anything it shouldn't,
no second update schedule you have to keep track of in your head.

## Try it

Comes preinstalled on TunaOS images already. It's also just a static binary
if you're on [some other bootc system](https://github.com/tuna-os/remora):

```bash
sudo remora init
sudo remora install htop cmatrix
sudo remora enable        # rebuild automatically
remora status
```

Docs are [here](/docs/remora/), source is at
[tuna-os/remora](https://github.com/tuna-os/remora). Worth repeating: this is
built on the local-image-factory pattern the Universal Blue community,
zerolayer, and renner0e already worked out. I just tried to make it feel
like a package manager instead of a git repo you babysit.

The fish rides on. 🐟
