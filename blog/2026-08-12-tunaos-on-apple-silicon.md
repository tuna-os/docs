---
slug: tunaos-on-apple-silicon
title: "TunaOS on Apple Silicon — bootc images for M1/M2 Macs"
authors: [james]
tags: [tunaos, asahi, apple-silicon, arm, bootc, immutable]
date: 2026-08-12
draft: false
---

<!-- ste-disable-file: announcement post for a new hardware story; first-person maintainer voice intended. -->

Apple Silicon Macs are, by some measures, the most common ARM Linux machines
in the world — and until recently they were mostly out of reach for TunaOS.
That changes with the work landing in
[bootc-installer-asahi](https://github.com/tuna-os/bootc-installer-asahi):
a macOS-driven installer path that turns a TunaOS bootc image into a
bootable Asahi Linux setup on **M1/M2 Macs**.

<!-- truncate -->

## The short version

- A macOS app walks you through splitting your disk and handing off to
  recoveryOS — the same flow Asahi Linux users already know
- Underneath, one minimal bootstrap payload runs `fisherman` on first boot
  to `bootc install` the TunaOS image you picked
- The catalog is a verified allowlist: only images that pass the
  golden-manifest harness appear in the app
- Today: **bonito** and **grouper** pass 36/36 checks each and are offered
  in the shipped catalog

## Why it matters

TunaOS is a bootable-container desktop: atomic updates, one transaction,
rollback on failure, verified upgrades. The Apple Silicon path keeps that
model — a Mac running TunaOS updates exactly like a server running bootc,
not like a hand-rolled dual-boot experiment. The installer project
explicitly targets the wider bootc ecosystem too — Dakota, Bluefin, and
Bazzite images can be packaged with the same tooling, and we've modeled the
payload layout on fedora-asahi and nixos-asahi so the approach stays
upstream-compatible.

## What's shipped, what's next

The installer design and validation harness are complete: payload
packaging, first-boot agent configuration, `asahi-installer --json` machine
mode, and the recoveryOS walkthrough with LUKS fail-closed and Wi-Fi handoff
at first boot. The macOS app (D3) is the remaining milestone.

Two claims are deliberately kept separate in the project's testing
philosophy: *"a payload boots"* (packaging is correct) versus *"the
bootstrap handoff is green"* (the agent recipe passes real fisherman
`validate` and a real `bootc install` end-to-end). Every promoted `*-asahi`
tag must pass the harness before it is offered — the catalog entry's
`verified` field is the gate, and CI generation consumes harness results
rather than tag enumeration.

## Get involved

- **Test on real hardware** — the project documents two hardware CI tiers
  (funded Scaleway rental, or a volunteer's M1 Air) with safety-checked
  automation in [scripts/asahi-remote-switch.sh](https://github.com/tuna-os/tunaOS/blob/main/scripts/asahi-remote-switch.sh)
- **Follow the installer** — [bootc-installer-asahi](https://github.com/tuna-os/bootc-installer-asahi)
  has a full GUI walkthrough and design docs
- **Questions?** — [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia)

M1/M2 for now — M3+ support follows Asahi upstream's installer roadmap.
