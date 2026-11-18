---
sidebar_position: 4
title: "Security"
---

## Supported Versions

Protota is a webapp that runs only in the browser. GitHub Pages serves it as
static content (https://tuna-os.github.io/protota/). We support only the
latest published build. Fixes land on `main`, and they go live with the next
release to GitHub Pages.

## Security model

Protota runs **entirely client-side**: there is no server, no backend, and no
persistent storage. A project document is a file the user opens locally;
import/export of Blueprint (`.blp`) and GtkBuilder (`.ui`) files happens in
the browser. Security-relevant areas are:

- **Parser for untrusted documents** — a malicious `.blp`/`.ui` file must
  never execute code, exfiltrate data, or escape the browser sandbox.
- **Rendered preview isolation** — mockups use the real web components of
  Adwaita. Their content must not reach outside the page origin.
- **Dependency supply chain** — the build pulls from the npm registry. The
  lock files are in git, and renovate tracks updates.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via GitHub Security Advisories:

1. Go to the [Security tab](https://github.com/tuna-os/protota/security)
2. Click **Report a vulnerability**
3. Provide a detailed description, including a minimal reproducer
   (a sample `.blp`/`.ui` file is ideal)

You can expect:

- **Acknowledgment** within 48 hours
- **Status update** within 5 business days
