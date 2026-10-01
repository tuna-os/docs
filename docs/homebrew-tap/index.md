---
sidebar_position: 1
sidebar_label: "homebrew-tap"

status: unknown
---

Homebrew tap for TunaOS tooling. Upstream repos' release pipelines (e.g.
GoReleaser) publish the formulas and casks here.

## Currently available

| Formula/cask | Install |
|---------|---------|
| [corral-vm](https://github.com/tuna-os/corral) | `brew install corral-vm` |
| [tavern](https://github.com/tuna-os/Tavern) (cask, macOS + Linux) | `brew install --cask tavern` |

```sh
brew tap tuna-os/tap
brew install corral-vm
brew install --cask tavern
```

## Contributing

See [the contribution guide](https://github.com/tuna-os/homebrew-tap/blob/main/CONTRIBUTING.md) for the repository layout,
local prerequisites, and the checks needed before a formula, cask, or
documentation change.

## Pending

- `bluefin-cli` (from [tuna-os/bluefin-cli](https://github.com/tuna-os/bluefin-cli))
  is not here yet. Releases ship binary assets since v0.10.6, but the
  GoReleaser Homebrew publisher has not made a formula yet.
  [tuna-os/bluefin-cli#141](https://github.com/tuna-os/bluefin-cli/issues/141)
  fixed the old install steps; that issue closed. No open issue tracks the
  formula work now.
- `tavern`'s cask is hand-made here today. It is not yet auto-published from
  Tavern's own pipeline. GoReleaser auto-publishes `corral-vm` that way
  ([tuna-os/Tavern#79](https://github.com/tuna-os/Tavern/issues/79) tracked
  the cask's addition; that issue closed). Version and checksum bumps on new
  Tavern releases need a manual PR here. No open issue tracks that automation
  now.
