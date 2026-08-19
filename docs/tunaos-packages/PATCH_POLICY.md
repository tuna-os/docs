---
sidebar_position: 9
title: "PATCH POLICY"
---

TunaOS does not copy downstream patches merely to match another distribution's
package. The default Tideforge recipe is an unpatched upstream release.

Carry a downstream patch only when all of these are true:

1. A reproducible build, install, boot, or desktop-session failure affects a
   supported TunaOS target.
2. The issue cannot be solved by selecting the correct upstream release,
   dependency, build option, or configuration.
3. The patch has a short target-specific rationale and an upstream issue or
   submission reference.
4. A regression test or runtime gate proves both the failure and the fix.

Differences in a distribution's release number, build dependencies, optional
features, compiler flags, or patch stack are advisory comparison data only.
They are never imported automatically.

The existing EL10 GNOME backport specs are an exception only where their
documented SELinux, PAM, bootstrap, or ABI compatibility workarounds have been
validated. They stay native until Tideforge can demonstrate the same behavior.
