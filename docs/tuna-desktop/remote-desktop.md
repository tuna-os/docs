---
sidebar_position: 40
title: "remote desktop"
---

Tuna Desktop exposes GNOME's Mutter RemoteDesktop interface to the installed,
root-owned portal backend and to the installed gnome-remote-desktop daemon.
Creating a session requires the same authenticated portal/shell authority as
capture, or the grd identity below. Every subsequent operation requires its
original unique D-Bus owner. Creation, start, EIS connection, clipboard and
input are denied while locked. Sessions are single-use, with a maximum of 64
remote grants.

The GNOME portal owns the user consent picker. A linked ScreenCast session uses
`remote-desktop-session-id`, must have the same caller, and shares the remote
grant's permanent revocation flag; a grant takes one linked session
(`meta_remote_desktop_session_register_screen_cast`). An unrelated caller
cannot attach a stream or inject input.

ScreenCast follows mutter 51 (`meta-screen-cast-session.c`,
`meta-screen-cast-stream.c`). Record* is accepted before and after Start.
Session Start makes the session active and starts every stream recorded so
far; a linked session is started only by RemoteDesktop.Start, and its own
Start and Stop fail with mutter's "Must be started/stopped from remote desktop
session". A stream recorded on an active session starts with its own
`Stream.Start` ("session not started" before, "Stream already started" twice).
`Stream.Stop` ("Stream not started" before Start) ends that stream and removes
its object; on a plain session it closes the session (`on_stream_closed`),
while a linked session lives on until its RemoteDesktop session ends.
PipeWireStreamAdded goes to the session's owner only, as mutter's
`on_stream_ready` sends it. Every Start, Stop and Record call checks the
owner, lock and revocation.

Advertised devices are keyboard and pointer (bitmask 3). Legacy evdev keycodes,
keysyms, relative/stream-relative absolute motion, buttons and scroll are
supported. NotifyKeyboardKeysym follows mutter's `notify_keyval`: the first key
of the effective layout typing the keysym, with Shift or AltGr pressed before
and released after it for its level; a keysym the layout lacks types nothing.
ConnectToEIS supplies one Unix descriptor per session and, as in mutter, may be
called before Start (gnome-remote-desktop does); input sent before Start is
dropped. Its EIS sender
seat exposes only requested keyboard/pointer capabilities, a sealed current XKB
keymap and logical output regions. The per-grant queue is limited to 256 events;
legacy calls over that bound are rejected. EIS overflow or disconnect permanently
revokes that grant. Runtime delivery
checks the flag again, balances held key/button pairs and releases them on stop
or lock. Relative pointer motion stays inside an output.

The registry checks caller/backend loss and lock every 100 ms; the EIS worker
checks revocation on its 20 ms dispatch loop. Runtime input also checks lock and
revocation before delivery. These intervals are scheduling bounds, not real-time
guarantees. Capture nodes share the revocation flag and stop with their grant.

Touch is not implemented or advertised (NotifyTouch* return NotSupported).
EIS output regions and keymap are snapshots at connection time;
clients need a new consent session after output/keymap changes. Rebinding is
limited to 32 device generations per connection to bound unacknowledged object
and outgoing keymap-FD churn. The vendored reis 0.7.1 transport additionally fails
when undecoded incoming or unread outgoing bytes exceed 2 MiB or FD
storage exceeds 64; FD-clone failure closes the connection; its upstream
1 MiB message limit remains. See third-party/reis/ROOST-PATCH.md and regression tests. EIS receiver contexts are
rejected. No physical input device, GPU or VT acceptance follows from nested
software-rendered proof.

## gnome-remote-desktop (Settings > System > Remote Desktop)

gnome-remote-desktop 51 drives Mutter directly, with no portal: `grd-session.c`
calls RemoteDesktop.CreateSession, ConnectToEIS (empty options), then
ScreenCast.CreateSession with `remote-desktop-session-id` and
`disable-animations`, RecordMonitor with connector `""` (the primary monitor,
mirror mode) or RecordVirtual (extend mode and remote login), Start, and
Stream.Start. It needs each stream's `mapping-id` parameter (`grd-stream.c`)
and the EIS region with the same id for absolute pointer motion. Its RDP
clipboard uses EnableClipboard, DisableClipboard, SetSelection,
SelectionWrite, SelectionWriteDone and SelectionRead with the
SelectionOwnerChanged (`mime-types` as `(as)`, `session-is-owner`) and
SelectionTransfer signals. Keysyms are resolved by grd itself over EIS; it
never calls NotifyKeyboardKeysym.

Admission: RemoteDesktop.CreateSession, and only a ScreenCast session linked
to that caller's own grant, also accept a same-user caller whose
`/proc/<pid>/exe` is the root-owned, non-writable
`/usr/{libexec,lib}/gnome-remote-desktop-daemon`, that owns one of grd's
bus names, and whose sharing is enabled in GSettings (#1162 F1): the
user-mode `org.gnome.RemoteDesktop.User` daemon needs
`org.gnome.desktop.remote-desktop.rdp` or `.vnc` `enable` (what Settings >
System > Remote Desktop > Desktop Sharing writes; grd 51
`grd-settings-user.c`), the `.Headless` daemon `rdp.headless` or
`vnc.headless` `enable` (`grd-settings-headless.c`). A missing schema counts
as off. The remote-login `org.gnome.RemoteDesktop.Handover` daemon is never
admitted: its sessions always extend onto a virtual monitor
(`grd-settings-handover.c`, RecordVirtual), which Tuna Desktop does not
serve, so in a Tuna Desktop session that name can only be a pretender.
Mutter 51 gates none of this (its RemoteDesktop admits any session-bus
caller and gnome-shell 51 adds no check); the settings gate is deliberate
Tuna Desktop hardening. It does not stop a same-user process that turns
sharing on itself (ADR-level same-UID scope), but the genuine binary
started under LD_PRELOAD while the user has sharing off is refused, and
turning sharing off revokes a running grd grant within the 100 ms scan.
A process that merely takes grd's names, or a user-owned copy of the
binary, is refused; grd gets no Screenshot, Introspect or unlinked
ScreenCast access. Settings' configured credentials are the consent, as in
GNOME. The grant is revoked when that identity, name or setting is lost, on
Stop, on EIS disconnect, on lock and from the panel's Stop Screen Sharing
button; grd's own Stop after its EIS client left succeeds and does nothing.

Indicator: a started RemoteDesktop session and its linked ScreenCast
session are remote access grants the compositor publishes to the shell
(wire 0.54 `RemoteAccess`), which shows GNOME 51's orange "Stop Screen
Sharing" panel button while any is active; pressing it revokes them for
good (see [Capture admission](https://github.com/tuna-os/tuna-desktop/blob/main/docs/capture-security.md)).

Evidence: the remote-security job (`tests/remote-desktop-reference/run.sh`)
runs grd 51's own Desktop Sharing daemon on a private settings backend that
has RDP and remote control on, with its credentials in gnome-keyring, and
connects a real FreeRDP client. While the user's
`org.gnome.desktop.remote-desktop.rdp` `enable` (dconf) is off, grd's
CreateSession is refused and the client is dropped; once it is on, grd
streams to the client and the panel shows Stop Screen Sharing; switching it
off drops the client and hides the button (R-GRD-ENABLE,
R-REMOTE-INDICATOR). The in-binary probe
(`scripts/lib/tuna-service-identity-probe.c`, LD_PRELOAD into the genuine
grd executable) shows the Handover name refused with every switch on, the
Headless name following only `rdp.headless` and the User name `rdp` or
`vnc`.

Lock matches GNOME for the shared desktop. gnome-shell 51 `main.js`
`_sessionUpdated` calls `inhibit_remote_access()` whenever the session mode
disallows screencast and the backend is not headless; the `unlock-dialog`
mode the screen shield pushes (`screenShield.js` `activate`) inherits
`allowScreencast: false` from `restrictive` (`sessionMode.js`). mutter's
`meta_dbus_session_manager_inhibit` then closes every RemoteDesktop and
ScreenCast session, and `CreateSession` fails with "Session creation
inhibited" until unlock. So a GNOME RDP client is disconnected on lock and
cannot reconnect or unlock remotely; only headless remote-login sessions keep
running behind the lock. Tuna Desktop ends every grant on lock and refuses
CreateSession while locked ("session locked").

Linked monitor streams carry `mapping-id` `tuna-monitor-<connector>`, and the
EIS pointer regions carry the same ids (ei_device v2). Each keymap send is a
fresh read-only description at offset 0, because grd `read()`s it.

Clipboard follows `meta-clipboard-session.c`: a session's SetSelection becomes
the seat's compositor selection; a local paste emits SelectionTransfer and
SelectionWrite returns a pipe; SelectionRead returns a pipe fed by the local
owner. Errors keep mutter's texts ("Clipboard not enabled", "Already
enabled", "Tried to read own selection", "Tried to read in parallel",
unknown serials). Data never crosses the compositor loop: each transfer is
pumped on its own thread, at most 256 MiB, ended after 15 s without progress
(mutter's transfer-request timeout), at most 16 unanswered requests and 8
writes per session, and cut off on Stop, owner loss, lock or Disable. Mime
lists are limited to 64 names of 255 bytes. These bounds are Tuna Desktop's;
mutter has none. Signals go only to the session's owner.

Corral VM 2026-10-30 (candidate sideloaded on
marlin@sha256:ae6363c1…, grd 51.0, a real FreeRDP 3 client; evidence in
`docs/marlin/2026-10-30-rdp/`): the client shows the desktop frame; with
Remote Control off, its clicks and keys reach nothing (a remote click on the
Remote Control switch leaves it off), including after switching control off
during a session; with it on, pointer and keyboard drive Settings; clipboard
text crosses both ways; disconnect and reconnect work; lock disconnects the
client and refuses a new connection until unlock; turning Desktop Sharing off
in Settings and restarting grd end the session, and a new connection works
afterwards.

Not covered: RecordVirtual (so grd's extend mode and remote login through
GDM's headless sessions), cursor metadata (`cursor-mode` is ignored; frames
carry no pointer, grd sends no pointer updates and the RDP client keeps its
local pointer, so pointer shapes are not mirrored), `disable-animations`,
touch, smartcard and Kerberos redirection, and physical hardware. The
published Marlin image does not ship gnome-remote-desktop, so Settings shows
no Remote Desktop row there.

`scripts/tuna-remote-security --candidate DIR --out DIR` tests a packaged
compositor and GTK shell with the installed Fedora GNOME 51 portal backend,
a real Wayland GTK input client and the independently installed libei client.
It requires actual Cancel/Allow, a linked PipeWire frame, foreign input denial,
legacy and EIS keyboard/button delivery, node removal after Close/client/backend
loss/EIS disconnect/lock, and new-session lock denial. Candidate commit, runtime
versions, consent screenshots, input logs and frame evidence accompany the run.
A failed run names the failing command or the wait that expired and prints the
end of each component log; the complete logs stay in the `remote-security`
artifact, and the exit status is the proof's.

The libei sender keeps its EIS descriptor open until the parent observes fresh
keyboard and button delivery in that actual GTK client, then acknowledges the
sender over stdin and closes it. A fixed post-send sleep is not a delivery
barrier: disconnect deliberately revokes the grant, including queued input,
so closing first can correctly discard frames on a busy compositor. The
five-second delivery and fifteen-second sender bounds are unchanged; the
following stream-withdrawal check still requires genuine EIS disconnection.
The real-libeis `tests/remote-desktop-reference/eis-lifetime.c` regression delays
consumption beyond the former sleep, requires both evdev key/button pairs and
the absolute pointer frame while connected, acknowledges them, then requires
the actual disconnect. It runs before the nested portal journey.
After the acknowledgement the probe reaps the sender (exit status 0) before it
dispatches libeis again. libeis 1.6 answers each interface release, and a reply
that meets the sender's closed socket makes it drop the client without a
disconnect event; a dispatch during the sender's teardown could therefore read
the releases and never see the disconnect request behind them (#1064). The
unchanged two-second bound covers both the sender's exit and the event.
The lifetime probe reserves its own `/dev/null` stdin before allocating the
EIS and acknowledgement descriptors, including when the container inherited
a closed stdin. Once its sender receipt is read, that pipe is removed from
the poll set so an unconditional `POLLHUP` cannot turn the EIS dispatch wait
into a busy loop. Timeout diagnostics retain the actual event/acknowledgement
counts without changing the required five frames or either deadline.

The exact `1f441bb` Remote head passed all sixteen checks in [CI 37214121497](https://github.com/tuna-os/tuna-desktop/actions/runs/37214121497). The combined Screenshot/Remote candidate `3249f362` passed the same complete GNOME 51 journey in [CI 37214394538](https://github.com/tuna-os/tuna-desktop/actions/runs/37214394538), including independent installed libei 1.6 keyboard and pointer delivery. See `remote-desktop-evidence.json` for candidate, runtime versions and retained artifacts. The proof requires fresh key/button events after each delivery baseline, then no new client input and an empty held seat after backend/lock revocation; a frontend void-method reply alone is not an admission oracle. New locked sessions are denied at CreateSession with response 2.

Issue #61's stated consent, stream, revoke and locked-denial acceptance is complete. The unsupported capabilities above remain broader GNOME parity limits, and P-SY-05 stays partial.
