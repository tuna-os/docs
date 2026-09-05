---
sidebar_position: 19
title: "gnome parity gap"
---

Measured 2026-08-11 21:51:17 UTC by `scripts/measure-gnome-parity-gap.py` (tunaos-packages#132).  Two measurements, both from live sources: GHCR amd64 compressed layer sizes (the issue's own method, refreshed), and the per-base requested package lists from the tunaOS desktop manifests resolved against the GNOME desktop contract.  Machine-readable result: `docs/gnome-parity-gap.json`.

Reproduce with:

```
scripts/measure-gnome-parity-gap.py
```

## 1. Image size deltas (GHCR, amd64, compressed)

| variant | base | gnome | delta | 2026-07-30 delta (issue) |
|---|---|---|---|---|
| sailfin | 1.52 | 1.96 | +0.44 | +0.16 |
| flounder | 1.14 | 1.75 | +0.61 | +0.33 |
| grouper | 1.87 | 2.32 | +0.45 | +0.32 |
| skipjack | 2.60 | 2.95 | +0.35 | +0.99 |
| albacore | 2.60 | 2.95 | +0.35 | +1.00 |
| yellowfin | 2.53 | 2.88 | +0.35 | +0.99 |
| bonito | 3.27 | 3.96 | +0.69 | +0.70 |
| marlin | 1.36 | 2.10 | +0.74 | +0.68 |
| guppy | 3.34 | 4.90 | +1.56 | +1.76 |

All nine editions were rebuilt 2026-08-10 (config `created` timestamps).  The EL-family deltas dropped from ~+1.0 GB to ~+0.35 GB because those editions moved from COPR group installs to the leaner native GNOME 50 RPM chain; the non-RPM variants rose from +0.16/+0.33/+0.32 to +0.44/+0.61/+0.45 as the manifest fixes from 2026-07-30 were published.  Size alone is no longer a discriminator between healthy and thin editions — which is why the contract below, not the size table, is the gate.

## 2. GNOME contract coverage per variant

### Core (contract + session surface)

| variant | gdm | gnome-shell | mutter | gnome-session | gnome-keyring | gvfs | nautilus | portal-gnome | gnome-settings-daemon | gnome-control-center | portal-gtk |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sailfin | ✔ | ◆ | ◆ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| flounder | ◆ | ◆ | ◆ | ◆ | ◆ | ◆ | ✔ | ✔ | ◆ | ◆ | ✔ |
| grouper | ◆ | ◆ | ◆ | ✔ | ✔ | ◆ | ✔ | ✔ | ◆ | ◆ | ✔ |
| skipjack | ✔ | ✔ | ◌ | ◌ | ◌ | ✔ | ✔ | ✔ | ✔ | ✔ | ◌ |
| albacore | ✔ | ✔ | ◌ | ◌ | ◌ | ✔ | ✔ | ✔ | ✔ | ✔ | ◌ |
| yellowfin | ✔ | ✔ | ◌ | ◌ | ◌ | ✔ | ✔ | ✔ | ✔ | ✔ | ◌ |
| bonito | ✔ | ✔ | ◌ | ◌ | ◌ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

`✔` listed explicitly · `◆` supplied by a listed metapackage (measured fact) · `◌` supplied by an installed dnf group (runtime-verified on the reference editions) · `✘` nothing in the list supplies it.

### Apps measured absent from the openSUSE pattern (2026-07-30)

| variant | gnome-bluetooth | gnome-online-accounts | gnome-initial-setup | gnome-disk-utility | fwupd | yelp | orca | search-index | gnome-color-manager | gnome-remote-desktop | gnome-user-docs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sailfin | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| flounder | ◆ | ◆ | ◆ | ✔ | ◆ | ◆ | ◆ | ◆ | ◆ | ◆ | ◆ |
| grouper | ◆ | ◆ | ◆ | ✔ | ◆ | ✔ | ◆ | ◆ | ◆ | ◆ | ✔ |

`search-index` is `tracker`/`tracker-miners` on dnf/apt and `tinysparql`/`localsearch` on openSUSE.

## 3. Findings

- **The requested lists now cover the full GNOME contract** — As of the tunaOS manifests fetched for this run, every audited variant (sailfin, flounder, grouper, skipjack, albacore, yellowfin, bonito) requests every core contract component and every app the 2026-07-30 audit measured missing.  sailfin resolves the apps explicitly (62 requested names); flounder through Debian's gnome-core metapackage plus explicit nautilus/portals; grouper through ubuntu-desktop-minimal plus the gnome-keyring and libpam-gnome-keyring the metapackage was measured to omit.

- **The 2026-07-30 images are stale; current images are in the reference bracket** — The issue measured sailfin +0.16 / flounder +0.33 / grouper +0.32 GB against a ~+1 GB healthy delta.  The manifest fixes landed in tunaOS main on 2026-07-30/31 (ce11d21, d8ebdf6) and all nine editions were rebuilt 2026-08-10: sailfin is now +0.44 GB, flounder +0.61 GB, grouper +0.45 GB — inside the same bracket as the EL-family references (skipjack/albacore/yellowfin +0.34–0.36 GB, which dropped from ~+1.0 GB when they moved to the native GNOME 50 RPM chain).

- **Remaining gap 1 — published apt images cannot be inventoried** — bootc does not commit /var, so dpkg-query is empty on flounder/grouper images and no installed-package inventory exists to diff.  The build-time contract (verify-desktop-experience.sh in tunaOS, verify-gnome-desktop-experience.py here) is the only guard for the apt bases; a build-time inventory written to /usr (issue ask 2) would make them diffable directly.

- **Remaining gap 2 — sailfin's published image has no published inventory** — rpm -qa works on sailfin:gnome, but no inventory has been published alongside the image, so ask 1 of the issue (diff effective installed sets against yellowfin:gnome) still has no committed answer.  Publishing the rpm -qa output with the image metadata closes it.

- **Next candidates — kde/xfce/niri zypper lists are still thin** — The same shape that produced this issue is unfixed for the other desktops: kde.yaml lists 3 zypper names, xfce.yaml 3, niri.yaml 2.  The pattern-family resolution these rely on should get the same explicit-component treatment sailfin's gnome.yaml got (tunaos-packages#133 tracks the broader audit).

## 4. Provenance

- `gnome.yaml`: `b354498ae888` (2026-08-11) — docs: add references to package sourcing policy (#1319)
- `gnome-debian.yaml`: `28ac5e8ea9fe` (2026-08-07) — feat(flatpak): Flathub everywhere, curated preinstall set, and a contract that keeps both (#1062)

- Registry: GHCR `reachable` at 2026-08-11 21:51:17 UTC.

## 5. Caveats

- Runtime package counts are unreliable for the apt bases: bootc does not commit `/var`, so `dpkg-query` returns empty inside `flounder:base`/`grouper:base`.  A build-time installed-package inventory written to `/usr` is required to diff published apt editions directly (issue thread, 2026-08-10).  Until that lands, the apt rows above verify the *requested* lists, and the tunaOS build gate (`verify-desktop-experience.sh`) verifies the *built* image.
- This audit reads the tunaOS manifests at their fetched commit, not the state an image was built from; a list change between that commit and the next publish will not show up until the next run.
- `sailfin:gnome` is the only GNOME edition that currently builds an ISO end-to-end (tuna-os/iso-builder#32); it is no longer the thinnest edition, but it is also the only one whose published image can be inventoried with `rpm -qa` — publishing that inventory would make ask 1 of the issue directly checkable.