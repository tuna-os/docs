---
sidebar_position: 59
title: "visual capture refresh"
---

The fixed inventory in `scripts/lib/maintained-media.tsv` owns 46 walkthrough
PNGs, six README native-VM hero PNGs, and the README overview MP4/GIF.
It is not a directory-wide adoption rule. Dated diagnostic captures, frozen
reference baselines, the historical `docs/walkthrough/manifest.json`, and
already published versioned release assets are never overwritten.

## Automated producers and normal intake

The ordinary CI run produces:

- `gtk-shell`: the real full nested GTK journey, all 46 raw screenshots,
  original launched-ELF/source identities and successful capture outcomes.
- `marlin-vm` plus `tuna-tour`: the original five-boot native lifecycle,
  six confirmed hero stills and the actual tour video. Receipts bind the
  immutable image, original package, verified base index/platform, original
  nonroot GDM session, framebuffer timing and every retained media byte.
- `overview-demo`: a private Xvfb/private-D-Bus session with the actual
  Alpha/Beta/Gamma libadwaita windows. Physical input opens the overview,
  selects Beta, reopens it and dismisses it with Escape. The 12-second H.264
  recording is retained before deriving its 640×400, 8-fps GIF.
  The first independently decoded, fully written FFmpeg frame must be
  acknowledged before the original one-second input boundary. An alive process
  or elapsed startup sleep is not readiness. Retained packet timestamps,
  byte-prefix hashes and realtime/monotonic clock sandwiches bind every input
  and UI observation to actual recorded frames; a late recorder fails instead
  of moving the journey clock.

Each native hero needs positive evidence for its exact retained PNG, not
merely a tag or an empty failure list. Overview and Alt-Tab reuse the existing
calibrated framebuffer predicates on those exact pixels. App Grid, quick
settings, calendar and lock use read-only public AT-SPI showing/visible controls
before and after the capture, bound to the same originally admitted GDM
session, shell process and public bus credentials. AT-SPI identities are not
invented compositor/kernel window identities; lock admission never reads
credential descendants. Missing controls, changed principals, mismatched PNG
hashes or capture boundaries fail intake without publishing a replacement.
Quick settings is identified by its actual accessible **Lock Screen** control,
not a nonexistent "Lock" label. Calendar admission requires the invariant
visible **Previous month** and **Next month** controls; the optional events
card's **Open Calendar** button is correctly absent without configured calendars.

These are different scopes: nested fixtures never qualify an installed
native image, and DEV native media never qualifies a signed shipping release.
Title cards in the tour are not screenshots of the product.

The normal check job installs FFmpeg (`ffmpeg` and `ffprobe`) and Python
Pillow explicitly, so receipt and freshness tests exercise real byte decoding
rather than skipping unavailable video tools.

`maintained-media.yml` accepts only a successful `ci.yml` main-push run from
the trusted repository. It rechecks workflow identity, run and attempt,
source, artifact upload digests, decoded media, UI outcomes and immutable
image/package/base evidence. ZIP paths, aliases, symlinks and nonregular
members are rejected before only fixed media/evidence members are extracted.
No artifact executable is extracted or run.
The check job has only `contents: read` and `actions: read` for that API
freshness admission; its dependency audit remains tokenless and fatal on
failure. The separate trusted promotion workflow's PR-writing permissions
do not expose a release credential or authorize downloaded code execution.

Canonical changes are checked on every ordinary branch, not only branches
named by the automation. The comparison includes former destinations from the
base inventory so removing a row cannot hide replaced pixels. Verification
independently downloads the named run's exact digest-authenticated GitHub
artifacts again and compares their actual media, receipts and evidence with the
proposed canonical files. Rehashing a substituted PNG and every PR-local
receipt does not make those bytes part of the successful producer run.
Git comparisons disable rename folding, so moving an inventoried native hero,
video or manifest outside the inventory still validates the removed source path.

The result enters an ordinary media-refresh PR and the existing full CI,
never a direct-main commit or a gate/publication bypass. Newer main source
makes an older promotion stale instead of allowing it to overwrite current
media. A subsequent successful main CI is still required before claiming
current merged qualification. Generated-media-only evolution does not create
an endless refresh-commit loop and never manufactures a latest source SHA:
the actual captured commit, run, image and package remain recorded.
Recursion suppression first authenticates the already committed canonical
bytes against their original run, then independently validates the new current
capture in retained staging. Reuse requires the **exact final immutable image
ID, original package SHA and independently current base index/platform**, not
seven selected ELF hashes or an assumed timestamp-only difference. GTK, Mesa,
fonts and every other installed runtime byte remain inside that actual image.

Ordinary lifecycle CI retains the exact qualified final OCI image and original
package/provenance as profile-specific Actions artifacts. Only a completed
successful trusted Main push with matching real Git required-source inputs and
the **currently resolved and cryptographically verified** base index/platform
can supply a reused image. The current mutable `marlin:gnome` request is resolved
before selection; a moved index/platform, changed source input or unavailable
eligible image uses the normal fresh build and new genuine capture instead.
The earlier registry preview is not this final qualified fixture image.

Reuse replaces rebuilding only: all normal CI checks, compilation, security,
genuine IME, native five-boot and fresh-account gates still run. The same image
is loaded by its authenticated bytes and requalified in ordinary native CI,
never executed in the privileged documentation-promotion workflow. No new
registry/release publication, credential, runner or trust exception is added.
After canonical adoption changes only generated media, that exact product
image can be requalified again without a recursive documentation commit.
Original actual build commit/tree/image/package identities remain recorded;
the new capture's actual commit/tree and run are distinct, never relabelled.
Ordinary native consumers include push, pull-request, manual full-CI dispatch
and scheduled CI; none changes the trusted successful-main producer rule.
The capsule's original strip receipt remains inside its authenticated
selection evidence. It is not restored into the current admission output:
the independent current image inspection must create that new receipt
exclusively before boot and fresh capture.

`scripts/tuna-hero-media` uses the same exact-run API identity, whole-upload
digest and bounded ZIP downloader as automatic intake. It downloads the
`marlin-vm` evidence and reconstructs `tuna-tour` beneath `tour/` before
validating the six canonical heroes; flattened tour-only downloads are
not accepted as a complete native receipt root.

## Receipts and explicit freshness

Canonical receipts live separately under
`docs/walkthrough/media-manifests/{gtk-walkthrough,vm-tour,overview-demo}.json`.
They retain successful producer outcomes, actual source/run/attempt,
original evidence hashes and exact output hashes. The VM receipt additionally
retains the raw OCI index, modern cosign platform output and
`native-base/platform-verification.json`, plus video hash/inspection. The
process witness binds the resolved immutable linux/amd64 digest to the actual
pinned native cosign 3.1.4 executable/version/hash, exact certificate-identity
and issuer argv, successful integer-zero exit, command bounds, stdout hash/size
and stderr. Intake revalidates these retained bytes with the shared verifier;
it does not perform another crypto verification or infer certificate claims
from optional payload fields (which can be empty).
Source receipts distinguish actual `built_commit`/`built_tree` from the current
producer's `capture_commit`/`capture_tree` and checked `merged_commit`. A native
reused build is accepted only with its authenticated original image/package
origin and independently equal real Git required-source inputs. Nested GTK and
overview do not silently accept a different build. Every run validates current
media into `current-capture/`, retained with intake receipts even when exact
canonical reuse avoids a new PR; missing/expired old proof earns no reuse credit.
The original tour video remains in the exact-run artifact, not an invented
checked-in video destination.

Required-source identity hashes actual clean Git mode/type/blob/path inputs,
excluding only the 54 registered generated media paths and three generated
receipt files. Every other tracked source input remains significant. This
does not permit broad documentation drift or silently relabel old footage.

For an independently verified exact run, use the same explicit identity pins
as CI:

```sh
INPUTS=$(python3 scripts/lib/maintained_media.py source-inputs)
scripts/tuna-docs-shots intake GTK_ROOT VM_ROOT OVERVIEW_ROOT \
  --bundle gtk-walkthrough --bundle vm-tour --bundle overview-demo \
  --run-id "$RUN" --attempt "$ATTEMPT" \
  --expect-merge "$CAPTURE_HEAD" --expect-head "$CAPTURE_HEAD" --expect-tree "$CAPTURE_TREE" \
  --expect-source-inputs "$INPUTS" --expect-image "$IMAGE_ID" \
  --expect-package "$PACKAGE_SHA256" --dest STAGING_REPOSITORY_ROOT
scripts/tuna-docs-shots freshness \
  --bundle gtk-walkthrough --bundle vm-tour --bundle overview-demo \
  --run-id "$RUN" --attempt "$ATTEMPT" \
  --expect-merge "$CAPTURE_HEAD" --expect-head "$CAPTURE_HEAD" --expect-tree "$CAPTURE_TREE" \
  --expect-source-inputs "$INPUTS" --expect-image "$IMAGE_ID" \
  --expect-package "$PACKAGE_SHA256" --dest STAGING_REPOSITORY_ROOT \
  --source-artifact GTK_ROOT --source-artifact VM_ROOT \
  --source-artifact OVERVIEW_ROOT
```

Read the pins from independently admitted workflow/build/image evidence;
do not invent them or infer trusted current identity from a receipt alone.
`freshness --source-artifact ROOT` revalidates original retained media,
including the VM video and raw overview frame acknowledgements. A local check
without those roots is only canonical-byte/receipt consistency, not independent
proof of a trusted producer upload or locally present source video. Only the
trusted exact-run replay above admits canonical automation changes.

The old visual-stage refresh and seven-frame `docs-shots` collector remain
diagnostic/staging producers only. They are not alternate canonical-copy
paths, and there is no maintained `docs/shots` destination. Historical visual
manifest run `38293537511` remains historical evidence, not a current-source
or installed-image qualification.
