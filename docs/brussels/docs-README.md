---
sidebar_position: 5
title: "README"
---

This directory holds two kinds of documentation: infrastructure docs (image
and artifact signatures, the CI/ISO pipeline, ADRs) and archived session
reports. For the project overview, build and run instructions, and current
status, start with the top-level docs instead:

- **[../README.md](https://github.com/tuna-os/brussels/blob/main/README.md)** — what this image is, how to pull or
  build it, the stable release channel, and signature verification.
- **[../AGENTS.md](https://github.com/tuna-os/brussels/blob/main/AGENTS.md)** — an architecture summary, `just`
  commands, and hard-won gotchas for anyone, human or agent, who works on
  this repo.
- **[`../CONTRIBUTING.md`](https://github.com/tuna-os/brussels/blob/main/CONTRIBUTING.md)** — the contributor workflow
  and how to set up a development environment.

## In this directory

- **[ci-and-iso-pipeline.md](https://github.com/tuna-os/brussels/blob/main/docs/ci-and-iso-pipeline.md)** — the full CI to
  image to ISO chain, with a log of past problems and fixes. Update this
  file when you fix a CI or ISO bug (see AGENTS.md's CI gate rules).
- **[`signing.md`](https://github.com/tuna-os/brussels/blob/main/docs/signing.md)** — the cosign setup for image signatures
  (not yet in effect).
- **[adr/](https://github.com/tuna-os/brussels/blob/main/docs/adr)** — architecture decision records (for example,
  [0001-wayland-greeter.md](https://github.com/tuna-os/brussels/blob/main/docs/adr/0001-wayland-greeter.md)).
- **[technical/](https://github.com/tuna-os/brussels/blob/main/docs/technical)** and **[reference/](https://github.com/tuna-os/brussels/blob/main/docs/reference)** — dated
  session reports from early development (May to August 2026), kept for
  history. Each file carries an `ste-disable-file` marker and describes a
  point-in-time snapshot, not the current state. Do not treat metrics,
  "Known Issues," or completion percentages in these files as current. The
  top-level README and AGENTS.md reflect what ships today.
