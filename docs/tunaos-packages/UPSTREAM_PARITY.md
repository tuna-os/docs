---
sidebar_position: 20
title: "UPSTREAM PARITY"
---

TunaOS ships desktop experiences curated by the Bluefin, Aurora, and Zirconium
communities.  Parity therefore means that TunaOS carries forward their selected
applications, defaults, session behavior, hardware integration, and update/store
experience.  It does not mean only that programs with similar names are installed.
This is a compatibility target, not permission to consume another project's
binary repositories or image filesystem. Each item below needs one
of these: the target distribution provides it, TunaOS rebuilds it, or the
register marks it out of scope.

The audit used the following upstream revisions on 2026-07-25:

| Upstream | Revision | Scope |
| --- | --- | --- |
| [Zirconium](https://github.com/zirconium-dev/zirconium) | `c43b53abfb75296f8517990823fd2cc9f095d837` | Niri/DMS desktop and session integration |
| [Bluefin](https://github.com/ublue-os/bluefin) | `742b3b77b924aeff47610b6c985dd1805dd5e927` | GNOME workstation utilities and update experience |
| [Aurora](https://github.com/ublue-os/aurora) | `6dd632ebefd04bacc4eba0319f3106e739417cc0` | KDE workstation utilities and update experience |

## Rules

1. A TunaOS image must not enable a COPR, PPA, or upstream binary repository.
2. Fedora, EPEL, CentOS Stream, Ubuntu, and Debian packages remain preferred
   when their version meets the experience requirement.
3. When upstream has no suitable package, TunaOS imports the source. Each
   import has a pinned revision/checksum, a license review, and SBOM/provenance.
   It also has a native RPM/DEB build and target install/runtime gates.
4. Curated configuration stays here with upstream provenance and attribution.
   The build never copies it from an upstream image. We import reviewed files
   as source, test them, and maintain them here.

## Initial parity inventory

| Experience | Current upstream-only gap | Factory disposition | Gate before promotion |
| --- | --- | --- | --- |
| Niri compositor | `niri` currently comes from `yalter/niri-git` | Source RPM now builds and clean-installs on EL10 with Tideforge `libseat` and upstream session/portal assets; retain user-session validation before promotion | Ubuntu/Debian install; Wayland session smoke test |
| DMS shell | `quickshell-git`, `dms`, `dms-cli`, `dms-greeter` come from AvengeMedia COPRs | Source recipes are present. Quickshell and the full DMS/greetd closure build and clean-install on EL10 from staged Tideforge RPMs; retain user-session/login validation before promotion | greetd login and DMS user-session smoke test |
| COSMIC session | COSMIC's session manager, compositor, portal, settings, and greeter use vendor archives plus nonstandard install contracts | Tideforge models pinned sources, offline Cargo vendor configurations, native install contracts, and the two EL10 greeter patches for the complete root set. The icon themes, session manager, background manager, compositor, idle manager, notification daemon, on-screen display service, panel/dock, settings app, settings daemon, and display tool have real EL10 builds and staged-install proof; their generated RPM payloads are CI-gated. The remaining COSMIC runtime packages must still be staged as a complete release set before promotion. | COSMIC login/session smoke |
| Niri sensors | Zirconium's `iio-niri` needs hardware-specific validation | Source RPM builds and clean-installs on EL10 against the Tideforge Niri stack; do not promote until its rotation behavior is tested | accelerometer service and rotation smoke test on hardware-capable runner |
| Niri companion tools | Zirconium includes `dgop`, `dsearch` (now upstream `danksearch`), and `dankcalendar-git`; legacy TunaOS also references `valent-git` | `dgop` and `danksearch` build and clean-install on EL10 from source. Dank Calendar now has an Arch Tideforge source recipe using the upstream tagged archive with vendored modules and bundled DankCommon; EL10/DEB intake waits for a source-built Go 1.26 toolchain. A fresh EL10 repository probe confirms that `valent` is not stock content, so it remains an optional source-intake candidate rather than a target dependency. | package install plus application/service smoke test |
| Greeter integration | Zirconium owns greetd PAM, sysusers, tmpfiles, DMS policy, and session files; TunaOS currently copies portions from its image | Import the curated configuration with attribution into TunaOS and package generated helpers; priority 0 | `greetd` service, PAM, and Niri login e2e test |
| XFCE login | XFCE Wayland uses `gtkgreet` hosted by Cage for its graphical greetd login | Tideforge owns pinned `gtk-layer-shell` and `gtkgreet` recipes. `gtk-layer-shell` has an EL10 staged-install gate; `gtkgreet` promotion is gated by consuming its generated `-devel` RPM. Retain the native spec meanwhile. | `greetd` + Cage + `gtkgreet` login smoke |
| XFCE compositor | `xfwl4` needs a Cargo vendor tree and XFCE Wayland protocol submodule not present in the upstream archive | Tideforge now models both checksum-locked source inputs, including the exact offline Cargo replacement configuration. Native RPM remains the promoted path until the full Xfce prerequisite closure is staged and runtime-tested. | Xfce Wayland nested/TTY session smoke |
| Bluefin updates/store | `uupd` is the remaining Bluefin COPR package; Bazaar is version-dependent upstream/Fedora content | `uupd` has a factory recipe. Bazaar now has a pinned Tideforge source recipe for Ubuntu 26.04, Debian sid, and Arch; its EL10 enablement waits for the staged GNOME 50 library set because upstream requires GTK 4.22 and libadwaita 1.8. | update command contract and Flatpak-store launch test |
| Aurora KDE add-ons | `krunner-bazaar`, `oversteer-udev`, `kairpods`, `sunshine`, and Aurora's patched `plasma-setup` | Split into independently licensed source packages; do not import Aurora's COPR binaries. The EL10 probe confirms `sunshine` and `plasma-setup` are absent from stock repositories. Plasma Setup now has a pinned upstream KDE source recipe for the current Arch Plasma stack; EL10 waits for its latest-KDE staging repository. Sunshine needs a separate toolchain/bootstrap review before recipe intake. | EL10/KDE install and feature-specific runtime tests |
| Aurora SELinux workaround | Aurora's `ublue-os-selinux-workarounds` mitigates a Linux 7.0 composefs/overlay execmem regression | Do not ship on EL10: its source policy explicitly targets Linux 7.0 and grants `kernel_t` execmem; retain an evidence-based re-evaluation if the target kernel acquires that defect | Not applicable unless an EL10 reproducer exists |

The lists of Fedora packages from Bluefin and Aurora are not factory
inputs.  Compare them continuously, then use the distribution
packages where they exist.  A rebuild of a Fedora package to duplicate it
adds maintenance work and does not give more parity.

## Snapshot audit (#226)

`_upstream-snapshots/` holds the package declarations this register tracks.
It has one YAML per upstream (`bluefin-lts`, `aurora`, `zirconium`), keyed to
the upstream revisions in the table above.  The YAML covers the curated packages
that matter for parity, not the Fedora lists.  Each declaration carries the
disposition TunaOS intends: a source recipe, a desktop-manifest declaration, a
named distribution package, or an explicit out-of-scope entry with a reason.
`scripts/audit-upstream-parity.py` verifies the repository honours it:

```
scripts/audit-upstream-parity.py --strict
scripts/audit-upstream-parity.py --report-json docs/upstream-parity-report.json
```

A snapshot package with no disposition is an uncovered gap. A disposition that
the repository does not honour is also an uncovered gap. Examples are a declared
recipe with no `packages/<name>`/`src/*/<name>`, and an out-of-scope entry with
no reason. Each of these fails
`--strict`.  `tests/test_upstream_parity_audit.py` asserts the committed
snapshots stay covered, so a recipe rename or removal without a snapshot
update is caught in CI.

The register has one remaining recommendation. On every release tag, extract
the installed packages of each published edition image. Fail each image that has
fewer packages than its base. This needs container-registry access and belongs
to the image-build pipeline. This repository supplies the recipe-side half of
the contract (rules 1–4 and the inventory table).

## Delivery order

1. Replace the Niri/DMS COPR chain and upstream-image payload with source-built
   packages and TunaOS-owned configuration.
2. Replace the RPM dependencies of the COSMIC and GNOME releases. Each
   one is in the plan for the factory.
3. Close the Bluefin `uupd` gap and the KDE add-on gaps of Aurora. Do one package
   at a time.
4. Add a parity CI job. The job checks the curated selection and behavior of
   every table entry against Fedora, EL10, Ubuntu, and Debian availability. It
   fails when a change adds an external repository or copies an upstream image.

An intake entry is not a release promise. It becomes supported only when
all of these checks pass: source provenance, license, native package build,
staged-repository install, and the desktop smoke tests that apply.
