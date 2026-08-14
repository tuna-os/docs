---
sidebar_position: 3
title: "BUGS FOUND"
---

All found by actually running the app under Broadway on `himachal` and reading
what it did, rather than by inspection. Ordered by user impact.

---

## 1. Every GUI update was silently simulated ✅ fixed

**Symptom:** the app ran in Developer Mode permanently, so no update, rebase, or
reboot the GUI performed ever touched the system.

**Cause:** two compounding defects.

* `main.rs` applied `--dev-mode` by mutating `settings.json` and calling
  `save()`. Running `finupdate --dev-mode` **once** left developer mode on
  forever. `himachal:~/.config/finupdate/settings.json` was found with
  `"dev_mode": true` written into it.
* `Settings::default()` set `dev_mode: is_dev_build`, and `is_dev_build` is true
  whenever `config::PROFILE` is empty — which is the case for *any* plain
  `cargo build`. So a locally built binary could never exercise the real
  orchestrator, registry, or rebase paths at all.

**Fix:**
* CLI flags now layer through `settings::RuntimeOverrides`, held in memory and
  never written back (`settings.rs`). Invoking the app with a test flag can no
  longer change stored configuration.
* The dev-build default is now `dry_run: true`, not `dev_mode: true`. Real code
  paths run; the `privileged()` chokepoint withholds the destructive command at
  the point of execution.
* Added `--no-dev-mode` so an already-polluted `settings.json` can be escaped.

**Note for you:** your real config on himachal still has `dev_mode: true`. The
test harness now uses an isolated `XDG_CONFIG_HOME`, so it is untouched — but
your interactive runs will keep simulating until that value is cleared.

---

## 2. Startup storm: 1213 changelog fetches and 1216 SBOM diffs per launch ✅ fixed

**Symptom:** the window frequently never painted at all. The process sat at
100% CPU with ~1261 threads, and GHCR/GitHub calls timed out — which then made
every *subsequent* run worse, because the API rate limits were exhausted.

**Cause:** `AvailableTagsLoaded` repopulated the tag `StringList` with
`remove(0)` in a loop followed by `append` per item. Each mutation moves the
combo row's selection, firing `connect_selected_notify` — roughly 2N times for
N tags. Every one of those carried a *different* raw tag, so the existing
idempotency guard in `SelectTag` (which only compares against the current tag)
let all of them through, and each spawned a full changelog fetch + SBOM diff.

`ghcr.io/ublue-os/bluefin` publishes 612 tags, giving ~1213 fetches on a single
launch.

**Fix** (`status_view.rs`): block the `selected_notify` handler across the
repopulation, replace the remove/append loop with a single `splice()`, then
restore the selection and unblock. Handler id is stored as `tag_row_handler`.

**Measured, same launch, before → after:**

| | before | after |
|---|---|---|
| changelog fetches | 1213 | 1 |
| SBOM diffs | 1216 | 2 |
| log lines | 14 293 | 26 |
| threads | 1261 | 11 |
| main thread state | `R` (spinning) | `S` (idle) |

---

## 3. Ten ad-hoc tokio runtimes → thread exhaustion ✅ fixed

**Symptom:** `OS can't spawn worker thread: Resource temporarily unavailable`,
surfacing as a panic deep inside hyper's DNS resolver — far from the cause.

**Cause:** the GLib↔tokio bridge was open-coded at ten-plus call sites
(`app.rs` ×3, `rebase_dialog.rs` ×3, `status_view.rs` ×3, `rebase_widget.rs`,
`changelog_widget.rs`), each building a *fresh* runtime with its own worker and
blocking pools. Some sat in per-row rendering code, so the counts multiplied.

**Fix:** new `src/runtime.rs` — one shared multi-threaded runtime with bounded
pools (4 workers, 32 blocking threads), and a `block_on` that picks the right
strategy for the calling context. Ad-hoc runtimes removed.

`ffi.rs` was already correct (one runtime per `Handle`) and was left alone.

---

## 4. Panic: "Cannot start a runtime from within a runtime" ✅ fixed

**Symptom:** intermittent crash on launch — only when a background fetch
happened to race UI construction.

**Cause:** `detect_bootc_image_info` built a runtime and called `block_on`. Its
doc comment asserted "every caller here runs on the GTK thread", but the
changelog path reaches it via `read_selected_tag()` from *inside* the runtime,
where `block_on` panics.

**Fix:** route through `runtime::block_on`, which uses `block_in_place` when
already inside the runtime. Also memoised the whole function
(`BOOTC_IMAGE_INFO_CACHE`) — it was re-running the full detection chain,
including a `bootc status` subprocess, once per rendered version row.

---

## 5. GApplication rejected the app's own CLI flags ✅ fixed

**Symptom:** `finupdate --dry-run` exited with `Unknown option --dry-run`
*after* logging that it had accepted the flag.

**Cause:** flags were parsed by hand, then the full `argv` was handed to
`RelmApp`, and GApplication parses argv itself and aborts on anything it does
not recognise.

**Fix:** pass only `argv[0]` to `RelmApp::with_args` — every flag has already
been consumed into `RuntimeOverrides` by that point.

---

## 6. Window cannot reach the HIG minimum width ✅ fixed

Lowering `width-request` to 360 and adding an `AdwBreakpoint` was not enough —
the window still refused to narrow. Rather than guess, `FINUPDATE_MEASURE=1`
was added to walk the widget tree at startup and print each widget's measured
minimum width (`FINUPDATE_MEASURE_MIN` filters to the offenders).

That showed the window itself honouring 360 while its content demanded 579, and
the chain bottoming out at preference *rows* of 543–549px. But the rows on the
visible page were not that wide: **`gtk::Stack` is homogeneous by default**, so
it requests the largest width of *every* page, including hidden ones. The idle
page was inheriting the minimum width of the history/changelog rows it had never
displayed.

Fixed by turning off `hhomogeneous`/`vhomogeneous` on the status stack, so it
sizes to the visible child — which is what an adaptive layout wants anyway — and
letting the row labels wrap (`title-lines`/`subtitle-lines` of **0**, meaning
*unlimited*; note that 1 does the opposite of what it looks like, pinning the
label to a single line whose minimum is the entire string).

Result: content minimum **579px → 240px**, natural 579 → 423. The window renders
correctly at 360×640, verified by the `narrow` screenshot check.

---

## 7. Late async result panics after component teardown ✅ fixed

```
The runtime of the component was shutdown. Maybe you accidentally dropped a
controller?: AvailableTagsLoaded([...])
```

A registry fetch completing after its relm4 component was dropped sent into a
closed channel and panicked the worker thread.

The trap is that `ComponentSender::input()` **unwraps internally**, so the
`let _ =` some call sites already had was purely cosmetic — it discards a `()`,
not an error.

Fixed by delivering every background-thread result through
`sender.input_sender().send(..)`, which returns a `Result` that can genuinely be
ignored. Six sites in the changelog/registry/SBOM fetch paths. A late result for
a page the user has already navigated away from is normal, not exceptional, so
dropping it silently is the correct behaviour.

Click handlers and `update()` arms still use `input()` deliberately — the
component is alive by definition at those points.

---

## 8. Flatpak build fails with a seccomp error ✅ fixed

```
error: Failed to export bpf: System failure beyond the control of libseccomp
```

Identical with `flatpak run org.flatpak.Builder` and native `flatpak-builder`,
which pointed at the host rather than the manifest. But bubblewrap alone worked
(`bwrap --ro-bind / / --unshare-all true`), and so did `flatpak build` against
the SDK — so the sandbox itself was fine and only flatpak-builder's module step
failed.

The fix is `--disable-rofiles-fuse`, which the gtk-office-suite build already
used. `just flatpak` now passes it.

---

## 9. Harness hazard: stale instances accumulate (not an app bug)

`pkill -x finupdate` does not match instances launched via `toolbox run`, so
repeated test launches left up to four processes alive. A leftover instance
keeps the D-Bus name and the Broadway surface, which presents as a **blank
screenshot** rather than an error — a trap worth knowing about when reading
failures. The launcher now matches on the full command line and warns if
anything survives.
