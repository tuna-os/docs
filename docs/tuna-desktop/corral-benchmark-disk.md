---
sidebar_position: 12
title: "corral benchmark disk"
---

The `Marlin performance samples` workflow can export one CI-only paired desktop fixture. It reuses the coherent GNOME 51 baseline, explicit stock or instrumented diagnostic reference, guarded Tuna package installation, kernel/critical-file receipts and guest probes already used by the benchmark workflow.

Dispatch with `export_disk=stock` (or `diagnostic`), `export_only=true`, `package_run=<successful ci run>` and `candidate_commit=<exact package source SHA>`. Also supply benchmark_ssh_public_key with one plain Ed25519 public key. The exporter validates it with ssh-keygen and records its fingerprint and hash. The fixture enables root public-key authentication through an immutable /etc key path and generates host keys before sshd starts; passwords and keyboard-interactive authentication are disabled. The private key stays on the caller host. Actual boot and SSH access remain unqualified until Corral verifies the exported disk. Default package source remains trusted main/push. To qualify an unmerged approved candidate, set `package_source=candidate`: this requires an explicit successful, completed `ci.yml` **workflow_dispatch** run at the exact requested SHA in the original repository, matching artifact owner and API digest. Forks, pull request artifacts, foreign workflow artifacts, absent digests and implicit candidate fallback are refused. The package archive and installed native bytes still pass the existing validators. No signing, release or performance qualification follows from this provenance.

The `marlin-benchmark-disk-<profile>` artifact contains `disk.qcow2`, `manifest.json`, `SHA256SUMS`, QEMU info/map, native package member hashes, protected GNOME reference and critical kernel/file evidence. The observer/export source revision and actual candidate package source revision are recorded separately. The paired fixture starts GNOME by default and includes the Tuna trace session entry so one owned VM can switch desktops sequentially; acquisition and cleanup remain the Corral adapter's responsibility.

The disk is 18 GiB virtual for a requested 20 GiB filesystem PVC, leaving room for CDI filesystem overhead. Its transfer and allocated qcow2 bytes are capped at 2 GiB; nonzero logical extent bytes plus transfer bytes plus a 512 MiB guest-write allowance must fit a 7 GiB estimated peak. These are export admission bounds. They do **not** prove node usage: CDI scratch, conversion/preallocation, actual filesystem overhead and guest writes must be inspected on the target node. DiskPressure, configured filesystem/imagefs reserves or insufficient measured headroom still block import. Nothing runs a bootc builder on the KubeVirt node.

Download the authenticated GitHub artifact, verify `SHA256SUMS` and manifest identity, extract the qcow2, then use an owned CDI upload through Corral. The GitHub artifact ZIP endpoint is not a public HTTP qcow2 URL. A direct remote import needs a separately authorized reachable endpoint. Preserve UEFI, target node, unique VM/DataVolume ownership and TTL; do not alter unrelated workloads.

Checks in this change cover finite metadata/extent bounds, original-repository exact candidate provenance, independent compressed/expanded limits and export-only workflow guards. An exported GNOME image, successful CDI import, paired GPU/power measurements and benchmark result remain pending CI and the authorized host run.

Primary CDI references: [supported image upload formats](https://kubevirt.io/user-guide/storage/containerized_data_importer/), [filesystem overhead in DataVolume storage](https://github.com/kubevirt/containerized-data-importer/blob/main/doc/datavolumes.md), [scratch-space requirements](https://github.com/kubevirt/containerized-data-importer/blob/main/doc/scratch-space.md).

## Composefs ESP materialization

Before hashing the final raw disk or converting to qcow2, composefs exports materialize the source image's real `vmlinuz` and `initramfs.img` into the owned ESP's `vmlinuz` and `initrd`. This follows Corral's existing zero-filled ESP workaround in `pkg/kubevirt/bootc.go` (source commit `0dfd85afb3a1a0f3b1b29686249a6eeac8395bfe`, file SHA256 `0e67a1be570a7101e0e840ba1c6375c3aed5c2aa2b8accba609f573356a2de67`). The exporter strengthens discovery: exactly one source kernel version, one FAT partition belonging to its loop tree, and one genuine `EFI/Linux/bootc_composefs-*` target are required. It never chooses the first ambiguous candidate. Source bytes must match the original protected baseline critical hashes, and copied ESP bytes must match those same hashes. Native packages and the protected image are not modified by this repair.

`manifest.json` records `esp_repair` with exact source image ID, kernel version, protected critical receipt hash, owned loop/partition/container/mount identities, target, member sizes and before/source/after SHA256s. `esp-repair.log` records command execution. Unmount and loop/container cleanup are attempted on failures; loop backing ownership is checked again before detaching. Failure to clean resources is fatal and retains the raw backing/scratch rather than unlinking a mounted or attached image. This is a disk byte repair, not boot qualification.

Focused fake-command tests cover ambiguous discovery, baseline mismatch, copy/hash/sync/mount failures and fatal cleanup errors. A bounded 64 MiB synthetic FAT/loop probe also exercised real kernel mount/copy/sync/unmount/detach operations and source hash equality; its source bytes were synthetic, not a GNOME image. Actual composefs image boot and SSH access still require CI export and the authorized Corral guest run.

## Owned command deadlines

The disk exporter and ESP repair use new process sessions with finite command
limits: fixture build and disk install 1,800 seconds each, compression 900 seconds,
check/baseline 180 seconds, and queries/ESP operations 60 seconds. Resource removal,
unmount and detach are limited to 30 seconds. Queries allow at most 4 MiB of output;
long build/install phases allow 64 MiB. Temporary output files avoid pipe deadlocks.
Each command records its deadline, elapsed time, output bound and leader reaping in
`manifest.json` (ESP commands under `esp_repair`). TERM is followed by KILL and a
bounded leader reap and Linux process-state check for executing group descendants; privileged children use an owned group signal through noninteractive
sudo. These are command deadlines plus bounded shutdown, not image performance
measurements.

Every Podman run has a UUID name assigned before launch. Explicit bounded removal
and absence checks cover containers/conmon that outlive the CLI. A timed out build
uses `--force-rm`, but this does not prove all Buildah working containers disappeared;
its cleanup is reported uncertain and scratch is retained. Successful install
cleanup reconciles exact raw backing loops, refuses mounted or replaced backing,
and confirms no matching loop remains before unlinking. An ambiguous ESP loop
allocation response is reconciled the same way. Failed process/container/mount/loop
cleanup is fatal and retains backing; no foreign container or loop is adopted.
Focused tests use fake commands and tiny owned process groups, with no image build,
import or native boot qualification.
