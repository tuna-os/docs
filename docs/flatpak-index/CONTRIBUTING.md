---
sidebar_position: 2
title: "Contributing"
---

Thanks for helping with the TunaOS Flatpak index. This repository holds the
scripts, templates, and CI actions that build and audit the OCI-based Flatpak
remote described in [README.md](https://github.com/tuna-os/flatpak-index/blob/main/README.md) — it is not itself the live index
(the authoritative one is served from `tuna-os/docs`; see the README's
"Index format" section for that distinction).

## Repository layout

| Path | What lives here |
|---|---|
| `scripts/update-index.py` | Canonical script that adds/replaces one app's entry in an OCI index. Application repos vendor a copy of this at `.github/scripts/update-index.py` — see the README's "How to add a new Flatpak" section before changing its interface. |
| `scripts/enrich-index.py` | Re-reads AppStream labels from the registry and repairs/audits an index file in place (missing metadata, missing screenshots). |
| `scripts/oci.py` | Shared OCI layout/registry helpers used by the other scripts. |
| `.github/actions/capture-screenshots` | Composite action that captures an app's own window under a headless X server for AppStream screenshots; see `docs/SCREENSHOTS.md`. |
| `templates/` | Starting points for new app metainfo files; see `docs/METAINFO.md`. |
| `tests/` | `unittest`-based test suite for the scripts above. |

## Development

Requires Python 3.11+ and the standard library only — no extra dependencies
to install.

Run the test suite locally:

```bash
python3 -m unittest discover -s tests -v
```

Audit the live remote's index against what's actually published (does not
require any local setup beyond `curl`):

```bash
curl -sSfL -o served-index.json https://tunaos.org/flatpak/index/static
./scripts/enrich-index.py served-index.json --check
```

## Making a change

1. Branch from `main`.
2. Keep `scripts/update-index.py` self-contained (one file, standard library
   only) — application repos vendor it directly, so a new dependency or a
   split across files breaks every consumer's copy.
3. If you change the `update-index.py` or `enrich-index.py` CLI/contract,
   check the README's "How to add a new Flatpak" walkthrough and
   `docs/METAINFO.md`/`docs/SCREENSHOTS.md` for anywhere that needs updating
   too.
4. Run `python3 -m unittest discover -s tests -v` before opening a PR; add
   or extend tests under `tests/` for any behavior change.
5. Open a PR describing what changed and why, and link any related issue.

Changes to the **production** index (`static/flatpak/index/static`) itself
belong in `tuna-os/docs` or in the publishing workflow of the application
repo being published, not here — see the README's "Index format" note.

## Questions or problems

Open an issue in this repository: [https://github.com/tuna-os/flatpak-index/issues](https://github.com/tuna-os/flatpak-index/issues).
