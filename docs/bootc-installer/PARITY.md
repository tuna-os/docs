---
sidebar_position: 6
title: "PARITY"
---

The GNOME frontend is the reference: it is the one that shipped and has
end-to-end tests. This page records what each of the other four renders
of the same contract. Each gap then shows as a line here, not as a surprise on an
ISO. `docs/DESIGN-AUDIT.md` covers how each looks against its desktop;
this page covers what each does.

## Branding copy keys

Every key in `shared/branding/copy-defaults.json` is a line a product may
rebrand. A frontend "renders" a key when the line appears where the table
says. "Hidden" means the frontend shows nothing for an empty value. "No"
means the frontend shows its own hardcoded text, so a product cannot
rebrand that line.

`tests/unit/test_copy_coverage.py` enforces the "no" cells. It scans each
frontend for every key and compares what it finds against its own
`KNOWN_GAPS` table. An unlisted gap fails the test. So does a listed gap
that the frontend has since closed. Before that check, four cells here
claimed a render that nobody had wired up.

| Key | GNOME | KDE | COSMIC | Niri | XFCE |
|---|---|---|---|---|---|
| `welcome_title` | page header | heading | title1 | heading | page title |
| `welcome_subtitle` | header subtitle, hidden | label, hidden | body, hidden | label, hidden | label, hidden |
| `welcome_install` | install row title | no (own body text) | no (no install row) | live-system row | live-system radio |
| `welcome_install_subtitle` | install row subtitle | no | no | live-system row subtitle | live-system radio subtitle |
| `welcome_button` | no (row activates, own label) | Next button on welcome | forward button | button | Next button on welcome |
| `requirements_title` | gate window text (blocks) | welcome inline message | welcome warning row | gate dialog (blocks) | welcome warning row |
| `requirements_ram` | RAM gate window text | welcome inline message line | welcome warning row line | welcome warning line | welcome warning row line |
| `requirements_cpu` | CPU gate window text | welcome inline message line | welcome warning row line | welcome warning line | welcome warning row line |
| `requirements_uefi` | UEFI gate window text | welcome inline message line | welcome warning row line | welcome warning line | welcome warning row line |
| `encryption_none_label` | confirm summary row | radio row, confirm row | dropdown entry, confirm row | list row, confirm row | radio, confirm summary |
| `encryption_none_description` | no (an on/off switch, no row for this choice) | radio row description | dropdown description | list row subtitle | caption under the radio |
| `encryption_luks_passphrase_label` | confirm summary row | radio row, confirm row | dropdown entry, confirm row | list row, confirm row | radio, confirm summary |
| `encryption_luks_passphrase_description` | subtitle of the encrypt switch | radio row description | dropdown description | list row subtitle | caption under the radio |
| `encryption_tpm2_luks_label` | confirm summary row | radio row, confirm row | dropdown entry, confirm row | list row, confirm row | radio, confirm summary |
| `encryption_tpm2_luks_description` | no (the page cannot select this type) | radio row description | dropdown description | list row subtitle | caption under the radio |
| `encryption_tpm2_luks_passphrase_label` | confirm summary row | radio row, confirm row | dropdown entry, confirm row | list row, confirm row | radio, confirm summary |
| `encryption_tpm2_luks_passphrase_description` | subtitle of the TPM switch | radio row description | dropdown description | list row subtitle | caption under the radio |
| `filesystem_zfs_label` | filesystem picker entry, confirm row | no (offers no ZFS) | dropdown entry, confirm row | list row, confirm row | combo entry, confirm summary |
| `confirm_title` | page header | step heading | page title | heading | page title |
| `confirm_subtitle` | header subtitle | italic label, hidden | page subtitle | label, hidden | label, hidden |
| `confirm_body` | dim label, hidden | label, hidden | body, hidden | label, hidden | label, hidden |
| `confirm_warning` | summary warning row (own group above the summary, `{disk}` filled) | inline message | warning card | warning line | warning row naming the selected disk |
| `confirm_warning_removable` | summary warning row (replaces `confirm_warning` when the target disk is removable, `{disk}` filled) | inline message (replaces `confirm_warning`) | warning card (replaces `confirm_warning`) | warning line (replaces `confirm_warning`) | warning row (replaces `confirm_warning`) |
| `confirm_button` | pill button | Next button | forward button | button | Next button |
| `confirm_plan_*` | confirm page, install plan group (`fisherman plan --json -`): the target disk with model, size and serial, whether the install is bound to it, each device erased | confirm step, install plan card, the same lines (`src/plan.cpp`) | confirm page, install plan section: the target disk with model, size and serial, whether the install is bound to it, each device erased | confirm page, install plan card, the same lines (`ui/plan.js`) | install plan lines under the summary (`fisherman plan --json -`): the target disk with model, size and serial, whether the install is bound to it, each device erased |
| `confirm_quotes` | random line per language | no | no | no | no |
| `progress_title` | image-writing step label (centred title) | label | page title | heading | page title |
| `progress_note` | dim caption under the bar | label | warning caption | caption | dim label under the bar |
| `progress_reuse_*` | caption under the step line, while fisherman copies this computer's system and after it | label under the step line | caption under the step line | small line under the step line | dim label under the bar |
| `progress_reuse_cancel` | body of the cancel question during the copy | subtitle of the cancel dialog during the copy | body of the cancel question during the copy | body of the cancel card during the copy | body of the cancel dialog during the copy |
| `step_prepare_disk` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_partition` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_format_efi` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_luks` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_format_root` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_mount` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_format_var` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_install_os` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_tpm2_enroll` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_flatpaks` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_configure` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `step_finalize` | step label on the progress page | "Step N of M" caption | "Step N of M" caption | "Step N of M" caption | step label under the title |
| `recovery_key_title` | page heading | heading | heading | heading | heading |
| `recovery_key_body` | label | label | body | label | label |
| `recovery_key_copy` | copy button tooltip | copy button | copy button | copy button | copy button |
| `recovery_key_ack` | checkbox | checkbox | checkbox | checkbox | checkbox |
| `done_title` | page header | heading | title2 | heading | headline |
| `done_subtitle` | header subtitle (+ elapsed time) | label | body | label | label |
| `done_restart` | Reboot Now button | Restart button | suggested button | button | suggested button beside Close |
| `done_failed_title` | page header | heading | title2 | heading | headline |
| `done_cancelled_title` | page header, after fisherman exit code 130, or a signal after a confirmed Cancel | heading | title2, after fisherman exit code 130, or a signal after a confirmed Cancel | heading, after fisherman exit code 130, or a signal after a confirmed Cancel | headline, after fisherman exit code 130, or a signal after a confirmed Cancel |
| `done_failed_disk_*` | header subtitle, under the reason: whether fisherman's `error` event says that the disk changed | label on the done page, after a failure | body on the done page, after a failure | line on the done page, after a failure | done page body, above the log, after a failure |
| `done_failed_cleanup_*` | header subtitle, under the reason: a cleanup that failed or timed out | label on the done page, after a failure | body on the done page, after a failure | line on the done page, after a failure | done page body, above the log, after a failure |
| `done_verification` | line under the done header, after an install | line on the done page, after an install | line on the done page, after an install | line on the done page, after an install | done page body, after an install |
| `done_receipt_*` | under `done_verification`: what the `receipt` event says, with the install ID | under `done_verification` | under `done_verification` | under `done_verification` | under `done_verification` |
| `source_install_from` | confirm page, Selected image group | confirm step, Selected image card | confirm page, Selected image section | confirm page, Selected image card | confirm page, under the summary |
| `source_update_ref` | confirm page, Selected image group | confirm step, Selected image card | confirm page, Selected image section | confirm page, Selected image card | confirm page, under the summary |
| `source_live_host` | confirm page, Selected image group | confirm step, Selected image card | confirm page, Selected image section | confirm page, Selected image card | confirm page, under the summary |
| `source_check_*` | confirm page, Selected image group: state, reason, image defaults | confirm step, Selected image card | confirm page, Selected image section | confirm page, Selected image card | confirm page, under the summary |
| `bootc_store_listed` | confirm page, Selected image group, when this computer's bootc storage has images | confirm step, Selected image card | confirm page, Selected image section | confirm page, Selected image card | confirm page, under the summary |
| `bootc_store_kind_*` | each image of this computer's bootc storage | each image of this computer's bootc storage | each image of this computer's bootc storage | each image of this computer's bootc storage | each image of this computer's bootc storage |
| `source_reuse_*` | confirm page, Install source group (download, or this computer's system); the Image row and the Selected image group name the source | confirm step, Install source card; Image row | confirm page, Install source section; Image row | confirm page, Install source card; Image row | confirm page, install source choice; Image row |
| `validate_*` | error line under the hostname (disk and confirm pages) and the username; under the install source choice | inline message on the encryption step (passphrase) and the confirm step (hostname); under the install source choice | hostname row description; encryption row description; under the install source choice | line under the hostname (confirm) and under the passphrase; under the install source choice | line under the hostname, the username and the encryption choice; under the install source choice |
| `store_label` | done page link to `store_url` (+ QR from `assets.store_qr`, US locale) | done page link | done page link | done page link | done page link |
| `logo` | product icon (GNOME file adapter tracked separately) | theme/file on welcome and successful done, after the asset; else `system-software-install` / `checkmark` | theme/file on welcome and successful done, after the asset; else `computer-symbolic` in an accent disc / the check | theme/file on welcome and successful done | theme/file/resource on welcome and successful done |
| `assets.welcome_image`, `assets.complete_image` | tour pages | welcome / successful done artwork, before `logo` | welcome / successful done artwork, before `logo` | welcome logo disc (`logo`) | no |

The eight `encryption_*` keys name the four types of encryption in the
recipe. The order of the types is the `encryption.type` enum in
`shared/recipe/fisherman-recipe.schema.json`. All five frontends use the same
words on the encryption page and on the confirm page.
`tests/unit/test_encryption_choices.py` makes sure that each frontend offers
those types in that order.

The confirm pages used to disagree. KDE showed "None" and "Passphrase
(LUKS)". GNOME showed its own phrases. COSMIC, Niri and Xfce showed the
recipe id, for example `luks-passphrase`. GNOME has a switch and a TPM
switch, not a list. Thus it shows only the two descriptions that its
switches can select.

The twelve `step_*` keys label the install step that runs. fisherman puts a
stable `step_id` on each step event, and each frontend reads the key
`step_<step_id>`. An event without a `step_id`, or an id with no copy line,
shows fisherman's `step_name`.

Before this, Niri showed the raw step name.
GNOME, Xfce, KDE and COSMIC each had their own table of the same words, so a
product could not change them. Those tables stay only as the fallback for a
fisherman without `step_id`. All five also draw the bar from fisherman's
`overall_pct` (`shared/progress/README.md`). Thus the bar now moves during
the Flatpak copy, where the old calculation in each frontend stopped.
XFCE hides its step label when it repeats the page title, which is the case
for `step_install_os` with the default copy.

The `validate_*` keys word fisherman's problems. Each frontend sends its
fields to `fisherman validate --json --partial -` while the user types and
shows each problem through the key `validate_<code>`
(`shared/recipe/README.md`). The codes are fisherman's
(`fisherman/docs/VALIDATE.md`), so the table has one row for the family. A
code with no copy line shows fisherman's own message. Before this, only
XFCE checked the hostname, and a username such as `root` failed after the
OS was on disk.

Outside the contract, under `extensions.gnome`: the tour page text, the
install video and the credits file. They are the last GNOME-only features.
The plan is to port the tour artwork (welcome and complete images) to the
other four. Video and credits then leave the contract; nothing else gets
them.

All five render the identity keys (`name`, `id`, `default_hostname`, URLs);
see `shared/branding/README.md`. Off live media, all five select the leaf
of `default_image` at the start (`shared/catalog/README.md`).

## Features

| Feature | GNOME | KDE | COSMIC | Niri | XFCE |
|---|---|---|---|---|---|
| Image catalog choice (fisherman `images.json`) | yes (tree, search) | yes (disk step, breadcrumb rows, search) | yes (search, breadcrumb rows, a custom image row) | yes (flat list, product and channel in each row, search) | yes (flat list, product and channel in each row, search) |
| Image selected at start, off live media | branding `default_image`, then catalog `default_image`, each only if the catalog has it; else you must pick | branding `default_image`, then the catalog's; else you must pick | branding default_image, then the catalog's, else none: you must pick | branding `default_image`, then catalog `default_image`; else you must pick | branding `default_image`, then catalog `default_image`; else you must pick |
| Catalog fields that reach the recipe | all | all of the contract (shared/catalog) | all contract fields (shared fixture test) | all | all |
| Live-ISO install without download (live media from `fisherman probe --json`) | yes | yes | yes | yes | yes |
| Offline image stores (found by fisherman on the host) | yes | yes | yes | yes | yes |
| Recipe on fisherman's stdin, no recipe file | yes | yes | yes | yes | yes |
| fisherman staged from the Flatpak, with a SHA256 check | yes | yes (probe, validate and install) | yes (staged, SHA256 checked on the host) | yes | yes |
| Fields checked by `fisherman validate --json --partial` | hostname, username | hostname, username, passphrase, filesystem with composefs | hostname, passphrase, username | hostname, username, passphrase, filesystem | hostname, username, passphrase, filesystem |
| Disk choice with erase warning | yes | yes | yes | yes | yes |
| Disk list from `fisherman probe --json` (`shared/probe/`) | yes | yes | yes | yes | yes |
| Disk row: model (path when unknown), path, size label, bus | yes | yes | yes | yes | yes |
| Disk probe failure shown on the disk page | yes | yes | yes | yes | yes |
| RAM / CPU / UEFI check (fisherman's `system.unmet`) | blocks (gate window) | holds Next; override for RAM and CPU | blocks (requirements page) | blocks (gate dialog) | blocks (gate window) |
| Connectivity check | blocks (connection-check step, skipped when this computer can copy its own system); probes the image's registry first; Network settings button (the host's own tool); no Wi-Fi page: the live session's own network menu joins a network | blocks on welcome and confirm, not for a copy of this computer's system; image registry first; Network settings action | blocks (network page, skipped when this computer can copy its own system; registry of the image first; Network settings button) | blocks on source and confirm when the image needs a download, not for a copy of this computer's system; probes the image's registry first; Network settings button | blocks on confirm, not for a copy of this computer's system; probes the image's registry first; Network settings button |
| Filesystem choice | yes (list from the image) | yes (the choices of the image) | the image's list, else xfs, ext4 or btrfs | yes (Advanced, list from the image) | yes (Advanced, list from the image) |
| Encryption: none / passphrase | yes | yes | yes | yes | yes |
| Passphrase typed twice, Next held on a mismatch | yes | yes | yes | yes | yes |
| Encryption: TPM / TPM + passphrase | yes | yes | yes | yes | yes |
| Recovery key shown after a `tpm2-luks` install | yes | yes | yes | yes | yes |
| Hostname | generated, editable on confirm | no (branding default, shown on confirm) | field | field on confirm, first value from the image | field, first value from the image |
| User account, when the image needs one | yes | yes | yes | yes | yes |
| Default when the catalog does not set `needs_user_creation` (#288) | account | account | account | account | account |
| Account password | twice, reveal, strength | twice, reveal, strength | twice, reveal | twice, reveal | twice, reveal |
| Account groups | wheel, sudo and developer groups (`shared/account/`), operator override | shared list, operator override | shared list, operator override | wheel, sudo and developer groups, operator override | wheel, sudo and developer groups, operator override |
| Phone companion (QR) | yes (TLS on the LAN address only); shows when the image needs an account, and fills the account page | no | no (removed, #293) | no | no |
| Keyboard / language / timezone (#292) | language, keyboard (XKB layout and variant) and time zone (IANA) steps in the bundled recipe; listed on confirm; checked by fisherman validate | pickers on welcome; listed on confirm; checked by fisherman validate | language, keyboard (XKB layout) and time zone pages; a pick changes the live session and the recipe; listed on confirm; checked by fisherman validate | Session step: a change applies to the live session and goes into the recipe; XKB layouts; listed on confirm; checked by fisherman validate | language, keyboard (XKB layout) and time zone pickers on the identity page; each starts at "keep"; listed on confirm; checked by fisherman validate |
| Keyboard / language / timezone in the installed system | yes, for a selected value: `locale`, `keyboard.layout` and `keyboard.variant`, `timezone` | yes: `locale`, `keyboard.layout`, `timezone` in the recipe | yes, after a pick: `locale`, `keyboard.layout`, `timezone` | yes, after a change: `locale`, `keyboard.layout`, `timezone` | yes, after a pick: `locale`, `keyboard.layout`, `timezone` |
| Cancel a running install (#299) | Cancel button, window close and Ctrl+Q: each asks first; a cancelled page follows | Cancel button, asks first; cancelled page | Cancel button, asks first; cancelled page | Cancel button and window close: each asks first; a cancelled page follows | Cancel button and window close: each asks first; a cancelled page follows |
| `--autoinstall` | yes (the recipe is validated first) | no | no | no | yes (the recipe is validated first) |
| Translatable UI | gettext, one domain (`bootc-installer`); branding copy stays in one language (#311) | strings marked (qsTr, tr); template `i18n/tuna-installer-kde.ts`; CMake compiles `i18n/tuna-installer-kde_fr.ts` to a `.qm` that loads for the locale; catalogs kept current by a check (#300) | one tr() shim and a lint; template `i18n/template.json`; ships `i18n/fr.json`, loaded for the locale; catalogs kept current by a check (#300) | strings marked with qsTr; template `i18n/tuna-installer-niri.ts`; ships `i18n/tuna-installer-niri_fr.ts` as a `.qm`, loaded for the locale by `translations/` (a QML module); catalogs kept current by a check (#300) | gettext, one domain (`tuna-installer-xfce`), lint test; template `po/tuna-installer-xfce.pot`; the Flatpak compiles `po/fr.po` to a `.mo`, loaded for the locale; catalogs kept current by a check; branding copy stays in one language (#311) |
| Progress bar from fisherman's protocol | yes | yes | yes | yes | yes |
| Check of the selected image (`capabilities` of `fisherman probe --json`, #266) | confirm page, Selected image group; a blocked source holds Install | confirm step, Selected image card; a blocked source holds Install | confirm page, Selected image section; a blocked source holds Install | confirm page, Selected image card; a blocked source holds Install | confirm page, under the summary; a blocked source holds Next |
| Install plan on the confirm page (`fisherman plan --json -`: target disk identity, what is erased), install bound to that disk (`diskIdentity`, tuna-os/fisherman#371) | yes: the target disk (model, size, serial; unknown when the disk does not report it) and each device erased, in its own group; Install binds the recipe to that disk with `diskIdentity`, and to the plan with `planBinding` when fisherman reports `plan.binding`; without a plan (an older fisherman) the page is as before | yes: the target disk (model, size, serial; unknown when the disk does not report it) and each device erased, on a card of the confirm step; Install binds the recipe to that disk with `diskIdentity`, and to the plan with `planBinding` when fisherman reports `plan.binding`; without a plan (an older fisherman) the step is as before | yes: a section of the confirm page shows the target disk (model, size, serial; unknown when the disk does not report it) and each device erased; Install binds the recipe to that disk with `diskIdentity`, and to the plan with `planBinding` when fisherman reports `plan.binding`; without a plan (an older fisherman) the page is as before | yes: the target disk (model, size, serial; unknown when the disk does not report it) and each device erased, on a card of the confirm page; Install binds the recipe to that disk with `diskIdentity`, and to the plan with `planBinding` when fisherman reports `plan.binding`; without a plan (an older fisherman) the page is as before | yes: the target disk (model, size, serial; unknown when the disk does not report it) and each device erased, under the summary; Next binds the recipe to that disk with `diskIdentity`; without a plan (an older fisherman, a timeout) the page is as before |
| Images in this computer's bootc storage (`bootc_store`), and this computer's system as the install source (`sourceReuse`, #267) | yes, on the confirm page; the system that this computer runs is a second install source there (experimental, never the default, never on live media) | yes, on the confirm step; the system that this computer runs is a second install source there (experimental, never the default, never on live media) | yes, on the confirm page; the system that this computer runs is a second install source there (experimental, never the default, never on live media) | yes, on the confirm page; the system that this computer runs is a second install source there (experimental, never the default, never on live media) | yes, on the confirm page; the system that this computer runs is a second install source there (experimental, never the default, never on live media) |
| Progress of the copy of this computer's system (`source_reuse` events: space, copy, check, failure, removal; #267) | yes: a caption under the step line; the bar pulses until the first step; the cancel question says that the disk does not change | yes: a label under the step line; the bar is indeterminate until the first step; the cancel dialog says that the disk does not change | yes: a caption under the bar; the bar is indeterminate until the first step; the cancel question says that the disk does not change | yes: a line under the step line; the bar holds until the first step; the cancel card says that the disk does not change | yes: a label under the bar; the bar holds until the first step; the cancel dialog says that the disk does not change |
| Done page: installed, restart required, start not verified (#269) | yes | yes | yes | yes | yes |
| Done page: the `receipt` event (install ID, first-boot check) (#269) | yes: install ID and first-boot check, or the reason | yes: install ID and first-boot check, or the reason | yes: install ID and first-boot check, or the reason | yes: install ID and first-boot check, or the reason | yes: install ID and first-boot check, or the reason |
| Restart from the done page | yes | yes | yes | yes | yes |
| Show log after failure | yes (recovery key redacted); the page shows fisherman's `error` event, whether the disk was changed, and a cleanup that failed or timed out | log path; the failure page says whether the disk was changed, and when the cleanup failed or timed out | log in page; the failure page says whether the disk was changed, and when the cleanup failed or timed out | log in page; the failure page says whether the disk was changed, and when the cleanup failed or timed out | log tail; the failure page says whether the disk was changed, and when the cleanup failed or timed out |
| Recovery key kept out of log files (#337) | yes (log file scrubbed; dialog and clipboard redacted) | yes (log file and clipboard copy redacted) | yes (install.log and Copy log redacted) | yes (install.log and Copy log redacted) | yes (install.log, log pane and failure tail redacted) |
| Screenshot walkthrough + parity report | yes | yes | yes | yes | yes |
| End-to-end gate (real install and boot) | yes | yes | yes | yes | yes |

`shared/walkthrough/features.py` writes this table. Do not edit it here.
Each frontend has a manifest with one cell for each row:
`frontends/<name>/features.json`, and `shared/walkthrough/features-gnome.json`
for GNOME. `shared/walkthrough/feature-rows.json` has the rows.

To change a cell, edit the manifest of that frontend and run
`python3 shared/walkthrough/features.py`.
`tests/unit/test_parity_features.py` fails when the table and the manifests
do not agree. Some rows have evidence: a walkthrough screen or an E2E job.
For those rows, the test also fails when a cell says "yes" and the evidence
is not there.

The cells were read from the code on 2026-11-10, after #280 gave the other
four frontends a catalog, gates, locale pages and a companion.

## Closing the gaps, in order

1. ~~**Encryption set** (KDE, XFCE)~~ — **not a gap.** Both offer TPM and
   TPM + passphrase today. Each hides the two choices when fisherman's
   `tpm.usable` is false. No CI runner has a TPM. The capture thus showed
   only two of the choices, and this table copied it. The captures now read
   `shared/probe/fixtures/laptop.json`, which has a usable TPM, so they show
   all four.
2. ~~**Progress bar**~~ — **closed.** All five read
   `shared/progress/README.md` now. This entry said that fisherman emits
   `[n/9]`. It does not. Three frontends used that claim, so their bars
   stayed at zero. Their fixtures used the same shape, so the pictures
   showed a bar that moved. Drive the bar from `cumulative_pct`, not from
   `step / total_steps`: `total_steps` changes with the recipe, and one
   step takes 87% of the time.
3. ~~**Recovery key page**~~ — closed. fisherman prints the key after TPM
   enrolment. GNOME shows a page. The other four show a panel on the done
   screen. Each holds the restart button until the user acknowledges the
   key (#129).
4. ~~**User account**~~ — closed. All five have the step, and each shows
   it only when the image needs an account. All five create an account
   when the catalog does not set `needs_user_creation` (#288). On live
   media, all five read the flag from the leaf of `live.live_image`
   (#288). All five use the groups of `shared/account/` (#302). All five
   ask for the password two times, hold Next on a mismatch and have a
   reveal control (#295).
   The strength hint is not part of the contract. GNOME and KDE show
   one. fisherman does not check the strength, and the hint stops no
   install. A frontend can add one, but no frontend must.
5. **Store and tour assets**: only worth it where the desktop has a place
   for artwork. Every resolver already resolves the keys, so this is view
   work only. KDE and COSMIC now show `welcome_image` and
   `complete_image` as the welcome and done artwork, ahead of `logo`.
6. **Companion and locale steps**: only GNOME has a companion. It sends
   the account over TLS on the LAN address, with a single-use token in a
   header. XFCE and COSMIC had a companion over plain HTTP and removed it
   (#293). All five have locale pages. Each one now sends the
   choice to the installed system in the recipe's `locale`, `keyboard` and
   `timezone` (#292, tuna-os/fisherman#405), and only a choice: without
   one the image keeps its own value. Windows data migration is not
   an installer feature at all: it belongs to wootc. No frontend here
   offers it, and fisherman has no such feature.
