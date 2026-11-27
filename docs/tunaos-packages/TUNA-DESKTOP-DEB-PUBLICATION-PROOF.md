---
sidebar_position: 19
title: "TUNA DESKTOP DEB PUBLICATION PROOF"
---

The Debian publisher retains a separate `tuna-desktop-publication-<distro>-<arch>`
artifact when a wave includes `tuna-desktop`. The receipt binds the package
installed from the served APT repository to the exact Tideforge
`ActionResult` that passed the factory gate.

A receipt passes only when all of these observations agree:

- the recipe, target, architecture, immutable build image and source-date epoch
  reproduce the recorded action inputs and key;
- the served `Packages` entry and downloaded `.deb` have the same filename,
  version, architecture, size and SHA-256 as the ActionResult artifact;
- the served `InRelease` verifies with the TunaOS key that pins the repository;
- every regular file's bytes and mode and every symlink target match the
  installed package payload;
- the recipe's runtime dependencies occur in the package's `Depends` field and
  in the installed dpkg database; and
- Tuna Desktop's six binaries, compatibility links, GSettings schemas and
  freedesktop event sounds are present.

The build job retains `action-inputs.json` and `action-result.json` separately
from the package artifact. The verification job installs from the signed
served repository, writes the observations, and retains the receipt with the
publisher revision, workflow run and retry number. Neither a version string nor
an apt transaction can establish this binding alone.

This is package publication evidence, not evidence of an installed-image session,
portal, authentication, visual, upgrade or variant qualification. Final v1 needs
a source revision with its portal descriptor, route configuration and licensed
cursor payload. Add these files to the recipe before they can appear in this
receipt. The current beta.1 source does not contain them, so this document does
not claim that beta.1 is final-v1 qualified.
