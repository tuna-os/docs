---
sidebar_position: 1
sidebar_label: "flatpak-index"

status: unknown
---

Add this remote to install TunaOS Flatpaks:

```bash
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.mariner
```

The remote is served via Cloudflare Pages from the [tuna-os/docs](https://github.com/tuna-os/docs) repo at `https://tunaos.org/flatpak/`.

## Available apps

| App | Install |
|-----|---------|
| Letters | `flatpak install tuna-os org.tunaos.letters` |
| Tables | `flatpak install tuna-os org.tunaos.tables` |
| Decks | `flatpak install tuna-os org.tunaos.decks` |
| Mariner | `flatpak install tuna-os org.tunaos.mariner` |
| Finupdate | `flatpak install tuna-os org.tunaos.finupdate` |
| Dualcut | `flatpak install tuna-os org.tunaos.dualcut` |
| Mandelbrot | `flatpak install tuna-os org.tunaos.mandelbrot` |
| Tavern | `flatpak install tuna-os org.tunaos.tavern` |
| Installer (bootc-installer) | `flatpak install tuna-os org.bootcinstaller.Installer` |
| Installer (KDE) | `flatpak install tuna-os org.tunaos.InstallerKde` |
| Installer (Niri) | `flatpak install tuna-os org.tunaos.InstallerNiri` |
| Installer (COSMIC) | `flatpak install tuna-os org.tunaos.InstallerCosmic` |
| Installer (XFCE) | `flatpak install tuna-os org.tunaos.InstallerXfce` |

> The installer frontends drive the [fisherman](https://github.com/projectbluefin/fisherman)
> bootc backend and are preinstalled on the matching TunaOS live ISOs
> (see `build_scripts/installer-frontend.sh` in [tuna-os/tunaOS](https://github.com/tuna-os/tunaOS)).

> **Note**: Letters, Tables and Decks are the Rust rewrite versions from [gtk-office-suite](https://github.com/tuna-os/gtk-office-suite). The office-suite manifests publish unsuffixed IDs (`org.tunaos.letters` etc.).
> The legacy Python versions are at [tables](https://github.com/tuna-os/tables), [decks](https://github.com/tuna-os/decks), [letters](https://github.com/tuna-os/letters).

---

## How to add a new Flatpak to the TunaOS remote

### 1. Fork the upstream app into `tuna-os/`

```bash
gh repo fork <upstream/repo> --org tuna-os --fork-name <app>
```

### 2. Add a Flatpak manifest

Create `org.tunaos.<app>.json` at the repo root. For apps that use **GNOME 50** (GTK4 + libadwaita):

```json
{
  "id": "org.tunaos.<app>",
  "runtime": "org.gnome.Platform",
  "runtime-version": "50",
  "sdk": "org.gnome.Sdk",
  "command": "<command>",
  "tags": ["latest"],
  "finish-args": [
    "--share=ipc",
    "--socket=fallback-x11",
    "--socket=wayland",
    "--device=dri"
  ],
  "modules": [
    {
      "name": "<app>",
      "buildsystem": "simple",
      "build-commands": [
        "mkdir -p /app/<app>",
        "cp -r /run/build/<app>/. /app/<app>/"
      ],
      "sources": [
        { "type": "dir", "path": "." }
      ]
    }
  ]
}
```

The app must also install `<app-id>.metainfo.xml` to `/app/share/metainfo/` and
an icon to `/app/share/icons/hicolor/`, or it will have no name, icon, licence
or screenshots in a software centre. See [App metadata](#app-metadata).

For apps that need **Node.js** (like Mariner), add a `nodejs` module:

```json
{
  "name": "nodejs",
  "buildsystem": "simple",
  "build-commands": [
    "mkdir -p /app/nodejs",
    "cp -r . /app/nodejs/"
  ],
  "sources": [{
    "type": "archive",
    "url": "https://nodejs.org/dist/v22.23.1/node-v22.23.1-linux-x64.tar.xz",
    "sha256": "9749e988f437343b7fa832c69ded82a312e41a03116d766797ac14f6f9eee578",
    "only-arches": ["x86_64"]
  }]
}
```

### 3. Add a publish workflow

Create `.github/workflows/publish-flatpak.yml`:

```yaml
name: Publish Flatpak
on:
  push:
    branches: [main]  # or master
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  build-oci:
    name: Build Flatpak OCI
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/flathub-infra/flatpak-github-actions:gnome-50
      options: --privileged
    steps:
      - uses: actions/checkout@v4
      - name: Build Flatpak
        uses: flatpak/flatpak-github-actions/flatpak-builder@v6
        with:
          manifest-path: org.tunaos.<app>.json
          cache-key: flatpak-builder-${{ github.sha }}
          build-bundle: false
          upload-artifact: false
      - name: Export OCI
        run: |
          flatpak build-bundle --oci --arch=x86_64 repo <app>.oci org.tunaos.<app>
      - name: Upload OCI artifact
        uses: actions/upload-artifact@v4
        with:
          name: <app>-oci
          path: <app>.oci/
          retention-days: 1

  publish:
    name: Publish to GHCR
    needs: build-oci
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: <app>-oci
          path: <app>.oci
      - name: Push OCI to GHCR
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "$GITHUB_TOKEN" | skopeo login ghcr.io -u "${{ github.actor }}" --password-stdin
          skopeo copy oci:<app>.oci docker://ghcr.io/tuna-os/<app>:latest
      - name: Check out central index
        uses: actions/checkout@v4
        with:
          repository: tuna-os/docs
          token: ${{ secrets.FLATPAK_INDEX_TOKEN }}
          path: index-repo
      - name: Update central index (tuna-os/docs)
        run: |
          python3 .github/scripts/update-index.py \
            --oci-dir <app>.oci \
            --index-file index-repo/static/flatpak/index/static \
            --repo-name tuna-os/<app> \
            --require-appstream \
            --tags latest
          cd index-repo
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add static/flatpak/index/static
          if git diff --cached --quiet; then
            echo "No index changes"
          else
            git commit -m "chore(flatpak): update <App> OCI index"
            git push origin main
          fi
```

Also vendor [`scripts/update-index.py`](https://github.com/tuna-os/flatpak-index/blob/main/scripts/update-index.py) from this repo
to `.github/scripts/update-index.py`. That is the canonical copy — do not copy
an older one from another app repo, and see
[App metadata](#app-metadata) for why.

### 4. Set repo secrets

- **`FLATPAK_INDEX_TOKEN`**: A fine-grained GitHub PAT with **Contents: read and
  write** access only to `tuna-os/docs`. Do not reuse a general-purpose CLI or
  account token.

```bash
gh secret set FLATPAK_INDEX_TOKEN --repo tuna-os/<app>
```

Enter the fine-grained token at the prompt. Avoid putting token values in command
arguments, repository URLs, or documentation.

### 5. Push to trigger the build

```bash
git push origin main  # or master
```

The CI will:
1. Build the flatpak in the GNOME 50 container
2. Export it as an OCI image
3. Push to `ghcr.io/tuna-os/<app>:latest`
4. Update the central index in `tuna-os/docs/static/flatpak/index/static`
5. Cloudflare Pages redeploys `tunaos.org` with the new index

## App metadata

Software centres such as [Bazaar](https://github.com/kolunmi/bazaar), GNOME
Software and KDE Discover render an app page from **AppStream** metadata. On an
OCI remote that metadata travels as three image labels —
`org.freedesktop.appstream.appdata`, `.icon-64` and `.icon-128` — which
`flatpak build-bundle --oci` writes automatically from the app's
`/app/share/metainfo/<app-id>.metainfo.xml`.

The publisher must copy those labels into `index/static`. If it does not,
flatpak has nothing to build a catalogue from and every app in the remote shows
up as a bare application ID with an "Unknown" licence and no screenshots.

- **Writing a metainfo file:** [`docs/METAINFO.md`](https://github.com/tuna-os/flatpak-index/blob/main/docs/METAINFO.md), starting
  from [`templates/org.tunaos.example.metainfo.xml`](https://github.com/tuna-os/flatpak-index/blob/main/templates/org.tunaos.example.metainfo.xml).
  It follows [Flathub's quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines),
  which is the bar software centres render against.
- **Screenshots:** [`docs/SCREENSHOTS.md`](https://github.com/tuna-os/flatpak-index/blob/main/docs/SCREENSHOTS.md) — the shared
  [capture action](https://github.com/tuna-os/flatpak-index/blob/main/.github/actions/capture-screenshots) photographs an app's own
  window under a headless X server, so screenshots are generated in CI from the
  real app rather than taken by hand. The audit below reports apps that declare
  none.
- **Auditing the live remote:**

  ```bash
  curl -sSfL -o served-index.json https://tunaos.org/flatpak/index/static
  ./scripts/enrich-index.py served-index.json --check
  ```

  This reports any published image whose metadata is missing from the index, or
  that has no metadata at all. Run daily by
  [`check-metadata.yml`](https://github.com/tuna-os/flatpak-index/blob/main/.github/workflows/check-metadata.yml).
- **Repairing an index in place:** `./scripts/enrich-index.py <index-file>`
  re-reads the labels from the registry and writes them back. It only touches
  the digests already listed, so the set of published images is unchanged.

## Architecture

```
User
  │ flatpak remote-add https://tunaos.org/flatpak/tuna-os.flatpakrepo
  ▼
tunaos.org (Cloudflare Pages)
  └── tuna-os.flatpakrepo     → points to oci+https://tunaos.org/flatpak
  └── index/static             → JSON index, lists all apps + OCI references
       │
       ▼
ghcr.io/tuna-os/<app>         → OCI images with flatpak metadata
  ├── tuna-os/mariner:latest
  ├── tuna-os/tables:latest
  ├── tuna-os/letters:latest
  └── ...
```

## Index format

The `index/static` file is a JSON array with OCI image references. Each entry maps an app name to its manifest digest and flatpak metadata labels. Flatpak downloads this index, finds the right image by app ID and architecture, then pulls it from the GHCR registry.

> **Note:** the authoritative index is `static/flatpak/index/static` in the [tuna-os/docs](https://github.com/tuna-os/docs) repo, served at `https://tunaos.org/flatpak/`. The copy of `index/static` in *this* repo is a **historical snapshot** and is **not** what the remote serves — treat it as reference only. When the README's [Available apps](#available-apps) table and this snapshot disagree, the table (and tunaos.org) reflect the live remote.
>
> **This repo's own [GitHub Pages site](https://tuna-os.github.io/flatpak-index/) and the `tuna-os.flatpakrepo` file at its root are the same non-authoritative snapshot**, published as a live OCI remote (`oci+https://tuna-os.github.io/flatpak-index`). Do not `flatpak remote-add` that URL or this file — it will not receive new apps or updates. Always use the `https://tunaos.org/flatpak/tuna-os.flatpakrepo` remote from the [top of this README](#tunaos-flatpak-index).
