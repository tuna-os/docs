---
slug: welcome-to-tunaos
title: Welcome to TunaOS
authors: [james]
date: 2026-06-30
tags: [tunaos, announcement, welcome]
---

So this is the TunaOS blog. We decided that the project needs one. Commit messages are not the correct
place for all of this.

<!-- truncate -->

Quick version of what TunaOS is: bootc-based, immutable desktop images built on top of Enterprise Linux — AlmaLinux, CentOS Stream, Fedora, that kind of thing. If you have used Bluefin or Bazzite, you know the idea. We do the same for the EL side of the world too.

## What's actually in it

You select your desktop — GNOME, KDE Plasma, COSMIC, XFCE, or Niri — and each one runs on that same Enterprise Linux base. bootc makes each update atomic. If an update fails, you go back to the last
one. There is no cause for alarm.

## Where things are at

We're still early but it's moving fast:

- 47 stars on GitHub. That is not many, but the number goes up
- 4 desktop variants across a handful of base OS options
- `-nvidia` variants with NVIDIA/CUDA baked in if you're doing AI/ML stuff (formerly the `-gdx` suffix)
- A Rust-based office suite — Tables, Decks, Letters — because why not
- Some ecosystem tools too: Corral for VMs, Tacklebox for multi-boot USBs, Tavern as a Homebrew GUI

## What's next

More desktops, better GPU support, actual documentation instead of tribal knowledge, and hopefully some community stuff down the line. We'll see how it goes.
