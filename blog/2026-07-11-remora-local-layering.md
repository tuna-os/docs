---
slug: remora-local-layering
title: "Remora: The Fish That Rides Your Image"
authors: [james]
tags: [tools, bootc, layering, remora]
date: 2026-07-11
---

# Remora: The Fish That Rides Your Image

Users of each image-based distribution ask the same question. How do you
install one package? This is my answer. Its name is remora. It adds local
layers in the container-native way. It operates in the same manner on each
variant that we release, and the base can use dnf, zypper, pacman, apt,
emerge, or apk.

```bash
sudo remora install htop
```

That is the full interface.

<!-- truncate -->

## Why the old answers were not sufficient

On most image-based systems the answer was `rpm-ostree install`. That command
adds package layers to the ostree deployment. It operates, but it is slow, it
accepts only RPMs, and it opposes the idea of an image-based system. Your
"image" quietly becomes different from every other person's image, and no
Containerfile records how it got there.

The bootc community had found a better method. I had not seen a tool that
made the method easy. Three sources found the same trick: the Universal Blue
forums, akdev1l's [zerolayer](https://github.com/akdev1l/zerolayer), and
repositories such as [renner0e/server](https://github.com/renner0e/server).
The trick is to operate the image factory yourself, on your own machine.

Keep a Containerfile that derives `FROM` your base. Build it again on a timer
with `Pull=newer`. Then use `bootc switch` to move to the result. Your changes
become a usual image build. You can examine it, make it again, or reverse it.

The pattern is correct. Only its ergonomics were bad, because it told you to
maintain a git repository of build scripts on your server. remora is the same
pattern, but it feels like a package manager.

## What it does

A remora is the fish that travels with a larger fish, and that is the name's
origin. This tool travels with the image that your system booted:

```
/etc/remora/remora.yaml ──► generated Containerfile ──► podman quadlet (Pull=newer)
                                                              │  daily / on demand / via uupd
                                                              ▼
                                                localhost/remora:latest
                                                              │
                                                              ▼
                                     bootc switch --transport=containers-storage
```

`sudo remora init` prepares all of it. `remora install` and `remora remove`
change a small YAML file, then build the image again. When upstream releases
a new base image, the next build gets it and puts your layers back on top. You
cannot become stuck on an old base, and you cannot lose your changes. Each
change makes a new image, and `bootc rollback` reverses a change as usual.

Do you need more than packages? You have three methods. Put scripts in
`/etc/remora/build_files/`. Overlay files with `/etc/remora/system_files/`.
Use `extra_run` in the manifest for more repositories and keys.

You can do stranger things too. To remora, a [BuildStream](https://buildstream.build/)
`bst build` step is one more build script. remora does not try to contain your
tools. It gives them a place in the image build.

## One tool, six package managers

We release [13 variants across each major Linux family](/blog/13-fishes-in-the-sea).
A tool for Fedora alone was never enough. remora finds the base's package
manager and builds correctly for it. It uses dnf on Yellowfin, zypper on
Sailfin, and pacman on Marlin. It uses apt on Flounder and Grouper, emerge on
Guppy, and apk on Alpine bases.

Each manager has its own cache mount, so builds stay fast. A
`bootc container lint` gate stops a bad image before your bootloader gets it.

Your `remora.yaml` does not know which fish carries it, and does not need to.

## `dnf install` now tells you the truth

This part pleases me most. On an image-based system, `dnf install` against the
host was always broken. You got an error about a read-only file
system, and the error explained nothing. You then had to find the cause
yourself. Now:

```
$ sudo dnf install htop
This is a bootc (image-based) system: /usr is read-only, so 'dnf' cannot change packages here.
Package changes are layered onto your image with remora:
  remora install htop
Run that now? [y/N]
```

`sudo remora shims` puts these interceptors in `/usr/local/bin`. You choose
whether to add them, you can remove them fully, and they touch nothing that
they did not make. They catch only the commands that would change something:
`dnf search`, `pacman -Q`, and `apt show` continue as usual. Twenty years of
muscle memory now points you at the correct tool.

## Updates go through uupd

We already use [uupd](https://github.com/ublue-os/uupd) for updates. It knows
the battery state, it does not overload a metered connection, and it obeys
inhibitors. remora does not do that work again. When uupd is on the system,
`remora init` adds a two-line systemd override. Each uupd run then builds your
local image first and gives the result to uupd's usual process. remora adds no
daemon, no dependency in either direction, and no second schedule for you to
remember.

## Try it

TunaOS images include it. It is also a static binary for
[other bootc systems](https://github.com/tuna-os/remora):

```bash
sudo remora init
sudo remora install htop cmatrix
sudo remora enable        # build again automatically
remora status
```

The [documentation](/docs/remora/) has more, and the source is at
[tuna-os/remora](https://github.com/tuna-os/remora). This point is worth a
second statement. The pattern of a local image factory comes from the
Universal Blue community, from zerolayer, and from renner0e. I only tried to
make it feel like a package manager, and not like a git repository that you
tend.

The fish rides on. 🐟
