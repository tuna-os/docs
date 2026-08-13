---
sidebar_position: 4
title: "Security"
---

## Supported Versions

Protota is a pure browser webapp deployed as static content
(https://tuna-os.github.io/protota/). Only the latest published build is
actively supported; fixes land on `main` and are deployed with the next
GitHub Pages release.

## Security model

Protota runs **entirely client-side**: there is no server, no backend, and no
persistent storage. A project document is a file the user opens locally;
import/export of Blueprint (`.blp`) and GtkBuilder (`.ui`) files happens in
the browser. Security-relevant areas are:

- **Untrusted document parsing** — importing a malicious `.blp`/`.ui` file
  must never execute code, exfiltrate data, or escape the browser sandbox.
- **Rendered preview isolation** — mockups render with real Adwaita web
  components; their content must not reach outside the page origin.
- **Dependency supply chain** — the build pulls from the npm registry; lock
  files are committed and renovate tracks updates.

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
