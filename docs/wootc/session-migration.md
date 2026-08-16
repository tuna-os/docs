---
sidebar_position: 19
title: "session migration"
---

North Star: the user should not have to re-set-up their digital life. So
we try, in this order, to carry each app's *logged-in session* across —
and when we can't do it safely, we make re-authenticating one tap, not a
scavenger hunt.

## The key realization: decrypt in Windows, not in the deployer

Most "you can't migrate the session" folklore assumes offline access from
Linux. But the **wootc installer GUI runs inside the user's live Windows
session**, where the DPAPI master key is unlocked. That is exactly where
Chromium/Electron `safeStorage` and cookie databases *can* be decrypted.

So session handling splits by *where* it must happen:

| Where | What it can do | Owns |
|---|---|---|
| **Windows GUI (online, DPAPI available)** | decrypt cookies/tokens, re-encrypt for transport | `slurp_windows.go` session collectors |
| **Deployer (offline)** | copy plain-file state only | `wootc-detect-apps`, `wootc-import-browser` |
| **Target first-login** | re-import, or present a one-tap re-link | dashboard + `wootc-apply-look` |

## Per-class strategy

**Plain-file sessions → copy verbatim (already implemented).**
Firefox/Thunderbird whole profile, Telegram `tdata`, VS Code, OBS. These
carry the login with no decryption. Done in the deployer.

**Chromium/Electron `safeStorage` (Discord, Slack, Spotify, Chrome, Edge)
→ decrypt-and-rewrap in Windows.** At slurp time the GUI:
1. reads the app's `Local State`, DPAPI-decrypts the `os_crypt.encrypted_key`;
2. uses it to decrypt the Cookies/Local Storage LevelDB entries;
3. re-encrypts the payload under a key derived from the wootc vault
   secret (never written in clear to disk), stored in
   `install\slurp\session\<app>.enc`.
On the Linux side, the app's equivalent store is written back and
re-encrypted under the Linux `safeStorage` (libsecret/kwallet). Result:
the app opens already signed in. **Gated behind explicit user consent per
app** — this is moving auth tokens, so the dashboard asks first and
defaults off. (Implemented incrementally; the collector scaffolding lands
here, per-app LevelDB rewriting is the follow-up.)

### Online rewrap contract

The Windows installer now has the first complete, testable half of that
contract. `collectSessions` writes only decryptability findings. The install
configuration's `sessionConsent` map is opt-in per app; missing and false
entries do nothing. For a consented Chrome, Edge, or Spotify entry, the
installer decrypts the DPAPI-protected Chromium master key while the user is
online and writes `install/slurp/session/<app>.enc`. It also writes an
`exports.json` ledger whose state is `staged`, never `imported`.

That file is a versioned, authenticated AES-256-GCM envelope with the binary
layout `[version | 32-byte salt | nonce | ciphertext+tag]`. Its key is
derived with HKDF-SHA256 from the Linux vault secret, app name, and the fresh
per-envelope salt; the app name is also authenticated as associated data.
The DPAPI key is never written in clear. Files are created with mode `0600`
and the export is best-effort: a failed export does not fail installation or
claim that the session moved.

The target-side consumer still must decrypt the envelope, enumerate the
app's SQLite/LevelDB values, and re-encrypt them with the Linux keyring. That
work is deliberately separate because Chrome, Edge, and Spotify differ in
database layout and token invalidation behavior. Discord and Slack remain
re-link-only even when DPAPI can read their key.

`decryptChromiumValue` (`app/session_chromium_value.go`) implements the one
sub-step of that whose correctness doesn't depend on a live browser: given
the os_crypt key recovered from the envelope, it decrypts a single Cookies
`encrypted_value` (or Local Storage value) in Chromium's documented `v10`
wire format — `"v10" | 12-byte nonce | ciphertext | GCM tag`, AES-256-GCM.
Tested against synthetically-sealed fixtures, not a real browser. Still
unclaimed: enumerating a real Cookies SQLite/Local Storage LevelDB file,
`v11`-prefixed values (which add platform-specific associated data on some
Chrome versions — not documented consistently enough to implement blind),
and the actual libsecret/kwallet write on the target. Those need a real
Chrome/Edge install and a Linux D-Bus session to verify against, neither
of which this change had access to.

Until that consumer completes and records `imported`, the dashboard must show
re-link/sign-in guidance rather than a signed-in result. A staged key is an
implementation artifact, not evidence that a token transplant succeeded.

**Phone-linked apps → guided re-link, not token theft.** Signal, WhatsApp,
and (when token copy is declined) any messenger: the safest, most durable
path is the app's own "link a device" flow. The dashboard shows the exact
steps and, where possible, deep-links the Linux app straight to its
QR/scan screen. This is *better* than copying a fragile token that the
service may invalidate on a new device fingerprint.

**Cloud-account apps → one-tap sign-in.** Spotify library, Discord
servers, Zoom — the content is server-side; a single sign-in restores
everything. The dashboard frames it that way ("your playlists are waiting
— just sign in") instead of implying data was lost.

## Honesty rules (non-negotiable, North Star)

- Never claim a session moved when only bookmarks did.
- Never silently copy auth tokens — always consent, always per-app.
- Prefer re-link over token copy when the service is known to invalidate
  transplanted sessions (avoids a broken-looking app on first launch).
- Every app row in the dashboard states its real outcome: *signed in*,
  *re-link needed (2 steps)*, or *sign in once*.
