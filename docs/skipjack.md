---
sidebar_position: 4
---

# Skipjack (CentOS)

:::tip[Visual overview]
Prefer a visual tour? See the **[Skipjack overview →](/skipjack)** start page.
:::

**Based on:** [CentOS Stream 10](https://www.centos.org/centos-stream/)

Skipjack is the TunaOS variant that follows upstream. CentOS Stream 10 is its
base. It is where we test the features that go into RHEL and AlmaLinux later.

## Who it's for

Skipjack is for people who test future RHEL. It is a good pick for contributors who help build RHEL and AlmaLinux. Start here if you want to see the next RHEL early.

## Why choose this variant

- Tracks CentOS Stream 10, the path to RHEL.
- Where TunaOS tests features for RHEL and AlmaLinux.
- Choose this over stable variants when you want the next RHEL first.

To see every variant side by side, read [Choose a variant](./choosing-a-variant).

## Features

- **Modern GNOME**: A current GNOME desktop on Enterprise Linux.
- **Baked-in Homebrew**: Access thousands of CLI tools and fonts immediately.
- **CentOS Stream 10**: The newest part of the RHEL ecosystem.
- **Developer Focus**: Ideal for developers who want to stay ahead of the enterprise curve.

## Images

Each desktop is a separate image tag:

| Desktop | Image |
| --- | --- |
| GNOME | `ghcr.io/tuna-os/skipjack:gnome` |
| KDE Plasma | `ghcr.io/tuna-os/skipjack:kde` |
| COSMIC | `ghcr.io/tuna-os/skipjack:cosmic` |
| Niri | `ghcr.io/tuna-os/skipjack:niri` |

## Install

To install Skipjack on a PC, go to [Download TunaOS](/download). That page
gives you the installer and the steps for your computer.

## Switch from another bootc system

If your computer runs a bootc system now, for example Bluefin or a different
TunaOS variant, use [bootc-migrate](/docs/bootc-migrate):

```bash
sudo bootc-migrate --target-image ghcr.io/tuna-os/skipjack:gnome
```

Then restart the computer. For a different desktop, change the tag, for
example to `:kde`. Do not use the `:latest` tag.

## Community Support

- **TunaOS**: [Matrix Chat](https://matrix.to/#/%23tunaos:reilly.asia)
- **CentOS Community**: [CentOS Forums](https://forums.centos.org/)
