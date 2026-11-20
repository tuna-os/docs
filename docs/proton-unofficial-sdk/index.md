---
sidebar_position: 1
sidebar_label: "proton-unofficial-sdk"
title: "proton-unofficial-sdk"
hide_title: true

status: unknown
---

An unofficial Proton Mail client library in Go: SRP login with TOTP and
human verification, folder and label sync with event-based increments,
decrypted RFC 5322 messages, read and star state, moves, end-to-end
encrypted sending and server-side logout. One JSON request in, one JSON
reply out, usable three ways:

- **as a Go package**, `github.com/tuna-os/proton-unofficial-sdk/protonsdk`;
- **as a helper process**, `proton-helper` (also installed as
  `hylki-proton`), speaking the contract over stdin/stdout, which is how the
  [Hylki](https://github.com/hyprlab/hylki) desktop mail client uses it;
- **on Android**, as `org.tunaos.proton:proton-sdk-android`: the package
  bound by gomobile plus a Kotlin wrapper with typed results, sealed errors
  and the session-rotation rules enforced.

> **Unofficial.** This project is not affiliated with, endorsed by or
> supported by Proton AG. "Proton" and "Proton Mail" are trademarks of
> Proton AG, used here only to say which service the library talks to.
> It uses Proton's public client API the way Proton's own open-source
> clients do, through Proton's own open-source libraries, and identifies
> itself honestly as a third-party client (`x-pm-appversion: Other`).
> Proton's [Terms of Service](https://proton.me/legal/terms) (§2.10) allow
> automated access only while the traffic stays indistinguishable from a
> person using a normal client, and Proton may block clients that deviate:
> poll no more often than Proton's own apps do (see [Watching an
> account](#watching-an-account)), don't bulk-process mailboxes, and expect
> that Proton can change or close the API at any time.

The current release is 0.1.3. The protocol follows the needs of its
first two users, Hylki's Proton support and the Tuna Mail Android app, and
may still change; the envelope's `version` field guards incompatible
changes.

## Features

- SRP sign-in with TOTP, two-password accounts (mailbox password) and
  Proton's human verification (CAPTCHA) challenge.
- Resumable sessions with refresh-token rotation handed back on every
  reply.
- Folder, label and message-header sync with stable keyset paging, an id
  snapshot for reconciliation, and incremental changes from Proton's event
  log.
- Server-side search over message metadata: sender, recipient, subject or
  keyword, folder or label, date range, unread and starred.
- A cheap `events` poll naming the folders and messages that changed, for
  watching an account.
- Decrypted messages as finished RFC 5322 bytes, attachments included, the
  way Proton Mail Bridge serves them over IMAP.
- Mark read/unread, star/unstar, label/unlabel, move and permanent delete,
  in batches with per-id outcomes; emptying Trash and Spam.
- Drafts saved to the server, encrypted like sent mail.
- Creating, renaming and deleting folders and labels.
- End-to-end encrypted sending: Proton recipients by their keys, outside
  recipients by PGP/MIME or PGP/Inline when they publish a key, cleartext
  only with explicit consent; replies and forwards threaded through their
  parent; uncertain submits detected rather than retried.
- Server-side logout.

## Security model

- **Proton's libraries do all the cryptography.** SRP, key derivation,
  key unlocking, encryption, decryption and signing are
  [go-proton-api](https://github.com/ProtonMail/go-proton-api),
  [go-srp](https://github.com/ProtonMail/go-srp),
  [gopenpgp](https://github.com/ProtonMail/gopenpgp) and Proton's
  [go-crypto](https://github.com/ProtonMail/go-crypto) fork, pinned at the
  revisions Proton Mail Bridge ships. This repository adds no cryptographic
  code of its own; it chooses which of those calls to make, in the order
  Bridge and Proton's web client make them (`sendprefs.go` is a port of
  Bridge's per-recipient encryption table).
- **Plaintext stays in memory.** The library writes nothing to disk and
  keeps no state between requests; decrypted mail exists only in the reply.
- **The session is the secret.** It carries the tokens and the
  bcrypt-salted mailbox passphrase (never the password). Callers store it
  encrypted — a keyring on the desktop, the Android Keystore on Android —
  and treat it like the password.
- **Nothing is logged.** go-proton-api's logrus output and resty's logger
  are silenced, a library panic becomes `helper_failed`, and replies carry
  only fixed codes, never server text or request data.
- **Ids are validated before they reach a URL**, recipients and
  Message-IDs before they reach a header.
- **Honest identification.** The client sends `x-pm-appversion: Other`,
  the API's third-party slot, never an official client's identity.

## Using it

### From Go

```go
import "github.com/tuna-os/proton-unofficial-sdk/protonsdk"

reply := protonsdk.Request(`{"version":1,"op":"login","email":"…","password":"…"}`)
```

`Request(string) string` and `RequestBytes([]byte) []byte` run one request
under the 90-second budget and return its envelope (no trailing newline);
`Serve(io.Reader, io.Writer)` is the helper's framing. All three are safe
for concurrent use, but two requests carrying the same session race on its
refresh token: run one account's requests one at a time, each with the
session the previous reply returned. The package silences logrus
process-wide on first use.

### As a helper process

```sh
go build -mod=vendor -trimpath -o proton-helper ./cmd/proton-helper
echo '{"version":2,"op":"login"}' | ./proton-helper
# {"version":1,"error":{"code":"unsupported_version"}}
```

One request on stdin up to EOF, one reply line on stdout, exit 0 always.
Installed or linked as `hylki-proton`, the same binary is the helper Hylki
runs for Proton accounts; it behaves identically under either name.
A caller should allow a few seconds over the 90-second budget for startup
(Hylki allows 100), then kill and reap the process.

### On Android

Add the Maven repository from the release's
`proton-sdk-android-<version>-maven.zip` (unzip it into, say,
`third_party/maven`) and depend on the artifact:

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        maven { url = uri("third_party/maven") }
    }
}

// build.gradle.kts
dependencies {
    implementation("org.tunaos.proton:proton-sdk-android:0.1.3")
}
```

The AAR holds `libgojni.so` for `arm64-v8a` and `x86_64`, minSdk 24, and
consumer R8 rules that keep the JNI-called classes. It depends on
kotlinx-coroutines and kotlinx-serialization-json.

```kotlin
val client = ProtonClient()                       // GoProtonTransport, Dispatchers.IO
val store = ProtonSessionStore { session -> keystoreBackedPrefs.put(accountId, session.json) }

val account = try {
    client.login(email, password, store, totp = code)
} catch (e: ProtonException.HumanVerificationRequired) {
    // Open e.challenge!!.verifyUrl() in a WebView, then retry with
    // humanVerification = HumanVerificationToken(token, type).
    throw e
}

// Later runs: client.account(ProtonSession(storedJson), store)
val inbox = account.sync(limit = 50)
val mime: ByteArray = account.message(inbox.messages.first().id).mime
val unread = account.search(ProtonSearchQuery(sender = "ada@example.com", isUnread = true), limit = 50)
account.watch(since = inbox.eventId).collect { event -> /* resync what it names */ }
```

`ProtonAccount` owns its session and enforces the rotation contract:

- requests on one account run one at a time, each with the session the
  previous reply left behind;
- every session a reply carries — success or error — is passed to
  `ProtonSessionStore.save` before the result is returned or the error
  thrown; if `save` throws, that exception propagates instead;
- the exchange with Go and the save run under `NonCancellable`, so
  cancelling a coroutine cannot drop a rotated session.

Keep exactly one `ProtonAccount` per stored session. Errors are a sealed
`ProtonException` (`Auth`, `HumanVerificationRequired`, `Session`,
`Transport`, `InvalidRequest`, `Folder`, `Content`, `Send`,
`SendUncertain`, `Failed`) whose `code` is a `ProtonErrorCode` and whose
`wire` is the code as received. `ProtonClient(transport = …)` takes any
`ProtonTransport`, which is how the wrapper's tests run on the JVM without
the native library.

## Framing

- Request: one UTF-8 JSON object, `{"version": 1, "op": "<name>", ...}`,
  at most 32 MiB (attachments travel base64 inside `send`). Unknown fields
  are refused (`invalid_request`), as the Tuta helper's
  `deny_unknown_fields` does.
- Reply: one JSON object (one line from the helper, which always exits 0) —
  `{"version": 1, "result": {...}}` or
  `{"version": 1, "error": {"code": "<fixed>"}}`.
- A missing `version` is `invalid_request`; a present but different one is
  `unsupported_version` and nothing is contacted.
- Every operation runs under a 90-second budget.
- Passwords, codes and tokens travel in the request only (stdin for the
  helper). Nothing is logged; replies never carry server text — only the
  codes below.
- The client identifies as `x-pm-appversion: Other`, the API's third-party
  slot, never as an official client.

## Sessions and token rotation

`login` returns `result.session`, the resumable blob the caller stores in
its keyring and sends back as `session` on every other operation:

| field           | meaning                                                         |
|-----------------|-----------------------------------------------------------------|
| `login`         | the `email` login was called with (for the identity check)      |
| `user_id`, `uid`| Proton user id and auth session UID                             |
| `access_token`  | current access token                                            |
| `refresh_token` | current refresh token                                           |
| `password_mode` | `1` one password, `2` separate mailbox password                 |
| `key_pass`      | base64 mailbox passphrase, already bcrypt-salted for the primary user key — what unlocks the keys. Never the password itself. |

Treat the whole object as a secret (it is as powerful as the session).

**Rotation.** Access tokens expire; the library refreshes on a 401, and the
API rotates the refresh token on every refresh — the old one stops working.
So every session-bearing reply carries the session as it stands at the end
of the run:

- success: `result.session`;
- failure after the session was resumed: `error.session`
  (`{"code": "...", "session": {...}}`).

The caller MUST persist whichever is present before interpreting the
result, or a refresh that happened mid-run signs the account out. `revoke`
success is the only session-taking reply without one.

## Operations

### `login`

Request: `email`, `password`, optional `totp` (six digits, or `null`),
optional `mailbox_password` (two-password accounts only), optional
`hv_token` + `hv_type` (a solved human-verification challenge — both or
neither; printable ASCII without spaces, `hv_type` a method name).

Proves SRP, completes a TOTP challenge when the account has one, then
derives the key passphrase and unlocks the user and address keys once to
prove it. Result: `{"session": {...}}`.

A login that cannot finish (second factor or mailbox password missing or
wrong, verification demanded after auth) logs the half-made session out
again, best-effort.

#### Human verification (CAPTCHA)

Proton may refuse a sign-in from a new client or network with API code
9001. The helper then replies:

```json
{"version": 1, "error": {"code": "human_verification_required",
  "hv": {"token": "<challenge token>", "methods": ["captcha", "email"]}}}
```

`hv.token` and `hv.methods` are copied verbatim from the error's `Details`
(`HumanVerificationToken`, `HumanVerificationMethods`) and are opaque;
method names that are not `[A-Za-z0-9_-]` are dropped, and the error's text
and `WebUrl` are never passed on. If the details are missing or malformed
the code arrives without `hv` and cannot be solved from that reply.

The client flow:

1. Open
   `https://verify.proton.me/?methods=<methods joined with ",">&token=<hv.token>&embed=true`
   (URL-encode both values) in an embedded WebKit view.
2. Before the page loads, inject a user script that forwards the page's
   own messages to the native side:

   ```js
   window.addEventListener('message', (event) => {
       if (event.origin === 'https://verify.proton.me') {
           window.webkit.messageHandlers.protonVerify.postMessage(event.data);
       }
   });
   ```

   (register `protonVerify` with `WebKitUserContentManager`). In a
   top-level view `window.parent` is the page itself, so the page's
   `window.parent.postMessage(…, '*')` lands on this listener.
3. The verify app (`WebClients/applications/verify`, `broadcast.ts` +
   `packages/shared/lib/broadcast/broadcast.ts`) posts every message as a
   **JSON string**, not an object:

   ```json
   "{\"type\":\"HUMAN_VERIFICATION_SUCCESS\",\"payload\":{\"token\":\"<solved token>\",\"type\":\"captcha\"}}"
   ```

   Parse it; on `type == "HUMAN_VERIFICATION_SUCCESS"` take
   `payload.token` and `payload.type`. Other messages the page sends:
   `{"type":"RESIZE","payload":{"height":N}}`, `{"type":"LOADED"}`,
   `{"type":"CLOSE"}` (user dismissed it), `{"type":"ERROR","payload":{…}}`
   and `{"type":"NOTIFICATION","payload":{"type","text"}}`. Ignore
   anything else, and anything not from `https://verify.proton.me`.
4. Retry `login` with the same credentials plus
   `hv_token: payload.token, hv_type: payload.type` (and the `totp` if
   the account has one — a solved token should not be spent on a sign-in
   that then stops at `second_factor_required`). The helper sends them as
   `x-pm-human-verification-token` / `x-pm-human-verification-token-type`
   on `POST /auth/v4` and on the following `GET /core/v4/users`, as
   go-proton-api and Bridge do and as WebClients' `getVerificationHeaders`
   builds them.
5. `human_verification_failed` (API code 12087) means the token was
   rejected or already used: show the challenge again from a fresh
   `human_verification_required` reply. A second
   `human_verification_required` means the same.

`embed=true` matters: without it the page treats a top-level view as an
external browser and itself redeems the CAPTCHA against the challenge
token (`POST core/v4/verification/captcha/<token>`) before posting the
message. In that mode the retry must send the *original* `hv.token` with
`hv_type: "captcha"` instead (the flow Bridge's CLI uses after the user
solves the challenge in a browser), and the posted `payload.token` is
already spent. The embedded flow keeps the posted token as the one to
present.

### `sync`

Request: `session`, `limit` (1–1000, required), optional `folder` (label
id, default `"0"` = Inbox), optional `offset` (0–1 000 000, default 0),
optional `cursor` (a message id; the page after it — not combinable with a
non-zero `offset`), optional `since` (an `event_id` from an earlier sync).

Result:

| key           | value                                                                 |
|---------------|-----------------------------------------------------------------------|
| `folders`     | every folder row (below)                                              |
| `folder`      | the label id listed                                                   |
| `messages`    | headers (below), newest first                                         |
| `exists`      | total messages in the folder                                          |
| `offset`      | the request's offset                                                  |
| `all_ids`     | every message id in the folder when `offset` is 0 and neither `cursor` nor `since` is given and the folder holds ≤ 10 000 messages; otherwise `null` |
| `next_cursor` | last id of a full page (pass as `cursor`), or `null` at the end       |
| `event_id`    | event to pass as `since` next time — taken *before* listing, so anything that changes during the run is reported again, never skipped |
| `changes`     | only with `since`: `{"refresh", "more", "deleted", "updated"}`        |
| `session`     | see rotation                                                          |

Folder row: `{"id", "role", "label", "parent", "kind", "total", "unread"}`.
`kind` is `system`, `folder` (user folder, exclusive) or `label` (user
label, a tag). System rows, in order: Inbox `0` (`inbox`), Drafts `8`
(`drafts`), Sent `7` (`sent`), Starred `10` (`starred`), Archive `6`
(`archive`), Spam `4` (`junk`), Trash `3` (`trash`), All Mail `5`
(`other`). User folders and labels have role `other` and their parent's id
in `parent` (`""` at the top). Proton's other system labels (all-drafts,
all-sent, outbox, scheduled, snoozed) are views or transient states and are
not listed.

Header row (the Tuta shape plus what Proton metadata gives for free):
`id`, `subject`, `date_ms`, `sender` `{name, address}`, `recipient` (first
To, else Cc, else Bcc, or `null`), `is_unread`, `confidential` (arrived
end-to-end encrypted), `message_id` (original Message-ID without `<>`),
`label_ids`, `is_starred`, `is_draft`, `has_attachments`, `size`.

Listing pages by keyset (`EndID`), so mail arriving mid-walk cannot shift
a page and hide a message from the `all_ids` snapshot. `offset` pages are
offered for Tuta parity; `cursor` is the stable way to page.

`changes` replays the event log from `since` (up to 500 events per call;
`more: true` means call again from the returned `event_id`). `deleted` is
the ids gone since; `updated` is the current header row of every message
created or changed since, re-read rather than taken from a partial event.
`refresh: true` — the server demanded a resync, or no longer knows `since`
— means discard the deltas and sync from scratch; `event_id` is then the
current one.

### `search`

Request: `session`, `limit` (1–150, required), at least one criterion,
optional `folder` (a folder or label id as `sync` lists it, default `"5"` =
All Mail) and optional `cursor` (a `next_cursor` from an earlier search with
the same criteria).

| criterion    | matches                                                        |
|--------------|----------------------------------------------------------------|
| `keyword`    | the subject, the sender, or any To/Cc/Bcc recipient (name or address) |
| `subject`    | the subject                                                    |
| `sender`     | the sender's name or address                                   |
| `recipient`  | any To, Cc or Bcc recipient's name or address                  |
| `after_ms`   | sent at or after this epoch-millisecond instant                |
| `before_ms`  | sent before this epoch-millisecond instant                     |
| `is_unread`  | read state                                                     |
| `is_starred` | star                                                           |

A message must match every criterion given. Text criteria are trimmed,
1–256 characters without control characters, and match as
case-insensitive substrings. A request without a criterion, with a bad
one, or with `after_ms` ≥ `before_ms` is `invalid_request`; a bad `limit`
is `invalid_page`; an unknown folder is `folder_not_found`.

Result: `messages` (header rows as `sync` returns them, newest first) and
`next_cursor`, plus `session`. A `next_cursor` that is not `null` means
the folder was not searched to its end: pass it as `cursor` to go on. A
call stops at `limit` hits or after reading 20 pages of 150 messages, so it
can return fewer hits than `limit` — even none — with a cursor; only a
`null` cursor means there is nothing more to find.

How it searches: the folder is listed newest-first by keyset, like `sync`,
with the criteria passed to Proton's own search parameters (`Keyword`,
`From`, `Recipients`, `Begin`, `End`, `Unread`, `Starred`, as Proton's web
client sends them; a `subject` goes as `Keyword` when no `keyword` is
given). Every listed message is then re-checked against the criteria on its
metadata, so a hit means the same whatever the server did with them. The
server applies them its own way, which Proton does not document and which
may find less than a substring would; where it does, the narrower match is
the one that applies. The server-side matching has not yet been checked
against a live account. go-proton-api's test server ignores these
parameters, so the tests check that they are sent and that the re-check
alone gives the right hits.

What can and cannot be searched: subject, sender, recipients, date, read
state, star and labels are metadata Proton's servers hold readable, which is
why they can be searched there. **Message bodies and attachment contents**
are end-to-end encrypted, so the server cannot search them, and this
library does not download and decrypt mail to search it. Proton's own apps
search content by building an encrypted index on the device; a client that
wants body search has to do the same from the messages it has fetched.
Other headers (Message-ID, Reply-To, List-Id) are not search criteria
either.

### `events`

Request: `session`, `since` (an `event_id` from `sync` or an earlier
`events`).

The poll for watching an account: replays the event log from `since` (up to
500 events per call) and says what changed, without listing folders or
re-reading headers — one or two requests to the API.

Result:

| key               | value                                                              |
|-------------------|--------------------------------------------------------------------|
| `event_id`        | poll from here next time                                           |
| `refresh`         | the server demanded a full resync, or no longer knows `since`: resync everything from `event_id` |
| `more`            | more events wait past `event_id`: poll again right away            |
| `folders_changed` | a folder or label was created, renamed, moved or deleted           |
| `mail_changed`    | sorted ids of the folders the created or changed mail is in now    |
| `updated`         | ids of messages created or changed                                 |
| `deleted`         | ids of messages deleted                                            |
| `session`         | see rotation                                                       |

An event names a changed message's labels as they are *now*, so a move
reports its destination but not the folder it left: refresh whatever local
folder holds an id in `updated` or `deleted` as well as the folders in
`mail_changed`. `events` replaces nothing in `sync`: after a poll names a
folder, `sync` it with `since` to get the headers.

#### Watching an account

Proton gives third-party clients no push channel — its own apps' push
notifications go through Proton's registrations with Google's and Apple's
push services — so a client watches an account by polling `events`. Bridge
polls every 20 seconds plus jitter; poll no more often than that while the
app is in the foreground (the Kotlin wrapper's `watch` defaults to 30
seconds), and let Android's WorkManager (15-minute minimum) or the desktop
app's idle timer schedule background polls. Polling faster gains nothing
and makes the client stand out to Proton's abuse detection (see the
disclaimer above).

### `message`

Request: `session`, `id`.

Fetches the message, unlocks the receiving address's key with `key_pass`,
downloads and decrypts every attachment (Proton-native messages store them
separately; PGP/MIME messages carry them inside the body), and builds the
RFC 5322 message the way Bridge serves it over IMAP.

Result: `{"header": <header row>, "mime": "<base64 RFC 5322 bytes>",
"attachments": [...], "session": {...}}`. Attachment rows are
`{"id", "name", "mime_type", "cid", "size", "disposition"}` — metadata only;
the bytes are already inside `mime`.

### `mark_read`

Request: `session`, `ids` (≤ 50), `is_read`.

Result: `{"outcomes": [{"id", "code"}...], "session"}` in input order, a
`null` code meaning applied. The batch goes out in one call; if the server
refuses it, each id is replayed alone (the mutation is idempotent) so every
id gets its own outcome — `request_failed` for an id the server refused. A
failure that says nothing about the ids (revoked session, outage, timeout)
fails the whole request; an outage during the replay marks that id and
leaves the rest `not_attempted`.

### `move`

Request: `session`, `ids` (≤ 50), `destination`.

Proton's move is labelling with an exclusive label, which drops the
previous folder. Allowed destinations: Inbox `0`, Archive `6`, Spam `4`,
Trash `3` and the user's own folders. Other system views (All Mail, Sent,
Drafts, Starred) and user labels are `invalid_destination`; an unknown id
is `folder_not_found`. Outcomes as for `mark_read`. Like Tuta, the reply
asserts no destination id: Proton keeps the message id across moves.

### `star`

Request: `session`, `ids` (≤ 50), `is_starred`.

Adds or removes the Starred system label (`10`). It is a label, so the
message stays in its folder. Outcomes as for `mark_read`.

### `send`

Request (the Tuta shape): `session`, `sender`, `sender_name`, `to`, `cc`,
`bcc`, `reply_tos` (each a list of `{name, address}`), `subject`,
`body_html`, `delivery` (`"secure"` or `"ordinary"`), `ordinary_confirmed`,
`attachments` (`[{name, mime_type, cid, data}]`, `data` standard base64,
`cid` `null` or a Content-ID that makes the attachment inline), and
optionally:

- `message_id`: the sent mail's Message-ID, with or without `<>`; one is
  generated on the sender's domain when absent.
- `in_reply_to`: the Message-ID being answered (with or without `<>`).
- `references`: the References chain, Message-IDs oldest first separated
  by whitespace — bracketed (`"<a@b> <c@d>"`, glued `"<a@b><c@d>"` too) or
  bare (`"a@b c@d"`).
- `action`: `"reply"` (default), `"reply_all"` or `"forward"`; only with
  `in_reply_to` or `references`.

Message-IDs are printable ASCII without spaces or brackets once their one
pair of `<>` is stripped, at most 998 bytes each; `references` holds at most
100 of them in at most 16 KiB. Anything else is `invalid_request` (no
partial acceptance: a malformed id refuses the send).

**Threading.** Before anything is written, the helper looks the parent up
among the account's own messages by Message-ID (Proton's `ExternalID`
filter): `in_reply_to` first, then `references` newest first, at most four
lookups. Drafts never count; when one Message-ID matches several copies,
the copy on the sending address wins, then a sent copy, then the first.
When a parent is found the draft is created with `ParentID` and the
action (`Action` 0 reply, 1 reply-all, 2 forward), as Proton's own
clients and Bridge do: the server then writes `In-Reply-To` and
`References` itself and marks the parent answered or forwarded.

When no parent is found the mail is still sent, but **without
`In-Reply-To`/`References`**: Proton's draft API takes no custom headers
(go-proton-api's `DraftTemplate` and WebClients' `createDraft` payload are
`Message`, `ParentID`, `Action`, `AttachmentKeyPackets` only, and the
server derives those headers from `ParentID` alone). Recipients' clients
then thread by subject, if at all. A lookup that fails for want of a
connection fails the send definitively (`transport_failed`, `timeout`, …)
before anything was written.

Everything that can refuse does so before anything is written server
side: request shape, consent (`ordinary` needs `ordinary_confirmed: true`),
the sender (must be one of the account's enabled sending addresses), and
every recipient's preferences. Those follow Proton Bridge's table
(`sendprefs.go` is a port): a Proton recipient is always end-to-end
encrypted to its key (internal package); an outside recipient with a key
the API knows (WKD / key transparency) or a contact card pins gets PGP/MIME
(or PGP/Inline when the card says so), signed; any other outside recipient
gets cleartext — signed MIME if the account signs external mail, plain
otherwise — over TLS. With `delivery: "secure"`, a recipient that would get
cleartext refuses the whole send with `confidential_send_unsupported`
(password-protected external mail is not implemented).

A recipient's contact card is read under the spelling the card itself uses
for the address, and only after its signature verifies against the
account's keys. A card that does not verify refuses the send with
`send_failed` instead of being ignored: it may be what pins the key or asks
for encryption.

A card that pins keys for the address decides which key is the recipient's.
When the API offers keys for that address and none of them is pinned, the
send is refused with `send_failed` rather than encrypted to the API's key:
a key the key server swapped is what a pin guards against. A pinned key
the API still lists but no longer marks active counts as not offered while
another key is active: its owner retired it, as obsolete or compromised,
and the key that replaced it is not pinned. This is where the table leaves
Bridge, which would use the API's key, or the retired pinned one; Proton's
web client refuses as well. To send again, the user trusts the new key (or
removes the old one) in the contact. One exception: a card that says not to
encrypt to keys it does not pin gets cleartext, as it asked, and `secure`
delivery refuses that as usual.

Then a draft is created (body encrypted to the sender's key, Reply-To and
the Message-ID set), attachments are uploaded encrypted, and the packages
go out in one submit. Bcc recipients get their packages like everyone else
but are never written into a header; the server delivers them and files the
Sent copy itself.

Result: `{"message_id", "sent_mail", "sent_date_ms", "internal_recipients",
"external_recipients", "session"}` — `message_id` is the sent mail's
Message-ID without `<>`, `sent_mail` its Proton id (the Sent copy).

Failure semantics:

- Anything before the submit is definite: nothing went out, a retry is
  safe, and any draft already created is deleted.
- A submit the server refused before executing (4xx on the first attempt)
  is definite too: `send_failed`, `invalid_recipient`, `message_too_large`,
  `transport_failed` (429), `session_revoked`, ... — and the draft is
  deleted.
- Anything else after the submit went out — lost connection, timeout, 5xx,
  or a refusal of a *retried* submit (the first attempt may have gone
  through) — may have delivered. The helper then reads the draft back: if
  it already reads as sent, that is a success; otherwise the reply is
  `send_uncertain`, the draft is kept, and the caller must not retry
  automatically.

### `revoke`

Request: `session`. Logs the session out server-side (`DELETE /auth/v4`).
Idempotent: a session the server already dropped is a success. Result:
`{}`.

### `delete`

Request: `session`, `ids` (≤ 50).

Deletes the messages permanently, wherever they are: there is no undo
and no Trash copy. Proton's own clients offer it only in Trash, Spam and
Drafts; the caller decides. Outcomes as for `mark_read`. Deleting a draft
is how a client discards one.

### `empty_folder`

Request: `session`, `folder` (Trash `3` or Spam `4`; anything else is
`invalid_destination`).

Deletes everything in the folder permanently, newest first, a page of 150
at a time (go-proton-api exposes no call for the API's own empty
endpoint). Result: `{"deleted": <count>, "more": <bool>, "session"}`.
`more: true` means the run stopped with less than 15 seconds of its
budget left: call again. A message that survives its own delete stops the
run with `request_failed` rather than looping on it.

### `save_draft`

Request: `session`, `sender`, `subject`, `body_html`, and optionally
`sender_name`, `to`, `cc`, `bcc`, `reply_tos`, `attachments`,
`message_id`, `in_reply_to`, `references`, `action` — each as for `send`,
except that recipients may be empty — and `replaces`, the id of the draft
this one supersedes.

Writes a draft to Drafts the way `send` writes its draft: body encrypted
to the sender's address key, attachments uploaded encrypted, threaded to
its parent when one is found. Nothing is sent. Saving again writes a new
draft and deletes the one named by `replaces`, the way IMAP clients save
drafts; updating a Proton draft in place would mean replacing its
attachments one request at a time and could leave a half-updated draft.
`replaces` only ever deletes a draft: any other message is left alone.

Result: `{"id", "message_id", "replaced", "session"}` — `id` the new
draft's Proton id, `message_id` its Message-ID without `<>`, `replaced`
whether the superseded draft was deleted (when false, the old draft is
still there: delete it with `delete` or leave the duplicate). Errors:
`invalid_recipient`, `sender_unknown`, `attachment_failed`,
`invalid_id` (`replaces`), and the transport and session codes; a draft
whose attachments fail to upload is deleted again.

### `label`

Request: `session`, `ids` (≤ 50), `label`, `is_labelled`.

Adds (`is_labelled: true`) or removes a user label, a tag that leaves the
message in its folder. Only user labels (`kind: "label"` in `sync`) are
accepted: folders are `move`'s and Starred is `star`'s, so those and the
other system ids are `invalid_destination`; an unknown id is
`folder_not_found`. Outcomes as for `mark_read`.

### `create_folder`, `rename_folder`, `delete_folder`

- `create_folder`: `session`, `name`, `kind` (`"folder"`, a place mail is
  moved to, or `"label"`, a tag), optional `parent` (a user folder or
  label id) and `color` (`#rrggbb`, default Proton's `#7272a7`).
- `rename_folder`: `session`, `id`, `name`; the colour and parent stay.
- `delete_folder`: `session`, `id`. The mail inside is not deleted:
  Proton keeps it in All Mail.

Names are trimmed, 1–100 characters without control characters, else
`invalid_request`. System folders and views (any all-digit id) are
`folder_readonly`; unknown ids are `folder_not_found`. `create_folder` and
`rename_folder` answer `{"folder": <folder row as sync lists it>,
"session"}`, `delete_folder` answers `{"session"}`.

## Error codes

| code | meaning |
|------|---------|
| `invalid_request` | malformed JSON, unknown op or field, missing field, oversize |
| `unsupported_version` | `version` present but not `1` — caller must stop |
| `helper_failed` | the helper itself failed (a library panic) |
| `login_failed` | wrong password or unknown user |
| `second_factor_required` | TOTP challenge, no code given |
| `invalid_totp` | TOTP code is not six digits |
| `unsupported_second_factor` | the account only offers non-TOTP factors |
| `second_factor_failed` | TOTP rejected by the server |
| `mailbox_password_required` | two-password account, no `mailbox_password` given |
| `mailbox_password_failed` | the mailbox password does not unlock the keys |
| `human_verification_required` | the API demands a CAPTCHA; `error.hv` carries the challenge (see `login`) |
| `human_verification_failed` | the presented `hv_token` was rejected or already used (API 12087) |
| `client_outdated` | the API refuses this app version |
| `session_invalid` | the stored session is missing fields or its `key_pass` no longer opens the keys (password changed elsewhere) — sign in again |
| `session_revoked` | the server ended the session (logout, refresh token spent) |
| `revoke_failed` | logout could not be confirmed |
| `transport_failed` | network failure, throttling (429) or server error (5xx) |
| `timeout` | the 90-second budget ran out |
| `request_failed` | the server refused a request for a reason with no code of its own |
| `invalid_id` | an id is empty or not URL-safe base64 (ids go into request paths) |
| `invalid_page` | `limit`/`offset` out of range, or `cursor` with an `offset` |
| `invalid_batch` | more than 50 ids |
| `folder_not_found` | the folder/destination id does not exist |
| `invalid_destination` | a view or label, not a place mail can be moved to |
| `decryption_failed` | the message body cannot be decrypted |
| `attachment_failed` | an attachment cannot be fetched, decrypted, decoded or uploaded |
| `invalid_recipient` | no recipients, a malformed address, or one the server refuses |
| `sender_unknown` | the sender is not one of the account's sending addresses |
| `ordinary_delivery_requires_consent` | `delivery: "ordinary"` without `ordinary_confirmed` |
| `confidential_send_unsupported` | `delivery: "secure"` but a recipient would get cleartext |
| `message_too_large` | the server refuses the message size |
| `send_failed` | definite send failure: nothing was sent, safe to retry |
| `send_uncertain` | the submit may have delivered: never retry automatically |
| `folder_readonly` | a system folder, which cannot be renamed or deleted |

Per-id outcome codes (`mark_read`, `move`, `star`, `label`, `delete`):
`null`, `request_failed`, `not_attempted`, or one of `transport_failed` /
`timeout` / `session_revoked` for the id an outage hit.

## Deviations from the Tuta contract

- Every session-bearing reply carries `session` (in `result` or `error`):
  Proton rotates refresh tokens, Tuta sessions do not change.
- `login` takes optional `mailbox_password`, `hv_token` and `hv_type`,
  and its `human_verification_required` error carries `hv`; the session
  carries `key_pass` instead of Tuta's `encrypted_passphrase_key`.
- `sync` adds `cursor`, `since`, `next_cursor`, `event_id` and `changes`;
  folder rows add `kind`, `total` and `unread`; header rows add
  `message_id`, `label_ids`, `is_starred`, `is_draft`, `has_attachments`
  and `size`. `offset` is optional (default 0); `all_ids` is `null` past
  10 000 messages.
- `message` returns the finished RFC 5322 message (`mime`, base64) instead
  of Tuta's `html` / `headers` / `to` / `cc` / `reply_to` pieces, and its
  attachment rows carry no `data` — the bytes are inside `mime`.
- `mark_read` / `move` / `star`: when the server refuses a batch, each id
  is replayed and reports its own outcome, rather than Tuta's "first id of
  the failed chunk carries the code, the rest `not_attempted`".
- `star` is new: Tuta has no starred state.
- `send` really encrypts: `delivery: "secure"` is honoured for Proton and
  PGP recipients instead of always refusing; `message_id`, `in_reply_to`,
  `references` and `action` are optional extras (Tuta starts every send as
  a new conversation); failures after the submit are probed before
  `send_uncertain`.
- `revoke` closes the session server-side (Tuta's pinned SDK cannot).
- New codes: `mailbox_password_required`, `mailbox_password_failed`,
  `human_verification_required`, `human_verification_failed`,
  `invalid_destination`,
  `message_too_large`. `unsupported_operation`, `unsupported_u2f`,
  `unsupported_webauthn`, `resume_failed`, `incomplete_response`,
  `unsupported_legacy_body` and `body_too_large` are never produced.
- `events` is new: Tuta's helper streams `watch` over its event bus
  websocket; Proton has no push for third-party clients, so the caller
  polls.
- `delete`, `empty_folder`, `save_draft`, `create_folder`,
  `rename_folder` and `delete_folder` share Tuta's names but not all of
  its shapes: `delete` takes no `folder` and deletes from anywhere;
  `empty_folder` takes `folder` (not `id`), deletes a page at a time and
  may answer `more`; `save_draft` supersedes an old draft through
  `replaces`, and a draft is discarded with `delete` (there is no
  `delete_draft`); labels are made with `create_folder`'s `kind: "label"`
  and applied with `label` rather than Tuta's `create_label` /
  `apply_labels`; `delete_folder` never deletes mail. New code:
  `folder_readonly`.

## Building and testing

The Go module needs Go ≥ 1.26.11. Everything below is offline, from
`vendor/`:

```sh
gofmt -l protonsdk cmd tools.go           # must print nothing
go vet -mod=vendor ./...
go vet -mod=vendor -tags tools .          # tools.go is behind a build tag
go test -mod=vendor ./...
go build -mod=vendor -trimpath -o proton-helper ./cmd/proton-helper
```

CI also gates every pull request on `govulncheck`
(`.github/workflows/govulncheck.yml`). It fails when a known advisory has a
call path from `protonsdk/` or `cmd/`, which is most likely after a
dependency bump. Unlike the checks above, it needs the network to fetch
the vulnerability database. Its standard-library findings depend on the
Go that runs it, so use the version in `go.mod`, as CI does; a newer local
Go can report advisories that CI does not:

```sh
go install golang.org/x/vuln/cmd/govulncheck@v1.9.0
GOTOOLCHAIN="go$(go list -m -f '{{.GoVersion}}')" GOFLAGS=-mod=vendor \
  "$(go env GOPATH)/bin/govulncheck" ./protonsdk/... ./cmd/...
```

The tests run go-proton-api's own in-process API server
(`github.com/ProtonMail/go-proton-api/server`) behind a reverse proxy the
tests control, and drive the library through its real framing: login →
sync (pages, cursor, snapshot, events) → search (every criterion, cursor
paging, the parameters sent) → events polls → message decrypt →
mark_read → move → send to Proton recipients (whose copies are then
decrypted from their own accounts), to a cleartext outsider and to a PGP
outsider (whose package is opened with the recipient's key), replies and
forwards threaded through their parent → revoke, plus token rotation and
every failure mode the proxy can inject (refusals, lost submits, lost
replies, retried submits, timeouts, human verification, outdated client).
No test talks to the real Proton API.

### The Android library

Two steps, both in the [Tuna Mail build
image](https://github.com/tuna-os/tuna-mail/tree/main/tools/build-env)
(JDK 21, Android SDK 37, NDK 28.2, Go 1.26, gomobile), or anywhere with the
same tools:

```sh
scripts/build-aar.sh                      # gomobile bind → build/gomobile/
cd android
./gradlew :proton-sdk-android:testDebugUnitTest :proton-sdk-android:dist
./gradlew --stop
```

`scripts/build-aar.sh` runs `gomobile bind -target=android/arm64,android/amd64
-androidapi 24 -javapkg org.tunaos.proton.gomobile` and writes
`proton-sdk-android.aar` (the raw binding: `Protonsdk.request(String)`) and
its `-sources.jar`. The Gradle module compiles the generated Java sources
and the per-ABI `libgojni.so` into its own AAR, so the published artifact
is self-contained; `dist` leaves `proton-sdk-android-<version>.aar` and
`proton-sdk-android-<version>-maven.zip` in
`android/proton-sdk-android/build/dist/`. `android/gradle.properties` keeps
Gradle to one 2 GB JVM with three workers and compiles Kotlin in-process.

### Releases

Pushing a `v*` tag runs the release job of `.github/workflows/ci.yml`: the
Go tests, the gomobile build, the Kotlin tests, then a GitHub release with the AAR and
the Maven zip as assets — the same shape as
[tuta-unofficial-sdk](https://github.com/tuna-os/tuta-unofficial-sdk)'s
Android artifact, so an app consumes both the same way. Bump
`VERSION_NAME` in `android/gradle.properties` with the tag.

### Using it from Hylki

Hylki builds the helper from a submodule, offline, from `vendor/`:
`go build -mod=vendor -trimpath -buildvcs=false -o proton-helper
./cmd/proton-helper`, then installs it as `/app/bin/proton-helper` with an
`hylki-proton` symlink.

## Dependencies

- `go-proton-api` is pinned at
  `v0.4.1-0.20260901104215-8a62023d3e38`, the revision Proton Mail Bridge
  ships. The last tagged release, `v0.4.0`, is from 2022 and pulls
  gopenpgp 2.4 and a 2022 go-crypto; the pinned revision is what the
  official client currently runs against the live API, with gopenpgp
  `v2.10.0-proton` and go-crypto `v1.4.1-proton`. Its `go.mod` replaces
  resty with Proton's fork, and a dependency's replace does not apply to
  us, so `go.mod` repeats it:
  `github.com/go-resty/resty/v2 => github.com/ProtonMail/resty/v2`.
- `golang.org/x/mobile` is required (through the build-tagged `tools.go`)
  at the version the build image's gomobile and gobind come from, so the
  generator and the `bind/seq` runtime always match. Minimum version
  selection takes `x/crypto`, `x/net`, `x/sys` and `x/text` to the versions
  it requires.
- `vendor/` (~51 MiB) is committed for offline builds (Hylki's Flatpak).
  About two thirds of it is the test server's own dependencies: `go mod
  vendor` includes test imports, though the library links none of them.
  After any `go.mod` change run `go mod tidy && go mod vendor` and commit
  both. gomobile cannot use `vendor/` (it binds from a temporary module of
  its own), so `scripts/build-aar.sh` resolves the same versions from
  `go.sum` through the module cache.

## Limits

- Only TOTP is supported as a second factor; FIDO2/U2F is refused.
- The CAPTCHA itself is solved by the user in the client's WebKit view;
  the helper only relays the challenge and presents the solved token.
- A reply to a message that is not in the account (or not findable by
  its Message-ID) carries no `In-Reply-To`/`References`: the draft API
  cannot set headers.
- Password-protected mail to outsiders ("encrypted outside") is not
  implemented; `secure` delivery refuses such recipients instead.
- `all_ids` is skipped past 10 000 messages to stay inside the budget; use
  `since` for incremental sync.
- `search` covers metadata only; bodies and attachments are end-to-end
  encrypted (see `search`).
- Not yet validated against a live account.

## License

GPL-3.0-or-later (see `LICENSE`).

The choice is not free: `protonsdk/sendprefs.go` is a port of Proton Mail
Bridge's `smtp_prefs.go`, and Bridge is GPL-3.0-or-later, so the library is
a derivative work under that licence. It is also the licence the helper
has always carried: it began in [Postcard](https://github.com/tuna-os/postcard)
(GPL-3.0-or-later) and moved into Hylki's tree under the same terms, and it
is the licence [tuta-unofficial-sdk](https://github.com/tuna-os/tuta-unofficial-sdk)
uses. The direct dependencies — go-proton-api, gopenpgp, go-srp, gluon
(MIT) and go-crypto (BSD-3-Clause) — are permissive and impose only their
notices, which the vendored copies keep. MIT for this repository would have
meant rewriting the send-preference logic from scratch, and would have
bought nothing for its consumers:

- Hylki (AGPL-3.0-or-later) runs the helper as a separate program, and
  GPLv3 §13 lets AGPLv3 and GPLv3 code be combined in any case.
- An Android app links the library into its own process, so the app as a
  whole is distributed under GPLv3 terms; Apache-2.0 code such as
  Thunderbird for Android is compatible with that (one-way), and the same
  already holds for the GPL-3.0 Tuta SDK.
