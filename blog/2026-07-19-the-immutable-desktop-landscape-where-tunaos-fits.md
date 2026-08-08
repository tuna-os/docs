---
slug: the-immutable-desktop-landscape-where-tunaos-fits
title: "The Immutable Desktop Landscape: Where TunaOS Fits"
authors: [james]
tags: [tunaos, bootc, enterprise, comparison]
date: 2026-07-19
---

People have poked at the immutable desktop from a lot of directions. Some mixed distributions on one system, some delivered a whole OS as an OCI image, and some ran a desktop out of containers. What made the idea usable were two things. [bootc](https://github.com/containers/bootc) turns the OS into an ordinary OCI image that you switch to atomically and roll back from. [Project Bluefin](https://projectbluefin.io) proved that people would use a bootc desktop every day, not only as a demo.

Today the landscape has three corners. Fedora Silverblue showed that an atomic desktop could work with `rpm-ostree`. Universal Blue and Bluefin showed that bootc desktops can run at scale. TunaOS does the same idea on the Enterprise Linux side.

<!-- truncate -->

## The Fedora side

Silverblue did the atomic desktop first on Fedora. `rpm-ostree` gave it image-like upgrades with rollback. Universal Blue and Project Bluefin did the bootc desktop thing at scale before anyone else. Their curation layers are what make a desktop feel finished.

Our GNOME images use Project Bluefin's `common` layer. Our KDE images use Aurora's `common` layer. Our Niri images use Zirconium. One layer, applied everywhere.

## The Enterprise Linux side

Enterprise Linux has a problem with the desktop. RHEL, AlmaLinux and CentOS Stream are made for servers. They are strong, long-lived and stable, but most EL sites put Fedora or Ubuntu on the desktop anyway. That means two package ecosystems, two update rates, and two sets of tickets.

TunaOS closes that gap. It builds true desktop environments as `bootc` images on the Enterprise Linux base that your servers use now. It is not a fork and not a compatibility layer. It is the real AlmaLinux and RHEL package set, with the same lifecycle, and a desktop on top of it.

So TunaOS sits on the EL side of the landscape. Bluefin and Bazzite are the bootc desktops of the Fedora world. TunaOS is the bootc desktop of the AlmaLinux, CentOS Stream and RHEL world.

Albacore is the primary variant, on AlmaLinux 10. Yellowfin uses AlmaLinux Kitten 10. Skipjack uses CentOS Stream 10. Redfin uses RHEL 10, and its license lets you build it only locally.

## What that gives an EL shop

The image is the update. `bootc status` shows the exact container reference that you booted. `bootc upgrade` gets the next image, prepares it, and reboots into it. If there is a fault, it returns to the previous deployment.

The artifact is an ordinary OCI image. You build it, scan it, and push it with the same registry and the same CI tools as every other product of your team. You can hold a known-good digest for a training laboratory. You can push a new tag to send a security fix to all machines. You can compare two deployments to see the exact changes. There is no second toolchain.

## Not a replacement

We do not compete with Bluefin or Bazzite. We ship their layers. The Fedora world and the EL world have different lifecycles and different needs, and the landscape has room for both.

bootc and Bluefin proved the model, and TunaOS runs that model on the Enterprise Linux side.

If you can swap the base OS out from under a desktop and nothing changes, the distro is not a decision anymore. It is a setting. For the EL world, that setting is now available.
