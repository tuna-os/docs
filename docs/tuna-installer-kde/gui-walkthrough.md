---
sidebar_position: 2
title: "gui walkthrough"
---

Every image below is rendered in CI from the **real** QML — the same
`src/qml/Wizard.qml` and the same six step modules under `modules/` that the
shipped installer loads. Only `src/main.cpp` is swapped, for
`tests/capture.cpp`. Nothing about the UI is mocked or redrawn.

The capture runs on the Qt `offscreen` platform plugin with the software
scenegraph, inside a Fedora container that carries the KF6 runtime (Kirigami,
Kirigami Addons, `org.kde.desktop` Qt Quick Controls style). See
[`.github/workflows/screenshots.yml`](https://github.com/tuna-os/tuna-installer-kde/blob/main/.github/workflows/screenshots.yml).

<p align="center">
  <img src="https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/walkthrough.gif" alt="The TunaOS KDE installer, step by step" width="720" />
</p>

## The steps

| | |
|---|---|
| ![Welcome](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/01-welcome.png) | **Welcome** — what the wizard is about to do. |
| ![Target disk](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/02-disk.png) | **Target disk** — `lsblk -J`, filtered to whole disks, one FormCard radio per device. Re-read every time the step becomes current, so hotplugged media appear. |
| ![Disk encryption](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/03-encryption.png) | **Disk encryption** — `none`, `luks-passphrase`, and (only when `/sys/class/tpm/tpm0` exists) `tpm2-luks` and `tpm2-luks-passphrase`. The passphrase fields appear only for the options that take one. |
| ![Confirm](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/04-confirm.png) | **Confirm** — the recipe as it will be written, and the only button in the app that starts an install. |
| ![Installing](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/05-progress.png) | **Installing** — live `fisherman` output. No Back, no Next: the wizard advances itself when the process exits. |
| ![Finished](https://raw.githubusercontent.com/tuna-os/tuna-installer-kde/main/docs/screenshots/06-done.png) | **Finished** — success or failure, with the exit code. |

## What the capture checks

Existence checks are not enough. A sibling repository published a blank page
while its "the PNGs exist and are non-empty" assertion passed. So
`tests/capture.cpp` reads its own pixels back and fails the build when a screen
did not really render:

- **distinct colours** — a screen that never painted collapses to a handful.
- **ink** — the fraction of sampled pixels far enough (Manhattan distance > 40)
  from the image's own dominant colour to be drawn content. Measuring against
  the image's own background rather than a fixed luma keeps this correct under
  a dark colour scheme.
- **row and column spread** — the fraction of sampled rows, and of sampled
  columns, that contain any ink. This is what actually discriminates. Density
  alone does not: the welcome and finished steps are hero pages — one icon, a
  heading, a line of prose — and legitimately score around 1% ink, while a form
  step with a FormCard behind it scores 30%. A blank screen scores zero on all
  four.

Measured on the six real screens at 1000×700 (CI run 31136541525), and the
thresholds sit below these with margin (see the table at the top of `tests/capture.cpp`):

| step | colours | ink | rows | cols |
|---|---|---|---|---|
| 01-welcome | 234 | 1.26% | 25.1% | 44.9% |
| 02-disk | 315 | 22.03% | 41.2% | 53.9% |
| 03-encryption | 367 | 26.89% | 53.8% | 53.9% |
| 04-confirm | 288 | 30.20% | 56.8% | 53.9% |
| 05-progress | 334 | 15.77% | 100.0% | 100.0% |
| 06-done | 163 | 0.59% | 17.6% | 38.0% |

Every run prints these, so a drift is visible in the log before it is a
mystery. The capture also clears the output directory before rendering: a run
that dies on the first screen must not leave the previous run's images there
for the artifact upload to publish as its own.

The screenshot artifact is uploaded with `if: always()` — it is needed
precisely when the capture fails.

## Why this cannot start an install

The harness drives navigation through `Wizard.goToStep()`, which moves the
visible step and calls the target module's `onPageActivated()`. The only
`onPageActivated()` in the tree is the disk step's, and it re-reads `lsblk` and
nothing else. `InstallerController.startInstall()` — the sole path to a
privileged `fisherman` process — has exactly one caller, the Install button's
`onClicked` in `Wizard.qml`, which the harness never presses.

Worth stating explicitly: the sibling XFCE installer *does* kick off an install
from its page-enter hook, so "drive the steps" is not automatically harmless
across this family of frontends.
