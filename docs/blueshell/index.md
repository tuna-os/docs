---
sidebar_position: 1
sidebar_label: "BlueShell"
status: alpha
---

:::tip[Visual overview]
Prefer a visual tour? See the **[BlueShell overview →](/blueshell)** page.
:::

**BlueShell** is a container-native terminal for GNOME. It is a fork of
[Ghostty](https://ghostty.org) that carries the features of
[Ptyxis](https://gitlab.gnome.org/chergert/ptyxis). You get the Ghostty
terminal engine with the container-first workflow that Ptyxis brought to
GNOME.

Toolbox, Distrobox, and Podman containers appear in the new-tab menu.
Profiles snapshot your whole configuration. The preferences window, in the
Ptyxis style, drives the Ghostty config live, so you never have to edit a
config file. The file stays at `~/.config/ghostty/config`, and you can
still edit it by hand.

App ID: `org.tunaos.BlueShell`

## ✨ Key features

* **🖥️ GPU acceleration** — the Ghostty engine, with ligatures, HarfBuzz text layout, and fast scrollback.
* **📦 Container tabs** — Toolbox, Distrobox, and Podman containers in the new-tab menu; one click opens a shell inside.
* **🤠 Corral targets** — [Corral](https://github.com/tuna-os/corral) VMs and containers appear as spawn targets, next to Lima, LibVirt, Incus, and Kubernetes.
* **👤 Profiles** — named snapshots of a full configuration. Switch between them live, and edit each one on its own page.
* **🎨 Preferences window** — 244 palettes from the Gogh collection, plus font, cursor, scrollback, bell, and shortcut controls.
* **🖼️ Kitty graphics protocol** — inline images in the terminal.
* **🔗 Extras from Ghostty** — OSC 8 hyperlinks, splits, tab overview, and a fuzzy command palette.
* **🌗 Light and dark** — follows the desktop preference, with a System, Light, and Dark picker in the main menu.

## Installation

### Flatpak (TunaOS remote)

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.BlueShell
```

CI publishes x86_64 and aarch64 builds on every push to `ptyxis-port`.

### Flatpak (build it yourself)

```bash
flatpak-builder --install --user build-dir flatpak/org.tunaos.BlueShell.yml
```

### From source

Needs Zig 0.15.x and the GTK4 stack, with blueprint-compiler 0.16 or later:

```bash
sudo dnf install blueprint-compiler gtk4-layer-shell-devel libadwaita-devel
zig build -Dapp-runtime=gtk -Doptimize=ReleaseFast
```

The binary lands at `zig-out/bin/ghostty`.

## How it tracks Ghostty

BlueShell is a patch-set on top of Ghostty, not a hard fork. Every day, CI
rebases it onto `ghostty-org/ghostty:main`. A clean rebase opens a pull
request. A conflict opens an issue that names each file and its resolution
recipe.

Fork code lives in new files wherever it can, so most upstream changes
never touch it. The test suite checks every preferences table against the
Ghostty config enums, so an upstream rename turns into a red build instead
of silent drift.

## Credits

BlueShell exists because of two other projects:

* **[Ghostty](https://ghostty.org)** by Mitchell Hashimoto — the terminal itself, and the project this forks.
* **[Ptyxis](https://gitlab.gnome.org/chergert/ptyxis)** by Christian Hergert — the container-first design that this fork carries over.

BlueShell has no affiliation with either project. Report BlueShell bugs to
[tuna-os/blueshell](https://github.com/tuna-os/blueshell/issues), never to
Ghostty or Ptyxis.

## Status

BlueShell is **alpha**. The features above work, and the fork tracks
Ghostty every day.

## Links

* [GitHub](https://github.com/tuna-os/blueshell)
* [Ghostty](/docs/ghostty) — the upstream terminal, also on this remote
* [Ptyxis](https://gitlab.gnome.org/chergert/ptyxis) — the GNOME container terminal behind these features
