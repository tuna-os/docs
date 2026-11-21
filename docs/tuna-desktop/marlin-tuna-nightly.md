---
sidebar_position: 27
title: "marlin tuna nightly"
---

The `marlin-tuna-nightly` workflow qualifies one immutable digest of the
published TunaOS Marlin Tuna Desktop flavor. The nightly resolves the newest
`ghcr.io/tuna-os/marlin:tuna` once and pins every later step to that digest;
a manual dispatch qualifies exactly the `digest` input. It installs a CI
fixture layer on that image and does not rebuild or replace Tuna Desktop.
The fixture requires every shipped package version to remain present
unchanged. It therefore installs its packages against the package databases
the image shipped with (`tuna-vm-published-pacman`), never a fresh
`pacman -Sy`, so Arch updates published after the image build cannot upgrade
a shipped package; the Arch Linux Archive serves snapshot package files the
mirrors have already replaced. The build also checks hashes of the six Tuna
Desktop binaries and of every shipped login-path file before and after setup:
the session entries, the `gdm-password`, `gdm-launch-environment` and
`tuna-lock` PAM services, GDM's `custom.conf` and unit, and the TunaOS greeter
theme overlay. The build also requires `display-manager.service` to be
`gdm.service` and GDM's configuration to enable neither automatic nor timed
login.

Since tunaOS#3438 (2026-10-20) the published flavor logs in through stock
GDM: it ships no greetd, gtkgreet or `/etc/greetd` files. The fixture
provisions the public `tuna-test` account and adds QEMU guest agent probes,
a count-only GTK input client, the lifecycle's brightness, Date & Time and
Orca focus/speech probes (the same helpers as the current-build fixture),
Disks and System Monitor for the existing application tour, plus serial
capture. Its AccountsService record only lists the account in GDM's user
list; it names no session, so the shipped image alone decides which session
starts. GDM 51.1 starts a Wayland session
without a login shell and imports the systemd user environment, so the
introspection path comes from the account's `environment.d`; session output
reaches the journal through GDM's own `gdm-wayland-session` stream. An
initial/autologin session is rejected.

Each of five pristine snapshot boots waits for GDM's actual non-root
gnome-shell greeter in its active `gdm-launch-environment` session and
checks the sessions GDM offers (`V-GREETER-LIST`), computed as GDM 51.1
`libgdm/gdm-sessions.c` does: entries with `NoDisplay`, `Hidden` or a
missing `TryExec` program are dropped and one entry per name is kept. The
only offered session must be `tuna` named `Tuna Desktop`; gnome-shell
51.0's login dialog then shows no session menu. A fresh account has no
saved session, so GDM starts its fallback session instead: `[daemon]
FallbackSession`, default `gnome` (GDM 51.1 `daemon/gdm-session.c`). That
lookup skips only `Hidden` entries, so a `NoDisplay` GNOME entry still
starts. `V-GDM-FALLBACK` requires the fallback to be `tuna`. The boot then
selects the account in GDM's user list, types the fixture password through
QMP and requires a real non-root logind session with `Service=gdm-password`
and the actual Tuna Desktop compositor (`V-GDM-LOGIN`). If the session runs
another desktop, the check names it and does not type into that session.
Selection tries Enter on
the focused user, then Tab and Enter, then the typed user name, as
tunaOS's own GDM login gate does. Portal checks require Settings, the
GNOME backend, and Screenshot and ScreenCast routing. The last boot runs
the existing semantic tour and [lifecycle checks](https://github.com/tuna-os/tuna-desktop/blob/main/docs/vm-lifecycle.md),
including lock/unlock, strict first-resume locked state, sleep
authentication fail-closed, real PAM refusal, VT repaint and logout back to
the GDM greeter. Every boot runs even after an earlier one fails, so one run
reports every check. No pause substitute or fabricated greeter success is
accepted. The current-build `marlin-vm` lanes run this same GDM login and
logout code against the source-built image with tunaOS's tuna-flavor GDM
configuration ([lifecycle](https://github.com/tuna-os/tuna-desktop/blob/main/docs/vm-lifecycle.md)). `--published` identifies image
acquisition only: it does not weaken any assertion. The published disk must
provide the actual brightness contract, GSD plugins/idle behavior, logind
lock hint, power button, mouse delivery/hotplug, native reader keyboard,
media-key amplification, stale-auth retirement, resume GPU uploads, reader
reaping and product logout behavior. Missing snapshot keys or obsolete
packages fail; another lane's current-build result cannot substitute.
Historical upgrade behavior belongs to explicitly archived upgrade journeys,
not current published-image qualification. There is no compatibility mode
or separate opt-in strict flag. Existing timeouts, numeric floors and actual
Date & Time clock-change passes remain mandatory.
Current qualification also requires actual `tuna-*` process and serial
identities. Retired binary/log prefixes are never rewritten into current
Tuna evidence; archival inventory is not current feature qualification.

| Area | Checks |
|---|---|
| Install and boot | `bootc install to-disk` of the digest, `V-DRM`, `V-SHELL`, `V-PANEL`, `V-NOPANIC`, `V-REPEAT` |
| Greeter | `V-GREETER-LIST`, `V-GDM-FALLBACK`, `V-GDM-LOGIN`, `V-DISPLAY-MANAGER` |
| Session and portals | `V-CALENDAR`, `V-PORTAL`, `V-PORTAL-GNOME`, `V-PORTAL-SCREENSHOT`, `V-PORTAL-SCREENCAST` |
| Lock and sleep | `V-LOCK`, `V-AUTH-FAIL-CLOSED`, `V-SLEEP-DELAY-INHIBITOR`, `V-SUSPEND-UNLOCKED`, `V-SUSPEND-LOCKED-FRAME`, `V-SLEEP-AUTH-FAIL-CLOSED`, `V-SLEEP-FRESH-AUTH`, `V-LIFECYCLE` |
| Bounded soak | `V-SOAK` and the startup checks on a sixth pristine boot ([soak](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md)) |

The VM profile is the existing q35/OVMF KVM guest: four CPUs, 6 GiB RAM,
virtio VGA at 1280×800 and the existing 20 GiB raw disk. The daily workflow
requires KVM rather than silently falling back to emulation. It also runs
on pull requests that change the workflow, fixture or harness.

After the qualification boots, a sixth pristine boot runs the bounded
[VM soak](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md): 3000 s of memory sampling and native frame pacing
(900 s on pull requests), published as the
`published-marlin-tuna-soak-<run id>` artifact with a summary of memory and
frame pacing over time. The job allows 150 minutes for both.

The artifact records the digest under test, fixture image identity, shipped
package version and hashes, harness commit, run ID, frames, tour clip,
serial journal and redacted introspection. Passwords, process arguments
and input key values are excluded from probe artifacts.

Every VM `manifest.json` and the aggregate `repeat-manifest.json` carry these
top-level typed fields (not caller-supplied `--meta` strings):

```json
{
  "acquisition": "published",
  "qualification_mode": "strict",
  "waived_assertions": [],
  "skipped_assertions": []
}
```

Source-built boots use `"acquisition": "source-built"` with the same strict
policy. `--meta` cannot overwrite policy, assertions, lane or tour fields.
`V-STRICT-PUBLISHED` records that policy on each published boot.
`repeat-manifest.json` retains `requested_boots`, ordered `boots` containing
the actual manifests, `boot_results` with integer `boot` indices 1–5 and
integer `returncode` values, and `assertion_coverage`. The repeat gate
`V-STRICT-PUBLISHED-REPEAT` rejects any failed boot process, boot without the
explicit policy or boot with waived/skipped assertions. Such a repeat receipt
sets its top-level `qualification_mode` to `"unqualified"` too. Each boot
retains the same run ID, exact harness commit, pinned image, fixture image
identity and shipped package.

`qualification.json` embeds that complete repeat receipt as `repeat` and the
standalone final manifest as `final_boot`, which must equal `repeat.boots[-1]`.
It carries the same top-level policy fields, but sets `qualification_mode`
to `"unqualified"` if the five actual strict boot receipts, successful
indexed process outcomes or final-manifest identity are absent/inconsistent.
Assertion/check rows remain `{"pass": true|false, "detail": "..."}`. Policy
classification does not replace feature assertions: all emitted checks,
including both actual panel clock-change gates on the final lifecycle boot,
must pass. The first four boots prove startup; only the fifth runs the
tour/lifecycle. No final-only gate is claimed on an earlier boot. Old
all-pass compatibility receipts lacking these fields are not strict evidence.
The separate sixth soak receipt records its own actual boot policy.

`qualification.json` and the job summary list every check with its result
for that digest. A failure also writes `failure.json` with the run URL,
digest and a bounded journal excerpt containing only lifecycle/health
markers; it is retained with the other evidence instead of sending
messages or filing issues.

These checks do not qualify physical hardware or output hotplug, and the
bounded soak is not the [24-hour soak](https://github.com/tuna-os/tuna-desktop/blob/main/docs/soak.md#endurance-soak-reports).

Source references: [TunaOS GDM switch for Tuna flavors](https://github.com/tuna-os/tunaOS/blob/main/experiences/tuna/README.md),
[TunaOS session hiding](https://github.com/tuna-os/tunaOS/blob/main/build_scripts/desktop/tuna-hide-other-sessions.sh),
[GDM 51.1 session list](https://gitlab.gnome.org/GNOME/gdm/-/blob/51.1/libgdm/gdm-sessions.c),
[GDM 51.1 Wayland session launch](https://gitlab.gnome.org/GNOME/gdm/-/blob/51.1/daemon/gdm-wayland-session.c),
[GDM 51.1 session output stream](https://gitlab.gnome.org/GNOME/gdm/-/blob/51.1/daemon/gdm-session-worker.c),
and [gnome-shell 51.0 login dialog](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/51.0/js/gdm/loginDialog.js).
