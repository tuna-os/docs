---
slug: migrate-bluefin-to-dakota-bootc-migrate
title: "Migrate a Bluefin install to Dakota without reinstalling — bootc-migrate"
authors: [james]
tags: [tunaos, bootc, ostree, composefs, bluefin, dakota, migration, immutable, platform-engineering, bootc-migrate]
date: 2026-08-20
draft: true
---

<!-- ste-disable-file: migration-tool announcement for the platform-engineering audience; supports the adoption story (#1367) and the bootc ecosystem angle. -->

The fastest way to grow an immutable-desktop fleet is to migrate the fleet
you already have. TunaOS ships [bootc-migrate](https://github.com/tuna-os/bootc-migrate),
an in-place migration utility that converts an OSTree-backend bootc system
(like **Bluefin**) into a ComposeFS-backend bootc system (like **Dakota** —
the reference implementation TunaOS's Tromsø and XFCE Linux variants are
modeled on) — **without reinstalling and without losing `/home`, `/var`,
`/etc` customizations, flatpaks, container storage, or user accounts.**

<!-- truncate -->

## Why migrate at all?

Bootc images are the container-native way to run an OS: atomic updates,
rollback on failure, verified upgrades. But the *backend* matters too. The
OSTree backend has served Fedora Atomic / Bluefin well; the ComposeFS
backend is the newer, more scalable storage model that projects like Dakota
have moved to. If you have a fleet of Bluefin workstations and want the
Dakota/TunaOS-era backend without a reinstall-and-rebuild project, this
tool is the bridge.

## Five steps, one reboot

The common case — **Bluefin stable (btrfs) → Dakota stable** — is five
steps, and your old OSTree deployment stays in the boot menu as a fallback
the whole time:

**1. Get the migrator** (prebuilt binary, container image, or `cargo build`):

```bash
curl -fsSL -o bmc.tar.gz \
  https://github.com/tuna-os/bootc-migrate/releases/latest/download/bootc-migrate-composefs-x86_64-unknown-linux-gnu.tar.gz
tar xzf bmc.tar.gz
sudo install -m755 bootc-migrate-composefs /usr/local/bin/bootc-migrate
```

**2. Dry-run** — makes no changes, just checks readiness:

```bash
sudo bootc-migrate --target-image ghcr.io/projectbluefin/dakota:stable --dry-run
```

**3. Migrate** (~5–25 minutes depending on cache/network):

```bash
sudo bootc-migrate --target-image ghcr.io/projectbluefin/dakota:stable
```

**4. Reboot** — the new ComposeFS entry is the default; the old Bluefin /
OSTree entry stays in the boot menu if anything looks wrong:

```bash
sudo systemctl reboot
```

**5. Confirm, then make it permanent** (one-way — removes the OSTree fallback):

```bash
cat /proc/cmdline | grep -o 'composefs=[0-9a-f]*'
sudo bootc-migrate commit
```

Prefer a guided path? `sudo bootc-migrate tui` runs an interactive wizard
that defaults to `--dry-run` and shows a plain-English review before it
touches anything.

## What's preserved, what's supported

The migration preserves `/home`, `/var`, `/etc`, flatpaks, container
storage, and user accounts — it rewrites how the system *boots*, not what
you've put on it. Filesystem support covers the realistic fleet mix:
**btrfs, ext4, LUKS+XFS, and LVM-on-LUKS with a dedicated `/var`** are all
CI-validated on every push to `main` (migration, commit, deep-clean, and
`bootc status` / `upgrade --check` all green), and Bluefin LTS (XFS) is
handled automatically.

One caveat worth knowing: after migration the two `/var` trees are
independent — changes made on the ComposeFS side won't appear if you roll
back to OSTree (and vice versa). Commit only when you're satisfied with the
new system.

## Status and the rename note

The tool is **released (v0.2.0), CI-validated, and proven on real
hardware**. The repo was renamed from `bootc-migrate-composefs` to
`bootc-migrate` after v0.2.0 — the v0.2.0 tarballs, binary, and container
image still carry the old name; the next release publishes under the new
`bootc-migrate` name. The commands above match what v0.2.0 actually ships.

## Why this matters for TunaOS

TunaOS's own variants are built on the same bootc model, and the Dakota
reference implementation is the foundation for Tromsø (KDE) and XFCE
Linux. A migration path from Bluefin to Dakota isn't just tooling — it's
the on-ramp for evaluation adopters who want the container-native desktop
without a weekend of reinstalls. If you're evaluating TunaOS ([we're
tracking adoption here](https://github.com/tuna-os/tunaOS/blob/main/ADOPTERS.md)),
this is the lowest-friction way to get on the backend, and a real
production-migration story we'd love to add to the adopters list.

## Get involved

- **Repo**: [tuna-os/bootc-migrate](https://github.com/tuna-os/bootc-migrate)
- **Try it on a spare machine first** — it's reversible until you run
  `commit`, but don't point it at a machine you can't reinstall
- **Questions** — [Matrix #tunaos](https://matrix.to/#/%23tunaos:reilly.asia)

---

*Draft for maintainer review; publish suggestion: alongside the v0.3.0
release (first under the new `bootc-migrate` name) or before the 08-22 Q3
checkpoint. Cross-post candidate: r/bluefin, r/FedoraAtomic, r/linux.*
