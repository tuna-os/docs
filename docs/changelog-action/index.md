---
sidebar_position: 1
sidebar_label: "changelog-action"

status: unknown
---

This GitHub Action generates a changelog between two container image versions by inspecting their package lists (RPMs) using `skopeo` and verifying attestation with `cosign`.

It supports both explicit tag comparison and automatic tag discovery based on a release stream (e.g., `stable`, `latest`).

## Usage

```yaml
- name: Generate Changelog
  uses: tuna-os/changelog-action@main
  with:
    registry: ghcr.io/tuna-os/
    cosign-key: https://raw.githubusercontent.com/tuna-os/tunaos/main/cosign.pub
    images: bonito skipjack
    stream: stable
    output: changelog.md
```

> The org repo currently has no release tags — pin `@main` for now; the
> maintainers should cut a `v1` tag (the README previously referenced
> `hanthor/changelog-action@v1`, a personal repo, and `@v1` does not exist
> on `tuna-os/changelog-action`).

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `family` | Known image family (e.g. `bluefin`) — provides registry, cosign-key, and images automatically | No | |
| `registry` | Container registry URL | Yes* | |
| `cosign-key` | URL or path to cosign public key | Yes* | |
| `images` | Space-separated list of image names (e.g. `bonito skipjack`) | Yes* | |
| `stream` | Release stream for auto-discovery (e.g. `stable`, `latest`) | No | |
| `prev-tag` | Previous release tag (ignored if `stream` is set) | No | |
| `curr-tag` | Current release tag (ignored if `stream` is set) | No | |
| `handwritten` | Optional introductory text for the changelog | No | |
| `output` | Output file path | No | `changelog.md` |
| `output-env` | Output environment file path (TITLE=... TAG=...) | No | |
| `json` | Output JSON instead of Markdown | No | `false` |
| `verbose` | Enable debug logging | No | `false` |
