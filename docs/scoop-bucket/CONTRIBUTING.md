---
sidebar_position: 2
title: "Contributing"
---

Thank you for your help with the TunaOS Scoop bucket.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Contribution scope

This bucket publishes the Scoop manifests for the command-line tools of the
[`tuna-os`](https://github.com/tuna-os) organization. Add each manifest as a
JSON file under `bucket/`, named after the Scoop package.

To change a manifest that the release automation of a tool makes, change the
upstream release configuration of that tool. Do not edit generated manifests
by hand here, because the next release can overwrite those changes.

## Manifest expectations

Each manifest must include non-empty `version`, `description`, `homepage`, and
`license` fields, plus at least one installation entry (`bin`, `shortcuts`, or
`installer`). Downloads must use HTTPS URLs and include hashes. When a
manifest uses architecture-specific downloads, every architecture entry must
provide its own URL and hash.

Hashes must use SHA-256 or SHA-512 — either a bare SHA-256 digest of 64 characters
(Scoop's default) or a `sha256:`/`sha512:` prefixed digest of the matching
length. The validator rejects MD5 and SHA-1 digests: both are collision-broken,
so a pin with one of them does not verify the download.

Follow the upstream tool's supported Windows architectures and use release
artifacts from its official TunaOS repository. Do not add manifests for
third-party projects or unpublished artifacts.

## Validate locally

Install Ruff before you run the checks; use the [official installation
instructions](https://docs.astral.sh/ruff/installation/) for your platform.
From the repository root, run all three checks:

```console
ruff check .
python3 scripts/validate_manifests.py
python3 -m unittest discover -s tests -v
```

Ruff runs the same lint command as CI. The validator and its unit tests use
only the Python standard library; Ruff is the only additional local tool.

Two other CI checks can fail a pull request. The `actions-security` workflow
verifies `.github/workflows/actions.lock` and scans the workflows with zizmor.
If you change a `uses:` line in a workflow, update `actions.lock` in the same
pull request. The `Prose` workflow checks `README.md` and `CONTRIBUTING.md`
against Simplified Technical English. The budget in `.ste-budget` is `0`, so
one new STE problem in these files makes the check fail.

## Pull requests

Keep each pull request focused on one package or one documentation concern. In
the description, identify the upstream release and artifact used, summarize
the local validation results, and explain any manual manifest changes. If a
release pipeline should publish the manifest, link the corresponding upstream
configuration change or issue.
