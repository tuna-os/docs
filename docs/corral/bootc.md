---
sidebar_position: 5
title: "Bootc"
---

# Bootc — bootable containers as VMs

`corral bootc` turns a [bootc](https://github.com/bootc-dev/bootc)
container image into a running VM **without any local disk-image
tooling** — the build happens on the cluster, using the VM's own kernel.

```bash
corral plugin install bootc
corral bootc create dev --image quay.io/centos-bootc/centos-bootc:stream9
corral start dev && corral ssh dev -u root
```

## How it works

1. Corral provisions a block-mode PVC and runs a short-lived **builder
   VM** (not a pod) that runs `bootc install to-disk` onto it — the VM's
   own kernel does the filesystem work, which is what lets it install
   images the *node's* kernel can't handle (e.g. Universal Blue desktops
   like Bluefin/Dakota, which need btrfs + composefs). Backend and
   filesystem are auto-detected from the image; your SSH key is baked in
   and sshd enabled.
2. Build logs stream to your terminal live.
3. The finished disk is self-bootable (GPT + ESP + bootloader), so the
   final VM **UEFI-boots** it directly — no kernelBoot, no bootloader
   gymnastics.

## Lifecycle

```bash
corral bootc rebuild dev --image quay.io/centos-bootc/centos-bootc:stream9  # re-bake from a new image
corral bootc upgrade dev    # pull the latest tag, rebuild
corral bootc switch dev --image ghcr.io/ublue-os/bluefin:latest  # rebase to a different image
corral bootc status dev
```

Rebuild/upgrade/switch all re-bake the disk (`--wipe` under the hood) and
re-apply the SSH key across the rebuild — rebuild your OS in CI, `corral
create` it as a VM in minutes.

## Desktop images

Bootc is how Corral gets you a **real desktop VM**, not just a headless
server — Universal Blue's Bluefin/Dakota/etc. images boot straight to a
full GNOME/KDE session, reachable over noVNC in the web UI:

```bash
corral bootc create desktop --image ghcr.io/ublue-os/bluefin:latest
corral start desktop
# corral web → open "desktop" → Console tab
```

This is also the standard "golden VM" source for [VDI pools](/docs/corral/vdi).

## Faster builds

Deploy the on-cluster pull-through registry cache
(`deploy/registry-cache.yaml` in the corral repo) and the builder routes
image pulls through it automatically, no config needed. Disable with
`CORRAL_REGISTRY_MIRROR=off`.

## Constraints

- Requires a local `~/.ssh/*.pub` key — the only login path, since bootc
  images don't get cloud-init.
- No tailnet auto-join for bootc VMs — use the tailnet proxy, or bake
  Tailscale into the image yourself.
- The image must keep its kernel + initramfs under
  `/usr/lib/modules/<version>/` (true for every bootc-based image).
