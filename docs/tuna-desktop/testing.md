---
sidebar_position: 53
title: "testing"
---

How to run, on your own machine, the checks the `ci` workflow
(`.github/workflows/ci.yml`) runs. For what each
verification layer must prove, see [the test strategy](https://github.com/tuna-os/tuna-desktop/blob/main/docs/test-strategy.md).
Install the packages listed under [Prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites)
first; each proof below names anything extra it needs.

Most lanes run on self-hosted runners for this repository's own branches
and on GitHub-hosted runners for forks; the steps and assertions are the
same on both. See [CI runners](https://github.com/tuna-os/tuna-desktop/blob/main/docs/ci-runners.md) for what runs where and the
switch back to GitHub-hosted runners.

## Slideshow paint identities

`/usr/bin/python3 scripts/tests/test_stock_slideshow_proof.py` exercises the
stock slideshow proof's deadline and receipt boundaries. Paint receipts
carry structured file identities: canonical path, device/inode/size,
mtime/ctime pairs and the cached 32-byte SHA-256 digest. The consumer
checks live regular-file metadata and content, including metadata before
and after reading and the path's final identity. It does not parse Rust
`Debug` output or accept metadata-only identity after the bytes change.

The real `portal-security` slideshow journey remains required: original
session ownership, the independent GNOME reference, naturally advancing
static/blend phases, cycle wrap, restart, and every timing and pixel
threshold are unchanged. Boundary tests are not graphical qualification.

## Which lanes a pull request runs

Every push to `main`, the nightly schedule and `workflow_dispatch` run
every proof lane. Both `select-lanes` and `check` always run. The lightweight
`select-lanes` job runs `scripts/ci-select-lanes`, diffs the PR against its
base, and picks the proof lanes the change can affect:

- `ci.yml`, `.github/actions/ci-tool/`, `scripts/ci-*`, `Cargo.toml`,
  `Cargo.lock`, `third-party/` or `scripts/tuna-nested`: every lane.
- most documentation, other workflows, `fuzz/` and the script self-tests: no
  proof lanes. The selector-owned documentation exceptions are
  `docs/nested-session.md` (`arch-package`), `docs/walkthrough*`
  (`gtk-shell`) and `docs/parity-ledger.md` (`parity-ledger`), each plus the
  lanes whose artifacts it needs. `scripts/ci-select-lanes` (`OWNED` and
  `NO_LANE`) is the authoritative, ordered mapping.
- a lane's own proof script, reference fixtures or packaging: that lane
  (plus the lanes whose artifacts it needs). A `scripts/tests/` file edit
  selects the lane whose job runs that file (for example `gtk-shell` for
  `test_notify_callback_contract.py`); a test only `check` runs selects none.
  `WorkflowSync.test_lane_run_tests_select_their_lane` fails when a lane job
  runs a test the selector does not map.
- a packaged conffile (`share/pam.d/`, installed as `/etc/pam.d/tuna-lock`
  and `/etc/pam.d/tuna-lock-fingerprint`): `journey`, whose disposable Debian
  lifecycle fails when `tuna-lock`'s bytes drift from the released package's,
  plus the core lanes and every package consumer.
- anything else (crates, `share/`, other scripts): `gtk-shell` plus a
  round-robin slice of the other end-to-end lanes, rotated by run number.
  The slice size is the repository variable `CI_ROUND_ROBIN_SIZE`
  (default 2); each push to a PR covers a different slice and `main` runs
  them all after merge.

The step summary of `select-lanes` names the chosen lanes and why.
Independent lanes start after selection, without waiting for workspace
tests. GTK and grid comparison admission still require the
successful current-run `check`; the ledger also consumes its test list,
and image publication waits for it. Package and screenshot consumers still
wait for their producing proof jobs.

`ci-gate` requires both infrastructure jobs to succeed and fails when any
selected job fails or is cancelled. Only unselected proof lanes may be
skipped. To run every lane on a branch, dispatch `ci` on it.

## Native Orca speech proof

The `orca-speech` CI job builds Ubuntu Orca with Tuna's package-owned password
feedback correction before running the unchanged `scripts/tuna-orca-speech-proof`.
It uses the canonical `tuna-os/tunaos-packages` factory at immutable commit
`01d74f3c354fe8219ccf21acd4122273b6984588`, in a fresh `RUNNER_TEMP` checkout
with full history for the recipe's `SOURCE_DATE_EPOCH`. Native APT installs the
built `orca_50.3-0ubuntu0.1+tuna1_all.deb`; there is no published-package fallback.
The existing `orca-speech` artifact retains `native-orca-factory.log` and
`native-orca-package.txt` (factory commit, source epoch, DEB SHA-256, installed
version and application-script package ownership). This is nested speech-proof
evidence, not package or image qualification.

This factory revision includes the executable-mode fix from
[`tunaos-packages#960`](https://github.com/tuna-os/tunaos-packages/pull/960).
The workflow executes the runner directly through `env`; the factory tracks
that entry point as `100755` and tests direct execution with Bats.
The previous pin, `c0998b94bd7b4fbc67360c239e439de6debf539b`, tracked it as
`100644`, so native builds stopped with exit 126 before any speech proof.

## Dependency caches

Rust caches remain job-specific; no cache hit skips Cargo, executable
admission or a proof. Only non-PR runs on `refs/heads/main` may save them.
PRs and branch dispatches restore main's compatible caches without
creating competing branch copies. New keys need a successful main job
to seed them; the first run after a key change can be cold.

The `ci` and measured-coverage workflows also cache isolated installations
of cargo-audit 0.22.2, cargo-llvm-cov 0.9.1 and the pinned gtk4-layer-shell
source revision through `.github/actions/ci-tool`. Exact-key restores have
no fallback: tool version, installer/action content, Rust compiler and host,
native distro/architecture and the installed package inventory must match.
Cold paths build the exact locked Cargo tools or revision-checked GTK source;
warm paths activate those installations without recompiling. Only non-PR
main runs publish tool caches, using the same trust boundary as Rust targets.
The audit and instrumented tests still execute and all coverage reports keep
their existing paths. GTK caches contain only its staged `/usr/local` install,
not system packages, Rust targets or proof artifacts.
The staged files stay runner-owned so the cache action can archive and restore
them without sudo. Activation copies GTK into `/usr/local` as root without
preserving the staged ownership; it never changes ownership inside the cache.

Tool consumers sparsely check out `.ci-workflow-tools` at the immutable
`github.workflow_sha`, separate from the candidate source checkout. The
action invokes its paired installer through `GITHUB_ACTION_PATH` and hashes
those actual workflow-owned files, not similarly named candidate files.
Older PR heads need not contain the cache action or staged installer.
The required `check` job tests the PR merge ref and exports its actual
`tested_sha`; GTK authentication and grid comparison proofs
check out that exact revision. Admission separately validates the workflow
event commit, checked output, clean checkout/tree and API triggering head,
so a green job's `head_sha` is never mistaken for its tested merge tree.
The tooling checkout remains separate and is never presented as tested source.
Before source scans, the action appends only `/.ci-workflow-tools/` to the
candidate repository's local Git excludes, preserving existing rules. This
also works on older heads with no matching `.gitignore` entry; genuinely
untracked candidate source remains visible to Git-based source checks.

The same writer policy and native-platform separation apply to measured
coverage, fuzzing, nested stress and visual capture. Workflows without a
main-push trigger seed on their existing scheduled or manual main runs;
their branch runs remain restore-only. The two fuzz targets retain their
shared nightly dependency cache, separate from other jobs and profiles.

Ubuntu keys include the native distro ID/version in addition to the
pinned cache action's compiler, architecture, environment and dependency
identity. `check` includes the standalone `third-party/reis` and
`third-party/smithay` targets. Grid comparison has separate cached
old/fixed targets under `target/ci-grid`, keyed to its reviewed old source.
Setting `CARGO_TARGET_DIR` opts its proof script into persistent build
targets; without it, local runs keep isolated targets inside their fresh
artifact directory. Receipts,
admissions and verdicts are always freshly produced outside the cache.

The Arch job shares an explicit Cargo home between cache restoration and
the unprivileged package builder. Its key includes the installed native
package inventory, and its target is never shared with Ubuntu. Restoration
precedes the existing builder ownership change; package build, installation
and version checks still run.
Both paths are derived inside the container and published through
`GITHUB_ENV`, rather than using the host-side `github.workspace` expression.
The target stays under `GITHUB_WORKSPACE`; Cargo home lives under
`RUNNER_TEMP`, outside the workspace. The pinned cache action excludes
dependency manifests inside the workspace by default, so putting Cargo
home there would prune registry crates and their compiled dependencies.
After restoration, both the workspace and Cargo home become builder-owned.

When diagnosing misses, inspect the cache action's primary/restore keys,
hit status, archive size and transfer times before increasing storage.
Job/profile/native-environment caches are deliberately separate; a single
shared key can retain an incomplete first-writer snapshot. OCI/ORAS or
resumed VM sessions do not replace fresh source/package/runtime proofs.

## Local iteration with `just`

Iterate locally before pushing; a local loop is much faster than a CI
round trip. The [`justfile`](https://github.com/tuna-os/tuna-desktop/blob/main/justfile) wraps the commands below with the
settings local builds need (`just` lists the recipes):

| Recipe | Runs |
|---|---|
| `just check` | `fmt-check`, `clippy` and `test`, like the `check` job's core |
| `just test [cargo args]` | `cargo test --workspace`, or e.g. `just test -p tuna-compositor --lib orca::` |
| `just clippy` / `just fmt` / `just build [args]` | the matching cargo command |
| `just proof <name> [args]` | `scripts/tuna-<name> --artifacts <tmp>`, e.g. `just proof gtk-shell-proof` |
| `just ci-artifacts <run> [name]` | downloads a CI run's artifacts and prints the directory |
| `just clean` / `just gc` | deletes this worktree's target / frees disk (below) |
| `just disk-guard [--watch [s]]` | frees disk now, or keeps checking every `s` seconds (below) |

The real-client native DnD regressions in
`crates/compositor/tests/data_device.rs` run with
`cargo test -p tuna-compositor --test data_device native_`. They cover a valid
press serial followed by held-button motion to another client before
`start_drag`, plus same-surface and source-less starts. With no subsequent input
motion, protocol barriers must already deliver target-local Enter/Motion and,
when a source exists, its MIME offer and actions. Wrong-client events, invalid
serial acceptance, and cross-client source-less offers are rejected; the initial
offer must still negotiate a valid drop and Finish. Existing cancellation,
source/icon lifetime, and touch controls remain in the same test target.
This matches Mutter 51's initial-focus path:
[attaching the drag handler immediately invalidates focus](https://github.com/GNOME/mutter/blob/51.0/src/wayland/meta-wayland-input.c#L288-L325),
and [drag focus sends the destination its offer while restricting source-less drags to the origin client](https://github.com/GNOME/mutter/blob/51.0/src/wayland/meta-wayland-data-device.c#L337-L397).

The GTK proof's focused slices (`--*-only`) run one at a time. A new slice
adds its usage line above `# end of --help` in the script's header (`--help`
prints up to that line) and one case arm that calls `only_mode` with its flag
and the traits it needs: `source-build` refuses `--installed-package`, and
`no-media-source`, `no-examples` and `no-camera-policy` skip the full run's
media-source receipt, example-client build and camera policy. No other
slice's checks change.

`scripts/tuna-gtk-shell-proof --window-leak-only --artifacts DIR` runs
G-WINDOW-LEAK (#1088): after five warm-up windows, 100 libadwaita windows
(`TUNA_WINDOW_LEAK_WINDOWS` sets the count) are opened and closed, odd ones
with Alt+F4 (the app destroys its window; the close effect plays) and even
ones by killing the app (its connection closes with every object alive).
The compositor's `Pss_Anon` must stay within 8 MiB, and its open
descriptors within two, of the warm state, a bound independent of the
number of windows; each window used to keep about 1.65 MB.
`scripts/lib/tuna-resource-sample.py` reads them from `/proc` and leaves
`window-leak-{before,after}.json` and `window-leak-diff.txt` in the
artifacts. The compositor side is `cargo test -p tuna-compositor --test
window_teardown`: a toplevel with and without an `xdg_dialog_v1`, a
subsurface, a grabbing popup and uploaded shm buffers, closed by destroying
every object or by disconnecting, must drop every surface's server-side
data, and the window manager must name the window nowhere.

`scripts/tuna-gtk-shell-proof --dnd-overview-only --artifacts DIR` runs
G-DND-OVERVIEW (#1189), the same function the full GTK proof calls after
G-OV-DND: a client drag through the overview as GNOME 51 handles it
(`overview.js` `_onDragBegin`/`_onDragMotion`/`_onDragEnd`, `panel.js`
`ActivitiesButton.handleDragOver`, `layout.js` `HotCorner.handleDragOver`,
`workspaceThumbnail.js` `handleDragOverInternal`). The drags are real:
`scripts/lib/tuna-test-window.py` with `TUNA_TEST_DRAG=LOG` is a GTK 4 window
whose label starts a `Gtk.DragSource` drag and takes its drop, and every
button and move is X11 input through the nested window. Gates:
G-DND-HOT-CORNER (the pointer to the corner opens the overview and the drag
survives it), G-DND-WINDOW-SWITCH (a drag resting on the target window's
preview activates and raises it no sooner than 750 ms after the last motion,
and the drop lands in it), G-DND-ACTIVITIES (resting on the Activities button
opens the overview no sooner than 250 ms after the last motion),
G-DND-CANCEL-RETURNS and G-DND-DROP-RETURNS (a workspace activated by
hovering a thumbnail is left for the starting workspace, the overview
closing, when Escape cancels the drag or the button is released). Elapsed
times are lower bounds from just before the last motion: the compositor's
timer cannot fire sooner, and the state file is polled, so nothing tighter
is claimed. The nested session opens its corner by hover (a native seat by
barrier pressure), so G-DND-HOT-CORNER guards the end-to-end path and the
hover-under-pressure rule is tested by `cargo test -p tuna-compositor --test
data_device` (`a_client_drag_opens_the_hot_corner_even_where_only_pressure_does`,
driving real `wl_data_device` drags between two clients, as the other rules
are: the Activities and window-preview timers, the thumbnail switch, the
return on cancel and on drop, and the supervised shell's own drags
being left alone).

`scripts/tuna-gtk-shell-proof --grid-hover-only --artifacts DIR` runs the same
held-button hover and persisted reorder assertions as the full GTK proof,
without the unrelated earlier gates. It adds no target motion or timing
relaxation. CI runs this slice with its freshly built compositor and shell;
the no-post-start-motion wire tests establish the precise protocol ordering.

`scripts/tuna-gtk-shell-proof --datemenu-only --artifacts DIR` runs the date
menu's gates alone, the same functions the full GTK proof calls
(`scripts/lib/tuna-datemenu-proof.sh`): `G-CAL-OPEN`, `G-CAL-EVENTS`,
`G-CAL-PREFS`, `G-CAL-LAUNCH`, `G-DATEMENU-WORLD-CLOCKS` and
`G-DATEMENU-WEATHER`, then the calendar tree's accessibility golden and
`G-SHELL-STABLE`. It takes about two minutes, one of them waiting for the
wall clock's next minute to see the world clocks tick. The Weather card is
fed from `TUNA_WEATHER_FIXTURE`, so the slice needs no network.

`scripts/tuna-gtk-shell-proof --search-leak-only --artifacts DIR` runs
G-SEARCH-LEAK (#1084): after five warm-up searches, 50 overview searches
with results (`TUNA_SEARCH_LEAK_SEARCHES` sets the count), each typed with
real keys and closed with Escape, must leave the shell's
`memfd:gdk-wayland` mappings and the shell's and compositor's open
descriptors exactly where they were. `scripts/lib/tuna-resource-sample.py`
reads them from `/proc` and leaves `search-leak-{before,after}.json` in the
artifacts. The compositor side is `cargo test -p tuna-compositor --test
buffer_release`: an uploaded `wl_shm` buffer comes back with
`wl_buffer.release` at once, as Mutter's do, and its pool closes once the
client destroys it and the surface moves on to another buffer.

`scripts/tuna-gtk-shell-proof --subsurface-only --artifacts DIR` runs
G-SUBSURFACE-STACKING: `tuna-subsurface-client` (a compositor example)
maps an opaque red 400x300 window with an opaque green subsurface placed
above it and an opaque blue one placed below it, half past its right
edge. On the desktop, in the overview's preview and in its Alt+Print
window screenshot the green one must show over the parent and the parent
over the blue one, which shows past the parent's edge only; every sampled
pixel is kept in `subsurface-pixels.txt` with `subsurface-desktop.png`,
`subsurface-overview.png` and `subsurface-window-capture.png`. It takes
under a minute. The compositor side is `cargo test -p tuna-compositor --lib
surface_order_tests`: windows, popups and layer surfaces append their
trees bottom to top, a drag icon keeps Smithay's front-to-back order.

Every build uses its own checkout's `target/` (an inherited
`CARGO_TARGET_DIR` is ignored; set `TUNA_TARGET_DIR` to choose one) and no
incremental state, with half the host's CPUs as jobs. Builds from every
worktree share two machine-wide build slots (one per 8 GiB of RAM, at most
two: `/tmp/tuna-local-build.slot.N`, `TUNA_BUILD_SLOTS`), so two run at
once and the rest queue instead of exhausting memory; a cold
`cargo test --workspace` build at six jobs peaks at 6.4 GiB.

Nothing waits forever. These defaults bound every recipe:

| What | Default | Knob |
|---|---|---|
| `just build`, `test`, `clippy` | stopped after 60 min: TERM to cargo's process group (every `rustc` and test binary), KILL 30 s later, slot freed, exit 124 with `TIMED OUT` | `TUNA_BUILD_TIMEOUT` (minutes) |
| `just proof <name>` | stopped the same way after its CI job's `timeout-minutes` (gtk-shell-proof: 60), at least 45 min; leftovers it started are reaped | `TUNA_PROOF_TIMEOUT` (minutes) |
| waiting for a build or proof slot | gives up after 120 min with exit 75 | `TUNA_SLOT_WAIT` (minutes) |
| a slot held past its timeout + 15 min | `scripts/tuna-reaper` reports it and kills the holder, the processes below it with the process groups they lead, and everything carrying its `TUNA_PROOF_RUN` marker | run by `scripts/tuna-disk-guard` on every pass |

Each slot file's mtime records when it was taken, and its contents the
command's timeout in minutes (`scripts/lib/tuna-semaphore`),
which is what the reaper measures. `scripts/lib/tuna-timeout MINUTES LABEL
COMMAND...` is the wrapper the recipes use; Ctrl-C still reaches the
command's group.

The reaper checks each holder's `/proc/PID/fdinfo` for the actual flock.
It does not require a `/proc/locks` entry: PID namespaces can hide a live
inherited lock after the short-lived `flock` utility exits. Merely opening an
old slot file does not make a process eligible for retirement.

When `sccache` is installed (`cargo install --locked sccache`, or a
release binary on `PATH`) every recipe compiles through it, so a fresh
worktree reuses the dependencies any other worktree already compiled from
`~/.cache/sccache` (40 GiB cap): a cold `just build` in a fresh worktree
takes about 39 s instead of 65 s once another worktree has filled the
cache. The recipes start its server with no idle timeout;
`sccache --show-stats` shows the hit rate. The workspace's own crates
miss, since their paths differ per worktree, and the justfile exports no
per-worktree `CARGO_*` variable, which would make every crate miss. A bare
`cargo` in the same worktree reuses the recipes' build without the cache.
See [environment](https://github.com/tuna-os/tuna-desktop/blob/main/docs/environment.md#justfile) for every knob.

The polkit unit tests can be run with
`timeout 15m just test -p tuna-shell-gtk polkit`. Their fake executable
helpers are written and made executable by a dedicated child process,
which exits before the helper is launched. Do not write those executables
in the multithreaded test process: a concurrent fork can inherit the
writable file descriptor and make execution fail with `ETXTBSY`, even
after the parent closes it or renames the file. A parallel fixture test
also checks immediate execution, literal script bytes and exit status;
the existing session tests still assert socket fallback and password
handling.

The compositor's `control_readiness::tests::` cases run their socket fixtures
in exact-test child processes. Concurrent tests can fork between socket
creation and close, temporarily retaining the socket and its epoll interest
until exec. Isolation preserves the strict wake/drain/no-wake-after-close
contract without serializing the suite or allowing extra callbacks. The
tests inspect only the owned epoll instance's `/proc/self/fdinfo` registrations
and observe peer closure, not process-wide descriptor counts. A retained
socket-duplicate negative control must keep both the registration and peer
alive until the last reference closes.

Cleanup is automatic where it is safe:

- `just proof` runs each proof with a fresh `HOME`, XDG directories and
  `XDG_RUNTIME_DIR`, and without your `DISPLAY`, `WAYLAND_DISPLAY` or
  session bus, as on a CI runner, so desktop state in your own session
  can't leak in. Nested proofs start their own Xvfb through
  `scripts/lib/tuna-xvfb`, which locks the first free display from `:120`
  up (plain `Xvfb -displayfd` takes no lock and lands on the low numbers
  every nested compositor's XWayland claims by lock file, which breaks
  it), with per-run Wayland sockets, buses and runtime directories. One
  runs at a time by default; `TUNA_PROOF_SLOTS=N` lets N run at once
  (`/tmp/tuna-local-proof.slot.N`), but under that load the gtk-shell
  proof's timing-sensitive stages fail intermittently. Proofs that touch
  machine-wide state (vkms, seatd, uinput, `sudo` or apt, like
  `drm-smoke`), and scripts that don't start an Xvfb, run one at a time
  (`/tmp/tuna-local-proof.lock.0`). A proof's own `cargo build` waits for a
  build slot. A proof still running past its timeout (above) is stopped
  and its slot freed. Proofs that need
  another proof's prebuilt binaries (`--bin-dir`) are refused with the
  name of their caller. When the proof ends, pass or fail, any process it
  started is stopped, including daemons that detached from it
  (`ibus-daemon --daemonize`, `dbus-daemon --fork`): each carries a
  `TUNA_PROOF_RUN` marker in its environment. A passing proof deletes its
  artifacts; a failing one keeps them and prints the path;
- `just gc` deletes the targets of worktrees whose pull request is merged
  or closed, removes those worktrees when they have no uncommitted
  changes, and expires `just ci-artifacts` downloads after six hours. It
  never touches the main checkout or the worktree it runs from;
- `just disk-guard` (`scripts/tuna-disk-guard`), when less than 40 GiB
  is free on the repository's filesystem (`TUNA_MIN_FREE_GB`), deletes
  the `target/` of each of this repository's worktrees that no running
  process references (by working directory, executable, arguments or
  environment) and that nothing touched for 45 minutes
  (`TUNA_IDLE_MINUTES`), plus `/tmp/tuna-proof-*` and `just ci-artifacts`
  entries older than 90 minutes. It logs each removal and leaves the main
  checkout's target alone unless given `--include-main`. `--watch
  [seconds]` repeats it (default every 600 s); on a shared host run it
  that way from a clean checkout of `main`;
- any build recipe runs `just disk-guard` first (it only removes anything
  below `TUNA_MIN_FREE_GB`, 40 GiB); automatic cleanup never calls `gc`,
  whose merged-PR cleanup is not process-aware.

VM lanes need KVM, so they run in CI's `marlin-vm` jobs or on a Corral
VM, not through these recipes.

The portal file-picker's blocked-parent probe retains a `*.parent-probe.json`
receipt on success **and failure**. Its baseline is read after the sole real
click; ten further caller GLib heartbeat callbacks must arrive within the
unchanged two-second bound, without parent click/key delivery or loss of dialog
focus. Each caller receipt includes monotonic and process-CPU timestamps.
Progress before injection cannot satisfy this boundary. A missed heartbeat
deadline remains a proof failure, not evidence by itself of a compositor focus
bug or permission to increase the deadline; inspect the retained baseline and
observations before attributing it to scheduling or blocked client work.

## Slideshow receipt identity

The naturally advancing GNOME background proof consumes typed
`root_identity` and per-reference `identity` objects from the compositor's
`background_paint` receipt. Each contains `path`, `metadata` (device, inode,
byte length, modified and changed `[seconds, nanoseconds]`) and the 32
SHA256 bytes. Missing identities and non-UTF8 native paths serialize as
unqualified nulls, never lossy path aliases. Rust Debug strings are not an
accepted machine schema.

The consumer binds the exact owned XML/public-frame paths to regular,
no-follow descriptors, checks the producer's 64 MiB source bound, hashes
bounded reads, and rechecks descriptor/path metadata. A matching stat tuple
cannot substitute for matching content. Existing original-process ownership,
natural-reference timing, viewport, two-channel-value pixel tolerance and
85-second phase observation bounds remain unchanged.

In [CI 41390839901](https://github.com/tuna-os/tuna-desktop/actions/runs/41390839901),
the old Debug parser rejected 404 of 448 retained samples for the producer's
new nested metadata/digest representation; no reference phase qualified.
That actual failure is not a passing slideshow proof. The producer and all
machine consumers now share the typed schema without an old-string fallback.
`scripts/tests/test_stock_slideshow_proof.py` exercises typed schema, metadata,
digest, mutation, ownership-path and deadline refusals; the native serializer
regression is `wallpaper::tests::file_identity_receipts_are_typed_metadata_and_content_digest`.
Those checks do not substitute for a new genuine chooser/pixel journey.

## Before opening a PR

Run the workspace checks locally before opening a PR (`just check`):

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

The SVG helper checks a bounded inventory of raw directory names twice through
the same open descriptor. A membership change rejects the receipt even when
directory timestamps do not change. This is not an atomic filesystem snapshot.

Clippy runs with `-D warnings`, so any warning fails CI.

`cargo test --workspace` includes the 100-run shell fault harness
(`hundred_fault_runs_keep_apps_alive_and_resync` in
`crates/compositor/tests/recovery.rs`) and needs no display or GPU.

After rendering, every backend flushes queued Wayland events before sleeping.
A frame callback must not wait for an unrelated client request or another loop
wake to reach its client. This delivery flush does not schedule another render;
actual presentation and animation cadence still require graphical proof.

The real Wayland-wire pointer tests in `crates/compositor/tests/move_resize.rs`
cover a window mapping beneath a stationary pointer (#425). The scene repick
must send `wl_pointer.enter` before any press, the first click must arrive
without replay, and closing the window must re-enter the window beneath.
The existing press-time refresh remains a separate regression; releases
keep Smithay's implicit grab ownership.

The lock-screen PAM test (`crates/compositor/tests/pam_unlock.rs`) needs
`pam_wrapper` (`libpam-wrapper` on Ubuntu). Without it the test prints
`pam_unlock: pam_wrapper not installed, skipped` and passes. CI sets
`TUNA_REQUIRE_PAM_WRAPPER=1`, which turns that skip into a failure; set it
locally to be sure the test really ran:

```sh
TUNA_REQUIRE_PAM_WRAPPER=1 cargo test --workspace
```

`scripts/tuna-auth-owner-ci-proof <artifact-directory>` runs the actual
native ownership and private PAM retirement cases. Its PID readiness
markers are published only after complete PID contents are written.
Artifacts retain supervised test-client panics and early compositor exit
status; a compiled test or cache hit is not a substitute for these cases.
The native probe keeps a libc `getenv` reader running across launch and
teardown and asserts the compositor's `WAYLAND_DISPLAY` never changes.
The real supervised control client still receives the private display.
This guards the startup race seen in #919: changing process environment
after GIO workers start can free the `environ` array while native
`getenv` traverses it. Child commands, including the bell player, receive
their display explicitly; no startup or teardown environment rewrite is safe.

The focused private-helper proof is
`TUNA_REQUIRE_PAM_WRAPPER=1 cargo test -p tuna-compositor --test pam_helper`.
An authenticated reply is provisional until the helper exits, its process
group has no live members, and its leader is reaped. The bounded `/proc`
scan tolerates only process-disappearance errors (`ENOENT`, or `ESRCH`
when a process is reaped between opening and reading its `stat` file);
other scan failures keep retirement quarantined. Its 500 ms cleanup budget
is separate from the conversation deadline and is not extended on a race.

Run one crate with `cargo test -p <package>` (package names are in each
crate's `README.md`, for example `cargo test -p tuna-compositor`).

Native resource observation regressions live in
`crates/wallpaper-svg/src/resource.rs`. Select `resource::tests::` in the native
test invocation when checking these cases separately.

The concurrent membership regression adds `new.conf` after the first directory
inventory and must reject that observation without sleeps or timestamp advances:
directory size, mtime and ctime can all remain equal across a member addition.
The observer compares two bounded, sorted raw-name inventories through the same
opened directory, then retains the descriptor/pathname identity guards. The
rescan-bound regression also requires an over-limit second inventory to fail.
These are nonrecursive observations, not atomic filesystem snapshots or proof
against mutations after the final guard; native file hashing and symlink
following retain their separate coverage.

Desktop-entry launch coverage lives in `tuna-shell-host`:
`cargo test --locked -p tuna-shell-host --lib apps::`.
It checks quoted multiword and empty arguments, field-code expansion after
argument grouping, and literal `$HOME` handling. Desktop `Exec` commands are
parsed as an argument vector, never evaluated by a shell.

`scripts/lib/tuna-perf-repeatability-tests.py` uses POSIX-shell logging-only
stubs for `sudo`, `truncate`, and `rm`, avoiding 96 unnecessary Python startups
per full paired scenario; its arity-prefixed NUL argv journal preserves empty
arguments, newlines, and non-UTF-8 bytes without shell re-parsing.
The Python VM stub still exercises real `Popen`/`Handoff` termination and
reaping rather than creating guests.
This fixture optimization does not replace the twelve real guest acquisitions
or change production measurement windows.

## Nested proofs

Each proof job builds the workspace, runs the nested compositor on a
private Xvfb (unless `DISPLAY` already works), drives it with real X input,
and writes frames, logs, and usually an `assertions.txt` into the
artifacts directory. A nonzero exit is a failure; the frames are for human
review. CI shellchecks each script before running it.

Magnifier focus checks wait for the probe's focused entry to have allocated
widget bounds before comparing its GTK geometry with the live AT-SPI extent.
The OSK show/hide and lock checks wait for their asynchronous watcher to
record the corresponding transition before using its timestamp for timing or
no-remap assertions. These readiness conditions use the existing gate deadlines;
missing geometry or watcher transitions remain failures, not skipped assertions.

The native grid-drag cancellation proof holds the pointer button until both
the compositor reports cancellation and a fresh, complete, owner-bound AT-SPI
tree restores the normal page arrow without a drag preview. Widget removal
can invalidate a traversal while GTK processes cancellation; that snapshot
is rejected, and the existing five-second polling budget must still obtain
a valid tree. Persistent transport errors, wrong owners and incomplete trees
cannot satisfy the gate.

| CI job | Command | Extra packages | What it asserts |
|---|---|---|---|
| `journey` | `scripts/tuna-journey --artifacts journey-artifacts` | `xvfb xdotool x11-apps scrot jq dbus`, Mesa EGL (`libegl1 libgl1-mesa-dri`) | Overview, search, launch from search, Escape, workspace switch, Alt+Tab; writes `assertions.txt` |
| `journey` | `scripts/tuna-release --allow-dirty --out package-artifacts && scripts/check-release-package package-artifacts/*.deb` | as above | The Debian package builds and passes its checks |
| `app-content` | `scripts/tuna-app-content --artifacts app-content-artifacts` | `python3-venv`; the script installs Playwright and Chromium itself | Chromium maps as a Wayland client, tiles with Super+Left, closes with Alt+F4 |
| `scroll-proof` | `scripts/tuna-scroll-proof --artifacts scroll-proof-artifacts` | `python3-venv` | Scroll-mode strip: Super+Shift+T, Super+R, wheel scrolling, gap geometry |
| `gtk-shell` | `TUNA_REQUIRE_PAM_WRAPPER=1 scripts/tuna-gtk-shell-proof --artifacts gtk-shell-artifacts` | gtk4-layer-shell (`scripts/ci-install-gtk4-layer-shell`), `xwayland pipewire wireplumber at-spi2-core python3-pyatspi fonts-cantarell ffmpeg libpam-wrapper` and the GStreamer PipeWire plugins; see the job for the full list | GTK shell panel, calendar, quick settings, overview, notifications, lock and unlock, AT-SPI trees; writes `assertions.txt` |
| `gtk-shell` | `scripts/tuna-scale-proof --artifacts gtk-shell-artifacts/scale` | as above | The same session at 150 percent scale; writes `assertions.txt` |
| `gtk-shell` | `scripts/tuna-slow-portal-proof --artifacts gtk-shell-artifacts/slow-portal` | as above | On a dbus-daemon bus whose portal activation hangs, the shell owns `org.gnome.Shell` within 15 s (40 s on GTK before 4.17, whose GtkApplication always waits on the inhibit portal) and makes no GDK portal call; writes `assertions.txt` |
| `drm-smoke` | `scripts/tuna-drm-smoke --artifacts drm-smoke-artifacts` | `seatd jq ffmpeg kmod python3-evdev python3-gi gir1.2-gtk-4.0 gsettings-desktop-schemas`; run `scripts/ci-install-vkms` after `apt-get update` to ensure vkms for the running kernel | Hardware backend on the vkms virtual KMS device; needs `sudo` for `modprobe`, seatd and uinput |

`app-content` and `scroll-proof` download Playwright and Chromium into a
temporary venv on every run, so they need network access.

**Start `tuna-gtk-shell-proof` from a fresh artifacts directory.** The
script points `XDG_STATE_HOME` at `gtk-shell-artifacts/state`, and the
shell keeps its state, notification history included, under
`$XDG_STATE_HOME/tuna-shell`. A reused directory carries the previous
run's history into the next one, so the notification stages no longer
start from an empty list. Remove it first:

```sh
rm -rf gtk-shell-artifacts
TUNA_REQUIRE_PAM_WRAPPER=1 scripts/tuna-gtk-shell-proof --artifacts gtk-shell-artifacts
```

`--notify-lock-only` stops after panel readiness and runs just the
lock-screen notification, notification sound, disabled-app restore and
banner expansion gates (G-NOTIFY-LOCK, G-NOTIFY-LOCK-PIXELS,
G-NOTIFY-LOCK-LIVE, G-NOTIFY-SOUND, G-NOTIFY-RESTORE, G-NOTIFY-EXPANDED);
it needs pam_wrapper to unlock. The proof's `canberra-gtk-play` stand-in
records every event sound the shell asks for in `canberra-calls`.
The restore gate opens the real message-tray binding after retaining the
long-word redaction-test notifications in history. Card text must wrap at
character boundaries when needed, and collapsed groups must measure only
their visible page horizontally, so hidden expanded content cannot force
the date popup wider than the nested output.
The full proof expands wellbeing banners with the real Super+N binding
before pressing Take, Delay or Skip: non-critical notices open collapsed
and keep their action rows hidden until the user expands them.

The full GTK proof's media callback barrier waits at most 25 seconds:
one key can execute four serialized `wpctl` subprocesses with five-second
production timeouts, plus callback dispatch. It still requires accepted
tokens to finish successfully and the actual scheduler to be idle; a
fixture volume write alone never proves completion.
The power-save proof admits both dim and undim after live idle-brightness
writes finish: only the explicit pending-transaction reply waits, for at
most ten seconds. Other errors still fail immediately, and exact backlight
readbacks remain required before blanking and fixture teardown.

`scripts/tuna-drm-smoke` loads a kernel module and starts seatd as root.
Run it in a VM or a disposable machine rather than your desktop session.
The Ubuntu setup helper first checks whether vkms is already installed for
`uname -r`, then checks the matching `linux-modules-extra` and `linux-modules`
package candidates if needed. For example, Ubuntu's
[7.0.0-1017 Azure modules package](https://packages.ubuntu.com/noble-updates/amd64/linux-modules-7.0.0-1017-azure/filelist)
includes vkms without a separate extra-modules package. No usable candidate
or a still-missing module fails setup, and package installation errors are
fatal. Module loading and the real vkms device and presentation assertions
remain mandatory in the smoke test.

The smoke test also drives real libinput with uinput devices (ADR 0008),
so it needs `python3-evdev` and the GTK 4 PyGObject client packages the
CI job installs. `D-TABLET` emulates a Wacom Cintiq 22HD
(`scripts/lib/tuna-uinput-tablet.py`). `D-TOUCHPAD-SWIPE` (P-IN-02)
emulates a Synaptics TM3053-004 clickpad as the kernel's rmi4 driver
creates it (`scripts/lib/tuna-uinput-touchpad.py`, the capabilities of
libinput's `litest-device-synaptics-rmi4.c`). The kernel timestamps its
finger motion and libinput classifies it as a touchpad and turns it into
pointer motion, two-finger scrolling and `LIBINPUT_EVENT_GESTURE_SWIPE_*`.
The phase then checks GNOME 51's swipe trackers against the compositor
state: up and down open and close the overview, which follows the held
fingers; left and right switch workspace; a slow half swipe settles
back; a short fast flick completes; a long swipe from the desktop stops
at the window picker, and from the picker the swipe follows into the app
grid (the shell's grid surface maps and eases on release) and back; in
the open overview, with four fixed workspaces (mutter's schema is
compiled in when the host lacks it), a sideways swipe scrolls the
workspaces under the fingers and a fast flick settles two or more on;
four fingers are the shell's too; scrolling, and no swipe, reaches a GTK
4 client; turning natural-scroll off reverses the gestures; and the
swipe follows under reduced motion and with animations off. The emulator
also runs on its own and reads
commands (`down N`, `move DX DY MS`, `hold MS`, `up`, `swipe N DX DY MS
[PAUSE]`, `scroll`, `tap`, `click`) on stdin, in millimetres and
milliseconds. Other phases can import `create_touchpad()` from it.

Private colord startup failures in `D-COLORD` retain `colord-startup.txt`:
the intended user/group, private bus and binary identity, boundary markers
before namespace creation, tmpfs mount, privilege drop and daemon exec, the
actual mounted store ownership/mode, and wrapper/supervisor/child PIDs.
When the wrapper has exited (its world-readable `/proc` entry is gone or a
zombie; never an unprivileged `kill -0`, which a live root-owned sudo wrapper
answers with EPERM), the harness waits once and retains its exact shell
status separately from the supervisor's observed child status. A status
above 128 includes a possible signal mapping, not an assertion of cause.
Otherwise readiness still fails at the unchanged 30-second deadline, after
writing the same receipt.
`colord.log` contains only the daemon's original stdout/stderr;
`colord-launch.log` contains launcher errors. Failure receipts also include
bounded raw kernel journal/ring-buffer output with reader statuses (including
permission/unavailability errors). These records do not diagnose an OOM or
authentication failure by themselves; ring-buffer output can predate startup.
The real private-bus readiness assertion remains mandatory, without restart,
store permission changes or an authentication bypass.

The startup boundary regression tests use fake sudo/unshare/mount/setpriv
and daemon commands, not a real privileged mount:
`python3 -m unittest discover -s scripts/tests -p test_colord_startup.py`.

## GNOME Core applications: installed-image evidence

`tuna-app-content` qualifies nested Chromium content, not the 28 Core
applications in [#397](https://github.com/tuna-os/tuna-desktop/issues/397).
The [2026-11-01 native Corral receipt](https://github.com/tuna-os/tuna-desktop/issues/397#issuecomment-6551467493)
records real installed-app operations on the owned `karnataka` KVM VM
`tuna-q-coreapps-native`. **No whole-app row is qualified by that partial run.**
Untested applications are not reported broken.

The published base was
`marlin@sha256:5ccc023cc73296d5e4d17cfbe38526935a405abcfb0095aad43b3a28bff182e6`,
with the original `tuna-desktop 1.0.0beta.2-2` package/source
`1e6ce28f4d5dfd7918ac7340bd93454a9fcc211c`. The explicit, local-only
app-installation fixture has image digest
`sha256:2a10d804cba17cc8fd7ef6a2bff7360adfc0f5821285632c1601e104fbf1ccfe`.
It installs normal Arch packages against the image's own sync databases,
preserves every originally shipped package/version and Tuna/GDM payload
hash, and does not add these applications to the shipping image.

All entries below are **native Arch packages**, identified by their actual
installed desktop-entry IDs. No Flatpak application installation is claimed.
The operation column is deliberately narrower than whole-app acceptance:

| Core application / application ID | Installed package and version | Actual bounded operation receipt |
|---|---|---|
| Audio Player — `org.gnome.Decibels` | `decibels 49.6.1-1` | Not exercised |
| Calculator — `org.gnome.Calculator` | `gnome-calculator 51.1-1` | Keyboard arithmetic, focused result and actual clipboard; different-result control |
| Calendar — `org.gnome.Calendar` | `gnome-calendar 51.0-1` | Real Cancel/Save; exact event UID, summary and dates in local EDS data |
| Camera — `org.gnome.Snapshot` | `snapshot 51.0-1` | Real camera-portal denial and denied consumer state; capture not exercised |
| Characters — `org.gnome.Characters` | `gnome-characters 51.0-1` | Not exercised |
| Clocks — `org.gnome.clocks` | `gnome-clocks 51.0-2` | Not exercised |
| Connections — `org.gnome.Connections` | `gnome-connections 51.0-1` | Not exercised; no remote-endpoint claim |
| Console — `org.gnome.Console` | `gnome-console 51.0-1` | Real shell pipeline/file bytes and inter-app clipboard paste |
| Contacts — `org.gnome.Contacts` | `gnome-contacts 51.0-1` | Actual local-book setup, Cancel/Add/Edit/Done; genuine EDS vCard payload |
| Disk Usage Analyzer — `org.gnome.baobab` | `baobab 50.0-1` | Not exercised |
| Disks — `org.gnome.DiskUtility` | `gnome-disk-utility 46.1-3` | Not exercised; disposable virtual disk is a fixture, not an operation pass |
| Document Scanner — `org.gnome.SimpleScan` | `simple-scan 50.0-1` | Not exercised; no scanner hardware claim |
| Document Viewer — `org.gnome.Papers` | `papers 51.1-1` | Actual PDF rendering, zoom and focused text selection/copy |
| Files — `org.gnome.Nautilus` | `nautilus 51.1-1` | Create/copy/rename/move/Trash/Undo with actual bytes, Trash origin and unchanged control |
| Fonts — `org.gnome.font-viewer` | `gnome-font-viewer 50.0-1` | Real external-font preview/install; installed bytes and changed fontconfig match |
| Help — `org.gnome.Yelp` | `yelp 49.2-1` | Not exercised; real `gnome-user-docs 51.0-1` content installed |
| Image Viewer — `org.gnome.Loupe` | `loupe 51.1-1` | Known image rendered; actual file-reference clipboard MIME/path observed |
| Logs — `org.gnome.Logs` | `gnome-logs 50.0-1` | Not exercised |
| Maps — `org.gnome.Maps` | `gnome-maps 51.2-1` | Not exercised; no Geoclue/location-service claim |
| Music — `org.gnome.Music` | `gnome-music 1:50.0-1` | Not exercised |
| Settings — `org.gnome.Settings` | `gnome-control-center 51.1-1` | Desktop launch/search only; no changed-control acceptance |
| Software — `org.gnome.Software` | `gnome-software 51.1-1` | Actual Flathub catalog and denied/cancelled system install; positive transaction not exercised |
| System Monitor — `org.gnome.SystemMonitor` | `gnome-system-monitor 51.1-1` | Not exercised |
| Text Editor — `org.gnome.TextEditor` | `gnome-text-editor 51.0-1` | Real picker cancel/grant, content edit, clipboard paste and Save As byte roundtrip |
| Tour — `org.gnome.Tour` | `gnome-tour 50.0-1` | Not exercised |
| Video Player — `org.gnome.Showtime` | `showtime 50.0-1` | Not exercised |
| Weather — `org.gnome.Weather` | `gnome-weather 50.0-1` | Not exercised; no weather-service claim |
| Web — `org.gnome.Epiphany` | `epiphany 51.2-1` | Not exercised |

The retained local archive is
`/home/ubuntu/dev/tuna-coreapps-397-20261101-partial.tar.gz`, SHA256
`3fdb26509936ebcd6cf91318aedcc150fb3d906ea5dffa76e4d1268620f89283`.
It includes numbered command/exit/output receipts, full-resolution frames,
the native inventory, actual payload controls and the original fixture-build
log. The issue comment gives exact package/archive/ELF/disk identities and
receipt numbers. This is private Corral evidence, not a trusted CI artifact
or final shipped-image certification.

Failed observations remain failures: an invalid QMP display-console selector
crashed the owned emulator; initially coalesced pointer motion/press was not
a reliable click; a requested image-clipboard MIME was not offered; and PDF
copy before focusing the document retained the previous clipboard. Corrected
input and actual consumer data distinguish those fixture/interaction outcomes
from application defects. No Contacts defect was inferred after correctly
positioned input selected its real address book. A normal user font install
resolved missing CJK glyph coverage without changing the default image.

Remaining #397 acceptance includes the unexercised principal operations,
per-app linguistic IME, applicable handlers/portal grants, scaling, settings
persistence, service-owner/negative/restart controls, complete lock/restart
recovery, and a rerun against the qualified final package/image. Camera and
scanner physical behavior remains separate from explicitly named emulation.
The run stopped when `karnataka` SSH/SFTP/legacy-SCP transport became
unreachable; final beta3 qualification inputs had not been supplied.
No timeout, lock policy, host capacity setting or qualification floor was
relaxed.

## Marlin VM lane

The `marlin-vm` job (#68) boots the real TunaOS Marlin image with Tuna Desktop
installed and checks that the display manager logs into the Tuna Desktop
hardware session. A CI-only guest service probes the calendar and portal
on the test user bus; the runner reads the serial log and takes QMP
screendumps from outside.

The paired native GNOME/Tuna reference consumers separately bind the original
compositor's open DRM character devices to their actual PCI ancestor and QMP
topology. The graphics driver's name comes from the read-only kernel
`DRM_IOCTL_VERSION` query on that same character device, not from its sysfs
parent's `driver` link: the latter can correctly name the `virtio-pci` bus
driver rather than the DRM `virtio_gpu` driver. Missing, changed, non-DRM or
malformed device observations fail admission; the required virtio GPU,
connected output and preserved PCI checks remain unchanged.

1. It builds `packaging/marlin/Containerfile` (Marlin GNOME 51 plus the
   Tuna Desktop Arch package from `arch-package`) with rootful podman. On top of
   that it builds the CI-only layer `packaging/marlin/vm-lane/Containerfile`.
   This layer adds a `tuna-test` user and turns on GDM automatic login
   into "Tuna Desktop (preview)". It also sends the kernel console and the
   journal to `ttyS0`. The shipped image does not get these changes.
2. It runs `bootc install to-disk --via-loopback --generic-image` from
   that image to write a 20 GB raw disk.
3. `scripts/tuna-vm-lane --disk disk.raw --out vm-lane-artifacts --boots 5` boots
   the disk in QEMU/KVM with OVMF firmware and virtio-vga at 1280x800.
   It writes these assertions to `assertions.txt`:

| ID | What it asserts |
|---|---|
| `V-DRM` | The serial journal has `tuna-compositor: drm: output ...`, so the compositor lit an output on the DRM/KMS backend |
| `V-SHELL` | `tuna-shell-gtk: keybindings:` appears and shell supervision never logs `BudgetExhausted` |
| `V-PANEL` | The session opens on the overview, where the panel is transparent. After Escape, a screendump shows a pure black strip at y=5 across at least 90 percent of the width (the top panel) over a desktop that is not one flat color |
| `V-NOPANIC` | No `panicked` anywhere in the serial log |

The lane retains plymouth and makes five pristine snapshot boots. Tuna Desktop
explicitly registers its ready session and display with GDM instead of
relying on GDM's delayed fallback. Every boot must retain DRM ownership
and show the panel. Earlier tests disabled plymouth after a greeter stole
DRM master about ten seconds after autologin; the repeated gate now tests
that startup path directly.

Additional gates are `V-GDM` (explicit registration, no session pause),
`V-CALENDAR` (CalendarServer responds), `V-PORTAL` (portal Settings responds),
`V-PORTAL-SCREENSHOT` and `V-PORTAL-SCREENCAST` (the portal frontend exports
both interfaces, so `tuna-portals.conf` routes them to a working backend),
`V-LOCK` (the final tour observes unlocked → locked → unlocked), and
`V-REPEAT` (all five boots pass). Earlier boots keep their own artifacts
under `repeat-NN/`; `repeat-manifest.json` records every boot, while the
root `assertions.txt` aggregates results for the parity ledger.

The installed strip gate validates both PNG and PPM pixels against the same
owned window geometry. A transient obstruction or an unpresented frame may
retry for at most 10 seconds, within the existing 120-second strip deadline.
The first rejected image pair is retained as `*-not-ready.{png,ppm}`; the
receipt records capture attempts. Window identity/geometry drift, malformed
images and QMP failures remain terminal. A retry never qualifies pixels from
the rejected frame or claims presentation latency.

The distribution matrix leg then boots the same disk once more with
`scripts/tuna-vm-lane --app-integration` into
`vm-lane-artifacts/app-integration/`. That boot gives virtio-vga a second,
initially disconnected scanout (`max_outputs=2`) and exposes QEMU's D-Bus
display (`-display dbus`) on a private bus, so the lane can plug, resize and
unplug the second head with `org.qemu.Display1.Console.SetUIInfo`, which is
real DRM connector hotplug in the guest. Guest fixtures
(`packaging/marlin/vm-lane/tuna-vm-picker`, `tuna-vm-introspect-watch`,
`tuna-vm-sandbox-client` packaged as the Flatpak `org.tuna.VmSandbox` in a
local repository, and the root probe `tuna-vm-app-integration`, reached
through `tuna-vm-lifecycle app-*`) only launch clients and read state; every
click and key is QEMU input.

| ID | What it asserts |
|---|---|
| `V-PICKER` | For an X11 (`GDK_BACKEND=x11`) and a native Wayland GTK 4 caller, each opening the installed GNOME FileChooser portal (Nautilus) through its own parent handle: the caller is allocated its requested 1100x700; for OpenFile and SaveFile, cancel (Escape) and accept (type-ahead and Enter), the dialog maps as the focused transient child of the caller, horizontally centred on it; a click on the exposed parent is blocked; the portal answers 1 with no URI or 0 with the chosen file (SaveFile's file is then written by the caller); focus returns to the caller and a real key and click reach it; an unrelated bystander app receives nothing |
| `V-INTROSPECT-SCREEN` | A session-bus client subscribed to Introspect `PropertiesChanged` sees `ScreenSize` equal the union of Mutter `GetCurrentState` logical monitors initially (1280x800), after hotplugging a 1024x768 second head, after rotating it 90° through `ApplyMonitorsConfig`, and after unplugging it, with no notification that repeats an unchanged size |
| `V-INTROSPECT-SANDBOX` | After installing the local Flatpak, xdg-desktop-portal-gnome's `Background.GetAppState` omits an unsandboxed client claiming the app ID `org.tuna.VmSandbox`, reports the Flatpak-sandboxed one as running or active, and drops it after it exits |

The artifact (`marlin-vm`) holds `serial.log`, `tuna-lines.log` (every
`tuna-*` line), the boot frames, `V-OVERVIEW.png` (the login overview),
`V-SESSION.png` (the desktop), and `manifest.json`.
The manifest records the base image digest, the test image ID, the Tuna Desktop
package, and the QEMU version. If the run fails or times out (15
minutes), the script prints the relevant serial lines before exiting.

When the shell has printed but has not logged `keybindings:` within
20 seconds, a bounded startup watchdog captures
`shell-startup-stack-1.json` in that boot's artifact directory. It captures
again at 60 seconds if startup is still stalled. If the shell prints
nothing, the first capture is 40 seconds after the DRM output appears.
The CI-only guest layer installs gdb; the dump includes every session
shell thread's kernel wait site/stack and user backtrace, without frame
arguments, locals, or debuginfod downloads. Guest transport/debugger errors
are retained in the JSON instead of hiding the startup failure. This
diagnostic does not restart the shell or relax any readiness gate.

After the assertions pass, `--tour` records a feature tour. The script
sends keys and pointer clicks through QMP to open the overview and search,
the app grid, quick settings, and the calendar. It then opens Disks,
System Monitor, and Files, switches between them with Alt+Tab, and turns
scroll mode on and off (Super+Shift+T, Super+R, Super+Left/Right). Last,
it locks the screen with Super+L and unlocks it with the `tuna-test`
password through PAM. Only the last repeated boot records the tour. The
script takes a screendump twice a second and plays the result back at
double speed. Before each section it inserts a title card, a committed
PNG in `scripts/lib/vm-tour-cards/` (`render.py` there redraws them). The
`tuna-tour` artifact, kept for 30 days, holds `tuna-tour.webm`,
`preview.webp`, and one `T-<section>.png` still per section. The tour
asserts nothing; only a missing video fails the job.

You need `/dev/kvm`, about 30 GB of free disk, and the podman and
`bootc install` commands from the job to run this locally. Do not use your
desktop session for it.

To drive the published image through GDM in a KubeVirt VM with keyboard
and pointer input and save a console frame for every step, see
[Published-image journey through Corral](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md).

To try guest-side code in a running VM before pushing, without the CI
queue or an image rebuild, see [Fast iteration on karnataka](https://github.com/tuna-os/tuna-desktop/blob/main/docs/ci-fast-iteration.md).

## Pointer motion barriers and input aids

Backend motion is coalesced once per output frame, but a raw non-motion
input ends the run **before** accessibility filtering. Mouse Keys consumes
its keypad release without forwarding a key to the window manager; it
must still deliver any pending synthesized motion first. Otherwise a
timer move can arrive a frame after release. Empty barriers do not touch
the delivery clock, and consecutive absolute/relative motion remains
coalesced with relative deltas summed.

The `motion_coalesce::tests` unit tests cover a consumed keypad release
with a pending timer move, all manager non-motion input kinds, empty
barriers, and preservation of motion batching. For the actual nested
backend → accessibility aids → client wire path, run:

```sh
PATH=/usr/bin:$PATH just build -p tuna-compositor -p tuna-shell-gtk
PATH=/usr/bin:$PATH timeout 240 just proof motion-barriers-proof
```

This focused proof needs Xvfb, xdotool, a session bus, and Python GTK4
bindings. It stops the compositor while queueing host motion, a Mouse Keys
press/release, and another motion, so they reach the same backend dispatch.
The real GTK client must see three exact positions and three pointer
frames, with no leaked keypad keys. A second batch of 25 uninterrupted
motions must still produce just its final position and one frame.
`--bin-dir /absolute/path/to/old/target/debug` selects an old build without
altering the assertions: the pre-fix runtime fails because it delivers only
the final position, losing the consumed release's motion boundary.
Processes are resumed, terminated, and reaped on exit; failed proof
artifacts retain `barriers.json`, the compositor state, and the wire log.

## Animation clock and motion policy

Compositor animations (the overview transition, the scroll-strip springs and
the tile preview) read time from one animation clock
(`crates/compositor/src/animation_clock.rs`). Two environment variables
make their timing reproducible on slow CI renderers such as llvmpipe:

| Variable | Read by | Effect |
|---|---|---|
| `TUNA_ANIMATION_CLOCK` | compositor, only when `TUNA_COMPOSITOR_STATE` is also set | Absolute path of a clock file. While the file is absent, animations run on real time. When it first holds a whole number of milliseconds `N`, animation time freezes at that moment plus `N`. Rewriting it with `M` moves time to that moment plus `M`. Removing it resumes real time. Time never runs backwards across these switches. |
| `GNOME_SHELL_SLOWDOWN_FACTOR` | shell (sent to the compositor in `InputSettings`) | GNOME Shell's own slow-down factor: a positive number multiplies every animation duration, as GNOME's `adjustAnimationTime` does. Anything else keeps 1. Read at shell start. |

Write the clock file atomically (write a temporary file, then `mv`), as
`anim_clock` in `scripts/tuna-gtk-shell-proof` does. The compositor state
file reports `animation_clock_manual` and, while the clock is frozen, `animation_clock_ms`, plus the
effective `motion_policy` (`full`, `fade-only` or `off`),
`animation_slowdown` and `animations_enabled` (GNOME's
`enable-animations`, which Reduced Motion leaves on). For example, the
overview transition takes 250 ms each way, so after Super:

```sh
echo 0 > clock.tmp && mv clock.tmp "$TUNA_ANIMATION_CLOCK"    # freeze
xdotool key Super_L                                            # progress 0
echo 125 > clock.tmp && mv clock.tmp "$TUNA_ANIMATION_CLOCK"  # progress 0.5
rm "$TUNA_ANIMATION_CLOCK"                                    # real time again
```

Proof `G-ANIMATION-CLOCK` samples the overview this way at 125 and 250 ms
in both directions. `G-ANIMATIONS-OFF` and `G-INTROSPECT-MOTION` check the
live motion policy: animations off snaps everything, Reduced Motion
(fade-only) snaps overview and strip motion but keeps the idle-shield fade.
A held touchpad swipe is not an animation. As in GNOME 51 (overview.js:359-380,
animationUtils.js:23-33), the overview follows the fingers under every
policy, across the desktop, the window picker and the app grid, and so do
the overview's workspaces under a sideways swipe. The release eases under
full motion and Reduced Motion, with the slow-down factor applied, and
lands at once with animations off (`G-SWIPE-REDUCED-MOTION`,
`G-SWIPE-APPGRID`, `G-SWIPE-OVERVIEW-SCROLL`, `D-TOUCHPAD-SWIPE`).

The GTK shell reads the same clock file (`crates/shell-gtk/src/anim_clock.rs`)
for the animations proofs sample from its side. With `TUNA_TRANSIENT_TRACE`
set, the workspace switcher popup and the Activities dots log each fade,
swipe phase and changed frame (`tuna-shell-gtk: ws-popup ...`,
`tuna-shell-gtk: ws-dots ...`, one write per line), and
`scripts/lib/ws-anim-proof.py` recomputes GNOME 51's values from
`workspaceSwitcherPopup.js` and `panel.js` to check them. The popup's
600 ms hold is measured on this clock too, so a frozen clock holds it.
Gates `G-WS-POPUP-CLOCK`, `G-WS-DOTS-CLOCK`, `G-WS-DOTS-SWIPE` and their
`-POLICY` variants sample them; the swipe gates check the dots against the
release time the compositor records for the strip.

The workspace popup's 100 ms fade starts at the display/fade request, not
the first GTK tick. A delayed first frame therefore samples the fade's
elapsed time rather than restarting it while the independent 600 ms hide
timer is already running (GNOME 51 `workspaceSwitcherPopup.js:93-121`).
`cargo:a_late_first_frame_samples_the_requested_fade_not_a_new_one` covers
that boundary, slow-down scaling, animations off and fade-out.
`G-WS-POPUP` keeps its original 300 ms capture delay and RGB thresholds;
a partially faded pill is not accepted as an opaque one.

The shell's Alt+Tab fades read the same clock (`crates/shell-gtk/src/anim_clock.rs`),
and the compositor state lists `switcher_thumbnail_alphas`, the opacity each
switcher window image is drawn at. `G-SWITCHER-FADE` freezes the clock and
samples them at 0, 50 and 100 ms of the thumbnails' fade in and 50 ms into
the fade out (Alt+Escape, which cancels without moving focus), where GNOME's
ease-out quad gives 0, 191/255 and 1, then 64/255. The grid-cancel comparison
slice skips the sampling: its old binaries predate the published alphas.

The native grid cancellation proof admits its held drag only after the
neighboring-page preview is showing **and** the normal page arrows have
disappeared. GTK creates the preview before its arrow fade finishes, so
preview presence alone is not a settled first-page tree. This transition
uses the existing 10-second preview budget; the owner-bound geometry,
neutral pointer, unchanged page contents and pre-release cancellation
checks remain mandatory. A gap chosen before the drag is provisional:
the proof selects again from the live preview allocation, moves the held
pointer there within the same budget, then validates a fresh tree. This
also covers old comparison binaries whose preview occupies more than
the nominal edge width; no guessed hint clipping is accepted.

The edge-tiling-off restore gesture waits for the native move owner,
`interactive_move_window`, and delivery of its seed motion before sending
the restore motions. This excludes a stale grab from the preceding drag.
GTK must request the move while the pointer button is held; physical
pointer delivery alone does not establish the client round trip. The
admission snapshot is retained, and the final target is derived from its
pointer and window geometry. Admission, final pointer delivery, button
release and work-area restoration share the original 20-second restore
budget. The owner observation is null while locked.

## Frame cost

The compositor state (`TUNA_COMPOSITOR_STATE`) carries `frame_cost`, one
entry per output describing its last drawn frame: `rendered` and `culled`
element counts, `damage_rects` and `damage_area` against `output_area`,
the box around the damage (`damage_bounds`, `[x, y, w, h]`),
and the window ids the frame shows (`drawn_windows`) or wholly hides
behind opaque surfaces (`culled_windows`). Both cover the whole output, so
a frame that repaints only the panel or the cursor still lists the windows
it leaves on screen as drawn. `throttled_windows` lists the windows
whose frame callbacks run at the hidden rate (about 1 Hz): off the scene
or wholly culled, unless the overview, the switcher or a cast shows them;
every window while locked. After 3 s hidden a window is suspended
(`suspended_windows`, the xdg_toplevel `suspended` state) and a client
told so gets no frame callbacks until it shows again.
Proof `G-OCCLUSION-CULL` fullscreens an opaque window over another and
requires the lower one to be culled and throttled, then drawn at full
rate again once the upper window's translucent shadow returns.
Proof `G-CLOCK-DAMAGE` (#1154) turns on clock-show-seconds and requires
a frame whose damage lies inside the panel bar and covers under 2% of the
output: the clock's rectangle. Before #1154 the nested output's buffer
age read as 0 after every client commit, so each one repainted the whole
output.

## Settings writes in proofs

`scripts/tuna-gtk-shell-proof` keeps GSettings in a private keyfile
(`GSETTINGS_BACKEND=keyfile`). Each writer rewrites the whole file from
the copy it loaded, so two writers at once can lose a key. The
compositor writes `numlock-state` through the `gsettings` CLI after
every Num Lock change. Until its `keyboard.numlock_saving` state field
is `false` again, any setting the proof writes can be undone. Wait for
it after a Num Lock change and before the next `gsettings set`. The
`keyboard.keymap_generation` field goes up each time a keymap is
applied. Wait for it after changing the input sources or `xkb-options`
and before typing.

## Settings bindings in unit tests

Shell unit tests that read GSettings use
`crates/shell-gtk/src/test_settings.rs`. `SettingsFixture::new(xml)`
compiles a `<schemalist>` with `glib-compile-schemas --strict` into a
temporary directory, and `settings(id)` opens it on a private memory
backend, so no dconf, session bus or host schema is involved and
parallel tests cannot see each other's writes. Create the fixture inside
`glib::MainContext::with_thread_default` and use `dispatch_until` when a
test needs `changed` signals. `background_settings.rs` binds GNOME's
background, interface and screensaver keys this way.

## Shell state across session transitions

`just proof session-sync-proof` runs the real nested runtime with a
supervised `ControlClient` observer and a mapped xdg window. The existing
trusted Rust-only probe injects sleep and seat notifications through the
same internal handlers as logind and libseat; no IPC command or normal
binary flag can inject them. The observer reconnects across pause and
activation and checks that windows, workspaces and overview survive.
Sleep must lock, dismiss overview and redact the window list. A shell
disconnected throughout wake must reconnect into the current locked
state, including when seat activation follows wake.

The GTK CI lane runs this bounded proof and keeps `result.json` and
`runtime.log` in the `session-sync-proof` artifact (built under
`$RUNNER_TEMP`, so the later source-freeze gate sees a clean checkout). This qualifies
runtime/control state propagation on **simulated notifications**, not
physical VT switching, logind suspend delivery or S3. KMS scanout reset,
libseat device-fd revocation and libinput resume still need a native
seat/DRM VM or hardware proof; the nested backend has no such devices.

The stock GNOME Settings journey (`tests/portal-reference/settings-run.sh`)
instead uses a private **dconf** backend. Settings and Tuna's first-run
app-folder initialization are independent writers: keyfile's stale whole-file
rewrite can restore an old `enable-hot-corners` value after the UI has changed
it. The genuine session-bus dconf service merges their writes, with its database
under the fixture's `XDG_CONFIG_HOME`; per-step `*-settings.dconf` snapshots and
fresh independent `gsettings get` reads retain persistence evidence. The
disabled/enabled/cold-restart corner assertions remain unchanged.

The shell-host real-camera lockdown test isolates the **bus daemon's**
HOME/XDG environment as well as the portal child. D-Bus activation otherwise
starts the permission store with the runner's home even though the portal has
a private data directory. Its live permission-store regression calls the
installed service and requires the resulting database inside the fixture.

The main portal fixture also requires bounded child retirement **before**
artifact ownership finalization. On a failed chooser UI step, SIGTERM takes
the chooser owner's normal exit path so its `atexit` hook reaps the independent
GTK input writer. The fixture waits for those direct children and the
compositor's supervised GTK shell, then requires `process-retirement.json`
before traversing artifacts. A missing or failed retirement receipt fails
closed; finalizer inode/type/ownership checks and the primary UI error stay
unchanged. Real-process regressions cover delayed descendant teardown,
abnormal compositor exit, and preserving an existing proof failure.

## One IBus daemon owner

`just proof ibus-owner-proof` (`scripts/tuna-ibus-owner-proof`) runs the
real nested compositor twice and checks that exactly one party owns the
session's `ibus-daemon` (#1014). With no IBus unit, as in every nested
session, the bridge starts one `ibus-daemon --panel disable`: not
daemonized, its own child, in its process group, and the only daemon
for the display, named by the bus file. Before that session ends,
G-IBUS-OWNER-RESTART kills the daemon (the same bridge must start a new
child of its own within 10 s, as systemd's `Restart=on-abnormal` would),
kills the bridge while its daemon runs (nothing of the bridge's group, the
daemon or its config component may be left, and the compositor's
replacement bridge starts its own daemon, whose start the proof slows by
15 s through an `ibus-daemon` shim on `PATH`: the bridge must wait it out,
not give it up), runs `ibus exit` (no daemon may return for 7 s, longer
than the bridge's longest IBus retry) and kills that bridge too (its
replacement starts a daemon again); there are never two daemons. A
daemon's own start-up, up to its bus file and its config component, gets
90 s: what GNOME's session gives its IBus unit (`Type=dbus`, systemd's
`DefaultTimeoutStartSec`), and what the bridge waits for a daemon of its
own. On a loaded host that start-up has taken over 30 s with the new
daemon already the bridge's child. With a unit (`TUNA_IBUS_UNIT`
and a stub `systemctl`) the bridge starts none, asks the manager once
the session is up, and the one daemon is the unit's. After SIGTERM to
the compositor no `ibus-*` process of the display is left: the
compositor retires the bridge's group, and in the unit run the stub
manager stops its unit. It writes `assertions.txt` (`G-IBUS-OWNER-*`),
which the parity-ledger job reads.

## Parity ledger check

The `parity-ledger` job runs `scripts/tuna-ledger` against the test list
from `check` and the `assertions.txt` files from the proofs. Reproduce it
after running the proofs above:

```sh
cargo test --workspace -q -- --list --format terse > test-list.txt
scripts/tuna-ledger check --tests test-list.txt \
  --assertions journey-artifacts/assertions.txt \
  --assertions gtk-shell-artifacts/assertions.txt \
  --assertions gtk-shell-artifacts/scale/assertions.txt \
  --assertions drm-smoke-artifacts/assertions.txt \
  --assertions vm-lane-artifacts/assertions.txt
```

`scripts/tuna-ledger summary` prints status counts only.

The rule, from [the parity ledger](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md): a row is `pass` only
when a test or recorded review compares Tuna Desktop against GNOME 51 baseline
evidence, and `untested` is not a pass. The check fails when a row whose
status starts with `pass` cites no test, when a cited `cargo:` test does
not exist in the test list, when a cited `journey:` or `proof:` assertion
is not recorded as passing, or when the table is malformed or repeats an
ID. If your change renames or removes a test, update every ledger row that
cites it in the same PR.

## Release screenshots

The `docs-shots` job runs `scripts/tuna-docs-shots collect` over the
`journey`, `app-content` and `scroll-proof` artifacts and uploads the
curated frames as the `docs-shots` artifact. Nothing in the repository is
refreshed from it. The docs show the GTK shell through the
[walkthrough](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough.md), which the GTK shell proof captures.

## Pixel parity capture (not in CI)

`scripts/tuna-parity-capture` captures Tuna Desktop in the states
`scripts/tuna-gnome-reference` captures GNOME 51 in, for comparison with
`scripts/lib/tuna-parity-compare.py`. CI does not run it. The workflow and
the states are in [pixel parity with GNOME 51](https://github.com/tuna-os/tuna-desktop/blob/main/docs/gnome-parity.md).

## Output hotplug storm

The nested backend has one fixed output, so hotplug runs on real DRM: the
`hotplug` job of the `nested stress` workflow (nightly, on
`workflow_dispatch`, and on pull requests touching
`scripts/tuna-hotplug-stress` or the workflow). `scripts/tuna-hotplug-stress`
creates a vkms configfs instance (Linux 6.19 or newer; the job pins
`ubuntu-26.04`) with three CRTC/connector pipes. Connector A stays
connected; writing a connector's configfs `status` plugs or unplugs B and
C and makes the kernel send a real udev `HOTPLUG=1` change for the card.
`tuna-compositor --backend drm` runs on that card under a private seatd
and session bus with the GTK shell. Three GTK 4 clients animate every
frame; each is placed on its own output by moving a uinput mouse there,
as Mutter places new windows on the pointer's monitor.

Each round plugs B and C, applies an `ApplyMonitorsConfig` (method 1)
that moves B after C and gives B, or A on odd rounds, its largest
supported scale, toggles the overview with a uinput Super and Escape,
unplugs and replugs the primary every third round, writes a
`monitors.xml` configuration for A+B and replugs B into it every other
round, then unplugs C and B. After every step the compositor state must
show:

- `H-OUTPUTS`: the wl_outputs and DisplayConfig's monitors are exactly the
  connected connectors;
- `H-REHOME`: every window sits on its own output while that is
  connected, else on the primary, and still prefers its own output
  (Mutter's `meta_window_update_for_monitors_changed`);
- `H-CLIENTS`: every client process is alive and keeps drawing frames;
- `H-SCALE` and `H-STORED`: the applied scale and arrangement, and the
  rewritten `monitors.xml`, reach the outputs;
- `H-INPUT`, `H-LIVE`: the overview answers the keyboard, the compositor
  never exits or panics and the shell never exits.

`H-GROWTH` bounds the compositor and shell as the churn lane does: final
PSS within round-0 PSS × 1.25 + 64 MiB and fds within round-0 + 32. Each
round's sample in `metrics.jsonl` and `report.json` has, per process, the
kernel's `Pss_Anon`/`Pss_File`/`Pss_Shmem` split, PSS by mapping kind
(heap, anonymous, shared memory, GPU, files), fds and mappings
(`scripts/lib/tuna_process_metrics.py`, shared with `scripts/tuna-stress`);
the gate's line names the processes and kinds that rose most since round
0. `smaps-round0-*` and `smaps-final-*` are each process's mappings after
the first and the last round, `state-round0.json` the compositor state
after the first, and every step in `report.json` has each process's PSS.
Pull requests and dispatches run 4 rounds, nightly 30; a dispatch's
`hotplug_rounds` input (and `churn_rounds` for the churn lane) runs
another count, and its `hotplug_heaptrack` input runs the storm a second
time with `--heaptrack`: the compositor and the shell record their
allocation backtraces (`heaptrack/heaptrack-<name>-<pid>.zst`, read with
`heaptrack_print`). That run is a diagnostic, since the profiler's memory
counts in its `H-GROWTH`. The artifacts keep the compositor, shell and
client logs, every step's outputs and window rectangles (`report.json`),
the metrics and the state at a failure.

To run it on a host with Linux 6.19+ and sudo, after building
`tuna-compositor` and `tuna-shell-gtk`:

```sh
scripts/tuna-hotplug-stress --rounds 4 --out /tmp/tuna-hotplug-fresh
```

Configuration changes come from connector hotplug the way Mutter's
`meta_monitor_manager_ensure_configured` picks them: a stored
configuration for exactly the connected monitors, else the current or
previous configuration covering them, else a linear one with the primary
kept first. Unlike Mutter, which reads `monitors.xml` once at startup,
the stored configuration is read from the file at each hotplug. Real
panels, EDIDs, colord device registration on hotplug and multiple GPUs
are not covered.

## When a run fails

Read `nested.log` in the artifacts directory first (`compositor.log` for
`tuna-drm-smoke`); see
[nested session troubleshooting](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md#troubleshooting). Do not
retry a deterministic test until it passes: the timing rule in the
[development guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#writing-a-test) applies.

## Nested stress and torture suite

`nested stress` (`scripts/tuna-stress`, `.github/workflows/stress.yml`)
runs the real compositor and GTK shell nested on Xvfb with a private
session bus, a private system bus of service stubs
(`scripts/lib/tuna-service-stubs.py`), a pam_wrapper unlock stack and the
compositor started at systemd's user-session open-file limit (1024 soft).
Phases, in order (`--phases` runs a subset):

- `churn`: four clients map and destroy 400 windows per round.
- `popup`: four clients each map 60 nested (depth three) popups.
- `protocol`: four live adversaries per mode (`scripts/lib/tuna-wayland-adversary.c`)
  beside a healthy popup client: malformed opcodes, zero and huge buffers,
  out-of-order destruction, invalid and never-acknowledged configures,
  death mid-transaction, 5,000 unthrottled commits each, 300 freshly
  written 2 MiB SHM buffers each, 1,000 connections held open at once, and
  a seeded fuzzer: per attacker 100 sessions of up to 256 random requests
  to every bound global and the objects they create, shaped by each
  request's signature and kept valid in type and lifetime except one
  request in 32 (wrong-typed, destroyed or null objects, edge integers);
  requests that ended earlier sessions are picked less often, and every
  request must be answered within 5 s (the day's seeds are in the report).
- `dbus`: 1,000 notifications, 2,000 `ShowOSD` calls, accelerator grab and
  ungrab floods (then a live grab fires and a departed caller's grab is
  released), 300 tray items registered from their own connections and
  pruned after leaving, and a search-provider query flood with every other
  reply 2.5 s late.
- `scale`: 40 `ApplyMonitorsConfig` scale changes while clients map.
- `services`: NetworkManager, BlueZ and power-profiles stubs vanish (half
  killed) and return ten times; the shell must read each returned daemon
  again without restarting. The IBus bridge's own `ibus-daemon` is killed
  five times under a focused field: typing continues, the bridge starts a
  replacement (never two daemons) and focuses its new input context. After
  `ibus exit` typing goes on without IBus and no daemon returns; a killed
  bridge is restarted by the compositor with its own new daemon, and
  nothing is left in the dead bridge's process group.
- `input`: 1,000 typed keys must arrive exactly once; 2,000 pointer moves;
  a held key's repeat must stop when focus leaves, not resume on refocus
  and not leak into the window that gains focus.
- `swipe`: 60 touchpad swipes interrupted (restarted, Escape mid-gesture,
  cancelled) must settle.
- `lock`: Super+L under an active popup grab, mid-swipe; no key, motion or
  press may reach the client while locked; unlocking with the PAM
  password restores typing.
- `shell`: the shell is SIGKILLed through its restart budget, then once
  more; the recovery overlay's relaunch must bring it back while a client
  survives and keeps input.

Every phase ends by proving the input path (Escape and Super change the
overview). PSS/RSS, fd and mapping counts for the compositor and its
descendants are sampled before and after each phase, per process and with
PSS split by mapping kind (heap, anonymous, shared memory, GPU, files), in
`metrics.jsonl`; a failing growth gate names the phase that grew most and
the process and kind that grew. Final PSS must stay within
warmup × 1.25 + 64 MiB, fds within warmup + 32 and mappings within
warmup × 1.25 + 1024. These diagnostic bounds catch unbounded growth;
they are separate from the GNOME performance targets in #503. A panic,
compositor exit, lost input response, orphaned window or hung worker
fails the lane. Pull requests touching the suite run ten churn rounds;
the nightly run uses 300.

Run it after building the compositor, GTK shell, shell host (IBus bridge)
and wallpaper helper:

```sh
cargo build -p tuna-compositor -p tuna-shell-gtk -p tuna-shell-host -p tuna-wallpaper-svg
scripts/tuna-stress --rounds 10 --out /tmp/tuna-stress-fresh
```

Use a fresh empty artifact directory for each run. Real output hotplug and
the VM endurance soak (`scripts/tuna-vm-soak`, [soak.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md)) are
separate lanes.

## Control decoder fuzzing

The `control decoder fuzz` workflow exercises both arbitrary length-prefixed
frames and mutated postcard bodies with a generated valid length prefix.
Successful decodes must re-encode into another valid frame. Seed inputs
include a Hello, a truncated varint, and an oversized declared frame.

Pull requests touching the decoder or fuzz harness run each target for
60 seconds; the nightly lane runs each for 600 seconds. The address
sanitizer, five-second per-input timeout and 2 GiB RSS limit turn crashes,
hangs and runaway allocation into failures. Logs, the resulting corpus,
and crash artifacts are retained for 14 days. A found crash needs a small
regression test in the protocol crate before its fix is merged.

To reproduce locally, install the pinned tool and toolchain, then run:

```sh
rustup toolchain install nightly-2026-11-13
cargo install cargo-fuzz --version 0.13.2 --locked
cargo +nightly-2026-11-13 fuzz run control_body -- -max_total_time=60 -max_len=1048580 -timeout=5 -rss_limit_mb=2048
```

This covers the control decoders of #203; Wayland request handlers are
fuzzed live by the nested stress suite's `protocol` phase.
