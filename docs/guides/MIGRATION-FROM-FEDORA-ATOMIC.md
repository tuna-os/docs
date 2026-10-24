---
sidebar_position: 2
title: Migration from Fedora Atomic
description: Move workstations from Fedora Atomic Desktop or Silverblue to TunaOS with user data preserved and a per-variant path.
---

# Migration from Fedora Atomic

Fedora Atomic Desktop (Kinoite) and Fedora Silverblue use a transactional image. TunaOS also uses a transactional image. The two products use different tools under the hood. You can move a machine from one to the other. This move is a rebase.

Fedora uses rpm-ostree. TunaOS uses bootc. Both keep the system files read-only. Both install updates as an atomic swap. The user files live outside the image. This is why your data survives the move.

## Feature comparison

| Feature | Fedora Atomic Desktop | TunaOS |
| --- | --- | --- |
| Base OS | Fedora | Fedora, AlmaLinux, or CentOS Stream |
| Image tool | rpm-ostree | bootc |
| System packages | rpm-ostree plus dnf | bootc image plus Flatpak |
| Extra CLI tools | dnf | Homebrew and Flatpak |
| Custom image | Layer RPMs at the edge | Build a full image with a Containerfile |
| Image signing | Community cosign | Keyless Sigstore Cosign in CI |
| Long-term-support tag | No | Yes, a quarterly LTS tag |

TunaOS offers more base OS choices. You can stay on Fedora, or move to an Enterprise Linux base for long support. See [Choose a variant](/docs/choosing-a-variant).

## Data preservation

The image holds only the system files in `/usr`. Your files live in `/home`. Your settings live in `/home` and in `/etc`. The rebase replaces only the image. It leaves `/home` alone. Your files, Flatpak apps, and most settings stay.

Do these three things before the move:

1. **List system-level changes.** These are packages you layered with `rpm-ostree install` or services you added. The rebase does not copy them.
2. **Confirm your Flatpaks.** Flatpaks live in `/var/lib/flatpak` or in `/home`. They survive the rebase.
3. **Back up `/etc`** if you made local edits to system config files.

## Per-variant paths

Pick the TunaOS variant that matches your need, then rebase to it:

- **To Fedora 44 (Bonito).** Choose this if you want the newest packages and the Fedora base you already know.
- **To AlmaLinux Kitten 10 (Yellowfin) or AlmaLinux 10 (Albacore).** Choose this for long-life Enterprise Linux support.
- **To CentOS Stream 10 (Skipjack).** Choose this for a free, upstream Enterprise base.

All variants ship a `weekly` tag and an `lts` tag. The `lts` tag means long-term support. Migrate to the `lts` tag for a stable target. The [version guide of TunaOS](https://github.com/tuna-os/tunaOS/blob/main/VERSIONING.md) explains the tags.

## Step-by-step rebase

You can rebase by hand with bootc, or use the [bootc-migrate](/docs/bootc-migrate) tool. The tool walks you through the move.

To rebase by hand:

```bash
# See the current image and its digest
bootc status

# Switch to a TunaOS LTS image
sudo bootc switch ghcr.io/tuna-os/yellowfin:lts

# Apply and reboot
sudo bootc upgrade
sudo systemctl reboot
```

After the reboot, run `bootc status` again. Confirm the new image is active. Then reinstall any system-level packages you listed before the move. See the [rollback guide](/docs/bootc-rollback) if the new image does not work.

## Further reading

- [Choose a variant](/docs/choosing-a-variant)
- [Why TunaOS for enterprises](/docs/guides/WHY-TUNAOS-FOR-ENTERPRISES)
- [FAQ](/docs/faq)
