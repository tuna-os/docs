---
sidebar_position: 1
sidebar_label: "tuta-unofficial-sdk"
title: "tuta-unofficial-sdk"
hide_title: true

status: unknown
---

An unofficial, community-maintained Tuta (Tutanota) SDK for Rust: sign in,
read and decrypt mail, send it end-to-end encrypted (to Tuta recipients by
key, to everyone else behind a password), keep drafts, manage folders and
labels, import mail, keep contact passwords and watch the event bus for
changes. Tuta offers no IMAP, SMTP or JMAP: mail is end-to-end encrypted on
the server, and only Tuta's own client library can sign in and decrypt it.
This SDK wraps that library in a typed async API, and ships `tuta-helper`, a
small JSON-over-stdio program on top of it for applications that would
rather run a separate process, and `tuta-sdk-android`, the same protocol in
process for Android and the JVM through Kotlin bindings.

## Status and disclaimer

**This project is not affiliated with, endorsed by or supported by Tuta GmbH.**
"Tuta" and "Tutanota" are their trademarks, used here only to say what this
software talks to.

Tuta's API is undocumented and third-party clients are unsupported. Using this
SDK may conflict with Tuta's terms of service: read them and decide for
yourself before you use it with an account, and prefer a test account while
developing. The server can change or refuse this client at any time; a pinned
SDK that falls behind the minimum client version Tuta accepts fails with
`client_outdated`, and the fix is to update the pin, never to report a
different client version.

The API follows the needs of its users, the Hylki mail client's Tuta support
and Tuna Mail for Android, and may still change before 1.0.

## Features

- Sign-in with password and TOTP; saved, resumable sessions; closing a
  session on the server; cancelling a sign-in left at its second factor.
- The folder tree and labels; folder pages with every mail's labels and
  Message-ID; a mail decrypted to its parts or to RFC 5322 MIME (`.eml`).
- Search by text, sender, recipient, date and read state, as a bounded,
  resumable scan (Tuta has no server-side search).
- Read state, moves (with the server's own undo information), labels,
  permanent deletes from Trash and Spam, emptying Trash and Spam.
- Folders and labels: create, rename, re-parent, recolour, delete, with the
  official client's rules.
- Drafts: save (create or replace) and discard, with their place in a
  conversation.
- Sending: confidential (end-to-end encrypted) to Tuta recipients by their
  public keys and to everyone else behind a password, or ordinary with
  explicit consent; replies and forwards threaded and marked on the parent;
  attachments; a definite or uncertain outcome read from the wire.
- Contact passwords for password-protected recipients, read and stored the
  way Tuta's own apps keep them.
- Import of a MIME message into a folder, as the official desktop importer
  does (Legend and Unlimited plans).
- Push: a stream of folder and mail changes from Tuta's event bus.
- Android and the JVM: a Kotlin library (`org.tunaos.tuta:tuta-sdk-android`)
  with typed data classes, coroutines and fixed-code exceptions over the
  helper protocol, run in process through uniffi.

## Security model

**All cryptography is the Tuta SDK's.** The SDK is Tuta's own Rust library
(`tuta-sdk` from [tutanota](https://github.com/tutao/tutanota)), at the
release and commit [tutabridge](https://github.com/spartanz51/tutabridge)
pins, with tutabridge's patches. This repository adds no cipher, key
derivation or key exchange of its own: it composes the official client's
service requests on top of the SDK, wraps symmetric keys only with the SDK's
own AES functions, and exposes a few SDK internals through six small
patches:

- `01-recipient-key-data.patch` exposes
  `LoggedInSdk::encrypt_bucket_key_for_internal_recipients`, which loads
  each Tuta recipient's current public key and encrypts a mail's bucket key
  for it through the SDK's own `AsymmetricCryptoFacade` (RSA, or TutaCrypt
  with the sender identity key), as the official client's
  `encryptBucketKeyForInternalRecipient` does. It adds no cryptography.
- `02-service-response-session-key.patch` decrypts a service response
  whose type has no owner key of its own (a created folder, an updated
  draft) with the request's session key, as the official client's
  `ServiceExecutor.decryptResponse` does, instead of failing after the
  server already applied the request.
- `03-entity-patch.patch` adds `CryptoEntityClient::patch_instance`, which
  PATCHes a `sys/PatchList` naming only the changed attributes, as the
  official client's `EntityRestClient.update` writes every update. The
  SDK's own whole-instance PUT would encrypt every value again, final ones
  such as a mail's subject included. It adds `PATCH` to the SDK's
  `HttpMethod` for it.
- `04-secure-external-recipient.patch` exposes
  `LoggedInSdk::secure_external_recipient_key_data`, a port of the official
  client's password-protected recipient path (`addRecipientKeyData`,
  `getExternalGroupKeys`, `createExternalUser`): an Argon2id key from the
  password, the external user found or created, the bucket key wrapped for
  it. It refuses a shared-mailbox or external sender, as the official
  client does. `ContactFacade` gains `create_contact` and
  `set_preshared_password`, and `EntityClient::create_instance` reports a
  refused create as an error instead of panicking. It adds no
  cryptography.
- `05-quiet-type-model-fetch.patch` drops the one line the SDK printed to
  stdout (a progress note when the server's type model changes). A library
  has no business on its caller's stdout: in process it lands wherever the
  host uses fd 1, a JVM's `System.out` included.
- `06-cancel-second-factor.patch` adds `Sdk::cancel_second_factor`, the
  official client's cancel of a sign-in waiting for its second factor
  (`LoginFacade.cancelCreateSession`): an unauthenticated
  `SecondFactorAuthService` DELETE naming the pending session, which the
  server then drops. It adds no cryptography.

Secrets stay secrets: passwords, session tokens and wrapped keys are held in
`secrecy`/`zeroize` types with no `Debug` form, never go in argv or the
environment of the helper, and never reach the diagnostics, which redact
addresses, ids, tokens and key bytes. A send never falls back to SMTP and
never quietly drops encryption. Recipient keys are not verified (see
[Delivery](#delivery)); each one's version and fingerprint is reported so a
caller can pin them.

### Sources

The `upstream` submodule is used for source only:

- [tutabridge](https://github.com/spartanz51/tutabridge) at
  `da12fd4a479d6885f6643f05690b78205e2adbec` supplies its `tutabridge-tuta`
  mail extensions (mail details, attachments, the event bus client) and the
  SDK preparation script. Its IMAP/SMTP server is not linked or run.
- The [Tuta SDK](https://github.com/tutao/tutanota) is Tuta release
  `362.261020.0`, commit `f5e2d8628f17be558fe63130396ff625bbe69c77` (the
  `upstream/tuta-repo` submodule), with tutabridge's twelve patches for
  optional encrypted values, address normalization, account KDFs, batched
  entity loads, blobs, interactive sessions, owner keys, AEAD reads and
  bucket keys (series and hashes in `upstream/sdk/EXPECTED`), plus ours in
  `sdk-patches/`.

`prepare.sh` runs tutabridge's `sdk-prepare.py`, which prepares and verifies
the pinned SDK in `upstream/sdk/generated`, then writes a copy with our
patches applied to `prepared/`, beside a copy of `tutabridge-tuta`. That
crate's build script verifies the SDK it builds against, so
`prepared/sdk/EXPECTED` lists both patch series (ours as
`unofficial-<name>`) and the content digest of the patched tree; the build
verifies exactly what it compiles. The library builds only from `prepared/`.

## Layout

| Path | What |
| --- | --- |
| `crates/tuta-unofficial-sdk` | The library. |
| `crates/tuta-unofficial-sdk/examples/read_mail.rs` | A small CLI: list the folders, read the newest mail. |
| `crates/tuta-helper` | The `tuta-helper` binary: the JSON protocol below, a thin front end on the library. Its library target is the protocol itself, which `tuta-ffi` shares. |
| `crates/tuta-ffi` | The protocol in process for Kotlin: uniffi bindings (`libtuta_ffi`), see [Android](#android-and-the-jvm). |
| `crates/tuta-ffi-bindgen` | `uniffi-bindgen` at the revision `tuta-ffi` links, for the Kotlin bindings. |
| `android/` | The Gradle build of `org.tunaos.tuta:tuta-sdk-android`: the AAR, the typed Kotlin layer, and its JVM tests. |
| `sdk-patches/` | Our patches to the Tuta SDK, applied in name order. |
| `prepare.sh` | Prepares the patched SDK in `prepared/` (gitignored). |
| `upstream/` | The tutabridge submodule, with tutanota inside it. |
| `scripts/cargo-sources.sh` | Regenerates `cargo-sources.json` for Flatpak builds. |

## The library

```rust
use secrecy::SecretString;
use tuta_unofficial_sdk::{Client, Page};

async fn demo() -> tuta_unofficial_sdk::Result<()> {
    let client = Client::new()?.client_name("my-app");
    let password = SecretString::from("correct horse".to_string());
    let session = client.login("ada@tuta.com", &password, Some("123456")).await?;
    let saved = session.saved().clone(); // serialize it into a keyring

    for folder in session.folders().await? {
        println!("{} {:?} {}", folder.id, folder.role, folder.label);
    }
    let page = session.sync(None, Page::new(50, 0)?).await?; // the Inbox
    if let Some(newest) = page.messages.first() {
        let message = session.message(&newest.header.id).await?;
        let mime: Vec<u8> = message.to_mime();
        println!("{} bytes", mime.len());
    }
    Ok(())
}
```

The API, all `async` on a tokio runtime:

| Area | API |
| --- | --- |
| Sessions | `Client::new`, `Client::with_url`, `Client::client_name`, `Client::login(email, &SecretString, totp) -> Session`, `Client::sign_in` and `Client::complete_sign_in(PendingSession, totp)` (failing with a `SignInError` that may carry the `PendingSession`), `Client::cancel_sign_in(PendingSession)`, `Session::resume(&client, SavedSession)`, `Session::saved`, `Session::revoke`, `Client::revoke(&SavedSession)` |
| Reading | `Session::folders`, `labels`, `sync(Option<&Id>, Page) -> SyncPage`, `message(&Id) -> Message`, `Message::to_mime() -> Vec<u8>` |
| Search | `search::Search::new(SearchQuery, limit)`, `Session::search(Option<&Id>, &Search, Option<&SearchCursor>) -> SearchPage` (see [Search](#search)) |
| Mail | `mark_read(&[Id], bool)`, `move_mail(&[Id], &Id)`, `delete(&[Id], &Id)`, `empty_folder(&Id)`, `apply_labels(&[Id], &LabelChanges)`; per-id `IdOutcome`/`MoveOutcome` rows |
| Folders, labels | `create_folder(&Name, Option<&Id>)`, `rename_folder(&FolderEdit)`, `delete_folder(&Id) -> FolderDeletion`, `create_label(&Name, &Color)`, `update_label(&Id, &LabelEdit)`, `delete_label(&Id)` |
| Sending | `send(SendRequest) -> SendOutcome`, `send_within(SendRequest, Duration)`; `Thread::new(in_reply_to, references, action)` |
| Drafts | `drafts::save(&Session, &DraftRequest) -> Id`, `drafts::delete(&Session, &Id)` |
| Contacts | `contacts::passwords(&Session, &[String])`, `contacts::store_passwords(&Session, &Passwords)` |
| Import | `ImportMessage::parse(bytes, unread)`, `Session::import(&Id, ImportMessage) -> Option<Id>` |
| Push | `Session::watch() -> Watch`, a `futures_core::Stream<Item = Result<WatchEvent>>`; `Watch::close` |
| Diagnostics | `diagnostics::enable(prefix)`, or `TUTA_SDK_DEBUG=1` |

Inputs that can be checked offline are typed and checked when built: `Id`,
`Page`, `Name`, `Color`, `FolderEdit`, `LabelEdit`, `LabelChanges`,
`Thread`, `ImportMessage`, `DraftRequest::check`, `Search`, `SearchCursor`.
Every failure is an
`Error`, a `#[non_exhaustive]` enum whose `code()` is the fixed snake_case
code listed under [Error codes](#error-codes); `Error::from_code` maps a code
back.

**Sends and time limits.** Dropping a `send` future part-way loses the
outcome of a submit that may already have gone out. To bound a send in time,
use `send_within`, which keeps the [outcome rules](#send-outcomes): an
overrun before the submit left is `Timeout` (nothing was sent), after it the
submit's own status decides.

Nothing in the library writes to stdout (the SDK's one progress line is
patched out, see `05-quiet-type-model-fetch.patch`); diagnostics go to
stderr only when switched on.

### Depending on it

The library depends on crates that `prepare.sh` writes into `prepared/`, so
it is not on crates.io. Three ways in:

- **A git dependency on a vendored tag.** Each release also has a
  `vX.Y.Z-vendored` tag: the same source with `prepared/` committed and the
  submodule left out, so Cargo can build it straight from git, without
  Python or the 500 MB tutanota checkout:

  ```toml
  [dependencies]
  tuta-unofficial-sdk = { git = "https://github.com/tuna-os/tuta-unofficial-sdk", tag = "v0.3.0-vendored" }
  ```

  `scripts/vendor.sh` makes such a tag from a release tag. The plain tags
  and `main` do not build as git dependencies: nothing would run
  `prepare.sh`.
- **A path dependency on a submodule.** Add this repository as a submodule,
  run its `prepare.sh` in your build, and depend on
  `crates/tuta-unofficial-sdk` by path.
- **A separate process.** Build `tuta-helper` and talk to it over the
  [protocol](#the-helper-protocol). This keeps the SDK's large dependency
  tree out of your own build and its crashes out of your process.

For a Flatpak build, list `cargo-sources.json` (see
[Packaging](#packaging)) beside your own crate sources, run `sh prepare.sh`
(or use a vendored tag) before `cargo build --offline --locked`, and install
the binary you need.

## The helper protocol

`tuta-helper` is the library behind a JSON protocol on private stdio: a
caller starts it once per operation, writes one request to its stdin, reads
one reply from its stdout, and waits for it to exit; only `watch`, which
holds Tuta's push channel open, streams one line per change instead. The
helper does not listen on a socket, keep a local cache, or speak any mail
protocol. Decrypted mail goes back as headers, a body and attachments.

Installed or linked under the name `hylki-tuta`, the same binary is the
helper the Hylki mail client looks up, and behaves exactly as Hylki's own
`hylki-tuta` did: sessions are named "Hylki" in the account's session list,
and diagnostics follow `HYLKI_TUTA_DEBUG=1` with the `hylki-tuta:` prefix.
Under any other name sessions are named "tuta-helper" and
`TUTA_HELPER_DEBUG=1` turns diagnostics on. The protocol is the same either
way.

One UTF-8 JSON object goes to the helper on stdin, followed by EOF, and one
JSON object comes back on stdout. Passwords, TOTP codes and session tokens
never go in argv or the environment. The SDK prints progress to stdout, so the
helper parks fd 1 on `/dev/null` while SDK code runs; stdout carries exactly
one line. Requests are capped at 36 MiB (room for a 25 MiB `import` or a
send's attachments in base64) and each operation at 90 seconds; a caller
should allow some more for startup (Hylki allows 100 seconds), then kill and
reap the process. The one exception is `watch`, which streams (see [Watch](#watch)).

Every request carries `version: 1` and an `op`:

| Operation | Parameters | Result |
| --- | --- | --- |
| `login` | `email`, `password`, optional `totp`, optional `pending_session` (see [Two-factor sign-in](#two-factor-sign-in)) | Resumable `session` |
| `cancel_sign_in` | `pending_session` | Empty object; closes the pending session on the server (see [Two-factor sign-in](#two-factor-sign-in)) |
| `sync` | `session`, optional `folder`, `limit`, `offset` | Folder tree, labels, headers (each with its label ids and `message_id`), and the selected folder's full id snapshot when `offset` is zero |
| `message` | `session`, compound `id` | Decrypted body, original headers, recipients and attachments; its header carries `message_id` too |
| `get_mime` | `session`, compound `id` | `mime_base64`: the mail rebuilt as RFC 5322 MIME, standard base64 (see [Raw MIME](#raw-mime)) |
| `search` | `session`, optional `folder`, optional `keyword`, `subject`, `sender`, `recipient`, `after_ms`, `before_ms`, `is_unread` (at least one), `limit` (1 to 100), optional `cursor` | `messages` (`sync` header rows plus their `folder`), `next_cursor` (null when complete) and `scanned` (see [Search](#search)) |
| `mark_read` | `session`, `ids`, `is_read` | Per-id outcomes |
| `move` | `session`, `ids`, compound `destination` | Per-id outcomes with `new_id` and `source` |
| `send` | `session`, `sender`, `sender_name`, `to`, `cc`, `bcc`, `reply_tos`, `subject`, `body_html`, `attachments`, `confidential` (bool), `ordinary_confirmed`, optional `passwords` (`{address: password}`), optional `in_reply_to`, `references`, `action` (see [Replies and forwards](#replies-and-forwards)) | Server ids of the sent mail, recipient counts, the delivery mode, each Tuta recipient's key, `secure_external` and `contacts_saved` (see [Delivery](#delivery)); for a reply or forward, `parent_marked` |
| `revoke` | `session` | Empty object; closes the server-side session |
| `list_labels` | `session` | `labels`: `{id, name, color}` each |
| `create_folder` | `session`, `name`, optional compound `parent` | The new folder's `id` |
| `rename_folder` | `session`, compound `id`, optional `name`, optional `parent` (`""` for the top level); at least one of the two | Empty object |
| `delete_folder` | `session`, compound `id` | `outcome`: `deleted` or `trashed` |
| `create_label` | `session`, `name`, `color` (`#rrggbb`) | The new label's `id` |
| `update_label` | `session`, compound `id`, optional `name`, optional `color`; at least one | Empty object |
| `delete_label` | `session`, compound `id` | Empty object |
| `apply_labels` | `session`, `ids`, `add` and `remove` (label ids) | Per-id outcomes |
| `delete` | `session`, `ids`, compound `folder` (Trash, Spam or a folder inside them) | Per-id outcomes |
| `empty_folder` | `session`, compound `id` of Trash or Spam | `deleted`: how many mails it held |
| `save_draft` | `session`, optional compound `draft_id`, `sender`, `sender_name`, `to`, `cc`, `bcc`, `reply_tos`, `subject`, `body_html`, `confidential`, `attachments`, optional `in_reply_to`, `references`, `action` | The draft's `id` |
| `delete_draft` | `session`, compound `id` | Empty object |
| `contact_passwords` | `session`, `addresses` (at most 100) | `recipients`: `{address, external, password}` per distinct address, in request order (see [Delivery](#delivery)) |
| `store_contact_passwords` | `session`, `passwords` (`{address: password}`, at most 100) | Empty object |
| `import` | `session`, compound `folder`, `mime_base64` (the whole RFC 5322 message, standard base64), optional `unread` (default `false`) | The new mail's `id`, or null when the server had not listed it yet |
| `watch` | `session` | A stream of event lines until stdin closes |

A reply is either `{"version":1,"result":{...}}` or
`{"version":1,"error":{"code":"..."}}`; a sign-in waiting on its second
factor adds `pending_session` to the error. Unknown operations, unknown
fields and other versions are rejected.

### Two-factor sign-in

A `login` for an account with a second factor makes Tuta open a session
that waits for the code. Signing in again would open another one, and Tuta
throttles sign-ins (`rate_limited`), so the waiting session is handed back:

1. `login` without `totp` answers
   `{"error":{"code":"second_factor_required","pending_session":{...}}}`.
   `pending_session` is shaped like a `session` object and is a credential:
   keep it in memory only, never on disk or in a log, and drop it when the
   address or password changes.
2. `login` again with the same `email` and `password`, the `totp` and that
   `pending_session`: the code goes to the waiting session, no new one is
   opened, and the reply is the resumable `session`. A `pending_session`
   for another address is `invalid_request`.
3. A malformed code (`invalid_totp`), a refused one
   (`second_factor_failed`), an outage (`transport_failed`, `timeout`) or
   throttling (`rate_limited`) answers with the `pending_session` again:
   retry with it. `pending_session_expired` (the server let the session go)
   and too many wrong codes (`rate_limited` without `pending_session`) mean
   starting over with step 1.

The second form checks first whether the session still waits for its code,
so a retry after a code that went through but a sign-in that did not finish
completes it without the code being sent twice.

When the user gives up instead (cancels the code prompt, closes setup),
send `cancel_sign_in` with the `pending_session`: Tuta drops the waiting
session, as it does when the official client's code dialog is cancelled,
rather than keeping it until it expires. A session whose code already went
through is revoked instead, and one the server already let go counts as
closed, so it is safe to call whatever state the sign-in reached. It fails
with `transport_failed` (also while a code is being checked at that very
moment), `rate_limited`, `timeout`, `client_outdated`, `session_invalid`
(not a pending session) or `revoke_failed`; drop the `pending_session`
either way.

Per-id outcomes are `{"outcomes":[{"id","code"}]}` in request order, at most
50 ids: `code` is null when applied, the failure's code for the batch that
failed, and `not_attempted` after it. A move row adds `new_id` and `source`
from the server's own report of what it moved: a Tuta mail keeps its id when
it moves, so `new_id` equals `id`, and `source` is the folder it left -- what
the official client moves back to undo. Both are null for a mail the server
did not move (it was already in the destination).

### Error codes

An error carries a fixed code, never SDK or server text:

- Sign-in: `login_failed`, `second_factor_required`, `second_factor_failed`,
  `invalid_totp`, `unsupported_u2f`, `unsupported_webauthn`,
  `unsupported_second_factor`, `resume_failed`, `session_invalid`,
  `session_revoked`, `client_outdated`, `pending_session_expired`.
- Transport: `transport_failed`, `request_failed`, `timeout`, `rate_limited`
  (Tuta is throttling this account or client, HTTP 429, or too many wrong
  second-factor codes: wait a few minutes; any operation can answer it).
- Content: `decryption_failed`, `unsupported_legacy_body`,
  `attachment_failed`, `body_too_large`.
- Requests: `invalid_request`, `unsupported_version`, `invalid_id`,
  `invalid_page`, `invalid_batch`, `invalid_thread` (a malformed Message-ID
  in `in_reply_to` or `references`, more than 100 references, or an `action`
  with no Message-ID).
- Sending: `invalid_recipient`, `sender_unknown`, `recipient_not_found`,
  `password_required` (a confidential send has a recipient outside Tuta
  without a password; no address is named),
  `secure_external_sender_unsupported` (password-protected delivery from a
  shared mailbox or an external user, which the official client refuses
  too), `ordinary_delivery_requires_consent`, `send_failed`, `send_uncertain`.
- Contacts: `contact_save_failed` when `store_contact_passwords` could not
  write a contact, plus `invalid_batch` and `invalid_recipient` for the
  address lists.
- `revoke_failed` when the server would not close a session.
- Folders and labels: `folder_not_found`, `folder_exists` (a sibling has the
  name, ignoring case), `not_custom_folder` (system folders are never
  renamed or deleted), `invalid_parent`, `invalid_name`, `operation_still_active`
  (the server is still working on the folder), `folder_failed`,
  `label_not_found`, `label_exists`, `invalid_color`, `label_failed`,
  `limit_reached` (the plan allows no more).
- Deleting: `not_trash_or_spam`, `delete_failed`.
- Drafts: `draft_not_found`, `not_a_draft` (the id names a received or sent
  mail), `draft_failed`, plus the sending codes for addresses and attachments.
- Importing: `import_invalid` (not a MIME message: no header at all),
  `import_too_large` (over 25 MiB decoded, over 256 MIME parts, or headers
  and body past the 8 MiB the official importer sends per mail),
  `import_refused` (the account's plan is not Legend or Unlimited, which the
  official client requires before it imports, or the server answered
  `import.disabled`), `import_failed`, plus `folder_not_found`.
- `watch_failed` when the event bus cannot be held.

### Folders, labels and drafts

Each operation is the official client's own: the same services, the same
keys, the same rules.

- A folder or label name is encrypted with a fresh session key, which is
  wrapped with the mail group's current key (`MailFolderService`,
  `ManageLabelService`). A rename updates the folder itself; a re-parent goes
  through `MailFolderService`.
- `delete_folder` behaves like the sidebar's delete: a folder inside Trash or
  Spam is deleted for good (with its mail); elsewhere, empty descendants are
  deleted, then the folder too if it and all of them are empty (`deleted`),
  and otherwise it moves under Trash with its mail (`trashed`).
- Labels are mail sets beside the folders. `sync` lists them under `labels`
  rather than `folders`, names each header's labels, and lists a label's mail
  when its id is the selected `folder`. A mail carries at most five labels.
- `delete` deletes mail for good, and only from Trash, Spam or a folder
  inside them, as the server allows; move it to Trash first. `empty_folder`
  asks the server to empty Trash or Spam in one request; it reports how many
  mails the folder listed just before.
- `save_draft` creates a draft in Drafts, or updates the given one wherever
  it is filed (a template folder works). An update replaces the draft's
  recipients, subject, body and its whole attachment set. `delete_draft`
  discards a draft through Trash, never from Sent. Both refuse any id that is
  not a draft, and both treat a draft that is already gone as done.

### Search

Tuta has no server-side search on any plan: mail is end-to-end encrypted, so
the server cannot read a subject, and Tuta's own apps build their search
index on the device from mail they download and decrypt. This SDK keeps no
index, so `search` scans: it walks the folder newest first, decrypts each
mail's header (subject, sender, first recipient, received date, read flag)
and downloads a body only when a criterion needs one.

- Every criterion given must hold, and at least one is required. Text
  criteria (`keyword`, `subject`, `sender`, `recipient`; at most 256
  characters, not blank) are case-insensitive substrings. `keyword` looks
  in the subject, the sender, all recipients and the body's text (HTML
  tags, styles and scripts dropped); `recipient` in To, Cc and Bcc;
  `sender` in the sender's name and address. `after_ms` (inclusive) and
  `before_ms` (exclusive) bound the received date; `is_unread` the read
  state. There are no stars to search for (`is_starred` is
  `invalid_request`).
- A body is fetched only for a mail that passed every header criterion and
  still needs `keyword` or `recipient`, and only when the header alone did
  not already match. Dates cost nothing: a folder's entries are ordered by
  date, so `before_ms` starts the walk there and `after_ms` ends it.
- Without `folder`, every folder is searched in the mailbox's order (labels
  and the IMPORTED set left out, as their mail is in folders); with it, that
  folder or label alone. Each hit names the `folder` it was found in.
- One call stops at `limit` matches, 500 mails examined, 50 bodies fetched
  or 30 seconds, whichever comes first, and answers `next_cursor`. Send the
  same request again with `cursor` set to it to go on; `next_cursor` null
  means the search is complete. A page can hold no match and still have a
  cursor. The cursor is opaque and names a position, not a mail, so mail
  that arrives or leaves meanwhile does not break it; it belongs to its
  `folder`, and one from another folder is `invalid_request`.
- A body that cannot be read (a legacy body, a decryption failure) leaves
  that mail matched on its header alone. `invalid_page` is a `limit` out of
  range, `invalid_request` a query without criteria, a blank or overlong
  text, `after_ms` not before `before_ms`, or a malformed cursor, and
  `folder_not_found` a `folder` that is not one.

A search of a large mailbox is many calls and much traffic: a caller that
searches often should keep its own index from `sync` and `message` and
search that instead, as Tuta's own apps do.

### Raw MIME

Tuta keeps a mail's parts, not the message as it arrived, so `get_mime`
(`Message::to_mime` in the library) rebuilds one: the HTML body, base64,
inside `multipart/related` with the inline images (attachments with a
Content-ID), inside `multipart/mixed` with the other attachments, each level
only when it has parts to hold. Headers are Subject, From, Date, To, Cc,
Reply-To, and from the original header block (mail from outside Tuta)
Message-ID, In-Reply-To, References, List-Unsubscribe and
List-Unsubscribe-Post; mail between Tuta accounts has no header block, so
its Message-ID is the one Tuta keeps for it, and none is made up. Other
original headers (Received, DKIM signatures) are not reproduced, so the
result is a faithful `.eml` of the content, not the bytes the server got.
The output is deterministic; golden files in
`crates/tuta-unofficial-sdk/testdata/mime` pin it. Bcc is not included.

### Import

`import` files one message into a folder the way the official desktop
client imports a mail file (tutanota `src/app-kit/mimimi`), so the mail is
stored end-to-end encrypted like any other and reads the same in Tuta's own
app:

1. The message is converted by a port of the official importer's own code
   (`crates/tuta-unofficial-sdk/src/import/mime.rs`, on the same `mail-parser` 0.10.2): one HTML body
   (plain text converted, of a `multipart/alternative` the last part), every
   other part an attachment, the raw header block kept, the sender, the
   recipients, Message-ID, In-Reply-To and References taken over. Its tests
   are upstream's, including the MIME-tools messages it reads from the
   submodule. Where upstream would panic on hostile input, the port does not.
2. The account's plan is read from its customer info, as the official
   client's import button does: only Legend and Unlimited (TS
   `HighestTierPlans`) may import. Any other plan is `import_refused` before
   anything is written; the server answers such an import with a bare 400.
3. `ImportMailService` GET creates an `ImportFileMailState` for the target
   folder.
4. Each attachment goes to the blob store under a fresh file key; the post
   carries the mail's `ImportMailData`, encrypted with a fresh session key
   wrapped by the mail group key, to the blob server the write token names.
5. The state's imported-mail list is read until it names the mail (eight
   tries, 750 ms apart); its mail set entry gives the mail's id. A post that
   failed without a definite refusal is checked the same way, so a mail the
   server did take is never reported as failed.
6. The state is closed as the official client closes one: `Finished` with
   one successful mail, or `Canceled` with one failed mail when the import
   stopped. The API offers no way to delete a state, so each import leaves
   one behind, as every import in the official client does.

The mail is filed as received and read unless `unread` is true. The target
must be a folder: not a label, the IMPORTED set or the scheduled-mail set.
Unlike the official import dialog, the Inbox is allowed; it leaves the
Inbox out only so a bulk import cannot hold up incoming mail. `sync` leaves
the IMPORTED set out of the folder tree, as the official client does: its
mail is listed in the folders it was imported into.

### Watch

`watch` keeps Tuta's event bus websocket open, as the official client does,
and is the one operation that does not answer with exactly one line. Its
request must be a single line ending in a newline, and stdin must stay open:
the helper stops when stdin reaches EOF and then exits 0 without writing
anything more. Without the newline the request is `invalid_request`. No
operation timeout applies. Every line carries `version: 1`:

- `{"event":"ready"}` once the bus first connects.
- `{"event":"mail_changed","folder":"<id>"}` when mail in that folder arrived,
  left or changed (read state, labels). `folder` is `""` when the folder
  could not be told; resync everything then.
- `{"event":"folders_changed"}` when a folder or label was created, renamed,
  moved or deleted. It comes before the `mail_changed` lines of the same
  batch.
- `{"event":"reconnect"}` after the bus dropped and came back. The server
  replays what was missed, but a caller should resync all the same.
- `{"error":{"code":...}}` when the watch cannot go on (`session_revoked`,
  `client_outdated`, `transport_failed`, `rate_limited`, `watch_failed`); the helper exits
  after it. While the bus reconnects, the session is checked over REST, so
  an expired session ends the watch instead of retrying forever.

Lines name folders only, never a mail's content.

### Delivery

A send goes out in one of two modes, decided from its recipients and
`confidential` before anything is written on the server (no blob, no draft).
A recipient is on Tuta (internal) when its domain is Tuta's or the public-key
service knows the address, and outside Tuta (external) when the service
answers 404. This is the official client's own rule
(`SendMailModel.isConfidential()` is `confidential ||
!containsExternalRecipients()`):

| Recipients | `confidential: true` | `confidential: false` |
| --- | --- | --- |
| All on Tuta | Confidential | Confidential, no consent needed |
| Some or all outside Tuta | Confidential: Tuta recipients by key, the others password-protected; `password_required` unless every one has a password | Ordinary for everyone with `ordinary_confirmed: true`, else `ordinary_delivery_requires_consent` |

- **Confidential** (end-to-end encrypted). A fresh bucket key wraps the
  mail's and attachments' session keys, and the draft is marked
  confidential. Inside the SDK the bucket key is encrypted for each Tuta
  recipient's current public key; a Tuta recipient without a key fails the
  whole send with `recipient_not_found`, never downgraded. Each recipient
  outside Tuta gets the bucket key behind their password: an Argon2id key
  over a fresh salt opens the account's external user for that address,
  which the SDK creates on the first password-protected send to it, and Tuta
  mails the recipient a link to read the message in Tuta's web app. Such a
  send carries the sender's name in the clear for that notification, as the
  official client does. A send whose recipients are all on Tuta with
  TutaCrypt keys also carries its `TutacryptSender` authentication status;
  any password-protected recipient rules that out, as in the official
  client.
- **Ordinary** (encrypted in transit, not end to end) for everyone, only with
  `ordinary_confirmed: true`. Passwords are ignored.

Passwords are trimmed, and addresses match ignoring case. A blank password is
a missing one. A password-protected send from a shared mailbox or by an
external user is `secure_external_sender_unsupported`, as in the official
client.

If a key lookup failed and the mode or a recipient's key depends on it, the
send fails with the lookup's code (`transport_failed` or `send_failed`); an
ordinary send with a recipient outside Tuta goes regardless. The helper
never falls back to SMTP and never quietly drops encryption.

The result carries `confidential` (bool), `recipients`, `secure_external` and
`contacts_saved`. `recipients` lists, for a confidential send, one `{address,
key_version, protocol, fingerprint}` per distinct Tuta recipient, where
`protocol` is `tuta_crypt` or `rsa` and `fingerprint` is the hex SHA-256 over
the public key it was encrypted with (each of RSA, X25519 and Kyber component
as the public-key service serves it, length-prefixed as a big-endian u32);
it is empty for an ordinary send. Key bytes are never reported.
`secure_external` lists the addresses that got the mail password-protected.

After a password-protected send went out, each recipient's password is kept
on their contact's `presharedPassword`, as the official client's
`SendMailModel.updateContacts` keeps it, so Tuta's own apps offer it next
time: a contact holding another password is updated (a PATCH of that field
alone), and an address without a contact gets a new one, named from the
recipient's name or address. `contacts_saved` is false when a write failed;
the mail has gone out either way. The fields are null when a run overran
after the submit.

`contact_passwords` lets a composer fill passwords in: per distinct address,
`external` (true outside Tuta, false on Tuta, null when the lookup failed)
and `password`, the one its contact keeps (null on Tuta or when none is
kept). `store_contact_passwords` keeps passwords on contacts the same way
without sending, for a send that is queued for later; blank ones are skipped,
never cleared. Passwords travel only in requests and replies on the private
pipe: never in diagnostics.

Keys are not verified. The official client only refuses a key that differs
from one the user verified by hand (`KeyVerificationMismatchError`); this
SDK keeps no verified contacts, so the current key from the public-key service is
used, as the official client does for every unverified contact. The
reported version and fingerprint are the hook for pinning keys later (trust
on first use).

Mail sent confidentially to the account's own address is read back by
`message` like any other: the recipient's copy decrypts through the SDK's
bucket-key path.

### Send outcomes

A send reports `send_uncertain` only when its `SendDraftService` request left
the process and no definite answer came back (lost in flight, or a 5xx). The
mail may have gone out and must not be resent. What happened is read from the
wire, not from the SDK's error, which reports a 412, a failed serialization and
an unreadable 200 reply alike. A request that never left, or that the server
refused with a 4xx, is `send_failed` (`session_revoked` for 401 or 440,
`client_outdated` for 474), and its draft is discarded through Trash. An
accepted send whose reply was lost succeeds with null ids; its delivery mode
is still reported.

### Replies and forwards

A `send` or a new `save_draft` takes its place in a conversation the way the
official client's does (`SendMailModel.initAsResponse`,
`MailFacade.createDraft`), from three optional fields:

- `in_reply_to`: the parent's Message-ID, with or without angle brackets.
- `references`: the References chain, whitespace-separated, oldest first.
  Tuta keeps no References of its own, so this only names the parent (its
  newest id) when `in_reply_to` is absent.
- `action`: `"reply"`, `"reply_all"` or `"forward"`. A parent without an
  action is answered as a reply; an action without a parent is
  `invalid_thread`.

Every header (`sync`'s and `message`'s) carries `message_id`: the mail's
own Message-ID as its conversation entry keeps it, without angle brackets,
or null for a draft or when the entry could not be read. Mail between Tuta
accounts has no header block, so this is the only Message-ID it has, and
the one a reply to it names. A `sync` page reads the entries one request
per conversation.

Every id must be printable ASCII without spaces or brackets, at most 998
bytes, and `references` holds at most 100; anything else refuses the whole
request with `invalid_thread` rather than being dropped. The draft is created
with `previousMessageId` set to the parent's bare id and `conversationType`
REPLY (a reply-all too: Tuta has no separate mark for it) or FORWARD, so the
server files it in the parent's conversation. Without the fields it is a new
conversation, as before. A draft's conversation is fixed when it is created;
an update checks the fields and has nowhere to put them.

After a send went out, the mail the server linked it to -- the previous
entry of the new mail's conversation entry, when it carries the given
Message-ID -- has its `replyType` moved on as the official client's
`updatePreviousMail` does: none becomes replied or forwarded, and one
becomes replied-and-forwarded after the other. Only that attribute is
written, encrypted with the parent's session key, as a PATCH. The result's
`parent_marked` says whether the parent ended up marked; it is false when
the account holds no such mail (outside mail never received here, or
deleted) or the write failed, and the send has gone out either way. For mail
the account sent to itself both copies share a Message-ID, and the server
links the sent copy.

## Android and the JVM

`org.tunaos.tuta:tuta-sdk-android` runs the [helper protocol](#the-helper-protocol)
in process: `crates/tuta-ffi` exposes it through
[uniffi](https://github.com/mozilla/uniffi-rs) (at the revision the pinned
Tuta SDK already links) as `libtuta_ffi`, loaded by JNA, and a hand-written
Kotlin layer on top gives it types. Every request goes through the very
code `tuta-helper` runs (`tuta_helper::respond`), so the parsing, the
offline checks, the codes, the limits and the 90-second deadline are the
same, and so are this README's protocol sections.

Why the JSON contract rather than typed uniffi records: the protocol is
already the checked, documented and tested surface, with the hylki-tuta
call order of its checks; mirroring ~25 operations as uniffi records would
make a second contract to keep in step with it. One `request` function keeps
the native surface to four calls, lets a newer library add fields without
breaking an older Kotlin layer (decoding ignores unknown fields and enum
values), and costs a JSON encode per call, which is nothing beside the
network round trip.

### Using it

The AAR holds `libtuta_ffi.so` for `arm64-v8a` and `x86_64`, the generated
bindings and the Kotlin layer; minSdk 24. Each GitHub release carries it two
ways:

- `tuta-sdk-android-<version>-maven.zip`, a Maven repository with the AAR and
  its POM, so Gradle resolves its dependencies (JNA, kotlinx-coroutines,
  kotlinx-serialization). This is the one to use. Unzip it into the
  consuming project, say as `third_party/maven/`, and add:

  ```kotlin
  // settings.gradle.kts
  dependencyResolutionManagement {
      repositories {
          maven { url = uri("third_party/maven") }
      }
  }
  // the module's build.gradle.kts
  dependencies {
      implementation("org.tunaos.tuta:tuta-sdk-android:0.3.0")
  }
  ```

- `tuta-sdk-android-<version>.aar` alone, for `files(...)`; its
  dependencies (`net.java.dev.jna:jna:5.19.1@aar`,
  `kotlinx-coroutines-core`, `kotlinx-serialization-json`) are then yours to
  declare.

Neither needs credentials, unlike GitHub Packages, and both work in an
offline or F-Droid build. The consumer rules keep JNA's and the bindings'
classes from R8.

```kotlin
val tuta = TutaClient(clientName = "Tuna Mail") // the name Tuta lists sessions under
val session = tuta.login(email, password, totp) // TutaSession; persist session.json encrypted
val page = tuta.sync(session, limit = 50)        // folders, labels, the Inbox's newest 50
val message = tuta.message(session, page.messages.first().header.id)
tuta.watch(session).collect { event -> /* Ready, MailChanged(folder), ... */ }
```

| Kotlin | Protocol |
| --- | --- |
| `TutaClient(clientName)`, `close()` | one native client; calls may overlap |
| `login(email, password, totp, pending)`, `cancelSignIn(pending)`, `revoke`, `TutaSession.fromJson`/`.json` | `login` (`TutaException.pendingSession` is the `pending_session`), `cancel_sign_in`, `revoke`, the `session` object |
| `sync`, `message`, `getMime` (bytes), `listLabels` | `sync`, `message`, `get_mime`, `list_labels` |
| `search(session, SearchQuery, folder, limit, cursor): SearchPage` | `search` |
| `markRead`, `move`, `applyLabels`, `delete`, `emptyFolder` | the same, per-id `IdOutcome`/`MoveOutcome` |
| `createFolder`, `renameFolder`, `deleteFolder`, `createLabel`, `updateLabel`, `deleteLabel` | the same |
| `send(SendRequest)`, `saveDraft(DraftRequest)`, `deleteDraft` | `send`, `save_draft`, `delete_draft` |
| `contactPasswords`, `storeContactPasswords`, `import` | the same |
| `watch(session): Flow<TutaWatchEvent>` | `watch`; cancelling the flow stops it |
| `rawRequest(json): String` | any request object, answered verbatim |

A failure is a `TutaException`, a sealed class by family (`Session`,
`Transport`, `Content`, `InvalidRequest`, `Send`, `Contacts`, `Folders`,
`Delete`, `Drafts`, `Import`, `Watch`, and `Unknown` for a code this build
does not know) whose `code` is a `TutaErrorCode`, one entry per
[error code](#error-codes); its message is the code, never server text.
Calls are main-safe suspend functions. Cancelling one abandons its result,
not the operation, which runs to its end so a send is never cut off
half-way.

**Secrets.** The Rust side zeroes each request's bytes and each reply's
JSON tree once used, keeps sessions and passwords in `secrecy` types as
before, and neither prints nor logs. What crosses into the JVM (the reply
string, `TutaSession.json`) cannot be zeroed there: keep sessions in
encrypted storage and out of logs; `TutaSession`, `ContactPassword` and the
request classes redact themselves in `toString`. On Android the library
points rustls at the system CA store (`/apex/com.android.conscrypt/cacerts`,
else `/system/etc/security/cacerts`) through `SSL_CERT_DIR` unless the
process set `SSL_CERT_FILE` or `SSL_CERT_DIR` itself; user-installed CAs are
not trusted.

### Building it

`android/` is a Gradle build (Gradle 9.7, AGP 9.5, Kotlin 2.4, JDK 21, the
versions of the Tuna Mail fork that consumes it) that drives cargo itself:

```sh
sh prepare.sh
cd android
./gradlew :tuta-sdk-jvm:test        # JDK + cargo: the bindings against a host libtuta_ffi
./gradlew :tuta-sdk-android:dist    # + Android SDK (platform 37, NDK 28.2.13676358), cargo-ndk 4,
                                    #   rustup targets aarch64-linux-android, x86_64-linux-android
```

`dist` runs `cargo ndk -t arm64-v8a -t x86_64 -P 24 build --profile android
-p tuta-ffi`, keeps `libtuta_ffi.so` of what it copies (the Tuta SDK's own
cdylibs come along), generates the bindings from it with `tuta-ffi-bindgen`
(which reads uniffi's metadata symbols, so AGP strips the library only
when packaging), and writes the AAR and the zipped Maven repository to
`android/tuta-sdk-android/build/dist/`. Without an Android SDK the
`:tuta-sdk-android` module is left out, so the JVM tests run on a host with
only a JDK and Rust. The [Tuna Mail build image](https://github.com/tuna-os/tuna-mail/tree/main/tools/build-env)
has every tool `dist` needs.

The JVM tests (`android/tuta-sdk-jvm`) compile the same Kotlin sources for
the host and check them against the real native parser, offline: the error
code list against the library's, every operation's field names (each test
request fails a check the Rust side runs before any I/O), error families,
transport failures against a closed local port, watches that fail and that
are cancelled, and lenient decoding.

### Library size

`libtuta_ffi` links the whole Tuta SDK, and a cdylib exports every
`#[no_mangle]` symbol of every crate in it: the SDK's own uniffi bindings,
some 700 functions and metadata statics nothing here calls, kept most of the
SDK alive past the linker's section GC. Two things shrink it:

- `crates/tuta-ffi/build.rs` links with `-Wl,--exclude-libs,ALL` (Android
  and Linux), which makes the symbols of the dependencies' archives local so
  the GC can drop what `tuta-ffi` does not reach. Its own uniffi functions
  and metadata stay exported, so the generated bindings are unchanged.
- The `android` profile in `Cargo.toml`: `opt-level = "z"` and one codegen
  unit, with the cryptography crates (Argon2, AES, SHA, the curves,
  ML-KEM, RSA, ring) kept at `opt-level = 3`, since Argon2 runs on every
  sign-in.

Measured on arm64-v8a, each step on top of the one before; "stripped" is
what AGP packages (`llvm-strip --strip-unneeded`), "gzip -9" a stand-in for
its compressed size in the AAR and the APK:

| Build | Unstripped | Stripped | gzip -9 | Exported symbols |
| --- | ---: | ---: | ---: | ---: |
| `--release` (0.2.1) | 24.4 MB | 17.96 MB | 5.81 MB | 811 |
| + `--exclude-libs,ALL` | 15.5 MB | 10.77 MB | 4.27 MB | 92 |
| + `opt-level = "z"` everywhere | 18.7 MB | 9.23 MB | 3.95 MB | 92 |
| + `"z"` but cryptography at 3 | 18.5 MB | 9.29 MB | 4.00 MB | 92 |
| + `codegen-units = 1` (the `android` profile) | 14.6 MB | **7.59 MB** | **3.35 MB** | 92 |
| + `lto = "fat"` | 14.6 MB | 7.58 MB | 3.34 MB | 92 |
| (`--exclude-libs` + fat LTO, one unit, `opt-level = 3`) | 10.9 MB | 8.15 MB | 3.49 MB | 92 |

Fat LTO saves nothing measurable on top of the profile and costs build
time, so it is off. Stripping here instead of in AGP would save nothing more
and lose the metadata the bindings are generated from. Altogether the AAR
went from 12.3 MB (0.2.1) to 7.1 MB (0.3.0), with `libtuta_ffi` at 7.6 MB
(arm64-v8a) and 9.0 MB (x86_64) stripped, 3.4 MB each compressed.

## Building and testing

With a current stable Rust toolchain (CI builds with the latest stable; the
locked dependencies need 1.88 or newer), a C compiler, Python 3 and git,
plus [cargo-deny](https://github.com/EmbarkStudios/cargo-deny)
(`cargo install --locked cargo-deny`) for the last command:

```sh
git clone --recursive https://github.com/tuna-os/tuta-unofficial-sdk
cd tuta-unofficial-sdk
sh prepare.sh
cargo build --locked
cargo test --locked
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo fmt -p tuta-unofficial-sdk -p tuta-helper -p tuta-ffi -p tuta-ffi-bindgen --check
cargo deny check
```

`git submodule update --init --recursive` fetches the submodules of an
existing clone. `prepare.sh` is a quick no-op when `prepared/` is current;
run it again after updating the submodule or `sdk-patches/`.

The example signs in, lists the folders, reads the newest Inbox mail and
closes its session again:

```sh
TUTA_EMAIL=ada@tuta.com cargo run --example read_mail   # password on stdin
```

### Live tests

The unit tests never touch the network. Three live tests, ignored by default
and gated on `TUTA_LIVE=1`, run against Tuta's servers with a test account's
`TUTA_LIVE_EMAIL`, `TUTA_LIVE_PASSWORD` and, when it has a second factor,
`TUTA_LIVE_TOTP`:

```sh
TUTA_LIVE=1 TUTA_LIVE_EMAIL=... TUTA_LIVE_PASSWORD=... TUTA_LIVE_TOTP=... \
    cargo test -p tuta-unofficial-sdk --test live -- --ignored
TUTA_LIVE=1 ... cargo test -p tuta-helper --test live -- --ignored
# android/tuta-sdk-jvm/.../LiveTest.kt: remove its @Ignore locally, then
cd android && TUTA_LIVE=1 ... ./gradlew --no-daemon --no-configuration-cache \
    :tuta-sdk-jvm:test --tests '*LiveTest*'
```

The library's signs in once, lists folders and labels, resumes the saved
session, saves, updates and discards a draft, watches the event bus, sends
one confidential mail with an attachment to the account itself, reads the
received copy back (body, attachment, MIME), marks it read, and deletes both
copies for good before closing its session. The helper's signs in once
through the binary, syncs, reads the newest mail through the `hylki-tuta`
name and lists labels, then revokes the session; it sends nothing. The
Kotlin one signs in once through `TutaClient`, restores the session from its
JSON, syncs the Inbox, reads the newest mail, lists labels, waits for the
watch's `Ready`, then revokes the session and sees it refused; it sends
nothing. A TOTP code is good for one sign-in: take a fresh one for each.

## Packaging

The Flatpak build has no network, so `cargo-sources.json` lists every crate
from `Cargo.lock` for flatpak-builder. Regenerate it after any `Cargo.lock`
change, or the offline build fails:

```sh
scripts/cargo-sources.sh   # needs curl and uv
```

It runs flatpak-builder-tools' `flatpak-cargo-generator.py` at a pinned
commit, checked against its SHA-256. CI fails when the committed file is
stale.

The binary is built as `tuta-helper`. A package that replaces Hylki's
helper installs it (or a symlink to it) as `hylki-tuta`, for example
`install -Dm755 target/release/tuta-helper /app/bin/tuta-helper` and
`ln -s tuta-helper /app/bin/hylki-tuta`.

The Android library is built by `android/` (see
[Building it](#building-it)); for a tag `vX.Y.Z`, CI builds it, runs the
JVM tests and attaches `tuta-sdk-android-X.Y.Z.aar` and
`tuta-sdk-android-X.Y.Z-maven.zip` to the GitHub release. The version is the
Cargo workspace's, read by the Gradle build.

## Patches policy

- A patch to the SDK exposes what the official client already does, with a
  pointer to the TypeScript it ports; it adds no cryptography, and it is
  as small as the job allows. Behaviour that can live in this repository's
  own code lives there instead.
- Patches apply in name order (`NN-topic.patch`) to the SDK prepared by
  tutabridge, and `prepare.sh` refuses one that does not apply cleanly.
- Each patch's description stays current in the
  [Security model](#security-model) list.
- When tutabridge moves its SDK pin, every patch is reviewed against the new
  `upstream/sdk/EXPECTED` and rebased or dropped; a patch Tuta merges
  upstream is dropped.

## Debugging

With `TUTA_SDK_DEBUG=1` (or `TUTA_HELPER_DEBUG=1` for the helper,
`HYLKI_TUTA_DEBUG=1` under the `hylki-tuta` name) in the environment, the
library writes diagnostics to stderr, each line prefixed with the program's
name: every HTTP request as method, service path and status (no host, query,
body or ids), and the Debug form of every SDK error with the stage it broke
in (sign-in, recipient resolution, recipient keys, secure external keys,
blob upload, draft create, draft load, attachment keys, send draft, draft
cleanup, the parent's reply mark, contact load, contact create, contact
password, folder and label services, deletes, the event bus). Addresses,
ids, tokens and key bytes are redacted, and no message content or password
is printed. A caller that discards the helper's stderr sees none of it, so
run the helper by hand to see it.

## Known limits

- Two-factor sign-in supports TOTP only; U2F and WebAuthn keys are not
  supported.
- Search is a bounded scan, not an index (see [Search](#search)): finding
  everything in a large mailbox takes many calls.
- Recipient keys are not verified (see Delivery).
- Password-protected delivery is the official client's, with three
  differences. The notification to the recipient is always in English (the
  official composer lets the sender choose its language). A contact that
  another Tuta app stored with AEAD encryption cannot be written, so its
  password is not updated (`contacts_saved` false). And a new contact is
  created only for a password-protected recipient, never for other
  recipients, which the official client also stores unless the account
  turned automatic contacts off.
- The first password-protected send to an address creates an external user
  for it on the server, and this SDK offers no way to remove one. A later
  send to that address uses it again.
- Password-protected delivery is refused from a shared mailbox and for an
  external (secure-mail) user, as in the official client.
- Stars are not stored on the server.
- Importing (`import`) needs a Legend or Unlimited plan, as in Tuta's own
  app; on any other plan it is refused before anything is written.
- `watch` reports which folders changed, not what changed in them; the caller
  syncs those folders. Missed batches are replayed only while one `watch`
  runs: a new `watch` starts from the present.
- Sessions are not refreshed. Each helper operation resumes the stored
  session, and a revoked or expired one means signing in again.
- On Android the pinned SDK sends its own `log` calls to logcat under the
  `TutaSDK` tag: startup, key-cache and error notes from Tuta's code (an
  error's Debug form among them), which this repository does not control.
  This repository's own code logs nothing.

## License

GPL-3.0-or-later (see `LICENSE`), as the Tuta SDK and tutabridge are. The
helper runs as a separate program from its caller. The Android library does
not: `libtuta_ffi` runs inside the app, so an app that ships
`tuta-sdk-android` is a combined work under GPL-3.0-or-later (Apache-2.0
code such as Thunderbird for Android's may be combined into it).
