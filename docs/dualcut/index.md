---
sidebar_position: 1
sidebar_label: "dualcut"

status: unknown
---

A GNOME video editor with **dual usage**: edit manually (scene timeline +
inspector) or programmatically (live JSON document, TypeScript scripts,
HTTP API for agents) — every surface stays in sync while the app runs.

> Concept and spec by **[KiKaraage](https://github.com/KiKaraage)** (main author).
> Implementation built with Claude Code.

![dualcut editor](https://raw.githubusercontent.com/tuna-os/dualcut/main/docs/screenshot.png)

**[📘 User Guide](https://github.com/tuna-os/dualcut/blob/main/docs/USER_GUIDE.md)** — screenshots regenerated automatically on every release.

**Install (Flatpak, via the TunaOS remote):**

```sh
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.dualcut

flatpak run org.tunaos.dualcut ~/Videos/myproject.json
```

Updates land automatically (`flatpak update`) whenever a new `v*` tag ships.

<details>
<summary>Install a specific release bundle directly (no remote)</summary>

```sh
# x86_64
curl -LO https://github.com/tuna-os/dualcut/releases/latest/download/dualcut.flatpak && flatpak install --user --reinstall -y dualcut.flatpak
# aarch64
curl -LO https://github.com/tuna-os/dualcut/releases/latest/download/dualcut-aarch64.flatpak && flatpak install --user --reinstall -y dualcut-aarch64.flatpak
```

</details>

## How it works

One JSON **project document** is the single source of truth —
**scenes** (sequential narrative spine) + **overlays** (tracks that cross
scene cuts) + **defs** (reusable parameterised templates). Rendering is
GStreamer Editing Services; shapes draw on the GPU via Vello; the UI is
GTK4/libadwaita.

| Surface | What | Sync |
|---|---|---|
| App | scene strip w/ thumbnails, inspector, script tab, preview | writes the document, hot-reloads external edits |
| File | edit the project JSON in any editor/agent | app reloads live (mtime watch) |
| HTTP | `GET/POST /project`, `POST /script` (TypeScript), `/status` on `127.0.0.1:7357` | file-backed, works against the running app |

Agents: point your tool at **[skills/dualcut/SKILL.md](https://github.com/tuna-os/dualcut/blob/main/skills/dualcut/SKILL.md)**
(ships in-repo, versioned with every commit). Deep reference:
[AGENTS.md](https://github.com/tuna-os/dualcut/blob/main/AGENTS.md) · types [engine/schema/dualcut.d.ts](https://github.com/tuna-os/dualcut/blob/main/engine/schema/dualcut.d.ts)
· [JSON Schema](https://github.com/tuna-os/dualcut/blob/main/engine/schema/dualcut.schema.json).

## From source

```sh
cd engine
cargo run --features preview,vector,scripting --bin preview -- examples/demo-project.json
cargo run --bin render -- new myproject.json "My video"   # scaffold
cargo run --bin render -- myproject.json out.mp4          # or out.webm
cargo run --bin serve  -- myproject.json                  # headless agent API
```

Needs GStreamer (+GES), GTK4, libadwaita dev packages; see
[engine/build-aux/org.tunaos.dualcut.json](https://github.com/tuna-os/dualcut/blob/main/engine/build-aux/org.tunaos.dualcut.json)
for the canonical dependency list.

## Features

- Scene-based editing with crossfade transitions and overlay tracks
- Text, video, audio, image clips + GPU vector shapes (rect, circle,
  ellipse, star, polygon, line, arrow)
- Tweened animations (x/y/opacity, easing) compiled to GStreamer control sources
- Reusable parameterised templates (lower third, title card, caption built in)
- Detach audio, undo/redo, multi-select, first-frame thumbnails
- TypeScript scripting in-app and over HTTP (`export function edit(p) {…}`)
- MP4 (H.264/AAC) and WebM (VP8/Vorbis) export
- Releases: every `v*` tag auto-builds the Flatpak (`scripts/release.sh`)

Roadmap and status: [ROADMAP.md](https://github.com/tuna-os/dualcut/blob/main/ROADMAP.md) ·
open work: [issues](https://github.com/tuna-os/dualcut/issues)

