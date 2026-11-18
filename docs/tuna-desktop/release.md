---
sidebar_position: 40
title: "release"
---

Target: TunaOS Marlin (Arch-based bootc, x86_64), with GNOME 51 as the comparison baseline ([ADR 0007](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0007-gnome51-marlin-baseline.md)). The project remains a developer preview until the roadmap release gates pass. Debian/Ubuntu production support must include the preferred GTK shell and
actual installed-session control qualification. The first package lane targets
Ubuntu 26.04 amd64; Debian 13 still needs a packaged gtk4-layer-shell >=1.1
backport and a separately built/qualified artifact. These package targets do
not provide Marlin or physical hardware qualification.

## Checklist

1. Land everything for the release on `main` with green CI.
2. Fill the visual review: copy `docs/reviews/TEMPLATE.md` to
   `docs/reviews/vX.Y.Z.md`, compare the CI proof frames against the
   GNOME 51 baseline bundle, and commit it with no `TBD` left. The
   release script refuses a tagged build without it.
3. Draft the release notes below (changes, known limitations, supported
   configurations).
4. Tag the release: `git tag vX.Y.Z && git push origin vX.Y.Z`.
5. From a clean checkout of the tag, build the package:
   `scripts/tuna-release` — writes `dist/tuna-desktop_X.Y.Z_amd64.deb`.
   Use `--allow-dirty` only for throwaway dev builds, never for a release.
6. Run `scripts/check-release-package` on the artifact. Require all six
   binaries, complete version agreement and the generated ELF dependency
   closure plus explicit runtime floors. Install it on the selected target
   with apt, retaining package/hash/distro dependency receipts and the
   installed GTK control proof; an extracted/debug binary is insufficient.
   Verify the artifact with `scripts/check-deb-clean-install`: require a
   root-owned archive with the GTK shell, then install on a pristine
   `ubuntu:26.04` container without recommendations. Separately confirm the
   login screen lists Tuna Desktop on a real install and every binary's
   `--version` matches the tag.
7. Capture the demo media from the same tag:
   `scripts/tuna-capture --bin-dir /usr/bin --artifacts walkthrough-media`
   captures the installed release's GTK shell and six-feature core tour
   (clip plus still per segment), and checks the segment/template contract.
   Without `--bin-dir`, it builds debug binaries for development only.
   The capture uses real GTK fixture windows, a private bus and isolated
   runtime/configuration/state; it records binary versions and SHA256 hashes.
   Install `ffmpeg`, `Xvfb`, `xdotool`, `jq`, GLib's `gsettings`/`gdbus`,
   and `/usr/bin/python3` with GTK 4 introspection for this capture.
   The recorded state must reach overview, two managed application windows,
   scroll layout, and an awake locked session; successful file creation alone
   is not feature proof.
   Review every still before uploading. Diff against the prior release's
   stills when available; missing old media is not comparison evidence.
8. Render the release media index:
   `scripts/tuna-capture --artifacts walkthrough-media --render-walkthrough vX.Y.Z`
   writes `walkthrough-media/walkthrough.md` with versioned release-asset
   links. It does not replace the manifest-generated `docs/walkthrough.md`.
9. Attach the `.deb`, the notes, the media index, and the twelve media files
   (`<segment>.mp4` + `<segment>.png` per segment) to the release,
   e.g. `gh release upload vX.Y.Z walkthrough-media/walkthrough.md
   walkthrough-media/*.mp4 walkthrough-media/*.png`.
   Link the media index from the release notes. Refresh the canonical feature
   walkthrough only through its [visual capture workflow](https://github.com/tuna-os/tuna-desktop/blob/main/docs/visual-capture-refresh.md).

The package version, the binaries' `--version` output, and the notes must
agree — the release script enforces the first two by construction.

## Pristine launcher VM assets

`.github/workflows/vm-release.yml` is a separate, manually dispatched normal
desktop release producer. It neither publishes TunaOS images/packages nor changes
their publisher policies. It requires the existing real desktop release and
qualified served package/image handoff; it does not create a tag or invent
release identities. Its presence does **not** mean a launcher VM release has run
or passed. Keep the shipped launcher unchanged until the resulting signed bytes
have actually passed all native gates.

Before dispatch, a maintainer must externally configure the Actions secret
`VM_RELEASE_READ_TOKEN`, available to `tuna-os/tuna-desktop`, with a scoped
read-only GitHub credential. The repository's automatic `github.token` cannot
download Actions artifacts owned by the package and image repositories.
Admission's actual GitHub API targets and minimum repository permissions are:

| Repository | Required read access | Admission use |
| --- | --- | --- |
| `tuna-os/tuna-desktop` | Actions, Contents, Metadata | CI/review/installed-control/image-qualification runs, jobs and artifact ZIPs; review source, release and tag |
| `tuna-os/tunaos-packages` | Actions, Contents, Metadata | Factory run/jobs/artifact ZIP; exact recipe and production public key |
| `tuna-os/tunaOS` | Actions, Metadata | Image build run/jobs and amd64 digest artifact ZIP |
| `tuna-os/corral` | Contents, Metadata | Published release, assets and exact tag/source resolution |

For a single fine-grained credential, select these four repositories and grant
only **Actions: read**, **Contents: read**, and **Metadata: read**. No write,
publication, signing, administration or secret-management permission is needed.
Credential provisioning is an external maintainer prerequisite, not something
the producer creates, copies from local `gh` authentication, or bypasses.
Until it is configured, actual `admit` fails with
`configure secrets.VM_RELEASE_READ_TOKEN: admission requires a read-only cross-repository GitHub credential`
before reading the handoff or starting any API/network child process.

Only the actual admission step receives `secrets.VM_RELEASE_READ_TOKEN`, as the
explicit `VM_RELEASE_READ_TOKEN` environment input. Admission requires a nonempty,
non-whitespace value and maps it to `GH_TOKEN` in that process only, removing
`GITHUB_TOKEN`; there is no repository-token or persisted-`gh` fallback. It does
not persist the credential or pass it to the subsequent disk-build step,
signing, native qualification or publication jobs. Those stages keep their
existing credentials and permissions. This read credential authorizes transport
only: fixed GPG/Sigstore identities, exact source/artifact checks, and all real
qualification fences remain unchanged. The workflow selects no job environment
and calls no reusable workflow, so no environment-scoped or reusable inherited
secret supplies this prerequisite implicitly.

Dispatch only from `main`, after the owning package/image qualification completes:

```sh
gh workflow run vm-release.yml --ref main \
  -f handoff="$(cat /path/to/actual-qualified-handoff.json)"
```

The handoff JSON has exactly four objects: `release`, `package`, `image`, and
`corral`, using schema `org.tunaos.desktop.vm/v1`'s corresponding manifest fields.
Do not send a schema/example document as a handoff. Required identities are:

- `release`: `repository`, `tag`, `commit`, `version`, `ciRunId`, `reviewPath`,
  `reviewSha256`, `installedControlRunId`. The repository is
  `tuna-os/tuna-desktop`; the exact tag resolves to `commit`. `version` is the
  tag without its leading `v`. Both CI receipts must succeed at that exact
  source; the full release CI is dispatched, with successful `check`, `ci-gate`,
  `journey`, and `arch-package`. The tagged review must be filled, hash-identical,
  have all nine unique journeys and both signoffs. Every required **Tuna Desktop
  frame cell** must use a backticked `gtk-shell/PATH.png` or
  `journey-shots/PATH.png`; multiple frames use comma-separated backticked paths,
  as in the existing lock-screen review rows. Unwrapped filenames, Markdown
  links/images, unsupported artifacts, duplicate stages and absent/corrupt PNG
  members fail admission. Every declared frame resolves against the actual
  review run's retained artifact bytes; provenance binds each journey to its
  references and each reference to its SHA-256. A valid unrelated reference in
  Notes or elsewhere cannot qualify a missing journey frame. Baseline commentary
  is not a Tuna CI artifact reference. The review-input CI may precede the review
  commit; the separate release CI must match the tag exactly.
- `package`: `name`, `version`, `architecture`, `url`, `sha256`, `signatureUrl`,
  `signerFingerprint`, `sourceCommit`, `factoryRunId`. `version` is the actual
  pacman `pkgver-pkgrel`, **not** the SemVer string. Admission reacquires the
  successful normal Arch publication run's recipe, source archive, output
  artifact, production public key and served package/signature. It requires
  actual served bytes to equal factory output, the recipe to name the release,
  the fixed production primary signer
  `4E5CC9F8B3B521793D95266E629BE6EA45188366`, and image payload files to match
  those signed package bytes. Key rotation requires normal code review.
- `image`: `repository`, `indexDigest`, `manifestDigest`, `architecture`,
  `sourceCommit`, `buildRunId`, `qualificationRunId`, `certificateIdentity`.
  Admission requires the trusted Marlin build run, its retained amd64 digest
  artifact, signed platform manifest, independently hashed index bytes and unique
  amd64 membership, actual OCI platform/config and version metadata, plus the
  strict published-image qualification's source, package, digest, five pristine
  boots, assertions, and real clock/timezone capabilities. `--published` selects
  acquisition only: it never enables historical compatibility or current-build
  substituted success. Each `qualification.json`, `manifest.json`,
  `repeat-manifest.json` and all five actual boot manifests must carry these
  exact top-level typed fields:
  `acquisition: "published"`, `qualification_mode: "strict"`,
  `waived_assertions: []`, `skipped_assertions: []`. Missing fields, old nested
  compatibility modes, legacy-waiver fields, nonempty lists or wrong types fail.
  Five ordered process receipts must be exactly boots 1–5 with integer exit
  status zero. Every boot binds the same actual run, harness source, published
  digest, installed package/version and KVM execution; startup assertions must
  persist across all boots. Embedded repeat/final receipts must equal their
  standalone artifact bytes' parsed content, including the final repeated boot.
  Every assertion must be an actual boolean `pass: true` with a string `detail`,
  never a waiver/skip-shaped row. The final boot, aggregate checks and text
  assertions must contain all required lifecycle gates: native input/pointer,
  brightness, gsd plugins/idle, lock integration, power button, audio, hot corners,
  sleep authentication, actual Orca activation/logout/reaping and product logout,
  plus `G-DATETIME-CLOCK-TZ` and `G-DATETIME-CLOCK-SET`. Startup-only boots do not
  claim clock proof. `V-STRICT-PUBLISHED` and `V-STRICT-PUBLISHED-REPEAT` classify
  the policy; they never replace feature assertions. A green unrelated run,
  obsolete-package exemption, mutable tag or caller-provided success flag is
  insufficient. There is no old-beta strict-pass prerequisite for a separately
  approved core bootstrap release; final launcher publication still requires
  this actual new-digest strict qualification.
  The platform digest is the signed payload object; an index without its own
  signature is not a bypass. Build from the verified platform digest and bind
  both digests in the final signed launcher manifest.
- `corral`: `repository`, `tag`, `commit`, `certificateIdentity`, `assets`.
  This is an actual normal signed Corral release containing the owned lifecycle
  and explicit guest-architecture APIs, not a PR binary. `assets` has exactly
  `linux-amd64`, `linux-arm64`, `darwin-amd64`, `darwin-arm64`, each declaring
  `name`, `url`, `sha256`, `bundleUrl`. The producer resolves the release/tag/source through
  GitHub and verifies every native binary's full Sigstore bundle under the exact
  tagged release-workflow identity and issuer.

`scripts/lib/vm_release.py` implements the following workflow-owned stages:

1. `admit --handoff FILE --output DIR` reacquires and validates provenance.
   Missing/expired artifacts, changed bytes, failed/skipped required gates,
   forks, wrong source, wrong signer, and unsafe archive entries are fatal.
2. `build --output DIR --source NEW_CORRAL_CHECKOUT` checks out the verified
   Corral release source and calls its `bootc.LocalBuilder` via
   `scripts/lib/vm_release_disk.go`. Empty `SSHKey`, no customization and no
   provisioning preserve the real image policy. Do not substitute
   `corral-bootc`'s empty CLI key (it discovers runner keys), or TunaOS's
   `build-qcow2.sh` (it scans the invoking user's SSH/Lima keys). The compressed
   standalone qcow2 has recorded exact byte hash/size, virtual size, amd64 guest
   architecture and UEFI boot evidence; oversized GitHub release assets fail.
3. `boot --output DIR` boots **only a disposable copy**, checks actual serial
   desktop/base contracts and painted output, stops/deletes its own synthetic VM
   and retains a boot-only receipt. This is explicitly **not** firstboot/account
   UX evidence.
4. The signing-only job keylessly signs canonical sorted compact UTF-8 JSON
   (one trailing newline). The identity is exactly
   `https://github.com/tuna-os/tuna-desktop/.github/workflows/vm-release.yml@refs/heads/main`,
   issuer `https://token.actions.githubusercontent.com`. Full transparency
   material and normal verification are required; there is no unsigned path.
5. Native Linux amd64 (`ubuntu-24.04`), Linux ARM64 (`ubuntu-24.04-arm`),
   Intel macOS (`macos-15-intel`) and AppleSilicon macOS (`macos-15`) jobs run
   `scripts/lib/try_tuna_desktop.py qualify --artifact-dir DIR --evidence-dir OUT
   --platform PLATFORM`. Each receives the same signed `manifest.json`,
   `manifest.json.sigstore.json`, exact manifest-declared **amd64 guest** disk
   filename and all four signed **host** Corral binaries/bundles. Both ARM host
   jobs deliberately use native `qemu-system-x86_64` with amd64 UEFI and explicit
   TCG, never native ARM guests, KVM or HVF. Host architecture does not select an
   alternate disk.
   These jobs install only browser observation tooling. The actual consumer
   acquires/checks its pinned verifier and native QEMU/UEFI packages through the
   host's normal package manager, and records the emulator and firmware identity.
   It chooses available acceleration without a device-permission override.
   These are supported Playwright 1.58 host images. The initial pristine
   diagnosis on Ubuntu 26.04 stopped at its explicit unsupported-host dependency
   check (run `41254044292`); no browser/platform override or guest proof was
   substituted.
   The next diagnosis (`41254733163`) verified the exact image platform but
   correctly refused the Corral bundle: the pinned binary's actual signed
   source was `667edf09b70eb88b2a6398ae834d4c841c13f629`, not the stale
   `76b6dd52...` checkout. The diagnosis pins both checkout and certificate to
   that independently confirmed normal-main descendant; its binary checksum,
   signer, issuer and transparency requirements are unchanged. Neither failed
   run reached guest boot or constitutes pristine firstboot qualification.
   Run `41255019047` then verified both signatures and built the keyless
   pristine disk, but `corral start` failed before a console frame. That
   failure is not boot evidence. Diagnostics now retain every Corral command's
   output and early QEMU logs, use the real user-manager HOME with an
   exclusively reserved VM directory, and obtain process identity from the
   Linux QMP socket's kernel peer credentials rather than a PID file.
   Run `41256571645` preserved the actual start error: the supplied
   `//local/NAME` selector omitted the backend and did not identify an
   instance. Corral's existing canonical form is `qemu//local/NAME`
   (`backend/context/namespace/name`). All producer, diagnosis and native
   consumer CLI callers use that form; console HTTP namespace paths are
   unchanged. The earlier failure does not establish a systemd/HOME cause.
6. `finalize --output DIR --evidence-dir ROOT` admits the same signed bytes
   through the consumer's `inspect` command and requires each platform's
   `qualification.json`: exact manifest/disk/host-Corral/producer hashes and run,
   native host/QEMU/firmware identity, all fifteen named checks literally true,
   and all indexed evidence bytes without symlinks/traversal. The checks include
   actual untouched setup/account creation, Tuna session, logout/login, passworded
   wheel membership and password-required sudo, reboot persistence, browser RFB,
   stop/cancellation/failure/browser-failure cleanup, ownership isolation and
   released disk lock. Ordinary user disks are preserved by the launcher;
   only the qualifier's explicit synthetic copies/VMs are deleted.
7. `publish --output DIR --evidence-dir ROOT` performs finalization itself,
   rechecks actual release tags and uploads the disk, retained provenance/native
   evidence archive, signature bundle and **last** the exact qualified manifest.
   It never rewrites signed manifest bytes or clobbers existing release assets.
   Only this job has release-write permission; only signing has OIDC permission.
   The workflow has no inherited permissions: only the admission/build job has
   `actions: read`; its repository job token does not authorize cross-repository
   artifacts. The separate read credential above is available only to admission.
   Signing/native jobs use `contents: read`; publication uses `contents: write`
   for release/tag reads and asset uploads, not speculative Actions API access.
   Signing and publication install QEMU inspection tools before consumer
   admission. Build installs
   `skopeo`, `qemu-img`, GPG, YAML and Pillow; native jobs install x86 QEMU/UEFI,
   tesseract and an isolated Python environment with Requests, Pillow,
   Playwright and its real Chromium dependencies.

The offline artifact directory is an acquisition mode for these **same signed
bytes**, not alternate trust: it must use the declared disk/Corral filenames and
standard bundles. Behavioral producer rejection tests are
`python3 scripts/lib/vm-release-tests.py`; they are not guest qualification.

Shipping disks must contain no runner/test keys, fixed account/password or
fixture bypass. Admission actually runs the digest-pinned source image read-only
with networking disabled before any pristine build. It rejects fixture payloads,
ordinary UID 1000–65533 accounts, every empty/unlocked shadow password (including
root), authorized-key files and private SSH key names/content under `/root`,
`/home` and existing `/etc/ssh`, following symlinks. The retained
`provenance/image.json` binds the audited digest and records account UID/GID/shell
inventory plus locked/disabled status only, never password hashes or key content.
An empty LocalBuilder SSH key prevents new injection; it does not sanitize a
credential-bearing source image. Never repair or enable fixture mode to admit
such a source. Actual untouched firstboot/setup/passworded-admin/login/reboot
proof remains a release prerequisite; a host-blocked reproduction is not evidence
of a guest cause or grounds for a waiver. Unavailable actual qualified
release/package/image/Corral identities are a dispatch fence, not placeholders.

## Prereleases (betas and release candidates)

Tag a prerelease with a SemVer suffix: `vX.Y.Z-beta.N`, then `vX.Y.Z-rc.N`.
Every checklist step above applies unchanged, including the filled
`docs/reviews/vX.Y.Z-beta.N.md`. The binaries report `X.Y.Z-beta.N`; the
package versions are mapped so the final `X.Y.Z` always upgrades over them:

| Tag | `--version` | Debian `Version` | Arch `pkgver` (`_semver` in `packaging/arch/PKGBUILD`) |
|---|---|---|---|
| `v1.0.0-beta.1` | `1.0.0-beta.1` | `1.0.0~beta.1` | `1.0.0beta.1` |
| `v1.0.0-beta.2` | `1.0.0-beta.2` | `1.0.0~beta.2` | `1.0.0beta.2` |
| `v1.0.0-beta.3` | `1.0.0-beta.3` | `1.0.0~beta.3` | `1.0.0beta.3` |
| `v1.0.0` | `1.0.0` | `1.0.0` | `1.0.0` |

Publish it as a GitHub prerelease (`gh release create vX.Y.Z-beta.N
--prerelease`) and list every open release gate under "Known limitations":
a beta does not claim the gates in the [roadmap](https://github.com/tuna-os/tuna-desktop/blob/main/docs/roadmap.md#global-decision-gates).

## Upgrade and uninstall

Follow the [legacy-upgrade and recovery guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/legacy-upgrade.md) before
qualifying an upgrade. Require the exact two-file transition allowance,
non-destructive settings behavior and manager-specific modified/deleted
configuration evidence. Real GDM remembered-name/reselection, a running old
compositor's unlock, Arch replacement and Marlin activation/rollback need
their own native results; archive, user-namespace dpkg and private-PAM
mechanisms cannot stand in for those tests. Do not remove the bridge based
only on elapsed releases or the fact that the beta was installed.
For the Marlin image, run the [upgrade, rollback and crash-recovery
proof](https://github.com/tuna-os/tuna-desktop/blob/main/docs/upgrade-recovery.md) from the previous published digest to the
candidate's digest.

Uninstalling removes the Tuna Desktop-owned program files and session entries; user configuration and application data
are preserved.

## Recovering from a bad release

If a release already tagged, built, or published turns out to be wrong, see
[docs/release-rollback.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/release-rollback.md) for the recovery steps —
there is no automated rollback, so this is a manual process ordered by how
far the bad release already traveled.

## Release notes template

```markdown
# Tuna Desktop X.Y.Z

## Changes
- ...

## Known limitations
- ...

## Supported configurations
- Debian ... / Ubuntu ... (amd64)
```
