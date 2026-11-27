---
sidebar_position: 1
sidebar_label: "tuna-desktop"
title: "tuna-desktop"
hide_title: true

status: unknown
---

Tuna Desktop is a Wayland desktop session for
[TunaOS](https://github.com/tuna-os/tunaOS). A Rust compositor built on
[Smithay](https://github.com/Smithay/smithay) supervises a GTK4/libadwaita
shell: overview, app grid and search, quick settings, notifications,
calendar, lock screen, portals and accessibility. The goal is to do
everything GNOME 51 does and respond faster at the same CPU and memory
cost. It is an independent implementation, not a GNOME Shell fork: it does
not run GNOME Shell extensions or use private Mutter APIs. The project was
formerly named **Roost**; [packaging/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/packaging/README.md#upgrading-from-the-former-name)
covers upgrading from the old packages.

![Tuna Desktop overview with Disks, System Monitor and Files open on the Marlin wallpaper](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-overview.png)

| App grid | Quick settings |
| --- | --- |
| ![Tuna Desktop app grid with the apps the Marlin image ships](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-app-grid.png) | ![Tuna Desktop quick settings with volume, wired network, Night Light, Dark Style and Do Not Disturb](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-quick-settings.png) |

| Calendar | Alt+Tab |
| --- | --- |
| ![Tuna Desktop calendar beside the empty message list](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-calendar.png) | ![Tuna Desktop Alt+Tab switcher with live window thumbnails](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-switcher.png) |

![Tuna Desktop lock screen clock over the blurred wallpaper](https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/docs/walkthrough/hero-lock.png)

Frames from the TunaOS Marlin image booted in a CI virtual machine. The
[overview demo](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough/overview-demo.mp4)
([GIF](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough/overview-demo.gif), [provenance](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough/README-media.md))
and the [walkthrough](https://github.com/tuna-os/tuna-desktop/blob/main/docs/walkthrough.md) show every feature as it looks
today.

## Status

**Beta, not yet a daily driver.** The latest prerelease is
[v1.0.0-beta.3](https://github.com/tuna-os/tuna-desktop/releases/tag/v1.0.0-beta.3)
([release notes](https://github.com/tuna-os/tuna-desktop/blob/main/docs/releases/v1.0.0-beta.3.md)). v1 has not been declared:
[docs/v1.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/v1.md) is the public v1 checklist with the current
evidence for each item, and the [parity ledger](https://github.com/tuna-os/tuna-desktop/blob/main/docs/parity-ledger.md)
records, capability by capability, how Tuna Desktop measures against
GNOME 51.

Tuna Desktop ships as the `tuna` flavor of the TunaOS bootc images. Marlin
(Arch-based) is the GNOME 51 comparison platform
([ADR 0008](https://github.com/tuna-os/tuna-desktop/blob/main/docs/adr/0008-v1-beta-track-and-release-scope.md)). A
Debian-format package exists for development hosts. Hardware sessions are
tested on virtual KMS in CI; physical GPU qualification is still open.

## Try it

- **In a virtual machine**, without installing anything but Corral, on Linux
  or macOS with QEMU, Podman and cosign v3
  ([prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#test-drive-in-a-vm-one-command)):

  ```sh
  curl -fsSL https://raw.githubusercontent.com/tuna-os/tuna-desktop/main/scripts/try-tuna-desktop | bash
  ```

  It verifies the image signature before downloading and refuses an
  unsigned build; the current `marlin:tuna` build is unsigned, so until a
  signed one publishes use one of the routes below
  ([details](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md#test-drive-in-a-vm-one-command)).

- **Installed**: [docs/install.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/install.md) covers the TunaOS image,
  the Debian-format package, building from source and logging in through
  GDM.
- **In a window** inside your current desktop, from a checkout with the
  [build prerequisites](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites):

  ```sh
  git clone https://github.com/tuna-os/tuna-desktop.git
  cd tuna-desktop
  ./scripts/tuna-nested run
  ```

  [docs/nested-session.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/nested-session.md) covers options, the
  shell crash-recovery journey and troubleshooting.

## Build and test

Rust stable plus the system libraries listed in the
[development guide](https://github.com/tuna-os/tuna-desktop/blob/main/docs/development.md#prerequisites). With
[`just`](https://github.com/casey/just) installed:

```sh
just check                  # cargo fmt --check, clippy -D warnings, cargo test
just proof gtk-shell-proof  # one nested graphical proof, as CI runs it
```

[docs/testing.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/testing.md) explains every local check, the proof
lanes and which lanes CI runs for a pull request.

## Documentation

[docs/README.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/README.md) is the map of all documentation: guides,
v1 qualification, performance, security, design decisions and dated
evidence. If something breaks, start with
[docs/troubleshooting.md](https://github.com/tuna-os/tuna-desktop/blob/main/docs/troubleshooting.md).

## Contributing

Read [CONTRIBUTING.md](https://github.com/tuna-os/tuna-desktop/blob/main/CONTRIBUTING.md). Every commit needs a DCO
`Signed-off-by:` line. AI agents also follow [AGENTS.md](https://github.com/tuna-os/tuna-desktop/blob/main/AGENTS.md).
Report vulnerabilities privately as described in [SECURITY.md](https://github.com/tuna-os/tuna-desktop/blob/main/SECURITY.md).

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## License

GPL-3.0-or-later. See [LICENSE](https://github.com/tuna-os/tuna-desktop/blob/main/LICENSE).
