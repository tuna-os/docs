---
title: "Getting Started with TunaOS: Choosing Your Variant"
slug: choosing-your-tunaos-variant
description: "Choose a base, desktop and installation path for a measured TunaOS pilot."
draft: true
---
A Linux desktop has several jobs: boot your hardware, run your applications, and
remain usable after an update. TunaOS separates the choices behind those jobs.
You select a distribution base, a desktop, and, where available, a hardware
layer. The project builds the selected operating system as a bootable container
image.

This is the first of three articles for people who evaluate TunaOS. Start with
one test machine or virtual machine. Choose a combination you can verify, record
what you installed, and test recovery before moving your main work.

<!-- truncate -->

## Start with the base

The **variant** identifies the base distribution. It affects system libraries,
package sources, kernels, and the work needed to maintain your own OS changes.
The **flavor** selects the desktop and optional hardware layers. A change of
base is a larger decision than a new wallpaper or application launcher.

The comparison below is a decision aid, not a support or download matrix. The
names are examples from the [primary configuration][config]. For desktop and CPU
availability, consult that configuration and the [current generated
results][matrix]. A base distribution's lifecycle is not an equivalent TunaOS
support commitment.

| Base family and example variant | Question to ask before choosing |
| --- | --- |
| AlmaLinux: Albacore, Yellowfin (Kitten) | Do your host integrations need this Enterprise Linux family? Which upstream track do they expect? |
| Fedora: Bonito | Do you need to evaluate desktop and system changes on the Fedora base? |
| Ubuntu: Grouper, Gurnard | Do your host dependencies require an Ubuntu base, and which release? |
| Debian: Flounder | Does Debian match the system libraries and administration knowledge you need? |
| Arch: Marlin | Can you test and respond to changes from a rolling base? |
| Gentoo: Guppy | Do you want to investigate how the Gentoo package model fits an image build? |

These questions apply to software that must run on the host. A development
container can have a different distribution from the host. A project that builds
on Ubuntu need not automatically choose an Ubuntu host. First separate
application requirements from kernel, driver, and host service requirements.
That often makes the choice smaller.

Treat experimental tracks as evaluation work. Read the [hardware
guide][hardware] for your device. CPU architecture alone does not prove hardware
support. A bootable image for an architecture does not prove that a laptop's
graphics, wireless, sleep, or external displays work.

## Then choose the desktop

Desktop preference includes interaction style, accessibility needs, and the
applications your users expect. Try the actual session before you standardize on
it. A screenshot cannot show keyboard navigation, suspend behavior, or a screen
reader's interaction with the login screen.

- **GNOME:** evaluate its workflow if you prefer an integrated shell and a
  focused application interface.
- **KDE Plasma:** evaluate its settings and workspace model if you want more
  control over desktop behavior.
- **XFCE:** consider its traditional panel and window workflow; check the
  specific image's session and known limitations.
- **COSMIC:** test the workflow and application integrations you need on the chosen base. Results from another distribution do not prove that this combination works.
- **Niri:** try its scrollable tiling workflow with your keyboard bindings,
  displays, and required applications.
- **Pantheon:** use the Gurnard path as the first option to evaluate;
  do not assume this flavor exists on every base.

This list describes choices, not a promise that every desktop runs on every
variant. The configuration declares combinations; the quality evidence says what
the tests exercised. Keep those two facts separate when you choose.

## Read an image reference

A reference such as `ghcr.io/tuna-os/yellowfin:gnome` has three parts: a
registry, the variant's publication path, and a flavor tag. The desktop goes in
the **tag**, not in a new repository name. Hardware suffixes, where defined, are
also part of the tag. See the [tag reference][tags] before you construct one.

Do not join the visible variant label to a desktop to generate a reference. Some
streams share a publication path and use a tag suffix. For a first pilot, copy
the reference from the project's installation or download instructions, and
record the digest as well as the readable tag. Tags can move; a digest
identifies the content you evaluated.

## Download, verify, install

Open the [download page](https://tunaos.org/download) and select your intended
variant, desktop, and architecture. Follow the [installation guide][install] for
the selected media. If a combination has no published download, do not
substitute another desktop's filename. The [ISO
builder](https://tunaos.org/iso-builder) is a separate route to create media.
Inspect its instructions and output before you treat that media as equivalent to
a published artifact.

Before you write media or select a disk, make a backup that you can restore. An
installer can replace disk contents. Test in a VM or on a spare disk first, and
use the installer guide to identify the destination. Keep recovery media
separate from the machine under test.

Follow the [artifact verification guide][verify]. For ISOs, verification binds
the downloaded bytes to a checksum authenticated by the expected workflow
identity. A checksum detects a difference in bytes. Alone, it does not identify
who provided them. For OCI images, verify the immutable digest and expected
signer identity. Record verification failures and resolve them before you
proceed.

After installation, test more than the initial desktop. Try networking, external
displays, audio, sleep and resume, login, and the applications you use. Keep
notes that name the image digest, hardware, and result. That gives a bug report
enough context to distinguish a hardware problem from a flavor problem.

## Switching an existing image-based system

A compatible bootc host can switch its tracked image. This is an OS change, not
a way to turn an arbitrary package-managed installation into TunaOS. Read [the
migration guide][migration] for your source system first. Existing rpm-ostree
systems have their own migration steps; do not mix those commands with bootc
instructions without a check of the source host.

For a test host that uses compatible bootc, the installation reference gives
this example:

```bash
bootc status
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome
sudo systemctl reboot
bootc status
```

The first status records the source deployment. The final status checks what
booted. Review the target reference and migration requirements before you run
the switch. Back up local configuration and data before this operation. The
example names a configured image, not a recommendation for every machine or a
claim that its latest tag passed every gate.

## Decide with evidence

Keep the pilot small enough that you can explain each failure. Install, apply an
update, reboot, and exercise rollback on the same test machine. Confirm that
applications can still read their data afterward. Rollback restores an OS
deployment; it does not restore every mutable file or reverse a database change.

Read the [green criteria][green] and [generated matrix][matrix]. They
distinguish a declared combination, a successful build, and an exercised install
or update path. Missing evidence is a reason to test, not a success result. When
you report a problem, include the exact cell and digest and omit credentials and
personal data from logs.

Continue with [the architecture
article](./2026-10-24-cloud-native-desktop-architecture.md) to understand the
update boundary, then [the multi-variant
article](./2026-10-24-multi-variant-strategy.md) for the maintenance model
behind these choices.

[config]: https://github.com/tuna-os/tunaos/blob/main/tunaos.toml
[matrix]: https://github.com/tuna-os/tunaos/blob/main/docs/MATRIX-STATUS.md
[hardware]: https://github.com/tuna-os/tunaos/blob/main/docs/HARDWARE.md
[tags]: https://github.com/tuna-os/tunaos/blob/main/docs/IMAGE-TAGS.md
[install]: https://tunaos.org/docs/installation
[migration]: https://github.com/tuna-os/tunaos/blob/main/MIGRATION.md
[verify]: https://github.com/tuna-os/tunaos/blob/main/docs/VERIFY-ARTIFACTS.md
[green]: https://github.com/tuna-os/tunaos/blob/main/docs/GREEN-CRITERIA.md
