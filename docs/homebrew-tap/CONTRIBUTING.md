---
sidebar_position: 2
title: "Contributing"
---

Thank you for your help with the TunaOS Homebrew channel.

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Repository layout

- `Formula/` contains source-built Homebrew formulae.
- `Casks/` contains packaged application casks.
- `scripts/validate-tap.sh` checks every formula and cask. It checks the Ruby
  syntax, the download URLs, and the `sha256` digests.
- `scripts/test-validate-tap.sh` is the regression suite for the validation
  script.
- `README.md` lists packages that are available now or not yet added.
- `ROADMAP.md` describes admission, ownership, freshness, and validation goals.

Each upstream project owns its own formula and cask releases. Before you
change a version, URL, checksum, or supported platform, check the matching
release in the upstream repository linked from the package definition.

## Local prerequisites

The repository's validation script needs:

- Bash
- Ruby, including the `ruby` executable on `PATH`

Homebrew is also needed for install or package-specific tests, but it is not
required by the syntax validation script.

## Making a change

1. Create a branch from the latest `main`.
2. Update the formula, cask, or documentation.
3. Run the local validation command from the repository root:

   ```sh
   ./scripts/validate-tap.sh
   ```

   If you change `scripts/validate-tap.sh`, also run its regression suite:

   ```sh
   bash scripts/test-validate-tap.sh
   ```

4. In the pull request, name the upstream release or issue that motivates
   the change. For a release update, state how you checked the download URL
   and the checksum.

The validation script runs `ruby -c` against every `.rb` file under `Formula/`
and `Casks/`. It also makes sure that each download URL is under
`https://github.com/tuna-os/` and that each download has a 64-character
`sha256` digest. It does not download artifacts or compare a digest with the
downloaded file.

The script also checks each formula that GoReleaser generates. The header of
such a file says `DO NOT EDIT`. Renovate must not change such a formula, so
`renovate.json` must have a `packageRules` entry for the file, with
`"enabled": false`. If you add a generated formula, add this entry in the
same pull request.

CI (`.github/workflows/ci.yml`) runs the regression suite and the validation
script. It also runs `brew audit` and installs `corral-vm` and the `tavern`
cask on Linux. CI does not install `bluefin-cli`, and it does not install on
macOS. For these packages, examine the download URL and the checksum
yourself.

Run the script for documentation-only changes too, when Ruby is available, so
the pull request reports the repository's current validation state.

CI does not run `ci.yml` for a change to Markdown only. Two other checks run:

- The Prose check (`.github/workflows/ste.yml`) runs when a Markdown file
  changes. It checks `README.md` and `CONTRIBUTING.md` against the rules of
  Simplified Technical English. The limit in `.ste-budget` is `0`, so one new
  error fails the check. To run the same linter locally, clone
  `tuna-os/.github` and run this command from the root of this repository:

  ```sh
  node <path-to-.github>/.github/actions/ste-lint/ste-lint.mjs --summary
  ```

  You need Node.js. The command shows each file with findings and the total.
- The `actions-security` check (`.github/workflows/actions-security.yml`)
  runs on all pull requests. It compares the workflow action pins with
  `.github/workflows/actions.lock` and runs `zizmor` on the workflows. If you
  change an action pin in a workflow, update `actions.lock` in the same pull
  request.
