---
slug: welcome-to-tunaos
title: Welcome to TunaOS
authors: [james]
date: 2026-06-30
tags: [tunaos, announcement, welcome]
---

So this is the TunaOS blog. Figured we should actually have one instead of just dumping everything into commit messages.

<!-- truncate -->

Quick version of what TunaOS is: bootc-based, immutable desktop images built on top of Enterprise Linux — AlmaLinux, CentOS Stream, Fedora, that kind of thing. If you've used something like Bluefin or Bazzite you already get the idea, we're just doing it for the EL side of the world too.

## What's actually in it

You get your pick of desktop — GNOME, KDE Plasma, COSMIC, XFCE, or Niri — sitting on top of that same Enterprise Linux base. Updates are atomic through bootc, so if one breaks you just roll back instead of panicking.

## Where things are at

We're still early but it's moving fast:

- 47 stars on GitHub, which isn't much but it's growing
- 4 desktop variants across a handful of base OS options
- GDX variants with NVIDIA/CUDA baked in if you're doing AI/ML stuff
- A Rust-based office suite — Tables, Decks, Letters — because why not
- Some ecosystem tools too: Corral for VMs, Tacklebox for multi-boot USBs, Tavern as a Homebrew GUI

## What's next

More desktops, better GPU support, actual documentation instead of tribal knowledge, and hopefully some community stuff down the line. We'll see how it goes.
