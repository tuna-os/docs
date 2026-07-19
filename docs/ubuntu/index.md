---
sidebar_position: 1
sidebar_label: "ubuntu"

status: unknown
---

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**Ubuntu-based bootc OCI images and live installable ISOs.**

Part of the [TunaOS](https://tunaos.org) ecosystem.

## 26.04 Resolute Raccoon

Ubuntu 26.04 Resolute Raccoon as a bootc OCI image with a live installable ISO. Traditional Ubuntu experience on an immutable, container-native foundation.

### Download

The ISO workflow was moved into this repo (merged from the archived `ubuntu-26.04-iso`). Check [tunaos.org/download](https://tunaos.org/download) for the latest builds.

### Usage

```bash
# Pull the image
podman pull ghcr.io/tuna-os/ubuntu:26.04

# Switch an existing bootc system
sudo bootc switch ghcr.io/tuna-os/ubuntu:26.04
```

## Docs

- [Ubuntu on tunaos.org](https://tunaos.org/docs/ubuntu)
- [Contributing](https://github.com/tuna-os/ubuntu/blob/main/CONTRIBUTING.md)

## License

Apache 2.0 — see [LICENSE](LICENSE).

