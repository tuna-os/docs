---
sidebar_position: 4
title: "observability"
---

## Overview

`gnome-hive-monitor` is an extension for GNOME Shell (`extension.js`) written in JavaScript/GJS. It queries the Hive status API (`GET /api/widget`) and optionally communicates with GitHub API endpoint (`POST /repos/{owner}/{repo}/issues`) via `libsoup` 3.0 (`Soup.Session`).

## Managed-Project Observability Posture

Per operations policy:

- **The extension has no exporter or external backend for telemetry.**
- The extension includes no telemetry exporter (e.g. Prometheus exporter, OTLP collector endpoint).
- Observability relies on structured client-side GLib/GJS console logging (`console.log`, `console.warn`, `console.error`) written to standard system logger (`journalctl -f -u gnome-shell` or `journalctl --user -f -o cat`).

## Operational Guidelines & Diagnostic Logging

1. **Client Diagnostics**: Structured console logs must include the `[GNOME Hive Monitor]` prefix for auditability.
2. **Error Logging**: Record network timeouts, HTTP 4xx/5xx responses, invalid JSON, and errors from issue submission through the API in `journalctl`.
3. **Future Exporter Integration**: If an operator selects a telemetry collector or backend, send client metrics through a local loopback listener. Include poll latency, counters for HTTP status codes, and UI error rates. Do not add dependencies on third-party SaaS.
