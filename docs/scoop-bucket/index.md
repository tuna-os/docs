---
sidebar_position: 1
sidebar_label: "scoop-bucket"

status: unknown
---

Scoop bucket for TunaOS tooling. The release pipelines of the upstream
repositories (for example, GoReleaser) publish the manifests.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Currently available

This bucket has no manifests yet. It is ready, but no tool release has
published a manifest to it.

## Pending

- `bluefin-cli` (from [tuna-os/bluefin-cli](https://github.com/tuna-os/bluefin-cli))
  has no manifest here yet. Its releases ship binary assets since v0.10.6.
  The GoReleaser Scoop publisher has not made a manifest for it yet.

## Contributing manifests

Add Scoop manifests as JSON files under `bucket/`. Before you open a pull
request, run the dependency-free validator and its unit tests from the
repository root:

```console
python3 scripts/validate_manifests.py
python3 -m unittest discover -s tests -v
```

See the [contribution guide](https://github.com/tuna-os/scoop-bucket/blob/main/CONTRIBUTING.md) for manifest requirements,
contribution scope, and release-pipeline ownership guidance.
