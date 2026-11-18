---
sidebar_position: 26
title: "gnome shell common 2026 09 26"
---

The wootc experiment installed a pinned Yellowfin image in a VM and created an
account. GDM repeatedly crashed on the first boot:

```text
Settings schema 'org.gnome.shell' is not installed
```

The image had `gnome-shell-50.0-3.el10` and no `gnome-shell-common` RPM.
The main RPM required the common package but also provided the same name and
version. The solver could satisfy that dependency with the main RPM itself.
Only the common RPM contains `org.gnome.shell.gschema.xml`.
This was not a stale cache: the XML was absent.

The source is factory run [33857079036](https://github.com/tuna-os/tunaos-packages/actions/runs/33857079036),
artifact `9934887804`, named `publish-rpm-gnome50-el10-x86_64`.
The common RPM has SHA-256
`a3db660a7e453cf1364757a7e2fff10cbbaf0df8467e0a67f5247b0c459d05d2`.
Both RPM headers name `gnome-shell-50.0-3.el10.src.rpm` as their source.

We installed only that common RPM into a separate clone.
The offline chroot found the schema without a manual cache rebuild.
But the next boot still lacked it: composefs exposed the original image of `/usr`,
not the modified deployment files. We kept the original disk.
This establishes the missing dependency, not a usable desktop or a published repair.
The runtime test needs a derived OCI image and a fresh installation.

The fix removes the main package's false `Provides` and `Obsoletes` entries in
GNOME 50 and 51. Both specs retain their exact `Requires` on the real common RPM.
The release increments force new package versions.

CentOS Stream 10's `rpmspec` parsed both patched specs. The main packages need
their matching common versions and no longer provide that name. The real common
packages still provide it. Tests check the dependency and schema ownership in
both specs. See the [RPM headers](https://github.com/tuna-os/tunaos-packages/blob/main/docs/evidence/gnome-shell-common/published-rpms.log)
and the [EL10 results](https://github.com/tuna-os/tunaos-packages/blob/main/docs/evidence/gnome-shell-common/patched-el10-specs.log).

Rebuild the RPMs, refresh the consumer image's package pin, then prove desktop
login and persistent work. Keep issue [#747](https://github.com/tuna-os/tunaos-packages/issues/747)
open until the rebuilt artifacts satisfy that test.
