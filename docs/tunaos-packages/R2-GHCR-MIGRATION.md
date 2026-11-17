---
sidebar_position: 14
title: "R2 GHCR MIGRATION"
---

## Scope and evidence

Inventory as of 2026-10-19. The goal is to remove the R2 dependency for publication, as [utah-packages](https://github.com/projectbluefin/utah-packages) does.
We must preserve installed systems and accumulated packages.
The original stage is a **manual, isolated publication rehearsal**, not the
completed migration. The ORAS work below also adds a disabled-by-default
production branch. No live objects, credentials, family tags, Worker routes
or consumer pins have changed.

### Publishers

| Path | Current behavior | Migration disposition |
| --- | --- | --- |
| `.github/workflows/publish-build-chain-rpms.yml` | R2 sync-down, sign/index accumulated RPMs, R2 sync-up, signed GHCR family image, HTTP verification | First candidate lane; preserve the shared `publish-rpms` lock |
| `.github/workflows/publish-tideforge-rpms.yml` | RPM target paths and mirrors on R2 | Separate follow-on with target/mirror coverage |
| `.github/workflows/publish-tideforge-debs.yml` | Debian/Ubuntu signed APT repositories on R2 | Keep live; APT is not an OCI client |
| `.github/workflows/publish-tideforge-arch.yml` | Arch package databases and packages on R2 | Keep live; Pacman is not an OCI client |
| `.github/workflows/publish-tideforge-gentoo.yml` | Gentoo binary repository and overlay on R2 | Keep live; separate format and consumer validation |
| `.github/workflows/build.yml`, `build-distributed.yml` | Legacy build/publication paths also reference R2 | Audit triggers and actual usage before retirement |
| `.github/workflows/package-factory-cell.yml`, `cas-gc.yml` | Build/action cache and CAS operations | Outside this distribution migration; do not disable/delete |
| `.github/workflows/pages.yml`, `r2-inventory.yml` | Catalog/inventory generation | Read paths also need inventory; Pages is not a substitute RPM origin |

Utah's `.github/workflows/publish-repository.yml` verifies and materializes
a prior OCI repository before adding the next wave. Its `/repository`
layout and digest-pinned consumption are the useful model. A catalog page
does not itself serve a usable DNF/APT/Pacman repository.

### Consumers and routes that prevent an immediate R2 shutdown

- Installed-system definitions and bootstrap scripts: `contrib/tuna-os.repo`,
  `contrib/install.sh`, `contrib/install-gnome49.sh`; including URLs for the public GPG key.
- Mock buildroots: `mock/*.cfg` use `repo.tunaos.org` family and target URLs.
  Some also materialize Utah repositories on disk. These do not replace all HTTP repos.
- Factory measurements/plans: `manifests/package-factory.yaml`,
  `scripts/list-served-nvrs.py`, `scripts/verify-published-wave.py` and callers
  depend on live indexes and package reachability.
- `workers/repo-proxy.ts` routes existing URLs to R2. The `/repo/...`
  transform and direct family paths are distinct. This change preserves those routes.
- tuna-os/tunaOS image builds already have digest-pinned GHCR inputs and
  `/repository` bind mounts, but installed-system HTTP access remains a
  separate contract. Audit each image's enabled repositories before cutover.

## Rehearse publication without R2

After maintainers review and merge this workflow, manually run
`publish-oci-candidate.yml` on main with:

1. One planner-recognized build-chain `cell`, such as `gnome50-el10-x86_64`.
2. The `sha256:...` digest now behind that cell's live GHCR family tag.
3. A completed main-branch `publish-build-chain-rpms.yml` `wave_run_id` with
   a retained `publish-rpm-<cell>` artifact. Partial-failure builds may have useful RPMs.
   The validator rejects cancelled, unfinished, unrelated and fork runs.

The lock prevents updates to the live tag while the candidate validates it. The requested digest must equal the selected cell's
current tag, and must verify under the exact main build-chain publisher's
keyless identity. Registry pull or verification failures stop the job;
there is no empty seed, alternate registry, R2 fallback, or tag substitution.

The seed must carry nonempty architecture-matching RPMs and GPG-verifiable
repodata. The workflow materializes the seed first. It then calls the shared script for RPM signatures,
reverse dependencies, deduplication, the no-shrink guard, and repomd signatures.
Foreign-package eviction is intentionally not enabled for this rehearsal.

The output is a new, signed
`<cell>-candidate-<run-id>-<attempt>` tag and immutable digest. No production
tag advances. The run uploads signature evidence, input run metadata,
digest and signed repomd. A failed push/signature step is not a promoted or
qualified repository. Candidate tags have a different signer workflow;
production trust policies must not silently accept them as live indexes.

### Cost measurement boundaries

The candidate publication job makes **no calls to the R2 API**: no R2 secrets,
rclone configuration, sync-down, sync-up or HTTP origin verification.
The old path enumerates/downloads an accumulated family and uploads/syncs
its next state on every publish. Avoided request counts and bytes depend
on the family tree and rclone listing/comparison behavior; do not claim a
bill reduction from YAML alone. The source wave may have been built and
published using R2 before the rehearsal, and mock/build/cache consumers
still use it. Record actual R2 operation/byte telemetry for comparable
waves before you claim cost savings. The draft does not access invoices.

## Promotion and retirement checklist

- [ ] Execute the candidate for each intended family/architecture. Compare
  package NEVRA/checksum inventory with the seed and the staged wave. Explain
  every intentional supersession; old package names must not disappear.
- [ ] Pull the **candidate digest** on a fresh runner. Verify the exact signer identity and GPG repodata. Check package checksums.
  Do a representative DNF dependency resolution/install with
  `gpgcheck=1` and `repo_gpgcheck=1`, including the actual image install set.
- [ ] Prove candidate publication works with no R2 credentials. Archive
  successful run evidence and measure data/request deltas.
- [ ] Design serialized live OCI advancement with verified previous-digest
  carry-forward and stale-base rejection. Add a safe initial bootstrap and
  rollback procedure. A manual stale digest must never replace newer work.
- [ ] Move image/build consumers to verified digest pins, with architecture
  mapping and complete install/boot qualification. Preserve a known-good pin.
- [ ] Separate the live HTTP compatibility publisher from the authoritative
  OCI pipeline. Preserve incremental/additive packages, metadata signatures,
  and no-shrink guards. Verify actual existing URLs on installed systems.
- [ ] Choose and validate an HTTP distribution solution for DNF/APT/Pacman
  and Gentoo before ending their R2 updates. OCI registries alone do not
  provide their repository protocols. Get approval for any route changes.
- [ ] Audit legacy writers, GPG keys, catalog assets, buildroots, scheduled
  jobs and non-image consumers. Treat cache/CAS costs independently.
- [ ] Only after qualified consumer migration and a rollback window, retire
  redundant publication to R2. Object deletion and credential changes need
  separate approval and are not part of this change.

Do not close #912 on the strength of this first-stage rehearsal alone.

## ORAS transport and the Utah distribution model

Utah main `96856f43e3bbef8e9e40e8e26c5fab654e71e3c0` publishes a signed OCI
image with Podman. The RFC for its ORAS lookaside proposes a source contract.
It does not supply a package publisher. We reuse the coherent repository,
immutable digest and local native clients. ORAS transports bytes; it does not
replace the package manager.

The candidate workflow uses official ORAS **1.3.4**. The code records hashes
of archives for both runner architectures. `scripts/oras_distribution.py` creates
an OCI layout with standard image/config/layer media types and `/repository`.
`oras cp --from-oci-layout` copies that image to the candidate tag.
A generic `oras push` artifact does not supply the root filesystem that
`COPY --from` consumers need.

The publisher calculates the manifest digest locally before upload. All signatures and round-trip checks use that digest,
not the mutable tag.

The pull command needs a GHCR digest and the exact identity of the Cosign workflow.
It verifies the signer before ORAS downloads the layout. It checks the bytes
of the manifest, config and layer. It checks the target, format and architecture,
and rejects members that are unsafe. Only then does an atomic rename expose
the repository. It never executes package content.

Failure leaves no destination repository. There is no HTTP, empty-tree,
alternate-registry or R2 fallback. It rejects images without signatures or
scope labels. For its old seed, the rehearsal retains
the verified import path through Podman.

It preserves whole repositories and signatures for RPM, openSUSE,
DEB, Arch and Gentoo. It converts safe aliases of files to ordinary files
with identical bytes.
Examples include Arch database symlinks. It preserves all native
metadata.

It does **not** replace GPG verification, native indexes,
dependency-closure checks, target admission or tests of native installation.
The RPM candidate retains the shared wave merger and its checks for signatures
and reverse dependencies. It compares the pulled tree with the original and
verifies the repomd signature again.

Labels for format, target and architecture describe scope, not native
validation. Callers must use the planner for their format and retain its
signature and solver gates. The code supplies the isolated RPM candidate and
an opt-in branch for build-chain RPMs. We have not dispatched either workflow.
No live publisher, consumer pin, tag, HTTP route or credential has changed.

APT and Pacman remain native clients. Before cutover, materialize the verified
tree as a local repository or get approval for a compatible HTTP origin.

### Verification boundaries

Tests use fixtures for every format and both architectures. They check
deterministic digests, byte preservation and a real ORAS copy between layouts.
They test corrupt or absent identities, scope mismatches, unsafe archive
members, signature failures and registry errors. These fixtures are not real
packages with native signatures.

The controlled rehearsal and qualification checklist above remain necessary.
They must cover live GHCR publication, real Cosign/OIDC checks, native dependency
resolution, package installation, COPY consumers and upgrades of installed systems.
Local tests alone do not complete production migration.

Official transport and installation references:
[ORAS copy](https://oras.land/docs/commands/oras_cp/) and
[ORAS installation](https://oras.land/docs/installation/).

## Opt-in build-chain production branch (not activated)

`publish-build-chain-rpms.yml` keeps `distribution: r2` as its default.
The `oras` branch needs all these operator choices after review:

- Set `ORAS_PRODUCTION_ENABLED=true` and a JSON `ORAS_PRODUCTION_CELLS` list
  in repository variables. This code does not set those variables.
- Supply an explicit `oras_seeds` JSON map. It must contain exactly the selected
  cell IDs and their current digests. Each digest identifies an immutable manifest.
  No empty seed or tag bootstrap exists.
- Use main, retain target admission and hold the shared `publish-rpms` lock.
  A dry run cannot promote a repository. For admitted cells, the planner rejects
  publication from R2. Thus an old tree from R2 cannot overwrite their newer state.

The publication job receives no R2 credentials and never calls R2.
It verifies its output directly, not through an HTTP substitute.
Before Podman imports the old image, it verifies that cell's signed digest.
This bootstrap path accepts the existing OCI format without scope labels.

It retains and verifies the accumulated repository. It checks the architecture
and dist of the wave, then calls the existing RPM merger.
It does not evict foreign packages.

The native verifier creates fresh trust databases for GPG and RPM.
It imports only committed `public.gpg`. It needs RPM signatures, not only valid
digests. It verifies both the seed and the final repository after pull.
If the secret and public keys do not match, publication fails.
This rule applies even if the runner already has the secret key.

The publisher uploads a temporary tag unique to the run. It signs the local
digest, verifies and materializes that digest, then compares all bytes.
It verifies native signatures again and rechecks the previous live digest.
Only then may `oras tag` update the cell channel.
A receipt retains the prior digest for rollback.

An intent record precedes the tag command. The job uploads that record even
on failure. A timeout or failed read after the write leaves the result
**uncertain**; it does not prove that the tag stayed unchanged.
Inspect the current digest before any retry.

### Single-writer activation prerequisite

An OCI tag PUT is atomic for one manifest, but is **not compare-and-swap**.
The second read is safe only if every writer uses the shared lock.
Before activation, restrict or disable all other writers to admitted cell tags.
This includes manual, external, old-revision and legacy writers.
All writers must honor the same lock.

Admission variables in the new workflow do not control old revisions or
unrelated registry credentials. Do not activate until operators enforce this
restriction and a rehearsal of failure cases passes.
Rollback needs separate authorization. First confirm the channel's current
state. Then hold the same lock and move to the retained, verified prior digest.

This branch changes publication only. The build job still uses the existing
buildroot, cache and source paths. Thus an ORAS publication does not prove
that the full factory has no R2 dependency.
This branch does not switch the Tideforge RPM, DEB/APT, Arch/Pacman or Gentoo
publishers. Each needs explicit contracts for seeds, admission, signatures and
solver checks; an RPM-specific merger is not a substitute.
The transport preserves their formats, but fixtures do not qualify their
production pipelines.

### Capacity and runtime

The image uses one uncompressed layer. This preserves transparent bytes and
simple verification, not minimum download size.

GitHub documents a limit of 10 GB for each layer and 10 minutes for each upload.
See [the registry limits](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#troubleshooting).
That limit is a documented figure, not a measured one.
The registry holds a layer of 19,508,954,174 bytes: the `hummingbird-aarch64` tag of `ghcr.io/tuna-os/tunaos-packages`.
A `HEAD` request on its blob returned that length on 2026-10-25.

By default the publisher applies a conservative policy ceiling of 9,000,000,000 bytes.
It rejects a serialized layer above the ceiling before it reads package contents or creates the layout.
The size includes tar headers, PAX headers and padding.
The error text says that the ceiling is a policy and not a measured registry limit.

After the size check, `prepare` computes a SHA-256 digest for each file in bounded chunks.
It compares each archived payload with that digest before it publishes an OCI index.
A file can keep its size and timestamps even when its bytes change.
A source can return to its original bytes after the archive has read different bytes.
The check uses the actual archive, so it catches both cases.
Both digest passes use bounded reads and no second temporary archive.

A larger repository needs an explicit override.
An example is the 32 GB `hummingbird` x86_64 family.
Use `--max-layer-bytes N` on `prepare`, or set `ORAS_MAX_LAYER_BYTES=N`.

N must be a positive integer of bytes.
Any other value is an error, and so is an empty value.
The flag wins over the variable.
A layer above the override is still rejected.

Nobody has qualified an upload above 19,508,954,174 bytes.
Raise the ceiling only after a candidate run of that size succeeds.
More scratch space does not change the ceiling.

Before upload, the publisher also checks for
`2 * repository_bytes + 1 GiB` of spare capacity.
Archive overhead and concurrent users can still exhaust disk space.
A layer below the ceiling can still exceed the upload timeout on a slow link.
The job timeout does not extend that registry timeout.

Such failures stop before the channel advances. Production jobs have a
180-minute limit; candidate jobs have a 120-minute limit.
The successful 522 MB candidate does not qualify large families.
The publisher streams the archive once to the selected layout filesystem.
It does not create a second temporary tar. It removes the upload layout before
pull and uses `/mnt` for scratch space where possible.

The verifier enforces these limits:

- 4 MiB per metadata blob.
- 1,000,000 members per archive.
- 64 GiB per file.
- Total extracted bytes no greater than the verified size of the raw layer.

It rejects sparse files, links and special members during extraction.
Before publication, the publisher converts aliases that are safe to ordinary files.

## Minimal no-R2 consumer path and compatibility decisions

The tunaOS guide prescribes `uupd`/`bootc` for image updates.
It prescribes Flatpak, Homebrew and containers for applications.
Those users do not need a new HTTP service for native packages solely because
the build repository moved.

For the minimal core path, materialize verified ORAS/OCI repositories during
image builds. Use native package managers with those local repositories.
Retain all signature and dependency checks. After the final native transaction,
remove or disable temporary configs. Day-2 image updates remain GHCR-based.

Utah follows this pattern. Its Containerfile binds the repository during the
build and disables the temporary repo after the last install. See
[Utah's final repository cleanup](https://github.com/projectbluefin/utah/blob/17222de27c6db6c0a32eb704c72814ff8f7b644d/Containerfile#L346-L366).
The disable comment changes the file size so the layer diff retains that edit.
Verify cleanup in the final image; do not infer success from the command alone.

Standalone native use has a separate compatibility contract.
`contrib/install.sh`, `contrib/install-gnome49.sh` and `contrib/tuna-os.repo`
promise DNF installation and updates over `repo.tunaos.org`.
Do not silently break those interfaces or label them build-only.
Operators must approve either a compatible HTTP origin without R2 or an explicit
retirement or migration of that interface. This code makes neither choice.
Existing R2 endpoints stay untouched until that decision and consumer rollout.
