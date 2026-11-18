---
sidebar_position: 4
title: "Security"
---

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues or pull
requests.

Use GitHub private vulnerability reporting: open the **Security** tab of this
repository and choose **Report a vulnerability**. This creates a private
advisory visible only to the maintainers and you.

Include affected version or commit, steps to reproduce, and the impact you
observed. Do not include real credentials or screencast restore tokens.

No other contact channel is documented yet. The shared tuna-os process is in the
[organization contributor guide](https://github.com/tuna-os/.github/blob/main/CONTRIBUTING.md).

## Supported versions

The repository has no tagged release yet. Response times and a supported
version policy are not documented yet.

## Scope notes

Quickcast records locally and has no upload or account component. Screen
capture goes through the desktop portal. Dependency advisories are checked by
the `Audit` workflow when `Cargo.toml` or `Cargo.lock` change.
