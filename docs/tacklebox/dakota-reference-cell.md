---
sidebar_position: 8
title: "dakota reference cell"
---

This is the triage record for the three failures reported by
[`tuna-os/tacklebox#180`](https://github.com/tuna-os/tacklebox/issues/180).
They are separate failure classes and must not be collapsed into one retry
result.

## Evidence

| run | observed failure | likely boundary | next evidence |
| --- | --- | --- | --- |
| 31131445981 | image build completed, but the live ISO produced serial output and never emitted `TUNAOS_LIVE_READY` during the 900-second gate | initramfs/live-root handoff | preserve the serial log and record the selected kernel, initramfs section list, and live cmdline |
| 31136095286 | build stopped at `Authoring EROFS live root… 0/1` after all 120 layers had unpacked | EROFS authoring or its input tree, not registry fetch | capture RSS, disk space, and the last authoring phase before changing the image |
| 31140381276 | build stopped at `Unpacking layer 2/120` with a small wasm payload | registry body stall (#156), not EROFS | require the fetch timeout/resume diagnostics and the final layer/byte offset |

The runs must remain three separate regression fixtures. A successful image
build does not prove that the ISO boots, and a layer-fetch retry must not be
interpreted as an authoring fix.

## What is already covered

The layer failure is addressed by `internal/oci/resume.go`: body reads have a
stall deadline, stalled streams are closed and resumed with a range request,
and header timeouts bound the reopen path. The existing OCI tests cover the
resume path. Do not remove that instrumentation while investigating Dakota.

The native pure-Go ISO path already separates the EROFS, ESP, and ISO phases
and the CI `pure-iso` job captures the serial boot log. The authoring phase
still needs a real Dakota-sized run; a watchdog timeout alone would hide the
phase that failed.

## Dakota acceptance checklist

Before declaring the reference cell green, run one build with:

1. OCI layer progress plus stall/resume messages retained in the artifact.
2. EROFS authoring progress, resident-memory and free-space samples retained
   at least once per minute.
3. The combined initramfs inspected as distinct raw and compressed sections,
   including the presence of both tbox hooks and the image's stock hooks.
4. A QEMU serial log retained until either `TUNAOS_LIVE_READY` or the 900
   second deadline; the kernel command line and selected initramfs are logged
   beside it.

Only after those artifacts exist should a Dakota rerun be used to validate a
code change. This prevents a random layer selection or a missing serial log
from turning three different bugs into an apparently flaky single test.

## Decision

No image-specific workaround is added here. Dakota should be rerun only with
the three evidence streams above and after the already-merged layer deadline
path is present in the tested binary. If the fetch trace is clean, the next
change should target EROFS authoring; if EROFS completes, the live-boot trace
should decide whether the stock initramfs is incompatible with the prepended
tbox overlay. This ordering keeps the expensive reference cell diagnostic
and avoids masking one failure with a workaround for another.
