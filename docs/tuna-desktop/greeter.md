---
sidebar_position: 20
title: "greeter"
---

Owner decision 2026-11-16 ([ADR 0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md)
item 6, epic [#1164](https://github.com/tuna-os/tuna-desktop/issues/1164)):
v1 replaces GDM's GNOME Shell greeter (`gnome-shell --mode=gdm`) with a Tuna
greeter and keeps GDM's daemon. GDM keeps PAM, seats, VT handoff, user
switching and session start. The greeter is `tuna-compositor --greeter`
running `tuna-greeter`, a GTK4/libadwaita client of GDM's greeter D-Bus API.
Parity bar: GDM 51's login screen. Rollout: replace
`org.gnome.Shell@gdm.service` on every TunaOS variant.

Sources read for this page (tags, not branches): GDM
[51.1.1](https://gitlab.gnome.org/GNOME/gdm/-/tree/51.1.1), gnome-shell
[51.1](https://gitlab.gnome.org/GNOME/gnome-shell/-/tree/51.1), gnome-session
main, and the installed files of `ghcr.io/tuna-os/marlin` (image
`44bcc7837e69`, built 2026-11-14: `gdm 51.1.1-1`, `gnome-shell 1:51.1-1`).

## How GDM 51 starts its greeter

1. `GdmLocalDisplayFactory` makes a display; `GdmLaunchEnvironment`
   (`daemon/gdm-launch-environment.c`) allocates a *dynamic* user
   (`gdm-greeter`, "GDM Greeter", from `GdmDynamicUserStore`; GDM 49 moved
   off the static `gdm` user) and opens a `GdmSession` for it with the
   daemon-only PAM service `gdm-launch-environment`.
2. It selects the session named `gnome-greeter`
   (`GDM_GREETER_SESSION`, hard-coded) of type `wayland`. GDM looks for
   `gnome-greeter.desktop` in `/usr/share/gdm/greeter/wayland-sessions/`
   first (`get_system_session_dirs`). Its `Exec=gnome-session --session
   gnome-login`.
3. The environment (`build_launch_environment`) is written to the greeter
   user's `~/.config/environment.d/gdm.conf`: `USER`/`LOGNAME`/`HOME`
   (`/run/gdm/home/…`), `SHELL=/sbin/nologin`, `GDM_VERSION`, `GDM_SEAT_ID`,
   `XDG_CONFIG_HOME`/`XDG_STATE_HOME` under `/var/lib/gdm/<seat>/` (kept
   across boots so a11y settings persist), `DCONF_PROFILE=gdm`,
   `GVFS_DISABLE_FUSE=1`, `GIO_USE_VFS=local`, `RUNNING_UNDER_GDM=true`,
   `XDG_DATA_DIRS=/usr/share/gdm/greeter:<system dirs>` and
   `GDM_SUPPORTED_SESSION_TYPES` (`wayland:x11`, colon separated).
4. gnome-session's leader starts `gnome-session@gnome-login.target`
   (`gnome-login.session`: `Kiosk=true`). GDM installs the drop-in
   `/usr/lib/systemd/user/gnome-session@gnome-login.target.d/gnome-login.session.conf`:
   `Requires=gnome-session-basic-services.target` and
   `Requires=org.gnome.Shell@gdm.service`. The basic services are the
   settings daemon plugins A11ySettings, Keyboard, MediaKeys, Power, Rfkill,
   Sharing, Smartcard and UsbProtection.
5. `org.gnome.Shell@.service` runs `gnome-shell --mode=%i` as `Type=notify`,
   `Before=gnome-session-initialized.target`, `OnFailure=` the session
   shutdown. GNOME Shell signals `READY=1`, calls GDM's
   `Manager.RegisterSession` at startup and `RegisterDisplay` once the login
   screen is up (`js/ui/main.js`, `js/misc/loginManager.js`).

### Integration point (chosen)

Replace the vendor drop-in by name: ship
`/etc/systemd/user/gnome-session@gnome-login.target.d/gnome-login.session.conf`
with `Requires=gnome-session-basic-services.target` and
`Requires=tuna-greeter.service`. systemd lets a drop-in in `/etc` override the
one of the same name in `/usr/lib` (systemd.unit(5), "Drop-in files … with
the same name"), and dependency lists cannot be emptied by another drop-in,
so this is the only override that removes the shell. It keeps everything
else of GDM's design: the `gnome-greeter` session, gnome-session's leader
and `gnome-login` target, the settings daemon plugins, and GDM's own
restart of a failed greeter. TunaOS already themes the greeter through
`/etc/systemd/user/org.gnome.Shell@gdm.service.d/` (the Marlin image has
`tunaos-gdm-theme.conf` there), so `/etc` is the image's existing seam.

Rejected:

- Overriding `org.gnome.Shell@gdm.service`'s `ExecStart=`: the unit keeps
  GNOME Shell's name, `AssertEnvironment` and `ExecStopPost`, and confuses
  every reader.
- Masking `org.gnome.Shell@gdm.service`: a masked `Requires=` fails the
  target, and the greeter never starts.
- A different `gnome-greeter.desktop`: the file belongs to the `gdm`
  package (package conflicts) and the session name is compiled into GDM.

`tuna-greeter.service` (packaging slice, not in this change):

```ini
[Unit]
Description=Tuna Desktop login screen
OnFailure=gnome-session-shutdown.target
OnFailureJobMode=replace-irreversibly
CollectMode=inactive-or-failed
RefuseManualStart=on
RefuseManualStop=on
After=gnome-session-manager.target
Requisite=gnome-session-initialized.target
PartOf=gnome-session-initialized.target
Before=gnome-session-initialized.target

[Service]
Slice=session.slice
Type=notify
ExecStart=/usr/bin/tuna-compositor --greeter
ExecStopPost=-systemctl --user unset-environment WAYLAND_DISPLAY DISPLAY
Restart=no
TimeoutStopSec=5
```

`Type=notify`: in greeter mode the compositor sends `READY=1` to
`NOTIFY_SOCKET` once, when the greeter's layer first maps (`G-GREETER-READY`),
so the settings daemon plugins start after the login screen is up.

Other greeters: no other greeter in the wild uses GDM's greeter API (LightDM
and greetd greeters speak their own daemons); GDM's only other client of
the same session-file seam is `gnome-initial-setup`
(`gnome-initial-setup.desktop`, its own `gnome-session` session).

## The greeter D-Bus API

### Opening the channel

`org.gnome.DisplayManager` on the **system** bus,
`/org/gnome/DisplayManager/Manager`, interface
`org.gnome.DisplayManager.Manager`:

| Method | |
|---|---|
| `OpenSession() → s address` | Only from a process of the display's greeter session and only from its `allowed_user` uid; refused once a user session runs on the display ("Can only be called before user is logged in"). |
| `OpenReauthenticationChannel(s user) → s address` | The unlock dialog's channel (not used by the greeter). |
| `RegisterSession()`, `RegisterDisplay()` | The greeter is up; GDM ends plymouth. |

The address is a `GDBusServer` per `GdmSession`
(`gdm_dbus_setup_private_server`): `unix:dir=/run/gdm/dbus` (mode 0711), the
socket made 0666, EXTERNAL authentication, and `allow_user_function`
accepts only the session's `allowed_user`. There is no
`GDM_GREETER_DBUS_ADDRESS` variable: libgdm always asks `OpenSession`. The
client connects peer to peer (`G_DBUS_CONNECTION_FLAGS_AUTHENTICATION_CLIENT`,
no message bus, no bus names) and uses the object
`/org/gnome/DisplayManager/Session`.

### `org.gnome.DisplayManager.UserVerifier`

| Member | |
|---|---|
| `EnableExtensions(as)` | Export `UserVerifier.ChoiceList` (`SelectChoice(s service, s choice)`, signal `ChoiceQuery(s service, s prompt, a{ss} list)`) and/or `UserVerifier.CustomJSON` (`Reply`, `ReportError`, signal `Request(s service, s protocol, u version, s json)`, used for web login and passkeys). Unknown names are ignored. |
| `BeginVerification(s service)` / `BeginVerificationForUser(s service, s user)` | Start a PAM conversation. GDM 51 refuses services with `/`, not starting with `gdm-`, or daemon-only (`gdm-autologin`, `gdm-launch-environment`). The reply waits until the worker started. |
| `AnswerQuery(s service, s answer)` | Answer the outstanding `InfoQuery`/`SecretInfoQuery`. |
| `Cancel()` | GDM's manager then resets the session: `Reset` is emitted, every conversation stops (`ConversationStopped` each) and the selected session and user are forgotten. |
| signals `ConversationStarted(s)`, `ConversationStopped(s)`, `ReauthenticationStarted(i)` | |
| signals `Info(s service, s text)`, `Problem(s service, s text)` | PAM_TEXT_INFO / PAM_ERROR_MSG and GDM's own failure text. |
| signals `InfoQuery(s service, s query)`, `SecretInfoQuery(s service, s query)` | PAM_PROMPT_ECHO_ON / OFF. |
| signal `Reset()` | |
| signal `ServiceUnavailable(s service, s message)` | Service missing or `PAM_MAXTRIES`; followed by `VerificationFailed`. |
| signals `VerificationFailed(s)`, `VerificationComplete(s)` | Failure is `Problem` (or `ServiceUnavailable`) + `VerificationFailed` + `ConversationStopped`. In login mode `VerificationComplete` comes after the PAM session opened. |

Services gnome-shell 51 uses: `gdm-password`, `gdm-fingerprint`,
`gdm-smartcard` (`authServicesLegacy.js`), or `gdm-switchable-auth` for SSSD
switchable auth (`authServicesSSSDSwitchable.js`, `enable-switchable-authentication`).
GDM 51.0: fingerprint no longer logs in, it only re-authenticates.

### `org.gnome.DisplayManager.Greeter`

| Member | |
|---|---|
| `SelectSession(s id)` | The session desktop file id; GDM 51.beta rejects path traversal. Refused once the session runs. |
| `SelectUser(s)`, `BeginAutoLogin(s)` (only the configured autologin user since 51.beta), `GetTimedLoginDetails() → (b, s, i)`, `StopConflictingSession()` | |
| `StartSessionWhenReady(s service, b start)` | After `SessionOpened`: start the opened session. |
| signals `SelectedUserChanged(s)`, `DefaultLanguageNameChanged(s)`, `DefaultSessionNameChanged(s)` (the user's saved session, else GDM's fallback; TunaOS sets `FallbackSession=tuna`), `TimedLoginRequested(s, i)`, `SessionOpened(s service, s session_id)`, `Reauthenticated(s)` | |

GDM 51 has no `RemoteGreeter` or `Chooser` interface any more (XDMCP is
gone); remote logins use `RemoteDisplayFactory` on the manager.

### How gnome-shell 51 drives it

`loginDialog.js` makes a `Gdm.Client`, enables both extensions, lists users
from `AccountsService.UserManager` (loaded, not system, not locked;
`user-added`/`-removed`/`-changed` keep it current), and on a click begins
`AuthPrompt.begin({userName})`. `authServices.js` starts every enabled
service with `BeginVerificationForUser`; `authPrompt.js` turns queries into
the entry (hidden for secret), `Info`/`Problem` into the queued message
(48 ms per character, at least 2 s, × `GDM_MESSAGE_TIME_MULTIPLIER`), and on
`VerificationFailed` counts failures against `allowed-failures` (default 3):
below it the prompt soft-resets for the same user, at it the dialog returns
to the user list. "Not listed?" asks "Username" itself and then begins for
that name. The session menu ("Login Options" → "Session Type") lists
`Gdm.get_session_ids()` and calls `SelectSession`; `DefaultSessionNameChanged`
moves its active item. `SessionOpened` → (conflicting-session check through
logind) → fade out → `StartSessionWhenReady(service, true)`.

## What GDM 51's login screen shows

- Background `#222226`, text `#fafafb` (`#lockDialogGroup`,
  `_login-lock.scss`), TunaOS tints it with the variant accent.
- Panel (`gdm` session mode): the clock in the middle; at the right the
  dwell-click, keyboard (input source) and quick-settings indicators
  (power, volume, network, a11y toggles); no activities, no overview.
- Centre: the user list (25em, 64px avatars, logged-in users ringed) and
  "Not listed?"; or the prompt (avatar 160px, name 20pt, Back, entry with
  the next arrow, caps-lock warning, message).
- Banner under the panel (`banner-message-enable`, `-text`, `-source`,
  `-path`), logo at the bottom (`logo`), bottom-right buttons: Login
  Options (auth mechanisms and session type) and the accessibility menu.
- Policy keys (`org.gnome.login-screen`): `disable-user-list`,
  `disable-restart-buttons`, `allowed-failures`, `enable-password-/
  fingerprint-/smartcard-/switchable-authentication`, banner and logo keys.
- Timed login, conflicting-session dialog, realmd login hint, web login.

## Architecture (this slice)

- `crates/compositor`: `--greeter` (`NestedSession::greeter`). The
  supervised client is `tuna-greeter` (`TUNA_GREETER_BIN`, sibling, `PATH`)
  with the shell's restart budget; when the budget runs out the compositor
  exits non-zero so GDM's own greeter recovery restarts the login screen.
  No lock (idle, suspend and logind `Lock` are ignored: GDM's greeter dconf
  profile sets `org.gnome.desktop.lockdown disable-lock-screen`, so GNOME
  Shell's shield never locks the login screen), no overview or hot corner
  (`gdm` mode's `hasOverview`), no shell swipes, no startup
  overview, no user-settings upgrade. On DRM it imports `WAYLAND_DISPLAY` to
  systemd and D-Bus activation but starts no `tuna-session.target`, holds
  no leader FIFO and does not register with GDM: gnome-session leads, and
  the greeter registers itself. Outputs, input and the screen reader path
  are those of a user session. `READY=1` goes to `NOTIFY_SOCKET` once the
  greeter first maps.
- `crates/auth-prompt` (`tuna-auth-prompt`): the lock screen's GNOME
  AuthPrompt state machine and `PromptEntry` widget, moved out of
  `tuna-shell-gtk` so both screens share them. `Host::can_retry`
  (`_canRetry`) and `Effect::GiveUp` add the login screen's
  `allowed-failures`; the lock screen keeps the default (always retry).
- `crates/greeter` (`tuna-greeter`): `gdm.rs` (channel, signal parsing,
  calls; the session object's signals are subscribed through GDBus
  directly, because gio-rs 0.22's subscription aborts on the sender-less
  signals of a peer-to-peer channel), `conversation.rs` (GDM's UserVerifier
  as the machine's `Host`), `accounts.rs` (AccountsService list),
  `sessions.rs` (libgdm's session enumeration), `main.rs` (layer-shell
  window, pages, Login Options).

## Proof

`scripts/tuna-greeter-proof` (gtk-shell CI job) runs the real
`tuna-compositor --greeter` nested on Xvfb with the real `tuna-greeter`;
GDM's daemon and AccountsService are `scripts/lib/tuna-gdm-mock.py` on a
private system bus, serving the API above with GDM 51.1.1's signal order and
failure text. Users are chosen and passwords typed with real X11 keys, and
the result is read back through AT-SPI, the mock's call log and the
compositor's state; `A-1-user-list.png`, `C-1-prompt.png` and
`P-1-policy.png` are the review shots against GNOME 51's login dialog.
Gates: `G-GREETER-READY`, `-USER-LIST`, `-NO-SHELL`, `-NOT-LISTED`,
`-GIVE-UP`, `-SESSION`, `-WRONG-PASSWORD`, `-PASSWORD`, `-START`,
`-SUPERVISION`, `-HYGIENE`. A second login screen on the same mock then
runs with GDM 51.1.1's `org.gnome.login-screen` schema
(`scripts/lib/org.gnome.login-screen.gschema.xml`, keyfile backend) and
`TUNA_SESSION_KIND=hardware`, and the mock's control interface
(`org.tuna.Proof.GdmMock`) adds and deletes users and closes GDM's
channels: `G-GREETER-POLICY`, `-CAPS-LOCK`, `-POWER-MENU`, `-LIVE-USERS`,
`-RECONNECT`. Nested only: no real GDM, PAM, gnome-session or DRM.

## Security model

- The greeter runs as GDM's dynamic greeter user and holds no secret beyond
  relaying an answer: the answer goes straight from the entry to
  `AnswerQuery` on GDM's private channel, the entry is cleared, `Call`'s
  `Debug` redacts it and no trace prints it. PAM runs in GDM's session
  worker as root; the greeter never sees a PAM handle or a password hash.
- Only the greeter session's uid may `OpenSession` or connect to the
  channel (GDM's checks). Only GDM's allowed `gdm-*` services start; the
  greeter only asks for `gdm-password` in this slice.
- `SelectSession` ids come from the session files GDM itself would accept;
  GDM validates them again (51.beta).
- The compositor admits layer-shell only to its supervised child, so no
  other client can draw over the login screen.

## Lifecycle

- Start: GDM → `gnome-session --session gnome-login` →
  `gnome-session@gnome-login.target` → `tuna-greeter.service` →
  `tuna-compositor --greeter` → supervised `tuna-greeter` → `OpenSession`,
  user list, `RegisterSession`/`RegisterDisplay`.
- Greeter crash: the compositor's overlay covers the screen and restarts
  it with backoff; the new process asks GDM for the channel again. Budget
  spent: the compositor exits non-zero, the unit fails, gnome-session shuts
  down, GDM sees the greeter session end and restarts the display (GDM's
  own limits apply; text consoles remain).
- GDM channel closed: the greeter asks for a new channel at once, then
  every second until it gets one; the begin owed a result is denied and the
  prompt begins again on the new channel (`G-GREETER-RECONNECT`).
- Login: `VerificationComplete` → `SessionOpened` →
  `StartSessionWhenReady`; GDM starts the user session and stops the greeter
  session (SIGTERM to its process group).

## Parity checklist against GDM 51

| Area | GDM 51 | Tuna greeter now | Gate |
|---|---|---|---|
| User list from AccountsService, filtered like `UserList.addUser`, with avatars | yes | yes (`IconFile` avatars, live add/remove) | G-GREETER-USER-LIST, G-GREETER-LIVE-USERS; cargo: `a_readable_avatar_file_is_the_users_image`, `only_added_and_deleted_users_change_the_list` |
| Password through `gdm-password`, GNOME's prompt and messages | yes | yes (shared AuthPrompt machine) | G-GREETER-PASSWORD; cargo: `conversation::tests::*`, `gdm::tests::*` |
| Wrong password: GDM's problem shown, retry, `allowed-failures` back to the list | yes | yes | G-GREETER-WRONG-PASSWORD, G-GREETER-GIVE-UP, G-GREETER-POLICY; cargo: `a_host_done_trying_gives_up_once_the_problem_is_read`, `failure_then_stop_is_one_denied_result_and_counts` |
| "Not listed?" username entry | yes | yes | G-GREETER-NOT-LISTED; cargo: `a_typed_username_is_trimmed_and_matched_to_the_list` |
| Caps-lock warning under a secret question ("Caps lock is on") | yes | yes | G-GREETER-CAPS-LOCK; cargo: `the_caps_lock_warning_belongs_to_secret_questions` |
| Session type in Login Options, `DefaultSessionNameChanged` | yes | yes (re-selected after GDM resets) | G-GREETER-SESSION; cargo: `sessions::tests::*` |
| `StartSessionWhenReady` after `SessionOpened` | yes | yes (at once: GNOME's `AuthPrompt.finish` waits for queued messages first) | G-GREETER-START; cargo: `only_session_opened_starts_a_session_after_verification` |
| GDM's channel closes: reconnect, owed results denied | yes | yes | G-GREETER-RECONNECT; cargo: `wire_failures_and_disconnects_deny_what_is_owed` |
| No overview, lock or panel layers; greeter supervised | yes (`gdm` mode) | yes | G-GREETER-NO-SHELL, G-GREETER-SUPERVISION; cargo: `the_login_screen_never_locks_and_has_no_overview`, `ready_is_sent_once_when_the_greeter_first_maps`, `greeter_flag_makes_a_login_screen_session`, `help_documents_greeter_mode`, `a_spent_greeter_budget_fails_the_unit` |
| Register session/display with GDM | yes | yes (the greeter; the compositor only publishes the display) | G-GREETER-READY (mock GDM); cargo: `the_greeter_publishes_only_its_display`; V-GDM-LOGIN once packaged |
| Banner, logo, `disable-user-list`, `disable-restart-buttons` | yes | yes, read at start (banner text only, not `banner-message-source=file`) | G-GREETER-POLICY, G-GREETER-POWER-MENU; cargo: `login_screen_keys_make_the_policy`, `banner_needs_enable_and_text_and_failures_allow_one_try` |
| Wiggle, fades | yes | no | — |
| Fingerprint (re-auth only in 51), smartcard, switchable auth, ChoiceList, CustomJSON web login | yes | no | #1164 |
| Accessibility menu, Orca, OSK, input sources before login | yes | AT-SPI tree only | #1164 |
| Quick settings (power, volume, network) | yes | power actions (Suspend, Restart…, Power Off… straight to logind) on hardware only | G-GREETER-POWER-MENU; cargo: `power_actions_need_hardware_and_restart_buttons` |
| Timed/auto login, conflicting session dialog, realmd hint | yes | no | — |
| Translations | yes | no | — |
| Greeter on every variant, `org.gnome.Shell@gdm.service` gone | — | no packaging yet | V-GREETER-LIST, V-GDM-LOGIN, V-GDM-FALLBACK |
