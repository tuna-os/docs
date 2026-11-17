---
sidebar_position: 38
title: "reference repos"
---

Cloned 2026-09-28 into `/home/ubuntu/dev/references/` (outside this repo,
never vendored). Study behavior and protocol handling there; all Tuna Desktop code
stays original — do not copy source from these checkouts.

| Project | Path | Revision | License | Use for |
|---|---|---|---|---|
| niri | `references/niri` (`src/`) | `1f03391` | GPL-3.0-or-later | Smithay compositor structure, layout, input, IPC |
| cosmic-comp | `references/cosmic-comp` (`src/`) | `9f746ea` | GPL-3.0-only | Smithay compositor, shell surfaces, session, XWayland |
| mutter | `references/mutter` (`src/`) | `888a7b7` | GPL-2.0-or-later | GNOME compositor behavior, Wayland protocol handling |

Notes:

- Clones are shallow (`--depth 1`) with `--filter=blob:none` and a `src`
  sparse checkout; run `git fetch --unshallow` or widen sparse-checkout if
  history or other paths are needed.
- License check before borrowing even ideas with license implications;
  niri is GPL-3.0-or-later (compatible), cosmic-comp is GPL-3.0-only
  (compatible as a combination), mutter is GPL-2.0-or-later.
- Cite file paths under `/home/ubuntu/dev/references/` in research notes,
  never as build inputs.
