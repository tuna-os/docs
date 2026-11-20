---
sidebar_position: 32
title: "performance profiling"
---

This guide is for contributors working on Tuna Desktop's CPU, memory and
frame cost. It covers local profiling and the compositor's own frame-cost
data. It also explains how the CI comparison against GNOME 51 works and
how to back a performance PR with evidence.

The measurement rules, budget file and report fields are specified in
[docs/perf/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md). This page tells you which tool to use
and where its output fits. When the two disagree, the perf README and the
scripts are authoritative.

## What "faster" means here

The v1 target is to match or beat GNOME 51 on CPU, frame pacing and overview
response on the same Marlin VM ([#503](https://github.com/tuna-os/tuna-desktop/issues/503),
[roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md)). Only a paired run counts toward that target: the
performance-baseline workflow measures GNOME 51 and Tuna Desktop on the same
runner, image and VM profile. Local numbers are useful for finding hotspots
and checking a fix. They are not parity evidence, because the hardware, GL
driver and workload differ.

The gated metrics (`scripts/tuna-perf-gate`, budgets in
[docs/perf/budgets.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/budgets.json)) are:

- `cpu.<phase>.<role>.<stat>`: CPU in percent of one core, per workload phase
  and process role.
- `frame_pacing.interval_ms.<stat>`: presentation intervals from the native
  frame-pacer probe.
- `overview.response_ms.<stat>`: QMP-observed overview response (an upper
  bound, not input-to-frame tracing).

The phases and roles are listed in the
[perf README's regression gate section](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md#regression-gate-315).
Memory (PSS/RSS) is sampled but not yet budgeted. #315 tracks memory and
growth budgets.

`scripts/tuna-shell-memory-profile --display :5N --artifacts DIR` replays the
gate's workload in a nested session with real X input and records, for the
shell and the compositor after every phase, `Pss`, `Pss_Anon`, `Pss_File`,
`Pss_Shmem`, `Private_Dirty` and `AnonHugePages` plus heap, arena and anonymous
totals from `smaps` (`--summarize DIR --against DIR` compares two runs). Read
`Pss_Anon` and `Pss_Shmem`: `Pss_File` moves with whatever else on the host
maps the same libraries. `--thp collapsed` gives the session transparent huge
pages as `transparent_hugepage/enabled=always` does on the perf image (most
development hosts keep `madvise`), which is where a sparse heap shows as
resident memory; `--trim` reports how much of the shell's heap is freed but
retained.

## Local CPU profiling

### Build with symbols and frame pointers

`scripts/tuna-nested run` builds debug binaries
(`scripts/tuna-nested`, lines 50–56). Profile release binaries instead:
debug builds put their cost in the wrong places. The workspace
`Cargo.toml` defines no release debuginfo, so pass it in the environment.
The [2026-10-15 attribution](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-15-cpu-parity-attribution.md)
used this setup (frame pointers and line tables):

```bash
RUSTFLAGS="-C force-frame-pointers=yes" CARGO_PROFILE_RELEASE_DEBUG=line-tables-only \
  cargo build --release -p tuna-compositor -p tuna-shell-host
```

Run the nested session from those binaries. These are the same flags
`tuna-nested` passes (`crates/compositor/src/main.rs` parses `--socket`
and `--shell-bin`):

```bash
target/release/tuna-compositor --socket tuna-prof \
  --shell-bin target/release/tuna-shell-host 2>nested.log &
```

### perf

Attach to one process for one workload phase at a time. For example, idle
for 20 seconds:

```bash
perf record -g -p "$(pgrep -n -x tuna-compositor)" -o compositor.data -- sleep 20
perf report -i compositor.data --no-children --sort symbol
```

`-g` uses the frame pointers built above. Use `--call-graph dwarf` when a
stack goes through C libraries built without frame pointers, such as Mesa or
pixman. Sampling needs `kernel.perf_event_paranoid` at 2 or lower for your
own processes, or root.

Use the same approach for the shell. `scripts/tuna-nested shell-pid
--socket NAME` prints its PID when you started the session through
`tuna-nested`. With the manual launch above, run
`pgrep -P "$(pgrep -n -x tuna-compositor)" 'tuna-shell-(host|gtk)'`.

Previous investigations used two perf modes that are worth reusing:

- Use `perf record -g -p <pid>` per phase to find hotspots. The
  [2026-10-15 attribution](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-15-cpu-parity-attribution.md)
  did this for the compositor and `tuna-shell-gtk`.
- Use `perf record -e sched:sched_wakeup --call-graph dwarf` to find out
  why a thread wakes up. The
  [2026-10-29 gate variance report](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-29-gate-variance.md)
  used it to trace llvmpipe wakeups to Smithay texture fences.

Flame graphs are optional. Any `perf script` consumer works, such as
Brendan Gregg's FlameGraph scripts or `inferno`. The repository does not
ship or pin one.

### Sysprof

Sysprof is how GNOME profiles itself. The paired CI lane starts the
installed GNOME Shell's Sysprof profiler over D-Bus during the overview phase
and decodes Mutter's frame scopes
([docs/perf/gnome-overview-sysprof.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/gnome-overview-sysprof.md),
`scripts/lib/gnome_sysprof.py`). Use Sysprof locally when you need the
GNOME side of a comparison. Tuna Desktop emits no Sysprof marks, so use
`perf` for Tuna processes.

### Rendering choice matters

The Marlin VM renders with llvmpipe, so GL work costs CPU there. A local
session on a hardware GPU hides that cost. The nested winit backend also
repaints in situations where the DRM backend does not
([2026-10-08 investigation](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-08-cpu-investigation.md), item 4).
To reproduce VM numbers, follow the 2026-10-15 report: use the DRM backend
on vkms with llvmpipe, and drive input with uinput.

## Frame cost in the compositor state

When `TUNA_COMPOSITOR_STATE` names a file, the compositor writes a JSON
state snapshot there whenever its state changes
(`crates/compositor/src/runtime.rs`, `publish_state`). Proofs and journeys
set it. A normal session does not. The `frame_cost` object has one entry
per output (`winit` in a nested session) describing that output's last
drawn frame (`FrameCost` in `crates/compositor/src/occlusion.rs`):

| Field | Meaning |
|---|---|
| `rendered` | Scene elements repainted in that frame |
| `culled` | Elements skipped because they are wholly under opaque elements |
| `damage_rects`, `damage_area` | Number and total area (physical pixels) of damaged rectangles |
| `damage_bounds` | `[x, y, w, h]` box around the damaged rectangles (output pixels, before rotation), or `null` |
| `output_area` | The output's area, for the damage ratio |
| `drawn_windows` | Window ids with any element showing on the output, repainted or not |
| `culled_windows` | Window ids entirely hidden behind opaque surfaces |

`throttled_windows` sits next to it. It lists windows whose frame callbacks
run at the hidden rate (about 1 Hz), or not at all once `suspended_windows`
lists them and their client was told ([protocols](https://github.com/tuna-os/tuna-desktop/blob/main/docs/protocols.md#suspended-windows)).
[docs/testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md#frame-cost) covers both fields and the
`G-OCCLUSION-CULL` proof that checks them.

```bash
TUNA_COMPOSITOR_STATE="$PWD/state.json" target/release/tuna-compositor \
  --socket tuna-prof --shell-bin target/release/tuna-shell-host 2>nested.log &
jq .frame_cost state.json
```

Two ways to use these fields:

- A `damage_area` near `output_area` while only the cursor or clock changes
  means a full-output repaint, which is usually a damage-tracking bug.
- A window that should be covered but appears in `drawn_windows` costs a
  draw every frame, and it also keeps full-rate frame callbacks.

`frame_cost` shows only the last frame. It has no frame times or counts, so
it shows what a frame drew, not how long it took. For overview
action-to-scanout timing on DRM, set `TUNA_PERF_TRACE=1`
(`crates/compositor/src/performance_trace.rs`), which emits
`tuna-perf-input:` records on stderr. See
[compositor-overview-tracing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/compositor-overview-tracing.md).

## Memory: RSS and PSS

The CI observer (`scripts/lib/tuna-perf-guest.py`, `read_smaps_rollup`)
reads `Pss` and `Rss` from `/proc/<pid>/smaps_rollup` once a second for
every process owned by the session user. Read the same file locally:

```bash
grep -E '^(Rss|Pss):' /proc/"$(pgrep -n -x tuna-compositor)"/smaps_rollup
```

- **RSS** counts every resident page a process maps, shared pages included.
  Adding RSS across processes double-counts shared libraries.
- **PSS** splits each shared page across the processes that map it. Summing
  PSS over a session's processes gives the session's footprint. Compare
  desktops with PSS.

Methodology the lane follows (see the [perf README](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md)):

- Sample after the session settles, not during startup.
- Compare the same phase on both sides.
- Treat a failed read as a failed measurement, never as zero.

GPU memory comes from the kernel DRM client usage counters. Those are
client-accounted bytes, not unique physical usage. For growth, compare the
settle phase against idle within one run. Long-run soak lanes live in
`scripts/tuna-vm-soak`. No soak memory budget exists yet (#315).

## Comparing against GNOME 51

The comparison runs in the `Marlin performance samples` workflow
(`.github/workflows/performance-baseline.yml`):

1. It builds one image from a pinned Marlin platform digest, synced to GNOME
   Shell 51.0 from a pinned Arch Linux Archive snapshot
   (`packaging/marlin/perf/Containerfile.baseline`), then installs a Tuna
   Desktop package from a trusted main CI run on top.
2. `scripts/tuna-perf-profile-pairs diagnostic`, then `stock`, run three
   alternating GNOME/Tuna pairs per profile. Each session uses
   `scripts/tuna-vm-perf` in the same QEMU/KVM profile (6 GiB, four vCPUs,
   1280×800 virtio) with the same guest workload.
3. `scripts/tuna-perf-gate check` compares the stock pairs with
   `docs/perf/budgets.json` and writes `perf-artifacts/perf-gate.json`
   and the job summary.

`scripts/tuna-parity-capture` compares screenshots, not performance. It
captures Tuna Desktop in the visual states that `tuna-gnome-reference`
captures GNOME in.

To measure a branch, dispatch the workflow. It measures main's package
with the branch's measurement code. To measure a candidate package, use
`package_source=candidate` with an exact `package_run` and
`candidate_commit`:

```bash
gh workflow run performance-baseline.yml --ref <branch> -f enforce=false
```

To re-check a finished run locally:

```bash
gh run download <run id> -n marlin-performance -D perf-artifacts
scripts/tuna-perf-gate check --artifacts perf-artifacts --report-only
```

Normalization rules:

- Ratios use Tuna / max(GNOME, floor).
- Only intervals wholly inside a phase count.
- GNOME's `gnome-shell` is compositor plus shell, so compare it with Tuna's
  `desktop` role.
- Compare runs from the same host CPU class only. Ratios move between
  EPYC and Xeon runners
  ([gate variance report](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/2026-10-29-gate-variance.md)).
- An `unstable` result means the 90% interval straddles the budget, so the
  run cannot decide that metric.

## CI regression gates

- **Every PR** (`.github/workflows/ci.yml`, `check` job): runs the gate's
  unit tests and the budget ratchet. A change to `docs/perf/budgets.json`
  must cite run evidence and must not loosen a budget without an ADR
  ([ADR 0009](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0009-performance-regression-budgets.md)). Check a budget
  file locally with `scripts/tuna-perf-gate validate`.
- **Nightly at 03:23 UTC and on dispatch**: the paired run enforces
  budgets. It fails on any enforced metric that exceeds its budget or has
  fewer than three stock pairs.
- **PRs that change measurement code**: the paired run executes in
  report-only mode.

No paired measurement runs on ordinary PRs, because one run takes about
three hours on a KVM runner.

## Contributing a performance change

1. Profile locally and name the hotspot (function, process and phase).
2. Fix it. Add a cheap deterministic test where you can, for example an
   invariant on what a frame renders. Never assert on elapsed time
   ([development guide timing rule](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#setting-up-your-environment)).
3. After merge, or by dispatching on a candidate, get a paired run. Link
   it with its host CPU class and the relevant `perf-gate.json` rows. If
   the run improved a metric, tighten the budget with
   `scripts/tuna-perf-gate propose` ([perf README](https://github.com/tuna-os/tuna-desktop/blob/main/docs/perf/README.md#how-budgets-ratchet)).
4. Record significant findings under `docs/perf/` as a dated report.

Avoid these mistakes:

- Claiming parity from a local or single-boot number.
- Profiling debug builds.
- Comparing across host CPU classes.
- Summing RSS across processes.
- Treating a report-only green run as a budget pass.
- Enabling observer diagnostics in the stock profile. Per-thread
  diagnostics stalled GNOME sessions (#782).
- Loosening a budget to make CI green.
