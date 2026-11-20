---
sidebar_position: 60
title: "vm lifecycle"
mdx:
  format: md
---

The `marlin-vm` and `marlin-vm-orca51` CI jobs install the ordinary Marlin
preview image built from source, then a CI-only fixture layer
(`packaging/marlin/vm-lane/Containerfile`). The layer gives the image the
published `marlin:tuna` login path: stock GDM with tunaOS's tuna-flavor GDM
steps (`tunaos.toml` `[desktops.tuna]` `after_install`: greeter theme
overlay, `FallbackSession=tuna` with version-appropriate global account
templates, every other session hidden), vendored byte-for-byte in
`packaging/marlin/vm-lane/tunaos/` from tunaOS d98ed1e09b61635a2a9b115ce559944e42f97d74, on the package's
own `Tuna Desktop` session entry. The fixture account has no saved session.
No autologin or initial session exists: the lane drives GDM's user list and
types the fixture password exactly as the published-flavor nightly does
(`V-GREETER-LIST`, `V-GDM-FALLBACK`, `V-GDM-LOGIN`;
`docs/marlin-tuna-nightly.md`), from the same `scripts/tuna-vm-lane` code.
Logout must return to that GDM greeter. The ordinary two lifecycle/Orca rows
retain five pristine boots, the default GPU, fresh-account journeys and all
aggregate gates. These ordinary lifecycle fixtures do not change the shipped
preview image; the independent paired DEV profiles below are separate members
of the same existing VM producer. GDM's session worker opens a journal stream
for `gdm-wayland-session`, forwarded to the serial port. The fixture's
session environment comes from `environment.d`,
which gdm-wayland-session imports from the user manager; the per-login Orca
test secret comes from a user environment generator.
The ordinary CLI profile is `--profile lifecycle` (the default); its two
matrix members keep their original distribution/upstream51 Orca contracts
and `marlin-vm`/`marlin-vm-orca51` artifact identities.

The speech lane invokes the pinned package factory through `bash`; the
factory checkout's script execute bit is not an admission prerequisite.
Its actual native package build and all speech gates remain required.

## Installed strip captures

The strip probe binds the original native processes and all three installed
fixture helpers to the selected package, source and final image. Both PNG and
PPM acquisitions must pass all 25 original body-color samples; the captures
remain separate acquisitions, not presentation-latency proof.

A real notification can cover those pixels. Before acquiring a frame, the
probe may acknowledge its visible banner through ordinary QMP input:
Super+N, Tab, then Return only after the original shell's public Close
button is observed focused and sensitive. The read-only AT-SPI observer
binds the control's bounds to original process/bus identities, never
notification content. Every pixel check and the existing 10-second capture
and 120-second phase deadlines remain unchanged. No updater service,
notification policy or failure log is disabled; acknowledging a banner does
not qualify the update operation that produced it.

Banners queue, as in GNOME's message tray: the shell shows one at a time and
never times out a critical one, so closing it drops the next into the same
layer. The probe closes each in turn, as a user would. The observer reports
each Close control's accessible object path, which names that widget
instance and not its content; the shell builds a new card for every banner
it shows. A Close instance receives Return at most once. When the banner
layer is still there 0.6 s after Return, the probe observes it again. A new
Close instance gets the same Super+N, Tab and focused-Return sequence. The
one it already activated is never activated again, and the capture deadline
then fails the case. In marlin-vm run 44442598008, uupd failed three times
and queued three critical "Some System Updates Failed" banners. The probe
closed only the first, and the next one covered the frame until
`V-STRIP-INSTALLED` timed out.

The column-height capture also submits a real critical notification through
the session's public notification service. It cannot pass until the original
shell shows the fixed public fixture title, its sensitive Close button receives
the actual QMP Return action, and the banner disappears. Only a boolean title
comparison is retained. This control exercises the recovery path even when
the updater happens to show no banner; it shares the same capture deadline
and still requires every original PNG and PPM color sample afterward.

Close readiness uses GTK4's actual AT-SPI state mapping: an interactive
control advertises `SENSITIVE`, the inverse of its `DISABLED` accessibility
state. GTK4 does not advertise `ENABLED`; requiring that additional bit
would reject a genuinely focused, interactive button. Both observed bits
remain in the receipt, but disabled controls remain ineligible. See the
[GTK4 state mapping](https://github.com/GNOME/gtk/blob/main/gtk/a11y/gtkatspicontext.c).

The published-flavor lane uses these same strict assertions. `--published`
only records acquisition: no old-package or absent-instrumentation branch
can pass by crediting a current-build lane. Every boot manifest explicitly
records `acquisition`, `qualification_mode: "strict"`, `waived_assertions: []`
and `skipped_assertions: []`; the nightly/repeat receipts preserve and
classify every actual boot ([receipt contract](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin-tuna-nightly.md)).

## Required independent native automatic timezone

Whenever `marlin-vm` is selected, its matrix also requires `marlin-vm-autotz`.
This uses the same original package producer and VM image recipe, with
`--profile autotz --require-kvm --boots 1`: one pristine snapshot boot,
stock GDM and the original non-root standard account, unchanged default GPU,
and no disposable disk or full Core application installer/inventory.
There is no dispatch, secret or repository-variable waiver.
The leg never reuses a retained native product: that capsule's receipt binds
only the lifecycle members, so this image is always built fresh from the
same run's package and checkout.

The final immutable image receipt binds the exact executing source commit,
original package hash and original installed ELF hashes, lifecycle helper,
normal GeoClue policy helper and four fixed native-session observers:
`native_session.py`, `autotz_guest.py`, `autotz.py`, `geoclue_fixture.py`.
The latter two are installed from the clock-only source files, not the
full Core guest. The ordinary preview policy invocation remains unchanged.
This is same-run source/image admission, **not signed release proof**.

The root `autotz DOMAIN OPERATION JSON` route delegates to the installed
standalone observer. QGA acquisition and nested commands share finite
absolute deadlines; reconnecting cannot renew them. Failure diagnostics
contain only bounded domain/operation/type/sites and optional numeric codes,
never raw arguments or exception text. Unconfirmed guest-child retirement
remains fatal. `V-AUTOTZ` requires the consumer's explicit complete qualified
result; an exception, missing native session or missing result fails the
row and therefore the existing aggregate CI gate. The consumer retains its
actual original-shell AddAgent, source/provider, daemon location/timezone
and panel-clock gates and restoration requirements. Routing implementation
alone claims no native runtime qualification.

## Pristine release-disk qualification is separate

The signed release-disk consumer and its native observer live in
`scripts/lib/try_tuna_desktop.py` and `scripts/lib/try_tuna_qualification.py`.
They do not turn the fixture journeys above into pristine firstboot proof.
The observer requires the normal-release signed manifest and its exact
declared bytes, with the observer checkout matching the signed producer
source. It boots a writable copy while retaining the shipping disk's hash;
there are no injected accounts, passwords, SSH keys or fixture services in
that shipping disk.

Each native Linux/macOS amd64/arm64 host must execute its matching signed
Corral binary, real local QEMU, browser and noVNC transport. Executable
headers reject foreign host binaries even where Rosetta/binfmt could run
them. The guest remains the declared qualified amd64/UEFI disk; ARM hosts
explicitly use TCG. Receipts retain actual QEMU target/accelerator, firmware
and binary hashes rather than claiming native guest acceleration.

Actual GNOME Initial Setup creates a passworded operator account in the
copy. Normal GDM must then enter Tuna, including visible application search,
with wheel membership and password-required sudo; logout/login and reboot
must preserve that account and user data. RFB connection alone means
browser/transport readiness, never successful guest boot or Tuna login.
Terminal cancellation (SIGINT, SIGTERM or SIGHUP), stop, failed browser launch and failed acquisition
must retire owned processes/listeners/locks without touching an unrelated
VM. Normal launch preserves writable user data; qualification explicitly
deletes only its own disposable copies after retirement.
The owned stop socket remains serviceable while browser readiness is pending;
an opener returning zero is not a connection. Native qualification must prove
early stop after that real no-RFB opener, and each cancellation signal must
follow an actual current RFB connection in native Chromium. Its retained
executable/profile identity and actual owned-child wait/exit receipt must agree;
a pre-browser cancellation or a stale readiness receipt cannot pass.

Native qualification also retains current noVNC milestone PNGs and four
bounded actual-guest video clips: pristine setup, the first Tuna session,
passworded re-login, and the post-reboot session. It reuses the VM lane's QMP
recorder and VP9 encoder, not a slideshow of stills. Each clip contains at most
the first 30 seconds of its observed UI journey, with capture timing retained;
it does not claim to show every account-setup or boot step. The PNGs are actual
noVNC canvas pixels; the clips are actual owned-guest QMP pixels, not browser
chrome. The qualification hosts require ffmpeg with `libvpx-vp9` in addition to
their existing browser observation tools; normal launcher users do not.

`media.json` binds those files to the signed manifest and pristine disk hashes,
desktop/package source, immutable image index and platform digest, exact signed
Corral release and binary, observer source, and native host. Failed or incomplete
qualification records `qualified: false`; neither historical diagnosis frames
nor before-fix firstboot screenshots may be promoted as current documentation
proof. Documentation intake must retain these identities and all native gates.

The consumer requires Python 3 and the native package manager (on macOS,
Homebrew and its normal command-line-tool prerequisites). It obtains the
checksum-pinned Sigstore verifier itself and acquires QEMU plus amd64 UEFI
through native package trust, including when QEMU exists but firmware is
missing. Linux without caller access to `/dev/kvm` explicitly uses TCG.
Interactive Linux hosts use their normal sudo authentication, with its password
input connected directly to the real terminal; the wrapper never reads or stores
that password. Without a terminal, sudo must permit noninteractive installation
or acquisition fails closed. Cancellation waits for an already-started native
package transaction (and its normal authentication prompt) to finish safely;
it does not start a VM afterward.
No Podman or guest disk build belongs in this consumer. An artifact directory
changes only where the same signed bytes are read; it does not replace
identities, trust roots or descriptors, and is not a promise of network-free
dependency bootstrap.

Corral keeps its normal policy for listener authentication.
The consumer preserves `CORRAL_AUTH_REQUIRED`, `CORRAL_ADMINS`,
`CORRAL_PEER_TOKEN`. It also preserves Corral's ordinary settings for URLs and tokens.
It never clears authentication to make a readiness report succeed.
It excludes overrides for backend discovery and plugin acquisition, not
Corral authentication. Each lifecycle command names QEMU and the exact owned VM.

The existing public wrapper is not cut over until a real signed disk and
manifest pass all four native firstboot/browser/lifecycle qualifications.
Private helper code or fixture receipts alone do not establish that result.

## Record-free fresh accounts (tunaOS#4092)

`tuna-test` above has a session-less AccountsService record, so it proves
GDM's `FallbackSession` path only. `scripts/tuna-vm-lane --fresh-accounts`
is a separate boot of the same disk (QEMU `-snapshot`) that passes the
`tuna.vm.fresh-accounts` systemd credential (SMBIOS type 11). Only then does
`tuna-vm-fresh-accounts.service` run `useradd -m` before GDM starts, as an
installer would: `tunastd` (standard), `tunaadmin` (`wheel`), and the
control `tunaseeded`, whose record is pre-seeded. `tunastd` and `tunaadmin`
get no per-user AccountsService record, no per-user Session preselection
and no autologin. This is distinct from the global AccountsService
templates: on an installed GDM 51+ with `FallbackSession` support, their
`[User]` group explicitly sets `Session=`. GDM can launch the configured
`tuna` fallback without propagating that name to the worker's persistent
settings; empty templates alone have not qualified record creation.
Older GDM retains global `Session=tuna`: it can prefer launchable GNOME
even when that session has `NoDisplay=true`. An absent or unparseable GDM
version must not opt into the empty-template policy. Neither policy edits
existing per-user records or replaces a valid saved session choice.

For the general credential-only fixture, GDM's own
`org.gnome.login-screen disable-user-list=true` asks directly for the user name.
The fixture inserts its `tuna-vm-fresh-accounts` dconf database ahead of the
preserved vendor profile and requires an actual `gsettings get` readback of
`true`. The vendor profile need not contain `system-db:gdm`; writing `gdm.d`
alone did not apply the setting in run 41234017707. In run 41230684089 the old
Tab count to "Not listed?" selected the listed `tunaseeded` instead.
The private native candidate retains the normal user list and the separately
proven bounded navigation reset: its package repair must qualify the ordinary
greeter, not that fixture shortcut. The installed manifest controls only this
setup choice; strict candidate and installed-pair admission is still required
before any native persistence gate.

The process/logind greeter predicate is not an input-readiness predicate.
In [run 41248530233](https://github.com/tuna-os/tuna-desktop/actions/runs/41248530233),
artifact `marlin-vm-orca51` (ID `13061267386`, SHA-256
`1de554a272722c7640b767cde1f75cfa7603910bd7c0c3cda4b4895f38d79af2`)
retains a black `fresh-accounts/fresh-greeter.png`; its
`tunastd-first-password.png` still shows **Username**, not Password, when
the old driver sends the password. The serial journal records
`pam_faillock(gdm-password:auth): User unknown` at 19.270579 seconds and no
user session. The standard counterpart reaches a visible Password prompt
and authenticates both accounts; its later admin sudo failure is separate.
The run's PR source is `df05bde92cd4392871db9d36d3d3a21ce43b846b`;
workflow checkout/manifest metadata is the synthetic merge
`b4d42581e7299323fd6ead9f76dcd94862990f1c`. Both use published Marlin
base `sha256:6c1e25b1fa9ddc07d7e71f767456839676333d3ebdc332b642a467f56c8ff71b`;
the Orca test-layer image ID is
`sha256:0e3b49a6df3ee644fb9ec4f1dc5b0971da0e6d67b4aedbbc0bedcb5ff116b2e8`.

The general credential-only driver waits for the actual greeter's focused,
visible, showing, editable, sensitive and enabled AT-SPI entry before
typing each credential. The probe runs as the active non-root greeter UID,
binds the accessibility bus PID/UID to the original `gnome-shell` process
and start time, and distinguishes text from password-text roles without
reading names or entry contents or invoking accessibility actions.
Prompt receipts and pre-input frames are retained. Service/greeter readiness
uses the existing greeter deadline; name, password and session readiness share
one existing login deadline. There is one credential pair per general-mode
login, no fixed-sleep increase and no authentication retry. The admitted native
candidate retains its existing bounded stock-user-list attempts. This fixes
wrong-phase input in the general fixture; old receipts alone do not identify
which input was lost during startup.

The first native observer run found 1267 distinct GNOME greeter actors,
exceeding the unchanged 512-node observation budget when hidden actors were
enumerated. This was not a cycle (maximum depth 15, no duplicate objects).
The actual focused username entry had all required flags, and every
non-root ancestor was SHOWING/VISIBLE. Pruning non-SHOWING branches visits
131 nodes instead, including hidden branch roots, without changing the
node/depth/time limits. The application metadata root is exempt from this
prune because it is not a visible component. This follows the existing
shell-focus observer's SHOWING traversal rule.

| Gate | Actual operation and evidence |
| --- | --- |
| V-FRESH-RECORD-FREE-&lt;user> | Before any login: account exists with a home, no `/var/lib/AccountsService/users/<user>`, no GDM automatic/timed login, `wheel` only for the admin |
| V-FRESH-CONTROL | The same probe classifies the pre-seeded `tunaseeded` as NOT record-free |
| V-FRESH-LOGIN-&lt;user>-{first,second,reboot} | General fixture: owner-bound focused editable GDM text and password-text prompts precede QMP credentials. Explicitly admitted native candidate: existing bounded stock-user-list navigation. Both require exactly one `gdm-password` VT session of that account running `tuna-compositor` and no `gnome-shell`/`gnome-session` |
| V-FRESH-SESSION-&lt;user>-{first,second,reboot} | Read AccountsService's effective `Session` over the system bus: it must be `tuna`; if a cache record exists, any saved `Session` must also be `tuna` |
| V-FRESH-RECORD-CREATED-&lt;user> | Verified private native candidate only: a physical AccountsService record must exist during the first logged-in session; any saved `Session` must be `tuna` |
| V-FRESH-SUDO-&lt;user> | `sudo -S -k true` as the account with its password: admin succeeds, standard is refused by sudo policy |
| V-FRESH-LOGOUT-&lt;user>-&lt;round> | logind ends the session and the greeter is ready again |
| V-FRESH-REBOOT / V-FRESH-SESSION-RELOADED-&lt;user> | A different `boot_id` and ready greeter, then effective AccountsService `Session=tuna` reloads before login; both accounts authenticate into Tuna again |
| V-FRESH-RECORD-KEPT-&lt;user> | Verified private native candidate only: physical records for both accounts remain before either post-reboot login |

Every path retains the effective-session checks from #989, including the
GNOME reference's valid record-free general case. Explicitly admitted native
candidates additionally retain every original physical record creation and
retention criterion; an absent or invalid candidate cannot opt into native
qualification. The private candidate's 24 original gates are not replaced
by the additional effective-session coverage.

The controller reads a nonempty old boot ID through the read-only `greeter`
action, then calls `GuestAgent.request_reboot()` once.
It sends QGA [`guest-shutdown` with `mode=reboot`](https://www.qemu.org/docs/master/interop/qemu-ga-ref.html#command-QGA-qapi-schema.guest-shutdown).
QGA returns no response on success and does not guarantee shutdown.
The method retires its transport after it tries to send; send errors propagate.
A return is not an acknowledgement or proof of reboot.

The controller reconnects at once, with no extra sleep.
It retains the 180-second limit for a new boot and ready greeter.
A boot ID that did not change cannot pass, nor can a greeter that is not ready.
Both post-reboot logins and logouts remain mandatory, as does physical record
retention in the admitted native campaign. The native 60-second login limit,
two authentication tries and 90-second trace stay unchanged.

Run 41215443626 failed both native VM jobs with the AccountsService record
still missing after a real record-free `tunastd` manual GDM login on
GDM 51.1.1-1 / AccountsService 26.27.3-1. First login, standard-user sudo
denial and logout passed; admin, second-login and reboot coverage aborted.
The inherited global `Session=tuna` suggested a same-value setter might
explain the missing write. Run 41237623922 disproved that as the remaining
cause: even empty effective settings left the record absent. An empty
global template is not itself proof that persistence is fixed: only the
unchanged native gates above can qualify the fix. No setup script may
create the fresh accounts' records or invoke a cache operation to do so.

Receipts are in `fresh-accounts-receipts.json`; frames per attempt and
session. Both native VM jobs must complete the standard and administrator
first login, real record creation, sudo policy, logout, manual second
login, reboot, record retention and post-reboot login gates. Only Arch/GDM
51 is covered by this native lane; helper-execution tests also cover
legacy GDM template policy, but do not constitute a pre-51 native proof.

Run 41226473836 (desktop c3713c34) left the record absent after a real
orca51 `tunastd` first login, and the helper's chosen policy unobserved.
Two read-only diagnostics now record what happened; neither is a gate.
The image build prints `tuna-vm-lifecycle gdm-policy`: the `gdm` the helper
resolves and its realpath, bounded `--version` output/status and parse, the
`daemon/FallbackSession` literal-probe status, the derived `empty`/`legacy`
policy, `pacman -Q gdm libgdm accountsservice` and the binary's owner.
Each `fresh-state` receipt adds an `accounts` block, collected in order:
physical record presence, the global `standard`/`administrator` templates
(candidate presence in `/run`, `/etc`, `/usr/local/share`, `/usr/share`
precedence, the winner, and every `[User]` `Session`, `SessionType`,
`XSession` and `SystemAccount` occurrence: `[]` is missing, `[""]` empty),
`Properties.Get` without D-Bus activation of exactly `Session`,
`SessionType`, `Saved` and `LocalAccount` on
`/org/freedesktop/Accounts/User<uid>`, then record presence again.
An unexported object, absent bus or wrong type is an explicit error
(remote D-Bus error name or exception type only), never an empty Session or
false `Saved`. Collection points: preflight, first session, after each
first-round logout (before a missing-record abort), after reboot, and once
when a login fails. Nothing calls `FindUserByName`, `CacheUser` or a
setter, retries, or dumps other template keys, error messages or stderr.
A record seen only after logout, `Saved=true` or an effective
`Session=tuna` never substitutes for `V-FRESH-RECORD-CREATED-<user>` at
the first session.

### Observed GDM 51 persistence failure and bounded trace

Run [41237623922](https://github.com/tuna-os/tuna-desktop/actions/runs/41237623922),
head `f7208bba`, failed `V-FRESH-RECORD-CREATED-tunastd` in **both**
native profiles. The receipts show UID 1001, a real `gdm-password` VT 2
Wayland login running `tuna-compositor` and `tuna-shell-gtk`, successful
standard-user sudo denial and logout, but no physical record during the
session or after logout. The winning `/etc/accountsservice/user-templates/`
standard and administrator templates each contain `Session=`; effective
`Session` and `SessionType` are empty, `Saved=false`, `LocalAccount=true`.
Packages are `gdm 51.1.1-1` and `accountsservice 26.27.3-1`. Administrator,
second-login and reboot acceptance remains unexercised, not passed.
The retained logs of jobs 124646121324 and 124646121372 contain none of the
four allowlisted worker markers below and no session-setter call headers.
This is an evidence gap, **not proof that saving was skipped**.

For review before the next native campaign, add just `--fresh-gdm-trace`
to its existing `scripts/tuna-vm-lane --fresh-accounts ...` command.
The opt-in helper `tuna-vm-gdm-trace` runs only around the first ordinary
`tunastd` login attempt, stops before any existing selection retry, and is
stopped in `finally` on login/input/guest-agent failure. The observer has
an independent 90-second lifetime, a 1 MiB header-input bound and 128-event
bound; these add no login timeout, wait, retry, session or acceptance gate.
Transient-service startup allows at most two seconds for observer readiness.
Existing-marker queries additionally stop at 64 KiB or three seconds.
The trace receipts are `tunastd-first-trace-{start,stop}` in the existing
`fresh-accounts-receipts.json`; collection failure is explicit and non-gating.

Privacy contract:

- `dbus-monitor --system --profile`, **not** normal monitor/binary mode,
  prints tab-separated message headers and no argument or error bodies.
  Match rules select only `SetSession`, `SetSessionType`, `SetXSession`
  calls on `/org/freedesktop/Accounts/User1001`. Return/error headers have
  no path, so the observer consumes their metadata and retains only replies
  correlated by call sender/serial and reply destination/reply-serial.
  Unrelated headers are discarded in memory; no raw bus log is written.
- Existing `gdm-password` worker journal entries are reduced to four fixed
  labels: saving account details for `tunastd`, session name set to `tuna`,
  save failed, and `SESSION_OPENED`. PID, time, method and reply metadata
  are sufficient; usernames other than the fixture, journal text, setter
  argument values, error names/bodies, PAM conversations and environment
  values are not exported by this observer.
- **Never enable GDM debug or send SIGUSR1.** The audited upstream
  [worker source](https://github.com/GNOME/gdm/blob/51.1.1/daemon/gdm-session-worker.c#L757)
  logs complete PAM query payloads at line 757, selected choice responses
  at line 576 and PAM environment entries at line 1537. Filtering this
  observer's output cannot make a broader journal/serial export safe.
  Missing pre-existing markers are reported as
  `unavailable-or-debug-disabled`; no conclusion about the save stage
  follows from their absence.
- No probe invokes `FindUserByName`, `CacheUser` or an AccountsService
  setter, writes a per-user cache record, changes GDM configuration, or
  offers a fake second desktop session.

A matching setter error header proves an error reply, not its cause.
A successful reply without a record points at persistence, not at missing
session propagation. No setter observed with unavailable worker markers
remains incomplete evidence. The physical-record gate is unchanged.

### Root-fix candidate and actual Arch package boundary

The upstream [GDM 51.1.1 normal-session open path](https://github.com/GNOME/gdm/blob/51.1.1/daemon/gdm-session.c#L2982)
sends display mode and `XDG_SESSION_TYPE`, then `Open`; it does not send
`SetSessionName`. Explicit selection does send
`SetSessionName(get_session_name(self))`. With one offered Tuna session,
[GNOME Shell 51.0 hides the session menu](https://github.com/GNOME/gnome-shell/blob/51.0/js/gdm/loginDialog.js#L543).
The [settings save routine](https://github.com/GNOME/gdm/blob/51.1.1/daemon/gdm-session-settings.c#L369)
can succeed with null session/type/language and, for a local account,
without a setter or `CacheUser`. Registration is not this save trigger.
**Inference:** fallback selection may never reach the worker's settings.

Run [41245509890](https://github.com/tuna-os/tuna-desktop/actions/runs/41245509890)
had healthy observers in both native profiles.
Neither saw a call to set the User1001 session.
Worker markers: unavailable; debug off.
Their absence proves nothing about the save stage.
Neither run proves the cause.

The native image gets GDM from Arch through `pacman`, not this repository's
`packaging/arch/PKGBUILD` (which builds only Tuna Desktop).
The canonical tunaOS `tunaos.toml` desktop package list requests plain
`gdm`, without a Tuna GDM version/patch override. This lane starts from
`ghcr.io/tuna-os/marlin:gnome`; both the preview Containerfile and VM
fixture layer run `pacman -Syu`, so a future replacement must survive the
final package transaction rather than being silently overwritten.

The [Arch recipe at revision 36e76b2b](https://gitlab.archlinux.org/archlinux/packaging/packages/gdm/-/blob/36e76b2b4674dc196e611782c4f8f6d5e476e231/PKGBUILD)
splits `gdm` and `libgdm` from one build.
It uses the upstream tag and an Xsession patch.
Its `prepare()` uses `git apply -3`.
The build uses `arch-meson`, `meson compile` and `meson test`.

[Package source PR963](https://github.com/tuna-os/tunaos-packages/pull/963)
adds a private candidate at
`7b52bdf34be22bc60fef62b157be64b589b13f6a`.
It builds GDM and libgdm **51.1.1-1.1** together.
It retains the PAM configuration, conffile declarations and split ownership.
Both sources and patches have fixed hashes.
`prepare()` applies the patches to the release archive.

The candidate queues `gdm_dbus_worker_call_set_session_name()` before `Open`.
It uses `get_session_name(self)` on the same worker connection.
It does not change the resolver or program sessions.
Explicit, saved and fallback choices keep their precedence.
It does not force `tuna` or change registration.
No root probe writes AccountsService state.

The proposed insertion, inside the existing non-null-conversation block
immediately before `gdm_dbus_worker_call_open()`, is:

```c
if (!self->is_program_session)
        gdm_dbus_worker_call_set_session_name (conversation->worker_proxy,
                                               get_session_name (self),
                                               conversation->worker_cancellable,
                                               NULL, NULL);
```

The approved local factory build produced both unsigned packages.
Meson: one pass, zero failures.
The staged verifier installed both packages.
It checked exact versions, owners and ELF closure.
Both containers enforced 8 GiB memory, zero swap and CPU quota 200%.
We removed both containers.

The local archive hashes are:

| Package | SHA256 |
| --- | --- |
| gdm 51.1.1-1.1 x86_64 | `5fa15579210678f6168ea5102b79050503b768fd93476910855281f4b3d60d92` |
| libgdm 51.1.1-1.1 x86_64 | `ca4587fe886490c1e1925c9419bf5714fe9327cb9367685fb8d306b9a2243797` |

These checks do not prove login or physical record creation.
The C smoke used actual functions with stubs.
It checked explicit, saved, fallback and program choices.
It does not prove GDM, PAM, D-Bus or AccountsService runtime behavior.
We deleted its temporary source and binary.

### Private native GDM fixture

The CI job builds the pinned package source once.
It uses the existing factory build and staged verifier.
Both native profiles use the same run's artifact.
The artifact has package hashes and the source identity.
Those hashes need not equal the local hashes above.
The manifest also binds the package members to their hashes.

The final `gdm51` overlay runs after every `pacman -Syu` and Orca step.
It checks both archive hashes and package metadata.
It installs both packages in one transaction.
It checks their versions, owners and installed bytes.
It checks the existing shipped-payload manifest without changes.
No package upgrade follows.

CI retains this evidence in `vm-lane-artifacts/gdm51/`.
The final image ID and kernel provenance describe the image after the overlay.
The fresh journey receives `TUNA_VM_GDM_NATIVE_CANDIDATE` and
`TUNA_VM_GDM_NATIVE_SOURCE_SHA`.
The first names the bounded manifest; the second pins the expected source.
The journey checks the manifest and guest package identity before input.
The existing read-only `gdm-policy` action runs once for this check.

Neither the manifest nor the package versions can satisfy the physical-record guard.
All standard/admin, first/second login, sudo, logout and reboot gates stay intact.
Candidate admission alone does not exercise either native journey.
No source, function or package check counts as runtime acceptance.
The source PR stays unmerged.
This fixture does not sign packages, publish a repository or change production pins.

### Actual candidate campaign 41255271531

[Run 41255271531](https://github.com/tuna-os/tuna-desktop/actions/runs/41255271531)
ran for desktop PR head `31bf6bb30ee9949918b161a3a6035e906c2efb79`.
CI uses a merge checkout, not the PR head directly.
It built package source `7b52bdf34be22bc60fef62b157be64b589b13f6a` once.
The factory build and staged verifier passed.
Both containers reported 8 GiB memory, zero swap and CPU quota 200%.
Cleanup completed.

These are the CI hashes of the package archives, not the local hashes above:

| Package | SHA256 |
| --- | --- |
| gdm 51.1.1-1.1 x86_64 | `8c67e6be0e707f157cd901d319dd2af522f9666c352af42958d4a8bbaca62f66` |
| libgdm 51.1.1-1.1 x86_64 | `a559fae8e6d3166294c6d11ff76b39258ed0ca2c5e62f4e9ccdd5bc5d24f9af4` |

Both profiles installed that exact pair after all upgrades.
Their metadata, owners and installed bytes matched its manifest.
Both checks left the shipped-payload manifest unchanged.
Both profiles passed the ordinary hardware-session lane.

| Profile | Final immutable image |
| --- | --- |
| distribution | `sha256:92de3d18015d68e81e4fc769154ac5f130bfa719f3ed70043a0fb8ca6cd90491` |
| upstream Orca 51 | `sha256:6a00f62d298ad8e3f79f5b9bfde0247f65976cc474a8d0c931f60c8f2a6ec3f4` |

Both profiles began with no physical record for UID1001.
Both passed its first real `gdm-password` login.
Both saw a physical record with `Session=tuna` during that session.
That record also survived logout.
The Orca profile passed the same first-record guard for UID1002.
These results cover those logins, not the complete journey.

The Orca observer saw a `SetSession` call and its successful reply.
It retained only headers.
The distribution trace covered its first try.
Its standard login succeeded on the second try, after the trace stopped.
Missing headers do not prove a missing setter.
Worker markers: unavailable; debug off.

Sudo refused the standard user in both profiles.
The admin did not log in on the distribution profile after two tries.
The admin login and record checks passed on the Orca profile.
Sudo refused that wheel administrator by policy, with exit status 1.
The evidence does not establish the inherited contents of sudoers.
Second-login and reboot acceptance did not run.

Both fresh journeys remain **failed**, not qualified.
Neither the persistence evidence nor the package provenance satisfies the missing gates.
No production publication, image pin or merge follows from this run.

### Actual candidate campaign 41262331704

[Run 41262331704](https://github.com/tuna-os/tuna-desktop/actions/runs/41262331704)
ran for PR #985 head `598ca553abc24f4b10bb335d22f99a5ff4e17a81`.
CI used merge commit `a3d6334efd4176ff7082a6b4d1ddc5d9ad1fe1d3`,
with parents `eed9aa95658f5d75496954b10142d50c807ee88f` and
`598ca553abc24f4b10bb335d22f99a5ff4e17a81`.
Package source stayed at `7b52bdf34be22bc60fef62b157be64b589b13f6a`.
The archives in CI had the same hashes as those in the previous run:

| Package | SHA256 |
| --- | --- |
| gdm 51.1.1-1.1 x86_64 | `8c67e6be0e707f157cd901d319dd2af522f9666c352af42958d4a8bbaca62f66` |
| libgdm 51.1.1-1.1 x86_64 | `a559fae8e6d3166294c6d11ff76b39258ed0ca2c5e62f4e9ccdd5bc5d24f9af4` |

For both profiles, real first logins passed for the standard user and administrator.
Physical records held `Session=tuna`; read-only observations reported `Saved=true`.
Both records survived the first logout.
Standard sudo denial, administrator authorization, both manual second logins
and all pre-reboot logouts passed.

Then the host reported literal `timed out` before `V-FRESH-REBOOT`.
No actual new boot ID, post-boot retention or post-reboot login/logout received credit.
Both fresh journeys failed.

The old CLI used `systemctl reboot --no-block` before it wrote JSON.
Its host still awaited the child exit and output through the agent being torn down.
That sequence can cause a teardown/reply race; the run does not identify the
exact timed-out I/O or prove that the guest changed boots.
The QGA request removes only that dependency; all gates stay intact.

The receipt for each profile contains nine cases for the strip.
Both reported `TimeoutError` and `cleanup_confirmed=true`.
This failure of a strip deadline is independent of policy binding.
This run is not a PASS for the full suite.
This run does not qualify reboot.
No production publication, image pin or merge follows from it.

### Actual candidate campaign 41267289849

[Run 41267289849](https://github.com/tuna-os/tuna-desktop/actions/runs/41267289849)
used PR #985 head `c8554f32c87630ffc68afefcd0bb17e2d5f21ec3`.
CI used merge commit `b50a3148e90e3d362bed2beb327b287ac281888a`.
Its parents are `017a7c6af924894f0ccd74f4d2bba46b3ac765f4`
and that PR head.
Package source stayed at `7b52bdf34be22bc60fef62b157be64b589b13f6a`.
The new factory build measured the same three archive hashes as the previous CI run.

Both native profiles passed all 24 unchanged gates for fresh accounts.
Each profile has six login/logout cycles for UID 1001 and UID 1002.
All sessions used `gdm-password`, Wayland VT2 and Tuna Desktop.
During first login, the physical records existed before the read-only property queries.
They had `Session=tuna`.

Sudo refused the standard user and authorized the administrator.
Each account passed its manual second login.

The reboot proof includes actual distinct boot IDs and a ready GDM greeter:

| Profile | Before the request | After reboot |
| --- | --- | --- |
| Distribution | `2eacd615-fc63-4dda-a7ab-09fbe78b83c0` | `c7dafa91-fbde-451f-9a76-de691354a5b2` |
| Orca | `df390a84-f4e9-4bde-b0f1-9a7c59c5e0b2` | `565b11aa-2ded-452e-8f37-a546bb4f7da6` |

Before the postboot login cycle, both accounts had physical records with `Session=tuna`.
Both postboot login and logout cycles then passed.
Each trace has a `SetSession` call for `User1001` and a return with the same serial.
There is no message body.
Worker markers remain unavailable; no debug toggle occurred.
Their absence gives no negative evidence.

The final images, after all upgrades and the verified pair installation, were:

| Profile | Immutable image ID |
| --- | --- |
| Distribution | `sha256:226fd57b804f944c9f7d80dbb3e4756c7a679e166739517407ce1c6f58d13968` |
| Orca | `sha256:503888154f04fd42a03ded3b1f85c6e2a056f5e5d8c971f12c0d0a1d24c39512` |

The package artifact is `13067948020`.
The distribution and Orca artifacts are `13068871310` and `13069002236`.
Public hashes from the initial guest boot matched the final overlay's payload seal.
The probe did not read those policy files again after the fresh journey's reboot.

This qualifies the native fresh-account behavior, not the full CI run or production.
Both ordinary strip journeys still failed at `10-column-height` for `beta`.
Their diagnostics show 21 tries and last reason `fixture-color-mismatch`.
The local deadline of 10 seconds expired, with more than 81 seconds left on the total deadline.
Cleanup passed.

No timeout, pixel, identity or acceptance guard changed.
PR #985 remains blocked by the required strip gate; there is no merge or publication.

### Bounded strip capture failure metadata

Run 41262331704 placed the strip failure inside the capture for case 10.
That run did not establish whether the local or total deadline caused the failure.
The new diagnostic does not change either deadline or qualify a failed capture.

A failed capture adds one `capture_failure` object to the existing receipt.
It contains the source-owned case `label` and `role`, plus the `attempts` count.
Its fixed fields are:

- `capture_begin_monotonic_ns` and `failure_monotonic_ns`;
- `local_deadline_monotonic_ns`, `capture_deadline_monotonic_ns`
  and `total_deadline_monotonic_ns`;
- `stage`: `png-acquire`, `ppm-acquire`, `ppm-pixels`, `png-pixels`,
  `retry-refresh` or `post-frame-read`;
- `last_not_ready_reason`: `fixture-body-not-visible`,
  `fixture-color-mismatch`, `other-not-ready` or null;
- `ppm_rgb_verified` and `png_rgb_verified`: separate booleans for the latest try.
  Null means that the capture did not reach the color check.

The object contains no frames, inventory, exception text or bus payload.
The capture re-raises its original exception; cleanup stays unchanged.
The local 10-second and total 120-second limits stay unchanged.
Both pixel checks and the identity check after the frame remain mandatory.

The existing code does not guard the final write of `receipt.json`.
An `OSError` from that write can mask an earlier failure.
This diagnostic does not change that existing limit.

### Normal notification preparation for strip proof

The public frames show a notification over Beta.
It covered two of the 25 color points in both PNG and PPM.
The fix uses normal keyboard input, not a change to the pixel tolerance.

Strip preparation uses `Super+N`, observes key release, then uses `Tab`
and observes release again.
Before `Return`, a second observation must find one `Notifications` Close control.
That control must belong to the original shell process and its AT-SPI bus.
It must report `FOCUSED`.
A layer namespace alone is not proof of that owner.

After the normal Close action, the banner must be absent and all keys released;
a queued banner that drops in instead gets its own focused Close (see
"Installed strip captures").
Original windows, focus, workspace and session mode must remain unchanged.
Both PNG and PPM still need all original 25 color checks.
No pointer coordinates or empirical offsets select the control.
There is no DND change, backend notification clear or authentication-dialog action.

The controller refuses preparation for held buttons, gestures, authentication UI or unknown or ambiguous overlays.
All key commands share the unchanged 10-second capture and 120-second total deadlines.

#### Actual nested UI proof

A private smoke of the nested UI used the exact package from run 41267289849,
artifact `tuna-arch` / `13067334148`.
Its package hash and both executable hashes match the receipts from both native profiles.
The original checks of 25 color points failed for each format with a test banner of `critical` urgency.
The normal focused Close action removed it.
The first post-close PNG and PPM pair passed the original checks.
Window geometry, focus and mode stayed unchanged; post-frame identity and cleanup passed.

The smoke used separate actual PNG and PPM acquisitions through private Xvfb/scrot.
It did not use native QMP acquisition or exercise an installed VM.
There was no native compilation.
Both required locks, the 40-GiB floor and the 8-GiB/no-swap/200-percent caps applied.
Its HOME/XDG directories were fresh.

Focused checks passed: 57 acceptance/stationary tests and 20 existing navigation tests.
The keyboard path has approval from two independent reviews.
Receipt: `985-c855-public-notification-close/receipt.json` in the retained finish evidence.

The keyboard path still needs qualification in CI with the actual installed image.
The completed fresh-account proof above does not qualify that separate path.

### Private image and input corrections

The old controller used one or two forward Tabs.
[Each user has a focusable button](https://github.com/GNOME/gnome-shell/blob/51.0/js/gdm/loginDialog.js#L67-L137).
Hover can also move focus.
The number of Tabs depends on the list and current focus.
The retained run does not reveal where the UI had focus.

The corrected input parks the pointer outside the list.
Both Escapes share the original two-second budget.
Five Up presses reach the first item without vertical wrap.
Two backward Tabs then reach `Not listed?` through the bottom accessibility button.
The fixture has at most four human accounts and those two buttons.
The old per-Tab sleeps are gone.

[GNOME's focus handler](https://github.com/GNOME/gnome-shell/blob/51.0/src/st/st-focus-manager.c#L102-L140)
lets backward Tabs wrap, but not Up by default.
The controller still allows at most two login tries.
Its 60-second login deadline and 90-second trace bound stay unchanged.
Real UI qualification still needs the complete native journeys.

The [pinned installer](https://github.com/tuna-os/bootc-installer/blob/9f582fe0ecc19561be1115dfef64a59e91ea5072/bootc_installer/defaults/user.py#L16-L17)
gives administrators the wheel group.
Its [user setup](https://github.com/tuna-os/fisherman/blob/d349c31e47b1c05ef82d67811d5f4f9e77a62e2a/internal/post/user.go)
does not grant sudo authorization.
The result shows a gap in authorization for the administrator.
It does not establish the inherited sudoers bytes.

The shared image uses `tuna-vm-admin-policy` for its global wheel role.
Its rule is `%wheel ALL=(ALL:ALL) PASSWD: ALL`.
It names no test account or probe command.
The installed file has owner `0:0` and mode `0440`.
The account helper and sudo probe remain unchanged.
Standard accounts outside wheel must still fail by policy.

An explicit include precedes inherited rules.
The `.conf` suffix prevents a second include through `@includedir`.
This order keeps exceptions for specific commands, such as bootc upgrade.
The image uses real `visudo` to check syntax and effective inclusion.

The `cvtsudoers` tree proves the role is first and unique.
It rejects alternate or indirect duplicate includes.
Setup keeps one explicit include.
Tests parse the actual role with sudo's tools, without PAM or privileges.

The image appends hashes for the policy and root sudoers file.
It does not regenerate the existing GDM payload entries.
Later Orca and GDM layers must preserve that complete receipt.
These source and parser checks do not qualify the runtime gates.

### Why a first login need not create a cache file

PR #931 incorrectly required a physical cache file after the first login.
The direct [GNOME reference receipt](https://github.com/tuna-os/tuna-desktop/blob/main/scripts/lib/fixtures/fresh-account-gnome51-reference.json)
boots the **same pinned published Marlin GNOME base** as failed diagnostic
run [41223633281](https://github.com/tuna-os/tuna-desktop/actions/runs/41223633281):
`ghcr.io/tuna-os/marlin:gnome@sha256:8d71660f78120a141e9ae8e620bd66645c6bfb52f1ab4cd663f9672aaa0b0b94`.
It ran on an owned Corral VM on `karnataka`, without a Tuna package or the
VM-lane layer. `useradd -m` created separate standard and wheel accounts;
neither had a cache record, `.dmrc`, preselected session or autologin.
Both first successful GDM password logins started stock GNOME Shell 51.1
with gnome-session 51.0, GDM 51.1.1 and AccountsService 26.27.3, in active
Wayland `gdm-password` sessions on VT2. **Both cache files remained absent**;
AccountsService exported empty `Session` and `Saved=false`. The monitored
system bus contained lookups but no `SetSession` or `CacheUser` calls before
the explicitly labelled post-observation intervention. The receipt retains
actual package/template/session identities, navigation distinctions and
successful VM/disk deletion plus exact-name inventory absence.

This matches upstream, rather than a missing Tuna session-start method:

- [AccountsService 26.27.3 `user_update_from_template`](https://gitlab.freedesktop.org/accountsservice/accountsservice/-/blob/26.27.3/src/user.c#L330-414)
  applies the template to in-memory/exported properties without saving a
  file. Its `user_change_session_authorized_cb` writes extra data only when
  the normalized new session differs from the current property.
- [GDM 51.1.1 session settings](https://github.com/GNOME/gdm/blob/d643e68963ab74564955025b554ec23cd794770d/daemon/gdm-session-settings.c#L300-L320)
  explicitly loads properties even without saved state. Its
  [`gdm_session_settings_save`](https://github.com/GNOME/gdm/blob/d643e68963ab74564955025b554ec23cd794770d/daemon/gdm-session-settings.c#L373-L415)
  only sends non-NULL session/type/language values, and caches only non-local
  users. Loading a local account is not `CacheUser`. Tuna's existing
  templates supply `Session=tuna`; setting that same value is not a reason
  for AccountsService to materialize a cache file.
- [GNOME Shell 51.1](https://github.com/GNOME/gnome-shell/blob/33da06854e229c256afd5872fedd83c28cbfa176/js/gdm/loginDialog.js#L535-L554)
  can request `SelectSession` when the session menu's active item changes;
  this is not a guarantee that every default login changes an account
  property. Its user/session UI reads AccountsService users; the observed
  GNOME login does not cache them. [gnome-session 51.0](https://github.com/GNOME/gnome-session/tree/aed00cf18229a98231c23e14f5798ddb918c4956)
  has no AccountsService mutation API.
- GNOME Initial Setup is a **different account-creation/property-writing
  path**, not installed in this Marlin reference. Its [51.0 account page](https://github.com/GNOME/gnome-initial-setup/blob/51.0/gnome-initial-setup/pages/account/gis-account-page-local.c#L447-L488)
  calls `CreateUser` and sets an icon; its [language page](https://github.com/GNOME/gnome-initial-setup/blob/51.0/gnome-initial-setup/pages/language/gis-language-page.c#L100-L153)
  writes the language. AccountsService's `CreateUser` path calls
  `cache_user`, unlike an installer using `useradd`. A record produced there
  must not be misattributed to the first ordinary GDM login.

The corrected proof does not write a record, call `SetSession`, preseed a
choice or add product-side cache writes. It reads the effective
AccountsService session with `FindUserByName`/`Get(Session)` and requires
`tuna` after **every** login and after reboot, while still rejecting a saved
GNOME choice. The record-free preflight, seeded negative control, real
authentication, standard/admin sudo policy, logout and reboot remain gates.

### Original #931 merge audit

[#931](https://github.com/tuna-os/tuna-desktop/pull/931) did **not** have green
exact-head CI. Head `d62ec870c0f402c22fbae6719afd227cd0353b81` was merged by
`hanthor` at `2026-10-31T15:42:38Z` as
`cba3cdbd5cd629d42c2512124f3fe7e35c117b55`, while its
[exact-head run 41215443626](https://github.com/tuna-os/tuna-desktop/actions/runs/41215443626)
was unfinished. `check` failed at 16:00:23Z, `marlin-vm` at 16:27:14Z,
`marlin-vm-orca51` at 16:30:35Z and `ci-gate` at 18:14:39Z.
An earlier PR comment already documented the missing-record failure as a
merge blocker. At investigation time the branch protection endpoint returned
“Branch not protected”; the effective organization ruleset required only
deletion/non-fast-forward protection, not successful status checks. These
observations explain why an ordinary merge was possible; they do not prove
an administrator bypass was used.

The Debian package journey must retain the original beta package's
`share/pam.d/tuna-lock` conffile bytes, including its comment. Run
41151873648's `journey` failed on dpkg's conffile prompt before the
upgrade could qualify. PR #930 restores those bytes;
the fresh-account change must include that fix, not force a conffile
answer or change PAM policy to bypass the upgrade failure.
The Python lane.boot API keeps its original four-value return and original
VM device profile by default. Lifecycle callers explicitly request
`guest_agent=True` to add the QGA transport and receive its socket as a fifth
value; existing performance callers keep working without a guest agent.

## Paired stock-GNOME switcher reference (P-WM01)

The independent DEV profiles `--profile gnome-reference` and
`--profile tuna-reference` use the existing `scripts/tuna-vm-lane.boot()`,
raw-disk installer, QMP/QGA transport, native KVM requirement and unchanged
1280×800 GPU topology. They do not replace either ordinary five-boot Tuna
lifecycle/Orca row, its tour, fresh-account journey or any existing gate.
Whenever lane selection includes `marlin-vm`, both paired DEV members and
their artifact-context consumer are required by the normal aggregate gate.
There is no dispatch-only, repository-variable or credential skip for them.
Neither profile is a shipping image or a performance-lane substitute.

`packaging/marlin/vm-lane/Containerfile.reference` derives both members from
the actual published GNOME 51.1 amd64 manifest
`sha256:104870f1a05fa0a75649ee4ed9952027b29ab12e53af83931ae69e8636e44c3f`,
which belongs to index
`sha256:29097ba660d6f9f7c35c2063b83cf7bbe830202a497852b9b1869bb84dfd6aa5`
(tunaOS publication 41254872557, source
`07022c9fb853fcd36aa27098d50c38a8be0d18ac`). Both add the same current-source
Tuna package and fixture dependencies using the image's retained package
databases, never a rolling repository refresh. The build retains the
original package inventory and GNOME/GDM/session/PAM/application file hashes,
then refuses any original package-version or file-byte change. Only the
CI fixture's `tuna-test` UID 1000 AccountsService session selection differs:
`gnome` versus `tuna`. No automatic login, GNOME keybinding write, GDM theme
replacement, hidden-session rewrite or Shell.Eval admission is involved.

Before either image build or boot, the normal CI path must verify the exact
platform digest under the existing TunaOS cosign subject/issuer policy and
retain its real `platform-cosign.json` output, actual
`platform-verification.json` process witness and exact `index.json` bytes,
including the unique linux/amd64 membership. The witness binds the pinned
Cosign 3.1.4 executable/version, exact subject/issuer-constrained argv, actual
exit status, command bounds, stderr and original stdout hash. Its successful
cryptographic invocation remains mandatory; the consumer never treats copied
JSON as signature verification. Modern Sigstore output names the exact
repository-at-platform digest and `https://sigstore.dev/cosign/sign/v1`;
its empty optional object is not fabricated into extracted certificate claims.
Supply all three files as `--reference-base-evidence`. The published
wheel-policy receipt identifies the image but does not itself contain a
signature-verification result.
CI acquires the pinned cosign binary through the existing Sigstore installer
action; it does not assume Go is installed on the native runner.

The ordinary platform path uses the same verifier via
`scripts/lib/vm_gnome_reference.py verify-platform --platform-digest sha256:… --out DIR`:
it retains the two platform files for the supplied strict digest in
`ghcr.io/tuna-os/marlin`, with one actual verification invocation and the same
certificate policy. The shared `validate_platform_verification` consumer binds
that modern envelope to its process witness without imposing the stock index.
In contrast, `verify-base --out DIR` and `validate_base_bytes` remain strict
stock-reference operations: they additionally require exact index29097 bytes
and unique platform104870 linux/amd64 membership. A different ordinary platform
witness cannot qualify the paired stock reference.

The fixed route
`GuestAgent.run("gnome-reference", OP, JSON)` executes only
`/usr/libexec/tuna-vm-gnome-reference OP JSON`; `OP` is one of `admit`,
`prepare`, `observe`, `file` or `stop`, with the existing transport deadline
capped at 30 seconds. Original stock-GDM and logind/native session admission
comes from this observer. The GNOME path branches before all Tuna DRM-log
and `TUNA_COMPOSITOR_STATE` readiness loops, without a Tuna fallback.
After password submission it waits for the same session's actual compositor,
bus and DRM admission within the existing login deadline. A partially
started session never causes another password to be typed into the desktop.
If that unchanged greeter deadline expires, `greeter-before-login.json`
retains the last actual admission observation and latest transport error,
including missing original-principal or payload-integrity prerequisites.
The diagnostic is failure evidence, never admission or a deadline extension.
The observer queries each logind session property with its own `--property=`
option, as the existing lifecycle probe does. `loginctl` treats a comma-joined
value as one property name and returns no properties; it is not `systemctl`'s
multi-property syntax. Original active-VT, native package and session-owner
admission stay required; an empty observation is never accepted.

The paired consumer owns its real two Files windows and one Settings window,
original process/ELF identities, read-only settings, public AT-SPI snapshots,
physical QMP held-key/Down actions and bracketed framebuffer captures.
`wm-reference/member.json` and the paired context receipt describe those
actual observations. AT-SPI bus/object identities are not WM or kernel
window identities. Context readiness is not a visual-parity verdict and
does not close P-WM01; the actual paired visual assessment remains required.
Source changes and controlled transport tests establish no native runtime
pass. Missing admission, evidence, held-phase observations or strict owned
cleanup must fail rather than silently skip a member.

## Native lifecycle observations

QEMU's guest agent executes a fixed probe with a root UID, while the
compositor, shell and application clients must belong to the non-root
session owner. Artifacts record window IDs, app IDs, rectangles, process
PIDs/start ticks and redacted session metadata. They contain no process
arguments, passwords or application titles.

The last of the existing five pristine boots runs these checks after the
feature tour:

| Gate | Actual operation and evidence |
| --- | --- |
| V-LIFECYCLE-OWNER | Root probe, non-root `gdm-password` login session, three application surfaces/processes |
| V-NORMAL-INPUT / V-NORMAL-INPUT-FAIL-CLOSED | A real GTK client receives ordinary QMP keys while unlocked, then receives none while locked; artifacts contain only counts and PID, never key values |
| V-MOUSE-HANDEDNESS | Nine physical QMP clicks pass through native libinput to the same non-root GTK client while the real GNOME mouse setting changes false→true→false; left/right swap, middle stays unchanged, exact before/after counters retained in lifecycle/mouse-handedness.json |
| V-POINTER-LIVE | GNOME mouse speed/natural-scroll, acceleration profile (`flat`, then `adaptive`), middle-click emulation (on, then off) and scroll-wheel emulation (button 2 → `on-button-down` with BTN_MIDDLE and button lock, then off) reach live libinput device state and restore, asserted on the compositor's per-device readback. Each option needs at least one mouse offering it; wheel emulation is asserted on mice offering button scrolling and BTN_MIDDLE in `pointer_buttons` (libinput rejects a button the device lacks). Both source-built and published guests must report profile/button state and provide GNOME 51's wheel-emulation schema; absence fails rather than skipping proof. Snapshots: lifecycle/pointer-live.json (#343) |
| V-POINTER-HOTPLUG | A QMP-hotplugged USB mouse arrives with the current settings already applied (DRM DeviceAdded path); unplug drops it while survivors keep theirs; bus discovery, arrival and survivor snapshots retained in lifecycle/pointer-hotplug.json (#343) |
| V-VT | VT away/back, DRM pause/activate events, unchanged process identities and app rectangles, matching body plus a fresh visible count update from the real GTK client |
| V-SLEEP-DELAY-INHIBITOR | On the unlocked desktop the compositor's snapshot records its logind sleep delay inhibitor held, and logind's inhibitor list (`systemd-inhibit --list`) shows a `delay` inhibitor on `sleep` from "Tuna Desktop" for the session user's compositor PID, as GNOME 51's screen shield holds one while unlocked (lifecycle/sleep-delay-before.json) |
| V-SUSPEND-UNLOCKED (with -GPU-PM / -GPU-UPLOAD) | The first real suspend starts from the unlocked desktop; the same checks as V-SUSPEND, so the first snapshot after wake must already be locked |
| V-SUSPEND-LOCKED-FRAME | Across that suspend the compositor's `sleep_delay` record shows exactly one sleep whose inhibitor it released only once every lit output had scanned out a frame drawn locked, no release without that, no overrun of logind's `InhibitDelayMaxUSec`, and the inhibitor taken again after wake (lifecycle/sleep-delay-after.json). QEMU's display while suspended is logged as a non-gating observation |
| V-SUSPEND | The second real suspend, from a locked session: real logind suspend reaches QEMU `suspended`; the first guest snapshot after `system_wakeup` must already be locked, with all application identities intact; the real varied lock mask must repaint within five seconds, matching the pre-suspend mask; QEMU inactive-output placeholders fail |
| V-SLEEP-AUTH-FAIL-CLOSED / V-SLEEP-FRESH-AUTH | The second real suspend interrupts a correct password attempt delayed by actual pam_exec; the real PAM success from the old generation is refused, then fresh correct authentication succeeds |
| V-SLEEP-CLIENT-REPAINT | The same GTK client receives a fresh key and visibly repaints after wake/unlock |
| V-VT-FAIL-CLOSED | VT away/back while locked keeps the mask and original application processes |
| V-AUTH-FAIL-CLOSED | Real PAM service temporarily uses `pam_deny`; fresh submitted/refused milestones prove the correct test password was attempted and denied; original service restored afterward |
| V-CAPTURE-INPUT-FAIL-CLOSED | Reachable real untrusted grim/wtype clients are denied capture/virtual-keyboard interfaces while locked; a successful Wayland connection is required and timeouts do not count as refusal; this does not assert that these interfaces are available while unlocked |
| V-SHELL-FAIL-CLOSED | Stop the portal and kill the lock UI; original app/compositor identities survive and the supervised replacement stays locked |
| V-GSD-PLUGINS | Each of the thirteen gnome-settings-daemon plugins the session target wants, MediaKeys included, is the packaged `gsd-*` binary, running as the session user as its unit's main PID and owning its bus name; `org.gnome.SettingsDaemon.Color` belongs to the compositor; A11ySettings has no owner; the session targets are active and the compositor holds `gnome-session-leader-fifo` (lifecycle/gsd-plugins.json, #355, #589) |
| V-GSD-POWER-IDLE | With `idle-delay` set to 20 s and no input, dbus-monitor records gsd-power's own `SetDimming(true)` before its `PowerSaveMode=3`; the compositor snapshot reports locked and `power_save_mode` 3; Return wakes it to 0 and gsd-power undims; the original delay is restored (lifecycle/gsd-power-idle.json, #355) |
| V-LOCKED-HINT | logind's `LockedHint` for the login session reads `no`; the session user's `loginctl lock-session` locks the compositor and the hint turns `yes`; the real password unlocks and it reads `no`; Super+L locks with `yes`; `loginctl unlock-session` unlocks with `no`, as GNOME 51's `screenShield.js` does (lifecycle/locked-hint.json, #846). Required on both acquisitions |
| V-POWER-BUTTON | gsd-media-keys (its unit's main PID, the session user) holds logind's `block` inhibitor on `handle-power-key:handle-suspend-key:handle-hibernate-key` with Why "GNOME handling keypresses". On a fixture desktop chassis, after each gsd restart a new gsd-media-keys must own its name, hold that inhibitor, have `XF86PowerOff` granted by `GrabAccelerators` and the shell must log that it yielded the bindings. QMP `system_powerdown` (ACPI power button) with `power-button-action` `interactive`: `AcceleratorActivated` reaches gsd, gsd calls `org.gnome.SessionManager.Shutdown`, the compositor calls `EndSessionDialog.Open(1, …)` and the `tuna-shell-end-session` layer shows within 15 s; 5 s after the press QEMU is `running` with the same compositor process and logind session and no logind power request; Escape (always sent, far inside the 60 s countdown) removes the layer, the shell emits `Canceled` and logs its D-Bus Power Off dialog. `nothing`: gsd receives the key, and for at least 8 s no Shutdown, dialog call, layer or logind request follows. On the image's `vm` chassis with a fixture `shutdown` block inhibitor held by root: the key reaches gsd and gsd's own process calls logind `PowerOffWithFlags(0)`; gsd sends it without a reply callback (NO_REPLY_EXPECTED), so logind's refusal has no bus reply, and 5 s later logind has emitted no `PrepareForShutdown`/`PrepareForSleep`, `PreparingForShutdown` is still false with the fixture inhibitor held, no other logind request or non-error reply followed, no dialog opened and QEMU, compositor and session are unchanged. Setting, chassis and `/etc/machine-info` are restored (lifecycle/power-button.json, #353, #589) |
| V-RESTART-DIALOG | Both current-build and published guests must exercise the shell's own power menu by physical keys on the unlocked desktop after V-POWER-BUTTON (#589): Super+S opens quick settings; physical Tab moves until the shell's AT-SPI tree (`tuna-vm-shell-focus` end-session mode, observation only) reports Power Off Menu focused, Return opens the menu with Suspend, Restart…, Power Off… and Log Out… showing, and Tab/Return chooses Restart…. Within 15 s the shell (the `org.gnome.Shell` owner, not the compositor) has called `org.gnome.SessionManager.Reboot` and the compositor's manager has answered with the shell's `EndSessionDialog.Open(2, 0, 60, …)`, with the `tuna-shell-end-session` layer up; the dialog reads "The system will restart automatically in 60 seconds" with Cancel focused, as GNOME 51's endSessionDialog.js. It steps to 50 seconds with QEMU running, the session and compositor identity unchanged, no logind power request, `PrepareFor*` signal or `PreparingForShutdown`, and the request still unanswered; Return on the focused Cancel then emits the shell's `Canceled`, fails `Reboot` with gnome-session's `G_IO_ERROR_CANCELLED` and takes the layer down, still with logind untouched. Any failure presses Escape so no countdown is left running (lifecycle/end-session-menu.json). An older published shell does not waive the gate |
| V-POWER-OFF-DIALOG | As V-RESTART-DIALOG for Power Off…: `org.gnome.SessionManager.Shutdown`, `Open(1, 0, 60, …)`, "The system will power off automatically in 60 seconds" stepping to 50, Cancel by Return, `Shutdown` failed as cancelled, logind untouched |
| V-LOGOUT | Both lanes use the shell's power menu by physical keys (#589), as V-RESTART-DIALOG runs Restart…: the shell must ask `org.gnome.SessionManager.Logout(0)`, the compositor's manager must answer it once its `Open(0, 0, 60, …)` has put the dialog up, counting down from 60 with Cancel focused, and the session must outlive that countdown, whose expiry confirms the logout (the greeter may only return at least 55 s after the dialog opened). Within 30 s of the logout taking effect (90 s from the menu dialog's opening) GDM's non-root gnome-shell greeter in its active gdm-launch-environment session repaints the greeter frame captured before login and no original compositor survives. That pre-login frame is the first painted one (at least 8 quantized colors) that the next frame confirms settled within the same 5% tolerance, inside the unchanged greeter deadline; a greeter that never paints fails the login rather than leaving a black reference. A logind `Session.Terminate` substitute or historical published build does not pass |

The original tour's `V-LOCK` still requires exactly unlocked → locked →
unlocked. Its observations end before lifecycle operations add their own
lock transitions. A QEMU pause is never a substitute for guest suspend.
The repaint comparison excludes the panel clock and tolerates up to 20%
changed body pixels for applications such as System Monitor; it also
requires exact window and process identity preservation.

V-POWER-BUTTON runs on the unlocked desktop after V-SHELL-FAIL-CLOSED and
before V-LOGOUT. gnome-settings-daemon 51 reads hostnamed's `Chassis` once
at startup and, on `vm`, powers off for every `power-button-action` but
`nothing`. QEMU guests report `vm`, so the fixture (root, through QGA)
records `/etc/machine-info` and `Chassis`, calls hostnamed `SetChassis`
with `desktop` and restarts `org.gnome.SettingsDaemon.MediaKeys.target`
as the session user. The service refuses manual start and stop, but a
restart of its `PartOf` target propagates; if refused, the fixture kills the
main PID and `Restart=on-failure` brings it back. Afterwards the fixture
restores the recorded chassis and file bytes and restarts gsd again, so the
rest of the lane sees the image default. The `vm` case stays safe because
gsd 51 sends `PowerOffWithFlags` without `SD_LOGIND_SKIP_INHIBITORS`, and
since systemd 257 logind refuses that request outright under a `block`
inhibitor. The fixture refuses to press the button on an older logind.
`power-button-action` `suspend` is not exercised. It would add a second
real S3 cycle, and the user-authorized single-S3 contract below forbids
that. `hibernate`, the lock-screen mode, and an unrestrained VM power-off
are not exercised either.

The compositor also listens to the trusted logind system-bus sleep signal:
preparation invalidates pending authentication generations and engages its own lock; wake restores KMS connector/plane
state and retires lost flip buffers without marking them presented. After
the blocking device reset, bounded nonblocking reads drain obsolete kernel
completions before any new frame is submitted. A valid modeset completion
can carry the preceding vblank's timestamp, so timestamps alone do not
identify abandoned frames. A failed reset or drain keeps scanout blocked
until recovery succeeds. Wake
recovery does not depend on a VT change; an off-seat wake waits for seat
activation.

While the session is active and the lock screen is allowed, the compositor
holds a logind `delay` inhibitor on `sleep`, as GNOME 51's `screenShield.js`
`_syncInhibitor` does. On `PrepareForSleep(true)` it locks and closes the
inhibitor only once every lit output has completed the page flip of a frame
drawn locked, so the frame left on screen through sleep is the lock. It takes
the inhibitor again on `PrepareForSleep(false)`. When logind's
`InhibitDelayMaxUSec` runs out first, logind sleeps anyway and the session is
still locked; the record counts an overrun. A lockdown that disables the lock
screen, or a session off its VT, releases the inhibitor at once.

These new gates require their own actual CI results before acceptance.
Output hotplug and loss of every compositor-adjacent service remain
unproven, as do physical hardware and 24-hour soak. This document does not
claim those parts of issue #62 are complete.

Protocol references: [QEMU guest agent](https://www.qemu.org/docs/master/interop/qemu-ga-ref.html)
and [QEMU wake-up](https://www.qemu.org/docs/master/interop/qemu-qmp-ref.html#command-system-wakeup).

The shared GPU profile `virtio-vga-pcie-pm-preserved-v1` keeps the same
virtio-vga, resolution, CPU, RAM and workloads. It places that GPU behind
one PCIe root port and advertises PM no-soft-reset. All native GNOME
capture and Tuna Desktop/performance boot callers use the same GPU arguments;
manifest/report fields record them. Fresh GNOME comparison evidence must
use this profile; old-profile latency or cadence does not qualify it.
The actual guest PCI capability chain must include PCIe, PM and the
no-soft-reset bit, and each real resume must produce fresh host resource
creation, backing attachment and nonzero scanout commands as well as the
painted lock mask. A configured flag alone never passes the gate. The
shipping AWS Bochs GPU is a separate, unmeasured suspend profile.

The diagnosed fixture runs kernel 7.2.8-arch1-2 and QEMU 10.2.1. In
[Linux 7.2.8 virtio GPU](https://raw.githubusercontent.com/gregkh/linux/v7.2.8/drivers/gpu/drm/virtio/virtgpu_drv.c)
the driver has no freeze/restore callbacks. The
[PCI PM path](https://raw.githubusercontent.com/gregkh/linux/v7.2.8/drivers/virtio/virtio_pci_common.c)
skips reset when the device advertises no-soft-reset; otherwise
[virtio restore](https://raw.githubusercontent.com/gregkh/linux/v7.2.8/drivers/virtio/virtio.c)
resets the device. [QEMU 10.2 virtio PCI](https://raw.githubusercontent.com/qemu/qemu/v10.2.0/hw/virtio/virtio-pci.c)
provides that capability only behind a PCIe port and preserves the device
in D3hot. A [GPU reset](https://raw.githubusercontent.com/qemu/qemu/v10.2.0/hw/display/virtio-gpu.c)
destroys its resources and clears the display. The prior actual trial
37211055978/111464650400 reached real S3, stayed locked with apps intact
and processed guest pageflips, but showed inactive host output and no
fresh resource uploads. It remains a failed qualification. The supported
PM profile requires its own strict actual run; no kernel/package override,
extra VM matrix cell or physical hardware claim is introduced. QEMU 10.2
is required, so the existing performance runner uses ubuntu-26.04.

The performance lane keeps the user-authorized single-S3 contract: the session
is prelocked and a real PAM attempt is pending before sleep. Its fail-closed
wake and stale-success/fresh-authentication checks share that cycle. Varied
mask repaint is retained as an observation; fresh host GPU uploads, client
input/repaint and unchanged application identity remain mandatory. The prior
native lifecycle qualification (#265) separately demonstrated locking from
an unlocked session and two real suspend cycles on the preserved-resource VM
profile; that evidence does not certify a later candidate automatically.

#### Wake-time process inventory classification

Run `41490837174`, job `125453770508`, on candidate `b8feffef` reached real
S3 and fresh host GPU resource creation, backing attachment and nonzero
scanout, but failed `V-SUSPEND`. Original artifact `13170520388` has SHA256
`a30fbd6ab110c3a863fa92ec079bf47c38a11646f9062ea5b989bb17299f6206`.
Its `lifecycle/first-resume.json` is already locked and preserves the ordered
window records and all five original compositor/shell/application process
identities. The failing identity comparison instead sees one additional
`tuna-compositor` process, PID `33679`, start ticks `60527`; that process is
absent from the later repaint inventory. The exact retained PPM body changes
are `800742/942080` pixels on first resume and `800653/942080` on the last
locked frame, both above the unchanged 25% fail-closed threshold.

The probe formerly classified private PAM helpers in one `/proc` enumeration
and then enumerated owned processes separately. A helper born between those
enumerations could therefore be counted as another desktop compositor.
**[INFERENCE]** The transient PID is a fresh wake-time PAM helper: the serial
trace records new password/fingerprint conversations in that interval, but
the failed artifact does not retain that PID's exact helper flag, parent,
process group or executable inode. It cannot prove that classification
retrospectively.

Inventory now reads each scanned compositor's fixed private-helper metadata.
Exclusion requires the exact private argument shape, live helper state,
original user's UID, direct parent, own process group, start-time ordering
and matching executable device/inode. Its parent is reread and must still
match the unique initial desktop identity, including start ticks; neither a
numeric PID match nor a reused parent PID is sufficient. Unrelated or
impostor compositor processes remain identity mismatches. Controlled `/proc`
regressions cover a helper born between enumerations, unrelated parent/group,
older start time, wrong arguments/inode, ambiguous desktop identity and PID
reuse. No application/window comparison, frame threshold, GPU requirement,
suspend deadline or first-resume lock requirement changes.

The failed run remains failed. A fresh owner-authorized native qualification
with the corrected installed lifecycle probe must still demonstrate the
actual first locked wake, exact application geometry/process preservation,
fresh GPU uploads, stale-auth retirement, fresh authentication and client
repaint; fixture regressions alone cannot qualify suspend.

#### Wake-time guest-agent transport (guest Linux 7.3)

PR runs for #1083, #1089, #1090 and #1092 (e.g. 43385429967) passed
`V-SUSPEND-GPU-PM` and reached real S3. The compositor reset scanout and
repainted after wake. The run then failed `V-LIFECYCLE` with a bare socket
`timed out`. The guest's qemu-ga logged `guest-exec ... inventory` at 501.22 s
and no `guest-exec-status` afterwards. Its next request came at 530.45 s, on
the reconnected diagnostics transport. The host therefore never received the
guest-exec acknowledgement. The inventory probe itself did not block. The
green main run 43369611171 polled status 42 ms after the same request.

The difference is the guest kernel, not the PRs. `pacman -Syu` during the
image build moved the guest from `linux 7.2.15` (main) to `7.3.4` (all four
PRs). Upstream commit 952261953cf7 ("virtio_console: fix control queue race
during restore", in
[7.3.4](https://raw.githubusercontent.com/gregkh/linux/v7.3.4/drivers/char/virtio_console.c)
but not
[7.2.15](https://raw.githubusercontent.com/gregkh/linux/v7.2.15/drivers/char/virtio_console.c))
changed `virtcons_restore()` to fill the control receive queue only after
sending `PORT_READY`. [QEMU 10.2](https://gitlab.com/qemu-project/qemu/-/raw/v10.2.0/hw/char/virtio-serial-bus.c)
answers `PORT_READY` with the host-open event before it returns the
control-out buffer. `send_control_msg()` drops that event when the receive
queue is empty. Freeze had set the guest port to host-disconnected, so
after restore every qemu-ga write returns `EAGAIN` until the host chardev
reconnects.

After `system_wakeup`, the lane now calls `GuestAgent.reopen_after_wake`
(2 s per connection, 20 s total). It closes and reopens the QGA chardev,
which makes QEMU send `PORT_OPEN` 0/1 again, until one `guest-sync-delimited`
round trip completes. The step runs no guest-exec and reads no guest state,
so the following inventory is still the first state observation after wake.
The number of connections and the elapsed time go to
`lifecycle/wake-transport.json`. The inventory keeps its 30 s deadline, and
no suspend gate changes. A lost acknowledgement or status reply now names its
QGA step instead of a bare `timed out`. This is controlled-socket evidence only.
A fresh actual run must still qualify `V-SUSPEND` on the 7.3 guest.

### Date & Time restoration and published capability failures

Published-flavor run 41151873652 observed the new Auckland panel time, then
restored timedated to UTC without observing the panel's UTC repaint.
`G-DATETIME-CLOCK-SET` immediately read the Auckland label after the manual
clock jump (39,610 seconds from UTC), so that assertion did not have a
restored-panel baseline.

The timezone round trip now retains `panel_revert` dumps and
`panel_revert_verified` in `lifecycle/datetime-evidence.json`, waiting within
the existing ten-second repaint deadline. The clock timezone gate requires
both outbound and return repaint. A failed restoration or dump remains
visible in the probe error, fails the clock timezone gate, and prevents the
manual-time probe from changing the clock against an unverified baseline.
The polkit timezone probe runs after the manual-clock probe, so its own
timezone round trip cannot invalidate that baseline.

Both published panel-change assertions stay strict. A released image that
cannot perform them is reported as unqualified/unsupported with its actual
failure evidence, never converted to a pass or credited with another
lane's result. No additional wait extends the capability deadline.

## Locked password speech

Run [41151873648, job 124396764753](https://github.com/tuna-os/tuna-desktop/actions/runs/41151873648/job/124396764753)
passed eight speech gates, then failed `G-ORCA-SPEECH-LOCK`: the retained
[`orca-speech` artifact 13025680053](https://github.com/tuna-os/tuna-desktop/actions/runs/41151873648/artifacts/13025680053)
contains `Lock Screen`, `Password`, `password text.` followed by an empty
`lock-type` speech section. Its sanitized state records an active password
conversation, `locked: true`, and an owned, watched KeyboardMonitor. The
AT-SPI registry was already active. This is not evidence of bus startup
failure.

The missing route was committed masked input to speech, not raw-key
delivery. The compositor then suppressed raw KeyboardMonitor events while
locked; it no longer does (see below).
In the installed [Orca 50.3 insertion classifier](https://raw.githubusercontent.com/GNOME/orca/50.3/src/orca/ax_utilities_event.py),
`_get_insertion_text_key_reason` relies on a last printable key/space to
classify password insertion as typing echo. Without that cue,
`_get_insertion_fallback_reason` can return `UNKNOWN` or an unpresentable
auto-insertion reason; [the default insertion handler](https://raw.githubusercontent.com/GNOME/orca/50.3/src/orca/scripts/default.py)
does not speak those insertions. The retained artifact does not contain
Orca's internal event-reason trace, so no particular fallback branch is
claimed as an observed runtime result.

The native Orca consumer needs a package-level correction for the supported
50.3 and 51 versions so committed masked password insertions are presented
without raw locked-session keys. That correction and its package/runtime
qualification are separate and pending; this change does not claim the
masked-input speech failure is fixed. No shell-generated mask announcement
or replacement for Orca's native text-event handling is included.

`scripts/tuna-orca-speech-proof --artifacts orca-speech-artifacts` remains
the end-to-end native nested proof: after a D-Bus lock and after an
ordinary Super+L it physically types into the lock prompt, requires exactly
one spoken mask per typed character, rejects plaintext speech, requires the
owned trusted reader's KeyboardMonitor to receive the lock-screen keys as
Mutter 51.1 does
([screen reader keys while locked](https://github.com/tuna-os/tuna-desktop/blob/main/docs/accessibility-shell.md#screen-reader-keys-while-locked-936)),
then unlocks through PAM. No injected Orca customization or relaxation of
the bullet assertion is used. The failed run is not retroactively qualified.

The native proof isolates `XDG_STATE_HOME` and `XDG_CACHE_HOME` under its
artifact root as well as HOME/config/data. A local native attempt stopped
before the speech gates because inherited state selected
`~/.local/state/roost-shell` for upgrade, where the ownership/ancestor
guard refused migration. `user_upgrade::pairs_from` and the shell's
`xdg::state_home_from` prefer an absolute `XDG_STATE_HOME` over HOME;
changing HOME alone does not isolate that route. The proof now exports
private state/cache roots explicitly. It does not touch the real user
paths or bypass the migration guard.

The first local attempt used host Orca 46.1, which could not satisfy the
KeyboardMonitor contract. A later isolated Ubuntu 26.04 run with native
Orca `50.3-0ubuntu0.1+tuna1` passed all 11 speech assertions in 141 seconds.
It typed nine characters, observed nine spoken bullets without plaintext,
unlocked through PAM, and confirmed that the toggle stopped Orca.
[The retained report](https://github.com/tuna-os/tuna-desktop/pull/931#issuecomment-6545553530)
records source `69e9a04fd20aa2bc38427c79aec043cb3174da3b` and the actual
package and binary identities. This proves the nested speech path, not
the separate GDM fresh-account journey or ISO installation.
