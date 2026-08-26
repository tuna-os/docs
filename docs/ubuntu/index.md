---
sidebar_position: 1
sidebar_label: "ubuntu"

status: archived
---

:::caution[Archived]

The `tuna-os/ubuntu` repository was **archived on 2026-08-12**.
This page is kept for historical reference only; no new builds are
published from this repo. Ubuntu 26.04 images are now built and published
from the main [tunaOS](https://github.com/tuna-os/tunaOS) pipeline as the
[Grouper](/grouper) variant — see [tunaos.org/download](https://tunaos.org/download)
for current builds.
:::

## Successor images

The standalone `ghcr.io/tuna-os/ubuntu:26.04` image and its ISO workflow are
retired. Do not use the archived repository's pull, switch, or download
instructions for a new installation.

Choose the maintained in-tree successor that matches the Ubuntu release you
need:

| Ubuntu base | TunaOS variant | Start here |
| --- | --- | --- |
| Ubuntu 26.04 | Grouper | [Grouper overview](/grouper) and [technical guide](/docs/grouper) |
| Ubuntu 24.04 LTS | Gurnard | [Gurnard overview](/gurnard) |

Use the [download page](/download) for published ISOs. It is the canonical
source for current artifacts; a missing variant there should not be inferred
to have a supported "latest" build.

## Historical source

The archived [tuna-os/ubuntu](https://github.com/tuna-os/ubuntu) repository is
retained for source history only. Its last commit was published without a
GitHub Release or a supported migration contract. Existing users should choose
an in-tree successor above rather than switching to an archived image tag.
