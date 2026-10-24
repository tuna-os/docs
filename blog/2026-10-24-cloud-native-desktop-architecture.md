---
title: "Cloud-Native Linux Desktop: Architecture and Bootc Integration"
slug: cloud-native-desktop-architecture
description: "Trace the image build, deployment boundary, and recovery limits of a TunaOS desktop."
draft: true
---
Teams that manage infrastructure use container recipes and promote digests. A
bootc desktop applies those practices to an operating system. The image includes
the system userspace and the pieces needed to boot it; the installed machine
uses bootc to manage deployments of that image.

The useful question is what this changes for operations. Which changes belong in
a build? What persists on a host? What does rollback recover? This second
article follows those boundaries through TunaOS and turns them into a pilot plan
for an infrastructure team.

<!-- truncate -->

## An operating system delivered as an image

TunaOS's [primary configuration][config] declares variants, flavors, and build
relationships. Containerfiles and build scripts turn those choices into OCI
images. A registry stores the output, and bootc manages the installed OS's image
source and deployments.

This gives a team an artifact it can name, test, and promote. A tag is a
convenient reference that can move. A digest identifies the content. Record the
digest when you investigate behavior. Two machines that track the same tag at
different times may have pulled different images.

Image delivery does not remove package managers from the process. The build
still needs the base family's package mechanisms to assemble software. It moves
the system change into a build recipe. A host can consume the tested result
instead of a separately resolved set of package changes. Applications and
development environments can have a separate lifecycle from the host OS. Teams
still need to decide who maintains those layers.

## Follow the TunaOS build path

The [pipeline reference][pipeline] describes the stage graph, and the
[orchestrator][orchestrator] expresses the dependencies that CI runs. Read them
with the configuration and scripts: older prose can lag a configuration
migration. The main path is:

```text
primary configuration → generated build inputs → base image
                                              → desktop stage
                                              → hardware overlay
                                              → image checks and publication
                                              → installed bootc deployment
```

The base stage sets up the distribution foundation and shared system pieces.
Desktop installation adds the session and its components. Hardware overlays add
the relevant kernel or driver changes on top of the appropriate parent. The
shared resolver selects the Containerfile and parameters for a cell. Variants
can share this procedure.

The primary configuration also owns the package data for desktops. Generated
manifest paths can still appear in installers and Containerfiles; those paths do
not make the generated files the place to edit policy. Check the [configuration
migration reference][migration] and the actual compiler consumers before you
change package lists.

The matrix uses Containerfiles and reusable workflows in GitHub Actions. The
configuration lists sibling images that use BuildStream, such as Tromsø and XFCE
Linux. Those products have their own builds and gates. Their existence does not
make BuildStream the engine for every TunaOS variant.

An ISO is another artifact built from an OS image. Its boot and installer
behavior need their own evidence. A successful image build does not prove that
USB media reaches a desktop or that the installed system boots. That is why the
[quality criteria][green] distinguish build, boot, install, and lifecycle
checks.

## Understand the writable boundary

Upstream bootc documents the [filesystem model][filesystem]. System content such
as `/usr` belongs to the deployment. Host configuration and application state
have different lifecycles, and filesystem options can change persistence
behavior. Inspect the selected image's configuration because bootc hosts can use
different storage settings.

A read-only tree protects the system binaries from routine changes on the host.
It does not make the machine stateless or protect every file from a privileged
operator. Host configuration, user files, credentials, application data, and
container storage still need ownership and backup policies.

OSTree is relevant to deployment storage and history on systems that use that
backend. Composefs and bootc's storage choices are also part of the current
upstream design. Bootc does not mean that every change needs rpm-ostree. Use the
bootc interface and the documented storage behavior of the selected image.
Variants can have different tools for layers.

## What atomic updates promise

Read upstream's [upgrade and rollback reference][upgrades] for the operation and
its options. A staged OS deployment lets a machine retain its current system
while it prepares the next one. Reboot is the point at which you exercise the
new booted deployment. A downloaded image is therefore not evidence that the new
desktop, driver, or service has run successfully.

An operations record should distinguish the requested image from the booted
image. Capture `bootc status` before the change and after reboot. Check the
services and user workflows you need, and save the digest and results. The
question is whether this particular transition worked on this hardware.

Do not turn atomic deployment into a promise that updates cannot fail. A new
kernel can fail to boot, a driver can regress, and an application can reject
existing data. The model provides a deployment boundary for recovery; it does
not certify every new payload.

## What rollback leaves to you

Upstream's [rollback manual][rollback] describes a return to a retained
deployment. A previous deployment must still exist. Test recovery with the
actual boot setup of the machine. Keep another route to recovery if the new
system cannot reach a usable terminal or network.

Rollback is not a whole-machine snapshot. Shared application state is outside OS
version selection, and configuration behavior differs from application data
behavior. In particular, do not assume that a configuration edit made after an
upgrade will appear when you return to a previous deployment. Save configuration
needed for recovery independently and review upstream's `/etc` semantics.

For example, a service in a new image might migrate its database before an
operator decides to roll back the OS. Older service binaries may then reject
that database. Solve that with application backup, restore tests, and migration
policy. A previous kernel and userspace cannot undo an arbitrary data migration.
This boundary belongs in the adoption plan before the first fleet rollout.

## Overlays as reviewed system changes

TunaOS uses hardware layers to reuse the same desktop logic for every kernel and
driver choice. A downstream team can apply a similar pattern: keep a small
derived image, name its parent, and put required host changes in version
control. A parent update is an input change that needs validation.

Distinguish an OCI image layer built for distribution from a temporary writable
overlay used for debugging on one machine. The latter is not a replacement for a
durable build recipe. If a debugging change fixes a problem, reproduce it in the
owned image build and test the new artifact.

Use the same discipline for secrets: an image is distributed content, so it is
not a place for private host credentials. Provision those through the team's
host management process. An image recipe should explain system intent without
the identity of a particular machine.

## Reproducibility needs a precise claim

A source commit records the recipe, and digest pins constrain some inputs.
Neither proves that the bytes from a rebuild are identical. Package
repositories, unpinned inputs, build tools, timestamps, and artifact generation
can still change the output. Check [the version inputs][versions] and build
recipes for the scope of each pin.

Use **traceable artifact** when the evidence is a source revision, CI run, and
output digest. Reserve **bit-for-bit reproducible build** for a measured
comparison of rebuilds with the inputs and artifacts in question. The
[verification guide][verify] explains signatures and attestations; those
establish provenance under the stated trust policy, not reproducibility or
runtime correctness.

## Evaluate the model on one transition

Pick a test cell using [part one](./2026-10-24-choosing-your-tunaos-variant.md).
Record its source and digest, boot it, update it, and return to the retained
deployment. Exercise an application with persistent data through that cycle.
Check both local recovery and the team's remote administration path.

A successful pilot answers concrete questions: which source the host tracks,
what booted, what state persisted, and how recovery worked. It also leaves a
repeatable record for the next image. [Part
three](./2026-10-24-multi-variant-strategy.md) looks at how that evidence scales
across variants and desktops.

[config]: https://github.com/tuna-os/tunaos/blob/main/tunaos.toml
[pipeline]: https://github.com/tuna-os/tunaos/blob/main/docs/PIPELINE.md
[orchestrator]: https://github.com/tuna-os/tunaos/blob/main/.github/workflows/build-variant.yml
[migration]: https://github.com/tuna-os/tunaos/blob/main/docs/PRIMARY-CONFIG-MIGRATION.md
[green]: https://github.com/tuna-os/tunaos/blob/main/docs/GREEN-CRITERIA.md
[filesystem]: https://bootc.dev/bootc/filesystem.html
[upgrades]: https://bootc.dev/bootc/bootc-upgrades.7.html
[rollback]: https://bootc.dev/bootc/man/bootc-rollback.8.html
[versions]: https://github.com/tuna-os/tunaos/blob/main/image-versions.yaml
[verify]: https://github.com/tuna-os/tunaos/blob/main/docs/VERIFY-ARTIFACTS.md
