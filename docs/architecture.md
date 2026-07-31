---
sidebar_position: 3
title: "Architecture"
description: "How TunaOS is made, from upstream base image to booted desktop."
---

# TunaOS Architecture

A full overview of how TunaOS is made. It starts at the upstream base image
and ends at a booted desktop on real hardware.

This page is the map. Each section links to the reference doc that holds the
detail, and to the code that is the source of truth.

---

## 1. What TunaOS is

TunaOS is a family of bootc images. Each image is an OCI container that a
machine can boot. The system is immutable: `/usr` comes from the image, and an
update replaces the whole image, not single files.

One recipe builds every variant. A variant is one upstream base, such as
Fedora or Debian. A flavor is one desktop on that base, such as `gnome` or
`kde`. The same scripts run on all of them.

Six package managers are in use: `dnf`, `apt`, `zypper`, `pacman`, `emerge`
and the tunaos package factory. This is the main source of complexity in the
repository, and most of the code that looks odd exists to hold those six
paths together.

```
                        upstream base image
                                │
                    ┌───────────┴───────────┐
                    │   variant (9 of them) │   flounder = Debian 13
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │   flavor / desktop    │   gnome kde xfce niri cosmic
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │   hardware layer      │   hwe, nvidia, asahi
                    └───────────┬───────────┘
                                │
                         published image
                        ghcr.io/tuna-os/…
```

### The variants

| Variant | Base | Package manager |
|---|---|---|
| yellowfin | AlmaLinux Kitten 10 | dnf (el10) |
| albacore | AlmaLinux 10 | dnf (el10) |
| skipjack | CentOS Stream 10 | dnf (el10) |
| redfin | RHEL 10 | dnf (el10) |
| bonito | Fedora 44 | dnf (fedora) |
| bonito-rawhide | Fedora Rawhide | dnf (fedora) |
| grouper | Ubuntu 26.04 | apt |
| flounder | Debian 13 Trixie | apt |
| flounder-sid | Debian Sid | apt |
| marlin | Arch Linux | pacman |
| sailfin | openSUSE Tumbleweed | zypper |
| guppy | Gentoo Linux | emerge |

The authority for this table is
[`.github/build-config.yml`](https://github.com/tuna-os/tunaOS/blob/main/.github/build-config.yml).
If the two disagree, the file is right.

---

## 2. Repository map

TunaOS is more than one repository. Here is what each one owns.

```
tuna-os/tunaOS ............ the images. Build scripts, desktop manifests,
                            CI matrix, install and boot tests.
tuna-os/tacklebox ......... the ISO engine, in pure Go. Registry pull,
                            layer unpack, EROFS, FAT ESP, ISO9660.
tuna-os/iso-builder ....... the web app. Runs tacklebox as WebAssembly
                            so a browser can make an ISO.
tuna-os/tunaos-packages ... the package factory. Builds RPMs and DEBs
                            for software the upstream repos do not ship.
tuna-os/remora ............ rebuilds user layers on the installed system.
tuna-os/corral ............ local VM and lab tooling.
tuna-os/docs .............. this documentation site.
```

---

## 3. How an image is made

CI reads the matrix from `.github/build-config.yml`. It then runs a
`Containerfile` for the package family of that variant. There is one per
family: `Containerfile.el10`, `Containerfile.debian`, `Containerfile.ubuntu`,
`Containerfile.arch`, `Containerfile.opensuse` and `Containerfile.gentoo`.

Each Containerfile calls the numbered scripts in `build_scripts/`. The numbers
set the order.

```
build_scripts/
  00-copy-files.sh ........ system_files/ into the image
  01-workarounds.sh ....... per-base fixes that upstream has not landed
  10-base-packages.sh ..... the packages every variant gets
  20-packages.sh .......... the packages this variant gets
  26-packages-post.sh ..... packages that need the ones above
  40-services.sh .......... systemd units on or off
  90-image-info.sh ........ /usr/share/ublue-os/image-info.json, os-release
  91-arch-customizations.sh
  99-cleanup.sh ........... caches out, image smaller
```

The desktop arrives in a later stage, not in the list above. That stage calls
`build_scripts/desktop/install-desktop.sh <desktop>`.

### Desktop manifests

`install-desktop.sh` reads one YAML file per desktop from
`manifests/desktops/`. The file holds one package list per package manager.

Two overrides exist. `<desktop>-arch.yaml` wins on Arch, and
`<desktop>-debian.yaml` wins on Debian. Ubuntu uses the plain file.

```
manifests/desktops/gnome.yaml
  packages:
    fedora:  [ … ]     52 packages
    el10:    [ … ]     27 packages
    apt:     [ … ]     12 packages
    zypper:  [ … ]     62 packages
    emerge:  [ … ]      2 packages
```

The list lengths differ a lot, and that is correct. Gentoo needs two entries,
because a meta package pulls in the whole desktop. openSUSE needs sixty-two
because its patterns hold the session alone.

A package count is therefore not a measure of desktop completeness. Section 7
covers the check that is.

---

## 4. How an ISO is made

Two paths make an ISO. Both call the same Go packages in `tacklebox`, so both
produce the same media.

```
                    ┌──────────────────────────┐
                    │   published bootc image  │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
     ┌────────┴─────────┐                 ┌─────────┴────────┐
     │  native path     │                 │  browser path    │
     │  cmd/purebuild   │                 │  tbox.wasm       │
     │  runs in CI      │                 │  runs in a tab   │
     └────────┬─────────┘                 └─────────┬────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                       ┌─────────┴─────────┐
                       │  bootable ISO     │
                       └───────────────────┘
```

### What the engine does

The steps are the same on both paths.

1. Pull the manifest and layers from the registry.
2. Unpack the layers into a tree, with OCI overlay rules.
3. Graft the live overlay, and add the live user and autologin.
4. Write an EROFS filesystem that holds the root.
5. Write a FAT partition for EFI, with the kernel and the boot loader.
6. Write an ISO9660 image with an El Torito boot record.

No step needs root. Ownership and modes live in the tree, never on a real
filesystem. `internal/purefs` holds the writers, and `internal/oci` holds the
registry and unpack code.

### Why the browser path is hard

`tbox.wasm` is Go compiled to wasm32. The engine uses one linear memory.
It is 32 bits wide, so about 4 GiB is a hard ceiling. Go cannot target
Memory64, so no host setting raises it.

The engine therefore holds no file content in memory. Layer bodies stream to
OPFS, and the engine reads them back in 4 MiB slices. OPFS is origin private
storage, and the browser gives it to the page. The heap holds the tree and
the inode table only.

See [tacklebox `docs/opfs-streaming-handoff.md`](https://github.com/tuna-os/tacklebox/blob/main/docs/opfs-streaming-handoff.md)
for the measurements behind that design.

---

## 5. The live boot chain

An ISO must hand control through several stages before a desktop appears. A
fault at any stage looks the same to a user: a black screen.

```
  firmware (OVMF / UEFI)
        │
        ▼
  El Torito boot record ──▶ EFI system partition
        │
        ▼
  systemd-boot ──▶ loader entry ──▶ kernel + initramfs
        │
        ▼
  tbox dracut modules          90tbox-live, 95tbox-root
        │                      parse cmdline, find the media
        ▼
  mount the ISO ──▶ loop mount the EROFS root
        │
        ▼
  overlay sysroot              lowerdir = /run/rootfsbase
        │
        ▼
  systemd ──▶ display manager ──▶ desktop session
```

The kernel needs modules to mount the root: `erofs`, `isofs`, `loop`,
`overlay`, `squashfs`, `sr_mod` and `cdrom`. The engine lifts them out of the
image and puts them in the initramfs overlay, because a stock initramfs may
not hold them.

`scripts/test-live-boot.sh` in tacklebox drives this whole chain under QEMU.
It looks for a marker on the serial console and for a login prompt. That
script has a header. It lists four faults that pass every other check and
fail here.

---

## 6. Install and day two

The live ISO runs an installer. After the install, the machine boots the same
image from disk, and `bootc` handles updates.

`remora` carries user choices across that boundary. The ISO holds a manifest
at `/LiveOS/remora/remora.yaml` with extra packages and repositories. On the
installed system, remora rebuilds those layers on the upstream base and calls
`bootc switch`. The customisation then survives updates.

---

## 7. The gates

TunaOS has many checks. They are worth a section, because most faults found
in 2026 were faults where a check passed and the artifact was still broken.

| Gate | Where | What it proves |
|---|---|---|
| Lint | `.github/workflows/lint.yml` | shell, YAML, JSON, actions syntax |
| Desktop contract, build | `build_scripts/checks/verify-desktop-experience.sh` | the desktop is usable, not only startable |
| Desktop contract, runtime | `tunaos-desktop-contract.service` | markers on ttyS0 after an install |
| ISO format | iso-builder `@full` Playwright test | size and the CD001 magic |
| Live boot | tacklebox `scripts/test-live-boot.sh` | the chain in section 5 reaches a login |
| Install and LUKS | `scripts/iso-e2e.sh`, `scripts/e2e-luks-checks.sh` | an encrypted install boots |

### Two rules that came from real faults

**A session that starts is not a desktop.** The contract once asked for a
shell, a session file and a display manager unit. One image met all three and
still had no file manager, no portal, no secret store and no `gvfs`. The contract
now asks for those too.

**A package count is not a verdict.** Gentoo ships two entries and gets the
largest desktop of any variant. openSUSE shipped three, and got a
skeleton. Only component presence separates the two.

---

## 8. Where packages come from

Most packages come from the upstream repositories of the base. When upstream
does not ship something, `tunaos-packages` builds it.

That repository holds a package factory, Tideforge. A recipe gives native
metadata for several targets: EL10 and Fedora as RPM, Debian and Ubuntu as
DEB, and Arch. Output goes to a repository on Cloudflare R2, and
the images add that repository.

This is the only answer when a base has no package at all. Two examples from
2026: `niri` has no apt package in Debian or Ubuntu, and `labwc` has none for
EL10.

---

## 9. Reference

### In the tunaOS repository

- [`.github/build-config.yml`](https://github.com/tuna-os/tunaOS/blob/main/.github/build-config.yml) — the matrix. It is the authority for every variant.
- [`manifests/desktops/`](https://github.com/tuna-os/tunaOS/tree/main/manifests/desktops) — one package list per desktop, per package manager.
- [`build_scripts/README.md`](https://github.com/tuna-os/tunaOS/blob/main/build_scripts/README.md) — a guide to the script tree.
- [`docs/PIPELINE.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/PIPELINE.md) — the build matrix and the stage DAG, in detail.
- [`docs/CI_SPEC.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/CI_SPEC.md) — what each workflow does.
- [`docs/TESTING.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/TESTING.md) — how to run the tests.
- [`docs/LUKS-TPM.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/LUKS-TPM.md) — disk encryption.
- [`docs/SECURE-BOOT.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/SECURE-BOOT.md) — signed boot.
- [`docs/ROLL_YOUR_OWN.md`](https://github.com/tuna-os/tunaOS/blob/main/docs/ROLL_YOUR_OWN.md) — make your own variant.
- [`docs/adr/`](https://github.com/tuna-os/tunaOS/tree/main/docs/adr) — architecture decision records.

### Other repositories

- [tacklebox](https://github.com/tuna-os/tacklebox) — the ISO engine
  ([ARCHITECTURE.md](https://github.com/tuna-os/tacklebox/blob/main/ARCHITECTURE.md))
- [iso-builder](https://github.com/tuna-os/iso-builder) — the web app
- [tunaos-packages](https://github.com/tuna-os/tunaos-packages) — the package
  factory
- [remora](https://github.com/tuna-os/remora) — layer rebuild after install
- [corral](https://github.com/tuna-os/corral) — local VM tooling

### Upstream

- [bootc](https://bootc-dev.github.io/bootc/) — boot a container image
- [Universal Blue](https://universal-blue.org/) — the wider ecosystem
- [EROFS](https://erofs.docs.kernel.org/) — the read-only root filesystem
- [dracut](https://github.com/dracut-ng/dracut-ng) — the initramfs
