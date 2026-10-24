---
title: "Multi-Variant Strategy: Lessons from TunaOS"
slug: multi-variant-strategy
description: "How shared configuration, cell-specific evidence and lifecycle rules shape a multi-base image factory."
draft: true
---
Adding a distribution to an image factory is easy to describe: choose a base and
apply the desktop. That choice is harder to maintain. Every new base can change
package names, service defaults, kernels, driver availability, and the meaning
of a successful install.

TunaOS provides a useful architecture to examine because it separates shared
build mechanisms from variant policy. This final article explains that design
for distribution teams that want their own matrix. It describes the trade-offs
visible in the repository. It makes no claims about adopter outcomes or the
intentions of the founders.

<!-- truncate -->

## Model the product before copying scripts

Start with three axes: the base distribution, the desktop, and the hardware
layer. Add architecture as an explicit constraint. These dimensions describe a
cell to build and test, not a promise that every possible combination exists.

TunaOS records the matrix in [tunaos.toml][config]. Its [configuration
tool][compiler] validates the source and emits compatibility inputs used by
consumers. The [resolver][resolver] maps a flavor to build parameters. Family
Containerfiles and common scripts use those parameters.

This separation matters when a policy changes. If a flavor belongs in the
configuration, a copy of its name in unrelated scripts creates more sources to
update. A generated adapter gives an existing consumer the format it needs
without making that format the owner of the decision.

Configuration migrations are a special hazard. Setup can generate a path that
appears in a Containerfile. Git need not track that source. Read the compiler
and [migration notes][migration] before you edit it. The same rule applies to
prose. A guide that tells contributors to edit a retired manifest sends them to
the wrong layer.

## Share mechanisms, preserve differences

Distribution families do not agree on package names or dependency structure. A
desktop metapackage on one base may correspond to many packages on another. A
package count is therefore a poor test of desktop completeness.

The common [desktop installer][installer] handles package-family differences and
consumes generated manifests. The primary configuration contains the package
policy that feeds those inputs. This distinction lets maintainers improve a
mechanism once and preserve the package choices needed by different bases.

Ask two questions in review. Is the behavior common to all bases? If so, put it
in shared code. Does the behavior depend on one distribution's package layout or
service names? If so, represent that difference explicitly and test the affected
branch. A silent fallback to a familiar base can hide a missing implementation
until a user boots it.

Do not select a base by its version string alone. The [Hummingbird
reference][hummingbird] explains its hardened fork of Rawhide. A familiar
package suffix is not enough evidence to apply another variant's assumptions.
Start from the declared base and package sources.

## Build dependencies belong in the graph

A desktop image needs its base. A hardware overlay needs the appropriate parent
image. Those relationships belong in the build graph, where CI can schedule
independent work and respect dependencies.

The [pipeline][pipeline] and [workflow][workflow] show how TunaOS divides stages
and passes matrix data. A downstream team should inspect the actual `needs`
relationships when they change a stage. A call to the right script is
insufficient if it consumes the wrong parent or runs before its inputs are
available.

Publication is another boundary. A local build does not prove that a registry
tag points to those bytes. Check the signature identity and the image in the ISO
separately. Keep the build run, source commit, platform digest, and artifact
receipt connected during investigation. Do not copy a temporary publication
result into a permanent guide.

## Test the experience in each cell

Shared code reduces the duplication in maintenance. Results from one base do not
automatically apply to another. The same desktop can need a portal package,
schema, or service integration that has a different name or lifecycle on a
second base.

TunaOS's [green criteria][green] and [machine-readable contract][contract] make
quality claims explicit. The [generated results][matrix] are the place to look
for evidence about a cell. A declared cell, a built image, and a verified
installation are different observations.

For your own factory, define a small set of observable outcomes. Can a user log
in? Does the expected desktop start? Are file access, authentication, and
application integration present? Can the installed system update and return to a
previous deployment?

Run checks at the layer where the outcome occurs. An assertion about the source
cannot prove that the final image retained a file.

The repository's [agent guidelines][agents] collect failures that shaped this
approach. One lesson is to test the final writer. A later step in the build can
overwrite an earlier customization. Also check the shipped artifact. A script
can run without a call to the relevant branch. These are review techniques that
apply well beyond operating system images.

## Coordinate releases without inventing support

More matrix entries create more work: builds, storage, tests, failure triage,
and lifecycle decisions. A support label needs an owner and a definition. Do not
inherit an upstream distribution's support term as a promise for the assembled
desktop product.

The [variant lifecycle policy][lifecycle] provides the repository's admission
and retirement framework. Read it before you propose another flavor. Identify
what makes the new combination useful and which tests exercise it. Name who
monitors failures and what happens when an input becomes unavailable.

Keep documentation tied to those sources. A static article can explain how to
choose a base, but it should not become a second table of today's green cells.
Link generated evidence for operational status. If your team publishes its own
status summary, derive it from the contract for release checks. Do not copy
results by hand.

## Contribute a bounded change

A new contributor can help without adding a distribution. A missing package
mapping, a focused regression check, or a corrected guide can remove a failure
for existing users. Read the [contributor guide][contribution] and check current
main and open PRs for duplicate work.

Use a fork and a focused branch from the required base. Identify the affected
cell and the artifact or test that demonstrates the problem. Change the owner of
the behavior, run the required checks, and include results in the PR. Keep
credentials and private user data out of logs. Let maintainers review and merge
through the repository's normal gates.

For user documentation, the [docs repository][docs] owns blog posts and pages at
the top level of the docs tree. A daily workflow copies many project pages from
other repositories. Edits to a generated copy can disappear on the next sync.
Confirm ownership before you edit. This is the documentation version of the same
configuration rule: change the source, then regenerate the consumer.

## Build the smallest matrix you can maintain

The attraction of a shared factory is choice with less duplicated code. The cost
is that every admitted cell still needs evidence. Start with a narrow matrix and
a traceable image identity. Prove the complete lifecycle of a cell before you
expand the matrix.

The bootc trade-off is similar. It gives operators an OS artifact and a recovery
boundary. Application data, local configuration, and hardware validation remain
real work. [Part two](./2026-10-24-cloud-native-desktop-architecture.md)
explains those limits. [Part one](./2026-10-24-choosing-your-tunaos-variant.md)
turns them into a first-machine evaluation.

For teams that evaluate the platform, the next step is concrete. Choose one cell
and record its inputs and outputs. Test boot, install, update, and recovery.
Expand when you can repeat that evidence.

[config]: https://github.com/tuna-os/tunaos/blob/main/tunaos.toml
[compiler]: https://github.com/tuna-os/tunaos/blob/main/scripts/config.py
[resolver]: https://github.com/tuna-os/tunaos/blob/main/scripts/resolve-flavor.sh
[migration]: https://github.com/tuna-os/tunaos/blob/main/docs/PRIMARY-CONFIG-MIGRATION.md
[installer]: https://github.com/tuna-os/tunaos/blob/main/build_scripts/desktop/install-desktop.sh
[hummingbird]: https://github.com/tuna-os/tunaos/blob/main/docs/HUMMINGBIRD.md
[pipeline]: https://github.com/tuna-os/tunaos/blob/main/docs/PIPELINE.md
[workflow]: https://github.com/tuna-os/tunaos/blob/main/.github/workflows/build-variant.yml
[green]: https://github.com/tuna-os/tunaos/blob/main/docs/GREEN-CRITERIA.md
[contract]: https://github.com/tuna-os/tunaos/blob/main/.github/green-criteria.yml
[matrix]: https://github.com/tuna-os/tunaos/blob/main/docs/MATRIX-STATUS.md
[agents]: https://github.com/tuna-os/tunaos/blob/main/AGENTS.md
[lifecycle]: https://github.com/tuna-os/tunaos/blob/main/VARIANT-LIFECYCLE.md
[contribution]: https://github.com/tuna-os/tunaos/blob/main/CONTRIBUTING.md
[docs]: https://github.com/tuna-os/docs/blob/main/CONTRIBUTING.md
