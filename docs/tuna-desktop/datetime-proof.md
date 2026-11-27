---
sidebar_position: 14
title: "datetime proof"
---

Ten gates qualify GNOME Date & Time services on the shipped Marlin
image. They live in [`tuna-datetime-proof.py`](https://github.com/tuna-os/tuna-desktop/blob/main/scripts/lib/tuna-datetime-proof.py)
with fixture tests in
[`tuna-datetime-proof-tests.py`](https://github.com/tuna-os/tuna-desktop/blob/main/scripts/lib/tuna-datetime-proof-tests.py)
(the CI `check` job runs them). The Marlin VM lanes run the full
collection in the guest (`tuna-vm-lifecycle datetime`, recorded by
`scripts/tuna-vm-lane`), and the assertions reach the parity-ledger job
through the `marlin-vm` artifact (`lifecycle/datetime-evidence.json`
keeps the bundle).

## Gates

| Gate | What it proves | GNOME 51 reference |
|---|---|---|
| G-DATETIME-NTP | An NTP provider is active and the clock is synchronized (`timedatectl show` + `status` agree: `NTP=yes`, service `active`, synchronized `yes`; `chronyc tracking` too when chronyd serves). | — |
| G-DATETIME-TZ | The zone round-trips through timedate1 `SetTimezone(s, b)`, the call the Settings panel makes, and the original zone is restored and re-verified. | gnome-control-center 51.0 `panels/system/datetime/cc-datetime-page.c` `queue_set_timezone` |
| G-DATETIME-TZ-REJECT | Negative control: an invalid zone is refused and the zone is unchanged. | — |
| G-DATETIME-RTC | The RTC is kept in UTC (`LocalRTC=no`). No claim about RTC hardware accuracy; `SetLocalRTC` is never called. | — |
| G-DATETIME-CLOCK | The panel clock (an AT-SPI dump of `tuna-shell-gtk`, 24-hour or 12-hour text) shows the system time within 120 s. | — |
| G-DATETIME-CLOCK-TZ | Within 10 s of `SetTimezone` the panel clock shows the new zone's wall time and no longer the old one. | gnome-desktop 51.0 `libgnome-desktop/gnome-wall-clock.c` lines 77-85 and 449-486 (a monitor on `/etc/localtime` re-reads the zone) |
| G-DATETIME-MANUAL | Manual time as the panel sets it: `SetTime` is refused while NTP is on (why the Date & Time row is insensitive then); `SetNTP(false)` stops the provider; an absolute `SetTime` moves the clock back 2 h 7 min; the real time (carried on the monotonic clock) and NTP are written back, the provider's enablement is unchanged, and no systemd timer's last trigger (`systemctl list-timers --output=json`, read before and after) lies ahead of the restored real time. | `cc-datetime-page.c` `queue_set_ntp`, `on_timezone_changed`, `on_permission_changed` |
| G-DATETIME-CLOCK-SET | Within 10 s of the manual `SetTime` the panel clock shows the new time. | `gnome-wall-clock.c` (timerfd cancelled on clock set) |
| G-DATETIME-POLKIT | The desktop user's own non-interactive `SetTimezone`, run from the user's systemd manager outside any logind session as GNOME launches apps, is allowed exactly when GNOME's rule grants it (member of the rule's privileged group) and otherwise refused with polkit's demand for interactive authentication; the zone is restored. | gnome-control-center 51.0 `panels/common/gnome-control-center.rules.in`, `panels/system/datetime/org.gnome.controlcenter.system.policy.in` (`datetime.configure` implies the timedate1 actions) |
| G-DATETIME-NTP-ABSENT | A stopped provider reads `NTP=no`, `CanNTP=yes`; a missing one (runtime mask) reads `CanNTP=no` and `SetNTP(true)` is refused, the state in which Settings hides Automatic Date & Time; the provider is restored. | `cc-datetime-page.c` `is_ntp_available`, `on_can_ntp_changed` |

A gate with missing inputs fails as unevaluable; missing evidence is
never a pass. A probe that fails halfway keeps its partial record, and
the gate's detail carries the probe error.

The manual time goes back, never forward. systemd fires a calendar timer
once the realtime clock passes its next elapse, so a forward jump fires
every `OnCalendar=` timer it skips, early. Marlin's `uupd.timer`
(`OnCalendar=*-*-* 04:00:00`, `RandomizedDelaySec=15m`) did so whenever
the old +2 h 7 min jump ran between about 01:53 and 04:15 UTC: uupd's
update failed in the VM, and its "Some System Updates Failed" banners
covered `V-STRIP-INSTALLED` (21 of 60 marlin-vm runs started 01:40–04:10
UTC failed it, against 0 of 443 at other hours, 2026-11-07 to 11-21).
A calendar timer's next elapse comes from its last trigger or activation,
not from the jumped clock, so a jump back reaches none, and the restore
ends at the real time. uupd and its timer stay untouched; the gate fails
if any timer fires while the clock is ahead of the real time.

The published-flavor lane reads the installed `tuna-desktop` package version
with Marlin's native `pacman -Q` into `desktop_package_version` in that evidence
bundle. This is provenance, not a capability exemption: every gate records
its actual verdict, including **G-DATETIME-CLOCK-TZ** and
**G-DATETIME-CLOCK-SET**. Unsupported or unevaluable panel-follow results
remain failures even for known older packages. Current-build success does
not replace qualification of the published binary, and the original
measurements and partial failures remain in the evidence.

The known beta.2-2 package rebuilds immutable tag `v1.0.0-beta.2`, source
`1e6ce28f4d5dfd7918ac7340bd93454a9fcc211c`. Its `wall_clock.rs` lacks
the `/etc/localtime` monitor; #886's merge
`414e358eff9bbfc871637696b9382e6578f396ae` is later. A package-recipe revision
alone does not bring that newer desktop source into the published image.
A replacement release needs its own source/package/image binding and actual
panel-follow proof; changing a version allowlist is not a repair.

## Actual automatic-timezone stage

`scripts/lib/core_apps_autotz.py` is a separate stage of the existing Core-app
hosted Marlin journey, not an eleventh gate in the legacy collector and not
another VM producer. Its typed guest observer is
`packaging/marlin/vm-lane/core-apps/autotz.py`. The shared dispatcher/profile and
image integration belong to that journey. Adding these observers does not
qualify automatic timezone or close #359: a current-build admitted image must
actually run them, and retain its package, boot, original GDM user, service,
input and screenshot receipts.

`core_apps_autotz.run_native(qmp, agent_factory, out, metadata, nonce=...)`
is the independent current-build native consumer. It uses shared
`vm_native_desktop.NativeDesktop` bounded QGA transport and the installed
`tuna-native-session/{native_session,autotz_guest}.py` original-session
identity/AT-SPI primitives. It does not import or inventory the 28 applications,
wait for their success, launch a substitute desktop, or change the account's
role. The separate typed lifecycle action is `autotz DOMAIN OPERATION JSON`;
the shared router owns its image/member admission and `V-AUTOTZ` result.
Actual original-user policy failures remain failures, not root positives.

The required `marlin-vm-autotz` matrix row keeps its own one-boot KVM
consumer and exact final-image receipt. Its four installed native observers
remain `native_session.py`, `autotz_guest.py`, `autotz.py` and
`geoclue_fixture.py`; no full Core-app payload or account-role changes are
required. The image includes the source-pinned GDM 51 overlay after every
package update, before final-image admission. The traced record-free
first-login journey retains its native candidate manifest/source binding in
the separate lifecycle rows; it is not an automatic-timezone prerequisite.

The source is GeoClue's **named New York static-location emulation, not GPS**:
its documented `static-source` reads latitude, longitude, altitude and accuracy
from `/etc/geolocation`. See the upstream
[GeoClue configuration manual](https://man.archlinux.org/man/geoclue.5).
`geoclue_fixture.py` installs only a nonce-owned source configuration and that
location file, preserves their original bytes/ownership/modes and the original
service state, and restores them afterward. It never changes an application
authorization or agent whitelist. Maps/Weather reuse the same typed fixture
operations; the stage does not create a fake provider or private service bus.

The normal image, not this fixture, must admit the real `tuna-shell` agent.
The packaged `tuna-geoclue-agent-policy` image-construction helper checks the
native package database's original vendor-config checksum, retains its complete
agent list and adds Tuna in an early fragment. It leaves later administrator
overrides and every application grant untouched, refusing changed administrator
main policy or an effective whitelist that still excludes Tuna. GeoClue
whitelists replace rather than append, so a Tuna-only replacement is incorrect.
The stage retains the actual original shell's successful `AddAgent` completion
record and its exported Agent object's bus PID/UID; an absence of errors is
not registration proof. This package/production hook still requires normal
qualified-source intake; the old beta.2 archive contains no such helper.

For pacman, the helper reads the effective database location from
`pacman-conf DBPath`; immutable Marlin relocates it beneath `/usr`, so assuming
`/var/lib/pacman/local` rejects a genuine installed package. The configured
database and its package metadata must still be root-owned and immutable,
the real file owner must be `geoclue`, and the current configuration must
match that package's recorded backup checksum. A missing or malformed
configured database is a failure, never a default-path fallback. Its actual
database path is retained in the policy receipt. The isolated native-database
regressions use genuine pacman queries and declared synthetic control packages;
they do not qualify a signed image or the GeoClue runtime.

The observer requires the session's genuine packaged `gsd-datetime` and
GeoClue. [GNOME 51.1's actual timezone consumer](https://github.com/GNOME/gnome-settings-daemon/blob/51.1/plugins/datetime/gsd-timezone-monitor.c)
obtains a city-level GeoClue location, then performs real reverse geocoding
before it calls timedate1. The
[GeocodeNominatim GNOME backend](https://github.com/GNOME/geocode-glib/blob/master/geocode-glib/geocode-nominatim.c)
uses `https://nominatim.gnome.org`; the observer identifies that default in the
original daemon's mapped packaged ELF without redirecting it. This backend
identity is not network or application proof. The real provider must be
reachable and the daemon's actual outcome must follow: a location file alone
cannot prove that a zone was applied. An unavailable lookup is a failure,
not a hardware waiver.

The ordinary original user seeds `Pacific/Auckland` only as a manual negative
control. Automatic timezone with the location master off, and the location
master on with automatic timezone off, must each preserve that zone and the
actual `/etc/localtime` for an entire ten-second observation window. Then a
ready, bounded system-bus observer records the real datetime daemon's
`SetTimezone` sender PID/UID while both settings are enabled. Within the
initially specified 30-second external-service budget, the original daemon
must receive the real New York location and timedate1 plus `/etc/localtime`
must agree on `America/New_York`. The original shell's owner-bound AT-SPI clock
and captured frame must follow within the existing ten-second/120-second
clock bounds and exclude the old Auckland reading.

Root never sets the timezone as the automatic positive; its only timezone
write is cleanup restoring the saved original state. Cleanup first disables
automatic changes, restores the source files/service, then restores the
original timezone and settings. A missing owner, wrong caller, changed daemon,
failed service, unavailable policy or incomplete cleanup cannot be a pass.
The standalone semantic-validator tests exercise those rejection predicates;
they are not image, GeoClue, network or panel evidence.

### Initial UTC without `/etc/localtime`

The original #1003 run
[41464644402, job 125360854225](https://github.com/tuna-os/tuna-desktop/actions/runs/41464644402/job/125360854225)
failed in `autotz save`: `_snapshot` → `_timedate` → `_digest` →
`native_session.digest`, with `FileNotFoundError(errno=2)` while opening
`/etc/localtime`. The
[original artifact 13156389027](https://github.com/tuna-os/tuna-desktop/actions/runs/41464644402/artifacts/13156389027)
retains the unreplayed failed save and an unqualified result, not an automatic
timezone observation. No timezone mutation or monitor start had occurred.
The exception identifies an unresolved localtime file; because save failed
before retaining a timezone snapshot, it does not establish whether that path
was absent or a dangling link.

The observer previously assumed every valid initial timezone had a readable
localtime file. That excludes systemd's documented
[implicit UTC when `/etc/localtime` is absent](https://www.freedesktop.org/software/systemd/man/latest/localtime.html).
It now uses `lstat` to distinguish genuine absence from a broken link, and
admits absence for saving/restoring initial state **only when the real
timedate1 property is exactly `UTC`**. Its receipt records `present=false`,
null resolved path/hash, and `matches_zone=false`; it does not invent file
evidence. A dangling link, non-UTC property with no file, unreadable file,
or missing zoneinfo for a present localtime still fails.

The Auckland negative controls and New York automatic positive still require
the actual localtime bytes and matching zoneinfo hash, alongside every
original-user, daemon, location-agent, live-monitor, method-caller and visible
clock check. Implicit UTC cannot satisfy those gates. Cleanup first calls the
real timedate1 `SetTimezone` as before. If the saved file was absent, cleanup
verifies returned UTC and any newly created UTC file before removing it, then
requires the original absence/settings in its final readback. Failed writes
or mismatched files cannot be reported as restored.

`LocaltimeStateControls` in `scripts/tests/test_core_apps_autotz.py` exercises
these filesystem states, rejection paths and cleanup with temporary files and
mocked D-Bus. These are regression controls, not native qualification. A new
source-bound current-build native run must still qualify the original GDM
session, both full negative windows, actual gsd-datetime/GeoClue/geocoding
positive, clock/frame, and complete restoration; the original failure remains
failed and must not be replayed for a green result.

The Core-app profile calls the idempotent guest `save` before preparing this
source or running Maps/Weather, then calls `run(desktop, manage_fixture=False)`
for automatic timezone. That mode borrows the same nonce-owned source and
leaves restoration to the profile's outer `finally`: disable both settings,
restore the GeoClue fixture, then restore the original timezone/settings.
Its receipt explicitly names the profile as restoration owner, and the
whole profile cannot qualify without those actual restoration readbacks.
The default standalone mode owns the same complete cleanup sequence itself.

### Monitor interval bound (#1127)

Main run [43499426523](https://github.com/tuna-os/tuna-desktop/actions/runs/43499426523)
and #1090 run [43472149760](https://github.com/tuna-os/tuna-desktop/actions/runs/43472149760)
failed `V-AUTOTZ` although every automatic snapshot already showed the
daemon's `SetTimezone`, the New York client location and matching
`/etc/localtime`. The host rejected the live interval: the guest monitor's
deadline is `started + MONITOR_SECONDS - 1`, but the host bounded
`deadline - started`, which rounds to 44.000000000000014 for start instants
such as 97.618143743 and 104.999872142. Readiness then never held, and the
30-second budget expired mid-snapshot. The host now bounds `deadline` with the
same expression the guest used, so the bound stays exactly 44 s and any
longer interval is still rejected.

## Running

Unit tests (no VM, no privileges, no clock writes):

```sh
python3 scripts/lib/tuna-datetime-proof-tests.py
```

Full collection, as root on the guest with a desktop user logged in.
Every write probe restores what it changed (the NTP mask is
`--runtime`, so even an interrupted run cannot outlive a reboot):

```sh
python3 scripts/lib/tuna-datetime-proof.py collect --out datetime-evidence.json \
    --desktop-user tuna-test
python3 scripts/lib/tuna-datetime-proof.py check datetime-evidence.json \
    --assertions assertions.txt
```

`--read-only` skips every write probe (NTP, RTC and the panel only).
`check` prints one `<ID> pass|fail <detail>` line per gate, the shape
`scripts/tuna-ledger` reads, and exits 1 when any gate fails.

## Published-image evidence (2026-10-30)

Corral VM of `ghcr.io/tuna-os/marlin@sha256:ae6363c185015849701328fc38694f5ddcc0b4c804034a1d8d05577f1c70cf7d`
(marlin:tuna, version cbb3569; tuna-desktop 1.0.0beta.1-1, systemd
262.1, polkit 128, gnome-control-center 51.1, geoclue 2.8.2), retained in
[`marlin/2026-10-30-datetime-359/`](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin/2026-10-30-datetime-359).
This is the published image, so it runs main's shell, not this change.

- Gates, current script (`proof-run-*.txt`, `dt-*.json`): with
  `tuna-test` outside `wheel` and inside it, every gate passes except
  G-DATETIME-CLOCK-TZ: the panel clock kept the old zone for the whole
  10 s window (and, in `12-topbar-after-75s.png`, for over a minute)
  because the shell read the zone through jiff's five-minute system-zone
  cache. The shell now watches `/etc/localtime` as GnomeWallClock does
  (`crates/shell-gtk/src/wall_clock.rs`); the current-build lane proves it.
- Settings panel with real input: as a non-admin, "Some settings are
  locked" (`05-panel-nonadmin.png`); as an admin the rows unlock
  (`07-panel-admin.png`), choosing Auckland in Select Time Zone sets
  `Pacific/Auckland` (`tz-panel-auckland.txt`), turning Automatic Date &
  Time off stops and disables timesyncd (`ntp-off-panel.txt`), three
  clicks on the hour arrow move the clock 3 h and the top bar repaints
  at once (`18-hour-plus3.png`, `manual-time.txt`), and switching it
  back on resynchronizes (`ntp-on-restored.txt`).
- Polkit: matching GNOME's rule, a `wheel` member's non-interactive
  `SetTimezone` succeeds and a non-member's is refused
  (`polkit-*-noninteractive.txt`). Group changes reach polkit only after
  a new login, because polkit reads the caller's own group credentials
  (`polkit-subject-compare.txt`). The admin password dialog itself cannot
  authenticate on this image: the shell's agent runs
  `polkit-agent-helper-1` directly, polkit 128 ships it without setuid
  (socket-activated instead), and the dialog fails and respawns the
  helper in a tight loop (`06b-unlock-after-password.png`,
  `polkit-nonadmin-interactive.txt`);
  [#884](https://github.com/tuna-os/tuna-desktop/issues/884).
- Reboot: the zone chosen in Settings survives a reboot, RTC stays UTC,
  and the session's clock starts in the new zone (`reboot.txt`,
  `14-session-after-reboot.png`).
- Missing service: with timesyncd masked, Settings hides Automatic Date
  & Time and makes Date & Time editable (`21-masked-panel-reopened.png`);
  timedated does not signal the change, so an open panel keeps its rows
  until reopened, as in GNOME.
- Automatic time zone was unmeasured in this historical run: the published
  session started no settings-daemon plugins (`geoclue-auto-tz.txt`), and
  gsd-datetime started by hand could not get a GeoClue client (`Failed to
  connect to GeoClue2 service: Timeout was reached`, `AvailableAccuracyLevel 0`,
  `geoclue-gsd-datetime-probe.txt`). That run supplied no usable location source.
  This does not establish that a VM requires GPS: the supported static source
  above provides a legitimate emulated input, whose actual service/UI outcome
  still needs current-build qualification.

## Scope limits

- The `timedatectl`/`chronyc` fixtures under `scripts/lib/fixtures/`
  are parser-shape captures, not Marlin evidence.
- RTC hardware accuracy is out of scope: the gate checks the UTC
  policy only.
- Automatic time zone through GeoClue remains unqualified until the actual
  standalone stage runs on an admitted current-build hosted image.
- Reboot persistence is Corral evidence only; the VM lane gates run
  within one boot.
