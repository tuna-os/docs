---
sidebar_position: 7
title: "extensions"
---

Compass has three ways to add commands. Pick the smallest one that does the job:

| You want… | Use |
|---|---|
| a one-shot command whose output is text | a [script command](https://docs.vicinae.com/scripts/getting-started) (shell, Python, …) |
| a searchable list with actions, no dependencies, no build step | a [Rhai script](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RHAI-SCRIPTS.md) |
| React views, npm packages, forms, OAuth | a TypeScript extension (this page) |

TypeScript extensions use the same API as Vicinae and Raycast. The SDK keeps its npm name,
`@vicinae/api`, so one extension runs on both launchers, and the
[Vicinae extension documentation](https://docs.vicinae.com/extensions/introduction) is the reference
for the API itself. This page covers what is specific to Compass.

## Start a new extension

Run **Create Extension** in the launcher. It asks for the author, the extension's title and
description, its first command, a template and the folder to put it in, and writes the project
there. Then, in that folder:

```sh
npm install
npx vici develop
```

`vici develop` builds the extension into Compass's extension directory,
`~/.local/share/compass/extensions/<name>`, and tells the running Compass about it. Its commands
appear in root search straight away. It watches `src/`, `package.json` and `assets/`; each change
rebuilds, and the next time you open a command it runs the new build. Press Ctrl+C to stop.

Compass has to be running. `vici` talks to it through the `compass` command. It uses `compass` on
your `PATH`, then the Flatpak, or the program `COMPASS_BIN` names.

With the Flatpak, Compass reads extensions from its own data directory, so point `vici` there:

```sh
XDG_DATA_HOME=~/.var/app/org.tunaos.compass/data npx vici develop
```

To build once without a session, for example to check a release build:

```sh
npx vici build -o ~/.local/share/compass/extensions/my-extension
```

Compass notices a new or changed extension in that directory on its own.

## See what your extension prints

An extension's `console.log` and errors go to the Compass engine's standard error. They are not
shown in the `vici develop` terminal. To see them, run the engine in a terminal:

```sh
compass shutdown        # stop the running engine
compass serve           # run it in this terminal; extension output appears here
```

When Compass runs as the systemd user service, the same output is in the journal:
`journalctl --user -u compass -f`.

## The sandbox

Every TypeScript extension runs in its own Node process behind a sandbox. Write your extension for
it rather than around it:

- **Files.** It can read the system (`/usr`, `/etc`, …) and its own installed folder, and read and
  write its support and assets folders (`environment.supportPath`, `environment.assetsPath`). In
  your home folder it can read only the few files on
  [the allowlist](https://github.com/tuna-os/compass/blob/main/crates/compass-sandbox/src/home.rs), such as `~/.ssh/config`. Everything else
  in your home folder is denied. Use `LocalStorage`, `Cache` and the support folder for state.
- **Network.** Allowed.
- **Host programs.** An extension can run a program on the host only if Compass's
  [overrides list](https://github.com/tuna-os/compass/blob/main/extensions/raycast-linux-overrides.json) names it for that extension, and the
  person agrees when asked. An extension cannot grant itself one.
- **Memory.** 256 MiB per worker, with a 160 MiB JavaScript heap.

## Raycast extensions on Linux

Many Raycast extensions assume macOS: AppleScript, `~/Library` paths, Homebrew under
`/opt/homebrew`. Compass runs them through a compatibility layer and per-extension overrides, and
the Raycast Store view shows how well each one works on Linux.
[RAYCAST-LINUX-SHIM.md](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RAYCAST-LINUX-SHIM.md) explains what is translated and what is
not. If you port an extension, prefer Linux mechanisms (XDG paths, `xdg-open`, D-Bus) over
macOS-only ones, and test it on Compass before you publish it.

## Publish

Compass installs from the Vicinae extension store and the Raycast Store, so publish the way you
would for either (see the
[Vicinae documentation](https://docs.vicinae.com/extensions/introduction)). There is no separate
Compass store.

## See also

- [`src/typescript/api`](https://github.com/tuna-os/compass/blob/main/src/typescript/api/README.md): the SDK and the `vici` CLI
- [The parity ledger](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/PARITY.md): which API features Compass implements, and where it
  differs from Vicinae
- [Rhai scripts](https://github.com/tuna-os/compass/blob/main/docs/rust-engine/RHAI-SCRIPTS.md): the in-process tier
- [How the code is organised](https://github.com/tuna-os/compass/blob/main/docs/crates.md): if you are changing Compass itself
