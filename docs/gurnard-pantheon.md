---
sidebar_position: 10
---

# Pantheon on Gurnard

:::tip[Visual overview]
Prefer a visual tour of the variant itself? See the **[Gurnard overview →](/gurnard)** start page.
:::

Gurnard pairs Ubuntu 24.04 LTS with **Pantheon**, the desktop environment
built for [elementary OS](https://elementary.io/). This guide covers the
Pantheon-specific basics: what it is, how it differs from stock elementary
OS on Gurnard, and where to get help.

:::caution[Experimental]
Gurnard is an **Experimental** variant (see the [ROADMAP](https://github.com/tuna-os/tunaos/blob/main/ROADMAP.md))
— the surface is new and still settling. If something looks wrong, a bug
report is welcome and useful; see "Reporting issues" below.
:::

## What Pantheon is

Pantheon is a Wayland/GTK desktop built from scratch for elementary OS —
calm, minimal, and opinionated by design, rather than a customized GNOME or
KDE. On Gurnard it's the same Pantheon codebase, running on top of Ubuntu
24.04 LTS instead of elementary OS's own base, wrapped in TunaOS's atomic
bootc core (one image, one transaction, rollback on failure).

## How Gurnard differs from elementary OS

- **Base system**: Ubuntu 24.04 LTS under Pantheon, not elementary OS's own
  base. Package management, kernel, and system services follow TunaOS's
  bootc model — atomic image updates via `sudo bootc upgrade`, not `apt
  upgrade` on the running system.
- **AppCenter is not included.** elementary's curated AppCenter store is
  elementary-specific infrastructure and does not ship on Gurnard. Install
  apps from Flathub instead (pre-enabled — see below).
- **Homebrew and Flathub are baked in**, matching every other TunaOS
  variant, which elementary OS does not ship by default.

## First steps

- **Application launcher**: press the `Super` (Windows) key to open Pantheon's
  application launcher, then type to search installed apps.
- **Workspaces**: Pantheon's multitasking view (swipe up on a trackpad, or
  the workspace shortcut in Pantheon's default keybindings) shows all open
  windows and workspaces at once — the standard way to switch context
  without a taskbar.
- **Dock**: Pantheon's dock sits at the bottom of the screen by default.
  Right-click the dock for its settings, or open **System Settings → Dock**
  to adjust position, size, and auto-hide behavior.
- **System Settings**: the gear icon in the top-right corner (or search for
  "Settings" via the launcher) is Pantheon's control center — displays,
  keyboard, network, and the dock all live there.

## Installing apps

Gurnard ships with **Flathub pre-enabled** — there is no AppCenter. Install
apps the same way as any other TunaOS variant:

```bash
flatpak install flathub org.gnome.TextEditor
```

or use the **GNOME Software** / app-store equivalent bundled with the image,
which is backed by Flathub.

## Reporting issues

Pantheon-on-Gurnard is a new packaging surface, and bug reports while it's
cheap to fix are genuinely wanted (see the
[Gurnard launch announcement](https://tunaos.org/blog/announcing-gurnard-ubuntu-pantheon)).
File issues in
[github.com/tuna-os/tunaOS](https://github.com/tuna-os/tunaOS/issues), and
tag them `gurnard` so they're easy to find. Include:

- Whether the issue is Pantheon-specific or reproduces on stock elementary OS
  too (if you know)
- Your hardware and whether you're on the live ISO or an installed system
- `sudo bootc status` output if it's an update/image issue

## See also

- [Gurnard overview](/gurnard) — variant landing page, downloads, image tags
- [Announcing Gurnard](https://tunaos.org/blog/announcing-gurnard-ubuntu-pantheon) — launch blog post
- [elementary OS docs](https://elementaryos.stackexchange.com/) — general Pantheon UX questions not specific to Gurnard's bootc packaging
