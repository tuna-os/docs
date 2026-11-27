---
sidebar_position: 5
title: "README"
---

This directory holds three kinds of documentation. Design docs tell about
the XFCE components, the session, the screen lock and the image variants.
Infrastructure docs tell about signatures, the CI/ISO pipeline and ADRs. Old
session reports from early development are the third kind. For the project
overview, build and run instructions, and current status, start with the
top-level docs instead:

- **[../README.md](https://github.com/tuna-os/brussels/blob/main/README.md)** — what this image is, how to pull or
  build it, the stable release channel, and signature verification.
- **[../AGENTS.md](https://github.com/tuna-os/brussels/blob/main/AGENTS.md)** — an architecture summary, `just`
  commands, and hard-won gotchas for anyone, human or agent, who works on
  this repo.
- **[`../CONTRIBUTING.md`](https://github.com/tuna-os/brussels/blob/main/CONTRIBUTING.md)** — the contributor workflow
  and how to set up a development environment.

## In this directory

- **[`xfce-component-set.md`](https://github.com/tuna-os/brussels/blob/main/docs/xfce-component-set.md)** — the version of
  each XFCE component, and the reason for each version that is not a 4.21
  release tag.
- **[`session-and-locking.md`](https://github.com/tuna-os/brussels/blob/main/docs/session-and-locking.md)** — how a session
  starts from GDM, and how the screen locks.
- **[`winblues.md`](https://github.com/tuna-os/brussels/blob/main/docs/winblues.md)** — the `brussels-winblues` variant
  (the Chicago95 theme on the same image), and how CI builds it.
- **[`auto-qa-tuning.md`](https://github.com/tuna-os/brussels/blob/main/docs/auto-qa-tuning.md)** — the policy for the timeouts
  of the install test jobs. No workflow uses this policy at this time.
- **[ci-and-iso-pipeline.md](https://github.com/tuna-os/brussels/blob/main/docs/ci-and-iso-pipeline.md)** — the full CI to
  image to ISO chain, with a log of past problems and fixes. Update this
  file when you fix a CI or ISO bug (see AGENTS.md's CI gate rules).
- **[`migration-brussels.md`](https://github.com/tuna-os/brussels/blob/main/docs/migration-brussels.md)** — the rename from XFCE
  Linux, the `xfce-linux` image alias, and how to switch
- **[`signing.md`](https://github.com/tuna-os/brussels/blob/main/docs/signing.md)** — the keyless cosign signature of the
  images, how to check it, and why `bootc` does not enforce it.
- **[adr/](https://github.com/tuna-os/brussels/blob/main/docs/adr)** — architecture decision records (for example,
  [0001-wayland-greeter.md](https://github.com/tuna-os/brussels/blob/main/docs/adr/0001-wayland-greeter.md)).
- **[technical/](https://github.com/tuna-os/brussels/blob/main/docs/technical)** and **[reference/](https://github.com/tuna-os/brussels/blob/main/docs/reference)** — dated
  session reports from early development (May to August 2026), kept for
  history. Each file carries an `ste-disable-file` marker and describes a
  point-in-time snapshot, not the current state. Do not treat metrics,
  "Known Issues," or completion percentages in these files as current. The
  top-level README and AGENTS.md reflect what ships today.
