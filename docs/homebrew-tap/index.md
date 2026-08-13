---
sidebar_position: 1
sidebar_label: "homebrew-tap"

status: unknown
---

Homebrew tap for TunaOS tooling. Formulas/casks are published from the
upstream repos' release pipelines (e.g. GoReleaser).

## Currently available

| Formula | Install |
|---------|---------|
| [corral-vm](https://github.com/tuna-os/corral) | `brew install corral-vm` |

```sh
brew tap tuna-os/tap
brew install corral-vm
```

## Pending

- `bluefin-cli` (from [tuna-os/bluefin-cli](https://github.com/tuna-os/bluefin-cli))
  is not yet published here — releases currently ship no assets, so GoReleaser
  has nothing to turn into a formula. Tracked in
  [tuna-os/bluefin-cli#141](https://github.com/tuna-os/bluefin-cli/issues/141).
