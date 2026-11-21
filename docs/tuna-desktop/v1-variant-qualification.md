---
sidebar_position: 56
title: "v1 variant qualification"
---

**No all-variant v1 qualification is claimed.** On the current `:tuna`
digests, 14 of the 15 required variants pass all 13 core gates and sailfin
fails logout ([below](#beta3-qualification-on-current-tuna-digests-2026-11-16-to-2026-11-19)).
Package publication, an enabled image build, and an image boot gate are not
real-GDM/session/portal/lock proof.
The [v1 checklist](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md) and [ADR 0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md)
remain unchanged. Marlin remains the GNOME 51 comparison target; every
variant needs its own immutable-image runtime evidence.

## Owner decisions, 2026-11-14

The [owner decision of 2026-11-14](https://github.com/tuna-os/tuna-desktop/issues/1050#issuecomment-6882624166),
as revised the same day on [#1050](https://github.com/tuna-os/tuna-desktop/issues/1050)
after two of its premises were corrected, sets the v1 required set to
**15 variants**: all fourteen matrix variants plus stingray. That is
yellowfin, albacore, skipjack, wahoo, bonito, bonito-rawhide, sailfin, grouper,
marlin, flounder, flounder-sid, hummingbird, guppy, gurnard and stingray. The
prerequisites below are as recorded on 2026-11-14; the beta.3 runs in the
next section supersede them.

- **gurnard: required.** Noble publishes no gtk4-layer-shell source
  ([Launchpad query](https://api.launchpad.net/1.0/ubuntu/+archive/primary?ws.op=getPublishedSources&distro_series=https%3A%2F%2Fapi.launchpad.net%2F1.0%2Fubuntu%2Fnoble&source_name=gtk4-layer-shell&exact_match=true&status=Published),
  no entries on 2026-11-14), and there is no `noble` factory target yet
  ([packages #834](https://github.com/tuna-os/tunaos-packages/issues/834)).
  The factory will add one: gtk4-layer-shell 1.1 or later packaged for Noble,
  built with Noble's own versioned `rustc-1.97`/`cargo-1.97`. That compiler
  closes the earlier gap: the locked gtk4 0.11.5 needs Rust 1.92 or later,
  and `rustc-1.97` and `cargo-1.97` 1.97.1 reached noble-updates and
  noble-security on 2026-11-06. TunaOS keeps gurnard unsupported until the
  target publishes.
- **stingray: required**, added by the owner on 2026-11-14. It needs an
  `ubuntu-rolling` factory target, a `tuna` flavor and runtime runs.
- **hummingbird: required; closure work in progress.** The TuneD
  `rpm-ostree` provider, `libcanberra` and build-chain publication of the
  current desktop ([packages #982](https://github.com/tuna-os/tunaos-packages/issues/982),
  [#959](https://github.com/tuna-os/tunaos-packages/pull/959)) come first,
  then the image build is re-enabled.
- **guppy: publication approved under [#577](https://github.com/tuna-os/tuna-desktop/issues/577),
  pending qualification.** [TunaOS #3883](https://github.com/tuna-os/tunaOS/pull/3883)
  merges once its runtime run qualifies.
- **albacore: required; deferral lifted.** [tunaOS #3969](https://github.com/tuna-os/tunaOS/issues/3969)
  was closed as completed on 2026-11-01, and the owner lifted the deferral on
  2026-11-14. Its `tuna` cell keeps building and publishing, and it is to be
  qualified like the others.

## Beta.3 qualification on current `:tuna` digests, 2026-11-16 to 2026-11-19

Every required variant was run through the 13-step GDM journey
(`tuna-corral-journey --qualification-only`: digest-pinned bootc install,
GDM greeter, fresh-account `tuna` default, `gdm-password` login into Tuna,
portal availability, functional Screenshot and ScreenCast, lock with
`LockedHint=yes`, refused and accepted unlock, power menu, Log Out dialog,
logout) on the `:tuna` image built with `tuna-desktop` v1.0.0-beta.3
packages ([tunaOS #4663](https://github.com/tuna-os/tunaOS/pull/4663)).
Results were posted on [#1050](https://github.com/tuna-os/tuna-desktop/issues/1050#issuecomment-7003191134);
each variant's `verdict.md`, manifests and frames are kept with the
qualification evidence, not in this repository.

| Variant | Image digest (`ghcr.io/tuna-os/`) | Core gates |
|---|---|---|
| yellowfin | `yellowfin@sha256:6b1f78d9645adcb4832579beb5a387afc0ec50730ebae67d516e86355e002c44` | 13/13 |
| guppy | candidate `guppy@sha256:9f4f5f7e0eb64851ffcdef74c23a649f896e196178277f0272e633dd6266b7c1` | 13/13; admitted afterwards by [tunaOS #3883](https://github.com/tuna-os/tunaOS/pull/3883) |
| skipjack | `skipjack@sha256:62fa42e25f02fe712498a89ac8110899b1c20432df55dfab8b6b1d79cd6caa5d` | 13/13 |
| albacore | `albacore@sha256:235e8444214ee8029793a7a9937d5e39a09570b45f689477ec0bf56eecd7926f` | 13/13 |
| grouper | `grouper@sha256:85828ed6deaa664ab2274e485f3c3bd4b48db4810ae8ee9b76dbeefd80cef8e2` | 13/13 |
| stingray | `stingray@sha256:7376e00da965d958c8c0bc7f22565ac6468cd83df5e5d74a2e44339252aa7689` | 13/13 |
| bonito-rawhide | `bonito@sha256:84bb34a76ba27f97cb9b634f702b69b6ce86fb3b8c50b87d1be98f64580b15fb` | 13/13 |
| wahoo | `wahoo@sha256:c4957539ef95f91dda32506e0be7920c10704bdce3926bf290dc6d15ac37c46a` | 13/13; provisioning needed the bootc relabel fix, merged as [corral #725](https://github.com/tuna-os/corral/pull/725) |
| gurnard | `gurnard@sha256:3a54b4cfb0343bff087821a338ab0b426a1d2752e6e4c1612c56fda33ce4cfb2` | 13/13 |
| bonito | `bonito@sha256:3925899dafd2b697218e17bf7d07ccbe4dafa23b1ce1e9fec86770af9d7e9c28` | 13/13; same corral #725 relabel fix |
| flounder | `flounder@sha256:0c6078c47fdc4af59224ffdfa18990e070b2ca133168e02b5afa5cdf878bc2d9` | 13/13 |
| marlin | `marlin@sha256:326ed4ac880e6e0ac5cb126171f5b7ac6322ab28fa409e2ea6301b452e2ba777` | 13/13 |
| flounder-sid (`:tuna-sid`) | `flounder@sha256:4c9336ae98f3e4f13309a9d966f55c4d32d78e8fa855cdb08523ade30b66dd60` | 13/13; GDM's `FallbackSession=tuna` ([tunaOS #4728](https://github.com/tuna-os/tunaOS/pull/4728)) selects Tuna for an account with no saved session |
| hummingbird | `hummingbird@sha256:fa4c5dd88e173405fa555d0eefba4e69b6ffdcd6badc65bcc3771edd72e1ee5e` | 13/13, after [tunaOS #4771](https://github.com/tuna-os/tunaOS/pull/4771) enabled the PipeWire user units |
| sailfin | `sailfin@sha256:b18e16d5b34020e48fbaebcd728e852bd747b6a208fe87af63fde4f0190a3b80` | **12/13**: logout never completes; a bridge-spawned `ibus-daemon` stays in the logind session scope ([#1014](https://github.com/tuna-os/tuna-desktop/issues/1014)) |

Open items from these runs:

- sailfin's logout gate: [#1235](https://github.com/tuna-os/tuna-desktop/pull/1235)
  gives the session's `ibus-daemon` one owner. It is open, and the fix
  then needs a release and a sailfin rerun.
- A beta.3 image does not contain fixes merged after the tag. The navy
  lock frame seen in visual review on most variants (not a gate) is fixed
  on main by [#1194](https://github.com/tuna-os/tuna-desktop/pull/1194)
  and also needs a release.
- The journey logs in through each variant's GDM greeter; the Tuna
  greeter is a separate v1 item ([#1164](https://github.com/tuna-os/tuna-desktop/issues/1164)).

The sections below record the earlier beta.1/beta.2 receipts of
2026-10-31 and 2026-11-01. They stay as dated evidence; their pass/fail
states describe those older digests, not the table above.

## Source inventory, 2026-11-14

The primary inventory is [TunaOS `tunaos.toml` at
`124cc32623ce084580a2ef888350be07bd83508d`](https://github.com/tuna-os/tunaOS/blob/124cc32623ce084580a2ef888350be07bd83508d/tunaos.toml).
It declares **14 variants**, eleven admitted amd64 Tuna image cells and three
source-declared unsupported rows. No arm64 Tuna cell is enabled. All eleven
Tuna cells have `build_iso=false`, `build_qcow2=false`, and `luks_e2e=false`;
this matrix does not invent ISO/LUKS acceptance cells. TunaOS main has since
added stingray as a fifteenth variant, recorded unsupported until the factory
has an `ubuntu-rolling` target.

The native package inventory is [tunaos-packages
`f853bc21d8316cb20bcfef42f4cc6d60ef7ec7d6`](https://github.com/tuna-os/tunaos-packages/tree/f853bc21d8316cb20bcfef42f4cc6d60ef7ec7d6)
(tunaos-packages#1009, 2026-11-14). Its Tuna recipe/spec target **beta.3
release 1**, source desktop tag `v1.0.0-beta.3`, commit
`721c55033dd5d2a1127f24473542e16646cb34e5`. The beta.2 release 2 recipe
(tunaos-packages `c0998b94`, tag `v1.0.0-beta.2`, commit `1e6ce28f`) is what the
2026-10-31 rows below were measured on. That is not current desktop main.
Recipe and vendor archive digests, actual
Gentoo payload evidence, and publication attempts are recorded in
[package-evidence.json](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/package-evidence.json).

| Variant | Base | Package target / format | Support and integration state |
|---|---|---|---|
| yellowfin | AlmaLinux Kitten 10 | `el10` / RPM | admitted; published image, not v1-qualified |
| albacore | AlmaLinux 10 | `el10` / RPM | admitted; published image, not v1-qualified; **required (2026-11-14)**, owner deferral lifted after [tunaOS #3969](https://github.com/tuna-os/tunaOS/issues/3969) closed |
| skipjack | CentOS Stream 10 | `el10` / RPM | admitted; published image, not v1-qualified |
| wahoo | Fedora ELN / EL11 preview | `eln` / RPM | admitted, experimental; missing Tuna tag repaired through existing signed workflow; runtime still required |
| bonito | Fedora 44 | `fedora` / RPM | admitted; published image, not v1-qualified |
| bonito-rawhide | Fedora Rawhide | `rawhide` / RPM | admitted; published as `bonito:tuna-rawhide`, not a separate registry repository |
| sailfin | openSUSE Tumbleweed | rollout label `opensuse`, recipe target `opensuse-tumbleweed` / RPM | admitted; published image, not v1-qualified |
| grouper | Ubuntu 26.04 Resolute | `ubuntu` / DEB | admitted; source retains a portal session-start blocker note; needs actual digest-specific verdict |
| marlin | Arch Linux | `arch` / pacman | admitted; real published-image journey has failures, below |
| flounder | Debian 13 Trixie | `trixie` / DEB | admitted; source retains a portal session-start blocker note; needs actual digest-specific verdict |
| flounder-sid | Debian Sid | `debian` / DEB | admitted; published as `flounder:tuna-sid`; same portal-note qualification limit |
| hummingbird | Fedora Hummingbird | native Hummingbird build chain / RPM | **required (2026-11-14); closure work in progress**; not admitted on main; native package implementation exists; current served beta1 and power-provider closure block strict admission |
| guppy | Gentoo | `gentoo` / gpkg, amd64 | **required (2026-11-14); publication approved under #577, pending qualification**; not admitted on main; signed beta2-r1 publication and served-install verification pass; image admission/runtime remain open |
| gurnard | Ubuntu 24.04 Noble | `noble` / no implemented Tuna target | **required (2026-11-14)**; unsupported on main until the factory gains a `noble` target with gtk4-layer-shell and `rustc-1.97` |
| stingray | Ubuntu interim release | `ubuntu-rolling` / no implemented Tuna target | **required (2026-11-14)**; unsupported on main until the factory gains an `ubuntu-rolling` target; flavor and runtime runs remain |

### Unsupported reasons are evidence, not a scope shortcut

TunaOS main still says Hummingbird/Guppy await Tuna package publication. Those
reasons are stale: both have native implementations, and Gentoo's new revision
was actually published during this qualification. They must not be counted as
satisfied unsupported exceptions merely because the old strings remain in TOML.

Existing admission branches were repaired rather than creating competing PRs:

- [TunaOS #3883](https://github.com/tuna-os/tunaOS/pull/3883): current-main
  integration, `brltty[python]` closure for Orca, and exact published
  `=gui-wm/tuna-desktop-1.0.0_beta2-r1::tunaos` pin. Signed package
  [run 41213265948](https://github.com/tuna-os/tunaos-packages/actions/runs/41213265948)
  passed build, publication and pristine served-binhost installation checks.
  Direct payload inspection finds the six current binaries without
  `tuna-greeter`. This is not a boot/login qualification.
- [TunaOS #3885](https://github.com/tuna-os/tunaOS/pull/3885): current-main
  integration and removal of unavailable redundant `liberation-fonts`, retaining
  Noto/DejaVu, strict GDM-only checks and the power-provider requirement.
  Observed native beta1 RPM includes the obsolete greeter and lacks
  `tuna-wallpaper-svg`. The native TuneD 2.28 RPM additionally requires
  `(rpm-ostree if bootc)` with no enabled `rpm-ostree` provider. Dropping the
  provider gate or inventing a `Provides` would hide the actual failure; neither
  was done. Targeted beta2 publication does not rebuild TuneD.

Both branches retain their manual workflow-path merge fence and promotion hold.
Neither was merged or bypassed. Noble's missing target is tracked in
[packages #834](https://github.com/tuna-os/tunaos-packages/issues/834).
The 2026-10-31 primary-archive audit covers all Noble pockets and compiler
names, not merely the exact `rustc-1.92` name:
[published rustc sources](https://api.launchpad.net/1.0/ubuntu/+archive/primary?ws.op=getPublishedSources&distro_series=https%3A%2F%2Fapi.launchpad.net%2F1.0%2Fubuntu%2Fnoble&source_name=rustc&exact_match=false&status=Published&ws.size=300)
and [published Cargo sources](https://api.launchpad.net/1.0/ubuntu/+archive/primary?ws.op=getPublishedSources&distro_series=https%3A%2F%2Fapi.launchpad.net%2F1.0%2Fubuntu%2Fnoble&source_name=cargo&exact_match=false&status=Published&ws.size=300)
still top out at native `1.91.1`; `rustc-web` and `cargo-web` are not Noble
escape hatches. The selected locked [gtk4 0.11.5 metadata](https://crates.io/api/v1/crates/gtk4/0.11.5)
independently requires Rust **at least 1.92**. This is a confirmed lower bound,
not an assertion about the whole lockfile's exact maximum MSRV. That audit is
superseded: `rustc-1.97` reached Noble on 2026-11-06, and **gurnard is required
for v1** (owner decisions above). A native Noble factory target,
package build/install and immutable image runtime receipts are still
required. No compiler from another target, third-party binary injection or
target substitution is permitted.

## Required-cell accounting, 2026-11-01

The [exact-subject ledger](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/current-accounting.json), as of
2026-11-01 01:09 UTC, separates **0 qualified required cells**, **1 failed required
cell**, **9 required cells with incomplete runtime measurement**, **3 blocked
required cells**, and **1 owner-deferred/unqualified cell**. All fourteen
identities remain present; the ledger holds every untruncated image digest and
the corresponding raw manifest path. Source-declared unsupported is not counted
as qualified or substituted for an unwaived prerequisite.

- Corrected Yellowfin `64e7a29…`: 12 pass/1 fail; actual Screenshot and ScreenCast
  plus lock withdrawal in 0.19 seconds pass. The remaining gate failure is
  `LockedHint=no`. [Reviewed portal/lock frames](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/corrected-visual-review.json)
  are additive evidence, not an all-gates pass.
- [Frozen unlocked sequence](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/unlocked-matrix/matrix.json):
  retains all eight attempts, including Albacore completed before its deferral.
  It correctly stopped on unproven Grouper cleanup. [Recovery](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/unlocked-matrix-cleanup.json)
  proves later exact Grouper VM/VMI/PVC deletion and empty owned-prefix inventory.
- [Batched diagnostic sequence](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/batched-matrix/matrix.json):
  Marlin `5ccc023…` and Flounder Sid `81570c…` installed and painted stock GDM,
  but full console stderr proves bare-name instance resolution is ambiguous.
  Flounder Trixie installed its disk/VM, then `info` timed out before readiness.
  These are not new product portal failures or completed login journeys.
- The next runtime prerequisite is receipt-bound canonical instance routing,
  including actual backend/context/namespace/name and expected VM UID, plus
  independently owned [Corral #674](https://github.com/tuna-os/corral/pull/674)
  canonical wait support. No bare-name fallback or alias/configuration change is
  accepted. A reviewed/merged exact-source signed normal-main CI tool may produce
  explicitly diagnostic receipts; final qualification requires the normal signed
  Corral release. No unreviewed PR tool or special trust waiver is used.
- Hummingbird's provider closure and publication, Guppy's runtime
  qualification and Gurnard's Noble target remain distinct blockers. Guppy's
  release-approval fence was settled on 2026-11-14, and the Albacore deferral
  was lifted that day (see the owner decisions above).

## Published immutable subjects

The complete [registry receipt](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/registry-matrix.json) records
source revision, exact resolver command/output, image creation time and labels.
An image's `org.opencontainers.image.version` is an image-source label, not the
installed desktop package version. Native guest package queries and binary
hashes belong in each runtime manifest.

All references below use `ghcr.io/tuna-os/`; digest prefixes are **not**
truncated. The registry receipt predates the successful Wahoo publication, which
has its own [publication receipt](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/wahoo-publication.json).

| Variant | Repository and immutable digest |
|---|---|
| yellowfin | `yellowfin@sha256:355f66da7929059fc046527da6177e4958d97dab9546d62ca3d5ac53bc4daa4f` |
| albacore | `albacore@sha256:b68a195dbc6e079bbab6b330086e6420d860f5364d1f2232e5f377bc6cdf2a13` |
| skipjack | `skipjack@sha256:30811ab4a8c8dbb4ee3cb1b77ef99fd312ec4835d05a7b40a3ed1aa410b7e5c3` |
| wahoo | `wahoo@sha256:865ec5320f25ae368316f07b4d3b49b5e0600308e5bc50b973ace90a5b53a46d` |
| bonito | `bonito@sha256:e9a58bb671a71b3eaad4efe7c80de35eb62847bf721bc08ef37168d028273c65` |
| bonito-rawhide | `bonito@sha256:dd2bc06ea05ea73fc06c7f208ac3ea2c7107cc4125024362a7d4a9ddfe18c2b3` |
| sailfin | `sailfin@sha256:cbfba99f07a74a099de7366d5de2a2552d768a677cba9000476dacf0d7486605` |
| grouper | `grouper@sha256:8cebaff1fbfe7d8f5076b0d09c7988cce804bbe193b12af733180f2eee3ef6fa` |
| marlin | `marlin@sha256:d0e65bce0ac55cb6c58bcf3739e30d6372fe4be978e6ea7c0c1310b3962bdfa5` |
| flounder | `flounder@sha256:03a4224a791370669f5bf96228097397298fa5e39b566cd3c3d1c1fd11481e2e` |
| flounder-sid | `flounder@sha256:81570c4609ad406ffa4ce5ac453c64f43708e74285ffc00aba7fc4006883cbc8` |
| hummingbird, guppy, gurnard, stingray | no admitted Tuna image subject in the source inventory; no image pass inferred from native packages |

### Existing Marlin runtime verdict is not a v1 pass

The retained [2026-10-31 real-GDM journey](https://github.com/tuna-os/tuna-desktop/blob/main/docs/marlin/2026-10-31-corral-journey/README.md)
for the Marlin digest above installed `tuna-desktop 1.0.0beta.2-2` and recorded
**24 pass, 3 fail**. Install, real-GDM login, session, refused wrong password,
correct unlock and logout were exercised. Raw failures remain unchanged:
absent VM backlight, `notify-send` missing `GetServerInformation`, and
`LockedHint=no` while locked. Visual findings include the incorrect Dark Style
tile, banner covering the date menu, and translucent power popover. These are
published beta2 observations, not claims about later current source.

## Actual Yellowfin runtime, 2026-10-31

The [complete immutable-image manifest](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/yellowfin/manifest.json)
ran 14:53:24–15:29:24 UTC through Corral `76b6dd52d35d`, with 4 vCPUs,
6 GiB RAM, a 40 GiB disk, bochs-drm 1280×800 and real GDM on `karnataka`.
The booted index matches `355f66…`; the booted amd64 manifest is
`sha256:de704153960289d73a58e509d2f00d3713c8d5ee6f7ac23278b21e53cb85f120`.
**The actual installed desktop is `1.0.0~beta.1-1.el10`, not the beta2
release2 recipe now on main.** GDM is 47.0, GNOME Shell 49.5 and Settings
47.7. No current-source qualification is inferred from a recent image date.

Raw result: **20 pass, 7 fail, 1 not exercised**; all 28 noVNC canvas frames,
hashes and guest checks are retained. The deleted VM/VMI/PVC and empty
post-delete inventory are recorded in the manifest.

| Required gate | Actual Yellowfin result |
|---|---|
| Install and booted-image identity | pass for the exact published digest, bootc disk install |
| Real GDM login | pass; GDM greeter on seat0, password login through `gdm-password` |
| Tuna session | pass; compositor and GTK shell run, no user GNOME Shell |
| Portals | frontend Settings.Read, Screenshot version and ScreenCast source types respond; **functional consent/capture/revocation not qualified** |
| Lock/unlock | lock gate fails: ScreenSaver active true but `LockedHint=no`; wrong password refusal and correct unlock pass |
| Visual review | reviewed GDM, session, failed Settings-launch and lock frames; not a complete visual pass |

Direct frame review:
[GDM](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/yellowfin/01-greeter-user-list.png),
[Tuna session](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/yellowfin/03-session-is-tuna.png),
[Settings attempt](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/yellowfin/10-launch-settings.png),
[lock curtain](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/yellowfin/23-lock.png).
The Settings attempt visibly contains repeated trailing `s` characters in the
search field, not a Settings window. Consequently its timeout and downstream
style/wallpaper checks are retained as failed journey observations, **not
independent proof that Settings itself cannot start**. Other raw failures are
Night Light false/no Color owner, `notify-send` missing `GetServerInformation`,
and the lock hint. Sliders are not exercised because this VM has no relevant
hardware device. An automated “settings-appearance” pass only records a key/
pointer action; the reviewed frame does not prove that UI appeared.

The subsequent Albacore attempt was interrupted by the outer 3600-second
command deadline while Corral API reads were timing out. The
[interrupted matrix](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/interrupted-runtime-matrix.json)
is intentionally not a completed matrix or a passing Albacore run. Host
Tailscale/SSH and authenticated API `/livez` responded; Corral's default
5-second read timeout tripped its 15-second circuit breaker. This is access/
orchestration evidence, not a guest crash or an unsupported-variant reason.
The [access and cleanup receipt](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/interruption-cleanup.json)
records successful deletion of only the interrupted Albacore VM/VMI/PVC and an
empty post-delete inventory after using the documented
`CORRAL_KUBECTL_TIMEOUT=30s` management budget. No cluster or desktop acceptance
threshold was changed. Remaining journeys resumed sequentially with that
transport setting; the original failure receipt is unchanged.

## Final observed disposition

The [resumed discovery/interruption receipt](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/resumed-interrupted-matrix.json)
resolved all admitted publications, including a later Skipjack digest
`sha256:36889e650e35893e4d3779deba2ddce7ce375f65a36271f86b77ca90d0c8e924`.
The resumed Albacore attempt did not produce a runtime/readiness manifest
before interruption. No later variant VM was created by that sequence.
The [final disposition](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/final-disposition.json) records
deletion of that owned Albacore VM/PVC and an empty `tuna-q-variant-` inventory.
Neither `punjab` nor the independent soak VM was touched.

| Variant(s) | Install / GDM / session | Portals | Lock/unlock | Qualification |
|---|---|---|---|---|
| yellowfin old `355f66…` (beta1) | pass in both retained runs | availability only; expanded run Screenshot Response 2 and ScreenCast Start timeout because generic Enter did not activate the visible Allow/Share controls | `LockedHint=no` fails; refusal/unlock pass | fail |
| yellowfin refreshed `64e7a29…` | trusted refresh run [41221855489](https://github.com/tuna-os/tunaOS/actions/runs/41221855489) succeeded; guest reports beta2-2.el10; retained core run 10 pass/3 fail | earlier capture failures were locked-session denials; later untouched-image unlocked Screenshot/ScreenCast deliver real frames, with lock withdrawal observed in 0.147 seconds | `LockedHint=no`; refusal/unlock/logout pass | not qualified; full corrected core matrix receipt and visual review remain separate |
| marlin | existing exact beta2-2 journey passes these gates | not qualified by that daily-driver receipt | lock hint fails; refused password/unlock pass | fail, not a v1 pass |
| albacore `b68a195…` | historical receipts retain actual beta1/GDM/session results | historical capture observations retained, not current admission | lock failures remain recorded | not qualified; owner deferral lifted 2026-11-14 after [Mesa crash #3969](https://github.com/tuna-os/tunaOS/issues/3969) closed; required, current-digest run pending |
| skipjack, wahoo, bonito, sailfin | expanded run: install/GDM/session pass | earlier receipts lack unlocked/timely-consent preconditions; not functional qualification | `LockedHint=no` | fail on retained receipts; corrected preconditions pending |
| bonito-rawhide | builder Secret label exceeded Kubernetes' 63-byte limit before the VM existed | unproven | unproven | harness failure fixed by VM-name bound; rerun pending |
| grouper | expanded run interrupted during build; orphan builder VM/Secret/PVC deleted, inventory empty | unproven | unproven | not qualified |
| flounder, flounder-sid | publication resolved; not yet run | unproven | unproven | not qualified |
| hummingbird, guppy | admission branches remain open; no admitted immutable-image runtime proof | unproven | unproven | required; not qualified; stale package-unavailable reasons rejected |
| gurnard | no native Tuna target | unproven | unproven | required (2026-11-14); not qualified; waits on a `noble` factory target |
| stingray | no Tuna target or flavor | unproven | unproven | required (2026-11-14); not qualified |

**[Owner scope override](https://github.com/tuna-os/tuna-desktop/issues/577#issuecomment-6550264429):** Tuna on Albacore may be skipped temporarily while
its Mesa/GDM crash is fixed elsewhere. This is an explicit deferred/unqualified
row, not a pass or accepted fourteen-variant release. The current sequential run
had already finished its Albacore attempt before that instruction arrived; its
receipt stays unchanged, and no further Albacore attempt or publication is made.
No other failed variant or gate is omitted by this decision.
The [machine-readable owner deferral](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/owner-deferred.json)
keeps `qualified:false` distinct from required qualified, required failed and
required unmeasured cells. **The owner lifted this deferral on 2026-11-14**,
after tunaOS #3969 closed as completed on 2026-11-01; Albacore is required again and
its retained receipts stay unchanged.

The expanded-run receipts are not retroactively converted into failures of
the published desktop. The visible GNOME dialogs prove the harness pressed
Enter while Allow/Share remained visible. They do prove portal qualification
remained incomplete. The consent path now uses the existing AT-SPI helper with
Corral's external capture; it does not spoof app IDs or replace backends.

The refreshed Yellowfin run at 19:19–19:50 UTC retained a black Screenshot
prompt frame and a ScreenCast prompt showing the lock password screen. It did
not assert `ScreenSaver.GetActive=false` at request/consent time. Its Screenshot
Response 0 with empty URI and ScreenCast Response 2 must **not** be attributed
to broken capture. On the same untouched `64e7a29…` image, the retained
[InstalledSessionGaps proof](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/unlocked-portals/README.md) records actual unlocked
`GetActive=false` before/after timely Allow/Share: a real 1280×800 Screenshot
file and a decoded ScreenCast frame from node 58. Explicit Session.Close
removed that node in 0.013 seconds; that is not lock-triggered withdrawal.
The deliberate locked negatives reproduce the earlier responses, with no new
Screenshot image and no ScreenCast stream. Raw failed receipts remain unchanged.
Its subsequent [corrected-harness subset](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/unlocked-portals/corrected-harness/manifest.json)
also proves actual Super+L withdrawal in **0.147 seconds**, observer armed before
the key under the unchanged two-second bound. Its separate lock check fails only
`LockedHint=no`; unlock passes. This subset does not retroactively complete the
full corrected image matrix.

The [subsequent interrupted sequence](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/corrected-interrupted/matrix.json)
completed Albacore and Skipjack before its coordinator stopped during Wahoo's
builder phase. Albacore actually captured both portal images. Its lock observer
expired with `runner did not revoke the active grant`: remote evidence collection
used the client's unchanged 30-second `.active`→`.revoke` handshake before the
host armed the lock. That receipt does not establish a product stream-withdrawal
failure. Skipjack's capture attempts lacked the unlocked preconditions and remain
unqualified. [Recovery cleanup](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/recovery-interruption.json)
records deletion of only the interrupted Wahoo builder VM/Secret/disk and empty
owned-prefix inventory. Coordinator loss is not an unsupported-variant reason.

Exact admission/publication [gate snapshot](https://github.com/tuna-os/tuna-desktop/blob/main/docs/variants/2026-10-31/admission-gates.json):

- Guppy PR #3883 head `b1150929473ead1316427b8eae48f76832cf65d1`.
  Earlier run `41215956243` selected no Guppy job because the migrated selector
  omitted it; **that run is not Guppy evidence**. In
  [run 41219478905](https://github.com/tuna-os/tunaOS/actions/runs/41219478905),
  Guppy job `124590901178` succeeded, including image build and PR boot verify;
  boot artifact `13054522656` records digest
  `sha256:49b93f9e32579f03cb1f61978b080277ad8f2dd79d1dc463b59b0d96d8a1f662`.
  That PR image is not a published immutable subject.
- **Exact Guppy publication blocker:** the maintainer's
  [tunaOS #3202 comment](https://github.com/tuna-os/tunaOS/issues/3202#issuecomment-6547926694)
  says: “Merge stays manual, because the change touches workflow paths and has
  the sentinel flag. The issue body's release gates still apply: no publication
  before the tuna-desktop v1 epic (tuna-desktop#577) approves it.” No candidate
  or signed registry image was published. Without that approval, Guppy GDM/session/
  portal/lock qualification against a published digest is blocked. The owner
  approved Guppy publication under #577 on 2026-11-14
  ([decision](https://github.com/tuna-os/tuna-desktop/issues/1050#issuecomment-6882624166));
  #3883 merges once its runtime run qualifies.
- Hummingbird PR #3885 head `0de95641bfdd350e1f148b7f0b1eb600acf58913`.
  [Exact-head run 41213419115](https://github.com/tuna-os/tunaOS/actions/runs/41213419115)
  failed the native TuneD transaction before desktop/boot gates.
- Native Hummingbird publisher [run 41213268502](https://github.com/tuna-os/tunaos-packages/actions/runs/41213268502)
  built and signed beta2 in staging, then failed the pre-sync installability gate
  on a new `libcanberra` blocker. The served index remains beta1. Maintainer-owned
  [packages #959](https://github.com/tuna-os/tunaos-packages/pull/959) adds
  native `rpm-ostree` and `libcanberra` roots. Its first native build was cancelled
  by a later external commit, so no native closure result is claimed.

Focused regressions pass: 11 matrix tests, 17 unlocked-consent/ordering tests,
8 native coordinator tests, 11 scoped identity/cleanup tests and 8 rename-scanner
tests (including actual CLI historical-vs-living inputs). They are not runtime
qualification; the new canonical tool consumer remains blocked on the qualified
Corral release.

## Reusable actual-image path

`python3 scripts/tuna-variant-qualification --out NEW_DIRECTORY` snapshots
current primary configuration and resolves every admitted Tuna publication.
`--run` additionally installs and exercises each reachable image **sequentially**
through `tuna-corral-journey`; `--variant NAME` limits runtime work, never hides
other inventory rows. The only node accepted by this lane is `karnataka`.
Only newly owned `tuna-q-variant-*` VMs/disks are created/deleted. Existing
`punjab` and the independent soak VM are never named.
The Albacore deferral is lifted, so an unfiltered `--run` again covers every
published variant; `--variant` still limits runtime work to a subset.

The default runtime scope is the required real-GDM/session/portal/
lock/unlock/logout core, using the journey's explicit `--qualification-only`
mode. `--full-journey` also runs its app, Settings and notification tour.
Neither mode upgrades portal availability into functional portal qualification.
The matrix stops rather than creating another VM if owned cleanup is unproven.

```sh
~/.cache/tuna-journey-venv/bin/python scripts/tuna-variant-qualification \
  --out /tmp/tuna-variants-NEW --run --variant grouper --variant flounder
```

Requirements and console behavior follow [the Corral journey runbook](https://github.com/tuna-os/tuna-desktop/blob/main/docs/corral-journey.md):
Corral bootc plugin/KubeVirt access, `gh`, `skopeo`, Python 3.11+, Pillow and
Playwright Chromium. The script uses native pacman/RPM/dpkg package queries
and the Gentoo VDB (`/var/db/pkg`, with each package's source repository),
retains booted digest/package/binary provenance, drives the VM's own noVNC
canvas, retains frame hashes, and deletes its VM/disks. Failure manifests also
attempt a Corral framebuffer capture before deletion. No candidate compositor,
shell or session payload is copied into the published-image test.

The portal availability step checks real frontend Settings, Screenshot and
ScreenCast interface replies in the logged-in published session. Those probes
alone remain **availability-only**. The functional Screenshot step reuses
`scripts/lib/tuna-portal-screenshot-client.py`: a persistent native Gio
requester that rejects a screenshot returned before a picker decision,
awaits the actual Response, and validates real varied 1280×800 image pixels.
The host retains that PNG and verifies its guest/host hashes. No app ID is
spoofed and no backend or candidate desktop code is installed.

The ScreenCast step reuses `tuna-portal-capture-client.py` and
`tuna-pipewire-dump.py`. It creates/selects/starts the real frontend session,
opens its actual PipeWire FD, consumes a frame with native GStreamer, checks
caller isolation, and holds its grant until the actual Super+L lock step.
The unchanged two-second withdrawal observer is armed **before** the lock key,
so remote transport latency cannot create a false pass. Actual response,
requester logs, varied frame, hashes and the withdrawal snapshot are retained.
Deferred frame geometry, pixel-variation and hash validation must all pass
before the matrix calls ScreenCast functional; an active grant alone is not
image proof. Requester exit/log diagnostics are retained even when an
after-response unlocked precondition fails.
Missing native Python/GObject/GStreamer/`pw-dump` tools remain explicit failures/prerequisites,
not reasons to call the image unsupported or to install a replacement backend.

At a pending decision, the existing AT-SPI helper activates the actual visible
GNOME Allow/Share control; Corral retains the console frame externally instead
of using X11-only `scrot`. A grant test requires an unlocked session at request,
consent and response; locked-session denial is a separate negative result, never
a capture-product failure. Console frames still require visual review.
The coordinator batches launch/readiness, then actual consent/unlocked/active/
arm bookkeeping beside the unchanged native requester; serialized SSH file reads
must not consume the native 60-second consent or 30-second active-grant budget.
ScreenCast may activate only Share, never a stale Screenshot Allow dialog. Its
real noVNC lock key follows the arm response immediately. The existing two-second
withdrawal observer remains unchanged. Full bootc provision stdout/stderr and
console-start stderr are retained so orchestration failures are diagnosable.

New matrix runs freeze the host journey, native coordinator, shared identity
helper, consent helper and native requester/parser sources into the output's
`harness/` directory before starting any VM, recording
their hashes. Subsequent worktree edits cannot mutate those long-running tests.
Only test requester code is placed in the fixture user's runtime directory;
the installed desktop/provider payload stays untouched.
The dated `docs/variants/20xx-*` receipt trees retain source snapshots, native
package payload paths and their hashes byte-for-byte, as the existing dated
performance evidence does. The rename tool preserves these historical bytes;
living variant documentation and current implementation code remain scanned.

Earlier receipts identify their actual runner hash and do not gain new proof
retroactively: Yellowfin's retained run predates the functional requesters.
Full visual consent decisions remain required, never inferred from a successful
frame. Lock-triggered withdrawal must be observed, not substituted with explicit
Session.Close. Unreviewed frames, interface availability or incomplete portal
flows do not become a v1 pass. Registry errors remain errors, not waivers.
