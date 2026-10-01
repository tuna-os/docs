---
sidebar_position: 2
title: "Contributing"
---

Thank you for your help with the TunaOS Homebrew channel.

## Repository layout

- `Formula/` contains source-built Homebrew formulae.
- `Casks/` contains packaged application casks.
- `scripts/validate-tap.sh` checks the Ruby syntax of every formula and cask.
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

4. In the pull request, name the upstream release or issue that motivates
   the change. For a release update, state how you checked the download URL
   and the checksum.

The validation script runs `ruby -c` against every `.rb` file under `Formula/`
and `Casks/`. It catches only Ruby syntax errors; it does not download
artifacts, check checksums, install packages, or exercise supported
platforms. [Issue #7](https://github.com/tuna-os/homebrew-tap/issues/7)
tracks the broader producer-to-consumer and install checks.

Run the script for documentation-only changes too, when Ruby is available, so
the pull request reports the repository's current validation state.
