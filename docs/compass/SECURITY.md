---
sidebar_position: 4
title: "Security"
---

Compass runs third-party extensions behind a sandbox, keeps clipboard history and extension
credentials, and can type into other windows. Please report vulnerabilities privately.

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.** Use GitHub's private vulnerability
reporting instead:

1. Open the [Compass security advisories page](https://github.com/tuna-os/compass/security/advisories/new).
2. Describe the problem, including:
   - the affected component (engine, extension host, sandbox, Rhai scripts, clipboard history,
     input server, platform integration, packaging)
   - the Compass version and how it was installed (Flatpak, Homebrew, AppImage, Arch, Nix, source)
   - the smallest steps that reproduce it
   - the impact (sandbox escape, credential or clipboard leak, privilege escalation, and so on)
   - a suggested fix, if you have one

## What to report

- **Sandbox escapes**: an extension worker reaching files outside its
  [Landlock](https://github.com/tuna-os/compass/blob/main/crates/compass-sandbox/src/lib.rs) boundary, or a kernel interface its
  [seccomp filter](https://github.com/tuna-os/compass/blob/main/crates/compass-sandbox/src/syscalls.rs) denies.
- **Extension privilege escalation**: an extension running a host program without being granted
  it, or reaching another extension's storage, preferences or tokens.
- **Rhai script permissions**: a script doing something its `script.toml` does not declare, or
  that you did not grant.
- **Credential leaks**: OAuth tokens, extension passwords or the clipboard history key stored or
  sent anywhere they should not be.
- **Clipboard history**: concealed (password manager) copies being recorded, or the history being
  readable without its key.
- **Input server**: `compass-input-server` holds `CAP_DAC_OVERRIDE` to read keyboards and type
  snippets. Anything that lets another program drive it, or read keystrokes through it, is in
  scope.
- **IPC**: another local user, or a sandboxed extension, issuing engine commands it should not.
- **Supply chain**: tampered release artifacts, Flatpak or Homebrew packaging that grants more
  than it should.

## Out of scope

- Vulnerabilities in upstream projects: Vicinae, the Raycast API, Iced, Node.js, GNOME, KDE,
  wlroots compositors, systemd, D-Bus, the kernel. Report those to their maintainers. If Compass
  uses an upstream component in a way that makes it exploitable, that is in scope.
- Third-party extensions from the Extension Store or the Raycast Store. Report those to the
  extension's author, unless the extension gets past the sandbox, which is in scope.
- Anything that needs the attacker to already run code as you outside the sandbox.
- X11 sessions. Compass is Wayland-only.

## What to expect

We aim to acknowledge a report within 5 business days and to confirm whether we can reproduce it
within 10 days. A fix ships in a normal release, and its release notes and a GitHub security
advisory describe it. We prefer coordinated disclosure: please wait until a fixed release is out
before publishing details. Tell us in the report if you would like to be credited.

## Security model

The sandbox is defense in depth. It confines buggy and overreaching extensions well; a determined
attacker with a kernel exploit can still escape it.

- **Filesystem**: each extension worker runs behind Landlock and sees only its own data, the
  extension runtime and system paths. In `$HOME` it may read only the few files the
  [allowlist](https://github.com/tuna-os/compass/blob/main/crates/compass-sandbox/src/home.rs) names (for example `~/.ssh/config`, never the
  keys).
- **Syscalls**: a seccomp denylist refuses interfaces no extension needs, such as `ptrace` and
  module loading. It is a denylist because the worker is Node, whose syscall use changes between
  releases.
- **Memory**: each worker is capped at 256 MiB by `MemoryMax` in its own systemd scope, with
  each JavaScript heap capped at 160 MiB below that. Where no systemd is reachable (inside the
  Flatpak) `RLIMIT_DATA` holds it at 512 MiB of committed memory. The caps are not configurable
  per extension.
- **Host programs**: an extension runs a program on the host, such as `brew`, only if Compass's
  own [overrides list](https://github.com/tuna-os/compass/blob/main/extensions/raycast-linux-overrides.json) names that program for it, and
  only after asking you: Allow Once, Always Allow or Deny. An extension cannot add a program to
  that list itself. See [the Raycast compatibility notes](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RAYCAST-LINUX-SHIM.md). Rhai scripts
  declare what they need in `script.toml`. Scripts you install yourself get nothing until you
  allow it the first time you open them; the scripts Compass ships are granted what they
  declare. The **Script Permissions** command lists and revokes these grants. See
  [the Rhai scripts guide](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RHAI-SCRIPTS.md#permissions).
- **Updates**: Compass checks its own releases and tells you when a newer one is out. It never
  installs anything; your package manager does that.
