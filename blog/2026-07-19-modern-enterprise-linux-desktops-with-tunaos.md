---
slug: modern-enterprise-linux-desktops-with-tunaos
title: "Modern Enterprise Linux Desktops with TunaOS"
authors: [james]
tags: [tunaos, almalinux, bootc, enterprise, announcement]
date: 2026-07-19
---

Enterprise Linux has a problem with the desktop. RHEL, AlmaLinux and CentOS
Stream are made for servers. They are strong, they have a long life, and they
are stable to the point of tedium. For a fleet of production hosts, this is
correct. But it is not correct for the machine that a developer or an
administrator uses each day.

Thus most EL sites use Fedora or Ubuntu on the desktop, and something fully
different in the datacenter. The result is two package ecosystems and two
update rates. It is also two sets of tickets that ask why the same operation
is different on the two systems.

TunaOS closes this gap. It gives you true desktop environments as `bootc`
images. They are built directly on the Enterprise Linux base that your
servers use now.

<!-- truncate -->

## The same base, with a true desktop

**Albacore** is the primary variant. Its base is AlmaLinux 10, which follows
RHEL 10 rebuild for rebuild.

On that base you have a true choice of desktop: GNOME, KDE Plasma, COSMIC or
Niri. Each desktop is its own `bootc` image: `ghcr.io/tuna-os/albacore:gnome`,
`:kde`, `:cosmic` and `:niri`. There are also `-hwe` and `-nvidia` images for
more recent hardware.

Other variants follow the remainder of the EL family. **Yellowfin** uses
AlmaLinux Kitten 10, the preview of the next major AlmaLinux. **Skipjack**
uses CentOS Stream 10. **Redfin** uses RHEL 10 itself, and its license lets you
build it only locally.

This is not a fork, and it is not a compatibility layer. It is the true
AlmaLinux and RHEL package set, with the same lifecycle. A desktop goes on
top of it. The pipeline that makes the image is the usual `bootc` pipeline.

## What bootc gives you

The image *is* the update. `bootc status` shows the exact container reference
that you booted. `bootc upgrade` gets the next image, prepares it, and reboots
into it. If there is a fault, it returns to the previous deployment.

`rpm-ostree` on Fedora Silverblue did the same. But here the artifact is an
ordinary OCI image. You build it, scan it, and push it with the same registry
and the same CI tools as each other product of your team.

For an EL site, this is the important part. Your desktop images can use the
same pipeline rules as your server images. Hold a known-good digest for a
training laboratory. Push a new tag to send a security fix to all machines.
Compare two deployments to see the exact changes.

For none of this do you need a second toolchain. It is the toolchain that you
already use in production.

## Try it

Downloads are live at [tunaos.org/download](https://tunaos.org/download), or pull a variant directly:

```bash
podman pull ghcr.io/tuna-os/albacore:gnome
```

The [variant table](/docs/tunaos/) gives the full set of bases, desktops and
hardware tags. The [bootc usage guide](/docs/tunaos/bootc-usage) shows the
daily `bootc` commands.

Tell us if something does not operate, or if you have trouble with the
download page. Write to us in [Discussions](https://github.com/tuna-os/tunaOS/discussions). That is what
it is for.
