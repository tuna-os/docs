---
sidebar_position: 7
title: "TIDEFORGE READINESS"
---

Assessed 2026-07-27 against `feat/universal-package-recipes` (#115) with the fixes
from #125 applied.

The bar, from `README.md`: Tideforge *"must prove source, build, install, and runtime
parity before it replaces any native EL10 GNOME packaging."* The promotion contract in
`docs/PACKAGE_FACTORY.md` is stricter still: every candidate must *"build in the target
buildroot, pass package tests, install from the staged repository, and complete a
desktop/runtime smoke test where the package affects a session."*

## Verdict

**The switch as usually framed — "move TunaOS packaging to Tideforge" — is not
available, and not because Tideforge is immature.** For the EL10 GNOME stack that
TunaOS actually ships, Tideforge is *not a candidate at all*: that queue is declared
`implementation: native-spec`. There is nothing to switch.

What *is* available today is a partial switch of two specific stacks — **COSMIC and
niri** — whose recipe coverage is complete. Even those cannot be promoted under the
current contract, because the runtime gates the contract requires do not exist yet.

| Parity dimension | State | Evidence |
| --- | --- | --- |
| Source | **Proven** | `verify-tideforge-source.py` runs per package in CI; every recipe pins URL + SHA-256 |
| Build | **Proven** (after #125) | All 40 recipes render for every declared target, 0 failures |
| Install | **Partial** | 8 `Clean-install` jobs out of 40 recipes |
| Runtime | **Not started** | 0 of 12 declared gate types implemented |

## Recipe coverage per queue root

40 recipes exist. Coverage of the roots each queue declares:

| Queue | Target | Implementation | Roots | Have recipe | Missing |
| --- | --- | --- | ---: | ---: | --- |
| cosmic | el10 | native-spec | 14 | **14** | — |
| cosmic | ubuntu | tideforge-debian | 14 | **14** | — |
| cosmic | debian | tideforge-debian | 14 | **14** | — |
| gnome | el10 | native-spec | *(build_order)* | — | *Tideforge not proposed* |
| gnome | ubuntu | tideforge-debian | 9 | **1** | glib2, gobject-introspection, gtk4, libadwaita, mutter, gnome-shell, gnome-session, gdm |
| gnome | debian | tideforge-debian | 9 | **1** | *(same 8)* |
| kde | el10 | native-spec | 3 | **3** | — |
| kde | arch | tideforge-pkgbuild | 4 | **4** | — |
| niri | el10 | native-spec | 9 | **9** | — |
| niri | ubuntu | tideforge-debian | 8 | **8** | — |
| niri | debian | tideforge-debian | 8 | **8** | — |
| niri | opensuse-tumbleweed | tideforge-rpm | 8 | **8** | — |
| niri | arch | tideforge-pkgbuild | 9 | **9** | — |
| xfce | el10 | native-spec | 4 | 3 | xfce4-wayland |
| xfce | fedora | native-spec | 3 | 2 | libxfce4ui |
| xfce | debian | tideforge-debian | 3 | 2 | libxfce4ui |
| xfce | arch | native-pkgbuild | 3 | 2 | libxfce4ui |

**The GNOME DEB row is the one to read twice.** Both GNOME DEB queues nominate Tideforge
and declare 9 roots, but only `bazaar` has a recipe. The eight missing ones are the entire
GNOME platform stack — glib2 through gdm. That is not a gap to close incrementally; it is
the hard part of the problem, untouched.

## Declared gates vs. implemented gates

Counted across all five queue manifests:

| Gate | Times declared | Implemented? |
| --- | ---: | --- |
| container-build | 12 | **yes** |
| rpm-md-stage-install | 7 | partial — 8 `Clean-install` jobs total |
| apt-stage-install | 7 | partial — same |
| greetd-login | 7 | **no** |
| mock-build | 5 | **yes** |
| niri-session-smoke | 5 | **no** |
| xfce-wayland-session-smoke | 4 | **no** |
| cosmic-session-smoke | 3 | **no** |
| gnome-session-smoke | 3 | **no** |
| pacman-stage-install | 3 | partial |
| plasma-session-smoke | 2 | **no** |
| selinux-enforcing | 1 | **no** |

**Every runtime/session gate is declared and none is implemented.** The manifests describe
a promotion contract that CI cannot currently evaluate. Until that changes, no Tideforge
recipe is contract-legal for promotion regardless of how green the build matrix is.

For contrast, the native EL10 GNOME path *does* have runtime verification —
`build-gnome50-verify.yml` boots a CentOS Stream 10 VM under Lima, waits for GDM, checks
that gnome-shell survives without crash-looping, and scans the journal for crash
signatures. That is the standard Tideforge has to meet, and it already exists as a
worked example to copy.

## COSMIC is payload-only by design, today

`build-tideforge-supported.yml` says so in its own comment:

> COSMIC is deliberately payload-only for now: a full staged install requires the
> remaining runtime closure, which is not all factory-built yet.

So COSMIC meets 1 of its 4 declared gates (`mock-build`), not the
`rpm-md-stage-install`, `greetd-login`, or `cosmic-session-smoke` it claims.

## Other gaps found

* **aarch64 is declared but never built.** `manifests/package-factory.yaml` declares el10
  `architectures: [x86_64, aarch64]` and the same for ubuntu/debian (`amd64, arm64`).
  Tideforge CI builds x86_64/amd64 only. Any promotion would ship a half-architecture repo.
* **niri on Arch does not build.** `ld.lld: undefined symbol: spa_format_parse_libspa_rs`
  and six similar — a pipewire-rs/libspa version skew against current Arch pipewire. This
  is a genuine upstream build problem, not a packaging or renderer bug, and it is
  unresolved.
* **`build_repositories` was not honoured.** The manifest declares el10
  `build_repositories: [crb, epel]`, but the `rpm-payload` job enabled only CRB — which is
  what caused 13 of the 18 build failures fixed in #125. Worth a validator: nothing
  currently checks that a workflow's buildroot matches the contract it claims to implement.

## Recommended sequence

1. **Do not** attempt to move GNOME/EL10 to Tideforge. It is native-spec by design and the
   README's own policy keeps it authoritative. Treat this as settled, not pending.
2. **Implement the session gates first**, modelling them on `build-gnome50-verify.yml`'s
   Lima+VNC approach. Start with `greetd-login` — it is the most-declared runtime gate (7×)
   and gates both COSMIC and niri.
3. **Then promote niri**, not COSMIC. niri has full recipe coverage across four targets and
   the smallest runtime closure; COSMIC is blocked on a runtime closure that is not yet
   factory-built.
4. **Add aarch64** to the Tideforge matrix before any promotion, or narrow the declared
   architectures in the manifest to match reality.
5. **Treat GNOME-on-DEB as a separate project**, not a Tideforge rollout step. Eight
   platform packages — glib2, gtk4, mutter, gnome-shell, gdm and friends — is a body of
   work comparable to the existing native EL10 effort.

## What #125 does and does not prove

#125 fixes all 18 `Build Tideforge supported targets` failures. That proves the **build**
dimension across the covered recipes, and it removes the noise that was hiding the real
readiness picture. It does **not** move source, install, or runtime readiness, because the
gates that would test those are not implemented. A green matrix on #115 should be read as
"the renderer works", not "Tideforge is ready to take over."
