---
sidebar_position: 2
title: "Contributing"
---

Thank you for helping maintain the TunaOS Homebrew distribution channel.

## Repository layout

- `Formula/` contains source-built Homebrew formulae.
- `Casks/` contains packaged application casks.
- `scripts/validate-tap.sh` checks the Ruby syntax of every formula and cask.
- `README.md` lists packages that are available or pending.
- `ROADMAP.md` describes admission, ownership, freshness, and validation goals.

Formula and cask releases are owned by their upstream projects. Before changing
a version, URL, checksum, or supported platform, verify the corresponding
release in the upstream repository linked from the package definition.

## Local prerequisites

The repository's validation script requires:

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

4. In the pull request, identify the upstream release or issue that motivates
   the change. For a release update, include how the download URL and checksum
   were verified.

The validation script runs `ruby -c` against every `.rb` file under `Formula/`
and `Casks/`. It catches Ruby syntax errors only; it does not download artifacts,
verify checksums, install packages, or exercise supported platforms. Broader
producer-to-consumer and installation validation is tracked in
[issue #7](https://github.com/tuna-os/homebrew-tap/issues/7).

Documentation-only changes should still run the script when Ruby is available,
so the pull request reports the current repository validation state.
