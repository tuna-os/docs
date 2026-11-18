---
sidebar_position: 25
title: "legacy upgrade"
---

This is a bounded transition repair after [#775](https://github.com/tuna-os/tuna-desktop/pull/775),
not a declaration that every existing installation can safely upgrade.
The qualification table below distinguishes observed mechanisms from native
desktop routes that still require testing. Use disposable VMs for qualification,
keep another login-capable session or TTY available, and retain a known-good
package/deployment and a backup of the settings involved.

## Exactly two temporary package paths

Fresh installs **also** contain these regular root-owned 0644 files:

| Path | Purpose | Protection |
|---|---|---|
| `/usr/share/wayland-sessions/roost.desktop` | Resolve the old saved session identifier; `NoDisplay=true`, current `Exec`/`TryExec=tuna-session`, no `Hidden=true` | Ordinary package file |
| `/etc/pam.d/roost-lock` | Keep the service name compiled into already-running old compositors available | Debian conffile; Arch `backup` entry |

The current `tuna.desktop` and `tuna-lock` remain the normal identities.
No old binaries, broad command symlinks or `ROOST_*` environment aliases are
restored. Package relations naming `roost` allow replacement of the old package;
they are not migration logic. There are no maintainer scripts that enumerate
homes, edit AccountsService, restore deleted authentication policy or terminate
sessions. The legacy PAM file is byte-for-byte identical to the published
beta file: changing only its comments would needlessly change its conffile
digest. Its historical “one-release” comment is retained for that reason; the
removal gates in this guide govern the current transition. The package cannot
safely infer that every remembered selection and
running process has moved on, so the narrow bridge is explicitly retained even
on fresh installations until the removal gates below are met.

### Remembered GDM sessions

GDM's saved session is a desktop-file identifier, not its `Exec` command. The
beta's hidden entry did not automatically turn a remembered `roost` selection
into `tuna`. The bridge supplies the old filename while using the current
launcher. At a later login, explicitly choose the visible **Tuna Desktop**
session; then verify that another login remembers the new selection. Do not
rewrite AccountsService records globally or infer success merely because the
new compositor ran. This follows GDM 51's `get_session_name`, saved-session
validation and worker session-name flow, but actual login/reselection evidence
is still required. [GDM 51 source](https://raw.githubusercontent.com/GNOME/gdm/51.0/daemon/gdm-session.c)

### A compositor that was already running

Replacing its executable on disk does not rewrite a running process's compiled
`roost-lock` service name. Keep the narrow service available, with the
administrator's intended policy, while such processes may still request it.
The packaged rules use `auth include login` and `account include login`, just
like the current service. Retaining the file is not proof that every local
`login` stack or old compositor can unlock: that requires an actual old-session
lock/unlock test after replacement. No forced logout, reboot or indiscriminate
PAM deletion is part of this repair.

An administrator who intentionally removed or denied the old service has made
a policy choice. No repair hook restores it; the package manager's handling of
an absent file still differs as described below. Before upgrading that
configuration, establish an independently usable recovery login and a reviewed
local unlock/upgrade precondition. A missing PAM service can fall back to the
machine's `other` policy; never assume a universal outcome from its absence.

## Settings adoption at session startup

The guard runs in `tuna-compositor` before its settings writers or supervised
shell start. `tuna-session` reaches that guard through the compositor; help,
version and the internal PAM helper exit before it. Standalone shell tools are
not a separate migration entry point.

These five sibling pairs are inspected together:

| Base | Old directory | Current directory |
|---|---|---|
| Config | `roost` | `tuna` |
| Cache | `roost` | `tuna` |
| Data | `roost` | `tuna` |
| Data | `roost-shell` | `tuna-shell` |
| State | `roost-shell` | `tuna-shell` |

This also covers an old-only home whose beta package was installed but never
launched. The later `state/tuna/session.json` feature was introduced with the
current name and is not an invented sixth migration pair.

| Observed state | Disposition |
|---|---|
| Neither entry exists | No change; no directories created |
| Current-only owned real directory, without group/other write | Preserve it; no adoption |
| Old-only owned real directory under a safe absolute base | Atomically create only `current -> old`, with a relative sibling target |
| Exact existing `current -> old` sibling link, caller-owned, with safe old directory and ancestry | Preserve it; idempotent |
| Distinct old/current entries, even two directories or an empty current directory | Stop with both paths and recovery guidance; never choose, merge or overwrite |
| Unexpected/dangling leaf link, wrong type/owner, unsafe writers or changed identity | Stop with recovery guidance; preserve entries |

Automatic adoption opens each ancestor and old directory without following
symlinks, checks ownership and replacement permissions, and pins descriptors.
Ancestors must be owned by root or the current user; writable shared ancestors
are allowed only when sticky-directory semantics protect the trusted-owned
next entry. The final base and old directory must belong to the current user
and have no group/other write bits, even if sticky. Root, set-id and secure
execution do not perform adoption. Symlinked home/XDG ancestry and parent
traversal are unsupported for automatic adoption; inspect and choose safe
physical absolute bases explicitly instead of following them silently.

All pairs are inspected before any link is created, then revalidated before
creation. Creation cannot replace an existing destination, including a dangling
link. If a later operation fails, completed links remain for inspection/retry;
rollback does not delete them. No pre-existing data, inode or entry is changed.
Directory timestamps naturally change when a link is added. The guard does not
walk or certify every file inside a settings tree, change data formats, or
establish a new boundary against subsequent mutations by the same owner/root.
It does not promise that links are immutable after validation.

### Relative and missing environment values

Resolution matches the existing readers rather than moving data to a different
base. Config uses an absolute `XDG_CONFIG_HOME`, otherwise `HOME/.config`;
cache uses `XDG_CACHE_HOME` as supplied (even relative/empty), otherwise
`HOME/.cache`. Data/state use absolute XDG values, otherwise an absolute HOME
with `.local/share`/`.local/state`; without either, those roots are absent.
Safe current-only relative config/cache directories and fresh states remain
usable. When an old entry at a relative config/cache base needs adoption, startup
stops with an unsupported-automatic-migration diagnostic. It does not silently
fall back to another directory or import old environment aliases.

## Package-manager distinctions

### Debian-format packages

Both PAM files are conffiles. Local modifications and deliberate removal are
handled by dpkg, and changed shipped content may require an administrator's
configuration-file decision. Disposable dpkg tests show that a deliberately
deleted PAM conffile can prompt when the shipped bytes change; noninteractive
environment alone does not answer that prompt. With no answer, installation
can leave the package unconfigured. Review and explicitly retain the intended
local policy or absence before proceeding; do not assume an unattended upgrade
will finish. Preserve a deliberate local policy rather than blindly accepting
the package copy. A removed-from-package conffile can remain
as obsolete configuration; absence from the new payload does not establish
absence on disk. This repair adds no cleanup hooks and does not pass
`--force-confnew` or `--force-confmiss`. [Debian configuration-file policy](https://www.debian.org/doc/debian-policy/ch-files.html#configuration-files)

### Arch replacement

The product PKGBUILD declares both services in `backup`; verify the metadata of
the actual archive before relying on that declaration. The signed original
`roost 0.1.0-3`, transition beta1 and public beta2 archives lack `backup`.
Public beta2 also lacks the replacement/conflict metadata. Native transactions
exposed those differences; [factory PR #962](https://github.com/tuna-os/tunaos-packages/pull/962)
repairs the producer, but cannot retroactively change an installed old package.

An old package without `backup` can lose edited policy during replacement,
even when the new archive declares it. The native negative controls also show
that `NoExtract` alone does not protect an edited old file from removal.
`NoUpgrade` alone preserves an existing file, with a genuine `.pacnew` when
appropriate, but does not preserve deliberate absence. Do not treat either
option alone, a new backup declaration, or a successful package installation as
policy-preservation evidence.

### Operator-selected native policy precondition

The separately reviewed preparatory route uses **both** native options for the
exact protected paths:

```ini
[options]
NoUpgrade = etc/pam.d/roost-lock etc/pam.d/tuna-lock
NoExtract = etc/pam.d/roost-lock etc/pam.d/tuna-lock
```

Before the transaction, establish an independently usable recovery login,
archive the policy bytes and metadata, and explicitly choose the intended
policy or absence for **each** service. An old-only installation's missing
`tuna-lock` is not evidence that an administrator chose denial. Protecting that
missing path can leave the new session without its intended authentication
service. Review the actual current service policy before using Tuna, and
qualify a real correct-password unlock and wrong-password denial; a private
permit/deny probe is not that proof. Never use a test-only `pam_permit` stack
as a production recommendation.

Place the exact rules after other patterns and includes that could negate
them. Inspect the effective `NoUpgrade` and `NoExtract` output with native
`pacman-conf --config` before removal starts, and pass that same reviewed
configuration to the actual pacman transaction. The native manager, not a
post-install recovery promise, enforces these choices. Retain the protections
for reinstall, downgrade, removal and subsequent installation while the chosen
policy or absence must remain; dropping them after one successful upgrade is
not qualified. This repair does not edit the global pacman configuration,
restore policy, alter the local package database or install migration hooks.

The recorded native lifecycle covers these controls with genuine old and
CI-built candidate archives, including preservation across all five package
operations above. It is **not final signed-release qualification**. Review the
[actual receipts and unsafe controls](https://github.com/tuna-os/tuna-desktop/issues/505#issuecomment-6551267030)
and the final artifact boundary below before proceeding.
[pacman configuration handling](https://man.archlinux.org/man/pacman.8.en#HANDLING_CONFIG_FILES),
[NoUpgrade and NoExtract](https://man.archlinux.org/man/pacman.conf.5.en#OPTIONS),
[installed-version libalpm removal](https://gitlab.archlinux.org/pacman/pacman/-/raw/54d9411/lib/libalpm/remove.c)
and [extraction](https://gitlab.archlinux.org/pacman/pacman/-/raw/54d9411/lib/libalpm/add.c).

### Marlin transactional deployments

The image build asserts the package bridge is present. That does not change an
already-running old deployment or prove activation, `/etc` policy preservation,
unlock or rollback. Qualify the actual deployment switch and recovery separately
with unchanged, modified and intentionally removed policy; retain a prior
login-capable deployment. Neither an image-content assertion nor an Arch staging
test qualifies this route.

## Recovery and downgrade

If the guard stops, preserve both named paths and their metadata before making
a choice. Use another login-capable session or a TTY; inspect ownership, types,
links and every conflicting copy. Choose the intended dataset explicitly, and
keep the other copy backed up. Do not fix a conflict with a blind recursive
delete, merge, ownership change or replacement symlink. A partial adoption is
safe to inspect and retry after the actual problem is resolved.

The relative links preserve the old directory for an older reader and make
new writes visible through both names. This is path-level downgrade access,
not a guarantee of application data-format compatibility or safe simultaneous
old/new writers. A package downgrade follows that manager's conffile/backup
rules and may need an administrator's decision. Recheck both PAM policies and
the login choice; do not purge configuration as a recovery shortcut.

## Qualification and reproducible evidence

| Check | Current evidence boundary |
|---|---|
| Original archive policy and exact bridge | Genuine synthetic `.deb` archives, native fixture ELF binaries and the actual checker; malformed/forbidden/link-path negatives |
| Arch package contents | Product `PKGBUILD package()` staging and actual factory CI archive metadata, including repaired replacement/conflict and both backup entries; signed public beta2 lacks that contract. Final published archive still required |
| Settings preservation | 39 production-module real-filesystem tests, including conflicts, pinned identities, races and retry; foreign/root/set-id identities modeled |
| Native compositor startup/readers | Source ordering reviewed and [native CI workspace formatting, clippy and tests pass](https://github.com/tuna-os/tuna-desktop/actions/runs/39347223962/job/118382996345); this does not establish legacy settings-reader or old-session upgrade behavior |
| Debian lifecycle | 12 actual dpkg cases pass with the pinned published beta and exact built CI candidate; original archive hashes, version ordering and administrator-policy outcomes are recorded. Synthetic packages isolate pre-rename, removed-layout and changed-policy controls |
| Private PAM | Three disposable-container cases pass with verified native-library provenance: retained service permits, administrator denial persists, and a missing service reaches private denial. The prestarted executable is a synthetic old-service helper, not an old compositor |
| GDM saved login/reselection/second login | Native GDM 51.1.1 starts actual current Tuna from saved `roost`, then explicit visible Tuna reselection changes the record to `tuna`; the next username/password-only login remembers it. **Unqualified for the beta-never-launched route and final signed candidate** |
| Running pre-rename compositor lock/unlock | Actual original `roost 0.1.0-3` retains its PID, executable inode and ELF hash across native replacement, initializes PAM afterward, rejects a wrong password and unlocks with the correct one. Preserved intentional denial/absence stays locked with independent recovery. **Unqualified for the final signed candidate** |
| Arch replacement/deletion/downgrade | Actual signed-archive unsafe controls and genuine CI-built metadata-repair transactions, `.pacnew`, effective combined native protections, reinstall, downgrade, removal and recovery are recorded. **Unqualified for the final signed candidate; unrestricted old-policy replacement is unsafe** |
| Marlin activation, policy preservation and rollback | **Unqualified: requires final artifact-bound native deployment tests**, independently of pacman or compositor evidence |

The scoped [CI evidence from head `5764d543`](https://github.com/tuna-os/tuna-desktop/actions/runs/39347223962/artifacts/12231976713)
records all 15 lifecycle/private-PAM cases passing. Its ZIP SHA-256 is
`06fdbbc25164a8a9e162a7689468c7787d8512accb02ebf8ceb2308249a760c0`.
The exact built candidate is version `0.1.0`, SHA-256
`4cf37b83c8b4b13f4f240a4565f26ffdf45dfe5b6d60f295f674b962030c84d6`;
the published beta is `1.0.0~beta.1`, SHA-256
`b2b9ec7c9c5eb9f0e2003e48e458a440a551836d31a831972b8561a43e15ed01`.
Consequently, dpkg classifies beta-to-candidate replacement as a **downgrade**
and candidate-to-beta replacement as an **upgrade**. These are the observed
development-package directions, not a beta-to-newer release-candidate upgrade
qualification. That release path requires its own correctly versioned artifact.

Private-PAM evidence uses Ubuntu 26.04 `libpam0g`/`libpam-modules`
`1.7.0-5ubuntu3.2` and `libc6` `2.43-2ubuntu2.4`, with library hashes/build IDs
and verified isolation recorded. Authentication/account results are `0/0` for
private permit and `7/7` for both denial cases; a loader/system error is not a
passing denial. The helper retains its executable inode across package
replacement and initializes PAM afterward. The artifact exports only bounded,
typed results, hashes and metadata after fixture teardown; private configuration
bytes and arbitrary command output are excluded. This scoped evidence does not
replace the remaining PR checks or the four unqualified native routes above.

### Native preparatory receipts, not final release approval

The [2026-11-01 native receipt](https://github.com/tuna-os/tuna-desktop/issues/505#issuecomment-6551267030)
records actual disposable karnataka VMs and preserves failed controls. The genuine
old native archive is `roost 0.1.0-3`, SHA-256
`38c7a587fe5e0654fffc04d0ef2e753911aaa06eda7bde8eadbc73661df9a96f`,
from source `9e3de927f6730191ff93ddfa96c0fcdb9a08c8f6`. Its real compositor
ELF SHA-256 is
`edd5bb3f841e6bd9a9406774194681bec32df6fac7a0d42ed4924e5895fbd34e`.
Both published beta1 packages are post-rename; neither is a substitute for
that old compiled consumer.

The live-process observation used actual source-CI beta3 archive SHA-256
`bc1e4e8be793544ee65c027701682cb0241785774837d06481bba4d54610ac26`,
source `cad152015353b2fc9ee0b584333f997a0605d6b2`. The factory metadata
controls used the actual [PR #962 CI archive](https://github.com/tuna-os/tunaos-packages/actions/runs/41253051114/artifacts/13061618788),
SHA-256 `cb8ff8aa3d6240ebe4c1a6fc259cc0765854460c8edbfb44183dc7e8abf0bdfe`.
These are real built archives with different evidence purposes, **not signed
published final inputs**. Native version comparison orders the beta3 candidate
above the original old package; it does not change the earlier dpkg downgrade
result.

The old compositor first loaded PAM after replacement and remained alive
through intentional denial and removal. A separate real GDM login started
current Tuna through the saved legacy identifier while that old session stayed
locked. The operator-selected current policy used the real `login` stack, not
`pam_permit`; actual current Tuna rejected a wrong password and granted the
correct-password unlock. Named Linux uinput keyboard and absolute-pointer
events supplied part of the UI input: this is **emulated-device**, not
physical-device, evidence.
Neither old administrator policy nor its deliberate absence was restored.

Visible reselection is distinct from a successful bridge login, which still
left `Session=roost`. The [native continuation receipt](https://github.com/tuna-os/tuna-desktop/issues/505#issuecomment-6551379581)
records the named account's visible Tuna selection, GDM changing its record to
`Session=tuna`, and a different current compositor on the next
username/password-only login with that selection retained. The old compositor
stayed alive and locked. Final signed-package, current shipped-image,
beta-never-launched and Marlin deployment evidence remain required. The
original helper-only private-PAM result above has not been reclassified as an
old-compositor pass, and no bridge-removal gate is waived.

Source checks, byte-path tests and a compiled old-service fixture cannot replace
the last four rows. Record exact source/package/image hashes, tool/library
versions, starting package state, changed/deleted configuration, command exit
codes, before/after manifests and recovery results. A private PAM test must use
an enforceable disposable filesystem boundary,
`pam_start_confdir`, a private `login` policy and explicit private `other` denial.
Only benign permit/deny modules and a synthetic user are allowed; host PAM
configuration and real credentials must be unreachable. A configuration-directory
argument alone is not evidence of an enforceable filesystem boundary. Start the
old executable before replacement but initialize PAM afterward, so it tests lookup by the
still-compiled name rather than a preloaded stack. Native-library provenance must
be established before loading: an unmapped namespace owner is not proof of root
ownership. Do not relax that requirement or replace native audit behavior just
to obtain a passing result. [Linux-PAM configuration lookup](https://raw.githubusercontent.com/linux-pam/linux-pam/v1.7.1/libpam/pam_handlers.c)

## Evidence required before removing the bridge

Remove each retained path only after its own gate passes on every advertised
upgrade route; elapsed releases, issue closure and beta installation are not
evidence of migration.

1. **Saved session:** native GDM fixtures start with the old saved identifier,
   cover direct and beta-never-launched upgrades, explicitly select Tuna Desktop,
   and demonstrate a subsequent remembered login after the legacy file is absent.
   Otherwise document and verify a safe user-controlled reselection precondition
   before package replacement; do not silently remove access.
2. **Running service:** actual pre-rename compositor fixtures establish how an
   upgrade with unchanged, modified and removed PAM policy remains unlockable,
   or enforce a separately reviewed safe upgrade precondition. Never assume
   executable replacement changed an existing process or force session shutdown.
3. **Data and recovery:** old-only, already-adopted and conflicting settings pass
   preservation/recovery checks, including downgrade access. Package-manager
   removal respects local policy and leaves obsolete configuration decisions to
   the administrator.
4. **Distribution routes:** Debian, Arch and Marlin each have artifact-bound
   upgrade/downgrade/rollback evidence, an independently reviewed removal patch
   and updated exact-allowance negative tests. Unqualified routes remain labeled.
