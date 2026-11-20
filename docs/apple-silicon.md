---
title: Apple Silicon Macs
sidebar_label: Apple Silicon Macs
description: TunaOS is not available for Macs with an Apple chip yet. An installer for M1 and M2 Macs is in development.
---

# Apple Silicon Macs

TunaOS is **not available yet** for Macs with an Apple chip (M1, M2, M3, M4
and newer).

- **M1 and M2 Macs:** an installer is in development. It has no release yet,
  so you cannot install TunaOS on these Macs today.
- **M3 and newer Macs:** TunaOS cannot run on them. TunaOS uses the
  hardware support of [Asahi Linux](https://asahilinux.org/) for Apple
  chips. Asahi Linux does not support M3 or newer chips yet.

Do not write a TunaOS USB stick for an Apple Silicon Mac. The Mac cannot
start from it.

## Find out which chip your Mac has

1. Open the Apple menu, then select **About This Mac**.
2. Read the first lines of the window:
   - **Chip: Apple M1** (or M2, M3, M4): your Mac has Apple Silicon.
     TunaOS is not available for it yet.
   - **Processor: … Intel …**: your Mac has an Intel processor. TunaOS can
     install on it from a USB stick. Start on the
     [download page](https://tunaos.org/download).

## What you can do now

- **Use a different computer.** TunaOS installs on PCs with an Intel or AMD
  processor. It also installs on Macs with an Intel processor.
- **Watch for the installer.** The M1 and M2 installer is in development in
  [tuna-os/bootsahi](https://github.com/tuna-os/bootsahi). Its
  [releases page](https://github.com/tuna-os/bootsahi/releases) shows the
  first release when it is ready. This page also changes on that day.
- **Ask in the chat.** The
  [Matrix chat](https://matrix.to/#/%23tunaos:reilly.asia) has news about
  the installer.
