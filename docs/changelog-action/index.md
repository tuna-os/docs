---
sidebar_position: 1
sidebar_label: "changelog-action"
title: "changelog-action"
hide_title: true

status: unknown
---

This GitHub Action generates a changelog between two container image versions by inspecting their package lists (RPMs) using `skopeo` and verifying attestation with `cosign`.

It supports both explicit tag comparison and automatic tag discovery based on a release stream (e.g., `stable`, `latest`).

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Usage

```yaml
- name: Generate Changelog
  uses: tuna-os/changelog-action@master
  with:
    registry: ghcr.io/tuna-os/
    cosign-key: https://raw.githubusercontent.com/tuna-os/tunaos/main/cosign.pub
    images: bonito skipjack
    stream: stable
    output: changelog.md
```

> Note: This action is currently unversioned on `tuna-os/changelog-action`, so consumers pin a moving branch (`@master`).
> The default branch is planned to be renamed `master` -> `main`. **Update consumer references to `@main` once that rename has occurred.**

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `family` | Known image family (e.g. `bluefin`) — provides registry, cosign-key, and images automatically | No | |
| `registry` | Container registry URL | Yes* | |
| `cosign-key` | URL or path to cosign public key | Yes* | |
| `images` | Space-separated list of image names (e.g. `bonito skipjack`) | Yes* | |
| `commit-repo` | Repository the "Commits" section links to, as `owner/repo` or a full URL | No | `GITHUB_REPOSITORY`, then a legacy fallback |
| `stream` | Release stream for auto-discovery (e.g. `stable`, `latest`) | No | |
| `tag-pattern` | Regex for tag discovery (e.g. `^\d{8}$`). Only used when `stream` is set | No | |
| `prev_tag` | Previous release tag (ignored if `stream` is set) | No | |
| `curr_tag` | Current release tag (ignored if `stream` is set) | No | |
| `handwritten` | Optional introductory text for the changelog | No | |
| `output` | Output file path | No | `changelog.md` |
| `output-env` | Output environment file path (TITLE=... TAG=...) | No | |
| `json` | Output JSON instead of Markdown | No | `false` |
| `verbose` | Enable debug logging | No | `false` |

## Development & Testing

For local test execution commands and contribution guidelines, see [CONTRIBUTING.md](https://github.com/tuna-os/changelog-action/blob/master/CONTRIBUTING.md).
