---
sidebar_position: 50
title: "soak"
---

`scripts/tuna-vm-soak` observes a running Tuna Desktop session inside an isolated test VM for 24 hours by default. A newly booted GNOME base image is not a Tuna Desktop soak. Install a qualified Tuna Desktop payload, record its source revision and image digest, and establish the real session before starting this observer. It does not change the shipping image, display-manager configuration or user settings.

The root observer reads complete PSS/RSS and fd counts for the session UID. It requires exactly one live compositor and GTK shell, records their PID/start-time identities (the legacy shell host is an alternative renderer, not a concurrent process), and fails if any exits or restarts. Each sample makes bounded calls on the user's real bus to the screen saver, calendar server, portal settings and GNOME portal backend. Missing counters and unreadable live processes fail instead of counting as zero. Departed noncritical processes and zombies are excluded; process identity changes during sampling fail.

Health helpers and the native workload are spawned directly with the account's UID,
primary GID and resolved supplementary groups. Only the child drops credentials;
the observer stays root. Their explicit environment contains the ordinary account's
home/name, fixed executable path and actual runtime/user bus (plus the session
Wayland socket for the native workload), not inherited root credentials or bus
overrides. No helper opens a PAM/logind session. Each health call still has the
same 10-second deadline and 64 KiB output budget; a failure names its endpoint
and method. Removing helper-created PAM session churn is a harness correction,
not proof that PAM/audit activity caused an earlier service timeout.

After a ten-minute warmup, every sample must remain below the baseline PSS multiplied by 1.5 plus 16 MiB, the baseline fd count multiplied by 1.5 plus 32, and the baseline process count plus 12. These explicit endurance limits detect large growth; they are not a performance parity threshold. The baseline includes that UID's activated services and applications, so use a controlled, unchanged workload. The optional native workload below adds actual frame pacing. The observer cannot measure compositor object counts, GPU memory, input latency or service fault recovery. Issues #203 and #73 remain open for the remaining requirements and for the completed actual 24-hour report.

Copy the script to the VM and run it as a root transient service, supplying the UID's account and the exact source revision from the deployment record:

```sh
sudo systemd-run --unit=tuna-soak --property=Type=exec \
  /usr/local/libexec/tuna-vm-soak --user tuna-test \
  --source-revision EXACT_INSTALLED_REVISION --out /var/tmp/tuna-soak-NEW_RUN
```

Each output directory must be fresh. `provenance.json` contains bootc status, boot ID, actual installed binary hashes, supplied source revision, requested duration and growth limits. `samples.jsonl` grows after each successful sample. `report.json` is written on normal completion or a handled failure. A successful report requires `complete: true` and the full requested elapsed duration. For qualification require `requested_duration_s: 86400`; shorter rehearsal runs are not 24-hour evidence. Interrupting the observer or rebooting the VM cannot qualify a run.

The observer must remain outside the session UID so its memory and helper processes are excluded. Root/GDM services, kernel allocations and GPU buffers are outside the reported scope. It performs health calls; the optional native workload adds one controlled mapped window, without input or window churn; pair its report with the separate nested stress evidence. Changing the installed payload, restarting a critical process or switching images requires a fresh run and output directory. Collect the completed report, provenance, raw samples and scoped session journal together; review journal crashes and the separately measured frame pacing before calling the roadmap release gate complete.

The pure failure fixtures in `scripts/lib/tuna-soak-tests.py` verify zombie rejection, critical-process loss, missing counters, PID reuse, unreadable live processes and parenthesized process names. They validate the observer, and do not establish a guest endurance result.

## Native frame pacing during endurance

For a memory-and-frame-pacing run, build the small fixture with
`scripts/tuna-frame-pacer-build` and install its binary as the root-owned
`tuna-frame-pacer` beside the observer (here
`/usr/local/libexec/tuna-frame-pacer`); the observer runs the workload from
its own directory. Copy `scripts/lib/endurance_presentation.py` to
`lib/endurance_presentation.py` beside the observer as well.
Use the running user's actual ordinary Wayland socket, for example:

```sh
sudo systemd-run --unit=tuna-soak --property=Type=exec \
  /usr/local/libexec/tuna-vm-soak --user tuna-soak \
  --source-revision EXACT_INSTALLED_REVISION --out /var/tmp/tuna-soak-NEW_RUN \
  --presentation --wayland-display wayland-0
```

The 320×180 mapped client alternates two SHM buffers through ordinary frame
callbacks and retains real `wp_presentation` feedback. It requests an ordinary
idle inhibitor while mapped, like a video player; it never unlocks the session
or overrides an explicit lock. Keep the probe visible and the workload
controlled. An explicit lock, a hidden/stalled probe, lost connection or two
seconds without presentation after startup fails this active workload. Lock
and suspend security qualification remains the separate actual VM journey.

`presentation.jsonl` retains bounded batches of at most 240 frames, followed
by an explicit completion record. Every memory sample includes frame interval
p50/p95/p99 and counts for feedback received since the previous sample,
including intervals crossing batch boundaries. Counters reconcile presented,
discarded and pending commits; unknown refresh and absent hardware flags
remain explicit. The observer checks monotonic timestamps, commit identity,
clock stability, complete batch order and requested elapsed duration. Capture
output is limited to 4 GiB and record size to 128 KiB. Truncated or missing
completion cannot qualify a soak.

The probe runs as the observed ordinary UID, so its memory and descriptors
are part of the controlled active-workload baseline. Keep this distinction
when comparing with a memory-only idle soak. These intervals describe this
native client workload, not input latency or all compositor animation frames.
No GNOME-relative release threshold is introduced. A short DRM control
exercises batch rollover and completion in CI; it is not 24-hour evidence.

## Bounded nightly VM soak

The [published-flavor nightly](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin-tuna-nightly.md) runs this observer
with the native workload on every scheduled or dispatched run. It is a
bounded run, **not the 24-hour qualification run**: GitHub-hosted jobs stop
at six hours and the same job runs the qualification boots. The
qualification rule above is unchanged. `provenance.json` and `report.json`
record `scope`, which reads `24-hour qualification candidate` only for
`requested_duration_s: 86400` and otherwise
`bounded N s rehearsal; not the 24-hour qualification run`.

After the five qualification boots, the job boots the same installed digest
once more from a pristine snapshot, logs in through GDM as those boots do and
records the same startup checks. `scripts/tuna-vm-lane --soak 3000
--soak-warmup 600` then starts the fixture's copy of the observer
(`/usr/libexec/tuna-soak/`, installed by `Containerfile.published`, whose
build stage compiles the native workload) as the root transient unit
`tuna-vm-soak`. The workload uses the session's own
`tuna-nested-<compositor pid>` socket. With the default 60 s interval that is
50 minutes and 50 samples, 40 minutes of them after the ten-minute warmup.
Pull requests that change the lane, fixture or soak scripts rehearse the
same wiring for 900 s with a 300 s warmup.

The lane polls the unit through the guest agent, then copies
`provenance.json`, `samples.jsonl`, `report.json`, `presentation.jsonl` and
`presentation.stderr` in bounded reads, checked against the guest's sizes
and SHA-256 digests. `scripts/lib/soak_report.py` re-reads the whole native
capture and writes `summary.json` and `summary.md`: session PSS, RSS, fds and
processes at the warmup baseline, at the end and at their post-warmup peak
against the observer's limits; the post-warmup PSS trend in MiB/h; whole-run
frame interval p50/p95/p99/max; and one row per sample (at most 60, evenly
spaced) of memory, descriptors, processes, frames and interval percentiles.
`V-SOAK` passes only when the unit exits successfully, every file transfers
intact, the report is complete for the requested duration and the capture
validates. A failure names the observer's own reason from its journal.

The `published-marlin-tuna-soak-<run id>` artifact holds the boot's serial
log, assertions and manifest, and `soak/` with the observer files, the
summary, the observer journal, a frame of the running workload
(`soak-start.png`) and one after the observer exits (`soak-end.png`). The job
summary and `qualification.json` (`soak`) repeat the result beside, not
inside, the digest's qualification checks; a soak failure still fails the
nightly. The source revision comes from the deployment record: the shipped
`tuna-desktop` package version maps to its release tag, as
`packaging/arch/PKGBUILD` builds tag `v${_semver}`, resolved to a commit when
the job runs. `provenance.json` keeps the measured binary hashes.

These runs measure one idle desktop with one controlled native client on
virtio-gpu under KVM. They show growth and pacing trends between nightlies;
they are not GNOME-relative thresholds, hardware evidence or a substitute for
the 24-hour run that #203 and #73 still require.

## Endurance soak reports

- [2026-10-31 24-hour endurance soak run](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak/2026-10-31-24h/README.md):
  Published `marlin:tuna` flavor (`sha256:ae6363c1`), source revision `d28578e5`.
  **FAILED / not qualified:** observed for 6,644 s (107 samples), then the health helper's 10-second deadline expired. The timeout's root cause is unresolved; PAM/audit causality has not been established. Retained samples stayed within growth limits, but this is not evidence of completed 24-hour endurance.
