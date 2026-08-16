---
sidebar_position: 1
sidebar_label: "homebrew-tap"

status: unknown
---

Homebrew tap for TunaOS tooling. Formulas/casks are published from the
upstream repos' release pipelines (e.g. GoReleaser).

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

## Pending

- `bluefin-cli` (from [tuna-os/bluefin-cli](https://github.com/tuna-os/bluefin-cli))
  is not yet published here — releases ship binary assets since v0.10.6, but
  the GoReleaser Homebrew publisher has not produced a formula yet. Tracked in
  [tuna-os/bluefin-cli#141](https://github.com/tuna-os/bluefin-cli/issues/141).
- `tavern`'s cask is hand-maintained here today, not yet auto-published from
  Tavern's own release pipeline the way `corral-vm` is from GoReleaser
  (tuna-os/Tavern#79). Version/checksum bumps on new Tavern releases need a
  manual PR here until that's wired up.
