---
sidebar_position: 1
sidebar_label: "homebrew-tap"

status: unknown
---

Homebrew tap for TunaOS tooling. Upstream repos' release pipelines (e.g.
GoReleaser) publish the formulas and casks here.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Currently available

| Formula/cask | Install |
|---------|---------|
| [bluefin-cli](https://github.com/tuna-os/bluefin-cli) | `brew install bluefin-cli` |
| [corral-vm](https://github.com/tuna-os/corral) | `brew install corral-vm` |
| [tavern](https://github.com/tuna-os/Tavern) (cask, macOS + Linux) | `brew install --cask tavern` |

```sh
brew tap tuna-os/tap
brew install bluefin-cli
brew install corral-vm
brew install --cask tavern
```

## Contributing

See [the contribution guide](https://github.com/tuna-os/homebrew-tap/blob/main/CONTRIBUTING.md) for the repository layout,
local prerequisites, and the checks needed before a formula, cask, or
documentation change.

## Pending

One integration in this list has a publisher but no credential to use it.
See [ROADMAP.md](https://github.com/tuna-os/homebrew-tap/blob/main/ROADMAP.md) for the measured state.

- `tavern`'s cask now follows the published v0.1.65 assets. The repair
  checked both archive digests and platform application IDs against downloaded
  release bytes. This is not a macOS installation or release-parity claim.
  Tavern's pipeline (`update-homebrew-tap.yml`) updates only version and
  checksums, but `TAP_GITHUB_TOKEN` is still missing
  ([tuna-os/Tavern#299](https://github.com/tuna-os/Tavern/issues/299)).
  Until the owner provisions that token, bumps need a manual PR here.
  This repository maintains the cask lifecycle structure.
